import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.join(__dirname, 'src', 'data', 'squads.csv');
const OUT_PATH = path.join(__dirname, 'src', 'data', 'players.ts');

const teamMap = {
  'Mumbai Indians': 'MI',
  'Chennai Super Kings': 'CSK',
  'Kolkata Night Riders': 'KKR',
  'Royal Challengers Bengaluru': 'RCB',
  'Rajasthan Royals': 'RR',
  'Sunrisers Hyderabad': 'SRH',
  'Gujarat Titans': 'GT',
  'Lucknow Super Giants': 'LSG',
  'Delhi Capitals': 'DC',
  'Punjab Kings': 'PBKS'
};

const rawCsv = fs.readFileSync(CSV_PATH, 'utf-8');
const lines = rawCsv.split('\n').map(l => l.trim()).filter(l => l);
const header = lines[0].split(',');

const allPlayers = [];
for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',');
  if (parts.length < 5) continue;
  
  const teamName = parts[1];
  const name = parts[2];
  const rawRole = parts[4];
  
  const team = teamMap[teamName] || 'UNK';
  
  let role = 'BAT';
  if (rawRole === 'Batter') role = 'Batter'; // In engine/types.ts it's 'Batter', 'All-Rounder', 'Bowler', 'WK'
  else if (rawRole === 'All Rounder') role = 'All-Rounder';
  else if (rawRole === 'Bowler') role = 'Bowler';
  else if (rawRole === 'Wicket Keeper') role = 'WK';
  
  allPlayers.push({ name, team, role, rawRole });
}

// Keep track of counts per team to select top 14
const teamRosters = {};
Object.values(teamMap).forEach(t => teamRosters[t] = { Batter:[], 'All-Rounder':[], Bowler:[], WK:[] });

// Fill rosters
allPlayers.forEach(p => {
  if (teamRosters[p.team]) {
    teamRosters[p.team][p.role].push(p);
  }
});

const generatedPlayers = [];
let idCounter = 1;

// Generating pseudo-realistic stats and allowed slots
function generateStats(role) {
  if (role === 'Batter') {
    return {
      allowedSlots: [1, 2, 3, 4],
      batRating: 75 + Math.floor(Math.random() * 20),
      powRating: 75 + Math.floor(Math.random() * 20),
      bwlRating: 5 + Math.floor(Math.random() * 10)
    };
  } else if (role === 'WK') {
    return {
      allowedSlots: [1, 2, 3, 4, 5, 6],
      batRating: 70 + Math.floor(Math.random() * 20),
      powRating: 75 + Math.floor(Math.random() * 20),
      bwlRating: 5 + Math.floor(Math.random() * 10)
    };
  } else if (role === 'All-Rounder') {
    return {
      allowedSlots: [5, 6, 7],
      batRating: 60 + Math.floor(Math.random() * 20),
      powRating: 75 + Math.floor(Math.random() * 20),
      bwlRating: 60 + Math.floor(Math.random() * 20)
    };
  } else {
    // Bowler
    return {
      allowedSlots: [8, 9, 10, 11],
      batRating: 5 + Math.floor(Math.random() * 20),
      powRating: 5 + Math.floor(Math.random() * 20),
      bwlRating: 75 + Math.floor(Math.random() * 20)
    };
  }
}

for (const team in teamRosters) {
  const roster = teamRosters[team];
  // Select top 14: e.g., 5 batters/wks, 4 all-rounders, 5 bowlers
  const selected = [
    ...roster.Batter.slice(0, 4),
    ...roster.WK.slice(0, 2),
    ...roster['All-Rounder'].slice(0, 4),
    ...roster.Bowler.slice(0, 5)
  ].slice(0, 14); // Limit to 14
  
  selected.forEach((p, idx) => {
    const stats = generateStats(p.role);
    const id = `${team.toLowerCase()}_${String(idx + 1).padStart(2, '0')}`;
    
    generatedPlayers.push({
      id,
      name: p.name,
      team: team,
      role: p.role,
      battingPosition: stats.allowedSlots[0], // for legacy compat if needed
      allowedSlots: stats.allowedSlots,
      batRating: stats.batRating,
      powRating: stats.powRating,
      bwlRating: stats.bwlRating
    });
  });
}

const fileContent = `// ============================================================
// IPL DRAFT SIMULATOR — PLAYER DATABASE
// Auto-generated from squads dataset
// ============================================================

import type { Player } from '../engine/types';

export const PLAYERS: Player[] = ${JSON.stringify(generatedPlayers, null, 2)};

export const MOCK_PLAYERS: Player[] = PLAYERS.slice(0, 20);

// ============================================================
// HELPERS — convenient views over the player pool
// ============================================================

export const FRANCHISE_CODES = [...new Set(PLAYERS.map((p) => p.team))].sort();

export function getPlayerById(id: string): Player | undefined {
  return PLAYERS.find((p) => p.id === id);
}

export function getPlayersByRole(role: Player['role']): Player[] {
  return PLAYERS.filter((p) => p.role === role);
}

export function getPlayersByTeam(team: string): Player[] {
  return PLAYERS.filter((p) => p.team === team);
}

export function getStarRating(player: Player): number {
  switch (player.role) {
    case 'Batter':
    case 'WK':
      return Math.round(player.batRating * 0.5 + player.powRating * 0.4 + player.bwlRating * 0.1);
    case 'All-Rounder':
      return Math.round(player.batRating * 0.3 + player.powRating * 0.3 + player.bwlRating * 0.4);
    case 'Bowler':
      return Math.round(player.batRating * 0.1 + player.powRating * 0.1 + player.bwlRating * 0.8);
    default:
      return Math.round((player.batRating + player.powRating + player.bwlRating) / 3);
  }
}

export function getFranchiseColor(team: string): string {
  const colors: Record<string, string> = {
    MI:   '#004BA0',
    CSK:  '#F9CD05',
    RCB:  '#EC1C24',
    KKR:  '#3A225D',
    DC:   '#004C93',
    RR:   '#EA1A85',
    SRH:  '#FF822A',
    PBKS: '#ED1B24',
    LSG:  '#A72056',
    GT:   '#1C1C2B',
  };
  return colors[team] ?? '#6366f1';
}

export function getFranchiseName(code: string): string {
  const names: Record<string, string> = {
    MI:   'Mumbai Indians',
    CSK:  'Chennai Super Kings',
    RCB:  'Royal Challengers Bengaluru',
    KKR:  'Kolkata Knight Riders',
    DC:   'Delhi Capitals',
    RR:   'Rajasthan Royals',
    SRH:  'Sunrisers Hyderabad',
    PBKS: 'Punjab Kings',
    LSG:  'Lucknow Super Giants',
    GT:   'Gujarat Titans',
  };
  return names[code] ?? code;
}

export function formatSlotRange(slots: number[]): string {
  if (slots.length === 0) return '';
  if (slots.length === 1) return String(slots[0]);

  const sorted = [...slots].sort((a, b) => a - b);
  const ranges: string[] = [];
  let start = sorted[0];
  let end = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i];
    } else {
      ranges.push(start === end ? String(start) : \`\${start}-\${end}\`);
      start = sorted[i];
      end = sorted[i];
    }
  }
  ranges.push(start === end ? String(start) : \`\${start}-\${end}\`);
  return ranges.join(', ');
}
`;

fs.writeFileSync(OUT_PATH, fileContent, 'utf-8');
console.log('Successfully generated players.ts with ' + generatedPlayers.length + ' core players.');
