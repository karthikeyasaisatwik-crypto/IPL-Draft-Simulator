import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { BallLog } from '../../engine/types';
import { getFieldPositions } from '../../engine/shotVisualizer';

const shotColor = (ball: BallLog) => ball.isWicket ? '#fb7185' : ball.runs === 6 ? '#c084fc' : ball.runs === 4 ? '#fbbf24' : '#94a3b8';

export default function MatchRadar({ delivery, deliveries = [], initialOver = 1 }: { delivery?: BallLog; deliveries?: BallLog[]; initialOver?: number }) {
  const [showWheel, setShowWheel] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const reduceMotion = useReducedMotion();
  const visual = delivery?.visual;
  const result = delivery ? delivery.isWicket ? 'WICKET' : delivery.runs === 0 ? 'DOT BALL' : `${delivery.runs} RUN${delivery.runs === 1 ? '' : 'S'}` : 'AWAITING DELIVERY';
  const fielders = visual?.fielders ?? getFieldPositions(initialOver);
  return (
    <section className="w-full min-w-0 rounded-2xl border border-slate-700 bg-slate-950 p-4" aria-label="Match Radar">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <h2 className="font-bold uppercase tracking-widest text-white">Match Radar</h2>
        <span className="text-emerald-300">{visual?.fieldSetting ?? (initialOver <= 6 ? 'Powerplay' : initialOver <= 16 ? 'Middle overs' : 'Death overs')}</span>
      </div>
      <svg viewBox="0 0 100 100" className="mx-auto w-full max-w-[400px]" role="img" aria-label={`Overhead pitch: ${result}, ${visual?.shotDirection ?? 'waiting for play'}`}>
        <ellipse cx="50" cy="50" rx="46" ry="48" fill="#082f27" />
        <ellipse cx="50" cy="50" rx="42" ry="44" fill="none" stroke="#34d399" strokeOpacity=".45" strokeWidth=".4" />
        <ellipse cx="50" cy="50" rx="22" ry="23" fill="none" stroke="#34d399" strokeOpacity=".2" strokeDasharray="1 1" strokeWidth=".3" />
        <rect x="46" y="34" width="8" height="30" rx="1" fill="#a38b5f" fillOpacity=".65" />
        {[37, 62].map(y => <g key={y}><path d={`M 45 ${y} H 55`} stroke="#f8fafc" strokeWidth=".5" /><path d={`M 49 ${y - 1} V ${y + 1} M 50 ${y - 1} V ${y + 1} M 51 ${y - 1} V ${y + 1}`} stroke="#f8fafc" strokeWidth=".35" /></g>)}
        {showWheel && deliveries.filter(b => b.runs > 0 && b.visual?.shotEnd).map(b => <line key={b.ballNumber} x1="50" y1="62" x2={b.visual!.shotEnd!.x} y2={b.visual!.shotEnd!.y} stroke={shotColor(b)} strokeOpacity=".3" strokeWidth=".45" />)}
        {fielders.map(f => <g key={f.name}><circle cx={f.x} cy={f.y} r="1.25" fill="#38bdf8" stroke="#082f27" strokeWidth=".4"><title>{f.name}</title></circle>{showLabels && <text x={f.x} y={f.y - 2.5} fontSize="2.5" textAnchor="middle" fill="#cbd5e1">{f.name}</text>}</g>)}
        <circle cx="50" cy="62" r="1.5" fill="#f8fafc"><title>Striker</title></circle>
        {visual && <g key={`${delivery?.strikerName}-${delivery?.ballNumber}`}>
          <motion.path d={`M 50 30 Q ${visual.bounce.x - 4} 42 ${visual.bounce.x} ${visual.bounce.y} L 50 62`} fill="none" stroke="#22d3ee" strokeWidth=".8" strokeDasharray="1.5 1" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: .2 }} />
          <circle cx={visual.bounce.x} cy={visual.bounce.y} r=".9" fill="#22d3ee" />
          {visual.shotEnd && <><motion.line x1="50" y1="62" x2={visual.shotEnd.x} y2={visual.shotEnd.y} stroke={shotColor(delivery!)} strokeWidth="1" initial={{ pathLength: reduceMotion ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: .2, delay: .15 }} /><circle cx={visual.shotEnd.x} cy={visual.shotEnd.y} r="1.1" fill={shotColor(delivery!)} /></>}
        </g>}
      </svg>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-300"><span className="text-cyan-400">● Ball path</span><span className="text-amber-300">● Four</span><span className="text-purple-400">● Six</span><span className="text-rose-400">● Wicket</span><span className="text-sky-400">● Fielder</span></div>
      <div className="mt-4 text-center"><p className="font-black" style={{ color: delivery ? shotColor(delivery) : '#94a3b8' }}>{result}</p><p className="mt-1 text-sm text-white">{delivery?.strikerName ?? 'Ready at the crease'}</p><p className="text-xs text-slate-400">{visual?.shotDirection ?? 'Ball paths appear as play unfolds'}{delivery && ` · ${delivery.bowlerName}`}</p></div>
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" checked={showWheel} onChange={e => setShowWheel(e.target.checked)} />Wagon wheel</label><label className="flex items-center gap-2"><input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />Field labels</label></div>
      <p className="mt-3 text-center text-[10px] text-slate-500">Illustrative field & shot placement · Score reflects simulated play</p>
    </section>
  );
}
