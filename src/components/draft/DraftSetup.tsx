import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, User, Play } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export default function DraftSetup() {
  const setDualPlayerMode = useGameStore(s => s.setDualPlayerMode);
  const setTeamNames = useGameStore(s => s.setTeamNames);
  const startDualDraft = useGameStore(s => s.startDualDraft);
  const resetToMenu = useGameStore(s => s.resetToMenu);
  
  const [mode, setMode] = useState<'AI' | 'DUAL'>('AI');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');

  const handleStart = () => {
    if (mode === 'DUAL') {
      setDualPlayerMode(true);
      setTeamNames(team1 || 'Team 1', team2 || 'Team 2');
      startDualDraft();
    } else {
      setDualPlayerMode(false);
      useGameStore.setState({ currentScreen: 'DRAFT' });
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 mt-4 sm:mt-12">
      <header className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12">
        <button onClick={resetToMenu} className="flex items-center gap-2 min-h-11 shrink-0 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Menu</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider text-center w-full sm:w-auto">H2H Match Setup</h1>
        <div className="hidden sm:block w-24 shrink-0" /> {/* Spacer for centering */}
      </header>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('AI')}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
            mode === 'AI' 
              ? 'bg-slate-800 border-accent-gold text-white shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          <User className={`w-16 h-16 mb-4 ${mode === 'AI' ? 'text-accent-gold' : 'text-slate-500'}`} />
          <h2 className="text-2xl font-bold mb-2">Play vs AI</h2>
          <p className="text-center text-sm opacity-80">Draft your XI against the computer</p>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('DUAL')}
          className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all ${
            mode === 'DUAL' 
              ? 'bg-slate-800 border-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
          }`}
        >
          <Users className={`w-16 h-16 mb-4 ${mode === 'DUAL' ? 'text-indigo-400' : 'text-slate-500'}`} />
          <h2 className="text-2xl font-bold mb-2">Pass & Play</h2>
          <p className="text-center text-sm opacity-80">2 Players take turns drafting on this device</p>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'DUAL' && (
          <motion.div 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="w-full max-w-2xl flex flex-col gap-6 mb-12"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Team 1 Name (Drafts First)</label>
              <input 
                type="text" 
                value={team1}
                onChange={e => setTeam1(e.target.value)}
                placeholder="e.g., Super Strikers"
                maxLength={25}
                className="bg-slate-900 border-2 border-slate-700 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Team 2 Name</label>
              <input 
                type="text" 
                value={team2}
                onChange={e => setTeam2(e.target.value)}
                placeholder="e.g., Royal Challengers"
                maxLength={25}
                className="bg-slate-900 border-2 border-slate-700 rounded-xl px-6 py-4 text-white text-lg focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStart}
        className="flex items-center gap-3 bg-white text-slate-950 font-black text-lg sm:text-xl px-6 sm:px-12 py-4 sm:py-5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
      >
        <Play className="w-6 h-6 fill-current" />
        START DRAFT
      </motion.button>
    </div>
  );
}
