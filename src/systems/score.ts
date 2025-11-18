export default class ScoreManager {
  score: number;
  deltaDisplay: {
    value: number;
    startTime: number;
    duration: number;
  } | null;

  constructor() {
    this.score = 0;
    this.deltaDisplay = null;
  }

  getScore(): number {
    return this.score;
  }

  updateScore(delta: number): void {
    this.score += delta;
    this.deltaDisplay = {
      value: delta,
      startTime: Date.now(),
      duration: 500,
    };
  }

  resetScore(): void {
    this.score = 0;
    this.deltaDisplay = null;
  }

  getDeltaDisplay(): {
    value: number;
    opacity: number;
  } | null {
    if (!this.deltaDisplay) {
      return null;
    }

    const elapsed = Date.now() - this.deltaDisplay.startTime;
    const progress = elapsed / this.deltaDisplay.duration;

    if (progress >= 1) {
      this.deltaDisplay = null;
      return null;
    }

    const opacity = 1 - progress;

    return {
      value: this.deltaDisplay.value,
      opacity,
    };
  }
}
