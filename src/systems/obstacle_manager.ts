import p5 from "p5";
import { Obstacle } from "./obstacle";

export class ObstacleManager {
  obstacles: Obstacle[];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.obstacles = [];
  }

  // A simple method to draw all active obstacles
  draw() {
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.p);
    }
  }
}
