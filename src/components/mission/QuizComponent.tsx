'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Trophy, RotateCcw, Star } from 'lucide-react';
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

// Celebration particles for mission complete
function CelebrationParticles({ color }: { color: string }) {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: Math.random() * 6 + 3,
    angle: Math.random() * 360,
    distance: 60 + Math.random() * 140,
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
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
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

// Animated counter for score reveal
function AnimatedCounter({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
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

export default function QuizComponent({ missionId, questions, missionColor }: QuizProps) {
  const { updateProgress, setPage, soundEnabled } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answersLocked, setAnswersLocked] = useState(false);

  const totalQuestions = questions.length;
  const progressValue = ((currentQuestion) / totalQuestions) * 100;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= 70;
  const badge = badgeMap[missionId];

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

      // Auto-advance after 1.5s
      setTimeout(() => {
        if (currentQuestion + 1 < totalQuestions) {
          setCurrentQuestion((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setAnswersLocked(false);
        } else {
          // Calculate final score and show results
          const finalScore = correctAnswer ? score + 1 : score;
          const finalPercentage = Math.round((finalScore / totalQuestions) * 100);
          const finalPassed = finalPercentage >= 70;

          if (finalPassed && soundEnabled) {
            // Delay achievement sound slightly for dramatic effect
            setTimeout(() => soundEngine.achievement(), 300);
          }

          setShowResults(true);
          if (finalPassed) {
            setTimeout(() => setShowCelebration(true), 400);
          }

          // Update progress
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
  }, [soundEnabled]);

  const handleReturnToDashboard = useCallback(() => {
    if (soundEnabled) soundEngine.playClick();
    setPage('dashboard');
  }, [soundEnabled, setPage]);

  const getOptionStyle = (index: number) => {
    const correctIndex = questions[currentQuestion].correct;

    if (selectedAnswer === null) {
      // No answer selected yet - hover ready state
      return {
        background: 'rgba(15, 23, 42, 0.6)',
        border: `1px solid rgba(148, 163, 184, 0.2)`,
        cursor: 'pointer' as const,
      };
    }

    if (index === correctIndex) {
      // Correct answer - always highlight green when answer is shown
      return {
        background: 'rgba(34, 197, 94, 0.15)',
        border: '1px solid rgba(34, 197, 94, 0.7)',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.3), inset 0 0 20px rgba(34, 197, 94, 0.1)',
        cursor: 'default' as const,
      };
    }

    if (index === selectedAnswer && !isCorrect) {
      // Wrong answer selected - highlight red
      return {
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.7)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1)',
        cursor: 'default' as const,
      };
    }

    // Other unselected options - dimmed
    return {
      background: 'rgba(15, 23, 42, 0.3)',
      border: '1px solid rgba(148, 163, 184, 0.1)',
      cursor: 'default' as const,
      opacity: 0.5,
    };
  };

  const getOptionLabel = (index: number) => {
    if (selectedAnswer === null) return null;
    const correctIndex = questions[currentQuestion].correct;
    if (index === correctIndex) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute top-2 right-2"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </motion.div>
      );
    }
    if (index === selectedAnswer && !isCorrect) {
      return (
        <motion.div
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="absolute top-2 right-2"
        >
          <XCircle className="w-5 h-5 text-red-400" />
        </motion.div>
      );
    }
    return null;
  };

  // Results screen
  if (showResults) {
    return (
      <div className="relative w-full max-w-2xl mx-auto px-4 py-8">
        {showCelebration && badge && <CelebrationParticles color={badge.color} />}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card
            className="relative overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: `1px solid ${passed ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              boxShadow: passed
                ? '0 0 40px rgba(34, 197, 94, 0.15), 0 0 80px rgba(34, 197, 94, 0.05)'
                : '0 0 40px rgba(239, 68, 68, 0.15), 0 0 80px rgba(239, 68, 68, 0.05)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent className="p-8 flex flex-col items-center gap-6">
              {/* Result icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 0.2 }}
              >
                {passed ? (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(34, 197, 94, 0.15)',
                      border: '2px solid rgba(34, 197, 94, 0.5)',
                      boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    <Trophy className="w-10 h-10 text-green-400" />
                  </div>
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '2px solid rgba(239, 68, 68, 0.5)',
                      boxShadow: '0 0 30px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    <XCircle className="w-10 h-10 text-red-400" />
                  </div>
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
                  <h2
                    className="text-3xl sm:text-4xl font-black tracking-wider"
                    style={{
                      color: '#22c55e',
                      textShadow: '0 0 20px rgba(34, 197, 94, 0.6), 0 0 40px rgba(34, 197, 94, 0.3)',
                    }}
                  >
                    MISSION COMPLETE!
                  </h2>
                ) : (
                  <h2
                    className="text-3xl sm:text-4xl font-black tracking-wider"
                    style={{
                      color: '#ef4444',
                      textShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    MISSION FAILED
                  </h2>
                )}
              </motion.div>

              {/* Score display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <div className="flex items-baseline justify-center gap-2">
                  <span
                    className="text-5xl sm:text-6xl font-black"
                    style={{
                      color: passed ? '#22c55e' : '#ef4444',
                      textShadow: `0 0 15px ${passed ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
                    }}
                  >
                    <AnimatedCounter target={score} duration={1200} />
                  </span>
                  <span className="text-2xl text-slate-400 font-bold">/</span>
                  <span className="text-2xl text-slate-400 font-bold">{totalQuestions}</span>
                </div>
                <p className="text-slate-400 mt-2 text-sm font-mono tracking-wider uppercase">CORRECT</p>
                <div
                  className="mt-3 text-3xl font-black"
                  style={{
                    color: passed ? '#22c55e' : '#ef4444',
                    textShadow: `0 0 10px ${passed ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
                  }}
                >
                  <AnimatedCounter target={percentage} duration={1500} />%
                </div>
              </motion.div>

              {/* Badge / Achievement (only when passed) */}
              <AnimatePresence>
                {passed && badge && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -90 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12, delay: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <p className="text-xs font-mono tracking-widest uppercase text-cyan-400/70">
                      Achievement Unlocked
                    </p>
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 20px ${badge.color}40`,
                          `0 0 40px ${badge.color}60`,
                          `0 0 20px ${badge.color}40`,
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Badge
                        className="text-lg px-5 py-2.5 gap-2 font-bold"
                        style={{
                          background: `${badge.color}15`,
                          border: `1px solid ${badge.color}80`,
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
                  className="flex-1 gap-2 font-bold tracking-wider"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    color: '#94a3b8',
                  }}
                  onMouseEnter={(e) => {
                    if (soundEnabled) soundEngine.playHover();
                    e.currentTarget.style.borderColor = '#22d3ee';
                    e.currentTarget.style.color = '#22d3ee';
                    e.currentTarget.style.boxShadow = '0 0 15px rgba(34,211,238,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
                    e.currentTarget.style.color = '#94a3b8';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  RETRY
                </Button>
                <Button
                  onClick={handleReturnToDashboard}
                  className="flex-1 gap-2 font-bold tracking-wider"
                  style={{
                    background: `${missionColor}20`,
                    border: `1px solid ${missionColor}50`,
                    color: missionColor,
                  }}
                  onMouseEnter={(e) => {
                    if (soundEnabled) soundEngine.playHover();
                    e.currentTarget.style.borderColor = missionColor;
                    e.currentTarget.style.boxShadow = `0 0 15px ${missionColor}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${missionColor}50`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  RETURN TO DASHBOARD
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Quiz question screen
  const currentQ = questions[currentQuestion];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="relative w-full max-w-2xl mx-auto px-4 py-6">
      <style>{`
        @keyframes hologram-flicker {
          0% { opacity: 1; }
          25% { opacity: 0.3; }
          50% { opacity: 0.9; }
          75% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400/70">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-mono tracking-widest uppercase text-cyan-400/70">
            Score: {score}/{currentQuestion}
          </span>
        </div>
        <Progress
          value={progressValue}
          className="h-2"
          style={{
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        />
      </motion.div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 80, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -80, scale: 0.95 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Card
            className="overflow-hidden"
            style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              boxShadow: `0 0 30px rgba(15, 23, 42, 0.5), 0 0 60px ${missionColor}08`,
              backdropFilter: 'blur(20px)',
            }}
          >
            <CardContent className="p-6 sm:p-8">
              {/* Question number badge */}
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{
                    background: `${missionColor}20`,
                    border: `1px solid ${missionColor}50`,
                    color: missionColor,
                    boxShadow: `0 0 10px ${missionColor}30`,
                  }}
                >
                  {currentQuestion + 1}
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${missionColor}40, transparent)` }} />
              </div>

              {/* Question text */}
              <h3
                className="text-lg sm:text-xl font-bold mb-8 leading-relaxed"
                style={{ color: '#e2e8f0' }}
              >
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="grid gap-3">
                {currentQ.options.map((option, index) => (
                  <motion.div
                    key={`${currentQuestion}-${index}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.08, duration: 0.3 }}
                    whileHover={
                      selectedAnswer === null
                        ? {
                            scale: 1.05,
                            boxShadow: `0 0 25px ${missionColor}30`,
                          }
                        : {}
                    }
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                    onMouseEnter={() => {
                      if (selectedAnswer === null && soundEnabled) soundEngine.playHover();
                    }}
                  >
                    <div
                      className="relative rounded-xl p-4 transition-all duration-300"
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
                      aria-label={`Option ${optionLabels[index]}: ${option}`}
                    >
                      {/* Option label */}
                      <div className="flex items-start gap-3">
                        <span
                          className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center text-xs font-black mt-0.5"
                          style={{
                            background: selectedAnswer === null
                              ? `${missionColor}15`
                              : index === questions[currentQuestion].correct
                                ? 'rgba(34, 197, 94, 0.15)'
                                : index === selectedAnswer
                                  ? 'rgba(239, 68, 68, 0.15)'
                                  : 'rgba(100, 116, 139, 0.1)',
                            border: selectedAnswer === null
                              ? `1px solid ${missionColor}30`
                              : index === questions[currentQuestion].correct
                                ? '1px solid rgba(34, 197, 94, 0.4)'
                                : index === selectedAnswer
                                  ? '1px solid rgba(239, 68, 68, 0.4)'
                                  : '1px solid transparent',
                            color: selectedAnswer === null
                              ? missionColor
                              : index === questions[currentQuestion].correct
                                ? '#4ade80'
                                : index === selectedAnswer
                                  ? '#f87171'
                                  : '#64748b',
                          }}
                        >
                          {optionLabels[index]}
                        </span>
                        <span
                          className="text-sm sm:text-base font-medium leading-relaxed"
                          style={{
                            color: selectedAnswer === null
                              ? '#cbd5e1'
                              : index === questions[currentQuestion].correct
                                ? '#4ade80'
                                : index === selectedAnswer
                                  ? '#f87171'
                                  : '#64748b',
                          }}
                        >
                          {option}
                        </span>
                      </div>

                      {/* Correct/incorrect icon */}
                      {getOptionLabel(index)}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Feedback text */}
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
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.4 }}
                        className="text-lg font-black tracking-widest"
                        style={{
                          color: '#4ade80',
                          textShadow: '0 0 15px rgba(74, 222, 128, 0.5)',
                        }}
                      >
                        CORRECT!
                      </motion.p>
                    ) : (
                      <motion.p
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.1, 1] }}
                        transition={{ duration: 0.4 }}
                        className="text-lg font-black tracking-widest"
                        style={{
                          color: '#f87171',
                          textShadow: '0 0 15px rgba(248, 113, 113, 0.5)',
                        }}
                      >
                        INCORRECT
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Decorative scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }}
      />
    </div>
  );
}
