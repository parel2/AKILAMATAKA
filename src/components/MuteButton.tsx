import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AudioManager } from '@/core/AudioManager';

export default function MuteButton() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(AudioManager.isMuted);
  }, []);

  const toggle = () => {
    const newMuted = AudioManager.toggleMuted();
    setMuted(newMuted);
  };

  return (
    <button
      onClick={toggle}
      aria-label={muted ? 'Nyalakan musik' : 'Matikan musik'}
      className="fixed top-0 right-0 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-white/70 backdrop-blur-sm shadow-soft active:scale-90 transition-transform"
      style={{
        marginTop: 'var(--safe-top)',
        marginRight: 'var(--safe-right)',
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-rose-500">
        <path
          d="M11 5L6 9H2v6h4l5 4V5z"
          fill="currentColor"
        />
        {!muted && (
          <motion.g
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <path d="M15.5 8.5a5 5 0 010 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            <path d="M18 6a8 8 0 010 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
          </motion.g>
        )}
        {muted && (
          <>
            <path d="M16 9l5 5M21 9l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
      </svg>
    </button>
  );
}
