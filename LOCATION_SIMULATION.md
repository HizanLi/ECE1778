# Location Simulation Mode

This guide explains how to use the location simulation feature for testing the GeoClaim app without physically moving around Toronto.

## Overview

The location simulation mode allows you to test the app's location-based features by simulating movement around Toronto. This is particularly useful for:
- Testing during development
- Demonstrating the app without traveling
- Testing different routes and scenarios
- Verifying territory claiming functionality

## Features

### Three Predefined Routes in Toronto

1. **Downtown Loop** - Around CN Tower area
   - CN Tower → Union Station → St. Lawrence Market → Yonge-Dundas → Kensington Market → Chinatown → Back to CN Tower

2. **University of Toronto Route**
   - Robarts Library → Hart House → Queen's Park → Royal Ontario Museum → Bay Street → Back to Robarts

3. **Waterfront Trail**
   - Harbourfront → Sugar Beach → Cherry Beach → Queens Quay → Back to Harbourfront

### Simulation Characteristics

- **Update Interval**: Location updates every 5 seconds (matches real GPS tracking)
- **Movement Pattern**: Smooth interpolation between waypoints
- **Route Completion**: Automatically loops back to the start

## How to Use

### Enabling Simulation Mode

1. Open the app and sign in
2. Navigate to the **Profile** tab
3. Find the **Developer Settings** section
4. Toggle **"Location Simulation Mode"** ON
5. The app will now use simulated locations instead of real GPS

### Starting Location Tracking

1. Go to the **Home** tab (Map screen)
2. Press the **"Start Tracking"** button
3. The simulation will start immediately without requiring location permissions
4. Watch as your simulated location moves along the predefined route

### Changing Routes

While in simulation mode:
1. Go to the **Profile** tab
2. In the **Developer Settings** section, press **"New Route"**
3. The simulator will randomly select a different Toronto route
4. If tracking is active, you'll see your position jump to the new route's starting point

### Switching Back to Real GPS

1. Stop tracking if currently active
2. Go to the **Profile** tab
3. Toggle **"Location Simulation Mode"** OFF
4. The app will return to using real GPS location

## Technical Details

### Location Data

Simulated locations include:
- Latitude and longitude coordinates
- Realistic movement patterns within Toronto boundaries
- Smooth transitions between waypoints

### Toronto Boundaries

The simulation is constrained to Toronto area:
- Latitude: 43.58° to 43.85° N
- Longitude: -79.64° to -79.12° W

### Integration with Game Features

The simulation mode works seamlessly with all game features:
- Territory claiming
- Trail tracking
- Area calculation
- Activity logging
- Leaderboard updates

## Best Practices

1. **Testing Different Scenarios**: Use different routes to test various parts of Toronto
2. **Consistent Testing**: Simulation mode provides predictable, repeatable test scenarios
3. **Demo Purposes**: Great for showing the app without being on location
4. **Development**: Speeds up development by eliminating the need to physically move

## Notes

- Simulation mode is disabled while tracking is active to prevent accidental switches
- Location permissions are not required when using simulation mode
- The simulation follows realistic movement speeds and patterns
- Each route takes approximately 5-10 minutes to complete a full loop

## Troubleshooting

**Issue**: Toggle is disabled
- **Solution**: Stop tracking first before switching modes

**Issue**: Location not updating
- **Solution**: Ensure tracking is started from the Home tab

**Issue**: Want to start at a specific location
- **Solution**: Use the "New Route" button to switch to different starting points

## Future Enhancements

Potential future improvements:
- Custom route creation
- Variable speed simulation
- Random walk patterns
- More detailed Toronto landmarks
- Route visualization on map
