'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { missions } from '@/lib/missionData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, LogOut, Rocket, Trophy } from 'lucide-react';

// Planet image mapping for each mission
const PLANET_IMAGES: Record<string, string> = {
  collatz: '/planets/planet-collatz.png',
  fibonacci: '/planets/planet-fibonacci.png',
  tribonacci: '/planets/planet-tribonacci.png',
  lucas: '/planets/planet-lucas.png',
  euclidean: '/planets/planet-euclidean.png',
  division: '/planets/planet-division.png',
};

// Color mapping for neon glow effects
const COLOR_MAP: Record<string, { hex: string; tailwind: string; bg: string; border: string; shadow: string }> = {
  cyan: {
    hex: '#00ffff',
    tailwind: 'text-cyan-400',
    bg: 'rgba(0, 255, 255, 0.08)',
    border: 'rgba(0, 255, 255, 0.25)',
    shadow: '0 0 15px rgba(0,255,255,0.3), 0 0 30px rgba(0,255,255,0.1)',
  },
  amber: {
    hex: '#fbbf24',
    tailwind: 'text-amber-400',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.25)',
    shadow: '0 0 15px rgba(251,191,36,0.3), 0 0 30px rgba(251,191,36,0.1)',
  },
  purple: {
    hex: '#a855f7',
    tailwind: 'text-purple-400',
    bg: 'rgba(168, 85, 247, 0.08)',
    border: 'rgba(168, 85, 247, 0.25)',
    shadow: '0 0 15px rgba(168,85,247,0.3), 0 0 30px rgba(168,85,247,0.1)',
  },
  emerald: {
    hex: '#34d399',
    tailwind: 'text-emerald-400',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.25)',
    shadow: '0 0 15px rgba(52,211,153,0.3), 0 0 30px rgba(52,211,153,0.1)',
  },
  rose: {
    hex: '#fb7185',
    tailwind: 'text-rose-400',
    bg: 'rgba(251, 113, 133, 0.08)',
    border: 'rgba(251, 113, 133, 0.25)',
    shadow: '0 0 15px rgba(251,113,133,0.3), 0 0 30px rgba(251,113,133,0.1)',
  },
  sky: {
    hex: '#38bdf8',
    tailwind: 'text-sky-400',
    bg: 'rgba(56, 189, 248, 0.08)',
    border: 'rgba(56, 189, 248, 0.25)',
    shadow: '0 0 15px rgba(56,189,248,0.3), 0 0 30px rgba(56,189,248,0.1)',
  },
};

const TOTAL_SECTIONS = 8;

// Staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

export function Dashboard() {
  const username = useAppStore((s) => s.username);
  const progress = useAppStore((s) => s.progress);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const setLoading = useAppStore((s) => s.setLoading);
  const logout = useAppStore((s) => s.logout);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);

  // Get mission progress helper
  const getMissionProgress = (missionId: string) => {
    return progress?.missions.find((m) => m.id === missionId);
  };

  // Calculate progress percentage
  const getProgressPercent = (missionId: string) => {
    const mp = getMissionProgress(missionId);
    if (!mp) return 0;
    const sectionPercent = (mp.sectionsViewed.length / TOTAL_SECTIONS) * 80; // sections = 80%
    const quizPercent = mp.quizPassed ? 20 : 0; // quiz = 20%
    return Math.min(100, Math.round(sectionPercent + quizPercent));
  };

  // Handle launch mission
  const handleLaunchMission = (missionId: string) => {
    soundEngine.click();
    setLoading('mission', missionId);
  };

  // Handle sound toggle
  const handleSoundToggle = () => {
    soundEngine.click();
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    soundEngine.setMuted(!newState);
  };

  // Handle logout
  const handleLogout = () => {
    soundEngine.click();
    logout();
  };

  // Get unlocked achievements
  const unlockedAchievements = progress?.achievements.filter((a) => a.unlockedAt) ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Subtle cosmic background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 20%, rgba(0,255,255,0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.04) 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(10,10,40,1) 0%, rgba(0,0,0,1) 100%)',
          zIndex: 0,
        }}
      />

      {/* Starfield dots via CSS */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 0.5}px`,
              height: `${Math.random() * 2 + 0.5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `twinkle ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Scan line overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.008) 2px, rgba(0,255,255,0.008) 4px)',
          zIndex: 1,
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full border-b"
          style={{
            background: 'rgba(5, 5, 25, 0.85)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(0, 255, 255, 0.15)',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-3 shrink-0">
              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#00ffff' }} />
              <h1
                className="text-sm sm:text-lg lg:text-xl font-bold tracking-[0.2em] sm:tracking-[0.3em]"
                style={{
                  color: '#00ffff',
                  textShadow:
                    '0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.4), 0 0 40px rgba(0,255,255,0.2)',
                }}
              >
                MISSION CONTROL
              </h1>
            </div>

            {/* Center: Welcome message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="hidden sm:block text-center"
            >
              <p
                className="text-sm lg:text-base font-medium tracking-wider"
                style={{ color: 'rgba(255, 255, 255, 0.8)' }}
              >
                Commander{' '}
                <span
                  style={{
                    color: '#00ffff',
                    textShadow: '0 0 8px rgba(0,255,255,0.5)',
                  }}
                >
                  {username}
                </span>
              </p>
            </motion.div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Mobile welcome */}
              <span
                className="sm:hidden text-xs font-medium"
                style={{ color: 'rgba(255,255,255,0.6)' }}
              >
                Cdr.{' '}
                <span style={{ color: '#00ffff' }}>
                  {username}
                </span>
              </span>

              {/* Sound toggle */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSoundToggle}
                  className="h-9 w-9 rounded-lg"
                  style={{
                    background: soundEnabled
                      ? 'rgba(0, 255, 255, 0.1)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${soundEnabled ? 'rgba(0, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: soundEnabled ? '#00ffff' : 'rgba(255,255,255,0.4)',
                  }}
                  aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </motion.div>

              {/* Logout button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="h-9 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold tracking-wider"
                  style={{
                    background: 'rgba(255, 50, 50, 0.08)',
                    border: '1px solid rgba(255, 50, 50, 0.3)',
                    color: '#ff6b6b',
                  }}
                >
                  <LogOut className="h-3.5 w-3.5 sm:mr-2" />
                  <span className="hidden sm:inline">EXIT MISSION</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Main content area */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
          {/* Section title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Available Missions
            </h2>
            <div
              className="mt-2 h-px w-48"
              style={{
                background:
                  'linear-gradient(90deg, rgba(0,255,255,0.5), rgba(168,85,247,0.3), transparent)',
              }}
            />
          </motion.div>

          {/* Mission cards grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {missions.map((mission) => {
              const colors = COLOR_MAP[mission.color] || COLOR_MAP.cyan;
              const mp = getMissionProgress(mission.id);
              const progressPercent = getProgressPercent(mission.id);
              const isCompleted = mp?.completed ?? false;
              const quizPassed = mp?.quizPassed ?? false;
              const sectionsCount = mp?.sectionsViewed.length ?? 0;

              return (
                <motion.div
                  key={mission.id}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    transition: { duration: 0.25 },
                  }}
                  className="group"
                >
                  <Card
                    className="relative overflow-hidden rounded-xl border-0 p-0 cursor-pointer transition-shadow duration-300"
                    style={{
                      background: 'rgba(8, 8, 35, 0.75)',
                      backdropFilter: 'blur(16px)',
                      border: `1px solid ${colors.border}`,
                      boxShadow: colors.shadow,
                    }}
                  >
                    {/* Holographic top accent line */}
                    <div
                      className="h-[2px] w-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${colors.hex}, transparent)`,
                      }}
                    />

                    {/* Planet image - decorative background element */}
                    {PLANET_IMAGES[mission.id] && (
                      <div
                        className="absolute right-[-20px] top-1/2 translate-y-[-45%] z-0 pointer-events-none"
                        style={{
                          width: '140px',
                          height: '140px',
                        }}
                      >
                        <Image
                          src={PLANET_IMAGES[mission.id]}
                          alt={`${mission.title} planet`}
                          width={140}
                          height={140}
                          className="object-contain opacity-35 group-hover:opacity-55 transition-opacity duration-500"
                          style={{
                            filter: `drop-shadow(0 0 12px ${colors.hex}60) drop-shadow(0 0 24px ${colors.hex}30)`,
                            mixBlendMode: 'screen',
                          }}
                        />
                      </div>
                    )}

                    <div className="relative z-10 p-5 sm:p-6">
                      {/* Mission icon + title row */}
                      <div className="flex items-start gap-3 mb-3">
                        <span
                          className="text-3xl sm:text-4xl flex-shrink-0 mt-0.5"
                          role="img"
                          aria-label={mission.title}
                        >
                          {mission.icon}
                        </span>
                        <div className="min-w-0">
                          <h3
                            className="text-base sm:text-lg font-bold tracking-wide leading-tight"
                            style={{
                              color: colors.hex,
                              textShadow: `0 0 8px ${colors.hex}80, 0 0 16px ${colors.hex}40`,
                            }}
                          >
                            {mission.title}
                          </h3>
                          <p
                            className="text-xs font-medium tracking-wider mt-0.5"
                            style={{ color: `${colors.hex}99` }}
                          >
                            {mission.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Description (2 lines max) */}
                      <p
                        className="text-xs sm:text-sm leading-relaxed mb-4"
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {mission.description}
                      </p>

                      {/* Progress section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className="text-[10px] sm:text-xs font-medium tracking-wider uppercase"
                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            Mission Progress
                          </span>
                          <div className="flex items-center gap-2">
                            {quizPassed && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 border-0 font-semibold"
                                style={{
                                  background: `${colors.hex}20`,
                                  color: colors.hex,
                                }}
                              >
                                QUIZ PASSED
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 h-4 border-0 font-semibold"
                                style={{
                                  background: 'rgba(52, 211, 153, 0.2)',
                                  color: '#34d399',
                                }}
                              >
                                COMPLETE
                              </Badge>
                            )}
                            <span
                              className="text-[10px] sm:text-xs font-mono font-bold"
                              style={{ color: colors.hex }}
                            >
                              {progressPercent}%
                            </span>
                          </div>
                        </div>
                        <div className="relative">
                          <Progress
                            value={progressPercent}
                            className="h-1.5 sm:h-2 rounded-full"
                            style={{
                              background: `${colors.hex}15`,
                            }}
                          />
                          {/* Custom indicator color override */}
                          <style>{`
                            [data-mission-progress="${mission.id}"] > [data-slot="progress-indicator"] {
                              background: ${colors.hex} !important;
                              box-shadow: 0 0 6px ${colors.hex}60;
                            }
                          `}</style>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span
                            className="text-[9px] sm:text-[10px] tracking-wider"
                            style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                          >
                            {sectionsCount}/{TOTAL_SECTIONS} sections
                          </span>
                          {mp?.quizScore !== null && mp?.quizScore !== undefined && (
                            <span
                              className="text-[9px] sm:text-[10px] tracking-wider"
                              style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                            >
                              Score: {mp.quizScore}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Launch button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <Button
                          onClick={() => handleLaunchMission(mission.id)}
                          className="w-full h-9 sm:h-10 rounded-lg text-xs sm:text-sm font-bold tracking-[0.15em] uppercase border-0 transition-all duration-300"
                          style={{
                            background: `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}25)`,
                            color: colors.hex,
                            border: `1px solid ${colors.border}`,
                            boxShadow: `0 0 10px ${colors.hex}20, inset 0 0 10px ${colors.hex}08`,
                          }}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = `0 0 20px ${colors.hex}40, 0 0 40px ${colors.hex}15, inset 0 0 15px ${colors.hex}10`;
                            el.style.background = `linear-gradient(135deg, ${colors.hex}20, ${colors.hex}35)`;
                          }}
                          onMouseLeave={(e) => {
                            const el = e.currentTarget;
                            el.style.boxShadow = `0 0 10px ${colors.hex}20, inset 0 0 10px ${colors.hex}08`;
                            el.style.background = `linear-gradient(135deg, ${colors.hex}15, ${colors.hex}25)`;
                          }}
                        >
                          <Rocket className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                          LAUNCH MISSION
                        </Button>
                      </motion.div>
                    </div>

                    {/* Holographic corner accents */}
                    <div
                      className="absolute top-0 left-0 w-5 h-5"
                      style={{
                        borderTop: `1px solid ${colors.hex}50`,
                        borderLeft: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute top-0 right-0 w-5 h-5"
                      style={{
                        borderTop: `1px solid ${colors.hex}50`,
                        borderRight: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 left-0 w-5 h-5"
                      style={{
                        borderBottom: `1px solid ${colors.hex}50`,
                        borderLeft: `1px solid ${colors.hex}50`,
                      }}
                    />
                    <div
                      className="absolute bottom-0 right-0 w-5 h-5"
                      style={{
                        borderBottom: `1px solid ${colors.hex}50`,
                        borderRight: `1px solid ${colors.hex}50`,
                      }}
                    />

                    {/* Ambient glow on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse at center, ${colors.hex}08, transparent 70%)`,
                      }}
                    />
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Achievements section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="mt-10 sm:mt-14"
          >
            <div className="flex items-center gap-3 mb-5">
              <Trophy className="w-5 h-5" style={{ color: '#fbbf24' }} />
              <h2
                className="text-lg sm:text-xl font-bold tracking-wider uppercase"
                style={{ color: 'rgba(255, 255, 255, 0.9)' }}
              >
                Achievements
              </h2>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(251,191,36,0.4), rgba(168,85,247,0.2), transparent)',
                }}
              />
              <Badge
                variant="outline"
                className="text-[10px] px-2 py-0.5 border-0 font-mono"
                style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.2)',
                }}
              >
                {unlockedAchievements.length} / {progress?.achievements.length ?? 8}
              </Badge>
            </div>

            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {unlockedAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      className="rounded-lg border-0 p-4 relative overflow-hidden"
                      style={{
                        background: 'rgba(15, 15, 45, 0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(251, 191, 36, 0.2)',
                        boxShadow: '0 0 10px rgba(251, 191, 36, 0.1)',
                      }}
                    >
                      {/* Gold accent line */}
                      <div
                        className="absolute top-0 left-0 right-0 h-[2px]"
                        style={{
                          background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
                        }}
                      />

                      <div className="flex items-center gap-3">
                        <span className="text-2xl" role="img" aria-label={achievement.name}>
                          {achievement.icon}
                        </span>
                        <div className="min-w-0">
                          <p
                            className="text-sm font-bold tracking-wide truncate"
                            style={{
                              color: '#fbbf24',
                              textShadow: '0 0 6px rgba(251, 191, 36, 0.4)',
                            }}
                          >
                            {achievement.name}
                          </p>
                          <p
                            className="text-[10px] sm:text-xs mt-0.5 leading-snug"
                            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
                          >
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card
                className="rounded-lg border-0 p-6 sm:p-8 text-center"
                style={{
                  background: 'rgba(10, 10, 35, 0.5)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                }}
              >
                <Trophy
                  className="w-8 h-8 mx-auto mb-3"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                />
                <p
                  className="text-sm font-medium tracking-wider"
                  style={{ color: 'rgba(255, 255, 255, 0.35)' }}
                >
                  No achievements unlocked yet
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'rgba(255, 255, 255, 0.2)' }}
                >
                  Complete missions and pass quizzes to earn achievements
                </p>
              </Card>
            )}
          </motion.section>
        </main>

        {/* Footer */}
        <footer
          className="mt-auto border-t py-4 text-center"
          style={{
            background: 'rgba(5, 5, 25, 0.6)',
            borderColor: 'rgba(0, 255, 255, 0.08)',
          }}
        >
          <p
            className="text-[10px] sm:text-xs tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255, 255, 255, 0.2)' }}
          >
            Mathematical Mission Control v1.0 — All Systems Operational
          </p>
        </footer>
      </div>
    </div>
  );
}
