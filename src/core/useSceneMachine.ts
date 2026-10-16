import { useCallback, useEffect, useState } from 'react';
import { SCENES, type SceneId } from './sceneConfig';
import { storage } from './storage';

type Direction = 1 | -1;

const STORAGE_KEY = 'milea_scene_index';

export function useSceneMachine() {
  const [index, setIndex] = useState<number>(() => {
    const saved = storage.get(STORAGE_KEY);
    if (saved !== null) {
      const n = parseInt(saved, 10);
      if (!isNaN(n) && n >= 0 && n < SCENES.length) return n;
    }
    return 0;
  });
  const [direction, setDirection] = useState<Direction>(1);

  useEffect(() => {
    storage.set(STORAGE_KEY, String(index));
  }, [index]);

  const next = useCallback(() => {
    setDirection(1);
    setIndex((prev) => Math.min(prev + 1, SCENES.length - 1));
  }, []);

  const goTo = useCallback((id: SceneId) => {
    const targetIndex = SCENES.findIndex((s) => s.id === id);
    if (targetIndex === -1) return;
    setDirection(targetIndex > index ? 1 : -1);
    setIndex(targetIndex);
  }, [index]);

  const restart = useCallback(() => {
    storage.remove(STORAGE_KEY);
    setDirection(-1);
    setIndex(0);
  }, []);

  return {
    index,
    direction,
    scene: SCENES[index],
    total: SCENES.length,
    next,
    goTo,
    restart,
  };
}
