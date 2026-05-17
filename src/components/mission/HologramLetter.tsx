'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Hologram Letter Component ──────────────────────────────────────────
// A single glowing letter in futuristic sci-fi style with glitch effect,
// chromatic aberration, bobbing motion, and scan-line tears.
// Used across mission cards, mission page, and achievements.

type HologramLetterSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<HologramLetterSize, { wrapper: string; text: string }> = {
  sm: {
    wrapper: 'w-8 h-8',
    text: 'text-sm',
  },
  md: {
    wrapper: 'w-10 h-10 sm:w-12 sm:h-12',
    text: 'text-lg sm:text-xl',
  },
  lg: {
    wrapper: 'w-12 h-12 sm:w-14 sm:h-14',
    text: 'text-xl sm:text-2xl',
  },
};

export function HologramLetter({
  letter,
  color,
  size = 'md',
}: {
  letter: string;
  color: string;
  size?: HologramLetterSize;
}) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });
  const [scanTear, setScanTear] = useState(false);

  const sizeClass = SIZE_MAP[size];

  // Random glitch bursts
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.15) {
        setGlitchActive(true);
        setGlitchOffset({
          x: (Math.random() - 0.5) * 6,
          y: (Math.random() - 0.5) * 3,
        });
        if (Math.random() < 0.4) setScanTear(true);

        const duration = 80 + Math.random() * 150;
        setTimeout(() => {
          setGlitchActive(false);
          setGlitchOffset({ x: 0, y: 0 });
          setScanTear(false);
        }, duration);
      }
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex-shrink-0 mt-0.5 ${sizeClass.wrapper} flex items-center justify-center rounded-lg overflow-hidden`}
      role="img"
      aria-label={letter}
      style={{
        fontFamily: "var(--font-orbitron), sans-serif",
        background: `linear-gradient(135deg, ${color}08, ${color}15)`,
        border: `1px solid ${color}40`,
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            ${color}08 2px,
            ${color}08 3px
          )`,
        }}
      />

      {/* Scan tear (horizontal slice offset) */}
      {scanTear && (
        <div
          className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
          style={{
            clipPath: `inset(${30 + Math.random() * 30}% 0 ${30 + Math.random() * 20}% 0)`,
            transform: `translateX(${(Math.random() - 0.5) * 8}px)`,
          }}
        >
          <span
            className={`absolute inset-0 flex items-center justify-center ${sizeClass.text} font-black`}
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color,
              textShadow: `0 0 10px ${color}`,
            }}
          >
            {letter}
          </span>
        </div>
      )}

      {/* Red channel (chromatic aberration - left) */}
      <span
        className={`absolute flex items-center justify-center ${sizeClass.text} font-black z-[3] pointer-events-none`}
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: 'rgba(255,0,50,0.4)',
          transform: `translate(${glitchActive ? -2 : 0}px, ${glitchOffset.y}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {letter}
      </span>

      {/* Blue channel (chromatic aberration - right) */}
      <span
        className={`absolute flex items-center justify-center ${sizeClass.text} font-black z-[3] pointer-events-none`}
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: 'rgba(0,100,255,0.4)',
          transform: `translate(${glitchActive ? 2 : 0}px, ${glitchOffset.y}px)`,
          mixBlendMode: 'screen',
        }}
      >
        {letter}
      </span>

      {/* Main letter with bob + glow */}
      <motion.span
        className={`relative z-[4] ${sizeClass.text} font-black`}
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color,
          textShadow: `0 0 8px ${color}90, 0 0 20px ${color}60, 0 0 40px ${color}30`,
          transform: glitchActive
            ? `translate(${glitchOffset.x}px, ${glitchOffset.y}px)`
            : undefined,
        }}
        animate={{
          y: [0, -3, 0, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {letter}
      </motion.span>

      {/* Flicker overlay */}
      {glitchActive && (
        <div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: `${color}20`,
            animation: 'hologram-flicker 0.1s steps(2) infinite',
          }}
        />
      )}
    </div>
  );
}
