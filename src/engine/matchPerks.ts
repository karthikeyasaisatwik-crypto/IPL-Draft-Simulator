import type { Player } from './types';

// Magnitudes are percentage gains, so 0.05 means a 1.05 multiplier.
export function getMatchPerkMultiplier(striker: Player, partner: Player, chasing: boolean): number {
  const chasingGain = chasing ? (striker.activeSkillEffects ?? []).filter(e => e.type === 'chasing_boost').reduce((sum, e) => sum + e.magnitude, 0) : 0;
  const partnerGain = (partner.activeSkillEffects ?? []).filter(e => e.type === 'partner_boost').reduce((sum, e) => sum + e.magnitude, 0);
  return (1 + chasingGain) * (1 + partnerGain);
}
