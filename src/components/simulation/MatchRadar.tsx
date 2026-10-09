import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { BallLog, DeliveryVisual } from '../../engine/types';
import { createDeliveryVisual, getFieldPositions } from '../../engine/shotVisualizer';
import { sampleDelivery } from '../../engine/deliveryAnimation';

const shotColor = (ball: BallLog) => ball.isWicket ? '#fb7185' : ball.runs === 6 ? '#c084fc' : ball.runs === 4 ? '#fbbf24' : '#94a3b8';
type RadarProps = { delivery?: BallLog; deliveries?: BallLog[]; initialOver?: number; durationMs?: number; paused?: boolean };

function PlayerDot({ x, y, color, label, active = false }: { x: number; y: number; color: string; label: string; active?: boolean }) {
  return <g transform={`translate(${x} ${y})`}><title>{label}</title>
    {active && <circle r="2.6" fill="none" stroke={color} strokeWidth=".35" opacity=".65" />}
    <ellipse cy="1.4" rx="1.7" ry=".8" fill="#020617" opacity=".35" />
    <path d="M -1.2 1.5 L -1 -.2 Q 0 -1 1 -.2 L 1.2 1.5 Z" fill={color} stroke="#082f27" strokeWidth=".25" />
    <circle cy="-.8" r=".75" fill={color} stroke="#082f27" strokeWidth=".25" />
  </g>;
}

function RadarScene({ delivery, visual, deliveries, initialOver, durationMs, paused, animate, showWheel, showLabels }: Required<Pick<RadarProps, 'deliveries' | 'initialOver' | 'durationMs' | 'paused'>> & {
  delivery?: BallLog; visual?: DeliveryVisual; animate: boolean; showWheel: boolean; showLabels: boolean;
}) {
  const still = !animate || durationMs < 200;
  const elapsed = useRef(paused ? 1 : 0);
  const wasPaused = useRef(paused);
  const [progress, setProgress] = useState(elapsed.current);
  useEffect(() => {
    if (wasPaused.current && !paused && elapsed.current >= 1) elapsed.current = 0;
    wasPaused.current = paused;
    if (still) { elapsed.current = 1; setProgress(1); return; }
    if (still || paused || !delivery || elapsed.current >= 1) return;
    let frame = 0;
    let previous: number | undefined;
    const tick = (now: number) => {
      if (previous !== undefined) elapsed.current = Math.min(1, elapsed.current + (now - previous) / Math.max(1, durationMs));
      previous = now;
      setProgress(elapsed.current);
      if (elapsed.current < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [delivery, paused, still, durationMs]);
  const frame = delivery && visual ? sampleDelivery(delivery, visual, still ? 1 : progress) : undefined;
  const fielders = visual?.fielders ?? getFieldPositions(initialOver);
  const reaction = visual?.animation?.reaction;
  const color = delivery ? shotColor(delivery) : '#94a3b8';
  const end = visual?.shotEnd;
  const loft = visual?.animation?.loft ?? (delivery?.runs === 6 ? 13 : 0);
  const shotControl = end ? { x: 50 + (end.x - 50) * .5, y: (62 + end.y) * .5 - loft * 1.2 } : undefined;
  const shotTip = frame && frame.contact && frame.phase !== 'Return throw' && frame.phase !== 'Throw to the stumps' && end
    ? frame.position : undefined;
  const partialControl = shotControl && frame ? {
    x: 50 + (shotControl.x - 50) * frame.shotProgress,
    y: 62 + (shotControl.y - 62) * frame.shotProgress,
  } : undefined;
  return <>
    <svg viewBox="0 0 100 103" className="mx-auto w-full max-w-[400px]" role="img" aria-label={`Overhead pitch: ${delivery ? delivery.isWicket ? 'wicket' : `${delivery.runs} runs` : 'awaiting delivery'}, ${visual?.shotDirection ?? 'waiting for play'}`}>
      <ellipse cx="50" cy="50" rx="46" ry="48" fill="#082f27" stroke="#164e43" strokeWidth=".6" />
      {[42, 34, 26, 18].map((r, i) => <ellipse key={r} cx="50" cy="50" rx={r} ry={r * 44 / 42} fill={i % 2 ? '#104d3b' : '#0c4032'} />)}
      <ellipse cx="50" cy="50" rx="42" ry="44" fill="none" stroke="#a7f3d0" strokeOpacity=".65" strokeWidth=".5" />
      <ellipse cx="50" cy="50" rx="22" ry="23" fill="none" stroke="#a7f3d0" strokeOpacity=".3" strokeDasharray="1 1" strokeWidth=".3" />
      <rect x="45.5" y="33" width="9" height="32" rx="1" fill="#b79b6c" />
      <rect x="47" y="35" width="6" height="28" fill="#cbb183" />
      {[37, 62].map(y => <g key={y}><path d={`M 45 ${y} H 55 M 46 ${y - 2} V ${y + 2} M 54 ${y - 2} V ${y + 2}`} stroke="#f8fafc" strokeWidth=".35" /><path d={`M 49 ${y - 1} V ${y + 1} M 50 ${y - 1} V ${y + 1} M 51 ${y - 1} V ${y + 1}`} stroke={frame?.wicket && y === 62 && reaction?.action !== 'catch' ? '#fb7185' : '#f8fafc'} strokeWidth=".45" /></g>)}
      {showWheel && deliveries.filter(b => b !== delivery && b.runs > 0 && b.visual?.shotEnd).map(b => <line key={`${b.ballNumber}-${b.strikerName}`} x1="50" y1="62" x2={b.visual!.shotEnd!.x} y2={b.visual!.shotEnd!.y} stroke={shotColor(b)} strokeOpacity=".25" strokeWidth=".45" />)}
      {visual && frame?.bounced && <circle cx={visual.bounce.x} cy={visual.bounce.y} r="1.1" fill="none" stroke="#67e8f9" strokeWidth=".4" />}
      {visual && frame?.contact && <path d={`M 50 30 L ${visual.bounce.x} ${visual.bounce.y} L 50 62`} fill="none" stroke="#67e8f9" strokeOpacity=".55" strokeWidth=".5" strokeDasharray="1 1" />}
      {shotTip && partialControl && <path d={`M 50 62 Q ${partialControl.x} ${partialControl.y} ${shotTip.x} ${shotTip.y - (frame?.height ?? 0)}`} fill="none" stroke={color} strokeWidth=".8" opacity=".82" strokeLinecap="round" />}
      {fielders.map(f => {
        const reacting = f.name === reaction?.name;
        const position = reacting && frame?.fielder && frame.contact ? frame.fielder : f.name === 'Bowler' && frame ? frame.bowler : f;
        return <g key={f.name}><PlayerDot {...position} color={reacting && frame?.contact ? '#fbbf24' : '#38bdf8'} label={f.name} active={reacting && frame?.contact} />
          {showLabels && <text x={Math.max(10, Math.min(90, position.x))} y={position.y - 3} fontSize="2.4" textAnchor="middle" fill="#e2e8f0" stroke="#082f27" strokeWidth=".65" paintOrder="stroke">{f.name}</text>}</g>;
      })}
      <PlayerDot x={48} y={frame?.strikerY ?? 62} color="#fff7ed" label="Striker" />
      <PlayerDot x={53} y={frame?.nonStrikerY ?? 37} color="#fed7aa" label="Non-striker" />
      <path d={frame?.contact && frame.shotProgress < .3 ? 'M 48 62 L 44 59' : `M 48 ${frame?.strikerY ?? 62} l 1.2 -2`} stroke="#fef3c7" strokeWidth=".8" strokeLinecap="round" />
      {frame && <g><ellipse cx={frame.position.x} cy={frame.position.y + .6} rx={frame.height ? 1.1 : .65} ry=".45" fill="#020617" opacity=".55" />
        <circle cx={frame.position.x} cy={frame.position.y - frame.height} r={frame.height ? 1.45 : 1.1} fill="#fff" stroke="#e2e8f0" strokeWidth=".35" />
        <circle cx={frame.position.x} cy={frame.position.y - frame.height} r="2.25" fill={color} opacity=".18" />
        {frame.wicket && <circle cx={reaction?.action === 'catch' ? frame.position.x : 50} cy={reaction?.action === 'catch' ? frame.position.y : 62} r="3" fill="none" stroke="#fb7185" strokeWidth=".5" />}
      </g>}
      <text x="50" y="102" textAnchor="middle" fontSize="2.6" fill="#94a3b8">{frame?.phase ?? 'Ready at the crease'}{paused && !still && progress < 1 ? ' · Paused' : ''}</text>
    </svg>
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-300"><span className="text-cyan-400">● Delivery</span><span className="text-amber-300">● Four / active fielder</span><span className="text-purple-400">● Six</span><span className="text-rose-400">● Wicket</span></div>
  </>;
}

export default function MatchRadar({ delivery, deliveries = [], initialOver = 1, durationMs = 1600, paused = false }: RadarProps) {
  const [showWheel, setShowWheel] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [animate, setAnimate] = useState(true);
  const [replay, setReplay] = useState(0);
  const reduceMotion = useReducedMotion();
  // Preserve geometry in saved logs; logs without visual data get a deterministic fallback.
  const visual = useMemo(() => delivery ? delivery.visual ?? createDeliveryVisual(delivery) : undefined, [delivery]);
  const result = delivery ? delivery.isWicket ? 'WICKET' : delivery.runs === 0 ? 'DOT BALL' : `${delivery.runs} RUN${delivery.runs === 1 ? '' : 'S'}` : 'AWAITING DELIVERY';
  return <section className="w-full min-w-0 rounded-2xl border border-slate-700 bg-slate-950 p-4" aria-label="Match Radar">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs"><h2 className="font-bold uppercase tracking-widest text-white">Match Radar</h2><span className="text-emerald-300">{visual?.fieldSetting ?? (initialOver <= 6 ? 'Powerplay' : initialOver <= 16 ? 'Middle overs' : 'Death overs')}</span></div>
    <RadarScene key={`${delivery?.bowlerName}-${delivery?.strikerName}-${delivery?.ballNumber}-${replay}-${animate}-${!!reduceMotion}`} delivery={delivery} visual={visual} deliveries={deliveries} initialOver={initialOver} durationMs={durationMs} paused={paused} animate={animate && !reduceMotion} showWheel={showWheel} showLabels={showLabels} />
    <div className="mt-4 text-center"><p className="font-black" style={{ color: delivery ? shotColor(delivery) : '#94a3b8' }}>{result}</p><p className="mt-1 text-sm text-white">{delivery?.strikerName ?? 'Ready at the crease'}</p><p className="text-xs text-slate-400">{visual?.shotDirection ?? 'Ball paths appear as play unfolds'}{delivery && ` · ${delivery.bowlerName}`}</p>
      {visual?.animation && <p className="mt-1 text-[11px] text-emerald-300/80">{visual.animation.deliveryLabel} · {visual.animation.fieldLabel}</p>}
    </div>
    <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-300"><label className="flex items-center gap-2"><input type="checkbox" checked={showWheel} onChange={e => setShowWheel(e.target.checked)} />Wagon wheel</label><label className="flex items-center gap-2"><input type="checkbox" checked={showLabels} onChange={e => setShowLabels(e.target.checked)} />Field labels</label><label className="flex items-center gap-2"><input type="checkbox" checked={animate} disabled={!!reduceMotion} onChange={e => setAnimate(e.target.checked)} />Animate</label>
      {delivery && durationMs >= 1400 && !paused && animate && !reduceMotion && <button className="rounded border border-slate-600 px-3 py-1 text-sky-300 hover:bg-slate-800" onClick={() => setReplay(r => r + 1)}>Replay ball</button>}
    </div>
    <p className="mt-3 text-center text-[10px] text-slate-500">Illustrative field & shot placement · Score reflects simulated play{reduceMotion ? ' · Reduced motion enabled' : durationMs < 200 ? ' · Fast playback shows final positions' : ''}</p>
  </section>;
}
