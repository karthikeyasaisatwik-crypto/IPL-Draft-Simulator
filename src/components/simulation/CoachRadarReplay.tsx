import { useEffect, useState } from 'react';
import type { BallLog } from '../../engine/types';
import MatchRadar from './MatchRadar';

export default function CoachRadarReplay({ logs, teamName }: { logs: BallLog[]; teamName: string }) {
  const [cursor, setCursor] = useState(logs.length - 1);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timeout = setTimeout(() => {
      if (cursor >= logs.length - 1) setPlaying(false);
      else setCursor(i => i + 1);
    }, 700);
    return () => clearTimeout(timeout);
  }, [playing, cursor, logs.length]);
  const delivery = logs[cursor];
  if (!delivery) return null;
  return (
    <div className="mx-auto mb-6 w-full max-w-lg">
      <p className="mb-3 text-center text-sm text-slate-300">{teamName} · Phase replay · {delivery.currentTotal}/{delivery.currentWickets} ({Math.floor(delivery.ballNumber / 6)}.{delivery.ballNumber % 6} ov)</p>
      <MatchRadar delivery={delivery} deliveries={logs.slice(0, cursor + 1)} />
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button className="ticker-btn" onClick={() => { if (cursor === logs.length - 1) setCursor(0); setPlaying(p => !p); }}>{playing ? 'Pause replay' : 'Play phase'}</button>
        <button className="ticker-btn" disabled={cursor >= logs.length - 1} onClick={() => { setPlaying(false); setCursor(i => i + 1); }}>Next ball</button>
        <label className="flex w-full items-center gap-3 text-xs text-slate-400">Delivery<input aria-label="Replay delivery" className="min-w-0 flex-1" type="range" min="0" max={logs.length - 1} value={cursor} onChange={e => { setPlaying(false); setCursor(Number(e.target.value)); }} />{cursor + 1}/{logs.length}</label>
      </div>
    </div>
  );
}
