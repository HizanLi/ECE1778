import { Coordinate } from '../types';

// Toronto city center coordinates (default starting position)
const TORONTO_CENTER = {
  latitude: 43.6532,
  longitude: -79.3832,
};

export class LocationSimulator {
  private currentLocation: Coordinate;
  private stepSize: number; // in degrees (approximately meters)

  constructor() {
    this.currentLocation = { ...TORONTO_CENTER };
    this.stepSize = 0.0001; // Approximately 11 meters per step
  }

  /**
   * Move in a specific direction
   */
  moveNorth(): Coordinate {
    this.currentLocation.latitude += this.stepSize;
    return this.getCurrentLocation();
  }

  moveSouth(): Coordinate {
    this.currentLocation.latitude -= this.stepSize;
    return this.getCurrentLocation();
  }

  moveEast(): Coordinate {
    this.currentLocation.longitude += this.stepSize;
    return this.getCurrentLocation();
  }

  moveWest(): Coordinate {
    this.currentLocation.longitude -= this.stepSize;
    return this.getCurrentLocation();
  }

  /**
   * Get current position without moving
   */
  getCurrentLocation(): Coordinate {
    return { ...this.currentLocation };
  }

  /**
   * Reset to Toronto city center
   */
  reset(): void {
    this.currentLocation = { ...TORONTO_CENTER };
  }

  /**
   * Set simulation to a specific location
   */
  setLocation(location: Coordinate): void {
    this.currentLocation = { ...location };
  }
}
