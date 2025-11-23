import p5 from "p5";
import { Platform } from "./platform";

export class PlatformManager {
  platforms: Platform[];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.platforms = [];
  }

  // A simple method to draw all active platforms
  draw() {
    for (const platform of this.platforms) {
      platform.draw(this.p);
    }
  }
}
