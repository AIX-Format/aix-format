import { useState, useRef, useCallback } from 'react';

export function useVoicePlayback() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback((url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // In a real implementation, we would play the audio from the URL
    // const audio = new Audio(url);
    // audio.onended = () => setIsSpeaking(false);
    // audio.play().catch(console.error);
    // audioRef.current = audio;

    console.log("Playing audio URL:", url);
    setIsSpeaking(true);

    // Mock audio duration for now
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    playAudio,
    stopAudio
  };
}
