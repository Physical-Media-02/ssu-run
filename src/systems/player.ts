import p5 from "p5";
import { Platform } from "./platform";

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  isGiant: boolean;
  isOnGround: boolean;

  private baseWidth: number;
  private baseHeight: number;
  private giantWidth: number;
  private giantHeight: number;
  private hitboxWidth: number;
  private hitboxHeight: number;
  private hitboxScale: number;
  private vy: number;
  private gravity: number;
  private jumpStrength: number;
  private giantTimer: number;
  private p: p5;
  private normalImage: p5.Image | null;
  private giantImage: p5.Image | null;

  constructor(
    p: p5, 
    normalImage?: p5.Image | null, 
    giantImage?: p5.Image | null,
    baseWidth: number = 120,
    baseHeight: number = 80,
    hitboxScale: number = 0.6
  ) {
    this.p = p;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.giantWidth = baseWidth * 1.5;
    this.giantHeight = baseHeight * 1.5;
    this.hitboxScale = hitboxScale;
    
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.hitboxWidth = this.width * hitboxScale;
    this.hitboxHeight = this.height * hitboxScale;
    
    this.x = p.width / 2 - this.width / 2;
    this.y = p.height * 0.75 - this.height;
    this.vy = 0;
    this.gravity = 0.6;
    this.jumpStrength = -16;
    this.isGiant = false;
    this.isOnGround = false;
    this.giantTimer = 0;
    this.normalImage = normalImage || null;
    this.giantImage = giantImage || null;
  }
  
  getHitbox() {
    return {
      x: this.x + (this.width - this.hitboxWidth) / 2,
      y: this.y + (this.height - this.hitboxHeight) / 2,
      width: this.hitboxWidth,
      height: this.hitboxHeight
    };
  }

  jump() {
    if (this.isOnGround) {
      this.vy = this.jumpStrength;
      this.isOnGround = false;
    }
  }
  update(platforms: Platform[]) {
    this.vy += this.gravity;
    this.y += this.vy;

    this.isOnGround = false;
    for (const platform of platforms) {
      const isHorizontallyAligned = this.x + this.width > platform.x && this.x < platform.x + platform.width;
      const isVerticallyAligned = this.y + this.height >= platform.y && this.y + this.height <= platform.y + platform.height + this.vy;
      
      if (isHorizontallyAligned && isVerticallyAligned) {
        this.y = platform.y - this.height;
        this.vy = 0;
        this.isOnGround = true;
        break;
      }
    }

    if (this.isGiant) {
      this.giantTimer--;
      if (this.giantTimer <= 0) {
        this.deactivateGiant();
      }
    }
  }

  draw(p: p5) {
    p.push();
    p.imageMode(p.CORNER);
    
    const currentImage = this.isGiant ? this.giantImage : this.normalImage;
    
    if (currentImage && currentImage.width > 0) {
      p.image(currentImage, this.x, this.y, this.width, this.height);
    } else {
      if (this.isGiant) {
        p.fill(255, 200, 0);
      } else {
        p.fill(255, 0, 0);
      }
      p.rect(this.x, this.y, this.width, this.height);
    }
    p.pop();
  }

  isDead(): boolean {
    return this.y > this.p.height;
  }

  activateGiant(duration: number) {
    this.isGiant = true;
    const oldHeight = this.height;
    this.width = this.giantWidth;
    this.height = this.giantHeight;
    this.hitboxWidth = this.width * this.hitboxScale;
    this.hitboxHeight = this.height * this.hitboxScale;
    this.y -= (this.height - oldHeight);
    this.giantTimer = duration;
    console.log("Player is GIANT!");
  }

  deactivateGiant() {
    this.isGiant = false;
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.hitboxWidth = this.width * this.hitboxScale;
    this.hitboxHeight = this.height * this.hitboxScale;
    console.log("Player is normal size.");
  }

  collidesWith(other: any): boolean {
    const playerHitbox = this.getHitbox();
    
    let otherX, otherY, otherWidth, otherHeight;
    
    if ('getHitbox' in other && typeof other.getHitbox === 'function') {
      const hitbox = other.getHitbox();
      otherX = hitbox.x;
      otherY = hitbox.y;
      otherWidth = hitbox.width;
      otherHeight = hitbox.height;
    } else {
      otherX = other.x;
      otherY = other.y;
      otherWidth = other.width;
      otherHeight = other.height;
    }
    
    const playerRight = playerHitbox.x + playerHitbox.width;
    const playerBottom = playerHitbox.y + playerHitbox.height;
    const otherRight = otherX + otherWidth;
    const otherBottom = otherY + otherHeight;

    return (
      playerHitbox.x < otherRight &&
      playerRight > otherX &&
      playerHitbox.y < otherBottom &&
      playerBottom > otherY
    );
  }
}
