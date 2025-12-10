import p5 from "p5";
import { Collidable } from "./collidable";

/**
 * 장애물 클래스
 * 플레이어가 피해야 할 장애물을 표현
 */
export class Obstacle implements Collidable {
  worldX: number; // 월드 좌표계에서의 X 위치
  x: number; // 화면상 X 좌표 (매 프레임 업데이트)
  y: number; // Y 좌표
  width: number; // 충돌 박스 너비
  height: number; // 충돌 박스 높이
  private displayWidth: number; // 화면에 표시되는 너비
  private displayHeight: number; // 화면에 표시되는 높이
  private image: p5.Image | null; // 장애물 이미지

  /**
   * 장애물 생성자
   * @param p - p5 인스턴스
   * @param worldX - 월드 좌표 X
   * @param y - Y 좌표 (기본값: 지면 위)
   * @param displayWidth - 표시 너비
   * @param displayHeight - 표시 높이
   * @param image - 장애물 이미지
   * @param hitboxScale - 충돌 박스 비율 (기본값: 0.6)
   */
  constructor(
    p: p5,
    worldX: number,
    y?: number,
    displayWidth?: number,
    displayHeight?: number,
    image?: p5.Image,
    hitboxScale: number = 0.6
  ) {
    this.worldX = worldX;
    this.image = image || null;

    // 렌더링 크기
    this.displayWidth = displayWidth ?? 30;
    this.displayHeight = displayHeight ?? 60;

    // 충돌 박스는 렌더링 크기보다 작게
    this.width = this.displayWidth * hitboxScale;
    this.height = this.displayHeight * hitboxScale;

    this.y = y ?? p.height * 0.75 - this.displayHeight; // Align with the new ground level or use provided y
    this.x = 0; // Initial screen position, will be updated
  }

  /**
   * 충돌 감지용 히트박스 좌표 반환
   * 표시 크기보다 작은 충돌 박스를 중앙에 배치
   */
  getHitbox() {
    return {
      x: this.x + (this.displayWidth - this.width) / 2,
      y: this.y + (this.displayHeight - this.height) / 2,
      width: this.width,
      height: this.height,
    };
  }

  /**
   * 월드 스크롤에 따라 화면상 위치 업데이트
   * @param worldScrollX - 월드 스크롤 X 좌표
   */
  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  draw(p: p5) {
    p.push();
    p.imageMode(p.CORNER);

    if (this.image && this.image.width > 0) {
      // 이미지를 렌더링 크기로 그리기
      p.image(
        this.image,
        this.x,
        this.y,
        this.displayWidth,
        this.displayHeight
      );
    } else {
      // 폴백으로 초록색 사각형
      p.fill(0, 255, 0);
      p.noStroke();
      p.rect(this.x, this.y, this.displayWidth, this.displayHeight);
    }
    p.pop();

    // Draw debugging info (디버깅용 - 필요시 주석 해제)
    // const hitbox = this.getHitbox();
    // p.push();
    // p.fill(255, 0, 0);
    // p.stroke(255);
    // p.strokeWeight(2);
    // p.textSize(12);
    // p.textAlign(p.LEFT, p.TOP);
    // const coordText = `IMG ${Math.floor(this.displayWidth)}x${Math.floor(
    //   this.displayHeight
    // )} HIT ${Math.floor(this.width)}x${Math.floor(this.height)}`;
    // p.text(coordText, this.x, this.y - 20);
    //
    // // 충돌 박스 표시 (빨간색)
    // p.noFill();
    // p.stroke(255, 0, 0);
    // p.strokeWeight(2);
    // p.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);

    // // 렌더링 범위 표시 (노란색)
    // p.stroke(255, 255, 0);
    // p.strokeWeight(1);
    // p.rect(this.x, this.y, this.displayWidth, this.displayHeight);
    // p.pop();
  }

  isOffscreen(): boolean {
    return this.x < -this.displayWidth;
  }
}
