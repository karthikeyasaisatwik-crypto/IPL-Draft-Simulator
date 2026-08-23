import type { CareerState, StatKey } from '../store/careerStore';

export type Archetype = 'PRODIGY' | 'GRINDER' | 'ALL_ROUNDER';

export interface ActiveModifier {
  id: string;
  label: string;         // player-facing: "Ankle Injury", "Career-Best Form", "Hot Streak"
  stat: StatKey;
  perTurnDelta: number;  // applied every advanceWeek() while active
  turnsRemaining: number;
}

export interface RiskyChoiceDef {
  baseChance: number;
  mentalityInfluence?: number;
  onSuccess: Partial<Record<StatKey, number>>;
  onSuccessModifiers?: ActiveModifier[];
  onFailure: Partial<Record<StatKey, number>>;
  onFailureModifiers?: ActiveModifier[];
  successText: string;
  failureText: string;
}

export interface CareerChoice {
  text: string;
  requiredStat?: { stat: keyof CareerState; min: number };
  consequences?: Partial<Record<StatKey, number>>;
  modifiers?: ActiveModifier[];
  risky?: RiskyChoiceDef;
  setsFlag?: string;
  outcomeText?: string;
  isCaptain?: boolean;
  managerCommissionRate?: number;
}

export interface CareerEvent {
  id: string;
  category: string;
  title: string;
  description: string;
  weight: number;
  minWeek?: number;
  maxWeek?: number;
  requiresFlag?: string;
  excludesFlag?: string;
  choices: CareerChoice[];
}

export interface SkillEffect {
  type: 'chasing_boost' | 'partner_boost';
  magnitude: number;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  spCost: number;
  tier: 1 | 2 | 3;
  prerequisiteId?: string;
  effect: SkillEffect;
}

export interface BigMatchEvent {
  id: string;
  category: 'BIG_MATCH';
  title: string;
  target: number;
  quality: 'grassroots' | 'franchise' | 'icon';
  bowlingDifficultyMultiplier: number;
  description: string;
}

export type AnyCareerEvent = CareerEvent | BigMatchEvent;

export const ARCHETYPE_CONFIG: Record<Archetype, {
  name: string;
  title: string;
  battingRating: number;
  stamina: number;
  lockerRoomRespect: number;
  parentalExpectations: number;
  flavor: string;
  tagline: string;
}> = {
  PRODIGY: {
    name: 'The Prodigy',
    title: 'The Prodigy',
    battingRating: 55,
    stamina: 90,
    lockerRoomRespect: 35,
    parentalExpectations: 90,
    flavor: 'Talented, a little arrogant, family expects greatness immediately.',
    tagline: 'High starting skill, but high pressure and skeptical teammates.'
  },
  GRINDER: {
    name: 'The Grinder',
    title: 'The Grinder',
    battingRating: 30,
    stamina: 100,
    lockerRoomRespect: 65,
    parentalExpectations: 70,
    flavor: 'Not the most gifted, but well-liked and relentless.',
    tagline: 'Maximum stamina and dressing room trust; raw batting must be earned.'
  },
  ALL_ROUNDER: {
    name: 'The All-Rounder Hopeful',
    title: 'The All-Rounder Hopeful',
    battingRating: 45,
    stamina: 95,
    lockerRoomRespect: 50,
    parentalExpectations: 80,
    flavor: 'Balanced across the board, no clear edge yet.',
    tagline: 'Versatile and steady, adaptable to any career path.'
  }
};
