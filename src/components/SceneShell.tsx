import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface SceneShellProps {
  children: ReactNode;
  background?: string;
  className?: string;
  scrollable?: boolean;
}

export default function SceneShell({
  children,
  background = 'linear-gradient(160deg, #FFF5F7 0%, #FFE4EA 50%, #FFF8EE 100%)',
  className = '',
  scrollable = false,
}: SceneShellProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, filter: 'blur(8px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(8px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full min-h-[100dvh] flex flex-col items-center justify-center grain overflow-hidden ${className}`}
      style={{
        background,
        paddingTop: 'calc(var(--safe-top) + 8px)',
        paddingBottom: 'calc(var(--safe-bottom) + 8px)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      <div className={`relative z-10 w-full max-w-md mx-auto px-5 flex-1 flex flex-col items-center justify-center ${scrollable ? 'scrollable' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
}
