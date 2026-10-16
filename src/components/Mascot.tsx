import { motion } from 'framer-motion';

export type MascotExpression = 'idle' | 'curious' | 'panik' | 'sedih' | 'senang';

interface MascotProps {
  expression?: MascotExpression;
  size?: number;
  className?: string;
  onTap?: () => void;
  floating?: boolean;
}

export default function Mascot({
  expression = 'idle',
  size = 120,
  className = '',
  onTap,
  floating = true,
}: MascotProps) {
  const eyes = {
    idle: { ry: 4, y: 0 },
    curious: { ry: 5, y: -1 },
    panik: { ry: 6, y: -2 },
    sedih: { ry: 2, y: 2 },
    senang: { ry: 1, y: 0 },
  };

  const eyeShape = expression === 'senang' ? 'happy' : 'normal';
  const e = eyes[expression];

  return (
    <motion.button
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      onClick={onTap}
      aria-label="Maskot"
      animate={floating ? { y: [0, -6, 0] } : {}}
      transition={floating ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        {/* Ears */}
        <ellipse cx="32" cy="28" rx="14" ry="16" fill="#FFC7D4" />
        <ellipse cx="88" cy="28" rx="14" ry="16" fill="#FFC7D4" />
        <ellipse cx="32" cy="30" rx="8" ry="10" fill="#FFA3B8" />
        <ellipse cx="88" cy="30" rx="8" ry="10" fill="#FFA3B8" />

        {/* Head */}
        <circle cx="60" cy="58" r="38" fill="#FFDFE7" />
        <circle cx="60" cy="58" r="38" fill="none" stroke="#FFA3B8" strokeWidth="2" />

        {/* Cheeks */}
        <ellipse cx="28" cy="68" rx="8" ry="6" fill="#FFA3B8" opacity="0.5" />
        <ellipse cx="92" cy="68" rx="8" ry="6" fill="#FFA3B8" opacity="0.5" />

        {/* Eyes */}
        {eyeShape === 'happy' ? (
          <>
            <path d="M40 55 Q46 48 52 55" stroke="#5A2A3C" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M68 55 Q74 48 80 55" stroke="#5A2A3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <motion.ellipse
              cx="46" cy={55 + e.y}
              animate={{ ry: e.ry }}
              rx="4"
              fill="#5A2A3C"
            />
            <motion.ellipse
              cx="74" cy={55 + e.y}
              animate={{ ry: e.ry }}
              rx="4"
              fill="#5A2A3C"
            />
            <circle cx="47.5" cy={53 + e.y} r="1.5" fill="#FFF" />
            <circle cx="75.5" cy={53 + e.y} r="1.5" fill="#FFF" />
          </>
        )}

        {/* Nose */}
        <path d="M57 66 Q60 63 63 66 Q60 69 57 66z" fill="#F0537D" />

        {/* Mouth */}
        {expression === 'senang' ? (
          <path d="M48 76 Q60 86 72 76" stroke="#5A2A3C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : expression === 'sedih' ? (
          <path d="M50 80 Q60 74 70 80" stroke="#5A2A3C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : expression === 'panik' ? (
          <ellipse cx="60" cy="78" rx="6" ry="8" fill="#5A2A3C" />
        ) : (
          <path d="M52 76 Q60 82 68 76" stroke="#5A2A3C" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Whiskers */}
        <line x1="18" y1="64" x2="30" y2="64" stroke="#FFA3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="18" y1="70" x2="30" y2="68" stroke="#FFA3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="64" x2="102" y2="64" stroke="#FFA3B8" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="90" y1="68" x2="102" y2="70" stroke="#FFA3B8" strokeWidth="1.5" strokeLinecap="round" />

        {/* Little body */}
        <ellipse cx="60" cy="108" rx="28" ry="14" fill="#FFDFE7" stroke="#FFA3B8" strokeWidth="2" />
        {/* Bow tie */}
        <path d="M50 98 L44 92 L44 104z" fill="#F0537D" />
        <path d="M70 98 L76 92 L76 104z" fill="#F0537D" />
        <circle cx="60" cy="98" r="4" fill="#F0537D" />
      </svg>
    </motion.button>
  );
}
