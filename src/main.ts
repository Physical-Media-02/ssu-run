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

// 이미지 경로 (Vite의 base path를 사용하여 자동 설정)
const ASSET_PATH = `${import.meta.env.BASE_URL}assets`;

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
  endingCredit: p5.Image | null;
}

let images: ImageMap;
let assetsLoaded = false;

// ===== 오디오 시스템 =====
interface AudioMap {
  bgmHome: HTMLAudioElement | null;
  bgmGame: HTMLAudioElement | null;
  bgmWin: HTMLAudioElement | null;
  bgmOver1: HTMLAudioElement | null;
  bgmOver2: HTMLAudioElement | null;
  sfxJump: HTMLAudioElement | null;
  sfxHealth: HTMLAudioElement | null;
  sfxPowerUp: HTMLAudioElement | null;
  sfxObstacle: HTMLAudioElement | null;
}

let sounds: AudioMap = {
  bgmHome: null,
  bgmGame: null,
  bgmWin: null,
  bgmOver1: null,
  bgmOver2: null,
  sfxJump: null,
  sfxHealth: null,
  sfxPowerUp: null,
  sfxObstacle: null,
};

let currentBgm: HTMLAudioElement | null = null;
let lastScreen: GameScreen | null = null;
let audioInitialized = false; // 사용자 첫 상호작용 후 오디오 활성화

function loadSound(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
}

function playBgm(audio: HTMLAudioElement | null, loop: boolean = true) {
  if (!audio) return;
  if (currentBgm === audio && !audio.paused) return; // 같은 음악이 이미 재생 중이면 스킵
  
  stopCurrentBgm();
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch(e => console.log("BGM play failed:", e));
  currentBgm = audio;
}

function stopCurrentBgm() {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }
}

function playSfx(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(e => console.log("SFX play failed:", e));
}

// 게임 오버 시퀀스 재생 (1 끝나면 2 재생)
function playGameOverSequence() {
  if (!sounds.bgmOver1 || !sounds.bgmOver2) return;
  
  stopCurrentBgm();
  sounds.bgmOver1.loop = false;
  sounds.bgmOver1.currentTime = 0;
  
  sounds.bgmOver1.onended = () => {
    if (sounds.bgmOver2) {
      sounds.bgmOver2.loop = true;
      sounds.bgmOver2.currentTime = 0;
      sounds.bgmOver2.play().catch(e => console.log("BGM Over2 play failed:", e));
      currentBgm = sounds.bgmOver2;
    }
  };
  
  sounds.bgmOver1.play().catch(e => console.log("BGM Over1 play failed:", e));
  currentBgm = sounds.bgmOver1;
}

type GameScreen = "start" | "help" | "playing" | "credit" | "won" | "lost";

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
  let buttons: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    action: () => void;
    image?: p5.Image | null;
  }[] = [];

  // Scoring state
  let lastScoreTime = 0;
  const scoreInterval = 1000; // 1 second

  // Boss (professor) state
  let bossVisible = false;
  let bossX = -200; // 화면 밖에서 시작

  // Microphone state (마이크 파워업)
  let micEnabled = false;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let microphone: MediaStreamAudioSourceNode | null = null;
  let micDataArray: Uint8Array<ArrayBuffer> | null = null;
  const MIC_THRESHOLD = 50; // 데시벨 임계값 (0-255 범위, 조절 가능)

  // Input state (입력 상태 추적)
  let isDownKeyPressed = false;

  // Credit screen state (크레딧 화면)
  let creditStartTime = 0;
  const CREDIT_DURATION = 5000; // 5초

  function resetGame() {
    // Player 생성: (p5, 일반이미지, 거대화이미지, 슬라이드이미지, 너비, 높이, 히트박스스케일)
    const playerWidth = 160;
    const playerHeight = 100;
    const playerHitboxScale = 0.6; // 히트박스는 표시 크기의 60%
    player = new Player(
      p,
      images.character,
      images.characterPowerUp,
      images.characterSlide,
      playerWidth,
      playerHeight,
      playerHitboxScale
    );
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

  // 마이크 초기화 함수
  async function initMicrophone() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      micDataArray = new Uint8Array(bufferLength);

      micEnabled = true;
      console.log("마이크 초기화 성공!");
    } catch (err) {
      console.error("마이크 접근 실패:", err);
      micEnabled = false;
    }
  }

  // 마이크 볼륨 측정 함수 (0-255 범위)
  function getMicVolume(): number {
    if (!analyser || !micDataArray) return 0;

    analyser.getByteFrequencyData(micDataArray);

    // 평균 볼륨 계산
    let sum = 0;
    for (let i = 0; i < micDataArray.length; i++) {
      sum += micDataArray[i];
    }
    return sum / micDataArray.length;
  }

  function createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    action: () => void,
    image?: p5.Image | null
  ) {
    return { x, y, width, height, label, action, image };
  }

  function drawButton(button: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    image?: p5.Image | null;
  }) {
    const isHovered =
      p.mouseX > button.x &&
      p.mouseX < button.x + button.width &&
      p.mouseY > button.y &&
      p.mouseY < button.y + button.height;

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
      p.text(
        button.label,
        button.x + button.width / 2,
        button.y + button.height / 2
      );
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
      createButton(
        p.width / 2 + 90,
        p.height - 300,
        200,
        60,
        "게임 시작",
        () => {
          currentScreen = "playing";
          resetGame();
          // 마이크 초기화 (첫 번째 게임 시작 시)
          if (!micEnabled) {
            initMicrophone();
          }
        },
        images.btnStart
      ),
      createButton(
        p.width / 2 + 90,
        p.height - 240,
        200,
        60,
        "도움말",
        () => {
          currentScreen = "help";
        },
        images.btnHelp
      ),
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
      createButton(
        p.width / 2 - 100,
        p.height - 240,
        200,
        60,
        "돌아가기",
        () => {
          currentScreen = "start";
        },
        images.btnClose
      ),
    ];

    buttons.forEach(drawButton);
  }

  function showWinScreen() {
    p.background(26, 26, 46); // #1a1a2e

    // 승리 이미지 표시
    if (images.endingWin) {
      const imgWidth = 800;
      const imgHeight =
        (imgWidth / images.endingWin.width) * images.endingWin.height;
      p.image(
        images.endingWin,
        p.width / 2 - imgWidth / 2,
        50,
        imgWidth,
        imgHeight
      );
    }

    p.push();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.textStyle(p.NORMAL);
    p.text(`점수: ${scoreManager.getScore()}`, p.width / 2, p.height - 200);
    p.pop();

    buttons = [
      createButton(
        p.width / 2 - 220,
        p.height - 120,
        200,
        60,
        "다시 시작",
        () => {
          currentScreen = "playing";
          resetGame();
        },
        images.btnRetry
      ),
      createButton(
        p.width / 2 + 20,
        p.height - 120,
        200,
        60,
        "메인 메뉴",
        () => {
          currentScreen = "start";
        },
        images.btnHome
      ),
    ];

    buttons.forEach(drawButton);
  }

  function showLostScreen() {
    p.background(26, 26, 46); // #1a1a2e

    // 패배 이미지 표시
    if (images.endingOver) {
      const imgWidth = 800;
      const imgHeight =
        (imgWidth / images.endingOver.width) * images.endingOver.height;
      p.image(
        images.endingOver,
        p.width / 2 - imgWidth / 2,
        50,
        imgWidth,
        imgHeight
      );
    }

    p.push();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.textStyle(p.NORMAL);
    p.text(`점수: ${scoreManager.getScore()}`, p.width / 2, p.height - 200);
    p.pop();

    buttons = [
      createButton(
        p.width / 2 - 220,
        p.height - 120,
        200,
        60,
        "다시 시작",
        () => {
          currentScreen = "playing";
          resetGame();
        },
        images.btnRetry
      ),
      createButton(
        p.width / 2 + 20,
        p.height - 120,
        200,
        60,
        "메인 메뉴",
        () => {
          currentScreen = "start";
        },
        images.btnHome
      ),
    ];

    buttons.forEach(drawButton);
  }

  function showCreditScreen() {
    p.background(26, 26, 46); // #1a1a2e

    // 크레딧 이미지 표시
    if (images.endingCredit) {
      const imgWidth = 800;
      const imgHeight =
        (imgWidth / images.endingCredit.width) * images.endingCredit.height;
      p.image(
        images.endingCredit,
        p.width / 2 - imgWidth / 2,
        (p.height - imgHeight) / 2,
        imgWidth,
        imgHeight
      );
    }

    // 5초 후 승리 화면으로 전환
    if (p.millis() - creditStartTime >= CREDIT_DURATION) {
      currentScreen = "won";
    }

    // 버튼 없음 (자동 전환)
    buttons = [];
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
      endingPoint: null,
      endingCredit: null,
    }; // 초기화

    // ===== 오디오 파일 로드 =====
    sounds.bgmHome = loadSound(`${ASSET_PATH}/home.mp3`);
    sounds.bgmGame = loadSound(`${ASSET_PATH}/game.mp3`);
    sounds.bgmWin = loadSound(`${ASSET_PATH}/ending_win.mp3`);
    sounds.bgmOver1 = loadSound(`${ASSET_PATH}/ending_over_1.mp3`);
    sounds.bgmOver2 = loadSound(`${ASSET_PATH}/ending_over_2.mp3`);
    sounds.sfxJump = loadSound(`${ASSET_PATH}/character_jump.wav`);
    sounds.sfxHealth = loadSound(`${ASSET_PATH}/item_health.mp3`);
    sounds.sfxPowerUp = loadSound(`${ASSET_PATH}/item_power_up.wav`);
    sounds.sfxObstacle = loadSound(`${ASSET_PATH}/obstacle_attack.wav`);

    let loadedCount = 0;
    const totalImages = 26; // 배경 1 + 하단 장애물 4 + 상단 장애물 3 + 파워업 1 + 체력 1 + 캐릭터 3 + 엔딩 2 + 메인 1 + 도움말 1 + 보스 2 + 버튼 5 + 깃발 1 + 크레딧 1

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        assetsLoaded = true;
        resetGame();
      }
    };

    // 배경 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/background.jpeg`,
      (img) => {
        images.background = img;
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load background image:", event);
        checkAllLoaded();
      }
    );

    // 하단 장애물 이미지 로드 (4개)
    const bottomImages = [
      `${ASSET_PATH}/obstacle_bottom_1.png`,
      `${ASSET_PATH}/obstacle_bottom_2.png`,
      `${ASSET_PATH}/obstacle_bottom_3.png`,
      `${ASSET_PATH}/obstacle_bottom_4.png`,
    ];
    bottomImages.forEach((imgPath, i) => {
      p.loadImage(
        imgPath,
        (img) => {
          images.obstacleBottom.push(img);
          console.log(
            `obstacle_bottom_${i + 1} size: ${img.width}x${img.height}`
          );
          checkAllLoaded();
        },
        (event) => {
          console.error(
            `Failed to load obstacle_bottom_${i + 1} image:`,
            event
          );
          checkAllLoaded();
        }
      );
    });

    // 상단 장애물 이미지 로드 (3개)
    const topImages = [
      `${ASSET_PATH}/obstacle_top_1.png`,
      `${ASSET_PATH}/obstacle_top_2.png`,
      `${ASSET_PATH}/obstacle_top_3.png`,
    ];
    topImages.forEach((imgPath, i) => {
      p.loadImage(
        imgPath,
        (img) => {
          images.obstacleTop.push(img);
          console.log(`obstacle_top_${i + 1} size: ${img.width}x${img.height}`);
          checkAllLoaded();
        },
        (event) => {
          console.error(`Failed to load obstacle_top_${i + 1} image:`, event);
          checkAllLoaded();
        }
      );
    });

    // 파워업 아이템 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/item_power_up.png`,
      (img) => {
        images.powerUp = img;
        console.log(`power_up size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load power_up image:", event);
        checkAllLoaded();
      }
    );

    // 체력 회복 아이템 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/item_health.png`,
      (img) => {
        images.healthRecovery = img;
        console.log(`health_recovery size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load health_recovery image:", event);
        checkAllLoaded();
      }
    );

    // 캐릭터 이미지 로드 (일반)
    p.loadImage(
      `${ASSET_PATH}/character.png`,
      (img) => {
        images.character = img;
        console.log(`character size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load character image:", event);
        checkAllLoaded();
      }
    );

    // 캐릭터 이미지 로드 (거대화)
    p.loadImage(
      `${ASSET_PATH}/character_power_up.png`,
      (img) => {
        images.characterPowerUp = img;
        console.log(`character_power_up size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load character_power_up image:", event);
        checkAllLoaded();
      }
    );

    // 캐릭터 이미지 로드 (슬라이드)
    p.loadImage(
      `${ASSET_PATH}/character_slide.png`,
      (img) => {
        images.characterSlide = img;
        console.log(`character_slide size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load character_slide image:", event);
        checkAllLoaded();
      }
    );

    // 승리 화면 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/ending_win.png`,
      (img) => {
        images.endingWin = img;
        console.log(`ending_win size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load ending_win image:", event);
        checkAllLoaded();
      }
    );

    // 패배 화면 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/ending_over.png`,
      (img) => {
        images.endingOver = img;
        console.log(`ending_over size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load ending_over image:", event);
        checkAllLoaded();
      }
    );

    // 메인 화면 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/main.png`,
      (img) => {
        images.main = img;
        console.log(`main size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load main image:", event);
        checkAllLoaded();
      }
    );

    // 도움말 화면 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/help.png`,
      (img) => {
        images.help = img;
        console.log(`help size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load help image:", event);
        checkAllLoaded();
      }
    );

    // 보스(교수님) 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/boss.png`,
      (img) => {
        images.boss = img;
        console.log(`boss size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load boss image:", event);
        checkAllLoaded();
      }
    );

    // 보스(교수님) 달리기 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/boss_run.png`,
      (img) => {
        images.bossRun = img;
        console.log(`boss_run size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load boss_run image:", event);
        checkAllLoaded();
      }
    );

    // 버튼 이미지 로드
    p.loadImage(
      `${ASSET_PATH}/btn_start.png`,
      (img) => {
        images.btnStart = img;
        console.log(`btn_start size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load btn_start image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/btn_help.png`,
      (img) => {
        images.btnHelp = img;
        console.log(`btn_help size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load btn_help image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/btn_close.png`,
      (img) => {
        images.btnClose = img;
        console.log(`btn_close size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load btn_close image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/btn_home.png`,
      (img) => {
        images.btnHome = img;
        console.log(`btn_home size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load btn_home image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/btn_retry.png`,
      (img) => {
        images.btnRetry = img;
        console.log(`btn_retry size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load btn_retry image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/ending_point.png`,
      (img) => {
        images.endingPoint = img;
        console.log(`ending_point size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load ending_point image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/ending_credit.png`,
      (img) => {
        images.endingCredit = img;
        console.log(`ending_credit size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load ending_credit image:", event);
        checkAllLoaded();
      }
    );
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
      p.text("Loading...", p.width / 2, p.height / 2);
      return;
    }

    // ===== 화면 전환 시 배경음악 처리 =====
    if (audioInitialized && currentScreen !== lastScreen) {
      if (currentScreen === "start" || currentScreen === "help") {
        // 홈/도움말 화면: home.mp3 (서로 왔다갔다해도 재시작 안 함)
        if (lastScreen !== "start" && lastScreen !== "help") {
          playBgm(sounds.bgmHome, true);
        }
      } else if (currentScreen === "playing") {
        // 게임 플레이: game.mp3
        playBgm(sounds.bgmGame, true);
      } else if (currentScreen === "credit") {
        // 크레딧 화면: 승리 음악 미리 재생
        playBgm(sounds.bgmWin, true);
      } else if (currentScreen === "won") {
        // 승리 화면: 이미 credit에서 재생 중이면 유지
        if (lastScreen !== "credit") {
          playBgm(sounds.bgmWin, true);
        }
      } else if (currentScreen === "lost") {
        // 패배: ending_over_1.mp3 -> ending_over_2.mp3 순차 재생
        playGameOverSequence();
      }
      lastScreen = currentScreen;
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
    if (currentScreen === "credit") {
      showCreditScreen();
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

    // 키가 눌려있고 착지했을 때 즉시 슬라이딩 시작 (점프 후 착지 시 즉시 반응)
    if (
      isDownKeyPressed &&
      player.isOnGround &&
      !player.isSliding &&
      !player.isGiant
    ) {
      player.startSlide();
    }

    // --- MICROPHONE POWER-UP (마이크 파워업) ---
    if (micEnabled) {
      const volume = getMicVolume();
      if (volume > MIC_THRESHOLD) {
        // 마이크 볼륨이 임계값 초과 시 파워업 활성화
        if (!player.isGiant) {
          player.activateGiant(60); // 짧은 지속시간 (매 프레임 갱신됨)
        } else {
          // 이미 거대화 상태면 타이머 갱신
          player.activateGiant(60);
        }
      }
    }

    // Update score over time
    const currentTime = p.millis();
    if (currentTime - lastScoreTime > scoreInterval) {
      scoreManager.updateScore(1);
      lastScoreTime = currentTime;
    }

    // Spawn new objects from level data
    if (
      nextPlatformIndex < level1.platforms.length &&
      level1.platforms[nextPlatformIndex].x < world.worldX + p.width
    ) {
      const platData = level1.platforms[nextPlatformIndex];
      platformManager.platforms.push(
        new Platform(p, platData.x, platData.width)
      );
      nextPlatformIndex++;
    }
    if (
      nextObstacleIndex < level1.obstacles.length &&
      level1.obstacles[nextObstacleIndex].x < world.worldX + p.width
    ) {
      const obstacleData = level1.obstacles[nextObstacleIndex];
      const isTop =
        obstacleData.y !== undefined && obstacleData.y < p.height * 0.75 - 100;
      const obstacleImages = isTop ? images.obstacleTop : images.obstacleBottom;

      // 이미지 배열이 비어있지 않은지 확인
      if (obstacleImages.length > 0) {
        const randomImage =
          obstacleImages[Math.floor(Math.random() * obstacleImages.length)];
        // 이미지 표시 크기를 키우고, 충돌 박스는 60%로 설정
        const displayWidth = 120; // 이미지 표시 크기 (크게)
        const displayHeight = 100;
        const hitboxScale = 0.5; // 충돌 박스는 50% 크기 (작게)
        obstacleManager.obstacles.push(
          new Obstacle(
            p,
            obstacleData.x,
            obstacleData.y,
            displayWidth,
            displayHeight,
            randomImage,
            hitboxScale
          )
        );
      } else {
        // 이미지가 아직 로드되지 않았으면 기본 크기로 생성
        obstacleManager.obstacles.push(
          new Obstacle(
            p,
            obstacleData.x,
            obstacleData.y,
            obstacleData.width,
            obstacleData.height
          )
        );
      }
      nextObstacleIndex++;
    }
    if (
      nextPowerUpIndex < level1.powerUps.length &&
      level1.powerUps[nextPowerUpIndex].x < world.worldX + p.width
    ) {
      const powerUpData = level1.powerUps[nextPowerUpIndex];
      const displayWidth = 120; // 아이템 표시 크기
      const displayHeight = 60;
      const hitboxScale = 0.7; // 충돌 박스 70%
      powerUpManager.powerUps.push(
        new PowerUp(
          p,
          powerUpData.x,
          powerUpData.y,
          displayWidth,
          displayHeight,
          images.powerUp,
          hitboxScale
        )
      );
      nextPowerUpIndex++;
    }
    if (
      nextHealthRecoveryIndex < level1.healthRecoveries.length &&
      level1.healthRecoveries[nextHealthRecoveryIndex].x <
        world.worldX + p.width
    ) {
      const healthRecoveryData =
        level1.healthRecoveries[nextHealthRecoveryIndex];
      const displayWidth = 120; // 아이템 표시 크기
      const displayHeight = 60;
      const hitboxScale = 0.7; // 충돌 박스 70%
      healthRecoveryManager.healthRecoveries.push(
        new HealthRecovery(
          p,
          healthRecoveryData.x,
          healthRecoveryData.y,
          displayWidth,
          displayHeight,
          images.healthRecovery,
          hitboxScale
        )
      );
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
          playSfx(sounds.sfxObstacle); // 장애물 부딪힘 효과음
          obstacleManager.obstacles.splice(i, 1);
        } else {
          healthManager.takeDamage(25); // Take 25 damage from obstacle
          playSfx(sounds.sfxObstacle); // 장애물 부딪힘 효과음
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
        playSfx(sounds.sfxPowerUp); // 파워업 획득 효과음
        powerUpManager.powerUps.splice(i, 1);
      } else if (powerUp.isOffscreen()) {
        powerUpManager.powerUps.splice(i, 1);
      }
    }
    for (
      let i = healthRecoveryManager.healthRecoveries.length - 1;
      i >= 0;
      i--
    ) {
      const healthRecovery = healthRecoveryManager.healthRecoveries[i];
      if (player.collidesWith(healthRecovery)) {
        healthManager.heal(25); // Heal 25
        playSfx(sounds.sfxHealth); // 체력 회복 효과음
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
      const startX = -(parallaxX % bgWidth);

      for (let x = startX; x < p.width; x += bgWidth) {
        p.image(images.background, x, 0, bgWidth, p.height);
      }
    } else {
      p.background(220); // 배경 이미지가 없으면 단색 배경
    }

    // --- BOSS (교수님) UPDATE ---
    const healthPercent =
      healthManager.getCurrentHealth() / healthManager.getMaxHealth();
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
      x: flagX + (flagWidth - hitboxWidth) / 2, // 중앙 정렬
      y: flagY + (flagHeight - hitboxHeight) / 2,
      width: hitboxWidth,
      height: hitboxHeight,
    };

    const collidesWithFlag =
      playerHitbox.x < flagHitbox.x + flagHitbox.width &&
      playerHitbox.x + playerHitbox.width > flagHitbox.x &&
      playerHitbox.y < flagHitbox.y + flagHitbox.height &&
      playerHitbox.y + playerHitbox.height > flagHitbox.y;

    drawScoreUI(p, scoreManager);
    drawHealthBar();

    // --- MICROPHONE VOLUME BAR (마이크 볼륨 표시) ---
    if (micEnabled) {
      const volume = getMicVolume();
      const maxVolume = 255;
      const volumeBarWidth = (volume / maxVolume) * 150;

      p.push();
      p.noStroke();

      // 배경
      p.fill(50, 50, 50, 150);
      p.rect(p.width - 170, 20, 150, 20, 5);

      // 볼륨 바 (임계값 초과 시 색상 변경)
      if (volume > MIC_THRESHOLD) {
        p.fill(255, 200, 0); // 노란색 (파워업 활성화)
      } else {
        p.fill(100, 200, 100); // 초록색
      }
      p.rect(p.width - 170, 20, volumeBarWidth, 20, 5);

      // 임계값 선
      const thresholdX = p.width - 170 + (MIC_THRESHOLD / maxVolume) * 150;
      p.stroke(255, 0, 0);
      p.strokeWeight(2);
      p.line(thresholdX, 18, thresholdX, 42);

      // 마이크 아이콘/텍스트
      p.noStroke();
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text("🎤", p.width - 175, 30);
      p.pop();
    }

    // --- STATE CHECKS ---
    if (collidesWithFlag) {
      currentScreen = "credit";
      creditStartTime = p.millis();
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
        if (player.isOnGround) {
          playSfx(sounds.sfxJump); // 점프 효과음
        }
        player.jump();
      } else if (p.keyCode === 40) {
        isDownKeyPressed = true;
        player.startSlide();
      }
    }
  };

  p.keyReleased = () => {
    if (currentScreen === "playing") {
      if (p.keyCode === 40) {
        isDownKeyPressed = false;
        player.endSlide();
      }
    }
  };

  p.mousePressed = () => {
    // 첫 클릭 시 오디오 활성화 (브라우저 자동재생 정책 우회)
    if (!audioInitialized && assetsLoaded) {
      audioInitialized = true;
      // 현재 화면에 맞는 음악 재생
      if (currentScreen === "start" || currentScreen === "help") {
        playBgm(sounds.bgmHome, true);
      }
    }

    buttons.forEach((button) => {
      if (
        p.mouseX > button.x &&
        p.mouseX < button.x + button.width &&
        p.mouseY > button.y &&
        p.mouseY < button.y + button.height
      ) {
        button.action();
      }
    });
  };
};

window.addEventListener("DOMContentLoaded", () => {
  new p5(sketch);
});
