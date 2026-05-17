'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Star, Radio, Cpu, Wifi, AlertTriangle } from 'lucide-react';
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
function useTypewriter(text: string, speed = 20, enabled = true) {
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

// ─── CRT + Vignette Overlay ───────────────────────────────────────────────
function CRTOverlay() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-20" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 2px)' }} />
      <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)' }} />
    </>
  );
}

// ─── Pulsing Energy Ring ──────────────────────────────────────────────────
function EnergyRing({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] flex items-center justify-center">
      <motion.div
        className="absolute rounded-full"
        style={{ width: '300px', height: '300px', border: `1px solid ${color}15` }}
        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: '200px', height: '200px', border: `1px solid ${color}20` }}
        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
      />
      <motion.div
        className="absolute rounded-full"
        style={{ width: '120px', height: '120px', border: `1px solid ${color}25` }}
        animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 1 }}
      />
    </div>
  );
}

// ─── Scanning Beam ────────────────────────────────────────────────────────
function ScanningBeam({ color }: { color: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-[2]">
      <motion.div className="absolute left-0 right-0 h-[1px]" style={{ background: `linear-gradient(90deg, transparent, ${color}60, ${color}, ${color}60, transparent)`, boxShadow: `0 0 8px ${color}80, 0 0 20px ${color}40` }} animate={{ top: ['0%', '100%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} />
    </div>
  );
}

// ─── Traveling Border Light ───────────────────────────────────────────────
function TravelingBorder({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[6] overflow-hidden rounded-xl">
      <motion.div className="absolute top-0 h-[2px]" style={{ width: 80, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 10px ${color}, 0 0 25px ${color}50` }} animate={{ left: ['-80px', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }} />
      <motion.div className="absolute bottom-0 h-[2px]" style={{ width: 80, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, boxShadow: `0 0 10px ${color}, 0 0 25px ${color}50` }} animate={{ right: ['-80px', '100%'] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1.75 }} />
    </div>
  );
}

// ─── Particle Burst ───────────────────────────────────────────────────────
function ParticleBurst({ color }: { color: string }) {
  const particles = useMemo(() => Array.from({ length: 24 }, (_, i) => ({ id: i, angle: (360 / 24) * i + Math.random() * 15, speed: 50 + Math.random() * 100, size: 2 + Math.random() * 5 })), []);
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
  const particles = Array.from({ length: 50 }, (_, i) => ({ id: i, x: Math.random() * 100, delay: Math.random() * 0.8, size: Math.random() * 6 + 2, angle: Math.random() * 360, distance: 80 + Math.random() * 180 }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div key={p.id} className="absolute rounded-full" style={{ width: p.size, height: p.size, backgroundColor: color, left: `${p.x}%`, top: '50%', boxShadow: `0 0 ${p.size * 2}px ${color}` }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0.5, 0], scale: [0, 1.2, 0.8, 0], x: [0, Math.cos((p.angle * Math.PI) / 180) * p.distance], y: [0, Math.sin((p.angle * Math.PI) / 180) * p.distance] }}
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
    const animate = (now: number) => { const p = Math.min((now - startTime) / duration, 1); setCount(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p < 1) frameRef.current = requestAnimationFrame(animate); };
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
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(255,0,80,0.5)', clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)', animation: 'qglitch-top 3s infinite linear alternate-reverse' }}>{children}</span>
      <span aria-hidden="true" className="absolute top-0 left-0" style={{ color: 'rgba(0,200,255,0.5)', clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)', animation: 'qglitch-bottom 2.5s infinite linear alternate-reverse' }}>{children}</span>
    </span>
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
  const [warningFlash, setWarningFlash] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);

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
      setTimeout(() => setShowBurst(false), 1000);
    } else {
      if (soundEnabled) soundEngine.failure();
      setShakeCard(true);
      setWarningFlash(true);
      setTimeout(() => { setShakeCard(false); setWarningFlash(false); }, 600);
    }

    setTimeout(() => {
      if (currentQuestion + 1 < totalQuestions) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setAnswersLocked(false);
        setHoveredOption(null);
      } else {
        const finalScore = correctAnswer ? score + 1 : score;
        const finalPct = Math.round((finalScore / totalQuestions) * 100);
        const finalPassed = finalPct >= 70;
        if (finalPassed && soundEnabled) setTimeout(() => soundEngine.achievement(), 300);
        setShowResults(true);
        if (finalPassed) setTimeout(() => setShowCelebration(true), 400);
        updateProgress(missionId, { quizScore: finalPct, quizPassed: finalPassed, ...(finalPassed ? { completed: true } : {}) });
      }
    }, 1800);
  }, [answersLocked, currentQuestion, questions, score, soundEnabled, totalQuestions, updateProgress, missionId]);

  const handleRetry = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setCurrentQuestion(0); setSelectedAnswer(null); setIsCorrect(null); setScore(0);
    setShowResults(false); setShowCelebration(false); setAnswersLocked(false); setHoveredOption(null);
  }, [soundEnabled]);

  const handleReturn = useCallback(() => { if (soundEnabled) soundEngine.playClick(); setPage('dashboard'); }, [soundEnabled, setPage]);

  const alphaLabels = ['A', 'B', 'C', 'D'];

  // ═════════════════════════════════════════════════════════════════════════
  // ─── RESULTS SCREEN ─────────────────────────────────────────────────────
  // ═════════════════════════════════════════════════════════════════════════
  if (showResults) {
    return (
      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        <style>{`
          @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
          @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        `}</style>
        {showCelebration && badge && <CelebrationParticles color={badge.color} />}
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative overflow-hidden rounded-xl" style={{ background: 'linear-gradient(145deg, rgba(3,6,18,0.98), rgba(6,12,24,0.95))', border: `1px solid ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, backdropFilter: 'blur(20px)' }}>
            <CRTOverlay />
            <EnergyRing color={passed ? '#22c55e' : '#ef4444'} />
            <TravelingBorder color={passed ? '#22c55e' : '#ef4444'} />
            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${passed?'#22c55e':'#ef4444'}, transparent)`, boxShadow: `0 0 10px ${passed?'rgba(34,197,94,0.5)':'rgba(239,68,68,0.5)'}` }} />
            <div className="relative z-10 p-8 flex flex-col items-center gap-6">
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }} className="flex items-center gap-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={passed ? (badge?.color ?? '#22c55e') : '#ef4444'} size="lg" />
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `2px solid ${passed?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`, boxShadow: `0 0 30px ${passed?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}` }}>
                  {passed ? <Trophy className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-center">
                <GlitchText color={passed ? '#22c55e' : '#ef4444'} className="text-3xl sm:text-4xl font-black tracking-[0.2em]">{passed ? 'MISSION COMPLETE!' : 'MISSION FAILED'}</GlitchText>
                <p className="mt-2 text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: `${passed?'#22c55e':'#ef4444'}50` }}>{passed ? '// CLEARANCE GRANTED' : '// RETRY REQUIRED'}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="w-full max-w-xs rounded-lg p-5 text-center" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${passed?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)'}`, boxShadow: 'inset 0 0 30px rgba(0,0,0,0.3)' }}>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed?'#22c55e':'#ef4444', textShadow: `0 0 20px ${passed?'rgba(34,197,94,0.5)':'rgba(239,68,68,0.5)'}` }}><AnimatedCounter target={score} duration={1200} /></span>
                  <span className="text-xl text-slate-600">/</span>
                  <span className="text-xl text-slate-600">{totalQuestions}</span>
                </div>
                <div className="mt-2 text-3xl font-black" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: passed?'#22c55e':'#ef4444', textShadow: `0 0 12px ${passed?'rgba(34,197,94,0.4)':'rgba(239,68,68,0.4)'}` }}><AnimatedCounter target={percentage} duration={1500} />%</div>
              </motion.div>
              <AnimatePresence>{passed && badge && (
                <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 1 }} className="flex flex-col items-center gap-3">
                  <p className="text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: `${badge.color}70` }}>▸ ACHIEVEMENT DECODED ◂</p>
                  <motion.div animate={{ boxShadow: [`0 0 20px ${badge.color}20`, `0 0 40px ${badge.color}40`, `0 0 20px ${badge.color}20`] }} transition={{ duration: 2, repeat: Infinity }}>
                    <Badge className="text-lg px-5 py-2.5 gap-3 font-bold tracking-wider" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${badge.color}10`, border: `1px solid ${badge.color}50`, color: badge.color, textShadow: `0 0 10px ${badge.color}80` }}>
                      <HologramLetter letter={badge.icon.replace(/[\[\]]/g, '')} color={badge.color} size="sm" />{badge.name}
                    </Badge>
                  </motion.div>
                  <div className="flex gap-1 mt-1">{[...Array(5)].map((_, i) => <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.3 + i * 0.1, type: 'spring' }}><Star className="w-5 h-5" fill={i < Math.ceil(percentage / 20) ? '#fbbf24' : 'transparent'} stroke="#fbbf24" style={{ filter: i < Math.ceil(percentage / 20) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' : 'none' }} /></motion.div>)}</div>
                </motion.div>
              )}</AnimatePresence>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: passed ? 1.5 : 0.8 }} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                <Button onClick={handleRetry} className="flex-1 gap-2 text-sm" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(148,163,184,0.12)', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.15em' }}
                  onMouseEnter={e => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor='#22d3ee'; e.currentTarget.style.color='#22d3ee'; e.currentTarget.style.boxShadow='0 0 20px rgba(34,211,238,0.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(148,163,184,0.12)'; e.currentTarget.style.color='#94a3b8'; e.currentTarget.style.boxShadow='none'; }}>
                  <RotateCcw className="w-4 h-4" />REINITIALIZE
                </Button>
                <Button onClick={handleReturn} className="flex-1 gap-2 text-sm" style={{ fontFamily: 'var(--font-orbitron), sans-serif', background: `${missionColor}08`, border: `1px solid ${missionColor}25`, color: missionColor, fontWeight: 700, letterSpacing: '0.15em' }}
                  onMouseEnter={e => { if (soundEnabled) soundEngine.playHover(); e.currentTarget.style.borderColor=missionColor; e.currentTarget.style.boxShadow=`0 0 20px ${missionColor}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${missionColor}25`; e.currentTarget.style.boxShadow='none'; }}>
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
        @keyframes qglitch-top { 0%,92%,100%{transform:translate(0)} 93%{transform:translate(-2px,-1px)} 95%{transform:translate(2px,1px)} 97%{transform:translate(-1px,0)} 99%{transform:translate(1px,-1px)} }
        @keyframes qglitch-bottom { 0%,90%,100%{transform:translate(0)} 91%{transform:translate(1px,1px)} 94%{transform:translate(-2px,0)} 96%{transform:translate(2px,-1px)} 98%{transform:translate(-1px,1px)} }
        @keyframes cursor-blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes energy-pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 10%{transform:translateX(-5px)} 20%{transform:translateX(4px)} 30%{transform:translateX(-3px)} 40%{transform:translateX(2px)} 50%{transform:translateX(-1px)} }
        @keyframes neon-breathe { 0%,100%{box-shadow:0 0 5px ${missionColor}20, 0 0 10px ${missionColor}08} 50%{box-shadow:0 0 10px ${missionColor}35, 0 0 20px ${missionColor}12} }
        @keyframes holo-sweep { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes warn-pulse { 0%,100%{opacity:0} 50%{opacity:1} }
      `}</style>

      {/* ─── PROGRESS BAR ─── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3" style={{ color: `${missionColor}60` }} />
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: `${missionColor}55` }}>NODE {String(currentQuestion + 1).padStart(2,'0')}/{String(totalQuestions).padStart(2,'0')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3 h-3" style={{ color: `${missionColor}50` }} />
            <span className="text-[9px] font-mono tracking-[0.25em] uppercase" style={{ color: `${missionColor}55` }}>SYNC {score}/{currentQuestion}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.5)', border: `1px solid ${missionColor}10` }}>
          <motion.div className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, ${missionColor}25, ${missionColor})`, boxShadow: `0 0 8px ${missionColor}50` }} initial={{ width: '0%' }} animate={{ width: `${progressValue}%` }} transition={{ duration: 0.4 }}>
            <div className="absolute right-0 top-0 bottom-0 w-2 rounded-full" style={{ background: missionColor, boxShadow: `0 0 6px ${missionColor}, 0 0 12px ${missionColor}80`, animation: 'energy-pulse 1s ease-in-out infinite' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── QUESTION CARD ─── */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
          <div className="relative overflow-hidden rounded-xl" style={{
            background: 'linear-gradient(150deg, rgba(2,5,14,0.97), rgba(6,10,22,0.94))',
            border: `1px solid ${missionColor}15`,
            boxShadow: `0 0 50px rgba(0,0,0,0.7), 0 0 100px ${missionColor}04`,
            backdropFilter: 'blur(20px)',
            animation: shakeCard ? 'shake 0.5s ease-in-out' : undefined,
          }}>
            <CRTOverlay />
            <EnergyRing color={missionColor} />
            <ScanningBeam color={missionColor} />
            <TravelingBorder color={missionColor} />

            {/* Warning flash on wrong answer */}
            {warningFlash && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute inset-0" style={{ background: 'rgba(239,68,68,0.06)', animation: 'warn-pulse 0.15s ease-out 3' }} />
                <div className="absolute top-2 right-3 flex items-center gap-1.5" style={{ animation: 'warn-pulse 0.2s ease-out 3' }}>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-[9px] font-mono font-bold tracking-widest text-red-400">⚠ SIGNAL CORRUPTED</span>
                </div>
              </div>
            )}

            {/* Particle burst on correct */}
            {showBurst && <ParticleBurst color={missionColor} />}

            {/* Top accent line */}
            <div className="h-[2px] w-full relative z-[5]" style={{ background: `linear-gradient(90deg, transparent, ${missionColor}60, transparent)`, boxShadow: `0 0 8px ${missionColor}25` }} />

            <div className="relative z-[5] p-5 sm:p-7">
              {/* ─── HEADER ─── */}
              <div className="flex items-center gap-3 mb-4">
                <HologramLetter letter={missionId[0].toUpperCase()} color={missionColor} size="md" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Radio className="w-2.5 h-2.5" style={{ color: `${missionColor}50`, animation: 'energy-pulse 2s ease-in-out infinite' }} />
                    <span className="text-[9px] font-mono tracking-[0.3em] uppercase" style={{ color: `${missionColor}45` }}>INCOMING TRANSMISSION</span>
                  </div>
                  <div className="h-px w-full" style={{ background: `linear-gradient(90deg, ${missionColor}25, transparent)` }} />
                </div>
              </div>

              {/* ─── QUESTION (typewriter) ─── */}
              <div className="mb-6 min-h-[50px]">
                <h3 className="text-base sm:text-lg font-bold leading-relaxed" style={{ color: '#d8dee8' }}>
                  {typedQ}
                  {!typeDone && <span className="inline-block w-[2px] h-[16px] ml-0.5 align-middle" style={{ background: missionColor, boxShadow: `0 0 6px ${missionColor}`, animation: 'cursor-blink 0.5s steps(2) infinite' }} />}
                </h3>
              </div>

              {/* ─── OPTIONS — THE MAIN EVENT ─── */}
              <div className="grid gap-2.5">
                {currentQ.options.map((option, index) => {
                  const isAnswered = selectedAnswer !== null;
                  const isCorrectOpt = index === questions[currentQuestion].correct;
                  const isWrongOpt = index === selectedAnswer && !isCorrect;
                  const isDimmed = isAnswered && !isCorrectOpt && !isWrongOpt;
                  const isHovered = hoveredOption === index && !isAnswered;

                  // Color states
                  let neonColor = missionColor;
                  let bgGlow = `${missionColor}06`;
                  let borderCol = `${missionColor}15`;
                  let textCol = '#b8c4d4';
                  let badgeBg = `${missionColor}08`;
                  let badgeBorder = `${missionColor}18`;
                  let badgeColor = missionColor;
                  let badgeGlow = `0 0 6px ${missionColor}30`;
                  let stripeColor = missionColor;
                  let outerGlow = 'none';

                  if (isHovered) {
                    bgGlow = `${missionColor}12`;
                    borderCol = `${missionColor}50`;
                    textCol = '#e8edf5';
                    badgeBg = `${missionColor}15`;
                    badgeBorder = `${missionColor}35`;
                    badgeColor = missionColor;
                    badgeGlow = `0 0 12px ${missionColor}50`;
                    stripeColor = missionColor;
                    outerGlow = `0 0 20px ${missionColor}15, inset 0 0 15px ${missionColor}04`;
                  }

                  if (isAnswered && isCorrectOpt) {
                    neonColor = '#22c55e'; bgGlow = 'rgba(34,197,94,0.06)'; borderCol = 'rgba(34,197,94,0.4)';
                    textCol = '#4ade80'; badgeBg = 'rgba(34,197,94,0.1)'; badgeBorder = 'rgba(34,197,94,0.35)';
                    badgeColor = '#4ade80'; badgeGlow = '0 0 10px rgba(74,222,128,0.4)';
                    stripeColor = '#22c55e'; outerGlow = '0 0 25px rgba(34,197,94,0.12), inset 0 0 20px rgba(34,197,94,0.03)';
                  } else if (isWrongOpt) {
                    neonColor = '#ef4444'; bgGlow = 'rgba(239,68,68,0.06)'; borderCol = 'rgba(239,68,68,0.4)';
                    textCol = '#f87171'; badgeBg = 'rgba(239,68,68,0.1)'; badgeBorder = 'rgba(239,68,68,0.35)';
                    badgeColor = '#f87171'; badgeGlow = '0 0 10px rgba(248,113,113,0.4)';
                    stripeColor = '#ef4444'; outerGlow = '0 0 25px rgba(239,68,68,0.12), inset 0 0 20px rgba(239,68,68,0.03)';
                  } else if (isDimmed) {
                    neonColor = '#1e293b'; bgGlow = 'transparent'; borderCol = 'rgba(30,41,59,0.15)';
                    textCol = '#1e293b'; badgeBg = 'rgba(30,41,59,0.08)'; badgeBorder = 'transparent';
                    badgeColor = '#334155'; badgeGlow = 'none'; stripeColor = '#1e293b'; outerGlow = 'none';
                  }

                  return (
                    <motion.div
                      key={`${currentQuestion}-${index}`}
                      initial={{ opacity: 0, x: 50, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ delay: 0.25 + index * 0.08, duration: 0.3, ease: 'easeOut' }}
                      whileHover={!isAnswered ? { scale: 1.03 } : {}}
                      whileTap={!isAnswered ? { scale: 0.97 } : {}}
                      onMouseEnter={() => { setHoveredOption(index); if (!isAnswered && soundEnabled) soundEngine.playHover(); }}
                      onMouseLeave={() => setHoveredOption(null)}
                    >
                      <div
                        className="relative rounded-lg overflow-hidden transition-all duration-200"
                        style={{
                          background: bgGlow,
                          border: `1px solid ${borderCol}`,
                          boxShadow: outerGlow,
                          cursor: isAnswered ? 'default' : 'pointer',
                          opacity: isDimmed ? 0.3 : 1,
                          animation: !isAnswered && !isHovered ? 'neon-breathe 3s ease-in-out infinite' : undefined,
                        }}
                        onClick={() => handleAnswer(index)}
                        role="button" tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnswer(index); } }}
                        aria-label={`Option ${alphaLabels[index]}: ${option}`}
                      >
                        {/* Left neon stripe */}
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-200" style={{ background: stripeColor, boxShadow: `0 0 8px ${stripeColor}50, 0 0 16px ${stripeColor}20` }} />

                        {/* Holographic sweep on hover */}
                        {isHovered && (
                          <div className="absolute inset-0 pointer-events-none z-10" style={{
                            background: `linear-gradient(105deg, transparent 30%, ${missionColor}08 45%, ${missionColor}12 50%, ${missionColor}08 55%, transparent 70%)`,
                            backgroundSize: '200% 100%',
                            animation: 'holo-sweep 2s linear infinite',
                          }} />
                        )}

                        <div className="flex items-center gap-3.5 px-4 py-3 sm:py-3.5">
                          {/* Letter badge — GLOWING NEON */}
                          <div
                            className="shrink-0 w-9 h-9 rounded flex items-center justify-center text-sm font-black transition-all duration-200"
                            style={{
                              fontFamily: 'var(--font-orbitron), sans-serif',
                              background: badgeBg,
                              border: `1px solid ${badgeBorder}`,
                              color: badgeColor,
                              textShadow: badgeGlow,
                              boxShadow: isHovered ? `0 0 12px ${neonColor}25, inset 0 0 8px ${neonColor}08` : 'none',
                            }}
                          >
                            {alphaLabels[index]}
                          </div>

                          {/* Option text */}
                          <span className="text-sm sm:text-[15px] font-medium leading-relaxed flex-1" style={{ color: textCol }}>{option}</span>

                          {/* Status icon */}
                          {isAnswered && (isCorrectOpt || isWrongOpt) && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="shrink-0">
                              {isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-green-400" style={{ filter: 'drop-shadow(0 0 6px rgba(74,222,128,0.5))' }} />}
                              {isWrongOpt && <XCircle className="w-5 h-5 text-red-400" style={{ filter: 'drop-shadow(0 0 6px rgba(248,113,113,0.5))' }} />}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ─── FEEDBACK ─── */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="mt-5 text-center">
                    {isCorrect ? (
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-md" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', boxShadow: '0 0 15px rgba(34,197,94,0.08)' }}>
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }}><CheckCircle2 className="w-4 h-4 text-green-400" /></motion.div>
                        <span className="text-sm font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#4ade80', textShadow: '0 0 15px rgba(74,222,128,0.5), 0 0 30px rgba(74,222,128,0.2)' }}>SIGNAL VERIFIED</span>
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }}><CheckCircle2 className="w-4 h-4 text-green-400" /></motion.div>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-md" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 0 15px rgba(239,68,68,0.08)' }}>
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }}><XCircle className="w-4 h-4 text-red-400" /></motion.div>
                        <span className="text-sm font-black tracking-[0.25em]" style={{ fontFamily: 'var(--font-orbitron), sans-serif', color: '#f87171', textShadow: '0 0 15px rgba(248,113,113,0.5), 0 0 30px rgba(248,113,113,0.2)' }}>SIGNAL CORRUPTED</span>
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4 }}><XCircle className="w-4 h-4 text-red-400" /></motion.div>
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
