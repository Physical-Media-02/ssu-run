import p5 from "p5";

import ScoreManager from "./systems/score";
import drawScoreUI from "./systems/score_ui";

const scoreManager = new ScoreManager();
document.getElementById("reset-button")?.addEventListener("click", () => {
  scoreManager.resetScore();
});
document.getElementById("add-button")?.addEventListener("click", () => {
  scoreManager.updateScore(Math.floor(Math.random() * 11) + 10);
});

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(800, 600);
  };

  p.draw = () => {
    p.background(220);

    drawScoreUI(p, scoreManager);
  };
};

new p5(sketch);
