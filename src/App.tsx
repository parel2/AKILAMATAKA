import { useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSceneMachine } from '@/core/useSceneMachine';
import { useAudioUnlock } from '@/core/AudioManager';
import { AudioManager } from '@/core/AudioManager';
import { CONTENT } from '@/data/content';
import ParticleLayer from '@/components/ParticleLayer';
import TouchTrail from '@/components/TouchTrail';
import MuteButton from '@/components/MuteButton';

import Scene00Loading from '@/scenes/Scene00Loading';
import Scene01Gift from '@/scenes/Scene01Gift';
import Scene02Captcha from '@/scenes/Scene02Captcha';
import Scene03Chat from '@/scenes/Scene03Chat';
import Scene04Cake from '@/scenes/Scene04Cake';
import Scene05Receipt from '@/scenes/Scene05Receipt';
import Scene06Scratch from '@/scenes/Scene06Scratch';
import Scene07Gallery from '@/scenes/Scene07Gallery';
import Scene08FillHeart from '@/scenes/Scene08FillHeart';
import Scene09Letter from '@/scenes/Scene09Letter';
import Scene10Photo from '@/scenes/Scene10Photo';
import Scene11Terms from '@/scenes/Scene11Terms';
import Scene12Slide from '@/scenes/Scene12Slide';
import Scene13Question from '@/scenes/Scene13Question';
import Scene14Celebration from '@/scenes/Scene14Celebration';

function App() {
  const { scene, direction, next, restart } = useSceneMachine();
  useAudioUnlock();

  useEffect(() => {
    AudioManager.init(
      CONTENT.audio.main,
      CONTENT.audio.after,
      CONTENT.audio.mainVolume,
      CONTENT.audio.afterVolume
    );
  }, []);

  const handleNext = useCallback(() => {
    next();
  }, [next]);

  const handleRestart = useCallback(() => {
    AudioManager.resetToMain();
    restart();
  }, [restart]);

  const renderScene = () => {
    switch (scene.id) {
      case 'loading':
        return <Scene00Loading key="loading" onDone={handleNext} />;
      case 'gift':
        return <Scene01Gift key="gift" onDone={handleNext} />;
      case 'captcha':
        return <Scene02Captcha key="captcha" onDone={handleNext} />;
      case 'chat':
        return <Scene03Chat key="chat" onDone={handleNext} />;
      case 'cake':
        return <Scene04Cake key="cake" onDone={handleNext} />;
      case 'receipt':
        return <Scene05Receipt key="receipt" onDone={handleNext} />;
      case 'scratch':
        return <Scene06Scratch key="scratch" onDone={handleNext} />;
      case 'gallery':
        return <Scene07Gallery key="gallery" onDone={handleNext} />;
      case 'fillheart':
        return <Scene08FillHeart key="fillheart" onDone={handleNext} />;
      case 'letter':
        return <Scene09Letter key="letter" onDone={handleNext} />;
      case 'photo':
        return <Scene10Photo key="photo" onDone={handleNext} />;
      case 'terms':
        return <Scene11Terms key="terms" onDone={handleNext} />;
      case 'slide':
        return <Scene12Slide key="slide" onDone={handleNext} />;
      case 'question':
        return <Scene13Question key="question" onDone={handleNext} />;
      case 'celebration':
        return <Scene14Celebration key="celebration" onRestart={handleRestart} />;
      default:
        return (
          <div className="min-h-[100dvh] flex items-center justify-center bg-rose-50">
            <div className="text-center">
              <p className="font-display text-2xl text-ink mb-4">Fase 2 coming soon</p>
              <p className="font-body text-sm text-ink-soft">Scene: {scene.id}</p>
              <button
                onPointerDown={handleNext}
                className="mt-6 px-6 py-3 rounded-full bg-rose-500 text-white font-display shadow-soft active:scale-90"
              >
                Lewati
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-rose-50">
      <MuteButton />
      <ParticleLayer intensity={scene.particles} />
      <TouchTrail active={scene.touchTrail} />

      <AnimatePresence mode="wait" custom={direction}>
        {renderScene()}
      </AnimatePresence>
    </div>
  );
}

export default App;
