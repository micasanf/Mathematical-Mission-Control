import { create } from 'zustand';
import { type UserProgress, loadProgress, saveProgress, updateMissionProgress, unlockAchievement } from '@/lib/progressTracker';

export type AppPage = 'login' | 'loading' | 'dashboard' | 'mission' | 'logout' | 'achievements';

interface AppState {
  currentPage: AppPage;
  username: string;
  currentMissionId: string | null;
  progress: UserProgress | null;
  loadingTarget: AppPage;
  loadingMissionId: string | null;
  soundEnabled: boolean;

  setPage: (page: AppPage) => void;
  login: (username: string) => void;
  logout: () => void;
  selectMission: (missionId: string) => void;
  setLoading: (target: AppPage, missionId?: string | null) => void;
  finishLoading: () => void;
  updateProgress: (missionId: string, update: { quizScore?: number | null; quizPassed?: boolean; completed?: boolean; sectionViewed?: string }) => void;
  setSoundEnabled: (enabled: boolean) => void;
  loadUserProgress: (username: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'login',
  username: '',
  currentMissionId: null,
  progress: null,
  loadingTarget: 'dashboard',
  loadingMissionId: null,
  soundEnabled: true,

  setPage: (page) => set({ currentPage: page }),

  login: (username) => {
    const progress = loadProgress(username);
    set({ username, progress });
  },

  logout: () => {
    set({ currentPage: 'logout', currentMissionId: null });
  },

  selectMission: (missionId) => {
    set({ currentMissionId: missionId });
  },

  setLoading: (target, missionId = null) => {
    set({ currentPage: 'loading', loadingTarget: target, loadingMissionId: missionId });
  },

  finishLoading: () => {
    const { loadingTarget, loadingMissionId } = get();
    set({
      currentPage: loadingTarget,
      currentMissionId: loadingMissionId,
    });
  },

  updateProgress: (missionId, update) => {
    const { progress } = get();
    if (!progress) return;

    let newProgress = { ...progress };
    const missionUpdate: Record<string, unknown> = {};

    if (update.sectionViewed) {
      const existing = progress.missions.find(m => m.id === missionId);
      if (existing && !existing.sectionsViewed.includes(update.sectionViewed)) {
        missionUpdate.sectionsViewed = [...existing.sectionsViewed, update.sectionViewed];
      }
    }

    if (update.quizScore !== undefined) missionUpdate.quizScore = update.quizScore;
    if (update.quizPassed !== undefined) missionUpdate.quizPassed = update.quizPassed;
    if (update.completed !== undefined) missionUpdate.completed = update.completed;

    newProgress = updateMissionProgress(newProgress, missionId, missionUpdate);

    // Check for new achievements
    const oldAchievementIds = progress.achievements.filter(a => a.unlockedAt).map(a => a.id);
    const newAchievements = newProgress.achievements.filter(a => a.unlockedAt && !oldAchievementIds.includes(a.id));

    if (newAchievements.length > 0) {
      // Achievement sound will be triggered by the component
    }

    newProgress.totalQuizzesPassed = newProgress.missions.filter(m => m.quizPassed).length;
    saveProgress(newProgress);
    set({ progress: newProgress });

    return newAchievements;
  },

  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

  loadUserProgress: (username) => {
    const progress = loadProgress(username);
    set({ progress });
  },
}));
