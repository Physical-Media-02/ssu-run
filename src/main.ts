import p5 from "p5";

import ScoreManager from "./systems/score";
import HealthManager from "./systems/health_manager";
import drawScoreUI from "./systems/score_ui";

const scoreManager = new ScoreManager();
const healthManager = new HealthManager(100); // 최대 체력 100으로 설정

document.getElementById("reset-button")?.addEventListener("click", () => {
  scoreManager.resetScore();
  healthManager.resetHealth();
});
document.getElementById("add-button")?.addEventListener("click", () => {
  scoreManager.updateScore(Math.floor(Math.random() * 11) + 10);
});
// 테스트를 위해 데미지를 받는 버튼 이벤트 리스너 추가 (HTML에 damage-button이 있다고 가정)
document.getElementById("damage-button")?.addEventListener("click", () => {
  healthManager.takeDamage(10);
});

// --- 아래 클래스들은 보통 별도의 파일로 분리하여 관리합니다. (예: src/objects/Player.ts) ---

class Player {
  x: number = 50;
  y: number = 550;
  width: number = 20;
  height: number = 20;

  update(p: p5) {
    this.x = p.mouseX; // 마우스 따라 이동
  }

  draw(p: p5) {
    p.fill(0, 0, 255); // 파란색
    p.rect(this.x, this.y, this.width, this.height);
  }
}

class Obstacle {
  x: number = 300;
  y: number = 550;
  width: number = 20;
  height: number = 20;
  damage: number = 15;
  active: boolean = true;

  draw(p: p5) {
    if (!this.active) return;
    p.fill(150, 75, 0); // 갈색
    p.rect(this.x, this.y, this.width, this.height);
  }
}

class HealthItem {
  x: number = 500;
  y: number = 550;
  width: number = 20;
  height: number = 20;
  healAmount: number = 20;
  active: boolean = true;

  draw(p: p5) {
    if (!this.active) return;
    p.fill(0, 255, 0); // 초록색
    p.rect(this.x, this.y, this.width, this.height);
  }
}

/**
 * 두 사각형의 충돌을 감지하는 함수 (AABB Collision Detection)
 * @param rect1 첫 번째 사각형 {x, y, width, height}
 * @param rect2 두 번째 사각형 {x, y, width, height}
 * @returns 충돌했다면 true, 아니면 false
 */
function checkCollision(rect1: Player | Obstacle | HealthItem, rect2: Player | Obstacle | HealthItem): boolean {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y;
}

const sketch = (p: p5) => {
  // 클래스로부터 실제 객체(인스턴스)를 생성합니다.
  let player: Player;
  let obstacle: Obstacle;
  let healthItem: HealthItem;

  p.setup = () => {
    p.createCanvas(800, 600);
  };

  p.draw = () => {
    p.background(220);

    drawScoreUI(p, scoreManager);
    
    // 각 객체의 상태를 업데이트하고 화면에 그립니다.
    player.update(p);
    player.draw(p);
    obstacle.draw(p);
    healthItem.draw(p);

    // --- 충돌 처리 로직 ---
    // 1. 장애물과 충돌했는지 확인
    if (obstacle.active && checkCollision(player, obstacle)) {
      healthManager.takeDamage(obstacle.damage);
      obstacle.active = false; // 한 번만 부딪히도록 비활성화
    }

    // 2. 체력 아이템과 충돌했는지 확인
    if (healthItem.active && checkCollision(player, healthItem)) {
      healthManager.heal(healthItem.healAmount);
      healthItem.active = false; // 한 번만 먹도록 비활성화
    }

    // 리셋 버튼을 누르면 객체들도 다시 생성되도록 로직 추가
    document.getElementById("reset-button")!.onclick = () => {
      scoreManager.resetScore();
      healthManager.resetHealth();
      p.setup(); // setup 함수를 다시 호출하여 객체들을 초기화
    };

    // 체력 바 그리기
    const health = healthManager.getCurrentHealth();
    const maxHealth = healthManager.getMaxHealth();
    const healthBarWidth = (health / maxHealth) * 200; // 체력 바 최대 너비 200px

    p.fill(255, 0, 0); // 빨간색
    p.rect(20, 50, healthBarWidth, 20); // 체력 바 위치 및 크기
    p.noFill();
    p.stroke(0);
    p.rect(20, 50, 200, 20); // 체력 바 테두리
  };
};

new p5(sketch);
