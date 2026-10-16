import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneShell from '@/components/SceneShell';
import { CONTENT } from '@/data/content';
import { haptics } from '@/core/haptics';
import confetti from 'canvas-confetti';

interface Scene06ScratchProps {
  onDone: () => void;
}

export default function Scene06Scratch({ onDone }: Scene06ScratchProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawingRef = useRef(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const progressCheckRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctxRef.current = ctx;

    // Draw cute scratch surface
    ctx.fillStyle = '#E8D5E0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern
    ctx.fillStyle = '#D4B5C4';
    for (let x = 0; x < canvas.width; x += 20) {
      for (let y = 0; y < canvas.height; y += 20) {
        if ((x / 20 + y / 20) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(x + 10, y + 10, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Add hint text
    ctx.fillStyle = '#B8909E';
    ctx.font = '14px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Gores aku~', canvas.width / 2, canvas.height / 2);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.PointerEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const scratch = (e: React.PointerEvent) => {
    if (revealed) return;
    e.preventDefault();
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const pos = getPos(e);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    if (lastPointRef.current) {
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else {
      ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    lastPointRef.current = pos;
  };

  const checkProgress = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    const step = 40; // sample every Nth pixel for performance
    let total = 0;
    for (let i = 3; i < pixels.length; i += 4 * step) {
      total++;
      if (pixels[i] < 50) transparent++;
    }
    const pct = (transparent / total) * 100;
    setProgress(pct);

    if (pct >= 55 && !revealed) {
      setRevealed(true);
      haptics([40, 30, 40]);
      // Auto reveal rest
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#FFA3B8', '#FF7A9A', '#F0537D'],
        scalar: 0.7,
      });

      setTimeout(() => setShowButton(true), 800);
    }
  }, [revealed]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (revealed) return;
    isDrawingRef.current = true;
    lastPointRef.current = null;
    scratch(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || revealed) return;
    scratch(e);
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    checkProgress();
  };

  // Periodic progress check while drawing
  useEffect(() => {
    progressCheckRef.current = window.setInterval(() => {
      if (isDrawingRef.current && !revealed) {
        checkProgress();
      }
    }, 200);
    return () => {
      if (progressCheckRef.current !== null) clearInterval(progressCheckRef.current);
    };
  }, [checkProgress, revealed]);

  return (
    <SceneShell>
      <div className="w-full max-w-sm flex flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl text-ink text-center mb-2"
        >
          {CONTENT.scratch.title}
        </motion.h2>
        <p className="font-body text-xs text-rose-400 text-center mb-6 px-4">
          {CONTENT.scratch.coverHint}
        </p>

        {/* Scratch card */}
        <div
          className="relative w-full max-w-[260px] aspect-[1.4] rounded-sticker shadow-soft-lg border-4 border-white overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          {/* Prize underneath */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-200 rounded-sticker p-6">
            <p className="font-hand text-xl text-ink text-center leading-snug">
              {CONTENT.scratch.prize}
            </p>
          </div>

          {/* Scratch canvas overlay */}
          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`absolute inset-0 z-10 w-full h-full rounded-sticker cursor-pointer no-touch-default transition-opacity duration-300 ${revealed ? 'opacity-0 pointer-events-none' : ''}`}
            aria-label="Area gores"
          />
        </div>

        {/* Progress hint */}
        {!revealed && progress > 0 && (
          <p className="mt-3 font-body text-xs text-rose-300">
            {Math.round(progress)}% tergores
          </p>
        )}

        {/* Continue button */}
        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onPointerDown={() => { haptics(20); onDone(); }}
              className="mt-6 px-8 py-3 rounded-full bg-rose-500 text-white font-display text-base shadow-soft active:scale-90 transition-transform"
              aria-label="Lanjut"
            >
              Lanjut
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </SceneShell>
  );
}
