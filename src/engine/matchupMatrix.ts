import type { Player } from './types';

export interface Matchup {
  playerId1: string; // Bowler
  playerId2: string; // Batter
  type: 'ADVANTAGE' | 'DANGER';
  description: string;
}

export function getBattingStyle(p: Player): 'RHB' | 'LHB' {
  if (p.name.includes('Pant') || p.name.includes('Jaiswal') || p.name.includes('Ishan') || p.name.includes('Left') || p.name.includes('Warner')) return 'LHB';
  const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % 3 === 0 ? 'LHB' : 'RHB';
}

export function getBowlingStyle(p: Player): 'PACE' | 'OFF_SPIN' | 'SLA' | 'LEG_SPIN' {
  if (p.bowlingStyle) return p.bowlingStyle;
  const hash = p.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (p.name.includes('Bumrah') || p.name.includes('Shami') || p.name.includes('Boult')) return 'PACE';
  if (p.name.includes('Ashwin')) return 'OFF_SPIN';
  if (p.name.includes('Jadeja') || p.name.includes('Axar')) return 'SLA';
  if (p.name.includes('Rashid') || p.name.includes('Chahal')) return 'LEG_SPIN';
  
  if (hash % 2 === 0) return 'PACE';
  const spinType = hash % 3;
  if (spinType === 0) return 'OFF_SPIN';
  if (spinType === 1) return 'SLA';
  return 'LEG_SPIN';
}

export function generateKeyMatchups(userSquad: Player[], aiSquad: Player[]): Matchup[] {
  const matchups: Matchup[] = [];
  
  const userBowlers = userSquad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  const aiBatters = aiSquad.filter(p => p.battingPosition <= 7);
  
  const aiBowlers = aiSquad.filter(p => p.role === 'Bowler' || p.role === 'All-Rounder');
  const userBatters = userSquad.filter(p => p.battingPosition <= 7);

  // Helper to find matchups
  const checkMatchups = (bowlers: Player[], batters: Player[], isUserBowling: boolean) => {
    for (const bowler of bowlers) {
      for (const batter of batters) {
        const bowlStyle = getBowlingStyle(bowler);
        const batStyle = getBattingStyle(batter);
        const isAggressive = batter.battingPosition <= 2 && batter.powRating >= 85;

        // Advantage: Off-Spin vs LHB
        if (bowlStyle === 'OFF_SPIN' && batStyle === 'LHB') {
          matchups.push({
            playerId1: bowler.id,
            playerId2: batter.id,
            type: 'ADVANTAGE',
            description: isUserBowling ? `Your Off-Spin (${bowler.name}) is lethal against LHB (${batter.name}).` : `AI's Off-Spin (${bowler.name}) has a major advantage against your LHB (${batter.name}).`
          });
        }
        // Danger: SLA vs LHB
        else if (bowlStyle === 'SLA' && batStyle === 'LHB') {
          matchups.push({
            playerId1: bowler.id,
            playerId2: batter.id,
            type: 'DANGER',
            description: isUserBowling ? `Danger: Your SLA (${bowler.name}) spins it into the arc of LHB (${batter.name}).` : `Advantage: AI's SLA (${bowler.name}) will struggle against your LHB (${batter.name}).`
          });
        }
        // Threat: Pace vs Aggressive Opener
        else if (bowlStyle === 'PACE' && isAggressive) {
          matchups.push({
            playerId1: bowler.id,
            playerId2: batter.id,
            type: 'DANGER', // from bowler perspective
            description: isUserBowling ? `Powerplay Threat: Aggressive opener ${batter.name} loves Pace (${bowler.name}).` : `Powerplay Threat: Your opener ${batter.name} can attack AI's Pace (${bowler.name}).`
          });
        }
      }
    }
  };

  checkMatchups(userBowlers, aiBatters, true);
  checkMatchups(aiBowlers, userBatters, false);

  // Shuffle and pick 3
  const shuffled = matchups.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
}
