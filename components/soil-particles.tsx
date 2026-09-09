"use client";

import { useEffect, useRef } from "react";

type Soil = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export function SoilParticles({ active, progress }: { active: boolean; progress: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ active, progress });
  useEffect(() => { stateRef.current = { active, progress }; }, [active, progress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let frame = 0;
    let particles: Soil[] = [];
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);
      if (stateRef.current.active && Math.random() > .3) {
        const origin = width * (.16 + stateRef.current.progress * .55);
        particles.push({ x: origin, y: height * .73, vx: -1.8 - Math.random() * 2.4, vy: -1.5 - Math.random() * 2.5, life: 1, size: 2 + Math.random() * 4 });
      }
      particles = particles.filter((particle) => particle.life > 0);
      for (const particle of particles) {
        particle.x += particle.vx; particle.y += particle.vy; particle.vy += .13; particle.life -= .026;
        context.globalAlpha = particle.life;
        context.fillStyle = Math.random() > .45 ? "#5b351c" : "#8b5a2b";
        context.beginPath(); context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); context.fill();
      }
      context.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas className="soil-canvas" ref={canvasRef} aria-hidden="true" />;
}
