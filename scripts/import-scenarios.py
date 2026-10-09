"""Rebuild historical snapshots from Cricsheet IPL JSON (ODC Attribution 1.0).

Run from the repository root. Download cache stays under node_modules/.cache.
Only factual starting snapshots are bundled; simulated ratings are our estimates.
"""
import io
import json
import pathlib
import urllib.request
import zipfile

CACHE = pathlib.Path('node_modules/.cache/scenarios')
CACHE.mkdir(parents=True, exist_ok=True)
SPECS = [
    ('1370353', 78, 'Jadeja and the fifth crown', 'Final, 2023: navigate the last two overs of a rain-shortened chase.', 'Hard', 'tata-ipl-2023-final-csk-vs-gt-match-report'),
    ('1181768', 108, 'The one-run final', 'Final, 2019: Watson is still there. Can Chennai finish, or can Mumbai close it out?', 'Hard', 'match-report-final-mi-vs-csk'),
    ('981019', 96, 'Bangalore’s last stand', 'Final, 2016: rescue the chase after the openers’ explosive start has unravelled.', 'Expert', 'match-report-final-rcb-vs-srh'),
    ('734049', 102, 'Chawla’s finishing act', 'Final, 2014: the tail must finish a 200-run chase after the middle order falls.', 'Hard', 'match-report-final-kkr-vs-kxip'),
    ('1216527', 102, 'Tewatia’s turnaround', 'Sharjah, 2020: three overs remain in a towering chase. Back the set batters or defend the advantage.', 'Expert', 'dream11-ipl-2020-match-9-rr-vs-kxip-match-report'),
    ('1359487', 115, 'Rinku’s five-ball miracle', 'Ahmedabad, 2023: take over with Rinku on strike and five deliveries left. A very rare finish to recreate.', 'Extreme', 'tata-ipl-2023-match-13-gt-vs-kkr-match-report'),
]
if any(not (CACHE / f'{s[0]}.json').exists() for s in SPECS):
    archive = zipfile.ZipFile(io.BytesIO(urllib.request.urlopen('https://cricsheet.org/downloads/ipl_json.zip').read()))
    for match_id, *_ in SPECS:
        (CACHE / f'{match_id}.json').write_bytes(archive.read(f'{match_id}.json'))

NAMES = {
    'RA Jadeja':'Ravindra Jadeja', 'S Dube':'Shivam Dube', 'MM Sharma':'Mohit Sharma',
    'SR Watson':'Shane Watson', 'DJ Bravo':'Dwayne Bravo', 'SL Malinga':'Lasith Malinga',
    'JJ Bumrah':'Jasprit Bumrah', 'CH Gayle':'Chris Gayle', 'V Kohli':'Virat Kohli',
    'STR Binny':'Stuart Binny', 'BCJ Cutting':'Ben Cutting', 'PP Chawla':'Piyush Chawla',
    'SA Yadav':'Suryakumar Yadav', 'SP Narine':'Sunil Narine', 'R Tewatia':'Rahul Tewatia',
    'RV Uthappa':'Robin Uthappa', 'RK Singh':'Rinku Singh', 'UT Yadav':'Umesh Yadav',
    'AT Rayudu':'Ambati Rayudu', 'SK Raina':'Suresh Raina', 'AM Rahane':'Ajinkya Rahane',
    'RD Gaikwad':'Ruturaj Gaikwad', 'DP Conway':'Devon Conway', 'MM Ali':'Moeen Ali',
    'DL Chahar':'Deepak Chahar', 'M Theekshana':'Maheesh Theekshana', 'TU Deshpande':'Tushar Deshpande',
    'WP Saha':'Wriddhiman Saha', 'HH Pandya':'Hardik Pandya', 'V Shankar':'Vijay Shankar',
    'DA Miller':'David Miller', 'J Little':'Josh Little', 'Q de Kock':'Quinton de Kock',
    'RG Sharma':'Rohit Sharma', 'KH Pandya':'Krunal Pandya', 'KA Pollard':'Kieron Pollard',
    'RD Chahar':'Rahul Chahar', 'MJ McClenaghan':'Mitchell McClenaghan', 'SN Thakur':'Shardul Thakur',
    'CJ Jordan':'Chris Jordan', 'S Aravind':'Sreenath Aravind', 'YS Chahal':'Yuzvendra Chahal',
    'DA Warner':'David Warner', 'S Dhawan':'Shikhar Dhawan', 'MC Henriques':'Moises Henriques',
    'DJ Hooda':'Deepak Hooda', 'NV Ojha':'Naman Ojha', 'B Kumar':'Bhuvneshwar Kumar',
    'BB Sran':'Barinder Sran', 'G Gambhir':'Gautam Gambhir', 'MK Pandey':'Manish Pandey',
    'YK Pathan':'Yusuf Pathan', 'RN ten Doeschate':'Ryan ten Doeschate', 'M Morkel':'Morne Morkel',
    'V Sehwag':'Virender Sehwag', 'M Vohra':'Manan Vohra', 'GJ Maxwell':'Glenn Maxwell',
    'GJ Bailey':'George Bailey', 'AR Patel':'Axar Patel', 'MG Johnson':'Mitchell Johnson',
    'P Awana':'Parvinder Awana', 'L Balaji':'Lakshmipathy Balaji', 'JC Buttler':'Jos Buttler',
    'SPD Smith':'Steve Smith', 'SV Samson':'Sanju Samson', 'JC Archer':'Jofra Archer',
    'R Parag':'Riyan Parag', 'TK Curran':'Tom Curran', 'S Gopal':'Shreyas Gopal',
    'AS Rajpoot':'Ankit Rajpoot', 'JD Unadkat':'Jaydev Unadkat', 'MA Agarwal':'Mayank Agarwal',
    'N Pooran':'Nicholas Pooran', 'KK Nair':'Karun Nair', 'JDS Neesham':'Jimmy Neesham',
    'SN Khan':'Sarfaraz Khan', 'SS Cottrell':'Sheldon Cottrell', 'M Ashwin':'Murugan Ashwin',
    'N Jagadeesan':'Narayan Jagadeesan', 'VR Iyer':'Venkatesh Iyer', 'N Rana':'Nitish Rana',
    'AD Russell':'Andre Russell', 'LH Ferguson':'Lockie Ferguson', 'CV Varun':'Varun Chakravarthy',
    'A Manohar':'Abhinav Manohar', 'AS Joseph':'Alzarri Joseph',
}
KEEPERS = {'MS Dhoni','WP Saha','RV Uthappa','KL Rahul','NV Ojha','JC Buttler','Rahmanullah Gurbaz','Q de Kock'}
SPECIALISTS = {'J Little','MM Sharma','Mohammed Shami','Noor Ahmad','Rashid Khan','M Theekshana','TU Deshpande','DL Chahar',
               'SL Malinga','JJ Bumrah','MJ McClenaghan','RD Chahar','Harbhajan Singh','Imran Tahir','SN Thakur',
               'YS Chahal','S Aravind','B Kumar','BB Sran','Mustafizur Rahman','M Morkel','UT Yadav','PP Chawla',
               'MG Johnson','P Awana','L Balaji','Karanveer Singh','SS Cottrell','Mohammed Shami','Ravi Bishnoi',
               'M Ashwin','AS Rajpoot','JD Unadkat','Yash Dayal','AS Joseph','LH Ferguson','CV Varun'}
SPIN = {'RA Jadeja':'SLA','KH Pandya':'SLA','AR Patel':'SLA','Shakib Al Hasan':'SLA',
        'SP Narine':'OFF_SPIN','MM Ali':'OFF_SPIN','Harbhajan Singh':'OFF_SPIN','GJ Maxwell':'OFF_SPIN',
        'Rashid Khan':'LEG_SPIN','Noor Ahmad':'LEG_SPIN','RD Chahar':'LEG_SPIN','Imran Tahir':'LEG_SPIN',
        'YS Chahal':'LEG_SPIN','PP Chawla':'LEG_SPIN','Ravi Bishnoi':'LEG_SPIN','M Ashwin':'LEG_SPIN',
        'R Tewatia':'LEG_SPIN','S Gopal':'LEG_SPIN','CV Varun':'OFF_SPIN','Karanveer Singh':'LEG_SPIN',
        'Bipul Sharma':'SLA','Iqbal Abdulla':'SLA','YK Pathan':'OFF_SPIN','Yuvraj Singh':'SLA'}
# Game balance estimates, not official ratings or calculations from future outcomes.
RATINGS = {'SR Watson':(87,90,75),'RA Jadeja':(75,84,85),'RK Singh':(83,94,5),
           'R Tewatia':(70,91,65),'SL Malinga':(15,25,95),'JJ Bumrah':(15,20,96),
           'B Kumar':(25,30,93),'Mustafizur Rahman':(15,20,91),'MM Sharma':(20,25,87),
           'PP Chawla':(43,65,80),'SP Narine':(40,76,92),'SS Cottrell':(20,30,80),
           'Yash Dayal':(15,20,72),'JC Archer':(40,86,91),'Sachin Baby':(66,76,30),
           'STR Binny':(59,76,66),'DJ Bravo':(66,83,85),'S Dube':(77,92,50)}

def deliveries(innings):
    return [(o['over'], d) for o in innings['overs'] for d in o['deliveries']]

output = []
for match_id, start, title, briefing, difficulty, report in SPECS:
    data = json.loads((CACHE / f'{match_id}.json').read_text())
    info = data['info']; innings = data['innings'][1]
    batting = innings['team']; bowling = next(t for t in info['teams'] if t != batting)
    excluded = set()
    for _, d in deliveries(innings):
        excluded.update(r['out'] for r in d.get('replacements', {}).get('match', []))
    lineups = {t:[p for p in ps if p not in excluded] for t,ps in info['players'].items()}
    assert all(len(ps)==11 for ps in lineups.values())
    bat_order = []
    for _, d in deliveries(innings):
        for p in [d['batter'], d['non_striker']]:
            if p not in bat_order: bat_order.append(p)
    bat_order += [p for p in lineups[batting] if p not in bat_order]
    bowlers = {d['bowler'] for inn in data['innings'] for _,d in deliveries(inn)}
    def player(name, pos, team):
        role = 'WK' if name in KEEPERS else 'Bowler' if name in SPECIALISTS else 'All-Rounder' if name in bowlers or name in SPIN else 'Batter'
        bat,pow,bwl = RATINGS.get(name, (24,38,83) if role=='Bowler' else (80,83,72 if role=='All-Rounder' else 10) if pos<=5 else (64,76,78 if role=='All-Rounder' else 10))
        return dict(id=f'historic-{match_id}-{info["registry"]["people"][name]}',name=NAMES.get(name,name),team=team,role=role,battingPosition=pos,allowedSlots=[pos],batRating=bat,powRating=pow,bwlRating=bwl,bowlingStyle=SPIN.get(name,'PACE'))
    squad = [player(n,i+1,batting) for i,n in enumerate(bat_order)]
    attack = [player(n,i+1,bowling) for i,n in enumerate(lineups[bowling])]
    ids = {n:p['id'] for n,p in zip(lineups[bowling],attack)}
    stats = [dict(player=p,runs=0,balls=0,dots=0,fours=0,sixes=0,dismissal='not out',strikeRate=0) for p in squad]
    by_name = dict(zip(bat_order,stats)); used = dict.fromkeys(ids.values(),0)
    total=wkts=legal=0; last=None; current=[]; next_delivery=None
    for over,d in deliveries(innings):
        if legal == start:
            next_delivery=d; break
        extras=d.get('extras',{}); is_legal=not ('wides' in extras or 'noballs' in extras)
        ps=by_name[d['batter']]; r=d['runs']['batter']
        ps['runs']+=r; ps['balls']+=int('wides' not in extras)
        ps['fours']+=int(r==4); ps['sixes']+=int(r==6); ps['dots']+=int(d['runs']['total']==0)
        total+=d['runs']['total']
        for w in d.get('wickets',[]):
            if w['kind']!='retired hurt': wkts+=1
            by_name[w['player_out']]['dismissal']=w['kind']
        legal+=int(is_legal); used[ids[d['bowler']]]+=int(is_legal)
        current.append('W' if d.get('wickets') else str(d['runs']['total']))
        if is_legal and legal%6==0: last=ids[d['bowler']]; current=[]
    assert next_delivery is not None
    for ps in stats: ps['strikeRate']=round(ps['runs']*100/ps['balls'],2) if ps['balls'] else 0
    max_balls=round(innings.get('target',{}).get('overs',20)*6)
    target=innings.get('target',{}).get('runs',1+sum(d['runs']['total'] for _,d in deliveries(data['innings'][0])))
    final=sum(d['runs']['total'] for _,d in deliveries(innings))
    outcome=info['outcome']; margin=', '.join(f'{v} {k}' for k,v in outcome['by'].items())
    output.append(dict(id=match_id,title=title,date=info['dates'][0],venue=info['venue'],briefing=briefing,difficulty=difficulty,bowlingTeam=bowling,maxBalls=max_balls,maxBowlerBalls=18 if max_balls==90 else 24,
        historicalResult=f'{outcome["winner"]} won by {margin}'+(' (DLS)' if outcome.get('method') else ''),historicalScore=final,
        source='https://cricsheet.org/downloads/ipl_json.zip',report=f'https://www.iplt20.com/news/article/{report}' if match_id != '734049' else 'https://www.espn.co.uk/cricket/series/695871/report/734049/kings-xi-punjab-vs-kolkata-knight-riders-final-pepsi-indian-premier-league-2014',
        historicalBowling={str(o['over']):ids[o['deliveries'][0]['bowler']] for o in innings['overs']},
        initial=dict(squad=squad,teamName=batting,bowlingSquad=attack,targetScore=target,totalRuns=total,totalWickets=wkts,ballsBowled=start,
            strikerIndex=bat_order.index(next_delivery['batter']),nonStrikerIndex=bat_order.index(next_delivery['non_striker']),nextBatterIndex=wkts+2,
            playerStats=stats,overLogs=[],ballLogs=[],currentOverLog=current,unprepared=False,unpreparedReason=None,teamMoraleScore=75,moraleMultiplier=1,batRatingPenalty=1,
            oppositionBowlingRating=80,bowlerBalls=used,lastBowlerId=last,currentBowlerId=ids[next_delivery['bowler']] if start%6 else None)))
    print(title, total,wkts,start,'target',target,'striker',next_delivery['batter'])

pathlib.Path('src/data/scenarios.ts').write_text('// Derived from Cricsheet (ODC Attribution 1.0). See docs/scenario-data.md.\n// Generated by scripts/import-scenarios.py; ratings are game estimates.\nimport type { ScenarioDefinition } from "../engine/scenarioTypes";\n\nexport const SCENARIOS: ScenarioDefinition[] = '+json.dumps(output,indent=2,ensure_ascii=False)+';\n',encoding='utf-8')
