import p5 from "p5";
import { Collidable } from "./collidable";

export class PowerUp implements Collidable {
  worldX: number;
  x: number;
  y: number;
  width: number;  // 충돌 박스 크기
  height: number;
  private displayWidth: number;
  private displayHeight: number;
  private image: p5.Image | null;

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

    this.displayWidth = displayWidth ?? 40;
    this.displayHeight = displayHeight ?? 40;
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
      p.fill(0, 0, 255);
      p.ellipse(this.x + this.displayWidth / 2, this.y + this.displayHeight / 2, this.displayWidth, this.displayHeight);
    }
    p.pop();
  }

  isOffscreen(): boolean {
    return this.x < -this.displayWidth;
  }
}
