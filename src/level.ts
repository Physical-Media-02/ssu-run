// Defines the structure for collidable objects placed in the level
export interface LevelObject {
  x: number; // world position
  // 'type' can be used later to specify different kinds of obstacles/powerups
  type: string;
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
}

// A simple, hardcoded level definition for now.
export const level1: LevelData = {
  length: 5000,
  platforms: [
    { x: 0, width: 1200 }, // Start platform
    { x: 1300, width: 500 },  // A platform after a 100px gap
    { x: 1900, width: 800 },  // Another platform after a 100px gap
    { x: 2800, width: 1000 },
    { x: 3900, width: 1100 }, // Final platform leading to the end
  ],
  obstacles: [
    { x: 800, type: 'standard' },
    { x: 1400, type: 'standard' },
    { x: 1450, type: 'standard' },
    { x: 2000, type: 'tall' },
    { x: 2200, type: 'standard' },
    { x: 3000, type: 'standard' },
    { x: 3050, type: 'standard' },
    { x: 3100, type: 'standard' },
    { x: 4000, type: 'tall' },
  ],
  powerUps: [
    { x: 1000, type: 'giant' },
    { x: 3500, type: 'giant' },
  ],
};