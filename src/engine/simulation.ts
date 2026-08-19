import type { Player, UnifiedMatchResult, InningsResult, PlayerStats, OverSummary, SquadBalanceResult } from './types';

// ============================================================
// CHASE 300 ENGINE UTILS
// Squad validation and morale calculations based on 500/0 rules.
// ============================================================

export function evaluateChase300Squad(squad: (Player | null)[]): SquadBalanceResult {
  const validPlayers = squad.filter(Boolean) as Player[];
  if (validPlayers.length !== 11) {
    return {
      unprepared: true,
      reason: 'Incomplete squad. You must draft exactly 11 players.',
      teamMorale: 0,
      boostMultiplier: 0,
      boostedBatters: []
    };
  }

  // 1. Squad Balance Check

  // Keeper Rule: Check slots 1 through 7 for at least 1 Wicket-Keeper ('WK')
  const topSeven = validPlayers.slice(0, 7);
  const hasKeeper = topSeven.some((p) => p.role === 'WK');
  
  // Bowler Rule: Check slots 8 through 11 for Bowlers ('Bowler' or 'All-Rounder')
  const bottomFour = validPlayers.slice(7, 11);
  const validBowlers = bottomFour.filter((p) => p.role === 'Bowler' || p.role === 'All-Rounder');
  
  if (!hasKeeper) {
    return {
      unprepared: true,
      reason: 'No keeper. A chase like this was over before it began.',
      teamMorale: 0,
      boostMultiplier: 0, // penalty applied in simulation loop
      boostedBatters: []
    };
  }

  if (validBowlers.length < 4) {
    return {
      unprepared: true,
      reason: 'Unbalanced Bowling Attack. Slots 8-11 must be Bowlers or All-Rounders.',
      teamMorale: 0,
      boostMultiplier: 0,
      boostedBatters: []
    };
  }

  // 2. Morale System

  // Calculate teamMorale = Average bwlRating of players in slots 8 through 11
  const totalBwlRating = bottomFour.reduce((sum, p) => sum + p.bwlRating, 0);
  const teamMorale = Math.round(totalBwlRating / bottomFour.length);

  // Apply a Morale Boost: Every 10 points of Morale adds a +2% multiplier to the upper order's powRating
  // Also based on requirements: >=85 -> 1.10x, 70-84 -> 1.00x, <70 -> 0.90x
  let boostMultiplier = 1.0;
  if (teamMorale >= 85) boostMultiplier = 1.10;
  else if (teamMorale < 70) boostMultiplier = 0.90;

  const boostedBatters = topSeven.map((p) => ({
    id: p.id,
    name: p.name,
    originalPow: p.powRating,
    boostedPow: Math.round(p.powRating * boostMultiplier)
  }));

  return {
    unprepared: false,
    teamMorale,
    boostMultiplier,
    boostedBatters
  };
}

// ============================================================
// CORE SIMULATION LOOP
// ============================================================

export function simulateChase300(squad: (Player | null)[]): UnifiedMatchResult {
  const TARGET = 300;
  const MAX_BALLS = 120;
  const OPPOSITION_BOWLING_RATING = 90;

  // Initialize stats tracking
  const players = squad.filter(Boolean) as Player[];
  const playerStats: PlayerStats[] = players.map(p => ({
    player: p,
    runs: 0,
    balls: 0,
    dots: 0,
    fours: 0,
    sixes: 0,
    dismissal: 'not out',
    strikeRate: 0
  }));

  const overLogs: OverSummary[] = [];
  let currentOverLog: string[] = [];

  let totalRuns = 0;
  let totalWickets = 0;
  let ballsBowled = 0;

  let strikerIndex = 0;
  let nonStrikerIndex = 1;
  let nextBatterIndex = 2;

  const squadEval = evaluateChase300Squad(squad);
  const unprepared = squadEval.unprepared;
  const unpreparedReason = squadEval.reason || null;
  const moraleMultiplier = squadEval.boostMultiplier || 0.9;

  // Penalty if no keeper
  const batRatingPenalty = unprepared && unpreparedReason?.includes('keeper') ? 0.7 : 1.0;

  const pitchFactor = Number((0.85 + Math.random() * 0.30).toFixed(2));

  for (let ball = 1; ball <= MAX_BALLS; ball++) {
    if (totalWickets >= 10 || totalRuns >= TARGET) break;

    ballsBowled++;
    const striker = playerStats[strikerIndex];
    const overNumber = Math.floor((ball - 1) / 6) + 1;
    const isPowerplay = overNumber <= 6;
    const isMiddleOvers = overNumber >= 7 && overNumber <= 15;
    const isDeathOvers = overNumber >= 16;

    const ballsRemaining = MAX_BALLS - ball + 1;
    const runsRequired = TARGET - totalRuns;
    const rrr = (runsRequired / ballsRemaining) * 6;

    // Effective Ratings
    const effectiveBat = striker.player.batRating * batRatingPenalty;
    const effectivePow = striker.player.powRating * moraleMultiplier;

    // Base probabilities (Global Probability Rebalance)
    let probWicket = 0.038;
    let probDot = 0.24;
    let probOneTwo = 0.44;
    let probFour = 0.16;
    let probSix = 0.12;

    // 1. RRR Risk Modifiers
    let riskFactor = 1.0;
    if (rrr <= 12.0) {
      probDot += 0.03;
      probOneTwo += 0.04;
      probFour -= 0.03;
      probSix -= 0.04;
    } else if (rrr > 12.0 && rrr <= 18.0) {
      riskFactor = 1.2;
      probFour += 0.04;
      probSix += 0.04;
      probDot -= 0.04;
    } else {
      riskFactor = 1.5;
      probFour += 0.08;
      probSix += 0.08;
      probDot -= 0.08;
    }

    // 2. Match Phase Modifiers (T20 Pacing)
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

    // Damped bowling rating scaling
    const ratingDiff = OPPOSITION_BOWLING_RATING - effectiveBat;
    const dampedWicketRatio = Math.max(0.6, Math.min(1.5, 1.0 + (ratingDiff / 150)));
    const wicketFactor = dampedWicketRatio * riskFactor * phaseWicketMult;
    probWicket = probWicket * wicketFactor;

    // Pitch / Day Variance applied to boundaries
    const boundaryFactor = (effectivePow / 100) * phaseBoundaryMult * pitchFactor;
    probFour = probFour * boundaryFactor;
    probSix = probSix * (boundaryFactor * (effectivePow >= 85 ? 1.15 : 1.0));

    // Normalize probabilities
    const totalProb = probWicket + probDot + probOneTwo + probFour + probSix;
    probWicket /= totalProb;
    probDot /= totalProb;
    probOneTwo /= totalProb;
    probFour /= totalProb;
    probSix /= totalProb;

    // Roll
    const roll = Math.random();
    let runsOnBall = 0;
    let isWicket = false;

    if (roll < probWicket) {
      isWicket = true;
    } else if (roll < probWicket + probDot) {
      runsOnBall = 0;
    } else if (roll < probWicket + probDot + probOneTwo) {
      runsOnBall = Math.random() > 0.3 ? 1 : 2;
    } else if (roll < probWicket + probDot + probOneTwo + probFour) {
      runsOnBall = 4;
    } else {
      runsOnBall = 6;
    }

    // Apply outcomes
    striker.balls++;
    if (isWicket) {
      totalWickets++;
      striker.dismissal = generateDismissalText(striker.player.batRating);
      currentOverLog.push('W');
      if (totalWickets < 10 && nextBatterIndex < 11) {
        strikerIndex = nextBatterIndex;
        nextBatterIndex++;
      }
    } else {
      totalRuns += runsOnBall;
      striker.runs += runsOnBall;
      if (runsOnBall === 0) striker.dots++;
      if (runsOnBall === 4) striker.fours++;
      if (runsOnBall === 6) striker.sixes++;
      currentOverLog.push(runsOnBall.toString());

      if (runsOnBall === 1 || runsOnBall === 3) {
        const temp = strikerIndex;
        strikerIndex = nonStrikerIndex;
        nonStrikerIndex = temp;
      }
    }

    // End of over logic
    if (ball % 6 === 0 || totalWickets >= 10 || totalRuns >= TARGET) {
      const summaryText = currentOverLog.join(', ');
      overLogs.push({
        overNumber,
        summaryText,
        runs: currentOverLog.reduce((acc, val) => acc + (val === 'W' ? 0 : parseInt(val)), 0),
        wickets: currentOverLog.filter(v => v === 'W').length
      });
      currentOverLog = [];
      
      if (ball % 6 === 0 && totalWickets < 10 && totalRuns < TARGET) {
        const temp = strikerIndex;
        strikerIndex = nonStrikerIndex;
        nonStrikerIndex = temp;
      }
    }
  }

  // Final stats cleanup
  playerStats.forEach(ps => {
    ps.strikeRate = ps.balls > 0 ? Number(((ps.runs / ps.balls) * 100).toFixed(2)) : 0;
  });

  const oversBowledString = `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`;
  const isWin = totalRuns >= TARGET;

 // Generate Post-Match Team Analysis & Savage Verdicts
  let verdict = '';
  let comment = '';

  if (unprepared) {
    verdict = 'UNPREPARED';
    comment = 'A chase like this was over before it began. You showed up to a knife fight without a weapon.';
  } else if (isWin || totalRuns >= 300) {
    verdict = 'GALACTIC IMMORTALITY';
    comment = 'EARTH IS SAVED! You dragged this squad of mortals to a miracle against superior alien genetics. Absolute alpha mentality. You just etched this legendary XI into the stars forever!';
  } else if (totalRuns >= 286) { 
    // Scores 286 to 299
    verdict = 'ULTIMATE CHOKEJOB';
    comment = 'Agonizing. Almost everyone fulfilled their duties against the alien genetics... except for one or two absolute chokers in your squad who bottled it when Earth needed them most. Look at your scorecard. Identify the frauds. You know who they are.';
  } else if (totalRuns >= 240) { 
    // Scores 240 to 285
    verdict = 'USELESS STAT-PADDING';
    comment = 'Oh, congratulations on scoring 240+ in a 300 chase. Do you want a participation trophy? Your squad got bullied by alien genetics, and your batters just stat-padded while the world burned. Pathetic.';
  } else if (totalRuns >= 150) { 
    // Scores 150 to 239
    verdict = 'PATHETIC JOKE';
    comment = 'A disgraceful, toothless chase. You were chasing 300 to save the planet and your cowards batted like they were trying to draw a Day 5 Test match against superior alien genetics. Did you even try to win, or did you just want a front-row seat to the apocalypse? Shameful.';
  } else { 
    // Scores below 150 (Total Collapse)
    verdict = 'ABSOLUTE DISGRACE';
    comment = 'What a spineless display. You drafted a bunch of cowards who completely surrendered to superior alien genetics. You call yourself a cricket fan? You just handed Earth over on a silver platter. Absolute garbage.';
  }

  const teamAnalysis = { verdict, comment };

  // Determine Man of the Match
  let motm = null;
  if (playerStats.length > 0) {
    const topScorer = [...playerStats].sort((a, b) => b.runs - a.runs)[0];
    motm = {
      player: topScorer.player,
      reason: `Top scored with ${topScorer.runs} off ${topScorer.balls} balls (SR: ${topScorer.strikeRate})`
    };
  }

  const inningsResult: InningsResult = {
    teamName: 'Player XI', // Chase 300 only has Player XI
    totalRuns,
    totalWickets,
    oversBowled: oversBowledString,
    unprepared,
    unpreparedReason,
    teamMoraleScore: squadEval.teamMorale,
    playerStats,
    overLogs
  };

  return {
    innings: [inningsResult],
    isWin,
    matchSummary: isWin ? 'Target chased successfully!' : `Failed to chase 300 (Fell short by ${TARGET - totalRuns} runs)`,
    teamAnalysis,
    manOfTheMatch: motm
  };
}

function generateDismissalText(batRating: number): string {
  const rand = Math.random();
  if (batRating < 60) {
    // Tailenders get bowled/lbw more often
    return rand > 0.5 ? `b Alien Bowler` : `lbw b Alien Bowler`;
  } else {
    // Proper batters get caught/stumped more
    if (rand < 0.40) return `c Alien Fielder b Alien Bowler`;
    if (rand < 0.60) return `b Alien Bowler`;
    if (rand < 0.75) return `lbw b Alien Bowler`;
    if (rand < 0.85) return `c & b Alien Bowler`;
    if (rand < 0.93) return `run out (Alien Fielder)`;
    return `st Alien WK b Alien Bowler`;
  }
}

