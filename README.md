# GeoClaim - A Real-World Territory Conquest Game

## Authors:
- Zuhao Zhang 1005828080
- Lihao Xue 1011809875
- Linxin Li 1007674795
- George Cao 1005556426

## 1. Motivation

### Identifying the Problem or Need
While fitness and mobile gaming are individually popular, few apps successfully combine physical activity, real-world movement, and competitive multiplayer gameplay. Traditional fitness apps (e.g., Google Fit, Strava) focus on personal tracking, whereas mobile games (e.g., Pokémon GO) integrate location but offer limited real-time competition or social engagement tied to real movement.

### Why This Project is Worth Pursuing
GeoClaim transforms everyday walking or running into a competitive, territory-conquering experience, motivating players to stay active while engaging socially. The app gamifies physical exercise and adds a sense of strategy, exploration, and social rivalry through dynamic, location-based gameplay.


### Target Users
- Active individuals who enjoy walking, running, or outdoor exploration
- Gamers interested in real-world, location-based strategy games
- Students and professionals seeking motivation to stay active
- Communities looking to host fitness competitions or social events

### Existing Solutions and Their Limitations
Fitness apps (Strava, Apple Fitness) reward distance/time, not place control. AR/location games exist, but they’re heavy or require complex events; ours is lightweight, privacy-forward, and focused on quick, satisfying “claim” loops.


## 2. Objective and Key Features

### Clear Statement of Project Objectives
To develop a cross-platform mobile game using React Native with Expo that allows players to claim and defend real-world territories by physically moving in the real world. The goal is to blend fitness, strategy, and real-time interaction into a single experience.

### Core Features

#### A. Territory Claiming Rules
**Rule A (Default) — Trail-Closing Capture**
Each player owns a territory shown on the map. When a player leaves their territory, the app draws a temporary trail following their movement. If the player returns and reconnects the trail back to their own territory boundary, the enclosed looped region becomes captured and is added to their territory. Any other player’s territory within this closed loop becomes part of the capturing player’s area. Trails that do not reconnect to the player’s boundary do not result in a capture.
This rule encourages players to take strategic risks, move actively, and interact competitively with others as they attempt to cut into or defend regions.
- **Player experience:** Highly interactive and competitive, focused on area control.
- **Leaderboard impact:** Rankings reflect both activity level and successful territorial captures.
- **Fairness considerations:** Minimum loop size to prevent GPS noise exploits, short cooldowns after captures, and automatic decay of inactive territories to keep the game dynamic.

**Rule B (Alternative) — Non-Overlapping Expansion (Solo-Progress Mode)**
Players can expand their territory in the same way—by walking, drawing a trail, and reconnecting it to their base—but in this mode, overlapping with other players’ areas has no effect. Captured regions are added only in unoccupied space, and existing opponent territories remain untouched. Each player’s territory can expand infinitely based on their own activity, unaffected by others’ movements or claims.
- **Player experience:** Peaceful and exploration-oriented; ideal for wellness or fitness challenges.
- **Leaderboard impact:** Rankings reflect distance covered and personal area growth rather than direct competition.
- **Use cases:** Suitable for campus or company-wide step challenges where collaboration and participation matter more than competition.

**Real-Time Sync (both rules)**
Processed server-side in real time; map tiles, claims, and leaderboard broadcast via Supabase Realtime so players immediately see updates.

**Scope and Feasibility**
Both rules use the same core gameplay interface—map display, trail drawing, and closure detection. Rule A adds competitive territory conflicts and requires conflict resolution, while Rule B simplifies gameplay logic and reduces risk for the initial MVP. The project will start with Rule A as the default and include Rule B as an optional non-competitive mode.

#### B. Navigation Structure
We’ll use Expo Router (file-based routing) for speed and strong typing.
**Screens (≥4):**
- Map — Google Maps via `react-native-maps` (Google provider).
- Activity/Feed — recent captures near you + your history.
- Profile — stats, streaks, settings (privacy, notifications).
- Claim Details — shows a specific claim/area state (opened from map/feed).
- Onboarding/Login — OAuth authentication.
- Notification Prompt — explain + request permissions.
- Leaderboard — rankings and stats.

Supports data passing via dynamic routes (e.g., `/claim/[id]`) and typed params for detail views.

#### C. State Management & Persistence
- **Local state:** React hooks + Context + useReducer for medium-complex state (auth user, settings, lightweight map UI).
- **Server state:** React Query for API fetching, caching, retries.
- **Persistence:** @react-native-async-storage/async-storage for preferences, last viewed region, cached session token.

#### D. Notifications
Push notifications using Expo Notifications API:
- Alerts for when another player claims your territory.
- Daily reminder at user-chosen time (“Go claim a new area today!”).
- Notification permission prompt and handling (tap actions/deep links).

#### E. Backend Integration
- **Platform:** Supabase (Postgres + Auth + Realtime).
- **Auth:** Supabase Auth (email magic link) + Google OAuth.
- **Realtime:** channel broadcasts for nearby tile/claim updates (low frequency to save battery).
- **Data fetch:** live list of nearby claims/tiles by bbox; player stats; recent events.
- **Geospatial:** store claims with center/radius; index tiles/claims by H3 cell or bounding box columns for quick lookups.

The UI handles loading, error, and retry states via React Query (spinners, error messages, and pull-to-refresh).
#### F. Deployment (Expo EAS Build)
- Configure eas.json with dev & preview profiles.
- EAS Build for Android + iOS.
- Provide testable builds (Expo Go deep-link for dev; AAB/IPA/TestFlight for review).
- Environment via Expo Config Plugins & Supabase URL/anon key.

#### G. Planned Advanced Features
**1. User Authentication (Supabase Auth):** The app uses Supabase Authentication to manage secure user login and session handling. Players can sign in via email magic link or OAuth (Google) using Supabase’s built-in providers. Authentication tokens are securely stored and auto-refreshed, allowing seamless re-entry into the app.

**2. Real-Time Updates (Supabase Realtime):** The game world updates live as players capture or lose territory. We use Supabase Realtime Channels (built on PostgreSQL’s replication) to broadcast changes to the map and leaderboard.

**3. Location & Mapping (Expo Location + Google Maps API)** The app integrates the Expo Location API to track player movement in real time and connects it to the Google Maps API (via react-native-maps) for rich, detailed map rendering.
- Expo Location: Tracks player GPS position to draw trails and detect closed loops (territory captures).
- Google Maps API: Renders live maps, visualizes claimed areas as colored circles/polygons, and uses familiar map interactions (zoom, pan, markers).


### Explanation of How These Features Fulfill the Course Requirements
GeoClaim meets all core and advanced course requirements. It is developed with React Native and Expo using TypeScript, featuring multiple screens (Map, Feed, Profile, Claim Details, Leaderboard, and Login) organized through Expo Router for file-based navigation. App-wide state is managed using Context and useReducer, while React Query handles backend data fetching with AsyncStorage for persistence. Notifications are implemented with Expo Notifications, enabling daily reminders and in-game alerts. The backend uses Supabase for data storage, authentication, and real-time synchronization, fulfilling both backend integration and real-time update requirements. User authentication is handled through Supabase Auth with Google OAuth, while Expo Location and the Google Maps API cover mobile sensors and mapping. The app is deployed via Expo EAS Build for Android and iOS, ensuring full compliance with the deployment requirement. These integrations collectively fulfill all technical and advanced project specifications.

### Project Scope and Feasibility
The project’s scope is focused and achievable within the course timeline. The MVP will include real-time location tracking, map-based territory claiming, authentication, and leaderboard synchronization. Using Expo and Supabase reduces setup time and complexity, allowing the team to focus on gameplay logic and UI design rather than backend infrastructure. The Google Maps API provides reliable visualization with minimal configuration, and Supabase’s built-in real-time and authentication features make multiplayer updates and secure access straightforward. By prioritizing essential features first and reserving optional enhancements like badges and streaks for later, the project remains both ambitious and feasible within a few weeks.


## 3. Tentative Plan
The project will be developed collaboratively by four team members, each focusing on a distinct aspect of the app to ensure balanced progress and quality output.

### Member A: Frontend & UI (Lihao)
Responsible for designing and implementing the app’s user interface using React Native and Expo. Lihao will build the main screens—including the Map, Feed, Profile, Leaderboard, and Claim Details—using Expo Router for navigation. They will focus on layout consistency, user experience, and overall visual polish, ensuring that the app remains intuitive and responsive across devices.

### Member B: Backend & Realtime (Zuhao)
Handles backend architecture using Supabase, including database design, table creation, and authentication setup. Zuhao will configure Supabase Realtime to broadcast updates when players capture or lose territory, ensuring the map and leaderboard remain synchronized. They will also manage security rules and server-side logic for processing claims and calculating territory control.

### Member C: Sensors & Notifications (Linxin)
Integrates device features using Expo Location and Expo Notifications. Linxin will implement GPS tracking to follow the player’s real-world movement, detect closed loops for territory claiming, and handle location permissions. They will also develop the notification system, including daily reminders and event alerts when a player’s area is captured.

### Member D: Integration & Testing (George)
Oversees the connection between frontend components and backend services. George will manage global state using Context and React Query, handle data persistence with AsyncStorage, and ensure stable data flow throughout the app. They will also conduct testing on Android and iOS devices, debug gameplay issues, and prepare builds for release using Expo EAS Build.

Throughout the development process, the team will collaborate using GitHub for version control and task management. Weekly progress meetings will be held to review completed work, test new features, and align upcoming tasks. Development will progress from project setup and authentication to real-time gameplay implementation, followed by testing and optimization in the final phase.
