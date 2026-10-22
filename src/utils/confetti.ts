const COLOR_VARS = ["--purple", "--purple-light", "--cyan", "--text-page"];
const COUNT = 160;
const GRAVITY = 0.25;
const DRAG = 0.985;

export function burst() {
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);
  document.body.appendChild(canvas);

  const style = getComputedStyle(document.documentElement);
  const colors = COLOR_VARS.map((v) => style.getPropertyValue(v).trim());

  const pieces = Array.from({ length: COUNT }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 8 + Math.random() * 10;
    return {
      x: w / 2,
      y: h * 0.85,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 5,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
    };
  });

  const frame = () => {
    ctx.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of pieces) {
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.spin;
      if (p.y > h + 20) {
        continue;
      }
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (alive) {
      requestAnimationFrame(frame);
    } else {
      canvas.remove();
    }
  };
  requestAnimationFrame(frame);
}
