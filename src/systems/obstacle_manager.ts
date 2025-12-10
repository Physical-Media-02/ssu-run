import p5 from "p5";
import { Obstacle } from "./obstacle";

/**
 * 장애물 관리자 클래스
 * 모든 장애물을 관리하고 렌더링
 */
export class ObstacleManager {
  obstacles: Obstacle[]; // 활성 장애물 배열
  private p: p5; // p5 인스턴스

  /**
   * 장애물 관리자 생성자
   * @param p - p5 인스턴스
   */
  constructor(p: p5) {
    this.p = p;
    this.obstacles = [];
  }

  /**
   * 모든 장애물을 화면에 그림
   */
  draw() {
    for (const obstacle of this.obstacles) {
      obstacle.draw(this.p);
    }
  }
}
