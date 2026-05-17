'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';


// ─── Constellation Points Generator ─────────────────────────────────────────
function useConstellationPoints() {
  return useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < 28; i++) {
      pts.push({ x: Math.random() * 100, y: Math.random() * 100 });
    }
    return pts;
  }, []);
}

// ─── Auth State ──────────────────────────────────────────────────────────────
type AuthState = 'PENDING' | 'VERIFYING' | 'CONFIRMED' | 'DENIED';

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

  const constellationPts = useConstellationPoints();

  // ─── Play deploy sound on mount ───────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => { if (soundEnabled) soundEngine.playDeploy(); }, 300);
    return () => clearTimeout(t);
  }, [soundEnabled]);

  // ─── Try BGM on first interaction ─────────────────────────────────────
  const tryBGM = useCallback(() => {
    if (!bgmStarted.current) {
      bgmStarted.current = true;
      soundEngine.playBGM();
    }
  }, []);

  // ─── Input change handlers ────────────────────────────────────────────
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

  // ─── Authorized credentials ─────────────────────────────────────────
  const AUTH_CREDS = { uid: '2026-0001', pwd: 'AUTOMATA' };

  // ─── Submit handler ───────────────────────────────────────────────────
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
          setAuthState('CONFIRMED');
          if (soundEnabled) soundEngine.playTransmission();

          // After 0.8s → navigate
          setTimeout(() => {
            login(uid.trim());
            setLoading('dashboard');
          }, 800);
        } else {
          // Access denied
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

  // ─── Focus handler for BGM ───────────────────────────────────────────
  const handleFocus = useCallback(() => {
    tryBGM();
  }, [tryBGM]);

  // ─── Auth status text for telemetry ───────────────────────────────────
  const authStatusText =
    authState === 'PENDING'
      ? 'PENDING'
      : authState === 'VERIFYING'
        ? 'VERIFYING'
        : authState === 'DENIED'
          ? 'DENIED'
          : 'CONFIRMED';

  return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen w-full overflow-hidden select-none"
        style={{
          background: 'radial-gradient(ellipse at 20% 0%, #0D1B2A 0%, #050B18 40%, #050B18 100%)',
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
          @keyframes flicker {
            0%, 100% { opacity: 1; }
            91% { opacity: 1; }
            92% { opacity: 0.3; }
            93% { opacity: 1; }
            96% { opacity: 0.6; }
            97% { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
          @keyframes pulse2 {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes fadeup {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes breathe {
            0%, 100% { box-shadow: 0 0 8px rgba(0,206,201,0.27); }
            50% { box-shadow: 0 0 22px rgba(0,206,201,0.53); }
          }
          @keyframes radarSweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes dotPulse {
            0%, 100% { r: 2; opacity: 0.3; }
            50% { r: 4; opacity: 0.8; }
          }
          .grunge-input {
            filter: contrast(120%) brightness(90%) sepia(20%);
            background:
              repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 4px,
                rgba(0,206,201,0.02) 4px,
                rgba(0,206,201,0.02) 8px
              ),
              rgba(5,11,24,0.85);
            clip-path: polygon(1% 0%, 100% 0%, 99% 100%, 0% 100%);
            transition: filter 0.2s, box-shadow 0.2s;
          }
          .grunge-input:focus {
            filter: contrast(130%) brightness(100%) sepia(10%);
            box-shadow: -3px 0 10px rgba(0,206,201,0.35), 0 0 6px rgba(0,206,201,0.15);
          }
          @keyframes glitch-float {
            0%, 100% {
              transform: translateY(0);
            }
            25% {
              transform: translateY(-6px);
            }
            50% {
              transform: translateY(-3px);
            }
            75% {
              transform: translateY(-8px);
            }
          }
          @keyframes glitch-top {
            0%, 90%, 100% { transform: translate(0); }
            92% { transform: translate(-3px, -1px); }
            94% { transform: translate(3px, 1px); }
            96% { transform: translate(-2px, 0); }
            98% { transform: translate(2px, -1px); }
          }
          @keyframes glitch-bottom {
            0%, 88%, 100% { transform: translate(0); }
            90% { transform: translate(2px, 1px); }
            93% { transform: translate(-3px, 0); }
            95% { transform: translate(3px, -1px); }
            97% { transform: translate(-1px, 1px); }
          }
        `}</style>

        {/* ── Background: Grid Overlay ───────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0,206,201,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,206,201,0.04) 1px, transparent 1px)',
            backgroundSize: '140px 140px',
          }}
        />

        {/* ── Background: Radial Glows ──────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 600px 600px at 10% 10%, rgba(0,206,201,0.12), transparent), radial-gradient(ellipse 500px 500px at 75% 45%, rgba(255,200,87,0.07), transparent)',
          }}
        />

        {/* ── Background: SVG Constellation Lines ───────────────────── */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ opacity: 0.18 }}
          preserveAspectRatio="none"
        >
          {/* Constellation lines */}
          {constellationPts.slice(0, 24).map((p, i) => {
            const next = constellationPts[i + 1] || constellationPts[0];
            return (
              <line
                key={`cl-${i}`}
                x1={`${p.x}%`}
                y1={`${p.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="rgba(0,206,201,0.5)"
                strokeWidth="0.5"
              />
            );
          })}
          {/* Points */}
          {constellationPts.map((p, i) => (
            <circle
              key={`cp-${i}`}
              cx={`${p.x}%`}
              cy={`${p.y}%`}
              r="1.5"
              fill="rgba(0,206,201,0.7)"
            />
          ))}
          {/* Dashed horizontal lines */}
          {[15, 35, 55, 75, 90].map((y, i) => (
            <line
              key={`dh-${i}`}
              x1="0%"
              y1={`${y}%`}
              x2="100%"
              y2={`${y}%`}
              stroke="rgba(0,206,201,0.3)"
              strokeWidth="0.3"
              strokeDasharray="8 12"
            />
          ))}
        </svg>

        {/* ── Scanline Effect ───────────────────────────────────────── */}
        <div
          className="absolute left-0 w-full pointer-events-none"
          style={{
            height: '2px',
            background: 'linear-gradient(transparent, rgba(0,206,201,0.12), transparent)',
            animation: 'scan 5s linear infinite',
            zIndex: 50,
          }}
        />

        {/* ── Top Bar ───────────────────────────────────────────────── */}
        <div
          className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-3 border-b"
          style={{
            borderColor: 'rgba(0,206,201,0.1)',
            background: 'rgba(5,11,24,0.6)',
            animation: 'fadeup 0.6s ease both',
          }}
        >
          {/* Left: System text */}
          <div
            className="text-[10px] sm:text-xs tracking-[0.25em] uppercase"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: 'rgba(0,206,201,0.55)',
            }}
          >
            SYS :: AUTOMATA-IV // RECURSION NODE // FINALS
          </div>

          {/* Right: Status dots */}
          <div className="hidden sm:flex items-center gap-5">
            <StatusDot label="HULL INTACT" color="cyan" />
            <StatusDot label="CREW: 0/4" color="cyan" />
            <StatusDot label="COMMS LIVE" color="cyan" pulse />
          </div>
        </div>

        {/* ── Main Content: Two Column Layout ────────────────────────── */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16 px-4 sm:px-8 py-8 lg:py-0 lg:min-h-[calc(100vh-96px)]">
          {/* ── Left Column: Radar + Telemetry ──────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col items-center gap-5 w-full max-w-xs"
            style={{ animation: 'fadeup 0.8s ease both', animationDelay: '0.2s' }}
          >
            {/* Radar SVG */}
            <div className="relative w-56 h-56 sm:w-64 sm:h-64">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* Concentric circles */}
                {[30, 55, 80].map((r, i) => (
                  <circle
                    key={`rc-${i}`}
                    cx="100"
                    cy="100"
                    r={r}
                    fill="none"
                    stroke="rgba(0,206,201,0.15)"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Outer ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="95"
                  fill="none"
                  stroke="rgba(0,206,201,0.25)"
                  strokeWidth="1"
                />
                {/* Crosshair lines */}
                <line x1="100" y1="5" x2="100" y2="195" stroke="rgba(0,206,201,0.1)" strokeWidth="0.5" />
                <line x1="5" y1="100" x2="195" y2="100" stroke="rgba(0,206,201,0.1)" strokeWidth="0.5" />
                {/* Diagonal crosshair */}
                <line x1="25" y1="25" x2="175" y2="175" stroke="rgba(0,206,201,0.06)" strokeWidth="0.5" />
                <line x1="175" y1="25" x2="25" y2="175" stroke="rgba(0,206,201,0.06)" strokeWidth="0.5" />

                {/* Rotating sweep */}
                <g style={{ transformOrigin: '100px 100px', animation: 'radarSweep 4s linear infinite' }}>
                  <line x1="100" y1="100" x2="100" y2="5" stroke="rgba(0,206,201,0.6)" strokeWidth="1" />
                  <path
                    d="M100,100 L100,15 A85,85 0 0,1 173,47 Z"
                    fill="rgba(0,206,201,0.06)"
                  />
                </g>

                {/* Pulsing dots */}
                <circle cx="70" cy="60" r="2" fill="rgba(0,206,201,0.8)">
                  <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.9;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="140" cy="80" r="2" fill="rgba(0,206,201,0.6)">
                  <animate attributeName="r" values="1.5;3;1.5" dur="2.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="110" cy="140" r="2" fill="rgba(255,200,87,0.6)">
                  <animate attributeName="r" values="2;3.5;2" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.8s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>

            {/* Current Sector label */}
            <div className="text-center">
              <div
                className="text-[10px] tracking-[0.3em] uppercase mb-1"
                style={{ color: 'rgba(0,206,201,0.45)', fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                Current Sector
              </div>
              <div
                className="text-sm tracking-[0.15em] uppercase"
                style={{ color: 'rgba(0,206,201,0.8)', fontFamily: "var(--font-orbitron), sans-serif" }}
              >
                ORBIT-IV &middot; LAB NODE
              </div>
            </div>

            {/* Telemetry Panel */}
            <div
              className="w-full border rounded-sm p-4 space-y-2"
              style={{
                borderColor: 'rgba(0,206,201,0.12)',
                background: 'rgba(5,11,24,0.5)',
              }}
            >
              <TelemetryItem label="OXYGEN" value="98.2%" status="normal" />
              <TelemetryItem label="THRUST" value="STANDBY" status="normal" />
              <TelemetryItem label="SHIELDS" value="ACTIVE" status="normal" />
              <TelemetryItem label="FUEL" value="74.1%" status="warning" />
              <TelemetryItem
                label="CREW AUTH"
                value={authStatusText}
                status={authState === 'CONFIRMED' ? 'success' : authState === 'VERIFYING' ? 'verifying' : authState === 'DENIED' ? 'denied' : 'pending'}
              />
            </div>
          </motion.div>

          {/* ── Right Column: Login Form ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center lg:items-start w-full max-w-sm"
            style={{ animation: 'fadeup 0.8s ease both', animationDelay: '0.4s' }}
          >
            {/* Subtitle */}
            <div
              className="text-xs tracking-[0.25em] uppercase mb-2 text-center lg:text-left"
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                color: 'rgba(0,206,201,0.55)',
              }}
            >
              XLR8 VESSEL // FINALS MISSION IV
            </div>

            {/* Title with floating + glitch effect */}
            <div
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[0.15em] uppercase text-center lg:text-left mb-2"
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                animation: 'glitch-float 4s ease-in-out infinite',
              }}
            >
              <span
                style={{
                  color: 'rgba(0,206,201,0.95)',
                  textShadow: '0 0 20px rgba(0,206,201,0.5), 0 0 40px rgba(0,206,201,0.2)',
                  position: 'relative',
                  display: 'inline-block',
                }}
              >
                CREW CLEARANCE
                {/* Glitch pseudo-layers via duplicates */}
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'rgba(255,0,80,0.7)',
                    clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
                    animation: 'glitch-top 3s infinite linear alternate-reverse',
                  }}
                  aria-hidden="true"
                >CREW CLEARANCE</span>
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    color: 'rgba(0,245,255,0.7)',
                    clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
                    animation: 'glitch-bottom 2.5s infinite linear alternate-reverse',
                  }}
                  aria-hidden="true"
                >CREW CLEARANCE</span>
              </span>
            </div>

            {/* Restricted notice */}
            <div
              className="text-xs tracking-[0.15em] mb-5 text-center lg:text-left"
              style={{ color: 'rgba(0,206,201,0.4)' }}
            >
              Restricted terminal — authorized personnel only
            </div>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'rgba(0,206,201,0.2)' }} />
              <span style={{ color: 'rgba(0,206,201,0.5)', fontSize: '8px' }}>/</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(0,206,201,0.2)' }} />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full space-y-4">
              {/* Crew Identifier */}
              <div>
                <label
                  className="block text-[11px] tracking-[0.2em] uppercase mb-2"
                  style={{
                    color: 'rgba(0,206,201,0.6)',
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
                  className="grunge-input w-full px-4 py-3 text-sm outline-none"
                  style={{
                    color: 'rgba(0,206,201,0.9)',
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    border: '1px solid rgba(0,206,201,0.15)',
                    borderRadius: '2px',
                    caretColor: 'rgba(0,206,201,0.8)',
                  }}
                  autoComplete="username"
                />
              </div>

              {/* Encryption Key */}
              <div>
                <label
                  className="block text-[11px] tracking-[0.2em] uppercase mb-2"
                  style={{
                    color: 'rgba(0,206,201,0.6)',
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
                    className="grunge-input w-full px-4 py-3 pr-10 text-sm outline-none"
                    style={{
                      color: 'rgba(0,206,201,0.9)',
                      fontFamily: "var(--font-rajdhani), sans-serif",
                      border: '1px solid rgba(0,206,201,0.15)',
                      borderRadius: '2px',
                      caretColor: 'rgba(0,206,201,0.8)',
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => { setShowPwd(!showPwd); if (soundEnabled) soundEngine.playClick(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-0 p-0"
                    style={{
                      color: showPwd ? 'rgba(0,206,201,0.8)' : 'rgba(0,206,201,0.35)',
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
                className="w-full py-3 mt-2 text-sm tracking-[0.25em] uppercase cursor-pointer border-0"
                onMouseEnter={() => { if (soundEnabled) soundEngine.playHover(); }}
                style={{
                  fontFamily: "var(--font-orbitron), sans-serif",
                  color:
                    authState === 'CONFIRMED'
                      ? 'rgba(125,249,192,0.95)'
                      : authState === 'DENIED'
                        ? 'rgba(255,59,48,0.95)'
                        : 'rgba(0,206,201,0.95)',
                  background:
                    authState === 'CONFIRMED'
                      ? 'rgba(125,249,192,0.08)'
                      : authState === 'DENIED'
                        ? 'rgba(255,59,48,0.08)'
                        : authState === 'VERIFYING'
                          ? 'rgba(0,206,201,0.06)'
                          : 'rgba(0,206,201,0.05)',
                  border: `1px solid ${authState === 'CONFIRMED' ? 'rgba(125,249,192,0.3)' : authState === 'DENIED' ? 'rgba(255,59,48,0.3)' : 'rgba(0,206,201,0.2)'}`,
                  borderRadius: '2px',
                  animation: authState === 'PENDING' ? 'breathe 3s ease-in-out infinite' : authState === 'DENIED' ? 'shake 0.3s linear' : 'none',
                  boxShadow:
                    authState === 'CONFIRMED'
                      ? '0 0 15px rgba(125,249,192,0.2)'
                      : authState === 'DENIED'
                        ? '0 0 15px rgba(255,59,48,0.3)'
                        : undefined,
                  opacity: authState !== 'PENDING' && authState !== 'CONFIRMED' && authState !== 'DENIED' ? 0.7 : 1,
                }}
              >
                {authState === 'PENDING' && 'INITIATE CLEARANCE'}
                {authState === 'VERIFYING' && 'VERIFYING...'}
                {authState === 'CONFIRMED' && 'CLEARANCE GRANTED'}
                {authState === 'DENIED' && 'ACCESS DENIED'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* ── Bottom Bar ────────────────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 z-10 flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 py-3 border-t gap-2"
          style={{
            borderColor: 'rgba(0,206,201,0.1)',
            background: 'rgba(5,11,24,0.6)',
          }}
        >
          {/* Left: Professor name */}
          <div
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase"
            style={{
              fontFamily: "var(--font-orbitron), sans-serif",
              color: 'rgba(0,206,201,0.4)',
            }}
          >
            HERMOSO ● NUEVAS ● ORENSE ● SANTIAGO ● III - DCSAD
          </div>

          {/* Right: Status items */}
          <div className="flex items-center gap-4 sm:gap-6">
            <BottomStatusItem label="ENCRYPTION" value="AES-256-GCM" />
            <BottomStatusItem label="NODE" value="RECURSION-04" />
            <BottomStatusItem label="STATUS" value="AWAITING CREW" />
          </div>
        </div>
        <div className="scanline-overlay" />
      </motion.div>
  );
}

// ─── Status Dot Component ────────────────────────────────────────────────────
function StatusDot({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: color === 'cyan' ? 'rgba(0,206,201,0.8)' : 'rgba(255,200,87,0.8)',
          animation: pulse ? 'pulse 2s ease-in-out infinite' : 'none',
          boxShadow: color === 'cyan' ? '0 0 4px rgba(0,206,201,0.5)' : '0 0 4px rgba(255,200,87,0.5)',
        }}
      />
      <span
        className="text-[10px] tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: 'rgba(0,206,201,0.5)',
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
    status === 'warning'
      ? 'rgba(255,200,87,0.9)'
      : status === 'pending'
        ? 'rgba(0,206,201,0.5)'
        : status === 'verifying'
          ? 'rgba(255,200,87,0.9)'
          : status === 'success'
            ? 'rgba(125,249,192,0.9)'
            : status === 'denied'
              ? 'rgba(255,59,48,0.9)'
              : 'rgba(0,206,201,0.8)';

  return (
    <div className="flex items-center justify-between">
      <span
        className="text-[10px] tracking-[0.2em] uppercase"
        style={{
          fontFamily: "var(--font-orbitron), sans-serif",
          color: 'rgba(0,206,201,0.45)',
        }}
      >
        {label}
      </span>
      <span
        className="text-xs tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-rajdhani), sans-serif",
          color: valueColor,
          animation: status === 'verifying' ? 'pulse 0.8s ease-in-out infinite' : status === 'denied' ? 'pulse 0.4s ease-in-out infinite' : 'none',
        }}
      >
        {value}
      </span>
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
          color: 'rgba(0,206,201,0.35)',
        }}
      >
        {label}:
      </span>
      <span
        className="text-[9px] sm:text-[10px] tracking-[0.15em] uppercase"
        style={{
          fontFamily: "var(--font-rajdhani), sans-serif",
          color: 'rgba(0,206,201,0.65)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
