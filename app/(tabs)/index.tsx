import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import MapView, { Marker, Polyline, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useLocation } from '../../contexts/LocationContext';
import { useGame } from '../../contexts/GameContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/Button';
import { colors } from '../../constants/colors';
import { globalStyles } from '../../styles/globalStyles';

export default function MapScreen() {
  const { currentLocation, isTracking, startTracking, stopTracking } = useLocation();
  const { state, claimTerritory, fetchTerritories } = useGame();
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      fetchTerritories();
    }
  }, [currentLocation]);

  const handleStartTracking = async () => {
    try {
      await startTracking();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start tracking');
    }
  };

  const handleStopTracking = () => {
    stopTracking();
  };

  const handleClaimTerritory = async () => {
    if (state.currentTrail.length < 3) {
      Alert.alert('Not enough points', 'Walk more to create a larger area before claiming');
      return;
    }

    setClaiming(true);
    try {
      await claimTerritory();
      Alert.alert('Success!', 'Territory claimed successfully! 🎉');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to claim territory');
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

        {/* Territories */}
        {state.territories.map((territory) => (
          <Circle
            key={territory.id}
            center={{
              latitude: territory.center_lat,
              longitude: territory.center_lng,
            }}
            radius={territory.radius}
            fillColor={
              territory.user_id === user?.id
                ? colors.myTerritory + '40'
                : colors.enemyTerritory + '40'
            }
            strokeColor={
              territory.user_id === user?.id ? colors.myTerritory : colors.enemyTerritory
            }
            strokeWidth={2}
          />
        ))}
      </MapView>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Mode: {state.gameMode === 'competitive' ? '⚔️ Competitive' : '🌱 Peaceful'}
          </Text>
          {isTracking && (
            <Text style={styles.infoText}>Trail: {state.currentTrail.length} points</Text>
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
