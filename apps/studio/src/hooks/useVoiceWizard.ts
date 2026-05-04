import { useState, useCallback } from 'react';
import { useVoiceRecording } from './useVoiceRecording';
import { useVoicePlayback } from './useVoicePlayback';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useVoiceWizard() {
  const { isListening, startListening, stopListening, error: recordingError } = useVoiceRecording();
  const { isSpeaking, playAudio, stopAudio } = useVoicePlayback();

  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // We use `any` here as it's passed around as `any` in VoiceWizard.tsx
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [manifest, setManifest] = useState<any>(null);

  const processAudio = async (audioBlob: Blob) => {
      // In a real application, you would send the audioBlob to an API
      // For this refactoring, we mock the processing to maintain the interface
      setTimeout(() => {
          setIsProcessing(false);
          setMessages(prev => [...prev, { role: 'user', content: 'Mock user voice input' }]);

          setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Here is your generated agent manifest.' }]);
            setManifest({
              meta: { name: 'New Sovereign Agent' },
              version: '1.0.0'
            });
            playAudio('mock-audio-url');
          }, 1000);
      }, 1000);
  };

  const handleVoiceTurn = useCallback(async () => {
    if (isListening) {
      const audioBlob = await stopListening();
      if (audioBlob) {
        setIsProcessing(true);
        await processAudio(audioBlob);
      }
    } else {
      stopAudio();
      startListening();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListening, startListening, stopListening, stopAudio]);

  return {
    handleVoiceTurn,
    isListening,
    isSpeaking,
    isProcessing,
    manifest,
    messages,
    error: recordingError
  };
}
