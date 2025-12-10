import p5 from "p5";

/**
 * 플랫폼 클래스
 * 플레이어가 서서 이동할 수 있는 바닥 플랫폼
 */
export class Platform {
  worldX: number; // 월드 좌표계에서의 X 위치
  x: number;      // 화면상 X 좌표 (매 프레임 업데이트)
  y: number;      // Y 좌표 (지면 높이)
  width: number;  // 플랫폼 너비
  height: number; // 플랫폼 두께

  /**
   * 플랫폼 생성자
   * @param p - p5 인스턴스
   * @param worldX - 월드 좌표 X
   * @param width - 플랫폼 너비
   */
  constructor(p: p5, worldX: number, width: number) {
    this.worldX = worldX;
    this.width = width;
    this.height = 40; // 플랫폼 두께
    this.y = p.height * 0.75; // 지면 높이 (화면 75% 위치)
    this.x = 0; // 초기 화면 위치
  }

  /**
   * 월드 스크롤에 따라 화면상 위치 업데이트
   * @param worldScrollX - 월드 스크롤 X 좌표
   */
  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  /**
   * 플랫폼을 화면에 그림
   */
  draw(p: p5) {
    p.fill(100); // 짙은 회색
    p.rect(this.x, this.y, this.width, this.height);
  }

  /**
   * 플랫폼이 화면 밖으로 나갔는지 확인
   */
  isOffscreen(): boolean {
    return this.x + this.width < 0;
  }
}
