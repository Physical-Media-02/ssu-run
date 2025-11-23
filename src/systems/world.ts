export class World {
  worldX: number; // Represents the distance the world has scrolled
  private scrollSpeed: number;

  constructor() {
    this.worldX = 0;
    this.scrollSpeed = 5; // Same as the old obstacle speed
  }

  update() {
    this.worldX += this.scrollSpeed;
  }
}
