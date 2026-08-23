import type { CareerEvent } from './careerTypes';

export const PHASE_2_EVENTS: CareerEvent[] = [
  {
    id: 'evt_payday_distraction',
    category: 'financial',
    title: 'The Payday Distraction',
    description: 'Your first franchise paycheck clears. Time to spend some of it.',
    weight: 10,
    choices: [
      { text: 'Buy a high-end gaming console and stream your gameplay to build an online following', consequences: { popularity: 20, coachFavor: -15, funds: -800 }, outcomeText: 'Chat loves you, but the coach notices you yawning at morning practice.' },
      { text: 'Hire a private dietician', consequences: { stamina: 15, form: 10, funds: -600 }, outcomeText: 'Your body feels incredible. The investment pays off immediately.' }
    ]
  },
  {
    id: 'evt_contract_renewal',
    category: 'financial',
    title: 'The Contract Renewal',
    description: 'Management wants to lock you into a multi-year deal before the auction opens.',
    weight: 10,
    choices: [
      { text: 'Sign now for security', consequences: { franchiseTrust: 15, parentalExpectations: 10, mediaHype: -5 }, setsFlag: 'signedContract', outcomeText: 'You put pen to paper. Security over upside.' },
      { text: 'Bet on yourself, go to open auction', consequences: { mediaHype: 15, franchiseTrust: -10 }, outcomeText: 'The media loves the gamble. Management is annoyed.' }
    ]
  },
  {
    id: 'evt_sponsorship_portfolio',
    category: 'financial',
    title: 'The Sponsorship Portfolio',
    description: 'A bat brand and an energy-drink brand both want an exclusive deal. Pick one.',
    weight: 8,
    excludesFlag: 'pickedSponsor',
    choices: [
      { text: 'Energy drink deal', consequences: { funds: 5000, mediaHype: 15 }, setsFlag: 'gotEnergyDrink', outcomeText: 'Your face is on billboards across the city.' },
      { text: 'Bat brand deal', consequences: { funds: 3000, battingRating: 5 }, setsFlag: 'gotBatSponsor', outcomeText: 'You get top-tier willow and a steady paycheck.' }
    ]
  },
  {
    id: 'evt_kohli_clash',
    category: 'rival',
    title: 'The Legend\'s XI',
    description: 'You are batting against your idol team.',
    weight: 12,
    choices: [
      { 
        text: 'Play aggressive, sledge', 
        risky: {
          baseChance: 0.6,
          mentalityInfluence: 0.002,
          onSuccess: { mentality: 20, form: 10 },
          onFailure: { form: -15, lockerRoomRespect: -5 },
          successText: 'You back it up with a boundary! The crowd goes wild.',
          failureText: 'You edge it straight to slip. The idol laughs as you walk off.'
        }
      },
      { text: 'Respectful, ask for tips', consequences: { battingRating: 15, lockerRoomRespect: -10, mentality: 5 }, outcomeText: 'He gives you solid advice, but your teammates call you soft.' }
    ]
  },
  {
    id: 'evt_trade_rumor',
    category: 'media',
    title: 'The Trade Rumor',
    description: 'Reporters ask if you have heard the rumors about a trade to a rival franchise.',
    weight: 10,
    choices: [
      { text: 'Fan the flames for leverage', consequences: { mediaHype: 20, franchiseTrust: -15 }, outcomeText: 'Your agent is happy, but the franchise owner is fuming.' },
      { text: 'Shut it down, pledge loyalty', consequences: { franchiseTrust: 15, mediaHype: -10 }, outcomeText: 'Boring headline, but management appreciates the loyalty.' }
    ]
  },
  {
    id: 'evt_interview_slip',
    category: 'media',
    title: 'The Post-Match Interview Slip',
    description: 'You said something borderline controversial about a rival team in the presser.',
    weight: 8,
    choices: [
      { text: 'Double down when pushed', consequences: { mediaHype: 25, franchiseTrust: -20 }, outcomeText: 'You are trending #1 on Twitter, but PR is having a meltdown.' },
      { text: 'Walk it back', consequences: { franchiseTrust: 10, mediaHype: -10 }, outcomeText: 'You issue an apology. The news cycle moves on.' }
    ]
  },
  {
    id: 'evt_curfew_crisis',
    category: 'social',
    title: 'Curfew Crisis',
    description: 'Your phone charger fried while you were editing a sponsor video in the hotel.',
    weight: 8,
    choices: [
      { 
        text: 'Sneak out for a replacement', 
        risky: {
          baseChance: 0.5,
          onSuccess: { mediaHype: 20 },
          onFailure: { franchiseTrust: -30 },
          successText: 'You sneak back in unnoticed. The video goes live on time.',
          failureText: 'Caught by the team manager in the lobby. You are fined and benched.'
        }
      },
      { text: 'Sleep, lose the sponsor deadline', consequences: { stamina: 10, mediaHype: -15 }, outcomeText: 'You miss the post. The sponsor is angry, but at least you are rested.' }
    ]
  },
  {
    id: 'evt_media_dance',
    category: 'media',
    title: 'The Media Dance',
    description: 'PR wants you to do a trending dance challenge for the brand.',
    weight: 8,
    choices: [
      { text: 'Do it', consequences: { franchiseTrust: 25, lockerRoomRespect: -20 }, outcomeText: 'The video goes viral. The boys mercilessly mock you in the group chat.' },
      { text: 'Refuse, focus on cricket', consequences: { franchiseTrust: -20, lockerRoomRespect: 15 }, outcomeText: 'PR is annoyed, but the senior players respect your focus.' }
    ]
  },
  {
    id: 'evt_injury_load',
    category: 'health',
    title: 'The Injury Load Management Row',
    description: 'Physio wants to rest you for two matches. Selectors are watching this series.',
    weight: 8,
    choices: [
      { 
        text: 'Push to play through it', 
        risky: {
          baseChance: 0.5,
          onSuccess: { battingRating: 15, mediaHype: 10 },
          onFailure: { franchiseTrust: -15 },
          onFailureModifiers: [
            {
              id: 'mod_load_injury',
              label: 'Hamstring Strain',
              stat: 'stamina',
              perTurnDelta: -8,
              turnsRemaining: 4
            }
          ],
          successText: 'You play a heroic knock. The selectors are impressed.',
          failureText: 'You break down mid-innings. The team is furious you hid the pain.'
        }
      },
      { text: 'Accept the rest', consequences: { stamina: 20, franchiseTrust: 10, mediaHype: -10 }, outcomeText: 'You rest up. The selectors move on to the next shiny prospect.' }
    ]
  },
  {
    id: 'evt_foreign_coach',
    category: 'mentor',
    title: 'Foreign Coach Culture Clash',
    description: 'The new overseas batting coach wants to rebuild your technique from scratch.',
    weight: 8,
    choices: [
      { text: 'Trust the process', consequences: { battingRating: 20, form: -15 }, outcomeText: 'You struggle in the nets all week, but long-term it feels right.' },
      { text: 'Stick to what got you here', consequences: { coachFavor: -10, mentality: 10 }, outcomeText: 'You stubbornly hit it your way. The coach shakes his head.' }
    ]
  },
  {
    id: 'evt_net_bowler_no_more',
    category: 'social',
    title: 'The Net Bowler No More',
    description: 'You are training with international net bowlers instead of your old college teammates now.',
    weight: 7,
    choices: [
      { text: 'Fully embrace the pro setup', consequences: { battingRating: 10, popularity: -10 }, outcomeText: 'Your technique improves against pace, but your old crew feels left behind.' },
      { text: 'Stay in touch, split your time', consequences: { lockerRoomRespect: 10, stamina: -10 }, outcomeText: 'You keep your roots strong, but the extra sessions drain you.' }
    ]
  },
  {
    id: 'evt_family_money_talk',
    category: 'family',
    title: 'The Family Money Talk',
    description: 'Real money is coming in now. Parents want a serious conversation about savings.',
    weight: 7,
    choices: [
      { text: 'Hand over a chunk for family security', consequences: { funds: -2000, parentalExpectations: 20 }, outcomeText: 'They are proud of you. The safety net is built.' },
      { text: 'Keep control of your own finances', consequences: { parentalExpectations: -15, mentality: 5 }, outcomeText: 'An awkward dinner, but you feel like your own man.' }
    ]
  },
  {
    id: 'evt_old_cse_group',
    category: 'academic',
    title: 'The Old Capstone Project, Revisited',
    description: 'Your university capstone group still expects you to pull your weight, franchise deal or not.',
    weight: 3,
    choices: [
      { text: 'Pull an all-nighter to finish your part', consequences: { academicStress: -15, stamina: -15 }, outcomeText: 'The project is submitted. You sleep through morning mobility drills.' },
      { text: 'Pay a junior to cover for you', consequences: { funds: -300, academicStress: 10, parentalExpectations: -5 }, outcomeText: 'It gets done, but the guilt and fear of being caught linger.' }
    ]
  }
];
