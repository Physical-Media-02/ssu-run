import p5 from "p5";
import { Collidable } from "./collidable";

export class Obstacle implements Collidable {
  worldX: number; // Position in the world
  x: number; // Position on the screen, updated each frame
  y: number;
  width: number;
  height: number;

  constructor(
    p: p5,
    worldX: number,
    y?: number,
    width?: number,
    height?: number
  ) {
    this.worldX = worldX;

    this.width = width ?? 30;
    this.height = height ?? 60;

    this.y = y ?? p.height * 0.75 - this.height; // Align with the new ground level or use provided y
    this.x = 0; // Initial screen position, will be updated
  }

  // Update the screen position based on the world scroll
  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  draw(p: p5) {
    p.fill(0, 255, 0); // Green for obstacles
    p.rect(this.x, this.y, this.width, this.height);

    // Draw coordinates text for testing
    // p.push();
    // p.fill(255);
    // p.textSize(20);
    // p.textAlign(p.LEFT, p.TOP);
    // const coordText = `${this.worldX}`;
    // p.text(coordText, this.x, this.y - 15);
    // p.pop();
  }

  isOffscreen(): boolean {
    return this.x < -this.width;
  }
}
