import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCareerStore, STAT_DIRECTIONS } from '../../store/careerStore';
import type { CareerEvent, CareerChoice, ActiveModifier } from '../../engine/careerTypes';
import type { StatKey } from '../../store/careerStore';
import { CAREER_NPCS } from '../../engine/careerExpansion';
import { ChevronRight, Zap } from 'lucide-react';

interface Props {
  event: CareerEvent;
  onComplete: () => void;
}

interface ChoiceOutcome {
  choice: CareerChoice;
  text: string;
  consequences: Partial<Record<StatKey, number>>;
  modifiers: ActiveModifier[];
  apply: () => void;
}

export default function EventModal({ event, onComplete }: Props) {
  const [outcomeData, setOutcomeData] = useState<ChoiceOutcome | null>(null);
  const state = useCareerStore();
  const completed = useRef(false);



  const handleChoice = useCallback((choice: CareerChoice) => {
    if (outcomeData || (choice.requiredStat && typeof state[choice.requiredStat.stat] === 'number' && (state[choice.requiredStat.stat] as number) < choice.requiredStat.min)) return;
    let finalConsequences: Partial<Record<StatKey, number>> = {};
    let finalModifiers: ActiveModifier[] = [];
    let challengeWon = false;
    let finalOutcomeText = choice.outcomeText || 'Choice made.';

    if (choice.risky) {
      const baseChance = choice.risky.baseChance;
      const mentalityMod = choice.risky.mentalityInfluence ? (state.mentality - 50) * choice.risky.mentalityInfluence : 0;
      const finalChance = Math.max(0, Math.min(1, baseChance + mentalityMod));
      const roll = Math.random();
      const success = roll < finalChance;

      challengeWon = success;
      if (success) {
        finalConsequences = choice.risky.onSuccess || {};
        finalModifiers = choice.risky.onSuccessModifiers || [];
        finalOutcomeText = choice.risky.successText;
      } else {
        finalConsequences = choice.risky.onFailure || {};
        finalModifiers = choice.risky.onFailureModifiers || [];
        finalOutcomeText = choice.risky.failureText;
      }
    } else {
      finalConsequences = choice.consequences || {};
      finalModifiers = choice.modifiers || [];
    }

    const apply = () => {
      state.applyStatChanges(finalConsequences);
      if (choice.relationshipChanges) state.changeRelationships(choice.relationshipChanges);
      if (choice.rivalChallenge && challengeWon) state.recordRivalWin();
      if (finalModifiers.length > 0) {
        finalModifiers.forEach(m => state.addActiveModifier(m));
      }
      if (choice.setsFlag) {
        state.setFlag(choice.setsFlag, true);
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
      }
      if (choice.isCaptain !== undefined) {
        useCareerStore.setState({ isCaptain: choice.isCaptain });
      }
      if (choice.managerCommissionRate !== undefined) {
        useCareerStore.setState({ managerCommissionRate: choice.managerCommissionRate });
      }
    };

    setOutcomeData({ choice, text: finalOutcomeText, consequences: finalConsequences, modifiers: finalModifiers, apply });
  }, [state, outcomeData]);

  const handleContinue = useCallback(() => {
    if (completed.current || !outcomeData) return;
    completed.current = true;
    if (outcomeData) {
      outcomeData.apply();
    }
    onComplete();
  }, [outcomeData, onComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable]'))) return;
      if (outcomeData) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleContinue();
        }
      } else {
        const choiceIndex = parseInt(e.key) - 1;
        if (!isNaN(choiceIndex) && choiceIndex >= 0 && choiceIndex < event.choices.length) {
          const choice = event.choices[choiceIndex];
          let isLocked = false;
          if (choice.requiredStat) {
            const currentVal = state[choice.requiredStat.stat];
            isLocked = typeof currentVal === 'number' && currentVal < choice.requiredStat.min;
          }
          if (!isLocked) {
             handleChoice(choice);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [outcomeData, event, state, handleContinue, handleChoice]);

  const getDeltaColorClass = (stat: string, delta: number) => {
    const dir = STAT_DIRECTIONS[stat as keyof typeof STAT_DIRECTIONS];
    if (!dir) return 'text-slate-300 bg-slate-800 border-slate-700';
    if (dir === 'neutral') return delta > 0 ? 'text-blue-400 bg-blue-950/30 border-blue-900' : 'text-slate-400 bg-slate-800 border-slate-700';
    if (dir === 'good-high') return delta > 0 ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50' : 'text-rose-400 bg-rose-950/30 border-rose-900/50';
    if (dir === 'good-low') return delta > 0 ? 'text-rose-400 bg-rose-950/30 border-rose-900/50' : 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50';
    return 'text-slate-300 bg-slate-800 border-slate-700';
  };

  const formatStatName = (key: string) => {
    if (key === 'parentalExpectations' && state.careerTier !== 'GRASSROOTS') return 'Family Expectations';
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={event.title} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {!outcomeData ? (
          <motion.div 
            key="choices"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-900 border border-slate-700 p-8 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="mb-8 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">{event.category} EVENT</span>
              <h2 className="text-3xl font-black text-white mt-4 mb-4">{event.title}</h2>
              <p className="text-slate-300 text-lg leading-relaxed">{event.description}</p>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto">
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

                return (
                  <button
                    key={i}
                    onClick={() => handleChoice(choice)}
                    disabled={isLocked}
                    className={`flex flex-col text-left p-5 rounded-2xl border-2 transition-all ${isLocked ? 'bg-slate-950/50 border-slate-800 opacity-50 cursor-not-allowed' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500 hover:shadow-lg'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-white flex items-center gap-3 text-lg">
                        <span className="text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md text-sm border border-slate-800">{i + 1}</span>
                        {choice.text}
                        {riskyPercentage !== null && (
                          <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full font-black uppercase tracking-widest ml-2">
                            Risky ({riskyPercentage}%)
                          </span>
                        )}
                      </span>
                      {isLocked && (
                        <span className="text-xs text-rose-400 uppercase tracking-widest font-bold bg-rose-950/30 px-2 py-1 rounded-md">
                          Requires {formatStatName(choice.requiredStat!.stat)} {">="} {choice.requiredStat!.min}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="outcome"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-slate-900 border border-slate-700 p-5 sm:p-10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col items-center text-center max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-3xl font-black text-white mb-6">Outcome</h3>
            <p className="text-slate-300 text-xl leading-relaxed mb-10">{outcomeData.text}</p>
            
            <div className="w-full text-left mb-3">
              <span className="text-xs font-black tracking-widest text-slate-500 uppercase">What Changed:</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mb-10 w-full">
              {Object.entries(outcomeData.consequences).map(([stat, delta], i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={stat} 
                  className={`px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-widest shadow-sm ${getDeltaColorClass(stat, delta as number)}`}
                >
                  {formatStatName(stat)} {delta! > 0 ? '+' : ''}{delta}
                </motion.div>
              ))}

              {Object.entries(outcomeData.choice.relationshipChanges ?? {}).map(([id, delta]) => (
                <span key={id} className="px-4 py-2 rounded-xl border border-violet-700 text-sm font-bold text-violet-300">
                  {CAREER_NPCS.find(npc => npc.id === id)?.name} bond {delta! > 0 ? '+' : ''}{delta}{state.unlockedSkillNodes.includes('craft_2') && delta! > 0 ? ' (+perk bonus)' : ''}
                </span>
              ))}
              {outcomeData.modifiers.map((mod, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (Object.keys(outcomeData.consequences).length + i) * 0.1 }}
                  key={mod.id} 
                  className="px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-widest shadow-sm text-amber-400 bg-amber-950/30 border-amber-900/50 flex items-center gap-1.5"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  Status: {mod.label} ({mod.perTurnDelta > 0 ? '+' : ''}{mod.perTurnDelta} {formatStatName(mod.stat)}/wk for {mod.turnsRemaining}w)
                </motion.div>
              ))}

              {outcomeData.choice.isCaptain !== undefined && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-2 rounded-xl border text-sm font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/30 border-emerald-900/50 shadow-sm">
                   Captaincy {outcomeData.choice.isCaptain ? 'Acquired' : 'Declined'}
                 </motion.div>
              )}
            </div>

            <button 
              onClick={handleContinue}
              className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-lg flex justify-center items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
            >
              Continue to Week {state.currentWeek + 1} <ChevronRight className="w-5 h-5" />
            </button>
            <span className="text-slate-500 text-xs mt-4 uppercase tracking-widest font-bold">Press Space or Enter</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
