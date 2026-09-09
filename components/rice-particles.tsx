"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export function RiceParticles({ speed }: { speed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);
      const intensity = Math.min(speedRef.current, 1);
      if (intensity > 0.08 && Math.random() < intensity * 0.72) {
        particles.push({ x: width * 0.49, y: height * 0.67, vx: (Math.random() - 0.62) * 3, vy: 1.5 + Math.random() * 3, life: 1, size: 2 + Math.random() * 2 });
      }
      particles = particles.filter((particle) => particle.life > 0);
      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.life -= 0.018;
        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(Math.atan2(particle.vy, particle.vx));
        context.globalAlpha = particle.life;
        context.fillStyle = "#f6d66f";
        context.beginPath();
        context.ellipse(0, 0, particle.size * 1.8, particle.size * 0.65, 0, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas className="rice-canvas" ref={canvasRef} aria-hidden="true" />;
}
