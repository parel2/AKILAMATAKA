import { motion } from 'framer-motion';
import PhotoOrPlaceholder from './PhotoOrPlaceholder';

interface PolaroidProps {
  src: string;
  caption: string;
  rotation?: number;
  className?: string;
  style?: React.CSSProperties;
  drag?: boolean;
  dragConstraints?: React.RefObject<HTMLElement>;
  onDragEnd?: (e: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => void;
}

export default function Polaroid({
  src,
  caption,
  rotation = 0,
  className = '',
  style,
  drag = false,
  dragConstraints,
  onDragEnd,
}: PolaroidProps) {
  return (
    <motion.div
      className={`bg-white rounded-sticker shadow-sticker p-3 pb-12 ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      drag={drag}
      dragConstraints={dragConstraints}
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      whileTap={{ scale: 0.98 }}
      whileDrag={{ scale: 1.05, rotate: rotation + 2 }}
    >
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '1' }}>
        <PhotoOrPlaceholder
          src={src}
          alt={caption}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="absolute bottom-3 left-0 right-0 text-center font-hand text-lg text-ink">
        {caption}
      </p>
    </motion.div>
  );
}
