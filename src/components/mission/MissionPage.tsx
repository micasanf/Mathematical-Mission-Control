'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { soundEngine } from '@/lib/soundEngine';
import { missions, type MissionData } from '@/lib/missionData';
import {
  collatzSequence,
  collatzSteps,
  fibonacciSequence,
  fibonacciNth,
  tribonacciSequence,
  tribonacciNth,
  lucasSequence,
  lucasNth,
  euclideanAlgorithm,
  divisionAlgorithm,
} from '@/lib/mathAlgorithms';
import KaTeXFormula from './KaTeXFormula';
import QuizComponent from './QuizComponent';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

import {
  ArrowLeft,
  Rocket,
  Calculator,
  BookOpen,
  FlaskConical,
  BarChart3,
  Globe,
  History,
  HelpCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';

// ---- Color map for missions ----
const missionColors: Record<string, { primary: string; glow: string; bg: string; border: string }> = {
  cyan: { primary: '#22d3ee', glow: 'rgba(34,211,238,0.15)', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.3)' },
  amber: { primary: '#fbbf24', glow: 'rgba(251,191,36,0.15)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.3)' },
  purple: { primary: '#a78bfa', glow: 'rgba(167,139,250,0.15)', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.3)' },
  emerald: { primary: '#34d399', glow: 'rgba(52,211,153,0.15)', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.3)' },
  rose: { primary: '#fb7185', glow: 'rgba(251,113,133,0.15)', bg: 'rgba(251,113,133,0.08)', border: 'rgba(251,113,133,0.3)' },
  sky: { primary: '#38bdf8', glow: 'rgba(56,189,248,0.15)', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.3)' },
};

// ---- Tab definitions ----
const tabDefs = [
  { value: 'overview', label: 'Overview', icon: BookOpen },
  { value: 'formula', label: 'Formula', icon: Calculator },
  { value: 'example', label: 'Example', icon: Rocket },
  { value: 'simulator', label: 'Simulator', icon: FlaskConical },
  { value: 'visualization', label: 'Visualization', icon: BarChart3 },
  { value: 'applications', label: 'Applications', icon: Globe },
  { value: 'history', label: 'History', icon: History },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
];

// ---- Glassmorphism panel wrapper ----
function GlassPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-xl border bg-white/5 backdrop-blur-md p-6 ${className ?? ''}`}
      style={{
        borderColor: 'rgba(34,211,238,0.15)',
        boxShadow: '0 4px 30px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </div>
  );
}

// ---- Section animation wrapper ----
function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ---- Main MissionPage component ----
export default function MissionPage() {
  const { currentMissionId, setPage, updateProgress, soundEnabled, setSoundEnabled } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');

  // Simulator state
  const [simInput1, setSimInput1] = useState('');
  const [simInput2, setSimInput2] = useState('');
  const [simResult, setSimResult] = useState<React.ReactNode | null>(null);

  // Find current mission
  const mission = useMemo(
    () => missions.find(m => m.id === currentMissionId) ?? missions[0],
    [currentMissionId]
  );

  const colors = missionColors[mission.color] ?? missionColors.cyan;

  // Track section view
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    updateProgress(mission.id, { sectionViewed: tab });
    if (soundEnabled) soundEngine.click();
  };

  // ---- Simulator logic ----
  const handleCompute = () => {
    const id = mission.id;

    try {
      if (id === 'collatz') {
        const n = parseInt(simInput1);
        if (isNaN(n) || n < 1) {
          setSimResult(<span className="text-red-400">Please enter a positive integer.</span>);
          return;
        }
        const seq = collatzSequence(n);
        const steps = collatzSteps(n);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              Collatz Sequence from {n}
            </div>
            <div className="text-slate-300 font-mono text-sm break-all">
              {seq.join(' → ')}
            </div>
            <div className="text-sm text-slate-400">
              Total steps: <span className="text-white font-bold">{steps.length - 1}</span> | Peak value: <span className="text-white font-bold">{Math.max(...seq)}</span>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">Step</th>
                    <th className="text-left py-2 px-3 text-slate-400">Value</th>
                    <th className="text-left py-2 px-3 text-slate-400">Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((s, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-2 px-3 font-mono" style={{ color: colors.primary }}>{s.step}</td>
                      <td className="py-2 px-3 font-mono text-white">{s.value}</td>
                      <td className="py-2 px-3 text-slate-400 text-xs">{s.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (id === 'fibonacci') {
        const n = parseInt(simInput1);
        if (isNaN(n) || n < 1 || n > 50) {
          setSimResult(<span className="text-red-400">Enter a number between 1 and 50.</span>);
          return;
        }
        const seq = fibonacciSequence(n);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              First {n} Fibonacci Numbers
            </div>
            <div className="text-slate-300 font-mono text-sm">
              {seq.join(', ')}
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">Index</th>
                    <th className="text-left py-2 px-3 text-slate-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {seq.map((v, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-2 px-3 font-mono" style={{ color: colors.primary }}>F({i})</td>
                      <td className="py-2 px-3 font-mono text-white">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (id === 'tribonacci') {
        const n = parseInt(simInput1);
        if (isNaN(n) || n < 1 || n > 50) {
          setSimResult(<span className="text-red-400">Enter a number between 1 and 50.</span>);
          return;
        }
        const seq = tribonacciSequence(n);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              First {n} Tribonacci Numbers
            </div>
            <div className="text-slate-300 font-mono text-sm">
              {seq.join(', ')}
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">Index</th>
                    <th className="text-left py-2 px-3 text-slate-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {seq.map((v, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-2 px-3 font-mono" style={{ color: colors.primary }}>T({i})</td>
                      <td className="py-2 px-3 font-mono text-white">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (id === 'lucas') {
        const n = parseInt(simInput1);
        if (isNaN(n) || n < 1 || n > 50) {
          setSimResult(<span className="text-red-400">Enter a number between 1 and 50.</span>);
          return;
        }
        const seq = lucasSequence(n);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              First {n} Lucas Numbers
            </div>
            <div className="text-slate-300 font-mono text-sm">
              {seq.join(', ')}
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">Index</th>
                    <th className="text-left py-2 px-3 text-slate-400">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {seq.map((v, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-2 px-3 font-mono" style={{ color: colors.primary }}>L({i})</td>
                      <td className="py-2 px-3 font-mono text-white">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (id === 'euclidean') {
        const a = parseInt(simInput1);
        const b = parseInt(simInput2);
        if (isNaN(a) || isNaN(b) || a < 1 || b < 1) {
          setSimResult(<span className="text-red-400">Please enter two positive integers.</span>);
          return;
        }
        const result = euclideanAlgorithm(a, b);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              GCD({a}, {b}) = {result.gcd}
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-slate-400">a</th>
                    <th className="text-left py-2 px-3 text-slate-400">b</th>
                    <th className="text-left py-2 px-3 text-slate-400">Quotient</th>
                    <th className="text-left py-2 px-3 text-slate-400">Remainder</th>
                  </tr>
                </thead>
                <tbody>
                  {result.steps.map((s, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-2 px-3 font-mono text-white">{s.a}</td>
                      <td className="py-2 px-3 font-mono text-white">{s.b}</td>
                      <td className="py-2 px-3 font-mono" style={{ color: colors.primary }}>{s.quotient}</td>
                      <td className="py-2 px-3 font-mono text-slate-400">{s.remainder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      } else if (id === 'division') {
        const a = parseInt(simInput1);
        const b = parseInt(simInput2);
        if (isNaN(a) || isNaN(b) || b === 0) {
          setSimResult(<span className="text-red-400">Enter a valid dividend and a non-zero divisor.</span>);
          return;
        }
        const result = divisionAlgorithm(a, b);
        setSimResult(
          <div className="space-y-4">
            <div className="text-lg font-semibold" style={{ color: colors.primary }}>
              {a} = {b} × {result.quotient} + {result.remainder}
            </div>
            <div className="space-y-1">
              {result.steps.map((s, i) => (
                <div key={i} className="text-sm text-slate-300 py-1 border-b border-slate-800/50 font-mono">
                  {s}
                </div>
              ))}
            </div>
          </div>
        );
      }
    } catch {
      setSimResult(<span className="text-red-400">Computation error. Please check your inputs.</span>);
    }

    if (soundEnabled) soundEngine.success();
  };

  // ---- Visualization data ----
  const vizData = useMemo(() => {
    if (!mission) return [];

    const id = mission.id;
    if (id === 'collatz') {
      const seq = collatzSequence(27);
      return seq.map((v, i) => ({ step: i, value: v }));
    } else if (id === 'fibonacci') {
      const seq = fibonacciSequence(15);
      return seq.map((v, i) => ({ index: i, value: v }));
    } else if (id === 'tribonacci') {
      const seq = tribonacciSequence(15);
      return seq.map((v, i) => ({ index: i, value: v }));
    } else if (id === 'lucas') {
      const seq = lucasSequence(15);
      return seq.map((v, i) => ({ index: i, value: v }));
    } else if (id === 'euclidean') {
      const result = euclideanAlgorithm(48, 18);
      return result.steps.map((s, i) => ({ step: i + 1, a: s.a, b: s.b, remainder: s.remainder }));
    } else if (id === 'division') {
      // Show division results for numbers 1-15 divided by 7
      return Array.from({ length: 15 }, (_, i) => {
        const a = i + 1;
        const b = 7;
        const q = Math.floor(a / b);
        const r = a % b;
        return { number: a, quotient: q, remainder: r };
      });
    }
    return [];
  }, [mission]);

  // Mission progress
  const missionProgress = useAppStore(s => s.progress?.missions.find(m => m.id === mission.id));
  const sectionsViewed = missionProgress?.sectionsViewed ?? [];
  const progressPercent = (sectionsViewed.length / tabDefs.length) * 100;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #020617 0%, #0a0f1e 50%, #020617 100%)' }}>
      {/* ---- Top Bar ---- */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{
          borderColor: colors.border,
          background: 'rgba(2,6,23,0.85)',
          boxShadow: `0 4px 30px ${colors.glow}`,
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => {
              if (soundEnabled) soundEngine.click();
              setPage('dashboard');
            }}
            className="text-slate-400 hover:text-white gap-2 text-xs tracking-wider"
          >
            <ArrowLeft className="size-4" />
            RETURN TO MISSION CONTROL
          </Button>

          {/* Mission title */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{mission.icon}</span>
            <div>
              <h1 className="text-lg font-bold text-white">{mission.title}</h1>
              <p className="text-xs text-slate-500 tracking-wider">{mission.subtitle}</p>
            </div>
          </div>

          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              soundEngine.setMuted(soundEnabled);
            }}
            className="text-slate-400 hover:text-white"
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>
        </div>

        {/* Progress bar */}
        <div className="max-w-6xl mx-auto px-4 pb-2">
          <Progress
            value={progressPercent}
            className="h-1 bg-slate-800"
            style={{ ['--progress-color' as string]: colors.primary }}
          />
          <style>{`
            [data-slot="progress-indicator"] {
              background: ${colors.primary} !important;
            }
          `}</style>
        </div>
      </motion.header>

      {/* ---- Main Content ---- */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col gap-6">
          {/* Tab navigation */}
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <TabsList className="bg-slate-900/80 border border-slate-700/50 p-1 gap-1 h-auto flex-wrap">
              {tabDefs.map(tab => {
                const Icon = tab.icon;
                const isViewed = sectionsViewed.includes(tab.value);
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-500 gap-1.5 text-xs px-3 py-2 rounded-lg transition-all"
                    style={
                      activeTab === tab.value
                        ? { boxShadow: `0 0 12px ${colors.glow}`, color: colors.primary, borderColor: colors.border }
                        : {}
                    }
                  >
                    <Icon className="size-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {isViewed && (
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary }} />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* ---- Tab 1: Overview ---- */}
          <TabsContent value="overview">
            <AnimatedSection>
              <GlassPanel>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}>
                      {mission.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{mission.title}</h2>
                      <p className="text-sm" style={{ color: colors.primary }}>{mission.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                      BRIEFING DOCUMENT
                    </Badge>
                    <Badge variant="outline" className="text-xs" style={{ borderColor: colors.border, color: colors.primary }}>
                      CLASSIFIED
                    </Badge>
                  </div>

                  <div className="text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                    {mission.overview}
                  </div>
                </div>
              </GlassPanel>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 2: Formula ---- */}
          <TabsContent value="formula">
            <AnimatedSection>
              <div className="space-y-6">
                <GlassPanel>
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="size-5" style={{ color: colors.primary }} />
                      <h2 className="text-xl font-bold text-white">Mathematical Formula</h2>
                    </div>

                    <KaTeXFormula formula={mission.formula} />

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: colors.primary }}>
                        Description
                      </h3>
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {mission.formulaDescription}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.primary }}>
                          Key Property
                        </div>
                        <div className="text-slate-300 text-sm">
                          {mission.id === 'collatz' && 'Always reaches 1 (conjectured)'}
                          {mission.id === 'fibonacci' && 'Ratio converges to φ ≈ 1.618'}
                          {mission.id === 'tribonacci' && 'Ratio converges to ≈ 1.839'}
                          {mission.id === 'lucas' && 'L(n) = F(n-1) + F(n+1)'}
                          {mission.id === 'euclidean' && 'GCD(a,0) = a terminates algorithm'}
                          {mission.id === 'division' && 'Remainder is unique: 0 ≤ r < |b|'}
                        </div>
                      </div>
                      <div
                        className="rounded-lg p-4"
                        style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <div className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.primary }}>
                          Complexity
                        </div>
                        <div className="text-slate-300 text-sm">
                          {mission.id === 'collatz' && 'Unknown — unproven convergence'}
                          {mission.id === 'fibonacci' && 'O(n) for sequence, O(log n) for nth'}
                          {mission.id === 'tribonacci' && 'O(n) for sequence generation'}
                          {mission.id === 'lucas' && 'O(n) for sequence generation'}
                          {mission.id === 'euclidean' && 'O(log(min(a,b))) — very efficient'}
                          {mission.id === 'division' && 'O(1) — constant time operation'}
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassPanel>
              </div>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 3: Worked Example ---- */}
          <TabsContent value="example">
            <AnimatedSection>
              <GlassPanel>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Rocket className="size-5" style={{ color: colors.primary }} />
                    <h2 className="text-xl font-bold text-white">Worked Example</h2>
                  </div>

                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <h3 className="text-sm font-semibold" style={{ color: colors.primary }}>
                      {mission.workedExample.title}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {mission.workedExample.steps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.3 }}
                        className="flex items-start gap-4 p-3 rounded-lg border border-slate-800/50 bg-slate-900/50"
                      >
                        <div
                          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                          style={{ backgroundColor: colors.bg, color: colors.primary, border: `1px solid ${colors.border}` }}
                        >
                          {i + 1}
                        </div>
                        <div className="text-sm text-slate-300 font-mono leading-relaxed pt-1">
                          {step}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </GlassPanel>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 4: Interactive Simulator ---- */}
          <TabsContent value="simulator">
            <AnimatedSection>
              <GlassPanel>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="size-5" style={{ color: colors.primary }} />
                    <h2 className="text-xl font-bold text-white">Interactive Simulator</h2>
                  </div>

                  {/* Input area */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                    {(mission.id === 'collatz' || mission.id === 'fibonacci' || mission.id === 'tribonacci' || mission.id === 'lucas') && (
                      <div className="flex-1 w-full space-y-2">
                        <Label className="text-slate-400 text-xs">{mission.simulatorLabel}</Label>
                        <Input
                          value={simInput1}
                          onChange={e => setSimInput1(e.target.value)}
                          placeholder={mission.simulatorPlaceholder}
                          className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:border-cyan-500/50"
                          onKeyDown={e => { if (e.key === 'Enter') handleCompute(); }}
                        />
                      </div>
                    )}
                    {(mission.id === 'euclidean' || mission.id === 'division') && (
                      <>
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-400 text-xs">
                            {mission.id === 'euclidean' ? 'First Integer (a)' : 'Dividend (a)'}
                          </Label>
                          <Input
                            value={simInput1}
                            onChange={e => setSimInput1(e.target.value)}
                            placeholder={mission.id === 'euclidean' ? 'e.g., 48' : 'e.g., 43'}
                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:border-cyan-500/50"
                            onKeyDown={e => { if (e.key === 'Enter') handleCompute(); }}
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <Label className="text-slate-400 text-xs">
                            {mission.id === 'euclidean' ? 'Second Integer (b)' : 'Divisor (b)'}
                          </Label>
                          <Input
                            value={simInput2}
                            onChange={e => setSimInput2(e.target.value)}
                            placeholder={mission.id === 'euclidean' ? 'e.g., 18' : 'e.g., 7'}
                            className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:border-cyan-500/50"
                            onKeyDown={e => { if (e.key === 'Enter') handleCompute(); }}
                          />
                        </div>
                      </>
                    )}
                    <Button
                      onClick={handleCompute}
                      className="font-bold tracking-wider px-8 text-white"
                      style={{ backgroundColor: colors.primary, boxShadow: `0 0 20px ${colors.glow}` }}
                    >
                      COMPUTE
                    </Button>
                  </div>

                  {/* Results */}
                  <AnimatePresence mode="wait">
                    {simResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-xl border p-5"
                        style={{ borderColor: colors.border, backgroundColor: 'rgba(15,23,42,0.8)' }}
                      >
                        {simResult}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </GlassPanel>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 5: Visualization ---- */}
          <TabsContent value="visualization">
            <AnimatedSection>
              <GlassPanel>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="size-5" style={{ color: colors.primary }} />
                    <h2 className="text-xl font-bold text-white">Visualization</h2>
                  </div>

                  <div className="rounded-xl border p-4" style={{ borderColor: colors.border, backgroundColor: 'rgba(15,23,42,0.6)' }}>
                    {/* Sequence charts */}
                    {(mission.id === 'collatz' || mission.id === 'fibonacci' || mission.id === 'tribonacci' || mission.id === 'lucas') && (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={vizData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                          <XAxis
                            dataKey={mission.id === 'collatz' ? 'step' : 'index'}
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{ value: mission.id === 'collatz' ? 'Step' : 'Index', position: 'insideBottom', offset: -10, style: { fill: '#94a3b8', fontSize: 12 } }}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{ value: 'Value', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 12 } }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15,23,42,0.95)',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '8px',
                              color: '#e2e8f0',
                              fontSize: 12,
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke={colors.primary}
                            strokeWidth={2}
                            fill="url(#colorValue)"
                            dot={{ fill: colors.primary, r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 5, fill: colors.primary, stroke: '#fff', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                    {/* Euclidean algorithm chart */}
                    {mission.id === 'euclidean' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={vizData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                          <XAxis
                            dataKey="step"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{ value: 'Step', position: 'insideBottom', offset: -10, style: { fill: '#94a3b8', fontSize: 12 } }}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15,23,42,0.95)',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '8px',
                              color: '#e2e8f0',
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="a" fill={colors.primary} radius={[4, 4, 0, 0]} name="a" opacity={0.8} />
                          <Bar dataKey="b" fill="#6366f1" radius={[4, 4, 0, 0]} name="b" opacity={0.8} />
                          <Bar dataKey="remainder" fill="#a78bfa" radius={[4, 4, 0, 0]} name="remainder" opacity={0.6} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}

                    {/* Division algorithm chart */}
                    {mission.id === 'division' && (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={vizData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                          <XAxis
                            dataKey="number"
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            label={{ value: 'Number (÷ 7)', position: 'insideBottom', offset: -10, style: { fill: '#94a3b8', fontSize: 12 } }}
                          />
                          <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'rgba(15,23,42,0.95)',
                              border: `1px solid ${colors.border}`,
                              borderRadius: '8px',
                              color: '#e2e8f0',
                              fontSize: 12,
                            }}
                          />
                          <Bar dataKey="quotient" fill={colors.primary} radius={[4, 4, 0, 0]} name="Quotient" opacity={0.8} />
                          <Bar dataKey="remainder" fill="#f97316" radius={[4, 4, 0, 0]} name="Remainder" opacity={0.8} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    {mission.id === 'collatz' && 'Collatz sequence starting from 27'}
                    {mission.id === 'fibonacci' && 'First 15 Fibonacci numbers'}
                    {mission.id === 'tribonacci' && 'First 15 Tribonacci numbers'}
                    {mission.id === 'lucas' && 'First 15 Lucas numbers'}
                    {mission.id === 'euclidean' && 'Euclidean algorithm: GCD(48, 18)'}
                    {mission.id === 'division' && 'Division by 7: quotient and remainder'}
                  </p>
                </div>
              </GlassPanel>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 6: Real-World Applications ---- */}
          <TabsContent value="applications">
            <AnimatedSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="size-5" style={{ color: colors.primary }} />
                  <h2 className="text-xl font-bold text-white">Real-World Applications</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mission.applications.map((app, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <GlassPanel className="p-4 h-full">
                        <div className="flex items-start gap-3">
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{ backgroundColor: colors.bg, color: colors.primary, border: `1px solid ${colors.border}` }}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-slate-300 text-sm leading-relaxed">{app}</p>
                          </div>
                        </div>
                      </GlassPanel>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 7: Historical Background ---- */}
          <TabsContent value="history">
            <AnimatedSection>
              <GlassPanel>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <History className="size-5" style={{ color: colors.primary }} />
                    <h2 className="text-xl font-bold text-white">Historical Log</h2>
                  </div>

                  <div
                    className="rounded-lg p-4 border-l-4"
                    style={{ borderColor: colors.primary, backgroundColor: colors.bg }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs" style={{ borderColor: colors.border, color: colors.primary }}>
                        HISTORICAL RECORD
                      </Badge>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {mission.history}
                    </p>
                  </div>
                </div>
              </GlassPanel>
            </AnimatedSection>
          </TabsContent>

          {/* ---- Tab 8: Quiz ---- */}
          <TabsContent value="quiz">
            <AnimatedSection>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="size-5" style={{ color: colors.primary }} />
                  <h2 className="text-xl font-bold text-white">Mission Quiz</h2>
                </div>

                <QuizComponent
                  missionId={mission.id}
                  questions={mission.quiz}
                  missionColor={colors.primary}
                />
              </div>
            </AnimatedSection>
          </TabsContent>
        </Tabs>
      </main>

      {/* ---- Footer ---- */}
      <footer className="border-t border-slate-800/50 py-4 text-center">
        <p className="text-xs text-slate-600 tracking-wider">
          MATHEMATICAL MISSION CONTROL • {mission.title.toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
