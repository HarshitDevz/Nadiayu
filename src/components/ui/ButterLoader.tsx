import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMedical } from '../../context/MedicalContext';

export const ButterLoader: React.FC = () => {
  const { activePortal } = useMedical();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [activePortal]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] bg-transparent overflow-hidden"
        >
          <motion.div
            initial={{ x: '-100%', scaleX: 0.2 }}
            animate={{ x: '0%', scaleX: 1 }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1], // Butter ease
            }}
            className="w-full h-full bg-gradient-to-r from-blue-600 via-teal-400 to-indigo-600 shadow-[0_0_12px_rgba(37,99,235,0.8)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
