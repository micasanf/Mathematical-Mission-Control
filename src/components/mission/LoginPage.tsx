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

// ─── Main Component ─────────────────────────────────────────────────────────
export function LoginPage() {
  const [uid, setUid] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [authState, setAuthState] = useState<AuthState>('PENDING');
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
        background: `radial-gradient(ellipse at 15% 0%, ${P.bgSec} 0%, #020a12 45%, #020a12 100%)`,
        fontFamily: "var(--font-rajdhani), sans-serif",
      }}
      onClick={tryBGM}
    >
      {/* ── Keyframe Styles ────────────────────────────────────────── */}
      <style>{`
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
        @keyframes scanline-drift {
          0% { background-position: 0 0; }
          100% { background-position: 0 4px; }
        }
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
          0%, 100% { box-shadow: 0 0 4px rgba(0,206,201,0.06), inset 0 0 3px rgba(0,206,201,0.02); }
          50% { box-shadow: 0 0 8px rgba(0,206,201,0.15), inset 0 0 6px rgba(0,206,201,0.03); }
        }

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
      `}</style>

      {/* ── Background: Animated Star Field ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

      {/* ── Background: Nebula Clouds ────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: '600px', height: '600px', top: '-10%', left: '-5%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(123,111,255,0.06) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '500px', height: '500px', bottom: '-8%', right: '-3%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(0,206,201,0.05) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Background: Constellation Lines ──────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.15 }}
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

      {/* ── Background: Grid Overlay ─────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,206,201,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,206,201,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '120px 120px',
        }}
      />

      {/* ── Scanline Effect ──────────────────────────────────────────── */}
      <div
        className="absolute left-0 w-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(transparent, rgba(0,206,201,0.1), transparent)',
          animation: 'scan 5s linear infinite',
          zIndex: 50,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          animation: 'scanline-drift 0.3s linear infinite',
          zIndex: 45,
        }}
      />

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-1.5 border-b shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.1)`,
          background: `rgba(5,11,24,0.65)`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.5)` }}
        >
          XLR8 AUTOMATA-IV // RECURSION NODE // FINALS
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <StatusDot label="HULL INTACT" color="cyan" />
          <StatusDot label="CREW: 0/4" color="cyan" />
          <StatusDot label="COMMS LIVE" color="cyan" pulse />
        </div>
      </div>

      {/* ── Main Content: Two Column Layout ──────────────────────────── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-12 px-4 sm:px-6 py-3 lg:py-2 overflow-auto">

        {/* ── Left Column: Radar + Individual Status Cards ─────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="flex flex-col items-center gap-2 w-full max-w-[260px]"
        >
          {/* Sector label */}
          <div className="text-center">
            <div
              className="text-[8px] tracking-[0.3em] uppercase"
              style={{ color: `rgba(0,206,201,0.4)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              Orbit Sector
            </div>
            <div
              className="text-[11px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.75)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              ORBIT-IV &middot; LAB NODE
            </div>
          </div>

          {/* Radar SVG — compact */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40">
            <div
              className="absolute inset-[-4px] rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(0,206,201,0.04) 60%, transparent 70%)`,
                animation: 'breathe 4s ease-in-out infinite',
              }}
            />
            <svg viewBox="0 0 200 200" className="w-full h-full relative">
              {[25, 50, 75].map((r, i) => (
                <circle key={`rc-${i}`} cx="100" cy="100" r={r} fill="none"
                  stroke={P.primary} strokeWidth="0.4" opacity={0.12 + i * 0.03} />
              ))}
              <circle cx="100" cy="100" r="95" fill="none" stroke={P.primary} strokeWidth="0.8" opacity="0.2" />
              <line x1="100" y1="5" x2="100" y2="195" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
              <line x1="5" y1="100" x2="195" y2="100" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
              <line x1="25" y1="25" x2="175" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />
              <line x1="175" y1="25" x2="25" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />

              {Array.from({ length: 36 }, (_, i) => {
                const angle = (i * 10) * Math.PI / 180;
                const inner = i % 3 === 0 ? 88 : 91;
                return (
                  <line key={`tick-${i}`}
                    x1={100 + inner * Math.cos(angle)} y1={100 + inner * Math.sin(angle)}
                    x2={100 + 95 * Math.cos(angle)} y2={100 + 95 * Math.sin(angle)}
                    stroke={P.primary} strokeWidth={i % 3 === 0 ? 0.6 : 0.3} opacity={i % 3 === 0 ? 0.25 : 0.12}
                  />
                );
              })}

              <g style={{ transformOrigin: '100px 100px', animation: 'radarSweep 4s linear infinite' }}>
                <line x1="100" y1="100" x2="100" y2="5" stroke={P.primary} strokeWidth="1" opacity="0.6" />
                <path d="M100,100 L100,15 A85,85 0 0,1 173,47 Z" fill="rgba(0,206,201,0.06)" />
                <path d="M100,100 L173,47 A85,85 0 0,1 185,100 Z" fill="rgba(0,206,201,0.02)" />
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
              <circle cx="100" cy="100" r="2" fill={P.primary} opacity="0.8" />
            </svg>
          </div>

          {/* Telemetry Grid — 2 columns */}
          <div className="w-full grid grid-cols-2 gap-1.5 mt-8">
            <GridCell
              label="OXYGEN"
              value="98.2%"
              barPercent={98.2}
              barColor={P.green}
              valueColor={P.cyan}
              accentColor={P.green}
            />
            <GridCell
              label="THRUST"
              value="STANDBY"
              subtext="T-MINUS HOLD"
              noBar
              accentColor={P.cyan}
              valueColor={P.cyan}
            />
            <GridCell
              label="SHIELDS"
              value="ACTIVE"
              barPercent={100}
              barColor={P.green}
              accentColor={P.green}
              valueColor={P.cyan}
            />
            <GridCell
              label="FUEL"
              value="74.1%"
              barPercent={74.1}
              barColor={P.gold}
              accentColor={P.gold}
              valueColor={P.gold}
            />

            {/* CREW AUTH — full width, spans both columns */}
            <div className="col-span-2">
              <GridCell
                label="CREW AUTH"
                value={authStatusText}
                subtext={authSubtext}
                barPercent={authState === 'GRANTED' ? 100 : authState === 'VERIFYING' ? 50 : 0}
                barColor={
                  authState === 'GRANTED' ? P.success
                    : authState === 'VERIFYING' ? P.gold
                      : authState === 'DENIED' ? P.error
                        : P.textMuted
                }
                accentColor={
                  authState === 'GRANTED' ? P.success
                    : authState === 'VERIFYING' ? P.gold
                      : authState === 'DENIED' ? P.error
                        : P.cyan
                }
                valueColor={
                  authState === 'GRANTED' ? P.success
                    : authState === 'VERIFYING' ? P.gold
                      : authState === 'DENIED' ? P.error
                        : P.cyan
                }
                statusDot={
                  authState === 'VERIFYING' ? 'pulse' as const
                    : authState === 'DENIED' ? 'fast' as const
                      : 'none' as const
                }
                fullWidth
              />
            </div>
          </div>
        </motion.div>

        {/* ── Right Column: Login Form ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex flex-col items-center lg:items-start w-full max-w-[320px]"
        >
          {/* Subtitle */}
          <div
            className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-1.5 text-center lg:text-left"
            style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.5)` }}
          >
            XLR8 VESSEL // FINALS MISSION IV
          </div>

          {/* Title with glitch */}
          <div
            className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.1em] uppercase text-center lg:text-left mb-1"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              animation: 'glitch-float 4s ease-in-out infinite',
            }}
          >
            <span
              style={{
                color: P.primary,
                textShadow: `0 0 18px rgba(0,206,201,0.5), 0 0 36px rgba(0,206,201,0.15)`,
                position: 'relative',
                display: 'inline-block',
              }}
            >
              CREW CLEARANCE
              <span
                style={{
                  position: 'absolute', top: 0, left: 0,
                  color: 'rgba(255,77,0,0.6)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                  animation: 'glitch-top 3s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
              <span
                style={{
                  position: 'absolute', top: 0, left: 0,
                  color: `rgba(0,245,255,0.6)`,
                  clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                  animation: 'glitch-bottom 2.5s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
            </span>
          </div>

          {/* Restricted + Encryption row */}
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.1em]" style={{ color: P.textMuted }}>
              Restricted terminal — authorized personnel only
            </span>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full"
                style={{ backgroundColor: P.green, boxShadow: `0 0 4px ${P.green}` }} />
              <span className="text-[8px] tracking-[0.15em] uppercase"
                style={{ color: `rgba(125,249,192,0.5)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
                AES-256
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-2 mb-2">
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.12)` }} />
            <div className="w-1 h-1 rotate-45" style={{ backgroundColor: P.primary, opacity: 0.3 }} />
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.12)` }} />
          </div>

          {/* Mission Brief — compact */}
          <div
            className="w-full border rounded p-2.5 mb-3"
            style={{
              borderColor: `rgba(0,206,201,0.1)`,
              background: `linear-gradient(180deg, rgba(5,11,24,0.65), rgba(13,27,42,0.45))`,
              animation: 'cardGlow 5s ease-in-out infinite',
            }}
          >
            <div
              className="text-[8px] tracking-[0.18em] uppercase mb-1"
              style={{ color: `rgba(0,206,201,0.45)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              MISSION BRIEF
            </div>
            <p className="text-[11px] leading-relaxed" style={{ color: P.textSec }}>
              XLR8 Vessel inbound on Orbit-IV Lab Node. All crew must verify identity
              through biometric-encrypted clearance. AES-256-GCM secured. Unauthorized
              access will be logged.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-2.5">
            {/* Crew Identifier */}
            <div>
              <label
                className="block text-[9px] tracking-[0.18em] uppercase mb-1"
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
                className="para-input w-full px-4 py-2 text-sm outline-none"
                style={{ color: P.text, fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
                autoComplete="username"
              />
            </div>

            {/* Encryption Key */}
            <div>
              <label
                className="block text-[9px] tracking-[0.18em] uppercase mb-1"
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
                  className="para-input w-full px-4 py-2 pr-9 text-sm outline-none"
                  style={{ color: P.text, fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => { setShowPwd(!showPwd); if (soundEnabled) soundEngine.playClick(); }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: showPwd ? P.primary : P.textMuted, transition: 'color 0.2s' }}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={authState !== 'PENDING' || !uid.trim() || !pwd.trim()}
              className="para-btn w-full py-2.5 mt-1 text-xs tracking-[0.2em] uppercase cursor-pointer"
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

          {/* Terminal status footer */}
          <div className="w-full flex items-center gap-1.5 mt-2">
            <span className="text-[8px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.3)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
              TERMINAL READY
            </span>
            <span style={{ color: `rgba(0,206,201,0.15)` }}>:</span>
            <span className="text-[8px] tracking-[0.12em] uppercase"
              style={{ color: `rgba(0,206,201,0.3)`, fontFamily: "var(--font-orbitron), sans-serif" }}>
              ENCRYPTION: AES-256-GCM
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-1.5 border-t gap-1 shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.08)`,
          background: `rgba(5,11,24,0.65)`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-[8px] sm:text-[10px] tracking-[0.15em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: P.textMuted }}
        >
          HERMOSO ● NUEVAS ● ORENSE ● SANTIAGO ● III - DCSAD
        </div>
        <div className="flex items-center gap-3 sm:gap-5">
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
    <div className="flex items-center gap-1">
      <div
        className="w-1 h-1 rounded-full"
        style={{
          backgroundColor: dotColor,
          animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
          boxShadow: `0 0 3px ${dotColor}`,
        }}
      />
      <span
        className="text-[8px] tracking-[0.12em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.4)` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Grid Cell for 2-column telemetry ─────────────────────────────────────────
function GridCell({
  label,
  value,
  subtext,
  barPercent = 0,
  barColor,
  accentColor,
  valueColor,
  statusDot = 'none',
  noBar,
  fullWidth,
}: {
  label: string;
  value: string;
  subtext?: string;
  barPercent?: number;
  barColor: string;
  accentColor: string;
  valueColor: string;
  statusDot?: 'none' | 'pulse' | 'fast';
  noBar?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className="relative border rounded-sm overflow-hidden"
      style={{
        borderColor: 'rgba(0,206,201,0.1)',
        background: '#020a12',
      }}
    >
      {/* Top border accent */}
      <div
        className="h-[2px] w-full"
        style={{
          background: accentColor,
          boxShadow: `0 0 6px ${accentColor}60`,
        }}
      />

      {/* Corner dots */}
      <div className="absolute top-[3px] left-[3px] w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.5 }} />
      <div className="absolute top-[3px] right-[3px] w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.5 }} />
      <div className="absolute bottom-[3px] left-[3px] w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.3 }} />
      <div className="absolute bottom-[3px] right-[3px] w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: accentColor, opacity: 0.3 }} />

      {/* Content */}
      <div className={`px-2.5 ${fullWidth ? 'py-2' : 'py-1.5'}`}>
        {/* Label row */}
        <div
          className="text-[7px] tracking-[0.18em] uppercase mb-0.5"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: 'rgba(0,206,201,0.4)' }}
        >
          {label}
        </div>

        {/* Value row */}
        <div className="flex items-center gap-1.5">
          {statusDot !== 'none' && (
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: valueColor,
                boxShadow: `0 0 5px ${valueColor}`,
                animation: statusDot === 'pulse' ? 'pulse 0.8s ease-in-out infinite'
                  : statusDot === 'fast' ? 'pulse 0.4s ease-in-out infinite' : 'none',
              }}
            />
          )}
          <span
            className={`font-bold tracking-[0.04em] uppercase ${fullWidth ? 'text-lg' : 'text-sm'}`}
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              color: valueColor,
              animation: statusDot === 'pulse' ? 'pulse 0.8s ease-in-out infinite' : 'none',
            }}
          >
            {value}
          </span>
        </div>

        {/* Progress bar — 2px, glowing */}
        {!noBar && (
          <div
            className="w-full h-[2px] rounded-full mt-1 mb-0.5"
            style={{ background: 'rgba(0,206,201,0.06)' }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${barPercent}%` }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              style={{
                background: barColor,
                boxShadow: `0 0 4px ${barColor}80`,
              }}
            />
          </div>
        )}

        {/* Subtext */}
        {subtext && (
          <div
            className="text-[6px] tracking-[0.14em] uppercase mt-0.5"
            style={{ fontFamily: "var(--font-orbitron), sans-serif", color: 'rgba(0,206,201,0.3)' }}
          >
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Bottom Status Item ──────────────────────────────────────────────────────
function BottomStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="text-[7px] sm:text-[8px] tracking-[0.12em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.25)` }}
      >
        {label}:
      </span>
      <span
        className="text-[7px] sm:text-[8px] tracking-[0.1em] uppercase"
        style={{ fontFamily: "var(--font-rajdhani), sans-serif", color: `rgba(0,206,201,0.5)` }}
      >
        {value}
      </span>
    </div>
  );
}
