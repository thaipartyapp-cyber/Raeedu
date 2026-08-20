'use client';

import React, { useState } from 'react';
import { Volume2, Sparkles, MessageCircle } from 'lucide-react';
import { StudentProfile } from '@/lib/types';
import { speakText } from '@/lib/sound';

interface CompanionWidgetProps {
  profile: StudentProfile;
  message?: string;
  voiceEnabled: boolean;
}

export const CompanionWidget: React.FC<CompanionWidgetProps> = ({
  profile,
  message = "Hi Raena! I'm so excited to learn with you today! Pick an adventure below to earn stars! ⭐",
  voiceEnabled,
}) => {
  const [isSpeakingState, setIsSpeakingState] = useState(false);

  const getCompanionEmoji = (avatarId: string) => {
    switch (avatarId) {
      case 'bunny':
        return '🐰';
      case 'dragon':
        return '🐲';
      case 'owl':
        return '🦉';
      case 'puppy':
        return '🐶';
      default:
        return '🐰';
    }
  };

  const getAccessoryBadge = (acc?: string) => {
    switch (acc) {
      case 'star_badge':
        return '⭐';
      case 'rainbow_cape':
        return '🌈';
      case 'wizard_hat':
        return '🧙';
      case 'golden_crown':
        return '👑';
      case 'explorer_goggles':
        return '🥽';
      default:
        return null;
    }
  };

  const handleSpeak = () => {
    setIsSpeakingState(true);
    speakText(message, () => {
      setIsSpeakingState(false);
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#ffeaa7]/50 via-[#fab1a0]/30 to-[#fd79a8]/25 border-2 border-[#fab1a0] rounded-[28px] p-4 sm:p-5 shadow-xs relative overflow-hidden">
      <div className="flex items-start sm:items-center gap-4">
        {/* Companion Avatar Box */}
        <div className="relative shrink-0">
          <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border-3 border-[#fdcb6e] shadow-md flex items-center justify-center text-4xl sm:text-5xl select-none hover:rotate-3 transition-transform animate-float-slow">
            {getCompanionEmoji(profile.avatarId)}
          </div>
          {profile.equippedAccessory && (
            <div className="absolute -top-2.5 -right-2.5 bg-[#fdcb6e] text-[#2d3436] w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm border-2 border-white animate-bounce">
              {getAccessoryBadge(profile.equippedAccessory)}
            </div>
          )}
        </div>

        {/* Speech Bubble */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-[#d63031] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#e17055]" />
              {profile.companionName} (AI Learning Buddy)
            </span>
          </div>

          <p className="text-sm sm:text-base font-bold text-[#2d3436] leading-snug">
            {message}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black transition-all shadow-2xs border-2 active:translate-y-0.5 ${
                isSpeakingState
                  ? 'bg-[#fdcb6e] text-[#2d3436] border-[#e17055] ring-2 ring-[#ffeaa7]'
                  : 'bg-white text-[#2d3436] hover:bg-[#ffeaa7] border-[#fdcb6e]'
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${isSpeakingState ? 'animate-bounce text-[#d63031]' : 'text-[#e17055]'}`} />
              {isSpeakingState ? 'Speaking...' : 'Read to me'}
            </button>

            <span className="text-xs text-[#636e72] font-bold hidden sm:inline">
              🌟 You have unlocked {profile.totalStars} stars! Keep shining!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
