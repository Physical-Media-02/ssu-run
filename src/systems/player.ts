import p5 from "p5";
import { Platform } from "./platform";

/**
 * 플레이어 클래스
 * 캐릭터의 이동, 점프, 슬라이드, 거대화 등의 동작을 관리
 */
export class Player {
  // ===== 공개 속성 =====
  x: number; // 화면상 X 좌표 (고정 위치)
  y: number; // 화면상 Y 좌표
  width: number; // 현재 너비
  height: number; // 현재 높이
  isGiant: boolean; // 거대화 상태
  isOnGround: boolean; // 지면 착지 상태
  isSliding: boolean; // 슬라이딩 상태

  // ===== 비공개 속성 =====
  private baseWidth: number; // 기본 너비
  private baseHeight: number; // 기본 높이
  private giantWidth: number; // 거대화 시 너비
  private giantHeight: number; // 거대화 시 높이
  private slideWidth: number; // 슬라이드 시 너비
  private slideHeight: number; // 슬라이드 시 높이
  private hitboxWidth: number; // 충돌 박스 너비
  private hitboxHeight: number; // 충돌 박스 높이
  private hitboxScale: number; // 충돌 박스 스케일 비율
  private vy: number; // Y축 속도
  private gravity: number; // 중력 값
  private jumpStrength: number; // 점프 힘
  private giantTimer: number; // 거대화 지속 시간 타이머
  private p: p5; // p5 인스턴스
  private normalImage: p5.Image | null; // 일반 상태 이미지
  private giantImage: p5.Image | null; // 거대화 상태 이미지
  private slideImage: p5.Image | null; // 슬라이드 상태 이미지

  /**
   * 플레이어 생성자
   * @param p - p5 인스턴스
   * @param normalImage - 일반 캐릭터 이미지
   * @param giantImage - 거대화 캐릭터 이미지
   * @param slideImage - 슬라이드 캐릭터 이미지
   * @param baseWidth - 기본 너비
   * @param baseHeight - 기본 높이
   * @param hitboxScale - 충돌 박스 스케일 비율
   */
  constructor(
    p: p5, 
    normalImage?: p5.Image | null, 
    giantImage?: p5.Image | null,
    slideImage?: p5.Image | null,
    baseWidth: number = 120,
    baseHeight: number = 80,
    hitboxScale: number = 0.6
  ) {
    this.p = p;
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    this.giantWidth = baseWidth * 1.5; // 거대화 시 1.5배
    this.giantHeight = baseHeight * 1.5;
    this.slideWidth = baseWidth * 1.2; // 슬라이드 시 너비 1.2배
    this.slideHeight = baseHeight * 0.7; // 슬라이드 시 높이 70%
    this.hitboxScale = hitboxScale;
    
    // 초기 크기 설정 (일반 상태)
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.hitboxWidth = this.width * hitboxScale;
    this.hitboxHeight = this.height * hitboxScale;
    
    // 초기 위치 설정
    this.x = p.width / 2 - this.width / 2; // 화면 중앙에 고정
    this.y = p.height * 0.75 - this.height; // 지면 위
    
    // 물리 속성 초기화
    this.vy = 0; // Y축 속도
    this.gravity = 0.6; // 중력
    this.jumpStrength = -16; // 점프 힘 (음수 = 위로)
    
    // 상태 초기화
    this.isGiant = false;
    this.isSliding = false;
    this.isOnGround = false;
    this.giantTimer = 0;
    
    // 이미지 설정
    this.normalImage = normalImage || null;
    this.giantImage = giantImage || null;
    this.slideImage = slideImage || null;
  }
  
  /**
   * 충돌 박스 좌표를 반환
   * 표시 크기보다 작은 충돌 박스를 중앙에 배치
   */
  getHitbox() {
    return {
      x: this.x + (this.width - this.hitboxWidth) / 2,
      y: this.y + (this.height - this.hitboxHeight) / 2,
      width: this.hitboxWidth,
      height: this.hitboxHeight
    };
  }

  /**
   * 점프 실행
   * 지면에 있을 때만 점프 가능
   */
  jump() {
    if (this.isOnGround) {
      this.vy = this.jumpStrength; // 위로 힘을 가함
      this.isOnGround = false;
    }
  }
  
  /**
   * 플레이어 상태 업데이트
   * 중력 적용, 플랫폼 충돌 검사, 거대화 타이머 관리
   * @param platforms - 충돌 검사할 플랫폼 배열
   */
  update(platforms: Platform[]) {
    // 중력 적용
    this.vy += this.gravity;
    this.y += this.vy;

    // 플랫폼과의 충돌 검사
    this.isOnGround = false;
    for (const platform of platforms) {
      // 수평 정렬 확인
      const isHorizontallyAligned = this.x + this.width > platform.x && this.x < platform.x + platform.width;
      // 수직 정렬 확인 (플랫폼 위에 착지)
      const isVerticallyAligned = this.y + this.height >= platform.y && this.y + this.height <= platform.y + platform.height + this.vy;
      
      if (isHorizontallyAligned && isVerticallyAligned) {
        this.y = platform.y - this.height; // 플랫폼 위에 정확히 배치
        this.vy = 0; // 수직 속도 초기화
        this.isOnGround = true; // 착지 상태
        break;
      }
    }

    // 거대화 타이머 가속
    if (this.isGiant) {
      this.giantTimer--;
      if (this.giantTimer <= 0) {
        this.deactivateGiant(); // 타이머 종료 시 일반 크기로 복귀
      }
    }
  }

  /**
   * 플레이어를 화면에 그림
   * 상태에 따라 다른 이미지를 표시
   */
  draw(p: p5) {
    p.push();
    p.imageMode(p.CORNER);
    
    // 상태에 따라 이미지 선택
    let currentImage: p5.Image | null;
    if (this.isSliding) {
      currentImage = this.slideImage; // 슬라이드 상태
    } else if (this.isGiant) {
      currentImage = this.giantImage; // 거대화 상태
    } else {
      currentImage = this.normalImage; // 일반 상태
    }
    
    // 이미지 또는 폴백 도형 그리기
    if (currentImage && currentImage.width > 0) {
      p.image(currentImage, this.x, this.y, this.width, this.height);
    } else {
      // 이미지 없을 때 폴백 (상태별 색상)
      if (this.isSliding) {
        p.fill(0, 200, 255); // 슬라이드: 하늘색
      } else if (this.isGiant) {
        p.fill(255, 200, 0); // 거대화: 노란색
      } else {
        p.fill(255, 0, 0); // 일반: 빨간색
      }
      p.rect(this.x, this.y, this.width, this.height);
    }
    p.pop();
  }

  /**
   * 플레이어가 죽었는지 확인
   * 화면 아래로 떨어지면 사망
   */
  isDead(): boolean {
    return this.y > this.p.height;
  }

  /**
   * 거대화 모드 활성화
   * 크기를 키우고 타이머 설정
   * @param duration - 거대화 지속 시간 (프레임 단위)
   */
  activateGiant(duration: number) {
    this.isGiant = true;
    const oldHeight = this.height;
    // 거대화 크기로 변경
    this.width = this.giantWidth;
    this.height = this.giantHeight;
    this.hitboxWidth = this.width * this.hitboxScale;
    this.hitboxHeight = this.height * this.hitboxScale;
    // 바닥 기준으로 Y 위치 조정 (위로 커지므로 Y 값 감소)
    this.y -= (this.height - oldHeight);
    this.giantTimer = duration;
    console.log("Player is GIANT!");
  }

  /**
   * 거대화 모드 비활성화
   * 기본 크기로 복귀
   */
  deactivateGiant() {
    this.isGiant = false;
    this.width = this.baseWidth;
    this.height = this.baseHeight;
    this.hitboxWidth = this.width * this.hitboxScale;
    this.hitboxHeight = this.height * this.hitboxScale;
    console.log("Player is normal size.");
  }

  /**
   * 슬라이드 시작
   * 지면에 있고 거대화 상태가 아닐 때만 가능
   */
  startSlide() {
    if (this.isOnGround && !this.isSliding && !this.isGiant) {
      this.isSliding = true;
      const oldHeight = this.height;
      // 슬라이드 크기로 변경
      this.width = this.slideWidth;
      this.height = this.slideHeight;
      this.hitboxWidth = this.width * this.hitboxScale;
      this.hitboxHeight = this.height * this.hitboxScale;
      // 바닥에 붙어있도록 Y 위치 조정 (낮아지므로 Y 값 증가)
      this.y += (oldHeight - this.height);
    }
  }

  /**
   * 슬라이드 종료
   * 기본 크기로 복귀
   */
  endSlide() {
    if (this.isSliding) {
      this.isSliding = false;
      const oldHeight = this.height;
      this.width = this.baseWidth;
      this.height = this.baseHeight;
      this.hitboxWidth = this.width * this.hitboxScale;
      this.hitboxHeight = this.height * this.hitboxScale;
      // 바닥에 붙어있도록 Y 위치 조정
      this.y -= (this.height - oldHeight);
    }
  }

  /**
   * 다른 오브젝트와의 충돌 감지
   * AABB (Axis-Aligned Bounding Box) 충돌 검사
   * @param other - 충돌 검사할 대상 오브젝트 (Collidable 인터페이스 또는 x, y, width, height 속성을 가진 객체)
   * @returns 충돌 여부
   */
  collidesWith(other: any): boolean {
    const playerHitbox = this.getHitbox();
    
    // 대상 오브젝트의 히트박스 정보 추출
    let otherX, otherY, otherWidth, otherHeight;
    
    if ('getHitbox' in other && typeof other.getHitbox === 'function') {
      // Collidable 인터페이스를 구현한 객체
      const hitbox = other.getHitbox();
      otherX = hitbox.x;
      otherY = hitbox.y;
      otherWidth = hitbox.width;
      otherHeight = hitbox.height;
    } else {
      // 직접 좌표와 크기를 가진 객체
      otherX = other.x;
      otherY = other.y;
      otherWidth = other.width;
      otherHeight = other.height;
    }
    
    // 충돌 경계 계산
    const playerRight = playerHitbox.x + playerHitbox.width;
    const playerBottom = playerHitbox.y + playerHitbox.height;
    const otherRight = otherX + otherWidth;
    const otherBottom = otherY + otherHeight;

    // AABB 충돌 검사
    return (
      playerHitbox.x < otherRight &&
      playerRight > otherX &&
      playerHitbox.y < otherBottom &&
      playerBottom > otherY
    );
  }
}
