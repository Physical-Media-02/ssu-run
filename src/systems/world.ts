/**
 * 월드 클래스
 * 게임 월드의 스크롤을 관리
 * 모든 오브젝트는 이 worldX를 기준으로 화면상 위치를 계산
 */
export class World {
  worldX: number; // 월드가 스크롤된 거리
  private scrollSpeed: number; // 스크롤 속도

  /**
   * 월드 생성자
   */
  constructor() {
    this.worldX = 0; // 초기 스크롤 위치
    this.scrollSpeed = 5; // 프레임당 5픽셀 스크롤
  }

  /**
   * 월드 스크롤 업데이트
   * 매 프레임마다 호출되어 월드를 오른쪽으로 스크롤
   */
  update() {
    this.worldX += this.scrollSpeed;
  }
}
