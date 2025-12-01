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
  platforms: [{ x: 0, width: 16000 }],
  obstacles: [
    { x: 700 },
    { x: 1300 },
    { x: 1800 },
    { x: 1900 },
    { x: 2200, y: 250 },
    { x: 2800, y: 250 },
    { x: 3000 },
    { x: 3400 },
    { x: 3450, y: 250 },
    { x: 3600 },
    { x: 3700 },
    { x: 3800 },
    { x: 4300 },
    { x: 4500 },
    { x: 4800 },
    { x: 4900 },
    { x: 5100, y: 250 },
    { x: 5600, y: 250 },
    { x: 5800 },
    { x: 5900 },
    { x: 6200 },
    { x: 6300 },
    { x: 7100 },
    { x: 7500 },
    { x: 7600 },
    { x: 7700 },
    { x: 7800, y: 250 },
    { x: 7900, y: 250 },
    { x: 8000, y: 250 },
    { x: 8200 },
    { x: 8500 },
    { x: 8700, y: 250 },
    { x: 9400, y: 250 },
    { x: 9800 },
    { x: 10200, y: 250 },
    { x: 10400 },
    { x: 10600, y: 250 },
    { x: 10800 },
    { x: 11200, y: 250 },
    { x: 11400 },
    { x: 11600 },
    { x: 11800, y: 250 },
    { x: 12000 },
    { x: 12200 },
    { x: 12400, y: 250 },
    { x: 12700 },
    { x: 12800 },
    { x: 12900 },
    { x: 13100, y: 250 },
    { x: 13300 },
    { x: 13500 },
    { x: 13900 },
    { x: 14100 },
    { x: 14300, y: 250 },
    { x: 14500 },
    { x: 14700 },
    { x: 14800 },
    { x: 14900, y: 250 },
    { x: 15000 },
  ],
  powerUps: [
    { x: 3100, width: 40, height: 40 },
    { x: 7400, width: 40, height: 40 },
    { x: 12600, width: 40, height: 40 },
    { x: 14400, width: 40, height: 40 },
  ],
  healthRecoveries: [
    { x: 4700, width: 35, height: 35 },
    { x: 9100, y: 380, width: 35, height: 35 },
  ],
};
