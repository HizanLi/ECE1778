import React, { createContext, useContext, useEffect, useReducer, useState } from 'react';
import { OccupiedArea, GameMode, AppSettings, Coordinate, GeoJSONPolygon } from '../types';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { insertOccupiedArea, fetchOccupiedAreas } from '../lib/api';
import { clear } from 'react-native/types_generated/Libraries/LogBox/Data/LogBoxData';

interface GameState {
  occupiedAreas: OccupiedArea[];
  currentTrail: Coordinate[];
  gameMode: GameMode;
  settings: AppSettings;
}

type GameAction =
  | { type: 'SET_OCCUPIED_AREAS'; payload: OccupiedArea[] }
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
  occupiedAreas: [],
  currentTrail: [],
  gameMode: 'competitive',
  settings: initialSettings,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_OCCUPIED_AREAS':
      return { ...state, occupiedAreas: action.payload };
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

// Helper function to calculate distance between two coordinates in meters (Haversine formula)
function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = coord1.latitude * Math.PI / 180;
  const φ2 = coord2.latitude * Math.PI / 180;
  const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
  const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Helper function to convert trail coordinates to GeoJSON Polygon
function coordinatesToGeoJSON(coordinates: Coordinate[]): GeoJSONPolygon {
  // Convert {latitude, longitude} to [longitude, latitude] (GeoJSON format)
  let geoCoords = coordinates.map(coord => [coord.longitude, coord.latitude]);
  
  // Remove duplicate consecutive points to avoid topology errors
  geoCoords = geoCoords.filter((coord, index) => {
    if (index === 0) return true;
    const prev = geoCoords[index - 1];
    // Keep point if it's different from previous (with tolerance for floating point)
    return Math.abs(coord[0] - prev[0]) > 0.0000001 || Math.abs(coord[1] - prev[1]) > 0.0000001;
  });
  
  // Ensure we have at least 3 unique points
  if (geoCoords.length < 3) {
    throw new Error('Need at least 3 unique points to create a valid polygon');
  }
  
  // Close the polygon by adding the first point at the end
  const first = geoCoords[0];
  const last = geoCoords[geoCoords.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    geoCoords.push([first[0], first[1]]);
  }
  
  return {
    type: 'Polygon',
    coordinates: [geoCoords],
  };
}

interface GameContextType {
  state: GameState;
  addTrailPoint: (coordinate: Coordinate) => void;
  clearTrail: () => void;
  claimTerritory: () => Promise<void>;
  fetchAreas: () => Promise<void>;
  setGameMode: (mode: GameMode) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAreas();
    }
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

  const addTrailPoint = (coordinate: Coordinate) => {
    dispatch({ type: 'ADD_TRAIL_POINT', payload: coordinate });
  };

  const clearTrail = () => {
    dispatch({ type: 'CLEAR_TRAIL' });
  };

  const claimTerritory = async () => {
    if (!user || state.currentTrail.length < 3) {
      throw new Error('Need at least 3 points to claim territory');
    }

    // Validate that start and end points are within 5 meters
    const startPoint = state.currentTrail[0];
    const endPoint = state.currentTrail[state.currentTrail.length - 1];
    const distance = calculateDistance(startPoint, endPoint);
    
    if (distance > 5) {
      clearTrail();
      throw new Error(`Start and end points must be within 5 meters to claim territory. Current distance: ${distance.toFixed(2)}m`);
    }

    try {
      // Convert trail to GeoJSON Polygon
      const location = coordinatesToGeoJSON(state.currentTrail);

      // Call backend API
      const result = await insertOccupiedArea({
        user_id: user.user_id,
        user_email: user.user_email,
        location,
        message: `Claimed on ${new Date().toLocaleString()}`,
      });

      console.log('Territory claimed:', result);

      // Clear trail after successful claim
      clearTrail();
      
      // Refresh occupied areas
      await fetchAreas();
      
      return result;
    } catch (error) {
      console.error('Error claiming territory:', error);
      throw error;
    }
  };

  const fetchAreas = async () => {
    try {
      const areas = await fetchOccupiedAreas();
      dispatch({ type: 'SET_OCCUPIED_AREAS', payload: areas || [] });
    } catch (error) {
      console.error('Error fetching occupied areas:', error);
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
        fetchAreas,
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
