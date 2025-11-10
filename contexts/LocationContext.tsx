import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Coordinate } from '../types';
import { useGame } from './GameContext';
import { LocationSimulator } from '../utils/locationSimulator';

interface LocationContextType {
  currentLocation: Coordinate | null;
  locationPermission: Location.PermissionStatus | null;
  isTracking: boolean;
  isSimulationMode: boolean;
  requestPermissions: () => Promise<boolean>;
  startTracking: () => Promise<void>;
  stopTracking: () => void;
  toggleSimulationMode: () => void;
  changeSimulationRoute: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const [simulationInterval, setSimulationInterval] = useState<NodeJS.Timeout | null>(null);
  const [simulator] = useState(() => new LocationSimulator(false));
  const { addTrailPoint } = useGame();

  useEffect(() => {
    checkPermissions();
    return () => {
      if (subscription) {
        subscription.remove();
      }
      if (simulationInterval) {
        clearInterval(simulationInterval);
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
    if (isSimulationMode) {
      startSimulation();
    } else {
      await startRealTracking();
    }
  };

  const startSimulation = () => {
    // Get initial simulated position
    const initialCoord = simulator.getCurrentLocation();
    setCurrentLocation(initialCoord);
    addTrailPoint(initialCoord);

    // Start simulation interval
    const interval = setInterval(() => {
      const coord = simulator.getNextLocation();
      setCurrentLocation(coord);
      addTrailPoint(coord);
    }, 5000); // Update every 5 seconds

    setSimulationInterval(interval);
    setIsTracking(true);
  };

  const startRealTracking = async () => {
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
    
    // Stop real tracking
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    
    // Stop simulation
    if (simulationInterval) {
      clearInterval(simulationInterval);
      setSimulationInterval(null);
    }
  };

  const toggleSimulationMode = () => {
    // Stop current tracking before switching modes
    if (isTracking) {
      stopTracking();
    }
    
    setIsSimulationMode(!isSimulationMode);
    
    if (!isSimulationMode) {
      // Switching to simulation mode - reset simulator
      simulator.reset();
    }
  };

  const changeSimulationRoute = () => {
    if (isSimulationMode) {
      simulator.changeRoute();
      if (isTracking) {
        // Update to new route's starting location
        const newLocation = simulator.getCurrentLocation();
        setCurrentLocation(newLocation);
      }
    }
  };

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locationPermission,
        isTracking,
        isSimulationMode,
        requestPermissions,
        startTracking,
        stopTracking,
        toggleSimulationMode,
        changeSimulationRoute,
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
