import p5 from "p5";
import { PowerUp } from "./power_up";

export class PowerUpManager {
  powerUps: PowerUp[];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.powerUps = [];
  }

  // A simple method to draw all active power-ups
  draw() {
    for (const powerUp of this.powerUps) {
      powerUp.draw(this.p);
    }
  }
}
