'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Star, Zap, Shield, Crosshair } from 'lucide-react';
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

// ─── Scanning Beam ────────────────────────────────────────────────────────
function ScanningBeam({ color }: { color: string }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-[1]">
      <motion.div
        className="absolute left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}60, ${color}, ${color}60, transparent)`,
          boxShadow: `0 0 12px ${color}80, 0 0 30px ${color}40, 0 0 60px ${color}20`,
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
      {/* Trailing glow */}
      <motion.div
        className="absolute left-0 right-0"
        style={{
          height: '40px',
          background: `linear-gradient(180deg, transparent, ${color}08, transparent)`,
        }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ─── Hologram Grid Lines ─────────────────────────────────────────────────
function HologramGrid({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
      {/* Horizontal lines */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0"
          style={{
            top: `${(i + 1) * 12.5}%`,
            height: '1px',
            background: `linear-gradient(90deg, transparent 5%, ${color}06 20%, ${color}10 50%, ${color}06 80%, transparent 95%)`,
          }}
        />
      ))}
      {/* Vertical lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={`v-${i}`}
          className="absolute top-0 bottom-0"
          style={{
            left: `${(i + 1) * 16.66}%`,
            width: '1px',
            background: `linear-gradient(180deg, transparent 5%, ${color}06 20%, ${color}10 50%, ${color}06 80%, transparent 95%)`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Data Stream Particles ────────────────────────────────────────────────
function DataStream({ color }: { color: string }) {
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      speed: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      char: String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96)),
      opacity: 0.08 + Math.random() * 0.12,
    })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            fontFamily: "var(--font-share-tech-mono), monospace",
            fontSize: '10px',
            color: `${color}`,
            opacity: p.opacity,
            textShadow: `0 0 4px ${color}40`,
          }}
          animate={{ y: ['-20px', 'calc(100vh + 20px)'] }}
          transition={{ duration: p.speed, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          {p.char}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Celebration particles for mission complete ───────────────────────────
function CelebrationParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: Math.random() * 6 + 3,
    angle: Math.random() * 360,
    distance: 80 + Math.random() * 160,
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
            boxShadow: `0 0 ${p.size * 2}px ${color}, 0 0 ${p.size * 4}px ${color}60`,
          }}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1.2, 0.8, 0],
            x: [0, Math.cos((p.angle * Math.PI) / 180) * p.distance],
            y: [0, Math.sin((p.angle * Math.PI) / 180) * p.distance],
          }}
          transition={{
            duration: 1.5 + Math.random() * 0.5,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// ─── Animated counter for score reveal ────────────────────────────────────
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <span>{count}</span>;
}

// ─── Glitch Text Effect ──────────────────────────────────────────────────
function GlitchText({ children, color, className = '' }: { children: React.ReactNode; color: string; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span style={{ color, position: 'relative' }}>{children}</span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0"
        style={{
          color: 'rgba(255,0,80,0.5)',
          clipPath: 'polygon(0 0, 100% 0, 100% 33%, 0 33%)',
          animation: 'quiz-glitch-top 3s infinite linear alternate-reverse',
        }}
      >{children}</span>
      <span
        aria-hidden="true"
        className="absolute top-0 left-0"
        style={{
          color: 'rgba(0,200,255,0.5)',
          clipPath: 'polygon(0 67%, 100% 67%, 100% 100%, 0 100%)',
          animation: 'quiz-glitch-bottom 2.5s infinite linear alternate-reverse',
        }}
      >{children}</span>
    </span>
  );
}

export default function QuizComponent({ missionId, questions, missionColor }: QuizProps) {
  const { updateProgress, setPage, soundEnabled } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answersLocked, setAnswersLocked] = useState(false);
  const [questionRevealed, setQuestionRevealed] = useState(true);
  const [decodingText, setDecodingText] = useState(false);
  const prevQuestionRef = useRef(currentQuestion);

  const totalQuestions = questions.length;
  const progressValue = ((currentQuestion) / totalQuestions) * 100;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 70;
  const badge = badgeMap[missionId];

  // Decode animation when question changes
  useEffect(() => {
    if (prevQuestionRef.current !== currentQuestion) {
      prevQuestionRef.current = currentQuestion;
    }
    const timer = setTimeout(() => {
      setDecodingText(false);
      setQuestionRevealed(true);
    }, 600);
    return () => clearTimeout(timer);
  }, [currentQuestion]);

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
      } else {
        if (soundEnabled) soundEngine.failure();
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

          if (finalPassed && soundEnabled) {
            setTimeout(() => soundEngine.achievement(), 300);
          }

          setShowResults(true);
          if (finalPassed) {
            setTimeout(() => setShowCelebration(true), 400);
          }

          updateProgress(missionId, {
            quizScore: finalPercentage,
            quizPassed: finalPassed,
            ...(finalPassed ? { completed: true } : {}),
          });
        }
      }, 1500);
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
    setQuestionRevealed(false);
    setDecodingText(true);
  }, [soundEnabled]);

  const handleReturnToDashboard = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setPage('dashboard');
  }, [soundEnabled, setPage]);

  const getOptionStyle = (index: number) => {
    const correctIndex = questions[currentQuestion].correct;

    if (selectedAnswer === null) {
      return {
        background: 'rgba(8, 12, 28, 0.7)',
        border: `1px solid rgba(148, 163, 184, 0.08)`,
        cursor: 'pointer' as const,
      };
    }

    if (index === correctIndex) {
      return {
        background: 'rgba(34, 197, 94, 0.06)',
        border: '1px solid rgba(34, 197, 94, 0.5)',
        boxShadow: '0 0 15px rgba(34,197,94,0.15), inset 0 1px 0 rgba(34,197,94,0.1)',
        cursor: 'default' as const,
      };
    }

    if (index === selectedAnswer && !isCorrect) {
      return {
        background: 'rgba(239, 68, 68, 0.06)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        boxShadow: '0 0 15px rgba(239,68,68,0.15), inset 0 1px 0 rgba(239,68,68,0.1)',
        cursor: 'default' as const,
      };
    }

    return {
      background: 'rgba(8, 12, 28, 0.3)',
      border: '1px solid rgba(148, 163, 184, 0.04)',
      cursor: 'default' as const,
      opacity: 0.35,
    };
  };

  // Get left accent color for each option
  const getAccentColor = (index: number) => {
    if (selectedAnswer === null) return missionColor;
    const correctIndex = questions[currentQuestion].correct;
    if (index === correctIndex) return '#22c55e';
    if (index === selectedAnswer && !isCorrect) return '#ef4444';
    return 'rgba(100,116,139,0.2)';
  };

  const alphaLabels = ['A', 'B', 'C', 'D'];

  // ─── Results Screen ───────────────────────────────────────────────────
  if (showResults) {
    return (
      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        <style>{`
          @keyframes quiz-glitch-top {
            0%, 92%, 100% { transform: translate(0); }
            93% { transform: translate(-2px, -1px); }
            95% { transform: translate(2px, 1px); }
            97% { transform: translate(-1px, 0); }
            99% { transform: translate(1px, -1px); }
          }
          @keyframes quiz-glitch-bottom {
            0%, 90%, 100% { transform: translate(0); }
            91% { transform: translate(1px, 1px); }
            94% { transform: translate(-2px, 0); }
            96% { transform: translate(2px, -1px); }
            98% { transform: translate(-1px, 1px); }
          }
          @keyframes result-pulse {
            0%, 100% { box-shadow: 0 0 20px ${passed ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}, 0 0 60px ${passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'}; }
            50% { box-shadow: 0 0 30px ${passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}, 0 0 80px ${passed ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}; }
          }
        `}</style>

        {showCelebration && badge && <CelebrationParticles color={badge.color} />}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(5,11,24,0.95), rgba(10,15,30,0.9))',
              border: `1px solid ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
              boxShadow: passed
                ? '0 0 40px rgba(34,197,94,0.15), 0 0 80px rgba(34,197,94,0.05)'
                : '0 0 40px rgba(239,68,68,0.15), 0 0 80px rgba(239,68,68,0.05)',
              backdropFilter: 'blur(20px)',
              animation: 'result-pulse 3s ease-in-out infinite',
            }}
          >
            {/* Scan lines overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(255,255,255,0.01) 2px,
                  rgba(255,255,255,0.01) 4px
                )`,
              }}
            />

            {/* Top accent line */}
            <div
              className="h-[2px] w-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${passed ? '#22c55e' : '#ef4444'}, transparent)`,
                boxShadow: `0 0 10px ${passed ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              }}
            />

            <div className="p-8 flex flex-col items-center gap-6">
              {/* Result icon with HologramLetter */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
                className="flex items-center gap-4"
              >
                {passed ? (
                  <>
                    <HologramLetter
                      letter={missionId[0].toUpperCase()}
                      color={badge?.color ?? '#22c55e'}
                      size="lg"
                    />
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '2px solid rgba(34, 197, 94, 0.4)',
                        boxShadow: '0 0 30px rgba(34, 197, 94, 0.3), 0 0 60px rgba(34, 197, 94, 0.1)',
                      }}
                    >
                      <Trophy className="w-8 h-8 text-green-400" />
                    </div>
                  </>
                ) : (
                  <>
                    <HologramLetter
                      letter={missionId[0].toUpperCase()}
                      color="#ef4444"
                      size="lg"
                    />
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.4)',
                        boxShadow: '0 0 30px rgba(239, 68, 68, 0.3), 0 0 60px rgba(239, 68, 68, 0.1)',
                      }}
                    >
                      <XCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </>
                )}
              </motion.div>

              {/* Result title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                {passed ? (
                  <GlitchText
                    color="#22c55e"
                    className="text-3xl sm:text-4xl font-black tracking-[0.2em]"
                  >
                    MISSION COMPLETE!
                  </GlitchText>
                ) : (
                  <GlitchText
                    color="#ef4444"
                    className="text-3xl sm:text-4xl font-black tracking-[0.2em]"
                  >
                    MISSION FAILED
                  </GlitchText>
                )}
                <p
                  className="mt-2 text-xs font-mono tracking-widest uppercase"
                  style={{ color: `${passed ? '#22c55e' : '#ef4444'}80` }}
                >
                  {passed ? '// TRANSMISSION VERIFIED — CLEARANCE GRANTED' : '// TRANSMISSION CORRUPTED — RETRY REQUIRED'}
                </p>
              </motion.div>

              {/* Score display - terminal style */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-xs"
              >
                <div
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: `1px solid ${passed ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    boxShadow: `inset 0 0 30px rgba(0,0,0,0.3)`,
                  }}
                >
                  <p
                    className="text-[10px] font-mono tracking-widest mb-3 uppercase"
                    style={{ color: `${passed ? '#22c55e' : '#ef4444'}60` }}
                  >
                    ▸ Signal Integrity Report ◂
                  </p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span
                      className="text-5xl sm:text-6xl font-black"
                      style={{
                        fontFamily: "var(--font-orbitron), sans-serif",
                        color: passed ? '#22c55e' : '#ef4444',
                        textShadow: `0 0 15px ${passed ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}, 0 0 30px ${passed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}
                    >
                      <AnimatedCounter target={score} duration={1200} />
                    </span>
                    <span className="text-xl text-slate-500 font-bold">/</span>
                    <span className="text-xl text-slate-500 font-bold">{totalQuestions}</span>
                  </div>
                  <p className="text-slate-500 mt-1 text-xs font-mono tracking-widest uppercase">Packets Received</p>
                  <div
                    className="mt-3 text-3xl font-black"
                    style={{
                      fontFamily: "var(--font-orbitron), sans-serif",
                      color: passed ? '#22c55e' : '#ef4444',
                      textShadow: `0 0 10px ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                    }}
                  >
                    <AnimatedCounter target={percentage} duration={1500} />%
                  </div>
                </div>
              </motion.div>

              {/* Badge / Achievement */}
              <AnimatePresence>
                {passed && badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <p
                      className="text-[10px] font-mono tracking-[0.3em] uppercase"
                      style={{ color: `${badge.color}90` }}
                    >
                      ▸ Achievement Decoded ◂
                    </p>
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 20px ${badge.color}30`,
                          `0 0 40px ${badge.color}50`,
                          `0 0 20px ${badge.color}30`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Badge
                        className="text-lg px-5 py-2.5 gap-3 font-bold tracking-wider"
                        style={{
                          fontFamily: "var(--font-orbitron), sans-serif",
                          background: `linear-gradient(135deg, ${badge.color}08, ${badge.color}15)`,
                          border: `1px solid ${badge.color}60`,
                          color: badge.color,
                          textShadow: `0 0 10px ${badge.color}80`,
                        }}
                      >
                        <HologramLetter
                          letter={badge.icon.replace(/[\[\]]/g, '')}
                          color={badge.color}
                          size="sm"
                        />
                        {badge.name}
                      </Badge>
                    </motion.div>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 1.3 + i * 0.1, type: 'spring', stiffness: 200 }}
                        >
                          <Star
                            className="w-5 h-5"
                            fill={percentage === 100 ? '#fbbf24' : i < Math.ceil(percentage / 20) ? '#fbbf24' : 'transparent'}
                            stroke="#fbbf24"
                            style={{
                              filter: i < Math.ceil(percentage / 20) ? 'drop-shadow(0 0 4px rgba(251,191,36,0.6))' : 'none',
                            }}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: passed ? 1.5 : 0.8 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
              >
                <Button
                  onClick={handleRetry}
                  className="flex-1 gap-2 font-bold tracking-[0.15em] text-sm"
                  style={{
                    fontFamily: "var(--font-orbitron), sans-serif",
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(10,15,30,0.8))',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    color: '#94a3b8',
                  }}
                  onMouseEnter={(e) => {
                    if (soundEnabled) soundEngine.playHover();
                    e.currentTarget.style.borderColor = '#22d3ee';
                    e.currentTarget.style.color = '#22d3ee';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(34,211,238,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  REINITIALIZE
                </Button>
                <Button
                  onClick={handleReturnToDashboard}
                  className="flex-1 gap-2 font-bold tracking-[0.15em] text-sm"
                  style={{
                    fontFamily: "var(--font-orbitron), sans-serif",
                    background: `linear-gradient(135deg, ${missionColor}10, ${missionColor}20)`,
                    border: `1px solid ${missionColor}40`,
                    color: missionColor,
                    boxShadow: `0 0 15px ${missionColor}15`,
                  }}
                  onMouseEnter={(e) => {
                    if (soundEnabled) soundEngine.playHover();
                    e.currentTarget.style.borderColor = missionColor;
                    e.currentTarget.style.boxShadow = `0 0 25px ${missionColor}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${missionColor}40`;
                    e.currentTarget.style.boxShadow = `0 0 15px ${missionColor}15`;
                  }}
                >
                  RETURN TO BRIDGE
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Quiz Question Screen ────────────────────────────────────────────
  const currentQ = questions[currentQuestion];

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-6">
      <style>{`
        @keyframes quiz-glitch-top {
          0%, 92%, 100% { transform: translate(0); }
          93% { transform: translate(-2px, -1px); }
          95% { transform: translate(2px, 1px); }
          97% { transform: translate(-1px, 0); }
          99% { transform: translate(1px, -1px); }
        }
        @keyframes quiz-glitch-bottom {
          0%, 90%, 100% { transform: translate(0); }
          91% { transform: translate(1px, 1px); }
          94% { transform: translate(-2px, 0); }
          96% { transform: translate(2px, -1px); }
          98% { transform: translate(-1px, 1px); }
        }
        @keyframes decoding-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes energy-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes hex-glow {
          0%, 100% { text-shadow: 0 0 4px ${missionColor}40; }
          50% { text-shadow: 0 0 8px ${missionColor}80, 0 0 12px ${missionColor}40; }
        }
        @keyframes scan-line-move {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
      `}</style>

      {/* ─── Progress Bar - Sci-fi Energy Cell ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3 h-3" style={{ color: `${missionColor}80` }} />
            <span
              className="text-[10px] font-mono tracking-[0.2em] uppercase"
              style={{ color: `${missionColor}70` }}
            >
              Signal {currentQuestion + 1} of {totalQuestions}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" style={{ color: `${missionColor}60` }} />
            <span
              className="text-[10px] font-mono tracking-[0.2em] uppercase"
              style={{ color: `${missionColor}70` }}
            >
              Integrity: {score}/{currentQuestion}
            </span>
          </div>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden relative"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: `1px solid ${missionColor}20`,
            boxShadow: `inset 0 0 8px rgba(0,0,0,0.5)`,
          }}
        >
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: `linear-gradient(90deg, ${missionColor}40, ${missionColor})`,
              boxShadow: `0 0 10px ${missionColor}60, 0 0 20px ${missionColor}30`,
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${progressValue}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Energy pulse */}
            <div
              className="absolute right-0 top-0 bottom-0 w-3"
              style={{
                background: `${missionColor}`,
                boxShadow: `0 0 8px ${missionColor}, 0 0 16px ${missionColor}80`,
                animation: 'energy-pulse 1s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Question Card ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -80, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(5,11,24,0.92), rgba(10,15,30,0.88))',
              border: `1px solid ${missionColor}20`,
              boxShadow: `0 0 30px rgba(0,0,0,0.5), 0 0 60px ${missionColor}06`,
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Scanning beam */}
            <ScanningBeam color={missionColor} />

            {/* Hologram grid */}
            <HologramGrid color={missionColor} />

            {/* Data stream particles */}
            <DataStream color={missionColor} />

            {/* Top accent line */}
            <div
              className="h-[2px] w-full relative z-[5]"
              style={{
                background: `linear-gradient(90deg, transparent, ${missionColor}80, transparent)`,
                boxShadow: `0 0 10px ${missionColor}40`,
              }}
            />

            <div className="relative z-[5] p-6 sm:p-8">
              {/* ─── Question Header ─── */}
              <div className="flex items-center gap-3 mb-5">
                <HologramLetter
                  letter={missionId[0].toUpperCase()}
                  color={missionColor}
                  size="md"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3.5 h-3.5" style={{ color: `${missionColor}80` }} />
                    <span
                      className="text-[10px] font-mono tracking-[0.25em] uppercase"
                      style={{ color: `${missionColor}70` }}
                    >
                      Incoming Transmission
                    </span>
                  </div>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${missionColor}40, ${missionColor}10, transparent)` }} />
                </div>
                <div
                  className="px-3 py-1 rounded-md text-xs font-mono font-black"
                  style={{
                    fontFamily: "var(--font-orbitron), sans-serif",
                    background: `${missionColor}10`,
                    border: `1px solid ${missionColor}30`,
                    color: missionColor,
                    textShadow: `0 0 6px ${missionColor}60`,
                    boxShadow: `0 0 10px ${missionColor}15`,
                  }}
                >
                  {String(currentQuestion + 1).padStart(2, '0')}/{String(totalQuestions).padStart(2, '0')}
                </div>
              </div>

              {/* ─── Question Text ─── */}
              <div className="mb-8 min-h-[60px]">
                {decodingText ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2"
                  >
                    <span
                      className="text-sm font-mono tracking-widest"
                      style={{ color: `${missionColor}60` }}
                    >
                      DECODING TRANSMISSION
                    </span>
                    <span
                      className="text-sm font-mono"
                      style={{
                        color: missionColor,
                        animation: 'decoding-cursor 0.5s steps(2) infinite',
                      }}
                    >
                      █
                    </span>
                  </motion.div>
                ) : (
                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg sm:text-xl font-bold leading-relaxed"
                    style={{
                      color: '#e2e8f0',
                      textShadow: '0 0 20px rgba(226,232,240,0.1)',
                    }}
                  >
                    {currentQ.question}
                  </motion.h3>
                )}
              </div>

              {/* ─── Options ─── */}
              <div className="grid gap-2.5">
                {currentQ.options.map((option, index) => {
                  const accentColor = getAccentColor(index);
                  const isSelected = selectedAnswer !== null;
                  const isCorrectOption = index === questions[currentQuestion].correct;
                  const isWrongOption = index === selectedAnswer && !isCorrect;
                  const isDimmed = isSelected && index !== questions[currentQuestion].correct && index !== selectedAnswer;

                  return (
                    <motion.div
                      key={`${currentQuestion}-${index}`}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: questionRevealed ? 0.05 + index * 0.08 : 0.7 + index * 0.08, duration: 0.3 }}
                      whileHover={
                        selectedAnswer === null
                          ? { scale: 1.02 }
                          : {}
                      }
                      whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                      onMouseEnter={() => {
                        if (selectedAnswer === null && soundEnabled) soundEngine.playHover();
                      }}
                    >
                      <div
                        className="relative rounded-lg overflow-hidden transition-all duration-300"
                        style={getOptionStyle(index)}
                        onClick={() => handleAnswer(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleAnswer(index);
                          }
                        }}
                        aria-label={`Option ${alphaLabels[index]}: ${option}`}
                      >
                        {/* Left accent stripe */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-300"
                          style={{
                            background: accentColor,
                            boxShadow: selectedAnswer === null
                              ? `0 0 8px ${missionColor}40`
                              : isCorrectOption
                                ? '0 0 8px rgba(34,197,94,0.4)'
                                : isWrongOption
                                  ? '0 0 8px rgba(239,68,68,0.4)'
                                  : 'none',
                          }}
                        />

                        <div className="flex items-center gap-4 px-4 py-3.5 sm:py-4">
                          {/* Letter badge */}
                          <div
                            className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center text-sm font-black transition-all duration-300"
                            style={{
                              fontFamily: "var(--font-orbitron), sans-serif",
                              background: selectedAnswer === null
                                ? `${missionColor}12`
                                : isCorrectOption
                                  ? 'rgba(34,197,94,0.12)'
                                  : isWrongOption
                                    ? 'rgba(239,68,68,0.12)'
                                    : 'rgba(100,116,139,0.05)',
                              border: selectedAnswer === null
                                ? `1px solid ${missionColor}25`
                                : isCorrectOption
                                  ? '1px solid rgba(34,197,94,0.4)'
                                  : isWrongOption
                                    ? '1px solid rgba(239,68,68,0.4)'
                                    : '1px solid transparent',
                              color: selectedAnswer === null
                                ? missionColor
                                : isCorrectOption
                                  ? '#4ade80'
                                  : isWrongOption
                                    ? '#f87171'
                                    : '#475569',
                              textShadow: selectedAnswer === null
                                ? `0 0 8px ${missionColor}50`
                                : isCorrectOption
                                  ? '0 0 8px rgba(74,222,128,0.4)'
                                  : isWrongOption
                                    ? '0 0 8px rgba(248,113,113,0.4)'
                                    : 'none',
                            }}
                          >
                            {alphaLabels[index]}
                          </div>

                          {/* Option text */}
                          <span
                            className="text-sm sm:text-[15px] font-medium leading-relaxed flex-1"
                            style={{
                              color: selectedAnswer === null
                                ? '#cbd5e1'
                                : isCorrectOption
                                  ? '#4ade80'
                                  : isWrongOption
                                    ? '#f87171'
                                    : isDimmed
                                      ? '#1e293b'
                                      : '#475569',
                            }}
                          >
                            {option}
                          </span>

                          {/* Right status icon */}
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', stiffness: 250, damping: 15 }}
                              className="shrink-0"
                            >
                              {isCorrectOption && (
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center"
                                  style={{
                                    background: 'rgba(34,197,94,0.15)',
                                    border: '1px solid rgba(34,197,94,0.4)',
                                    boxShadow: '0 0 10px rgba(34,197,94,0.2)',
                                  }}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                                </div>
                              )}
                              {isWrongOption && (
                                <div
                                  className="w-7 h-7 rounded-full flex items-center justify-center"
                                  style={{
                                    background: 'rgba(239,68,68,0.15)',
                                    border: '1px solid rgba(239,68,68,0.4)',
                                    boxShadow: '0 0 10px rgba(239,68,68,0.2)',
                                  }}
                                >
                                  <XCircle className="w-4 h-4 text-red-400" />
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Hover glow line at bottom */}
                        {selectedAnswer === null && (
                          <div
                            className="absolute bottom-0 left-0 right-0 h-[1px] opacity-0 hover:opacity-100 transition-opacity duration-300"
                            style={{
                              background: `linear-gradient(90deg, transparent, ${missionColor}30, transparent)`,
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* ─── Feedback Text ─── */}
              <AnimatePresence>
                {selectedAnswer !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 text-center"
                  >
                    {isCorrect ? (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg"
                        style={{
                          background: 'rgba(34,197,94,0.08)',
                          border: '1px solid rgba(34,197,94,0.3)',
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span
                          className="text-base font-black tracking-[0.2em]"
                          style={{
                            fontFamily: "var(--font-orbitron), sans-serif",
                            color: '#4ade80',
                            textShadow: '0 0 15px rgba(74,222,128,0.5), 0 0 30px rgba(74,222,128,0.2)',
                          }}
                        >
                          SIGNAL VERIFIED
                        </span>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.4 }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg"
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span
                          className="text-base font-black tracking-[0.2em]"
                          style={{
                            fontFamily: "var(--font-orbitron), sans-serif",
                            color: '#f87171',
                            textShadow: '0 0 15px rgba(248,113,113,0.5), 0 0 30px rgba(248,113,113,0.2)',
                          }}
                        >
                          SIGNAL CORRUPTED
                        </span>
                        <XCircle className="w-4 h-4 text-red-400" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom accent line */}
            <div
              className="h-[1px] w-full relative z-[5]"
              style={{
                background: `linear-gradient(90deg, transparent, ${missionColor}30, transparent)`,
              }}
            />

            {/* Corner decorations */}
            <div
              className="absolute top-0 left-0 w-6 h-6 z-[5]"
              style={{
                borderTop: `2px solid ${missionColor}50`,
                borderLeft: `2px solid ${missionColor}50`,
                borderTopLeftRadius: '16px',
              }}
            />
            <div
              className="absolute top-0 right-0 w-6 h-6 z-[5]"
              style={{
                borderTop: `2px solid ${missionColor}50`,
                borderRight: `2px solid ${missionColor}50`,
                borderTopRightRadius: '16px',
              }}
            />
            <div
              className="absolute bottom-0 left-0 w-6 h-6 z-[5]"
              style={{
                borderBottom: `2px solid ${missionColor}50`,
                borderLeft: `2px solid ${missionColor}50`,
                borderBottomLeftRadius: '16px',
              }}
            />
            <div
              className="absolute bottom-0 right-0 w-6 h-6 z-[5]"
              style={{
                borderBottom: `2px solid ${missionColor}50`,
                borderRight: `2px solid ${missionColor}50`,
                borderBottomRightRadius: '16px',
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Decorative scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
    </div>
  );
}
