import type { SkillNode } from './careerTypes';

export const SKILL_NODES: SkillNode[] = [
  // Chasing Branch
  {
    id: 'chasing_1',
    name: 'Composed Chaser',
    description: '+5% batting stats when chasing',
    spCost: 3,
    tier: 1,
    effect: { type: 'chasing_boost', magnitude: 0.05 }
  },
  {
    id: 'chasing_2',
    name: 'Clutch Gene',
    description: '+10% batting stats when chasing',
    spCost: 5,
    tier: 2,
    prerequisiteId: 'chasing_1',
    effect: { type: 'chasing_boost', magnitude: 0.10 }
  },
  {
    id: 'chasing_3',
    name: 'The Chase Master',
    description: '+15% batting stats when chasing',
    spCost: 8,
    tier: 3,
    prerequisiteId: 'chasing_2',
    effect: { type: 'chasing_boost', magnitude: 0.15 }
  },
  
  // Leadership Branch
  {
    id: 'leadership_1',
    name: 'Team Player',
    description: '+5% to batting partner\'s stats',
    spCost: 3,
    tier: 1,
    effect: { type: 'partner_boost', magnitude: 0.05 }
  },
  {
    id: 'leadership_2',
    name: 'Leader at the Crease',
    description: '+7% to batting partner\'s stats',
    spCost: 5,
    tier: 2,
    prerequisiteId: 'leadership_1',
    effect: { type: 'partner_boost', magnitude: 0.07 }
  },
  {
    id: 'leadership_3',
    name: 'Alpha Aura',
    description: '+10% to batting partner\'s stats',
    spCost: 10,
    tier: 3,
    prerequisiteId: 'leadership_2',
    effect: { type: 'partner_boost', magnitude: 0.10 }
  }
];
