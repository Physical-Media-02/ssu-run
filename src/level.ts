// Defines the structure for collidable objects placed in the level
export interface LevelObject {
  x: number; // world position
  y?: number; // world position
  width?: number;
  height?: number;
}

export interface PlatformData {
  x: number;
  width: number;
}

export interface LevelData {
  length: number; // Total length of the level in pixels
  platforms: PlatformData[];
  obstacles: LevelObject[];
  powerUps: LevelObject[];
  healthRecoveries: LevelObject[];
}

// A simple, hardcoded level definition for now.
export const level1: LevelData = {
  length: 5000,
  platforms: [
    { x: 0, width: 1200 }, // Start platform
    { x: 1300, width: 500 },  // A platform after a 100px gap
    { x: 1900, width: 800 },  // Another platform after a 100px gap
    { x: 2800, width: 1000 },
    { x: 3900, width: 2000 }, // Final platform leading to the end
  ],
  obstacles: [
    { x: 800 },
    { x: 1400 },
    { x: 1450 },
    { x: 2000, y: 400, width: 40, height: 120 },
    { x: 2200 },
    { x: 3000 },
    { x: 3050 },
    { x: 3100 },
    { x: 4000 },
  ],
  powerUps: [
    { x: 1000, width: 40, height: 40 },
    { x: 3500, y: 350 },
  ],
  healthRecoveries: [
    { x: 1600 },
    { x: 2500, width: 35, height: 35 },
    { x: 4500, y: 380 },
  ],
};