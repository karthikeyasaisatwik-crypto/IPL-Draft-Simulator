import type { UnifiedMatchResult, Player } from './types';

export interface CoachEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  isRead: boolean;
  category: 'BOARD' | 'MEDIA' | 'FANS' | 'PLAYER';
}

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generatePostMatchEmails(
  matchResult: UnifiedMatchResult,
  _isUserBatting: boolean,
  coachTactics: number,
  potm: { player: Player; reason: string } | null,
  userTeamName: string,
  _aiTeamName: string
): CoachEmail[] {
  if (matchResult.isTie) {
    return [{
      id: 'email-tie', sender: 'The Board of Directors', subject: 'Honours even',
      body: 'Both teams finished on the same score. A hard-fought tie; regroup and build on this performance.',
      isRead: false, category: 'BOARD',
    }];
  }
  const emails: CoachEmail[] = [];
  const { innings, isWin } = matchResult;
  const inn1 = innings[0];
  const inn2 = innings[1];
  const totalRuns = inn1.totalRuns + inn2.totalRuns;

  let isCrushWin = false;
  let isCrushLoss = false;
  let isNarrowWin = false;
  let isNarrowLoss = false;

  if (inn2.teamName === userTeamName) {
    const ballsRemaining = 120 - parseFloat(inn2.oversBowled) * 6;
    const wicketsRemaining = 10 - inn2.totalWickets;
    if (isWin) {
      if (wicketsRemaining >= 7 || ballsRemaining > 30) isCrushWin = true;
      else if (wicketsRemaining <= 3 || ballsRemaining <= 6) isNarrowWin = true;
    } else {
      const runMargin = inn1.totalRuns - inn2.totalRuns;
      if (runMargin >= 50) isCrushLoss = true;
      else if (runMargin <= 10) isNarrowLoss = true;
    }
  } else {
    const ballsRemaining = 120 - parseFloat(inn2.oversBowled) * 6;
    const wicketsRemaining = 10 - inn2.totalWickets;
    if (isWin) {
      const runMargin = inn1.totalRuns - inn2.totalRuns;
      if (runMargin >= 50) isCrushWin = true;
      else if (runMargin <= 10) isNarrowWin = true;
    } else {
      if (wicketsRemaining >= 7 || ballsRemaining > 30) isCrushLoss = true;
      else if (wicketsRemaining <= 3 || ballsRemaining <= 6) isNarrowLoss = true;
    }
  }

  let tacticsCat = 'BALANCED';
  if (coachTactics >= 65) tacticsCat = 'AGGRESSIVE';
  if (coachTactics <= 35) tacticsCat = 'DEFENSIVE';

  let emailIdCounter = 1;
  const createEmail = (
    sender: string,
    subject: string,
    body: string,
    category: CoachEmail['category']
  ): CoachEmail => ({
    id: `email-${emailIdCounter++}`,
    sender,
    subject,
    body,
    isRead: false,
    category,
  });

  const isHighScoring = totalRuns > 360;
  const isLowScoring = totalRuns < 280;

  const boardSender = 'The Board of Directors';
  if (isCrushWin) {
    emails.push(createEmail(boardSender, getRandom(['Outstanding Execution', 'Brilliant Victory']), getRandom(['That is exactly why we hired you. The tactical setup was flawless today. Bonus incoming.', 'A clinical performance. The fans are thrilled.']), 'BOARD'));
  } else if (isNarrowWin) {
    emails.push(createEmail(boardSender, getRandom(['Too close for comfort', 'Nerve-wracking Win']), getRandom(["A win is a win, but my heart can't take many more death overs like that. Good job holding your nerve.", 'We barely scraped through, but your final tactical adjustments got us the points.']), 'BOARD'));
  } else if (isNarrowLoss) {
    emails.push(createEmail(boardSender, getRandom(['Heartbreaking result', 'Fine margins']), getRandom(['The margins are so small in T20 cricket. We backed the wrong bowler at the death. Regroup for the next one.', 'A painful defeat. We need you to be sharper with the tactical slider next time.']), 'BOARD'));
  } else if (isCrushLoss) {
    emails.push(createEmail(boardSender, getRandom(['Unacceptable', 'Embarrassing Performance']), getRandom(['What on earth was that? The tactical sliders were completely wrong for this pitch. Fix this immediately.', 'This franchise doesn\'t tolerate humiliation. Your tactical decisions today were a disaster.']), 'BOARD'));
  } else {
    emails.push(createEmail(boardSender, isWin ? 'Solid Victory' : 'Tough Loss', isWin ? 'Good win today, Coach.' : 'We were outplayed today.', 'BOARD'));
  }

  const mediaSender = 'The Daily Cricket';
  if (isHighScoring) {
    emails.push(createEmail(mediaSender, getRandom(['Match Report: Absolute run-fest!', 'Pitch rating: Highway']), getRandom([`${userTeamName}'s bowlers had no answers today on a flat deck. Questions will be asked of the coach's defensive fields.`, 'A spectator\'s dream, a coach\'s nightmare.']), 'MEDIA'));
  } else if (isLowScoring) {
    emails.push(createEmail(mediaSender, getRandom(['Pitch Analysis: A bowler\'s paradise', 'Tactical chess match']), getRandom(['Gritty cricket today. The tactical intensity from the dugouts was palpable.', 'Not one for the highlight reels, but purists will love it.']), 'MEDIA'));
  } else if (!isWin) {
    emails.push(createEmail(mediaSender, getRandom(['The Daily Spin: Tactical Disaster?', 'Questions remain for the Coach']), getRandom(['Is the coach out of their depth? The bowling assignments in the middle overs made zero sense.', 'Fans are demanding answers after today\'s confusing performance.']), 'MEDIA'));
  } else {
    emails.push(createEmail(mediaSender, 'Match Recap: A tactical victory', `A well-earned victory for ${userTeamName}.`, 'MEDIA'));
  }

  const fanSender = '@SuperFan_99';
  if (isWin && tacticsCat === 'AGGRESSIVE') {
    emails.push(createEmail(fanSender, getRandom(['Trending: #AbsoluteCinema', 'Trending: #LicenseToThrill']), getRandom(['Coach gave them the license to thrill today!! See the ball, hit the ball 💥🔥', 'That was BOX OFFICE! Aggressive tactics win T20s.']), 'FANS'));
  } else if (isWin && tacticsCat === 'DEFENSIVE') {
    emails.push(createEmail(fanSender, getRandom(['Trending: #BoringButEffective', 'Trending: #Masterclass']), getRandom(['Look, it wasn\'t pretty, but we choked them out. 2 points is 2 points. 🛡️', 'Tactical masterclass. Protect the wickets, contain the runs.']), 'FANS'));
  } else if (!isWin) {
    emails.push(createEmail(fanSender, getRandom(['Trending: #SackTheCoach', 'Trending: #FraudAlert']), getRandom(['I\'m breaking my TV. Worst bowling changes I\'ve ever seen. Fraudulent behavior.', 'My grandma could have picked better tactics. #SackTheCoach']), 'FANS'));
  } else {
    emails.push(createEmail(fanSender, 'Trending: #GoodWin', 'Happy with the points today. Let us keep the momentum going! 🏏', 'FANS'));
  }

  if (potm && potm.player) {
    const isUserPotm = isWin;
    if (isUserPotm) {
      if (potm.player.role === 'Batter' || potm.player.role === 'WK') {
        emails.push(createEmail(potm.player.name, getRandom(['License to thrill', 'Freedom to play']), getRandom(['Thanks for backing me today, Coach. The aggressive mentality slider gave me the freedom to just tee off.', 'The tactical setup was perfect. Let me play my natural game.']), 'PLAYER'));
      } else {
        emails.push(createEmail(potm.player.name, getRandom(['The plan worked', 'Execution on point']), getRandom(['Great bowling assignments in the middle overs. Kept the pressure on and I just reaped the rewards.', 'Thanks for trusting me with those crucial overs.']), 'PLAYER'));
      }
    } else {
      if (potm.player.role === 'Batter' || potm.player.role === 'WK') {
        emails.push(createEmail(potm.player.name, getRandom(['Thanks for the pies', 'Easy runs']), getRandom(['Easiest runs of my life. Bringing your spinner on in the 16th over? I couldn\'t stop laughing while I hit it out of the stadium. 😂', 'Your bowlers were extremely predictable today.']), 'PLAYER'));
      } else {
        emails.push(createEmail(potm.player.name, getRandom(['Clueless', 'In my web']), getRandom(['Your batters had absolutely no idea how to read my variations today. Keep the pitch dusty next time!', 'Easiest 4-over spell of my career.']), 'PLAYER'));
      }
    }
  }

  return emails;
}
