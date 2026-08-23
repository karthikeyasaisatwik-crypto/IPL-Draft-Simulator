import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Swords,
  ChevronRight,
  Target,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { useCoachStore } from '../../store/coachStore';
import { useGameStore } from '../../store/gameStore';
import type { PartialInningsState, Player } from '../../engine/types';
import CoinTossModal from '../draft/CoinTossModal';
import CoachScorecard from './CoachScorecard';
import MatchupMatrix from './MatchupMatrix';

// ============================================================
// FLUID TACTICAL SLIDER COMPONENT (0 to 100)
// ============================================================

export function getTacticsLabel(val: number, isBatting: boolean) {
  if (val <= 35) {
    return {
      title: 'Defensive (Protect Wickets / Contain Runs)',
      sub: isBatting ? 'Batting: +15% Survival, -15% Power' : 'Bowling: -15% Conceded Boundaries, -20% Wicket Chances',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
      accent: 'accent-blue-400',
    };
  } else if (val <= 64) {
    return {
      title: 'Balanced',
      sub: 'Standard execution across all departments',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
      accent: 'accent-amber-400',
    };
  } else {
    return {
      title: 'Aggressive (Hunt Boundaries / Attack Wickets)',
      sub: isBatting ? 'Batting: +15% Power, +20% Wicket Risk' : 'Bowling: +15% Bowling Rating, +20% Wickets, Concedes Boundaries',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/30',
      accent: 'accent-rose-400',
    };
  }
}

function TacticsSlider({
  value,
  onChange,
  isBatting,
}: {
  value: number;
  onChange: (val: number) => void;
  isBatting: boolean;
}) {
  const info = getTacticsLabel(value, isBatting);

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 flex flex-col items-center gap-4 shadow-xl">
      <div className="w-full flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-rose-400" />
          Tactical Intensity Slider
        </span>
        <span className={`text-xs font-black font-mono px-3 py-1 rounded-full border ${info.bg} ${info.color}`}>
          {value} / 100
        </span>
      </div>

      {/* Slider */}
      <div className="w-full px-2 py-2">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none transition-all"
        />
        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mt-2 px-1 tracking-wider">
          <span className="text-blue-400/80">0 (MAX DEFENSE)</span>
          <span className="text-amber-400/80">50 (BALANCED)</span>
          <span className="text-rose-400/80">100 (MAX ATTACK)</span>
        </div>
      </div>

      {/* Dynamic Label Display */}
      <div className={`w-full text-center py-3 px-4 rounded-xl border ${info.bg} flex flex-col items-center gap-0.5 transition-all`}>
        <span className={`font-black text-sm tracking-wide ${info.color}`}>{info.title}</span>
        <span className="text-[11px] text-slate-400 font-medium">{info.sub}</span>
      </div>
    </div>
  );
}

// ============================================================
// EXPLICIT BOWLER ASSIGNMENT SELECTOR
// Allows coaches to designate primary and secondary bowlers
// for the upcoming phase with strict 4-over quota validation.
// ============================================================

function BowlerAssignmentSelector({
  squad,
  partial,
  primaryBowlerId,
  secondaryBowlerId,
  onPrimaryChange,
  onSecondaryChange,
}: {
  squad: Player[];
  partial: PartialInningsState | null;
  primaryBowlerId: string;
  secondaryBowlerId: string;
  onPrimaryChange: (id: string) => void;
  onSecondaryChange: (id: string) => void;
}) {
  const eligibleBowlers = squad.filter(
    (p) => p.role === 'Bowler' || p.role === 'All-Rounder'
  );

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-400" />
          Explicit Bowler Assignments
        </span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          4 Overs Max Quota
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Primary Bowler Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400">
            Select Primary Bowler
          </label>
          <select
            value={primaryBowlerId}
            onChange={(e) => onPrimaryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">-- Auto Selection (AI Choice) --</option>
            {eligibleBowlers.map((p) => {
              const balls = partial?.bowlerBalls?.[p.id] || 0;
              const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
              const isMaxQuota = balls >= 24;

              return (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={isMaxQuota}
                  className="bg-slate-900 text-white disabled:text-slate-600"
                >
                  {p.name} ({p.role}) — {overs}/4 ov {isMaxQuota ? '(Quota Maxed)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Secondary Bowler Dropdown */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400">
            Select Secondary Bowler
          </label>
          <select
            value={secondaryBowlerId}
            onChange={(e) => onSecondaryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="">-- Auto Selection (AI Choice) --</option>
            {eligibleBowlers.map((p) => {
              const balls = partial?.bowlerBalls?.[p.id] || 0;
              const overs = `${Math.floor(balls / 6)}.${balls % 6}`;
              const isMaxQuota = balls >= 24;

              return (
                <option
                  key={p.id}
                  value={p.id}
                  disabled={isMaxQuota}
                  className="bg-slate-900 text-white disabled:text-slate-600"
                >
                  {p.name} ({p.role}) — {overs}/4 ov {isMaxQuota ? '(Quota Maxed)' : ''}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic text-center">
        Engine prioritizes Primary Bowler, checks Secondary Bowler on consecutive overs / quota limit, and falls back to auto-selection.
      </p>
    </div>
  );
}

// ============================================================
// PHASE SUMMARY (shows current score at intervention)
// ============================================================

function PhaseSummary({ partial, label }: { partial: PartialInningsState; label: string }) {
  const overs = `${Math.floor(partial.ballsBowled / 6)}.${partial.ballsBowled % 6}`;
  const runRate = partial.ballsBowled > 0
    ? ((partial.totalRuns / partial.ballsBowled) * 6).toFixed(2)
    : '0.00';

  // Find top scorer
  const topScorer = [...partial.playerStats]
    .filter(ps => ps.balls > 0)
    .sort((a, b) => b.runs - a.runs)[0];

  return (
    <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</h3>

      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-black text-white">{partial.totalRuns}/{partial.totalWickets}</span>
        <span className="text-xl text-slate-400">({overs} ov)</span>
      </div>

      <div className="flex gap-6 text-sm">
        <div className="flex flex-col items-center">
          <span className="text-slate-500 text-xs">RUN RATE</span>
          <span className="font-bold text-amber-400">{runRate}</span>
        </div>
        {partial.targetScore !== null && (
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-xs">TARGET</span>
            <span className="font-bold text-emerald-400">{partial.targetScore}</span>
          </div>
        )}
        {partial.targetScore !== null && (
          <div className="flex flex-col items-center">
            <span className="text-slate-500 text-xs">NEED</span>
            <span className="font-bold text-rose-400">{Math.max(0, partial.targetScore - partial.totalRuns)}</span>
          </div>
        )}
      </div>

      {topScorer && (
        <div className="text-xs text-slate-400">
          Top scorer: <span className="text-white font-bold">{topScorer.player.name}</span>{' '}
          {topScorer.runs}({topScorer.balls})
        </div>
      )}
    </div>
  );
}

// ============================================================
// PITCH TYPE DISPLAY
// ============================================================

function PitchBadge({ pitchType }: { pitchType: string }) {
  const colorMap: Record<string, string> = {
    FLAT: 'text-blue-400',
    DUSTY: 'text-amber-500',
    GREEN: 'text-emerald-400',
    BALANCED: 'text-purple-400',
  };

  return (
    <div className="bg-slate-900 border border-slate-700 px-5 py-2 rounded-full text-sm font-bold tracking-wider flex items-center gap-2">
      <span className="text-slate-400">PITCH:</span>
      <span className={colorMap[pitchType] || 'text-white'}>{pitchType}</span>
    </div>
  );
}

// ============================================================
// MAIN COACH DASHBOARD COMPONENT
// ============================================================

export default function CoachDashboard() {
  const coachPhase = useCoachStore((s) => s.coachPhase);
  const teamTactics = useCoachStore((s) => s.teamTactics);
  const setTactics = useCoachStore((s) => s.setTactics);
  const setPreferredBowlers = useCoachStore((s) => s.setPreferredBowlers);
  const startPhase = useCoachStore((s) => s.startPhase);
  const partialInn1 = useCoachStore((s) => s.partialInn1);
  const partialInn2 = useCoachStore((s) => s.partialInn2);
  const finalInn1 = useCoachStore((s) => s.finalInn1);
  const userSquad = useCoachStore((s) => s.userSquad);
  const userBatsFirst = useCoachStore((s) => s.userBatsFirst);
  const pitchType = useCoachStore((s) => s.pitchType);
  const resetToMenu = useGameStore((s) => s.resetToMenu);
  const resetCoach = useCoachStore((s) => s.resetCoach);

  const [primaryBowler, setPrimaryBowler] = useState<string>('');
  const [secondaryBowler, setSecondaryBowler] = useState<string>('');
  const [showCoinToss, setShowCoinToss] = useState(false);
  const [tossComplete, setTossComplete] = useState(false);

  const handleBack = () => {
    resetCoach();
    resetToMenu();
  };

  const handleCoinTossDecision = (batsFirst: boolean) => {
    setShowCoinToss(false);
    setTossComplete(true);
    useCoachStore.getState().initCoachMatch(batsFirst);
  };

  const handleProceed = () => {
    const list = [primaryBowler, secondaryBowler].filter(Boolean);
    setPreferredBowlers(list);
    setPrimaryBowler('');
    setSecondaryBowler('');
    startPhase();
  };

  // If coin toss hasn't happened yet, show it first
  if (!tossComplete && coachPhase === 'PRE_MATCH' && !partialInn1) {
    return (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 mt-12 min-h-screen">
        <header className="w-full flex items-center justify-between mb-12">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Menu</span>
          </button>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">Coach Mode</h1>
          <div className="w-24" />
        </header>

        <div className="flex flex-col items-center gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Match Toss</h2>
            <p className="text-slate-400">Win the toss to decide whether to bat or bowl first.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCoinToss(true)}
            className="flex items-center gap-3 bg-accent-gold text-black font-black text-xl px-12 py-5 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            <Target className="w-6 h-6" />
            FLIP COIN
          </motion.button>
        </div>

        <AnimatePresence>
          <CoinTossModal isOpen={showCoinToss} onDecision={handleCoinTossDecision} />
        </AnimatePresence>
      </div>
    );
  }

  // If match is finished, render the dedicated CoachScorecard
  if (coachPhase === 'FINISHED') {
    return <CoachScorecard />;
  }

  // ── RENDER BASED ON PHASE ──

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-6 mt-6 min-h-screen">
      {/* Header */}
      <header className="w-full flex items-center justify-between mb-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Menu</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Coach Mode</h1>
          <PitchBadge pitchType={pitchType} />
        </div>
        <div className="w-16" />
      </header>

      <AnimatePresence mode="wait">
        {/* ── PRE_MATCH: Show lineup + tactical slider (+ bowler assignments if bowling first) ── */}
        {coachPhase === 'PRE_MATCH' && partialInn1 && (
          <motion.div
            key="pre-match"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                {userBatsFirst ? 'You won the toss and chose to BAT' : 'You won the toss and chose to BOWL'}
              </h2>
              <p className="text-slate-400 text-sm">
                {userBatsFirst
                  ? 'Set your batting tactics for the Powerplay (Overs 1-6)'
                  : 'Set your bowling tactics and bowler assignments for the Powerplay (Overs 1-6)'}
              </p>
            </div>

            {/* Squad Preview */}
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Your XI</h3>
              <div className="grid grid-cols-1 gap-1">
                {userSquad.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 py-1 px-2 text-sm">
                    <span className="text-slate-600 font-mono w-5 text-right">{i + 1}</span>
                    <span className="text-white font-medium flex-1">{p.name}</span>
                    <span className="text-slate-500 text-xs">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>

            <MatchupMatrix />

            <TacticsSlider value={teamTactics} onChange={setTactics} isBatting={userBatsFirst} />

            {/* Explicit Bowler Assignments if user is bowling first */}
            {!userBatsFirst && (
              <BowlerAssignmentSelector
                squad={userSquad}
                partial={partialInn1}
                primaryBowlerId={primaryBowler}
                secondaryBowlerId={secondaryBowler}
                onPrimaryChange={setPrimaryBowler}
                onSecondaryChange={setSecondaryBowler}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProceed}
              className="flex items-center gap-3 bg-white text-slate-950 font-black text-xl px-12 py-5 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
            >
              <Swords className="w-6 h-6" />
              BEGIN MATCH
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* ── INTERVENTION: After Powerplay (INN_1_PP) ── */}
        {coachPhase === 'INN_1_PP' && partialInn1 && (
          <InterventionView
            key="inn1-pp"
            partial={partialInn1}
            phaseLabel="Powerplay Complete — 6 Overs Bowled"
            nextPhaseLabel={userBatsFirst ? 'Middle Overs (7-16) — Batting' : 'Middle Overs (7-16) — Bowling'}
            tactics={teamTactics}
            onTacticsChange={setTactics}
            isBatting={userBatsFirst}
            squad={userSquad}
            primaryBowler={primaryBowler}
            secondaryBowler={secondaryBowler}
            onPrimaryBowlerChange={setPrimaryBowler}
            onSecondaryBowlerChange={setSecondaryBowler}
            onContinue={handleProceed}
          />
        )}

        {/* ── INTERVENTION: After Middle Overs (INN_1_MID) ── */}
        {coachPhase === 'INN_1_MID' && partialInn1 && (
          <InterventionView
            key="inn1-mid"
            partial={partialInn1}
            phaseLabel="Middle Overs Complete — 16 Overs Bowled"
            nextPhaseLabel={userBatsFirst ? 'Death Overs (17-20) — Batting' : 'Death Overs (17-20) — Bowling'}
            tactics={teamTactics}
            onTacticsChange={setTactics}
            isBatting={userBatsFirst}
            squad={userSquad}
            primaryBowler={primaryBowler}
            secondaryBowler={secondaryBowler}
            onPrimaryBowlerChange={setPrimaryBowler}
            onSecondaryBowlerChange={setSecondaryBowler}
            onContinue={handleProceed}
          />
        )}

        {/* ── INNINGS BREAK (INN_1_DEATH) ── */}
        {coachPhase === 'INN_1_DEATH' && finalInn1 && (
          <motion.div
            key="inn-break"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-8 w-full"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-amber-400 mb-2">INNINGS BREAK</h2>
              <p className="text-slate-400">1st Innings Complete</p>
            </div>

            <div className="w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-6 flex flex-col items-center gap-4">
              <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{finalInn1.teamName}</span>
              <span className="text-5xl font-black text-white">
                {finalInn1.totalRuns}/{finalInn1.totalWickets}
              </span>
              <span className="text-slate-400">({finalInn1.oversBowled} overs)</span>
              <div className="w-full border-t border-slate-700 pt-4 mt-2 text-center">
                <span className="text-lg font-bold text-emerald-400">
                  Target: {finalInn1.totalRuns + 1} runs
                </span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">
                {userBatsFirst
                  ? 'Now set your BOWLING tactics and bowler assignments for the chase'
                  : 'Now set your BATTING tactics for the chase'}
              </p>
            </div>

            <TacticsSlider value={teamTactics} onChange={setTactics} isBatting={!userBatsFirst} />

            {/* Explicit Bowler Assignments if user is bowling in 2nd innings */}
            {userBatsFirst && (
              <BowlerAssignmentSelector
                squad={userSquad}
                partial={partialInn2}
                primaryBowlerId={primaryBowler}
                secondaryBowlerId={secondaryBowler}
                onPrimaryChange={setPrimaryBowler}
                onSecondaryChange={setSecondaryBowler}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProceed}
              className="flex items-center gap-3 bg-emerald-500 text-white font-black text-xl px-12 py-5 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all"
            >
              <TrendingUp className="w-6 h-6" />
              START 2ND INNINGS
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* ── INTERVENTION: After Inn 2 Powerplay (INN_2_PP) ── */}
        {coachPhase === 'INN_2_PP' && partialInn2 && (
          <InterventionView
            key="inn2-pp"
            partial={partialInn2}
            phaseLabel="2nd Innings — Powerplay Complete"
            nextPhaseLabel={!userBatsFirst ? 'Middle Overs (7-16) — Batting' : 'Middle Overs (7-16) — Bowling'}
            tactics={teamTactics}
            onTacticsChange={setTactics}
            isBatting={!userBatsFirst}
            squad={userSquad}
            primaryBowler={primaryBowler}
            secondaryBowler={secondaryBowler}
            onPrimaryBowlerChange={setPrimaryBowler}
            onSecondaryBowlerChange={setSecondaryBowler}
            onContinue={handleProceed}
          />
        )}

        {/* ── INTERVENTION: After Inn 2 Middle (INN_2_MID) ── */}
        {coachPhase === 'INN_2_MID' && partialInn2 && (
          <InterventionView
            key="inn2-mid"
            partial={partialInn2}
            phaseLabel="2nd Innings — Middle Overs Complete"
            nextPhaseLabel={!userBatsFirst ? 'Death Overs (17-20) — Batting' : 'Death Overs (17-20) — Bowling'}
            tactics={teamTactics}
            onTacticsChange={setTactics}
            isBatting={!userBatsFirst}
            squad={userSquad}
            primaryBowler={primaryBowler}
            secondaryBowler={secondaryBowler}
            onPrimaryBowlerChange={setPrimaryBowler}
            onSecondaryBowlerChange={setSecondaryBowler}
            onContinue={handleProceed}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// INTERVENTION VIEW — Reusable component for phase pauses
// ============================================================

function InterventionView({
  partial,
  phaseLabel,
  nextPhaseLabel,
  tactics,
  onTacticsChange,
  isBatting,
  squad,
  primaryBowler,
  secondaryBowler,
  onPrimaryBowlerChange,
  onSecondaryBowlerChange,
  onContinue,
}: {
  partial: PartialInningsState;
  phaseLabel: string;
  nextPhaseLabel: string;
  tactics: number;
  onTacticsChange: (val: number) => void;
  isBatting: boolean;
  squad: Player[];
  primaryBowler: string;
  secondaryBowler: string;
  onPrimaryBowlerChange: (id: string) => void;
  onSecondaryBowlerChange: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-6 w-full"
    >
      <div className="text-center">
        <h2 className="text-xl font-bold text-amber-400 mb-1">{phaseLabel}</h2>
        <p className="text-slate-400 text-sm">
          Adjust your tactics for the next phase: <span className="text-white font-semibold">{nextPhaseLabel}</span>
        </p>
      </div>

      <PhaseSummary partial={partial} label={partial.teamName} />

      <TacticsSlider value={tactics} onChange={onTacticsChange} isBatting={isBatting} />

      {/* Show bowler assignment dropdowns only when the user is bowling */}
      {!isBatting && (
        <BowlerAssignmentSelector
          squad={squad}
          partial={partial}
          primaryBowlerId={primaryBowler}
          secondaryBowlerId={secondaryBowler}
          onPrimaryChange={onPrimaryBowlerChange}
          onSecondaryChange={onSecondaryBowlerChange}
        />
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onContinue}
        className="flex items-center gap-3 bg-white text-slate-950 font-black text-lg px-10 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all"
      >
        <ChevronRight className="w-5 h-5" />
        CONTINUE
      </motion.button>
    </motion.div>
  );
}
