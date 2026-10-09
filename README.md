# IPL Draft Simulator

A React/TypeScript cricket game with H2H drafting, Coach Mode, Chase 300, and The Long Innings career RPG.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm run build
npm run lint
npm test
```

The regression suite covers blocked drafts, tied matches, perk calculations, skill prerequisites and costs, weekly action limits, XP and goal rewards, recurring NPCs, relationship support, stamina, and older career saves.

## The Long Innings

- Choose a rookie archetype and start with 3 Skill Points. The skill tree is available in every career phase.
- Unlock 12 perks across Chasing, Leadership, Resilience, and Craft & Connections. Perks within a branch stack.
- Choose one optional focus each week: technical nets, recovery, life outside cricket, or a veteran session. Each grants 5 XP; completing the week grants 10 XP. Every 40 XP earns 1 SP.
- Meet recurring rivals Arjun Rao and Zoya Khan, and mentors Dev Malhotra and Meera Sen. NPC encounters return every third week unless a major match takes priority. Relationships change event dialogue and provide weekly support or penalties.
- Complete four career goals for Skill Points and Legacy rewards. Each reward can be claimed once.
- Keep stamina above 30 to avoid a 15% reduction in match batting stats. Recovery perks and Meera's support help manage fatigue.

Careers autosave to this browser's local storage. Existing saves receive the new fields while retaining their progress. Saves belong to the current browser and origin; clearing browser data removes them.

## Match Radar

H2H and Chase 300 play ball by ball with an overhead pitch, animated delivery paths, wagon wheel, and fielder positions. Pause, step through deliveries, change speed, or skip to the scorecard. Coach Mode offers phase replays with a delivery scrubber, including the final innings. Toggle field labels and the wagon wheel to keep the pitch readable.

Runs, wickets, batters, and score snapshots come from the simulation. Shot geometry and phase-based field layouts are illustrative, not a physics or fielding model. Match Radar is excluded from RPG screens.

## Optional Coach plans and player traits

Open **Optional game plan** below the intensity slider. Choose Balanced, Rotate strike, Attack boundaries, or Protect wickets when batting; choose Stock deliveries, Yorker plan, Short-ball plan, or Change of pace when bowling. Plans apply to the next phase and reset afterwards. Yorker and short-ball plans apply to pace bowlers; spinners use stock deliveries. Skilled bowlers execute yorkers better, especially in overs 17–20.

Before the first ball, optionally enable **player traits** for both teams and open the scouting report. Stable game traits include pace/spin comfort and vulnerability, slow starters, finishers, and death-over specialists. These are game tendencies, not real-world scouting data. Traits lock for the match; they are off by default. Default plans reproduce the original Coach simulation results with the same random seed. The scorecard records the plans used and the runs/wickets in each phase.

## Post-match analysis and replays

After an H2H (including pass-and-play), Chase 300, or Coach match, click **Match analysis & replays** on the scorecard. The separate analysis window includes turning points, costly overs, the three largest partnerships, and explanations of score or required-rate changes. Select **Watch highlight** to replay the recorded passage, or **Replay full innings** for the complete innings. Pause, step backwards/forwards, scrub to a delivery, or switch playback speed. **Back to scorecard** or Escape closes the window.

Analysis reads the completed result without rerunning the simulation. Older results lacking delivery logs retain over summaries but cannot offer detailed replays. RPG screens do not include this feature.

## Historical pressure scenarios

Choose **Scenarios · Rewrite the finish** in the main menu. Six IPL moments feature
the 2014, 2016, 2019 and 2023 finals, Tewatia's 2020 chase, and Rinku's 2023 finish.
Choose either side, set batting/bowling plans, select eligible bowlers, and choose
incoming batters after wickets. Play an over at a time or individual deliveries
in the final two overs. Historical lineups are bundled separately from modern
draft players, including retired players and impact substitutions.

The result compares your finish with history. **Match analysis & replays** opens
a separate dialog containing turning points, costly overs, partnerships since
takeover, decision history and replay controls. Completed attempts, wins and best
score margins are saved locally for each side. Same-condition retries preserve
the random seed; new variations change it. Simulation probabilities remain based
on the existing Coach engine, with estimated ratings and neutral pitch effects.

See [data sources, attribution and engine limitations](docs/scenario-data.md).
`npm test` includes 480 seeded scenario continuations alongside existing gameplay
regressions. Scenario code and historical data load on demand.
