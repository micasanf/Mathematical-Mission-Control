'use client';

import { useEffect, useMemo, useRef, useCallback, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { missions } from '@/lib/missionData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, LogOut, Rocket, Trophy } from 'lucide-react';
import { HologramLetter } from '@/components/mission/HologramLetter';

// ─── Glitch Planet Component ──────────────────────────────────────────────
// A planet image with holographic glitch: chromatic aberration, scan-line tears,
// occasional flicker bursts, and a gentle holographic bob.
function GlitchPlanet({ src, alt, color }: { src: string; alt: string; color: string }) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0); // 0=none, 1=small, 2=big
  const [scanTearTop, setScanTearTop] = useState(20);
  const [scanTearBot, setScanTearBot] = useState(40);

  // Random glitch bursts
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.1) {
        setGlitchActive(true);
        setGlitchPhase(1);
        setScanTearTop(15 + Math.random() * 25);
        setScanTearBot(40 + Math.random() * 25);
        const dur = 70 + Math.random() * 120;
        setTimeout(() => { setGlitchActive(false); setGlitchPhase(0); }, dur);
      } else if (rand < 0.15) {
        setGlitchActive(true);
        setGlitchPhase(2);
        setScanTearTop(10 + Math.random() * 20);
        setScanTearBot(35 + Math.random() * 30);
        const dur = 120 + Math.random() * 200;
        setTimeout(() => {
          setGlitchPhase(1);
          setTimeout(() => { setGlitchActive(false); setGlitchPhase(0); }, 60);
        }, dur);
      }
    }, 2500 + Math.random() * 3500);

    return () => clearInterval(interval);
  }, []);

  const aberrationX = glitchPhase === 2 ? 4 : glitchPhase === 1 ? 2 : 0;
  const shiftX = glitchActive ? (Math.random() - 0.5) * (glitchPhase === 2 ? 5 : 2) : 0;

  return (
    <div
      className="absolute right-[-20px] top-1/2 translate-y-[-45%] z-0 pointer-events-none"
      style={{
        width: '140px',
        height: '140px',
        transform: `translateY(-45%) translateX(${shiftX}px)`,
      }}
    >
      {/* Red channel ghost (chromatic aberration - left) */}
      {glitchActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translateX(-${aberrationX}px)`,
            mixBlendMode: 'screen',
            opacity: 0.4,
          }}
          aria-hidden="true"
        >
          <Image
            src={src}
            alt=""
            width={140}
            height={140}
            className="object-contain"
            style={{
              filter: `saturate(0) brightness(1.5) drop-shadow(0 0 4px rgba(255,0,50,0.6))`,
            }}
          />
        </div>
      )}

      {/* Blue channel ghost (chromatic aberration - right) */}
      {glitchActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            transform: `translateX(${aberrationX}px)`,
            mixBlendMode: 'screen',
            opacity: 0.4,
          }}
          aria-hidden="true"
        >
          <Image
            src={src}
            alt=""
            width={140}
            height={140}
            className="object-contain"
            style={{
              filter: `saturate(0) brightness(1.5) drop-shadow(0 0 4px rgba(0,100,255,0.6))`,
            }}
          />
        </div>
      )}

      {/* Scan-line tear (horizontal slice displacement) */}
      {glitchPhase === 2 && (
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            clipPath: `inset(${scanTearTop}% 0 ${scanTearBot}% 0)`,
            transform: `translateX(${(Math.random() - 0.5) * 12}px)`,
          }}
          aria-hidden="true"
        >
          <Image
            src={src}
            alt=""
            width={140}
            height={140}
            className="object-contain"
            style={{
              opacity: 0.8,
              filter: `drop-shadow(0 0 8px ${color}90)`,
              mixBlendMode: 'screen',
            }}
          />
        </div>
      )}

      {/* Main planet image */}
      <motion.div
        className="absolute inset-0 group-hover:opacity-55 transition-opacity duration-500"
        style={{ opacity: 0.35 }}
        animate={{
          y: [0, -4, 0, -2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={140}
          height={140}
          className="object-contain w-full h-full"
          style={{
            filter: `drop-shadow(0 0 12px ${color}60) drop-shadow(0 0 24px ${color}30)`,
            mixBlendMode: 'screen',
          }}
        />
      </motion.div>

      {/* Scan-line overlay on planet */}
      <div
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            ${color}06 3px,
            ${color}06 4px
          )`,
        }}
        aria-hidden="true"
      />

      {/* Flicker overlay */}
      {glitchActive && (
        <div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `${color}12`,
            mixBlendMode: 'overlay',
            animation: 'card-glitch-flicker 0.08s steps(3) infinite',
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ─── Glitch Card Wrapper ──────────────────────────────────────────────
// Wraps a card with holographic glitch effects: chromatic aberration,
// scan-line tears, and occasional flicker distortion on the whole card.
function GlitchCard({ children, color }: { children: React.ReactNode; color: string }) {
  const [glitchActive, setGlitchActive] = useState(false);
  const [glitchPhase, setGlitchPhase] = useState(0); // 0=none, 1=small, 2=big
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.08) {
        // Small glitch
        setGlitchActive(true);
        setGlitchPhase(1);
        const dur = 60 + Math.random() * 100;
        setTimeout(() => { setGlitchActive(false); setGlitchPhase(0); }, dur);
      } else if (rand < 0.12) {
        // Big glitch
        setGlitchActive(true);
        setGlitchPhase(2);
        const dur = 100 + Math.random() * 180;
        setTimeout(() => {
          // Brief second hit
          setGlitchPhase(1);
          setTimeout(() => { setGlitchActive(false); setGlitchPhase(0); }, 50);
        }, dur);
      }
    }, 3000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  const aberrationX = glitchPhase === 2 ? 3 : glitchPhase === 1 ? 1.5 : 0;
  const shiftX = glitchActive ? (Math.random() - 0.5) * (glitchPhase === 2 ? 4 : 1.5) : 0;
  const shiftY = glitchActive ? (Math.random() - 0.5) * (glitchPhase === 2 ? 2 : 0.5) : 0;

  return (
    <div ref={cardRef} className="relative" style={{ transform: `translate(${shiftX}px, ${shiftY}px)` }}>
      {/* Red channel ghost (left offset) */}
      {glitchActive && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-[1]"
          style={{
            transform: `translateX(-${aberrationX}px)`,
            border: `1px solid rgba(255,0,50,0.15)`,
            background: 'rgba(255,0,50,0.03)',
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{ opacity: 0.5 }}>
            {children}
          </div>
        </div>
      )}

      {/* Blue channel ghost (right offset) */}
      {glitchActive && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-[1]"
          style={{
            transform: `translateX(${aberrationX}px)`,
            border: `1px solid rgba(0,100,255,0.15)`,
            background: 'rgba(0,100,255,0.03)',
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{ opacity: 0.5 }}>
            {children}
          </div>
        </div>
      )}

      {/* Scan-line tear (horizontal slice displacement) */}
      {glitchPhase === 2 && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none z-[2]"
          style={{
            clipPath: `inset(${15 + Math.random() * 20}% 0 ${55 + Math.random() * 20}% 0)`,
            transform: `translateX(${(Math.random() - 0.5) * 10}px)`,
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0" style={{ opacity: 0.7 }}>
            {children}
          </div>
        </div>
      )}

      {/* Flicker overlay */}
      {glitchActive && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none z-[3]"
          style={{
            background: `${color}08`,
            mixBlendMode: 'overlay',
            animation: 'card-glitch-flicker 0.1s steps(3) infinite',
          }}
          aria-hidden="true"
        />
      )}

      {/* Scan-line overlay on the card */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-[4]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(0,0,0,0.03) 3px,
            rgba(0,0,0,0.03) 4px
          )`,
        }}
        aria-hidden="true"
      />

      {/* Actual card content */}
      <div className="relative z-[5]">
        {children}
      </div>
    </div>
  );
}

// Planet image mapping for each mission
const PLANET_IMAGES: Record<string, string> = {
  collatz: '/planets/planet-collatz.png',
  fibonacci: '/planets/planet-fibonacci.png',
  tribonacci: '/planets/planet-tribonacci.png',
  lucas: '/planets/planet-lucas.png',
  euclidean: '/planets/planet-euclidean.png',
  division: '/planets/planet-division.png',
  palindrome: '/planets/planet-palindrome.png',
};

// Color mapping for neon glow effects
const COLOR_MAP: Record<string, { hex: string; tailwind: string; bg: string; border: string; shadow: string }> = {
  solar: {
    hex: '#00D2FF',
    tailwind: 'text-cyan-400',
    bg: 'rgba(0, 210, 255, 0.08)',
    border: 'rgba(0, 210, 255, 0.25)',
    shadow: '0 0 15px rgba(0,210,255,0.3), 0 0 30px rgba(0,210,255,0.1)',
  },
  quantum: {
    hex: '#00FF9F',
    tailwind: 'text-green-400',
    bg: 'rgba(0, 255, 159, 0.08)',
    border: 'rgba(0, 255, 159, 0.25)',
    shadow: '0 0 15px rgba(0,255,159,0.3), 0 0 30px rgba(0,255,159,0.1)',
  },
  nova: {
    hex: '#FF50B4',
    tailwind: 'text-pink-400',
    bg: 'rgba(255, 80, 180, 0.08)',
    border: 'rgba(255, 80, 180, 0.25)',
    shadow: '0 0 15px rgba(255,80,180,0.3), 0 0 30px rgba(255,80,180,0.1)',
  },
  pulsar: {
    hex: '#FF8C00',
    tailwind: 'text-orange-400',
    bg: 'rgba(255, 140, 0, 0.08)',
    border: 'rgba(255, 140, 0, 0.25)',
    shadow: '0 0 15px rgba(255,140,0,0.3), 0 0 30px rgba(255,140,0,0.1)',
  },
  crimson: {
    hex: '#FF5C2E',
    tailwind: 'text-orange-500',
    bg: 'rgba(255, 92, 46, 0.08)',
    border: 'rgba(255, 92, 46, 0.25)',
    shadow: '0 0 15px rgba(255,92,46,0.3), 0 0 30px rgba(255,92,46,0.1)',
  },
  warp: {
    hex: '#B44DFF',
    tailwind: 'text-purple-400',
    bg: 'rgba(180, 77, 255, 0.08)',
    border: 'rgba(180, 77, 255, 0.25)',
    shadow: '0 0 15px rgba(180,77,255,0.3), 0 0 30px rgba(180,77,255,0.1)',
  },
  amber: {
    hex: '#FFD700',
    tailwind: 'text-yellow-400',
    bg: 'rgba(255, 215, 0, 0.08)',
    border: 'rgba(255, 215, 0, 0.25)',
    shadow: '0 0 15px rgba(255,215,0,0.3), 0 0 30px rgba(255,215,0,0.1)',
  },
};

const TOTAL_SECTIONS = 8;

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ─── Circuit Board Background (soulextract-inspired) ────────────────────────
function CircuitBoard() {
  // Generate circuit paths as SVG polylines
  const circuits = useMemo(() => {
    const paths: { points: string; delay: number; duration: number }[] = [];
    // Horizontal traces
    for (let i = 0; i < 12; i++) {
      const y = 5 + Math.random() * 90;
      const segments = 2 + Math.floor(Math.random() * 3);
      let pts: [number, number][] = [[0, y]];
      let cx = 0;
      for (let s = 0; s < segments; s++) {
        const nx = cx + 10 + Math.random() * 30;
        const ny = y + (Math.random() - 0.5) * 8;
        pts.push([nx, ny]);
        cx = nx;
      }
      // Extend to edge
      pts.push([100, pts[pts.length - 1][1]]);
      paths.push({
        points: pts.map(([x, y]) => `${x},${y}`).join(' '),
        delay: Math.random() * 8,
        duration: 3 + Math.random() * 4,
      });
    }
    // Vertical traces
    for (let i = 0; i < 8; i++) {
      const x = 5 + Math.random() * 90;
      const segments = 2 + Math.floor(Math.random() * 2);
      let pts: [number, number][] = [[x, 0]];
      let cy = 0;
      for (let s = 0; s < segments; s++) {
        const ny = cy + 10 + Math.random() * 25;
        const nx = x + (Math.random() - 0.5) * 6;
        pts.push([nx, ny]);
        cy = ny;
      }
      pts.push([pts[pts.length - 1][0], 100]);
      paths.push({
        points: pts.map(([x, y]) => `${x},${y}`).join(' '),
        delay: Math.random() * 8,
        duration: 3 + Math.random() * 4,
      });
    }
    return paths;
  }, []);

  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {circuits.map((c, i) => (
        <polyline
          key={i}
          points={c.points}
          fill="none"
          stroke="rgba(0,206,201,0.06)"
          strokeWidth="0.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <animate
            attributeName="stroke-dasharray"
            from="0 200"
            to="200 0"
            dur={`${c.duration}s`}
            begin={`${c.delay}s`}
            repeatCount="indefinite"
          />
        </polyline>
      ))}
      {/* Traveling light pulses on some circuits */}
      {circuits.slice(0, 6).map((c, i) => (
        <polyline
          key={`pulse-${i}`}
          points={c.points}
          fill="none"
          stroke="rgba(0,206,201,0.25)"
          strokeWidth="0.12"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;0;0.8;0.8;0"
            keyTimes="0;0.1;0.15;0.85;1"
            dur={`${c.duration + 2}s`}
            begin={`${c.delay + 2}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="stroke-dasharray"
            from="0 0 2 200"
            to="0 200 2 0"
            dur={`${c.duration + 2}s`}
            begin={`${c.delay + 2}s`}
            repeatCount="indefinite"
          />
        </polyline>
      ))}
      {/* Junction dots at circuit intersections */}
      {circuits.slice(0, 8).map((c, i) => {
        const pts = c.points.split(' ');
        const mid = pts[Math.floor(pts.length / 2)];
        if (!mid) return null;
        const [x, y] = mid.split(',').map(Number);
        return (
          <circle
            key={`dot-${i}`}
            cx={x}
            cy={y}
            r="0.25"
            fill="rgba(0,206,201,0.15)"
          >
            <animate
              attributeName="opacity"
              values="0.15;0.6;0.15"
              dur={`${2 + Math.random() * 3}s`}
              begin={`${Math.random() * 5}s`}
              repeatCount="indefinite"
            />
          </circle>
        );
      })}
    </svg>
  );
}

// ─── Data Rain / Matrix Effect ──────────────────────────────────────────────
function DataRain() {
  const columns = useMemo(() => {
    return Array.from({ length: 35 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      speed: 4 + Math.random() * 8,
      delay: Math.random() * 10,
      chars: Array.from({ length: 8 + Math.floor(Math.random() * 12) }, () =>
        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
      ),
      opacity: 0.04 + Math.random() * 0.08,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {columns.map((col) => (
        <div
          key={col.id}
          className="absolute top-0"
          style={{
            left: `${col.x}%`,
            fontFamily: "var(--font-share-tech-mono), monospace",
            fontSize: '11px',
            lineHeight: '1.3',
            color: `rgba(0, 206, 201, ${col.opacity})`,
            writingMode: 'vertical-rl',
            textOrientation: 'upright',
            animation: `data-rain ${col.speed}s linear ${col.delay}s infinite`,
            textShadow: `0 0 4px rgba(0,206,201,${col.opacity * 2})`,
          }}
        >
          {col.chars.join('')}
        </div>
      ))}
    </div>
  );
}

// ─── Glitch Tear Lines (horizontal displacement bands) ──────────────────────
function GlitchTears() {
  const tears = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => ({
      id: i,
      top: 10 + Math.random() * 80,
      height: 1 + Math.random() * 3,
      shift: 3 + Math.random() * 8,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {tears.map((t) => (
        <div
          key={t.id}
          className="absolute left-0 right-0"
          style={{
            top: `${t.top}%`,
            height: `${t.height}px`,
            background: 'rgba(0,206,201,0.02)',
            animation: `glitch-tear ${t.duration}s ease-in-out ${t.delay}s infinite`,
            '--tear-shift': `${t.shift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Scan Lines (soulextract-style, 10px spaced) ────────────────────────────
function ScanLines() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {Array.from({ length: 100 }, (_, i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            top: `${i * 10}px`,
            height: '1px',
            background: 'rgba(0,206,201,0.015)',
            boxShadow: '0 0 1px rgba(0,20,30,0.3)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Noise Grain Overlay ────────────────────────────────────────────────────
function NoiseGrain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 3,
        opacity: 0.035,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '128px 128px',
        animation: 'noise-shift 0.15s steps(3) infinite',
      }}
    />
  );
}

// ─── Radial Glow (soulextract-inspired) ─────────────────────────────────────
function RadialGlow() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1,
        backgroundImage: 'radial-gradient(rgba(0,206,201,0.06) 15%, transparent 60%)',
        animation: 'glow-pulse 8s ease-in-out infinite alternate',
      }}
    />
  );
}

// ─── HUD Data Stream Ticker ─────────────────────────────────────────────────
function HUDTicker() {
  const text = useMemo(() => [
    'SYS_INIT OK  NAV_LOCK OK  FUEL_PRES 98.4%  MAIN_ENG: STANDBY',
    'TRAJECTORY: COMPUTED  RANGE_SAFETY: CLEAR  COMMS: NOMINAL',
    'ARC-7 NOVA ONLINE  SECTOR 7G  ALT: 42800m  VEL: 2840 m/s',
    'MISSION STATUS: ACTIVE  CREW: ONLINE  LIFE_SUPPORT: NOMINAL',
    'DATA_UPLINK: 98.7%  TELEMETRY: GREEN  ORBIT: STABLE',
  ].join('    ///    '), []);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 4,
        height: '18px',
        background: 'rgba(5,11,24,0.7)',
        borderTop: '1px solid rgba(0,206,201,0.1)',
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-share-tech-mono), monospace",
          fontSize: '9px',
          color: 'rgba(0,206,201,0.25)',
          lineHeight: '18px',
          whiteSpace: 'nowrap',
          animation: 'ticker-scroll 40s linear infinite',
          textShadow: '0 0 4px rgba(0,206,201,0.15)',
        }}
      >
        {text}&nbsp;&nbsp;&nbsp;&nbsp;///&nbsp;&nbsp;&nbsp;&nbsp;{text}
      </div>
    </div>
  );
}

// ─── Floating Hex Grid (subtle background pattern) ──────────────────────────
function HexGrid() {
  const hexes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 30 + Math.random() * 60,
      opacity: 0.015 + Math.random() * 0.02,
      duration: 20 + Math.random() * 30,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {hexes.map((h) => (
        <div
          key={h.id}
          className="absolute"
          style={{
            left: `${h.x}%`,
            top: `${h.y}%`,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
            animation: `hex-float ${h.duration}s ease-in-out infinite alternate`,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon
              points="50,3 95,25 95,75 50,97 5,75 5,25"
              fill="none"
              stroke="rgba(0,206,201,0.5)"
              strokeWidth="1"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const username = useAppStore((s) => s.username);
  const progress = useAppStore((s) => s.progress);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const goToLanding = useAppStore((s) => s.goToLanding);
  const logout = useAppStore((s) => s.logout);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);

  // Get mission progress helper
  const getMissionProgress = (missionId: string) => {
    return progress?.missions.find((m) => m.id === missionId);
  };

  // Calculate progress percentage
  const getProgressPercent = (missionId: string) => {
    const mp = getMissionProgress(missionId);
    if (!mp) return 0;
    const sectionPercent = (mp.sectionsViewed.length / TOTAL_SECTIONS) * 80; // sections = 80%
    const quizPercent = mp.quizPassed ? 20 : 0; // quiz = 20%
    return Math.min(100, Math.round(sectionPercent + quizPercent));
  };

  // Deploy sound on mount
  useEffect(() => {
    if (soundEnabled) soundEngine.playDeploy();
  }, [soundEnabled]);

  // Handle launch mission — go directly to landing animation (no liftoff)
  const handleLaunchMission = (missionId: string) => {
    if (soundEnabled) soundEngine.playClick();
    goToLanding(missionId);
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    if (soundEnabled) soundEngine.playClick();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEngine.setMuted(!newState);
  };

  // Handle logout
  const handleLogout = () => {
    if (soundEnabled) soundEngine.playClick();
    logout();
  };

  // Get unlocked achievements
  const unlockedAchievements = progress?.achievements.filter((a) => a.unlockedAt) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* ─── All keyframe styles for background effects ─── */}
      <style>{`
        @keyframes dash-glitch-top {
          0%, 92%, 100% { transform: translate(0); }
          93% { transform: translate(-2px, -1px); }
          95% { transform: translate(2px, 1px); }
          97% { transform: translate(-1px, 0); }
          99% { transform: translate(1px, -1px); }
        }
        @keyframes dash-glitch-bottom {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(1px, 1px); }
          94% { transform: translate(-2px, 0); }
          96% { transform: translate(2px, -1px); }
          98% { transform: translate(-1px, 1px); }
        }
        @keyframes data-rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes glitch-tear {
          0%, 88%, 100% { transform: translateX(0); opacity: 0; }
          90% { transform: translateX(var(--tear-shift)); opacity: 1; }
          92% { transform: translateX(calc(var(--tear-shift) * -0.5)); opacity: 0.8; }
          94% { transform: translateX(calc(var(--tear-shift) * 0.3)); opacity: 0.4; }
          96% { transform: translateX(0); opacity: 0; }
        }
        @keyframes noise-shift {
          0% { transform: translate(0, 0); }
          33% { transform: translate(-2px, 1px); }
          66% { transform: translate(1px, -2px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes glow-pulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.7; }
        }
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes hex-float {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(-15px) rotate(5deg); }
        }
        @keyframes screen-flicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.92; }
          97% { opacity: 1; }
          98% { opacity: 0.95; }
        }
        @keyframes hologram-flicker {
          0% { opacity: 1; }
          25% { opacity: 0.3; }
          50% { opacity: 0.9; }
          75% { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes card-glitch-flicker {
          0% { opacity: 0.6; }
          33% { opacity: 0.2; }
          66% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        @keyframes card-float-0 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes card-float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes card-float-2 {
          0%, 100% { transform: translateY(-2px); }
          50% { transform: translateY(-11px); }
        }
        @keyframes card-float-3 {
          0%, 100% { transform: translateY(-1px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes card-float-4 {
          0%, 100% { transform: translateY(-3px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes card-float-5 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-7px); }
        }
        @keyframes glitch-float {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-4px); }
          50% { transform: translateY(-2px); }
          75% { transform: translateY(-5px); }
        }
      `}</style>

      {/* ─── Layer 0: Deep dark background ─── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: '#050B18',
          zIndex: 0,
        }}
      />

      {/* ─── Layer 1: Circuit board traces ─── */}
      <CircuitBoard />

      {/* ─── Layer 2: Data rain / matrix ─── */}
      <DataRain />

      {/* ─── Layer 3: Hex grid ─── */}
      <HexGrid />

      {/* ─── Layer 4: Radial glow ─── */}
      <RadialGlow />

      {/* ─── Layer 5: Scan lines (soulextract-style) ─── */}
      <ScanLines />

      {/* ─── Layer 6: Glitch tear lines ─── */}
      <GlitchTears />

      {/* ─── Layer 7: Noise grain ─── */}
      <NoiseGrain />

      {/* ─── Layer 8: HUD ticker ─── */}
      <HUDTicker />

      {/* ─── Layer 9: Screen flicker overlay ─── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          animation: 'screen-flicker 8s linear infinite',
        }}
      />

      {/* ─── Main content ─── */}
      <div className="relative z-10 flex flex-col min-h-screen" style={{ animation: 'screen-flicker 8s linear infinite' }}>
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full border-b"
          style={{
            background: 'rgba(5, 11, 24, 0.88)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(0, 206, 201, 0.12)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: Title with glitch */}
            <div className="flex items-center gap-3 shrink-0">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00CEC9' }} />
              <h1
                className="text-sm sm:text-lg lg:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em]"
                style={{
                  color: '#00CEC9',
                  textShadow:
                    '0 0 10px rgba(0,206,201,0.8), 0 0 20px rgba(0,206,201,0.4), 0 0 40px rgba(0,206,201,0.2)',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                MISSION CONTROL
                {/* Glitch top layer */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'rgba(255,0,80,0.5)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                    animation: 'dash-glitch-top 4s infinite linear alternate-reverse',
                  }}
                >MISSION CONTROL</span>
                {/* Glitch bottom layer */}
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'rgba(0,200,255,0.5)',
                    clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                    animation: 'dash-glitch-bottom 3.5s infinite linear alternate-reverse',
                  }}
                >MISSION CONTROL</span>
              </h1>
            </div>

            {/* Center: Welcome message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="hidden sm:block text-center"
            >
              <p
                className="text-sm lg:text-base font-medium tracking-wider relative inline-block"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  animation: 'glitch-float 4s ease-in-out infinite',
                }}
              >
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  Commander{' '}
                  <span
                    style={{
                      color: '#00CEC9',
                      textShadow: '0 0 20px rgba(0,206,201,0.5), 0 0 40px rgba(0,206,201,0.15)',
                    }}
                  >
                    {username}
                  </span>
                  {/* Glitch top layer */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      color: 'rgba(255,77,0,0.6)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                      animation: 'dash-glitch-top 4s infinite linear alternate-reverse',
                    }}
                  >
                    Commander {username}
                  </span>
                  {/* Glitch bottom layer */}
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      color: 'rgba(123,111,255,0.6)',
                      clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                      animation: 'dash-glitch-bottom 3.5s infinite linear alternate-reverse',
                    }}
                  >
                    Commander {username}
                  </span>
                </span>
              </p>
            </motion.div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile welcome */}
              <span
                className="sm:hidden text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Cdr.{' '}
                <span style={{ color: '#00CEC9' }}>
                  {username}
                </span>
              </span>

              {/* Sound toggle */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSoundToggle}
                  className="h-9 w-9 rounded-lg"
                  style={{
                    background: soundEnabled
                      ? 'rgba(0, 206, 201, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${soundEnabled ? 'rgba(0, 206, 201, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: soundEnabled ? '#00CEC9' : 'rgba(255,255,255,0.4)',
                  }}
                  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </motion.div>

              {/* Logout button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider"
                  style={{
                    background: 'rgba(255, 77, 0, 0.08)',
                    border: '1px solid rgba(255, 77, 0, 0.3)',
                    color: '#FF4D00',
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 sm:mr-2" />
                  <span className="hidden sm:inline">EXIT MISSION</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 pb-10">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Available Missions
            </h2>
            <div
              className="mt-2 h-px w-48"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,206,201,0.5), rgba(123,111,255,0.3), transparent)',
              }}
            />
          </motion.div>

          {/* Mission cards grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {missions.map((mission, index) => {
              const colors = COLOR_MAP[mission.color] || COLOR_MAP.solar;
              const mp = getMissionProgress(mission.id);
              const progressPercent = getProgressPercent(mission.id);
              const isCompleted = mp?.completed ?? false;
              const quizPassed = mp?.quizPassed ?? false;
              const sectionsCount = mp?.sectionsViewed.length ?? 0;

              return (
                <div
                  key={mission.id}
                  style={{
                    animation: `card-float-${index % 6} ${3.5 + index * 0.4}s ease-in-out ${0.8 + index * 0.3}s infinite`,
                  }}
                >
                <motion.div
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.25 },
                  }}
                  onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
                  className="group"
                >
                <GlitchCard color={colors.hex}>
                  <Card
                    className="relative overflow-hidden rounded-xl border-0 p-0 cursor-pointer transition-shadow duration-300"
                    style={{
                      background: 'rgba(5, 11, 24, 0.82)',
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${colors.border}`,
                      boxShadow: colors.shadow,
                    }}
                  >
                    {/* Holographic top accent line */}
                    <div
                      className="h-[2px] w-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.hex}, transparent)`,
                      }}
                    />

                    {/* Planet image - glitching holographic planet */}
                    {PLANET_IMAGES[mission.id] && (
                      <GlitchPlanet
                        src={PLANET_IMAGES[mission.id]}
                        alt={`${mission.title} planet`}
                        color={colors.hex}
                      />
                    )}

                    <div className="relative z-10 p-5 sm:p-6">
                      {/* Mission icon + title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <HologramLetter
                          letter={mission.icon.replace(/[\[\]]/g, '')}
                          color={colors.hex}
                        />
                        <div className="min-w-0">
                          <h3
                            className="text-base sm:text-lg font-bold tracking-wide leading-tight"
                            style={{
                              color: colors.hex,
                              textShadow: `0 0 8px ${colors.hex}80, 0 0 16px ${colors.hex}40`,
                            }}
                          >
                            {mission.title}
                          </h3>
                          <p
                            className="text-xs font-medium tracking-wider mt-0.5"
                            style={{ color: `${colors.hex}99` }}
                          >
                            {mission.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Description (2 lines max) */}
                      <p
                        className="text-xs sm:text-sm leading-relaxed mb-4"
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {mission.description}
                      </p>

                      {/* Progress section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[10px] sm:text-xs font-medium tracking-wider uppercase"
                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            Mission Progress
                          </span>
                          <div className="flex items-center gap-2">
                            {quizPassed && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 border-0 font-semibold"
                                style={{
                                  background: `${colors.hex}20`,
                                  color: colors.hex,
                                }}
                              >
                                QUIZ PASSED
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 border-0 font-semibold"
                                style={{
                                  background: 'rgba(125, 249, 192, 0.2)',
                                  color: '#7DF9C0',
                                }}
                              >
                                COMPLETE
                              </Badge>
                            )}
                            <span
                              className="text-[10px] sm:text-xs font-mono font-bold"
                              style={{ color: colors.hex }}
                            >
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={progressPercent}
                            className="h-1.5 sm:h-2 rounded-full"
                            style={{
                              background: `${colors.hex}15`,
                            }}
                          />
                          {/* Custom indicator color override */}
                          <style>{`
                            [data-mission-progress="${mission.id}"] > [data-slot="progress-indicator"] {
                              background: ${colors.hex} !important;
                              box-shadow: 0 0 6px ${colors.hex}60;
                            }
                          `}</style>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className="text-[9px] sm:text-[10px] tracking-wider"
                            style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                          >
                            {sectionsCount}/{TOTAL_SECTIONS} sections
                          </span>
                          {mp?.quizScore !== null && mp?.quizScore !== undefined && (
                            <span
                              className="text-[9px] sm:text-[10px] tracking-wider"
                              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                            >
                              Score: {mp.quizScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Launch button */}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
                      >
                        <Button
                          onClick={() => handleLaunchMission(mission.id)}
                          className="w-full h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-bold tracking-[0.15em] uppercase border-0 transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}25)`,
                            color: colors.hex,
                            border: `1px solid ${colors.border}`,
                            boxShadow: `0 0 10px ${colors.hex}20, inset 0 0 10px ${colors.hex}08`,
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = `0 0 20px ${colors.hex}40, 0 0 40px ${colors.hex}15, inset 0 0 15px ${colors.hex}10`;
                            el.style.background = `linear-gradient(135deg, ${colors.hex}20, ${colors.hex}35)`;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = `0 0 10px ${colors.hex}20, inset 0 0 10px ${colors.hex}08`;
                            el.style.background = `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}25)`;
                          }}
                        >
                          <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                          LAUNCH MISSION
                        </Button>
                      </motion.div>
                    </div>

                    {/* Holographic corner accents */}
                    <div
                      className="absolute top-0 left-0 w-5 h-5"
                      style={{
                        borderTop: `1px solid ${colors.hex}50`,
                        borderLeft: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-5 h-5"
                      style={{
                        borderTop: `1px solid ${colors.hex}50`,
                        borderRight: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-5 h-5"
                      style={{
                        borderBottom: `1px solid ${colors.hex}50`,
                        borderLeft: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-5 h-5"
                      style={{
                        borderBottom: `1px solid ${colors.hex}50`,
                        borderRight: `1px solid ${colors.hex}50`,
                      }}
                    />

                    {/* Ambient glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at center, ${colors.hex}08, transparent 70%)`,
                      }}
                    />
                  </Card>
                </GlitchCard>
                </motion.div>
                </div>
              );
            })}
          </motion.div>
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-10 sm:mt-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="w-5 h-5" style={{ color: '#FFC857' }} />
              <h2
                className="text-lg sm:text-xl font-bold tracking-wider uppercase"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                Achievements
              </h2>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,200,87,0.4), rgba(123,111,255,0.2), transparent)',
                }}
              />
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-0 font-mono"
                style={{
                  background: 'rgba(255, 200, 87, 0.1)',
                  color: '#FFC857',
                  border: '1px solid rgba(255, 200, 87, 0.2)',
                }}
              >
                {unlockedAchievements.length} / {progress?.achievements.length ?? 8}
              </Badge>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      className="rounded-lg border-0 p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(5, 11, 24, 0.75)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 200, 87, 0.2)',
                        boxShadow: '0 0 10px rgba(255, 200, 87, 0.1)',
                      }}
                    >
                      {/* Gold accent line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #FFC857, transparent)',
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <HologramLetter
                          letter={achievement.icon.replace(/[\[\]]/g, '')}
                          color="#FFC857"
                          size="sm"
                        />
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold tracking-wide truncate"
                            style={{
                              color: '#FFC857',
                              textShadow: '0 0 6px rgba(255, 200, 87, 0.4)',
                            }}
                          >
                            {achievement.name}
                          </p>
                          <p
                            className="text-[10px] sm:text-xs mt-0.5 leading-snug"
                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card
                className="rounded-lg border-0 p-6 sm:p-8 text-center"
                style={{
                  background: 'rgba(5, 11, 24, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(0, 206, 201, 0.08)',
                }}
              >
                <Trophy
                  className="w-8 h-8 mx-auto mb-3"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                />
                <p
                  className="text-sm font-medium tracking-wider"
                  style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                >
                  No achievements unlocked yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                >
                  Complete missions and pass quizzes to earn achievements
                </p>
              </Card>
            )}
          </motion.section>
        </main>

        {/* Footer */}
        <footer
          className="mt-auto border-t py-4 text-center"
          style={{
            background: 'rgba(5, 11, 24, 0.7)',
            borderColor: 'rgba(0, 206, 201, 0.08)',
          }}
        >
          <p
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase"
            style={{ color: 'rgba(0, 206, 201, 0.25)', textShadow: '0 0 4px rgba(0,206,201,0.15)' }}
          >
            Mathematical Mission Control v1.0 — All Systems Operational
          </p>
        </footer>
      </div>
    </div>
  );
}
