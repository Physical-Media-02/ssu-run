import p5 from "p5";

import ScoreManager from "./score";

export default function drawScoreUI(p: p5, scoreManager: ScoreManager) {
  p.fill(255, 255, 255);
  // p.rect(50, 50, 65, 50);

  // getScore()를 한 번만 호출하여 재사용
  const score = scoreManager.getScore();

  p.stroke(0); // 테두리색 (검정)
  p.strokeWeight(4); // 테두리 두께
  p.fill(255); // 텍스트 색 (흰색)
  p.textSize(32);
  p.text(`🥕 ${score}`, 355, 80);

  // delta 값 표시 (화면 중앙)
  const deltaDisplay = scoreManager.getDeltaDisplay();
  if (deltaDisplay) {
    const centerX = p.width / 2;
    const centerY = p.height / 2;

    // 텍스트 색상과 투명도 설정
    const alpha = Math.floor(deltaDisplay.opacity * 255);
    const sign = deltaDisplay.value >= 0 ? "+" : "";
    const text = `${sign}${deltaDisplay.value}`;

    // 텍스트 스타일 설정
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(32);
    p.fill(255, 215, 0, alpha); // 금색 계열, 투명도 적용
    p.stroke(0, alpha); // 검정 테두리, 투명도 적용
    p.strokeWeight(3);
    p.text(text, centerX, centerY);
    p.pop();
  }
}
