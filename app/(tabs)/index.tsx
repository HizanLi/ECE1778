import React, { use, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from 'expo-router';
import { useLocation } from '../../contexts/LocationContext';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { colors } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function MapScreen() {
  const { currentLocation, isTracking, startTracking, stopTracking, moveNorth, moveSouth, moveEast, moveWest } = useLocation();
  const { state, claimTerritory, clearTrail, fetchAreas } = useGame();
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);

  // Fetch areas whenever the screen comes into focus (only if user is logged in)
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        fetchAreas();
      }
    }, [user])
  );


  const handleStartTracking = async () => {
    try {
      await startTracking();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start tracking');
    }
  };

  const handleStopTracking = () => {
    stopTracking();
    clearTrail(); // Clear the trail from map when stopping
  };

  const handleClaimTerritory = async () => {
    if (state.currentTrail.length < 3) {
      Alert.alert('Not enough points', 'Walk more to create a larger area before claiming');
      clearTrail(); // Clear the trail if validation fails
      return;
    }

    setClaiming(true);
    try {
      await claimTerritory();
      Alert.alert('Success!', 'Territory claimed successfully! 🎉');
      // Trail is already cleared in GameContext.claimTerritory on success
    } catch (error: any) {
      console.error('Claim territory error:', error);
      let errorMessage = error.message || 'Failed to claim territory';
      
      // Provide user-friendly messages for common errors
      if (errorMessage.includes('TopologyException') || errorMessage.includes('side location conflict')) {
        errorMessage = 'Invalid territory shape. Your path may have crossed itself. Please try again with a simpler shape.';
      } else if (errorMessage.includes('lwgeom')) {
        errorMessage = 'Invalid geometry. Please try walking a different path.';
      }
      
      Alert.alert('Cannot Claim Territory', errorMessage);
      clearTrail(); // Clear the trail on error
    } finally {
      setClaiming(false);
    }
  };

  const initialRegion = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : {
        latitude: 43.6532,
        longitude: -79.3832,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  return (
    <View style={globalStyles.container}>
      <MapView
        style={globalStyles.mapContainer}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        mapType={state.settings.map_type}
      >
        {/* User's current location */}
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="You are here"
            pinColor={colors.primary}
          />
        )}

        {/* Current trail */}
        {state.currentTrail.length > 0 && (
          <Polyline
            coordinates={state.currentTrail}
            strokeColor={colors.trailColor}
            strokeWidth={3}
          />
        )}

        {/* Occupied Areas - Display as polygons */}
        {state.occupiedAreas.map((area, index) => {
          try {
            // Handle both Polygon and MultiPolygon types
            let coordinates;
            if (area.location.type === 'Polygon') {
              // Polygon: coordinates[0] is the outer ring
              coordinates = area.location.coordinates[0].map((coord: any) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
            } else if (area.location.type === 'MultiPolygon') {
              // MultiPolygon: coordinates[0][0] is the first polygon's outer ring
              coordinates = area.location.coordinates[0][0].map((coord: any) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
            } else {
              // Unknown type, skip this area
              console.warn(`Unknown geometry type: ${area.location.type}`);
              return null;
            }
            
            return (
              <Polygon
                key={`area-${area.user_id}-${index}`}
                coordinates={coordinates}
                fillColor={
                  area.user_id === user?.user_id
                    ? colors.myTerritory + '40'
                    : colors.enemyTerritory + '40'
                }
                strokeColor={
                  area.user_id === user?.user_id ? colors.myTerritory : colors.enemyTerritory
                }
                strokeWidth={2}
              />
            );
          } catch (error) {
            console.error('Error rendering area:', error, area);
            return null;
          }
        })}
      </MapView>

      {/* Navigation Controls for Simulation Mode */}
      {state.gameMode === 'simulation' && isTracking && (
        <View style={styles.navigationControls}>
          <TouchableOpacity style={styles.navButton} onPress={moveNorth}>
            <Text style={styles.navButtonText}>↑</Text>
          </TouchableOpacity>
          <View style={styles.navRow}>
            <TouchableOpacity style={styles.navButton} onPress={moveWest}>
              <Text style={styles.navButtonText}>←</Text>
            </TouchableOpacity>
            <View style={styles.navSpacer} />
            <TouchableOpacity style={styles.navButton} onPress={moveEast}>
              <Text style={styles.navButtonText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={moveSouth}>
            <Text style={styles.navButtonText}>↓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Mode: {state.gameMode === 'competitive' ? '⚔️ Competitive' : '🧪 Simulation'}
          </Text>
          {state.gameMode === 'simulation' && isTracking && (
            <Text style={styles.infoTextSecondary}>
              Use arrow buttons to navigate
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!isTracking ? (
            <Button
              title="Start Tracking"
              onPress={handleStartTracking}
              style={styles.button}
            />
          ) : (
            <>
              <Button
                title="Stop Tracking"
                onPress={handleStopTracking}
                variant="secondary"
                style={styles.halfButton}
              />
              <Button
                title="Claim Territory"
                onPress={handleClaimTerritory}
                loading={claiming}
                disabled={state.currentTrail.length < 3}
                style={styles.halfButton}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationControls: {
    position: 'absolute',
    top: 100,
    right: 16,
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  navButtonText: {
    fontSize: 28,
    color: colors.background,
    fontWeight: 'bold',
  },
  navRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navSpacer: {
    width: 56,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  infoCard: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  infoTextSecondary: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
  },
  halfButton: {
    flex: 1,
  },
});
