import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Territory, Claim, Activity, GameMode, AppSettings, Coordinate } from '../types';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameState {
  territories: Territory[];
  claims: Claim[];
  activities: Activity[];
  currentTrail: Coordinate[];
  gameMode: GameMode;
  settings: AppSettings;
}

type GameAction =
  | { type: 'SET_TERRITORIES'; payload: Territory[] }
  | { type: 'SET_CLAIMS'; payload: Claim[] }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_TRAIL_POINT'; payload: Coordinate }
  | { type: 'CLEAR_TRAIL' }
  | { type: 'SET_GAME_MODE'; payload: GameMode }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

const initialSettings: AppSettings = {
  game_mode: 'competitive',
  location_accuracy: 'high',
  map_type: 'standard',
  notifications: {
    daily_reminder: true,
    reminder_time: '09:00',
    territory_alerts: true,
    nearby_activity: true,
  },
};

const initialState: GameState = {
  territories: [],
  claims: [],
  activities: [],
  currentTrail: [],
  gameMode: 'competitive',
  settings: initialSettings,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_TERRITORIES':
      return { ...state, territories: action.payload };
    case 'SET_CLAIMS':
      return { ...state, claims: action.payload };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_TRAIL_POINT':
      return { ...state, currentTrail: [...state.currentTrail, action.payload] };
    case 'CLEAR_TRAIL':
      return { ...state, currentTrail: [] };
    case 'SET_GAME_MODE':
      return { ...state, gameMode: action.payload, settings: { ...state.settings, game_mode: action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  addTrailPoint: (coordinate: Coordinate) => void;
  clearTrail: () => void;
  claimTerritory: () => Promise<void>;
  fetchTerritories: (bounds?: { ne: Coordinate; sw: Coordinate }) => Promise<void>;
  fetchActivities: () => Promise<void>;
  setGameMode: (mode: GameMode) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { user } = useAuth();
  const [realtimeChannel, setRealtimeChannel] = useState<any>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setupRealtimeSubscription();
      fetchTerritories();
      fetchActivities();
    }
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [user]);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_settings');
      if (saved) {
        dispatch({ type: 'UPDATE_SETTINGS', payload: JSON.parse(saved) });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('game-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'territories' }, (payload) => {
        console.log('Territory change:', payload);
        fetchTerritories();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, (payload) => {
        console.log('Claim change:', payload);
        fetchActivities();
      })
      .subscribe();

    setRealtimeChannel(channel);
  };

  const addTrailPoint = (coordinate: Coordinate) => {
    dispatch({ type: 'ADD_TRAIL_POINT', payload: coordinate });
  };

  const clearTrail = () => {
    dispatch({ type: 'CLEAR_TRAIL' });
  };

  const claimTerritory = async () => {
    if (!user || state.currentTrail.length < 3) return;

    try {
      // Call backend API to process claim
      const { data, error } = await supabase.rpc('process_claim', {
        user_id: user.id,
        trail_coordinates: state.currentTrail,
        game_mode: state.gameMode,
      });

      if (error) throw error;

      // Clear trail after successful claim
      clearTrail();
      
      // Refresh territories and activities
      await fetchTerritories();
      await fetchActivities();
    } catch (error) {
      console.error('Error claiming territory:', error);
      throw error;
    }
  };

  const fetchTerritories = async (bounds?: { ne: Coordinate; sw: Coordinate }) => {
    try {
      let query = supabase.from('territories').select('*').eq('is_active', true);

      if (bounds) {
        // Filter by bounding box
        query = query
          .gte('center_lat', bounds.sw.latitude)
          .lte('center_lat', bounds.ne.latitude)
          .gte('center_lng', bounds.sw.longitude)
          .lte('center_lng', bounds.ne.longitude);
      }

      const { data, error } = await query;
      if (error) throw error;

      dispatch({ type: 'SET_TERRITORIES', payload: data || [] });
    } catch (error) {
      console.error('Error fetching territories:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .or(`user_id.eq.${user.id},other_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      dispatch({ type: 'SET_ACTIVITIES', payload: data || [] });
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const setGameMode = async (mode: GameMode) => {
    dispatch({ type: 'SET_GAME_MODE', payload: mode });
    const newSettings = { ...state.settings, game_mode: mode };
    await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  const updateSettings = async (settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    const newSettings = { ...state.settings, ...settings };
    await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
  };

  return (
    <GameContext.Provider
      value={{
        state,
        addTrailPoint,
        clearTrail,
        claimTerritory,
        fetchTerritories,
        fetchActivities,
        setGameMode,
        updateSettings,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
