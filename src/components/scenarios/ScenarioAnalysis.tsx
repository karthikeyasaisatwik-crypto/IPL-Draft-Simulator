import { useId, useRef, useState } from 'react';
import type { ScenarioDefinition, ScenarioDecision } from '../../engine/scenarioTypes';
import type { BallLog } from '../../engine/types';
import HighlightReplay from '../simulation/HighlightReplay';
import { oversFromBalls } from '../../engine/matchAnalysis';

export default function ScenarioAnalysis({ scenario, decisions, logs }: {
  scenario: ScenarioDefinition; decisions: ScenarioDecision[]; logs: BallLog[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const title = useId();
  const [open, setOpen] = useState(false);
  const [clip, setClip] = useState<BallLog[] | null>(null);
  const [clipTitle, setClipTitle] = useState('');
  const [replayKey, setReplayKey] = useState(0);
  const watch = (selected: BallLog[], name: string) => { setClip(selected); setClipTitle(name); setReplayKey(k => k + 1); };
  const overs = [...new Set(logs.map(b => Math.floor((b.ballNumber - 1) / 6)))].map(over => {
    const balls = logs.filter(b => Math.floor((b.ballNumber - 1) / 6) === over);
    return { over, balls, runs: balls.reduce((n, b) => n + b.runs, 0) };
  }).sort((a, b) => b.runs - a.runs);
  const partnerships: { key: string; names: string; runs: number; balls: BallLog[] }[] = [];
  for (const [i, decision] of decisions.entries()) {
    const key = [...decision.pair].sort().join('|');
    let partnership = partnerships.at(-1);
    if (!partnership || partnership.key !== key) {
      partnership = { key, names: decision.pair.join(' & '), runs: 0, balls: [] };
      partnerships.push(partnership);
    }
    partnership.runs += decision.runs;
    partnership.balls.push(logs[i]);
  }
  const moments = logs.filter(b => b.isWicket || b.runs >= 4 || b === logs.at(-1)).slice(-8);
  const button = 'rounded-lg border border-slate-600 px-3 py-2 text-sm text-sky-300 hover:bg-slate-800';
  return <>
    <button ref={trigger} className="btn-primary" aria-haspopup="dialog" onClick={() => { setOpen(true); dialog.current?.showModal(); }}>Match analysis & replays</button>
    <dialog ref={dialog} aria-labelledby={title} onClose={() => { setOpen(false); setClip(null); trigger.current?.focus(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_1rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-5 text-slate-200 backdrop:bg-black/80">
      {open && <>
        <header className="flex items-center justify-between gap-3"><h2 id={title} className="text-xl font-bold">Your scenario analysis</h2><button className={button} onClick={() => dialog.current?.close()}>Close analysis</button></header>
        <p className="my-3 text-sm text-slate-400">Only your simulated play after {oversFromBalls(scenario.initial.ballsBowled)} overs is analysed. Earlier match events are historical context.</p>
        <button className={button} onClick={() => watch(logs, 'Full scenario replay')}>Replay entire attempt</button>
        {clip && <HighlightReplay key={replayKey} logs={clip} title={clipTitle} teamName={scenario.initial.teamName} target={scenario.initial.targetScore!} maxBalls={scenario.maxBalls} onClose={() => setClip(null)} />}
        <h3 className="mb-2 mt-6 font-bold text-amber-300">Turning points</h3>
        <div className="space-y-2">{moments.map(ball => <button key={ball.ballNumber} className={`${button} w-full text-left`} onClick={() => watch(logs.filter(b => Math.abs(b.ballNumber - ball.ballNumber) <= 2), `Turning point at ${oversFromBalls(ball.ballNumber)}`)}>
          {oversFromBalls(ball.ballNumber)} · {ball.strikerName} · {ball.isWicket ? 'Wicket' : `${ball.runs} runs`}
          <span className="mt-1 block text-xs text-slate-400">{Math.max(0, scenario.initial.targetScore! - ball.currentTotal)} needed from {scenario.maxBalls - ball.ballNumber} balls · {10 - ball.currentWickets} wickets left · Watch</span>
        </button>)}</div>
        <h3 className="mb-2 mt-6 font-bold text-amber-300">Costly overs</h3>
        <div className="flex flex-wrap gap-2">{overs.slice(0, 3).map(o => <button key={o.over} className={button} onClick={() => watch(o.balls, `Over ${o.over + 1}`)}>Over {o.over + 1}: {o.runs} runs / {o.balls.length} simulated balls</button>)}</div>
        <h3 className="mb-2 mt-6 font-bold text-amber-300">Best partnerships after takeover</h3>
        <div className="space-y-2">{partnerships.sort((a, b) => b.runs - a.runs).slice(0, 3).map((p, i) => <button key={i} className={`${button} w-full text-left`} onClick={() => watch(p.balls, p.names)}>{p.names}: {p.runs} runs from {p.balls.length} balls · Watch</button>)}</div>
        <details className="mt-6"><summary className="cursor-pointer font-bold">Your decisions and their outcomes</summary><p className="my-2 text-xs text-slate-400">Outcomes also depend on chance; this records what happened after each decision.</p><ol className="space-y-2 text-xs">{decisions.map(d => <li key={d.ball} className="rounded-lg bg-slate-900 p-3">{oversFromBalls(d.ball)} · Intensity {d.tactics} · {d.plans.batting} / {d.plans.bowling} · {d.bowler} → {d.wicket ? 'Wicket' : `${d.runs} runs`}</li>)}</ol></details>
      </>}
    </dialog>
  </>;
}
