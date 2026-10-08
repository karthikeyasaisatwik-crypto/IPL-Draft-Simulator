import type { BallLog, UnifiedMatchResult } from './types';

export interface PlaybackFrame {
  inningsIndex: number;
  teamName: string;
  runs: number;
  wickets: number;
  balls: number;
  deliveriesShown: number;
  delivery?: BallLog;
  isEnd: boolean;
  commentary: string;
}

export function buildPlaybackFrames(result: UnifiedMatchResult): PlaybackFrame[] {
  return result.innings.flatMap((innings, inningsIndex) => {
    const frames: PlaybackFrame[] = [];
    if (innings.ballLogs?.length) {
      for (const [index, delivery] of innings.ballLogs.entries()) {
        const overs = `${Math.floor((delivery.ballNumber - 1) / 6)}.${((delivery.ballNumber - 1) % 6) + 1}`;
        frames.push({ inningsIndex, teamName: innings.teamName, runs: delivery.currentTotal, wickets: delivery.currentWickets,
          balls: delivery.ballNumber, deliveriesShown: index + 1, delivery, isEnd: false,
          commentary: `${overs} · ${delivery.strikerName} · ${delivery.isWicket ? `OUT! ${delivery.dismissalText ?? ''}` : delivery.runs === 0 ? 'Dot ball' : `${delivery.runs} run${delivery.runs === 1 ? '' : 's'}`} · ${delivery.visual?.shotDirection ?? ''}` });
      }
    } else {
      // Older results remain playable without inventing ball-level player details.
      let runs = 0;
      let wickets = 0;
      let balls = 0;
      for (const over of innings.overLogs) {
        runs += over.runs; wickets += over.wickets; balls += over.summaryText.split(',').length;
        frames.push({ inningsIndex, teamName: innings.teamName, runs, wickets, balls, deliveriesShown: 0, isEnd: false,
          commentary: `Over ${over.overNumber} · ${over.summaryText}` });
      }
    }
    const [overs, remainder] = innings.oversBowled.split('.').map(Number);
    frames.push({ inningsIndex, teamName: innings.teamName, runs: innings.totalRuns, wickets: innings.totalWickets,
      balls: overs * 6 + (remainder || 0), deliveriesShown: innings.ballLogs?.length ?? 0,
      delivery: innings.ballLogs?.at(-1), isEnd: true, commentary: `INNINGS ${inningsIndex + 1} COMPLETE · ${innings.teamName}` });
    return frames;
  });
}
