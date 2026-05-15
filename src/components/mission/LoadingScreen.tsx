'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/soundEngine';
import { useAppStore } from '@/store/appStore';

// --- Mission color mapping ---
const MISSION_COLORS: Record<string, { glow: string; hex: string }> = {
  collatz: { glow: 'rgba(34,211,238,0.6)', hex: '#22d3ee' },     // cyan
  fibonacci: { glow: 'rgba(245,158,11,0.6)', hex: '#f59e0b' },   // amber
  tribonacci: { glow: 'rgba(168,85,247,0.6)', hex: '#a855f7' },  // purple
  lucas: { glow: 'rgba(16,185,129,0.6)', hex: '#10b981' },       // emerald
  euclidean: { glow: 'rgba(244,63,94,0.6)', hex: '#f43f5e' },    // rose
  division: { glow: 'rgba(14,165,233,0.6)', hex: '#0ea5e9' },    // sky
};

const DEFAULT_COLOR = { glow: 'rgba(34,211,238,0.6)', hex: '#22d3ee' };

function getMissionColor(missionId: string | null) {
  if (!missionId) return DEFAULT_COLOR;
  return MISSION_COLORS[missionId] ?? DEFAULT_COLOR;
}

type LoadingPhase = 'countdown' | 'ignition' | 'launch' | 'approach' | 'landing' | 'complete';

// --- Star field background ---
function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      twinkleDelay: Math.random() * 3,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
          }}
          animate={{
            opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
          }}
          transition={{
            duration: 2 + star.twinkleDelay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// --- Rocket SVG ---
function Rocket({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center bottom' }}>
      <svg width="80" height="140" viewBox="0 0 80 140" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Nose cone */}
        <path d="M40 0 L55 40 L25 40 Z" fill="url(#rocketNose)" />
        {/* Body */}
        <rect x="25" y="40" width="30" height="60" rx="3" fill="url(#rocketBody)" />
        {/* Window */}
        <circle cx="40" cy="60" r="8" fill="#0c1a2e" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="40" cy="60" r="4" fill="#22d3ee" opacity="0.4" />
        {/* Left fin */}
        <path d="M25 80 L8 110 L25 100 Z" fill="#f97316" />
        {/* Right fin */}
        <path d="M55 80 L72 110 L55 100 Z" fill="#f97316" />
        {/* Nozzle */}
        <path d="M30 100 L28 115 L52 115 L50 100 Z" fill="#64748b" />
        <path d="M32 115 L28 125 L52 125 L48 115 Z" fill="#475569" />
        <defs>
          <linearGradient id="rocketNose" x1="40" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <linearGradient id="rocketBody" x1="25" y1="40" x2="55" y2="100">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// --- Fire particles ---
function FireParticles({ visible }: { visible: boolean }) {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 40,
      y: Math.random() * 30,
      size: Math.random() * 10 + 4,
      delay: Math.random() * 0.3,
      color: ['#f97316', '#fbbf24', '#ef4444', '#fcd34d', '#fb923c'][Math.floor(Math.random() * 5)],
    }));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
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
                boxShadow: `0 0 8px ${p.color}`,
              }}
              initial={{ y: 0, opacity: 0.9, scale: 1 }}
              animate={{
                y: [0, 40 + Math.random() * 40],
                opacity: [0.9, 0.6, 0],
                scale: [1, 1.4, 0.3],
                x: [p.x, p.x + (Math.random() - 0.5) * 20],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.5 + Math.random() * 0.5,
                repeat: Infinity,
                repeatType: 'loop',
                delay: p.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Smoke trail ---
function SmokeTrail({ visible }: { visible: boolean }) {
  const smokeParticles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 50,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 0.5,
    }));
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          {smokeParticles.map((s) => (
            <motion.div
              key={s.id}
              className="absolute rounded-full bg-gray-400/30"
              style={{
                width: s.size,
                height: s.size,
                left: s.x,
                filter: 'blur(4px)',
              }}
              initial={{ y: 0, opacity: 0.5, scale: 0.5 }}
              animate={{
                y: [0, 60 + Math.random() * 40],
                opacity: [0.5, 0.2, 0],
                scale: [0.5, 2, 3],
                x: [s.x, s.x + (Math.random() - 0.5) * 60],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1 + Math.random() * 0.8,
                repeat: Infinity,
                repeatType: 'loop',
                delay: s.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

// --- Countdown number ---
function CountdownNumber({ number }: { number: number }) {
  return (
    <motion.div
      key={number}
      className="absolute inset-0 flex items-center justify-center"
      initial={{ scale: 2, opacity: 0 }}
      animate={{
        scale: [2, 1, 0.8],
        opacity: [0, 1, 1],
      }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <span
        className="text-9xl font-black select-none"
        style={{
          color: '#22d3ee',
          textShadow: '0 0 40px rgba(34,211,238,0.8), 0 0 80px rgba(34,211,238,0.4), 0 0 120px rgba(34,211,238,0.2)',
        }}
      >
        {number}
      </span>
    </motion.div>
  );
}

// --- Planet image component ---
function PlanetImage({
  missionId,
  visible,
  landed,
}: {
  missionId: string;
  visible: boolean;
  landed: boolean;
}) {
  const color = getMissionColor(missionId);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center"
          initial={{ opacity: 0, y: 60, scale: 0.6 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: landed ? [1, 1.05, 1] : 1,
          }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={
            landed
              ? { duration: 0.6, repeat: 2, repeatType: 'reverse' }
              : { duration: 1.2, ease: 'easeOut' }
          }
        >
          {/* Atmospheric glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: landed ? '340px' : '280px',
              height: landed ? '340px' : '280px',
              background: `radial-gradient(circle, ${color.glow} 0%, transparent 70%)`,
              filter: 'blur(20px)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={
              landed
                ? {
                    opacity: [0.6, 1, 0.6],
                    scale: [1, 1.2, 1],
                  }
                : { opacity: 0.4 }
            }
            transition={
              landed
                ? { duration: 0.8, repeat: 3, repeatType: 'reverse' }
                : { duration: 1 }
            }
          />
          {/* Planet image */}
          <img
            src={`/planets/planet-${missionId}.png`}
            alt={`Planet ${missionId}`}
            className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl"
            style={{
              filter: landed ? `drop-shadow(0 0 30px ${color.hex})` : `drop-shadow(0 0 15px ${color.hex}40)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Screen flash overlay ---
function ScreenFlash({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 pointer-events-none"
          style={{ backgroundColor: 'white' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.8, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}
    </AnimatePresence>
  );
}

// --- Main component ---
export default function LoadingScreen() {
  const { finishLoading, loadingMissionId, soundEnabled } = useAppStore();
  const [phase, setPhase] = useState<LoadingPhase>('countdown');
  const [countdownNum, setCountdownNum] = useState(3);
  const [shaking, setShaking] = useState(false);
  const [landed, setLanded] = useState(false);
  const [flash, setFlash] = useState(false);
  const rocketLaunchPlayed = useRef(false);

  const missionColor = getMissionColor(loadingMissionId);
  const missionText = loadingMissionId ?? 'MISSION CONTROL';
  const hasMission = loadingMissionId !== null;

  // Determine rocket Y position and scale based on phase
  const getRocketAnimation = () => {
    switch (phase) {
      case 'countdown':
        return { y: '40vh', opacity: 1, scale: 1 };
      case 'ignition':
        return { y: '40vh', opacity: 1, scale: 1 };
      case 'launch':
        return { y: hasMission ? '-30vh' : '-120vh', opacity: 1, scale: 1 };
      case 'approach':
        return { y: '-25vh', opacity: 1, scale: 0.8 };
      case 'landing':
        return { y: '10vh', opacity: 1, scale: 0.35 };
      case 'complete':
        return { y: '10vh', opacity: 0, scale: 0.3 };
      default:
        return { y: '40vh', opacity: 1, scale: 1 };
    }
  };

  const getRocketTransition = () => {
    switch (phase) {
      case 'launch':
        return { duration: hasMission ? 1.8 : 2, ease: 'easeIn' };
      case 'approach':
        return { duration: 0.8, ease: 'easeOut' };
      case 'landing':
        return { duration: 2, ease: [0.25, 0.1, 0.25, 1] };
      case 'complete':
        return { duration: 0.5, ease: 'easeOut' };
      default:
        return { duration: 0.5 };
    }
  };

  // Countdown sequence
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (countdownNum > 0) {
      const timer = setTimeout(() => {
        if (soundEnabled) soundEngine.countdown();
        setCountdownNum((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase('ignition'), 0);
      return () => clearTimeout(timer);
    }
  }, [phase, countdownNum, soundEnabled]);

  // Ignition phase - shake + fire + rocket launch sound
  useEffect(() => {
    if (phase !== 'ignition') return;

    if (soundEnabled) {
      // Play the actual rocket launch sound file
      if (!rocketLaunchPlayed.current) {
        soundEngine.playRocketLaunch();
        rocketLaunchPlayed.current = true;
      }
      // Also play the synthetic launch sound for richer audio
      soundEngine.launch();
    }

    const shakeTimer = setTimeout(() => setShaking(true), 0);
    const phaseTimer = setTimeout(() => setPhase('launch'), 1000);

    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(phaseTimer);
    };
  }, [phase, soundEnabled]);

  // Launch phase - rocket flies upward
  useEffect(() => {
    if (phase !== 'launch') return;

    const timer = setTimeout(() => {
      setShaking(false);
      if (hasMission) {
        setPhase('approach');
      } else {
        setPhase('complete');
      }
    }, hasMission ? 1800 : 2000);

    return () => clearTimeout(timer);
  }, [phase, hasMission]);

  // Approach phase - planet appears, rocket approaches from top
  useEffect(() => {
    if (phase !== 'approach') return;

    const timer = setTimeout(() => {
      setPhase('landing');
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase]);

  // Landing phase - rocket descends to planet with landing effect
  useEffect(() => {
    if (phase !== 'landing') return;

    // After rocket reaches planet (2s descent), trigger landing effects
    const landTimer = setTimeout(() => {
      setLanded(true);
      setFlash(true);
      if (soundEnabled) soundEngine.click();

      // Clear flash after a short burst
      const flashTimer = setTimeout(() => setFlash(false), 400);

      // Then transition to complete
      const completeTimer = setTimeout(() => setPhase('complete'), 1500);

      return () => {
        clearTimeout(flashTimer);
        clearTimeout(completeTimer);
      };
    }, 2000);

    return () => clearTimeout(landTimer);
  }, [phase, soundEnabled]);

  // Complete phase - finish loading
  const handleFinish = useCallback(() => {
    finishLoading();
  }, [finishLoading]);

  useEffect(() => {
    if (phase !== 'complete') return;
    const timer = setTimeout(handleFinish, 500);
    return () => clearTimeout(timer);
  }, [phase, handleFinish]);

  const showFire = phase === 'ignition' || phase === 'launch' || phase === 'approach' || phase === 'landing';
  const showPlanet = (phase === 'approach' || phase === 'landing' || phase === 'complete') && hasMission && loadingMissionId;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #0c1a2e 0%, #020617 50%, #000000 100%)',
      }}
    >
      {/* Star field */}
      <StarField />

      {/* Nebula glow - adapts to mission color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 70%, ${missionColor.glow.replace('0.6', '0.04')} 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(139,92,246,0.04) 0%, transparent 50%)`,
        }}
      />

      {/* Screen flash */}
      <ScreenFlash visible={flash} />

      {/* Screen shake wrapper */}
      <motion.div
        className="relative flex flex-col items-center justify-center w-full h-full"
        animate={
          shaking
            ? {
                x: [0, -3, 4, -2, 3, -1, 2, 0],
                y: [0, 2, -3, 1, -2, 3, -1, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={
          shaking
            ? {
                duration: 0.15,
                repeat: Infinity,
                repeatType: 'loop',
              }
            : { duration: 0.3 }
        }
      >
        {/* Countdown */}
        <AnimatePresence mode="wait">
          {phase === 'countdown' && countdownNum > 0 && (
            <CountdownNumber number={countdownNum} />
          )}
        </AnimatePresence>

        {/* "LAUNCH!" text */}
        <AnimatePresence>
          {phase === 'countdown' && countdownNum === 0 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.5, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span
                className="text-7xl font-black tracking-widest select-none"
                style={{
                  color: '#f97316',
                  textShadow: '0 0 40px rgba(249,115,22,0.8), 0 0 80px rgba(249,115,22,0.4)',
                }}
              >
                LAUNCH!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Planet image - visible during approach/landing/complete if mission is selected */}
        {showPlanet && loadingMissionId && (
          <PlanetImage
            missionId={loadingMissionId}
            visible={showPlanet}
            landed={landed}
          />
        )}

        {/* Rocket assembly */}
        <motion.div
          className="relative z-10"
          initial={{ y: '40vh', opacity: 0 }}
          animate={getRocketAnimation()}
          transition={getRocketTransition()}
        >
          <Rocket scale={1} />
          <FireParticles visible={showFire} />
          <SmokeTrail visible={phase === 'ignition' || phase === 'launch'} />
        </motion.div>

        {/* Mission text at bottom */}
        <motion.div
          className="absolute bottom-12 flex flex-col items-center gap-2 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: phase === 'landing' || phase === 'complete' ? 0 : 1,
            y: 0,
          }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-px w-8 bg-cyan-400/50" />
            <span
              className="text-sm font-mono tracking-[0.3em] uppercase"
              style={{ color: '#22d3ee', textShadow: '0 0 10px rgba(34,211,238,0.5)' }}
            >
              {missionText}
            </span>
            <div className="h-px w-8 bg-cyan-400/50" />
          </div>
          <motion.div
            className="h-1 bg-cyan-400/60 rounded-full"
            style={{ boxShadow: '0 0 8px rgba(34,211,238,0.4)' }}
            initial={{ width: 0 }}
            animate={{ width: phase === 'complete' ? 200 : 120 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* Scanline overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
          }}
        />
      </motion.div>
    </div>
  );
}
