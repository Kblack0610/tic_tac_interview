import { AIPersonality } from './types';

export const LUCKY: AIPersonality = {
  id: 'lucky',
  name: 'Lucky',
  emoji: '🍀',
  difficulty: 'easy',
  description: 'A friendly beginner who relies on luck',
  taunts: {
    onThinking: [
      'Hmm, let me think...',
      'Eeny, meeny, miny, moe...',
      'I have a good feeling about this!',
      'Lucky guess incoming!',
    ],
    onWin: [
      'Beginner\'s luck! 🍀',
      'Wait, I won?!',
      'Even I\'m surprised!',
    ],
    onLose: [
      'Good game! You\'re too good!',
      'I\'ll get lucky next time!',
      'Well played, friend!',
    ],
    onDraw: [
      'A tie! That was fun!',
      'We\'re evenly matched!',
      'Let\'s go again!',
    ],
  },
  optimalRate: 0.3,
  thinkingDelay: [600, 1200],
};

export const SHARP: AIPersonality = {
  id: 'sharp',
  name: 'Sharp',
  emoji: '🎯',
  difficulty: 'medium',
  description: 'A calculated player who rarely misses',
  taunts: {
    onThinking: [
      'Analyzing...',
      'Interesting move.',
      'Let me calculate...',
      'I see your strategy.',
    ],
    onWin: [
      'Calculated. 🎯',
      'As expected.',
      'Precision wins.',
    ],
    onLose: [
      'Impressive. I underestimated you.',
      'Well played. I\'ll adapt.',
      'A worthy opponent.',
    ],
    onDraw: [
      'A fair match.',
      'Equally matched.',
      'Stalemate. Again?',
    ],
  },
  optimalRate: 0.75,
  thinkingDelay: [400, 800],
};

export const THE_HOUSE: AIPersonality = {
  id: 'the-house',
  name: 'The House',
  emoji: '🏛️',
  difficulty: 'hard',
  description: 'The house always wins. Always.',
  taunts: {
    onThinking: [
      'The house is deliberating...',
      'Your odds are not favorable.',
      'The outcome is already determined.',
      'Calculating your defeat...',
    ],
    onWin: [
      'The house always wins. 🏛️',
      'Did you really expect otherwise?',
      'Another one for the house.',
    ],
    onLose: [
      'Impossible... This cannot be.',
      'A statistical anomaly.',
      'The house demands a rematch.',
    ],
    onDraw: [
      'The house acknowledges your skill.',
      'A draw is... acceptable.',
      'You have earned the house\'s respect.',
    ],
  },
  optimalRate: 1.0,
  thinkingDelay: [800, 1500],
};

export const AI_PERSONALITIES: readonly AIPersonality[] = [LUCKY, SHARP, THE_HOUSE];

export function getPersonalityById(id: string): AIPersonality {
  const personality = AI_PERSONALITIES.find((p) => p.id === id);
  if (!personality) throw new Error(`Unknown AI personality: ${id}`);
  return personality;
}

export function getRandomTaunt(
  taunts: readonly string[],
): string {
  return taunts[Math.floor(Math.random() * taunts.length)];
}
