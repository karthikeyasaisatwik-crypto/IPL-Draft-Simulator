import { useCoachStore } from '../../store/coachStore';
import { BATTING_PLANS, BOWLING_PLANS } from '../../engine/coachTactics';

export default function CoachPlanReport() {
  const history = useCoachStore(s => s.planHistory);
  if (!history.length) return null;
  return <section className="mb-6 rounded-2xl border border-slate-700 bg-slate-900 p-5" aria-label="Game plan report">
    <h2 className="text-sm font-bold text-amber-300">Your game plans</h2>
    <p className="my-2 text-xs text-slate-400">Runs and wickets during each plan. Outcomes also depend on players, pitch, intensity, and chance.</p>
    <ul className="space-y-2">{history.map((entry, index) => <li key={index} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-950 p-3 text-xs">
      <span className="text-slate-300">Innings {entry.innings} · {entry.phase} · {[...BATTING_PLANS, ...BOWLING_PLANS].find(p => p.id === entry.label)?.label}{entry.traits && ' · Player traits on'}</span>
      <span className="font-bold text-white">{entry.runs} runs · {entry.wickets} wicket{entry.wickets === 1 ? '' : 's'}</span>
    </li>)}</ul>
  </section>;
}
