import type { Player, UnifiedMatchResult, InningsResult, PlayerStats, OverSummary } from './types';
import { evaluateChase300Squad } from './simulation'; // We can reuse the evaluation logic

export function simulateH2HMatch(userSquad: Player[], aiSquad: Player[], userTeamName: string, aiTeamName: string, userBatsFirst: boolean): UnifiedMatchResult {
  
  // Decide who bats first
  const team1Squad = userBatsFirst ? userSquad : aiSquad;
  const team1Name = userBatsFirst ? userTeamName : aiTeamName;
  const team2Squad = userBatsFirst ? aiSquad : userSquad;
  const team2Name = userBatsFirst ? aiTeamName : userTeamName;

  // Generate hidden pitchFactor for the match (e.g. 0.85 to 1.15)
  const pitchFactor = Number((0.85 + Math.random() * 0.30).toFixed(2));

  // Simulate Innings 1 (Setting target) — team2 is fielding
  const innings1 = simulateInnings(team1Squad, team1Name, null, team2Squad, pitchFactor);
  
  // Target is innings1 total + 1
  const target = innings1.totalRuns + 1;

  // Simulate Innings 2 (Chasing target) — team1 is fielding
  const innings2 = simulateInnings(team2Squad, team2Name, target, team1Squad, pitchFactor);

  // Determine Match Result
  let isWin = false;
  let matchSummary = '';

  if (innings2.totalRuns >= target) {
    // Team 2 won
    if (!userBatsFirst) {
      isWin = true; // User was Team 2
      matchSummary = `${userTeamName} won by ${10 - innings2.totalWickets} wickets`;
    } else {
      isWin = false; // AI was Team 2
      matchSummary = `${aiTeamName} won by ${10 - innings2.totalWickets} wickets`;
    }
  } else if (innings1.totalRuns > innings2.totalRuns) {
    // Team 1 won
    if (userBatsFirst) {
      isWin = true; // User was Team 1
      matchSummary = `${userTeamName} won by ${innings1.totalRuns - innings2.totalRuns} runs`;
    } else {
      isWin = false; // AI was Team 1
      matchSummary = `${aiTeamName} won by ${innings1.totalRuns - innings2.totalRuns} runs`;
    }
  } else {
    // Tie
    isWin = false;
    matchSummary = `Match Tied!`;
  }

  // Determine Man of the Match from all players
  let motm = null;
  const allStats = [...innings1.playerStats, ...innings2.playerStats];
  if (allStats.length > 0) {
    const topScorer = [...allStats].sort((a, b) => b.runs - a.runs)[0];
    motm = {
      player: topScorer.player,
      reason: `Top scored with ${topScorer.runs} off ${topScorer.balls} balls (SR: ${topScorer.strikeRate})`
    };
  }

  // Post-match verdict
  let verdict = '';
  let comment = '';
  if (isWin) {
    verdict = 'OUTSTANDING VICTORY';
    comment = 'You outplayed the opposition in every department. A tactical masterclass.';
  } else {
    verdict = 'CRUSHING DEFEAT';
    comment = 'You were completely outclassed. The opposition made you look like a Sunday league team.';
  }

  return {
    innings: [innings1, innings2],
    isWin,
    matchSummary,
    teamAnalysis: { verdict, comment },
    manOfTheMatch: motm
  };
}

// Internal reusable innings simulator
function simulateInnings(squad: Player[], teamName: string, targetScore: number | null, bowlingSquad: Player[], pitchFactor: number = 1.0): InningsResult {
  const MAX_BALLS = 120;
  
  // Calculate average opposition bowling rating from slots 8-11 if available
  const oppBowlers = bowlingSquad.slice(7, 11);
  const OPPOSITION_BOWLING_RATING = oppBowlers.length > 0
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

  // We reuse the squad evaluation to apply morale boosts/penalties
  const squadEval = evaluateChase300Squad(squad);
  const unprepared = squadEval.unprepared;
  const unpreparedReason = squadEval.reason || null;
  const moraleMultiplier = squadEval.boostMultiplier || 0.9;
  const batRatingPenalty = unprepared && unpreparedReason?.includes('keeper') ? 0.7 : 1.0;

  for (let ball = 1; ball <= MAX_BALLS; ball++) {
    if (totalWickets >= 10 || (targetScore && totalRuns >= targetScore)) break;

    ballsBowled++;
    const striker = playerStats[strikerIndex];
    const overNumber = Math.floor((ball - 1) / 6) + 1;
    const isPowerplay = overNumber <= 6;
    const isMiddleOvers = overNumber >= 7 && overNumber <= 15;
    const isDeathOvers = overNumber >= 16;

    let rrr = 8.0; // Default flat RRR for innings 1
    if (targetScore) {
      const ballsRemaining = MAX_BALLS - ball + 1;
      const runsRequired = targetScore - totalRuns;
      rrr = (runsRequired / ballsRemaining) * 6;
    } else {
      // If setting a target, batters naturally accelerate towards the end
      if (isDeathOvers) rrr = 12.0; 
      else if (isMiddleOvers) rrr = 9.0;
    }

    const effectiveBat = striker.player.batRating * batRatingPenalty;
    const effectivePow = striker.player.powRating * moraleMultiplier;

    // --- 3. Global Probability Rebalance ---
    let probWicket = 0.038;  // Reduced base wicket chance
    let probDot = 0.24;      // Reduced base dot ball chance
    let probOneTwo = 0.44;   // Higher rotation of strike
    let probFour = 0.16;     // Higher base boundaries
    let probSix = 0.12;

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

    // --- 2. Match Phases (T20 Pacing) ---
    let phaseBoundaryMult = 1.0;
    let phaseWicketMult = 1.0;

    if (isPowerplay) {
      phaseBoundaryMult = 1.30; // Field restrictions boost
      probOneTwo += 0.04;
      probDot -= 0.04;
    } else if (isMiddleOvers) {
      phaseBoundaryMult = 0.95;
      probOneTwo += 0.06;
      probDot += 0.04;
      if (effectiveBat < 80) phaseBoundaryMult = 0.85;
    } else if (isDeathOvers) {
      // Massive boost to powRating impact, higher wicket probability for aggressive swinging
      phaseBoundaryMult = 1.55;
      phaseWicketMult = 1.45;
    }

    // Damped bowling rating scaling so top bowlers are economical without automatic collapse
    const ratingDiff = OPPOSITION_BOWLING_RATING - effectiveBat;
    const dampedWicketRatio = Math.max(0.6, Math.min(1.5, 1.0 + (ratingDiff / 150)));
    const wicketFactor = dampedWicketRatio * riskFactor * phaseWicketMult;
    probWicket = probWicket * wicketFactor;

    // --- 1. Pitch / Day Variance Factor applied to Boundaries ---
    const boundaryFactor = (effectivePow / 100) * phaseBoundaryMult * pitchFactor;
    probFour = probFour * boundaryFactor;
    probSix = probSix * (boundaryFactor * (effectivePow >= 85 ? 1.15 : 1.0));

    const totalProb = probWicket + probDot + probOneTwo + probFour + probSix;
    probWicket /= totalProb;
    probDot /= totalProb;
    probOneTwo /= totalProb;
    probFour /= totalProb;
    probSix /= totalProb;

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

    striker.balls++;
    if (isWicket) {
      totalWickets++;
      striker.dismissal = generateDismissalText(striker.player.batRating, bowlingSquad);
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

    if (ball % 6 === 0 || totalWickets >= 10 || (targetScore && totalRuns >= targetScore)) {
      const summaryText = currentOverLog.join(', ');
      overLogs.push({
        overNumber,
        summaryText,
        runs: currentOverLog.reduce((acc, val) => acc + (val === 'W' ? 0 : parseInt(val)), 0),
        wickets: currentOverLog.filter(v => v === 'W').length
      });
      currentOverLog = [];
      
      if (ball % 6 === 0 && totalWickets < 10 && !(targetScore && totalRuns >= targetScore)) {
        const temp = strikerIndex;
        strikerIndex = nonStrikerIndex;
        nonStrikerIndex = temp;
      }
    }
  }

  playerStats.forEach(ps => {
    ps.strikeRate = ps.balls > 0 ? Number(((ps.runs / ps.balls) * 100).toFixed(2)) : 0;
  });

  const oversBowledString = `${Math.floor(ballsBowled / 6)}.${ballsBowled % 6}`;

  return {
    teamName,
    totalRuns,
    totalWickets,
    oversBowled: oversBowledString,
    unprepared,
    unpreparedReason,
    teamMoraleScore: squadEval.teamMorale,
    playerStats,
    overLogs
  };
}

function generateDismissalText(batRating: number, bowlingSquad: Player[]): string {
  // Pick a bowler from the actual opponent squad (prefer Bowler/All-Rounder roles)
  const oppBowlers = bowlingSquad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  const bowlerPool = oppBowlers.length > 0 ? oppBowlers : bowlingSquad;
  const bowler = bowlerPool[Math.floor(Math.random() * bowlerPool.length)];

  // Pick a fielder from the opponent squad (any player)
  const fielder = bowlingSquad[Math.floor(Math.random() * bowlingSquad.length)];

  // Pick the opponent WK for stumpings
  const oppKeeper = bowlingSquad.find(p => p.role === 'WK');
  const keeperName = oppKeeper ? oppKeeper.name : fielder.name;

  const rand = Math.random();
  if (batRating < 60) {
    // Tailenders get bowled/lbw more often
    return rand > 0.5 ? `b ${bowler.name}` : `lbw b ${bowler.name}`;
  } else {
    // Proper batters get caught/stumped more
    if (rand < 0.50) return `c ${fielder.name} b ${bowler.name}`;
    if (rand < 0.70) return `b ${bowler.name}`;
    if (rand < 0.85) return `lbw b ${bowler.name}`;
    if (rand < 0.93) return `run out (${fielder.name})`;
    return `st ${keeperName} b ${bowler.name}`;
  }
}
