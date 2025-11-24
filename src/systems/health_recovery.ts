import p5 from "p5";
import { Collidable } from "./collidable";

export class HealthRecovery implements Collidable {
  worldX: number; // Position in the world
  x: number;      // Position on the screen, updated each frame
  y: number;
  width: number;
  height: number;

  constructor(p: p5, worldX: number, y?: number, width?: number, height?: number) {
    this.worldX = worldX;

    this.width = width ?? 20;
    this.height = height ?? 20;

    // Position slightly above the new ground level
    this.y = y ?? p.height * 0.75 - this.height - 30;
    this.x = 0; // Initial screen position, will be updated
  }

  // Update the screen position based on the world scroll
  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  draw(p: p5) {
    p.fill(255, 192, 203); // Pink for health recovery
    p.ellipse(this.x + this.width / 2, this.y + this.height / 2, this.width, this.height);
  }

  isOffscreen(): boolean {
    return this.x < -this.width;
  }
}
