# GeoClaim Setup Guide

This guide will help you set up and run the GeoClaim mobile application.

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **npm** or **yarn** (comes with Node.js)

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **iOS Simulator** (Mac only) or **Android Studio** (for Android emulator)

5. **Expo Go app** on your physical device (optional, for testing)
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## Installation Steps

### 1. Install Dependencies

Navigate to the ECE1778 directory and install all required packages:

```bash
cd ECE1778
npm install
```

### 2. Set Up Supabase

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Copy your project URL and anon key from Settings > API
4. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
5. Update `.env` with your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Set Up Supabase Database

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_area NUMERIC DEFAULT 0,
  total_claims INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  avatar_url TEXT
);

-- Territories table
CREATE TABLE territories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  center_lat NUMERIC NOT NULL,
  center_lng NUMERIC NOT NULL,
  radius NUMERIC NOT NULL,
  area NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  coordinates JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  territory_id UUID REFERENCES territories(id) ON DELETE CASCADE,
  claimed_area NUMERIC NOT NULL,
  captured_from UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  coordinates JSONB NOT NULL
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('claim', 'lost', 'defense')),
  territory_id UUID REFERENCES territories(id),
  area_change NUMERIC NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  other_user_id UUID REFERENCES users(id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Policies for territories table
CREATE POLICY "Anyone can view territories" ON territories FOR SELECT USING (true);
CREATE POLICY "Users can insert own territories" ON territories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own territories" ON territories FOR UPDATE USING (auth.uid() = user_id);

-- Policies for claims table
CREATE POLICY "Anyone can view claims" ON claims FOR SELECT USING (true);
CREATE POLICY "Users can insert own claims" ON claims FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for activities table
CREATE POLICY "Users can view own activities" ON activities FOR SELECT USING (auth.uid() = user_id OR auth.uid() = other_user_id);
CREATE POLICY "Users can insert own activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX territories_user_id_idx ON territories(user_id);
CREATE INDEX territories_location_idx ON territories(center_lat, center_lng);
CREATE INDEX claims_user_id_idx ON claims(user_id);
CREATE INDEX activities_user_id_idx ON activities(user_id);
```

### 4. Configure Google Maps API (for Android)

1. Get a Google Maps API key from https://console.cloud.google.com/
2. Enable the "Maps SDK for Android" and "Maps SDK for iOS"
3. Update `app.json` with your API key in the `android.config.googleMaps.apiKey` field

### 5. Create Image Assets

Create placeholder images in the `assets/` directory:
- icon.png (1024x1024)
- adaptive-icon.png (1024x1024)
- splash-icon.png (1242x2436)
- favicon.png (48x48)
- notification-icon.png (96x96)

See `assets/README.md` for detailed specifications.

## Running the App

### Start Development Server

```bash
npm start
# or
expo start
```

This opens the Expo Developer Tools in your browser.

### Run on iOS Simulator (Mac only)

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run on Physical Device

1. Install Expo Go app on your device
2. Scan the QR code shown in the terminal or browser
3. The app will load on your device

## Testing Features

### 1. Authentication
- Sign up with email magic link or Google OAuth
- Complete onboarding to grant permissions

### 2. Location Tracking
- Grant location permissions
- Start tracking to begin drawing trail
- Walk around to create a path

### 3. Territory Claiming
- Draw a closed loop by walking
- Return to your starting point
- Tap "Claim Territory" to capture the area

### 4. Viewing Activity
- Check the Activity tab for recent claims
- See nearby player activity

### 5. Leaderboard
- View top players by territory area
- Find your ranking

### 6. Profile Settings
- Toggle between Competitive and Peaceful modes
- Configure notification preferences
- View your statistics

## Troubleshooting

### TypeScript Errors
The TypeScript errors you see are expected before `npm install` is run. They will resolve once dependencies are installed.

### Location Not Working
- Ensure location permissions are granted
- On iOS simulator, use Debug > Location > Custom Location
- On Android emulator, use extended controls to set location

### Supabase Connection Issues
- Verify your .env file has correct credentials
- Check Supabase project is active
- Ensure RLS policies are configured

### Google Maps Not Showing
- Verify API key is correct in app.json
- Ensure billing is enabled on Google Cloud Console
- Check that Maps SDK is enabled for your platform

## Building for Production

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Configure EAS Build

```bash
eas build:configure
```

### Build for Android

```bash
eas build --platform android
```

### Build for iOS

```bash
eas build --platform ios
```

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

## Support

For issues or questions:
1. Check the project README.md
2. Review Expo and React Native documentation
3. Check Supabase community forums
4. Contact the development team

## License

This project is developed for ECE1778 course requirements.
