'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/soundEngine';
import { useAppStore } from '@/store/appStore';

// --- Star field ---
function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
}

// --- CSS Rocket ---
function CssRocket() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Nose cone */}
      <div
        className="w-0 h-0"
        style={{
          borderLeft: '18px solid transparent',
          borderRight: '18px solid transparent',
          borderBottom: '30px solid #ef4444',
        }}
      />
      {/* Body */}
      <div
        className="w-9 h-14 rounded-sm"
        style={{
          background: 'linear-gradient(90deg, #94a3b8, #e2e8f0, #cbd5e1)',
        }}
      >
        {/* Window */}
        <div className="flex justify-center mt-3">
          <div
            className="w-4 h-4 rounded-full border-2 border-cyan-400"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.3), #0c1a2e)',
              boxShadow: '0 0 6px rgba(34,211,238,0.5)',
            }}
          />
        </div>
      </div>
      {/* Fins */}
      <div className="absolute bottom-2 w-full flex justify-between px-0">
        <div
          className="w-0 h-0"
          style={{
            borderRight: '14px solid #f97316',
            borderTop: '12px solid transparent',
            borderBottom: '8px solid transparent',
            marginLeft: '-10px',
          }}
        />
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '14px solid #f97316',
            borderTop: '12px solid transparent',
            borderBottom: '8px solid transparent',
            marginRight: '-10px',
          }}
        />
      </div>
      {/* Nozzle */}
      <div className="w-6 h-3 bg-gray-500 rounded-b-sm" />
      <div className="w-8 h-2 bg-gray-600 rounded-b-md" />
    </div>
  );
}

// --- Fire on rocket ---
function RocketFire() {
  const particles = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 24,
      size: Math.random() * 8 + 3,
      delay: Math.random() * 0.2,
      color: ['#f97316', '#fbbf24', '#ef4444', '#fcd34d'][Math.floor(Math.random() * 4)],
    }));
  }, []);

  return (
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            left: p.x,
            filter: 'blur(1px)',
            boxShadow: `0 0 6px ${p.color}`,
          }}
          animate={{
            y: [0, 25 + Math.random() * 20],
            opacity: [0.9, 0.5, 0],
            scale: [1, 1.3, 0.2],
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: 'loop',
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// --- Comet ---
function Comet() {
  return (
    <div className="relative">
      {/* Comet head */}
      <div
        className="w-6 h-6 rounded-full"
        style={{
          background: 'radial-gradient(circle, #ffffff, #a78bfa, #7c3aed)',
          boxShadow: '0 0 20px rgba(167,139,250,0.8), 0 0 40px rgba(124,58,237,0.5), 0 0 60px rgba(139,92,246,0.3)',
        }}
      />
      {/* Comet tail */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -right-20"
        style={{
          width: 80,
          height: 8,
          background: 'linear-gradient(to left, transparent, rgba(167,139,250,0.4), rgba(139,92,246,0.6))',
          borderRadius: '50%',
          filter: 'blur(2px)',
          transform: 'translateY(-50%) rotate(-30deg)',
        }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 -right-24"
        style={{
          width: 60,
          height: 4,
          background: 'linear-gradient(to left, transparent, rgba(167,139,250,0.2))',
          borderRadius: '50%',
          filter: 'blur(3px)',
          transform: 'translateY(-50%) rotate(-25deg) translateY(-8px)',
        }}
      />
    </div>
  );
}

// --- Explosion ---
function Explosion({ visible }: { visible: boolean }) {
  const fragments = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const distance = 60 + Math.random() * 120;
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: Math.random() * 6 + 2,
        color: ['#f97316', '#fbbf24', '#ef4444', '#a78bfa', '#22d3ee', '#ffffff'][
          Math.floor(Math.random() * 6)
        ],
      };
    });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Flash */}
          <motion.div
            className="absolute w-full h-full bg-white"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Expanding ring 1 */}
          <motion.div
            className="absolute rounded-full border-2 border-orange-400"
            style={{ boxShadow: '0 0 20px rgba(249,115,22,0.6)' }}
            initial={{ width: 0, height: 0, opacity: 1 }}
            animate={{ width: 300, height: 300, opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />

          {/* Expanding ring 2 */}
          <motion.div
            className="absolute rounded-full border-2 border-purple-400"
            style={{ boxShadow: '0 0 20px rgba(167,139,250,0.6)' }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 400, height: 400, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
          />

          {/* Expanding ring 3 */}
          <motion.div
            className="absolute rounded-full border border-cyan-400/60"
            initial={{ width: 0, height: 0, opacity: 0.6 }}
            animate={{ width: 500, height: 500, opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          />

          {/* Central glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(249,115,22,0.6), transparent)',
              boxShadow: '0 0 60px rgba(249,115,22,0.8), 0 0 120px rgba(239,68,68,0.4)',
            }}
            initial={{ width: 10, height: 10, opacity: 1 }}
            animate={{ width: 120, height: 120, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />

          {/* Scattered particles */}
          {fragments.map((f) => (
            <motion.div
              key={f.id}
              className="absolute rounded-full"
              style={{
                width: f.size,
                height: f.size,
                backgroundColor: f.color,
                boxShadow: `0 0 4px ${f.color}`,
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: f.x,
                y: f.y,
                opacity: 0,
                scale: 0.3,
              }}
              transition={{
                duration: 1.2 + Math.random() * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Phase type ---
type LogoutPhase = 'rocket-appear' | 'launch' | 'comet-enter' | 'collision' | 'explosion' | 'fadeout';

// --- Main component ---
export default function LogoutAnimation() {
  const { setPage, soundEnabled } = useAppStore();
  const [phase, setPhase] = useState<LogoutPhase>('rocket-appear');

  // Phase sequencing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    switch (phase) {
      case 'rocket-appear':
        timers.push(setTimeout(() => setPhase('launch'), 600));
        break;
      case 'launch':
        if (soundEnabled) {
          soundEngine.launch();
          soundEngine.playRocketLaunch();
        }
        timers.push(setTimeout(() => setPhase('comet-enter'), 1200));
        break;
      case 'comet-enter':
        timers.push(setTimeout(() => setPhase('collision'), 800));
        break;
      case 'collision':
        if (soundEnabled) {
          soundEngine.crash();
          soundEngine.playRocketCrash();
        }
        timers.push(setTimeout(() => setPhase('explosion'), 100));
        break;
      case 'explosion':
        timers.push(setTimeout(() => setPhase('fadeout'), 1500));
        break;
      case 'fadeout':
        timers.push(setTimeout(() => setPage('login'), 1500));
        break;
    }

    return () => timers.forEach(clearTimeout);
  }, [phase, soundEnabled, setPage]);

  // Rocket Y position based on phase
  const rocketY = (() => {
    switch (phase) {
      case 'rocket-appear':
        return '70vh';
      case 'launch':
      case 'comet-enter':
        return '20vh';
      case 'collision':
      case 'explosion':
      case 'fadeout':
        return '20vh';
      default:
        return '70vh';
    }
  })();

  const showFire = phase === 'launch' || phase === 'comet-enter';
  const showRocket = phase !== 'explosion' && phase !== 'fadeout';

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0c1a2e 0%, #020617 50%, #000000 100%)',
      }}
    >
      <StarField />

      {/* Nebula ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
        }}
      />

      {/* Rocket */}
      <AnimatePresence>
        {showRocket && (
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 z-10"
            initial={{ y: '90vh', opacity: 0 }}
            animate={{
              y: rocketY,
              opacity: phase === 'collision' ? 0 : 1,
            }}
            transition={
              phase === 'launch'
                ? { duration: 1.2, ease: 'easeIn' }
                : { duration: 0.6 }
            }
          >
            <CssRocket />
            {showFire && <RocketFire />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comet */}
      <AnimatePresence>
        {(phase === 'comet-enter' || phase === 'collision') && (
          <motion.div
            className="absolute z-10"
            initial={{ x: '80vw', y: '-10vh', opacity: 0, rotate: -30 }}
            animate={{
              x: phase === 'collision' ? '48vw' : '55vw',
              y: phase === 'collision' ? '18vh' : '5vh',
              opacity: phase === 'collision' ? 0 : 1,
              rotate: -30,
            }}
            transition={
              phase === 'collision'
                ? { duration: 0.6, ease: 'easeIn' }
                : { duration: 0.8, ease: 'easeIn' }
            }
          >
            <Comet />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explosion */}
      <Explosion visible={phase === 'explosion'} />

      {/* Fade to black overlay */}
      <AnimatePresence>
        {phase === 'fadeout' && (
          <motion.div
            className="absolute inset-0 z-20 bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* "DISCONNECTING..." text */}
      <motion.div
        className="absolute bottom-12 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: phase === 'fadeout' ? 0 : 1,
          y: 0,
        }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <span
          className="text-sm font-mono tracking-[0.3em] uppercase"
          style={{ color: '#a78bfa', textShadow: '0 0 10px rgba(167,139,250,0.5)' }}
        >
          DISCONNECTING
        </span>
        <motion.div
          className="h-1 bg-purple-400/60 rounded-full"
          style={{ boxShadow: '0 0 8px rgba(167,139,250,0.4)' }}
          initial={{ width: 0 }}
          animate={{ width: phase === 'explosion' || phase === 'fadeout' ? 160 : 80 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02] z-30"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
        }}
      />
    </div>
  );
}
