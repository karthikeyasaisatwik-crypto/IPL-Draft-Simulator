import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowRight, User, Zap, Shield, Activity, Mail } from 'lucide-react';
import { useCoachStore } from '../../store/coachStore';
import { useGameStore } from '../../store/gameStore';
import type { InningsResult } from '../../engine/types';
import CoachMailbox from './CoachMailbox';
import { useState } from 'react';

function TacticsBadge({ tactics, isBatting }: { tactics: number; isBatting: boolean }) {
  const val = typeof tactics === 'number' ? tactics : 50;
  
  if (val <= 35) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-blue-500/20 border-blue-500/40 text-blue-400 text-xs font-bold font-mono">
        <Shield className="w-3 h-3" />
        <span>{val}</span>
        <span className="text-[10px] font-sans opacity-80 font-medium">({isBatting ? 'Defense' : 'Contain'})</span>
      </span>
    );
  } else if (val <= 64) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-amber-500/20 border-amber-500/40 text-amber-400 text-xs font-bold font-mono">
        <Activity className="w-3 h-3" />
        <span>{val}</span>
        <span className="text-[10px] font-sans opacity-80 font-medium">(Balanced)</span>
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-rose-500/20 border-rose-500/40 text-rose-400 text-xs font-bold font-mono">
        <Zap className="w-3 h-3" />
        <span>{val}</span>
        <span className="text-[10px] font-sans opacity-80 font-medium">({isBatting ? 'Aggressive' : 'Attack'})</span>
      </span>
    );
  }
}

export default function CoachScorecard() {
  const result = useCoachStore((s) => s.coachMatchResult);
  const inn1Tactics = useCoachStore((s) => s.inn1Tactics);
  const inn2Tactics = useCoachStore((s) => s.inn2Tactics);
  const userBatsFirst = useCoachStore((s) => s.userBatsFirst);
  const resetCoach = useCoachStore((s) => s.resetCoach);
  const resetToMenu = useGameStore((s) => s.resetToMenu);
  const emails = useCoachStore(s => s.postMatchEmails);
  const [isMailboxOpen, setIsMailboxOpen] = useState(false);

  if (!result) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-bold animate-pulse text-accent-gold">SIMULATING MATCH...</div>
      </div>
    );
  }

  const handlePlayAgain = () => {
    resetCoach();
    resetToMenu();
  };

  const phaseNames = ['Powerplay (Ov 1-6)', 'Middle (Ov 7-16)', 'Death (Ov 17-20)'];

  return (
    <>
    <motion.div
      className="scorecard-screen w-full max-w-4xl mx-auto p-4 md:p-8 pb-24 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── MAILBOX BUTTON ── */}
      {emails.length > 0 && (
        <div className="absolute top-6 right-6 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMailboxOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg transition-colors"
          >
            <div className="relative">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 items-center justify-center text-[9px] font-bold text-white">!</span>
              </span>
            </div>
            <span className="hidden md:inline">MAIL</span>
          </motion.button>
        </div>
      )}

      {/* ── HEADER & MATCH SUMMARY ── */}
      <header className="scorecard-header text-center mb-8">
        <div className="inline-block px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black tracking-widest uppercase mb-3">
          Coach Mode Match Result
        </div>
        <h1
          className={`text-3xl md:text-5xl font-black mb-2 uppercase tracking-wide ${
            result.isWin ? 'text-emerald-400' : 'text-rose-500'
          }`}
        >
          {result.matchSummary}
        </h1>
        {result.pitchType && (
          <p className="text-xs font-bold tracking-widest text-slate-400 mb-2 uppercase">
            Pitch Conditions: <span className="text-white">{result.pitchType}</span>
          </p>
        )}
        {result.teamAnalysis.verdict && (
          <p className="text-lg font-bold text-accent-gold mb-1">
            {result.teamAnalysis.verdict}
          </p>
        )}
        {result.teamAnalysis.comment && (
          <p className="text-slate-400 text-xs md:text-sm italic max-w-xl mx-auto">
            "{result.teamAnalysis.comment}"
          </p>
        )}
      </header>

      {/* ── COACHING TACTICAL TIMELINE ── */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 mb-8 shadow-xl">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          Coaching Tactical Report (0-100 Intensity)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Innings 1 Tactics */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-3">
              1st Innings Tactics ({userBatsFirst ? 'Your Batting' : 'Your Bowling'})
            </span>
            <div className="space-y-3">
              {phaseNames.map((name, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{name}:</span>
                  <TacticsBadge
                    tactics={inn1Tactics[idx] ?? 50}
                    isBatting={userBatsFirst}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Innings 2 Tactics */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <span className="text-xs font-bold text-slate-400 uppercase block mb-3">
              2nd Innings Tactics ({!userBatsFirst ? 'Your Batting' : 'Your Bowling'})
            </span>
            <div className="space-y-3">
              {phaseNames.map((name, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{name}:</span>
                  <TacticsBadge
                    tactics={inn2Tactics[idx] ?? 50}
                    isBatting={!userBatsFirst}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── INNINGS SCORECARDS ── */}
      <div className="flex flex-col gap-8 mb-8">
        {result.innings.map((innings, idx) => (
          <InningsCard key={idx} innings={innings} index={idx} />
        ))}
      </div>

      {/* ── PLAYER OF THE MATCH ── */}
      {result.manOfTheMatch && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 mb-8 flex items-center gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase block mb-0.5">
              PLAYER OF THE MATCH
            </span>
            <h4 className="text-lg font-black text-white">{result.manOfTheMatch.player.name}</h4>
            <p className="text-xs text-slate-400">{result.manOfTheMatch.reason}</p>
          </div>
        </div>
      )}

        {/* ── RETURN CONTROLS ── */}
        <div className="flex justify-center gap-4 mt-6 mb-12">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handlePlayAgain}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 text-sm font-black uppercase tracking-wider rounded-full shadow-lg"
          >
            <span>PLAY AGAIN</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
    </motion.div>

      <AnimatePresence>
        <CoachMailbox isOpen={isMailboxOpen} onClose={() => setIsMailboxOpen(false)} />
      </AnimatePresence>
    </>
  );
}

function InningsCard({ innings, index }: { innings: InningsResult; index: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
      <div className="flex justify-between items-center bg-slate-950/80 px-5 py-3.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-slate-500 uppercase">Innings {index + 1}</span>
          <span className="text-white font-black text-lg">{innings.teamName}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">
            {innings.totalRuns}/{innings.totalWickets}
          </span>
          <span className="text-xs text-slate-400">({innings.oversBowled} ov)</span>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="pb-2">Batter</th>
              <th className="pb-2">Dismissal</th>
              <th className="pb-2 text-right w-10">R</th>
              <th className="pb-2 text-right w-10">B</th>
              <th className="pb-2 text-right w-10">4s</th>
              <th className="pb-2 text-right w-10">6s</th>
              <th className="pb-2 text-right w-14">SR</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {innings.playerStats.map((stat, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-2.5 font-bold text-white flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{stat.player.name}</span>
                  {stat.player.role === 'WK' && (
                    <span className="text-[9px] bg-slate-800 text-emerald-400 px-1 py-0.5 rounded font-bold">
                      WK
                    </span>
                  )}
                  {stat.player.role === 'All-Rounder' && (
                    <span className="text-[9px] bg-slate-800 text-amber-400 px-1 py-0.5 rounded font-bold">
                      AR
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-slate-400 italic text-[11px]">
                  {stat.balls > 0 || stat.dismissal !== 'not out' ? stat.dismissal : 'dnb'}
                </td>
                <td className="py-2.5 text-right font-black text-white">{stat.runs}</td>
                <td className="py-2.5 text-right text-slate-400">{stat.balls}</td>
                <td className="py-2.5 text-right text-slate-400">{stat.fours}</td>
                <td className="py-2.5 text-right text-slate-400">{stat.sixes}</td>
                <td className="py-2.5 text-right text-slate-300 font-mono">
                  {stat.strikeRate.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
