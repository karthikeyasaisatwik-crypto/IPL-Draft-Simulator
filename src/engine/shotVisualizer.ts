import type { BallLog, DeliveryVisual, FieldPosition } from './types';
import type { BowlingPlan } from './coachTactics';

export interface VisualContext {
  phaseOver?: number;
  bowlingPlan?: BowlingPlan;
  bowlingStyle?: 'PACE' | 'OFF_SPIN' | 'SLA' | 'LEG_SPIN';
}

const SECTORS = [
  { angle: 0, name: 'Straight' }, { angle: 35, name: 'Cover drive' },
  { angle: 75, name: 'Point' }, { angle: 125, name: 'Third man' },
  { angle: 165, name: 'Behind square' }, { angle: 210, name: 'Fine leg' },
  { angle: 250, name: 'Square leg' }, { angle: 290, name: 'Midwicket' },
  { angle: 325, name: 'On drive' },
];

export function getFieldPositions(over: number, context: VisualContext = {}): FieldPosition[] {
  const deep = over > 6;
  const field = [
    { name: 'Bowler', x: 50, y: 30 }, { name: 'Keeper', x: 50, y: 69 },
    { name: 'Slip', x: 58, y: 71 }, { name: 'Point', x: deep && over <= 16 ? 88 : 69, y: 57 },
    { name: 'Cover', x: deep ? 79 : 65, y: deep ? 30 : 36 }, { name: 'Mid-off', x: 61, y: 37 },
    { name: 'Mid-on', x: 37, y: deep ? 15 : 37 }, { name: 'Midwicket', x: over > 16 ? 23 : 32, y: over > 16 ? 28 : 47 },
    { name: 'Square leg', x: 33, y: 62 },
    { name: 'Third man', x: 71, y: 85 }, { name: 'Fine leg', x: 28, y: 85 },
  ];
  const move = (name: string, x: number, y: number) => Object.assign(field.find(f => f.name === name)!, { x, y });
  if (context.bowlingPlan === 'SHORT' && (!context.bowlingStyle || context.bowlingStyle === 'PACE')) {
    move('Square leg', 13, 62);
    move('Fine leg', 30, 85);
    if (deep) move('Midwicket', 20, 25);
  } else if (context.bowlingPlan === 'YORKERS' && (!context.bowlingStyle || context.bowlingStyle === 'PACE')) {
    move('Mid-on', 36, 12);
    move('Mid-off', 64, 12);
    if (!deep) { move('Third man', 63, 74); move('Fine leg', 36, 74); }
  } else if (context.bowlingPlan === 'VARIATIONS') {
    move('Cover', deep ? 82 : 68, deep ? 30 : 39);
    move('Midwicket', deep ? 20 : 31, deep ? 25 : 45);
  }
  return field;
}

// Placement is illustrative; recorded runs/wickets are authoritative. A local hash
// supplies geometry without consuming match RNG or changing the simulated result.
export function createDeliveryVisual(ball: Omit<BallLog, 'visual'>, context: VisualContext = {}): DeliveryVisual {
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
  const distance = ball.runs === 6 ? 1.08 : ball.runs === 4 ? 1 : ball.runs === 3 ? .78 : ball.runs === 2 ? 0.62 : ball.runs === 1 ? 0.43 : 0.16;
  const over = context.phaseOver ?? ball.overNumber;
  const fielders = getFieldPositions(over, context);
  const spin = context.bowlingStyle && context.bowlingStyle !== 'PACE';
  const plan = spin && (context.bowlingPlan === 'SHORT' || context.bowlingPlan === 'YORKERS') ? 'STOCK' : context.bowlingPlan;
  let shotEnd = noContact ? null : { x: 50 + dx * boundaryDistance * distance, y: 62 + dy * boundaryDistance * distance };
  const caught = ball.isWicket && /^c[ &]/.test(ball.dismissalText ?? '');
  const runout = ball.isWicket && /^run out/i.test(ball.dismissalText ?? '');
  const stumped = ball.isWicket && /^st /.test(ball.dismissalText ?? '');
  const nearest = (point: { x: number; y: number }) => fielders.reduce((best, f) =>
    Math.hypot(f.x - point.x, f.y - point.y) < Math.hypot(best.x - point.x, best.y - point.y) ? f : best);
  let reaction: NonNullable<DeliveryVisual['animation']>['reaction'];
  if (caught && shotEnd) {
    const fielder = /^c & b /.test(ball.dismissalText ?? '') ? fielders[0] : fielders[2 + seed % 9];
    shotEnd = { x: fielder.x, y: fielder.y };
    reaction = { name: fielder.name, target: shotEnd, action: 'catch' };
  } else if (stumped) {
    reaction = { name: 'Keeper', target: { x: 50, y: 65 }, action: 'stumping' };
  } else if (shotEnd && ball.runs !== 6) {
    const fielder = nearest(shotEnd);
    reaction = { name: fielder.name, target: ball.runs === 4
      ? { x: fielder.x + (shotEnd.x - fielder.x) * .75, y: fielder.y + (shotEnd.y - fielder.y) * .75 }
      : shotEnd, action: ball.runs === 4 ? 'chase' : runout ? 'runout' : 'collect' };
  }
  return {
    bounce: { x: 48 + (seed % 5), y: plan === 'YORKERS' ? 59 : plan === 'SHORT' ? 43 : 49 + ((seed >>> 4) % 6) },
    shotEnd,
    shotDirection: noContact ? 'No shot contact' : caught ? `Catch at ${reaction!.name.toLowerCase()}` : ball.runs === 0 && !ball.isWicket ? 'Defended / dot ball' : sector.name,
    fielders,
    fieldSetting: over <= 6 ? 'Powerplay' : over <= 16 ? 'Middle overs' : 'Death overs',
    animation: {
      deliveryLabel: plan === 'YORKERS' ? 'Yorker' : plan === 'SHORT' ? 'Short ball' : plan === 'VARIATIONS' ? spin ? 'Flighted spin' : 'Change of pace' : spin ? 'Spin delivery' : 'Stock delivery',
      fieldLabel: plan === 'YORKERS' ? 'Straight boundary protection' : plan === 'SHORT' ? 'Short-ball field' : plan === 'VARIATIONS' ? 'Change-of-pace field' : 'Standard field',
      loft: ball.runs === 6 ? 13 : caught ? 7 : 0,
      reaction,
    },
  };
}

export function recordDelivery(ball: Omit<BallLog, 'visual'>, context: VisualContext = {}): BallLog {
  return { ...ball, visual: createDeliveryVisual(ball, context) };
}
