import p5 from "p5";
import { HealthRecovery } from "./health_recovery";

export class HealthRecoveryManager {
  healthRecoveries: HealthRecovery[];
  private p: p5;

  constructor(p: p5) {
    this.p = p;
    this.healthRecoveries = [];
  }

  // A simple method to draw all active health recovery items
  draw() {
    for (const healthRecovery of this.healthRecoveries) {
      healthRecovery.draw(this.p);
    }
  }
}
