import type { Player } from './types';
import { getBowlingStyle } from './matchupMatrix';

export type BattingPlan = 'BALANCED' | 'ROTATE' | 'ATTACK' | 'PROTECT';
export type BowlingPlan = 'STOCK' | 'YORKERS' | 'SHORT' | 'VARIATIONS';
export interface CoachPlans {
  batting: BattingPlan;
  bowling: BowlingPlan;
  usePlayerTraits: boolean;
}
export const DEFAULT_COACH_PLANS: CoachPlans = { batting: 'BALANCED', bowling: 'STOCK', usePlayerTraits: false };
export const BATTING_PLANS: { id: BattingPlan; label: string; description: string }[] = [
  { id: 'BALANCED', label: 'Balanced', description: 'Follow your intensity slider with no extra plan.' },
  { id: 'ROTATE', label: 'Rotate strike', description: 'Fewer dots and more singles or twos; fewer boundaries.' },
  { id: 'ATTACK', label: 'Attack boundaries', description: 'More boundary chances, with greater wicket risk.' },
  { id: 'PROTECT', label: 'Protect wickets', description: 'Lower wicket risk; more dots and fewer boundaries.' },
];
export const BOWLING_PLANS: { id: BowlingPlan; label: string; description: string }[] = [
  { id: 'STOCK', label: 'Stock deliveries', description: 'Follow your intensity slider with no extra plan.' },
  { id: 'YORKERS', label: 'Yorker plan', description: 'Skilled pace bowlers restrict boundaries, especially late; weaker bowlers can miss their length. Spinners bowl stock deliveries.' },
  { id: 'SHORT', label: 'Short-ball plan', description: 'Pace bowlers create dots and wicket chances, but risk more boundaries. Spinners bowl stock deliveries.' },
  { id: 'VARIATIONS', label: 'Change of pace', description: 'Slower balls and flight reduce boundary chances, but allow more singles and twos.' },
];

// Stable game traits, not claims about real-world player scouting. No match RNG.
export function getCoachPlayerProfile(player: Player) {
  const hash = [...player.id].reduce((value, char) => Math.imul(value, 31) + char.charCodeAt(0) | 0, 7) >>> 0;
  const preference = hash % 3 === 0 ? 'PACE' : hash % 3 === 1 ? 'SPIN' : 'EVEN';
  const battingTrait = player.battingPosition >= 5 && player.battingPosition <= 7 && player.powRating >= 80
    ? 'FINISHER' : player.batRating >= 80 && player.powRating < 85 ? 'SLOW_STARTER' : 'STEADY';
  const deathSpecialist = getBowlingStyle(player) === 'PACE' && player.bwlRating >= 85;
  return { preference, battingTrait, deathSpecialist } as const;
}

export function getCoachPlanModifiers(plans: CoachPlans, isBatting: boolean, batter: Player, bowler: Player, ballsFaced: number, ballNumber: number) {
  const modifiers = { wicket: 1, dot: 1, rotation: 1, boundary: 1 };
  const pace = getBowlingStyle(bowler) === 'PACE';
  if (isBatting) {
    switch (plans.batting) {
      case 'ROTATE': Object.assign(modifiers, { wicket: .96, dot: .85, rotation: 1.12, boundary: .90 }); break;
      case 'ATTACK': Object.assign(modifiers, { wicket: 1.12, dot: 1.04, rotation: .96, boundary: 1.10 }); break;
      case 'PROTECT': Object.assign(modifiers, { wicket: .85, dot: 1.08, rotation: 1, boundary: .88 }); break;
    }
  } else {
    if (plans.bowling === 'YORKERS' && pace) {
      Object.assign(modifiers, bowler.bwlRating >= 80
        ? { wicket: .96, dot: 1.05, rotation: 1.08, boundary: ballNumber >= 97 ? .88 : .94 }
        : { wicket: 1.03, dot: .96, rotation: 1, boundary: 1.04 });
    } else if (plans.bowling === 'SHORT' && pace) {
      Object.assign(modifiers, { wicket: 1.10, dot: 1.08, rotation: .90, boundary: 1.08 });
    } else if (plans.bowling === 'VARIATIONS') {
      Object.assign(modifiers, { wicket: .98, dot: .97, rotation: 1.10, boundary: .92 });
    }
  }
  if (plans.usePlayerTraits) {
    const profile = getCoachPlayerProfile(batter);
    if (profile.preference !== 'EVEN') {
      const comfortable = profile.preference === (pace ? 'PACE' : 'SPIN');
      modifiers.boundary *= comfortable ? 1.06 : .96;
      modifiers.wicket *= comfortable ? .96 : 1.06;
    }
    if (profile.battingTrait === 'SLOW_STARTER') {
      if (ballsFaced < 8) { modifiers.dot *= 1.06; modifiers.boundary *= .94; }
      else if (ballsFaced >= 12) modifiers.wicket *= .96;
    }
    if (profile.battingTrait === 'FINISHER' && ballNumber >= 97) {
      modifiers.boundary *= 1.05;
      modifiers.wicket *= 1.03;
    }
    if (getCoachPlayerProfile(bowler).deathSpecialist && ballNumber >= 97) {
      modifiers.wicket *= 1.06;
      modifiers.boundary *= .96;
    }
  }
  return modifiers;
}

export function describeCoachProfile(player: Player): string {
  const profile = getCoachPlayerProfile(player);
  const batting = profile.preference === 'EVEN' ? 'Even against pace and spin' : `Comfortable against ${profile.preference.toLowerCase()}; vulnerable to ${profile.preference === 'PACE' ? 'spin' : 'pace'}`;
  const extra = profile.battingTrait === 'FINISHER' ? 'Late boundary boost with extra risk' : profile.battingTrait === 'SLOW_STARTER' ? 'Quiet first 8 balls; safer after 12' : 'Steady starter';
  return `${batting}. ${extra}.${profile.deathSpecialist ? ' Death-over bowling specialist.' : ''}`;
}
