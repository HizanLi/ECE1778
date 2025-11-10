import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';
import { Alert} from 'react-native'

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If user doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createUserProfile(userId);
          return;
        }
        throw error;
      }
      setUser(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Get auth user email
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || '';
      
      // Generate default username from email
      const username = email.split('@')[0] || 'User';
      Alert.alert("Creating user profile for " + username);
      const { data, error } = await supabase
        .from('users')
         .upsert({
          id: userId,
          email: email,
          username: username,
          total_area: 0,
          total_claims: 0,
          streak_days: 0,
        }, { onConflict: 'id' })
        .select()
        .single();

      if (error) throw error.details || error;
      Alert.alert("Successfully created profile for " + username);
      setUser(data);
    } catch (error) {
      console.error('Error creating user profile:', error);
      Alert.alert('Error', 'Failed to create user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'geoclaim://auth/callback',
      },
    });
    if (error) throw error;
  };

  
  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    })
    if (error) {
        Alert.alert(error.message)
        setLoading(false)
    } else {
        // Ensure user profile exists
        Alert.alert(data.user.id)
        if (data.user) {
          await fetchUserProfile(data.user.id);
        }
        Alert.alert("Successfully signed in")
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
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
      } else if (user) {
        // Create user profile immediately for confirmed users
        await createUserProfile(user.id);
      }
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setUser(data);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        updateProfile,
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
