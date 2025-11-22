import p5 from "p5";

export class Platform {
  worldX: number; // Position in the world
  x: number;      // Position on the screen, updated each frame
  y: number;
  width: number;
  height: number;

  constructor(p: p5, worldX: number, width: number) {
    this.worldX = worldX;
    this.width = width;
    this.height = 40; // Thickness of the platform
    this.y = p.height * 0.75; // The new "ground level"
    this.x = 0; // Initial screen position, will be updated
  }

  // Update the screen position based on the world scroll
  update(worldScrollX: number) {
    this.x = this.worldX - worldScrollX;
  }

  draw(p: p5) {
    p.fill(100); // Dark grey for platforms
    p.rect(this.x, this.y, this.width, this.height);
  }

  isOffscreen(): boolean {
    return this.x + this.width < 0;
  }
}
