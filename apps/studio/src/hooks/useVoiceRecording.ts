import { useState, useRef, useCallback } from 'react';

export function useVoiceRecording() {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startListening = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('تعذر الوصول إلى الميكروفون. يرجى التحقق من الصلاحيات.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (mediaRecorder.current && isListening) {
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          resolve(audioBlob);
        };
        mediaRecorder.current.stop();
        mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      } else {
        resolve(null);
      }
    });
  }, [isListening]);

  return {
    isListening,
    error,
    startListening,
    stopListening
  };
}
