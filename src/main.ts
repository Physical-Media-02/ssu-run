import p5 from "p5";

import ScoreManager from "./systems/score";
import HealthManager from "./systems/health_manager";
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

  function resetGame() {
    player = new Player(p);
    obstacleManager = new ObstacleManager(p);
    powerUpManager = new PowerUpManager(p);
    platformManager = new PlatformManager(p);
    world = new World();
    
    // Reset level progress
    nextPlatformIndex = 0;
    nextObstacleIndex = 0;
    nextPowerUpIndex = 0;
    
    // Reset managers
    scoreManager.resetScore();
    healthManager.resetHealth();

    lastScoreTime = p.millis();
    gameStatus = "playing";
  }

  p.setup = () => {
    p.createCanvas(800, 600);
    resetGame();

    // Re-attach the reset button listener to call resetGame
    document.getElementById("reset-button")!.onclick = () => {
        resetGame();
    };
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

new p5(sketch);