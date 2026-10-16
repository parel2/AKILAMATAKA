import { useEffect, useRef } from 'react';

type Intensity = 'off' | 'low' | 'burst';

interface ParticleLayerProps {
  intensity: Intensity;
  color?: string;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
  opacity: number;
  swayPhase: number;
  swayAmp: number;
  life: number;
}

const MAX_MOBILE = 24;
const MAX_DESKTOP = 40;

export default function ParticleLayer({ intensity, color = '#FFA3B8' }: ParticleLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intensityRef = useRef<Intensity>(intensity);
  const petalsRef = useRef<Petal[]>([]);
  const rafRef = useRef<number | null>(null);
  const burstRef = useRef<boolean>(false);

  useEffect(() => {
    intensityRef.current = intensity;
    if (intensity === 'burst') {
      burstRef.current = true;
    }
  }, [intensity]);

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

    const isDesktop = window.innerWidth >= 768;
    const maxParticles = isDesktop ? MAX_DESKTOP : MAX_MOBILE;

    const createPetal = (): Petal => ({
      x: Math.random() * canvas.width,
      y: -30,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.5 + Math.random() * 1.2,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      size: 8 + Math.random() * 10,
      opacity: 0.4 + Math.random() * 0.4,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.5 + Math.random() * 1.5,
      life: 1,
    });

    const drawPetal = (p: Petal) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity * p.life;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let lastSpawn = 0;
    let frameCount = 0;

    const animate = (time: number) => {
      const current = intensityRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (prefersReduced && current !== 'burst') {
        rafRef.current = requestAnimationFrame(animate);
        return;
      }

      // Spawn petals
      if (current === 'low' || (current === 'burst' && burstRef.current)) {
        const spawnRate = current === 'burst' ? 80 : 400;
        if (time - lastSpawn > spawnRate && petalsRef.current.length < maxParticles) {
          petalsRef.current.push(createPetal());
          lastSpawn = time;
        }
      }

      // Burst mode: spawn lots at once
      if (burstRef.current && current === 'burst') {
        for (let i = 0; i < 15 && petalsRef.current.length < maxParticles; i++) {
          petalsRef.current.push(createPetal());
        }
        if (frameCount > 60) {
          burstRef.current = false;
          intensityRef.current = 'low';
        }
      }

      // Update and draw
      petalsRef.current = petalsRef.current.filter((p) => {
        p.x += p.vx + Math.sin(time * 0.001 + p.swayPhase) * p.swayAmp * 0.3;
        p.y += p.vy;
        p.rotation += p.vr;

        if (p.y > canvas.height + 30) {
          p.life -= 0.05;
        }

        if (p.life <= 0) return false;

        drawPetal(p);
        return true;
      });

      frameCount++;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-30"
      aria-hidden="true"
    />
  );
}
