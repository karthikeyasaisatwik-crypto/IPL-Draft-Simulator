import type { SkillNode } from './careerTypes';

export const SKILL_NODES: SkillNode[] = [
  // Chasing Branch
  {
    id: 'chasing_1',
    name: 'Composed Chaser',
    description: '+5% batting stats when chasing',
    spCost: 2,
    tier: 1,
    effect: { type: 'chasing_boost', magnitude: 0.05 }
  },
  {
    id: 'chasing_2',
    name: 'Clutch Gene',
    description: '+10% batting stats when chasing',
    spCost: 3,
    tier: 2,
    prerequisiteId: 'chasing_1',
    effect: { type: 'chasing_boost', magnitude: 0.10 }
  },
  {
    id: 'chasing_3',
    name: 'The Chase Master',
    description: '+15% batting stats when chasing',
    spCost: 5,
    tier: 3,
    prerequisiteId: 'chasing_2',
    effect: { type: 'chasing_boost', magnitude: 0.15 }
  },
  
  // Leadership Branch
  {
    id: 'leadership_1',
    name: 'Team Player',
    description: '+5% to batting partner\'s stats',
    spCost: 2,
    tier: 1,
    effect: { type: 'partner_boost', magnitude: 0.05 }
  },
  {
    id: 'leadership_2',
    name: 'Leader at the Crease',
    description: '+7% to batting partner\'s stats',
    spCost: 3,
    tier: 2,
    prerequisiteId: 'leadership_1',
    effect: { type: 'partner_boost', magnitude: 0.07 }
  },
  {
    id: 'leadership_3',
    name: 'Alpha Aura',
    description: '+10% to batting partner\'s stats',
    spCost: 6,
    tier: 3,
    prerequisiteId: 'leadership_2',
    effect: { type: 'partner_boost', magnitude: 0.10 }
  },
  { id: 'fitness_1', name: 'Recovery Routine', description: '+25% stamina restored on recovery days.', spCost: 2, tier: 1, effect: { type: 'recovery_boost', magnitude: 0.25 } },
  { id: 'fitness_2', name: 'Iron Resolve', description: 'Halve negative mentality changes from narrative choices.', spCost: 3, tier: 2, prerequisiteId: 'fitness_1', effect: { type: 'pressure_shield', magnitude: 0.5 } },
  { id: 'fitness_3', name: 'Second Wind', description: 'An extra +50% recovery-day stamina; stacks with Recovery Routine.', spCost: 5, tier: 3, prerequisiteId: 'fitness_2', effect: { type: 'recovery_boost', magnitude: 0.5 } },
  { id: 'craft_1', name: 'Deliberate Practice', description: '+1 batting gain per technical net session.', spCost: 2, tier: 1, effect: { type: 'training_boost', magnitude: 1 } },
  { id: 'craft_2', name: 'Dressing Room Diplomat', description: '+25% positive relationship gains.', spCost: 3, tier: 2, prerequisiteId: 'craft_1', effect: { type: 'relationship_boost', magnitude: 0.25 } },
  { id: 'craft_3', name: 'Elite Preparation', description: 'An extra +2 batting per technical net session; stacks with Deliberate Practice.', spCost: 5, tier: 3, prerequisiteId: 'craft_2', effect: { type: 'training_boost', magnitude: 2 } },
];
