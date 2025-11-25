export interface LevelObject {
  x: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface PlatformData {
  x: number;
  width: number;
}

export interface LevelData {
  length: number;
  platforms: PlatformData[];
  obstacles: LevelObject[];
  powerUps: LevelObject[];
  healthRecoveries: LevelObject[];
}

export const level1: LevelData = {
  length: 15000,
  platforms: [
    { x: 0, width: 2400 },
    { x: 2600, width: 1300 },
    { x: 4000, width: 1200 },
    { x: 5400, width: 1200 },
    { x: 6800, width: 1200 },
    { x: 8200, width: 1100 },
    { x: 9500, width: 1200 },
    { x: 10900, width: 1100 },
    { x: 12100, width: 1100 },
    { x: 13400, width: 1200 },
    { x: 14700, width: 1300 },
  ],
  obstacles: [
    { x: 700 },
    { x: 1300 },
    { x: 1900 },
    { x: 1800 },
    { x: 3000 },
    { x: 3400 },
    { x: 3450 },
    { x: 3500 },
    { x: 4300 },
    { x: 4900 },
    { x: 5600 },
    { x: 6200 },
    { x: 6300 },
    { x: 7100 },
    { x: 7500 },
    { x: 7600 },
    { x: 7700 },
    { x: 8500 },
    { x: 9000 },
    { x: 9800 },
    { x: 10400 },
    { x: 11100 },
    { x: 11700 },
    { x: 12300 },
    { x: 12700 },
    { x: 12800 },
    { x: 12900 },
    { x: 13600 },
    { x: 14200 },
    { x: 14700 },
    { x: 14800 },
    { x: 14900 },
    { x: 15000 },
  ],
  powerUps: [
    { x: 3200, width: 40, height: 40 },
    { x: 7400, width: 40, height: 40 },
    { x: 12600, width: 40, height: 40 },
    { x: 14500, width: 40, height: 40 },
  ],
  healthRecoveries: [
    { x: 4700, width: 35, height: 35 },
    { x: 9100, y: 380, width: 35, height: 35 },
  ],
};
