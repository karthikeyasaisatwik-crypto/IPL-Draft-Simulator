import type { Player } from './types';
import { FRANCHISE_CODES } from '../data/players';

export function generateAIOpponent(userTeamName: string, availablePlayers: Player[]): { aiTeamName: string; aiSquad: Player[] } {
  // 1. Select a random franchise that isn't the user's team
  const possibleTeams = FRANCHISE_CODES.filter(t => t !== userTeamName);
  const aiTeamName = possibleTeams.length > 0
    ? possibleTeams[Math.floor(Math.random() * possibleTeams.length)]
    : 'AI XI';

  // 2. Draft 11 players based on standard squad balance, strictly adhering to allowedSlots
  const aiSquad: (Player | null)[] = new Array(11).fill(null);
  const draftedIds = new Set<string>();
  const pool = [...availablePlayers];

  const byBatting = (a: Player, b: Player) => (b.batRating + b.powRating) - (a.batRating + a.powRating);
  const byBowling = (a: Player, b: Player) => b.bwlRating - a.bwlRating;

  const pickForSlot = (slotIndex: number, roleFilter: (p: Player) => boolean, sortFn: (a: Player, b: Player) => number) => {
    if (aiSquad[slotIndex]) return true; // Already filled
    const candidates = pool.filter(p => !draftedIds.has(p.id) && p.allowedSlots.includes(slotIndex + 1) && roleFilter(p));
    if (candidates.length > 0) {
      candidates.sort(sortFn);
      const pick = candidates[0];
      aiSquad[slotIndex] = pick;
      draftedIds.add(pick.id);
      return true;
    }
    return false;
  };

  // Step A: Ensure 1 Wicket Keeper in top 7
  for (let i = 0; i < 7; i++) {
    if (pickForSlot(i, p => p.role === 'WK', byBatting)) break;
  }

  // Step B: Ensure slots 8, 9, 10, 11 are strictly Bowlers or All-Rounders
  for (let i = 7; i < 11; i++) {
    pickForSlot(i, p => p.role === 'Bowler' || p.role === 'All-Rounder', byBowling);
  }

  // Step C: Fill remaining slots with the best fit
  for (let i = 0; i < 11; i++) {
    if (!aiSquad[i]) {
      // Top 7 prefer batters, bottom 4 prefer bowlers
      const sortFn = i < 7 ? byBatting : byBowling;
      pickForSlot(i, () => true, sortFn);
    }
  }

  // Step D: Emergency fallback if any slots are still empty (should be rare)
  for (let i = 0; i < 11; i++) {
    if (!aiSquad[i]) {
      const fallback = pool.find(p => !draftedIds.has(p.id));
      if (fallback) {
        aiSquad[i] = fallback;
        draftedIds.add(fallback.id);
      }
    }
  }

  return { aiTeamName, aiSquad: aiSquad as Player[] };
}
