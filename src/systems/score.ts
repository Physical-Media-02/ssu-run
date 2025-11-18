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
    // delta 표시 애니메이션 시작
    this.deltaDisplay = {
      value: delta,
      startTime: Date.now(),
      duration: 500, // 0.5초
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

    // 페이드아웃: 1에서 0으로
    const opacity = 1 - progress;

    return {
      value: this.deltaDisplay.value,
      opacity,
    };
  }
}
