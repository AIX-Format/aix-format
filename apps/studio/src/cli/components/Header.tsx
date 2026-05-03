import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const FRAMES = ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷'];

const BANNER = [
  ' █████╗ ██╗██╗  ██╗',
  '██╔══██╗██║╚██╗██╔╝',
  '███████║██║ ╚███╔╝ ',
  '██╔══██║██║ ██╔██╗ ',
  '██║  ██║██║██╔╝ ██╗',
  '╚═╝  ╚═╝╚═╝╚═╝  ╚═╝',
];

const COLORS = ['cyan','blue','magenta','cyan','blue','magenta'];

export function Header() {
  const [frame, setFrame] = useState(0);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    const t1 = setInterval(() => setFrame(f => (f + 1) % FRAMES.length), 80);
    const t2 = setInterval(() => setPulse(p => !p), 600);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      {BANNER.map((line, i) => (
        <Text key={i} color={COLORS[i] as any} bold>{line}</Text>
      ))}
      <Box marginTop={1}>
        <Text color="green">{FRAMES[frame]} </Text>
        <Text color={pulse ? 'white' : 'gray'} bold>
          AIX STUDIO  
        </Text>
        <Text color="gray" dimColor>
          v1.0 • Meta Engine Active • {new Date().toLocaleTimeString()}
        </Text>
      </Box>
    </Box>
  );
}
