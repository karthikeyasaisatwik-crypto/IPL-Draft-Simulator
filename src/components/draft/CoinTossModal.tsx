import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface CoinTossModalProps {
  isOpen: boolean;
  onDecision: (userBatsFirst: boolean) => void;
}

export default function CoinTossModal({ isOpen, onDecision }: CoinTossModalProps) {
  const [tossState, setTossState] = useState<'IDLE' | 'FLIPPING' | 'USER_WON' | 'AI_WON'>('IDLE');

  if (!isOpen) return null;

  const handleToss = () => {
    setTossState('FLIPPING');
    setTimeout(() => {
      // 50/50 chance to win toss
      const userWon = Math.random() > 0.5;
      setTossState(userWon ? 'USER_WON' : 'AI_WON');
      
      // If AI won, it decides automatically after a short delay
      if (!userWon) {
        setTimeout(() => {
          const aiBatsFirst = Math.random() > 0.5; // AI logic can be smarter, but 50/50 is fine
          onDecision(!aiBatsFirst); 
        }, 2000);
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <motion.div 
        className="bg-[#1a1f2e] border border-accent-gold/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-black relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="modal-header text-center">
          <h2>MATCH TOSS</h2>
          <p className="text-muted">Win the toss to decide who bats first</p>
        </div>

        <div className="toss-body text-center" style={{ padding: '2rem 0' }}>
          <AnimatePresence mode="wait">
            {tossState === 'IDLE' && (
              <motion.div key="idle" exit={{ opacity: 0, scale: 0.8 }}>
                <button 
                  onClick={handleToss}
                  className="btn-primary" 
                  style={{ fontSize: '1.25rem', padding: '1rem 3rem' }}
                >
                  <Coins className="w-6 h-6 inline-block mr-2" />
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
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent-gold)', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Coins className="w-12 h-12 text-black" />
                </div>
              </motion.div>
            )}

            {tossState === 'USER_WON' && (
              <motion.div key="user_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-green" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>YOU WON THE TOSS!</h3>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn-primary" onClick={() => onDecision(true)}>
                    BAT FIRST
                  </button>
                  <button className="btn-secondary" onClick={() => onDecision(false)}>
                    BOWL FIRST
                  </button>
                </div>
              </motion.div>
            )}

            {tossState === 'AI_WON' && (
              <motion.div key="ai_won" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-red" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>OPPOSITION WON THE TOSS!</h3>
                <p className="text-muted">Waiting for their decision...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
