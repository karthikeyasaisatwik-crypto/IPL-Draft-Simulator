import type { CareerEvent } from './careerTypes';

export const RETIREMENT_EVENTS: CareerEvent[] = [
  {
    id: 'ret_testimonial',
    category: 'Farewell',
    title: 'The Testimonial Dinner',
    description: 'The franchise throws a dinner in your honor to celebrate your extraordinary career.',
    weight: 10,
    choices: [
      {
        text: 'Gracious, reflective speech',
        consequences: { legacyScore: 15 }
      },
      {
        text: 'Keep it short and humble',
        consequences: { lockerRoomRespect: 15 }
      }
    ]
  },
  {
    id: 'ret_jersey',
    category: 'Farewell',
    title: 'The Jersey Retirement Ceremony',
    description: 'The club retires your number. A permanent mark on the franchise history.',
    weight: 10,
    choices: [
      {
        text: 'Make it a family affair',
        consequences: { familyMorale: 20, legacyScore: 10 }
      },
      {
        text: 'Keep it strictly a team occasion',
        consequences: { lockerRoomRespect: 15, legacyScore: 10 }
      }
    ]
  },
  {
    id: 'ret_press',
    category: 'Farewell',
    title: 'The Final Press Conference',
    description: 'Your last chance to shape your own narrative on camera.',
    weight: 10,
    choices: [
      {
        text: 'Talk legacy and records',
        consequences: { legacyScore: 15, brandValue: 10 }
      },
      {
        text: 'Thank the fans and teammates',
        consequences: { popularity: 15, lockerRoomRespect: 10 }
      }
    ]
  },
  {
    id: 'ret_ovation',
    category: 'Farewell',
    title: 'The Last Home Ovation',
    description: 'Your final home match. The whole crowd is on its feet. A victory lap for the ages.',
    weight: 10,
    choices: [
      {
        text: 'Soak it in, slow lap of the ground',
        consequences: { popularity: 15, legacyScore: 10 }
      },
      {
        text: 'Stay focused, all business to the last ball',
        consequences: { mentality: 10, legacyScore: 15 }
      }
    ]
  }
];
