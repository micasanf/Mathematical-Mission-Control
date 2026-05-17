'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Star, Zap, Shield, Crosshair, Radio, Activity } from 'lucide-react';
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
function useTypewriter(text: string, speed = 25, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// ─── CRT Monitor Overlay ──────────────────────────────────────────────────
function CRTOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            rgba(0,0,0,0.06) 1px,
            rgba(0,0,0,0.06) 2px
          )`,
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
        }}
      />
      {/* Chromatic aberration flicker */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'linear-gradient(90deg, rgba(255,0,0,0.01) 0%, transparent 10%, transparent 90%, rgba(0,0,255,0.01) 100%)',
        }}
      />
    </>
  );
}

// ─── HUD Corner Brackets ──────────────────────────────────────────────────
function HUDCorners({ color }: { color: string }) {
  const s = 16;
  const bw = 2;
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top-left */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: s, height: s, borderTop: `${bw}px solid ${color}`, borderLeft: `${bw}px solid ${color}`, boxShadow: `-2px -2px 6px ${color}40` }} />
      {/* Top-right */}
      <div style={{ position: 'absolute', top: -1, right: -1, width: s, height: s, borderTop: `${bw}px solid ${color}`, borderRight: `${bw}px solid ${color}`, boxShadow: `2px -2px 6px ${color}40` }} />
      {/* Bottom-left */}
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: s, height: s, borderBottom: `${bw}px solid ${color}`, borderLeft: `${bw}px solid ${color}`, boxShadow: `-2px 2px 6px ${color}40` }} />
      {/* Bottom-right */}
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: s, height: s, borderBottom: `${bw}px solid ${color}`, borderRight: `${bw}px solid ${color}`, boxShadow: `2px 2px 6px ${color}40` }} />
    </div>
  );
}

// ─── Traveling Border Light ───────────────────────────────────────────────
function TravelingBorder({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[6] overflow-hidden rounded-xl">
      {/* Top edge */}
      <motion.div
        className="absolute top-0 h-[2px]"
        style={{
          width: size,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 8px ${color}, 0 0 20px ${color}60`,
        }}
        animate={{ left: [`-${size}px`, '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      {/* Bottom edge */}
      <motion.div
        className="absolute bottom-0 h-[2px]"
        style={{
          width: size,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 8px ${color}, 0 0 20px ${color}60`,
        }}
        animate={{ right: [`-${size}px`, '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 1.5 }}
      />
    </div>
  );
}

// ─── Scanning Beam ────────────────────────────────────────────────────────
function ScanningBeam({ color }: { color: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-[1]">
      <motion.div
        className="absolute left-0 right-0 h-[1px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}50, ${color}90, ${color}50, transparent)`,
          boxShadow: `0 0 10px ${color}60, 0 0 25px ${color}30`,
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-0 right-0"
        style={{ height: '30px', background: `linear-gradient(180deg, transparent, ${color}04, transparent)` }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ─── Particle Burst (on correct answer) ───────────────────────────────────
function ParticleBurst({ color, x, y }: { color: string; x: number; y: number }) {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      angle: (360 / 20) * i + Math.random() * 18,
      speed: 40 + Math.random() * 80,
      size: 2 + Math.random() * 4,
    })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: color,
            left: x,
            top: y,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
          }}
          initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          animate={{
            opacity: 0,
            scale: 0,
            x: Math.cos((p.angle * Math.PI) / 180) * p.speed,
            y: Math.sin((p.angle * Math.PI) / 180) * p.speed,
          }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Celebration Particles ────────────────────────────────────────────────
function CelebrationParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: Math.random() * 6 + 2,
    angle: Math.random() * 360,
    distance: 80 + Math.random() * 180,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            backgroundColor: color,
            left: `${p.x}%`,
            top: '50%',
            boxShadow: `0 0 ${p.size * 2}px ${color}, 0 0 ${p.size * 3}px ${color}50`,
          }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1.2, 0.8, 0],
            x: [0, Math.cos((p.angle * Math.PI) / 180) * p.distance],
            y: [0, Math.sin((p.angle * Math.PI) / 180) * p.distance],
          }}
          transition={{ duration: 1.5 + Math.random() * 0.5, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return <span>{count}</span>;
}

// ─── Glitch Text ──────────────────────────────────────────────────────────
function GlitchText({ children, color, className = '' }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span style={{ color, position: 'relative' }}>{children}</span>
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(255,0,80,0.5)', clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)', animation: 'quiz-glitch-top 3s infinite linear alternate-reverse' }}>{children}</span>
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(0,200,255,0.5)', clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)', animation: 'quiz-glitch-bottom 2.5s infinite linear alternate-reverse' }}>{children}</span>
    </span>
  );
}

// ─── HUD Data Readout ─────────────────────────────────────────────────────
function HUDReadout({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Activity className="w-2.5 h-2.5" style={{ color: `${color}60` }} />
      <span className="text-[9px] font-mono tracking-wider uppercase" style={{ color: `${color}50` }}>{label}</span>
      <span className="text-[9px] font-mono tracking-wider font-bold" style={{ color: `${color}80`, textShadow: `0 0 4px ${color}40` }}>{value}</span>
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
  const [burstPos, setBurstPos] = useState<{x: string; y: string} | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [glitchFlash, setGlitchFlash] = useState(false);

  const totalQuestions = questions.length;
  const progressValue = ((currentQuestion) / totalQuestions) * 100;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 70;
  const badge = badgeMap[missionId];

  const currentQ = questions[currentQuestion];
  const { displayed: typedQuestion, done: typeDone } = useTypewriter(currentQ?.question ?? '', 18, !showResults);

  // Fake HUD telemetry values
  const telemetry = useMemo(() => ({
    freq: (Math.random() * 400 + 200).toFixed(1),
    lat: (Math.random() * 180 - 90).toFixed(3),
    signal: (85 + Math.random() * 15).toFixed(1),
  }), [currentQuestion]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (answersLocked) return;
      setAnswersLocked(true);

      const correct = questions[currentQuestion].correct;
      const correctAnswer = optionIndex === correct;

      setSelectedAnswer(optionIndex);
      setIsCorrect(correctAnswer);

      if (correctAnswer) {
        setScore((prev) => prev + 1);
        if (soundEnabled) soundEngine.success();
        setBurstPos({ x: '50%', y: '50%' });
        setTimeout(() => setBurstPos(null), 900);
      } else {
        if (soundEnabled) soundEngine.failure();
        setShakeCard(true);
        setGlitchFlash(true);
        setTimeout(() => { setShakeCard(false); setGlitchFlash(false); }, 500);
      }

      setTimeout(() => {
        if (currentQuestion + 1 < totalQuestions) {
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setAnswersLocked(false);
        } else {
          const finalScore = correctAnswer ? score + 1 : score;
          const finalPercentage = Math.round((finalScore / totalQuestions) * 100);
          const finalPassed = finalPercentage >= 70;
          if (finalPassed && soundEnabled) setTimeout(() => soundEngine.achievement(), 300);
          setShowResults(true);
          if (finalPassed) setTimeout(() => setShowCelebration(true), 400);
          updateProgress(missionId, {
            quizScore: finalPercentage,
            quizPassed: finalPassed,
            ...(finalPassed ? { completed: true } : {}),
          });
        }
      }, 1800);
    },
    [answersLocked, currentQuestion, questions, score, soundEnabled, totalQuestions, updateProgress, missionId]
  );

  const handleRetry = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setShowResults(false);
    setShowCelebration(false);
    setAnswersLocked(false);
  }, [soundEnabled]);

  const handleReturnToDashboard = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setPage('dashboard');
  }, [soundEnabled, setPage]);

  const alphaLabels = ['A', 'B', 'C', 'D'];

  // ═════════════════════════════════════════════════════════════════════════
  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  if (showResults) {
    return (
      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        <style>{`
          @keyframes quiz-glitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
          @keyframes quiz-glitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
          @keyframes result-pulse { 0%,100%{box-shadow:0 0 20px ${passed?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'},0 0 60px ${passed?'rgba(34,197,94,0.08)':'rgba(239,68,68,0.08)'} 50%{box-shadow:0 0 30px ${passed?'rgba(34,197,94,0.25)':'rgba(239,68,68,0.25)'},0 0 80px ${passed?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'} }
        `}</style>

        {showCelebration && badge && <CelebrationParticles color={badge.color} />}

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <div className="relative overflow-hidden rounded-xl" style={{
            background: 'linear-gradient(135deg, rgba(3,8,20,0.97), rgba(8,14,28,0.93))',
            border: `1px solid ${passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
            animation: 'result-pulse 3s ease-in-out infinite',
            backdropFilter: 'blur(20px)',
          }}>
            <CRTOverlay />
            <HUDCorners color={passed ? '#22c55e' : '#ef4444'} />
            <TravelingBorder color={passed ? '#22c55e' : '#ef4444'} size={80} />

            {/* Top accent line */}
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${passed?'#22c55e':'#ef4444'}, transparent)`, boxShadow: `0 0 10px ${passed?'rgba(34,197,94,0.5)':'rgba(239,68,68,0.5)'}` }} />

            <div className="relative z-10 p-8 flex flex-col items-center gap-6">
              {/* Result icon */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }} className="flex items-center gap-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={passed ? (badge?.color ?? '#22c55e') : '#ef4444'} size="lg" />
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                  background: passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `2px solid ${passed ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}`,
                  boxShadow: `0 0 30px ${passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}, 0 0 60px ${passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}`,
                }}>
                  {passed ? <Trophy className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
                </div>
              </motion.div>

              {/* Result title */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
                <GlitchText color={passed ? '#22c55e' : '#ef4444'} className="text-3xl sm:text-4xl font-black tracking-[0.2em]">
                  {passed ? 'MISSION COMPLETE!' : 'MISSION FAILED'}
                </GlitchText>
                <p className="mt-2 text-[10px] font-mono tracking-[0.3em] uppercase" style={{ color: `${passed ? '#22c55e' : '#ef4444'}60` }}>
                  {passed ? '// TRANSMISSION VERIFIED — CLEARANCE GRANTED' : '// TRANSMISSION CORRUPTED — RETRY REQUIRED'}
                </p>
              </motion.div>

              {/* Score terminal */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full max-w-xs">
                <div className="rounded-lg p-5 text-center relative" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)' }}>
                  <p className="text-[9px] font-mono tracking-[0.3em] mb-3 uppercase" style={{ color: `${passed ? '#22c55e' : '#ef4444'}50` }}>▸ Signal Integrity Report ◂</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl sm:text-6xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed ? '#22c55e' : '#ef4444', textShadow: `0 0 15px ${passed ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}` }}>
                      <AnimatedCounter target={score} duration={1200} />
                    </span>
                    <span className="text-xl text-slate-600 font-bold">/</span>
                    <span className="text-xl text-slate-600 font-bold">{totalQuestions}</span>
                  </div>
                  <p className="text-slate-600 mt-1 text-[9px] font-mono tracking-[0.3em] uppercase">Packets Received</p>
                  <div className="mt-3 text-3xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed ? '#22c55e' : '#ef4444', textShadow: `0 0 10px ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
                    <AnimatedCounter target={percentage} duration={1500} />%
                  </div>
                </div>
              </motion.div>

              {/* Badge */}
              <AnimatePresence>
                {passed && badge && (
                  <motion.div initial={{ opacity: 0, scale: 0, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 1 }} className="flex flex-col items-center gap-3">
                    <p className="text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: `${badge.color}80` }}>▸ Achievement Decoded ◂</p>
                    <motion.div animate={{ boxShadow: [`0 0 20px ${badge.color}25`, `0 0 40px ${badge.color}40`, `0 0 20px ${badge.color}25`] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                      <Badge className="text-lg px-5 py-2.5 gap-3 font-bold tracking-wider" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `linear-gradient(135deg, ${badge.color}08, ${badge.color}12)`, border: `1px solid ${badge.color}50`, color: badge.color, textShadow: `0 0 10px ${badge.color}80` }}>
                        <HologramLetter letter={badge.icon.replace(/[\[\]]/g, '')} color={badge.color} size="sm" />
                        {badge.name}
                      </Badge>
                    </motion.div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div key={i} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.3 + i * 0.1, type: 'spring', stiffness: 200 }}>
                          <Star className="w-5 h-5" fill={percentage === 100 ? '#fbbf24' : i < Math.ceil(percentage / 20) ? '#fbbf24' : 'transparent'} stroke="#fbbf24" style={{ filter: i < Math.ceil(percentage / 20) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' : 'none' }} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: passed ? 1.5 : 0.8 }} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button onClick={handleRetry} className="flex-1 gap-2 font-bold tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(10,15,30,0.8))', border: '1px solid rgba(148,163,184,0.15)', color: '#94a3b8' }}
                  onMouseEnter={(e) => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(148,163,184,0.15)'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <RotateCcw className="w-4 h-4" /> REINITIALIZE
                </Button>
                <Button onClick={handleReturnToDashboard} className="flex-1 gap-2 font-bold tracking-[0.15em] text-sm" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `linear-gradient(135deg, ${missionColor}08, ${missionColor}15)`, border: `1px solid ${missionColor}30`, color: missionColor, boxShadow: `0 0 12px ${missionColor}10` }}
                  onMouseEnter={(e) => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor = missionColor; e.currentTarget.style.boxShadow = `0 0 20px ${missionColor}25`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${missionColor}30`; e.currentTarget.style.boxShadow = `0 0 12px ${missionColor}10`; }}>
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
    <div className="relative w-full max-w-2xl mx-auto px-4 py-6">
      <style>{`
        @keyframes quiz-glitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
        @keyframes quiz-glitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        @keyframes energy-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes border-glow { 0%,100%{border-color:${missionColor}15} 50%{border-color:${missionColor}35} }
        @keyframes hologram-shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-6px)} 20%{transform:translateX(5px)} 30%{transform:translateX(-4px)} 40%{transform:translateX(3px)} 50%{transform:translateX(-2px)} 60%{transform:translateX(1px)} }
        @keyframes glitch-red { 0%,90%,100%{opacity:0} 92%{opacity:0.15} 96%{opacity:0.08} }
      `}</style>

      {/* ─── Progress Bar ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3 h-3" style={{ color: `${missionColor}70` }} />
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: `${missionColor}60` }}>SIGNAL {String(currentQuestion + 1).padStart(2,'0')}/{String(totalQuestions).padStart(2,'0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" style={{ color: `${missionColor}50` }} />
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: `${missionColor}60` }}>INTEGRITY {score}/{currentQuestion}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${missionColor}12`, boxShadow: 'inset 0 0 6px rgba(0,0,0,0.5)' }}>
          <motion.div className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, ${missionColor}30, ${missionColor})`, boxShadow: `0 0 8px ${missionColor}50` }}
            initial={{ width: '0%' }} animate={{ width: `${progressValue}%` }} transition={{ duration: 0.5 }}>
            <div className="absolute right-0 top-0 bottom-0 w-2" style={{ background: missionColor, boxShadow: `0 0 6px ${missionColor}, 0 0 12px ${missionColor}80`, animation: 'energy-pulse 1s ease-in-out infinite' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Question Card ─── */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, x: 60, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -60, scale: 0.96 }} transition={{ duration: 0.35 }}>
          <div
            className="relative overflow-hidden rounded-xl"
            style={{
              background: 'linear-gradient(145deg, rgba(3,8,20,0.96), rgba(8,14,28,0.92))',
              border: `1px solid ${missionColor}18`,
              boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 80px ${missionColor}05`,
              backdropFilter: 'blur(20px)',
              animation: shakeCard ? 'shake 0.5s ease-in-out' : 'none',
            }}
          >
            <CRTOverlay />
            <ScanningBeam color={missionColor} />
            <HUDCorners color={missionColor} />
            <TravelingBorder color={missionColor} size={100} />

            {/* Glitch flash overlay (on wrong answer) */}
            {glitchFlash && (
              <div className="absolute inset-0 z-20 pointer-events-none" style={{ background: 'rgba(239,68,68,0.08)', animation: 'glitch-red 0.5s ease-out' }} />
            )}

            {/* Particle burst (on correct answer) */}
            {burstPos && <ParticleBurst color={missionColor} x={burstPos.x} y={burstPos.y} />}

            {/* Top accent line */}
            <div className="h-[2px] w-full relative z-[5]" style={{ background: `linear-gradient(90deg, transparent, ${missionColor}70, transparent)`, boxShadow: `0 0 8px ${missionColor}30` }} />

            <div className="relative z-[5] p-5 sm:p-7">
              {/* ─── Header Row ─── */}
              <div className="flex items-center gap-3 mb-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={missionColor} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Radio className="w-2.5 h-2.5" style={{ color: `${missionColor}60` }} />
                    <span className="text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: `${missionColor}50` }}>INCOMING TRANSMISSION</span>
                  </div>
                  <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${missionColor}30, ${missionColor}08, transparent)` }} />
                </div>
                <div className="px-2.5 py-0.5 rounded text-[11px] font-mono font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${missionColor}08`, border: `1px solid ${missionColor}20`, color: missionColor, textShadow: `0 0 6px ${missionColor}50` }}>
                  {String(currentQuestion + 1).padStart(2,'0')}/{String(totalQuestions).padStart(2,'0')}
                </div>
              </div>

              {/* ─── HUD Telemetry Strip ─── */}
              <div className="flex items-center gap-4 mb-4 pb-3" style={{ borderBottom: `1px solid ${missionColor}08` }}>
                <HUDReadout label="FREQ" value={`${telemetry.freq}MHz`} color={missionColor} />
                <HUDReadout label="LAT" value={`${telemetry.lat}°`} color={missionColor} />
                <HUDReadout label="SIG" value={`${telemetry.signal}%`} color={missionColor} />
              </div>

              {/* ─── Question Text (Typewriter) ─── */}
              <div className="mb-7 min-h-[56px]">
                <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: '#e2e8f0' }}>
                  {typedQuestion}
                  {!typeDone && (
                    <span className="inline-block w-[2px] h-[18px] ml-0.5 align-middle" style={{ background: missionColor, boxShadow: `0 0 6px ${missionColor}`, animation: 'cursor-blink 0.6s steps(2) infinite' }} />
                  )}
                </h3>
              </div>

              {/* ─── Options ─── */}
              <div className="grid gap-2">
                {currentQ.options.map((option, index) => {
                  const isAnswered = selectedAnswer !== null;
                  const isCorrectOpt = index === questions[currentQuestion].correct;
                  const isWrongOpt = index === selectedAnswer && !isCorrect;
                  const isDimmed = isAnswered && !isCorrectOpt && !isWrongOpt;

                  // Determine colors
                  let borderColor = `${missionColor}12`;
                  let accentBg = `${missionColor}08`;
                  let textColor = '#c0c8d8';
                  let letterBg = `${missionColor}10`;
                  let letterBorder = `${missionColor}20`;
                  let letterColor = missionColor;
                  let letterGlow = `0 0 8px ${missionColor}40`;
                  let stripeColor = missionColor;
                  let stripeGlow = `0 0 6px ${missionColor}30`;

                  if (isAnswered && isCorrectOpt) {
                    borderColor = 'rgba(34,197,94,0.35)';
                    accentBg = 'rgba(34,197,94,0.04)';
                    textColor = '#4ade80';
                    letterBg = 'rgba(34,197,94,0.1)';
                    letterBorder = 'rgba(34,197,94,0.35)';
                    letterColor = '#4ade80';
                    letterGlow = '0 0 10px rgba(74,222,128,0.4)';
                    stripeColor = '#22c55e';
                    stripeGlow = '0 0 8px rgba(34,197,94,0.4)';
                  } else if (isWrongOpt) {
                    borderColor = 'rgba(239,68,68,0.35)';
                    accentBg = 'rgba(239,68,68,0.04)';
                    textColor = '#f87171';
                    letterBg = 'rgba(239,68,68,0.1)';
                    letterBorder = 'rgba(239,68,68,0.35)';
                    letterColor = '#f87171';
                    letterGlow = '0 0 10px rgba(248,113,113,0.4)';
                    stripeColor = '#ef4444';
                    stripeGlow = '0 0 8px rgba(239,68,68,0.4)';
                  } else if (isDimmed) {
                    borderColor = 'rgba(30,41,59,0.2)';
                    accentBg = 'transparent';
                    textColor = '#1e293b';
                    letterBg = 'rgba(30,41,59,0.1)';
                    letterBorder = 'transparent';
                    letterColor = '#334155';
                    letterGlow = 'none';
                    stripeColor = 'rgba(30,41,59,0.3)';
                    stripeGlow = 'none';
                  }

                  return (
                    <motion.div
                      key={`${currentQuestion}-${index}`}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.07, duration: 0.25 }}
                      whileHover={!isAnswered ? { scale: 1.02, transition: { duration: 0.15 } } : {}}
                      whileTap={!isAnswered ? { scale: 0.98 } : {}}
                      onMouseEnter={() => { if (!isAnswered && soundEnabled) soundEngine.playHover(); }}
                    >
                      <div
                        className="relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300"
                        style={{
                          background: accentBg,
                          border: `1px solid ${borderColor}`,
                          boxShadow: isCorrectOpt && isAnswered ? '0 0 15px rgba(34,197,94,0.1), inset 0 1px 0 rgba(34,197,94,0.08)' : isWrongOpt && isAnswered ? '0 0 15px rgba(239,68,68,0.1), inset 0 1px 0 rgba(239,68,68,0.08)' : 'none',
                          animation: !isAnswered ? 'border-glow 4s ease-in-out infinite' : 'none',
                          opacity: isDimmed ? 0.4 : 1,
                        }}
                        onClick={() => handleAnswer(index)}
                        role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnswer(index); } }}
                        aria-label={`Option ${alphaLabels[index]}: ${option}`}
                      >
                        {/* Left neon stripe */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: stripeColor, boxShadow: stripeGlow }} />

                        {/* Holographic shimmer on hover (CSS only) */}
                        {!isAnswered && (
                          <div className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500" style={{
                            background: `linear-gradient(105deg, transparent 30%, ${missionColor}06 45%, ${missionColor}10 50%, ${missionColor}06 55%, transparent 70%)`,
                            backgroundSize: '200% 100%',
                            animation: 'hologram-shimmer 3s linear infinite',
                          }} />
                        )}

                        <div className="flex items-center gap-3.5 px-4 py-3 sm:py-3.5">
                          {/* Letter badge */}
                          <div className="shrink-0 w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all duration-300" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: letterBg, border: `1px solid ${letterBorder}`, color: letterColor, textShadow: letterGlow }}>
                            {alphaLabels[index]}
                          </div>

                          {/* Option text */}
                          <span className="text-sm sm:text-[15px] font-medium leading-relaxed flex-1" style={{ color: textColor }}>{option}</span>

                          {/* Status icon */}
                          {isAnswered && (isCorrectOpt || isWrongOpt) && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 250, damping: 15 }} className="shrink-0">
                              {isCorrectOpt && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', boxShadow: '0 0 8px rgba(34,197,94,0.2)' }}>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                </div>
                              )}
                              {isWrongOpt && (
                                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 0 8px rgba(239,68,68,0.2)' }}>
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ─── Feedback ─── */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-5 text-center">
                    {isCorrect ? (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.08, 1] }} transition={{ duration: 0.35 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-sm font-black tracking-[0.2em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#4ade80', textShadow: '0 0 12px rgba(74,222,128,0.4), 0 0 25px rgba(74,222,128,0.15)' }}>SIGNAL VERIFIED</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </motion.div>
                    ) : (
                      <motion.div initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.08, 1] }} transition={{ duration: 0.35 }} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.25)' }}>
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-sm font-black tracking-[0.2em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#f87171', textShadow: '0 0 12px rgba(248,113,113,0.4), 0 0 25px rgba(248,113,113,0.15)' }}>SIGNAL CORRUPTED</span>
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                      </motion.div>
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
