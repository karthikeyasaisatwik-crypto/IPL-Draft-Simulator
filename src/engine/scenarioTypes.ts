import type { PartialInningsState } from './types';
import type { CoachPlans } from './coachTactics';

export interface ScenarioDefinition {
  id: string;
  title: string;
  date: string;
  venue: string;
  briefing: string;
  difficulty: string;
  bowlingTeam: string;
  maxBalls: number;
  maxBowlerBalls: number;
  initial: PartialInningsState;
  historicalBowling: Record<string, string>;
  historicalResult: string;
  historicalScore: number;
  source: string;
  report: string;
}

export interface ScenarioDecision {
  ball: number;
  pair: string[];
  bowler: string;
  tactics: number;
  plans: CoachPlans;
  runs: number;
  wicket: boolean;
}

export interface ScenarioProgress {
  attempts: number;
  wins: number;
  bestMargin?: number;
}
