import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { buildPlaybackFrames } from '../../engine/matchPlayback';
import MatchRadar from './MatchRadar';

export default function ProgressTicker() {
  const result = useGameStore(s => s.lastMatchResult);
  const finish = useGameStore(s => s.finishSimulation);
  const frames = useMemo(() => result ? buildPlaybackFrames(result) : [], [result]);
  const [cursor, setCursor] = useState(0);
  const [paused, setPaused] = useState(false);
  const [fast, setFast] = useState(false);
  const [skipped, setSkipped] = useState(false);
  useEffect(() => { if (!result) finish(); }, [result, finish]);
  useEffect(() => {
    if (paused || skipped || !frames.length) return;
    const frame = frames[Math.min(cursor, frames.length - 1)];
    const timeout = setTimeout(() => {
      if (cursor >= frames.length - 1) finish();
      else setCursor(i => i + 1);
    }, frame.isEnd ? 1800 : fast ? 120 : 700);
    return () => clearTimeout(timeout);
  }, [frames, cursor, paused, fast, skipped, finish]);
  if (!result || !frames.length) return null;
  const frame = frames[Math.min(cursor, frames.length - 1)];
  const innings = result.innings[frame.inningsIndex];
  const chasing = result.innings.length === 1 || frame.inningsIndex === 1;
  const target = result.innings.length === 1 ? 300 : result.innings[0].totalRuns + 1;
  const overs = `${Math.floor(frame.balls / 6)}.${frame.balls % 6}`;
  const logs = frames.slice(Math.max(0, cursor - 5), cursor + 1);
  return (
    <main className="min-h-screen w-full px-3 py-6 sm:p-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <header className="border-b border-slate-700 p-5 text-center">
          <p className="text-xs font-bold tracking-widest text-amber-400">{chasing ? `TARGET · ${target}` : 'SETTING TARGET'}</p>
          <h1 className="mt-2 text-lg font-bold text-slate-300">{frame.teamName}</h1>
          <p className="my-2 text-6xl font-black text-white">{frame.runs}<span className="text-3xl text-slate-400"> / {frame.wickets}</span></p>
          <p className="text-sm text-slate-400">{overs} OV · RR {frame.balls ? (frame.runs * 6 / frame.balls).toFixed(2) : '0.00'}{chasing && ` · Need ${Math.max(0, target - frame.runs)} off ${Math.max(0, 120 - frame.balls)} balls`}</p>
        </header>
        <div className="grid gap-5 p-4 md:grid-cols-2">
          <MatchRadar key={frame.inningsIndex} delivery={frame.delivery} deliveries={innings.ballLogs?.slice(0, frame.deliveriesShown)} />
          <section className="flex min-w-0 flex-col justify-end gap-3 rounded-2xl border border-slate-700 bg-slate-950 p-4" aria-label="Match commentary">
            <h2 className="mb-auto text-xs font-bold uppercase tracking-widest text-slate-400">Ball by ball</h2>
            {logs.map((log, i) => <p key={cursor - logs.length + i} className={`rounded-xl border border-slate-800 p-3 text-sm ${log.delivery?.isWicket ? 'text-rose-400' : log.isEnd ? 'text-amber-400' : 'text-slate-300'}`}>{log.commentary}</p>)}
          </section>
        </div>
        <footer className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-700 p-4">
          <button className="ticker-btn" onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button>
          <button className="ticker-btn" disabled={cursor >= frames.length - 1} onClick={() => { setPaused(true); setCursor(i => Math.min(i + 1, frames.length - 1)); }}>Next ball</button>
          <button className={`ticker-btn ${fast ? 'active' : ''}`} aria-pressed={fast} onClick={() => setFast(f => !f)}>{fast ? 'Normal speed' : 'Fast playback'}</button>
          <button className="ticker-btn skip" onClick={() => { setSkipped(true); finish(); }}>Skip to end</button>
        </footer>
      </div>
    </main>
  );
}
