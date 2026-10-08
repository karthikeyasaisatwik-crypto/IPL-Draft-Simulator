import { useEffect, useId, useRef, useState } from 'react';
import type { UnifiedMatchResult } from '../../engine/types';
import MatchAnalysisPanel from './MatchAnalysisPanel';

export default function MatchAnalysisButton({ result }: { result: UnifiedMatchResult }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
  }, [open]);
  return <>
    <div className="my-6 flex justify-center">
      <button ref={trigger} className="rounded-xl border border-sky-400/50 bg-sky-500/10 px-6 py-3 font-bold text-sky-300 transition-colors hover:bg-sky-500/20" aria-haspopup="dialog" onClick={() => setOpen(true)}>Match analysis & replays</button>
    </div>
    <dialog ref={dialog} aria-labelledby={titleId} onClose={() => { setOpen(false); trigger.current?.focus(); }} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_1rem)] max-w-4xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-600 bg-slate-950 p-0 text-white shadow-2xl backdrop:bg-black/80">
      {open && <>
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-700 bg-slate-950 p-4">
          <h2 id={titleId} className="font-bold text-white">Match analysis & replays</h2>
          <button className="shrink-0 rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800" onClick={() => dialog.current?.close()}>Back to scorecard</button>
        </header>
        <div className="px-2 sm:px-5"><MatchAnalysisPanel result={result} /></div>
      </>}
    </dialog>
  </>;
}
