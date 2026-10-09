import { simulateCoachPhase } from './coachSimulation';
import type { CoachPlans } from './coachTactics';
import type { PartialInningsState } from './types';
import type { ScenarioDefinition, ScenarioDecision } from './scenarioTypes';

export const scenarioFinished = (s: PartialInningsState, scenario: ScenarioDefinition) =>
  s.totalRuns >= s.targetScore! || s.totalWickets >= 10 || s.ballsBowled >= scenario.maxBalls;

export function eligibleScenarioBowlers(s: PartialInningsState, scenario: ScenarioDefinition) {
  if (s.ballsBowled % 6) return s.bowlingSquad.filter(p => p.id === s.currentBowlerId);
  return s.bowlingSquad.filter(p => (p.role === 'Bowler' || p.role === 'All-Rounder') &&
    (s.bowlerBalls[p.id] ?? 0) < scenario.maxBowlerBalls && p.id !== s.lastBowlerId);
}

// State is carried explicitly; replay and rendering never consume match randomness.
export function scenarioRandom(seed: number) {
  let state = seed >>> 0;
  return {
    next: () => {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, 1 | state);
      n ^= n + Math.imul(n ^ n >>> 7, 61 | n);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    },
    state: () => state,
  };
}

export function playScenario(scenario: ScenarioDefinition, initial: PartialInningsState, seed: number,
  batting: boolean, tactics: number, plans: CoachPlans, preferred: string, balls: number) {
  const rng = scenarioRandom(seed);
  let state = initial;
  let needsBatter = false;
  const decisions: ScenarioDecision[] = [];
  const end = Math.min(scenario.maxBalls, state.ballsBowled + balls, (Math.floor(state.ballsBowled / 6) + 1) * 6);
  while (state.ballsBowled < end && !scenarioFinished(state, scenario)) {
    const allowed = eligibleScenarioBowlers(state, scenario);
    const historical = scenario.historicalBowling[String(Math.floor(state.ballsBowled / 6))];
    const bowler = allowed.find(p => p.id === (batting ? historical : preferred)) ?? allowed[0];
    if (!bowler) throw new Error('No eligible bowler remains in this scenario.');
    const pair = [state.playerStats[state.strikerIndex].player.name, state.playerStats[state.nonStrikerIndex].player.name];
    const previousWickets = state.totalWickets;
    const previousRuns = state.totalRuns;
    state = simulateCoachPhase(state, state.ballsBowled + 1, state.ballsBowled + 1, tactics, 1, batting,
      [bowler.id], [], plans, { random: rng.next, maxBalls: scenario.maxBalls, maxBowlerBalls: scenario.maxBowlerBalls, preferBowler: true });
    decisions.push({ ball: state.ballsBowled, pair, bowler: bowler.name, tactics, plans: { ...plans },
      runs: state.totalRuns - previousRuns, wicket: state.totalWickets > previousWickets });
    if (state.totalWickets > previousWickets && !scenarioFinished(state, scenario)) {
      needsBatter = batting;
      break;
    }
  }
  return { state, decisions, seed: rng.state(), needsBatter };
}

// Replace the automatically queued batter before their first delivery. Swap both
// arrays so the active indices and the remaining batting order stay consistent.
export function chooseScenarioBatter(state: PartialInningsState, index: number): PartialInningsState {
  const pending = state.nextBatterIndex - 1;
  if (index < pending || index >= state.squad.length) return state;
  const squad = [...state.squad];
  const playerStats = [...state.playerStats];
  [squad[pending], squad[index]] = [squad[index], squad[pending]];
  [playerStats[pending], playerStats[index]] = [playerStats[index], playerStats[pending]];
  return { ...state, squad, playerStats };
}
