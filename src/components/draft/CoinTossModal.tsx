import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

interface CoinTossModalProps {
  isOpen: boolean;
  onDecision: (userBatsFirst: boolean) => void;
}

export default function CoinTossModal({ isOpen, onDecision }: CoinTossModalProps) {
  const isDual = useGameStore(s => s.isDualPlayerMode);
  const teamAName = useGameStore(s => s.teamAName);
  const teamBName = useGameStore(s => s.teamBName);

  const [tossState, setTossState] = useState<'IDLE' | 'FLIPPING' | 'TEAM_A_WON' | 'TEAM_B_WON' | 'USER_WON' | 'AI_WON'>('IDLE');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTossState('IDLE');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToss = () => {
    setTossState('FLIPPING');
    setTimeout(() => {
      const randomWin = Math.random() > 0.5;
      
      if (isDual) {
        setTossState(randomWin ? 'TEAM_A_WON' : 'TEAM_B_WON');
      } else {
        setTossState(randomWin ? 'USER_WON' : 'AI_WON');
        // AI logic
        if (!randomWin) {
          setTimeout(() => {
            const aiBatsFirst = Math.random() > 0.5; 
            onDecision(!aiBatsFirst); 
          }, 2000);
        }
      }
    }, 1500);
  };

  const handleDualDecision = (teamABatsFirst: boolean) => {
    onDecision(teamABatsFirst);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <motion.div 
        className="bg-[#1a1f2e] border border-accent-gold/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="modal-header text-center mb-8">
          <h2 className="text-2xl font-black text-white tracking-widest mb-2">MATCH TOSS</h2>
          <p className="text-slate-400 font-medium">Win the toss to decide who bats first</p>
        </div>

        <div className="toss-body text-center">
          <AnimatePresence mode="wait">
            {tossState === 'IDLE' && (
              <motion.div key="idle" exit={{ opacity: 0, scale: 0.8 }}>
                <button 
                  onClick={handleToss}
                  className="flex items-center justify-center gap-3 bg-accent-gold text-black font-black text-xl px-12 py-4 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all mx-auto"
                >
                  <Coins className="w-6 h-6" />
                  FLIP COIN
                </button>
              </motion.div>
            )}

            {tossState === 'FLIPPING' && (
              <motion.div 
                key="flipping"
                animate={{ rotateY: 3600 }}
                transition={{ duration: 1.5, ease: "linear" }}
              >
                <div className="w-24 h-24 rounded-full bg-accent-gold mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  <Coins className="w-12 h-12 text-black" />
                </div>
              </motion.div>
            )}

            {/* SINGLE PLAYER WINS */}
            {tossState === 'USER_WON' && (
              <motion.div key="user_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <h3 className="text-emerald-400 text-2xl font-black tracking-wide">YOU WON THE TOSS!</h3>
                <div className="flex gap-4 justify-center">
                  <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors" onClick={() => onDecision(true)}>
                    BAT FIRST
                  </button>
                  <button className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors" onClick={() => onDecision(false)}>
                    BOWL FIRST
                  </button>
                </div>
              </motion.div>
            )}

            {/* AI WINS */}
            {tossState === 'AI_WON' && (
              <motion.div key="ai_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-rose-400 text-2xl font-black tracking-wide mb-4">OPPOSITION WON THE TOSS!</h3>
                <p className="text-slate-400 animate-pulse">Waiting for their decision...</p>
              </motion.div>
            )}

            {/* TEAM A WINS (DUAL) */}
            {tossState === 'TEAM_A_WON' && (
              <motion.div key="team_a_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <h3 className="text-indigo-400 text-xl font-black tracking-wide">{teamAName.toUpperCase()} WON THE TOSS!</h3>
                <div className="flex gap-4 justify-center">
                  <button className="flex-1 bg-indigo-500 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-colors" onClick={() => handleDualDecision(true)}>
                    BAT FIRST
                  </button>
                  <button className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors" onClick={() => handleDualDecision(false)}>
                    BOWL FIRST
                  </button>
                </div>
              </motion.div>
            )}

            {/* TEAM B WINS (DUAL) */}
            {tossState === 'TEAM_B_WON' && (
              <motion.div key="team_b_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                <h3 className="text-emerald-400 text-xl font-black tracking-wide">{teamBName.toUpperCase()} WON THE TOSS!</h3>
                <div className="flex gap-4 justify-center">
                  <button className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors" onClick={() => handleDualDecision(false)}>
                    BAT FIRST
                  </button>
                  <button className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors" onClick={() => handleDualDecision(true)}>
                    BOWL FIRST
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
