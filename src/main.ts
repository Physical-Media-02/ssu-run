// ===== p5.js 게임 메인 파일 =====
// SSU-RUN: 쿠키런 스타일의 무한 러닝 게임

import p5 from "p5";

// 게임 시스템 매니저 임포트
import ScoreManager from "./systems/score"; // 점수 관리
import HealthManager from "./systems/health_manager"; // 체력 관리
import drawScoreUI from "./systems/score_ui"; // 점수 UI 렌더링
import { Player } from "./systems/player"; // 플레이어 캐릭터
import { Obstacle } from "./systems/obstacle"; // 장애물
import { ObstacleManager } from "./systems/obstacle_manager"; // 장애물 관리
import { PowerUp } from "./systems/power_up"; // 파워업 아이템
import { PowerUpManager } from "./systems/power_up_manager"; // 파워업 관리
import { HealthRecovery } from "./systems/health_recovery"; // 체력 회복 아이템
import { HealthRecoveryManager } from "./systems/health_recovery_manager"; // 체력 회복 관리
import { Platform } from "./systems/platform"; // 플랫폼(땅)
import { PlatformManager } from "./systems/platform_manager"; // 플랫폼 관리
import { World } from "./systems/world"; // 월드 스크롤 관리
import { level1 } from "./level"; // 레벨 데이터

// ===== 전역 상수 =====
// 이미지 경로 (Vite의 base path를 사용하여 환경별 자동 설정)
const ASSET_PATH = `${import.meta.env.BASE_URL}assets`;

// ===== 전역 매니저 인스턴스 =====
const scoreManager = new ScoreManager(); // 점수 관리
const healthManager = new HealthManager(100); // 체력 관리 (초기 체력: 100)

// ===== 이미지 맵 인터페이스 =====
// 게임에서 사용하는 모든 이미지 에셋을 정의
interface ImageMap {
  background: p5.Image | null; // 배경 이미지
  obstacleBottom: p5.Image[]; // 하단 장애물 이미지 배열
  obstacleTop: p5.Image[]; // 상단 장애물 이미지 배열
  powerUp: p5.Image | null; // 파워업 아이템 이미지
  healthRecovery: p5.Image | null; // 체력 회복 아이템 이미지
  character: p5.Image | null; // 캐릭터 기본 이미지
  characterPowerUp: p5.Image | null; // 캐릭터 거대화 이미지
  characterSlide: p5.Image | null; // 캐릭터 슬라이드 이미지
  endingWin: p5.Image | null; // 승리 화면 이미지
  endingOver: p5.Image | null; // 패배 화면 이미지
  main: p5.Image | null; // 메인 화면 이미지
  help: p5.Image | null; // 도움말 화면 이미지
  boss: p5.Image | null; // 보스(교수님) 기본 이미지
  bossRun: p5.Image | null; // 보스(교수님) 달리기 이미지
  btnStart: p5.Image | null; // 시작 버튼 이미지
  btnHelp: p5.Image | null; // 도움말 버튼 이미지
  btnClose: p5.Image | null; // 닫기 버튼 이미지
  btnHome: p5.Image | null; // 홈 버튼 이미지
  btnRetry: p5.Image | null; // 재시작 버튼 이미지
  endingPoint: p5.Image | null; // 엔딩 깃발 이미지
  endingCredit: p5.Image | null; // 크레딧 화면 이미지
  logoWhite: p5.Image | null; // 흰색 로고 이미지
  logoBlack: p5.Image | null; // 검은색 로고 이미지
}

let images: ImageMap; // 로드된 이미지들을 저장
let assetsLoaded = false; // 모든 에셋 로드 완료 여부

// ===== 오디오 시스템 =====
// 게임에서 사용하는 모든 오디오(배경음악 + 효과음)를 정의
interface AudioMap {
  bgmHome: HTMLAudioElement | null; // 홈/도움말 화면 배경음악
  bgmGame: HTMLAudioElement | null; // 게임 플레이 배경음악
  bgmWin: HTMLAudioElement | null; // 승리 화면 배경음악
  bgmOver1: HTMLAudioElement | null; // 게임오버 첫번째 음악
  bgmOver2: HTMLAudioElement | null; // 게임오버 두번째 음악
  sfxJump: HTMLAudioElement | null; // 점프 효과음
  sfxHealth: HTMLAudioElement | null; // 체력 회복 효과음
  sfxPowerUp: HTMLAudioElement | null; // 파워업 획득 효과음
  sfxObstacle: HTMLAudioElement | null; // 장애물 충돌 효과음
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

let currentBgm: HTMLAudioElement | null = null; // 현재 재생 중인 배경음악
let lastScreen: GameScreen | null = null; // 이전 화면 상태
let audioInitialized = false; // 사용자 첫 상호작용 후 오디오 활성화 (브라우저 자동재생 제한 우회)

/**
 * 오디오 파일을 로드하는 함수
 * @param src - 오디오 파일 경로
 * @returns HTMLAudioElement 객체
 */
function loadSound(src: string): HTMLAudioElement {
  const audio = new Audio(src);
  audio.preload = "auto";
  return audio;
}

/**
 * 배경음악을 재생하는 함수
 * @param audio - 재생할 오디오 객체
 * @param loop - 반복 재생 여부 (기본값: true)
 */
function playBgm(audio: HTMLAudioElement | null, loop: boolean = true) {
  if (!audio) return;
  if (currentBgm === audio && !audio.paused) return; // 같은 음악이 이미 재생 중이면 스킵
  
  stopCurrentBgm();
  audio.loop = loop;
  audio.currentTime = 0;
  audio.play().catch(e => console.log("BGM play failed:", e));
  currentBgm = audio;
}

/**
 * 현재 재생 중인 배경음악을 중지하는 함수
 */
function stopCurrentBgm() {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }
}

/**
 * 효과음을 재생하는 함수
 * @param audio - 재생할 효과음 객체
 */
function playSfx(audio: HTMLAudioElement | null) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(e => console.log("SFX play failed:", e));
}

/**
 * 게임 오버 시퀀스 재생 (ending_over_1.mp3 종료 후 ending_over_2.mp3 자동 재생)
 */
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

// ===== 게임 화면 타입 =====
// start: 메인 화면, help: 도움말, playing: 게임 플레이, credit: 크레딧, won: 승리, lost: 패배
type GameScreen = "start" | "help" | "playing" | "credit" | "won" | "lost";

// ===== p5.js 메인 스케치 함수 =====
const sketch = (p: p5) => {
  // ===== 게임 상태 변수 =====
  let currentScreen: GameScreen = "start"; // 현재 화면 상태
  let player: Player; // 플레이어 객체
  let obstacleManager: ObstacleManager; // 장애물 관리자
  let powerUpManager: PowerUpManager; // 파워업 관리자
  let healthRecoveryManager: HealthRecoveryManager; // 체력 회복 관리자
  let platformManager: PlatformManager; // 플랫폼 관리자
  let world: World; // 월드 스크롤 관리자

  // Level-specific state
  // ===== 레벨 진행 상태 =====
  let nextPlatformIndex = 0; // 다음에 생성할 플랫폼 인덱스
  let nextObstacleIndex = 0; // 다음에 생성할 장애물 인덱스
  let nextPowerUpIndex = 0; // 다음에 생성할 파워업 인덱스
  let nextHealthRecoveryIndex = 0; // 다음에 생성할 체력 회복 인덱스

  // ===== 버튼 상태 =====
  // 화면에 표시되는 버튼들의 정보를 저장
  let buttons: {
    x: number; // 버튼 X 좌표
    y: number; // 버튼 Y 좌표
    width: number; // 버튼 너비
    height: number; // 버튼 높이
    label: string; // 버튼 텍스트 (사용 안 함)
    action: () => void; // 버튼 클릭 시 실행할 함수
    image?: p5.Image | null; // 버튼 이미지
  }[] = [];

  // ===== 점수 상태 =====
  let lastScoreTime = 0; // 마지막 점수 부여 시간
  const scoreInterval = 1000; // 점수 부여 간격 (1초)

  // ===== 보스(professor) 상태 =====
  let bossVisible = false; // 보스 표시 여부
  let bossX = -200; // 보스 X 좌표 (화면 밖에서 시작)

  // ===== 마이크 상태 (마이크 파워업 기능) =====
  let micEnabled = false; // 마이크 활성화 여부
  let audioContext: AudioContext | null = null; // Web Audio API 컨텍스트
  let analyser: AnalyserNode | null = null; // 오디오 분석 노드
  let microphone: MediaStreamAudioSourceNode | null = null; // 마이크 입력 소스
  let micDataArray: Uint8Array<ArrayBuffer> | null = null; // 주파수 데이터 배열
  const MIC_THRESHOLD = 50; // 데시벨 임계값 (0-255 범위, 이 값 이상일 때 점프 발동)

  // ===== 입력 상태 =====
  let isDownKeyPressed = false; // DOWN 키 누름 상태 (슬라이드 동작 제어)

  // ===== 크레딧 화면 상태 =====
  let creditStartTime = 0; // 크레딧 화면 시작 시간
  const CREDIT_DURATION = 5000; // 크레딧 화면 표시 시간 (5초)

  /**
   * 게임을 초기화하고 새로 시작하는 함수
   * 플레이어, 매니저, 점수, 체력 등 모든 게임 상태를 초기화
   */
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

    // 레벨 진행 상태 초기화
    nextPlatformIndex = 0;
    nextObstacleIndex = 0;
    nextPowerUpIndex = 0;
    nextHealthRecoveryIndex = 0;

    // 점수 및 체력 초기화
    scoreManager.resetScore();
    healthManager.resetHealth();

    // 보스 상태 초기화
    bossVisible = false;
    bossX = -200;

    lastScoreTime = p.millis();
  }

  /**
   * 마이크를 초기화하고 Web Audio API를 설정하는 함수
   * 사용자의 마이크 권한을 요청하고 오디오 분석기를 설정
   */
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

  /**
   * 마이크 볼륨을 측정하는 함수
   * @returns 현재 마이크 볼륨 평균값 (0-255 범위)
   */
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

  /**
   * 버튼 객체를 생성하는 함수
   * @param x - 버튼 X 좌표
   * @param y - 버튼 Y 좌표
   * @param width - 버튼 너비
   * @param height - 버튼 높이
   * @param label - 버튼 텍스트 (이미지 버튼의 경우 사용 안 함)
   * @param action - 버튼 클릭 시 실행할 함수
   * @param image - 버튼 이미지 (선택적)
   */
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

  /**
   * 버튼을 화면에 그리는 함수
   * 호버 효과와 이미지/텍스트 버튼 렌더링 처리
   * @param button - 그릴 버튼 객체
   */
  function drawButton(button: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    image?: p5.Image | null;
  }) {
    // 마우스 호버 감지
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

  /**
   * 시작 화면을 표시하는 함수
   * 메인 이미지와 게임 시작/도움말 버튼을 표시
   */
  function showStartScreen() {
    p.background(26, 26, 46); // #1a1a2e

    // 메인 이미지 표시
    if (images.main) {
      const imgWidth = 800;
      const imgHeight = (imgWidth / images.main.width) * images.main.height;
      p.image(images.main, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }

    // 버튼 생성: 게임 시작, 도움말
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

  /**
   * 도움말 화면을 표시하는 함수
   * 도움말 이미지와 돌아가기 버튼, 로고를 표시
   */
  function showHelpScreen() {
    p.background(26, 26, 46); // #1a1a2e

    // 도움말 이미지 표시
    if (images.help) {
      const imgWidth = 1000;
      const imgHeight = (imgWidth / images.help.width) * images.help.height;
      p.image(images.help, p.width / 2 - imgWidth / 2, 50, imgWidth, imgHeight);
    }

    // 돌아가기 버튼 생성
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
    
    // 로고 추가 (좌측 상단)
    drawLogo(images.logoWhite, "topLeft");
  }

  /**
   * 승리 화면을 표시하는 함수
   * 승리 이미지, 최종 점수, 다시 시작/메인 화면 버튼을 표시
   */
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
    
    // 로고 추가 (좌측 상단)
    drawLogo(images.logoWhite, "topLeft");
  }

  /**
   * 패배 화면을 표시하는 함수
   * 패배 이미지, 최종 점수, 다시 시작/메인 화면 버튼을 표시
   */
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

    // 버튼 생성: 다시 시작, 메인 메뉴
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
    
    // 로고 추가 (좌측 상단)
    drawLogo(images.logoWhite, "topLeft");
  }

  /**
   * 크레딧 화면을 표시하는 함수
   * 승리 전에 5초간 크레딧 이미지를 표시한 후 자동으로 승리 화면으로 전환
   */
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

    // 5초 후 승리 화면으로 자동 전환
    if (p.millis() - creditStartTime >= CREDIT_DURATION) {
      currentScreen = "won";
    }

    // 버튼 없음 (자동 전환)
    buttons = [];
  }

  /**
   * p5.js setup 함수
   * 캠버스 생성, 이미지/오디오 로드, 초기 화면 설정
   */
  p.setup = () => {
    p.createCanvas(800, 600);

    // ===== 이미지 로드 =====
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
      logoWhite: null,
      logoBlack: null,
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
    const totalImages = 28; // 배경 1 + 하단 장애물 4 + 상단 장애물 3 + 파워업 1 + 체력 1 + 캐릭터 3 + 엔딩 2 + 메인 1 + 도움말 1 + 보스 2 + 버튼 5 + 깃발 1 + 크레딧 1 + 로고 2

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

    p.loadImage(
      `${ASSET_PATH}/logo_white.png`,
      (img) => {
        images.logoWhite = img;
        console.log(`logo_white size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load logo_white image:", event);
        checkAllLoaded();
      }
    );

    p.loadImage(
      `${ASSET_PATH}/logo_black.png`,
      (img) => {
        images.logoBlack = img;
        console.log(`logo_black size: ${img.width}x${img.height}`);
        checkAllLoaded();
      },
      (event) => {
        console.error("Failed to load logo_black image:", event);
        checkAllLoaded();
      }
    );
  };

  /**
   * 로고를 화면에 그리는 함수
   * @param logo - 그릴 로고 이미지
   * @param position - 로고 위치 ("topLeft" 또는 "topRight")
   */
  /**
   * 로고를 화면에 그리는 함수
   * @param logo - 그릴 로고 이미지
   * @param position - 로고 위치 ("topLeft" 또는 "topRight")
   */
  function drawLogo(logo: p5.Image | null, position: "topLeft" | "topRight") {
    if (!logo) return;
    
    const logoWidth = 150; // 로고 너비
    const logoHeight = (logoWidth / logo.width) * logo.height; // 비율 유지하며 높이 계산
    const margin = 50; // 화면 가장자리로부터의 여백
    
    // 위치에 따라 X 좌표 계산
    let x: number;
    if (position === "topLeft") {
      x = margin;
    } else {
      x = p.width - logoWidth - margin + 20;
    }
    
    p.push();
    p.image(logo, x, margin, logoWidth, logoHeight);
    p.pop();
  }

  /**
   * 화면 좌상단에 체력 바를 그리는 함수
   * 현재 체력/최대 체력을 빨간색 바와 텍스트로 표시
   */
  function drawHealthBar() {
    const health = healthManager.getCurrentHealth();
    const maxHealth = healthManager.getMaxHealth();
    const healthBarWidth = (health / maxHealth) * 200; // 체력 바 최대 너비 200px

    p.push();
    p.stroke(0);
    p.strokeWeight(2);

    // 체력 바 배경 (회색)
    p.fill(100);
    p.rect(20, 20, 200, 20);

    // 현재 체력 (빨간색)
    p.fill(255, 0, 0);
    p.rect(20, 20, healthBarWidth, 20);

    // 체력 텍스트 표시
    p.noStroke();
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(14);
    p.text(`${health} / ${maxHealth}`, 120, 30);
    p.pop();
  }

  /**
   * p5.js draw 함수 (매 프레임마다 호출됨)
   * 화면 상태에 따라 적절한 화면을 표시하고 게임 로직을 처리
   */
  p.draw = () => {
    // 에셋 로딩 중일 때
    if (!assetsLoaded) {
      p.background(100);
      p.fill(255);
      p.textAlign(p.CENTER, p.CENTER);
      p.text("Loading...", p.width / 2, p.height / 2);
      return;
    }

    // ===== 화면 전환 시 배경음악 처리 =====
    // 오디오가 초기화되고 화면이 변경되었을 때 적절한 BGM을 재생
    if (audioInitialized && currentScreen !== lastScreen) {
      if (currentScreen === "start" || currentScreen === "help") {
        // 홈/도움말 화면: home.mp3 (서로 전환 시 재시작 안 함)
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
        // 승리 화면: credit에서 이미 재생 중이면 유지
        if (lastScreen !== "credit") {
          playBgm(sounds.bgmWin, true);
        }
      } else if (currentScreen === "lost") {
        // 패배: ending_over_1.mp3 종료 후 ending_over_2.mp3 순차 재생
        playGameOverSequence();
      }
      lastScreen = currentScreen;
    }

    // ===== 화면 라우팅 =====
    // 현재 화면 상태에 따라 적절한 화면을 표시
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

    // ===== 게임 플레이 화면 =====
    if (currentScreen !== "playing") return;

    // 월드 및 플레이어 업데이트
    world.update();
    player.update(platformManager.platforms);

    // ===== 슬라이딩 입력 처리 =====
    // DOWN 키가 눌려있고 착지 상태일 때 즉시 슬라이딩
    if (
      isDownKeyPressed &&
      player.isOnGround &&
      !player.isSliding &&
      !player.isGiant
    ) {
      player.startSlide();
    }

    // ===== 마이크 파워업 기능 =====
    // 마이크 입력이 임계값을 초과하면 거대화 활성화
    if (micEnabled) {
      const volume = getMicVolume();
      if (volume > MIC_THRESHOLD) {
        if (!player.isGiant) {
          player.activateGiant(60); // 짧은 지속시간 (매 프레임 갱신됨)
        } else {
          // 이미 거대화 상태면 타이머 갱신
          player.activateGiant(60);
        }
      }
    }

    // ===== 시간 경과에 따른 점수 증가 =====
    // 1초마다 1점씩 점수 부여
    const currentTime = p.millis();
    if (currentTime - lastScoreTime > scoreInterval) {
      scoreManager.updateScore(1);
      lastScoreTime = currentTime;
    }

    // ===== 레벨 데이터로부터 오브젝트 생성 =====
    // 화면에 들어오는 시점에 플랫폼, 장애물, 아이템 등을 생성
    
    // 플랫폼 생성
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
    // 장애물 생성
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
        // 이미지 표시 크기는 크게, 충돌 박스는 50%로 설정
        const displayWidth = 120;
        const displayHeight = 100;
        const hitboxScale = 0.5;
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
    // 파워업 아이템 생성 (거대화)
    if (
      nextPowerUpIndex < level1.powerUps.length &&
      level1.powerUps[nextPowerUpIndex].x < world.worldX + p.width
    ) {
      const powerUpData = level1.powerUps[nextPowerUpIndex];
      const displayWidth = 120;
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
    
    // 체력 회복 아이템 생성
    if (
      nextHealthRecoveryIndex < level1.healthRecoveries.length &&
      level1.healthRecoveries[nextHealthRecoveryIndex].x <
        world.worldX + p.width
    ) {
      const healthRecoveryData =
        level1.healthRecoveries[nextHealthRecoveryIndex];
      const displayWidth = 120;
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

    // ===== 모든 오브젝트 위치 업데이트 =====
    // 월드 스크롤에 따라 모든 게임 오브젝트의 위치 갱신
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

    // ===== 충돌 감지 및 처리 =====
    
    // 장애물 충돌 처리
    for (let i = obstacleManager.obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacleManager.obstacles[i];
      if (player.collidesWith(obstacle)) {
        if (player.isGiant) {
          // 거대화 상태: 장애물 파괴 + 점수 획듍
          scoreManager.updateScore(100);
          playSfx(sounds.sfxObstacle); // 장애물 부딪힘 효과음
          obstacleManager.obstacles.splice(i, 1);
        } else {
          // 일반 상태: 데미지 25 받음
          healthManager.takeDamage(25);
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

    // ===== 화면 렌더링 =====
    
    // 배경 이미지 그리기 (패럴랙스 스크롤링)
    if (images.background) {
      const bgWidth = images.background.width;
      // 패럴랙스 효과: 배경은 월드보다 50% 느리게 스크롤
      const parallaxX = world.worldX * 0.5;
      const startX = -(parallaxX % bgWidth);

      for (let x = startX; x < p.width; x += bgWidth) {
        p.image(images.background, x, 0, bgWidth, p.height);
      }
    } else {
      p.background(220); // 배경 이미지가 없으면 단색 배경
    }

    // ===== 보스(professor) 메커닉 =====
    // 플레이어 체력에 따라 보스가 등장하고 쫓아오는 기능
    const healthPercent =
      healthManager.getCurrentHealth() / healthManager.getMaxHealth();
    const playerX = 100; // 플레이어 고정 X 위치

    if (healthPercent <= 0.25) {
      // 체력 25% 이하: 보스가 플레이어 바로 뒤에서 쫓아옴 (긴박감 연출)
      bossVisible = true;
      const targetX = playerX - 80;
      bossX += (targetX - bossX) * 0.1; // 빠르게 접근
    } else if (healthPercent <= 0.5) {
      // 체력 50% 이하: 보스 등장 (화면 왼쪽 가장자리에서)
      bossVisible = true;
      const targetX = -50;
      bossX += (targetX - bossX) * 0.05; // 천천히 접근
    } else {
      // 체력 50% 초과: 보스가 자연스럽게 화면 밖으로 사라짐
      const targetX = -250;
      bossX += (targetX - bossX) * 0.03; // 아주 천천히 퇴장
      if (bossX <= -240) {
        bossVisible = false;
      }
    }

    // ===== 보스 렌더링 =====
    // bossX가 화면 안에 있으면 그리기 (자연스러운 등장/퇴장)
    if (bossVisible || bossX > -240) {
      const bossWidth = 240;
      const bossHeight = 120;
      const bossY = p.height * 0.75 - bossHeight; // 바닥 위

      // 체력에 따라 다른 이미지 사용
      let bossImage: p5.Image | null = null;
      if (healthPercent <= 0.25) {
        bossImage = images.bossRun; // 체력 25% 이하: 달리기 이미지
      } else {
        bossImage = images.boss; // 그 외: 기본 이미지
      }

      if (bossImage) {
        p.image(bossImage, bossX, bossY, bossWidth, bossHeight);
      }
    }

    // ===== 게임 오브젝트 렌더링 =====
    player.draw(p);
    obstacleManager.draw();
    powerUpManager.draw();
    healthRecoveryManager.draw();
    platformManager.draw();

    // ===== 엔딩 포인트(깃발) 렌더링 및 충돌 처리 =====
    const flagData = level1.endingPoint;
    const flagX = flagData.x - world.worldX; // 깃발의 화면상 X 좌표
    const flagWidth = flagData.width || 150;
    const flagHeight = flagData.height || 200;
    const flagY = p.height * 0.75 - flagHeight; // 바닥 위에 배치

    // 깃발이 화면 안에 있을 때만 그리기
    if (flagX < p.width + flagWidth && flagX > -flagWidth) {
      if (images.endingPoint) {
        p.image(images.endingPoint, flagX, flagY, flagWidth, flagHeight);
      } else {
        // 이미지 없으면 기본 도형 (폴백)
        p.fill(255, 215, 0);
        p.rect(flagX, flagY, flagWidth, flagHeight);
      }
    }

    // 깃발과 플레이어 충돌 체크 (클리어 조건)
    const playerHitbox = player.getHitbox();
    const hitboxScale = flagData.hitboxScale || 0.4; // level.ts에서 설정한 히트박스 비율 (40%)
    const hitboxWidth = flagWidth * hitboxScale;
    const hitboxHeight = flagHeight * hitboxScale;
    const flagHitbox = {
      x: flagX + (flagWidth - hitboxWidth) / 2, // 중앙 정렬
      y: flagY + (flagHeight - hitboxHeight) / 2,
      width: hitboxWidth,
      height: hitboxHeight,
    };

    // AABB (Axis-Aligned Bounding Box) 충돌 감지
    const collidesWithFlag =
      playerHitbox.x < flagHitbox.x + flagHitbox.width &&
      playerHitbox.x + playerHitbox.width > flagHitbox.x &&
      playerHitbox.y < flagHitbox.y + flagHitbox.height &&
      playerHitbox.y + playerHitbox.height > flagHitbox.y;

    // ===== UI 렌더링 =====
    drawScoreUI(p, scoreManager); // 점수 표시
    drawHealthBar(); // 체력 바 표시
    
    // 로고 표시 (우측 상단, 검정 로고)
    drawLogo(images.logoBlack, "topRight");

    // ===== 마이크 볼륨 바 표시 =====
    // 마이크 활성화 시 현재 볼륨과 임계값을 시각적으로 표시
    if (micEnabled) {
      const volume = getMicVolume(); // 현재 마이크 볼륨 측정
      const maxVolume = 255; // 최대 볼륨
      const volumeBarWidth = (volume / maxVolume) * 150; // 볼륨 바 너비 계산

      p.push();
      p.noStroke();

      // 볼륨 바 배경
      p.fill(50, 50, 50, 150);
      p.rect(p.width - 170, 20, 150, 20, 5);

      // 볼륨 바 (임계값 초과 여부에 따라 색상 변경)
      if (volume > MIC_THRESHOLD) {
        p.fill(255, 200, 0); // 노란색: 파워업 활성화
      } else {
        p.fill(100, 200, 100); // 초록색: 일반 상태
      }
      p.rect(p.width - 170, 20, volumeBarWidth, 20, 5);

      // 임계값 표시 선 (빨간색 세로선)
      const thresholdX = p.width - 170 + (MIC_THRESHOLD / maxVolume) * 150;
      p.stroke(255, 0, 0);
      p.strokeWeight(2);
      p.line(thresholdX, 18, thresholdX, 42);

      // 마이크 아이콘 표시
      p.noStroke();
      p.fill(255);
      p.textSize(12);
      p.textAlign(p.RIGHT, p.CENTER);
      p.text("🎤", p.width - 175, 30);
      p.pop();
    }

    // ===== 게임 상태 체크 =====
    // 승리 조건: 깃발과 충돌
    if (collidesWithFlag) {
      currentScreen = "credit"; // 크레딧 화면으로 이동
      creditStartTime = p.millis(); // 크레딧 시작 시간 기록
    }
    
    // 패배 조건 1: 플레이어가 화면 아래로 떨어짐
    if (player.isDead()) {
      currentScreen = "lost";
    }
    
    // 패배 조건 2: 체력이 0 이하
    if (healthManager.isDead()) {
      currentScreen = "lost";
    }
  };

  /**
   * 키보드 키 누름 이벤트 핸들러
   * UP 화살표: 점프, DOWN 화살표: 슬라이드 시작
   */
  p.keyPressed = () => {
    if (currentScreen === "playing") {
      // UP_ARROW = 38, DOWN_ARROW = 40
      if (p.keyCode === 38) {
        // UP 화살표: 점프
        if (player.isOnGround) {
          playSfx(sounds.sfxJump); // 점프 효과음 (지면에 있을 때만 재생)
        }
        player.jump();
      } else if (p.keyCode === 40) {
        // DOWN 화살표: 슬라이드 시작
        isDownKeyPressed = true;
        player.startSlide();
      }
    }
  };

  /**
   * 키보드 키 떼 이벤트 핸들러
   * DOWN 화살표 떼: 슬라이드 종료
   */
  p.keyReleased = () => {
    if (currentScreen === "playing") {
      if (p.keyCode === 40) {
        // DOWN 화살표 떼: 슬라이드 종료
        isDownKeyPressed = false;
        player.endSlide();
      }
    }
  };

  /**
   * 마우스 클릭 이벤트 핸들러
   * 1. 첫 클릭 시 오디오 시스템 활성화 (브라우저 autoplay 정책 우회)
   * 2. 버튼 클릭 감지 및 실행
   */
  p.mousePressed = () => {
    // 첫 클릭 시 오디오 활성화 (브라우저 자동재생 정책 우회)
    if (!audioInitialized && assetsLoaded) {
      audioInitialized = true;
      // 현재 화면에 맞는 음악 재생
      if (currentScreen === "start" || currentScreen === "help") {
        playBgm(sounds.bgmHome, true);
      }
    }

    // 버튼 클릭 감지 및 액션 실행
    buttons.forEach((button) => {
      if (
        p.mouseX > button.x &&
        p.mouseX < button.x + button.width &&
        p.mouseY > button.y &&
        p.mouseY < button.y + button.height
      ) {
        button.action(); // 버튼의 액션 함수 호출
      }
    });
  };
};

// ===== p5.js 인스턴스 생성 =====
// DOM 로드 완료 시 p5.js 스케치 시작
window.addEventListener("DOMContentLoaded", () => {
  new p5(sketch);
});
