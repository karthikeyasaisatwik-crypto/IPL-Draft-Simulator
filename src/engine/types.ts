// ============================================================
// IPL DRAFT SIMULATOR — CORE TYPES
// Inspired by "500/0". Player drafts an 11, then a 20-over
// run chase is auto-simulated. No manual card play.
// ============================================================

export type PlayerRole = 'Batter' | 'All-Rounder' | 'Bowler' | 'WK';

export interface Player {
  id: string;
  name: string;
  team: string;          // IPL franchise (for flavor/UI grouping)
  role: PlayerRole;
  battingPosition: number; // 1-11, the "true" slot this player drafts into
  allowedSlots: number[]; // which batting positions (1-11) this player can be drafted into
  batRating: number;      // 0-100: survival/quality for long innings
  powRating: number;      // 0-100: scoring/strike-rate explosiveness
  bwlRating: number;      // 0-100: bowling strength, feeds team morale
}

// A drafted 11 must satisfy: 7 Batters/WKs + 4 pure Bowlers.
// (All-Rounders count toward the "batter" bucket for the 7/4 split
// since they occupy a batting position 1-11, but their bwlRating
// still contributes to team bowling morale.)
export interface DraftedTeam {
  players: Player[];       // exactly 11, sorted by battingPosition
  teamName: string;
  isLocked?: boolean;      // true for hardcoded Gauntlet franchise XIs — UI can't edit these
}

export interface TeamMoraleSummary {
  battingStrength: number;  // aggregate of batRating + powRating across XI
  bowlingStrength: number;  // aggregate of bwlRating across XI
  balanceScore: number;     // derived composite used by the sim engine
}

// ============================================================
// GAME MODES
// ============================================================

export type GameMode = 'H2H' | 'GAUNTLET' | 'CHASE_300';

// ============================================================
// BALL-BY-BALL SIMULATION STATE
// Shared by all three modes — this is the atomic unit the
// MatchEngine's core loop produces on every delivery.
// ============================================================

export interface BallOutcome {
  overNumber: number;      // 0-19
  ballInOver: number;      // 1-6 (legal deliveries only; extras don't advance this)
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
  batterId: string;
  bowlerId: string;
  commentary?: string;
}

// One innings of a match. Chase 300 only ever produces exactly
// one of these. H2H and Gauntlet produce two.
export interface InningsState {
  battingTeam: DraftedTeam;
  bowlingTeam: DraftedTeam;
  score: number;
  wickets: number;
  ballsBowled: number;         // 0-120
  currentBatterIndex: number;  // index into battingTeam.players (batting order)
  partnerBatterIndex: number;
  currentBowlerIndex: number;
  target: number | null;       // null = "batting first, no chase pressure yet"
  isComplete: boolean;
  ballHistory: BallOutcome[];
}

// ============================================================
// MODE-SPECIFIC CONFIG
// Controls how the ball-resolution probability model weighs
// batRating/powRating against bwlRating. This is what lets the
// SAME core loop feel different across modes without branching
// the loop itself.
// ============================================================

export interface SimulationConfig {
  gameMode: GameMode;
  // Multiplies effective bwlRating for every bowler this innings.
  // 1.0 = neutral. CHASE_300 forces this to its max (e.g. 1.5+)
  // to guarantee "maximum difficulty" regardless of who's drafted.
  bowlingDifficultyMultiplier: number;
  // Only relevant when the engine itself must draft an opponent XI
  // (H2H mode 1). Not used once a squad already exists (Gauntlet's
  // franchise XIs are pre-built; Chase 300 has no opposing batters).
  aiDraftStrategy?: 'balanced' | 'aggressive' | 'defensive';
}

// ============================================================
// GAUNTLET CAMPAIGN STATE
// Only populated when gameMode === 'GAUNTLET'.
// ============================================================

export interface FranchiseXI {
  id: string;
  name: string;            // e.g. "Mumbai Indians"
  team: DraftedTeam;        // hardcoded, isLocked: true
  difficultyMultiplier: number; // lets later fixtures be tougher
}

export interface CampaignState {
  fixtures: FranchiseXI[];       // ordered list of opponents for the campaign
  currentFixtureIndex: number;
  wins: number;
  losses: number;
  ties: number;
}

// ============================================================
// MATCH RESULT
// ============================================================

export interface MatchResult {
  // H2H / GAUNTLET use player/opponent/tie.
  // CHASE_300 has no opponent innings, so it resolves to survived/failed.
  outcome: 'player' | 'opponent' | 'tie' | 'survived' | 'failed';
  playerScore: number;
  opponentScore?: number;  // undefined for CHASE_300 (single innings, no opponent bats)
  summary: string;
}

// ============================================================
// TOP-LEVEL MATCH STATE
// Branches on gameMode. Not every field is populated in every
// mode — see MatchEngine architectural notes for exactly which
// fields are relevant where.
// ============================================================

export interface MatchState {
  gameMode: GameMode;
  config: SimulationConfig;

  playerTeam: DraftedTeam;
  // H2H: AI-drafted XI. GAUNTLET: current FranchiseXI.team. CHASE_300: unused
  // (there is no opposing batting lineup — only a synthetic max-difficulty attack).
  opponentTeam: DraftedTeam | null;

  innings1: InningsState;
  // Always undefined for CHASE_300 (single-innings mode).
  // Populated for H2H/GAUNTLET once innings1 completes.
  innings2?: InningsState;

  // Static 300 for CHASE_300, set at match init and never recalculated.
  // Null for H2H/GAUNTLET until innings1 ends, then set to innings1.score + 1.
  target: number | null;

  result?: MatchResult;

  // Only present when gameMode === 'GAUNTLET'.
  campaign?: CampaignState;
}

// ============================================================
// CHASE 300 ENGINE SPECIFIC TYPES
// ============================================================

export interface PlayerStats {
  player: Player;
  runs: number;
  balls: number;
  dots: number;
  fours: number;
  sixes: number;
  dismissal: string;
  strikeRate: number;
}

export interface BallLog {
  ballNumber: number;
  overNumber: number;
  strikerName: string;
  bowlerName: string;
  runs: number;
  isWicket: boolean;
  dismissalText?: string;
  currentTotal: number;
  currentWickets: number;
}

export interface OverSummary {
  overNumber: number;
  summaryText: string;
  runs: number;
  wickets: number;
}

export interface InningsResult {
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  oversBowled: string;
  unprepared: boolean;
  unpreparedReason: string | null;
  teamMoraleScore: number;
  playerStats: PlayerStats[];
  overLogs: OverSummary[];
}

export interface UnifiedMatchResult {
  innings: InningsResult[];
  isWin: boolean;
  matchSummary: string;
  teamAnalysis: {
    verdict: string;
    comment: string;
  };
  manOfTheMatch: { player: Player; reason: string } | null;
}

export interface SquadBalanceResult {
  unprepared: boolean;
  reason?: string | null;
  teamMorale: number;
  boostMultiplier: number;
  boostedBatters: Array<{
    id: string;
    name: string;
    originalPow: number;
    boostedPow: number;
  }>;
}

// ============================================================
// MOCK DATA — 20 modern IPL players with realistic ratings
// Ratings are illustrative approximations of public playing
// style/reputation, not official stats.
// ============================================================

export const MOCK_PLAYERS: Player[] = [
  { id: 'p01', name: 'Rohit Sharma',        team: 'MI',  role: 'Batter',       battingPosition: 1,  allowedSlots: [1, 2],      batRating: 85, powRating: 82, bwlRating: 5  },
  { id: 'p02', name: 'Yashasvi Jaiswal',    team: 'RR',  role: 'Batter',       battingPosition: 1,  allowedSlots: [1, 2],      batRating: 80, powRating: 88, bwlRating: 5  },
  { id: 'p03', name: 'Shubman Gill',        team: 'GT',  role: 'Batter',       battingPosition: 2,  allowedSlots: [1, 2, 3],   batRating: 88, powRating: 80, bwlRating: 5  },
  { id: 'p04', name: 'Virat Kohli',         team: 'RCB', role: 'Batter',       battingPosition: 3,  allowedSlots: [3],         batRating: 92, powRating: 78, bwlRating: 8  },
  { id: 'p05', name: 'Suryakumar Yadav',    team: 'MI',  role: 'Batter',       battingPosition: 3,  allowedSlots: [3, 4],      batRating: 78, powRating: 94, bwlRating: 5  },
  { id: 'p06', name: 'Rishabh Pant',        team: 'LSG', role: 'WK',          battingPosition: 4,  allowedSlots: [4, 5],      batRating: 75, powRating: 90, bwlRating: 5  },
  { id: 'p07', name: 'Sanju Samson',        team: 'RR',  role: 'WK',          battingPosition: 4,  allowedSlots: [1, 2],      batRating: 79, powRating: 85, bwlRating: 5  },
  { id: 'p08', name: 'KL Rahul',            team: 'DC',  role: 'WK',          battingPosition: 4,  allowedSlots: [1, 2, 3],   batRating: 86, powRating: 74, bwlRating: 5  },
  { id: 'p09', name: 'Shreyas Iyer',        team: 'PBKS',role: 'Batter',       battingPosition: 5,  allowedSlots: [3, 4, 5],   batRating: 82, powRating: 79, bwlRating: 5  },
  { id: 'p10', name: 'Nicholas Pooran',     team: 'LSG', role: 'WK',          battingPosition: 5,  allowedSlots: [4, 5, 6],   batRating: 68, powRating: 93, bwlRating: 5  },
  { id: 'p11', name: 'Hardik Pandya',       team: 'MI',  role: 'All-Rounder', battingPosition: 6,  allowedSlots: [5, 6, 7],   batRating: 70, powRating: 87, bwlRating: 72 },
  { id: 'p12', name: 'Ravindra Jadeja',     team: 'CSK', role: 'All-Rounder', battingPosition: 7,  allowedSlots: [6, 7],      batRating: 65, powRating: 75, bwlRating: 85 },
  { id: 'p13', name: 'Axar Patel',          team: 'DC',  role: 'All-Rounder', battingPosition: 7,  allowedSlots: [6, 7],      batRating: 60, powRating: 72, bwlRating: 80 },
  { id: 'p14', name: 'Andre Russell',       team: 'KKR', role: 'All-Rounder', battingPosition: 6,  allowedSlots: [5, 6, 7],   batRating: 55, powRating: 96, bwlRating: 78 },
  { id: 'p15', name: 'Marcus Stoinis',      team: 'LSG', role: 'All-Rounder', battingPosition: 6,  allowedSlots: [5, 6, 7],   batRating: 62, powRating: 84, bwlRating: 68 },
  { id: 'p16', name: 'Jasprit Bumrah',      team: 'MI',  role: 'Bowler',      battingPosition: 10, allowedSlots: [9, 10, 11], batRating: 15, powRating: 10, bwlRating: 97 },
  { id: 'p17', name: 'Rashid Khan',         team: 'GT',  role: 'Bowler',      battingPosition: 9,  allowedSlots: [8, 9, 10],  batRating: 30, powRating: 45, bwlRating: 94 },
  { id: 'p18', name: 'Mohammed Shami',      team: 'SRH', role: 'Bowler',      battingPosition: 11, allowedSlots: [9, 10, 11], batRating: 10, powRating: 8,  bwlRating: 90 },
  { id: 'p19', name: 'Yuzvendra Chahal',    team: 'PBKS',role: 'Bowler',      battingPosition: 10, allowedSlots: [9, 10, 11], batRating: 12, powRating: 15, bwlRating: 88 },
  { id: 'p20', name: 'Trent Boult',         team: 'RR',  role: 'Bowler',      battingPosition: 11, allowedSlots: [9, 10, 11], batRating: 18, powRating: 12, bwlRating: 89 },
];
