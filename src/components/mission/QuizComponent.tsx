'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Star, ChevronRight, Zap, Shield, ShieldAlert } from 'lucide-react';
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

// ─── Corner Brackets (HUD targeting reticle) ─────────────────────────────
function CornerBrackets({ color, size = 16 }: { color: string; size?: number }) {
  const s = size;
  const borderStyle = `1.5px solid ${color}`;
  return (
    <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
      {/* Top-left */}
      <div className="absolute" style={{ top: 0, left: 0, width: s, height: s, borderTop: borderStyle, borderLeft: borderStyle }} />
      {/* Top-right */}
      <div className="absolute" style={{ top: 0, right: 0, width: s, height: s, borderTop: borderStyle, borderRight: borderStyle }} />
      {/* Bottom-left */}
      <div className="absolute" style={{ bottom: 0, left: 0, width: s, height: s, borderBottom: borderStyle, borderLeft: borderStyle }} />
      {/* Bottom-right */}
      <div className="absolute" style={{ bottom: 0, right: 0, width: s, height: s, borderBottom: borderStyle, borderRight: borderStyle }} />
    </div>
  );
}

// ─── Traveling Border Light (single, subtle) ─────────────────────────────
function TravelingLight({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[4] overflow-hidden rounded-lg">
      <motion.div className="absolute top-0 h-px" style={{ width: 100, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 12px ${color}, 0 0 30px ${color}40` }} animate={{ left: ['-100px', 'calc(100% + 100px)'] }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}

// ─── Particle Burst on correct answer ─────────────────────────────────────
function ParticleBurst({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i, angle: (360 / 20) * i + Math.random() * 18, speed: 40 + Math.random() * 80, size: 2 + Math.random() * 4,
  })), []);
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, background: color, left: '50%', top: '50%', boxShadow: `0 0 ${p.size * 2}px ${color}` }}
          initial={{ opacity: 1, x: 0, y: 0 }}
          animate={{ opacity: 0, x: Math.cos((p.angle * Math.PI) / 180) * p.speed, y: Math.sin((p.angle * Math.PI) / 180) * p.speed }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Celebration Particles ────────────────────────────────────────────────
function CelebrationParticles({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 40 }, (_, i) => ({
    id: i, x: Math.random() * 100, delay: Math.random() * 0.6, size: Math.random() * 5 + 2, angle: Math.random() * 360, distance: 60 + Math.random() * 140,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, backgroundColor: color, left: `${p.x}%`, top: '50%', boxShadow: `0 0 ${p.size * 2}px ${color}` }}
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

// ─── Sound Wave Animation (visual indicator when answering) ───────────────
function SoundWave({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-[2px] h-4">
      {[0, 1, 2, 3, 4].map(i => (
        <motion.div key={i} className="w-[2px] rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }}
          animate={{ height: [4, 14, 6, 12, 4] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
        />
      ))}
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
      setTimeout(() => { setShowBurst(false); setFlashColor(null); }, 800);
    } else {
      if (soundEnabled) soundEngine.failure();
      setShakeCard(true);
      setFlashColor('#ef4444');
      setTimeout(() => { setShakeCard(false); setFlashColor(null); }, 600);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setAnswersLocked(false);
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
    setShowResults(false); setShowCelebration(false); setAnswersLocked(false);
  }, [soundEnabled]);

  const handleReturn = useCallback(() => { if (soundEnabled) soundEngine.playClick(); setPage('dashboard'); }, [soundEnabled, setPage]);

  // ═════════════════════════════════════════════════════════════════════════
  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  if (showResults) {
    return (
      <div className="relative w-full max-w-xl mx-auto px-4 py-8">
        <style>{`
          @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
          @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
          @keyframes result-glow { 0%,100%{box-shadow:0 0 30px ${passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}} 50%{box-shadow:0 0 60px ${passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}} }
        `}</style>
        {showCelebration && badge && <CelebrationParticles color={badge.color} />}

        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}>
          <div className="relative overflow-hidden rounded-lg" style={{
            background: 'linear-gradient(160deg, rgba(2,4,12,0.97), rgba(4,8,20,0.95))',
            border: `1.5px solid ${passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            animation: 'result-glow 3s ease-in-out infinite',
          }}>
            <CornerBrackets color={passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'} size={20} />
            <TravelingLight color={passed ? '#22c55e' : '#ef4444'} />

            {/* Top accent line */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${passed ? '#22c55e' : '#ef4444'}40, transparent)` }} />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col items-center gap-5">
              {/* Icon + Letter */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.15 }} className="flex items-center gap-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={passed ? (badge?.color ?? '#22c55e') : '#ef4444'} size="lg" />
                <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{
                  background: passed ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                  border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  {passed ? <Shield className="w-7 h-7 text-green-400" /> : <ShieldAlert className="w-7 h-7 text-red-400" />}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-center">
                <GlitchText color={passed ? '#22c55e' : '#ef4444'} className="text-2xl sm:text-3xl font-black tracking-[0.2em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif' }}>{passed ? 'MISSION COMPLETE' : 'MISSION FAILED'}</GlitchText>
                <p className="mt-1.5 text-[10px] font-mono tracking-[0.35em] uppercase" style={{ color: `${passed ? '#22c55e' : '#ef4444'}40` }}>{passed ? '// CLEARANCE GRANTED' : '// RETRY REQUIRED'}</p>
              </motion.div>

              {/* Score */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="w-full max-w-[260px] rounded-md p-5 text-center" style={{
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${passed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}`,
              }}>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed ? '#22c55e' : '#ef4444', textShadow: `0 0 20px ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}><AnimatedCounter target={score} duration={1200} /></span>
                  <span className="text-lg text-slate-600 font-mono">/</span>
                  <span className="text-lg text-slate-500 font-mono">{totalQuestions}</span>
                </div>
                <div className="mt-1.5 text-2xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed ? '#22c55e' : '#ef4444', textShadow: `0 0 10px ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}><AnimatedCounter target={percentage} duration={1500} />%</div>
              </motion.div>

              {/* Badge + Stars */}
              <AnimatePresence>{passed && badge && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 0.8 }} className="flex flex-col items-center gap-3">
                  <p className="text-[9px] font-mono tracking-[0.35em] uppercase" style={{ color: `${badge.color}50` }}>▸ ACHIEVEMENT UNLOCKED ◂</p>
                  <Badge className="text-base px-4 py-2 gap-2.5 font-bold tracking-wider" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${badge.color}08`, border: `1px solid ${badge.color}35`, color: badge.color, textShadow: `0 0 8px ${badge.color}60` }}>
                    <HologramLetter letter={badge.icon.replace(/[\[\]]/g, '')} color={badge.color} size="sm" />{badge.name}
                  </Badge>
                  <div className="flex gap-1">{[...Array(5)].map((_, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 + i * 0.1, type: 'spring' }}><Star className="w-5 h-5" fill={i < Math.ceil(percentage / 20) ? '#fbbf24' : 'transparent'} stroke="#fbbf24" style={{ filter: i < Math.ceil(percentage / 20) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.5))' : 'none' }} /></motion.div>)}</div>
                </motion.div>
              )}</AnimatePresence>

              {/* Buttons */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: passed ? 1.3 : 0.7 }} className="flex flex-col sm:flex-row gap-2.5 w-full max-w-sm">
                <Button onClick={handleRetry} className="flex-1 gap-2 text-xs h-10" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(148,163,184,0.1)', color: '#64748b', fontWeight: 700, letterSpacing: '0.15em' }}
                  onMouseEnter={e => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor='#22d3ee'; e.currentTarget.style.color='#22d3ee'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(148,163,184,0.1)'; e.currentTarget.style.color='#64748b'; }}>
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
        @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
        @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-4px)} 20%{transform:translateX(3px)} 30%{transform:translateX(-2px)} 40%{transform:translateX(1px)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes flash-in { 0%{opacity:0.3} 100%{opacity:0} }
      `}</style>

      {/* ─── PROGRESS BAR ─── */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: `${missionColor}50`, fontFamily: 'var(--font-orbitron), sans-serif' }}>
            SECTOR {String(currentQuestion + 1).padStart(2, '0')}<span className="text-slate-700">/</span>{String(totalQuestions).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: `${missionColor}40`, fontFamily: 'var(--font-orbitron), sans-serif' }}>
            SCORE {score}<span className="text-slate-700">:</span>{currentQuestion}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${missionColor}08` }}>
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${missionColor}30, ${missionColor})`, boxShadow: `0 0 6px ${missionColor}40` }} initial={{ width: '0%' }} animate={{ width: `${progressValue}%` }} transition={{ duration: 0.4 }} />
        </div>
      </motion.div>

      {/* ─── QUESTION CARD ─── */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
          <div className="relative overflow-hidden rounded-lg" style={{
            background: 'linear-gradient(160deg, rgba(2,4,12,0.97), rgba(4,8,18,0.95))',
            border: `1px solid ${missionColor}12`,
            boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 80px ${missionColor}03`,
            animation: shakeCard ? 'shake 0.4s ease-in-out' : undefined,
          }}>
            <CornerBrackets color={`${missionColor}30`} size={14} />
            <TravelingLight color={missionColor} />

            {/* Full-card flash on answer */}
            {flashColor && (
              <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: flashColor, animation: 'flash-in 0.4s ease-out forwards' }} />
            )}

            {/* Particle burst on correct */}
            {showBurst && <ParticleBurst color={missionColor} />}

            {/* Top accent line */}
            <div className="h-px w-full relative z-[5]" style={{ background: `linear-gradient(90deg, transparent, ${missionColor}40, transparent)` }} />

            <div className="relative z-[5] p-4 sm:p-6">

              {/* ─── TOP LABEL ─── */}
              <div className="flex items-center gap-2 mb-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={missionColor} size="sm" />
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${missionColor}20, transparent)` }} />
                <SoundWave color={`${missionColor}50`} active={answersLocked} />
              </div>

              {/* ─── QUESTION ─── */}
              <div className="mb-5 pb-4" style={{ borderBottom: `1px solid ${missionColor}08` }}>
                <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: '#c8d0de' }}>
                  {typedQ}
                  {!typeDone && <span className="inline-block w-[2px] h-[14px] ml-0.5 align-middle" style={{ background: missionColor, boxShadow: `0 0 4px ${missionColor}`, animation: 'cursor-blink 0.5s steps(2) infinite' }} />}
                </h3>
              </div>

              {/* ─── OPTIONS — Clean Terminal Command Style ─── */}
              <div className="grid gap-2">
                {currentQ.options.map((option, index) => {
                  const isAnswered = selectedAnswer !== null;
                  const isCorrectOpt = index === questions[currentQuestion].correct;
                  const isWrongOpt = index === selectedAnswer && !isCorrect;
                  const isDimmed = isAnswered && !isCorrectOpt && !isWrongOpt;
                  const isSelected = index === selectedAnswer;

                  // Compute colors
                  let borderColor = `${missionColor}10`;
                  let bgColor = 'rgba(255,255,255,0.01)';
                  let textColor = '#8892a4';
                  let indexColor = `${missionColor}50`;
                  let indexBg = `${missionColor}06`;
                  let indexBorder = `${missionColor}12`;
                  let rightIcon = null;
                  let hoverBg = `${missionColor}06`;
                  let hoverBorder = `${missionColor}25`;
                  let hoverText = '#c8d0de';
                  let hoverIndexColor = `${missionColor}80`;

                  if (isAnswered && isCorrectOpt) {
                    borderColor = 'rgba(34,197,94,0.25)';
                    bgColor = 'rgba(34,197,94,0.03)';
                    textColor = '#4ade80';
                    indexColor = '#4ade80';
                    indexBg = 'rgba(34,197,94,0.06)';
                    indexBorder = 'rgba(34,197,94,0.2)';
                    rightIcon = <CheckCircle2 className="w-4 h-4 text-green-400" />;
                  } else if (isWrongOpt) {
                    borderColor = 'rgba(239,68,68,0.25)';
                    bgColor = 'rgba(239,68,68,0.03)';
                    textColor = '#f87171';
                    indexColor = '#f87171';
                    indexBg = 'rgba(239,68,68,0.06)';
                    indexBorder = 'rgba(239,68,68,0.2)';
                    rightIcon = <XCircle className="w-4 h-4 text-red-400" />;
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
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: isDimmed ? 0.25 : 1, x: 0 }}
                      transition={{ delay: 0.15 + index * 0.06, duration: 0.25 }}
                    >
                      <motion.div
                        className="group relative rounded-md overflow-hidden transition-colors duration-150"
                        style={{
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          cursor: isAnswered ? 'default' : 'pointer',
                        }}
                        whileHover={!isAnswered ? { scale: 1.015, backgroundColor: hoverBg, borderColor: hoverBorder } : {}}
                        whileTap={!isAnswered ? { scale: 0.985 } : {}}
                        onMouseEnter={() => { if (!isAnswered && soundEnabled) soundEngine.playHover(); }}
                        onClick={() => handleAnswer(index)}
                        role="button" tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnswer(index); } }}
                        aria-label={`Option ${choiceLabel}: ${option}`}
                      >
                        {/* Hover glow line on left */}
                        {!isAnswered && (
                          <div className="absolute left-0 top-0 bottom-0 w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: missionColor, boxShadow: `0 0 8px ${missionColor}60` }} />
                        )}

                        {/* Correct/wrong glow line on left */}
                        {isAnswered && (isCorrectOpt || isWrongOpt) && (
                          <div className="absolute left-0 top-0 bottom-0 w-[2px]" style={{ background: isCorrectOpt ? '#22c55e' : '#ef4444', boxShadow: `0 0 8px ${isCorrectOpt ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` }} />
                        )}

                        <div className="flex items-center gap-3 px-3.5 py-2.5 sm:py-3">
                          {/* Index badge */}
                          <div className="shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all duration-150" style={{
                            background: indexBg,
                            border: `1px solid ${indexBorder}`,
                            color: indexColor,
                            fontFamily: 'var(--font-orbitron), sans-serif',
                            textShadow: isSelected || isCorrectOpt || isWrongOpt ? `0 0 6px ${indexColor}` : 'none',
                          }}>
                            {choiceLabel}
                          </div>

                          {/* Option text */}
                          <span className="text-sm font-medium leading-relaxed flex-1 transition-colors duration-150 group-hover:text-[#c8d0de]" style={{ color: textColor }}>{option}</span>

                          {/* Right icon or chevron */}
                          {isAnswered && rightIcon ? (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="shrink-0">
                              {rightIcon}
                            </motion.div>
                          ) : !isAnswered ? (
                            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity duration-150" style={{ color: missionColor }} />
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
                  <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 5, height: 0 }} transition={{ duration: 0.2 }} className="mt-4 overflow-hidden">
                    {isCorrect ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 rounded-md" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.12)' }}>
                        <Shield className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#4ade80', textShadow: '0 0 10px rgba(74,222,128,0.4)' }}>SIGNAL VERIFIED</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2.5 rounded-md" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.12)' }}>
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                        <span className="text-xs font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#f87171', textShadow: '0 0 10px rgba(248,113,113,0.4)' }}>SIGNAL CORRUPTED</span>
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
