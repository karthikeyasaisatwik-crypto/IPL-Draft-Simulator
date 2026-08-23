import { checkTierTransition, computeAge } from '../engine/tierTransitions';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Player } from '../engine/types';
import type { SkillEffect, Archetype, ActiveModifier } from '../engine/careerTypes';
import { ARCHETYPE_CONFIG } from '../engine/careerTypes';
import { SKILL_NODES } from '../engine/skillTreeData';

export type StatKey = 'academicStress' | 'coachFavor' | 'parentalExpectations' | 'popularity' | 'lockerRoomRespect' | 'battingRating' | 'stamina' | 'form' | 'funds' | 'franchiseTrust' | 'mediaHype' | 'mentality' | 'brandValue' | 'familyMorale' | 'legacyScore';

export const STAT_DIRECTIONS: Partial<Record<StatKey, 'good-high' | 'good-low' | 'neutral'>> = {
  academicStress: 'good-low',
  coachFavor: 'good-high',
  parentalExpectations: 'good-high',
  popularity: 'neutral',
  lockerRoomRespect: 'good-high',
  battingRating: 'good-high',
  stamina: 'good-high',
  form: 'good-high',
  funds: 'good-high',
  franchiseTrust: 'good-high',
  mediaHype: 'neutral',
  mentality: 'good-high',
  brandValue: 'good-high',
  familyMorale: 'good-high',
};

export type CareerTier = 'GRASSROOTS' | 'FRANCHISE_ROOKIE' | 'GLOBAL_ICON' | 'GLOBAL_ICON_RETIREMENT_PENDING' | 'RETIRED';

export const CONTRACT_WEEKLY_INCOME: Record<string, number> = {
  'State Level - Unpaid': 0,
  'Franchise Rookie Retainer': 400,
  'Franchise Regular Contract': 900,
  'Global Icon Deal': 3000,
};

export interface CareerState {
  playerName: string;
  archetype: Archetype;
  hasSelectedArchetype: boolean;
  age: number;
  currentWeek: number;
  funds: number;

  battingRating: number;
  stamina: number;
  form: number;
  mentality: number;

  academicStress: number;
  coachFavor: number;
  parentalExpectations: number;
  popularity: number;
  lockerRoomRespect: number;
  franchiseTrust: number;
  mediaHype: number;
  brandValue: number;
  familyMorale: number;
  legacyScore: number;

  currentBat: string;
  equipment: string[];
  unlockedSponsorships: string[];
  currentContract: string;
  careerTier: CareerTier;
  tierStartWeek: number;
  retirementPendingStartWeek: number;
  bigMatchHistory: { title: string; result: 'win' | 'loss'; playerRuns: number; turnPlayed: number }[];
  activeModifiers: ActiveModifier[];

  recentEventIds: string[];
  unlockedFlags: Record<string, boolean>;
  transitionModalText: string | null;

  isCaptain: boolean;
  managerCommissionRate: number;
  
  skillPoints: number;
  unlockedSkillNodes: string[];
  lastLegacySpMilestone: number;

  advanceWeek: () => void;
  applyStatChanges: (changes: Partial<Record<StatKey, number>>) => void;
  addActiveModifier: (modifier: ActiveModifier) => void;
  removeActiveModifier: (id: string) => void;
  initializeArchetype: (archetype: Archetype, playerName?: string) => void;
  addBigMatchRecord: (record: { title: string; result: 'win' | 'loss'; playerRuns: number; turnPlayed: number }) => void;
  recordEventShown: (eventId: string) => void;
  setFlag: (key: string, value: boolean) => void;
  clearTransitionModal: () => void;
  addSponsorship: (sponsor: string) => void;
  setCurrentContract: (contract: string) => void;
  unlockSkill: (nodeId: string, cost: number) => void;
  resetCareer: () => void;
  jumpToTier: (tier: CareerTier) => void;
  setRawState: (partial: Partial<CareerState>) => void;
}

const DEFAULT_STATE: Partial<CareerState> = {
  playerName: 'Rookie',
  archetype: 'PRODIGY',
  hasSelectedArchetype: false,
  age: 18,
  currentWeek: 1,
  funds: 0,

  battingRating: 40,
  stamina: 100,
  form: 50,
  mentality: 50,

  academicStress: 50,
  coachFavor: 50,
  parentalExpectations: 80,
  popularity: 10,
  lockerRoomRespect: 50,
  franchiseTrust: 50,
  mediaHype: 10,
  brandValue: 50,
  familyMorale: 50,
  legacyScore: 0,

  currentBat: 'Hand-me-down Kashmir Willow',
  equipment: [],
  unlockedSponsorships: [],
  currentContract: 'State Level - Unpaid',
  careerTier: 'GRASSROOTS',
  tierStartWeek: 1,
  retirementPendingStartWeek: 0,
  bigMatchHistory: [],
  activeModifiers: [],

  recentEventIds: [],
  unlockedFlags: {},
  transitionModalText: null,

  isCaptain: false,
  managerCommissionRate: 0,
  
  skillPoints: 0,
  unlockedSkillNodes: [],
  lastLegacySpMilestone: 0,
};

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      ...(DEFAULT_STATE as CareerState),

      initializeArchetype: (archetype: Archetype, playerName?: string) => set((state) => {
        const cfg = ARCHETYPE_CONFIG[archetype];
        return {
          archetype,
          playerName: playerName?.trim() || state.playerName || 'Rookie',
          battingRating: cfg.battingRating,
          stamina: cfg.stamina,
          lockerRoomRespect: cfg.lockerRoomRespect,
          parentalExpectations: cfg.parentalExpectations,
          hasSelectedArchetype: true,
          currentWeek: 1,
          age: 18,
          careerTier: 'GRASSROOTS',
          tierStartWeek: 1,
          retirementPendingStartWeek: 0,
          activeModifiers: [],
          bigMatchHistory: [],
          recentEventIds: [],
          unlockedFlags: {},
          transitionModalText: null,
        };
      }),

      addActiveModifier: (modifier: ActiveModifier) => set((state) => ({
        activeModifiers: [...state.activeModifiers.filter(m => m.id !== modifier.id), modifier]
      })),

      removeActiveModifier: (id: string) => set((state) => ({
        activeModifiers: state.activeModifiers.filter(m => m.id !== id)
      })),

      advanceWeek: () => set((state) => {
        let newWeek = state.currentWeek;
        let newFunds = state.funds;
        let newTier = state.careerTier;
        let newContract = state.currentContract;
        let newRecentEvents = [...state.recentEventIds];
        let newTransitionText = state.transitionModalText;
        let newTierStartWeek = state.tierStartWeek;
        let newFranchiseTrust = state.franchiseTrust;
        let newRetirementPendingStartWeek = state.retirementPendingStartWeek;

        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
        let modifiedStats: Partial<Record<StatKey, number>> = {};
        let updatedModifiers = state.activeModifiers.map(m => ({ ...m }));

        const getStat = (k: StatKey): number => {
          return modifiedStats[k] !== undefined ? modifiedStats[k]! : (state[k] as number);
        };

        if (!newTransitionText && state.careerTier !== 'RETIRED') {
          newWeek = state.currentWeek + 1;
          
          if (state.careerTier === 'FRANCHISE_ROOKIE' || state.careerTier === 'GLOBAL_ICON') {
            const income = CONTRACT_WEEKLY_INCOME[state.currentContract] || 0;
            newFunds += income * (1 - state.managerCommissionRate);
          }

          // 1. Apply active status effects
          updatedModifiers.forEach((mod) => {
            const cur = getStat(mod.stat);
            let nextVal = cur + mod.perTurnDelta;
            if (mod.stat === 'battingRating' || mod.stat === 'funds') {
              nextVal = Math.max(0, nextVal);
            } else if (mod.stat === 'legacyScore') {
              // no clamping
            } else {
              nextVal = clamp(nextVal, 0, 100);
            }
            modifiedStats[mod.stat] = nextVal;
            mod.turnsRemaining -= 1;
          });

          const nextTier = checkTierTransition({ 
            ...state, 
            ...modifiedStats,
            currentWeek: newWeek, 
            funds: newFunds 
          });
          
          if (nextTier !== state.careerTier) {
            newTier = nextTier;
            if (nextTier === 'GLOBAL_ICON_RETIREMENT_PENDING') {
              newRetirementPendingStartWeek = newWeek;
            } else if (nextTier !== 'RETIRED') {
              newTierStartWeek = newWeek;
            }
            newRecentEvents = []; 

            if (nextTier === 'FRANCHISE_ROOKIE') {
              newContract = 'Franchise Rookie Retainer';
              newTransitionText = 'You have been picked up in the franchise draft! Welcome to the big leagues. Your university days fade into the rearview mirror as the franchise chapter begins.';
              
              // Resolve retiring stats (academicStress & coachFavor) lump-sum immediately!
              let finalAcademicStress = getStat('academicStress');
              let finalCoachFavor = getStat('coachFavor');

              updatedModifiers = updatedModifiers.filter((mod) => {
                if (mod.stat === 'academicStress') {
                  finalAcademicStress = clamp(finalAcademicStress + (mod.perTurnDelta * Math.max(0, mod.turnsRemaining)), 0, 100);
                  return false;
                }
                if (mod.stat === 'coachFavor') {
                  finalCoachFavor = clamp(finalCoachFavor + (mod.perTurnDelta * Math.max(0, mod.turnsRemaining)), 0, 100);
                  return false;
                }
                return true;
              });

              modifiedStats['academicStress'] = finalAcademicStress;
              modifiedStats['coachFavor'] = finalCoachFavor;
              newFranchiseTrust = Math.round(Math.max(0, Math.min(100, 50 + (50 - finalAcademicStress) * 0.1 + (finalCoachFavor - 50) * 0.3)));
            } else if (nextTier === 'GLOBAL_ICON') {
              newContract = 'Global Icon Deal';
              newTransitionText = 'You are now a Global Icon. The world is watching your every move.';
            } else if (nextTier === 'GLOBAL_ICON_RETIREMENT_PENDING') {
              newTransitionText = 'Your glorious career is winding down. The Farewell Tour begins.';
            } else if (nextTier === 'RETIRED') {
              newContract = 'Retired';
              newTransitionText = 'The time has come to hang up your boots. What a journey it has been.';
            }
          }

          // Filter out expired modifiers
          updatedModifiers = updatedModifiers.filter(m => m.turnsRemaining > 0);
        }

        const turnsInTier = newWeek - (newTier === 'GLOBAL_ICON_RETIREMENT_PENDING' ? newRetirementPendingStartWeek : newTierStartWeek);
        const newAge = computeAge(newTier, turnsInTier);

        return { 
          ...modifiedStats,
          currentWeek: newWeek, 
          age: newAge,
          funds: newFunds,
          careerTier: newTier,
          currentContract: newContract,
          recentEventIds: newRecentEvents,
          transitionModalText: newTransitionText,
          tierStartWeek: newTierStartWeek,
          franchiseTrust: newFranchiseTrust,
          retirementPendingStartWeek: newRetirementPendingStartWeek,
          activeModifiers: updatedModifiers,
        };
      }),

      addBigMatchRecord: (record) => set((state) => ({
        bigMatchHistory: [...state.bigMatchHistory, record]
      })),

      applyStatChanges: (changes) => set((state) => {
        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
        const newState = { ...state };
        let newSp = state.skillPoints;
        let newLegacyMilestone = state.lastLegacySpMilestone;

        for (const [key, delta] of Object.entries(changes)) {
          const k = key as keyof typeof changes;
          if (typeof state[k] === 'number') {
            let newVal = (state[k] as number) + (delta || 0);
            if (k === 'battingRating' || k === 'funds') {
              newVal = Math.max(0, newVal);
            } else if (k === 'legacyScore') {
              // no clamping
            } else {
              newVal = clamp(newVal, 0, 100);
            }
            (newState as any)[k] = newVal;
          }
        }

        if (newState.legacyScore > 0) {
          const currentMilestone = Math.floor(newState.legacyScore / 20);
          if (currentMilestone > newLegacyMilestone) {
            newSp += (currentMilestone - newLegacyMilestone);
            newLegacyMilestone = currentMilestone;
          }
        }

        newState.skillPoints = newSp;
        newState.lastLegacySpMilestone = newLegacyMilestone;

        return newState;
      }),

      recordEventShown: (eventId) => set((state) => {
        const updated = [...state.recentEventIds, eventId];
        if (updated.length > 8) updated.shift();
        return { recentEventIds: updated };
      }),

      setFlag: (key, value) => set((state) => ({
        unlockedFlags: { ...state.unlockedFlags, [key]: value }
      })),

      clearTransitionModal: () => set({ transitionModalText: null }),
      addSponsorship: (sponsor) => set((state) => ({ unlockedSponsorships: [...state.unlockedSponsorships, sponsor] })),
      setCurrentContract: (contract) => set({ currentContract: contract }),
      unlockSkill: (nodeId, cost) => set((state) => ({ 
        unlockedSkillNodes: [...state.unlockedSkillNodes, nodeId],
        skillPoints: state.skillPoints - cost 
      })),

      resetCareer: () => set({
        ...(DEFAULT_STATE as CareerState),
        hasSelectedArchetype: false,
        activeModifiers: [],
        bigMatchHistory: [],
        unlockedFlags: {},
        recentEventIds: [],
        unlockedSkillNodes: [],
        equipment: [],
        unlockedSponsorships: [],
      }),

      jumpToTier: (tier: CareerTier) => set(() => {
        if (tier === 'GRASSROOTS') {
          return {
            careerTier: 'GRASSROOTS',
            currentWeek: 1,
            tierStartWeek: 1,
            age: 18,
            currentContract: 'State Level - Unpaid',
            retirementPendingStartWeek: 0,
            transitionModalText: null,
          };
        } else if (tier === 'FRANCHISE_ROOKIE') {
          return {
            careerTier: 'FRANCHISE_ROOKIE',
            currentWeek: 21,
            tierStartWeek: 21,
            age: 20,
            currentContract: 'Franchise Rookie Retainer',
            retirementPendingStartWeek: 0,
            transitionModalText: null,
          };
        } else if (tier === 'GLOBAL_ICON') {
          return {
            careerTier: 'GLOBAL_ICON',
            currentWeek: 51,
            tierStartWeek: 51,
            age: 27,
            currentContract: 'Global Icon Deal',
            retirementPendingStartWeek: 0,
            transitionModalText: null,
          };
        } else if (tier === 'GLOBAL_ICON_RETIREMENT_PENDING') {
          return {
            careerTier: 'GLOBAL_ICON_RETIREMENT_PENDING',
            currentWeek: 97,
            tierStartWeek: 51,
            retirementPendingStartWeek: 97,
            age: 38,
            currentContract: 'Global Icon Deal',
            transitionModalText: null,
          };
        } else {
          return {
            careerTier: 'RETIRED',
            currentWeek: 101,
            tierStartWeek: 51,
            retirementPendingStartWeek: 97,
            age: 38,
            currentContract: 'Retired',
            transitionModalText: null,
          };
        }
      }),

      setRawState: (partial: Partial<CareerState>) => set((state) => ({ ...state, ...partial })),
    }),
    { name: 'career-storage' }
  )
);

export function getActivePlayerCard(state: CareerState): Player & { activeSkillEffects: SkillEffect[] } {
  const activeSkillEffects = state.unlockedSkillNodes.map(nodeId => {
    const node = SKILL_NODES.find(n => n.id === nodeId);
    return node ? node.effect : null;
  }).filter(Boolean) as SkillEffect[];

  return {
    id: 'career_player_01',
    name: state.playerName,
    team: 'CAREER_TEAM',
    role: 'Batter',
    battingPosition: 3, 
    allowedSlots: [1,2,3,4,5,6],
    batRating: state.battingRating,
    powRating: state.form, 
    bwlRating: 5,
    activeSkillEffects
  };
}
