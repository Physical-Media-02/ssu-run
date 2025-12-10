/**
 * 점수 관리자 클래스
 * 게임 점수를 관리하고 점수 변화 애니메이션을 처리
 */
export default class ScoreManager {
  score: number; // 현재 점수
  deltaDisplay: { // 점수 변화 표시용 데이터
    value: number; // 변화된 점수 값
    startTime: number; // 시작 시간
    duration: number; // 표시 지속 시간
  } | null;

  /**
   * 점수 관리자 생성자
   */
  constructor() {
    this.score = 0;
    this.deltaDisplay = null;
  }

  /**
   * 현재 점수 반환
   */
  getScore(): number {
    return this.score;
  }

  /**
   * 점수 업데이트
   * 점수 변화 애니메이션도 함께 설정
   * @param delta - 변화할 점수 값
   */
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
