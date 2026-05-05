'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

interface TextRevealProps {
  text: string;
  mode?: 'word' | 'letter';
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}

const TextReveal = memo(({ text, mode = 'word', delay = 0, className = '', as: Tag = 'span' }: TextRevealProps) => {
  const units = mode === 'word' ? text.split(' ') : text.split('');

  return (
    <Tag className={className} aria-label={text}>
      {units.map((unit, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            whileInView={{ y: '0%', opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{
              duration: 0.6,
              delay: delay + i * (mode === 'word' ? 0.08 : 0.03),
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {unit}{mode === 'word' ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
});

TextReveal.displayName = 'TextReveal';
export default TextReveal;
