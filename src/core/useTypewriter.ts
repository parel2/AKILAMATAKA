import { useEffect, useRef, useState, useCallback } from 'react';

interface TypewriterOptions {
  text: string;
  speed?: number;
  startDelay?: number;
}

interface TypewriterResult {
  displayed: string;
  done: boolean;
  skip: () => void;
}

export function useTypewriter({ text, speed = 35, startDelay = 0 }: TypewriterOptions): TypewriterResult {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const skippedRef = useRef(false);

  const skip = useCallback(() => {
    if (skippedRef.current) return;
    skippedRef.current = true;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setDisplayed(text);
    setDone(true);
  }, [text]);

  useEffect(() => {
    skippedRef.current = false;
    setDisplayed('');
    setDone(false);

    const startTimer = setTimeout(() => {
      startTimeRef.current = performance.now();

      const tick = () => {
        if (skippedRef.current) return;
        const elapsed = performance.now() - startTimeRef.current;
        const charCount = Math.floor(elapsed / speed);

        if (charCount >= text.length) {
          setDisplayed(text);
          setDone(true);
          rafRef.current = null;
          return;
        }
        setDisplayed(text.slice(0, charCount));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [text, speed, startDelay]);

  return { displayed, done, skip };
}
