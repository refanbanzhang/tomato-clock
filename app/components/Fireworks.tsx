"use client";

import { useEffect, useRef } from "react";

interface FireworksProps {
  onDone?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface Rocket {
  x: number;
  y: number;
  vy: number;
  targetY: number;
  color: string;
  exploded: boolean;
}

const COLORS = [
  "#14b8a6",
  "#f97316",
  "#f59e0b",
  "#2dd4bf",
  "#ea580c",
  "#0d9488",
  "#fcd34d",
  "#fb7185",
];

const LAUNCH_INTERVAL_MS = 100;
const LAUNCH_COUNT = 18;
const ROCKET_SPEED = 16;
const PARTICLE_SPEED = 7;
const PARTICLE_GRAVITY = 0.08;
const ROCKET_SIZE = 4;
const ROCKET_TRAIL_SIZE = 2.5;
const PLAY_TAIL_MS = 700;
const FADE_DURATION_MS = 1000;

const LAST_LAUNCH_AT_MS = LAUNCH_INTERVAL_MS * (LAUNCH_COUNT - 1);
const FADE_START_MS = LAST_LAUNCH_AT_MS + PLAY_TAIL_MS;

function randomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function createBurst(x: number, y: number, color: string, particles: Particle[]) {
  const count = 72 + Math.floor(Math.random() * 40);
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
    const speed = PARTICLE_SPEED + Math.random() * 9;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 44 + Math.random() * 26,
      color,
      size: 3.2 + Math.random() * 3.5,
    });
  }

  const innerCount = 28 + Math.floor(Math.random() * 16);
  const innerColor = randomColor();
  for (let i = 0; i < innerCount; i++) {
    const angle = (Math.PI * 2 * i) / innerCount + Math.random() * 0.2;
    const speed = 3.5 + Math.random() * 5;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 32 + Math.random() * 18,
      color: innerColor,
      size: 2 + Math.random() * 2.2,
    });
  }
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  alpha: number,
  globalFade: number
) {
  const radius = p.size * alpha;
  const fade = alpha * globalFade;

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = fade * 0.22;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = p.color;
  ctx.globalAlpha = fade;
  ctx.fill();
  ctx.globalAlpha = 1;
}

export default function Fireworks({ onDone }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    let done = false;
    let fadeStartAt = 0;
    let launching = true;
    const startAt = performance.now();
    const rockets: Rocket[] = [];
    const particles: Particle[] = [];

    const getGlobalFade = (now: number) => {
      if (fadeStartAt === 0) return 1;
      const fadeElapsed = now - fadeStartAt;
      const progress = Math.min(fadeElapsed / FADE_DURATION_MS, 1);
      return 1 - progress * progress;
    };

    const shouldFinish = (now: number) => {
      if (fadeStartAt === 0) return false;
      const fadeElapsed = now - fadeStartAt;
      if (fadeElapsed < FADE_DURATION_MS) return false;
      return particles.length === 0 || fadeElapsed >= FADE_DURATION_MS + 300;
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    const launchRocket = () => {
      if (!launching) return;
      const batch = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < batch; i++) {
        const x = canvas.width * (0.08 + Math.random() * 0.84);
        const targetY = canvas.height * (0.1 + Math.random() * 0.45);
        rockets.push({
          x,
          y: canvas.height,
          vy: -(ROCKET_SPEED + Math.random() * 6),
          targetY,
          color: randomColor(),
          exploded: false,
        });
      }
    };

    launchRocket();
    const launchTimers = Array.from({ length: LAUNCH_COUNT - 1 }, (_, i) =>
      window.setTimeout(launchRocket, LAUNCH_INTERVAL_MS * (i + 1))
    );

    const tick = (now: number) => {
      if (done) return;

      const elapsed = now - startAt;
      if (launching && elapsed >= LAST_LAUNCH_AT_MS) {
        launching = false;
      }
      if (fadeStartAt === 0 && elapsed >= FADE_START_MS) {
        fadeStartAt = now;
        launching = false;
      }

      const globalFade = getGlobalFade(now);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const rocket of rockets) {
        if (!rocket.exploded) {
          rocket.y += rocket.vy;
          rocket.vy *= 0.985;

          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y, ROCKET_SIZE, 0, Math.PI * 2);
          ctx.fillStyle = rocket.color;
          ctx.globalAlpha = globalFade;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(rocket.x, rocket.y + 14, ROCKET_TRAIL_SIZE, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.55)";
          ctx.fill();
          ctx.globalAlpha = 1;

          if (rocket.y <= rocket.targetY || rocket.vy >= -2) {
            rocket.exploded = true;
            createBurst(rocket.x, rocket.y, rocket.color, particles);
            if (Math.random() > 0.35) {
              createBurst(
                rocket.x + (Math.random() - 0.5) * 90,
                rocket.y + (Math.random() - 0.5) * 70,
                randomColor(),
                particles
              );
            }
          }
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += PARTICLE_GRAVITY;
        p.vx *= 0.985;
        p.life++;

        const alpha = 1 - p.life / p.maxLife;
        if (alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        drawParticle(ctx, p, alpha, globalFade);
      }

      if (shouldFinish(now)) {
        done = true;
        onDone?.();
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      done = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      launchTimers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="fireworks-canvas"
      aria-hidden="true"
    />
  );
}
