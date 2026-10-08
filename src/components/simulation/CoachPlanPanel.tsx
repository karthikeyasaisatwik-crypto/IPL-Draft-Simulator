import { useCoachStore } from '../../store/coachStore';
import { BATTING_PLANS, BOWLING_PLANS, describeCoachProfile } from '../../engine/coachTactics';
import { getBowlingStyle } from '../../engine/matchupMatrix';

export default function CoachPlanPanel({ isBatting }: { isBatting: boolean }) {
  const plans = useCoachStore(s => s.plans);
  const setPlans = useCoachStore(s => s.setPlans);
  const phase = useCoachStore(s => s.coachPhase);
  const userSquad = useCoachStore(s => s.userSquad);
  const aiSquad = useCoachStore(s => s.aiSquad);
  const choices = isBatting ? BATTING_PLANS : BOWLING_PLANS;
  const selected = isBatting ? plans.batting : plans.bowling;
  return (
    <details className="w-full border-t border-slate-700 pt-4">
      <summary className="cursor-pointer text-sm font-bold text-amber-300">Optional game plan · {choices.find(c => c.id === selected)?.label}</summary>
      <p className="my-3 text-xs leading-relaxed text-slate-400">Choose an approach for the next phase. It works alongside intensity and resets after the phase.</p>
      <fieldset className="grid gap-2 sm:grid-cols-2">
        <legend className="mb-2 text-xs font-bold text-white">{isBatting ? 'Batting approach' : 'Bowling plan'}</legend>
        {choices.map(choice => (
          <label key={choice.id} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 ${selected === choice.id ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 bg-slate-950'}`}>
            <input type="radio" name="coach-plan" checked={selected === choice.id} onChange={() => {
              if (isBatting) { const choicePlan = BATTING_PLANS.find(c => c.id === choice.id); if (choicePlan) setPlans({ batting: choicePlan.id }); }
              else { const choicePlan = BOWLING_PLANS.find(c => c.id === choice.id); if (choicePlan) setPlans({ bowling: choicePlan.id }); }
            }} className="mt-1 accent-amber-400" />
            <span><span className="block text-sm font-bold text-white">{choice.label}</span><span className="mt-1 block text-xs leading-relaxed text-slate-400">{choice.description}</span></span>
          </label>
        ))}
      </fieldset>
      <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-white"><input type="checkbox" checked={plans.usePlayerTraits} disabled={phase !== 'PRE_MATCH'} onChange={e => setPlans({ usePlayerTraits: e.target.checked })} />Enable player traits for this match</label>
      <p className="mt-2 text-xs text-slate-400">Traits affect both teams and lock at the first ball. Leave them off to keep the usual player behavior.</p>
      <details className="mt-4 rounded-xl border border-slate-700 p-3">
        <summary className="cursor-pointer text-sm font-bold text-sky-300">Scout strengths & weaknesses{plans.usePlayerTraits ? ' · Active' : ' · Preview'}</summary>
        <p className="my-3 text-xs text-slate-400">These are stable game tendencies, not real-world scouting ratings. Pace/spin comfort gives a small edge; slow starters settle after 12 balls, and finishers and death specialists come into play in overs 17–20.</p>
        {[{ title: 'Your XI', squad: userSquad }, { title: 'Opposition XI', squad: aiSquad }].map(team => <div key={team.title} className="mt-4">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-300">{team.title}</h4>
          <ul className="space-y-2">{team.squad.map(player => <li key={player.id} className="rounded-lg bg-slate-950 p-3">
            <p className="text-sm font-bold text-white">{player.name}<span className="ml-2 text-xs font-normal text-sky-300">{player.role === 'Bowler' || player.role === 'All-Rounder' ? getBowlingStyle(player).replaceAll('_', ' ') : player.role}</span></p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{describeCoachProfile(player)}</p>
          </li>)}</ul>
        </div>)}
      </details>
    </details>
  );
}
