import p5 from "p5";
import { Collidable } from "./collidable";

export class Obstacle implements Collidable {
  worldX: number; // Position in the world
  x: number; // Position on the screen, updated each frame
  y: number;
  width: number; // 충돌 박스 크기
  height: number; // 충돌 박스 크기
  private displayWidth: number;
  private displayHeight: number;
  private image: p5.Image | null;

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

  // 충돌 감지를 위한 실제 히트박스 좌표 (중앙에 배치)
  getHitbox() {
    return {
      x: this.x + (this.displayWidth - this.width) / 2,
      y: this.y + (this.displayHeight - this.height) / 2,
      width: this.width,
      height: this.height,
    };
  }

  // Update the screen position based on the world scroll
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

    // Draw coordinates text for testing
    p.push();
    p.fill(255);
    p.textSize(20);
    p.textAlign(p.LEFT, p.TOP);
    const coordText2 = `${this.worldX}`;
    p.text(coordText2, this.x, this.y - 15);
    p.pop();
  }

  isOffscreen(): boolean {
    return this.x < -this.displayWidth;
  }
}
