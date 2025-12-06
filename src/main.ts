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
import characterSlideImg from "./assets/character_slide.png";
import endingWinImg from "./assets/ending_win.png";
import endingOverImg from "./assets/ending_over.png";
import mainImg from "./assets/main.png";
import helpImg from "./assets/help.png";
import bossImg from "./assets/boss.png";
import bossRunImg from "./assets/boss_run.png";
import btnStartImg from "./assets/btn_start.png";
import btnHelpImg from "./assets/btn_help.png";
import btnCloseImg from "./assets/btn_close.png";
import btnHomeImg from "./assets/btn_home.png";
import btnRetryImg from "./assets/btn_retry.png";
import endingPointImg from "./assets/ending_point.png";

const scoreManager = new ScoreManager();
const healthManager = new HealthManager(100);

interface ImageMap {
  background: p5.Image | null;
  obstacleBottom: p5.Image[];
  obstacleTop: p5.Image[];
  powerUp: p5.Image | null;
  healthRecovery: p5.Image | null;
  character: p5.Image | null;
  characterPowerUp: p5.Image | null;
  characterSlide: p5.Image | null;
  endingWin: p5.Image | null;
  endingOver: p5.Image | null;
  main: p5.Image | null;
  help: p5.Image | null;
  boss: p5.Image | null;
  bossRun: p5.Image | null;
  btnStart: p5.Image | null;
  btnHelp: p5.Image | null;
  btnClose: p5.Image | null;
  btnHome: p5.Image | null;
  btnRetry: p5.Image | null;
  endingPoint: p5.Image | null;
}

let images: ImageMap;
let assetsLoaded = false;

type GameScreen = "start" | "help" | "playing" | "won" | "lost";

const sketch = (p: p5) => {
  let currentScreen: GameScreen = "start";
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

  // Button state
  let buttons: { x: number; y: number; width: number; height: number; label: string; action: () => void; image?: p5.Image | null }[] = [];

  // Scoring state
  let lastScoreTime = 0;
  const scoreInterval = 1000; // 1 second

  // Boss (professor) state
  let bossVisible = false;
  let bossX = -200; // 화면 밖에서 시작

  function resetGame() {
    // Player 생성: (p5, 일반이미지, 거대화이미지, 슬라이드이미지, 너비, 높이, 히트박스스케일)
    const playerWidth = 160;
    const playerHeight = 100;
    const playerHitboxScale = 0.6; // 히트박스는 표시 크기의 60%
    player = new Player(p, images.character, images.characterPowerUp, images.characterSlide, playerWidth, playerHeight, playerHitboxScale);
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

    // Reset boss state
    bossVisible = false;
    bossX = -200;

    lastScoreTime = p.millis();
  }

  function createButton(x: number, y: number, width: number, height: number, label: string, action: () => void, image?: p5.Image | null) {
    return { x, y, width, height, label, action, image };
  }

  function drawButton(button: { x: number; y: number; width: number; height: number; label: string; image?: p5.Image | null }) {
    const isHovered = p.mouseX > button.x && p.mouseX < button.x + button.width &&
                      p.mouseY > button.y && p.mouseY < button.y + button.height;
    
    p.push();
    if (button.image) {
      // 이미지 버튼
      if (isHovered) {
        p.tint(200); // 호버 시 약간 어둡게
      }
      p.image(button.image, button.x, button.y, button.width, button.height);
    } else {
      // 텍스트 버튼 (기본)
      p.fill(isHovered ? 100 : 50);
      p.stroke(255);
      p.strokeWeight(3);
      p.rect(button.x, button.y, button.width, button.height, 10);
      
      p.fill(255);
      p.noStroke();
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.text(button.label, button.x + button.width / 2, button.y + button.height / 2);
    }
    p.pop();
  }

  function showStartScreen() {
    p.background(26, 26, 46); // #1a1a2e
    
    // 메인 이미지 표시
    if (images.main) {
      const imgWidth = 800;
      const imgHeight = (imgWidth / images.main.width) * images.main.height;
      p.image(images.main, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }
    
    buttons = [
      createButton(p.width / 2 - 240, p.height - 120, 200, 60, "게임 시작", () => {
        currentScreen = "playing";
        resetGame();
      }, images.btnStart),
      createButton(p.width / 2 + 60, p.height - 120, 200, 60, "도움말", () => {
        currentScreen = "help";
      }, images.btnHelp)
    ];
    
    buttons.forEach(drawButton);
  }

  function showHelpScreen() {
    p.background(26, 26, 46); // #1a1a2e
    
    // 도움말 이미지 표시
    if (images.help) {
      const imgWidth = 1000;
      const imgHeight = (imgWidth / images.help.width) * images.help.height;
      p.image(images.help, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }
    
    buttons = [
      createButton(p.width / 2 - 100, p.height - 110, 200, 60, "돌아가기", () => {
        currentScreen = "start";
      }, images.btnClose)
    ];
    
    buttons.forEach(drawButton);
  }

  function showWinScreen() {
    p.background(26, 26, 46); // #1a1a2e
    
    // 승리 이미지 표시
    if (images.endingWin) {
      const imgWidth = 800;
      const imgHeight = (imgWidth / images.endingWin.width) * images.endingWin.height;
      p.image(images.endingWin, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }
    
    p.push();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.textStyle(p.NORMAL);
    p.text(`점수: ${scoreManager.getScore()}`, p.width / 2, p.height - 200);
    p.pop();
    
    buttons = [
      createButton(p.width / 2 - 220, p.height - 120, 200, 60, "다시 시작", () => {
        currentScreen = "playing";
        resetGame();
      }, images.btnRetry),
      createButton(p.width / 2 + 20, p.height - 120, 200, 60, "메인 메뉴", () => {
        currentScreen = "start";
      }, images.btnHome)
    ];
    
    buttons.forEach(drawButton);
  }

  function showLostScreen() {
    p.background(26, 26, 46); // #1a1a2e
    
    // 패배 이미지 표시
    if (images.endingOver) {
      const imgWidth = 800;
      const imgHeight = (imgWidth / images.endingOver.width) * images.endingOver.height;
      p.image(images.endingOver, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }
    
    p.push();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.textStyle(p.NORMAL);
    p.text(`점수: ${scoreManager.getScore()}`, p.width / 2, p.height - 200);
    p.pop();
    
    buttons = [
      createButton(p.width / 2 - 220, p.height - 120, 200, 60, "다시 시작", () => {
        currentScreen = "playing";
        resetGame();
      }, images.btnRetry),
      createButton(p.width / 2 + 20, p.height - 120, 200, 60, "메인 메뉴", () => {
        currentScreen = "start";
      }, images.btnHome)
    ];
    
    buttons.forEach(drawButton);
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
      characterPowerUp: null,
      characterSlide: null,
      endingWin: null,
      endingOver: null,
      main: null,
      help: null,
      boss: null,
      bossRun: null,
      btnStart: null,
      btnHelp: null,
      btnClose: null,
      btnHome: null,
      btnRetry: null,
      endingPoint: null
    }; // 초기화
    
    let loadedCount = 0;
    const totalImages = 25; // 배경 1 + 하단 장애물 4 + 상단 장애물 3 + 파워업 1 + 체력 1 + 캐릭터 3 + 엔딩 2 + 메인 1 + 도움말 1 + 보스 2 + 버튼 5 + 깃발 1
    
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

    // 캐릭터 이미지 로드 (슬라이드)
    p.loadImage(characterSlideImg, (img) => {
      images.characterSlide = img;
      console.log(`character_slide size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load character_slide image:', event);
      checkAllLoaded();
    });

    // 승리 화면 이미지 로드
    p.loadImage(endingWinImg, (img) => {
      images.endingWin = img;
      console.log(`ending_win size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load ending_win image:', event);
      checkAllLoaded();
    });

    // 패배 화면 이미지 로드
    p.loadImage(endingOverImg, (img) => {
      images.endingOver = img;
      console.log(`ending_over size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load ending_over image:', event);
      checkAllLoaded();
    });

    // 메인 화면 이미지 로드
    p.loadImage(mainImg, (img) => {
      images.main = img;
      console.log(`main size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load main image:', event);
      checkAllLoaded();
    });

    // 도움말 화면 이미지 로드
    p.loadImage(helpImg, (img) => {
      images.help = img;
      console.log(`help size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load help image:', event);
      checkAllLoaded();
    });

    // 보스(교수님) 이미지 로드
    p.loadImage(bossImg, (img) => {
      images.boss = img;
      console.log(`boss size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load boss image:', event);
      checkAllLoaded();
    });

    // 보스(교수님) 달리기 이미지 로드
    p.loadImage(bossRunImg, (img) => {
      images.bossRun = img;
      console.log(`boss_run size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load boss_run image:', event);
      checkAllLoaded();
    });

    // 버튼 이미지 로드
    p.loadImage(btnStartImg, (img) => {
      images.btnStart = img;
      console.log(`btn_start size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load btn_start image:', event);
      checkAllLoaded();
    });

    p.loadImage(btnHelpImg, (img) => {
      images.btnHelp = img;
      console.log(`btn_help size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load btn_help image:', event);
      checkAllLoaded();
    });

    p.loadImage(btnCloseImg, (img) => {
      images.btnClose = img;
      console.log(`btn_close size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load btn_close image:', event);
      checkAllLoaded();
    });

    p.loadImage(btnHomeImg, (img) => {
      images.btnHome = img;
      console.log(`btn_home size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load btn_home image:', event);
      checkAllLoaded();
    });

    p.loadImage(btnRetryImg, (img) => {
      images.btnRetry = img;
      console.log(`btn_retry size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load btn_retry image:', event);
      checkAllLoaded();
    });

    p.loadImage(endingPointImg, (img) => {
      images.endingPoint = img;
      console.log(`ending_point size: ${img.width}x${img.height}`);
      checkAllLoaded();
    }, (event) => {
      console.error('Failed to load ending_point image:', event);
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

    // Screen routing
    if (currentScreen === "start") {
      showStartScreen();
      return;
    }
    if (currentScreen === "help") {
      showHelpScreen();
      return;
    }
    if (currentScreen === "won") {
      showWinScreen();
      return;
    }
    if (currentScreen === "lost") {
      showLostScreen();
      return;
    }
    
    // --- PLAYING SCREEN ---
    if (currentScreen !== "playing") return;

    world.update();
    player.update(platformManager.platforms);

    // Update score over time
    const currentTime = p.millis();
    if (currentTime - lastScoreTime > scoreInterval) {
      scoreManager.updateScore(1);
      lastScoreTime = currentTime;
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
      const displayHeight = 60;
      const hitboxScale = 0.7;  // 충돌 박스 70%
      powerUpManager.powerUps.push(new PowerUp(p, powerUpData.x, powerUpData.y, displayWidth, displayHeight, images.powerUp, hitboxScale));
      nextPowerUpIndex++;
    }
    if (nextHealthRecoveryIndex < level1.healthRecoveries.length && level1.healthRecoveries[nextHealthRecoveryIndex].x < world.worldX + p.width) {
      const healthRecoveryData = level1.healthRecoveries[nextHealthRecoveryIndex];
      const displayWidth = 120;  // 아이템 표시 크기
      const displayHeight = 60;
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

    // --- BOSS (교수님) UPDATE ---
    const healthPercent = healthManager.getCurrentHealth() / healthManager.getMaxHealth();
    const playerX = 100; // 플레이어 고정 X 위치
    
    if (healthPercent <= 0.25) {
      // 체력 25% 이하: 교수님이 바로 뒤로 쫓아옴
      bossVisible = true;
      const targetX = playerX - 80; // 플레이어 바로 뒤
      bossX += (targetX - bossX) * 0.1; // 부드럽게 이동
    } else if (healthPercent <= 0.5) {
      // 체력 50% 이하: 교수님 등장 (멀리서)
      bossVisible = true;
      const targetX = -50; // 화면 왼쪽 가장자리
      bossX += (targetX - bossX) * 0.05; // 천천히 이동
    } else {
      // 체력 50% 초과: 교수님이 자연스럽게 화면 밖으로 사라짐
      const targetX = -250; // 화면 완전히 밖으로
      bossX += (targetX - bossX) * 0.03; // 천천히 밖으로 이동
      // 완전히 밖으로 나가면 bossVisible을 false로
      if (bossX <= -240) {
        bossVisible = false;
      }
    }

    // --- BOSS DRAWING ---
    // bossX가 화면 안에 있으면 그리기 (자연스러운 퇴장을 위해)
    if (bossVisible || bossX > -240) {
      const bossWidth = 240;
      const bossHeight = 120;
      const bossY = p.height * 0.75 - bossHeight; // 바닥 위
      
      let bossImage: p5.Image | null = null;
      if (healthPercent <= 0.25) {
        bossImage = images.bossRun; // 달리기 이미지
      } else {
        bossImage = images.boss; // 기본 이미지
      }
      
      if (bossImage) {
        p.image(bossImage, bossX, bossY, bossWidth, bossHeight);
      }
    }

    player.draw(p);
    obstacleManager.draw();
    powerUpManager.draw();
    healthRecoveryManager.draw();
    platformManager.draw();

    // --- ENDING POINT (깃발) ---
    const flagData = level1.endingPoint;
    const flagX = flagData.x - world.worldX; // 깃발의 화면상 X 위치
    const flagWidth = flagData.width || 150;
    const flagHeight = flagData.height || 200;
    const flagY = p.height * 0.75 - flagHeight; // 바닥 위
    
    // 깃발이 화면 안에 있을 때만 그리기
    if (flagX < p.width + flagWidth && flagX > -flagWidth) {
      if (images.endingPoint) {
        p.image(images.endingPoint, flagX, flagY, flagWidth, flagHeight);
      } else {
        // 이미지 없으면 기본 도형
        p.fill(255, 215, 0);
        p.rect(flagX, flagY, flagWidth, flagHeight);
      }
    }

    // 깃발과 플레이어 충돌 체크 (클리어 조건)
    const playerHitbox = player.getHitbox();
    const hitboxScale = flagData.hitboxScale || 0.4; // level.ts에서 설정한 히트박스 비율
    const hitboxWidth = flagWidth * hitboxScale;
    const hitboxHeight = flagHeight * hitboxScale;
    const flagHitbox = {
      x: flagX + (flagWidth - hitboxWidth) / 2,  // 중앙 정렬
      y: flagY + (flagHeight - hitboxHeight) / 2,
      width: hitboxWidth,
      height: hitboxHeight
    };
    
    const collidesWithFlag = 
      playerHitbox.x < flagHitbox.x + flagHitbox.width &&
      playerHitbox.x + playerHitbox.width > flagHitbox.x &&
      playerHitbox.y < flagHitbox.y + flagHitbox.height &&
      playerHitbox.y + playerHitbox.height > flagHitbox.y;

    drawScoreUI(p, scoreManager);
    drawHealthBar();

    // --- STATE CHECKS ---
    if (collidesWithFlag) {
      currentScreen = "won";
    }
    if (player.isDead()) {
      currentScreen = "lost";
    }
    if (healthManager.isDead()) {
      currentScreen = "lost";
    }
  };

  p.keyPressed = () => {
    if (currentScreen === "playing") {
      // UP_ARROW = 38, DOWN_ARROW = 40
      if (p.keyCode === 38) {
        player.jump();
      } else if (p.keyCode === 40) {
        player.startSlide();
      }
    }
  };

  p.keyReleased = () => {
    if (currentScreen === "playing") {
      if (p.keyCode === 40) {
        player.endSlide();
      }
    }
  };

  p.mousePressed = () => {
    buttons.forEach(button => {
      if (p.mouseX > button.x && p.mouseX < button.x + button.width &&
          p.mouseY > button.y && p.mouseY < button.y + button.height) {
        button.action();
      }
    });
  };
};

window.addEventListener('DOMContentLoaded', () => {
  new p5(sketch);
});