import p5 from "p5";
import { HealthRecovery } from "./health_recovery";

/**
 * 체력 회복 관리자 클래스
 * 모든 체력 회복 아이템을 관리하고 렌더링
 */
export class HealthRecoveryManager {
  healthRecoveries: HealthRecovery[]; // 활성 체력 회복 아이템 배열
  private p: p5; // p5 인스턴스

  /**
   * 체력 회복 관리자 생성자
   * @param p - p5 인스턴스
   */
  constructor(p: p5) {
    this.p = p;
    this.healthRecoveries = [];
  }

  /**
   * 모든 체력 회복 아이템을 화면에 그림
   */
  draw() {
    for (const healthRecovery of this.healthRecoveries) {
      healthRecovery.draw(this.p);
    }
  }
}
