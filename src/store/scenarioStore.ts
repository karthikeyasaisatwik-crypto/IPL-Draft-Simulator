import { create } from 'zustand';
import { SCENARIOS } from '../data/scenarios';
import { DEFAULT_COACH_PLANS } from '../engine/coachTactics';
import type { CoachPlans } from '../engine/coachTactics';
import type { PartialInningsState } from '../engine/types';
import type { ScenarioDecision, ScenarioProgress } from '../engine/scenarioTypes';
import { chooseScenarioBatter, playScenario, scenarioFinished } from '../engine/scenarioSimulation';

const STORAGE_KEY = 'ipl-scenarios-progress-v1';
function readProgress(): Record<string, ScenarioProgress> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return Object.fromEntries(Object.entries(saved).filter(([, value]) => {
      const p = value as ScenarioProgress;
      return p && Number.isInteger(p.attempts) && p.attempts >= 0 && Number.isInteger(p.wins) && p.wins >= 0 && p.wins <= p.attempts &&
        (p.bestMargin === undefined || Number.isFinite(p.bestMargin));
    })) as Record<string, ScenarioProgress>;
  } catch { return {}; }
}

interface ScenarioStore {
  scenarioId: string | null;
  innings: PartialInningsState | null;
  batting: boolean;
  seed: number;
  startingSeed: number;
  tactics: number;
  plans: CoachPlans;
  preferredBowler: string;
  needsBatter: boolean;
  decisions: ScenarioDecision[];
  progress: Record<string, ScenarioProgress>;
  storageWarning: boolean;
  error: string;
  start: (id: string, batting: boolean, seed?: number) => void;
  advance: (balls: number) => void;
  selectBatter: (index: number) => void;
  leave: () => void;
  configure: (changes: Partial<Pick<ScenarioStore, 'tactics' | 'plans' | 'preferredBowler'>>) => void;
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  scenarioId: null, innings: null, batting: true, seed: 1, startingSeed: 1, tactics: 50,
  plans: { ...DEFAULT_COACH_PLANS }, preferredBowler: '', needsBatter: false,
  decisions: [], progress: readProgress(), storageWarning: false, error: '',
  configure: changes => set(changes),
  start: (id, batting, seed = crypto.getRandomValues(new Uint32Array(1))[0]) => {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (!scenario) return;
    set({ scenarioId: id, innings: structuredClone(scenario.initial), batting, seed, startingSeed: seed,
      tactics: 50, plans: { ...DEFAULT_COACH_PLANS }, preferredBowler: '', needsBatter: false, decisions: [], error: '' });
  },
  leave: () => set({ scenarioId: null, innings: null, decisions: [], needsBatter: false, error: '' }),
  selectBatter: index => {
    const s = get();
    if (!s.innings || !s.needsBatter || index < s.innings.nextBatterIndex - 1 || index >= s.innings.squad.length) return;
    set({ innings: chooseScenarioBatter(s.innings, index), needsBatter: false });
  },
  advance: balls => {
    const s = get();
    const scenario = SCENARIOS.find(item => item.id === s.scenarioId);
    if (!scenario || !s.innings || s.needsBatter || scenarioFinished(s.innings, scenario) || !Number.isInteger(balls) || balls < 1) return;
    try {
      const next = playScenario(scenario, s.innings, s.seed, s.batting, s.tactics, s.plans, s.preferredBowler, balls);
      const progress = { ...s.progress };
      let storageWarning = s.storageWarning;
      if (scenarioFinished(next.state, scenario)) {
        const key = `${scenario.id}:${s.batting ? 'bat' : 'bowl'}`;
        const old = progress[key] ?? { attempts: 0, wins: 0 };
        const target = next.state.targetScore!;
        const tie = next.state.totalRuns === target - 1;
        const won = !tie && (s.batting ? next.state.totalRuns >= target : next.state.totalRuns < target - 1);
        // Signed runs relative to a tied score, from the chosen team's perspective.
        const margin = (next.state.totalRuns - (target - 1)) * (s.batting ? 1 : -1);
        progress[key] = { attempts: old.attempts + 1, wins: old.wins + Number(won), bestMargin: Math.max(old.bestMargin ?? -Infinity, margin) };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); storageWarning = false; }
        catch { storageWarning = true; }
      }
      set({ innings: next.state, seed: next.seed, needsBatter: next.needsBatter,
        decisions: [...s.decisions, ...next.decisions], progress, storageWarning, error: '' });
    } catch (error) { set({ error: error instanceof Error ? error.message : 'Could not play this delivery.' }); }
  },
}));
