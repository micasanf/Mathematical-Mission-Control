'use client';

import { useEffect, useRef } from 'react';

const TEXT = 'MISSION CONTROL';
const FONT = 'bold 28px Orbitron, monospace';
const PRIMARY = '#FF4D00';
const CW = 340;
const CH = 44;
const BY = 32;
const CYCLE = 260;

export default function MissionControlCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CW * dpr;
    canvas.height = CH * dpr;
    canvas.style.width = `${CW}px`;
    canvas.style.height = `${CH}px`;
    ctx.scale(dpr, dpr);

    ctx.font = FONT;
    const tw = ctx.measureText(TEXT).width;
    const sx = (CW - tw) / 2;

    interface LetterInfo { ch: string; x: number; w: number; cx: number; }
    const letters: LetterInfo[] = [];
    let lx = sx;
    for (let i = 0; i < TEXT.length; i++) {
      const ch = TEXT[i];
      const w = ctx.measureText(ch).width;
      letters.push({ ch, x: lx, w, cx: lx + w / 2 });
      lx += w;
    }

    let frame = 0;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, CW, CH);
      frame++;
      const sweep = (frame % CYCLE) / CYCLE;
      const sweepX = sweep * CW;

      // Horizontal grid lines
      for (let y = 8; y < CH; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CW, y);
        ctx.strokeStyle = 'rgba(255,77,0,0.04)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 0; x < CW; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CH);
        ctx.strokeStyle = 'rgba(255,77,0,0.025)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Sweep trail
      const trailW = 100;
      const grad = ctx.createLinearGradient(sweepX - trailW, 0, sweepX, 0);
      grad.addColorStop(0, 'rgba(255,77,0,0)');
      grad.addColorStop(1, 'rgba(255,77,0,0.07)');
      ctx.fillStyle = grad;
      ctx.fillRect(sweepX - trailW, 0, trailW, CH);

      // Sweep line
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, CH);
      ctx.strokeStyle = 'rgba(255,77,0,0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Letters
      ctx.font = FONT;
      ctx.textBaseline = 'alphabetic';
      for (const l of letters) {
        const dist = sweepX - l.cx;
        const revealProgress = Math.min(1, Math.max(0, dist / 50));
        const alpha = easeOut(revealProgress);
        if (alpha <= 0) continue;

        ctx.save();

        // Ping flash at reveal moment
        const pingT = Math.max(0, 1 - dist / 70);
        if (pingT > 0) {
          ctx.fillStyle = `rgba(180,240,255,${pingT * alpha})`;
          ctx.fillText(l.ch, l.x + 1, BY + 1);
        }

        ctx.fillStyle = `rgba(255,77,0,${alpha})`;
        ctx.shadowColor = PRIMARY;
        ctx.shadowBlur = alpha * 16;
        ctx.fillText(l.ch, l.x, BY);

        ctx.restore();
      }

      // Scanline pass over text area
      ctx.fillStyle = 'rgba(255,77,0,0.02)';
      for (let y = BY - 36; y < BY + 8; y += 4) {
        ctx.fillRect(0, y, CW, 2);
      }

      animRef.current = requestAnimationFrame(draw);
    }

    document.fonts.ready.then(() => {
      ctx.font = FONT;
      const totalW = ctx.measureText(TEXT).width;
      const startX = (CW - totalW) / 2;
      let rx = startX;
      for (let i = 0; i < TEXT.length; i++) {
        const ch = TEXT[i];
        const w = ctx.measureText(ch).width;
        letters[i] = { ch, x: rx, w, cx: rx + w / 2 };
        rx += w;
      }
      draw();
    });

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="relative" />
  );
}
