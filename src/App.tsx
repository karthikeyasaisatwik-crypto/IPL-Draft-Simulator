import { useGameStore } from './store/gameStore';
import { useCoachStore } from './store/coachStore';
import MainMenu from './components/layout/MainMenu';
import DraftSetup from './components/draft/DraftSetup';
import DraftScreen from './components/draft/DraftScreen';
import ProgressTicker from './components/simulation/ProgressTicker';
import Scorecard from './components/simulation/Scorecard';
import CoachDashboard from './components/simulation/CoachDashboard';
import CoachScorecard from './components/simulation/CoachScorecard';
import RookieHub from './components/career/RookieHub';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import './index.css';
import { lazy, Suspense } from 'react';

const ScenariosScreen = lazy(() => import('./components/scenarios/ScenariosScreen'));

// ============================================================
// PLACEHOLDER SCREENS
// These will be replaced by real Simulation / Result / Campaign
// screens in future milestones.
// ============================================================

function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  const resetToMenu = useGameStore((s) => s.resetToMenu);
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-slate-200">
      <h1 className="text-4xl font-bold text-accent-gold mb-4">{title}</h1>
      <p className="text-xl text-slate-400 mb-8">{description}</p>
      <button className="btn-secondary flex items-center gap-2" onClick={resetToMenu}>
        <ArrowLeft className="w-5 h-5" />
        RETURN TO MENU
      </button>
    </div>
  );
}

const SCREEN_META: Record<string, { title: string; description: string }> = {
  MATCH: {
    title: '⚡ Match Simulation',
    description: 'The ball-by-ball simulation will appear here.',
  },
  RESULT: {
    title: '🏆 Match Result',
    description: 'Post-match summary and scorecard will be shown here.',
  },
  CAMPAIGN: {
    title: '🗓️ Campaign',
    description: 'Your Gauntlet campaign tracker will appear here.',
  },
};

// ============================================================
// MAIN APP ROOT
// ============================================================

export default function App() {
  const currentScreen = useGameStore((s) => s.currentScreen);
  const isCoachMode = useCoachStore((s) => s.isCoachMode);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col">
      {/* ── TOP BANNER ── */}
      <div className="w-full bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-accent-gold tracking-widest uppercase">
              IPL Draft Simulator
            </span>
            <span className="text-[10px] text-slate-500 tracking-wider">
              Version 2.0
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {/* 
        This wrapper is essential: it uses flex-1 to take up remaining height,
        and flex col + items-center to ensure all children components (which are 
        typically constrained by max-w-6xl) stay perfectly centered on widescreen displays.
      */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {currentScreen === 'SCENARIOS' ? (
            <Suspense fallback={<p className="p-8 text-slate-300">Loading historical scenarios…</p>}><ScenariosScreen /></Suspense>
          ) : currentScreen === 'MAIN_MENU' ? (
        <motion.div
          key="main-menu"
          className="flex-1 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <MainMenu />
        </motion.div>
      ) : currentScreen === 'DRAFT_SETUP' ? (
        <motion.div
          key="draft-setup"
          className="flex-1 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <DraftSetup />
        </motion.div>
      ) : currentScreen === 'DRAFT' ? (
        <motion.div
          key="draft"
          className="flex-1 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <DraftScreen />
        </motion.div>
      ) : currentScreen === 'COACH_DASHBOARD' ? (
        <motion.div
          key="coach-dashboard"
          className="flex-1 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <CoachDashboard />
        </motion.div>
      ) : currentScreen === 'TICKER' ? (
        <motion.div
          key="ticker"
          className="flex-1 flex flex-col items-center w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ProgressTicker />
        </motion.div>
      ) : currentScreen === 'SIMULATION' ? (
        <motion.div
            key="simulation"
            className="flex-1 flex flex-col items-center w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {isCoachMode ? <CoachScorecard /> : <Scorecard />}
          </motion.div>
        ) : currentScreen === 'CAREER_HUB' ? (
          <motion.div
            key="career-hub"
            className="flex-1 flex flex-col items-center w-full min-h-screen relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <RookieHub />
          </motion.div>
        ) : (
          <PlaceholderScreen
          key={currentScreen}
          {...(SCREEN_META[currentScreen] ?? {
            title: 'Unknown Screen',
            description: 'Something went wrong.',
          })}
        />
      )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-2 text-[10px] text-slate-500 font-medium z-50 pointer-events-none">
        Not affiliated with any official cricket board or franchise.
      </div>
    </div>
  );
}
