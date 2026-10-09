import type { BallLog, DeliveryVisual } from './types';

type Point = { x: number; y: number };
const fraction = (t: number, start: number, end: number) => Math.max(0, Math.min(1, (t - start) / (end - start)));
const between = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const quadratic = (a: Point, control: Point, b: Point, t: number): Point => {
  const first = between(a, control, t);
  const second = between(control, b, t);
  return between(first, second, t);
};
const striker = { x: 50, y: 62 };
const release = { x: 50, y: 30 };

// A pure presentation timeline: never advances the innings or consumes its RNG.
export function sampleDelivery(ball: BallLog, visual: DeliveryVisual, progress: number) {
  const t = Math.max(0, Math.min(1, progress));
  const reaction = visual.animation?.reaction;
  const origin = visual.fielders.find(f => f.name === reaction?.name);
  const fieldProgress = fraction(t, .38, .74);
  const fielder = reaction && origin ? between(origin, reaction.target, fieldProgress) : undefined;
  const bowler = between({ x: 50, y: 21 }, release, fraction(t, 0, .15));
  const contact = .4;
  const shotProgress = fraction(t, contact, .74);
  const loft = visual.animation?.loft ?? (ball.runs === 6 ? 13 : 0);
  const control = visual.shotEnd ? { x: 50 + (visual.shotEnd.x - 50) * .5,
    y: (striker.y + visual.shotEnd.y) * .5 - loft * 1.2 } : striker;
  let position = t < .15 ? bowler : t < .29 ? between(release, visual.bounce, fraction(t, .15, .29))
    : t < contact ? between(visual.bounce, striker, fraction(t, .29, contact))
    : visual.shotEnd ? quadratic(striker, control, visual.shotEnd, shotProgress) : striker;
  let height = t >= contact ? Math.sin(shotProgress * Math.PI) * loft * .2 : 0;
  const throwing = reaction?.action === 'collect' || reaction?.action === 'runout';
  if (t > .74 && throwing && visual.shotEnd) {
    position = between(visual.shotEnd, { x: 50, y: reaction.action === 'runout' ? 62 : 69 }, fraction(t, .74, .94));
    height = Math.sin(fraction(t, .74, .94) * Math.PI) * 2;
  }
  if (reaction?.action === 'stumping' && t >= contact) {
    position = t < .74 ? between(striker, reaction.target, fraction(t, contact, .74))
      : between(reaction.target, striker, fraction(t, .74, .94));
  }
  // Boundaries don't require running. Run-outs show an unfinished attempted run.
  const runs = ball.isWicket ? reaction?.action === 'runout' ? .8 : 0 : ball.runs < 4 ? ball.runs : 0;
  const legs = fraction(t, contact, .94) * runs;
  const runPosition = Math.floor(legs) % 2 ? 1 - (legs % 1) : legs % 1;
  const phase = t >= .94 ? 'Complete' : t < .15 ? 'Run-up' : t < contact ? 'Delivery'
    : t < .74 ? visual.shotEnd ? visual.animation?.loft ? 'In the air' : 'Shot' : 'At the stumps'
    : reaction?.action === 'catch' ? 'Catch taken' : reaction?.action === 'chase' ? 'Boundary'
    : reaction?.action === 'runout' ? 'Throw to the stumps' : reaction?.action === 'stumping' ? 'Stumping'
    : throwing ? 'Return throw' : ball.runs === 6 ? 'Over the rope' : 'At the stumps';
  return { position, height, fielder, bowler, shotProgress, phase, strikerY: 62 - runPosition * 25,
    nonStrikerY: 37 + runPosition * 25, contact: t >= contact, bounced: t >= .29,
    wicket: ball.isWicket && t >= (reaction ? .94 : contact) };
}
