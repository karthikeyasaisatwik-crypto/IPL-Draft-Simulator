import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Archetype } from '../engine/careerTypes';

export interface HallOfFameEntry {
  playerName: string;
  archetype?: Archetype;
  finalScore: number;
  tier: string;
  retirementAge: number;
  retirementWeek: number;
  isCaptain: boolean;
  completedAt: string;
}

export interface HallOfFameState {
  entries: HallOfFameEntry[];
  addEntry: (entry: HallOfFameEntry) => void;
}

export const useHallOfFameStore = create<HallOfFameState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) => set((state) => {
        const newEntries = [...state.entries, entry].sort((a, b) => b.finalScore - a.finalScore);
        return { entries: newEntries };
      }),
    }),
    { name: 'hall-of-fame-storage' }
  )
);
