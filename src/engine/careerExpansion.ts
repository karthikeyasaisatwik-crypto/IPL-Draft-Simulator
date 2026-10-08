import type { CareerState, StatKey } from '../store/careerStore';
import type { CareerEvent, NpcId, WeeklyFocus } from './careerTypes';
import { SKILL_NODES } from './skillTreeData';

export const CAREER_NPCS: { id: NpcId; name: string; role: 'Rival' | 'Mentor'; bio: string; bonus: string }[] = [
  { id: 'arjun', name: 'Arjun Rao', role: 'Rival', bio: 'Your academy rival. Competitive, outspoken, and always one net lane away.', bonus: 'Bond 65+: +1 respect and mentality weekly. Below 25: −1 respect and coach favor.' },
  { id: 'zoya', name: 'Zoya Khan', role: 'Rival', bio: 'A fearless teammate chasing the same place in the XI. Earn her respect through preparation.', bonus: 'Bond 65+: +1 respect and mentality weekly. Below 25: −1 respect and coach favor.' },
  { id: 'dev', name: 'Dev Malhotra', role: 'Mentor', bio: 'A veteran captain who values patience, honest work, and looking after the team.', bonus: 'Bond 60+: +1 coach favor and locker room respect weekly.' },
  { id: 'meera', name: 'Meera Sen', role: 'Mentor', bio: 'The team physio. She can teach you when to push and when to recover.', bonus: 'Bond 60+: +2 stamina and +1 coach favor weekly.' },
];

export const INITIAL_RELATIONSHIPS: Record<NpcId, number> = { arjun: 40, zoya: 40, dev: 35, meera: 35 };

export const WEEKLY_FOCUSES: { id: WeeklyFocus; name: string; description: string; minStamina: number }[] = [
  { id: 'nets', name: 'Technical nets', description: '+3 batting, +2 form; costs 12 stamina. Counts toward training goals.', minStamina: 12 },
  { id: 'recovery', name: 'Recovery day', description: '+18 stamina, +3 mentality. Fitness perks improve recovery.', minStamina: 0 },
  { id: 'study', name: 'Life outside cricket', description: '−12 academic stress, +5 family morale, +4 family expectations.', minStamina: 0 },
  { id: 'mentor', name: 'Veteran net session', description: '+10 bond with Dev, +3 coach favor, +3 respect; costs 6 stamina.', minStamina: 6 },
];

export function perkMagnitude(state: CareerState, type: string): number {
  return SKILL_NODES.filter(node => state.unlockedSkillNodes.includes(node.id) && node.effect.type === type)
    .reduce((sum, node) => sum + node.effect.magnitude, 0);
}

export function applyCareerDeltas(state: CareerState, changes: Partial<Record<StatKey, number>>): Partial<CareerState> {
  const result: Partial<CareerState> = {};
  for (const [key, delta] of Object.entries(changes)) {
    const stat = key as StatKey;
    const value = state[stat] + (delta ?? 0);
    result[stat] = stat === 'legacyScore' ? value : Math.max(0, stat === 'funds' || stat === 'battingRating' ? value : Math.min(100, value));
  }
  return result;
}

export const CAREER_GOALS = [
  { id: 'nets_four', name: 'Build the habit', description: 'Complete four technical net sessions.', target: 4, sp: 2, progress: (s: CareerState) => s.trainingSessions },
  { id: 'mentor_trust', name: 'Under a veteran’s wing', description: 'Reach 60 bond with either mentor.', target: 60, sp: 2, progress: (s: CareerState) => Math.max(s.relationships.dev, s.relationships.meera) },
  { id: 'rival_two', name: 'Earn your place', description: 'Win two rivalry challenges.', target: 2, sp: 2, progress: (s: CareerState) => s.rivalWins },
  { id: 'big_match', name: 'The big stage', description: 'Play your first career-defining match.', target: 1, sp: 2, progress: (s: CareerState) => s.bigMatchHistory.length },
];

// Named characters return every third week; major matches retain priority.
export function getRelationshipEvent(state: CareerState): CareerEvent | null {
  if (state.currentWeek % 3 !== 0) return null;
  const index = (Math.floor(state.currentWeek / 3) - 1) % CAREER_NPCS.length;
  const npc = CAREER_NPCS[index];
  const bond = state.relationships[npc.id];
  if (npc.role === 'Mentor') {
    const physio = npc.id === 'meera';
    return {
      id: `npc_${npc.id}`, category: 'MENTOR', weight: 1, title: `${npc.name}: ${bond >= 60 ? 'A trusted voice' : 'An offer of guidance'}`,
      description: `${npc.bio} ${bond >= 60 ? 'Your bond is strong; the advice now feels personal.' : 'There is a chance to build trust this week.'}`,
      choices: [
        { text: physio ? 'Follow the recovery plan' : 'Stay for the extra net session', consequences: physio ? { stamina: 14, coachFavor: 4 } : { battingRating: 3, stamina: -8, coachFavor: 5, lockerRoomRespect: 4 }, relationshipChanges: { [npc.id]: 12 }, outcomeText: `${npc.name} notices your commitment. The relationship grows.` },
        { text: 'Ask for help handling the pressure', consequences: { mentality: 8, academicStress: -6, lockerRoomRespect: 3 }, relationshipChanges: { [npc.id]: 8 }, outcomeText: `${npc.name} shares a lesson from a difficult season. You feel less alone.` },
        { text: 'Decline and work alone', consequences: { form: 3, coachFavor: -3 }, relationshipChanges: { [npc.id]: -8 }, outcomeText: 'You back your own methods, but the distance grows.' },
      ],
    };
  }
  const successChance = Math.max(0.25, Math.min(0.85, 0.40 + state.battingRating / 300 + (state.form - 50) / 500 - (state.stamina < 35 ? 0.15 : 0)));
  return {
    id: `npc_${npc.id}`, category: 'RIVALRY', weight: 1, title: `${npc.name}: ${bond >= 65 ? 'Friendly competition' : bond < 25 ? 'Dressing room tension' : 'The next spot in the XI'}`,
    description: `${npc.name} challenges you to a pressure net: 18 needed off six balls. ${bond < 25 ? 'The rivalry is turning personal.' : 'The coach and teammates are watching.'} Low stamina hurts your chances.`,
    choices: [
      { text: 'Accept the challenge and shake hands', requiredStat: { stat: 'stamina', min: 10 }, relationshipChanges: { [npc.id]: 8 }, rivalChallenge: npc.id,
        risky: { baseChance: successChance, mentalityInfluence: 0.002, onSuccess: { coachFavor: 8, lockerRoomRespect: 8, form: 6, stamina: -10 }, onFailure: { coachFavor: -3, form: -4, stamina: -10 }, successText: `You clear the ropes. ${npc.name} nods: that place in the XI is earned.`, failureText: `${npc.name} wins this round, but respects how you handled the loss.` } },
      { text: 'Turn it into a shared practice session', consequences: { lockerRoomRespect: 6, coachFavor: 3, form: 3 }, relationshipChanges: { [npc.id]: 12 }, outcomeText: `You and ${npc.name} exchange tips. Competition becomes cooperation.` },
      { text: 'Call them out in front of the squad', consequences: { mentality: 4, lockerRoomRespect: -8, coachFavor: -6 }, relationshipChanges: { [npc.id]: -15 }, outcomeText: 'You make your point, but the room falls quiet. This rivalry is getting costly.' },
    ],
  };
}
