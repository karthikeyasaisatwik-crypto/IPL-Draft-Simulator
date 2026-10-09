import { DEFAULT_COACH_PLANS, getCoachPlanModifiers } from './coachTactics';
import type { CoachPlans } from './coachTactics';
import { recordDelivery } from './shotVisualizer';
import { getBowlingStyle } from './matchupMatrix';
import { getMatchPerkMultiplier } from './matchPerks';
// ============================================================
// COACH MODE — CHUNKED SIMULATION ENGINE
// This file is completely isolated from simulation.ts and
// h2hSimulation.ts. It replicates the ball-resolution logic
// but is designed to pause and resume across match phases.
// ============================================================

import type {
  Player,
  PlayerStats,
  InningsResult,
  UnifiedMatchResult,
  PartialInningsState,
  PitchType,
} from './types';
import type { Matchup } from './matchupMatrix';
import { evaluateChase300Squad } from './simulation';

// ============================================================
// FLUID TACTICAL MODIFIERS (0 to 100 Slider)
// 0 = Max Defense, 50 = Balanced, 100 = Max Attack
// ============================================================

interface TacticsMod {
  batMult: number;
  powMult: number;
  bwlMult: number;
  wicketMult: number;
  boundaryScale: number;
}

export function getTacticsMod(tactics: number, isBatting: boolean): TacticsMod {
  const clamped = Math.max(0, Math.min(100, tactics));
  // Normalized modifier: -1.0 (0) to 0.0 (50) to +1.0 (100)
  const modifier = (clamped - 50) / 50;

  if (isBatting) {
    // Batting: Attack increases POW (+15%) and wicket risk (+20%), decreases BAT (-15%)
    // Defense increases BAT (+15%), decreases POW (-15%) and wicket risk (-20%)
    const powMult = 1.0 + modifier * 0.15;
    const batMult = 1.0 - modifier * 0.15;
    const wicketMult = 1.0 + modifier * 0.20;
    return { batMult, powMult, bwlMult: 1.0, wicketMult, boundaryScale: 1.0 };
  } else {
    // Bowling: Attack increases BWL (+15%) and wicket chances (+20%), but concedes more boundaries (+10%)
    // Defense decreases opponent boundary scoring (-12%), but lowers wicket chances (-20%)
    const bwlMult = 1.0 + modifier * 0.15;
    const wicketMult = 1.0 + modifier * 0.20;
    const boundaryScale = modifier >= 0
      ? 1.0 + modifier * 0.10
      : 1.0 + modifier * 0.12;
    return { batMult: 1.0, powMult: 1.0, bwlMult, wicketMult, boundaryScale };
  }
}

// ============================================================
// PITCH FACTOR
// ============================================================

export function getPitchFactor(pitchType: PitchType): number {
  switch (pitchType) {
    case 'FLAT': return 1.15;
    case 'DUSTY': return 0.90;
    case 'GREEN': return 0.85;
    default: return 1.0;
  }
}

// ============================================================
// INITIALIZE A PARTIAL INNINGS
// Creates the starting state for an innings that can be
// incrementally simulated.
// ============================================================

export function initPartialInnings(
  squad: Player[],
  teamName: string,
  bowlingSquad: Player[],
  targetScore: number | null
): PartialInningsState {
  const squadEval = evaluateChase300Squad(squad);
  const unprepared = squadEval.unprepared;
  const unpreparedReason = squadEval.reason || null;
  const moraleMultiplier = squadEval.boostMultiplier || 0.9;
  const batRatingPenalty = unprepared && unpreparedReason?.includes('keeper') ? 0.7 : 1.0;

  const oppBowlers = bowlingSquad.slice(7, 11);
  const oppositionBowlingRating = oppBowlers.length > 0
    ? (oppBowlers.reduce((sum, p) => sum + p.bwlRating, 0) / oppBowlers.length)
    : 80;

  const playerStats: PlayerStats[] = squad.map(p => ({
    player: p,
    runs: 0,
    balls: 0,
    dots: 0,
    fours: 0,
    sixes: 0,
    dismissal: 'not out',
    strikeRate: 0,
  }));

  const bowlerBalls: Record<string, number> = {};
  bowlingSquad.forEach(p => {
    bowlerBalls[p.id] = 0;
  });

  return {
    squad,
    teamName,
    bowlingSquad,
    targetScore,
    totalRuns: 0,
    totalWickets: 0,
    ballsBowled: 0,
    strikerIndex: 0,
    nonStrikerIndex: 1,
    nextBatterIndex: 2,
    playerStats,
    overLogs: [],
    ballLogs: [],
    currentOverLog: [],
    unprepared,
    unpreparedReason,
    teamMoraleScore: squadEval.teamMorale,
    moraleMultiplier,
    batRatingPenalty,
    oppositionBowlingRating,
    bowlerBalls,
    lastBowlerId: null,
    currentBowlerId: null,
  };
}

// ============================================================
// BOWLER SELECTION LOGIC
// Checks preferred bowlers with priority override, validates
// 4-over quota (max 24 balls) and consecutive over rule,
// then falls back to AI auto-selection.
// ============================================================

export function selectOverBowler(
  bowlingSquad: Player[],
  bowlerBalls: Record<string, number>,
  lastBowlerId: string | null,
  preferredBowlerIds: string[] = [],
  isFieldingCoach: boolean = false,
  maxBowlerBalls: number = 24,
): Player {
  const specialistBowlers = bowlingSquad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  const pool = specialistBowlers.length > 0 ? specialistBowlers : bowlingSquad;

  const canBowl = (player: Player) => {
    const balls = bowlerBalls[player.id] || 0;
    const underMaxQuota = balls < maxBowlerBalls;
    const notConsecutive = player.id !== lastBowlerId;
    return underMaxQuota && notConsecutive;
  };

  // 1. If user is coaching the fielding team, try preferred bowlers with priority override
  if (isFieldingCoach && preferredBowlerIds.length > 0) {
    // Try Primary Preferred Bowler
    const primaryId = preferredBowlerIds[0];
    if (primaryId) {
      const primary = pool.find(p => p.id === primaryId);
      if (primary && canBowl(primary)) {
        return primary;
      }
    }

    // Try Secondary Preferred Bowler
    const secondaryId = preferredBowlerIds[1];
    if (secondaryId) {
      const secondary = pool.find(p => p.id === secondaryId);
      if (secondary && canBowl(secondary)) {
        return secondary;
      }
    }
  }

  // 2. Fallback: Auto-selection from eligible bowlers
  const eligible = pool.filter(canBowl);
  if (eligible.length > 0) {
    // Sort by bwlRating descending, break ties with fewer overs bowled
    eligible.sort((a, b) => {
      if (b.bwlRating !== a.bwlRating) {
        return b.bwlRating - a.bwlRating;
      }
      return (bowlerBalls[a.id] || 0) - (bowlerBalls[b.id] || 0);
    });
    return eligible[0];
  }

  // 3. Graceful fallback (e.g. if single bowler or edge case)
  const sortedByBalls = [...pool].sort((a, b) => (bowlerBalls[a.id] || 0) - (bowlerBalls[b.id] || 0));
  return sortedByBalls[0] || bowlingSquad[0];
}

// ============================================================
// SIMULATE A PHASE (CHUNK OF BALLS)
// Runs from startBall to endBall inclusive (1-indexed).
// Returns a new PartialInningsState with updated data.
// ============================================================

export function simulateCoachPhase(
  state: PartialInningsState,
  startBall: number,
  endBall: number,
  tactics: number,
  pitchFactor: number,
  isBatting: boolean,
  preferredBowlers: string[] = [],
  keyMatchups: Matchup[] = [],
  plans: CoachPlans = DEFAULT_COACH_PLANS,
  options: { random?: () => number; maxBalls?: number; maxBowlerBalls?: number; preferBowler?: boolean } = {},
): PartialInningsState {
  // Deep clone the state so we don't mutate the original
  const s: PartialInningsState = {
    ...state,
    playerStats: state.playerStats.map(ps => ({ ...ps })),
    overLogs: [...state.overLogs],
    ballLogs: [...(state.ballLogs ?? [])],
    currentOverLog: [...state.currentOverLog],
    bowlerBalls: { ...(state.bowlerBalls || {}) },
  };

  const mod = getTacticsMod(tactics, isBatting);
  const MAX_BALLS = options.maxBalls ?? 120;
  const random = options.random ?? Math.random;

  let currentBowler: Player | null = s.currentBowlerId
    ? (s.bowlingSquad.find(p => p.id === s.currentBowlerId) || null)
    : null;

  for (let ball = startBall; ball <= endBall; ball++) {
    if (s.totalWickets >= 10 || (s.targetScore !== null && s.totalRuns >= s.targetScore)) break;
    if (ball > MAX_BALLS) break;

    // At the start of an over (or if no active bowler), select the bowler
    if ((ball - 1) % 6 === 0 || !currentBowler) {
      currentBowler = selectOverBowler(
        s.bowlingSquad,
        s.bowlerBalls,
        s.lastBowlerId,
        preferredBowlers,
        !isBatting || options.preferBowler === true,
        options.maxBowlerBalls ?? 24,
      );
      s.currentBowlerId = currentBowler.id;
    }

    s.ballsBowled = ball;
    const striker = s.playerStats[s.strikerIndex];
    const overNumber = Math.floor((ball - 1) / 6) + 1;
    const isPowerplay = overNumber <= 6;
    const isMiddleOvers = overNumber >= 7 && overNumber <= 15;
    const isDeathOvers = overNumber >= 16 || ball > MAX_BALLS - 24;

    // Required run rate calculation
    let rrr = 8.0;
    if (s.targetScore !== null) {
      const ballsRemaining = MAX_BALLS - ball + 1;
      const runsRequired = s.targetScore - s.totalRuns;
      rrr = (runsRequired / ballsRemaining) * 6;
    } else {
      if (isDeathOvers) rrr = 12.0;
      else if (isMiddleOvers) rrr = 9.0;
    }

    // Apply mentality modifiers to batting ratings
    const perkMultiplier = getMatchPerkMultiplier(striker.player, s.playerStats[s.nonStrikerIndex].player, s.targetScore !== null);
    const effectiveBat = perkMultiplier * striker.player.batRating * s.batRatingPenalty * mod.batMult;
    const effectivePow = perkMultiplier * striker.player.powRating * s.moraleMultiplier * mod.powMult;

    // Base bowling rating uses the specific bowler active for this over
    const baseBowlingRating = currentBowler ? currentBowler.bwlRating : s.oppositionBowlingRating;
    const effectiveBowlingRating = isBatting
      ? baseBowlingRating
      : baseBowlingRating * mod.bwlMult;

    // --- Base probabilities ---
    let probWicket = 0.038;
    let probDot = 0.24;
    let probOneTwo = 0.44;
    let probFour = 0.16;
    let probSix = 0.12;

    // --- RRR adjustments ---
    let riskFactor = 1.0;
    if (rrr <= 9.0) {
      probDot += 0.03;
      probOneTwo += 0.04;
      probFour -= 0.03;
      probSix -= 0.04;
    } else if (rrr > 12.0 && rrr <= 15.0) {
      riskFactor = 1.2;
      probFour += 0.04;
      probSix += 0.04;
      probDot -= 0.04;
    } else if (rrr > 15.0) {
      riskFactor = 1.5;
      probFour += 0.08;
      probSix += 0.08;
      probDot -= 0.08;
    }

    // --- Match phase modifiers ---
    let phaseBoundaryMult = 1.0;
    let phaseWicketMult = 1.0;

    if (isPowerplay) {
      phaseBoundaryMult = 1.30;
      probOneTwo += 0.04;
      probDot -= 0.04;
    } else if (isMiddleOvers) {
      phaseBoundaryMult = 0.95;
      probOneTwo += 0.06;
      probDot += 0.04;
      if (effectiveBat < 80) phaseBoundaryMult = 0.85;
    } else if (isDeathOvers) {
      phaseBoundaryMult = 1.55;
      phaseWicketMult = 1.45;
    }

    // --- Matchup Matrix Modifiers ---
    let matchupWicketBoost = 1.0;
    let matchupBoundaryBoost = 1.0;

    if (currentBowler) {
      const activeMatchup = keyMatchups.find(m => 
        (m.playerId1 === currentBowler!.id && m.playerId2 === striker.player.id) ||
        (m.playerId2 === currentBowler!.id && m.playerId1 === striker.player.id)
      );

      if (activeMatchup) {
        // If the match-up is an ADVANTAGE for the bowler (determined by if the bowler's team has the advantage)
        // Note: Our generateKeyMatchups function creates matchups from the perspective of the side that has the advantage/danger.
        // It says "ADVANTAGE" if the bowler has it, "DANGER" if the batter has it (bowler is in danger).
        if (activeMatchup.type === 'ADVANTAGE' && activeMatchup.playerId1 === currentBowler.id) {
          matchupWicketBoost = 1.05; // +5% wicket probability
        } else if (activeMatchup.type === 'DANGER' && activeMatchup.playerId1 === currentBowler.id) {
          matchupBoundaryBoost = 1.05; // +5% boundary probability for batter
        }
      }
    }

    // --- Bowling vs batting scaling ---
    const ratingDiff = effectiveBowlingRating - effectiveBat;
    const dampedWicketRatio = Math.max(0.6, Math.min(1.5, 1.0 + (ratingDiff / 150)));
    const wicketFactor = dampedWicketRatio * riskFactor * phaseWicketMult * mod.wicketMult * matchupWicketBoost;
    probWicket = probWicket * wicketFactor;

    // --- Boundary factor ---
    const boundaryFactor = (effectivePow / 100) * phaseBoundaryMult * pitchFactor * matchupBoundaryBoost;

    probFour = probFour * boundaryFactor * mod.boundaryScale;
    probSix = probSix * (boundaryFactor * (effectivePow >= 85 ? 1.15 : 1.0)) * mod.boundaryScale;

    // Optional Coach plans are neutral by default and consume no extra RNG.
    const plan = getCoachPlanModifiers(plans, isBatting, striker.player, currentBowler, striker.balls, ball);
    probWicket *= plan.wicket;
    probDot *= plan.dot;
    probOneTwo *= plan.rotation;
    probFour *= plan.boundary;
    probSix *= plan.boundary;

    // --- Normalize ---
    const totalProb = probWicket + probDot + probOneTwo + probFour + probSix;
    probWicket /= totalProb;
    probDot /= totalProb;
    probOneTwo /= totalProb;
    probFour /= totalProb;
    probSix /= totalProb;

    // --- Roll ---
    const roll = random();
    let runsOnBall = 0;
    let isWicket = false;

    if (roll < probWicket) {
      isWicket = true;
    } else if (roll < probWicket + probDot) {
      runsOnBall = 0;
    } else if (roll < probWicket + probDot + probOneTwo) {
      runsOnBall = random() > 0.3 ? 1 : 2;
    } else if (roll < probWicket + probDot + probOneTwo + probFour) {
      runsOnBall = 4;
    } else {
      runsOnBall = 6;
    }

    // Increment bowler's ball count
    if (currentBowler) {
      s.bowlerBalls[currentBowler.id] = (s.bowlerBalls[currentBowler.id] || 0) + 1;
    }

    striker.balls++;
    if (isWicket) {
      s.totalWickets++;
      striker.dismissal = generateDismissalText(striker.player.batRating, currentBowler, s.bowlingSquad, random);
      s.currentOverLog.push('W');
      if (s.totalWickets < 10 && s.nextBatterIndex < 11) {
        s.strikerIndex = s.nextBatterIndex;
        s.nextBatterIndex++;
      }
    } else {
      s.totalRuns += runsOnBall;
      striker.runs += runsOnBall;
      if (runsOnBall === 0) striker.dots++;
      if (runsOnBall === 4) striker.fours++;
      if (runsOnBall === 6) striker.sixes++;
      s.currentOverLog.push(runsOnBall.toString());

      if (runsOnBall === 1 || runsOnBall === 3) {
        const temp = s.strikerIndex;
        s.strikerIndex = s.nonStrikerIndex;
        s.nonStrikerIndex = temp;
      }
    }

    s.ballLogs!.push(recordDelivery({
      ballNumber: ball, overNumber, strikerName: striker.player.name, bowlerName: currentBowler?.name ?? 'Opposition attack',
      runs: runsOnBall, isWicket, dismissalText: isWicket ? striker.dismissal : undefined,
      currentTotal: s.totalRuns, currentWickets: s.totalWickets,
    }, {
      phaseOver: MAX_BALLS < 120 && isDeathOvers ? 20 : overNumber,
      bowlingPlan: isBatting ? 'STOCK' : plans.bowling,
      bowlingStyle: currentBowler ? getBowlingStyle(currentBowler) : undefined,
    }));

    // End of over or innings
    if (ball % 6 === 0 || s.totalWickets >= 10 || (s.targetScore !== null && s.totalRuns >= s.targetScore)) {
      const overNumber2 = Math.floor((ball - 1) / 6) + 1;
      const summaryText = s.currentOverLog.join(', ');
      s.overLogs.push({
        overNumber: overNumber2,
        summaryText,
        runs: s.currentOverLog.reduce((acc, val) => acc + (val === 'W' ? 0 : parseInt(val)), 0),
        wickets: s.currentOverLog.filter(v => v === 'W').length,
      });
      s.currentOverLog = [];

      if (currentBowler) {
        s.lastBowlerId = currentBowler.id;
      }
      s.currentBowlerId = null;
      currentBowler = null;

      // Rotate strike at end of over
      if (ball % 6 === 0 && s.totalWickets < 10 && !(s.targetScore !== null && s.totalRuns >= s.targetScore)) {
        const temp = s.strikerIndex;
        s.strikerIndex = s.nonStrikerIndex;
        s.nonStrikerIndex = temp;
      }
    }
  }

  return s;
}

// ============================================================
// FINALIZE AN INNINGS
// Converts a PartialInningsState into the standard InningsResult
// that Scorecard and ProgressTicker expect.
// ============================================================

export function finalizeInnings(partial: PartialInningsState): InningsResult {
  // Calculate strike rates
  const playerStats = partial.playerStats.map(ps => ({
    ...ps,
    strikeRate: ps.balls > 0 ? Number(((ps.runs / ps.balls) * 100).toFixed(2)) : 0,
  }));

  const oversBowledString = `${Math.floor(partial.ballsBowled / 6)}.${partial.ballsBowled % 6}`;

  return {
    teamName: partial.teamName,
    totalRuns: partial.totalRuns,
    totalWickets: partial.totalWickets,
    oversBowled: oversBowledString,
    unprepared: partial.unprepared,
    unpreparedReason: partial.unpreparedReason,
    teamMoraleScore: partial.teamMoraleScore,
    playerStats,
    overLogs: partial.overLogs,
    ballLogs: partial.ballLogs,
  };
}

// ============================================================
// BUILD FINAL MATCH RESULT
// Assembles the complete UnifiedMatchResult from two finalized
// innings — identical structure to h2hSimulation.ts output.
// ============================================================

export function buildCoachMatchResult(
  innings1: InningsResult,
  innings2: InningsResult,
  userTeamName: string,
  aiTeamName: string,
  userBatsFirst: boolean,
  pitchType: PitchType,
): UnifiedMatchResult {
  let isWin = false;
  let matchSummary = '';

  const target = innings1.totalRuns + 1;

  if (innings2.totalRuns >= target) {
    // Team 2 (chasing team) won
    if (!userBatsFirst) {
      isWin = true;
      matchSummary = `${userTeamName} won by ${10 - innings2.totalWickets} wickets`;
    } else {
      isWin = false;
      matchSummary = `${aiTeamName} won by ${10 - innings2.totalWickets} wickets`;
    }
  } else if (innings1.totalRuns > innings2.totalRuns) {
    // Team 1 (batting first) won
    if (userBatsFirst) {
      isWin = true;
      matchSummary = `${userTeamName} won by ${innings1.totalRuns - innings2.totalRuns} runs`;
    } else {
      isWin = false;
      matchSummary = `${aiTeamName} won by ${innings1.totalRuns - innings2.totalRuns} runs`;
    }
  } else {
    isWin = false;
    matchSummary = 'Match Tied!';
  }

  // Man of the Match
  let motm = null;
  const allStats = [...innings1.playerStats, ...innings2.playerStats];
  if (allStats.length > 0) {
    const topScorer = [...allStats].sort((a, b) => b.runs - a.runs)[0];
    motm = {
      player: topScorer.player,
      reason: `Top scored with ${topScorer.runs} off ${topScorer.balls} balls (SR: ${topScorer.strikeRate})`,
    };
  }

  const isTie = innings1.totalRuns === innings2.totalRuns;
  let verdict = '';
  let comment = '';
  if (isTie) {
    verdict = 'MATCH TIED';
    comment = 'Both teams finished level. Neither side could claim the victory.';
  } else if (isWin) {
    verdict = 'TACTICAL MASTERCLASS';
    comment = 'Your coaching decisions shaped the match. Every phase adjustment paid off.';
  } else {
    verdict = 'OUTCOACHED';
    comment = 'The opposition found answers to your tactics. Time to rethink your approach.';
  }

  return {
    innings: [innings1, innings2],
    isWin,
    isTie,
    matchSummary,
    teamAnalysis: { verdict, comment },
    manOfTheMatch: motm,
    pitchType,
  };
}

// ============================================================
// DISMISSAL TEXT GENERATOR
// Uses the actual active bowler to credit dismissals accurately.
// ============================================================

function generateDismissalText(batRating: number, bowler: Player | null, bowlingSquad: Player[], random = Math.random): string {
  const assignedBowler = bowler || bowlingSquad[Math.floor(random() * bowlingSquad.length)];
  const fielderPool = bowlingSquad.filter(p => p.id !== assignedBowler.id);
  const fielder = fielderPool.length > 0 ? fielderPool[Math.floor(random() * fielderPool.length)] : assignedBowler;
  const oppKeeper = bowlingSquad.find(p => p.role === 'WK');
  const keeperName = oppKeeper ? oppKeeper.name : fielder.name;

  const rand = random();
  if (batRating < 60) {
    return rand > 0.5 ? `b ${assignedBowler.name}` : `lbw b ${assignedBowler.name}`;
  } else {
    if (rand < 0.50) return `c ${fielder.name} b ${assignedBowler.name}`;
    if (rand < 0.70) return `b ${assignedBowler.name}`;
    if (rand < 0.85) return `lbw b ${assignedBowler.name}`;
    if (rand < 0.93) return `run out (${fielder.name})`;
    return `st ${keeperName} b ${assignedBowler.name}`;
  }
}
