# 🚀 Mathematical Mission Control — System Documentation

> **"Explore Math in Space"** — An immersive, futuristic educational platform teaching 6 mathematical sequences and algorithms through interactive space-themed missions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture & Design](#3-architecture--design)
4. [Page Flow & User Journey](#4-page-flow--user-journey)
5. [The 6 Missions (Curriculum)](#5-the-6-missions-curriculum)
6. [Component Breakdown](#6-component-breakdown)
7. [State Management](#7-state-management)
8. [Sound & Audio Engine](#8-sound--audio-engine)
9. [Math Algorithms Engine](#9-math-algorithms-engine)
10. [Progress & Achievement System](#10-progress--achievement-system)
11. [Visual Design System](#11-visual-design-system)
12. [Asset Library](#12-asset-library)
13. [File Structure](#13-file-structure)
14. [Configuration](#14-configuration)
15. [How to Run](#15-how-to-run)

---

## 1. Project Overview

**Mathematical Mission Control** is a single-page web application that transforms mathematical education into an interstellar adventure. Users assume the role of space cadets who log into a futuristic mission control center, select mathematical "missions" (each represented as a planet), launch rockets to those planets, and learn through interactive simulations, visualizations, and quizzes.

### Key Features

- **Immersive Login Experience** — Sci-fi themed authentication with radar animations, telemetry panels, scanline effects, and background music
- **Rocket Launch Animations** — Multi-phase countdown-to-landing sequences with particle effects, screen shake, and planet-specific landing visuals
- **6 Interactive Missions** — Each mission covers a mathematical sequence/algorithm with 8 learning tabs
- **Real-time Math Simulator** — Users input values and see step-by-step computations
- **Data Visualizations** — Recharts-powered area charts and bar charts for sequence data
- **KaTeX Formula Rendering** — Beautiful mathematical typesetting with glassmorphism containers
- **Quiz System** — 7 questions per mission with immediate feedback, scoring, and pass/fail thresholds
- **Achievement Badges** — 8 unlockable achievements tracking progress across all missions
- **Persistent Progress** — localStorage-based tracking that survives page reloads
- **Sound Design** — Dual-mode audio engine (file-based + synthetic fallback) with 11 sound effects
- **Starfield Background** — Canvas-based animated background with twinkling stars, shooting stars, and nebulae
- **Logout Animation** — Dramatic rocket + comet collision explosion sequence

---

## 2. Technology Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js (App Router) | ^16.1.1 |
| **Language** | TypeScript | ^5 |
| **Runtime** | Bun | latest |
| **Styling** | Tailwind CSS | ^4 |
| **UI Components** | shadcn/ui (New York style) | latest |
| **Animation** | Framer Motion | ^12.23.2 |
| **State** | Zustand | ^5.0.6 |
| **Math Rendering** | KaTeX | ^0.16.46 |
| **Charts** | Recharts | ^2.15.4 |
| **Icons** | Lucide React | ^0.525.0 |
| **Fonts** | Geist, Geist Mono, Orbitron, Electrolize | Google Fonts |
| **Audio** | Web Audio API | Browser Native |
| **Toast** | Sonner | ^2.0.6 |
| **Forms** | React Hook Form + Zod | latest |
| **DB ORM** | Prisma (SQLite) | ^6.11.1 |

---

## 3. Architecture & Design

### Single-Page Application Pattern

The entire application is a **single Next.js page** (`src/app/page.tsx`) that uses **Zustand-driven client-side routing**. There are no URL-based routes — all navigation happens through state transitions.

```
┌──────────────────────────────────────────────┐
│                  page.tsx                     │
│  ┌──────────────────────────────────────────┐ │
│  │         AnimatePresence (Framer Motion)   │ │
│  │  ┌──────────┐   currentPage state   ┌──┐ │ │
│  │  │ LoginPage │◄─────────────────────┤  │ │ │
│  │  └────┬─────┘                      │  │ │ │
│  │       ▼                             │  │ │ │
│  │  ┌──────────────┐                   │Z │ │ │
│  │  │ LoadingScreen │──────────────────►│u │ │ │
│  │  └────┬─────────┘                   │s │ │ │
│  │       ▼                             │t │ │ │
│  │  ┌───────────┐                      │a │ │ │
│  │  │ Dashboard │◄─────────────────────┤n │ │ │
│  │  └────┬──────┘                      │d │ │ │
│  │       ▼                             │  │ │ │
│  │  ┌────────────┐                     │S │ │ │
│  │  │ MissionPage│─────────────────────►│t │ │ │
│  │  └────┬───────┘                     │o │ │ │
│  │       ▼                             │r │ │ │
│  │  ┌──────────────────┐               │e │ │ │
│  │  │ LogoutAnimation  │──────────────►│  │ │ │
│  │  └──────────────────┘               └──┘ │ │
│  └──────────────────────────────────────────┘ │
│                                               │
│  ┌─────────────┐  (always rendered)           │
│  │SoundControls│  except loading/logout        │
│  └─────────────┘                              │
└──────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Zustand Store → Component Re-render → localStorage Persistence
     │              │
     │              └── currentPage, username, progress, soundEnabled
     │
     └── Math Algorithms → Simulators → Visualizations → Quizzes → Progress Updates
```

---

## 4. Page Flow & User Journey

### Step-by-Step Experience

```
1. LOGIN PAGE
   ├─ Starfield background with nebulae
   ├─ Radar SVG animation (rotating sweep)
   ├─ Telemetry panel (live stats)
   ├─ Scanline overlay effect
   ├─ Constellation dot pattern
   ├─ BGM starts on first interaction
   ├─ User enters callsign (username)
   └─ Auth state machine: PENDING → VERIFYING → CONFIRMED

2. LOADING SCREEN (Rocket Launch)
   ├─ 6 phases:
   │  ├─ Phase 1: Countdown (10→1)
   │  ├─ Phase 2: Ignition (fire particles)
   │  ├─ Phase 3: Launch (rocket rises, screen shake)
   │  ├─ Phase 4: Approach (planet comes into view)
   │  ├─ Phase 5: Landing (planet surface)
   │  └─ Phase 6: Complete (mission begins)
   ├─ SVG rocket with animated fire/smoke
   ├─ Mission-specific planet landing
   └─ Rocket launch sound effect

3. DASHBOARD (Mission Control)
   ├─ Welcome header with username
   ├─ 6 Mission cards in responsive grid
   │  ├─ Planet image
   │  ├─ Mission name, subtitle, description
   │  ├─ Progress indicator (quiz score)
   │  ├─ Neon glow in mission color
   │  └─ Click → triggers loading → mission
   ├─ Achievements section
   │  ├─ Trophy icon
   │  ├─ Unlocked/locked badge display
   │  └─ Total quizzes passed counter
   ├─ Sound toggle
   └─ Logout button → LogoutAnimation

4. MISSION PAGE (8-Tab Content)
   ├─ Tab 1: OVERVIEW — Description of the sequence/algorithm
   ├─ Tab 2: FORMULA — KaTeX-rendered mathematical formula
   ├─ Tab 3: EXAMPLE — Step-by-step worked example
   ├─ Tab 4: SIMULATOR — Interactive computation with user input
   ├─ Tab 5: VISUALIZATION — Recharts area/bar charts
   ├─ Tab 6: APPLICATIONS — Real-world use cases
   ├─ Tab 7: HISTORY — Historical context and origins
   └─ Tab 8: QUIZ — 7-question interactive quiz
       ├─ One question at a time
       ├─ Immediate correct/incorrect feedback
       ├─ Score tracking (percentage)
       ├─ Pass threshold: 70%
       ├─ Celebration particles on pass
       └─ Retry option on fail

5. LOADING SCREEN (Return)
   └─ Same rocket animation, returning to dashboard

6. LOGOUT ANIMATION
   ├─ Rocket launches
   ├─ Comet appears on collision course
   ├─ Multi-ring explosion effect
   ├─ "DISCONNECTING" text
   └─ Fade to black → Returns to login
```

---

## 5. The 6 Missions (Curriculum)

### Mission 1: Collatz — The Unstoppable Sequence 🌀

| Property | Value |
|----------|-------|
| **Color** | Cyan |
| **Planet** | planet-collatz.png |
| **Topic** | Collatz Conjecture |
| **Formula** | `f(n) = { n/2 if n is even; 3n+1 if n is odd }` |
| **Simulator** | Enter starting integer → generates full sequence with step-by-step rules |
| **Visualization** | Area chart showing value trajectory over steps |
| **Quiz** | 7 questions about even/odd rules, sequence behavior, conjecture status |

**Key Concept:** Start with any positive integer. If even, divide by 2; if odd, multiply by 3 and add 1. The conjecture claims you always reach 1. Unproven for all numbers despite verification up to 2⁶⁸.

**Worked Example:** Starting with n=6: 6→3→10→5→16→8→4→2→1 (8 steps)

---

### Mission 2: Fibonacci — Nature's Golden Code 🐚

| Property | Value |
|----------|-------|
| **Color** | Amber |
| **Planet** | planet-fibonacci.png |
| **Topic** | Fibonacci Sequence |
| **Formula** | `Fₙ = Fₙ₋₁ + Fₙ₋₂`, F₀=0, F₁=1 |
| **Simulator** | Enter number of terms → generates full sequence |
| **Visualization** | Bar chart of Fibonacci numbers |
| **Quiz** | 7 questions about seed values, golden ratio, Liber Abaci |

**Key Concept:** Each number is the sum of the two preceding ones. Found throughout nature (shells, leaves, branching). Ratio converges to φ ≈ 1.618.

**Worked Example:** F(0)→F(9) = 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

---

### Mission 3: Tribonacci — The Triple Helix 🔺

| Property | Value |
|----------|-------|
| **Color** | Purple |
| **Planet** | planet-tribonacci.png |
| **Topic** | Tribonacci Sequence |
| **Formula** | `Tₙ = Tₙ₋₁ + Tₙ₋₂ + Tₙ₋₃`, T₀=0, T₁=0, T₂=1 |
| **Simulator** | Enter number of terms → generates full sequence |
| **Visualization** | Bar chart of Tribonacci numbers |
| **Quiz** | 7 questions about 3-predecessor sum, tribonacci constant |

**Key Concept:** Generalization of Fibonacci — each number is the sum of the three preceding numbers. Ratio converges to the tribonacci constant ≈ 1.839.

**Worked Example:** T(0)→T(9) = 0, 0, 1, 1, 2, 4, 7, 13, 24, 44

---

### Mission 4: Lucas — The Parallel Universe ⭐

| Property | Value |
|----------|-------|
| **Color** | Emerald |
| **Planet** | planet-lucas.png |
| **Topic** | Lucas Sequence |
| **Formula** | `Lₙ = Lₙ₋₁ + Lₙ₋₂`, L₀=2, L₁=1 |
| **Simulator** | Enter number of terms → generates full sequence |
| **Visualization** | Bar chart of Lucas numbers |
| **Quiz** | 7 questions about seed values, Fibonacci relationship, Édouard Lucas |

**Key Concept:** Fibonacci's twin with different seeds (2,1 instead of 0,1). Related: L(n) = F(n-1) + F(n+1). Used in Lucas-Lehmer primality test.

**Worked Example:** L(0)→L(9) = 2, 1, 3, 4, 7, 11, 18, 29, 47, 76

---

### Mission 5: Euclid — The Ancient Algorithm 📐

| Property | Value |
|----------|-------|
| **Color** | Rose |
| **Planet** | planet-euclidean.png |
| **Topic** | Euclidean Algorithm (GCD) |
| **Formula** | `gcd(a,b) = gcd(b, a mod b)`, gcd(a,0) = a |
| **Simulator** | Enter two integers → shows step-by-step GCD computation |
| **Visualization** | Area chart showing decreasing remainders |
| **Quiz** | 7 questions about GCD computation, Euclid's Elements, Bézout coefficients |

**Key Concept:** The oldest algorithm still in use (~300 BC). Repeatedly replace larger number with remainder until 0. Essential for RSA cryptography.

**Worked Example:** GCD(48,18): 48÷18=2r12 → 18÷12=1r6 → 12÷6=2r0 → GCD=6

---

### Mission 6: Division — The Foundation of Arithmetic ➗

| Property | Value |
|----------|-------|
| **Color** | Sky |
| **Planet** | planet-division.png |
| **Topic** | Division Algorithm (Theorem) |
| **Formula** | `a = bq + r`, where 0 ≤ r < |b| |
| **Simulator** | Enter dividend and divisor → computes quotient, remainder, verifies |
| **Visualization** | Bar chart showing quotient/remainder relationship |
| **Quiz** | 7 questions about uniqueness guarantee, modular arithmetic, Gauss |

**Key Concept:** Guarantees unique quotient q and remainder r for any integers a,b (b≠0). Foundation of modular arithmetic and number theory.

**Worked Example:** 43 = 7 × 6 + 1 (q=6, r=1, verified: 42+1=43)

---

## 6. Component Breakdown

### Custom Mission Components (`src/components/mission/`)

| Component | Lines | Purpose | Key Implementation Details |
|-----------|-------|---------|---------------------------|
| **StarfieldBackground** | ~150 | Animated canvas background | Canvas API, requestAnimationFrame, twinkling stars with opacity variation, shooting stars with gradient trails, nebula clouds (purple/cyan/indigo/teal) with radial gradients |
| **LoginPage** | ~300 | Sci-fi crew authentication | SVG radar with rotating sweep line, telemetry panel with live-updating stats, scanline overlay CSS animation, constellation dot pattern, grunge-styled inputs, auth state machine (PENDING→VERIFYING→CONFIRMED), BGM auto-start on first interaction |
| **LoadingScreen** | ~400 | Rocket launch transition | 6-phase animation (countdown→ignition→launch→approach→landing→complete), SVG rocket with animated fire/smoke particles, CSS screen shake, planet landing with mission-specific image, flash effect on landing |
| **Dashboard** | ~350 | Mission selection hub | 6 mission cards with planet images in responsive grid, progress tracking per mission, neon glow effect in each mission's color, achievements section with trophy icon, total quizzes passed counter, sound toggle & logout buttons |
| **MissionPage** | ~600 | Mission content viewer | 8-tab layout (Overview, Formula, Example, Simulator, Visualization, Applications, History, Quiz), interactive simulator with math computation, Recharts area/bar charts, section progress tracking, back-to-dashboard navigation |
| **QuizComponent** | ~250 | Interactive quiz | One question at a time, immediate correct/incorrect visual feedback, animated score counter, 70% pass threshold, achievement badge unlocking, celebration particles on pass, retry option on fail |
| **KaTeXFormula** | ~50 | Math formula renderer | Uses `katex.render()` with error handling, glassmorphism container with cyan glow border |
| **LogoutAnimation** | ~200 | Logout transition | Rocket launch → comet collision → multi-ring explosion → fade to black, "DISCONNECTING" text overlay |
| **SoundControls** | ~60 | Floating sound toggle | Fixed bottom-right position, cyan glow when enabled, Framer Motion spring animation |

### shadcn/ui Components (`src/components/ui/`)

44 pre-built components in New York style: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toaster, toggle, toggle-group, tooltip

---

## 7. State Management

### Zustand Store (`src/store/appStore.ts`)

The entire application state is managed through a single Zustand store with the following shape:

```typescript
interface AppState {
  // Navigation
  currentPage: 'login' | 'loading' | 'dashboard' | 'mission' | 'logout' | 'achievements';
  loadingTarget: AppPage;           // Where to go after loading finishes
  loadingMissionId: string | null;  // Which mission to load

  // User
  username: string;
  progress: UserProgress | null;    // Full progress + achievements

  // Mission
  currentMissionId: string | null;  // Currently selected mission

  // Settings
  soundEnabled: boolean;

  // Actions
  setPage(page: AppPage): void;
  login(username: string): void;
  logout(): void;
  selectMission(missionId: string): void;
  setLoading(target: AppPage, missionId?: string | null): void;
  finishLoading(): void;
  updateProgress(missionId: string, update: {...}): void;
  setSoundEnabled(enabled: boolean): void;
  loadUserProgress(username: string): void;
}
```

### State Transitions

```
login → LoginPage
   │
   ├─ onAuthConfirmed → login(username), setLoading('dashboard')
   │
loading → LoadingScreen
   │
   ├─ onFinish → finishLoading() → navigates to loadingTarget
   │
dashboard → Dashboard
   │
   ├─ onMissionSelect → selectMission(id), setLoading('mission', id)
   ├─ onLogout → logout()
   │
mission → MissionPage
   │
   ├─ onBack → setLoading('dashboard')
   ├─ onQuizComplete → updateProgress()
   │
logout → LogoutAnimation
   │
   └─ onComplete → setPage('login')
```

---

## 8. Sound & Audio Engine

### SoundEngine Class (`src/lib/soundEngine.ts`)

A singleton class implementing dual-mode audio: **file-based playback** with **synthetic fallback**.

#### File-Based Sounds (with synthetic fallbacks)

| Sound | File | Synthetic Fallback | Used By |
|-------|------|--------------------|---------|
| Background Music | `/audio/bg.mp4` | (none — silence) | Login page, dashboard |
| Rocket Launch | `/audio/rocketlaunch.mp4` | Rising sawtooth + rumble triangle | LoadingScreen |
| Rocket Crash | `/audio/rocketcrash.mp4` | Noise burst + low boom sine | LogoutAnimation |
| Deploy | `/audio/deploy.mp3` | C5-E5-G5 ascending triad | Success actions |
| Expand | `/audio/expand.mp3` | C5-E5-G5-C6 ascending | Achievement unlock |
| Fade | `/audio/fade.mp3` | G4-Eb4 descending sawtooth | Failure/incorrect |
| Hover | `/audio/hover.mp3` | 1200Hz sine blip | Button hover |
| Start | `/audio/start.mp3` | C5-E5-G5 ascending | Verification start |
| Transmission | `/audio/transmission.mp3` | C5-E5-G5-C6 ascending | Data transmission |
| Typing | `/audio/typing.mp3` | Random 600-1000Hz square | Keyboard input |
| Click | `/audio/click.mp3` | 800Hz square blip | Button click |

#### Synthetic Sound Generation

- **click()** — 800Hz, 0.08s, square wave
- **hover()** — 1200Hz, 0.04s, sine wave
- **type()** — 600-1000Hz random, 0.05s, square wave
- **success()** — C5→E5→G5 ascending arpeggio (sine)
- **failure()** — G4→Eb4 descending (sawtooth)
- **achievement()** — C5→E5→G5→C6 ascending arpeggio (sine)
- **launch()** — Rising sawtooth 80→400Hz + rumble triangle 40→60Hz
- **countdown()** — 440Hz, 0.15s, square wave
- **crash()** — Noise burst with lowpass filter sweep + 60→20Hz sine boom

#### Volume Control

- Default volume: 0.5
- BGM plays at 0.4× master volume
- Sound effects at 0.5-0.6× master volume
- Mute state pauses BGM and silences all effects

---

## 9. Math Algorithms Engine

### File: `src/lib/mathAlgorithms.ts`

#### Collatz Functions

```typescript
collatzSequence(start: number): number[]
// Returns: [6, 3, 10, 5, 16, 8, 4, 2, 1] for start=6

collatzSteps(start: number): { step: number; value: number; rule: string }[]
// Returns: Step-by-step with explanations like "6 is even → 6 ÷ 2 = 3"
```

#### Fibonacci Functions

```typescript
fibonacciSequence(n: number): number[]
// Returns: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34] for n=10

fibonacciNth(n: number): number
// Returns: 34 for n=10
```

#### Tribonacci Functions

```typescript
tribonacciSequence(n: number): number[]
// Returns: [0, 0, 1, 1, 2, 4, 7, 13, 24, 44] for n=10

tribonacciNth(n: number): number
// Returns: 44 for n=10
```

#### Lucas Functions

```typescript
lucasSequence(n: number): number[]
// Returns: [2, 1, 3, 4, 7, 11, 18, 29, 47, 76] for n=10

lucasNth(n: number): number
// Returns: 76 for n=10
```

#### Euclidean Algorithm

```typescript
euclideanAlgorithm(a: number, b: number): { gcd: number; steps: {...}[] }
// Returns: { gcd: 6, steps: [{a:48,b:18,q:2,r:12}, {a:18,b:12,q:1,r:6}, {a:12,b:6,q:2,r:0}] }
```

#### Division Algorithm

```typescript
divisionAlgorithm(dividend: number, divisor: number): { quotient: number; remainder: number; steps: string[] }
// Returns: { quotient: 6, remainder: 1, steps: ["Dividend = 43, Divisor = 7", ...] }
```

---

## 10. Progress & Achievement System

### File: `src/lib/progressTracker.ts`

### Storage

- **Key:** `math-mission-control-progress`
- **Location:** Browser localStorage
- **Format:** JSON

### Data Structures

```typescript
interface MissionProgress {
  id: string;                    // 'collatz' | 'fibonacci' | etc.
  completed: boolean;            // Has the mission been completed
  quizScore: number | null;      // Quiz percentage (0-100)
  quizPassed: boolean;           // Score >= 70%
  sectionsViewed: string[];      // Which tabs the user has visited
  lastVisited: string | null;    // ISO timestamp of last visit
}

interface Achievement {
  id: string;                    // Unique identifier
  name: string;                  // Display name
  description: string;           // What earns this badge
  icon: string;                  // Emoji icon
  unlockedAt: string | null;     // ISO timestamp or null
}

interface UserProgress {
  username: string;
  missions: MissionProgress[];   // 6 mission progress entries
  achievements: Achievement[];   // 8 achievement entries
  totalQuizzesPassed: number;    // Count of passed quizzes
}
```

### 8 Achievements

| # | ID | Name | Icon | Condition |
|---|----|------|------|-----------|
| 1 | `collatz-specialist` | Sequence Specialist | 🌀 | Pass Collatz quiz |
| 2 | `fibonacci-navigator` | Recursive Navigator | 🐚 | Pass Fibonacci quiz |
| 3 | `tribonacci-explorer` | Tribonacci Trailblazer | 🔺 | Pass Tribonacci quiz |
| 4 | `lucas-commander` | Lucas Commander | ⭐ | Pass Lucas quiz |
| 5 | `euclid-explorer` | Euclid Explorer | 📐 | Pass Euclidean quiz |
| 6 | `division-commander` | Division Commander | ➗ | Pass Division quiz |
| 7 | `math-astronaut` | Math Astronaut | 🚀 | Pass ALL quizzes |
| 8 | `quiz-master` | Quiz Master | 🏆 | 100% on ALL quizzes |

### Achievement Unlocking Logic

1. When a quiz is passed (≥70%), the corresponding mission achievement unlocks
2. When all 6 quizzes are passed, "Math Astronaut" unlocks
3. When all 6 quizzes score 100%, "Quiz Master" unlocks
4. Unlocks are timestamped and persisted to localStorage

---

## 11. Visual Design System

### Color Palette

The theme uses **oklch** color space with a deep purple-blue base hue (270°) and cyan accent hue (195°):

| Variable | oklch Value | Approximate Color |
|----------|------------|-------------------|
| `--background` | oklch(0.07 0.02 270) | Deep navy/black |
| `--foreground` | oklch(0.95 0.01 270) | Near white |
| `--card` | oklch(0.12 0.02 270) | Dark navy |
| `--primary` | oklch(0.75 0.15 195) | Cyan |
| `--secondary` | oklch(0.18 0.03 270) | Dark purple |
| `--muted` | oklch(0.18 0.03 270) | Muted purple |
| `--accent` | oklch(0.18 0.04 270) | Accent purple |
| `--destructive` | oklch(0.65 0.2 25) | Red-orange |
| `--border` | oklch(0.25 0.04 270) | Subtle purple border |

### Mission Colors

| Mission | Tailwind Color | Hex Approx | Neon Glow |
|---------|---------------|------------|-----------|
| Collatz | cyan | #22d3ee | Cyan glow |
| Fibonacci | amber | #f59e0b | Amber glow |
| Tribonacci | purple | #a855f7 | Purple glow |
| Lucas | emerald | #10b981 | Green glow |
| Euclidean | rose | #f43f5e | Pink glow |
| Division | sky | #0ea5e9 | Blue glow |

### Typography

| Font | Usage | Variable |
|------|-------|----------|
| **Geist** | Body text, UI elements | `--font-geist-sans` |
| **Geist Mono** | Code, monospace content | `--font-geist-mono` |
| **Orbitron** | Headings, mission titles, sci-fi text | `--font-orbitron` |
| **Electrolize** | Subheadings, data readouts | `--font-electrolize` |

### Custom Animations (CSS Keyframes)

| Animation | Effect | Duration |
|-----------|--------|----------|
| `twinkle` | Star opacity pulse (0.2↔1.0) | variable |
| `pulse-glow` | Cyan box-shadow expansion | continuous |
| `scanline` | Horizontal line sweeping vertically | continuous |
| `float` | Vertical bob (-10px) | continuous |

### Design Effects

- **Glassmorphism** — Semi-transparent backgrounds with blur backdrop
- **Neon Glow** — Box-shadow with mission-colored light
- **Scanlines** — CSS-animated overlay for retro-CRT effect
- **Starfield** — Canvas-based animated background (stars + shooting stars + nebulae)
- **Screen Shake** — CSS transform on rocket launch
- **Custom Scrollbar** — Cyan-tinted scrollbar matching the theme

---

## 12. Asset Library

### Audio Files (`public/audio/`)

| File | Format | Size Class | Purpose |
|------|--------|-----------|---------|
| `bg.mp4` | MP4 | Large | Looping background music |
| `rocketlaunch.mp4` | MP4 | Medium | Rocket launch sound effect |
| `rocketcrash.mp4` | MP4 | Medium | Rocket crash/explosion |
| `click.mp3` | MP3 | Small | UI click feedback |
| `deploy.mp3` | MP3 | Small | Deploy/success sound |
| `expand.mp3` | MP3 | Small | Achievement unlock |
| `fade.mp3` | MP3 | Small | Failure/incorrect |
| `hover.mp3` | MP3 | Small | Hover feedback |
| `start.mp3` | MP3 | Small | Verification start |
| `transmission.mp3` | MP3 | Small | Data transmission |
| `typing.mp3` | MP3 | Small | Keyboard typing |

### Planet Images (`public/planets/`)

| File | Mission | Theme Color |
|------|---------|-------------|
| `planet-collatz.png` | Mission Collatz | Cyan |
| `planet-fibonacci.png` | Mission Fibonacci | Amber |
| `planet-tribonacci.png` | Mission Tribonacci | Purple |
| `planet-lucas.png` | Mission Lucas | Emerald |
| `planet-euclidean.png` | Mission Euclid | Rose |
| `planet-division.png` | Mission Division | Sky |

### Other Assets

- `public/logo.svg` — Site logo
- `public/robots.txt` — Allow all crawlers

---

## 13. File Structure

```
/home/z/my-project/
│
├── 📄 Configuration Files
│   ├── Caddyfile                    # Reverse proxy (port 81 → :3000)
│   ├── bun.lock                     # Bun lockfile
│   ├── components.json              # shadcn/ui config
│   ├── eslint.config.mjs            # ESLint flat config
│   ├── next.config.ts               # Next.js config (standalone)
│   ├── package.json                 # Dependencies & scripts
│   ├── postcss.config.mjs           # PostCSS + Tailwind
│   ├── tailwind.config.ts           # Tailwind CSS config
│   └── tsconfig.json                # TypeScript strict config
│
├── 📁 prisma/
│   └── schema.prisma                # User + Post models (unused in app)
│
├── 📁 db/
│   └── custom.db                    # SQLite database (unused in app)
│
├── 📁 public/
│   ├── logo.svg
│   ├── robots.txt
│   ├── 📁 audio/                    # 11 sound files
│   │   ├── bg.mp4
│   │   ├── rocketlaunch.mp4
│   │   ├── rocketcrash.mp4
│   │   └── *.mp3 (8 files)
│   └── 📁 planets/                  # 6 planet PNGs
│       ├── planet-collatz.png
│       ├── planet-fibonacci.png
│       ├── planet-tribonacci.png
│       ├── planet-lucas.png
│       ├── planet-euclidean.png
│       └── planet-division.png
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── globals.css              # Dark cosmic theme + animations
│   │   ├── layout.tsx               # Root layout (4 fonts, dark mode, Toaster)
│   │   ├── page.tsx                 # Main SPA with AnimatePresence routing
│   │   └── 📁 api/
│   │       └── route.ts             # Minimal GET API
│   │
│   ├── 📁 components/
│   │   ├── 📁 mission/              # 9 custom components
│   │   │   ├── StarfieldBackground.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MissionPage.tsx
│   │   │   ├── QuizComponent.tsx
│   │   │   ├── KaTeXFormula.tsx
│   │   │   ├── LogoutAnimation.tsx
│   │   │   └── SoundControls.tsx
│   │   └── 📁 ui/                   # 44 shadcn/ui components
│   │
│   ├── 📁 hooks/
│   │   ├── use-mobile.ts            # Mobile breakpoint (768px)
│   │   └── use-toast.ts             # Toast notification hook
│   │
│   ├── 📁 lib/
│   │   ├── db.ts                    # Prisma client singleton
│   │   ├── mathAlgorithms.ts        # 6 algorithm functions
│   │   ├── missionData.ts           # 6 mission data objects
│   │   ├── progressTracker.ts       # Progress + achievements logic
│   │   ├── soundEngine.ts           # Web Audio API engine
│   │   └── utils.ts                 # cn() utility
│   │
│   └── 📁 store/
│       └── appStore.ts              # Zustand global store
│
├── 📁 examples/
│   └── 📁 websocket/                # Socket.IO example (not integrated)
│
├── 📁 agent-ctx/                    # Agent documentation
└── 📁 download/                     # Generated files
```

---

## 14. Configuration

### Next.js Config (`next.config.ts`)

- `output: "standalone"` — For containerized deployment
- `typescript.ignoreBuildErrors: true` — Dev-friendly TS handling
- `reactStrictMode: false` — Disabled for Framer Motion compatibility

### Tailwind Config (`tailwind.config.ts`)

- Dark mode: `"class"` strategy
- Custom color system via CSS variables
- `tailwindcss-animate` plugin for shadcn/ui animations

### TypeScript Config (`tsconfig.json`)

- Strict mode enabled
- Path alias: `@/*` → `./src/*`
- Module resolution: `bundler`
- Target: ES2017

### ESLint Config (`eslint.config.mjs`)

- Flat config format
- Next.js core-web-vitals + TypeScript rules
- Most rules relaxed for development speed

---

## 15. How to Run

### Development

```bash
# Install dependencies
bun install

# Start development server (port 3000)
bun run dev

# Run linter
bun run lint
```

### Database (if needed)

```bash
# Push schema changes
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Production Build

```bash
# Build the application
bun run build

# Start production server
bun run start
```

---

## Summary

**Mathematical Mission Control** is a fully self-contained, client-side educational web application that combines:

- 🎮 **Gamification** — Missions, quizzes, achievements, progress tracking
- 🎨 **Immersive Design** — Space theme with animations, sound effects, and particle systems
- 📐 **Real Mathematics** — Working algorithms, KaTeX formulas, interactive simulators, data visualizations
- 🏗️ **Modern Stack** — Next.js 16, TypeScript, Tailwind CSS, Zustand, Framer Motion
- 🔊 **Rich Audio** — 11 sound effects with synthetic fallbacks and background music
- 💾 **Persistent Progress** — localStorage-based saving with achievement tracking

The application teaches 6 core mathematical concepts through a narrative of space exploration, making abstract mathematics tangible and engaging through interactive computation, visual feedback, and rewarding progression.
