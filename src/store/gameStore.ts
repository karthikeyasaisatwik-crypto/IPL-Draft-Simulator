import { create } from 'zustand';
import type { GameMode, DraftedTeam, MatchState, CampaignState, Player, UnifiedMatchResult } from '../engine/types';
import { FRANCHISE_CODES, PLAYERS } from '../data/players';
import { simulateChase300 } from '../engine/simulation';
import { generateAIOpponent } from '../engine/aiDraft';
import { simulateH2HMatch } from '../engine/h2hSimulation';

// ============================================================
// APPLICATION SCREENS
// ============================================================

export type AppScreen = 'MAIN_MENU' | 'DRAFT' | 'TICKER' | 'SIMULATION' | 'MATCH' | 'RESULT' | 'CAMPAIGN';

const SQUAD_SIZE = 11;

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

  chase300HighScore: number;
  updateChase300HighScore: (score: number) => void;

  // — Draft State —
  draftedSquad: (Player | null)[];  // exactly 11 slots, index 0 = batting position 1
  draftPlayer: (player: Player, slotIndex: number) => void;
  removeFromSquad: (slotIndex: number) => void;
  clearSquad: () => void;

  playerTeam: DraftedTeam | null;
  setPlayerTeam: (team: DraftedTeam) => void;

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

  selectMode: (mode) =>
    set({
      selectedMode: mode,
      currentScreen: 'DRAFT',
      // Reset stale state from any previous session
      draftedSquad: emptySquad(),
      playerTeam: null,
      currentSpunTeam: null,
      matchState: null,
      lastMatchResult: null,
      campaignState: null,
    }),

  // — Draft Actions —
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
    const result = simulateH2HMatch(userSquad, aiSquad, 'YOUR XI', 'AI XI', userBatsFirst);

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
    }),
}));
