# GeoClaim Project Structure

This document provides an overview of the complete project structure for the GeoClaim mobile application.

## 📁 Directory Structure

```
ECE1778/
├── app/                          # Expo Router screens (file-based routing)
│   ├── _layout.tsx              # Root layout with providers
│   ├── (auth)/                  # Authentication group
│   │   ├── _layout.tsx          # Auth layout
│   │   ├── login.tsx            # Login screen (email/Google OAuth)
│   │   └── onboarding.tsx       # Onboarding/permissions screen
│   ├── (tabs)/                  # Main app tabs
│   │   ├── _layout.tsx          # Tabs layout
│   │   ├── index.tsx            # Map screen (territory claiming)
│   │   ├── activity.tsx         # Activity feed screen
│   │   ├── leaderboard.tsx      # Leaderboard screen
│   │   └── profile.tsx          # Profile/settings screen
│   └── claim/
│       └── [id].tsx             # Dynamic claim details screen
│
├── components/                   # Reusable UI components
│   ├── Button.tsx               # Primary button component
│   ├── Card.tsx                 # Card container component
│   ├── ActivityItem.tsx         # Activity list item
│   └── LeaderboardItem.tsx      # Leaderboard entry item
│
├── contexts/                     # React Context providers
│   ├── AuthContext.tsx          # Authentication state & methods
│   ├── GameContext.tsx          # Game state & territory management
│   └── LocationContext.tsx      # Location tracking & permissions
│
├── lib/                         # External service integrations
│   └── supabase.ts              # Supabase client configuration
│
├── utils/                       # Utility functions
│   └── notifications.ts         # Push notification helpers
│
├── constants/                   # App constants
│   └── colors.ts                # Color palette
│
├── styles/                      # Global styles
│   └── globalStyles.ts          # Shared style definitions
│
├── assets/                      # Static assets
│   └── README.md                # Asset requirements & guidelines
│
├── types.ts                     # TypeScript type definitions
├── package.json                 # Dependencies & scripts
├── app.json                     # Expo app configuration
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── README.md                    # Project overview & requirements
├── SETUP.md                     # Setup & installation guide
└── PROJECT_STRUCTURE.md         # This file
```

## 🎯 Core Features Implementation

### 1. Navigation (Expo Router)
- **File-based routing** with groups for auth and tabs
- 7 screens total: Login, Onboarding, Map, Activity, Leaderboard, Profile, Claim Details
- Dynamic routing for claim details: `/claim/[id]`

### 2. State Management
- **AuthContext**: User authentication (Supabase Auth)
- **GameContext**: Game state with useReducer + Context
- **LocationContext**: Real-time location tracking
- **React Query**: Server state caching (QueryClientProvider in root layout)
- **AsyncStorage**: Local persistence for settings

### 3. Authentication
- **Supabase Auth** with email magic links
- **Google OAuth** integration
- Protected routes with redirect logic
- Session management with auto-refresh

### 4. Location & Mapping
- **Expo Location**: GPS tracking with high accuracy
- **React Native Maps**: Google Maps integration
- **Trail Drawing**: Real-time polyline rendering
- **Territory Visualization**: Circle overlays for claimed areas

### 5. Notifications
- **Expo Notifications**: Push notification system
- **Daily reminders**: Scheduled notifications
- **Territory alerts**: Real-time capture notifications
- **Permission handling**: iOS & Android

### 6. Backend (Supabase)
- **Postgres Database**: Users, territories, claims, activities
- **Row Level Security**: Fine-grained access control
- **Realtime Subscriptions**: Live updates via WebSocket
- **Storage**: User profiles and avatars

## 🔧 Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native (0.73.4) |
| Platform | Expo (~50.0.6) |
| Routing | Expo Router (~3.4.7) |
| Language | TypeScript (5.1.3) |
| Backend | Supabase (2.39.3) |
| State | React Context + useReducer |
| Server State | React Query (5.17.19) |
| Maps | React Native Maps (1.10.0) |
| Location | Expo Location (16.5.5) |
| Notifications | Expo Notifications (0.27.6) |
| Storage | AsyncStorage (1.23.1) |

## 📱 Screens Overview

### Authentication Screens
1. **Login** (`app/(auth)/login.tsx`)
   - Email magic link authentication
   - Google OAuth integration
   - Clean, modern UI with branding

2. **Onboarding** (`app/(auth)/onboarding.tsx`)
   - Feature introduction
   - Location permission request
   - Notification permission request

### Main App Screens (Tabs)
3. **Map** (`app/(tabs)/index.tsx`)
   - Google Maps with user location
   - Real-time trail drawing
   - Territory claiming interface
   - Territory visualization (circles)
   - Start/stop tracking controls

4. **Activity** (`app/(tabs)/activity.tsx`)
   - Recent claims feed
   - Territory gained/lost events
   - Pull-to-refresh
   - Time-based activity list

5. **Leaderboard** (`app/(tabs)/leaderboard.tsx`)
   - Top 100 players by area
   - Current user highlight
   - Rank indicators (🥇🥈🥉)
   - Pull-to-refresh

6. **Profile** (`app/(tabs)/profile.tsx`)
   - User statistics (area, claims, streak)
   - Game mode toggle (Competitive/Peaceful)
   - Notification settings
   - Sign out functionality

### Additional Screens
7. **Claim Details** (`app/claim/[id].tsx`)
   - Detailed claim information
   - Territory statistics
   - Coordinate data
   - Capture status

## 🎨 Design System

### Colors (`constants/colors.ts`)
- **Primary**: #4CAF50 (Green - territory ownership)
- **Secondary**: #2196F3 (Blue - trails)
- **Error**: #F44336 (Red - enemy territories)
- **Success**: #4CAF50 (Green - achievements)
- **Text**: #212121 (Dark gray)
- **Background**: #FFFFFF (White)

### Components
- **Button**: Primary, secondary, and danger variants
- **Card**: Elevated container with shadow
- **ActivityItem**: Activity feed item with icons
- **LeaderboardItem**: Ranked player entry

## 🔒 Security & Permissions

### Required Permissions
- **Location**: Foreground and background access
- **Notifications**: Push notification delivery
- **Camera** (future): For profile avatars

### Supabase Security
- Row Level Security (RLS) policies
- Authenticated user checks
- User-owned resource policies
- Read-only policies for public data

## 🚀 Next Steps

### To Complete Setup:
1. Run `npm install` to install dependencies
2. Set up Supabase project and configure `.env`
3. Run database migrations in Supabase SQL editor
4. Add Google Maps API key to `app.json`
5. Create placeholder assets in `assets/` directory
6. Run `expo start` to launch development server

### For Production:
1. Configure EAS Build with `eas build:configure`
2. Add proper app icons and splash screens
3. Set up Google OAuth credentials
4. Configure push notification certificates
5. Build with `eas build --platform android/ios`
6. Submit to app stores

## 📚 Key Dependencies

```json
{
  "@react-native-async-storage/async-storage": "^1.23.1",
  "@supabase/supabase-js": "^2.39.3",
  "@tanstack/react-query": "^5.17.19",
  "expo": "~50.0.6",
  "expo-location": "~16.5.5",
  "expo-notifications": "~0.27.6",
