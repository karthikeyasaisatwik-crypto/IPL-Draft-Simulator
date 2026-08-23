import type { CareerEvent } from './careerTypes';

export const PHASE_1_EVENTS: CareerEvent[] = [
  {
    id: 'evt_academic_clash',
    category: 'academic',
    title: 'The Exam Ultimatum',
    description: 'A crucial district-level selection match falls on the exact same weekend as your massive university final exams.',
    weight: 10,
    choices: [
      { text: 'Skip exam, play match', consequences: { battingRating: 15, coachFavor: 20, academicStress: 30 }, outcomeText: 'You score a quick 40, but your academic future looks grim.' },
      { text: 'Tank the match, study', consequences: { academicStress: -20, coachFavor: -15, form: -10 }, outcomeText: 'You ace the mock, but the coach benches you for the rest of the week.' }
    ]
  },
  {
    id: 'evt_lab_nets',
    category: 'academic',
    title: 'Late Night Study vs. Nets',
    description: 'You have a massive stack of university assignments due tomorrow, but the local nets are open late.',
    weight: 10,
    choices: [
      { text: 'Stay in and finish the assignments', consequences: { academicStress: -20, form: -5 }, outcomeText: 'Code compiles, but your timing looks rusty the next day.' },
      { text: 'Sneak out for throwdowns', consequences: { battingRating: 10, academicStress: 20, stamina: -15 }, outcomeText: 'Sweet sound off the bat, but you are running on empty for class tomorrow.' }
    ]
  },
  {
    id: 'evt_mena_mama',
    category: 'family',
    title: 'The Sketchy Connection',
    description: 'A sketchy local talent agent claims he can guarantee you a spot in a top-tier club without a trial.',
    weight: 8,
    excludesFlag: 'usedConnection',
    choices: [
      { text: 'Take the agent\'s shortcut', consequences: { coachFavor: 20, lockerRoomRespect: -30 }, setsFlag: 'usedConnection', outcomeText: 'You get the trial, but the other boys know how you got it.' },
      { text: 'Grind the open trials', consequences: { lockerRoomRespect: 20, stamina: -10 }, outcomeText: 'It is a tough, long day, but you earn every bit of respect.' }
    ]
  },
  {
    id: 'evt_fallout',
    category: 'rival',
    title: 'The Fallout',
    description: 'Word has gotten around the dressing room about how you really got your trial.',
    weight: 12,
    minWeek: 10,
    requiresFlag: 'usedConnection',
    excludesFlag: 'resolvedFallout',
    choices: [
      { text: 'Own it, buy the team snacks', requiredStat: { stat: 'funds', min: 500 }, consequences: { lockerRoomRespect: 10, funds: -500 }, setsFlag: 'resolvedFallout', outcomeText: 'A round of samosas smooths things over.' },
      { text: 'Deny everything', consequences: { lockerRoomRespect: -15, popularity: -10 }, setsFlag: 'resolvedFallout', outcomeText: 'Nobody buys it. You are isolated in the dressing room.' }
    ]
  },
  {
    id: 'evt_whatsapp_group',
    category: 'family',
    title: 'The Family Group Chat',
    description: 'A cousin got a \'real\' job. The relatives have Opinions, forwarded in a dozen different group chats.',
    weight: 10,
    choices: [
      { text: 'Defend the cricket dream at dinner', consequences: { parentalExpectations: -10, form: 10 }, outcomeText: 'Things get heated, but you channel the anger into the nets.' },
      { text: 'Nod, agree, deflect', consequences: { parentalExpectations: 5, academicStress: 10 }, outcomeText: 'You keep the peace, but the stress eats at you.' }
    ]
  },
  {
    id: 'evt_capcut',
    category: 'social',
    title: 'The Editing All-Nighter',
    description: 'A friend filmed your weekend century.',
    weight: 8,
    choices: [
      { text: 'Edit all night and post', consequences: { popularity: 20, stamina: -20 }, outcomeText: 'The reel blows up, but you are exhausted.' },
      { text: 'Sleep and recover', consequences: { stamina: 20 }, outcomeText: 'You feel fresh and ready for the next match.' }
    ]
  },
  {
    id: 'evt_sponsorship_dm',
    category: 'financial',
    title: 'The Sponsorship DM',
    description: 'A local bat brand slides into your DMs offering free gear for a promo reel — but your coach hates unofficial sponsorships.',
    weight: 6,
    choices: [
      { text: 'Take the deal', consequences: { funds: 2000, coachFavor: -15, popularity: 15 }, setsFlag: 'gotSponsorKit', outcomeText: 'New gear secured, but the coach gives you the silent treatment.' },
      { text: 'Decline, stay clean with the coach', consequences: { coachFavor: 10 }, outcomeText: 'The coach appreciates your loyalty.' }
    ]
  },
  {
    id: 'evt_local_journo',
    category: 'social',
    title: 'The Local Journalist',
    description: 'A stringer for the district paper wants a quote after your knock.',
    weight: 8,
    choices: [
      { text: 'Bold, confident soundbite', consequences: { popularity: 15, lockerRoomRespect: -10 }, outcomeText: 'Fans love the swagger; teammates think you are getting ahead of yourself.' },
      { text: 'Humble, deflect credit', consequences: { lockerRoomRespect: 15, popularity: 5 }, outcomeText: 'Boring quote for the paper, but the boys love you for it.' }
    ]
  },
  {
    id: 'evt_injury_scare',
    category: 'health',
    title: 'The Injury Scare',
    description: 'You roll your ankle in practice. It is probably fine.',
    weight: 5,
    choices: [
      { 
        text: 'Play through it', 
        consequences: { battingRating: 5 },
        modifiers: [
          {
            id: 'mod_ankle_injury',
            label: 'Ankle Injury',
            stat: 'stamina',
            perTurnDelta: -8,
            turnsRemaining: 4
          }
        ],
        outcomeText: 'You tough it out and score, but your ankle is throbbing. Recovery will take several weeks.' 
      },
      { text: 'Sit out and rest it', consequences: { stamina: 15, coachFavor: -10 }, outcomeText: 'You recover fully, though the coach mutters about softness.' }
    ]
  },
  {
    id: 'evt_toxic_senior',
    category: 'social',
    title: 'The Toxic Senior',
    description: 'A senior player is making a junior life hell at nets. Nobody has said anything.',
    weight: 8,
    choices: [
      { text: 'Call it out publicly', consequences: { lockerRoomRespect: 20, coachFavor: -10 }, outcomeText: 'The boys respect your guts, but the coach hates the drama.' },
      { text: 'Stay out of it', consequences: { lockerRoomRespect: -10 }, outcomeText: 'You keep your head down, but lose some face with the younger guys.' }
    ]
  },
  {
    id: 'evt_rain_abandoned',
    category: 'cricket',
    title: 'The Rain-Abandoned Match',
    description: 'Washed out. Free Saturday.',
    weight: 4,
    choices: [
      { text: 'Extra nets session', consequences: { battingRating: 5, stamina: -10 }, outcomeText: 'You get wet, but your technique gets sharper.' },
      { text: 'Actually rest for once', consequences: { stamina: 15, form: 5 }, outcomeText: 'A rare day off does wonders for your mind and body.' }
    ]
  },
  {
    id: 'evt_study_group',
    category: 'social',
    title: 'The Study Group',
    description: 'Someone from your Economics elective keeps accidentally sitting next to you in the library.',
    weight: 7,
    choices: [
      { text: 'Make time for it', consequences: { academicStress: -10, popularity: 5, form: -5 }, outcomeText: 'Nice afternoon, though you are distracted during throwdowns later.' },
      { text: 'Stay heads-down on cricket', consequences: { battingRating: 5, popularity: -5 }, outcomeText: 'You ignore the hint. Cricket is life.' }
    ]
  },
  {
    id: 'evt_bat_upgrade',
    category: 'financial',
    title: 'The Bat Upgrade',
    description: 'Your Kashmir Willow hand-me-down is falling apart. A proper English Willow bat costs more than you have.',
    weight: 8,
    excludesFlag: 'upgradedBat',
    choices: [
      { text: 'Ask parents for the money', consequences: { funds: 3000, parentalExpectations: -15 }, setsFlag: 'upgradedBat', outcomeText: 'They transfer the money, but remind you of the sacrifices they are making.' },
      { text: 'Grind it out with the old bat', consequences: { lockerRoomRespect: 10, battingRating: -5 }, outcomeText: 'It splinters on a yorker, but everyone respects the hustle.' }
    ]
  }
];
