import { motion } from 'framer-motion';
import { Rocket, ShieldAlert } from 'lucide-react';

interface AlienMissionModalProps {
  isOpen: boolean;
  onCommence: () => void;
}

export default function AlienMissionModal({ isOpen, onCommence }: AlienMissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <motion.div 
        className="bg-[#111827] border border-green-500/30 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_40px_rgba(34,197,94,0.15)] relative overflow-hidden"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Radar / Scanline background effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.5) 1px, transparent 1px)',
          backgroundSize: '100% 4px'
        }} />

        <div className="text-center relative z-10">
          <motion.div
            className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6"
            animate={{ 
              boxShadow: ['0 0 0 0 rgba(34, 197, 94, 0.4)', '0 0 0 20px rgba(34, 197, 94, 0)']
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ShieldAlert className="w-8 h-8 text-green-500" />
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">
            🛸 Earth's Last Stand
          </h2>
          <div className="h-1 w-24 bg-green-500 mx-auto mb-6 rounded-full" />

          <p className="text-gray-300 text-lg leading-relaxed mb-8 text-left font-medium">
            "An unknown alien squad descended from the cosmos and smashed an impossible <strong className="text-red-400">300 runs in 20 overs</strong> against Earth. Humanity's survival rests on your drafted XI. Chase down 301 runs in 120 balls to save the planet!"
          </p>

          <motion.button
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCommence}
          >
            COMMENCE CHASE <Rocket className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
