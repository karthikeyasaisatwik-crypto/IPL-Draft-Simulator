import { useCareerStore } from '../../store/careerStore';
import { CAREER_NPCS, CAREER_GOALS, WEEKLY_FOCUSES, perkMagnitude } from '../../engine/careerExpansion';
import { Target, Users, Dumbbell } from 'lucide-react';

export default function CareerDevelopment({ disabled }: { disabled: boolean }) {
  const state = useCareerStore();
  const focusDone = state.lastFocusWeek === state.currentWeek;
  return (
    <div className="space-y-6">
      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Dumbbell className="w-5 h-5 text-cyan-400" /> Your weekly focus</h2>
          <span className="text-sm text-cyan-300">{focusDone ? 'Focus completed this week' : 'One optional action before advancing'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {WEEKLY_FOCUSES.map(focus => (
            <button key={focus.id} type="button" onClick={() => state.chooseWeeklyFocus(focus.id)}
              disabled={disabled || focusDone || state.stamina < focus.minStamina}
              className={`text-left p-4 rounded-2xl border transition-colors disabled:cursor-not-allowed ${focusDone && state.weeklyFocus === focus.id ? 'bg-cyan-950/40 border-cyan-500' : 'bg-slate-950 border-slate-700 hover:border-cyan-500 disabled:opacity-50'}`}>
              <span className="font-bold text-white block mb-2">{focus.name}</span>
              <span className="text-sm text-slate-400 leading-relaxed">{focus.description.replace('+3 batting', `+${3 + perkMagnitude(state, 'training_boost')} batting`).replace('+18 stamina', `+${Math.round(18 * (1 + perkMagnitude(state, 'recovery_boost')))} stamina`).replace('+10 bond', `+${Math.round(10 * (1 + perkMagnitude(state, 'relationship_boost')))} bond`)}</span>
              {state.stamina < focus.minStamina && <span className="text-xs text-amber-400 block mt-2">Needs {focus.minStamina} stamina</span>}
            </button>
          ))}
        </div>
        <p className="text-sm text-cyan-200 mt-4" role="status">{focusDone ? state.lastFocusSummary : 'Every focus gives 5 XP. Every completed week gives 10 XP. Earn 1 SP per 40 XP. Below 30 stamina, match batting stats drop by 15%.'}</p>
      </section>

      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-violet-400" /> Your dressing room</h2>
        <p className="text-sm text-slate-400 mb-5">A familiar face returns every third week, unless a major match takes priority. Strong bonds bring weekly support; hostile rivals cost respect and coach favor.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {CAREER_NPCS.map(npc => {
            const bond = state.relationships[npc.id];
            const supportive = bond >= (npc.role === 'Rival' ? 65 : 60);
            return (
              <article key={npc.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <span className={`text-xs uppercase tracking-wider font-bold ${npc.role === 'Rival' ? 'text-rose-400' : 'text-violet-400'}`}>{npc.role}</span>
                <h3 className="font-bold text-white mt-1 mb-2">{npc.name}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{npc.bio}</p>
                <div className="flex justify-between text-sm mb-2"><span className={supportive ? 'text-emerald-300' : bond < 25 ? 'text-rose-300' : 'text-slate-300'}>{supportive ? 'Supportive' : bond < 25 ? 'Strained' : 'Building trust'}</span><span className="text-white">{bond}/100</span></div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden" role="meter" aria-label={`${npc.name} bond`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={bond}><div className="h-full bg-violet-400 rounded-full" style={{ width: `${bond}%` }} /></div>
                <p className="text-xs leading-relaxed text-slate-500 mt-3">{npc.bonus}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-900 border border-slate-700 rounded-3xl p-5 md:p-7">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Target className="w-5 h-5 text-amber-400" /> Career goals</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CAREER_GOALS.map(goal => {
            const progress = Math.min(goal.target, goal.progress(state));
            const claimed = state.claimedGoals.includes(goal.id);
            return (
              <div key={goal.id} className="flex flex-wrap justify-between items-center gap-3 bg-slate-950 border border-slate-800 rounded-2xl p-4">
                <div className="flex-1 min-w-0"><h3 className="font-bold text-white">{goal.name}</h3><p className="text-sm text-slate-400 mt-1">{goal.description}</p><p className="text-xs text-amber-300 mt-2">{progress}/{goal.target} · {goal.sp} SP + 5 Legacy</p></div>
                <button type="button" disabled={disabled || claimed || progress < goal.target} onClick={() => state.claimGoal(goal.id)} className="min-h-11 px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-slate-950 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">{claimed ? 'Claimed' : 'Claim reward'}</button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
