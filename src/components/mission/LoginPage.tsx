'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

// ─── Palette Tokens ──────────────────────────────────────────────────────────
const P = {
  bg:          '#050B18',
  bgSec:       '#0D1B2A',
  card:        '#132238',
  panel:       '#1B2F4A',
  primary:     '#00CEC9',
  primaryHov:  '#00F5FF',
  green:       '#7DF9C0',
  purple:      '#7B6FFF',
  blue:        '#4DA8FF',
  success:     '#7DF9C0',
  warning:     '#FFC857',
  danger:      '#FF4D00',
  error:       '#FF3B30',
  text:        '#F8FAFC',
  textSec:     '#B8C4D6',
  textMuted:   '#7A8CA5',
  gold:        '#FFC857',
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

  // ─── Play deploy sound on mount ───────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { if (soundEnabled) soundEngine.playDeploy(); }, 300);
    return () => clearTimeout(t);
  }, [soundEnabled]);

  // ─── Try BGM on first interaction ─────────────────────────────────
  const tryBGM = useCallback(() => {
    if (!bgmStarted.current) {
      bgmStarted.current = true;
      soundEngine.playBGM();
    }
  }, []);

  // ─── Input change handlers ────────────────────────────────────────
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

  // ─── Authorized credentials ─────────────────────────────────────
  const AUTH_CREDS = { uid: '2026-0001', pwd: 'AUTOMATA' };

  // ─── Submit handler ───────────────────────────────────────────────
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!uid.trim() || !pwd.trim() || authState !== 'PENDING') return;

      if (soundEnabled) soundEngine.playClickFile();
      setAuthState('VERIFYING');
      if (soundEnabled) soundEngine.playStart();

      // After 1.4s → check credentials
      setTimeout(() => {
        if (uid.trim().toUpperCase() === AUTH_CREDS.uid && pwd.trim().toUpperCase() === AUTH_CREDS.pwd) {
          setAuthState('GRANTED');
          if (soundEnabled) soundEngine.playTransmission();

          // After 0.8s → navigate
          setTimeout(() => {
            login(uid.trim());
            setLoading('dashboard');
          }, 800);
        } else {
          setAuthState('DENIED');
          if (soundEnabled) soundEngine.playFade();

          // Reset after 2.5s so they can try again
          setTimeout(() => {
            setAuthState('PENDING');
            setPwd('');
          }, 2500);
        }
      }, 1400);
    },
    [uid, pwd, authState, login, setLoading, soundEnabled]
  );

  // ─── Focus handler for BGM ───────────────────────────────────────
  const handleFocus = useCallback(() => {
    tryBGM();
  }, [tryBGM]);

  // ─── Auth status text for telemetry ───────────────────────────────
  const authStatusText =
    authState === 'PENDING'
      ? 'AWAITING'
      : authState === 'VERIFYING'
        ? 'VERIFYING'
        : authState === 'DENIED'
          ? 'DENIED'
          : 'GRANTED';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative min-h-screen w-full overflow-hidden select-none"
      style={{
        background: `radial-gradient(ellipse at 15% 0%, ${P.bgSec} 0%, ${P.bg} 45%, ${P.bg} 100%)`,
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
        @keyframes dotPulse {
          0%, 100% { r: 2; opacity: 0.3; }
          50% { r: 4; opacity: 0.9; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { box-shadow: 0 0 8px rgba(0,206,201,0.25); }
          50% { box-shadow: 0 0 24px rgba(0,206,201,0.5); }
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
          25% { transform: translateY(-5px); }
          50% { transform: translateY(-2px); }
          75% { transform: translateY(-7px); }
        }
        @keyframes telemetry-glow {
          0%, 100% { box-shadow: 0 0 6px rgba(0,206,201,0.1), inset 0 0 6px rgba(0,206,201,0.03); }
          50% { box-shadow: 0 0 14px rgba(0,206,201,0.25), inset 0 0 12px rgba(0,206,201,0.06); }
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
          letter-spacing: 0.15em;
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
            width: '600px',
            height: '600px',
            top: '-10%',
            left: '-5%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(123,111,255,0.06) 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '500px',
            height: '500px',
            bottom: '-8%',
            right: '-3%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(0,206,201,0.05) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}
        />
        <div
          className="absolute"
          style={{
            width: '400px',
            height: '300px',
            top: '30%',
            right: '20%',
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(255,200,87,0.03) 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* ── Background: Constellation Lines ──────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.15 }}
        preserveAspectRatio="none"
      >
        {/* Constellation connections */}
        {constellationPts.slice(0, 26).map((p, i) => {
          const next = constellationPts[i + 1] || constellationPts[0];
          return (
            <line
              key={`cl-${i}`}
              x1={`${p.x}%`}
              y1={`${p.y}%`}
              x2={`${next.x}%`}
              y2={`${next.y}%`}
              stroke={P.primary}
              strokeWidth="0.4"
              opacity="0.4"
            />
          );
        })}
        {/* Star points */}
        {constellationPts.map((p, i) => (
          <circle
            key={`cp-${i}`}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r="1.2"
            fill={P.primary}
            opacity="0.5"
          />
        ))}
        {/* Dashed horizontal guides */}
        {[18, 38, 58, 78].map((y, i) => (
          <line
            key={`dh-${i}`}
            x1="0%"
            y1={`${y}%`}
            x2="100%"
            y2={`${y}%`}
            stroke={P.primary}
            strokeWidth="0.25"
            strokeDasharray="6 14"
            opacity="0.2"
          />
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
      {/* CRT scanline overlay */}
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
        className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 border-b"
        style={{
          borderColor: `rgba(0,206,201,0.1)`,
          background: `rgba(5,11,24,0.65)`,
          backdropFilter: 'blur(8px)',
          animation: 'fadeup 0.6s ease both',
        }}
      >
        <div
          className="text-[10px] sm:text-xs tracking-[0.25em] uppercase"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            color: `rgba(0,206,201,0.5)`,
          }}
        >
          XLR8 AUTOMATA-IV // RECURSION NODE // FINALS
        </div>
        <div className="hidden sm:flex items-center gap-5">
          <StatusDot label="HULL INTACT" color="cyan" />
          <StatusDot label="CREW: 0/4" color="cyan" />
          <StatusDot label="COMMS LIVE" color="cyan" pulse />
        </div>
      </div>

      {/* ── Main Content: Two Column Layout ──────────────────────────── */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-20 px-4 sm:px-8 py-8 lg:py-0 lg:min-h-[calc(100vh-100px)]">

        {/* ── Left Column: Radar + Telemetry ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.9 }}
          className="flex flex-col items-center gap-5 w-full max-w-xs"
        >
          {/* Radar SVG */}
          <div className="relative w-56 h-56 sm:w-64 sm:h-64" style={{ animation: 'fadeup 0.8s ease both', animationDelay: '0.2s' }}>
            {/* Outer glow ring */}
            <div
              className="absolute inset-[-8px] rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(0,206,201,0.05) 60%, transparent 70%)`,
                animation: 'breathe 4s ease-in-out infinite',
              }}
            />
            <svg viewBox="0 0 200 200" className="w-full h-full relative">
              {/* Concentric rings */}
              {[25, 50, 75].map((r, i) => (
                <circle
                  key={`rc-${i}`}
                  cx="100"
                  cy="100"
                  r={r}
                  fill="none"
                  stroke={P.primary}
                  strokeWidth="0.4"
                  opacity={0.12 + i * 0.03}
                />
              ))}
              {/* Outer ring */}
              <circle
                cx="100"
                cy="100"
                r="95"
                fill="none"
                stroke={P.primary}
                strokeWidth="0.8"
                opacity="0.2"
              />
              {/* Crosshair lines */}
              <line x1="100" y1="5" x2="100" y2="195" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
              <line x1="5" y1="100" x2="195" y2="100" stroke={P.primary} strokeWidth="0.3" opacity="0.1" />
              <line x1="25" y1="25" x2="175" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />
              <line x1="175" y1="25" x2="25" y2="175" stroke={P.primary} strokeWidth="0.2" opacity="0.06" />

              {/* Tick marks on outer ring */}
              {Array.from({ length: 36 }, (_, i) => {
                const angle = (i * 10) * Math.PI / 180;
                const inner = i % 3 === 0 ? 88 : 91;
                const x1 = 100 + inner * Math.cos(angle);
                const y1 = 100 + inner * Math.sin(angle);
                const x2 = 100 + 95 * Math.cos(angle);
                const y2 = 100 + 95 * Math.sin(angle);
                return (
                  <line
                    key={`tick-${i}`}
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={P.primary}
                    strokeWidth={i % 3 === 0 ? 0.6 : 0.3}
                    opacity={i % 3 === 0 ? 0.25 : 0.12}
                  />
                );
              })}

              {/* Rotating sweep */}
              <g style={{ transformOrigin: '100px 100px', animation: 'radarSweep 4s linear infinite' }}>
                <line x1="100" y1="100" x2="100" y2="5" stroke={P.primary} strokeWidth="1" opacity="0.6" />
                <path
                  d="M100,100 L100,15 A85,85 0 0,1 173,47 Z"
                  fill={`rgba(0,206,201,0.06)`}
                />
                {/* Sweep gradient tail */}
                <path
                  d="M100,100 L173,47 A85,85 0 0,1 185,100 Z"
                  fill={`rgba(0,206,201,0.02)`}
                />
              </g>

              {/* Pulsing blips */}
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

              {/* Center dot */}
              <circle cx="100" cy="100" r="2" fill={P.primary} opacity="0.8" />
            </svg>
          </div>

          {/* Sector label */}
          <div className="text-center">
            <div
              className="text-[10px] tracking-[0.3em] uppercase mb-1"
              style={{ color: `rgba(0,206,201,0.4)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              Current Sector
            </div>
            <div
              className="text-sm tracking-[0.15em] uppercase"
              style={{ color: `rgba(0,206,201,0.75)`, fontFamily: "var(--font-orbitron), sans-serif" }}
            >
              ORBIT-IV &middot; LAB NODE
            </div>
          </div>

          {/* Telemetry Panel */}
          <div
            className="w-full border rounded p-4 space-y-2.5"
            style={{
              borderColor: `rgba(0,206,201,0.12)`,
              background: `linear-gradient(180deg, rgba(5,11,24,0.7), rgba(13,27,42,0.5))`,
              animation: 'telemetry-glow 4s ease-in-out infinite',
            }}
          >
            <TelemetryItem label="OXYGEN" value="98.2%" status="normal" />
            <TelemetryItem label="THRUST" value="STANDBY" status="normal" />
            <TelemetryItem label="SHIELDS" value="ACTIVE" status="normal" />
            <TelemetryItem label="FUEL" value="74.1%" status="warning" />
            <TelemetryItem
              label="CREW AUTH"
              value={authStatusText}
              status={authState === 'GRANTED' ? 'success' : authState === 'VERIFYING' ? 'verifying' : authState === 'DENIED' ? 'denied' : 'pending'}
            />
          </div>
        </motion.div>

        {/* ── Right Column: Login Form ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="flex flex-col items-center lg:items-start w-full max-w-sm"
          style={{ animation: 'fadeup 0.8s ease both', animationDelay: '0.4s' }}
        >
          {/* Subtitle */}
          <div
            className="text-[10px] sm:text-xs tracking-[0.25em] uppercase mb-3 text-center lg:text-left"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: `rgba(0,206,201,0.5)`,
            }}
          >
            XLR8 VESSEL // FINALS MISSION IV
          </div>

          {/* Title with glitch effect */}
          <div
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.12em] uppercase text-center lg:text-left mb-2"
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
              {/* Glitch red layer */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: 'rgba(255,77,0,0.6)',
                  clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                  animation: 'glitch-top 3s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
              {/* Glitch cyan layer */}
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  color: `rgba(0,245,255,0.6)`,
                  clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                  animation: 'glitch-bottom 2.5s infinite linear alternate-reverse',
                }}
                aria-hidden="true"
              >CREW CLEARANCE</span>
            </span>
          </div>

          {/* Restricted notice */}
          <div
            className="text-xs tracking-[0.12em] mb-1 text-center lg:text-left"
            style={{ color: P.textMuted }}
          >
            Restricted terminal — authorized personnel only
          </div>

          {/* Encryption badge */}
          <div className="flex items-center gap-2 mb-5 text-center lg:text-left">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: P.green,
                boxShadow: `0 0 6px ${P.green}`,
              }}
            />
            <span
              className="text-[10px] tracking-[0.2em] uppercase"
              style={{
                color: `rgba(125,249,192,0.6)`,
                fontFamily: "var(--font-orbitron), sans-serif",
              }}
            >
              AES-256-GCM ENCRYPTED
            </span>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.15)` }} />
            <div
              className="w-1 h-1 rotate-45"
              style={{ backgroundColor: P.primary, opacity: 0.4 }}
            />
            <div className="flex-1 h-px" style={{ background: `rgba(0,206,201,0.15)` }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            {/* Crew Identifier */}
            <div>
              <label
                className="block text-[11px] tracking-[0.2em] uppercase mb-2"
                style={{
                  color: `rgba(0,206,201,0.55)`,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                [Crew Identifier]
              </label>
              <input
                type="text"
                value={uid}
                onChange={handleUidChange}
                onFocus={handleFocus}
                placeholder="ENTER CREW ID"
                disabled={authState !== 'PENDING'}
                className="para-input w-full px-5 py-3 text-sm outline-none"
                style={{
                  color: P.text,
                  fontFamily: "var(--font-rajdhani), sans-serif",
                  caretColor: P.primary,
                }}
                autoComplete="username"
              />
            </div>

            {/* Encryption Key */}
            <div>
              <label
                className="block text-[11px] tracking-[0.2em] uppercase mb-2"
                style={{
                  color: `rgba(0,206,201,0.55)`,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                [Encryption Key]
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={pwd}
                  onChange={handlePwdChange}
                  onFocus={handleFocus}
                  placeholder="ENTER ENCRYPTION KEY"
                  disabled={authState !== 'PENDING'}
                  className="para-input w-full px-5 py-3 pr-10 text-sm outline-none"
                  style={{
                    color: P.text,
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    caretColor: P.primary,
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => { setShowPwd(!showPwd); if (soundEnabled) soundEngine.playClick(); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                  style={{
                    color: showPwd ? P.primary : P.textMuted,
                    transition: 'color 0.2s',
                  }}
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
              className="para-btn w-full py-3.5 mt-2 text-sm tracking-[0.25em] uppercase cursor-pointer"
              onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                color:
                  authState === 'GRANTED'
                    ? P.success
                    : authState === 'DENIED'
                      ? P.error
                      : P.primary,
                background:
                  authState === 'GRANTED'
                    ? `rgba(125,249,192,0.08)`
                    : authState === 'DENIED'
                      ? `rgba(255,59,48,0.08)`
                      : authState === 'VERIFYING'
                        ? `rgba(0,206,201,0.04)`
                        : `rgba(0,206,201,0.04)`,
                border: `1px solid ${
                  authState === 'GRANTED'
                    ? `rgba(125,249,192,0.35)`
                    : authState === 'DENIED'
                      ? `rgba(255,59,48,0.35)`
                      : `rgba(0,206,201,0.2)`
                }`,
                animation:
                  authState === 'GRANTED'
                    ? 'grantedGlow 1s ease-in-out'
                    : authState === 'DENIED'
                      ? 'deniedShake 0.4s ease'
                      : authState === 'PENDING'
                        ? 'breathe 3s ease-in-out infinite'
                        : 'none',
                opacity: authState === 'VERIFYING' ? 0.7 : 1,
              }}
            >
              {authState === 'PENDING' && 'INITIATE CLEARANCE'}
              {authState === 'VERIFYING' && (
                <span style={{ animation: 'verifyingPulse 1s ease-in-out infinite' }}>
                  VERIFYING...
                </span>
              )}
              {authState === 'GRANTED' && 'CLEARANCE GRANTED'}
              {authState === 'DENIED' && 'ACCESS DENIED'}
            </button>
          </form>

          {/* Auth feedback bar */}
          {authState === 'VERIFYING' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 border"
              style={{
                borderColor: `rgba(255,200,87,0.2)`,
                background: `rgba(255,200,87,0.04)`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: P.warning,
                  animation: 'pulse 0.8s ease-in-out infinite',
                }}
              />
              <span
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{
                  color: P.warning,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                Decrypting credentials...
              </span>
            </motion.div>
          )}
          {authState === 'GRANTED' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 border"
              style={{
                borderColor: `rgba(125,249,192,0.2)`,
                background: `rgba(125,249,192,0.04)`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: P.success,
                  boxShadow: `0 0 6px ${P.success}`,
                }}
              />
              <span
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{
                  color: P.success,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                Identity confirmed — boarding in progress
              </span>
            </motion.div>
          )}
          {authState === 'DENIED' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 border"
              style={{
                borderColor: `rgba(255,59,48,0.2)`,
                background: `rgba(255,59,48,0.04)`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: P.error,
                  animation: 'pulse 0.4s ease-in-out infinite',
                }}
              />
              <span
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{
                  color: P.error,
                  fontFamily: "var(--font-orbitron), sans-serif",
                }}
              >
                Authorization failed — retry in progress
              </span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ── Bottom Bar ──────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 border-t gap-2"
        style={{
          borderColor: `rgba(0,206,201,0.08)`,
          background: `rgba(5,11,24,0.65)`,
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="text-[10px] sm:text-xs tracking-[0.2em] uppercase"
          style={{
            fontFamily: "var(--font-orbitron), sans-serif",
            color: P.textMuted,
          }}
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
        className="text-[10px] tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: `rgba(0,206,201,0.45)`,
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Telemetry Item ──────────────────────────────────────────────────────────
function TelemetryItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'normal' | 'warning' | 'pending' | 'verifying' | 'success' | 'denied';
}) {
  const valueColor =
    status === 'warning' ? P.warning
    : status === 'pending' ? P.textMuted
    : status === 'verifying' ? P.warning
    : status === 'success' ? P.success
    : status === 'denied' ? P.error
    : P.primary;

  const statusDotColor =
    status === 'warning' ? P.warning
    : status === 'pending' ? P.textMuted
    : status === 'verifying' ? P.warning
    : status === 'success' ? P.success
    : status === 'denied' ? P.error
    : P.primary;

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: P.textMuted,
        }}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <div
          className="w-1 h-1 rounded-full"
          style={{
            backgroundColor: statusDotColor,
            boxShadow: `0 0 3px ${statusDotColor}`,
            animation: status === 'verifying' ? 'pulse 0.8s ease-in-out infinite' : status === 'denied' ? 'pulse 0.4s ease-in-out infinite' : 'none',
          }}
        />
        <span
          className="text-xs tracking-[0.1em] uppercase font-medium"
          style={{
            fontFamily: "var(--font-rajdhani), sans-serif",
            color: valueColor,
            animation: status === 'verifying' ? 'pulse 0.8s ease-in-out infinite' : 'none',
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Bottom Status Item ──────────────────────────────────────────────────────
function BottomStatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: `rgba(0,206,201,0.3)`,
        }}
      >
        {label}:
      </span>
      <span
        className="text-[9px] sm:text-[10px] tracking-[0.12em] uppercase"
        style={{
          fontFamily: "var(--font-rajdhani), sans-serif",
          color: `rgba(0,206,201,0.6)`,
        }}
      >
        {value}
      </span>
    </div>
  );
}
