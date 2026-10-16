import { useEffect, useRef } from 'react';

interface Sparkle {
  x: number;
  y: number;
  size: number;
  life: number;
  vx: number;
  vy: number;
  rotation: number;
  type: number;
}

const MAX_SPARKLES = 10;

export default function TouchTrail({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const rafRef = useRef<number | null>(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawStar = (x: number, y: number, size: number, rotation: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#FF7A9A';
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.lineTo(Math.cos(angle + Math.PI / 4) * size * 0.4, Math.sin(angle + Math.PI / 4) * size * 0.4);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (x: number, y: number, size: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#F0537D';
      ctx.beginPath();
      ctx.moveTo(0, size * 0.3);
      ctx.bezierCurveTo(-size, -size * 0.3, -size * 0.5, -size, 0, -size * 0.5);
      ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.3, 0, size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activeRef.current || prefersReduced) return;
      if (sparklesRef.current.length >= MAX_SPARKLES) return;
      sparklesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        size: 4 + Math.random() * 6,
        life: 1,
        vx: (Math.random() - 0.5) * 2,
        vy: -1 - Math.random() * 2,
        rotation: Math.random() * Math.PI,
        type: Math.random() > 0.5 ? 0 : 1,
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparklesRef.current = sparklesRef.current.filter((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.04;
        s.vy += 0.05;
        s.rotation += 0.02;

        if (s.life <= 0) return false;

        if (s.type === 0) {
          drawStar(s.x, s.y, s.size, s.rotation, s.life);
        } else {
          drawHeart(s.x, s.y, s.size, s.life);
        }
        return true;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-40"
      aria-hidden="true"
    />
  );
}
