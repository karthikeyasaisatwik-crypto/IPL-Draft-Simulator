import type { CareerState } from '../store/careerStore';
import type { CareerEvent } from './careerTypes';

export function selectEvent(state: CareerState, events: CareerEvent[]): CareerEvent | null {
  const eligible = events.filter(evt => {
    if (evt.minWeek !== undefined && state.currentWeek < evt.minWeek) return false;
    if (evt.maxWeek !== undefined && state.currentWeek > evt.maxWeek) return false;
    if (evt.requiresFlag && !state.unlockedFlags[evt.requiresFlag]) return false;
    if (evt.excludesFlag && state.unlockedFlags[evt.excludesFlag]) return false;
    return true;
  });

  let pool = eligible.filter(evt => !state.recentEventIds.includes(evt.id));
  if (pool.length === 0) {
    pool = eligible;
  }
  if (pool.length === 0) return null;

  const totalWeight = pool.reduce((sum, evt) => sum + evt.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const evt of pool) {
    if (roll < evt.weight) return evt;
    roll -= evt.weight;
  }
  return pool[pool.length - 1];
}
