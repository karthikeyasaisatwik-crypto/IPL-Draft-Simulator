import type { CareerEvent } from './careerTypes';

export const PHASE_3_EVENTS: CareerEvent[] = [
  {
    id: 'p3_mag_shoot',
    category: 'Brand',
    title: 'The Magazine Shoot',
    description: 'You arrive at a major fashion magazine\'s cover shoot in your signature, comfortable street clothes, but the stylist demands a flashy designer outfit.',
    weight: 10,
    choices: [
      {
        text: 'Stick to the olive pants',
        consequences: { popularity: 20, brandValue: -15 }
      },
      {
        text: 'Wear the designer gear',
        consequences: { brandValue: 25, mentality: -10 }
      }
    ]
  },
  {
    id: 'p3_doc_offer',
    category: 'Media',
    title: 'The Tell-All Documentary',
    description: 'A streaming platform wants unprecedented access for a "no filter" documentary.',
    weight: 10,
    choices: [
      {
        text: 'Full access',
        consequences: { brandValue: 20, familyMorale: -15 }
      },
      {
        text: 'Keep it curated',
        consequences: { brandValue: 5, familyMorale: 10 }
      }
    ]
  },
  {
    id: 'p3_endorsement_overload',
    category: 'Brand',
    title: 'Endorsement Overload',
    description: 'Six overlapping endorsement deals now, and your schedule is chaos.',
    weight: 10,
    choices: [
      {
        text: 'Hire a team to manage it',
        consequences: { funds: -2000, brandValue: 10, stamina: 10 }
      },
      {
        text: 'Wing it yourself',
        consequences: { brandValue: -10, mentality: -10, funds: 1000 }
      }
    ]
  },
  {
    id: 'p3_mama_manager',
    category: 'Family',
    title: 'The Manager Question',
    description: 'The agent who got you that first trial years ago wants to be your full-time manager now the money\'s real.',
    weight: 15,
    choices: [
      {
        text: 'Hire him as your manager',
        consequences: { familyMorale: 30 },
        managerCommissionRate: 0.2
      },
      {
        text: 'Sign with the corporate agency',
        consequences: { funds: 6000, familyMorale: -30 },
        managerCommissionRate: 0
      }
    ]
  },
  {
    id: 'p3_family_milestone',
    category: 'Family',
    title: 'The Family Milestone',
    description: 'A major family milestone means a stretch of matches you\'ll have to balance carefully.',
    weight: 10,
    choices: [
      {
        text: 'Prioritize the family moment, take leave',
        consequences: { familyMorale: 25, franchiseTrust: -10 }
      },
      {
        text: 'Play through it',
        consequences: { franchiseTrust: 10, familyMorale: -15 }
      }
    ]
  },
  {
    id: 'p3_captaincy_dilemma',
    category: 'Legacy',
    title: 'The Captaincy Dilemma',
    description: 'The franchise offers you the captaincy over a veteran bowler.',
    weight: 20,
    minWeek: 10, // assuming minWeek acts relative to the global tier, though careerLoop can just check weeksInTier
    excludesFlag: 'captaincyDecided',
    choices: [
      {
        text: 'Accept the armband',
        consequences: { legacyScore: 30, lockerRoomRespect: -25 },
        setsFlag: 'captaincyDecided',
        isCaptain: true
      },
      {
        text: 'Back the veteran',
        consequences: { lockerRoomRespect: 30, legacyScore: -15 },
        setsFlag: 'captaincyDecided'
      }
    ]
  },
  {
    id: 'p3_veteran_retirement',
    category: 'Locker Room',
    title: 'The Veteran\'s Retirement Speech',
    description: 'The veteran bowler you may have out-captained is retiring. They ask you to say a few words.',
    weight: 10,
    choices: [
      {
        text: 'Heartfelt, generous tribute',
        consequences: { lockerRoomRespect: 20, legacyScore: 10 }
      },
      {
        text: 'Brief and professional',
        consequences: { lockerRoomRespect: 5 }
      }
    ]
  },
  {
    id: 'p3_legacy_interview',
    category: 'Legacy',
    title: 'The Legacy Interview',
    description: 'A veteran journalist asks, on camera, how you want to be remembered.',
    weight: 10,
    choices: [
      {
        text: 'Talk records and trophies',
        consequences: { legacyScore: 15, brandValue: 10 }
      },
      {
        text: 'Talk about who you\'ve mentored',
        consequences: { legacyScore: 20, lockerRoomRespect: 10 }
      }
    ]
  },
  {
    id: 'p3_alpha_clash',
    category: 'Rival',
    title: 'The Rival Alpha Clash',
    description: 'A superstar from a rival franchise wants a public "friendly" bet on who scores more this match.',
    weight: 12,
    choices: [
      {
        text: 'Accept the bet',
        risky: {
          baseChance: 0.55,
          mentalityInfluence: 0.002,
          onSuccess: { brandValue: 25, mentality: 15 },
          onFailure: { brandValue: -10, mentality: -10 },
          successText: 'You outscored them and asserted dominance.',
          failureText: 'You crumbled under the pressure.'
        }
      },
      {
        text: 'Decline respectfully',
        consequences: { lockerRoomRespect: 15, brandValue: -5 }
      }
    ]
  },
  {
    id: 'p3_national_callup',
    category: 'National Stage',
    title: 'The National Call-Up',
    description: 'Selectors want to fast-track you into the senior national squad.',
    weight: 15,
    choices: [
      {
        text: 'Accept immediately',
        consequences: { legacyScore: 40, stamina: -20 }
      },
      {
        text: 'Finish the IPL season first',
        consequences: { franchiseTrust: 15, legacyScore: 10 }
      }
    ]
  },
  {
    id: 'p3_biz_venture',
    category: 'Business',
    title: 'The Business Venture Pitch',
    description: 'Investors want you to front a startup — sportswear, a functional drink brand, your call.',
    weight: 10,
    choices: [
      {
        text: 'Invest and front it',
        consequences: { funds: -10000, brandValue: 20 },
        setsFlag: 'ownsBusinessVenture'
      },
      {
        text: 'License your name only, no investment',
        consequences: { funds: 4000, brandValue: 10 }
      }
    ]
  },
  {
    id: 'p3_philanthropy_ask',
    category: 'Philanthropy',
    title: 'The Philanthropy Ask',
    description: 'A foundation wants your name and money behind a cricket academy back home.',
    weight: 10,
    choices: [
      {
        text: 'Fund it properly',
        consequences: { funds: -5000, legacyScore: 25, familyMorale: 10 }
      },
      {
        text: 'Lend your name, skip the funding',
        consequences: { legacyScore: 5, brandValue: -5 }
      }
    ]
  },
  {
    id: 'p3_injury_whisper',
    category: 'Health',
    title: 'The Injury Retirement Whisper',
    description: 'A scan shows early wear on your knee. Nothing serious — but "management" is now a word doctors use around you.',
    weight: 10,
    choices: [
      {
        text: 'Push through, deny it',
        consequences: { mentality: 10, stamina: -20 }
      },
      {
        text: 'Quietly adjust training load',
        consequences: { stamina: 15, legacyScore: 5 }
      }
    ]
  }
];
