import type { CareerState } from '../store/careerStore';

export function calculateLegacy(state: CareerState): number {
  const cappedLegacy = Math.min(state.legacyScore, 250);
  const cappedFundsContribution = Math.min(state.funds / 100, 150);
  return Math.round(
    (cappedLegacy * 2) + state.brandValue + state.popularity + cappedFundsContribution
  );
}

export function getLegacyTier(score: number): string {
  if (score < 100) return 'Forgotten Prospect';
  if (score < 250) return 'Domestic Veteran';
  if (score < 400) return 'Franchise Legend';
  if (score < 600) return 'Global Icon';
  return 'Legend of the Game';
}
