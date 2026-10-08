import MatchAnalysisButton from './MatchAnalysisButton';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { ShieldAlert, Trophy, ArrowRight, User } from 'lucide-react';
import type { InningsResult, Player } from '../../engine/types';

export default function Scorecard() {
  const selectedMode = useGameStore(s => s.selectedMode);
  const result = useGameStore((s) => s.lastMatchResult);
  const draftedSquad = useGameStore((s) => s.draftedSquad);
  const resetToMenu = useGameStore((s) => s.resetToMenu);

  const userSquad = draftedSquad.filter(Boolean) as Player[];
  const topSeven = userSquad.slice(0, 7);
  const bottomFour = userSquad.slice(7, 11);
  const userMissingWk = userSquad.length === 11 && !topSeven.some((p) => p.role === 'WK');
  const userUnbalancedBowling = userSquad.length === 11 && bottomFour.filter((p) => p.role === 'Bowler' || p.role === 'All-Rounder').length < 4;

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold animate-pulse text-accent-gold">SIMULATING MATCH...</div>
      </div>
    );
  }

  return (
    <motion.div
      className="scorecard-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '6rem' }}
    >
      {/* MATCH VERDICT BANNER */}
      <header className="scorecard-header text-center mb-8">
        <h1 className={`text-4xl font-black mb-2 ${result.isTie ? 'text-amber-400' : result.isWin ? 'text-emerald-400' : 'text-rose-500'}`} style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {result.matchSummary}
        </h1>
        {result.pitchType && (
          <p className="text-sm font-semibold tracking-wider text-slate-400 mb-2">
            PITCH CONDITIONS: {result.pitchType}
          </p>
        )}
        {result.teamAnalysis.verdict && (
          <p className="text-xl font-bold text-accent-gold mb-2">
            {result.teamAnalysis.verdict}
          </p>
        )}
        {result.teamAnalysis.comment && (
          <p className="text-muted italic max-w-2xl mx-auto">
            "{result.teamAnalysis.comment}"
          </p>
        )}
      </header>
      {selectedMode !== 'CAREER_MOMENT' && <MatchAnalysisButton result={result} />}

      {/* USER PENALTY BANNERS */}
      {userMissingWk && (
        <div className="alert-box error mb-4 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">SQUAD PENALTY</h3>
            <p>NO WICKET-KEEPER: Heavy fielding penalties applied.</p>
          </div>
        </div>
      )}

      {userUnbalancedBowling && (
        <div className="alert-box error mb-8 flex items-start gap-4">
          <ShieldAlert className="w-8 h-8 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-lg mb-1">SQUAD PENALTY</h3>
            <p>UNBALANCED BOWLING: Slots 8-11 must be Bowlers/All-Rounders.</p>
          </div>
        </div>
      )}

      {/* MULTIPLE INNINGS SCORECARDS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {result.innings.map((innings, idx) => (
          <InningsScorecard key={idx} innings={innings} index={idx} />
        ))}
      </div>

      {/* MAN OF THE MATCH */}
      {result.manOfTheMatch && (
        <div className="motm-box mt-8" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Trophy className="w-10 h-10 text-accent-gold" />
          <div>
            <h3 className="font-bold text-sm text-accent-gold" style={{ letterSpacing: '0.1em' }}>PLAYER OF THE MATCH</h3>
            <p className="text-xl font-bold text-white">{result.manOfTheMatch.player.name}</p>
            <p className="text-sm text-muted">{result.manOfTheMatch.reason}</p>
          </div>
        </div>
      )}

      {/* FOOTER CONTROLS */}
      <div className="scorecard-controls mt-12 flex justify-center">
        <button className="btn-primary flex items-center gap-2" onClick={resetToMenu}>
          PLAY AGAIN <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

function InningsScorecard({ innings, index }: { innings: InningsResult, index: number }) {
  return (
    <div className="innings-card">
      <div className="flex justify-between items-end mb-4 border-b border-[rgba(255,255,255,0.1)] pb-2">
        <h2 className="text-2xl font-bold text-white">
          <span className="text-muted text-sm mr-2">INNINGS {index + 1}</span>
          {innings.teamName.toUpperCase()}
        </h2>
        <div className="text-right">
          <div className="text-3xl font-black text-white">
            {innings.totalRuns} <span className="text-muted text-2xl">/ {innings.totalWickets}</span>
          </div>
          <div className="text-sm text-accent-gold font-bold">
            {innings.oversBowled} OVERS
          </div>
        </div>
      </div>

      <div className="table-responsive" style={{ overflowX: 'auto' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs text-muted border-b border-[rgba(255,255,255,0.05)]">
              <th className="pb-2 font-medium">BATTER</th>
              <th className="pb-2 font-medium"></th>
              <th className="pb-2 font-medium text-right w-12">R</th>
              <th className="pb-2 font-medium text-right w-12">B</th>
              <th className="pb-2 font-medium text-right w-12">4s</th>
              <th className="pb-2 font-medium text-right w-12">6s</th>
              <th className="pb-2 font-medium text-right w-16">SR</th>
            </tr>
          </thead>
          <tbody>
            {innings.playerStats.map((stat, i) => (
              <tr key={i} className="border-b border-[rgba(255,255,255,0.02)] last:border-0 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                <td className="py-3 font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-muted" />
                  {stat.player.name}
                  {stat.player.role === 'WK' && <span className="text-xs bg-[rgba(255,255,255,0.1)] px-1 rounded">WK</span>}
                  {stat.player.role === 'All-Rounder' && <span className="text-xs text-accent-gold px-1">AR</span>}
                </td>
                <td className="py-3 text-sm text-muted italic">
                  {stat.balls > 0 || stat.dismissal !== 'not out' ? stat.dismissal : 'dnb'}
                </td>
                <td className="py-3 text-right font-bold text-white">{stat.runs}</td>
                <td className="py-3 text-right text-muted">{stat.balls}</td>
                <td className="py-3 text-right text-muted">{stat.fours}</td>
                <td className="py-3 text-right text-muted">{stat.sixes}</td>
                <td className="py-3 text-right text-muted">{stat.strikeRate.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
