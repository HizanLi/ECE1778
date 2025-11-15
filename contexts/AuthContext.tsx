import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Session } from '@supabase/supabase-js';
import { fetchUserInfo, updateUsername } from '../lib/api';
import { Alert, AppState, AppStateStatus } from 'react-native';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { user_name: string }) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Get initial session and load profile
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          console.log('Initial session found for user ID:', session.user.id);
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        if (session) {
          await loadUserProfile(session.user.id, session.user.email || '');
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Listen for app state changes to refresh profile when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        session &&
        !loading
      ) {
        console.log('App came to foreground, refreshing user profile');
        loadUserProfile(session.user.id, session.user.email || '');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [session, loading]);

  const loadUserProfile = async (userId: string, email: string, retryCount: number = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000; // 1 second

    try {
      console.log(`Loading user profile (attempt ${retryCount + 1})...`);
      const userData = await fetchUserInfo({ user_id: userId });
      console.log('Loaded user data:', userData);
      
      if (userData) {
        // userData already has all the fields we need
        setUser(userData);
        console.log('User profile loaded successfully');
      } else {
        // Create default user if doesn't exist
        console.log('No user data found, creating default user');
        setUser({
          user_id: userId,
          user_email: email,
          user_name: email.split('@')[0],
          total_area: 0,
        });
      }
    } catch (error: any) {
      console.error(`Error loading user profile (attempt ${retryCount + 1}):`, error);
      
      // Retry if we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        setTimeout(() => {
          loadUserProfile(userId, email, retryCount + 1);
        }, RETRY_DELAY);
        return; // Don't set loading to false yet
      }
      
      // Fallback to basic user data after all retries failed
      console.log('All retries failed, using fallback user data');
      setUser({
        user_id: userId,
        user_email: email,
        user_name: email.split('@')[0],
        total_area: 0,
      });
    } finally {
      // Only set loading to false if we're not going to retry
      if (retryCount >= MAX_RETRIES || user !== null) {
        setLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string) => {
   setLoading(true)
    const {
      data: { session, user },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message)
      setLoading(false)
    } else {
      if (!session) {
        Alert.alert('Please check your inbox for email verification!')
        setLoading(false)
      }

    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateProfile = async (updates: { user_name: string }) => {
    if (!user) return;

    try {
      await updateUsername({
        user_id: user.user_id,
        user_name: updates.user_name,
      });

      // Update local state
      setUser({ ...user, ...updates });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  const refreshUserProfile = async () => {
    if (!user || !session) return;
    
    try {
      await loadUserProfile(session.user.id, session.user.email || '');
    } catch (error: any) {
      console.error('Error refreshing user profile:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
