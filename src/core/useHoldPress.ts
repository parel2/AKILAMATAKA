import { useCallback, useEffect, useRef, useState } from 'react';
import { haptics } from './haptics';

interface HoldPressOptions {
  ms: number;
  onComplete?: () => void;
  onRelease?: () => void;
}

interface HoldPressResult {
  progress: number;
  isHolding: boolean;
  completed: boolean;
  reset: () => void;
  bind: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
  };
}

export function useHoldPress({ ms, onComplete, onRelease }: HoldPressOptions): HoldPressResult {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [completed, setCompleted] = useState(false);

  const rafRef = useRef<number | null>(null);
  const decayRafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastHapticQuarterRef = useRef(0);
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onReleaseRef = useRef(onRelease);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onReleaseRef.current = onRelease;
  });

  const stopAllRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (decayRafRef.current !== null) {
      cancelAnimationFrame(decayRafRef.current);
      decayRafRef.current = null;
    }
  }, []);

  const animateHold = useCallback(() => {
    if (!holdingRef.current || completedRef.current) return;
    const elapsed = performance.now() - startTimeRef.current;
    const p = Math.min(elapsed / ms, 1);
    setProgress(p);

    const quarter = Math.floor(p * 4);
    if (quarter > lastHapticQuarterRef.current && quarter < 4) {
      lastHapticQuarterRef.current = quarter;
      haptics(15);
    }

    if (p >= 1) {
      setCompleted(true);
      completedRef.current = true;
      holdingRef.current = false;
      haptics([30]);
      onCompleteRef.current?.();
      return;
    }
    rafRef.current = requestAnimationFrame(animateHold);
  }, [ms]);

  const animateDecay = useCallback(() => {
    if (holdingRef.current || completedRef.current) return;
    setProgress((prev) => {
      if (prev <= 0) {
        decayRafRef.current = null;
        return 0;
      }
      const nextVal = Math.max(prev - 0.02, 0);
      decayRafRef.current = requestAnimationFrame(animateDecay);
      return nextVal;
    });
  }, []);

  const startHold = useCallback(() => {
    if (completedRef.current) return;
    stopAllRaf();
    holdingRef.current = true;
    setIsHolding(true);
    startTimeRef.current = performance.now();
    lastHapticQuarterRef.current = 0;
    rafRef.current = requestAnimationFrame(animateHold);
  }, [animateHold, stopAllRaf]);

  const releaseHold = useCallback(() => {
    if (completedRef.current) return;
    holdingRef.current = false;
    setIsHolding(false);
    stopAllRaf();
    onReleaseRef.current?.();
    decayRafRef.current = requestAnimationFrame(animateDecay);
  }, [animateDecay, stopAllRaf]);

  const reset = useCallback(() => {
    stopAllRaf();
    holdingRef.current = false;
    completedRef.current = false;
    lastHapticQuarterRef.current = 0;
    setProgress(0);
    setIsHolding(false);
    setCompleted(false);
  }, [stopAllRaf]);

  useEffect(() => {
    return () => stopAllRaf();
  }, [stopAllRaf]);

  const bind: HoldPressResult['bind'] = {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      startHold();
    },
    onPointerUp: (e: React.PointerEvent) => {
      e.preventDefault();
      releaseHold();
    },
    onPointerLeave: (e: React.PointerEvent) => {
      e.preventDefault();
      if (holdingRef.current) releaseHold();
    },
    onPointerCancel: (e: React.PointerEvent) => {
      e.preventDefault();
      if (holdingRef.current) releaseHold();
    },
  };

  return { progress, isHolding, completed, reset, bind };
}
