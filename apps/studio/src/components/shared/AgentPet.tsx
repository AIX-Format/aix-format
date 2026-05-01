import React from 'react';
import { 
  CircleUser, 
  Zap, 
  Search, 
  Layers, 
  Lightbulb, 
  Workflow, 
  Trophy, 
  HeartHandshake, 
  ShieldAlert, 
  PenTool, 
  Database, 
  Eye 
} from 'lucide-react';
import { PetConfig } from '@/lib/types';

interface AgentPetProps {
  pet?: PetConfig;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const PET_MAP = {
  fox: { icon: Search, label: 'Research', color: '#FF6B35' },
  octopus: { icon: Layers, label: 'Multi-task', color: '#6366F1' },
  owl: { icon: Lightbulb, label: 'Advisor', color: '#FCD34D' },
  bee: { icon: Workflow, label: 'Automation', color: '#F59E0B' },
  lion: { icon: Trophy, label: 'Sales', color: '#EF4444' },
  dolphin: { icon: HeartHandshake, label: 'Support', color: '#10B981' },
  wolf: { icon: ShieldAlert, label: 'Security', color: '#71717A' },
  butterfly: { icon: PenTool, label: 'Content', color: '#EC4899' },
  elephant: { icon: Database, label: 'Memory', color: '#3B82F6' },
  eagle: { icon: Eye, label: 'Monitor', color: '#8B5CF6' },
};

const SIZE_MAP = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
};

export const AgentPet: React.FC<AgentPetProps> = ({ pet, className = '', size = 'md' }) => {
  if (!pet) {
    return <CircleUser className={`${SIZE_MAP[size]} text-zinc-600 ${className}`} />;
  }

  // Dead Hand Override: If agent is flagged or dead-handed, transform into Red Wolf
  const isAngry = pet.mood === 'alert';
  const effectiveType = isAngry ? 'wolf' : pet.type;
  const petInfo = PET_MAP[effectiveType] || PET_MAP.fox;
  const Icon = petInfo.icon;
  const effectiveColor = isAngry ? '#EF4444' : (pet.color || petInfo.color);

  // Animation classes based on mood
  const moodClasses = {
    busy: 'opacity-50 grayscale-[0.5] scale-95', // "Tired" look
    alert: 'animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.5)]', // "Angry/Dead Hand"
    creative: 'animate-bounce',
    happy: 'hover:scale-110 transition-transform',
    energized: 'animate-[spin_10s_linear_infinite] shadow-[0_0_40px_rgba(255,255,255,0.2)]',
    sleep: 'opacity-30 blur-[1px] scale-90'
  };

  const currentMoodClass = moodClasses[pet.mood as keyof typeof moodClasses] || '';

  return (
    <div className={`relative flex items-center justify-center ${className} ${currentMoodClass}`}>
      {/* Sleep ZZZ Indicator */}
      {pet.mood === 'sleep' && (
        <div className="absolute -top-6 -left-2 text-xl font-black text-indigo-400/50 animate-bounce select-none">
          ZZZ...
        </div>
      )}
      {/* Visual representation of the Pet */}
      <div 
        className={`rounded-full flex items-center justify-center bg-zinc-900 border-2 transition-all duration-700 shadow-[0_0_20px_rgba(0,0,0,0.5)]`}
        style={{ 
          borderColor: effectiveColor,
          backgroundColor: `${effectiveColor}15`,
          width: size === 'xl' ? '120px' : size === 'lg' ? '80px' : size === 'md' ? '48px' : '32px',
          height: size === 'xl' ? '120px' : size === 'lg' ? '80px' : size === 'md' ? '48px' : '32px'
        }}
      >
        <Icon 
          className={`${SIZE_MAP[size]} transition-all duration-700`} 
          style={{ color: effectiveColor }}
        />
        
        {/* Accessories Layer */}
        {pet.accessories?.map((acc, idx) => (
          <div key={idx} className="absolute -top-1 -left-1">
             <Zap className="w-4 h-4 text-yellow-400 drop-shadow-lg" />
          </div>
        ))}

        {/* Mood Indicator */}
        <div 
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-950 shadow-xl transition-all duration-500"
          style={{ 
            backgroundColor: isAngry ? '#EF4444' : pet.mood === 'busy' ? '#F59E0B' : '#10B981',
            transform: pet.mood === 'busy' ? 'scale(0.8)' : 'scale(1)'
          }}
          title={`Mood: ${pet.mood}`}
        />
      </div>

      {/* Level Badge for LG/XL */}
      {(size === 'lg' || size === 'xl') && (
        <div className="absolute -top-4 -right-4 px-3 py-1 bg-zinc-950 border border-white/10 rounded-full shadow-2xl">
          <span className="text-[10px] font-black text-white uppercase tracking-widest">LVL {pet.level}</span>
        </div>
      )}
    </div>
  );
};

