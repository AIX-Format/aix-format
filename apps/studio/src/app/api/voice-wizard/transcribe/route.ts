import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY 
});

/**
 * AIX Voice Wizard - Transcribe Route
 * Proxies microphone audio to Groq Whisper for high-speed, zero-cost STT.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Missing audio file" }, { status: 400 });
    }
    
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      response_format: 'json',
      // Optional: language: 'en' or 'ar'
    });
    
    return NextResponse.json({ text: transcription.text });
  } catch (error: any) {
    console.error("[Voice STT] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
