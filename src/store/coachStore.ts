// ============================================================
// COACH MODE — ISOLATED ZUSTAND STORE
// Completely separate from gameStore.ts. Manages the phased
// match state, tactical decisions, and phase progression.
// ============================================================

import { create } from 'zustand';
import type {
  Player,
  PitchType,
  CoachMatchPhase,
  PartialInningsState,
  InningsResult,
  UnifiedMatchResult,
} from '../engine/types';
import {
  initPartialInnings,
  simulateCoachPhase,
  finalizeInnings,
  buildCoachMatchResult,
  getPitchFactor,
} from '../engine/coachSimulation';
import { generatePostMatchEmails } from '../engine/emailGenerator';
import type { CoachEmail } from '../engine/emailGenerator';
import { generateKeyMatchups } from '../engine/matchupMatrix';
import type { Matchup } from '../engine/matchupMatrix';
import { PLAYERS } from '../data/players';
import { generateAIOpponent } from '../engine/aiDraft';
import { useGameStore } from './gameStore';

// ============================================================
// PHASE BALL RANGES
// Each phase maps to a start/end ball (1-indexed).
// Powerplay: balls 1-36 (overs 1-6)
// Middle:    balls 37-96 (overs 7-16)
// Death:     balls 97-120 (overs 17-20)
// ============================================================

const PHASE_RANGES: Record<string, { start: number; end: number }> = {
  PP:    { start: 1,  end: 36 },
  MID:   { start: 37, end: 96 },
  DEATH: { start: 97, end: 120 },
};

// ============================================================
// STORE INTERFACE
// ============================================================

interface CoachStore {
  isCoachMode: boolean;
  coachPhase: CoachMatchPhase;
  teamTactics: number; // 0 to 100 slider (default 50)
  preferredBowlers: string[]; // [primaryBowlerId, secondaryBowlerId]

  // Tactics history for each phase (for scorecard and stats)
  inn1Tactics: number[];
  inn2Tactics: number[];

  // Partial innings states (live simulation data)
  partialInn1: PartialInningsState | null;
  partialInn2: PartialInningsState | null;

  // Finalized innings (after each innings completes)
  finalInn1: InningsResult | null;
  finalInn2: InningsResult | null;
  coachMatchResult: UnifiedMatchResult | null;
  postMatchEmails: CoachEmail[];

  // Squads & match config
  userSquad: Player[];
  aiSquad: Player[];
  userTeamName: string;
  aiTeamName: string;
  userBatsFirst: boolean;
  pitchType: PitchType;
  keyMatchups: Matchup[];

  // Actions
  setCoachMode: (enabled: boolean) => void;
  setTactics: (val: number) => void;
  setPreferredBowlers: (bowlerIds: string[]) => void;
  initCoachMatch: (userBatsFirst: boolean) => void;
  startPhase: () => void;
  resetCoach: () => void;
}

export const useCoachStore = create<CoachStore>((set, get) => ({
  // Defaults
  isCoachMode: false,
  coachPhase: 'PRE_MATCH',
  teamTactics: 50,
  preferredBowlers: [],
  inn1Tactics: [],
  inn2Tactics: [],
  partialInn1: null,
  partialInn2: null,
  finalInn1: null,
  finalInn2: null,
  coachMatchResult: null,
  postMatchEmails: [],
  userSquad: [],
  aiSquad: [],
  userTeamName: 'COACH XI',
  aiTeamName: 'AI XI',
  userBatsFirst: true,
  pitchType: 'BALANCED',
  keyMatchups: [],

  setCoachMode: (enabled) => set({ isCoachMode: enabled }),

  setTactics: (val) => set({ teamTactics: val }),

  setPreferredBowlers: (bowlerIds) => set({ preferredBowlers: bowlerIds }),

  initCoachMatch: (userBatsFirst) => {
    const gameState = useGameStore.getState();
    const userSquad = gameState.draftedSquad.filter(Boolean) as Player[];
    const userTeamName = 'COACH XI';

    // Generate AI opponent
    const userIds = new Set(userSquad.map(p => p.id));
    const availablePlayers = PLAYERS.filter(p => !userIds.has(p.id));
    const { aiSquad } = generateAIOpponent(userTeamName, availablePlayers);

    // Random pitch
    const pitchTypes: PitchType[] = ['FLAT', 'DUSTY', 'GREEN', 'BALANCED'];
    const pitchType = pitchTypes[Math.floor(Math.random() * pitchTypes.length)];

    // Determine who bats/bowls first
    const battingSquad = userBatsFirst ? userSquad : aiSquad;
    const bowlingSquad = userBatsFirst ? aiSquad : userSquad;
    const battingTeamName = userBatsFirst ? userTeamName : 'AI XI';

    // Initialize innings 1
    const partialInn1 = initPartialInnings(battingSquad, battingTeamName, bowlingSquad, null);

    // Generate matchups
    const keyMatchups = generateKeyMatchups(userSquad, aiSquad);

    set({
      isCoachMode: true,
      coachPhase: 'PRE_MATCH',
      teamTactics: 50,
      preferredBowlers: [],
      inn1Tactics: [],
      inn2Tactics: [],
      partialInn1,
      partialInn2: null,
      finalInn1: null,
      finalInn2: null,
      coachMatchResult: null,
      postMatchEmails: [],
      userSquad,
      aiSquad,
      userTeamName,
      aiTeamName: 'AI XI',
      userBatsFirst,
      pitchType,
      keyMatchups,
    });

    // Navigate to Coach Dashboard
    useGameStore.setState({ currentScreen: 'COACH_DASHBOARD' });
  },

  startPhase: () => {
    const state = get();
    const pitchFactor = getPitchFactor(state.pitchType);

    switch (state.coachPhase) {
      // ── PRE_MATCH → Simulate Powerplay (balls 1-36) ──
      case 'PRE_MATCH': {
        if (!state.partialInn1) return;
        const isBatting = state.userBatsFirst; // user batting in inn1
        const updated = simulateCoachPhase(
          state.partialInn1,
          PHASE_RANGES.PP.start,
          PHASE_RANGES.PP.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        set({
          partialInn1: updated,
          coachPhase: 'INN_1_PP',
          inn1Tactics: [state.teamTactics],
          teamTactics: 50, // reset to balanced for next decision
          preferredBowlers: [],
        });
        break;
      }

      // ── INN_1_PP → Simulate Middle Overs (balls 37-96) ──
      case 'INN_1_PP': {
        if (!state.partialInn1) return;
        const isBatting = state.userBatsFirst;
        const updated = simulateCoachPhase(
          state.partialInn1,
          PHASE_RANGES.MID.start,
          PHASE_RANGES.MID.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        set({
          partialInn1: updated,
          coachPhase: 'INN_1_MID',
          inn1Tactics: [...state.inn1Tactics, state.teamTactics],
          teamTactics: 50,
          preferredBowlers: [],
        });
        break;
      }

      // ── INN_1_MID → Simulate Death Overs (balls 97-120) ──
      case 'INN_1_MID': {
        if (!state.partialInn1) return;
        const isBatting = state.userBatsFirst;
        const updated = simulateCoachPhase(
          state.partialInn1,
          PHASE_RANGES.DEATH.start,
          PHASE_RANGES.DEATH.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        const finalInn1 = finalizeInnings(updated);

        // Initialize innings 2 (roles swap)
        const chasingSquad = state.userBatsFirst ? state.aiSquad : state.userSquad;
        const fieldingSquad = state.userBatsFirst ? state.userSquad : state.aiSquad;
        const chasingTeamName = state.userBatsFirst ? state.aiTeamName : state.userTeamName;
        const target = finalInn1.totalRuns + 1;

        const partialInn2 = initPartialInnings(chasingSquad, chasingTeamName, fieldingSquad, target);

        set({
          partialInn1: updated,
          finalInn1,
          partialInn2,
          coachPhase: 'INN_1_DEATH',
          inn1Tactics: [...state.inn1Tactics, state.teamTactics],
          teamTactics: 50,
          preferredBowlers: [],
        });
        break;
      }

      // ── INN_1_DEATH → Simulate Inn 2 Powerplay (balls 1-36) ──
      case 'INN_1_DEATH': {
        if (!state.partialInn2) return;
        const isBatting = !state.userBatsFirst; // user batting in inn2 if they bowled first
        const updated = simulateCoachPhase(
          state.partialInn2,
          PHASE_RANGES.PP.start,
          PHASE_RANGES.PP.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        set({
          partialInn2: updated,
          coachPhase: 'INN_2_PP',
          inn2Tactics: [state.teamTactics],
          teamTactics: 50,
          preferredBowlers: [],
        });
        break;
      }

      // ── INN_2_PP → Simulate Inn 2 Middle (balls 37-96) ──
      case 'INN_2_PP': {
        if (!state.partialInn2) return;
        const isBatting = !state.userBatsFirst;
        const updated = simulateCoachPhase(
          state.partialInn2,
          PHASE_RANGES.MID.start,
          PHASE_RANGES.MID.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        set({
          partialInn2: updated,
          coachPhase: 'INN_2_MID',
          inn2Tactics: [...state.inn2Tactics, state.teamTactics],
          teamTactics: 50,
          preferredBowlers: [],
        });
        break;
      }

      // ── INN_2_MID → Simulate Inn 2 Death (balls 97-120) → FINISHED ──
      case 'INN_2_MID': {
        if (!state.partialInn2 || !state.finalInn1) return;
        const isBatting = !state.userBatsFirst;
        const updated = simulateCoachPhase(
          state.partialInn2,
          PHASE_RANGES.DEATH.start,
          PHASE_RANGES.DEATH.end,
          state.teamTactics,
          pitchFactor,
          isBatting,
          state.preferredBowlers,
          state.keyMatchups,
        );
        const finalInn2 = finalizeInnings(updated);

        // Build the complete match result
        const matchResult = buildCoachMatchResult(
          state.finalInn1,
          finalInn2,
          state.userTeamName,
          state.aiTeamName,
          state.userBatsFirst,
          state.pitchType,
        );

        // Average tactics used in innings
        const avgTactics = [...state.inn1Tactics, ...state.inn2Tactics, state.teamTactics].reduce((a, b) => a + b, 0) / 
                           ([...state.inn1Tactics, ...state.inn2Tactics].length + 1);

        const mailbox = generatePostMatchEmails(
          matchResult,
          state.userBatsFirst,
          avgTactics,
          matchResult.manOfTheMatch,
          state.userTeamName,
          state.aiTeamName
        );

        // Save to gameStore as backup, but stay on COACH_DASHBOARD to render dedicated CoachScorecard
        useGameStore.setState({
          lastMatchResult: matchResult,
        });

        set({
          partialInn2: updated,
          finalInn2,
          coachMatchResult: matchResult,
          postMatchEmails: mailbox,
          coachPhase: 'FINISHED',
          inn2Tactics: [...state.inn2Tactics, state.teamTactics],
          preferredBowlers: [],
        });
        break;
      }

      default:
        break;
    }
  },

  resetCoach: () =>
    set({
      isCoachMode: false,
      coachPhase: 'PRE_MATCH',
      teamTactics: 50,
      preferredBowlers: [],
      inn1Tactics: [],
      inn2Tactics: [],
      partialInn1: null,
      partialInn2: null,
      finalInn1: null,
      finalInn2: null,
      coachMatchResult: null,
      postMatchEmails: [],
      userSquad: [],
      aiSquad: [],
      userTeamName: 'COACH XI',
      aiTeamName: 'AI XI',
      userBatsFirst: true,
      pitchType: 'BALANCED',
      keyMatchups: [],
    }),
}));
