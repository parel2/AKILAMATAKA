import { useEffect, useState } from 'react';

type Track = 'main' | 'after';

class AudioManagerClass {
  private main: HTMLAudioElement | null = null;
  private after: HTMLAudioElement | null = null;
  private currentTrack: Track = 'main';
  private muted = false;
  private unlocked = false;
  private mainVolume = 0.6;
  private afterVolume = 0.7;
  private fadeRaf: number | null = null;
  private crossfadeRaf: number | null = null;

  init(mainSrc: string, afterSrc: string, mainVol: number, afterVol: number): void {
    if (this.main) return;
    this.mainVolume = mainVol;
    this.afterVolume = afterVol;

    this.main = new Audio(mainSrc);
    this.main.preload = 'auto';
    this.main.loop = true;
    this.main.volume = 0;

    this.after = new Audio(afterSrc);
    this.after.preload = 'auto';
    this.after.loop = true;
    this.after.volume = 0;
  }

  unlock(): void {
    if (this.unlocked || !this.main) return;
    this.unlocked = true;

    this.fadeTo(this.main, this.muted ? 0 : this.mainVolume, 1500);

    this.main.play().then(() => {
      // success
    }).catch(() => {
      // silently ignore
    });
  }

  private fadeTo(
    audio: HTMLAudioElement | null,
    target: number,
    duration: number,
    onComplete?: () => void
  ): void {
    if (!audio) {
      onComplete?.();
      return;
    }
    if (this.fadeRaf !== null) {
      cancelAnimationFrame(this.fadeRaf);
    }
    const startVolume = audio.volume;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      audio.volume = startVolume + (target - startVolume) * t;

      if (t < 1) {
        this.fadeRaf = requestAnimationFrame(tick);
      } else {
        this.fadeRaf = null;
        onComplete?.();
      }
    };
    this.fadeRaf = requestAnimationFrame(tick);
  }

  crossfadeToAfter(ms: number): void {
    if (!this.main || !this.after) return;
    if (this.crossfadeRaf !== null) {
      cancelAnimationFrame(this.crossfadeRaf);
    }

    this.after.play().then(() => {
      // success
    }).catch(() => {
      // silently ignore
    });

    const mainStart = this.main.volume;
    const afterStart = this.after.volume;
    const targetMain = this.muted ? 0 : 0;
    const targetAfter = this.muted ? 0 : this.afterVolume;
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / ms, 1);

      if (this.main) this.main.volume = mainStart + (targetMain - mainStart) * t;
      if (this.after) this.after.volume = afterStart + (targetAfter - afterStart) * t;

      if (t < 1) {
        this.crossfadeRaf = requestAnimationFrame(tick);
      } else {
        this.crossfadeRaf = null;
        if (this.main) {
          this.main.pause();
        }
        this.currentTrack = 'after';
      }
    };
    this.crossfadeRaf = requestAnimationFrame(tick);
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    const active = this.currentTrack === 'main' ? this.main : this.after;
    if (active) {
      const targetVol = this.currentTrack === 'main' ? this.mainVolume : this.afterVolume;
      this.fadeTo(active, muted ? 0 : targetVol, 300);
    }
  }

  toggleMuted(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  get isUnlocked(): boolean {
    return this.unlocked;
  }

  pauseAll(): void {
    this.main?.pause();
    this.after?.pause();
  }

  resumeActive(): void {
    if (this.muted) return;
    const active = this.currentTrack === 'main' ? this.main : this.after;
    active?.play().then(() => {}).catch(() => {});
  }

  resetToMain(): void {
    if (!this.main || !this.after) return;
    if (this.crossfadeRaf !== null) {
      cancelAnimationFrame(this.crossfadeRaf);
      this.crossfadeRaf = null;
    }
    this.after.pause();
    this.after.volume = 0;
    this.currentTrack = 'main';
    this.main.volume = this.muted ? 0 : this.mainVolume;
    this.main.play().then(() => {}).catch(() => {});
  }
}

export const AudioManager = new AudioManagerClass();

export function useAudioUnlock(): { unlocked: boolean } {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!AudioManager.isUnlocked) {
        AudioManager.unlock();
        setUnlocked(true);
      }
    };

    const events: (keyof WindowEventMap)[] = ['pointerup', 'touchend', 'click', 'keydown'];
    events.forEach((evt) => window.addEventListener(evt, handler, { capture: true, once: true }));

    const visibilityHandler = () => {
      if (document.hidden) {
        AudioManager.pauseAll();
      } else {
        AudioManager.resumeActive();
      }
    };
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handler, { capture: true }));
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }, []);

  return { unlocked };
}
