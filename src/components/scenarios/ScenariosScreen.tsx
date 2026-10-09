import { useState } from 'react';
import { ArrowLeft, History, Swords, Shield } from 'lucide-react';
import { SCENARIOS } from '../../data/scenarios';
import { useScenarioStore } from '../../store/scenarioStore';
import { useGameStore } from '../../store/gameStore';
import { BATTING_PLANS, BOWLING_PLANS } from '../../engine/coachTactics';
import { eligibleScenarioBowlers, scenarioFinished } from '../../engine/scenarioSimulation';
import { oversFromBalls } from '../../engine/matchAnalysis';
import MatchRadar from '../simulation/MatchRadar';
import ScenarioAnalysis from './ScenarioAnalysis';

const panel = 'rounded-2xl border border-slate-700 bg-slate-900/80 p-5';
const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:border-amber-400 disabled:opacity-40';

export default function ScenariosScreen() {
  const game = useScenarioStore();
  const [selected, setSelected] = useState<string | null>(null);
  const scenario = SCENARIOS.find(s => s.id === game.scenarioId);
  const preview = SCENARIOS.find(s => s.id === selected);
  const state = game.innings;
  const finished = !!(scenario && state && scenarioFinished(state, scenario));
  const back = () => { game.leave(); setSelected(null); };
  return <main className="mx-auto w-full max-w-6xl px-4 py-6 text-slate-200">
    <button className={button} onClick={scenario || selected ? back : () => useGameStore.getState().setScreen('MAIN_MENU')}><ArrowLeft size={16} />{scenario || selected ? 'Scenario library' : 'Main menu'}</button>
    <header className="my-7"><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400"><History size={16} />History is the starting point</p><h1 className="text-3xl font-black text-white">{scenario?.title ?? 'IPL Pressure Scenarios'}</h1><p className="mt-2 text-sm text-slate-400">Take over a real match. Choose your tactics. Write your own finish.</p></header>
    {!scenario && !preview && <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{SCENARIOS.map(s => {
        const wins = (game.progress[`${s.id}:bat`]?.wins ?? 0) + (game.progress[`${s.id}:bowl`]?.wins ?? 0);
        return <button key={s.id} onClick={() => setSelected(s.id)} className={`${panel} text-left transition-colors hover:border-amber-400`}>
          <p className="text-xs text-amber-400">{s.date} · {s.difficulty} chase</p><h2 className="my-3 text-xl font-bold text-white">{s.title}</h2>
          <p className="text-sm text-slate-300">{s.initial.teamName} vs {s.bowlingTeam}</p>
          <p className="my-4 text-2xl font-black text-emerald-300">{s.initial.targetScore! - s.initial.totalRuns} off {s.maxBalls - s.initial.ballsBowled}</p>
          <p className="text-xs text-slate-400">{s.initial.totalRuns}/{s.initial.totalWickets} · {oversFromBalls(s.initial.ballsBowled)} overs · {wins ? `${wins} successful attempt${wins === 1 ? '' : 's'}` : 'Ready to take over'}</p>
          <span className="mt-5 block text-sm font-bold text-amber-300">Choose your side →</span>
        </button>;
      })}</div>
      <p className="mt-5 text-sm text-slate-400">Six historical moments. Choose to chase or defend. Completed attempts and best results are saved on this device.</p>
    </>}
    {!scenario && preview && <section className={panel}>
      <p className="text-xs text-amber-400">{preview.date} · {preview.venue}</p><h2 className="my-3 text-2xl font-bold">{preview.title}</h2><p>{preview.briefing}</p>
      <p className="my-4 text-lg text-emerald-300">{preview.initial.teamName}: {preview.initial.totalRuns}/{preview.initial.totalWickets} after {oversFromBalls(preview.initial.ballsBowled)} overs. Target {preview.initial.targetScore} in {preview.maxBalls / 6} overs.</p>
      <p className="text-sm text-slate-400">On strike: {preview.initial.playerStats[preview.initial.strikerIndex].player.name} · Partner: {preview.initial.playerStats[preview.initial.nonStrikerIndex].player.name}</p>
      <div className="my-6 grid gap-3 sm:grid-cols-2">{[true, false].map(bat => {
        const p = game.progress[`${preview.id}:${bat ? 'bat' : 'bowl'}`];
        return <div key={String(bat)}><button className={`${button} w-full`} onClick={() => game.start(preview.id, bat)}>{bat ? <Swords size={18} /> : <Shield size={18} />}{bat ? `Chase as ${preview.initial.teamName}` : `Defend as ${preview.bowlingTeam}`}</button><p className="mt-2 text-xs text-slate-400">{p ? `${p.wins} wins in ${p.attempts} completed attempts · Best score margin ${p.bestMargin! >= 0 ? '+' : ''}${p.bestMargin} runs relative to a tie` : 'No completed attempts yet'}</p></div>;
      })}</div>
      <p className="text-sm text-slate-400">Decide before each over, or each ball in the last two overs. Wickets pause play for the batting side to choose the incoming player. Ties finish as ties; no Super Over is simulated.</p>
      <details className="mt-5"><summary className="cursor-pointer text-sm font-bold">Historical lineups & game ratings</summary><div className="mt-3 grid gap-4 sm:grid-cols-2">{[preview.initial.squad, preview.initial.bowlingSquad].map((squad, i) => <div key={i}><h3 className="mb-2 font-bold">{i ? preview.bowlingTeam : preview.initial.teamName}</h3><ul className="space-y-1 text-xs text-slate-400">{squad.map(p => <li key={p.id}>{p.name} · {p.role} · BAT {p.batRating} / POW {p.powRating} / BWL {p.bwlRating}</li>)}</ul></div>)}</div></details>
      <a className="mt-4 inline-block text-sm text-sky-300 underline" href={preview.report} target="_blank" rel="noreferrer">Read the original match report (reveals result)</a>
    </section>}
    {scenario && state && <>
      <section className={`${panel} mb-5`} aria-live="polite">
        <p className="text-sm text-slate-400">You control {game.batting ? state.teamName : scenario.bowlingTeam} · Target {state.targetScore}</p>
        <div className="my-3 flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-4xl font-black text-white">{state.totalRuns}/{state.totalWickets}<span className="ml-3 text-base text-slate-400">{oversFromBalls(state.ballsBowled)} / {scenario.maxBalls / 6} ov</span></h2><p className="text-xl font-bold text-amber-300">{Math.max(0, state.targetScore! - state.totalRuns)} needed from {Math.max(0, scenario.maxBalls - state.ballsBowled)} balls</p></div>
        {!finished && <div className="flex flex-wrap gap-4 text-sm">{[state.strikerIndex, state.nonStrikerIndex].map((i, n) => <span key={i}>{state.playerStats[i].player.name}{n === 0 ? ' *' : ''} · {state.playerStats[i].runs} ({state.playerStats[i].balls})</span>)}</div>}
      </section>
      {!finished ? <div className="grid gap-5 lg:grid-cols-2"><section className={panel}>
        <h2 className="mb-4 text-lg font-bold">Your next decision</h2>
        {game.needsBatter ? <><p className="mb-3 text-sm text-amber-300">Wicket! Choose your next batter.</p><div className="grid gap-2">{state.playerStats.slice(state.nextBatterIndex - 1).map((p, i) => <button key={p.player.id} className={button} onClick={() => game.selectBatter(state.nextBatterIndex - 1 + i)}>{p.player.name} · BAT {p.player.batRating} / POW {p.player.powRating}</button>)}</div></> : <>
          <label className="block text-sm">Intensity: {game.tactics}<input aria-label="Tactical intensity" className="my-3 w-full accent-amber-400" type="range" min="0" max="100" value={game.tactics} onChange={e => game.configure({ tactics: Number(e.target.value) })} /></label>
          <p className="mb-4 text-xs text-slate-400">{game.batting ? 'Higher intensity increases power and wicket risk. Lower intensity protects your wickets.' : 'Higher intensity hunts wickets but risks boundaries. Lower intensity restricts scoring.'}</p>
          <div className="grid gap-2 sm:grid-cols-2">{(game.batting ? BATTING_PLANS : BOWLING_PLANS).map(plan => <button key={plan.id} aria-pressed={(game.batting ? game.plans.batting : game.plans.bowling) === plan.id} className={`rounded-xl border p-3 text-left text-sm ${(game.batting ? game.plans.batting : game.plans.bowling) === plan.id ? 'border-amber-400 bg-amber-400/10' : 'border-slate-700 hover:border-slate-500'}`} onClick={() => game.configure({ plans: game.batting ? { ...game.plans, batting: plan.id as typeof game.plans.batting } : { ...game.plans, bowling: plan.id as typeof game.plans.bowling } })}><span className="block font-bold">{plan.label}</span><span className="mt-1 block text-xs text-slate-400">{plan.description}</span></button>)}</div>
          {!game.batting && <label className="mt-5 block text-sm">{state.ballsBowled % 6 ? 'Current bowler (locked until over ends)' : 'Choose bowler'}<select aria-label="Choose bowler" disabled={state.ballsBowled % 6 !== 0} className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 p-3" value={eligibleScenarioBowlers(state, scenario).some(p => p.id === game.preferredBowler) ? game.preferredBowler : eligibleScenarioBowlers(state, scenario)[0]?.id ?? ''} onChange={e => game.configure({ preferredBowler: e.target.value })}>{eligibleScenarioBowlers(state, scenario).map(p => <option key={p.id} value={p.id}>{p.name} · {scenario.maxBowlerBalls - (state.bowlerBalls[p.id] ?? 0)} balls left</option>)}</select></label>}
          <div className="mt-5 flex flex-wrap gap-3">{scenario.maxBalls - state.ballsBowled <= 12 && <button className={button} onClick={() => game.advance(1)}>Play next ball</button>}<button className={`${button} !border-amber-500 !text-amber-300`} onClick={() => game.advance(6)}>Play to end of over</button></div>
          <p className="mt-3 text-xs text-slate-500">Play pauses at wickets and over breaks. Plans remain selected until you change them.</p>
        </>}
        {game.error && <p role="alert" className="mt-3 text-rose-300">{game.error}</p>}
        <details className="mt-5 text-sm"><summary className="cursor-pointer">Bowling quotas & batting scorecard</summary><div className="mt-3 space-y-1 text-xs">{state.bowlingSquad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder').map(p => <p key={p.id}>{p.name}: {oversFromBalls(state.bowlerBalls[p.id] ?? 0)} / {scenario.maxBowlerBalls / 6} overs</p>)}<hr className="my-3 border-slate-700" />{state.playerStats.map((p, i) => <p key={p.player.id}>{p.player.name}: {i >= state.nextBatterIndex ? 'yet to bat' : `${p.runs} (${p.balls}) · ${p.dismissal}`}</p>)}</div></details>
      </section><div><MatchRadar delivery={state.ballLogs?.at(-1)} deliveries={state.ballLogs} initialOver={scenario.maxBalls < 120 ? 20 : Math.floor(state.ballsBowled / 6) + 1} /><ol className="mt-3 space-y-1 text-xs text-slate-400">{state.ballLogs?.slice(-6).map(b => <li key={b.ballNumber}>{oversFromBalls(b.ballNumber)} · {b.strikerName} vs {b.bowlerName} · {b.isWicket ? 'WICKET' : `${b.runs} run${b.runs === 1 ? '' : 's'}`}</li>)}</ol></div></div> : <section className={panel}>
        <h2 className="text-2xl font-black text-amber-300">{state.totalRuns === state.targetScore! - 1 ? 'Match tied' : (game.batting ? state.totalRuns >= state.targetScore! : state.totalRuns < state.targetScore! - 1) ? 'Scenario won!' : 'Scenario lost'}</h2>
        <div className="my-5 grid gap-4 sm:grid-cols-2"><div className="rounded-xl bg-slate-950 p-4"><h3 className="font-bold text-emerald-300">Your finish</h3><p className="mt-2">{state.teamName} {state.totalRuns}/{state.totalWickets}</p><p className="mt-1 text-xs text-slate-400">{state.totalRuns - scenario.initial.totalRuns} runs, {state.totalWickets - scenario.initial.totalWickets} wickets in {state.ballsBowled - scenario.initial.ballsBowled} balls since takeover.</p></div><div className="rounded-xl bg-slate-950 p-4"><h3 className="font-bold text-sky-300">What happened in history</h3><p className="mt-2 text-sm">{scenario.historicalResult}</p><p className="mt-1 text-xs text-slate-400">Historical chase total: {scenario.historicalScore}</p><a className="mt-2 inline-block text-xs text-sky-300 underline" href={scenario.report} target="_blank" rel="noreferrer">Original match report</a></div></div>
        <div className="flex flex-wrap gap-3"><ScenarioAnalysis scenario={scenario} logs={state.ballLogs ?? []} decisions={game.decisions} /><button className={button} onClick={() => game.start(scenario.id, game.batting, game.startingSeed)}>Retry same conditions</button><button className={button} onClick={() => game.start(scenario.id, game.batting)}>Try new variation</button><button className={button} onClick={back}>Choose another scenario</button></div>
        <p className="mt-3 text-xs text-slate-400">Same conditions reuses the random seed; identical decisions reproduce the attempt. New variation changes the seed.</p>
      </section>}
    </>}
    {game.storageWarning && <p role="status" className="mt-4 text-sm text-amber-300">Browser storage is unavailable. Results will last only for this session.</p>}
    <footer className="mt-8 space-y-2 text-xs leading-relaxed text-slate-500"><p>Starting scores, lineups and bowling usage derived from <a className="text-sky-400 underline" href="https://cricsheet.org/" target="_blank" rel="noreferrer">Cricsheet</a> under the <a className="text-sky-400 underline" href="https://opendatacommons.org/licenses/by/1-0/" target="_blank" rel="noreferrer">ODC Attribution License 1.0</a>. Snapshots include impact substitutions at takeover.</p><p>Historical player ratings and balanced pitch effects are game estimates. Simulated deliveries use the existing simplified engine, rather than historical ball outcomes. All historical players are included separately from the current draft pool.</p></footer>
  </main>;
}
