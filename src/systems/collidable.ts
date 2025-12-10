/**
 * 충돌 가능 객체 인터페이스
 * 충돌 감지에 필요한 기본 속성을 정의
 */
export interface Collidable {
  x: number; // X 좌표
  y: number; // Y 좌표
  width: number; // 너비
  height: number; // 높이
}
