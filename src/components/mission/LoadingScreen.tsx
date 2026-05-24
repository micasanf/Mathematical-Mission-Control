'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundEngine } from '@/lib/soundEngine';
import { useAppStore } from '@/store/appStore';

// ─── Phase type ────────────────────────────────────────────────────────────────
type LoadingPhase = 'countdown' | 'liftoff' | 'complete';

// ─── Star field (twinkling) ────────────────────────────────────────────────────
function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 180 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 75,
      size: Math.random() < 0.12 ? 2.5 : Math.random() < 0.3 ? 1.5 : 1,
      duration: 1.5 + Math.random() * 3,
      delay: Math.random() * 3,
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
            animation: `ls-star-twinkle ${star.duration}s linear ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Sci-fi Rocket SVG (upright, nose pointing up, cyan/teal color) ──────────
function SciFiRocketSVG() {
  return (
    <svg width="52" height="160" viewBox="0 0 52 160" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(0,220,255,0.6))' }}>
      <defs>
        <linearGradient id="ls-bodyGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a2a3a" />
          <stop offset="30%" stopColor="#0d3d52" />
          <stop offset="60%" stopColor="#1a5a70" />
          <stop offset="100%" stopColor="#0a2a3a" />
        </linearGradient>
        <linearGradient id="ls-noseGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#062030" />
          <stop offset="50%" stopColor="#0a3a50" />
          <stop offset="100%" stopColor="#062030" />
        </linearGradient>
        <linearGradient id="ls-accentGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00ffcc" />
          <stop offset="100%" stopColor="#0088ff" />
        </linearGradient>
      </defs>
      {/* Nose cone */}
      <polygon points="26,4 34,32 18,32" fill="url(#ls-noseGrad)" stroke="#00ccff" strokeWidth="0.5" />
      {/* Antenna tip */}
      <path d="M26,4 L26,0" stroke="#00ffcc" strokeWidth="0.8" opacity="0.8" />
      <circle cx="26" cy="0" r="1.5" fill="#00ffcc" opacity="0.9" />
      {/* Main body */}
      <rect x="14" y="30" width="24" height="90" rx="2" fill="url(#ls-bodyGrad)" stroke="#00aacc" strokeWidth="0.5" />
      {/* Accent stripes */}
      <rect x="14" y="38" width="24" height="2" fill="url(#ls-accentGrad)" opacity="0.7" />
      <rect x="14" y="90" width="24" height="2" fill="url(#ls-accentGrad)" opacity="0.7" />
      <rect x="14" y="108" width="24" height="2" fill="url(#ls-accentGrad)" opacity="0.5" />
      {/* Viewport / window area */}
      <rect x="21" y="50" width="10" height="28" rx="1" fill="#020e18" stroke="#00aacc" strokeWidth="0.4" opacity="0.9" />
      <circle cx="26" cy="58" r="3" fill="#000" stroke="#00ffcc" strokeWidth="0.5" />
      <circle cx="26" cy="58" r="1.5" fill="#00ffcc" opacity="0.6" />
      <line x1="21" y1="64" x2="31" y2="64" stroke="#00aacc" strokeWidth="0.3" opacity="0.5" />
      <line x1="21" y1="68" x2="31" y2="68" stroke="#00aacc" strokeWidth="0.3" opacity="0.5" />
      <line x1="21" y1="72" x2="31" y2="72" stroke="#00aacc" strokeWidth="0.3" opacity="0.5" />
      {/* Status lights */}
      <rect x="22" y="84" width="3" height="3" rx="0.5" fill="#00ffcc" opacity="0.5" />
      <rect x="27" y="84" width="3" height="3" rx="0.5" fill="#ff4400" opacity="0.5" />
      {/* Fins */}
      <polygon points="14,110 4,140 14,138" fill="#0a1e28" stroke="#007a99" strokeWidth="0.5" />
      <polygon points="38,110 48,140 38,138" fill="#0a1e28" stroke="#007a99" strokeWidth="0.5" />
      {/* Engine section */}
      <rect x="12" y="118" width="28" height="22" rx="2" fill="#030f18" stroke="#00aacc" strokeWidth="0.5" />
      <ellipse cx="26" cy="140" rx="10" ry="4" fill="#020a10" stroke="#007799" strokeWidth="0.5" />
      <ellipse cx="26" cy="140" rx="6" ry="2.5" fill="#000" stroke="#00ccff" strokeWidth="0.6" />
      <ellipse cx="26" cy="140" rx="3" ry="1.5" fill="#001122" />
      {/* Label */}
      <rect x="22" y="94" width="8" height="6" rx="1" fill="#010a10" stroke="#00aacc" strokeWidth="0.4" />
      <text x="26" y="99.5" textAnchor="middle" fontSize="3.5" fill="#00ffcc" opacity="0.7" fontFamily="Share Tech Mono, monospace">ARC7</text>
    </svg>
  );
}

// ─── Rocket Flames (3-layer: outer, inner, core) ─────────────────────────────
function RocketFlames({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="flex flex-col items-center relative" style={{ marginTop: '-1px' }}>
      {/* Outer flame */}
      <div
        className="w-12 h-[90px] blur-[1px]"
        style={{
          background: 'linear-gradient(to bottom, #ff4400, #ff8800, #ffcc00, transparent)',
          clipPath: 'polygon(20% 0%, 80% 0%, 95% 50%, 100% 100%, 50% 80%, 0% 100%, 5% 50%)',
          animation: 'ls-flame-pulse 0.12s linear infinite',
        }}
      />
      {/* Inner flame */}
      <div
        className="absolute top-0 w-[26px] h-[60px]"
        style={{
          background: 'linear-gradient(to bottom, #fff, #ffffaa, #ffee00, transparent)',
          clipPath: 'polygon(20% 0%, 80% 0%, 90% 60%, 50% 100%, 10% 60%)',
          animation: 'ls-flame-pulse 0.09s linear infinite',
        }}
      />
      {/* Core flame */}
      <div
        className="absolute top-0 w-[12px] h-[32px]"
        style={{
          background: 'linear-gradient(to bottom, #ffffff, #aaffff, transparent)',
          clipPath: 'polygon(20% 0%, 80% 0%, 90% 70%, 50% 100%, 10% 70%)',
          animation: 'ls-flame-pulse 0.07s linear infinite',
        }}
      />
    </div>
  );
}

// ─── Smoke Cloud Puffs ────────────────────────────────────────────────────────
function SmokeCloud({ visible }: { visible: boolean }) {
  const puffs = useMemo(() => [
    { left: -45, size: 60, delay: 0, dur: 1.1 },
    { left: 45, size: 50, delay: 0.2, dur: 1.0 },
    { left: -20, size: 70, delay: 0.4, dur: 1.3 },
    { left: 20, size: 55, delay: 0.15, dur: 1.2 },
    { left: -60, size: 40, delay: 0.35, dur: 0.9 },
    { left: 60, size: 45, delay: 0.5, dur: 1.15 },
  ], []);

  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 48 }}>
      {puffs.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            bottom: 0,
            marginLeft: -p.size / 2,
            background: 'rgba(150,200,180,0.18)',
            animation: `ls-smoke-rise ${p.dur}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Launch Sparks ────────────────────────────────────────────────────────────
function LaunchSparks({ visible }: { visible: boolean }) {
  const sparks = useMemo(() => {
    const colors = ['#ffcc00', '#ff8800', '#ff4400', '#00ffcc', '#ffffff'];
    return Array.from({ length: 22 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 60;
      return {
        id: i,
        sx: Math.cos(angle) * dist,
        sy: Math.sin(angle) * dist * 0.5 + 20,
        left: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: 0.4 + Math.random() * 0.5,
        delay: Math.random(),
      };
    });
  }, []);

  if (!visible) return null;
  return (
    <div className="absolute left-1/2 pointer-events-none z-20" style={{ bottom: 88 }}>
      {sparks.map((sp) => (
        <div
          key={sp.id}
          className="absolute w-[3px] h-[3px] rounded-full"
          style={{
            background: sp.color,
            left: sp.left,
            top: 0,
            animation: `ls-spark ${sp.duration}s ease-out ${sp.delay}s infinite`,
            '--ls-sx': `${sp.sx}px`,
            '--ls-sy': `${sp.sy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ─── Shockwave Ring ───────────────────────────────────────────────────────────
function ShockwaveRing({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 80 }}>
      <div
        className="w-[60px] h-[20px] rounded-[50%]"
        style={{
          border: '1px solid rgba(0,220,255,0.8)',
          animation: 'ls-shockwave 0.9s ease-out infinite',
        }}
      />
    </div>
  );
}

// ─── Expanding Rings (on ignition) ────────────────────────────────────────────
function ExpandingRings({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 pointer-events-none z-20" style={{ bottom: 72 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-[80px] h-[26px] rounded-[50%]"
          style={{
            border: '1px solid rgba(0,220,255,0.5)',
            left: -40,
            top: -13,
            animation: `ls-ring-expand 1.2s ease-out ${i * 0.3}s infinite`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

// ─── HUD Left Panel ──────────────────────────────────────────────────────────
function HUDLeft({ thrust, fuel, status }: { thrust: number; fuel: number; status: string }) {
  const statusColor = status === 'LIFTOFF'
    ? 'rgba(0,255,130,0.95)'
    : status === 'ASCENDING'
      ? 'rgba(0,255,130,0.95)'
      : status.startsWith('T-MINUS')
        ? 'rgba(255,180,0,0.9)'
        : 'rgba(0,255,200,0.95)';

  return (
    <div className="absolute top-5 left-5 z-30" style={{ color: 'rgba(0,220,255,0.85)', fontSize: '11px', lineHeight: 1.8, fontFamily: "var(--font-share-tech-mono), monospace", textShadow: '0 0 6px rgba(0,220,255,0.8)' }}>
      <div style={{ color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>VEHICLE ID</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>ARC-7 NOVA</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>THRUST</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{thrust}%</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>STATUS</div>
      <div style={{ color: statusColor, fontWeight: 'bold' }}>{status}</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>FUEL</div>
      <div style={{ color: fuel < 20 ? 'rgba(255,180,0,0.9)' : 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{fuel}%</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>STAGE</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>01 / 02</div>
    </div>
  );
}

// ─── HUD Right Panel ─────────────────────────────────────────────────────────
function HUDRight({ altitude, velocity, accel, temp }: { altitude: number; velocity: number; accel: number; temp: number }) {
  return (
    <div className="absolute top-5 right-5 z-30 text-right" style={{ color: 'rgba(0,220,255,0.85)', fontSize: '11px', lineHeight: 1.8, fontFamily: "var(--font-share-tech-mono), monospace", textShadow: '0 0 6px rgba(0,220,255,0.8)' }}>
      <div style={{ color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>ALTITUDE</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{altitude} m</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>VELOCITY</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{velocity} m/s</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>ACCEL</div>
      <div style={{ color: 'rgba(0,255,200,0.95)', fontWeight: 'bold' }}>{accel.toFixed(1)} g</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>TEMP</div>
      <div style={{ color: 'rgba(255,180,0,0.9)', fontWeight: 'bold' }}>{temp} K</div>
      <div style={{ marginTop: 6, color: 'rgba(0,220,255,0.45)', fontSize: '10px', letterSpacing: '1px' }}>COMMS</div>
      <div style={{ color: 'rgba(0,255,130,0.9)', fontWeight: 'bold' }}>NOMINAL</div>
    </div>
  );
}

// ─── Data Stream ─────────────────────────────────────────────────────────────
function DataStream() {
  return (
    <div
      className="absolute top-5 left-1/2 -translate-x-1/2 z-30 overflow-hidden text-center rounded-[3px] py-[2px]"
      style={{ border: '1px solid rgba(0,220,255,0.2)', width: 180, height: 30 }}
    >
      <div
        style={{
          fontFamily: "var(--font-share-tech-mono), monospace",
          fontSize: '10px',
          color: 'rgba(0,220,255,0.7)',
          lineHeight: 1.7,
          animation: 'ls-data-scroll 4s linear infinite',
          whiteSpace: 'nowrap',
        }}
      >
        SYS_INIT OK&nbsp;&nbsp;NAV_LOCK OK<br />
        FUEL_PRES 98.4%&nbsp;&nbsp;LOX OK<br />
        MAIN_ENG: ARMED&nbsp;&nbsp;RCS: STBY<br />
        TRAJECTORY: NOMINAL<br />
        RANGE_SAFETY: CLEAR<br />
        SYS_INIT OK&nbsp;&nbsp;NAV_LOCK OK
      </div>
    </div>
  );
}

// ─── Altitude Bar (grows from 4px to 140px during launch) ───────────────────
function AltitudeBar({ launched }: { launched: boolean }) {
  return (
    <div className="absolute right-[22px] z-30 w-2 rounded-[2px] flex items-end overflow-hidden" style={{ border: '1px solid rgba(0,220,255,0.25)', bottom: 58, height: 140 }}>
      <div
        className="w-full"
        style={{
          background: 'linear-gradient(to top, #00ffcc, #00aaff)',
          height: 4,
          animation: launched ? 'ls-altitude-bar 4s cubic-bezier(0.2,0,0.8,1) forwards' : 'none',
        }}
      />
    </div>
  );
}

// ─── Power Bar (grows from 20% to 100% during launch) ────────────────────────
function PowerBar({ launched }: { launched: boolean }) {
  return (
    <div className="absolute left-5 z-30" style={{ bottom: 18, width: 120 }}>
      <div style={{ fontSize: '9px', color: 'rgba(0,220,255,0.45)', letterSpacing: '1px', marginBottom: 3 }}>ENGINE POWER</div>
      <div className="h-[5px] rounded-[2px] overflow-hidden" style={{ background: 'rgba(0,220,255,0.1)', border: '1px solid rgba(0,220,255,0.2)' }}>
        <div
          className="h-full"
          style={{
            background: 'linear-gradient(90deg, #00ffcc, #00aaff, #ff4400)',
            width: '20%',
            animation: launched ? 'ls-power-bar 3.5s cubic-bezier(0.2,0,0.8,1) forwards' : 'none',
          }}
        />
      </div>
    </div>
  );
}

// ─── Corner Brackets ─────────────────────────────────────────────────────────
function CornerBrackets() {
  const corners = [
    { cls: 'top-[10px] left-[10px] border-t border-l' },
    { cls: 'top-[10px] right-[10px] border-t border-r' },
    { cls: 'bottom-[10px] left-[10px] border-b border-l' },
    { cls: 'bottom-[10px] right-[10px] border-b border-r' },
  ];
  return (
    <>
      {corners.map((c, i) => (
        <div
          key={i}
          className={`absolute w-3 h-3 z-30 ${c.cls}`}
          style={{ borderColor: 'rgba(0,220,255,0.4)' }}
        />
      ))}
    </>
  );
}

// ─── Countdown Number ────────────────────────────────────────────────────────
function CountdownNumber({ number }: { number: number | null }) {
  return (
    <AnimatePresence>
      {number !== null && (
        <motion.div
          key={number}
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.3, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <span
            style={{
              fontFamily: "var(--font-share-tech-mono), monospace",
              fontSize: '220px',
              fontWeight: 'bold',
              color: '#ff5500',
              textShadow: '0 0 40px rgba(255,80,0,1), 0 0 80px rgba(255,50,0,0.7), 0 0 120px rgba(255,30,0,0.4)',
              lineHeight: 1,
            }}
          >
            {number}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── LIFTOFF Text ────────────────────────────────────────────────────────────
function LiftoffText({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: [0.4, 1.3, 1], opacity: [0, 1, 1] }}
          exit={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span
            style={{
              fontFamily: "var(--font-share-tech-mono), monospace",
              fontSize: '100px',
              fontWeight: 'bold',
              color: '#00ffcc',
              textShadow: '0 0 30px rgba(0,255,200,1), 0 0 60px rgba(0,200,255,0.8)',
              letterSpacing: '8px',
              lineHeight: 1,
            }}
          >
            LIFTOFF
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Liftoff Flash ───────────────────────────────────────────────────────────
function LiftoffFlash({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="absolute inset-0 z-[100] pointer-events-none"
      style={{
        backgroundColor: '#ffffff',
        animation: 'ls-liftoff-flash 1.8s ease-out forwards',
      }}
    />
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LoadingScreen() {
  const { finishLoading, soundEnabled } = useAppStore();

  const [phase, setPhase] = useState<LoadingPhase>('countdown');

  // Countdown state
  const [countdownNum, setCountdownNum] = useState<number | null>(null);
  const [showLiftoffText, setShowLiftoffText] = useState(false);

  // Launch effects state
  const [showFlames, setShowFlames] = useState(false);
  const [showSmoke, setShowSmoke] = useState(false);
  const [showSparks, setShowSparks] = useState(false);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showRings, setShowRings] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [launched, setLaunched] = useState(false);

  // HUD telemetry state
  const [thrust, setThrust] = useState(0);
  const [fuel, setFuel] = useState(100);
  const [status, setStatus] = useState('STANDBY');
  const [altitude, setAltitude] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [accel, setAccel] = useState(0);
  const [temp, setTemp] = useState(1200);
  const [phaseLabel, setPhaseLabel] = useState('AWAITING IGNITION');

  const hudIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Helper to track timers for cleanup
  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  // ─── Ignition / Launch logic ────────────────────────────────────────────
  const ignite = useCallback(() => {
    setPhase('liftoff');
    setShowFlames(true);
    setShowSmoke(true);
    setShowSparks(true);
    setShowShockwave(true);
    setShowRings(true);
    setLaunched(true);

    setPhaseLabel('LIFTOFF CONFIRMED');
    setStatus('LIFTOFF');

    if (soundEnabled) soundEngine.playRocketLaunch();

    // HUD telemetry update during launch
    const missionStart = Date.now();
    hudIntervalRef.current = setInterval(() => {
      const t = (Date.now() - missionStart) / 1000;

      setThrust(Math.min(100, Math.round(t * 40)));
      setAltitude(Math.round(Math.pow(t, 2.2) * 120));
      setVelocity(Math.round(t * 85));
      setAccel(Math.min(3.2, t * 1.2));
      setFuel(Math.max(0, Math.round(100 - t * 18)));
      setTemp(Math.round(1200 + t * 600));

      if (t > 2) {
        setPhaseLabel('MAX-Q ASCENT');
        setStatus('ASCENDING');
      }
      if (t > 4) {
        setPhaseLabel('STAGE 1 BURN');
      }
    }, 50);

    // Flash after rocket has left the screen (~3.6s after launch)
    addTimer(() => {
      if (hudIntervalRef.current) {
        clearInterval(hudIntervalRef.current);
        hudIntervalRef.current = null;
      }
      setShowFlash(true);
      setPhase('complete');
    }, 3700);

    // Transition to dashboard right after flash peaks
    addTimer(() => {
      finishLoading();
    }, 3900);
  }, [soundEnabled, addTimer, finishLoading]);

  // ─── Countdown sequence on mount ────────────────────────────────────────
  useEffect(() => {
    // Play deploy sound
    if (soundEnabled) soundEngine.playDeploy();

    // Start countdown after short delay
    addTimer(() => {
      setPhaseLabel('COUNTDOWN ACTIVE');
      setStatus('T-MINUS 3');
      setCountdownNum(3);

      // Show 3 → 2
      addTimer(() => {
        setStatus('T-MINUS 2');
        setCountdownNum(2);
        if (soundEnabled) soundEngine.playClick();
      }, 900);

      // Show 2 → 1
      addTimer(() => {
        setStatus('T-MINUS 1');
        setCountdownNum(1);
        if (soundEnabled) soundEngine.playClick();
      }, 1800);

      // Show LIFTOFF text
      addTimer(() => {
        setCountdownNum(null);
        setShowLiftoffText(true);
        if (soundEnabled) soundEngine.playStart();
      }, 2700);

      // Ignite at ~3.1s
      addTimer(() => {
        setShowLiftoffText(false);
        ignite();
      }, 3100);
    }, 400);

    return () => {
      if (hudIntervalRef.current) {
        clearInterval(hudIntervalRef.current);
        hudIntervalRef.current = null;
      }
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current = [];
    };
  }, [addTimer, soundEnabled, ignite]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background: '#000814',
        fontFamily: "var(--font-share-tech-mono), monospace",
      }}
    >
      {/* ── All keyframe styles ── */}
      <style>{`
        @keyframes ls-star-twinkle { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.2;transform:scale(0.5)} }
        @keyframes ls-flame-pulse { 0%,100%{transform:scaleX(1) scaleY(1);opacity:1} 50%{transform:scaleX(1.15) scaleY(1.3);opacity:0.85} }
        @keyframes ls-smoke-rise { 0%{transform:translateY(0) scale(0.2);opacity:0.9} 100%{transform:translateY(-180px) scale(4);opacity:0} }
        @keyframes ls-shockwave { 0%{transform:scale(0.5);opacity:0.9} 100%{transform:scale(3.5);opacity:0} }
        @keyframes ls-spark { 0%{transform:translate(0,0) scale(1);opacity:1} 100%{transform:translate(var(--ls-sx),var(--ls-sy)) scale(0);opacity:0} }
        @keyframes ls-ring-expand { 0%{transform:scale(1);opacity:0.9} 100%{transform:scale(2.5);opacity:0} }
        @keyframes ls-altitude-bar { 0%{height:4px} 100%{height:140px} }
        @keyframes ls-power-bar { 0%{width:20%} 100%{width:100%} }
        @keyframes ls-data-scroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        @keyframes ls-hud-blink { 0%,80%,100%{opacity:1} 90%{opacity:0.2} }
        @keyframes ls-liftoff-flash { 0%{opacity:0} 5%{opacity:1} 40%{opacity:0.85} 100%{opacity:0} }
        @keyframes ls-grid-scroll { 0%{transform:translateY(0)} 100%{transform:translateY(80px)} }
        @keyframes ls-scan-line { 0%{top:0%;opacity:0.6} 100%{top:100%;opacity:0} }
        @keyframes ls-launch { 0%{transform:translateX(-50%) translateY(0) rotate(0deg)} 2%{transform:translateX(calc(-50% - 2px)) translateY(-4px) rotate(0deg)} 4%{transform:translateX(calc(-50% + 2px)) translateY(-8px) rotate(0deg)} 6%{transform:translateX(calc(-50% - 1px)) translateY(-14px) rotate(0deg)} 8%{transform:translateX(calc(-50% + 1px)) translateY(-20px) rotate(0deg)} 10%{transform:translateX(-50%) translateY(-28px) rotate(0deg)} 30%{transform:translateX(-50%) translateY(-280px) rotate(0deg)} 55%{transform:translateX(20%) translateY(-580px) rotate(18deg)} 100%{transform:translateX(80%) translateY(-980px) rotate(22deg)} }
      `}</style>

      {/* ── Star field ── */}
      <StarField />

      {/* ── Grid overlay ── */}
      <div
        className="absolute inset-0 pointer-events-none z-[5]"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,220,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,220,255,0.07) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          animation: 'ls-grid-scroll 2s linear infinite',
        }}
      />

      {/* ── Scan line ── */}
      <div
        className="absolute left-0 right-0 h-[2px] z-[6] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,220,255,0.3), transparent)',
          animation: 'ls-scan-line 4s linear infinite',
        }}
      />

      {/* ── Corner brackets ── */}
      <CornerBrackets />

      {/* ── HUD Left ── */}
      <HUDLeft thrust={thrust} fuel={fuel} status={status} />

      {/* ── HUD Right ── */}
      <HUDRight altitude={altitude} velocity={velocity} accel={accel} temp={temp} />

      {/* ── Data stream ── */}
      <DataStream />

      {/* ── Altitude bar ── */}
      <AltitudeBar launched={launched} />

      {/* ── Power bar ── */}
      <PowerBar launched={launched} />

      {/* ── Horizon ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[120px] pointer-events-none z-[1]" style={{ background: 'linear-gradient(to top, #001a1a, transparent)' }} />

      {/* ── Ground ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[48px] z-[6]" style={{ background: '#000d0d', borderTop: '1px solid rgba(0,220,255,0.3)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(0,220,255,0.5)', boxShadow: '0 0 8px rgba(0,220,255,0.6)' }} />
      </div>

      {/* ── Launch pad ── */}
      <div className="absolute z-[7]" style={{ bottom: 48, left: '50%', transform: 'translateX(-50%)', width: 130, height: 14, background: '#0a1a1a', border: '1px solid rgba(0,220,255,0.4)', borderRadius: 2 }}>
        <div className="absolute top-[2px] left-2 right-2 h-[2px]" style={{ background: 'rgba(0,220,255,0.3)' }} />
      </div>

      {/* ── Launch effects (smoke, sparks, shockwave, rings) ── */}
      <SmokeCloud visible={showSmoke} />
      <LaunchSparks visible={showSparks} />
      <ShockwaveRing visible={showShockwave} />
      <ExpandingRings visible={showRings} />

      {/* ── Rocket wrapper (with launch animation) ── */}
      <div
        className="absolute z-[10] flex flex-col items-center"
        style={{
          bottom: 62,
          left: '50%',
          transform: launched ? undefined : 'translateX(-50%)',
          animation: launched ? 'ls-launch 3.5s cubic-bezier(0.2,0,0.8,1) forwards' : 'none',
        }}
      >
        <SciFiRocketSVG />
        <RocketFlames visible={showFlames} />
      </div>

      {/* ── Countdown number ── */}
      <CountdownNumber number={countdownNum} />

      {/* ── LIFTOFF text ── */}
      <LiftoffText visible={showLiftoffText} />

      {/* ── Liftoff flash ── */}
      <LiftoffFlash visible={showFlash} />

      {/* ── Phase label at bottom ── */}
      <div
        className="absolute z-30 text-center"
        style={{
          bottom: 18,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          letterSpacing: '2px',
          color: phaseLabel === 'LIFTOFF CONFIRMED' ? 'rgba(0,255,180,0.8)' : 'rgba(255,100,0,0.7)',
          animation: phaseLabel === 'LIFTOFF CONFIRMED' ? 'ls-hud-blink 0.8s linear infinite' : 'none',
        }}
      >
        {phaseLabel}
      </div>
    </div>
  );
}
