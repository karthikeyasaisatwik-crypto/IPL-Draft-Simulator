import type { BallLog, DeliveryVisual, FieldPosition } from './types';

const SECTORS = [
  { angle: 0, name: 'Straight' }, { angle: 35, name: 'Cover drive' },
  { angle: 75, name: 'Point' }, { angle: 125, name: 'Third man' },
  { angle: 165, name: 'Behind square' }, { angle: 210, name: 'Fine leg' },
  { angle: 250, name: 'Square leg' }, { angle: 290, name: 'Midwicket' },
  { angle: 325, name: 'On drive' },
];

export function getFieldPositions(over: number): FieldPosition[] {
  const deep = over > 6;
  return [
    { name: 'Bowler', x: 50, y: 30 }, { name: 'Keeper', x: 50, y: 69 },
    { name: 'Slip', x: 58, y: 71 }, { name: 'Point', x: deep && over <= 16 ? 88 : 69, y: 57 },
    { name: 'Cover', x: deep ? 79 : 65, y: deep ? 30 : 36 }, { name: 'Mid-off', x: 61, y: 37 },
    { name: 'Mid-on', x: 37, y: deep ? 15 : 37 }, { name: 'Midwicket', x: over > 16 ? 23 : 32, y: over > 16 ? 28 : 47 },
    { name: 'Square leg', x: 33, y: 62 },
    { name: 'Third man', x: 71, y: 85 }, { name: 'Fine leg', x: 28, y: 85 },
  ];
}

// Placement is illustrative; recorded runs/wickets are authoritative. A local hash
// supplies geometry without consuming match RNG or changing the simulated result.
export function createDeliveryVisual(ball: Omit<BallLog, 'visual'>): DeliveryVisual {
  let seed = 2166136261;
  for (const character of `${ball.strikerName}:${ball.ballNumber}:${ball.runs}:${ball.isWicket}`) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const sector = SECTORS[seed % SECTORS.length];
  const angle = (sector.angle + ((seed >>> 8) % 17) - 8) * Math.PI / 180;
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  // Intersect a ray from the striker (50,62) with the boundary ellipse.
  const a = dx * dx / (42 * 42) + dy * dy / (44 * 44);
  const b = 24 * dy / (44 * 44);
  const c = 144 / (44 * 44) - 1;
  const boundaryDistance = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
  const noContact = ball.isWicket && /^(b |lbw |st )/.test(ball.dismissalText ?? '');
  const distance = ball.runs === 6 ? 1.08 : ball.runs === 4 ? 1 : ball.runs === 2 ? 0.62 : ball.runs === 1 ? 0.43 : 0.16;
  return {
    bounce: { x: 48 + (seed % 5), y: 48 + ((seed >>> 4) % 8) },
    shotEnd: noContact ? null : { x: 50 + dx * boundaryDistance * distance, y: 62 + dy * boundaryDistance * distance },
    shotDirection: noContact ? 'No shot contact' : ball.runs === 0 && !ball.isWicket ? 'Defended / dot ball' : sector.name,
    fielders: getFieldPositions(ball.overNumber),
    fieldSetting: ball.overNumber <= 6 ? 'Powerplay' : ball.overNumber <= 16 ? 'Middle overs' : 'Death overs',
  };
}

export function recordDelivery(ball: Omit<BallLog, 'visual'>): BallLog {
  return { ...ball, visual: createDeliveryVisual(ball) };
}
