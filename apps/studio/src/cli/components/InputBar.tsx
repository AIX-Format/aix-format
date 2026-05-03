import React from 'react';
import { Box, Text } from 'ink';

export function InputBar() {
  return (
    <Box
      borderStyle="single"
      borderColor="gray"
      paddingX={2}
      marginTop={1}
    >
      <Text color="cyan" bold>❯ </Text>
      <Text color="gray" dimColor>
        [1] Dashboard  [2] Pets  [3] Meta  [f] Feed Volt  [m] Trigger Meta  [q] Quit
      </Text>
    </Box>
  );
}
