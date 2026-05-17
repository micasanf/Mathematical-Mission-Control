'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, RotateCcw, Star, Shield, ShieldAlert, Hexagon, ChevronRight } from 'lucide-react';
import { HologramLetter } from '@/components/mission/HologramLetter';

interface QuizProps {
  missionId: string;
  questions: { question: string; options: string[]; correct: number }[];
  missionColor: string;
}

const badgeMap: Record<string, { name: string; icon: string; color: string }> = {
  collatz: { name: 'Sequence Specialist', icon: 'C', color: '#00ffff' },
  fibonacci: { name: 'Recursive Navigator', icon: 'F', color: '#fbbf24' },
  tribonacci: { name: 'Tribonacci Trailblazer', icon: 'T', color: '#a855f7' },
  lucas: { name: 'Lucas Commander', icon: 'L', color: '#34d399' },
  euclidean: { name: 'Euclid Explorer', icon: 'E', color: '#fb7185' },
  division: { name: 'Division Commander', icon: 'D', color: '#38bdf8' },
  palindrome: { name: 'Symmetry Specialist', icon: 'P', color: '#FFD700' },
};

// ─── Typewriter Hook ──────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 18, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed(''); setDone(false);
    let i = 0;
    const iv = setInterval(() => { i++; setDisplayed(text.slice(0, i)); if (i >= text.length) { clearInterval(iv); setDone(true); } }, speed);
    return () => clearInterval(iv);
  }, [text, speed, enabled]);
  return { displayed, done };
}

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => { const p = Math.min((now - startTime) / duration, 1); setCount(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) frameRef.current = requestAnimationFrame(animate); };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return <span>{count}</span>;
}

// ─── Starfield Background ─────────────────────────────────────────────────
function Starfield({ color }: { color: string }) {
  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i, x: Math.random() * 100, y: Math.random() * 100, size: Math.random() * 2 + 0.5, dur: 3 + Math.random() * 4, delay: Math.random() * 3,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {stars.map(s => (
        <motion.div key={s.id} className="absolute rounded-full" style={{ width: s.size, height: s.size, background: color, left: `${s.x}%`, top: `${s.y}%`, boxShadow: `0 0 ${s.size * 3}px ${color}40` }}
          animate={{ opacity: [0.1, 0.6, 0.1], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Hex Grid Background ─────────────────────────────────────────────────
function HexGrid({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden opacity-[0.03]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(color)}' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    }} />
  );
}

// ─── Scan Line (single sweep) ─────────────────────────────────────────────
function ScanLine({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[2] overflow-hidden">
      <motion.div className="absolute left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}50, ${color}, ${color}50, transparent)`, boxShadow: `0 0 12px ${color}60, 0 0 30px ${color}20` }} animate={{ top: ['0%', '100%'] }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}

// ─── Energy Conduits (pulsing side rails) ─────────────────────────────────
function EnergyConduits({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[3]">
      {/* Left conduit */}
      <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${color}15, ${color}25, ${color}15, transparent)` }} />
      <motion.div className="absolute left-0 w-px h-12" style={{ background: `linear-gradient(180deg, transparent, ${color}, transparent)`, boxShadow: `0 0 8px ${color}, 0 0 20px ${color}40` }} animate={{ top: ['-48px', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
      {/* Right conduit */}
      <div className="absolute right-0 top-0 bottom-0 w-px" style={{ background: `linear-gradient(180deg, transparent, ${color}15, ${color}25, ${color}15, transparent)` }} />
      <motion.div className="absolute right-0 w-px h-12" style={{ background: `linear-gradient(180deg, transparent, ${color}, transparent)`, boxShadow: `0 0 8px ${color}, 0 0 20px ${color}40` }} animate={{ bottom: ['-48px', '100%'] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}

// ─── Corner Brackets (animated HUD) ───────────────────────────────────────
function AnimatedCornerBrackets({ color }: { color: string }) {
  const s = 20;
  return (
    <div className="absolute inset-0 pointer-events-none z-[4]" aria-hidden="true">
      <motion.div className="absolute" style={{ top: 0, left: 0, width: s, height: s, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute" style={{ top: 0, right: 0, width: s, height: s, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }} />
      <motion.div className="absolute" style={{ bottom: 0, left: 0, width: s, height: s, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
      <motion.div className="absolute" style={{ bottom: 0, right: 0, width: s, height: s, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }} />
    </div>
  );
}

// ─── Traveling Border Light ───────────────────────────────────────────────
function DualTravelingLight({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden rounded-lg">
      <motion.div className="absolute top-0 h-px" style={{ width: 120, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 15px ${color}, 0 0 40px ${color}30` }} animate={{ left: ['-120px', 'calc(100% + 120px)'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute bottom-0 h-px" style={{ width: 120, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 15px ${color}, 0 0 40px ${color}30` }} animate={{ right: ['-120px', 'calc(100% + 120px)'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: 2 }} />
    </div>
  );
}

// ─── Shockwave Ring (on correct answer) ──────────────────────────────────
function ShockwaveRing({ color, x, y }: { color: string; x: number; y: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      <motion.div className="absolute rounded-full" style={{ left: x, top: y, width: 10, height: 10, border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}` }}
        initial={{ scale: 0, opacity: 1, x: -5, y: -5 }}
        animate={{ scale: 20, opacity: 0, x: -5, y: -5 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      <motion.div className="absolute rounded-full" style={{ left: x, top: y, width: 10, height: 10, border: `1px solid ${color}60` }}
        initial={{ scale: 0, opacity: 0.8, x: -5, y: -5 }}
        animate={{ scale: 30, opacity: 0, x: -5, y: -5 }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
      />
    </div>
  );
}

// ─── Particle Burst ───────────────────────────────────────────────────────
function ParticleBurst({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id: i, angle: (360 / 30) * i + Math.random() * 12, speed: 50 + Math.random() * 120, size: 1 + Math.random() * 4,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, background: color, left: '50%', top: '50%', boxShadow: `0 0 ${p.size * 3}px ${color}` }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, scale: 0, x: Math.cos((p.angle * Math.PI) / 180) * p.speed, y: Math.sin((p.angle * Math.PI) / 180) * p.speed }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Celebration Particles ────────────────────────────────────────────────
function CelebrationParticles({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6, size: Math.random() * 5 + 2, angle: Math.random() * 360, distance: 80 + Math.random() * 160,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, backgroundColor: color, left: `${p.x}%`, top: '50%', boxShadow: `0 0 ${p.size * 3}px ${color}` }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.5, 0], scale: [0, 1.2, 0.8, 0], x: [0, Math.cos((p.angle * Math.PI) / 180) * p.distance], y: [0, Math.sin((p.angle * Math.PI) / 180) * p.distance] }}
          transition={{ duration: 1.2 + Math.random() * 0.5, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Glitch Text ──────────────────────────────────────────────────────────
function GlitchText({ children, color, className = '' }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span style={{ color, position: 'relative' }}>{children}</span>
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(255,0,80,0.4)', clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)', animation: 'qglitch-top 3s infinite linear alternate-reverse' }}>{children}</span>
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(0,200,255,0.4)', clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)', animation: 'qglitch-bottom 2.5s infinite linear alternate-reverse' }}>{children}</span>
    </span>
  );
}

// ─── Sound Wave ───────────────────────────────────────────────────────────
function SoundWave({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-[2px] h-4">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div key={i} className="w-[2px] rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          animate={{ height: [4, 16, 6, 14, 4] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.07, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── Radar Sweep (behind question) ────────────────────────────────────────
function RadarSweep({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center overflow-hidden">
      <motion.div className="absolute rounded-full" style={{ width: 200, height: 200, border: `1px solid ${color}08` }} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }} />
      <motion.div className="absolute rounded-full" style={{ width: 140, height: 140, border: `1px solid ${color}10` }} animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: 1 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ─── MAIN QUIZ COMPONENT ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════
export default function QuizComponent({ missionId, questions, missionColor }: QuizProps) {
  const { updateProgress, setPage, soundEnabled } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answersLocked, setAnswersLocked] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [shakeCard, setShakeCard] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const [shockwave, setShockwave] = useState<{ x: number; y: number } | null>(null);
  const [warpOut, setWarpOut] = useState(false);

  const totalQuestions = questions.length;
  const progressValue = ((currentQuestion) / totalQuestions) * 100;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 70;
  const badge = badgeMap[missionId];

  const currentQ = questions[currentQuestion];
  const { displayed: typedQ, done: typeDone } = useTypewriter(currentQ?.question ?? '', 16, !showResults);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (answersLocked) return;
    setAnswersLocked(true);
    const correct = questions[currentQuestion].correct;
    const correctAnswer = optionIndex === correct;
    setSelectedAnswer(optionIndex);
    setIsCorrect(correctAnswer);

    if (correctAnswer) {
      setScore((prev) => prev + 1);
      if (soundEnabled) soundEngine.success();
      setShowBurst(true);
      setFlashColor('#22c55e');
      setShockwave({ x: 50, y: 50 });
      setTimeout(() => { setShowBurst(false); setFlashColor(null); setShockwave(null); }, 1000);
    } else {
      if (soundEnabled) soundEngine.failure();
      setShakeCard(true);
      setFlashColor('#ef4444');
      setTimeout(() => { setShakeCard(false); setFlashColor(null); }, 600);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < totalQuestions) {
        // Warp transition
        setWarpOut(true);
        setTimeout(() => {
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setAnswersLocked(false);
          setWarpOut(false);
        }, 200);
      } else {
        const finalScore = correctAnswer ? score + 1 : score;
        const finalPct = Math.round((finalScore / totalQuestions) * 100);
        const finalPassed = finalPct >= 70;
        if (finalPassed && soundEnabled) setTimeout(() => soundEngine.achievement(), 300);
        setShowResults(true);
        if (finalPassed) setTimeout(() => setShowCelebration(true), 400);
        updateProgress(missionId, { quizScore: finalPct, quizPassed: finalPassed, ...(finalPassed ? { completed: true } : {}) });
      }
    }, 1600);
  }, [answersLocked, currentQuestion, questions, score, soundEnabled, totalQuestions, updateProgress, missionId]);

  const handleRetry = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setCurrentQuestion(0); setSelectedAnswer(null); setIsCorrect(null); setScore(0);
    setShowResults(false); setShowCelebration(false); setAnswersLocked(false); setWarpOut(false);
  }, [soundEnabled]);

  const handleReturn = useCallback(() => { if (soundEnabled) soundEngine.playClick(); setPage('dashboard'); }, [soundEnabled, setPage]);

  // ═════════════════════════════════════════════════════════════════════════
  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  if (showResults) {
    const resultColor = passed ? '#22c55e' : '#ef4444';
    return (
      <div className="relative w-full max-w-xl mx-auto px-4 py-8">
        <style>{`
          @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-3px,-1px)} 95%{transform:translate(3px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
          @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(2px,1px)} 94%{transform:translate(-3px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        `}</style>
        {showCelebration && badge && <CelebrationParticles color={badge.color} />}

        <motion.div initial={{ opacity: 0, scale: 0.85, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}>
          <div className="relative overflow-hidden rounded-lg" style={{
            background: `linear-gradient(160deg, rgba(2,4,12,0.98), rgba(4,8,20,0.96))`,
            border: `1.5px solid ${resultColor}25`,
            boxShadow: `0 0 40px rgba(0,0,0,0.7), 0 0 80px ${resultColor}08`,
          }}>
            <Starfield color={`${resultColor}40`} />
            <HexGrid color={resultColor} />
            <ScanLine color={resultColor} />
            <EnergyConduits color={resultColor} />
            <AnimatedCornerBrackets color={`${resultColor}50`} />
            <DualTravelingLight color={resultColor} />

            {/* Top accent line */}
            <div className="h-px w-full relative z-10" style={{ background: `linear-gradient(90deg, transparent, ${resultColor}50, transparent)`, boxShadow: `0 0 10px ${resultColor}20` }} />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center gap-5">
              {/* Icon + Letter */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.15 }} className="flex items-center gap-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={passed ? (badge?.color ?? '#22c55e') : '#ef4444'} size="lg" />
                <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{
                  background: `${resultColor}06`,
                  border: `1px solid ${resultColor}20`,
                  boxShadow: `0 0 20px ${resultColor}10`,
                }}>
                  {passed ? <Shield className="w-7 h-7 text-green-400" style={{ filter: 'drop-shadow(0 0 6px rgba(34,197,94,0.5))' }} /> : <ShieldAlert className="w-7 h-7 text-red-400" style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' }} />}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center">
                <GlitchText color={resultColor} className="text-2xl sm:text-3xl font-black tracking-[0.2em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>{passed ? 'MISSION COMPLETE' : 'MISSION FAILED'}</GlitchText>
                <p className="mt-1.5 text-[10px] font-mono tracking-[0.35em] uppercase" style={{ color: `${resultColor}40` }}>{passed ? '// CLEARANCE GRANTED' : '// RETRY REQUIRED'}</p>
              </motion.div>

              {/* Score */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-[260px] rounded-md p-5 text-center" style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${resultColor}10`,
                boxShadow: `inset 0 0 30px rgba(0,0,0,0.3)`,
              }}>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: resultColor, textShadow: `0 0 20px ${resultColor}50, 0 0 40px ${resultColor}25` }}><AnimatedCounter target={score} duration={1200} /></span>
                  <span className="text-lg text-slate-600 font-mono">/</span>
                  <span className="text-lg text-slate-500 font-mono">{totalQuestions}</span>
                </div>
                <div className="mt-1.5 text-2xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: resultColor, textShadow: `0 0 12px ${resultColor}40` }}><AnimatedCounter target={percentage} duration={1500} />%</div>
              </motion.div>

              {/* Badge + Stars */}
              <AnimatePresence>{passed && badge && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.8 }} className="flex flex-col items-center gap-3">
                  <p className="text-[9px] font-mono tracking-[0.35em] uppercase" style={{ color: `${badge.color}50` }}>▸ ACHIEVEMENT UNLOCKED ◂</p>
                  <motion.div animate={{ boxShadow: [`0 0 15px ${badge.color}15`, `0 0 35px ${badge.color}30`, `0 0 15px ${badge.color}15`] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Badge className="text-base px-4 py-2 gap-2.5 font-bold tracking-wider" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${badge.color}08`, border: `1px solid ${badge.color}35`, color: badge.color, textShadow: `0 0 8px ${badge.color}60` }}>
                      <HologramLetter letter={badge.icon.replace(/[\[\]]/g, '')} color={badge.color} size="sm" />{badge.name}
                    </Badge>
                  </motion.div>
                  <div className="flex gap-1">{[...Array(5)].map((_, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 + i * 0.1, type: 'spring' }}><Star className="w-5 h-5" fill={i < Math.ceil(percentage / 20) ? '#fbbf24' : 'transparent'} stroke="#fbbf24" style={{ filter: i < Math.ceil(percentage / 20) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' : 'none' }} /></motion.div>)}</div>
                </motion.div>
              )}</AnimatePresence>

              {/* Buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: passed ? 1.3 : 0.7 }} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-sm">
                <Button onClick={handleRetry} className="flex-1 gap-2 text-xs h-10" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.1)', color: '#64748b', fontWeight: 700, letterSpacing: '0.15em' }}
                  onMouseEnter={e => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor='#22d3ee'; e.currentTarget.style.color='#22d3ee'; e.currentTarget.style.boxShadow='0 0 15px rgba(34,211,238,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(148,163,184,0.1)'; e.currentTarget.style.color='#64748b'; e.currentTarget.style.boxShadow='none'; }}>
                  <RotateCcw className="w-3.5 h-3.5" />RETRY
                </Button>
                <Button onClick={handleReturn} className="flex-1 gap-2 text-xs h-10" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${missionColor}06`, border: `1px solid ${missionColor}20`, color: missionColor, fontWeight: 700, letterSpacing: '0.15em' }}
                  onMouseEnter={e => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor=missionColor; e.currentTarget.style.boxShadow=`0 0 15px ${missionColor}15`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${missionColor}20`; e.currentTarget.style.boxShadow='none'; }}>
                  RETURN TO BRIDGE
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════════════════
  // ─── QUIZ QUESTION SCREEN ───────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative w-full max-w-xl mx-auto px-4 py-6">
      <style>{`
        @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-3px,-1px)} 95%{transform:translate(3px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
        @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(2px,1px)} 94%{transform:translate(-3px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-6px)} 20%{transform:translateX(5px)} 30%{transform:translateX(-3px)} 40%{transform:translateX(2px)} 50%{transform:translateX(-1px)} }
        @keyframes flash-in { 0%{opacity:0.25} 100%{opacity:0} }
        @keyframes holo-shift { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes data-scroll { 0%{transform:translateY(-100%)} 100%{transform:translateY(100%)} }
      `}</style>

      {/* ─── PROGRESS BAR ─── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Hexagon className="w-3 h-3" style={{ color: `${missionColor}50` }} />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: `${missionColor}50`, fontFamily: 'var(--font-orbitron), sans-serif' }}>
              SECTOR {String(currentQuestion + 1).padStart(2, '0')}<span className="text-slate-700">/</span>{String(totalQuestions).padStart(2, '0')}
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: `${missionColor}35`, fontFamily: 'var(--font-orbitron), sans-serif' }}>
            SYNC {score}<span className="text-slate-700">:</span>{currentQuestion}
          </span>
        </div>
        <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${missionColor}08` }}>
          <motion.div className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, ${missionColor}25, ${missionColor})`, boxShadow: `0 0 8px ${missionColor}50` }} initial={{ width: '0%' }} animate={{ width: `${progressValue}%` }} transition={{ duration: 0.5 }}>
            <motion.div className="absolute right-0 top-0 bottom-0 w-1.5 rounded-full" style={{ background: missionColor, boxShadow: `0 0 8px ${missionColor}, 0 0 16px ${missionColor}60` }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── QUESTION CARD ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: warpOut ? 1.1 : 0.95, x: 40, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.05, x: -40, filter: 'blur(4px)' }}
          transition={{ duration: 0.35 }}
        >
          <div className="relative overflow-hidden rounded-lg" style={{
            background: 'linear-gradient(160deg, rgba(2,4,12,0.98), rgba(4,8,18,0.96))',
            border: `1px solid ${missionColor}15`,
            boxShadow: `0 0 50px rgba(0,0,0,0.7), 0 0 100px ${missionColor}05`,
            animation: shakeCard ? 'shake 0.5s ease-in-out' : undefined,
          }}>
            {/* Background layers */}
            <Starfield color={`${missionColor}30`} />
            <HexGrid color={missionColor} />
            <RadarSweep color={missionColor} />
            <ScanLine color={missionColor} />
            <EnergyConduits color={missionColor} />
            <AnimatedCornerBrackets color={`${missionColor}35`} />
            <DualTravelingLight color={missionColor} />

            {/* Full-card flash on answer */}
            {flashColor && (
              <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: flashColor, animation: 'flash-in 0.5s ease-out forwards' }} />
            )}

            {/* Shockwave on correct */}
            {shockwave && <ShockwaveRing color={missionColor} x={shockwave.x} y={shockwave.y} />}

            {/* Particle burst on correct */}
            {showBurst && <ParticleBurst color={missionColor} />}

            {/* Top accent line */}
            <div className="h-px w-full relative z-10" style={{ background: `linear-gradient(90deg, transparent, ${missionColor}50, transparent)`, boxShadow: `0 0 8px ${missionColor}15` }} />

            <div className="relative z-10 p-4 sm:p-6">

              {/* ─── TOP LABEL ─── */}
              <div className="flex items-center gap-2 mb-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={missionColor} size="sm" />
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${missionColor}25, transparent)` }} />
                <SoundWave color={`${missionColor}50`} active={answersLocked} />
              </div>

              {/* ─── QUESTION ─── */}
              <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${missionColor}08` }}>
                <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: '#d0d8e8', textShadow: `0 0 20px ${missionColor}10` }}>
                  {typedQ}
                  {!typeDone && <span className="inline-block w-[2px] h-[16px] ml-0.5 align-middle" style={{ background: missionColor, boxShadow: `0 0 6px ${missionColor}, 0 0 12px ${missionColor}50`, animation: 'cursor-blink 0.5s steps(2) infinite' }} />}
                </h3>
              </div>

              {/* ─── OPTIONS ─── */}
              <div className="grid gap-2.5">
                {currentQ.options.map((option, index) => {
                  const isAnswered = selectedAnswer !== null;
                  const isCorrectOpt = index === questions[currentQuestion].correct;
                  const isWrongOpt = index === selectedAnswer && !isCorrect;
                  const isDimmed = isAnswered && !isCorrectOpt && !isWrongOpt;
                  const isSelected = index === selectedAnswer;

                  // Compute colors
                  let borderColor = `${missionColor}12`;
                  let bgColor = 'rgba(255,255,255,0.01)';
                  let textColor = '#8892a4';
                  let indexColor = `${missionColor}60`;
                  let indexBg = `${missionColor}06`;
                  let indexBorder = `${missionColor}15`;
                  let rightIcon = null;

                  if (isAnswered && isCorrectOpt) {
                    borderColor = 'rgba(34,197,94,0.3)';
                    bgColor = 'rgba(34,197,94,0.04)';
                    textColor = '#4ade80';
                    indexColor = '#4ade80';
                    indexBg = 'rgba(34,197,94,0.08)';
                    indexBorder = 'rgba(34,197,94,0.25)';
                    rightIcon = <CheckCircle2 className="w-4 h-4 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.6))' }} />;
                  } else if (isWrongOpt) {
                    borderColor = 'rgba(239,68,68,0.3)';
                    bgColor = 'rgba(239,68,68,0.04)';
                    textColor = '#f87171';
                    indexColor = '#f87171';
                    indexBg = 'rgba(239,68,68,0.08)';
                    indexBorder = 'rgba(239,68,68,0.25)';
                    rightIcon = <XCircle className="w-4 h-4 text-red-400" style={{ filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.6))' }} />;
                  } else if (isDimmed) {
                    borderColor = 'rgba(255,255,255,0.02)';
                    bgColor = 'transparent';
                    textColor = '#1e293b';
                    indexColor = '#1e293b';
                    indexBg = 'transparent';
                    indexBorder = 'transparent';
                  }

                  const alphaLabels = ['A', 'B', 'C', 'D'];
                  const choiceLabel = alphaLabels[index];

                  return (
                    <motion.div
                      key={`${currentQuestion}-${index}`}
                      initial={{ opacity: 0, x: 40, filter: 'blur(2px)' }}
                      animate={{ opacity: isDimmed ? 0.2 : 1, x: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 0.2 + index * 0.08, duration: 0.3 }}
                    >
                      <motion.div
                        className="group relative rounded-md overflow-hidden"
                        style={{
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          cursor: isAnswered ? 'default' : 'pointer',
                          transition: 'border-color 0.2s, background 0.2s',
                        }}
                        whileHover={!isAnswered ? { scale: 1.02 } : {}}
                        whileTap={!isAnswered ? { scale: 0.98 } : {}}
                        onMouseEnter={() => { if (!isAnswered && soundEnabled) soundEngine.playHover(); }}
                        onClick={() => handleAnswer(index)}
                        role="button" tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnswer(index); } }}
                        aria-label={`Option ${choiceLabel}: ${option}`}
                      >
                        {/* Holographic sweep on hover */}
                        {!isAnswered && (
                          <div className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                            background: `linear-gradient(105deg, transparent 25%, ${missionColor}06 40%, ${missionColor}10 50%, ${missionColor}06 60%, transparent 75%)`,
                            backgroundSize: '250% 100%',
                            animation: 'holo-shift 2.5s linear infinite',
                          }} />
                        )}

                        {/* Left glow rail */}
                        {!isAnswered && (
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: `linear-gradient(180deg, transparent, ${missionColor}, transparent)`, boxShadow: `0 0 10px ${missionColor}60, 0 0 20px ${missionColor}25` }} />
                        )}

                        {/* Correct/wrong glow rail */}
                        {isAnswered && (isCorrectOpt || isWrongOpt) && (
                          <motion.div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: isCorrectOpt ? '#22c55e' : '#ef4444', boxShadow: `0 0 10px ${isCorrectOpt ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)'}, 0 0 20px ${isCorrectOpt ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}
                            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ duration: 0.3 }}
                          />
                        )}

                        <div className="flex items-center gap-3 px-3.5 py-3 sm:py-3.5">
                          {/* Letter badge */}
                          <motion.div className="shrink-0 w-9 h-9 rounded flex items-center justify-center text-xs font-black" style={{
                            background: indexBg,
                            border: `1px solid ${indexBorder}`,
                            color: indexColor,
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            textShadow: isSelected || isCorrectOpt || isWrongOpt ? `0 0 8px ${indexColor}` : 'none',
                            boxShadow: isCorrectOpt ? '0 0 12px rgba(34,197,94,0.2)' : isWrongOpt ? '0 0 12px rgba(239,68,68,0.2)' : 'none',
                            transition: 'all 0.2s',
                          }}
                            whileHover={!isAnswered ? { boxShadow: `0 0 15px ${missionColor}30` } : {}}
                          >
                            {choiceLabel}
                          </motion.div>

                          {/* Option text */}
                          <span className="text-sm font-medium leading-relaxed flex-1 transition-colors duration-200 group-hover:text-[#d0d8e8]" style={{ color: textColor }}>{option}</span>

                          {/* Right icon */}
                          {isAnswered && rightIcon ? (
                            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="shrink-0">
                              {rightIcon}
                            </motion.div>
                          ) : !isAnswered ? (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity duration-200" style={{ color: missionColor }} />
                          ) : null}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ─── FEEDBACK BAR ─── */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 5, height: 0 }} transition={{ duration: 0.25 }} className="mt-4 overflow-hidden">
                    {isCorrect ? (
                      <div className="flex items-center justify-center gap-2.5 py-3 rounded-md" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', boxShadow: '0 0 20px rgba(34,197,94,0.08)' }}>
                        <Shield className="w-4 h-4 text-green-400" style={{ filter: 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' }} />
                        <span className="text-xs font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#4ade80', textShadow: '0 0 12px rgba(74,222,128,0.5), 0 0 25px rgba(74,222,128,0.2)' }}>ACCESS GRANTED</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2.5 py-3 rounded-md" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 0 20px rgba(239,68,68,0.08)' }}>
                        <ShieldAlert className="w-4 h-4 text-red-400" style={{ filter: 'drop-shadow(0 0 4px rgba(248,113,113,0.5))' }} />
                        <span className="text-xs font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.5), 0 0 25px rgba(248,113,113,0.2)' }}>ACCESS DENIED</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
