import { create } from 'zustand';
import type { GameMode, DraftedTeam, MatchState, CampaignState, Player, UnifiedMatchResult, PitchType } from '../engine/types';
import { FRANCHISE_CODES, PLAYERS } from '../data/players';
import { simulateChase300 } from '../engine/simulation';
import { generateAIOpponent } from '../engine/aiDraft';
import { simulateH2HMatch } from '../engine/h2hSimulation';

// ============================================================
// APPLICATION SCREENS
// ============================================================

export type AppScreen = 'MAIN_MENU' | 'DRAFT_SETUP' | 'DRAFT' | 'COACH_DASHBOARD' | 'TICKER' | 'SIMULATION' | 'MATCH' | 'RESULT' | 'CAMPAIGN' | 'CAREER_HUB';

const SQUAD_SIZE = 11;

const PITCH_TYPES: PitchType[] = ['FLAT', 'DUSTY', 'GREEN', 'BALANCED'];

// ============================================================
// GAME STORE
// Central state for the entire application. Drives which screen
// is rendered and holds the active match/campaign context.
// ============================================================

interface GameStore {
  // — Navigation —
  currentScreen: AppScreen;
  setScreen: (screen: AppScreen) => void;

  // — Mode Selection & Difficulty —
  selectedMode: GameMode | null;
  selectMode: (mode: GameMode) => void;
  difficulty: 'EASY' | 'HARD';
  setDifficulty: (diff: 'EASY' | 'HARD') => void;

  // — Pitch Condition —
  currentPitch: PitchType | null;

  chase300HighScore: number;
  updateChase300HighScore: (score: number) => void;

  // — Draft State (Single Player) —
  draftedSquad: (Player | null)[];  // exactly 11 slots, index 0 = batting position 1
  draftPlayer: (player: Player, slotIndex: number) => void;
  removeFromSquad: (slotIndex: number) => void;
  clearSquad: () => void;
  startCareer: () => void;

  playerTeam: DraftedTeam | null;
  setPlayerTeam: (team: DraftedTeam) => void;

  // — Dual Player (Pass & Play) State —
  isDualPlayerMode: boolean;
  teamAName: string;
  teamBName: string;
  teamASquad: (Player | null)[];
  teamBSquad: (Player | null)[];
  currentDraftingTeam: 'A' | 'B';
  setDualPlayerMode: (enabled: boolean) => void;
  setTeamNames: (nameA: string, nameB: string) => void;
  startDualDraft: () => void;
  draftPlayerDual: (player: Player, slotIndex: number) => void;
  startDualH2HSimulation: (teamABatsFirst: boolean) => void;

  // — Spin Mechanic —
  currentSpunTeam: string | null;
  spinForTeam: () => void;
  clearSpunTeam: () => void;

  // — Match State —
  matchState: MatchState | null;
  setMatchState: (state: MatchState | null) => void;
  
  // — Match Result State —
  lastMatchResult: UnifiedMatchResult | null;
  startSimulation: () => void;
  startH2HSimulation: (userBatsFirst: boolean) => void;
  finishSimulation: () => void;

  // — Campaign State (Gauntlet only) —
  campaignState: CampaignState | null;
  setCampaignState: (state: CampaignState | null) => void;

  // — Reset —
  resetToMenu: () => void;
}

function emptySquad(): (Player | null)[] {
  return Array(SQUAD_SIZE).fill(null);
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state — app boots into the main menu
  currentScreen: 'MAIN_MENU',
  selectedMode: null,
  draftedSquad: emptySquad(),
  playerTeam: null,
  currentSpunTeam: null,
  matchState: null,
  lastMatchResult: null,
  campaignState: null,
  difficulty: 'EASY',
  currentPitch: null,

  // — Dual Player defaults —
  isDualPlayerMode: false,
  teamAName: 'Team 1',
  teamBName: 'Team 2',
  teamASquad: emptySquad(),
  teamBSquad: emptySquad(),
  currentDraftingTeam: 'A' as const,

  setDifficulty: (diff) => set({ difficulty: diff }),
  chase300HighScore: parseInt(localStorage.getItem('chase300HighScore') || '0', 10),
  updateChase300HighScore: (score) => set((state) => {
    if (score > state.chase300HighScore) {
      localStorage.setItem('chase300HighScore', score.toString());
      return { chase300HighScore: score };
    }
    return {};
  }),

  setScreen: (screen) => set({ currentScreen: screen }),

  selectMode: (mode) => {
    // H2H goes to the setup screen first; other modes go directly to draft
    const screen = mode === 'H2H' ? 'DRAFT_SETUP' : 'DRAFT';
    
    // Generate a random pitch for H2H mode
    const pitch = mode === 'H2H' 
      ? PITCH_TYPES[Math.floor(Math.random() * PITCH_TYPES.length)]
      : null;

    set({
      selectedMode: mode,
      currentScreen: screen,
      currentPitch: pitch,
      // Reset stale state from any previous session
      draftedSquad: emptySquad(),
      playerTeam: null,
      currentSpunTeam: null,
      matchState: null,
      lastMatchResult: null,
      campaignState: null,
      // Reset dual player state
      isDualPlayerMode: false,
      teamAName: 'Team 1',
      teamBName: 'Team 2',
      teamASquad: emptySquad(),
      teamBSquad: emptySquad(),
      currentDraftingTeam: 'A' as const,
    });
  },

  // — Draft Actions (Single Player) —
  // slotIndex is 0-based (index into the 11-element array).
  // The UI maps batting position N to index N-1.
  draftPlayer: (player, slotIndex) =>
    set((state) => {
      if (slotIndex < 0 || slotIndex >= SQUAD_SIZE) return state;
      if (state.draftedSquad[slotIndex] !== null) return state; // slot occupied
      const next = [...state.draftedSquad];
      next[slotIndex] = player;
      return { draftedSquad: next, currentSpunTeam: null }; // reset spin after pick
    }),

  removeFromSquad: (slotIndex) =>
    set((state) => {
      const next = [...state.draftedSquad];
      next[slotIndex] = null;
      return { draftedSquad: next };
    }),

  clearSquad: () => set({ draftedSquad: emptySquad(), currentSpunTeam: null }),

  setPlayerTeam: (team) => set({ playerTeam: team }),

  // — Dual Player Actions —
  setDualPlayerMode: (enabled) => set({ isDualPlayerMode: enabled }),

  setTeamNames: (nameA, nameB) => set({ teamAName: nameA, teamBName: nameB }),

  startDualDraft: () => set({
    currentScreen: 'DRAFT',
    teamASquad: emptySquad(),
    teamBSquad: emptySquad(),
    currentDraftingTeam: 'A' as const,
    currentSpunTeam: null,
  }),

  draftPlayerDual: (player, slotIndex) =>
    set((state) => {
      const team = state.currentDraftingTeam;
      const currentSquad = team === 'A' ? state.teamASquad : state.teamBSquad;

      if (slotIndex < 0 || slotIndex >= SQUAD_SIZE) return state;
      if (currentSquad[slotIndex] !== null) return state; // slot occupied

      const next = [...currentSquad];
      next[slotIndex] = player;

      // Compute total players drafted
      const teamAFilled = (team === 'A' ? next : state.teamASquad).filter(Boolean).length;
      const teamBFilled = (team === 'B' ? next : state.teamBSquad).filter(Boolean).length;
      const nextPickIndex = teamAFilled + teamBFilled;

      // If draft is complete, keep current team (doesn't matter)
      let nextTeam = state.currentDraftingTeam;
      if (nextPickIndex < SQUAD_SIZE * 2) {
        // Strict alternating order (A, B, A, B)
        if (nextPickIndex % 2 === 0) {
          nextTeam = 'A';
        } else {
          nextTeam = 'B';
        }
      }

      return {
        ...(team === 'A' ? { teamASquad: next } : { teamBSquad: next }),
        currentDraftingTeam: nextTeam,
        currentSpunTeam: null, // reset spin after pick
      };
    }),

  startDualH2HSimulation: (teamABatsFirst) => {
    const state = get();
    const squadA = state.teamASquad.filter(Boolean) as Player[];
    const squadB = state.teamBSquad.filter(Boolean) as Player[];

    const result = simulateH2HMatch(
      squadA, squadB,
      state.teamAName, state.teamBName,
      teamABatsFirst,
      state.currentPitch || 'BALANCED'
    );

    set({
      lastMatchResult: result,
      currentScreen: 'TICKER',
    });
  },

  // — Spin Mechanic —
  spinForTeam: () => {
    const randomIndex = Math.floor(Math.random() * FRANCHISE_CODES.length);
    set({ currentSpunTeam: FRANCHISE_CODES[randomIndex] });
  },

  clearSpunTeam: () => set({ currentSpunTeam: null }),

  setMatchState: (state) => set({ matchState: state }),

  startSimulation: () => {
    const state = get();
    // Wrap the old simulateChase300 so we can test it while we add H2H
    const result = simulateChase300(state.draftedSquad);
    
    // Update Chase 300 high score
    if (result.innings && result.innings.length > 0) {
      state.updateChase300HighScore(result.innings[0].totalRuns);
    }

    set({
      lastMatchResult: result,
      currentScreen: 'TICKER'
    });
  },

  startH2HSimulation: (userBatsFirst) => {
    const state = get();
    // 1. Get User's 11 and their chosen team name
    const userSquad = state.draftedSquad.filter(Boolean) as Player[];
    const userTeamName = userSquad.length > 0 ? userSquad[0].team : 'My XI';

    // 2. Generate AI Opponent
    const userIds = new Set(userSquad.map(p => p.id));
    const availablePlayers = PLAYERS.filter(p => !userIds.has(p.id));
    const { aiSquad } = generateAIOpponent(userTeamName, availablePlayers);

    // 3. Simulate Match
    const result = simulateH2HMatch(
      userSquad, aiSquad, 'YOUR XI', 'AI XI', userBatsFirst, state.currentPitch || 'BALANCED'
    );

    set({
      lastMatchResult: result,
      currentScreen: 'TICKER'
    });
  },

  finishSimulation: () => {
    set({ currentScreen: 'SIMULATION' });
  },

  setCampaignState: (state) => set({ campaignState: state }),

  resetToMenu: () =>
    set({
      currentScreen: 'MAIN_MENU',
      selectedMode: null,
      draftedSquad: emptySquad(),
      playerTeam: null,
      currentSpunTeam: null,
      matchState: null,
      lastMatchResult: null,
      campaignState: null,
      // Reset dual player state
      isDualPlayerMode: false,
      teamAName: 'Team 1',
      teamBName: 'Team 2',
      teamASquad: emptySquad(),
      teamBSquad: emptySquad(),
      currentDraftingTeam: 'A' as const,
    }),

  startCareer: () => set({ currentScreen: 'CAREER_HUB' }),
}));
