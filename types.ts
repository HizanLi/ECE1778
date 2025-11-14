// Core type definitions for GeoClaim - Updated for new backend

export interface User {
  user_id: string;
  user_email: string;
  user_name: string;
  total_area: number;
}

export interface OccupiedArea {
  user_id: string;
  user_email: string;
  user_name: string;
  location: GeoJSONPolygon;
  message?: string;
  status: string;
  total_area: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
  crs?: {
    type: string;
    properties: {
      name: string;
    };
  };
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface LeaderboardEntry {
  user_name: string;
  total_area: number;
  rank?: number;
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
