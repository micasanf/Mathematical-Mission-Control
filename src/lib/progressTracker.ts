// Progress tracking using localStorage

export interface MissionProgress {
  id: string;
  completed: boolean;
  quizScore: number | null;
  quizPassed: boolean;
  sectionsViewed: string[];
  lastVisited: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface UserProgress {
  username: string;
  missions: MissionProgress[];
  achievements: Achievement[];
  totalQuizzesPassed: number;
}

const STORAGE_KEY = 'math-mission-control-progress';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'collatz-specialist', name: 'Sequence Specialist', description: 'Complete the Collatz Mission', icon: 'C', unlockedAt: null },
  { id: 'fibonacci-navigator', name: 'Recursive Navigator', description: 'Complete the Fibonacci Mission', icon: 'F', unlockedAt: null },
  { id: 'tribonacci-explorer', name: 'Tribonacci Trailblazer', description: 'Complete the Tribonacci Mission', icon: 'T', unlockedAt: null },
  { id: 'lucas-commander', name: 'Lucas Commander', description: 'Complete the Lucas Mission', icon: 'L', unlockedAt: null },
  { id: 'euclid-explorer', name: 'Euclid Explorer', description: 'Complete the Euclidean Mission', icon: 'E', unlockedAt: null },
  { id: 'division-commander', name: 'Division Commander', description: 'Complete the Division Mission', icon: 'D', unlockedAt: null },
  { id: 'palindrome-specialist', name: 'Symmetry Specialist', description: 'Complete the Palindrome Mission', icon: 'P', unlockedAt: null },
  { id: 'math-astronaut', name: 'Math Astronaut', description: 'Complete all missions', icon: '!', unlockedAt: null },
  { id: 'quiz-master', name: 'Quiz Master', description: 'Pass all quizzes with perfect score', icon: '*', unlockedAt: null },
];

export const MISSION_IDS = ['collatz', 'fibonacci', 'tribonacci', 'lucas', 'euclidean', 'division', 'palindrome'];

function getDefaultProgress(username: string): UserProgress {
  return {
    username,
    missions: MISSION_IDS.map(id => ({
      id,
      completed: false,
      quizScore: null,
      quizPassed: false,
      sectionsViewed: [],
      lastVisited: null,
    })),
    achievements: ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: null })),
    totalQuizzesPassed: 0,
  };
}

export function loadProgress(username: string): UserProgress {
  if (typeof window === 'undefined') return getDefaultProgress(username);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as UserProgress;
      if (data.username === username) return data;
    }
  } catch { /* ignore */ }
  return getDefaultProgress(username);
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch { /* ignore */ }
}

export function unlockAchievement(progress: UserProgress, achievementId: string): UserProgress {
  const newProgress = { ...progress };
  newProgress.achievements = newProgress.achievements.map(a => {
    if (a.id === achievementId && !a.unlockedAt) {
      return { ...a, unlockedAt: new Date().toISOString() };
    }
    return a;
  });
  return newProgress;
}

export function updateMissionProgress(
  progress: UserProgress,
  missionId: string,
  update: Partial<MissionProgress>
): UserProgress {
  const newProgress = { ...progress };
  newProgress.missions = newProgress.missions.map(m => {
    if (m.id === missionId) {
      return { ...m, ...update };
    }
    return m;
  });

  // Check for mission completion achievement
  const mission = newProgress.missions.find(m => m.id === missionId);
  if (mission?.quizPassed) {
    const achievementMap: Record<string, string> = {
      collatz: 'collatz-specialist',
      fibonacci: 'fibonacci-navigator',
      tribonacci: 'tribonacci-explorer',
      lucas: 'lucas-commander',
      euclidean: 'euclid-explorer',
      division: 'division-commander',
      palindrome: 'palindrome-specialist',
    };
    const achId = achievementMap[missionId];
    if (achId) {
      newProgress.achievements = newProgress.achievements.map(a => {
        if (a.id === achId && !a.unlockedAt) {
          return { ...a, unlockedAt: new Date().toISOString() };
        }
        return a;
      });
    }
  }

  // Check for all missions completed
  if (newProgress.missions.every(m => m.quizPassed)) {
    newProgress.achievements = newProgress.achievements.map(a => {
      if (a.id === 'math-astronaut' && !a.unlockedAt) {
        return { ...a, unlockedAt: new Date().toISOString() };
      }
      return a;
    });
  }

  // Check for all perfect scores
  if (newProgress.missions.every(m => m.quizScore === 100)) {
    newProgress.achievements = newProgress.achievements.map(a => {
      if (a.id === 'quiz-master' && !a.unlockedAt) {
        return { ...a, unlockedAt: new Date().toISOString() };
      }
      return a;
    });
  }

  return newProgress;
}
