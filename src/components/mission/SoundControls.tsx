'use client';

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundControls() {
  const { soundEnabled, setSoundEnabled } = useAppStore();

  const handleToggle = useCallback(() => {
    // Play click sound before potentially muting
    soundEngine.click();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEngine.setMuted(!newState);
  }, [soundEnabled, setSoundEnabled]);

  return (
    <motion.button
      onClick={handleToggle}
      className="fixed bottom-[60px] right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300"
      style={{
        background: soundEnabled
          ? 'rgba(0, 206, 201, 0.12)'
          : 'rgba(100, 116, 139, 0.12)',
        border: soundEnabled
          ? '1px solid rgba(0, 206, 201, 0.5)'
          : '1px solid rgba(100, 116, 139, 0.3)',
        boxShadow: soundEnabled
          ? '0 0 20px rgba(0, 206, 201, 0.25), 0 0 40px rgba(0, 206, 201, 0.1)'
          : '0 0 10px rgba(100, 116, 139, 0.1)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: soundEnabled
          ? '0 0 25px rgba(0, 206, 201, 0.4), 0 0 50px rgba(0, 206, 201, 0.15)'
          : '0 0 15px rgba(100, 116, 139, 0.2)',
      }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
      title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: soundEnabled ? 0 : -15,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        {soundEnabled ? (
          <Volume2
            className="w-5 h-5"
            style={{
              color: '#00CEC9',
              filter: 'drop-shadow(0 0 4px rgba(0, 206, 201, 0.5))',
            }}
          />
        ) : (
          <VolumeX
            className="w-5 h-5"
            style={{
              color: '#7A8CA5',
            }}
          />
        )}
      </motion.div>
    </motion.button>
  );
}
