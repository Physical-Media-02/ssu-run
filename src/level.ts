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

export interface EndingPointData {
  x: number;
  width?: number;
  height?: number;
  hitboxScale?: number; // 히트박스 비율 (0.0 ~ 1.0, 기본값: 0.4)
}

export interface LevelData {
  length: number;
  platforms: PlatformData[];
  obstacles: LevelObject[];
  powerUps: LevelObject[];
  healthRecoveries: LevelObject[];
  endingPoint: EndingPointData;
}

export const level1: LevelData = {
  length: 15000,
  platforms: [{ x: 0, width: 16000 }],
  obstacles: [
    { x: 700 },
    { x: 1300 },
    // { x: 1800 },
    { x: 1900 },
    { x: 2200, y: 300 },
    { x: 2800, y: 300 },
    // { x: 3000 },
    { x: 3400 },
    { x: 3450, y: 300 },
    { x: 3600 },
    { x: 3700, y: 300 },
    { x: 3800 },
    { x: 3900, y: 300 },
    { x: 4000 },
    { x: 4100, y: 300 },
    { x: 4200 },
    { x: 4300, y: 300 },
    { x: 4400 },
    { x: 4500, y: 300 },
    // { x: 4800 },
    // { x: 4900 },
    { x: 5200, y: 300 },
    { x: 5600, y: 300 },
    // { x: 5800 },
    { x: 5900 },
    // { x: 6200 },
    { x: 6300 },
    { x: 6800, y: 300 },
    { x: 7100 },
    { x: 7400 },
    // { x: 7600 },
    // { x: 7700 },
    { x: 7800, y: 300 },
    { x: 7900, y: 300 },
    { x: 8000, y: 300 },
    // { x: 8200 },
    { x: 8500 },
    { x: 8700, y: 300 },
    { x: 9400, y: 300 },
    { x: 9800 },
    { x: 10200, y: 300 },
    // { x: 10550 },
    // { x: 10600, y: 300 },
    { x: 10600 },
    { x: 11200, y: 300 },
    { x: 11300, y: 300 },
    { x: 11400, y: 300 },
    { x: 11500, y: 300 },
    { x: 11600, y: 300 },
    { x: 11700, y: 300 },
    // { x: 11400 },
    // { x: 11200 },
    { x: 11800, y: 300 },
    { x: 12100 },
    // { x: 12200 },
    { x: 12400, y: 300 },
    { x: 12700 },
    { x: 12800 },
    { x: 13000 },
    { x: 13100, y: 300 },
    { x: 13200 },
    { x: 13300 },
    { x: 13400 },
    { x: 13500 },
    { x: 13900, y: 300 },
    // { x: 14100 },
    // { x: 14200, y: 300 },
    { x: 14200 },
    { x: 14500 },
    // { x: 14700 },
    { x: 14800 },
    // { x: 15000, y: 300 },
    // { x: 15000 },
  ],
  powerUps: [{ x: 3100 }, { x: 12600 }],
  healthRecoveries: [{ x: 4700 }, { x: 9100 }],
  endingPoint: {
    x: 15000, // 깃발 X 위치
    width: 500, // 깃발 너비
    height: 400, // 깃발 높이
    hitboxScale: 0.8, // 히트박스 비율 (80%)
  },
};
