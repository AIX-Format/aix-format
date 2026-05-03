import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

const PHASES = ['observe','decide','act','reflect'] as const;
type Phase = typeof PHASES[number];

const PHASE_COLOR: Record<Phase, string> = {
  observe: 'blue',
  decide:  'yellow',
  act:     'green',
  reflect: 'magenta',
};

const PHASE_ICON: Record<Phase, string> = {
  observe: '👁  OBSERVE ',
  decide:  '🧠 DECIDE  ',
  act:     '⚡ ACT     ',
  reflect: '🔄 REFLECT ',
};

const SPINNER = ['◐','◓','◑','◒'];

export function MetaStatus() {
  const [phase, setPhase] = useState<Phase>('observe');
  const [frame, setFrame] = useState(0);
  const [iteration, setIteration] = useState(0);
  const [entropy, setEntropy] = useState(0.12);

  useEffect(() => {
    const t1 = setInterval(() => setFrame(f => (f + 1) % SPINNER.length), 120);
    const t2 = setInterval(() => {
      setPhase(p => {
        const idx = PHASES.indexOf(p);
        const next = PHASES[(idx + 1) % PHASES.length];
        if (next === 'observe') setIteration(i => i + 1);
        return next;
      });
      setEntropy(e => Math.min(0.95, Math.max(0.05, e + (Math.random() - 0.5) * 0.03)));
    }, 900);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const color = PHASE_COLOR[phase] as any;

  return (
    <Box borderStyle="round" borderColor={color} flexDirection="column" paddingX={1}>
      <Text color={color} bold>🧬 META ENGINE</Text>
      <Box marginTop={0}>
        <Text color={color}>{SPINNER[frame]} </Text>
        <Text color={color} bold>{PHASE_ICON[phase]}</Text>
        <Text color="gray" dimColor>  iter #{iteration}</Text>
      </Box>
      <Box>
        <Text color="gray">  entropy: </Text>
        <Text color={entropy > 0.7 ? 'red' : entropy > 0.4 ? 'yellow' : 'green'}>
          {(entropy * 100).toFixed(1)}%
        </Text>
        <Text color="gray">  {'█'.repeat(Math.round(entropy * 10))}{'░'.repeat(10 - Math.round(entropy * 10))}</Text>
      </Box>
    </Box>
  );
}
