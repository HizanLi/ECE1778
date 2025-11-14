// Core type definitions for GeoClaim

export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  total_area: number;
  total_claims: number;
  streak_days: number;
  avatar_url?: string;
}

export interface Territory {
  id: string;
  user_id: string;
  center_lat: number;
  center_lng: number;
  radius: number;
  area: number;
  created_at: string;
  updated_at: string;
  coordinates: Coordinate[];
  is_active: boolean;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Trail {
  id: string;
  user_id: string;
  coordinates: Coordinate[];
  created_at: string;
  is_closed: boolean;
}

export interface Claim {
  id: string;
  user_id: string;
  territory_id: string;
  claimed_area: number;
  captured_from?: string; // user_id if captured from another player
  created_at: string;
  coordinates: Coordinate[];
}

export interface Activity {
  id: string;
  user_id: string;
  type: 'claim' | 'lost' | 'defense';
  territory_id: string;
  area_change: number;
  description: string;
  created_at: string;
  other_user_id?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  total_area: number;
  total_claims: number;
  rank: number;
  avatar_url?: string;
}

export interface NotificationSettings {
  daily_reminder: boolean;
  reminder_time: string; // HH:MM format
  territory_alerts: boolean;
  nearby_activity: boolean;
}

export interface AppSettings {
  game_mode: 'competitive' | 'simulation';
  location_accuracy: 'high' | 'balanced' | 'low';
  map_type: 'standard' | 'satellite' | 'hybrid';
  notifications: NotificationSettings;
}

export type GameMode = 'competitive' | 'simulation';

export interface RealtimeUpdate {
  type: 'claim' | 'territory_lost' | 'leaderboard_update';
  data: any;
  user_id: string;
  timestamp: string;
}
