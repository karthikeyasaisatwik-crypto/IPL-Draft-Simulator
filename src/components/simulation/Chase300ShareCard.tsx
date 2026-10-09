import { useRef, useState } from 'react';
import { Check, Copy, Download, Share2, X } from 'lucide-react';
import type { UnifiedMatchResult } from '../../engine/types';

function renderPng(svg: SVGSVGElement): Promise<Blob> {
  const markup = new XMLSerializer().serializeToString(svg);
  const source = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 2160;
      canvas.height = 1200;
      const context = canvas.getContext('2d');
      if (!context) {
        URL.revokeObjectURL(source);
        reject(new Error('Could not prepare the scorecard image.'));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(source);
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not export the scorecard image.')), 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(source);
      reject(new Error('Could not render the scorecard image.'));
    };
    image.src = source;
  });
}

export default function Chase300ShareCard({ result, highScore }: { result: UnifiedMatchResult; highScore: number }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');
  const svg = useRef<SVGSVGElement>(null);
  const innings = result.innings[0];
  if (!innings) return null;

  const topBatter = [...innings.playerStats].sort((a, b) => b.runs - a.runs || b.balls - a.balls)[0];
  const remaining = Math.max(0, 300 - innings.totalRuns);
  const overs = innings.oversBowled;
  const shareText = [
    `Chase 300 · ${innings.totalRuns}/${innings.totalWickets} in ${overs} overs`,
    result.isWin ? 'Target reached! Earth is saved.' : `${remaining} runs short of 300.`,
    topBatter ? `Top batter: ${topBatter.player.name} ${topBatter.runs} (${topBatter.balls})` : '',
    `Best score: ${highScore}/300`,
  ].filter(Boolean).join('\n');

  const makePng = async () => {
    if (!svg.current) throw new Error('Scorecard preview is not ready.');
    return renderPng(svg.current);
  };
  const download = async () => {
    try {
      const blob = await makePng();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chase-300-scorecard.png';
      link.click();
      URL.revokeObjectURL(url);
      setStatus('Scorecard image downloaded.');
    } catch {
      setStatus('Could not create the scorecard image. Please try again.');
    }
  };
  const share = async () => {
    try {
      const blob = await makePng();
      const file = new File([blob], 'chase-300-scorecard.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: 'Chase 300 scorecard', text: shareText, files: [file] });
        setStatus('Scorecard shared.');
      } else if (navigator.share) {
        await navigator.share({ title: 'Chase 300 scorecard', text: shareText });
        setStatus('Match summary shared. Download the image to share the full card.');
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chase-300-scorecard.png';
        link.click();
        URL.revokeObjectURL(url);
        setStatus('File sharing is unavailable here, so the scorecard image was downloaded.');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      setStatus('Sharing failed. You can still download the scorecard image.');
    }
  };
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setStatus('Match summary copied.');
    } catch {
      setStatus('Could not copy the summary.');
    }
  };

  return <section className="my-8 rounded-2xl border border-amber-400/30 bg-slate-900/80 p-4 sm:p-6" aria-label="Share Chase 300 scorecard">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-black text-white">Your Chase 300 scorecard</h2><p className="mt-1 text-sm text-slate-400">Save it as an image or share it from your device.</p></div>
      <button type="button" className="ticker-btn" aria-expanded={open} onClick={() => { setOpen(value => !value); setStatus(''); }}>
        {open ? <><X className="h-4 w-4" /> Close card</> : <><Share2 className="h-4 w-4" /> Share scorecard</>}
      </button>
    </div>
    {open && <>
      <svg ref={svg} width="1080" height="600" className="mt-5 h-auto w-full overflow-hidden rounded-xl" viewBox="0 0 1080 600" role="img" aria-label={`Chase 300: ${innings.totalRuns} for ${innings.totalWickets} in ${overs} overs`}>
        <defs>
          <linearGradient id="chase-card-bg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#071727" /><stop offset="1" stopColor="#173957" /></linearGradient>
          <linearGradient id="chase-card-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fde68a" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
          <radialGradient id="chase-card-glow"><stop stopColor="#38bdf8" stopOpacity=".26" /><stop offset="1" stopColor="#38bdf8" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width="1080" height="600" rx="32" fill="url(#chase-card-bg)" />
        <circle cx="930" cy="92" r="310" fill="url(#chase-card-glow)" />
        <rect x="14" y="14" width="1052" height="572" rx="24" fill="none" stroke="#fbbf24" strokeOpacity=".55" strokeWidth="2" />
        <text x="64" y="75" fill="#fbbf24" fontFamily="Arial,sans-serif" fontSize="19" fontWeight="700" letterSpacing="5">IPL DRAFT SIMULATOR · SURVIVAL MODE</text>
        <text x="64" y="143" fill="#f8fafc" fontFamily="Arial,sans-serif" fontSize="52" fontWeight="900">CHASE 300</text>
        <rect x="790" y="94" width="224" height="54" rx="27" fill={result.isWin ? '#065f46' : '#1e3a5f'} />
        <text x="902" y="129" fill={result.isWin ? '#6ee7b7' : '#bae6fd'} fontFamily="Arial,sans-serif" fontSize="20" fontWeight="800" textAnchor="middle">{result.isWin ? 'TARGET REACHED' : 'CHASE COMPLETE'}</text>
        <text x="64" y="326" fill="white" fontFamily="Arial,sans-serif" fontSize="158" fontWeight="900" letterSpacing="-8">{innings.totalRuns}<tspan fill="#94a3b8" fontSize="80">/{innings.totalWickets}</tspan></text>
        <text x="70" y="378" fill="#cbd5e1" fontFamily="Arial,sans-serif" fontSize="27">PLAYER XI · {overs} OVERS</text>
        <text x="70" y="446" fill="#fbbf24" fontFamily="Arial,sans-serif" fontSize="24" fontWeight="800">{remaining ? `${remaining} RUNS SHORT` : innings.totalRuns === 300 ? 'TARGET REACHED' : `${innings.totalRuns - 300} RUNS PAST TARGET`}</text>
        <rect x="700" y="208" width="314" height="195" rx="20" fill="#071727" fillOpacity=".72" stroke="#ffffff" strokeOpacity=".13" />
        <text x="732" y="253" fill="#94a3b8" fontFamily="Arial,sans-serif" fontSize="17" fontWeight="700" letterSpacing="2">TOP BATTER</text>
        <text x="732" y="300" fill="#f8fafc" fontFamily="Arial,sans-serif" fontSize="28" fontWeight="800">{topBatter?.player.name ?? '—'}</text>
        <text x="732" y="344" fill="#fbbf24" fontFamily="Arial,sans-serif" fontSize="25" fontWeight="700">{topBatter ? `${topBatter.runs} (${topBatter.balls})` : 'No runs scored'}</text>
        <text x="732" y="378" fill="#94a3b8" fontFamily="Arial,sans-serif" fontSize="17">RUNS (BALLS)</text>
        <path d="M 64 510 H 1016" stroke="#ffffff" strokeOpacity=".16" />
        <text x="64" y="554" fill="#cbd5e1" fontFamily="Arial,sans-serif" fontSize="18">BEST CHASE: {Math.max(highScore, innings.totalRuns)}/300</text>
        <text x="1016" y="554" fill="#64748b" fontFamily="Arial,sans-serif" fontSize="17" textAnchor="end">Can your XI save Earth?</text>
      </svg>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button type="button" className="ticker-btn" onClick={share}><Share2 className="h-4 w-4" /> Share</button>
        <button type="button" className="ticker-btn" onClick={download}><Download className="h-4 w-4" /> Download PNG</button>
        <button type="button" className="ticker-btn" onClick={copySummary}><Copy className="h-4 w-4" /> Copy summary</button>
      </div>
      {status && <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-emerald-300" role="status"><Check className="h-4 w-4" />{status}</p>}
    </>}
  </section>;
}
