import { motion } from 'framer-motion';
import { Target, AlertTriangle } from 'lucide-react';
import { useCoachStore } from '../../store/coachStore';

export default function MatchupMatrix() {
  const keyMatchups = useCoachStore(s => s.keyMatchups);
  const userSquad = useCoachStore(s => s.userSquad);
  const aiSquad = useCoachStore(s => s.aiSquad);

  if (!keyMatchups || keyMatchups.length === 0) return null;

  const getPlayer = (id: string) => {
    return userSquad.find(p => p.id === id) || aiSquad.find(p => p.id === id);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl p-4 mb-8">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Key Tactical Match-ups</h3>
      <div className="flex flex-col gap-3">
        {keyMatchups.map((matchup, idx) => {
          const p1 = getPlayer(matchup.playerId1);
          const p2 = getPlayer(matchup.playerId2);
          if (!p1 || !p2) return null;
          
          const isAdvantage = matchup.type === 'ADVANTAGE';
          
          return (
            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className={"flex items-center gap-4 p-3 rounded-xl border "}>
              <div className="flex-shrink-0">
                {isAdvantage ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Target className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{p1.name}</span>
                  <span className="text-slate-500 text-xs font-mono">vs</span>
                  <span className="font-bold text-white text-sm">{p2.name}</span>
                </div>
                <p className={"text-xs "}>{matchup.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
