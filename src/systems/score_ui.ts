import p5 from "p5";

import ScoreManager from "./score";

export default function drawScoreUI(p: p5, scoreManager: ScoreManager) {
  p.fill(255, 255, 255);

  const score = scoreManager.getScore();

  p.stroke(0);
  p.strokeWeight(4);
  p.fill(255);
  p.textSize(32);
  p.text(`🥕 ${score}`, 355, 80);

  const deltaDisplay = scoreManager.getDeltaDisplay();
  if (deltaDisplay) {
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    const alpha = Math.floor(deltaDisplay.opacity * 255);
    const sign = deltaDisplay.value >= 0 ? "+" : "";
    const text = `${sign}${deltaDisplay.value}`;

    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255, 215, 0, alpha);
    p.stroke(0, alpha);
    p.strokeWeight(3);
p.text(text, centerX, centerY - 100);
    p.pop();
  }
}
