const fs = require('fs');
fs.writeFileSync('src/components/career/EventModal.tsx', import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCareerStore, STAT_DIRECTIONS } from '../../store/careerStore';
import type { CareerEvent, CareerChoice } from '../../engine/careerTypes';

interface Props {
  event: CareerEvent;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  const [outcome, setOutcome] = useState<string | null>(null);
  const state = useCareerStore();

  const handleChoice = (choice: CareerChoice) => {
    if (choice.requiredStat) {
      const currentVal = state[choice.requiredStat.stat];
      if (typeof currentVal === 'number' && currentVal < choice.requiredStat.min) return;
    }

    if (choice.risky) {
      const baseChance = choice.risky.baseChance;
      const mentalityMod = choice.risky.mentalityInfluence ? (state.mentality - 50) * choice.risky.mentalityInfluence : 0;
      const finalChance = Math.max(0, Math.min(1, baseChance + mentalityMod));
      const roll = Math.random();
      const success = roll < finalChance;

      if (success) {
        state.applyStatChanges(choice.risky.onSuccess);
        setOutcome(choice.risky.successText);
      } else {
        state.applyStatChanges(choice.risky.onFailure);
        setOutcome(choice.risky.failureText);
      }
    } else if (choice.consequences) {
      state.applyStatChanges(choice.consequences);
      setOutcome(choice.outcomeText || 'Choice made.');
    }

    if (choice.setsFlag) {
      state.setFlag(choice.setsFlag, true);
    }
    // Special inventory unlocks
    if (choice.setsFlag === 'gotSponsorKit') {
      useCareerStore.setState(s => ({ equipment: [...s.equipment, 'Sponsor Kit Bat'] }));
    } else if (choice.setsFlag === 'upgradedBat') {
      useCareerStore.setState({ currentBat: 'Entry English Willow' });
    } else if (choice.setsFlag === 'gotEnergyDrink') {
      useCareerStore.getState().addSponsorship('Energy Drink Deal');
    } else if (choice.setsFlag === 'gotBatSponsor') {
      useCareerStore.getState().addSponsorship('Bat Sponsor Deal');
    } else if (choice.setsFlag === 'signedContract') {
      useCareerStore.getState().setCurrentContract('Franchise Regular Contract');
    }

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const getDeltaColorClass = (stat: string, delta: number) => {
    const dir = STAT_DIRECTIONS[stat as keyof typeof STAT_DIRECTIONS];
    if (dir === 'neutral') return delta > 0 ? 'text-blue-400' : 'text-slate-400';
    if (dir === 'good-high') return delta > 0 ? 'text-emerald-400' : 'text-rose-400';
    if (dir === 'good-low') return delta > 0 ? 'text-rose-400' : 'text-emerald-400';
    return 'text-slate-300';
  };

  const formatStatName = (key: string) => {
    return key.replace(/([A-Z])/g, ' 1').replace(/^./, str => str.toUpperCase());
  };

  if (outcome) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-900 border border-slate-700 p-8 rounded-3xl max-w-lg text-center shadow-2xl">
          <h3 className="text-xl font-black text-white mb-4">Outcome</h3>
          <p className="text-slate-300">{outcome}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-slate-700 p-6 md:p-8 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{event.category} EVENT</span>
          <h2 className="text-2xl font-black text-white mt-1 mb-3">{event.title}</h2>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">{event.description}</p>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto">
          {event.choices.map((choice, i) => {
            let isLocked = false;
            if (choice.requiredStat) {
              const currentVal = state[choice.requiredStat.stat];
              isLocked = typeof currentVal === 'number' && currentVal < choice.requiredStat.min;
            }

            let riskyPercentage: number | null = null;
            if (choice.risky) {
              const baseChance = choice.risky.baseChance;
              const mentalityMod = choice.risky.mentalityInfluence ? (state.mentality - 50) * choice.risky.mentalityInfluence : 0;
              riskyPercentage = Math.round(Math.max(0, Math.min(1, baseChance + mentalityMod)) * 100);
            }

            const consequencesToDisplay = choice.risky ? { ...choice.risky.onSuccess, ...choice.risky.onFailure } : (choice.consequences || {});

            return (
              <button
                key={i}
                onClick={() => handleChoice(choice)}
                disabled={isLocked}
                className={\lex flex-col text-left p-4 rounded-xl border transition-all \\}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white flex items-center gap-2">
                    {choice.text}
                    {riskyPercentage !== null && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        Risky ({riskyPercentage}%)
                      </span>
                    )}
                  </span>
                  {isLocked && (
                    <span className="text-[10px] text-rose-400 uppercase tracking-widest font-bold">
                      Requires {formatStatName(choice.requiredStat!.stat)} {">="} {choice.requiredStat!.min}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {Object.entries(consequencesToDisplay).map(([stat]) => {
                    if (choice.risky) {
                      return (
                        <span key={stat} className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          {formatStatName(stat)} (?)
                        </span>
                      );
                    } else {
                      const delta = choice.consequences![stat as keyof typeof choice.consequences];
                      return (
                        <span key={stat} className={\	ext-[11px] font-black uppercase tracking-wider \\}>
                          {formatStatName(stat)} {delta! > 0 ? '+' : ''}{delta}
                        </span>
                      );
                    }
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
});
