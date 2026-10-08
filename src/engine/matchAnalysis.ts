import type { BallLog, InningsResult, UnifiedMatchResult } from './types';

export interface MatchHighlight {
  id: string;
  category: 'Turning points' | 'Costly overs' | 'Best partnerships';
  title: string;
  detail: string;
  impact: string;
  startBall: number;
  endBall: number;
  replayAvailable: boolean;
}
export interface Partnership {
  names: string[];
  runs: number;
  balls: number;
  startBall: number;
  endBall: number;
  startScore: number;
  endScore: number;
  unbeaten: boolean;
}
export const oversFromBalls = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

export function hasCompleteDeliveryLog(innings: InningsResult): boolean {
  const logs = innings.ballLogs ?? [];
  const [overs, remainder = 0] = innings.oversBowled.split('.').map(Number);
  return logs.length > 0 && logs.length === overs * 6 + remainder &&
    logs.every((ball, i) => ball.ballNumber === i + 1) &&
    logs.at(-1)!.currentTotal === innings.totalRuns && logs.at(-1)!.currentWickets === innings.totalWickets;
}

export function getPartnerships(innings: InningsResult): Partnership[] {
  if (!hasCompleteDeliveryLog(innings) || innings.playerStats.length < 2) return [];
  // These engines dismiss the striker and introduce batters in scorecard order.
  // Keep both names even when only one partner has faced a delivery.
  let pair = innings.playerStats.slice(0, 2).map(stat => stat.player.name);
  let nextBatter = 2;
  let startBall = 1;
  let startScore = 0;
  let runs = 0;
  const partnerships: Partnership[] = [];
  const logs = innings.ballLogs!;
  for (const [index, ball] of logs.entries()) {
    runs += ball.runs;
    if (ball.isWicket || index === logs.length - 1) {
      partnerships.push({ names: [...pair], runs, balls: ball.ballNumber - startBall + 1,
        startBall, endBall: ball.ballNumber, startScore, endScore: ball.currentTotal, unbeaten: !ball.isWicket });
      if (ball.isWicket) {
        pair = pair.filter(name => name !== ball.strikerName);
        const incoming = innings.playerStats[nextBatter++];
        if (incoming) pair.push(incoming.player.name);
        runs = 0; startBall = ball.ballNumber + 1; startScore = ball.currentTotal;
      }
    }
  }
  return partnerships;
}

function chaseImpact(before: number, after: number, startBall: number, endBall: number, target?: number) {
  if (target === undefined) return `Moved the innings from ${before} to ${after}.`;
  if (after >= target) return `The target of ${target} was reached with ${120 - endBall} balls remaining.`;
  const needed = target - after;
  const left = 120 - endBall;
  if (left <= 0) return `Finished ${needed} run${needed === 1 ? '' : 's'} short of the target of ${target}.`;
  const beforeRate = ((target - before) * 6 / (121 - startBall)).toFixed(2);
  const afterRate = (needed * 6 / left).toFixed(2);
  return `Required rate ${beforeRate} → ${afterRate}; ${needed} needed from ${left} balls.`;
}

export function analyzeInnings(innings: InningsResult, target?: number) {
  const logs = innings.ballLogs ?? [];
  const complete = hasCompleteDeliveryLog(innings);
  const partnerships = getPartnerships(innings);
  const highlights: MatchHighlight[] = [];
  let previousRuns = 0;
  const overs = innings.overLogs.map(over => {
    const before = previousRuns;
    previousRuns += over.runs;
    const startBall = (over.overNumber - 1) * 6 + 1;
    const count = over.summaryText.split(',').filter(v => v.trim()).length;
    return { ...over, before, after: previousRuns, startBall, endBall: startBall + count - 1, count };
  });
  [...overs].sort((a, b) => b.runs - a.runs || a.overNumber - b.overNumber).slice(0, 3).forEach(over => {
    const deliveries = logs.filter(b => b.ballNumber >= over.startBall && b.ballNumber <= over.endBall);
    const bowlers = [...new Set(deliveries.map(b => b.bowlerName).filter(name => name !== 'Opposition attack'))];
    highlights.push({ id: `over-${over.overNumber}`, category: 'Costly overs', title: `Over ${over.overNumber} · ${over.runs} runs`,
      detail: `${over.count} ball${over.count === 1 ? '' : 's'}, ${over.wickets} wicket${over.wickets === 1 ? '' : 's'}${bowlers.length ? ` · ${bowlers.join(', ')}` : ''}.`,
      impact: chaseImpact(over.before, over.after, over.startBall, over.endBall, target),
      startBall: over.startBall, endBall: over.endBall, replayAvailable: complete });
  });
  [...partnerships].sort((a, b) => b.runs - a.runs || a.startBall - b.startBall).slice(0, 3).forEach(partnership => {
    highlights.push({ id: `stand-${partnership.startBall}`, category: 'Best partnerships', title: `${partnership.runs} off ${partnership.balls}${partnership.unbeaten ? ' · Unbeaten' : ''}`,
      detail: partnership.names.join(' & '),
      impact: `${innings.totalRuns ? Math.round(partnership.runs / innings.totalRuns * 100) : 0}% of the innings total. ${chaseImpact(partnership.startScore, partnership.endScore, partnership.startBall, partnership.endBall, target)}`,
      startBall: partnership.startBall, endBall: partnership.endBall, replayAvailable: true });
  });
  if (complete) {
    const batterRuns = new Map<string, number>();
    const wickets: { ball: BallLog; runs: number }[] = [];
    logs.forEach(ball => {
      batterRuns.set(ball.strikerName, (batterRuns.get(ball.strikerName) ?? 0) + ball.runs);
      if (ball.isWicket) wickets.push({ ball, runs: batterRuns.get(ball.strikerName)! });
    });
    const keyWicket = wickets.sort((a, b) => b.runs - a.runs || a.ball.ballNumber - b.ball.ballNumber)[0];
    if (keyWicket) {
      const { ball, runs } = keyWicket;
      highlights.push({ id: `wicket-${ball.ballNumber}`, category: 'Turning points', title: `${ball.strikerName} dismissed for ${runs}`,
        detail: `${ball.dismissalText ?? 'Wicket'} · ${ball.currentTotal}/${ball.currentWickets} after ${oversFromBalls(ball.ballNumber)} overs.`,
        impact: `Ended the batter's innings; ${10 - ball.currentWickets} wickets remained.`,
        startBall: Math.max(1, ball.ballNumber - 5), endBall: ball.ballNumber, replayAvailable: true });
    }
    const collapse = [...overs].filter(o => o.wickets >= 2).sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)[0];
    if (collapse) highlights.push({ id: `collapse-${collapse.overNumber}`, category: 'Turning points', title: `Over ${collapse.overNumber} · ${collapse.wickets} wickets fell`,
      detail: `${collapse.runs} runs added during this passage.`, impact: chaseImpact(collapse.before, collapse.after, collapse.startBall, collapse.endBall, target),
      startBall: collapse.startBall, endBall: collapse.endBall, replayAvailable: true });
    const last = logs.at(-1)!;
    const start = Math.max(1, last.ballNumber - 5);
    const before = start === 1 ? 0 : logs[start - 2].currentTotal;
    highlights.push({ id: 'finish', category: 'Turning points', title: target === undefined ? 'The target was set' : innings.totalRuns >= target ? 'The winning passage' : 'The chase ended',
      detail: `Finished ${innings.totalRuns}/${innings.totalWickets} in ${innings.oversBowled} overs.`,
      impact: target === undefined ? `The opposition needed ${innings.totalRuns + 1} to win.` :
        innings.totalWickets === 10 && innings.totalRuns < target ? `All out, ${target - innings.totalRuns} short of the target of ${target}.` : chaseImpact(before, innings.totalRuns, start, last.ballNumber, target),
      startBall: start, endBall: last.ballNumber, replayAvailable: true });
  }
  return { highlights, partnerships, complete };
}

export function analyzeMatch(result: UnifiedMatchResult) {
  return result.innings.map((innings, index) => {
    const analysis = analyzeInnings(innings, result.innings.length === 1 ? 300 : index === 1 ? result.innings[0].totalRuns + 1 : undefined);
    if (index === 1 && innings.totalRuns === result.innings[0].totalRuns) {
      const finish = analysis.highlights.find(highlight => highlight.id === 'finish');
      if (finish) { finish.title = 'Scores finished level'; finish.impact = 'Neither side passed the other. The match ended in a tie.'; }
    }
    return analysis;
  });
}
