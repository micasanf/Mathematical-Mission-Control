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
          25% { transform: translateY(-3px); }
          50% { transform: translateY(-1px); }
          75% { transform: translateY(-4px); }
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
          50% { box-shadow: 0 0 20px rgba(125,249,192,0.4), 0 0 40px rgba(125,249,192,0.15); }
          100% { box-shadow: 0 0 0px rgba(125,249,192,0); }
        }

        .login-input {
          background: rgba(5,11,24,0.8);
          border: 1px solid rgba(0,206,201,0.15);
          border-radius: 6px;
          transition: all 0.2s ease;
          color: #F8FAFC;
        }
        .login-input:focus {
          border-color: rgba(0,206,201,0.4);
          box-shadow: 0 0 0 3px rgba(0,206,201,0.08);
          background: rgba(5,11,24,0.95);
        }
        .login-input::placeholder {
          color: rgba(122,140,165,0.45);
          font-size: 12px;
          letter-spacing: 0.05em;
        }
        .login-input:disabled {
          opacity: 0.5;
        }

        .login-btn {
          border-radius: 6px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .login-btn::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0,206,201,0.1), transparent);
          transition: left 0.5s ease;
        }
        .login-btn:hover::before {
          left: 100%;
        }
        .login-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .login-btn:not(:disabled):hover {
          border-color: rgba(0,206,201,0.4);
          box-shadow: 0 0 12px rgba(0,206,201,0.15);
        }
      `}</style>

      {/* ── Background: Star Field ──────────────────────────────────── */}
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

      {/* ── Background: Nebula ──────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute"
          style={{
            width: '700px', height: '700px', top: '-15%', left: '-8%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(123,111,255,0.06) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '500px', height: '500px', bottom: '-10%', right: '-5%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(0,206,201,0.05) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* ── Background: Constellation ───────────────────────────────── */}
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
          <circle key={`cp-${i}`} cx={`${p.x}%`} cy={`${p.y}%`} r="1" fill={P.primary} opacity="0.4" />
        ))}
      </svg>

      {/* ── Background: Grid ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,206,201,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,206,201,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* ── Background: Radar (decorative, large, faded) ────────────── */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '480px', height: '480px',
          left: '3%', top: '50%',
          transform: 'translateY(-50%)',
          opacity: 0.12,
        }}
      >
        <div
          className="absolute inset-[-8px] rounded-full"
          style={{
            background: `radial-gradient(circle, rgba(0,206,201,0.06) 50%, transparent 70%)`,
            animation: 'breathe 6s ease-in-out infinite',
          }}
        />
        <svg viewBox="0 0 200 200" className="w-full h-full relative">
          {[25, 50, 75].map((r, i) => (
            <circle key={`rc-${i}`} cx="100" cy="100" r={r} fill="none"
              stroke={P.primary} strokeWidth="0.5" opacity={0.1 + i * 0.03} />
          ))}
          <circle cx="100" cy="100" r="95" fill="none" stroke={P.primary} strokeWidth="0.8" opacity="0.2" />
          <line x1="100" y1="5" x2="100" y2="195" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
          <line x1="5" y1="100" x2="195" y2="100" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
          {Array.from({ length: 36 }, (_, i) => {
            const angle = (i * 10) * Math.PI / 180;
            const inner = i % 3 === 0 ? 88 : 91;
            return (
              <line key={`tick-${i}`}
                x1={100 + inner * Math.cos(angle)} y1={100 + inner * Math.sin(angle)}
                x2={100 + 95 * Math.cos(angle)} y2={100 + 95 * Math.sin(angle)}
                stroke={P.primary} strokeWidth={i % 3 === 0 ? 0.6 : 0.3} opacity={i % 3 === 0 ? 0.2 : 0.1}
              />
            );
          })}
          <g style={{ transformOrigin: '100px 100px', animation: 'radarSweep 4s linear infinite' }}>
            <line x1="100" y1="100" x2="100" y2="5" stroke={P.primary} strokeWidth="1" opacity="0.5" />
            <path d="M100,100 L100,15 A85,85 0 0,1 173,47 Z" fill="rgba(0,206,201,0.05)" />
            <path d="M100,100 L173,47 A85,85 0 0,1 185,100 Z" fill="rgba(0,206,201,0.02)" />
          </g>
          <circle cx="68" cy="55" fill={P.primary}>
            <animate attributeName="r" values="1.5;3;1.5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="145" cy="75" fill={P.primary}>
            <animate attributeName="r" values="1;2.5;1" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="105" cy="145" fill={P.gold}>
            <animate attributeName="r" values="1.5;3;1.5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx="100" cy="100" r="2" fill={P.primary} opacity="0.7" />
        </svg>
      </div>

      {/* ── Scanline ────────────────────────────────────────────────── */}
      <div
        className="absolute left-0 w-full pointer-events-none"
        style={{
          height: '2px',
          background: 'linear-gradient(transparent, rgba(0,206,201,0.07), transparent)',
          animation: 'scan 4s linear infinite',
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

      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-2 border-b shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.06)`,
          background: `rgba(5,11,24,0.4)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.35)` }}
        >
          XLR8 AUTOMATA-IV // RECURSION NODE
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <StatusDot label="HULL" color="cyan" />
          <StatusDot label="COMMS" color="cyan" pulse />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CENTERED LOGIN CARD
          ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 flex items-center justify-center overflow-hidden px-4">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
          className="w-full max-w-[360px]"
        >
          {/* ── Card ── */}
          <div
            className="rounded-lg border p-6"
            style={{
              borderColor: 'rgba(0,206,201,0.1)',
              background: 'rgba(5,11,24,0.75)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Logo / Title */}
            <div className="text-center mb-5">
              <div
                className="text-[9px] tracking-[0.25em] uppercase mb-2"
                style={{ fontFamily: "var(--font-orbitron), sans-serif", color: 'rgba(0,206,201,0.35)' }}
              >
                XLR8 VESSEL // MISSION IV
              </div>

              {/* Glitch title */}
              <div
                className="text-2xl font-bold tracking-[0.06em] uppercase"
                style={{
                  fontFamily: "var(--font-orbitron), sans-serif",
                  animation: 'glitch-float 4s ease-in-out infinite',
                }}
              >
                <span
                  style={{
                    color: P.primary,
                    textShadow: `0 0 16px rgba(0,206,201,0.4)`,
                    position: 'relative',
                    display: 'inline-block',
                  }}
                >
                  CREW CLEARANCE
                  <span
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      color: 'rgba(255,77,0,0.5)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                      animation: 'glitch-top 3s infinite linear alternate-reverse',
                    }}
                    aria-hidden="true"
                  >CREW CLEARANCE</span>
                  <span
                    style={{
                      position: 'absolute', top: 0, left: 0,
                      color: 'rgba(0,245,255,0.5)',
                      clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                      animation: 'glitch-bottom 2.5s infinite linear alternate-reverse',
                    }}
                    aria-hidden="true"
                  >CREW CLEARANCE</span>
                </span>
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: P.green, boxShadow: `0 0 3px ${P.green}` }} />
                <span className="text-[8px] tracking-[0.1em] uppercase" style={{ color: 'rgba(125,249,192,0.4)', fontFamily: "var(--font-orbitron), sans-serif" }}>
                  Secure Terminal · AES-256
                </span>
              </div>
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Crew Identifier */}
              <div>
                <label
                  className="block text-[11px] font-medium tracking-[0.04em] uppercase mb-1.5"
                  style={{ color: P.textSec, fontFamily: "var(--font-rajdhani), sans-serif" }}
                >
                  Crew Identifier
                </label>
                <input
                  type="text"
                  value={uid}
                  onChange={handleUidChange}
                  onFocus={handleFocus}
                  placeholder="e.g. 2026-0001"
                  disabled={authState !== 'PENDING'}
                  className="login-input w-full px-3 py-2.5 text-sm outline-none"
                  style={{ fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
                  autoComplete="username"
                />
              </div>

              {/* Encryption Key */}
              <div>
                <label
                  className="block text-[11px] font-medium tracking-[0.04em] uppercase mb-1.5"
                  style={{ color: P.textSec, fontFamily: "var(--font-rajdhani), sans-serif" }}
                >
                  Encryption Key
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={pwd}
                    onChange={handlePwdChange}
                    onFocus={handleFocus}
                    placeholder="Enter encryption key"
                    disabled={authState !== 'PENDING'}
                    className="login-input w-full px-3 py-2.5 pr-9 text-sm outline-none"
                    style={{ fontFamily: "var(--font-rajdhani), sans-serif", caretColor: P.primary }}
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
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Auth status message */}
              {authState === 'DENIED' && (
                <div
                  className="text-[11px] text-center py-1.5 rounded"
                  style={{
                    color: P.error,
                    background: 'rgba(255,59,48,0.08)',
                    border: '1px solid rgba(255,59,48,0.15)',
                    animation: 'deniedShake 0.4s ease',
                  }}
                >
                  ACCESS DENIED — UNAUTHORIZED CREDENTIALS
                </div>
              )}
              {authState === 'VERIFYING' && (
                <div
                  className="text-[11px] text-center py-1.5 rounded"
                  style={{
                    color: P.gold,
                    background: 'rgba(245,200,66,0.06)',
                    border: '1px solid rgba(245,200,66,0.12)',
                  }}
                >
                  <span style={{ animation: 'verifyingPulse 1s ease-in-out infinite' }}>
                    DECRYPTING CREDENTIALS...
                  </span>
                </div>
              )}
              {authState === 'GRANTED' && (
                <div
                  className="text-[11px] text-center py-1.5 rounded"
                  style={{
                    color: P.success,
                    background: 'rgba(125,249,192,0.06)',
                    border: '1px solid rgba(125,249,192,0.12)',
                    animation: 'grantedGlow 1s ease-in-out',
                  }}
                >
                  CLEARANCE GRANTED
                </div>
              )}

              {/* Submit button — normal sized, same width as inputs */}
              <button
                type="submit"
                disabled={authState !== 'PENDING' || !uid.trim() || !pwd.trim()}
                className="login-btn w-full py-2.5 text-sm font-medium tracking-[0.08em] uppercase cursor-pointer mt-1"
                onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
                style={{
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  color: '#020a12',
                  background: P.primary,
                  border: '1px solid transparent',
                  animation: authState === 'PENDING' ? 'breathe 3s ease-in-out infinite' : 'none',
                }}
              >
                {authState === 'PENDING' && 'Initiate Clearance'}
                {authState === 'VERIFYING' && 'Verifying...'}
                {authState === 'GRANTED' && 'Granted ✓'}
                {authState === 'DENIED' && 'Denied'}
              </button>
            </form>
          </div>

          {/* ── Footer below card ── */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <span className="text-[8px] tracking-[0.1em] uppercase"
              style={{ color: 'rgba(0,206,201,0.2)', fontFamily: "var(--font-orbitron), sans-serif" }}>
              RECURSION-04
            </span>
            <span style={{ color: 'rgba(0,206,201,0.1)' }}>·</span>
            <span className="text-[8px] tracking-[0.1em] uppercase"
              style={{ color: 'rgba(0,206,201,0.2)', fontFamily: "var(--font-orbitron), sans-serif" }}>
              AES-256-GCM
            </span>
            <span style={{ color: 'rgba(0,206,201,0.1)' }}>·</span>
            <span className="text-[8px] tracking-[0.1em] uppercase"
              style={{ color: 'rgba(0,206,201,0.2)', fontFamily: "var(--font-orbitron), sans-serif" }}>
              {authSubtext}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Bar ────────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-5 sm:px-8 py-2 border-t gap-1 shrink-0"
        style={{
          borderColor: `rgba(0,206,201,0.05)`,
          background: `rgba(5,11,24,0.4)`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          className="text-[8px] sm:text-[9px] tracking-[0.12em] uppercase"
          style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.18)` }}
        >
          HERMOSO ● NUEVAS ● ORENSE ● SANTIAGO ● III - DCSAD
        </div>
        <div className="flex items-center gap-4">
          <BottomStatusItem label="ENCRYPTION" value="AES-256-GCM" />
          <BottomStatusItem label="STATUS" value={authStatusText} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Status Dot ──────────────────────────────────────────────────────────────
function StatusDot({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  const dotColor = color === 'cyan' ? P.primary : P.gold;
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1 h-1 rounded-full"
        style={{
          backgroundColor: dotColor,
          animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
          boxShadow: `0 0 3px ${dotColor}`,
        }}
      />
      <span
        className="text-[8px] tracking-[0.1em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.3)` }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Bottom Status Item ──────────────────────────────────────────────────────
function BottomStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="text-[7px] sm:text-[8px] tracking-[0.1em] uppercase"
        style={{ fontFamily: "var(--font-orbitron), sans-serif", color: `rgba(0,206,201,0.18)` }}
      >
        {label}:
      </span>
      <span
        className="text-[7px] sm:text-[8px] tracking-[0.08em] uppercase"
        style={{ fontFamily: "var(--font-rajdhani), sans-serif", color: `rgba(0,206,201,0.35)` }}
      >
        {value}
      </span>
    </div>
  );
}
