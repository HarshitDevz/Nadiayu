import React from 'react';
import { motion, Variants } from 'motion/react';

interface AnimatedTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export const AnimatedTextReveal: React.FC<AnimatedTextRevealProps> = ({
  text,
  className = '',
  delay = 0,
  stagger = 0.03,
  as: Component = 'div',
}) => {
  const words = text.split(' ');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const wordVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 180,
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="inline-flex flex-wrap gap-x-[0.3em]"
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={wordVariants}
            className="inline-block whitespace-nowrap"
          >
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
};
