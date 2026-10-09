# Historical IPL scenarios

This game contains information from **Cricsheet**, which is made available here
under the [Open Data Commons Attribution License (ODC-By) v1.0](https://opendatacommons.org/licenses/by/1-0/).
Source: https://cricsheet.org/downloads/ipl_json.zip
Licensing notice: https://cricsheet.org/licensing/

The derived database is `src/data/scenarios.ts`. Historical scores, individual
batting figures, strike, bowling usage, match results and active lineups are
extracted from the source JSON. Player display names are expanded where known.
Impact players replace the outgoing players in the active innings lineups.
No historical ball-by-ball commentary or article text is reproduced.

| Cricsheet match ID | Match | Takeover | Target |
| --- | --- | --- | --- |
| 1370353 | CSK v GT, 2023 final | CSK 150/5 after 13 overs | 171 in 15 overs |
| 1181768 | CSK v MI, 2019 final | CSK 132/4 after 18 overs | 150 |
| 981019 | RCB v SRH, 2016 final | RCB 162/4 after 16 overs | 209 |
| 734049 | KKR v KXIP, 2014 final | KKR 179/6 after 17 overs | 200 |
| 1216527 | RR v KXIP, 27 September 2020 | RR 173/3 after 17 overs | 224 |
| 1359487 | KKR v GT, 9 April 2023 | KKR 177/7 after 19.1 overs | 205 |

Rebuild with `python scripts/import-scenarios.py` from the repository root.
The importer downloads the Cricsheet IPL archive when its six source files are
absent from `node_modules/.cache/scenarios`. Runtime play is entirely offline.
Review changes to historical snapshots when refreshing upstream data.

Simulation ratings are curated game estimates, not official historical ratings.
Pitch effects are neutral. The current draft database is never imported into the
scenario catalog. Existing simplified Coach delivery probabilities are used;
historical extras are included in the starting score, but new simulation deliveries
do not introduce wides, no-balls or free hits. Ties remain ties (no Super Over).
The rain-shortened 2023 final uses a fixed published DLS target, not a DLS calculator.

Analysis only covers the simulated segment. Partnerships use the actual active
pair at each simulated delivery, and partial-over totals exclude historical balls.
Completion records are local to a browser and separate for chasing and defending.
Same-seed retries reproduce identical choices; a new variation changes the seed.
