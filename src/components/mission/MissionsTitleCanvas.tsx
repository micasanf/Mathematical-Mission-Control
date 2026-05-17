'use client';

import { useEffect, useRef } from 'react';

const TEXT = 'AVAILABLE MISSIONS';
const FONT_SIZE = 42;
const GREEN = '#00CEC9';
const GLITCH_CHARS = '01#@%$&アイウ▲◆⊕';

interface LetterDef {
  ch: string;
  x: number;
  w: number;
}

interface Letter extends LetterDef {
  phase: 'idle' | 'dripping' | 'gone' | 'forming';
  opacity: number;
  dropY: number;
  tailSegs: { y: number; alpha: number }[];
  speed: number;
  glitch: number;
  glitchChar: string;
  formY: number;
  formOpacity: number;
  formDelay: number;
}

function randGlitch() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export default function MissionsTitleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive sizing
    const dpr = window.devicePixelRatio || 1;
    const logicalW = 580;
    const logicalH = 140;
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = `${logicalW}px`;
    canvas.style.height = `${logicalH}px`;
    ctx.scale(dpr, dpr);

    const CW = logicalW;
    const CH = logicalH;

    const FONT = `bold ${FONT_SIZE}px "Share Tech Mono", monospace`;

    // Measure letter positions
    ctx.font = FONT;
    const totalWidth = ctx.measureText(TEXT).width;
    const startX = (CW - totalWidth) / 2;
    const BASE_Y = 70;

    const letterDefs: LetterDef[] = [];
    let cx = startX;
    for (let i = 0; i < TEXT.length; i++) {
      const ch = TEXT[i];
      const w = ctx.measureText(ch).width;
      letterDefs.push({ ch, x: cx, w });
      cx += w;
    }

    const DRIP_STAGGER = 16;
    const HOLD_FRAMES = 120;
    const FORM_STAGGER = 14;

    function makeLetter(def: LetterDef, _i: number): Letter {
      return {
        ...def,
        phase: 'idle',
        opacity: 1,
        dropY: BASE_Y,
        tailSegs: [],
        speed: 1.2 + Math.random() * 1.0,
        glitch: 0,
        glitchChar: def.ch,
        formY: BASE_Y - 100,
        formOpacity: 0,
        formDelay: 0,
      };
    }

    let letters: Letter[] = letterDefs.map((def, i) => makeLetter(def, i));
    let frame = 0;
    let cycleFrame = 0;
    let cyclePhase: 'hold' | 'dripping' | 'gap' | 'forming' = 'hold';

    function resetLetters() {
      letters = letterDefs.map((def, i) => makeLetter(def, i));
      cycleFrame = 0;
      cyclePhase = 'hold';
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, CW, CH);
      frame++;
      cycleFrame++;

      // Cycle state machine
      if (cyclePhase === 'hold') {
        if (cycleFrame > HOLD_FRAMES) {
          cyclePhase = 'dripping';
          cycleFrame = 0;
        }
      }

      if (cyclePhase === 'dripping') {
        for (let i = 0; i < letters.length; i++) {
          if (cycleFrame >= i * DRIP_STAGGER && letters[i].phase === 'idle') {
            letters[i].phase = 'dripping';
            letters[i].dropY = BASE_Y + 4;
          }
        }
        if (letters.every((l) => l.phase === 'gone' || l.ch === ' ')) {
          cyclePhase = 'gap';
          cycleFrame = 0;
        }
      }

      if (cyclePhase === 'gap') {
        if (cycleFrame > 30) {
          cyclePhase = 'forming';
          cycleFrame = 0;
          letters.forEach((l, i) => {
            l.phase = 'forming';
            l.formY = BASE_Y - 80;
            l.formOpacity = 0;
            l.formDelay = i * FORM_STAGGER;
          });
        }
      }

      if (cyclePhase === 'forming') {
        let allDone = true;
        for (const l of letters) {
          if (l.phase === 'forming' && cycleFrame >= l.formDelay) {
            l.formOpacity = Math.min(1, l.formOpacity + 0.06);
            l.formY += (BASE_Y - l.formY) * 0.1;
            if (l.formOpacity >= 1 && Math.abs(l.formY - BASE_Y) < 1) {
              l.formY = BASE_Y;
              l.formOpacity = 1;
              l.phase = 'idle';
              l.opacity = 1;
              l.tailSegs = [];
              l.dropY = BASE_Y;
            }
          }
          if (l.phase === 'forming') allDone = false;
        }
        if (allDone) resetLetters();
      }

      // Draw letters
      for (const l of letters) {
        ctx.save();
        ctx.font = FONT;
        ctx.textBaseline = 'alphabetic';

        if (l.phase === 'idle') {
          if (frame % 120 === 0 && Math.random() > 0.7) {
            l.glitch = 4;
            l.glitchChar = randGlitch();
          }
          if (l.glitch > 0) l.glitch--;
          if (l.glitch > 0) {
            ctx.fillStyle = 'rgba(255,77,0,0.6)';
            ctx.fillText(l.glitchChar, l.x + 2, BASE_Y);
            ctx.fillStyle = 'rgba(0,210,255,0.6)';
            ctx.fillText(l.glitchChar, l.x - 2, BASE_Y);
          }
          ctx.shadowColor = GREEN;
          ctx.shadowBlur = 14;
          ctx.fillStyle = GREEN;
          ctx.fillText(l.ch, l.x, BASE_Y);
        } else if (l.phase === 'dripping') {
          l.dropY += l.speed;
          l.tailSegs.unshift({ y: l.dropY, alpha: 1 });
          for (const s of l.tailSegs) s.alpha -= 0.025;
          l.tailSegs = l.tailSegs.filter((s) => s.alpha > 0);

          const progress = (l.dropY - BASE_Y) / (CH - BASE_Y);
          l.opacity = Math.max(0, 1 - progress * 1.2);

          if (frame % 7 === 0 && Math.random() > 0.55) {
            l.glitch = 2;
            l.glitchChar = randGlitch();
          }
          if (l.glitch > 0) l.glitch--;

          if (l.opacity > 0.01) {
            if (l.glitch > 0) {
              ctx.fillStyle = `rgba(255,77,0,${l.opacity * 0.7})`;
              ctx.fillText(l.glitchChar, l.x + 2, BASE_Y);
              ctx.fillStyle = `rgba(0,210,255,${l.opacity * 0.7})`;
              ctx.fillText(l.glitchChar, l.x - 2, BASE_Y);
            }
            ctx.shadowColor = GREEN;
            ctx.shadowBlur = 14;
            ctx.fillStyle = `rgba(0,206,201,${l.opacity})`;
            ctx.fillText(l.ch, l.x, BASE_Y);
          }

          for (let si = 0; si < l.tailSegs.length; si++) {
            const seg = l.tailSegs[si];
            if (seg.alpha <= 0) continue;
            ctx.save();
            const stretchY = 1 + si * 0.09;
            const scaleX = Math.max(0.15, 1 - si * 0.045);
            ctx.translate(l.x + l.w / 2, seg.y);
            ctx.scale(scaleX, stretchY);
            ctx.translate(-(l.x + l.w / 2), -seg.y);
            const bright = Math.floor(60 + seg.alpha * 190);
            ctx.fillStyle = `rgba(0,${bright},${Math.floor(bright * 0.6)},${seg.alpha * 0.85})`;
            ctx.shadowColor = GREEN;
            ctx.shadowBlur = seg.alpha * 10;
            ctx.font = FONT;
            if (si < 3) {
              ctx.fillText(l.ch, l.x, seg.y);
            } else {
              ctx.beginPath();
              ctx.ellipse(
                l.x + l.w / 2,
                seg.y - (FONT_SIZE * stretchY) / 2,
                l.w * scaleX * 0.3,
                7 + (1 - seg.alpha) * 8,
                0,
                0,
                Math.PI * 2
              );
              ctx.fill();
            }
            ctx.restore();
          }

          if (l.dropY > CH + 30) {
            l.phase = 'gone';
            l.opacity = 0;
            l.tailSegs = [];
          }
        } else if (l.phase === 'forming') {
          if (cycleFrame >= l.formDelay) {
            if (l.formOpacity < 0.5 && frame % 4 === 0) {
              ctx.fillStyle = `rgba(255,77,0,${l.formOpacity * 0.5})`;
              ctx.fillText(randGlitch(), l.x + 2, l.formY);
              ctx.fillStyle = `rgba(0,210,255,${l.formOpacity * 0.5})`;
              ctx.fillText(randGlitch(), l.x - 2, l.formY);
            }
            ctx.shadowColor = GREEN;
            ctx.shadowBlur = 18;
            ctx.fillStyle = `rgba(0,206,201,${l.formOpacity})`;
            ctx.fillText(l.ch, l.x, l.formY);
          }
        }

        ctx.restore();
      }

      // Subtitle
      ctx.save();
      ctx.font = '11px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(0,206,201,${0.35 + Math.sin(frame * 0.04) * 0.2})`;
      ctx.fillText('▶ SELECT TARGET ◀', CW / 2, CH - 16);
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    }

    // Wait for font to load then start
    document.fonts.ready.then(() => {
      // Re-measure with loaded font
      ctx.font = FONT;
      const totalW = ctx.measureText(TEXT).width;
      const sx = (CW - totalW) / 2;
      let lx = sx;
      for (let i = 0; i < TEXT.length; i++) {
        const ch = TEXT[i];
        const w = ctx.measureText(ch).width;
        letterDefs[i] = { ch, x: lx, w };
        lx += w;
      }
      letters = letterDefs.map((def, i) => makeLetter(def, i));
      draw();
    });

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <div className="relative overflow-hidden" style={{ width: 580, height: 140 }}>
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,206,201,0.015) 3px, rgba(0,206,201,0.015) 4px)',
        }}
      />
      <canvas ref={canvasRef} className="relative z-0" />
    </div>
  );
}
