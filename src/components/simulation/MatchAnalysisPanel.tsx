import { useMemo, useState } from 'react';
import type { UnifiedMatchResult } from '../../engine/types';
import { analyzeMatch } from '../../engine/matchAnalysis';
import type { MatchHighlight } from '../../engine/matchAnalysis';
import HighlightReplay from './HighlightReplay';

const categories: MatchHighlight['category'][] = ['Turning points', 'Costly overs', 'Best partnerships'];

export default function MatchAnalysisPanel({ result }: { result: UnifiedMatchResult }) {
  const analysis = useMemo(() => analyzeMatch(result), [result]);
  const [inningsIndex, setInningsIndex] = useState(0);
  const [selected, setSelected] = useState<MatchHighlight | null>(null);
  const innings = result.innings[inningsIndex];
  const current = analysis[inningsIndex];
  if (!innings || !current) return null;
  const logs = selected ? innings.ballLogs?.filter(ball => ball.ballNumber >= selected.startBall && ball.ballNumber <= selected.endBall) ?? [] : [];
  const target = result.innings.length === 1 ? 300 : inningsIndex === 1 ? result.innings[0].totalRuns + 1 : undefined;
  return <section className="my-8 min-w-0 rounded-2xl border border-slate-700 bg-slate-950 p-3 sm:p-5" aria-label="Match analysis and highlights">
    <h2 className="text-xl font-bold text-white">Match analysis & highlights</h2>
    <p className="mt-2 text-sm text-slate-400">Explore the passages that built the score, broke partnerships, and changed the chase.</p>
    <div className="my-4 flex flex-wrap gap-2" aria-label="Choose innings">{result.innings.map((inn, index) => <button key={index} aria-pressed={index === inningsIndex} onClick={() => { setInningsIndex(index); setSelected(null); }} className={`rounded-xl border px-3 py-2 text-sm ${index === inningsIndex ? 'border-amber-400 text-amber-300' : 'border-slate-700 text-slate-400'}`}>Innings {index + 1} · {inn.teamName}</button>)}</div>
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-bold text-white">{innings.totalRuns}/{innings.totalWickets} · {innings.oversBowled} overs</p>{current.complete && <button className="ticker-btn" onClick={() => setSelected({ id: 'full', category: 'Turning points', title: 'Full innings replay', detail: '', impact: '', startBall: 1, endBall: innings.ballLogs!.at(-1)!.ballNumber, replayAvailable: true })}>Replay full innings</button>}</div>
    {!current.complete && <p className="my-3 text-sm text-slate-400">Delivery records are unavailable for this innings. Over summaries are shown where available; detailed replays and partnerships need a newly simulated match.</p>}
    {selected && logs.length > 0 && <HighlightReplay key={`${inningsIndex}-${selected.id}`} logs={logs} title={selected.title} teamName={innings.teamName} target={target} onClose={() => setSelected(null)} />}
    <div className="mt-5 space-y-6">{categories.map(category => {
      const highlights = current.highlights.filter(highlight => highlight.category === category);
      if (!highlights.length) return null;
      return <section key={category} aria-label={category}><h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-amber-300">{category}</h3>
        <div className="grid gap-3 sm:grid-cols-2">{highlights.map(highlight => <article key={highlight.id} className="flex min-w-0 flex-col rounded-xl border border-slate-700 bg-slate-900 p-4">
          <h4 className="text-sm font-bold text-white">{highlight.title}</h4><p className="mt-2 text-xs leading-relaxed text-slate-300">{highlight.detail}</p><p className="my-3 text-xs leading-relaxed text-slate-400">{highlight.impact}</p>
          {highlight.replayAvailable && <button className="mt-auto self-start rounded-lg border border-sky-500/40 px-3 py-2 text-xs font-bold text-sky-300 hover:bg-sky-500/10" aria-label={`Replay ${category}: ${highlight.title}`} onClick={() => setSelected(highlight)}>Watch highlight →</button>}
        </article>)}</div>
      </section>;
    })}</div>
  </section>;
}
