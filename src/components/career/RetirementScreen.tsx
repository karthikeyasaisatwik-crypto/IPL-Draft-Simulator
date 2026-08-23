import { useEffect, useState, useRef } from 'react';
import { useCareerStore } from '../../store/careerStore';
import { useHallOfFameStore } from '../../store/hallOfFameStore';
import { calculateLegacy, getLegacyTier } from '../../engine/hallOfFame';
import { Trophy, History } from 'lucide-react';

const TIER_TEXTS: Record<string, string> = {
  'Forgotten Prospect': 'The trials, the nets, the ambition — it never quite broke through. But you played the game on your own terms, right to the end.',
  'Domestic Veteran': 'A steady, respected career. Not every name makes the highlight reels, but the dressing room always knew what you brought.',
  'Franchise Legend': 'The franchise faithful will chant your name for years. You gave this team everything you had.',
  'Global Icon': 'You hang up your boots as a true legend of the sport. The stadiums chant your name one last time.',
  'Legend of the Game': 'Records, respect, a whole generation of players who grew up wanting to bat like you. There won\'t be another career quite like this one.'
};

export default function RetirementScreen() {
  const careerState = useCareerStore();
  const { entries, addEntry } = useHallOfFameStore();
  const [score] = useState(() => calculateLegacy(careerState));
  const [tierName] = useState(() => getLegacyTier(score));
  
  // Prevent strict mode double execution
  const hasAdded = useRef(false);

  useEffect(() => {
    if (!hasAdded.current) {
      hasAdded.current = true;
      addEntry({
        playerName: careerState.playerName,
        archetype: careerState.archetype,
        finalScore: score,
        tier: tierName,
        retirementAge: careerState.age,
        retirementWeek: careerState.currentWeek,
        isCaptain: careerState.isCaptain,
        completedAt: new Date().toISOString(),
      });
    }
  }, [careerState, score, tierName, addEntry]);

  const handleRestart = () => {
    careerState.resetCareer();
  };

  const cappedLegacy = Math.min(careerState.legacyScore, 250);
  const cappedFunds = Math.min(careerState.funds / 100, 150);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col gap-8 animate-in fade-in duration-1000">
      <header className="text-center space-y-4 mb-4">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 uppercase tracking-widest">
          Happy Retirement, {careerState.playerName}
        </h1>
        <p className="text-xl font-bold text-slate-300">
          Age {careerState.age} <span className="text-slate-600">|</span> {careerState.currentWeek} Weeks Played
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border-2 border-amber-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center">
          <Trophy className="w-16 h-16 text-amber-500 mb-6" />
          <h2 className="text-4xl font-black text-white mb-2">{score}</h2>
          <p className="text-sm uppercase tracking-widest font-bold text-amber-500 mb-8">Final Legacy Score</p>
          
          <div className="w-full bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-6">
            <h3 className="text-xl font-black text-white mb-2">{tierName}</h3>
            <p className="text-sm text-slate-400 italic">"{TIER_TEXTS[tierName]}"</p>
          </div>

          <div className="w-full space-y-3">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Legacy Points (x2, Capped 250)</span>
              <span className="text-white">+{cappedLegacy * 2}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Brand Value</span>
              <span className="text-white">+{careerState.brandValue}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Popularity</span>
              <span className="text-white">+{careerState.popularity}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Wealth Contribution</span>
              <span className="text-white">+{Math.round(cappedFunds)}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-xl flex flex-col">
          <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" /> Hall of Fame
          </h3>
          <div className="flex flex-col gap-4 overflow-y-auto pr-2">
            {entries.slice(0, 5).map((entry, i) => (
              <div key={i} className={`p-4 rounded-2xl border flex justify-between items-center ${entry.playerName === careerState.playerName && entry.finalScore === score ? 'bg-amber-500/10 border-amber-500/50' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center gap-4">
                  <div className="text-xl font-black text-slate-500">#{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-white flex items-center gap-2">
                      {entry.playerName} {entry.isCaptain && <span className="text-[10px] bg-emerald-500 text-white px-1.5 rounded-sm uppercase">C</span>}
                      {entry.archetype && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-semibold">
                          {entry.archetype === 'PRODIGY' ? 'Prodigy' : entry.archetype === 'GRINDER' ? 'Grinder' : 'All-Rounder'}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-400">{entry.tier}</p>
                  </div>
                </div>
                <div className="text-xl font-black text-amber-400">{entry.finalScore}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-auto pt-8">
            <button 
              onClick={handleRestart}
              className="w-full btn-primary py-5 rounded-full text-lg font-black uppercase tracking-wider"
            >
              Start New Career
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
