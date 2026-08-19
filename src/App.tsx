import { useGameStore } from './store/gameStore';
import MainMenu from './components/layout/MainMenu';
import DraftScreen from './components/draft/DraftScreen';
import ProgressTicker from './components/simulation/ProgressTicker';
import Scorecard from './components/simulation/Scorecard';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import './index.css';

// ============================================================
// PLACEHOLDER SCREENS
// These will be replaced by real Simulation / Result / Campaign
// screens in future milestones.
// ============================================================

function PlaceholderScreen({ title, description }: { title: string; description: string }) {
  const resetToMenu = useGameStore((s) => s.resetToMenu);

  return (
    <motion.div
      className="placeholder-screen"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="btn-back" onClick={resetToMenu}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ArrowLeft className="w-4 h-4" />
          Back to Menu
        </span>
      </button>
    </motion.div>
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
// APP ROOT
// ============================================================

export default function App() {
  const currentScreen = useGameStore((s) => s.currentScreen);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-slate-200 overflow-hidden">
      {/* Top Banner */}
      <div className="w-full bg-black/40 text-center py-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase border-b border-white/5 z-50">
        UNOFFICIAL FAN DRAFT GAME
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex flex-col items-center w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentScreen === 'MAIN_MENU' ? (
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
          <Scorecard />
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
