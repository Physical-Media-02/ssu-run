import p5 from "p5";

import ScoreManager from "./systems/score";
import HealthManager from "./systems/health_manager";
import drawScoreUI from "./systems/score_ui";
import { Player } from "./systems/player";
import { Obstacle } from "./systems/obstacle";
import { ObstacleManager } from "./systems/obstacle_manager";
import { PowerUp } from "./systems/power_up";
import { PowerUpManager } from "./systems/power_up_manager";
import { HealthRecovery } from "./systems/health_recovery";
import { HealthRecoveryManager } from "./systems/health_recovery_manager";
import { Platform } from "./systems/platform";
import { PlatformManager } from "./systems/platform_manager";
import { World } from "./systems/world";
import { level1 } from "./level";

// 이미지 import
import backgroundImg from "./assets/background.png";
import obstacleBottom1 from "./assets/obstacle_bottom_1.png";
import obstacleBottom2 from "./assets/obstacle_bottom_2.png";
import obstacleBottom3 from "./assets/obstacle_bottom_3.png";
import obstacleBottom4 from "./assets/obstacle_bottom_4.png";
import obstacleTop1 from "./assets/obstacle_top_1.png";
import obstacleTop2 from "./assets/obstacle_top_2.png";
import obstacleTop3 from "./assets/obstacle_top_3.png";
import itemPowerUpImg from "./assets/item_power_up.png";
import itemHealthImg from "./assets/item_health.png";
import characterImg from "./assets/character.png";
import characterPowerUpImg from "./assets/character_power_up.png";

const scoreManager = new ScoreManager();
const healthManager = new HealthManager(100); // Max health 100

document.getElementById("reset-button")?.addEventListener("click", () => {
  scoreManager.resetScore();
  healthManager.resetHealth();
  // We would also need to reset the game state here, which p.setup() will handle
});
document.getElementById("add-button")?.addEventListener("click", () => {
  scoreManager.updateScore(Math.floor(Math.random() * 11) + 10);
});
// Test button for taking damage
document.getElementById("damage-button")?.addEventListener("click", () => {
  healthManager.takeDamage(10);
});

interface ImageMap {
  background: p5.Image | null;
  obstacleBottom: p5.Image[];
  obstacleTop: p5.Image[];
  powerUp: p5.Image | null;
  healthRecovery: p5.Image | null;
  character: p5.Image | null;
  characterPowerUp: p5.Image | null;
}

let images: ImageMap;
let assetsLoaded = false;

const sketch = (p: p5) => {
  let player: Player;
  let obstacleManager: ObstacleManager;
  let powerUpManager: PowerUpManager;
  let healthRecoveryManager: HealthRecoveryManager;
  let platformManager: PlatformManager;
  let world: World;

  // Level-specific state
  let nextPlatformIndex = 0;
  let nextObstacleIndex = 0;
  let nextPowerUpIndex = 0;
  let nextHealthRecoveryIndex = 0;
  let gameStatus: "playing" | "won" | "lost" = "playing";

  // Scoring state
  let lastScoreTime = 0;
  const scoreInterval = 1000; // 1 second

  function resetGame() {
    // Player 생성: (p5, 일반이미지, 거대화이미지, 너비, 높이, 히트박스스케일)
    const playerWidth = 80;
    const playerHeight = 80;
    const playerHitboxScale = 0.6; // 히트박스는 표시 크기의 60%
    player = new Player(p, images.character, images.characterPowerUp, playerWidth, playerHeight, playerHitboxScale);
    obstacleManager = new ObstacleManager(p);
    powerUpManager = new PowerUpManager(p);
    healthRecoveryManager = new HealthRecoveryManager(p);
    platformManager = new PlatformManager(p);
    world = new World();
    
    // Reset level progress
    nextPlatformIndex = 0;
    nextObstacleIndex = 0;
    nextPowerUpIndex = 0;
    nextHealthRecoveryIndex = 0;
    
    // Reset managers
    scoreManager.resetScore();
    healthManager.resetHealth();

    lastScoreTime = p.millis();
    gameStatus = "playing";
  }

  p.setup = () => {
    p.createCanvas(800, 600);
    
    images = { 
      background: null,
      obstacleBottom: [],
      obstacleTop: [],
      powerUp: null,
      healthRecovery: null,
      character: null,
      characterPowerUp: null
    }; // 초기화
    
    let loadedCount = 0;
    const totalImages = 12; // 배경 1 + 하단 장애물 4 + 상단 장애물 3 + 파워업 1 + 체력 1 + 캐릭터 2
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        assetsLoaded = true;
        resetGame();
      }
    };
    
    // 배경 이미지 로드
    p.loadImage(backgroundImg, (img) => {
      images.background = img;
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load background image:', event);
      checkAllLoaded();
    });
    
    // 하단 장애물 이미지 로드 (4개)
    const bottomImages = [obstacleBottom1, obstacleBottom2, obstacleBottom3, obstacleBottom4];
    bottomImages.forEach((imgPath, i) => {
      p.loadImage(imgPath, (img) => {
        images.obstacleBottom.push(img);
        console.log(`obstacle_bottom_${i + 1} size: ${img.width}x${img.height}`);
        checkAllLoaded();
      }, (event) => {
        console.error(`Failed to load obstacle_bottom_${i + 1} image:`, event);
        checkAllLoaded();
      });
    });
    
    // 상단 장애물 이미지 로드 (3개)
    const topImages = [obstacleTop1, obstacleTop2, obstacleTop3];
    topImages.forEach((imgPath, i) => {
      p.loadImage(imgPath, (img) => {
        images.obstacleTop.push(img);
        console.log(`obstacle_top_${i + 1} size: ${img.width}x${img.height}`);
        checkAllLoaded();
      }, (event) => {
        console.error(`Failed to load obstacle_top_${i + 1} image:`, event);
        checkAllLoaded();
      });
    });
    
    // 파워업 아이템 이미지 로드
    p.loadImage(itemPowerUpImg, (img) => {
      images.powerUp = img;
      console.log(`power_up size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load power_up image:', event);
      checkAllLoaded();
    });
    
    // 체력 회복 아이템 이미지 로드
    p.loadImage(itemHealthImg, (img) => {
      images.healthRecovery = img;
      console.log(`health_recovery size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load health_recovery image:', event);
      checkAllLoaded();
    });
    
    // 캐릭터 이미지 로드 (일반)
    p.loadImage(characterImg, (img) => {
      images.character = img;
      console.log(`character size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load character image:', event);
      checkAllLoaded();
    });
    
    // 캐릭터 이미지 로드 (거대화)
    p.loadImage(characterPowerUpImg, (img) => {
      images.characterPowerUp = img;
      console.log(`character_power_up size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load character_power_up image:', event);
      checkAllLoaded();
    });
  };

  function drawHealthBar() {
    const health = healthManager.getCurrentHealth();
    const maxHealth = healthManager.getMaxHealth();
    const healthBarWidth = (health / maxHealth) * 200; // Health bar max width 200px

    p.push();
    p.stroke(0);
    p.strokeWeight(2);
    
    // Health bar background
    p.fill(100);
    p.rect(20, 20, 200, 20);

    // Current health
    p.fill(255, 0, 0); // Red
    p.rect(20, 20, healthBarWidth, 20);
    
    // Health text
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(`${health} / ${maxHealth}`, 120, 30);
    p.pop();
  }

  p.draw = () => {
    if (!assetsLoaded) {
      p.background(100);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Loading...", p.width/2, p.height/2);
      return;
    }

    // --- GAME STATE CHECKS ---
    if (gameStatus === "won") {
      p.background(255);
      p.fill(0);
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Level Complete!", p.width / 2, p.height / 2);
      return; // Stop the draw loop
    }
    if (gameStatus === "lost") {
      p.background(100);
      p.fill(255, 0, 0);
      p.textSize(32);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Game Over!", p.width / 2, p.height / 2);
      return; // Stop the draw loop
    }
    
    // --- UPDATES ---

    world.update();
    player.update(platformManager.platforms);

    // Update score over time
    if (gameStatus === "playing") {
        const currentTime = p.millis();
        if (currentTime - lastScoreTime > scoreInterval) {
        scoreManager.updateScore(1);
        lastScoreTime = currentTime;
        }
    }

    // Spawn new objects from level data
    if (nextPlatformIndex < level1.platforms.length && level1.platforms[nextPlatformIndex].x < world.worldX + p.width) {
      const platData = level1.platforms[nextPlatformIndex];
      platformManager.platforms.push(new Platform(p, platData.x, platData.width));
      nextPlatformIndex++;
    }
    if (nextObstacleIndex < level1.obstacles.length && level1.obstacles[nextObstacleIndex].x < world.worldX + p.width) {
      const obstacleData = level1.obstacles[nextObstacleIndex];
      const isTop = obstacleData.y !== undefined && obstacleData.y < p.height * 0.75 - 100;
      const obstacleImages = isTop ? images.obstacleTop : images.obstacleBottom;
      
      // 이미지 배열이 비어있지 않은지 확인
      if (obstacleImages.length > 0) {
        const randomImage = obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
        // 이미지 표시 크기를 키우고, 충돌 박스는 60%로 설정
        const displayWidth = 120;  // 이미지 표시 크기 (크게)
        const displayHeight = 100;
        const hitboxScale = 0.2;  // 충돌 박스는 20% 크기 (작게)
        obstacleManager.obstacles.push(new Obstacle(p, obstacleData.x, obstacleData.y, displayWidth, displayHeight, randomImage, hitboxScale));
      } else {
        // 이미지가 아직 로드되지 않았으면 기본 크기로 생성
        obstacleManager.obstacles.push(new Obstacle(p, obstacleData.x, obstacleData.y, obstacleData.width, obstacleData.height));
      }
      nextObstacleIndex++;
    }
    if (nextPowerUpIndex < level1.powerUps.length && level1.powerUps[nextPowerUpIndex].x < world.worldX + p.width) {
      const powerUpData = level1.powerUps[nextPowerUpIndex];
      const displayWidth = 120;  // 아이템 표시 크기
      const displayHeight = 120;
      const hitboxScale = 0.7;  // 충돌 박스 70%
      powerUpManager.powerUps.push(new PowerUp(p, powerUpData.x, powerUpData.y, displayWidth, displayHeight, images.powerUp, hitboxScale));
      nextPowerUpIndex++;
    }
    if (nextHealthRecoveryIndex < level1.healthRecoveries.length && level1.healthRecoveries[nextHealthRecoveryIndex].x < world.worldX + p.width) {
      const healthRecoveryData = level1.healthRecoveries[nextHealthRecoveryIndex];
      const displayWidth = 120;  // 아이템 표시 크기
      const displayHeight = 120;
      const hitboxScale = 0.7;  // 충돌 박스 70%
      healthRecoveryManager.healthRecoveries.push(new HealthRecovery(p, healthRecoveryData.x, healthRecoveryData.y, displayWidth, displayHeight, images.healthRecovery, hitboxScale));
      nextHealthRecoveryIndex++;
    }

    // Update positions of all active objects
    for (const platform of platformManager.platforms) {
      platform.update(world.worldX);
    }
    for (const obstacle of obstacleManager.obstacles) {
      obstacle.update(world.worldX);
    }
    for (const powerUp of powerUpManager.powerUps) {
      powerUp.update(world.worldX);
    }
    for (const healthRecovery of healthRecoveryManager.healthRecoveries) {
      healthRecovery.update(world.worldX);
    }

    // --- COLLISIONS & CLEANUP ---

    for (let i = obstacleManager.obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacleManager.obstacles[i];
      if (player.collidesWith(obstacle)) {
        if (player.isGiant) {
          scoreManager.updateScore(100);
          obstacleManager.obstacles.splice(i, 1);
        } else {
          healthManager.takeDamage(25); // Take 25 damage from obstacle
          obstacleManager.obstacles.splice(i, 1); // Remove obstacle after collision
        }
      } else if (obstacle.isOffscreen()) {
        obstacleManager.obstacles.splice(i, 1);
      }
    }
    for (let i = powerUpManager.powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUpManager.powerUps[i];
      if (player.collidesWith(powerUp)) {
        player.activateGiant(300);
        powerUpManager.powerUps.splice(i, 1);
      } else if (powerUp.isOffscreen()) {
        powerUpManager.powerUps.splice(i, 1);
      }
    }
    for (let i = healthRecoveryManager.healthRecoveries.length - 1; i >= 0; i--) {
      const healthRecovery = healthRecoveryManager.healthRecoveries[i];
      if (player.collidesWith(healthRecovery)) {
        healthManager.heal(25); // Heal 25
        healthRecoveryManager.healthRecoveries.splice(i, 1);
      } else if (healthRecovery.isOffscreen()) {
        healthRecoveryManager.healthRecoveries.splice(i, 1);
      }
    }
    for (let i = platformManager.platforms.length - 1; i >= 0; i--) {
        if (platformManager.platforms[i].isOffscreen()) {
            platformManager.platforms.splice(i, 1);
        }
    }


    // --- DRAWING ---
    if (images.background) {
      // 배경 이미지가 로드되었다면 반복하여 그린다.
      const bgWidth = images.background.width;
      // 스크롤 속도를 조절하려면 world.worldX에 계수를 곱합니다. (예: * 0.5)
      const parallaxX = world.worldX * 0.5;
      const startX = - (parallaxX % bgWidth);
      
      for (let x = startX; x < p.width; x += bgWidth) {
        p.image(images.background, x, 0, bgWidth, p.height);
      }
    } else {
      p.background(220); // 배경 이미지가 없으면 단색 배경
    }
    player.draw(p);
    obstacleManager.draw();
    powerUpManager.draw();
    healthRecoveryManager.draw();
    platformManager.draw();
    drawScoreUI(p, scoreManager);
    drawHealthBar();

    // --- STATE CHECKS ---
    if (world.worldX >= level1.length) {
      gameStatus = "won";
    }
    if (player.isDead()) { // Player falls off screen
      gameStatus = "lost";
    }
    if (healthManager.isDead()) { // Player runs out of health
        gameStatus = "lost";
    }
  };

  p.keyPressed = () => {
    if (p.keyCode === 32) { // 32 is the keycode for SPACE
      player.jump();
    }
  };
};

window.addEventListener('DOMContentLoaded', () => {
  new p5(sketch);
});