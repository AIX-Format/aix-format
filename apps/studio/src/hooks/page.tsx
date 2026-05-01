'use client';

import React from 'react';
import VoiceOrb from '../../components/VoiceOrb';
import { useVoiceWizard } from '../../hooks/useVoiceWizard';

export default function VoiceSetupPage() {
    const { state, transcript, error, toggleRecording } = useVoiceWizard();

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
            <div className="mb-12 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-600 mb-4 tracking-wide">
                    Sovereign Voice Wizard
                </h1>
                <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                    انقر على الكرة للتحدث. صِف وكيلك الذكي وسيقوم النظام ببنائه وتوقيعه تلقائياً بهوية Pi.
                </p>
            </div>

            <VoiceOrb state={state} onClick={toggleRecording} />

            <div className="mt-12 h-24 flex flex-col items-center justify-center">
                {error && <p className="text-red-500 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">{error}</p>}
                {transcript && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md max-w-lg text-center shadow-xl">
                        <p className="text-gray-200 text-lg">"{transcript}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}