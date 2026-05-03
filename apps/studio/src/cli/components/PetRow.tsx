import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

export interface Pet {
  id: string;
  name: string;
  emoji: string;
  mood: 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'dying';
  level: number;
  xp: number;
  maxXp: number;
  energy: number;
  skill: string;
}

const MOOD_COLOR: Record<Pet['mood'], string> = {
  ecstatic: 'green',
  happy:    'cyan',
  neutral:  'yellow',
  sad:      'red',
  dying:    'redBright',
};

const MOOD_ICON: Record<Pet['mood'], string> = {
  ecstatic: '✦ ECSTATIC',
  happy:    '◉ HAPPY   ',
  neutral:  '○ NEUTRAL ',
  sad:      '◌ SAD     ',
  dying:    '✗ DYING   ',
};

function xpBar(xp: number, max: number, width = 12): string {
  const filled = Math.round((xp / max) * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

export function PetRow({ pet }: { pet: Pet }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (pet.mood === 'ecstatic') {
      const t = setInterval(() => setBlink(b => !b), 400);
      return () => clearInterval(t);
    }
  }, [pet.mood]);

  const moodColor = MOOD_COLOR[pet.mood];
  const nameColor = pet.mood === 'ecstatic' && blink ? 'white' : moodColor;

  return (
    <Box marginY={0} flexDirection="row">
      <Text color={moodColor as any}>{pet.emoji} </Text>
      <Text color={nameColor as any} bold>{pet.name.padEnd(7)}</Text>
      <Text color="gray"> │ </Text>
      <Text color={moodColor as any}>{MOOD_ICON[pet.mood]}</Text>
      <Text color="gray"> │ </Text>
      <Text color="yellow">Lv{pet.level} </Text>
      <Text color="blue">[{xpBar(pet.xp, pet.maxXp)}] </Text>
      <Text color="gray" dimColor>{pet.xp}/{pet.maxXp} xp</Text>
    </Box>
  );
}
