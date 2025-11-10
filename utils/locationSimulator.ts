import { Coordinate } from '../types';

// Toronto city center coordinates
const TORONTO_CENTER = {
  latitude: 43.6532,
  longitude: -79.3832,
};

// Define some interesting routes in Toronto
const TORONTO_ROUTES = [
  // Downtown loop (around CN Tower area)
  [
    { latitude: 43.6426, longitude: -79.3871 }, // CN Tower
    { latitude: 43.6435, longitude: -79.3799 }, // Union Station
    { latitude: 43.6481, longitude: -79.3798 }, // St. Lawrence Market
    { latitude: 43.6532, longitude: -79.3832 }, // Yonge-Dundas
    { latitude: 43.6544, longitude: -79.3960 }, // Kensington Market
    { latitude: 43.6488, longitude: -79.3948 }, // Chinatown
    { latitude: 43.6426, longitude: -79.3871 }, // Back to CN Tower
  ],
  // University of Toronto route
  [
    { latitude: 43.6629, longitude: -79.3957 }, // Robarts Library
    { latitude: 43.6645, longitude: -79.3990 }, // Hart House
    { latitude: 43.6596, longitude: -79.3977 }, // Queen's Park
    { latitude: 43.6708, longitude: -79.3971 }, // Royal Ontario Museum
    { latitude: 43.6667, longitude: -79.3861 }, // Bay Street
    { latitude: 43.6629, longitude: -79.3957 }, // Back to Robarts
  ],
  // Waterfront trail
  [
    { latitude: 43.6388, longitude: -79.3809 }, // Harbourfront
    { latitude: 43.6402, longitude: -79.3636 }, // Sugar Beach
    { latitude: 43.6449, longitude: -79.3524 }, // Cherry Beach
    { latitude: 43.6397, longitude: -79.3711 }, // Queens Quay
    { latitude: 43.6388, longitude: -79.3809 }, // Back to Harbourfront
  ],
];

export class LocationSimulator {
  private currentRoute: Coordinate[];
  private currentIndex: number;
  private isRandomWalk: boolean;
  private stepSize: number; // in degrees (approximately meters)

  constructor(randomWalk: boolean = false) {
    this.isRandomWalk = randomWalk;
    this.currentIndex = 0;
    this.stepSize = 0.0001; // Approximately 11 meters
    
    // Select a random route
    this.currentRoute = TORONTO_ROUTES[Math.floor(Math.random() * TORONTO_ROUTES.length)];
  }

  /**
   * Get the next simulated location
   */
  getNextLocation(): Coordinate {
    if (this.isRandomWalk) {
      return this.getRandomWalkLocation();
    } else {
      return this.getRouteLocation();
    }
  }

  /**
   * Get location following predefined route
   */
  private getRouteLocation(): Coordinate {
    const current = this.currentRoute[this.currentIndex];
    const next = this.currentRoute[(this.currentIndex + 1) % this.currentRoute.length];

    // Interpolate between current and next point
    const progress = 0.2; // Move 20% toward next point each step
    const interpolated = {
      latitude: current.latitude + (next.latitude - current.latitude) * progress,
      longitude: current.longitude + (next.longitude - current.longitude) * progress,
    };

    // Check if we're close enough to move to next waypoint
    const distance = this.calculateDistance(interpolated, next);
    if (distance < this.stepSize * 2) {
      this.currentIndex = (this.currentIndex + 1) % this.currentRoute.length;
    }

    return interpolated;
  }

  /**
   * Get location using random walk pattern
   */
  private getRandomWalkLocation(): Coordinate {
    const current = this.currentRoute[this.currentIndex];
    
    // Generate random direction
    const angle = Math.random() * Math.PI * 2;
    const distance = this.stepSize * (0.5 + Math.random() * 1.5);
    
    const newLocation = {
      latitude: current.latitude + Math.cos(angle) * distance,
      longitude: current.longitude + Math.sin(angle) * distance,
    };

    // Keep within Toronto bounds (rough boundaries)
    newLocation.latitude = Math.max(43.58, Math.min(43.85, newLocation.latitude));
    newLocation.longitude = Math.max(-79.64, Math.min(-79.12, newLocation.longitude));

    // Update current location
    this.currentRoute[this.currentIndex] = newLocation;

    return newLocation;
  }

  /**
   * Calculate distance between two coordinates (simple approximation)
   */
  private calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const latDiff = coord1.latitude - coord2.latitude;
    const lonDiff = coord1.longitude - coord2.longitude;
    return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
  }

  /**
   * Get current position without advancing
   */
  getCurrentLocation(): Coordinate {
    return { ...this.currentRoute[this.currentIndex] };
  }

  /**
   * Reset to start of route
   */
  reset(): void {
    this.currentIndex = 0;
    // Select a new random route
    this.currentRoute = TORONTO_ROUTES[Math.floor(Math.random() * TORONTO_ROUTES.length)];
  }

  /**
   * Set simulation to a specific location
   */
  setLocation(location: Coordinate): void {
    this.currentRoute[this.currentIndex] = { ...location };
  }

  /**
   * Switch to a different route
   */
  changeRoute(routeIndex?: number): void {
    if (routeIndex !== undefined && routeIndex >= 0 && routeIndex < TORONTO_ROUTES.length) {
      this.currentRoute = TORONTO_ROUTES[routeIndex];
    } else {
      this.currentRoute = TORONTO_ROUTES[Math.floor(Math.random() * TORONTO_ROUTES.length)];
    }
    this.currentIndex = 0;
  }
}
