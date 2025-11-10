import p5 from "p5";

const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(800, 600);
  };

  p.draw = () => {
    p.background(220);
    p.fill(255, 0, 0);
    p.ellipse(100, 100, 50, 50);
  };
};

new p5(sketch);
