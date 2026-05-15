'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { LoginPage } from '@/components/mission/LoginPage';
import LoadingScreen from '@/components/mission/LoadingScreen';
import { Dashboard } from '@/components/mission/Dashboard';
import MissionPage from '@/components/mission/MissionPage';
import LogoutAnimation from '@/components/mission/LogoutAnimation';
import SoundControls from '@/components/mission/SoundControls';

export default function Home() {
  const currentPage = useAppStore((s) => s.currentPage);

  return (
    <div className="min-h-screen bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen"
        >
          {currentPage === 'login' && <LoginPage />}
          {currentPage === 'loading' && <LoadingScreen />}
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'mission' && <MissionPage />}
          {currentPage === 'logout' && <LogoutAnimation />}
        </motion.div>
      </AnimatePresence>

      {/* Floating sound controls - visible on all pages except loading/logout */}
      {currentPage !== 'loading' && currentPage !== 'logout' && (
        <SoundControls />
      )}
    </div>
  );
}
