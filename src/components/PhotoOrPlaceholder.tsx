import { useState, useEffect } from 'react';

interface PhotoOrPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
}

export default function PhotoOrPlaceholder({
  src,
  alt,
  className = '',
  style,
  onLoad,
}: PhotoOrPlaceholderProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-200 ${className}`}
        style={style}
        aria-label={alt}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#FFC7D4" />
          <path
            d="M24 16c-2-4-8-4-8 2 0 5 8 10 8 10s8-5 8-10c0-6-6-6-8-2z"
            fill="#FF7A9A"
          />
          <circle cx="16" cy="18" r="1.5" fill="#FFF" opacity="0.7" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      decoding="async"
      loading="lazy"
      onLoad={() => {
        onLoad?.();
      }}
      onError={() => setFailed(true)}
      aria-label={alt}
    />
  );
}
