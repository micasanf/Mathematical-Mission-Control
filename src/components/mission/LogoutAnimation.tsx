'use client';

import { useEffect, useRef } from 'react';
import { soundEngine } from '@/lib/soundEngine';
import { useAppStore } from '@/store/appStore';

// ─── Types ──────────────────────────────────────────────────────────────────────

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  spd: number;
  ph: number;
}

interface Debris {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
  decay: number;
  ang: number;
  rot: number;
}

interface Ejecta {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  life: number;
  decay: number;
}

interface Shock {
  x: number;
  y: number;
  r: number;
  spd: number;
  color: string;
  a: number;
}

interface Trail {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  r: number;
  decay: number;
  hot: boolean;
}

interface Frag {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rot: number;
  rotSpd: number;
  a: number;
  decay: number;
}

interface AnimState {
  T: number;
  prevTS: number | null;
  impacted: boolean;
  impactTS: number;
  shakeAmt: number;
  shakePhase: number;
  debris: Debris[];
  ejecta: Ejecta[];
  shocks: Shock[];
  trails: Trail[];
  frags: Frag[];
  stars: Star[];
  W: number;
  H: number;
  fadeAlpha: number;
  fadeStarted: boolean;
  navigated: boolean;
  launchSoundPlayed: boolean;
  crashSoundPlayed: boolean;
  fadeSoundPlayed: boolean;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const DUR = 3.0;

const NPT: [number, number][] = [
  [-0.35, -0.75],
  [0.05, -0.85],
  [0.38, -0.6],
  [0.55, -0.25],
  [0.45, 0.15],
  [0.7, 0.45],
  [0.5, 0.8],
  [0.1, 0.85],
  [-0.3, 0.65],
  [-0.55, 0.3],
  [-0.7, -0.1],
  [-0.5, -0.5],
];

// ─── Utilities ───────────────────────────────────────────────────────────────────

function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeIn(t: number, p = 2): number {
  return Math.pow(clamp(t, 0, 1), p);
}

// ─── Drawing Functions ───────────────────────────────────────────────────────────

function nucleusPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(cx + NPT[0][0] * r, cy + NPT[0][1] * r);
  for (let i = 0; i < NPT.length; i++) {
    const n = (i + 1) % NPT.length;
    ctx.quadraticCurveTo(
      cx + NPT[i][0] * r,
      cy + NPT[i][1] * r,
      cx + ((NPT[i][0] + NPT[n][0]) / 2) * r,
      cy + ((NPT[i][1] + NPT[n][1]) / 2) * r,
    );
  }
  ctx.closePath();
}

function drawComet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  rot: number,
  alpha: number,
) {
  if (alpha <= 0 || r <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  ctx.translate(-cx, -cy);

  // Dust tail
  const dl = r * 4.5;
  const dg = ctx.createLinearGradient(cx, cy, cx - dl * 0.6, cy + dl * 0.35);
  dg.addColorStop(0, 'rgba(200,170,110,0.22)');
  dg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.4, cy - r * 0.3);
  ctx.bezierCurveTo(
    cx - r * 2, cy,
    cx - dl * 0.5, cy + dl * 0.28,
    cx - dl * 0.62, cy + dl * 0.38,
  );
  ctx.bezierCurveTo(
    cx - dl * 0.45, cy + dl * 0.32,
    cx - r * 1.8, cy + r * 0.8,
    cx - r * 0.25, cy + r * 0.5,
  );
  ctx.closePath();
  ctx.fill();

  // Ion tail
  const il = r * 5.5;
  const ig = ctx.createLinearGradient(cx, cy, cx - il * 0.85, cy - il * 0.28);
  ig.addColorStop(0, 'rgba(100,200,255,0.28)');
  ig.addColorStop(1, 'rgba(60,140,255,0)');
  ctx.fillStyle = ig;
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.25, cy - r * 0.18);
  ctx.bezierCurveTo(
    cx - r * 1.4, cy - r * 0.75,
    cx - il * 0.75, cy - il * 0.3,
    cx - il, cy - il * 0.32,
  );
  ctx.bezierCurveTo(
    cx - il * 0.75, cy - il * 0.26,
    cx - r * 1.4, cy + r * 0.18,
    cx - r * 0.25, cy + r * 0.1,
  );
  ctx.closePath();
  ctx.fill();

  // Coma glow
  const cg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 2.8);
  cg.addColorStop(0, 'rgba(210,190,140,0.3)');
  cg.addColorStop(0.5, 'rgba(180,160,100,0.08)');
  cg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = cg;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 2.8, 0, Math.PI * 2);
  ctx.fill();

  // Nucleus
  const ng = ctx.createRadialGradient(
    cx - r * 0.18, cy - r * 0.22, r * 0.04,
    cx, cy, r,
  );
  ng.addColorStop(0, '#c8a870');
  ng.addColorStop(0.3, '#907050');
  ng.addColorStop(0.7, '#584030');
  ng.addColorStop(1, '#281808');
  ctx.fillStyle = ng;
  nucleusPath(ctx, cx, cy, r);
  ctx.fill();

  // Surface craters
  ctx.strokeStyle = 'rgba(40,25,10,0.55)';
  ctx.lineWidth = Math.max(1, r * 0.025);
  const crts: [number, number, number][] = [
    [-0.25, -0.4, 0.09],
    [0.2, 0.15, 0.07],
    [-0.4, 0.3, 0.06],
    [0.35, -0.2, 0.05],
    [-0.1, 0.5, 0.05],
  ];
  for (const c of crts) {
    ctx.beginPath();
    ctx.arc(cx + c[0] * r, cy + c[1] * r, c[2] * r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Terminator line
  ctx.strokeStyle = 'rgba(220,190,130,0.35)';
  ctx.lineWidth = Math.max(1.5, r * 0.03);
  ctx.beginPath();
  ctx.arc(cx - r * 0.05, cy - r * 0.05, r * 0.88, Math.PI * 1.1, Math.PI * 1.85);
  ctx.stroke();

  // Gas jets
  const jets: [number, number][] = [
    [-0.6, r * 1.9],
    [-1.5, r * 1.3],
    [0.5, r * 1.5],
    [1.9, r * 0.9],
  ];
  for (const jet of jets) {
    const ja = jet[0];
    const jl = jet[1];
    const jg = ctx.createLinearGradient(
      cx + Math.cos(ja) * r * 0.5, cy + Math.sin(ja) * r * 0.5,
      cx + Math.cos(ja) * jl, cy + Math.sin(ja) * jl,
    );
    jg.addColorStop(0, 'rgba(200,225,255,0.38)');
    jg.addColorStop(1, 'rgba(200,225,255,0)');
    ctx.strokeStyle = jg;
    ctx.lineWidth = r * 0.065;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ja) * r * 0.6, cy + Math.sin(ja) * r * 0.6);
    ctx.lineTo(cx + Math.cos(ja) * jl, cy + Math.sin(ja) * jl);
    ctx.stroke();
  }

  ctx.restore();
}

function drawRocket(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  S: number,
  alpha: number,
  T: number,
) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha, 0, 1);
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(S, S);
  ctx.translate(-26, -80);

  // Engine flame
  ctx.save();
  ctx.translate(26, 160);
  const p0 = 0.9 + Math.sin(T * 52) * 0.1;
  const p1 = 0.92 + Math.sin(T * 66) * 0.08;
  const p2 = 0.9 + Math.sin(T * 70) * 0.1;
  const fw = 48 * p0;
  const fh = 70 * p0;
  const fg = ctx.createLinearGradient(0, 0, 0, fh);
  fg.addColorStop(0, '#FF4D00');
  fg.addColorStop(0.4, '#ff8800');
  fg.addColorStop(0.75, '#ffcc00');
  fg.addColorStop(1, 'rgba(255,200,87,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-fw * 0.3, 0);
  ctx.lineTo(fw * 0.3, 0);
  ctx.lineTo(fw * 0.45, fh * 0.5);
  ctx.lineTo(0, fh);
  ctx.lineTo(-fw * 0.45, fh * 0.5);
  ctx.closePath();
  ctx.fill();

  const iw = 22 * p1;
  const ih = 48 * p2;
  const ifg = ctx.createLinearGradient(0, 0, 0, ih);
  ifg.addColorStop(0, '#fff');
  ifg.addColorStop(0.3, '#ffffaa');
  ifg.addColorStop(0.7, '#ffee00');
  ifg.addColorStop(1, 'rgba(255,220,0,0)');
  ctx.fillStyle = ifg;
  ctx.beginPath();
  ctx.moveTo(-iw * 0.3, 0);
  ctx.lineTo(iw * 0.3, 0);
  ctx.lineTo(iw * 0.4, ih * 0.6);
  ctx.lineTo(0, ih);
  ctx.lineTo(-iw * 0.4, ih * 0.6);
  ctx.closePath();
  ctx.fill();

  const cfg2 = ctx.createLinearGradient(0, 0, 0, 28);
  cfg2.addColorStop(0, '#fff');
  cfg2.addColorStop(0.5, '#00F5FF');
  cfg2.addColorStop(1, 'rgba(0,245,255,0)');
  ctx.fillStyle = cfg2;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.lineTo(4, 20);
  ctx.lineTo(0, 28);
  ctx.lineTo(-4, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Body
  const bg = ctx.createLinearGradient(14, 0, 38, 0);
  bg.addColorStop(0, '#0a2a3a');
  bg.addColorStop(0.3, '#0d3d52');
  bg.addColorStop(0.6, '#1a5a70');
  bg.addColorStop(1, '#0a2a3a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(14, 30, 24, 90, 2);
  ctx.fill();
  ctx.strokeStyle = '#4DA8FF';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Teal stripes
  const ag = ctx.createLinearGradient(0, 0, 0, 4);
  ag.addColorStop(0, '#00F5FF');
  ag.addColorStop(1, '#4DA8FF');
  ctx.fillStyle = ag;
  ctx.globalAlpha = clamp(alpha, 0, 1) * 0.7;
  ctx.fillRect(14, 38, 24, 2);
  ctx.fillRect(14, 90, 24, 2);
  ctx.globalAlpha = clamp(alpha, 0, 1) * 0.5;
  ctx.fillRect(14, 108, 24, 2);
  ctx.globalAlpha = clamp(alpha, 0, 1);

  // Window
  ctx.fillStyle = '#020e18';
  ctx.strokeStyle = '#4DA8FF';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(21, 50, 10, 28, 1);
  ctx.fill();
  ctx.stroke();

  // Porthole
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#00F5FF';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.arc(26, 58, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,245,255,0.6)';
  ctx.beginPath();
  ctx.arc(26, 58, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Panel lines
  ctx.strokeStyle = 'rgba(77,168,255,0.5)';
  ctx.lineWidth = 0.3;
  const plines = [64, 68, 72];
  for (const pl of plines) {
    ctx.beginPath();
    ctx.moveTo(21, pl);
    ctx.lineTo(31, pl);
    ctx.stroke();
  }

  // Status lights
  ctx.fillStyle = 'rgba(0,245,255,0.5)';
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(22, 84, 3, 3, 0.5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,77,0,0.5)';
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(27, 84, 3, 3, 0.5);
  ctx.fill();

  // Fins
  ctx.fillStyle = '#0a1e28';
  ctx.strokeStyle = 'rgba(0,206,201,0.7)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(14, 110);
  ctx.lineTo(4, 140);
  ctx.lineTo(14, 138);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(38, 110);
  ctx.lineTo(48, 140);
  ctx.lineTo(38, 138);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Engine housing
  ctx.fillStyle = '#030f18';
  ctx.strokeStyle = '#4DA8FF';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(12, 118, 28, 22, 2);
  ctx.fill();
  ctx.stroke();

  // Nozzle ellipses
  ctx.fillStyle = '#020a10';
  ctx.strokeStyle = 'rgba(0,206,201,0.6)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.ellipse(26, 140, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#00CEC9';
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(26, 140, 6, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#001122';
  ctx.beginPath();
  ctx.ellipse(26, 140, 3, 1.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // ARC7 label
  ctx.fillStyle = '#010a10';
  ctx.strokeStyle = '#4DA8FF';
  ctx.lineWidth = 0.4;
  ctx.beginPath();
  (ctx as unknown as { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(22, 94, 8, 6, 1);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,245,255,0.7)';
  ctx.font = '3.5px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ARC7', 26, 99.5);

  // Nose cone
  const ng2 = ctx.createLinearGradient(14, 0, 38, 0);
  ng2.addColorStop(0, '#062030');
  ng2.addColorStop(0.5, '#0a3a50');
  ng2.addColorStop(1, '#062030');
  ctx.fillStyle = ng2;
  ctx.beginPath();
  ctx.moveTo(26, 4);
  ctx.lineTo(34, 32);
  ctx.lineTo(18, 32);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#00CEC9';
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Nose tip dot
  ctx.strokeStyle = 'rgba(0,245,255,0.8)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(26, 4);
  ctx.lineTo(26, 0);
  ctx.stroke();
  ctx.fillStyle = 'rgba(0,245,255,0.9)';
  ctx.beginPath();
  ctx.arc(26, 0, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function spawnImpact(
  st: AnimState,
  cx: number,
  cy: number,
  cr: number,
) {
  const cols = ['#b09060', '#d0a870', '#806040', '#e0c080', '#604828', '#f0d090', '#fff0a0', '#ffc040'];

  for (let i = 0; i < 280; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 4 + Math.random() * 28;
    st.debris.push({
      x: cx, y: cy,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      r: 1 + Math.random() * 8,
      color: cols[Math.floor(Math.random() * cols.length)],
      life: 1,
      decay: 0.003 + Math.random() * 0.01,
      ang: Math.random() * Math.PI * 2,
      rot: (Math.random() - 0.5) * 0.6,
    });
  }

  for (let i = 0; i < 380; i++) {
    const a = -2.3 + (Math.random() - 0.5) * 1.4;
    const spd = 6 + Math.random() * 42;
    const h = 15 + Math.floor(Math.random() * 50);
    const s = 70 + Math.floor(Math.random() * 30);
    const l = 40 + Math.floor(Math.random() * 45);
    st.ejecta.push({
      x: cx, y: cy,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      r: 0.4 + Math.random() * 4,
      color: `hsl(${h},${s}%,${l}%)`,
      life: 1,
      decay: 0.002 + Math.random() * 0.006,
    });
  }

  st.shocks.push({ x: cx, y: cy, r: 5, spd: 28, color: 'rgba(255,180,60,', a: 1.0 });
  st.shocks.push({ x: cx, y: cy, r: 4, spd: 45, color: 'rgba(255,220,140,', a: 0.95 });
  st.shocks.push({ x: cx, y: cy, r: 3, spd: 65, color: 'rgba(255,255,200,', a: 0.85 });
  st.shocks.push({ x: cx, y: cy, r: 2, spd: 90, color: 'rgba(255,255,255,', a: 1.0 });
  st.shocks.push({ x: cx, y: cy, r: 10, spd: 18, color: 'rgba(255,100,20,', a: 0.9 });
  st.shocks.push({ x: cx, y: cy, r: 8, spd: 55, color: 'rgba(255,77,0,', a: 0.75 });

  // Delayed shockwaves
  setTimeout(() => {
    st.shocks.push({ x: cx, y: cy, r: 5, spd: 30, color: 'rgba(255,200,100,', a: 0.7 });
  }, 200);
  setTimeout(() => {
    st.shocks.push({ x: cx, y: cy, r: 3, spd: 40, color: 'rgba(200,150,80,', a: 0.5 });
  }, 450);

  for (let i = 0; i < 18; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 0.5 + Math.random() * 5;
    st.frags.push({
      x: cx + (Math.random() - 0.5) * cr,
      y: cy + (Math.random() - 0.5) * cr,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      r: cr * (0.08 + Math.random() * 0.32),
      rot: Math.random() * Math.PI * 2,
      rotSpd: (Math.random() - 0.5) * 0.08,
      a: 1,
      decay: 0.002 + Math.random() * 0.004,
    });
  }
}

// ─── Component ───────────────────────────────────────────────────────────────────

export default function LogoutAnimation() {
  const setPage = useAppStore((s) => s.setPage);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);

  // HUD element refs
  const hThrustRef = useRef<HTMLDivElement>(null);
  const hAltRef = useRef<HTMLDivElement>(null);
  const hVelRef = useRef<HTMLDivElement>(null);
  const hTempRef = useRef<HTMLDivElement>(null);
  const hFuelRef = useRef<HTMLDivElement>(null);
  const hCommsRef = useRef<HTMLDivElement>(null);
  const hNavRef = useRef<HTMLDivElement>(null);
  const hStatusRef = useRef<HTMLDivElement>(null);
  const hRangeRef = useRef<HTMLDivElement>(null);
  const hEtaRef = useRef<HTMLDivElement>(null);
  const hPhaseRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const impactWordRef = useRef<HTMLDivElement>(null);

  // Animation state ref
  const stRef = useRef<AnimState>({
    T: 0,
    prevTS: null,
    impacted: false,
    impactTS: 0,
    shakeAmt: 0,
    shakePhase: 0,
    debris: [],
    ejecta: [],
    shocks: [],
    trails: [],
    frags: [],
    stars: [],
    W: 0,
    H: 0,
    fadeAlpha: 0,
    fadeStarted: false,
    navigated: false,
    launchSoundPlayed: false,
    crashSoundPlayed: false,
    fadeSoundPlayed: false,
  });

  // Animation frame ID ref for cleanup
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const st = stRef.current;

    // Initialize stars
    st.stars = Array.from({ length: 380 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() < 0.08 ? 2 : Math.random() < 0.25 ? 1.3 : 0.7,
      a: 0.3 + Math.random() * 0.7,
      spd: 0.5 + Math.random() * 1.8,
      ph: Math.random() * Math.PI * 2,
    }));

    // Resize handler
    function resize() {
      st.W = canvas!.width = window.innerWidth;
      st.H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Frame function
    function frame(ts: number) {
      const soundOn = useAppStore.getState().soundEnabled;

      if (!st.prevTS) st.prevTS = ts;
      const dt = Math.min((ts - st.prevTS) / 1000, 0.05);
      st.prevTS = ts;
      if (!st.impacted) st.T += dt;

      const prog = clamp(st.T / DUR, 0, 1);

      // Launch sound removed — only crash on exit

      st.shakePhase += dt * 80;
      if (st.impacted) {
        const at2 = (ts - st.impactTS) / 1000;
        if (at2 < 0.08) {
          st.shakeAmt = 65;
        } else if (at2 < 0.35) {
          st.shakeAmt = Math.max(st.shakeAmt, 45 * (1 - (at2 - 0.08) / 0.27));
        } else if (at2 < 0.55) {
          st.shakeAmt = Math.max(st.shakeAmt, 22);
        } else {
          st.shakeAmt = Math.max(0, st.shakeAmt - dt * 40);
        }
      } else {
        const approachRumble = clamp((prog - 0.55) / 0.45, 0, 1);
        st.shakeAmt = Math.max(approachRumble * 14, st.shakeAmt - dt * 30);
      }

      const W = st.W;
      const H = st.H;

      // Clear
      ctx!.fillStyle = '#050B18';
      ctx!.fillRect(0, 0, W, H);

      // Red danger vignette — pulses in on final approach
      if (!st.impacted && prog > 0.5) {
        const dangerP = clamp((prog - 0.5) / 0.5, 0, 1);
        const pulse = 0.5 + 0.5 * Math.sin(st.T * (6 + dangerP * 14));
        const vigAlpha = dangerP * dangerP * 0.55 * (0.6 + 0.4 * pulse);
        const vg = ctx!.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
        vg.addColorStop(0, 'rgba(0,0,0,0)');
        vg.addColorStop(0.6, `rgba(80,0,0,${vigAlpha * 0.4})`);
        vg.addColorStop(1, `rgba(200,0,0,${vigAlpha})`);
        ctx!.fillStyle = vg;
        ctx!.fillRect(0, 0, W, H);
      }

      // Nebula background
      const nb = ctx!.createRadialGradient(W * 0.6, H * 0.35, 0, W * 0.6, H * 0.35, W * 0.55);
      nb.addColorStop(0, 'rgba(20,10,3,0.3)');
      nb.addColorStop(1, 'rgba(0,0,0,0)');
      ctx!.fillStyle = nb;
      ctx!.fillRect(0, 0, W, H);

      // Comet position
      const minD = Math.min(W, H);
      const cR = minD * 0.09 + easeIn(prog, 2) * minD * 0.04;
      const cX = W * 0.72 - easeIn(prog, 1.5) * W * 0.06;
      const cY = H * 0.28 + easeIn(prog, 1.5) * H * 0.04;
      const cRot = st.T * 0.018;

      // Stars — streak toward camera on final approach
      for (const s of st.stars) {
        const sa = s.a * (0.5 + 0.5 * Math.sin(st.T * s.spd + s.ph));
        const streakP = !st.impacted ? clamp((prog - 0.6) / 0.4, 0, 1) : 0;
        const streakLen = streakP * streakP * s.spd * 18;
        const sx2 = s.x * W;
        const sy2 = s.y * H;
        if (streakLen > 0.5) {
          const sdx = sx2 - cX;
          const sdy = sy2 - cY;
          const slen = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
          ctx!.save();
          ctx!.globalAlpha = sa * 0.9;
          ctx!.strokeStyle = `rgba(255,255,255,${sa})`;
          ctx!.lineWidth = s.r * 0.8;
          ctx!.beginPath();
          ctx!.moveTo(sx2, sy2);
          ctx!.lineTo(sx2 - (sdx / slen) * streakLen, sy2 - (sdy / slen) * streakLen);
          ctx!.stroke();
          ctx!.restore();
        } else {
          ctx!.fillStyle = `rgba(255,255,255,${sa})`;
          ctx!.beginPath();
          ctx!.arc(sx2, sy2, s.r, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // Rocket position
      const startX = W * 0.08;
      const startY = H * 0.88;
      const endX = cX + Math.cos(Math.PI + 0.4) * cR * 0.6;
      const endY = cY + Math.sin(Math.PI + 0.4) * cR * 0.6;
      const rp = easeIn(prog, 1.8);
      const rX = lerp(startX, endX, rp);
      const rY = lerp(startY, endY, rp);
      const rAngle = Math.atan2(endY - startY, endX - startX);
      const baseS = minD / 700;
      const rScale = (0.22 + easeIn(prog, 2.2) * 1.0) * baseS;

      if (!st.impacted) {
        // Danger glow around comet
        if (prog > 0.4) {
          const glowP = clamp((prog - 0.4) / 0.6, 0, 1);
          const glowPulse = 0.7 + 0.3 * Math.sin(st.T * (8 + glowP * 20));
          const glowR = cR * (2.5 + glowP * 4) * glowPulse;
          const glowA = glowP * glowP * 0.7;
          const cg2 = ctx!.createRadialGradient(cX, cY, cR * 0.5, cX, cY, glowR);
          cg2.addColorStop(0, `rgba(255,160,40,${glowA})`);
          cg2.addColorStop(0.4, `rgba(255,77,0,${glowA * 0.4})`);
          cg2.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.fillStyle = cg2;
          ctx!.beginPath();
          ctx!.arc(cX, cY, glowR, 0, Math.PI * 2);
          ctx!.fill();
        }
        drawComet(ctx!, cX, cY, cR, cRot, 1);
      }

      // Engine trail
      const trailProb = 0.6 + clamp((prog - 0.5) / 0.5, 0, 1) * 0.38;
      const trailSize = 1.5 + clamp((prog - 0.5) / 0.5, 0, 1) * 5;
      if (!st.impacted && Math.random() < trailProb) {
        const ta = rAngle + Math.PI + (Math.random() - 0.5) * 0.2;
        const trailSpread = 1 + clamp((prog - 0.7) / 0.3, 0, 1) * 3;
        st.trails.push({
          x: rX + Math.cos(ta) * 10 * rScale,
          y: rY + Math.sin(ta) * 10 * rScale,
          vx: Math.cos(ta) * 2 + (Math.random() - 0.5) * trailSpread,
          vy: Math.sin(ta) * 2 + (Math.random() - 0.5) * trailSpread,
          life: 1,
          r: rScale * trailSize,
          decay: 0.035 + Math.random() * 0.06,
          hot: prog > 0.75,
        });
      }

      for (let ti = st.trails.length - 1; ti >= 0; ti--) {
        const tr = st.trails[ti];
        tr.x += tr.vx;
        tr.y += tr.vy;
        tr.life -= dt * 38 * tr.decay;
        if (tr.life <= 0) {
          st.trails.splice(ti, 1);
          continue;
        }
        ctx!.save();
        ctx!.globalAlpha = clamp(tr.life, 0, 1) * 0.7;
        const tg = ctx!.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, tr.r * 3.5);
        if (tr.hot) {
          tg.addColorStop(0, 'rgba(255,240,200,1)');
          tg.addColorStop(0.25, 'rgba(255,160,20,0.7)');
          tg.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
          tg.addColorStop(0, 'rgba(255,120,0,0.9)');
          tg.addColorStop(0.4, 'rgba(255,77,0,0.4)');
          tg.addColorStop(1, 'rgba(0,0,0,0)');
        }
        ctx!.fillStyle = tg;
        ctx!.beginPath();
        ctx!.arc(tr.x, tr.y, tr.r * 3.5, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      if (!st.impacted) drawRocket(ctx!, rX, rY, rAngle, rScale, 1, st.T);

      // Impact trigger
      if (!st.impacted && prog >= 1.0) {
        st.impacted = true;
        st.impactTS = ts;
        spawnImpact(st, cX, cY, cR);
        st.shakeAmt = 65;

        // Play crash sounds
        if (!st.crashSoundPlayed) {
          st.crashSoundPlayed = true;
          if (soundOn) {
            soundEngine.crash();
            soundEngine.playRocketCrash();
          }
        }

        // Double-flash effect
        if (flashRef.current) {
          const fl = flashRef.current;
          fl.style.transition = 'none';
          fl.style.opacity = '1';
          setTimeout(() => {
            fl.style.transition = 'opacity 0.12s';
            fl.style.opacity = '0';
            setTimeout(() => {
              fl.style.transition = 'none';
              fl.style.opacity = '0.4';
              setTimeout(() => {
                fl.style.transition = 'opacity 0.5s';
                fl.style.opacity = '0';
              }, 60);
            }, 120);
          }, 50);
        }

        // IMPACT text
        if (impactWordRef.current) {
          const iw = impactWordRef.current;
          iw.style.transition = 'none';
          iw.style.opacity = '1';
          iw.style.transform = 'translate(-50%,-50%) scale(1.1)';
          setTimeout(() => {
            iw.style.transition = 'opacity 1.2s, transform 1.2s';
            iw.style.opacity = '0';
            iw.style.transform = 'translate(-50%,-50%) scale(1.7)';
          }, 400);
        }

        // HUD status changes
        if (hStatusRef.current) {
          hStatusRef.current.textContent = 'IMPACT CONFIRMED';
          hStatusRef.current.className = 'hud-val';
        }
        if (hNavRef.current) {
          hNavRef.current.textContent = 'SIGNAL LOST';
          hNavRef.current.className = 'hud-danger';
        }
        if (hCommsRef.current) {
          hCommsRef.current.textContent = 'SIGNAL LOST';
          hCommsRef.current.className = 'hud-danger';
        }
        if (hPhaseRef.current) {
          hPhaseRef.current.textContent = 'KINETIC IMPACT CONFIRMED';
          hPhaseRef.current.style.color = 'rgba(125,249,192,0.85)';
        }
        setTimeout(() => {
          if (hVelRef.current) hVelRef.current.textContent = '--- m/s';
          if (hAltRef.current) hAltRef.current.textContent = '--- km';
          if (hTempRef.current) hTempRef.current.textContent = '--- K';
          if (hRangeRef.current) hRangeRef.current.textContent = '---';
          if (hEtaRef.current) hEtaRef.current.textContent = '---';
        }, 80);
      }

      // Post-impact glow
      if (st.impacted) {
        const at = (ts - st.impactTS) / 1000;
        const gr = Math.min(at * 500, cR * 4);
        const ga = Math.max(0, 0.9 - at * 0.22);
        if (ga > 0) {
          const gg = ctx!.createRadialGradient(cX, cY, 0, cX, cY, gr);
          gg.addColorStop(0, `rgba(255,240,160,${ga})`);
          gg.addColorStop(0.3, `rgba(255,140,40,${ga * 0.55})`);
          gg.addColorStop(0.7, `rgba(180,70,10,${ga * 0.2})`);
          gg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx!.fillStyle = gg;
          ctx!.beginPath();
          ctx!.arc(cX, cY, gr, 0, Math.PI * 2);
          ctx!.fill();
        }

        // Fragments
        for (const f of st.frags) {
          f.x += f.vx;
          f.y += f.vy;
          f.rot += f.rotSpd;
          f.a = Math.max(0, f.a - f.decay);
          if (f.a < 0.01) continue;
          ctx!.save();
          ctx!.globalAlpha = f.a;
          ctx!.translate(f.x, f.y);
          ctx!.rotate(f.rot);
          const fg2 = ctx!.createRadialGradient(-f.r * 0.2, -f.r * 0.2, 0, 0, 0, f.r);
          fg2.addColorStop(0, '#b09060');
          fg2.addColorStop(0.5, '#705038');
          fg2.addColorStop(1, '#302018');
          ctx!.fillStyle = fg2;
          nucleusPath(ctx!, 0, 0, f.r);
          ctx!.fill();
          ctx!.restore();
        }
      }

      // Shockwaves
      for (const sw of st.shocks) {
        sw.r += sw.spd;
        sw.a = Math.max(0, sw.a - dt * 1.4);
        if (sw.a <= 0) continue;
        ctx!.save();
        ctx!.strokeStyle = sw.color + sw.a + ')';
        ctx!.lineWidth = 3;
        ctx!.beginPath();
        ctx!.ellipse(sw.x, sw.y, sw.r, sw.r * 0.38, 0, 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.lineWidth = 10;
        ctx!.strokeStyle = sw.color + sw.a * 0.1 + ')';
        ctx!.stroke();
        ctx!.restore();
      }

      // Debris
      for (const d of st.debris) {
        d.x += d.vx;
        d.y += d.vy;
        d.vy += 0.12;
        d.vx *= 0.993;
        d.vy *= 0.993;
        d.life -= d.decay;
        d.ang += d.rot;
        if (d.life <= 0) continue;
        ctx!.save();
        ctx!.globalAlpha = clamp(d.life, 0, 1);
        ctx!.translate(d.x, d.y);
        ctx!.rotate(d.ang);
        ctx!.fillStyle = d.color;
        ctx!.fillRect(-d.r * 0.5, -d.r * 0.4, d.r, d.r * 0.8);
        ctx!.restore();
      }

      // Ejecta
      for (const e of st.ejecta) {
        e.x += e.vx;
        e.y += e.vy;
        e.vy += 0.06;
        e.life -= e.decay;
        if (e.life <= 0) continue;
        ctx!.save();
        ctx!.globalAlpha = clamp(e.life * 0.8, 0, 1);
        ctx!.fillStyle = e.color;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // Fade to black after impact
      if (st.impacted) {
        const at = (ts - st.impactTS) / 1000;
        if (at > 3.0) {
          if (!st.fadeStarted) {
            st.fadeStarted = true;
            if (!st.fadeSoundPlayed) {
              st.fadeSoundPlayed = true;
              if (soundOn) soundEngine.playFade();
            }
          }
          st.fadeAlpha = Math.min(1, (at - 3.0) / 1.5);
          ctx!.fillStyle = `rgba(0,0,0,${st.fadeAlpha})`;
          ctx!.fillRect(0, 0, W, H);

          if (st.fadeAlpha >= 1 && !st.navigated) {
            st.navigated = true;
            setPage('login');
          }
        }
      }

      // Live HUD updates
      if (!st.impacted) {
        const pct = prog;
        const flickerHide = pct > 0.75 && Math.random() < clamp((pct - 0.75) / 0.25, 0, 1) * 0.18;
        if (!flickerHide) {
          if (hVelRef.current) hVelRef.current.textContent = Math.round(8400 + pct * 7800).toLocaleString() + ' m/s';
          if (hAltRef.current) hAltRef.current.textContent = Math.round(48200 * (1 - pct)).toLocaleString() + ' km';
          if (hTempRef.current) hTempRef.current.textContent = Math.round(2100 + pct * 1800).toLocaleString() + ' K';
          if (hFuelRef.current) hFuelRef.current.textContent = Math.max(0, Math.round(96 - pct * 92)) + '%';
          if (hRangeRef.current) hRangeRef.current.textContent = Math.round(48200 * (1 - pct)).toLocaleString() + ' km';
          if (hEtaRef.current) hEtaRef.current.textContent = 'T-' + Math.max(0, DUR - st.T).toFixed(1) + 's';
        } else {
          if (hVelRef.current) hVelRef.current.textContent = '\u2588 ' + Math.round(8400 + pct * 7800).toLocaleString() + ' m/s';
        }
        if (pct > 0.6 && hStatusRef.current) {
          hStatusRef.current.textContent = 'TERMINAL APPROACH';
          hStatusRef.current.className = 'hud-danger';
        }
        if (pct > 0.82) {
          if (hStatusRef.current) {
            hStatusRef.current.textContent = 'COLLISION IMMINENT';
          }
          if (hPhaseRef.current) {
            hPhaseRef.current.textContent = '\u26A0 COLLISION IMMINENT \u26A0';
            hPhaseRef.current.style.color = 'rgba(255,77,0,0.95)';
            hPhaseRef.current.style.opacity = Math.floor(st.T * 6) % 2 === 0 ? '1' : '0.2';
          }
        }
        if (pct > 0.9) {
          if (hTempRef.current) hTempRef.current.className = 'hud-danger';
          if (hThrustRef.current) hThrustRef.current.textContent = Math.round(100 - Math.random() * 8) + '%';
        }
      }

      // Screen shake
      if (st.shakeAmt > 0.3) {
        const sx = (Math.sin(st.shakePhase * 1.7) * 0.6 + (Math.random() - 0.5) * 0.4) * st.shakeAmt;
        const sy = (Math.sin(st.shakePhase * 2.3 + 1.2) * 0.6 + (Math.random() - 0.5) * 0.4) * st.shakeAmt;
        const sr = (Math.random() - 0.5) * st.shakeAmt * 0.04;
        if (uiRef.current) uiRef.current.style.transform = `translate(${sx}px,${sy}px) rotate(${sr}deg)`;
        canvas.style.transform = `translate(${sx}px,${sy}px) rotate(${sr}deg)`;
      } else {
        if (uiRef.current) uiRef.current.style.transform = '';
        canvas.style.transform = '';
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [setPage]);

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#050B18' }}>
      {/* Inject keyframe styles */}
      <style>{`
        @keyframes hud-scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .hud-lbl { color: rgba(0,206,201,0.42); font-size: 9px; letter-spacing: 1.5px; }
        .hud-val { color: rgba(125,249,192,0.95); font-weight: bold; text-shadow: 0 0 6px rgba(125,249,192,0.4); }
        .hud-warn { color: rgba(255,200,87,0.9); font-weight: bold; }
        .hud-danger { color: rgba(255,77,0,0.95); font-weight: bold; text-shadow: 0 0 8px rgba(255,59,48,0.6); }
        .hud-ok { color: rgba(125,249,192,0.9); font-weight: bold; }
      `}</style>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* HUD overlay */}
      <div
        ref={uiRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          color: 'rgba(0,206,201,0.85)',
          fontSize: '11px',
          fontFamily: "var(--font-share-tech-mono), monospace",
        }}
      >
        {/* Corner brackets */}
        <div style={{ position: 'absolute', top: 8, left: 8, width: 13, height: 13, borderLeft: '1px solid rgba(0,206,201,0.35)', borderTop: '1px solid rgba(0,206,201,0.35)' }} />
        <div style={{ position: 'absolute', top: 8, right: 8, width: 13, height: 13, borderRight: '1px solid rgba(0,206,201,0.35)', borderTop: '1px solid rgba(0,206,201,0.35)' }} />
        <div style={{ position: 'absolute', bottom: 8, left: 8, width: 13, height: 13, borderLeft: '1px solid rgba(0,206,201,0.35)', borderBottom: '1px solid rgba(0,206,201,0.35)' }} />
        <div style={{ position: 'absolute', bottom: 8, right: 8, width: 13, height: 13, borderRight: '1px solid rgba(0,206,201,0.35)', borderBottom: '1px solid rgba(0,206,201,0.35)' }} />

        {/* Scanline */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(0,206,201,0.2),transparent)',
            animation: 'hud-scan 4s linear infinite',
          }}
        />

        {/* Top-left HUD */}
        <div style={{ position: 'absolute', top: 18, left: 20, lineHeight: 1.9 }}>
          <div className="hud-lbl">VEHICLE ID</div>
          <div className="hud-val">ARC-7 NOVA</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>THRUST</div>
          <div className="hud-val" ref={hThrustRef}>100%</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>STATUS</div>
          <div className="hud-ok" ref={hStatusRef}>ASCENDING</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>FUEL</div>
          <div className="hud-val" ref={hFuelRef}>96%</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>STAGE</div>
          <div className="hud-val">02 / 02</div>
        </div>

        {/* Top-right HUD */}
        <div style={{ position: 'absolute', top: 18, right: 20, lineHeight: 1.9, textAlign: 'right' }}>
          <div className="hud-lbl">ALTITUDE</div>
          <div className="hud-val" ref={hAltRef}>48,200 km</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>VELOCITY</div>
          <div className="hud-val" ref={hVelRef}>8,400 m/s</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>TEMP</div>
          <div className="hud-warn" ref={hTempRef}>2,100 K</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>COMMS</div>
          <div className="hud-val" ref={hCommsRef}>NOMINAL</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>NAV LOCK</div>
          <div className="hud-danger" ref={hNavRef}>ACQUIRED</div>
        </div>

        {/* Bottom-left HUD */}
        <div style={{ position: 'absolute', bottom: 20, left: 20, lineHeight: 1.9 }}>
          <div className="hud-lbl">TARGET</div>
          <div className="hud-val">COMET 67P/C-G</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>MISSION</div>
          <div className="hud-val">DART-9 INTERCEPT</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>GUIDANCE</div>
          <div className="hud-val">AUTONOMOUS</div>
        </div>

        {/* Bottom-right HUD */}
        <div style={{ position: 'absolute', bottom: 20, right: 20, lineHeight: 1.9, textAlign: 'right' }}>
          <div className="hud-lbl">IMPACT ENERGY</div>
          <div className="hud-warn">21.4 GJ</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>RANGE</div>
          <div className="hud-val" ref={hRangeRef}>48,200 km</div>
          <div className="hud-lbl" style={{ marginTop: 5 }}>ETA IMPACT</div>
          <div className="hud-danger" ref={hEtaRef}>T-5.0s</div>
        </div>

        {/* Phase label */}
        <div
          ref={hPhaseRef}
          style={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            letterSpacing: '3px',
            color: 'rgba(125,249,192,0.75)',
            whiteSpace: 'nowrap',
          }}
        >
          &#9632; TERMINAL GUIDANCE ENGAGED
        </div>

        {/* Flash overlay */}
        <div
          ref={flashRef}
          style={{
            position: 'absolute',
            inset: 0,
            background: '#fff',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />

        {/* IMPACT text */}
        <div
          ref={impactWordRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%) scale(1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '90px',
            fontWeight: 900,
            letterSpacing: '10px',
            color: '#fff',
            textShadow: '0 0 60px rgba(255,140,0,1),0 0 120px rgba(255,77,0,0.8)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: 11,
            whiteSpace: 'nowrap',
          }}
        >
          IMPACT
        </div>
      </div>

      {/* Scanline overlay */}
      <div className="scanline-overlay" />
    </div>
  );
}
