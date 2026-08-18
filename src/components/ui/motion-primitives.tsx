import React from 'react';
import { motion, AnimatePresence, type HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

export interface MotionPageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const MotionPageTransition: React.FC<MotionPageTransitionProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={cn('w-full', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface MotionFadeInProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

export const MotionFadeIn: React.FC<MotionFadeInProps> = ({ children, delay = 0, className, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const MotionCard: React.FC<MotionCardProps> = ({ children, className, ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className={cn('surface-card', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export { AnimatePresence, motion };
