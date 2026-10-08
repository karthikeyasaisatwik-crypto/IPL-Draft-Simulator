import { useState, useEffect, useRef } from 'react';
import { useCareerStore } from '../../store/careerStore';
import { getCareerMatchSquad, generateSupportingCast, resolveBigMatchOutcome } from '../../engine/careerMatchBridge';
import { simulateChase300 } from '../../engine/simulation';
import type { BigMatchEvent, ActiveModifier } from '../../engine/careerTypes';
import { Trophy, XCircle, ChevronRight, Zap } from 'lucide-react';

interface BigMatchScreenProps {
  event: BigMatchEvent;
  onClose: () => void;
}

export function BigMatchScreen({ event, onClose }: BigMatchScreenProps) {
  const state = useCareerStore();
  const simulated = useRef(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [protagonistStats, setProtagonistStats] = useState<any>(null);
  const [outcomeModifiers, setOutcomeModifiers] = useState<ActiveModifier[]>([]);

  useEffect(() => {
    if (simulated.current) return;
    simulated.current = true;
    // Run simulation only once
    const squad = getCareerMatchSquad(state, event.quality);
    const oppBowling = Math.round(90 * event.bowlingDifficultyMultiplier);
    const oppSquad = generateSupportingCast(event.quality);
    const result = simulateChase300(squad, event.target, oppBowling, oppSquad);
    
    // Find protagonist stats
    const pStats = result.innings[0].playerStats.find((p: any) => p.player.id === 'protagonist');
    
    setMatchResult(result);
    setProtagonistStats(pStats);

    // Prepare outcomes
    const outcome = resolveBigMatchOutcome(result, pStats?.runs || 0, state.careerTier);
    setOutcomeModifiers(outcome.modifiers || []);
    
    // Apply changes
    state.applyStatChanges(outcome.statChanges);
    if (outcome.modifiers && outcome.modifiers.length > 0) {
      outcome.modifiers.forEach(mod => state.addActiveModifier(mod));
    }

    state.addBigMatchRecord({
      title: event.title,
      result: result.isWin ? 'win' : 'loss',
      playerRuns: pStats?.runs || 0,
      turnPlayed: state.currentWeek
    });

  }, [state, event]); // Guard prevents duplicate rewards under StrictMode.

  if (!matchResult) return <div>Simulating...</div>;

  const isWin = matchResult.isWin;
  const runs = protagonistStats?.runs || 0;
  const balls = protagonistStats?.balls || 0;
  const sr = protagonistStats?.strikeRate.toFixed(1) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-xl w-full p-8 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isWin ? <Trophy className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
          </div>
          <div>
            <span className="text-xs font-black tracking-widest text-slate-500 uppercase">Career Defining Moment</span>
            <h2 className="text-3xl font-black text-white">{event.title}</h2>
          </div>
        </div>

        {/* Story Context */}
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          {event.description}
        </p>

        {/* Match Summary */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 mb-8">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Match Result</h3>
          <div className="text-2xl font-bold text-white mb-2">
            Target: {event.target}
          </div>
          <div className={`text-xl font-bold mb-6 ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
            {matchResult.matchSummary}
          </div>
          
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Your Performance</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Runs</p>
              <p className="text-3xl font-black text-white">{runs}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Balls</p>
              <p className="text-3xl font-black text-white">{balls}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 uppercase font-black mb-1">Strike Rate</p>
              <p className="text-xl font-black text-white mt-1">{sr}</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4 italic">
            Dismissal: {protagonistStats?.dismissal || 'Not Out'}
          </p>

          {outcomeModifiers.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status Effect:</span>
              {outcomeModifiers.map(mod => (
                <span key={mod.id} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> {mod.label} (+{mod.perTurnDelta} Form/turn for {mod.turnsRemaining} turns)
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-full text-lg font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-colors"
        >
          Continue Career <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
