import p5 from "p5";
import { PowerUp } from "./power_up";

/**
 * 파워업 관리자 클래스
 * 모든 파워업 아이템을 관리하고 렌더링
 */
export class PowerUpManager {
  powerUps: PowerUp[]; // 활성 파워업 배열
  private p: p5; // p5 인스턴스

  /**
   * 파워업 관리자 생성자
   * @param p - p5 인스턴스
   */
  constructor(p: p5) {
    this.p = p;
    this.powerUps = [];
  }

  /**
   * 모든 파워업 아이템을 화면에 그림
   */
  draw() {
    for (const powerUp of this.powerUps) {
      powerUp.draw(this.p);
    }
  }
}
