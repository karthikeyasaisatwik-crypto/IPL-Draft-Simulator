import type { CareerState, CareerTier } from '../store/careerStore';

const PHASE_AGE_RANGES: Record<Exclude<CareerTier, 'RETIRED' | 'GLOBAL_ICON_RETIREMENT_PENDING'>, { startAge: number; endAge: number; safetyNetTurns: number }> = {
  GRASSROOTS:        { startAge: 18, endAge: 20, safetyNetTurns: 20 },
  FRANCHISE_ROOKIE:  { startAge: 20, endAge: 27, safetyNetTurns: 30 },
  GLOBAL_ICON:       { startAge: 27, endAge: 38, safetyNetTurns: 46 },
};

export function computeAge(tier: CareerTier, turnsInTier: number): number {
  if (tier === 'RETIRED' || tier === 'GLOBAL_ICON_RETIREMENT_PENDING') return 38;
  const range = PHASE_AGE_RANGES[tier as keyof typeof PHASE_AGE_RANGES];
  if (!range) return 38;
  const progress = Math.min(turnsInTier / range.safetyNetTurns, 1);
  return Math.round(range.startAge + progress * (range.endAge - range.startAge));
}

export function checkTierTransition(state: CareerState): CareerTier {
  if (state.careerTier === 'GRASSROOTS') {
    const turnsInTier = state.currentWeek - state.tierStartWeek;
    if (turnsInTier > 8 && state.battingRating > 60) return 'FRANCHISE_ROOKIE'; // fast track
    if (turnsInTier > 20) return 'FRANCHISE_ROOKIE'; // safety net
  }
  if (state.careerTier === 'FRANCHISE_ROOKIE') {
    const turnsInTier = state.currentWeek - state.tierStartWeek;
    if (turnsInTier > 20 && (state.brandValue > 60 || state.mediaHype > 70)) return 'GLOBAL_ICON';
    if (turnsInTier > 30) return 'GLOBAL_ICON'; // safety net
  }
  if (state.careerTier === 'GLOBAL_ICON') {
    const turnsInTier = state.currentWeek - state.tierStartWeek;
    if (turnsInTier > 30 && state.legacyScore > 150) return 'GLOBAL_ICON_RETIREMENT_PENDING';
    if (turnsInTier > 46) return 'GLOBAL_ICON_RETIREMENT_PENDING'; // safety net
  }
  if (state.careerTier === 'GLOBAL_ICON_RETIREMENT_PENDING') {
    const farewellTurnsElapsed = state.currentWeek - state.retirementPendingStartWeek;
    if (farewellTurnsElapsed >= 4) return 'RETIRED';
  }
  return state.careerTier;
}
