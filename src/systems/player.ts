import p5 from "p5";
import { Collidable } from "./collidable";
import { Platform } from "./platform";

export class Player {
  x: number;
  y: number;
  size: number; // Current size
  isGiant: boolean;
  isOnGround: boolean;

  private baseSize: number;
  private giantSize: number;
  private vy: number; // Vertical velocity
  private gravity: number;
  private jumpStrength: number;
  private giantTimer: number;
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.baseSize = 50;
    this.giantSize = 75;
    this.size = this.baseSize;
    this.x = p.width / 2 - this.size / 2;
    this.y = p.height * 0.75 - this.size; // Start on the new ground level
    this.vy = 0;
    this.gravity = 0.6;
    this.jumpStrength = -16;
    this.isGiant = false;
    this.isOnGround = false;
    this.giantTimer = 0;
  }

  jump() {
    if (this.isOnGround) {
      this.vy = this.jumpStrength;
      this.isOnGround = false;
    }
  }

  update(platforms: Platform[]) {
    // Apply gravity
    this.vy += this.gravity;
    this.y += this.vy;

    // Platform collision detection
    this.isOnGround = false;
    for (const platform of platforms) {
      const isHorizontallyAligned = this.x + this.size > platform.x && this.x < platform.x + platform.width;
      const isVerticallyAligned = this.y + this.size >= platform.y && this.y + this.size <= platform.y + platform.height + this.vy;
      
      if (isHorizontallyAligned && isVerticallyAligned) {
        this.y = platform.y - this.size; // Snap to the top of the platform
        this.vy = 0;
        this.isOnGround = true;
        break; // Stop checking after finding a platform
      }
    }

    // Update giant state timer
    if (this.isGiant) {
      this.giantTimer--;
      if (this.giantTimer <= 0) {
        this.deactivateGiant();
      }
    }
  }

  draw(p: p5) {
    if (this.isGiant) {
      p.fill(255, 200, 0); // Orange for giant state
    } else {
      p.fill(255, 0, 0); // Red for normal state
    }
    p.rect(this.x, this.y, this.size, this.size);
  }

  isDead(): boolean {
    return this.y > this.p.height;
  }

  activateGiant(duration: number) {
    this.isGiant = true;
    const oldSize = this.size;
    this.size = this.giantSize;
    this.y -= (this.size - oldSize); // Adjust y position to grow upwards
    this.giantTimer = duration;
    console.log("Player is GIANT!");
  }

  deactivateGiant() {
    this.isGiant = false;
    this.size = this.baseSize;
    // No need to adjust y on deactivation, gravity will handle it.
    console.log("Player is normal size.");
  }

  // AABB collision detection
  collidesWith(other: Collidable): boolean {
    const playerRight = this.x + this.size;
    const playerBottom = this.y + this.size;
    const otherRight = other.x + other.width;
    const otherBottom = other.y + other.height;

    return (
      this.x < otherRight &&
      playerRight > other.x &&
      this.y < otherBottom &&
      playerBottom > other.y
    );
  }
}
