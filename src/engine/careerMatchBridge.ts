import type { CareerState, CareerTier, StatKey } from '../store/careerStore';
import type { Player, UnifiedMatchResult } from './types';
import { SKILL_NODES } from './skillTreeData';
import type { SkillEffect, ActiveModifier } from './careerTypes';

export function deriveMatchStats(state: CareerState) {
  const readiness = state.stamina < 30 ? 0.85 : 1;
  const batRating = Math.max(0, Math.min(100, (state.battingRating + (state.mentality - 50) * 0.2) * readiness));
  const powRating = Math.max(0, Math.min(100, (state.battingRating + (state.form - 50) * 0.3) * readiness));
  return { batRating: Math.round(batRating), powRating: Math.round(powRating) };
}

const GENERIC_TEAMMATE_NAMES = [
  'Arjun Nair', 'Vikram Deshmukh', 'Rohan Menon', 'Aditya Rathore', 'Karan Bhatt',
  'Siddharth Iyer', 'Farhan Sheikh', 'Manoj Pillai', 'Devendra Chauhan', 'Aryan Kapoor',
  'Rahul Verma', 'Nikhil Reddy', 'Suresh Pandey', 'Tanmay Joshi', 'Harshad Gowda',
  'Imran Qureshi', 'Naveen Krishnan', 'Yash Malhotra', 'Ritesh Oza', 'Amit Trivedi',
];

export function generateSupportingCast(quality: 'grassroots' | 'franchise' | 'icon'): Player[] {
  const bands = {
    grassroots: { min: 30, max: 55 },
    franchise:  { min: 50, max: 75 },
    icon:       { min: 70, max: 95 },
  };
  const { min, max } = bands[quality];
  const randomInRange = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `cast-${quality}-${i}`,
    name: GENERIC_TEAMMATE_NAMES[i] || `Player ${i+2}`,
    team: 'Supporting Cast',
    role: i === 0 ? 'WK' : i < 6 ? 'Batter' : i < 9 ? 'Bowler' : 'All-Rounder',
    battingPosition: i + 2, 
    allowedSlots: [i + 2],
    batRating: randomInRange(min, max),
    powRating: randomInRange(min, max),
    bwlRating: randomInRange(min, max),
  })) as Player[];
}

export function getCareerPlayerCard(state: CareerState): Player & { activeSkillEffects: SkillEffect[] } {
  const { batRating, powRating } = deriveMatchStats(state);
  const effects = SKILL_NODES
    .filter(node => state.unlockedSkillNodes.includes(node.id))
    .map(node => node.effect);
  
  return {
    id: 'protagonist',
    name: state.playerName,
    team: state.currentContract,
    role: 'Batter',
    battingPosition: 1,
    allowedSlots: [1],
    batRating, 
    powRating,
    bwlRating: 8,
    activeSkillEffects: effects,
  };
}

export function getCareerMatchSquad(state: CareerState, quality: 'grassroots' | 'franchise' | 'icon'): Player[] {
  const protagonist = getCareerPlayerCard(state);
  const cast = generateSupportingCast(quality);
  return [protagonist, ...cast];
}

export function resolveBigMatchOutcome(result: UnifiedMatchResult, protagonistRuns: number, phase: CareerTier): {
  statChanges: Partial<Record<StatKey, number>>;
  modifiers: ActiveModifier[];
} {
  const won = result.isWin;
  const teamScore = result.innings[0].totalRuns;
  const contributionRatio = teamScore > 0 ? protagonistRuns / teamScore : 0;
  const bigInnings = protagonistRuns >= 30;

  const trustStatFor = (p: CareerTier): StatKey => {
    if (p === 'GRASSROOTS') return 'coachFavor';
    if (p === 'FRANCHISE_ROOKIE') return 'franchiseTrust';
    return 'brandValue';
  };

  const brandStatFor = (p: CareerTier): StatKey => {
    if (p === 'GRASSROOTS') return 'coachFavor';
    if (p === 'FRANCHISE_ROOKIE') return 'mediaHype';
    return 'brandValue';
  };

  const changes: Partial<Record<StatKey, number>> = {};
  const modifiers: ActiveModifier[] = [];

  if (won && bigInnings) {
    changes.battingRating = 10;
    modifiers.push({
      id: 'mod_hot_streak',
      label: 'Hot Streak',
      stat: 'form',
      perTurnDelta: 3,
      turnsRemaining: 3,
    });
    changes[brandStatFor(phase)] = 15;
  } else if (won && !bigInnings) {
    changes[trustStatFor(phase)] = 5;
  } else if (!won && bigInnings) {
    changes.mentality = 10;
    changes.popularity = 5;
    changes.form = -5;
  } else {
    changes.form = -15;
    changes[trustStatFor(phase)] = -10;
  }

  if (won && phase === 'GLOBAL_ICON' && contributionRatio >= 0.5) {
    changes.legacyScore = 10; 
  }

  return { statChanges: changes, modifiers };
}
