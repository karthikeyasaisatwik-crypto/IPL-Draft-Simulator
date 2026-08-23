import type { CareerState } from '../store/careerStore';
import type { AnyCareerEvent } from './careerTypes';
import { PHASE_1_EVENTS } from './phase1Events';
import { PHASE_2_EVENTS } from './phase2Events';
import { PHASE_3_EVENTS } from './phase3Events';
import { RETIREMENT_EVENTS } from './retirementEvents';
import { selectEvent } from './selectEvent';

export function getNextCareerEvent(state: CareerState): AnyCareerEvent | null {
  const turnsInTier = state.currentWeek - state.tierStartWeek;

  if (state.careerTier === 'GRASSROOTS') {
    if (turnsInTier === 20 || (turnsInTier === 8 && state.battingRating > 60)) {
      return { 
        id: 'bm_district_final', 
        category: 'BIG_MATCH',
        title: 'The District Final', 
        target: 140, 
        quality: 'grassroots', 
        bowlingDifficultyMultiplier: 0.8,
        description: 'Your final chance to impress the scouts before the draft.' 
      };
    }
  } else if (state.careerTier === 'FRANCHISE_ROOKIE') {
    if (turnsInTier === 30 || (turnsInTier === 20 && (state.brandValue > 60 || state.mediaHype > 70))) {
      return { 
        id: 'bm_playoff_qualifier', 
        category: 'BIG_MATCH',
        title: 'The Playoff Qualifier', 
        target: 180, 
        quality: 'franchise', 
        bowlingDifficultyMultiplier: 1.0,
        description: 'A do-or-die match to get your franchise into the playoffs.'
      };
    }
  } else if (state.careerTier === 'GLOBAL_ICON') {
    if (turnsInTier === 20) {
      return { 
        id: 'bm_world_cup_final', 
        category: 'BIG_MATCH',
        title: 'The World Cup Final', 
        target: 210, 
        quality: 'icon', 
        bowlingDifficultyMultiplier: 1.3,
        description: 'The eyes of the world are on you. Bring the cup home.'
      };
    }
  }

  if (state.careerTier === 'GLOBAL_ICON_RETIREMENT_PENDING') {
    return selectEvent(state, RETIREMENT_EVENTS);
  }

  let pool = PHASE_1_EVENTS;
  if (state.careerTier === 'FRANCHISE_ROOKIE') {
    pool = PHASE_2_EVENTS;
  } else if (state.careerTier === 'GLOBAL_ICON') {
    pool = PHASE_3_EVENTS;
  }
  return selectEvent(state, pool);
}
