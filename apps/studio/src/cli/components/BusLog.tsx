import React from 'react';
import { Box, Text } from 'ink';

export interface BusEvent {
  id: string;
  topic: string;
  payload: string;
  ts: string;
  color: string;
}

const TOPIC_COLOR: Record<string, string> = {
  'pet:mood':    'magenta',
  'pet:xp':     'yellow',
  'meta:phase': 'green',
  'trust:sign': 'yellow',
  'gateway:in': 'cyan',
  'error':      'red',
};

export function BusLog({ events }: { events: BusEvent[] }) {
  const last8 = events.slice(-8);

  return (
    <Box borderStyle="single" borderColor="gray" flexDirection="column" paddingX={1} marginTop={1}>
      <Text color="gray" bold>📡 BUS EVENTS</Text>
      {last8.length === 0 && (
        <Text color="gray" dimColor>  waiting for events...</Text>
      )}
      {last8.map(e => (
        <Box key={e.id}>
          <Text color="gray" dimColor>{e.ts} </Text>
          <Text color={(TOPIC_COLOR[e.topic] ?? 'white') as any} bold>
            {e.topic.padEnd(14)}
          </Text>
          <Text color="gray"> {e.payload.slice(0, 35)}</Text>
        </Box>
      ))}
    </Box>
  );
}
