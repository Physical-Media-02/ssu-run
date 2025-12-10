import p5 from "p5";
import { Platform } from "./platform";

/**
 * 플랫폼 관리자 클래스
 * 모든 플랫폼을 관리하고 렌더링
 */
export class PlatformManager {
  platforms: Platform[]; // 활성 플랫폼 배열
  private p: p5; // p5 인스턴스

  /**
   * 플랫폼 관리자 생성자
   * @param p - p5 인스턴스
   */
  constructor(p: p5) {
    this.p = p;
    this.platforms = [];
  }

  /**
   * 모든 플랫폼을 화면에 그림
   */
  draw() {
    for (const platform of this.platforms) {
      platform.draw(this.p);
    }
  }
}
