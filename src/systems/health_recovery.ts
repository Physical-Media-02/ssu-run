import p5 from "p5";
import { Collidable } from "./collidable";

/**
 * 체력 회복 아이템 클래스
 * 플레이어의 체력을 회복시키는 아이템
 */
export class HealthRecovery implements Collidable {
  worldX: number; // 월드 좌표 X
  x: number; // 화면상 X 좌표
  y: number; // Y 좌표
  width: number;  // 충돌 박스 너비
  height: number; // 충돌 박스 높이
  private displayWidth: number; // 표시 너비
  private displayHeight: number; // 표시 높이
  private image: p5.Image | null; // 아이템 이미지

  /**
   * 체력 회복 아이템 생성자
   * @param p - p5 인스턴스
   * @param worldX - 월드 좌표 X
   * @param y - Y 좌표
   * @param displayWidth - 표시 너비
   * @param displayHeight - 표시 높이
   * @param image - 아이템 이미지
   * @param hitboxScale - 충돌 박스 비율
   */
  constructor(
    p: p5,
    worldX: number,
    y?: number,
    displayWidth?: number,
    displayHeight?: number,
    image?: p5.Image | null,
    hitboxScale: number = 0.7
  ) {
    this.worldX = worldX;
    this.image = image || null;

    this.displayWidth = displayWidth ?? 35;
    this.displayHeight = displayHeight ?? 35;
    this.width = this.displayWidth * hitboxScale;
    this.height = this.displayHeight * hitboxScale;

    this.y = y ?? p.height * 0.75 - this.displayHeight - 30;
    this.x = 0;
  }

  getHitbox() {
    return {
      x: this.x + (this.displayWidth - this.width) / 2,
      y: this.y + (this.displayHeight - this.height) / 2,
      width: this.width,
      height: this.height
    };
  }

  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  draw(p: p5) {
    p.push();
    p.imageMode(p.CORNER);
    
    if (this.image && this.image.width > 0) {
      p.image(this.image, this.x, this.y, this.displayWidth, this.displayHeight);
    } else {
      // 폴백
      p.fill(255, 192, 203);
      p.ellipse(this.x + this.displayWidth / 2, this.y + this.displayHeight / 2, this.displayWidth, this.displayHeight);
    }
    p.pop();
  }

  isOffscreen(): boolean {
    return this.x < -this.displayWidth;
  }
}
