import { useCallback, useEffect, useRef, useState } from 'react';
import { haptics } from './haptics';

interface RunawayOptions {
  margin: number;
  maxEscapes: number;
  onEscape?: (count: number) => void;
}

interface RunawayResult {
  escapes: number;
  x: number;
  y: number;
  scale: number;
  text: string;
  visible: boolean;
  bind: {
    onPointerEnter: (e: React.PointerEvent) => void;
    onPointerDown: (e: React.PointerEvent) => void;
  };
}

export function useRunaway(
  texts: string[],
  options: RunawayOptions
): RunawayResult {
  const { margin, maxEscapes, onEscape } = options;
  const [escapes, setEscapes] = useState(0);
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [visible, setVisible] = useState(true);
  const escapesRef = useRef(0);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  const doEscape = useCallback(() => {
    if (escapesRef.current >= maxEscapes) {
      setVisible(false);
      return;
    }
    escapesRef.current += 1;
    const count = escapesRef.current;
    setEscapes(count);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxX = vw - margin * 2;
    const maxY = vh - margin * 2;
    const newX = Math.random() * maxX - maxX / 2;
    const newY = Math.random() * maxY - maxY / 2;

    setPos({ x: newX, y: newY });
    setScale(Math.max(1 - count * 0.05, 0.6));
    haptics(20);
    onEscapeRef.current?.(count);
  }, [margin, maxEscapes]);

  const bind: RunawayResult['bind'] = {
    onPointerEnter: (e: React.PointerEvent) => {
      e.preventDefault();
      doEscape();
    },
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      doEscape();
    },
  };

  return {
    escapes,
    x: pos.x,
    y: pos.y,
    scale,
    text: texts[Math.min(escapes, texts.length - 1)] ?? texts[0],
    visible,
    bind,
  };
}
