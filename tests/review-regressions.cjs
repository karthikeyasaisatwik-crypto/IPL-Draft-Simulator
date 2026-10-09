const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

// Load the app's TypeScript directly without adding a test-runner dependency.
const cache = new Map();
function load(file) {
  file = path.resolve(__dirname, '..', file);
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const localRequire = name => {
    if (name === 'zustand') {
      // SSR should render the explicitly arranged current store snapshot.
      const create = initializer => {
        if (!initializer) return create;
        const store = require('zustand').create(initializer);
        return Object.assign((selector = state => state) => selector(store.getState()), store);
      };
      return { create };
    }
    if (!name.startsWith('.')) return require(name);
    const base = path.resolve(path.dirname(file), name);
    const resolved = ['.ts', '.tsx', '.js'].map(ext => base + ext).find(candidate => fs.existsSync(candidate));
    return load(resolved);
  };
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(localRequire, module, module.exports);
  return module.exports;
}
const storage = new Map();
Object.defineProperty(global, 'localStorage', { configurable: true, value: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) } });
const { PLAYERS } = load('src/data/players.ts');
const { useGameStore } = load('src/store/gameStore.ts');
const DraftScreen = load('src/components/draft/DraftScreen.tsx').default;
const squad = Array(11).fill(null);
// Draft RR's opener first, then leave only slot 2 open to reproduce the last-pick block.
squad[0] = PLAYERS.find(p => p.team === 'RR' && p.allowedSlots.includes(1) && p.allowedSlots.includes(2));
for (let i = 2; i < squad.length; i++) {
  squad[i] = PLAYERS.find(p => p.allowedSlots.includes(i + 1) && !squad.includes(p));
}
assert(!PLAYERS.some(p => p.team === 'RR' && !squad.includes(p) && p.allowedSlots.includes(2)));
for (const dual of [false, true]) {
  useGameStore.setState({ selectedMode: 'H2H', currentSpunTeam: 'RR', draftedSquad: squad,
    isDualPlayerMode: dual, currentDraftingTeam: 'A', teamASquad: squad, teamBSquad: Array(11).fill(null) });
  const markup = renderToStaticMarkup(React.createElement(DraftScreen));
  assert.match(markup, /Free reroll/);
  assert.match(markup, /This reroll is free and preserves your respins/);
}
useGameStore.setState({ currentSpunTeam: null, isDualPlayerMode: false, draftedSquad: Array(11).fill(null) });
assert.match(renderToStaticMarkup(React.createElement(DraftScreen)), /Keeper missing/);

const { generateAIOpponent } = load('src/engine/aiDraft.ts');
const { simulateH2HMatch } = load('src/engine/h2hSimulation.ts');
const { buildCoachMatchResult } = load('src/engine/coachSimulation.ts');
const { generatePostMatchEmails } = load('src/engine/emailGenerator.ts');
const random = Math.random;
let seed = 42;
Math.random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
try {
  const a = generateAIOpponent('CSK', PLAYERS).aiSquad;
  const b = generateAIOpponent('MI', PLAYERS.filter(p => !a.some(q => q.id === p.id))).aiSquad;
  let ties = 0;
  for (let i = 0; i < 1000; i++) {
    const batsFirst = i % 2 === 0;
    const result = simulateH2HMatch(a, b, 'A', 'B', batsFirst);
    const [first, second] = result.innings;
    assert.equal(result.isTie, first.totalRuns === second.totalRuns);
    if (result.isTie) {
      ties++;
      assert.equal(result.teamAnalysis.verdict, 'MATCH TIED');
      assert.equal(result.isWin, false);
      const coach = buildCoachMatchResult(first, second, 'A', 'B', batsFirst, 'BALANCED');
      assert.equal(coach.isTie, true);
      assert.equal(coach.teamAnalysis.verdict, 'MATCH TIED');
      assert.equal(generatePostMatchEmails(coach, batsFirst, 50, null, 'A', 'B')[0].subject, 'Honours even');
    } else {
      assert.equal(result.isWin, batsFirst ? first.totalRuns > second.totalRuns : second.totalRuns > first.totalRuns);
    }
  }
  assert(ties > 0, 'Seeded simulation must exercise ties');
  console.log(`Regression checks passed: single/dual blocked drafts, squad hints, 1,000 H2H matches including ${ties} ties, coach verdicts and mailbox.`);
} finally { Math.random = random; }

global.window = { localStorage: global.localStorage };
const { useCareerStore } = load('src/store/careerStore.ts');
const { SKILL_NODES } = load('src/engine/skillTreeData.ts');
const { getRelationshipEvent } = load('src/engine/careerExpansion.ts');
const { getMatchPerkMultiplier } = load('src/engine/matchPerks.ts');
const { getCareerMatchSquad, deriveMatchStats } = load('src/engine/careerMatchBridge.ts');
const career = () => useCareerStore.getState();
career().resetCareer();
career().initializeArchetype('PRODIGY', 'Test Rookie');
assert.equal(career().skillPoints, 3);
career().unlockSkill('chasing_2'); // prerequisite guard
assert.equal(career().skillPoints, 3);
career().unlockSkill('unknown');
assert.equal(career().skillPoints, 3);
career().unlockSkill('chasing_1');
assert.equal(career().skillPoints, 1);
career().unlockSkill('chasing_1'); // duplicate guard
assert.equal(career().skillPoints, 1);
const striker = { ...PLAYERS[0], activeSkillEffects: [SKILL_NODES.find(n => n.id === 'chasing_1').effect] };
assert.equal(getMatchPerkMultiplier(striker, PLAYERS[1], true), 1.05);
assert.equal(getMatchPerkMultiplier(striker, PLAYERS[1], false), 1);
const partner = { ...PLAYERS[1], activeSkillEffects: [SKILL_NODES.find(n => n.id === 'leadership_1').effect] };
assert.equal(getMatchPerkMultiplier(striker, partner, true), 1.05 * 1.05);
assert.equal(getCareerMatchSquad(career(), 'grassroots')[1].role, 'WK');

career().chooseWeeklyFocus('nets');
assert.equal(career().trainingSessions, 1);
assert.equal(career().battingRating, 58);
assert.equal(career().careerXp, 5);
career().chooseWeeklyFocus('nets');
assert.equal(career().trainingSessions, 1); // cannot repeat or swap focus
career().claimGoal('nets_four');
assert.equal(career().claimedGoals.length, 0);
for (let i = 0; i < 3; i++) {
  career().advanceWeek();
  career().chooseWeeklyFocus('nets');
}
assert.equal(career().trainingSessions, 4);
assert.equal(career().careerXp, 50);
assert.equal(career().skillPoints, 2); // exactly one XP reward
career().claimGoal('nets_four');
assert.equal(career().skillPoints, 4);
career().claimGoal('nets_four');
assert.equal(career().skillPoints, 4);
assert.equal(career().legacyScore, 5);

career().resetCareer(); career().initializeArchetype('GRINDER');
career().unlockSkill('fitness_1');
useCareerStore.setState({ stamina: 20 });
career().chooseWeeklyFocus('recovery');
assert.equal(career().stamina, 43); // 18 * 1.25 rounded
career().advanceWeek();
useCareerStore.setState({ stamina: 5 });
career().chooseWeeklyFocus('nets');
assert.equal(career().trainingSessions, 0); // insufficient stamina
career().changeRelationships({ dev: 1000, arjun: -1000 });
assert.equal(career().relationships.dev, 100);
assert.equal(career().relationships.arjun, 0);
const favorBefore = career().coachFavor;
const respectBefore = career().lockerRoomRespect;
career().advanceWeek();
assert.equal(career().coachFavor, favorBefore); // mentor +1, hostile rival -1
assert.equal(career().lockerRoomRespect, respectBefore);
const npcIds = [3, 6, 9, 12].map(currentWeek => getRelationshipEvent({ ...career(), currentWeek }).id);
assert.equal(new Set(npcIds).size, 4);
assert.equal(getRelationshipEvent({ ...career(), currentWeek: 2 }), null);
const ready = deriveMatchStats({ ...career(), stamina: 100 });
const tired = deriveMatchStats({ ...career(), stamina: 10 });
assert(tired.batRating < ready.batRating);

career().addActiveModifier({ id: 'income-test', label: 'Stipend', stat: 'funds', perTurnDelta: 100, turnsRemaining: 2 });
career().advanceWeek();
assert.equal(career().funds, 100);
career().advanceWeek();
assert.equal(career().funds, 200);
assert(!career().activeModifiers.some(m => m.id === 'income-test'));

// Older saves keep their progression and receive missing expansion fields.
storage.set('career-storage', JSON.stringify({ state: { playerName: 'Old Save', hasSelectedArchetype: true, skillPoints: 7, unlockedSkillNodes: ['chasing_1'] }, version: 0 }));
career().resetCareer();
storage.set('career-storage', JSON.stringify({ state: { playerName: 'Old Save', hasSelectedArchetype: true, skillPoints: 7, unlockedSkillNodes: ['chasing_1'] }, version: 0 }));
useCareerStore.persist.rehydrate();
assert.equal(career().playerName, 'Old Save');
assert.equal(career().skillPoints, 7);
assert.equal(career().relationships.dev, 35);
assert.equal(career().careerXp, 0);
career().initializeArchetype('ALL_ROUNDER', 'Fresh Start');
assert.equal(career().skillPoints, 3);
assert.equal(career().unlockedSkillNodes.length, 0);
console.log('RPG checks passed: perk math, unlock guards, weekly limits, XP, goals, stamina, NPC rotation/support, modifier income, and old-save compatibility.');

const { getNextCareerEvent } = load('src/engine/careerLoop.ts');
useCareerStore.setState({ currentWeek: 21, tierStartWeek: 1, careerTier: 'GRASSROOTS', bigMatchHistory: [] });
assert.equal(getNextCareerEvent(career()).category, 'BIG_MATCH');
const record = { title: 'The District Final', result: 'win', playerRuns: 35, turnPlayed: 21 };
career().addBigMatchRecord(record);
career().addBigMatchRecord(record);
assert.equal(career().bigMatchHistory.length, 1);
assert.notEqual(getNextCareerEvent(career()).category, 'BIG_MATCH');
console.log('Career match replay guards passed.');

// Radar uses real delivery outcomes without consuming simulation randomness.
const { createDeliveryVisual } = load('src/engine/shotVisualizer.ts');
const { buildPlaybackFrames } = load('src/engine/matchPlayback.ts');
const { initPartialInnings, simulateCoachPhase, finalizeInnings } = load('src/engine/coachSimulation.ts');
const { simulateChase300 } = load('src/engine/simulation.ts');
const radarA = generateAIOpponent('CSK', PLAYERS).aiSquad;
const radarB = generateAIOpponent('MI', PLAYERS.filter(p => !radarA.some(q => q.id === p.id))).aiSquad;
function checkDeliveries(innings) {
  const balls = innings.ballLogs;
  const [overs, remainder] = innings.oversBowled.split('.').map(Number);
  assert.equal(balls.length, overs * 6 + (remainder || 0));
  let runs = 0, wickets = 0;
  balls.forEach((ball, index) => {
    runs += ball.runs; wickets += Number(ball.isWicket);
    assert.equal(ball.ballNumber, index + 1);
    assert.equal(ball.currentTotal, runs);
    assert.equal(ball.currentWickets, wickets);
    assert.equal(ball.visual.fielders.length, 11);
    assert(innings.playerStats.some(p => p.player.name === ball.strikerName));
  });
  assert.equal(runs, innings.totalRuns);
  assert.equal(wickets, innings.totalWickets);
  innings.playerStats.forEach(ps => assert.equal(balls.filter(b => b.strikerName === ps.player.name).reduce((sum, b) => sum + b.runs, 0), ps.runs));
}
for (let i = 0; i < 30; i++) {
  const match = simulateH2HMatch(radarA, radarB, 'A', 'B', true);
  match.innings.forEach(checkDeliveries);
  const frames = buildPlaybackFrames(match);
  assert.equal(frames.length, match.innings.reduce((sum, inn) => sum + inn.ballLogs.length + 1, 0));
  assert.equal(frames.at(-1).runs, match.innings[1].totalRuns);
  assert.equal(frames[0].deliveriesShown, 1);
}
const chase = simulateChase300(radarA);
chase.innings.forEach(checkDeliveries);
const initial = initPartialInnings(radarA, 'A', radarB, null);
const pp = simulateCoachPhase(initial, 1, 36, 50, 1, true);
assert.equal(initial.ballLogs.length, 0);
const middle = simulateCoachPhase(pp, 37, 96, 50, 1, true);
assert(pp.ballLogs.length <= 36);
assert.notEqual(middle.ballLogs, pp.ballLogs);
checkDeliveries(finalizeInnings(middle));
assert(pp.ballLogs.every(b => radarB.some(p => p.name === b.bowlerName)));
const sample = { ballNumber: 4, overNumber: 1, strikerName: 'Tester', bowlerName: 'Bowler', runs: 4, isWicket: false, currentTotal: 4, currentWickets: 0 };
Math.random = () => { throw new Error('Visualization must not consume match RNG'); };
try {
  assert.deepEqual(createDeliveryVisual(sample), createDeliveryVisual(sample));
  const v = createDeliveryVisual(sample);
  assert(Math.abs((v.shotEnd.x - 50) ** 2 / 42 ** 2 + (v.shotEnd.y - 50) ** 2 / 44 ** 2 - 1) < 0.00001);
  assert.equal(createDeliveryVisual({ ...sample, isWicket: true, dismissalText: 'b Bowler' }).shotEnd, null);
} finally { Math.random = random; }
const legacy = { ...chase, innings: chase.innings.map(({ ballLogs: _ballLogs, ...inn }) => inn) };
assert.equal(buildPlaybackFrames(legacy).at(-1).runs, chase.innings[0].totalRuns);
delete global.window;
const MatchRadar = load('src/components/simulation/MatchRadar.tsx').default;
assert.match(renderToStaticMarkup(React.createElement(MatchRadar, { delivery: chase.innings[0].ballLogs[0] })), /Match Radar/);
console.log('Radar checks passed: score snapshots, player attribution, chase and coach logs, phase immutability, deterministic geometry, RNG isolation and legacy playback.');

// Golden result captured from the pre-expansion Coach engine: 40 seeded innings,
// all three phases, both coaching roles and three intensity levels.
const { createHash } = require('node:crypto');
const { MOCK_PLAYERS } = load('src/engine/types.ts');
const { DEFAULT_COACH_PLANS, getCoachPlanModifiers, getCoachPlayerProfile } = load('src/engine/coachTactics.ts');
const digest = createHash('sha256');
let coachSeed = 781;
Math.random = () => ((coachSeed = (Math.imul(coachSeed, 1664525) + 1013904223) >>> 0) / 4294967296);
try {
  for (let i = 0; i < 40; i++) {
    let state = initPartialInnings(MOCK_PLAYERS.slice(0, 11), 'A', MOCK_PLAYERS.slice(9, 20), i % 2 === 0 ? 180 : null);
    for (const [start, end] of [[1, 36], [37, 96], [97, 120]]) {
      state = simulateCoachPhase(state, start, end, [20, 50, 80][i % 3], 1, i % 2 === 0);
      const { ballLogs: _logs, ...comparable } = state;
      digest.update(JSON.stringify(comparable));
    }
  }
} finally { Math.random = random; }
assert.equal(digest.digest('hex'), '1754e5d13873247138d0525579d219f3503a70fff431e25a8a91e735a20e403c');
const bumrah = MOCK_PLAYERS.find(p => p.name === 'Jasprit Bumrah');
const rashid = MOCK_PLAYERS.find(p => p.name === 'Rashid Khan');
const batter = MOCK_PLAYERS[0];
const neutral = { wicket: 1, dot: 1, rotation: 1, boundary: 1 };
assert.deepEqual(getCoachPlanModifiers(DEFAULT_COACH_PLANS, true, batter, bumrah, 0, 1), neutral);
assert.deepEqual(getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, bowling: 'SHORT' }, true, batter, bumrah, 0, 1), neutral);
assert.deepEqual(getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, batting: 'ATTACK' }, false, batter, bumrah, 0, 1), neutral);
assert.deepEqual(getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, bowling: 'YORKERS' }, false, batter, rashid, 0, 115), neutral);
const attacking = getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, batting: 'ATTACK' }, true, batter, bumrah, 0, 1);
assert(attacking.boundary > 1 && attacking.wicket > 1);
const protection = getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, batting: 'PROTECT' }, true, batter, bumrah, 0, 1);
assert(protection.boundary < 1 && protection.wicket < 1);
const yorker = getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, bowling: 'YORKERS' }, false, batter, bumrah, 0, 115);
assert(yorker.boundary < 1 && yorker.rotation > 1);
const weakYorker = getCoachPlanModifiers({ ...DEFAULT_COACH_PLANS, bowling: 'YORKERS' }, false, batter, { ...bumrah, bwlRating: 60 }, 0, 115);
assert(weakYorker.boundary > 1);
assert(getCoachPlayerProfile(bumrah).deathSpecialist);
const { useCoachStore } = load('src/store/coachStore.ts');
for (const userBatsFirst of [true, false]) {
  useGameStore.setState({ draftedSquad: radarA });
  useCoachStore.getState().initCoachMatch(userBatsFirst);
  useCoachStore.getState().setPlans({ batting: 'ATTACK', bowling: 'SHORT', usePlayerTraits: true });
  useCoachStore.getState().startPhase();
  assert.equal(useCoachStore.getState().plans.batting, 'BALANCED');
  assert.equal(useCoachStore.getState().plans.bowling, 'STOCK');
  assert.equal(useCoachStore.getState().planHistory[0].label, userBatsFirst ? 'ATTACK' : 'SHORT');
  useCoachStore.getState().setPlans({ usePlayerTraits: false });
  assert.equal(useCoachStore.getState().plans.usePlayerTraits, true); // match setting locked
  for (let phase = 0; phase < 5; phase++) {
    useCoachStore.getState().setPlans({ batting: 'ROTATE', bowling: 'VARIATIONS' });
    useCoachStore.getState().startPhase();
  }
  const finished = useCoachStore.getState();
  assert.equal(finished.coachPhase, 'FINISHED');
  assert.equal(finished.planHistory.reduce((total, phase) => total + phase.runs, 0), finished.finalInn1.totalRuns + finished.finalInn2.totalRuns);
  assert.equal(finished.planHistory.reduce((total, phase) => total + phase.wickets, 0), finished.finalInn1.totalWickets + finished.finalInn2.totalWickets);
  const count = finished.planHistory.length;
  finished.startPhase();
  assert.equal(useCoachStore.getState().planHistory.length, count);
  finished.resetCoach();
  assert.deepEqual(useCoachStore.getState().plans, DEFAULT_COACH_PLANS);
  assert.equal(useCoachStore.getState().planHistory.length, 0);
}
console.log('Coach expansion checks passed: exact legacy results, role isolation, plan trade-offs, spinner fallback, six-phase flow, trait lock, plan report and reset.');

const { analyzeMatch, analyzeInnings, getPartnerships } = load('src/engine/matchAnalysis.ts');
const fixtureNames = ['Alpha', 'Beta', 'Gamma', 'Delta'];
const highlightBalls = [
  ['Alpha', 4, false], ['Alpha', 1, false], ['Beta', 0, true],
  ['Gamma', 6, false], ['Gamma', 0, true], ['Delta', 2, false], ['Alpha', 4, false],
];
let fixtureRuns = 0, fixtureWickets = 0;
const fixtureLogs = highlightBalls.map(([strikerName, runs, isWicket], index) => {
  fixtureRuns += runs; fixtureWickets += Number(isWicket);
  return { ballNumber: index + 1, overNumber: Math.floor(index / 6) + 1, strikerName, bowlerName: 'Test bowler', runs, isWicket,
    dismissalText: isWicket ? 'b Test bowler' : undefined, currentTotal: fixtureRuns, currentWickets: fixtureWickets };
});
const fixtureInnings = { ...chase.innings[0], teamName: 'Fixture', totalRuns: 17, totalWickets: 2, oversBowled: '1.1',
  playerStats: MOCK_PLAYERS.slice(0, 11).map((player, index) => ({ player: { ...player, name: fixtureNames[index] ?? player.name }, runs: [9, 0, 6, 2][index] ?? 0, balls: 0, dots: 0, fours: 0, sixes: 0, dismissal: 'not out', strikeRate: 0 })),
  ballLogs: fixtureLogs, overLogs: [{ overNumber: 1, runs: 13, wickets: 2, summaryText: '4, 1, W, 6, W, 2' }, { overNumber: 2, runs: 4, wickets: 0, summaryText: '4' }] };
const fixtureSnapshot = JSON.stringify(fixtureInnings);
const stands = getPartnerships(fixtureInnings);
assert.deepEqual(stands.map(stand => stand.names), [['Alpha', 'Beta'], ['Alpha', 'Gamma'], ['Alpha', 'Delta']]);
assert.deepEqual(stands.map(stand => stand.runs), [5, 6, 6]);
assert.deepEqual(stands.map(stand => stand.balls), [3, 2, 2]);
assert(stands.at(-1).unbeaten);
Math.random = () => { throw new Error('Analysis must never rerun the simulation'); };
try {
  const report = analyzeInnings(fixtureInnings, 20);
  assert.equal(report.highlights.find(h => h.category === 'Costly overs').title, 'Over 1 · 13 runs');
  assert.match(report.highlights.find(h => h.id === 'wicket-5').title, /Gamma dismissed for 6/);
  assert(report.highlights.some(h => h.id === 'collapse-1'));
  assert.match(report.highlights.find(h => h.id === 'over-2').detail, /1 ball, 0 wickets/);
  assert.match(report.highlights.find(h => h.id === 'over-2').impact, /3 needed from 113 balls/);
  report.highlights.forEach(h => { assert(h.startBall >= 1); assert(h.endBall <= fixtureLogs.length); assert(h.startBall <= h.endBall); });
  const tied = analyzeMatch({ ...chase, innings: [fixtureInnings, fixtureInnings], isTie: true });
  assert.equal(tied[1].highlights.find(h => h.id === 'finish').title, 'Scores finished level');
  const win = analyzeMatch({ ...chase, innings: [{ ...fixtureInnings, totalRuns: 16 }, fixtureInnings] });
  assert.equal(win[1].highlights.find(h => h.id === 'finish').title, 'The winning passage');
  const chaseReport = analyzeMatch({ ...chase, innings: [fixtureInnings] });
  assert.match(chaseReport[0].highlights.find(h => h.id === 'finish').impact, /283 needed/);
  const old = analyzeInnings({ ...fixtureInnings, ballLogs: undefined });
  assert.equal(old.complete, false); assert.equal(old.partnerships.length, 0);
  assert(old.highlights.every(h => !h.replayAvailable));
  assert.equal(getPartnerships({ ...fixtureInnings, ballLogs: fixtureLogs.slice(1) }).length, 0);
  assert.equal(JSON.stringify(fixtureInnings), fixtureSnapshot);
} finally { Math.random = random; }
for (const inn of chase.innings) {
  const partnerships = getPartnerships(inn);
  assert.equal(partnerships.reduce((sum, stand) => sum + stand.runs, 0), inn.totalRuns);
  assert.equal(partnerships.reduce((sum, stand) => sum + stand.balls, 0), inn.ballLogs.length);
}
const MatchAnalysisPanel = load('src/components/simulation/MatchAnalysisPanel.tsx').default;
assert.match(renderToStaticMarkup(React.createElement(MatchAnalysisPanel, { result: { ...chase, innings: [fixtureInnings] } })), /Watch highlight/);
const ResultScorecard = load('src/components/simulation/Scorecard.tsx').default;
useGameStore.setState({ lastMatchResult: chase, selectedMode: 'CAREER_MOMENT' });
assert(!renderToStaticMarkup(React.createElement(ResultScorecard)).includes('Match analysis &amp; replays'));
useGameStore.setState({ selectedMode: 'CHASE_300' });
assert.match(renderToStaticMarkup(React.createElement(ResultScorecard)), /Match analysis &amp; replays/);
assert(!renderToStaticMarkup(React.createElement(ResultScorecard)).includes('Watch highlight'));
console.log('Highlight checks passed: partnerships across strike changes, wicket bursts, partial overs, chase pressure, ties, replay bounds, legacy fallback, RPG exclusion and RNG isolation.');

// Historical scenarios must preserve real starting states without depending on
// today's draft pool; seeded continuations must honour quotas and innings limits.
const { SCENARIOS } = load('src/data/scenarios.ts');
const scenarioEngine = load('src/engine/scenarioSimulation.ts');
const { DEFAULT_COACH_PLANS: scenarioPlans } = load('src/engine/coachTactics.ts');
const { useScenarioStore } = load('src/store/scenarioStore.ts');
assert.equal(SCENARIOS.length, 6);
const expectedStarts = [[150,5,78,171,90], [132,4,108,150,120], [162,4,96,209,120], [179,6,102,200,120], [173,3,102,224,120], [177,7,115,205,120]];
let scenarioRuns = 0;
for (const [index, definition] of SCENARIOS.entries()) {
  const initial = definition.initial;
  assert.deepEqual([initial.totalRuns, initial.totalWickets, initial.ballsBowled, initial.targetScore, definition.maxBalls], expectedStarts[index]);
  assert.equal(initial.squad.length, 11);
  assert.equal(initial.bowlingSquad.length, 11);
  assert.equal(initial.squad.length, new Set(initial.squad.map(p => p.id)).size);
  assert(initial.squad.every(p => p.id.startsWith('historic-')));
  assert.equal(Object.values(initial.bowlerBalls).reduce((a,b) => a+b,0), initial.ballsBowled);
  assert.equal(initial.playerStats.filter(p => p.dismissal !== 'not out').length, initial.totalWickets);
  assert(initial.playerStats[initial.strikerIndex].dismissal === 'not out');
  assert(initial.playerStats[initial.nonStrikerIndex].dismissal === 'not out');
  const frozen = JSON.stringify(definition);
  for (const batting of [true,false]) for (let seed = 0; seed < 40; seed++) {
    let innings = structuredClone(initial), rng = seed, safety = 0;
    const decisionLog = [];
    while (!scenarioEngine.scenarioFinished(innings, definition)) {
      assert(++safety <= 120);
      const eligible = scenarioEngine.eligibleScenarioBowlers(innings, definition);
      assert(eligible.length > 0);
      const next = scenarioEngine.playScenario(definition, innings, rng, batting, seed % 2 ? 100 : 0, scenarioPlans, eligible.at(-1).id, 6);
      assert.deepEqual(next, scenarioEngine.playScenario(definition, innings, rng, batting, seed % 2 ? 100 : 0, scenarioPlans, eligible.at(-1).id, 6));
      if (innings.ballsBowled % 6) assert.equal(next.decisions[0].bowler, innings.bowlingSquad.find(p => p.id === innings.currentBowlerId).name);
      decisionLog.push(...next.decisions);
      innings = next.state; rng = next.seed;
      assert(innings.ballsBowled <= definition.maxBalls);
      assert(Object.values(innings.bowlerBalls).every(b => b <= definition.maxBowlerBalls));
      if (next.needsBatter) {
        const chosen = innings.squad.at(-1).id;
        innings = scenarioEngine.chooseScenarioBatter(innings, 10);
        assert.equal(innings.squad[innings.nextBatterIndex - 1].id, chosen);
        assert.equal(innings.squad[innings.strikerIndex].id, innings.playerStats[innings.strikerIndex].player.id);
        assert.equal(innings.squad[innings.nonStrikerIndex].id, innings.playerStats[innings.nonStrikerIndex].player.id);
      }
    }
    assert.equal(innings.ballLogs.length, innings.ballsBowled - initial.ballsBowled);
    assert.equal(decisionLog.reduce((n,d) => n+d.runs,0), innings.totalRuns - initial.totalRuns);
    assert.equal(decisionLog.filter(d => d.wicket).length, innings.totalWickets - initial.totalWickets);
    assert.equal(JSON.stringify(definition), frozen);
    scenarioRuns++;
  }
}
const shortFinal = scenarioEngine.playScenario(SCENARIOS[0], SCENARIOS[0].initial, 9, true, 50, scenarioPlans, '', 1);
assert.equal(shortFinal.state.ballLogs.at(-1).visual.fieldSetting, 'Death overs');
useScenarioStore.getState().start(SCENARIOS[5].id, false, 42);
while (!scenarioEngine.scenarioFinished(useScenarioStore.getState().innings, SCENARIOS[5])) useScenarioStore.getState().advance(6);
const completed = JSON.stringify(useScenarioStore.getState().progress);
useScenarioStore.getState().advance(6);
assert.equal(JSON.stringify(useScenarioStore.getState().progress), completed);
const recorded = JSON.stringify(useScenarioStore.getState().innings.ballLogs);
useScenarioStore.getState().start(SCENARIOS[5].id, false, 42);
while (!scenarioEngine.scenarioFinished(useScenarioStore.getState().innings, SCENARIOS[5])) useScenarioStore.getState().advance(6);
assert.equal(JSON.stringify(useScenarioStore.getState().innings.ballLogs), recorded);
// A tie is not credited as a bowling win; closed storage cannot block completion.
useScenarioStore.getState().start(SCENARIOS[5].id, false, 42);
useScenarioStore.setState({ innings: { ...structuredClone(SCENARIOS[5].initial), totalRuns: 204, ballsBowled: 120 } });
assert(scenarioEngine.scenarioFinished(useScenarioStore.getState().innings, SCENARIOS[5]));
const tieProgress = JSON.stringify(useScenarioStore.getState().progress);
useScenarioStore.getState().advance(1);
assert.equal(JSON.stringify(useScenarioStore.getState().progress), tieProgress);
const ScenariosScreen = load('src/components/scenarios/ScenariosScreen.tsx').default;
assert.match(renderToStaticMarkup(React.createElement(ScenariosScreen)), /Match tied/);
const storedSetItem = localStorage.setItem;
localStorage.setItem = () => { throw new Error('Storage denied'); };
useScenarioStore.getState().start(SCENARIOS[5].id, false, 42);
while (!scenarioEngine.scenarioFinished(useScenarioStore.getState().innings, SCENARIOS[5])) useScenarioStore.getState().advance(6);
assert.equal(useScenarioStore.getState().storageWarning, true);
localStorage.setItem = storedSetItem;
useScenarioStore.getState().leave();
assert.match(renderToStaticMarkup(React.createElement(ScenariosScreen)), /IPL Pressure Scenarios/);
console.log(`Scenario checks passed: six verified snapshots, ${scenarioRuns} seeded attempts, quotas, shortened innings, mid-over lock, batter changes, repeatable retries, completion guard, tie UI and storage fallback.`);
