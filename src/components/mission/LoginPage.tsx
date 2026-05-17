'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

// ─── Palette Tokens ──────────────────────────────────────────────────────────
const P = {
  bg:          '#020a12',
  bgSec:       '#0D1B2A',
  card:        '#132238',
  panel:       '#1B2F4A',
  primary:     '#00CEC9',
  primaryHov:  '#00F5FF',
  cyan:        '#00ffcc',
  gold:        '#f5c842',
  green:       '#7DF9C0',
  purple:      '#7B6FFF',
  blue:        '#4DA8FF',
  success:     '#7DF9C0',
  warning:     '#f5c842',
  danger:      '#FF4D00',
  error:       '#FF3B30',
  text:        '#F8FAFC',
  textSec:     '#B8C4D6',
  textMuted:   '#7A8CA5',
};

// ─── Star Field Generator ────────────────────────────────────────────────────
function useStarField(count: number) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      twinkleDelay: Math.random() * 5,
      twinkleDuration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.6 + 0.2,
    }));
  }, [count]);
}

// ─── Constellation Points Generator ──────────────────────────────────────────
function useConstellationPoints() {
  return useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 32; i++) {
      pts.push({ x: Math.random() * 100, y: Math.random() * 100 });
    }
    return pts;
  }, []);
}

// ─── Auth State ──────────────────────────────────────────────────────────────
type AuthState = 'PENDING' | 'VERIFYING' | 'GRANTED' | 'DENIED';

// ─── Static Burst Component ─────────────────────────────────────────────────
function StaticBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {/* Random horizontal displacement bars */}
      {Array.from({ length: 12 }, (_, i) => {
        const top = Math.random() * 100;
        const height = Math.random() * 3 + 1;
        const shift = (Math.random() - 0.5) * 20;
        return (
          <div
            key={`burst-${i}`}
            className="absolute w-full"
            style={{
              top: `${top}%`,
              height: `${height}px`,
              transform: `translateX(${shift}px)`,
              background: `rgba(${Math.random() > 0.5 ? '0,206,201' : '255,59,48'}, ${Math.random() * 0.15 + 0.03})`,
            }}
          />
        );
      })}
      {/* Full-screen white flash */}
      <div
        className="absolute inset-0"
        style={{
          background: `rgba(255,255,255,${Math.random() * 0.04 + 0.01})`,
          mixBlendMode: 'overlay',
        }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
export function LoginPage() {
  const [uid, setUid] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('PENDING');
  const [glitchActive, setGlitchActive] = useState(false);
  const [staticBurst, setStaticBurst] = useState(false);
  const bgmStarted = useRef(false);

  const login = useAppStore((s) => s.login);
  const setLoading = useAppStore((s) => s.setLoading);
  const soundEnabled = useAppStore((s) => s.soundEnabled);

  const stars = useStarField(120);
  const constellationPts = useConstellationPoints();

  useEffect(() => {
    const t = setTimeout(() => { if (soundEnabled) soundEngine.playDeploy(); }, 300);
    return () => clearTimeout(t);
  }, [soundEnabled]);

  // ── Random glitch trigger ───────────────────────────────────────────────
  useEffect(() => {
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150 + Math.random() * 200);
    };
    const triggerBurst = () => {
      setStaticBurst(true);
      setTimeout(() => setStaticBurst(false), 80 + Math.random() * 120);
    };
    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.3) triggerGlitch();
      if (roll < 0.08) triggerBurst();
    }, 3000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, []);

  const tryBGM = useCallback(() => {
    if (!bgmStarted.current) {
      bgmStarted.current = true;
      soundEngine.playBGM();
    }
  }, []);

  const handleUidChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUid(e.target.value);
      if (soundEnabled) soundEngine.playTypeClick();
      tryBGM();
    },
    [tryBGM, soundEnabled]
  );

  const handlePwdChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPwd(e.target.value);
      if (soundEnabled) soundEngine.playTypeClick();
      tryBGM();
    },
    [tryBGM, soundEnabled]
  );

  const AUTH_CREDS = { uid: '2026-0001', pwd: 'AUTOMATA' };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!uid.trim() || !pwd.trim() || authState !== 'PENDING') return;

      if (soundEnabled) soundEngine.playClickFile();
      setAuthState('VERIFYING');
      if (soundEnabled) soundEngine.playStart();

      setTimeout(() => {
        if (uid.trim().toUpperCase() === AUTH_CREDS.uid && pwd.trim().toUpperCase() === AUTH_CREDS.pwd) {
          setAuthState('GRANTED');
          if (soundEnabled) soundEngine.playTransmission();
          setTimeout(() => {
            login(uid.trim());
            setLoading('dashboard');
          }, 800);
        } else {
          setAuthState('DENIED');
          if (soundEnabled) soundEngine.playFade();
          setTimeout(() => {
            setAuthState('PENDING');
            setPwd('');
          }, 2500);
        }
      }, 1400);
    },
    [uid, pwd, authState, login, setLoading, soundEnabled]
  );

  const handleFocus = useCallback(() => { tryBGM(); }, [tryBGM]);

  const authStatusText =
    authState === 'PENDING' ? 'PENDING'
      : authState === 'VERIFYING' ? 'VERIFYING'
        : authState === 'DENIED' ? 'DENIED'
          : 'GRANTED';

  const authSubtext =
    authState === 'PENDING' ? 'AWAITING CLEARANCE INPUT'
      : authState === 'VERIFYING' ? 'DECRYPTING CREDENTIALS...'
        : authState === 'DENIED' ? 'UNAUTHORIZED ACCESS'
          : 'IDENTITY CONFIRMED';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative h-screen w-full overflow-hidden select-none flex flex-col"
      style={{
        background: `radial-gradient(ellipse at 30% 20%, ${P.bgSec} 0%, #020a12 50%, #020a12 100%)`,
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
      onClick={tryBGM}
    >
      {/* ── Keyframe Styles ────────────────────────────────────────── */}
      <style>{`
        html, body { overflow: hidden !important; }

        @keyframes scan {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: var(--star-opacity); }
          50% { opacity: 0.05; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 8px rgba(0,206,201,0.2); }
          50% { box-shadow: 0 0 22px rgba(0,206,201,0.45); }
        }
        @keyframes fadeup {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ── Glitch keyframes for title ── */
        @keyframes glitch-top {
          0%, 88%, 100% { transform: translate(0); }
          90% { transform: translate(-3px, -1px); }
          92% { transform: translate(3px, 1px); }
          94% { transform: translate(-2px, 0); }
          96% { transform: translate(2px, -1px); }
        }
        @keyframes glitch-bottom {
          0%, 85%, 100% { transform: translate(0); }
          87% { transform: translate(2px, 1px); }
          90% { transform: translate(-3px, 0); }
          93% { transform: translate(3px, -1px); }
          95% { transform: translate(-1px, 1px); }
        }
        @keyframes glitch-float {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-4px); }
          50% { transform: translateY(-2px); }
          75% { transform: translateY(-5px); }
        }

        /* ── Background glitch RGB shift ── */
        @keyframes bgGlitchShift {
          0% { clip-path: inset(0 0 0 0); transform: translate(0); }
          20% { clip-path: inset(20% 0 60% 0); transform: translate(-4px, 0); }
          40% { clip-path: inset(50% 0 20% 0); transform: translate(3px, 0); }
          60% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 0); }
          80% { clip-path: inset(70% 0 5% 0); transform: translate(5px, 0); }
          100% { clip-path: inset(0 0 0 0); transform: translate(0); }
        }

        /* ── Scanline drift ── */
        @keyframes scanline-drift {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }

        /* ── Auth state animations ── */
        @keyframes verifyingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes deniedShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }
        @keyframes grantedGlow {
          0% { box-shadow: 0 0 0px rgba(125,249,192,0); }
          50% { box-shadow: 0 0 30px rgba(125,249,192,0.4), 0 0 60px rgba(125,249,192,0.15); }
          100% { box-shadow: 0 0 0px rgba(125,249,192,0); }
        }
        @keyframes cardGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(0,206,201,0.08), inset 0 0 4px rgba(0,206,201,0.03); }
          50% { box-shadow: 0 0 14px rgba(0,206,201,0.2), inset 0 0 8px rgba(0,206,201,0.05); }
        }

        /* ── Flicker for background ── */
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.85; }
          94% { opacity: 1; }
          96% { opacity: 0.9; }
          97% { opacity: 1; }
        }

        /* ── Parallelogram input ── */
        .para-input {
          clip-path: polygon(2% 0%, 100% 0%, 98% 100%, 0% 100%);
          background: linear-gradient(135deg, rgba(5,11,24,0.92), rgba(13,27,42,0.88));
          border: 1px solid rgba(0,206,201,0.18);
          transition: all 0.25s ease;
        }
        .para-input:focus {
          border-color: rgba(0,206,201,0.45);
          box-shadow: -4px 0 14px rgba(0,206,201,0.25), 0 0 8px rgba(0,206,201,0.1);
          background: linear-gradient(135deg, rgba(5,11,24,0.96), rgba(13,27,42,0.94));
        }
        .para-input::placeholder {
          color: rgba(122,140,165,0.5);
          letter-spacing: 0.12em;
          font-size: 11px;
          text-transform: uppercase;
        }
        .para-input:disabled {
          opacity: 0.5;
        }

        /* ── Parallelogram button ── */
        .para-btn {
          clip-path: polygon(1.5% 0%, 100% 0%, 98.5% 100%, 0% 100%);
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .para-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,206,201,0.08), transparent);
          transition: left 0.5s ease;
        }
        .para-btn:hover::before {
          left: 100%;
        }
        .para-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          BACKGROUND LAYERS — all absolute, behind content
          ══════════════════════════════════════════════════════════════════ */}

      {/* ── Star Field ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ animation: 'flicker 8s linear infinite' }}>
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.size > 1.8 ? P.primaryHov : P.text,
              '--star-opacity': star.opacity,
              animation: `twinkle ${star.twinkleDuration}s ease-in-out ${star.twinkleDelay}s infinite`,
              opacity: star.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Nebula Clouds ────────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: '800px', height: '800px', top: '-15%', left: '-10%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(123,111,255,0.07) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '600px', height: '600px', bottom: '-10%', right: '-5%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(0,206,201,0.06) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '400px', height: '400px', top: '30%', left: '50%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(0,206,201,0.03) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* ── Constellation Lines ──────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.12 }}
        preserveAspectRatio="none"
      >
        {constellationPts.slice(0, 26).map((p, i) => {
          const next = constellationPts[i + 1] || constellationPts[0];
          return (
            <line key={`cl-${i}`} x1={`${p.x}%`} y1={`${p.y}%`} x2={`${next.x}%`} y2={`${next.y}%`}
              stroke={P.primary} strokeWidth="0.4" opacity="0.4" />
          );
        })}
        {constellationPts.map((p, i) => (
          <circle key={`cp-${i}`} cx={`${p.x}%`} cy={`${p.y}%`} r="1.2" fill={P.primary} opacity="0.5" />
        ))}
        {[18, 38, 58, 78].map((y, i) => (
          <line key={`dh-${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`}
            stroke={P.primary} strokeWidth="0.25" strokeDasharray="6 14" opacity="0.2" />
        ))}
      </svg>

      {/* ── Grid Overlay ─────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,206,201,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,206,201,0.025) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* ── Radar as Background Element — large, semi-transparent ────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '520px',
          height: '520px',
          left: '5%',
          top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.18,
        }}
      >
        <div
          className="absolute inset-[-8px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(0,206,201,0.08) 50%, transparent 70%)`,
            animation: 'breathe 6s ease-in-out infinite',
          }}
        />
        <svg viewBox="0 0 200 200" className="w-full h-full relative">
          {[25, 50, 75].map((r, i) => (
            <circle key={`rc-${i}`} cx="100" cy="100" r={r} fill="none"
              stroke={P.primary} strokeWidth="0.5" opacity={0.12 + i * 0.03} />
          ))}
          <circle cx="100" cy="100" r="95" fill="none" stroke={P.primary} strokeWidth="1" opacity="0.25" />
          <line x1="100" y1="5" x2="100" y2="195" stroke={P.primary} strokeWidth="0.4" opacity="0.12" />
          <line x1="5" y1="100" x2="195" y2="100" stroke={P.primary} strokeWidth="0.4" opacity="0.12" />
          <line x1="25" y1="25" x2="175" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />
          <line x1="175" y1="25" x2="25" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />

          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10) * Math.PI / 180;
            const inner = i % 3 === 0 ? 88 : 91;
            return (
              <line key={`tick-${i}`}
                x1={100 + inner * Math.cos(angle)} y1={100 + inner * Math.sin(angle)}
                x2={100 + 95 * Math.cos(angle)} y2={100 + 95 * Math.sin(angle)}
                stroke={P.primary} strokeWidth={i % 3 === 0 ? 0.8 : 0.4} opacity={i % 3 === 0 ? 0.3 : 0.12}
              />
            );
          })}

          <g style={{ transformOrigin: '100px 100px', animation: 'radarSweep 4s linear infinite' }}>
            <line x1="100" y1="100" x2="100" y2="5" stroke={P.primary} strokeWidth="1.5" opacity="0.7" />
            <path d="M100,100 L100,15 A85,85 0 0,1 173,47 Z" fill="rgba(0,206,201,0.08)" />
            <path d="M100,100 L173,47 A85,85 0 0,1 185,100 Z" fill="rgba(0,206,201,0.03)" />
          </g>

          <circle cx="68" cy="55" fill={P.primary}>
            <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="145" cy="75" fill={P.primary}>
            <animate attributeName="r" values="1.5;3;1.5" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="105" cy="145" fill={P.gold}>
            <animate attributeName="r" values="2;3.5;2" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="60" cy="120" fill={P.purple}>
            <animate attributeName="r" values="1;2.5;1" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="2.5" fill={P.primary} opacity="0.9" />
        </svg>
      </div>

      {/* ── Glitch Background Layer (RGB split) ──────────────────────────── */}
      {glitchActive && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `rgba(255,59,48,0.03)`,
              animation: 'bgGlitchShift 0.15s linear',
              zIndex: 5,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `rgba(0,206,201,0.03)`,
              animation: 'bgGlitchShift 0.2s linear reverse',
              zIndex: 5,
            }}
          />
        </>
      )}

      {/* ── Static Burst Flash ───────────────────────────────────────────── */}
      <StaticBurst active={staticBurst} />

      {/* ── Scanline — moving bar ────────────────────────────────────────── */}
      <div
        className="absolute left-0 w-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(transparent, rgba(0,206,201,0.08), transparent)',
          animation: 'scan 4s linear infinite',
          zIndex: 50,
        }}
      />

      {/* ── Scanline — full screen overlay ───────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)',
          animation: 'scanline-drift 0.3s linear infinite',
          zIndex: 45,
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════
          TOP BAR
          ══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-2 border-b shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.08)`,
          background: `rgba(5,11,24,0.5)`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="text-[10px] sm:text-[11px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.4)` }}
        >
          XLR8 AUTOMATA-IV // RECURSION NODE // FINALS
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <StatusDot label="HULL INTACT" color="cyan" />
          <StatusDot label="CREW: 0/4" color="cyan" />
          <StatusDot label="COMMS LIVE" color="cyan" pulse />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MAIN CONTENT — single centered hero section
          ══════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden px-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md flex flex-col gap-3"
          style={{
            background: `linear-gradient(180deg, rgba(5,11,24,0.7) 0%, rgba(13,27,42,0.5) 100%)`,
            backdropFilter: 'blur(16px)',
            border: `1px solid rgba(0,206,201,0.08)`,
            borderRadius: '4px',
            padding: '28px 24px',
            animation: 'cardGlow 5s ease-in-out infinite',
          }}
        >
          {/* ── Header: subtitle ── */}
          <div
            className="text-[10px] tracking-[0.2em] uppercase text-center"
            style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.4)` }}
          >
            XLR8 VESSEL // FINALS MISSION IV
          </div>

          {/* ── Title with glitch ── */}
          <div
            className="text-2xl sm:text-3xl font-bold tracking-[0.08em] uppercase text-center"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              animation: 'glitch-float 4s ease-in-out infinite',
            }}
          >
            <span
              style={{
                color: P.primary,
                textShadow: `0 0 20px rgba(0,206,201,0.5), 0 0 40px rgba(0,206,201,0.15)`,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              CREW CLEARANCE
              <span
                style={{
                  position: 'absolute', top: 0, left: 0,
                  color: 'rgba(255,77,0,0.55)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                  animation: 'glitch-top 3s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
              <span
                style={{
                  position: 'absolute', top: 0, left: 0,
                  color: `rgba(0,245,255,0.55)`,
                  clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                  animation: 'glitch-bottom 2.5s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
            </span>
          </div>

          {/* ── Restricted + AES-256 row ── */}
          <div className="w-full flex items-center justify-between">
            <span className="text-[10px] tracking-[0.08em]" style={{ color: P.textMuted }}>
              Restricted terminal — authorized personnel only
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: P.green, boxShadow: `0 0 4px ${P.green}` }} />
              <span className="text-[9px] tracking-[0.12em] uppercase"
                style={{ color: `rgba(125,249,192,0.5)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
                AES-256
              </span>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="w-full flex items-center gap-2">
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.1)` }} />
            <div className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: P.primary, opacity: 0.25 }} />
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.1)` }} />
          </div>

          {/* ── Mission Brief ── */}
          <div
            className="w-full border rounded p-3"
            style={{
              borderColor: `rgba(0,206,201,0.08)`,
              background: `linear-gradient(180deg, rgba(5,11,24,0.5), rgba(13,27,42,0.3))`,
            }}
          >
            <div
              className="text-[9px] tracking-[0.18em] uppercase mb-1"
              style={{ color: `rgba(0,206,201,0.4)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              MISSION BRIEF
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: P.textSec }}>
              XLR8 Vessel inbound on Orbit-IV Lab Node. Docking corridor requires biometric-level crew verification before approach vector is cleared. All unauthorized personnel will be flagged to RECURSION Command. Authenticate to proceed.
            </p>
          </div>

          {/* ── Telemetry Row — inline horizontal status ── */}
          <div className="w-full flex items-center gap-2">
            <TelemetryChip label="O₂" value="98.2%" color={P.green} />
            <TelemetryChip label="THR" value="HOLD" color={P.cyan} />
            <TelemetryChip label="SHD" value="ACT" color={P.green} />
            <TelemetryChip label="FUEL" value="74%" color={P.gold} />
            <TelemetryChip
              label="AUTH"
              value={authStatusText}
              color={
                authState === 'GRANTED' ? P.success
                  : authState === 'VERIFYING' ? P.gold
                    : authState === 'DENIED' ? P.error
                      : P.textMuted
              }
              pulse={authState === 'VERIFYING'}
            />
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2.5">
            {/* Crew Identifier */}
            <div>
              <label
                className="block text-[10px] tracking-[0.18em] uppercase mb-1"
                style={{ color: `rgba(0,206,201,0.5)`, fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                [ Crew Identifier ]
              </label>
              <input
                type="text"
                value={uid}
                onChange={handleUidChange}
                onFocus={handleFocus}
                placeholder="e.g. 2026-0001"
                disabled={authState !== 'PENDING'}
                className="para-input w-full px-4 py-2.5 text-sm outline-none"
                style={{ color: P.text, fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
                autoComplete="username"
              />
            </div>

            {/* Encryption Key */}
            <div>
              <label
                className="block text-[10px] tracking-[0.18em] uppercase mb-1"
                style={{ color: `rgba(0,206,201,0.5)`, fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                [ Encryption Key ]
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={handlePwdChange}
                  onFocus={handleFocus}
                  placeholder="ENTER ENCRYPTION KEY"
                  disabled={authState !== 'PENDING'}
                  className="para-input w-full px-4 py-2.5 pr-10 text-sm outline-none"
                  style={{ color: P.text, fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => { setShowPwd(!showPwd); if (soundEnabled) soundEngine.playClick(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: showPwd ? P.primary : P.textMuted, transition: 'color 0.2s' }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authState !== 'PENDING' || !uid.trim() || !pwd.trim()}
              className="para-btn w-full py-3 text-xs tracking-[0.2em] uppercase cursor-pointer mt-1"
              onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                color: authState === 'GRANTED' ? P.success : authState === 'DENIED' ? P.error : P.primary,
                background: authState === 'GRANTED' ? `rgba(125,249,192,0.08)`
                  : authState === 'DENIED' ? `rgba(255,59,48,0.08)`
                  : authState === 'VERIFYING' ? `rgba(0,206,201,0.04)` : `rgba(0,206,201,0.04)`,
                border: `1px solid ${authState === 'GRANTED' ? `rgba(125,249,192,0.35)`
                  : authState === 'DENIED' ? `rgba(255,59,48,0.35)` : `rgba(0,206,201,0.2)`}`,
                animation: authState === 'GRANTED' ? 'grantedGlow 1s ease-in-out'
                  : authState === 'DENIED' ? 'deniedShake 0.4s ease'
                  : authState === 'PENDING' ? 'breathe 3s ease-in-out infinite' : 'none',
                opacity: authState === 'VERIFYING' ? 0.7 : 1,
              }}
            >
              {authState === 'PENDING' && 'INITIATE CLEARANCE'}
              {authState === 'VERIFYING' && (
                <span style={{ animation: 'verifyingPulse 1s ease-in-out infinite' }}>VERIFYING...</span>
              )}
              {authState === 'GRANTED' && 'CLEARANCE GRANTED'}
              {authState === 'DENIED' && 'ACCESS DENIED'}
            </button>
          </form>

          {/* ── Terminal footer ── */}
          <div className="w-full flex items-center justify-center gap-2">
            <span className="text-[8px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.25)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
              TERMINAL READY
            </span>
            <span style={{ color: `rgba(0,206,201,0.12)` }}>·</span>
            <span className="text-[8px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.25)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
              ENCRYPTION: AES-256-GCM
            </span>
            <span style={{ color: `rgba(0,206,201,0.12)` }}>·</span>
            <span className="text-[8px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.25)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
              {authSubtext}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM BAR
          ══════════════════════════════════════════════════════════════════ */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-2 border-t gap-1 shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.06)`,
          background: `rgba(5,11,24,0.5)`,
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.2)` }}
        >
          HERMOSO ● NUEVAS ● ORENSE ● SANTIAGO ● III - DCSAD
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <BottomStatusItem label="ENCRYPTION" value="AES-256-GCM" />
          <BottomStatusItem label="NODE" value="RECURSION-04" />
          <BottomStatusItem label="STATUS" value="AWAITING CREW" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Status Dot Component ────────────────────────────────────────────────────
function StatusDot({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  const dotColor = color === 'cyan' ? P.primary : P.gold;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: dotColor,
          animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
          boxShadow: `0 0 4px ${dotColor}`,
        }}
      />
      <span
        className="text-[9px] tracking-[0.12em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.35)` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Telemetry Chip — compact inline status ──────────────────────────────────
function TelemetryChip({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div
      className="flex-1 flex flex-col items-center border rounded-sm py-1.5 px-1"
      style={{
        borderColor: 'rgba(0,206,201,0.08)',
        background: 'rgba(5,11,24,0.6)',
      }}
    >
      <div
        className="text-[7px] tracking-[0.15em] uppercase mb-0.5"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: 'rgba(0,206,201,0.3)' }}
      >
        {label}
      </div>
      <div
        className="text-[11px] font-bold tracking-[0.04em] uppercase"
        style={{
          fontFamily: "var(--font-rajdhani), sans-serif",
          color,
          animation: pulse ? 'pulse 0.8s ease-in-out infinite' : 'none',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Bottom Status Item ──────────────────────────────────────────────────────
function BottomStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[8px] sm:text-[9px] tracking-[0.12em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.2)` }}
      >
        {label}:
      </span>
      <span
        className="text-[8px] sm:text-[9px] tracking-[0.1em] uppercase"
        style={{ fontFamily: "var(--font-rajdhani), sans-serif", color: `rgba(0,206,201,0.4)` }}
      >
        {value}
      </span>
    </div>
  );
}
