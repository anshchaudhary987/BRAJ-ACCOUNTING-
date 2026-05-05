'use client';

import { useRef, memo, ReactNode } from 'react';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

const TiltCard = memo(({ children, className = '', intensity = 8 }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const rotateX = (0.5 - y) * intensity;
    const rotateY = (x - 0.5) * intensity;
    ref.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    // Shine position
    const shine = ref.current.querySelector('[data-shine]') as HTMLElement;
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;
      shine.style.opacity = '1';
    }
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    const shine = ref.current.querySelector('[data-shine]') as HTMLElement;
    if (shine) shine.style.opacity = '0';
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-300 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div data-shine className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 opacity-0 z-10" />
      {children}
    </div>
  );
});

TiltCard.displayName = 'TiltCard';
export default TiltCard;
