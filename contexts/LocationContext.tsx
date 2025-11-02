import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';
import { useGame } from './GameContext';

interface LocationContextType {
  currentLocation: Coordinate | null;
  locationPermission: Location.PermissionStatus | null;
  isTracking: boolean;
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const { addTrailPoint } = useGame();

  useEffect(() => {
    checkPermissions();
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  const checkPermissions = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    setLocationPermission(status);
  };

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
      
      if (status === 'granted') {
        // Also request background permissions
        await Location.requestBackgroundPermissionsAsync();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  };

  const startTracking = async () => {
    if (locationPermission !== 'granted') {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    try {
      // Get initial position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const initialCoord: Coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCurrentLocation(initialCoord);

      // Start watching position
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or when moved 10 meters
        },
        (position) => {
          const coord: Coordinate = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setCurrentLocation(coord);
          
          if (isTracking) {
            addTrailPoint(coord);
          }
        }
      );

      setSubscription(sub);
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locationPermission,
        isTracking,
        requestPermissions,
        startTracking,
        stopTracking,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
