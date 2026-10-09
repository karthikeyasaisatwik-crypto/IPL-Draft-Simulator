import { useEffect, useRef, useState } from 'react';
import type { BallLog } from '../../engine/types';
import { oversFromBalls } from '../../engine/matchAnalysis';
import MatchRadar from './MatchRadar';

export default function HighlightReplay({ logs, title, teamName, target, maxBalls = 120, onClose }: {
  logs: BallLog[]; title: string; teamName: string; target?: number; maxBalls?: number; onClose: () => void;
}) {
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fast, setFast] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    if (!playing) return;
    const timeout = setTimeout(() => {
      if (cursor >= logs.length - 1) setPlaying(false);
      else setCursor(i => i + 1);
    }, fast ? 450 : 900);
    return () => clearTimeout(timeout);
  }, [playing, cursor, fast, logs.length]);
  const delivery = logs[cursor];
  if (!delivery) return null;
  return <section className="my-5 rounded-2xl border border-sky-500/40 bg-slate-900 p-3 sm:p-5" aria-label="Highlight replay">
    <div className="mb-3 flex items-start justify-between gap-3"><h3 tabIndex={-1} ref={heading} className="scroll-mt-24 text-base font-bold text-white">{title}</h3><button onClick={onClose} className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-300">Close replay</button></div>
    <p className="mb-2 text-center text-sm text-slate-300">{teamName} · {delivery.currentTotal}/{delivery.currentWickets} · {oversFromBalls(delivery.ballNumber)} ov</p>
    {target !== undefined && <p className="mb-3 text-center text-xs text-amber-300">Target {target} · {Math.max(0, target - delivery.currentTotal)} needed from {Math.max(0, maxBalls - delivery.ballNumber)} balls</p>}
    <div className="mx-auto max-w-lg"><MatchRadar delivery={delivery} deliveries={logs.slice(0, cursor + 1)} durationMs={fast ? 400 : 850} paused={!playing} /></div>
    <p className="my-3 text-center text-sm text-slate-200">{delivery.strikerName} · {delivery.isWicket ? `OUT — ${delivery.dismissalText ?? 'Wicket'}` : delivery.runs ? `${delivery.runs} run${delivery.runs === 1 ? '' : 's'}` : 'Dot ball'}</p>
    <div className="flex flex-wrap justify-center gap-2">
      <button className="ticker-btn" onClick={() => { if (cursor === logs.length - 1) setCursor(0); setPlaying(p => !p); }}>{playing ? 'Pause replay' : cursor === logs.length - 1 ? 'Replay again' : 'Play replay'}</button>
      <button className="ticker-btn" disabled={cursor === 0} onClick={() => { setPlaying(false); setCursor(i => i - 1); }}>Previous ball</button>
      <button className="ticker-btn" disabled={cursor === logs.length - 1} onClick={() => { setPlaying(false); setCursor(i => i + 1); }}>Next ball</button>
      <button className="ticker-btn" aria-pressed={fast} onClick={() => setFast(f => !f)}>{fast ? 'Speed: 2×' : 'Speed: 1×'}</button>
    </div>
    <label className="mt-4 flex items-center gap-3 text-xs text-slate-300">Replay position<input aria-label="Replay position" className="min-w-0 flex-1 accent-sky-400" type="range" min="0" max={logs.length - 1} value={cursor} onChange={e => { setPlaying(false); setCursor(Number(e.target.value)); }} />{cursor + 1}/{logs.length}</label>
    <p className="mt-2 text-center text-xs text-slate-400">{cursor === logs.length - 1 ? 'End of highlight' : playing ? 'Playing' : 'Paused'} · Wagon wheel shows this replay segment</p>
  </section>;
}
