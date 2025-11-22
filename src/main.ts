import p5 from "p5";

import ScoreManager from "./systems/score";
import drawScoreUI from "./systems/score_ui";
import { Player } from "./systems/player";
import { Obstacle } from "./systems/obstacle";
import { ObstacleManager } from "./systems/obstacle_manager";
import { PowerUp } from "./systems/power_up";
import { PowerUpManager } from "./systems/power_up_manager";
import { Platform } from "./systems/platform";
import { PlatformManager } from "./systems/platform_manager";
import { World } from "./systems/world";
import { level1 } from "./level";

const scoreManager = new ScoreManager();
document.getElementById("reset-button")?.addEventListener("click", () => {
  scoreManager.resetScore();
  // We would also need to reset the game state here
});
document.getElementById("add-button")?.addEventListener("click", () => {
  scoreManager.updateScore(Math.floor(Math.random() * 11) + 10);
});

const sketch = (p: p5) => {
  let player: Player;
  let obstacleManager: ObstacleManager;
  let powerUpManager: PowerUpManager;
  let platformManager: PlatformManager;
  let world: World;

  // Level-specific state
  let nextPlatformIndex = 0;
  let nextObstacleIndex = 0;
  let nextPowerUpIndex = 0;
  let gameStatus: "playing" | "won" | "lost" = "playing";

  // Scoring state
  let lastScoreTime = 0;
  const scoreInterval = 1000; // 1 second

  p.setup = () => {
    p.createCanvas(800, 600);
    player = new Player(p);
    obstacleManager = new ObstacleManager(p);
    powerUpManager = new PowerUpManager(p);
    platformManager = new PlatformManager(p);
    world = new World();
    lastScoreTime = p.millis();
  };

  p.draw = () => {
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
      obstacleManager.obstacles.push(new Obstacle(p, obstacleData.x));
      nextObstacleIndex++;
    }
    if (nextPowerUpIndex < level1.powerUps.length && level1.powerUps[nextPowerUpIndex].x < world.worldX + p.width) {
      const powerUpData = level1.powerUps[nextPowerUpIndex];
      powerUpManager.powerUps.push(new PowerUp(p, powerUpData.x));
      nextPowerUpIndex++;
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

    // --- COLLISIONS & CLEANUP ---

    for (let i = obstacleManager.obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacleManager.obstacles[i];
      if (player.collidesWith(obstacle)) {
        if (player.isGiant) {
          scoreManager.updateScore(100);
          obstacleManager.obstacles.splice(i, 1);
        } else {
          gameStatus = "lost"; // Game over on collision
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
    for (let i = platformManager.platforms.length - 1; i >= 0; i--) {
        if (platformManager.platforms[i].isOffscreen()) {
            platformManager.platforms.splice(i, 1);
        }
    }


    // --- DRAWING ---
    p.background(220);
    player.draw(p);
    obstacleManager.draw();
    powerUpManager.draw();
    platformManager.draw();
    drawScoreUI(p, scoreManager);

    // --- STATE CHECKS ---
    if (world.worldX >= level1.length) {
      gameStatus = "won";
    }
    if (player.isDead()) {
      gameStatus = "lost";
    }
  };

  p.keyPressed = () => {
    if (p.keyCode === 32) { // 32 is the keycode for SPACE
      player.jump();
    }
  };
};

new p5(sketch);
