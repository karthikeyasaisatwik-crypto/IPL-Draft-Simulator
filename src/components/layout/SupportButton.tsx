import { useId, useRef, useState } from 'react';
import { Coffee, Copy, X } from 'lucide-react';

const SUPPORT_UPI_ID = '9392766865@axl';

export default function SupportButton() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [copyStatus, setCopyStatus] = useState('');

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_UPI_ID);
      setCopyStatus('UPI ID copied. Paste it into PhonePe or another UPI app.');
    } catch {
      setCopyStatus('Copy is unavailable. Select the UPI ID above and copy it manually.');
    }
  };

  return <>
    <button
      ref={trigger}
      type="button"
      aria-haspopup="dialog"
      onClick={() => { setCopyStatus(''); dialog.current?.showModal(); }}
      className="mb-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-bold text-amber-300 transition-colors hover:border-amber-400/60 hover:bg-amber-500/20"
    >
      <Coffee className="h-4 w-4" aria-hidden="true" />
      Support the developer
    </button>
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onClose={() => trigger.current?.focus()}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-6 text-left text-slate-200 shadow-2xl backdrop:bg-black/80"
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 id={titleId} className="flex items-center gap-2 text-lg font-bold text-white">
          <Coffee className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
          Enjoying the game?
        </h2>
        <button type="button" autoFocus aria-label="Close support dialog" onClick={() => dialog.current?.close()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </header>
      <p id={descriptionId} className="text-sm leading-relaxed text-slate-400">Buy me a coffee through PhonePe or any UPI app. Your support helps me keep building the game.</p>
      <div className="my-5 rounded-xl border border-slate-700 bg-slate-900 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Support via UPI</p>
        <p className="select-all break-all font-mono text-lg font-bold text-amber-300">{SUPPORT_UPI_ID}</p>
        <button type="button" onClick={copyUpiId} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300">
          <Copy className="h-4 w-4" aria-hidden="true" /> Copy UPI ID
        </button>
        <p role="status" className="mt-2 text-xs leading-relaxed text-slate-300">{copyStatus}</p>
      </div>
      <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
        <li>Open PhonePe or your preferred UPI app and choose to pay a UPI ID.</li>
        <li>Paste the ID and check the recipient name shown by your app.</li>
        <li>Choose any amount and complete the payment in your UPI app.</li>
      </ol>
      <p className="mt-5 text-xs leading-relaxed text-slate-500">Support is completely optional. Payments are handled in your UPI app; this game does not track or confirm them.</p>
    </dialog>
  </>;
}
