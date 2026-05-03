import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Header } from './components/Header.js';
import { PetRow } from './components/PetRow.js';
import { BusLog } from './components/BusLog.js';
import { MetaStatus } from './components/MetaStatus.js';
import { InputBar } from './components/InputBar.js';
import { usePetLoop } from './hooks/usePetLoop.js';
import { useBusEvents } from './hooks/useBusEvents.js';

export function AIXApp() {
  const { quit } = useApp();
  const [screen, setScreen] = useState<'dashboard' | 'pets' | 'meta'>('dashboard');
  const { pets, feedPet, triggerMeta } = usePetLoop();
  const { events } = useBusEvents();

  useInput((input, key) => {
    if (input === 'q') quit();
    if (input === '1') setScreen('dashboard');
    if (input === '2') setScreen('pets');
    if (input === '3') setScreen('meta');
    if (input === 'f') feedPet('volt');
    if (input === 'm') triggerMeta();
  });

  return (
    <Box flexDirection="column" width="100%">
      <Header />

      {/* Nav tabs */}
      <Box marginBottom={1}>
        {(['dashboard', 'pets', 'meta'] as const).map((s) => (
          <Box key={s} marginRight={2}>
            <Text
              bold={screen === s}
              color={screen === s ? 'cyan' : 'gray'}
            >
              {screen === s ? '▶ ' : '  '}
              {s === 'dashboard' ? '[1] Dashboard' : s === 'pets' ? '[2] Pets' : '[3] Meta'}
            </Text>
          </Box>
        ))}
        <Text color="gray" dimColor>  [q] Quit  [f] Feed Volt  [m] Trigger Meta</Text>
      </Box>

      <Box flexDirection="row" width="100%">
        {/* Left: Pets */}
        <Box flexDirection="column" width="50%" marginRight={1}>
          <Box borderStyle="round" borderColor="cyan" flexDirection="column" paddingX={1}>
            <Text color="cyan" bold>🐾 Pet Swarm</Text>
            {pets.map(p => <PetRow key={p.id} pet={p} />)}
          </Box>
        </Box>

        {/* Right: Bus + Meta */}
        <Box flexDirection="column" width="50%">
          <MetaStatus />
          <BusLog events={events} />
        </Box>
      </Box>

      <InputBar />
    </Box>
  );
}
