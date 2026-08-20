'use client';

import React, { useState } from 'react';
import { Award, Star, Flame, Sparkles, Check, Lock, ShieldCheck, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Badge, StudentProfile } from '@/lib/types';
import { getStoredBadges, saveProfile } from '@/lib/storage';
import { soundFx, speakText } from '@/lib/sound';

interface TrophyRoomProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  voiceEnabled: boolean;
}

export const TrophyRoom: React.FC<TrophyRoomProps> = ({ profile, setProfile, voiceEnabled }) => {
  const [badges, setBadges] = useState<Badge[]>(() => getStoredBadges());

  const companions = [
    { id: 'bunny', name: 'Barnaby Bunny', emoji: '🐰', desc: 'Curious & energetic math explorer' },
    { id: 'dragon', name: 'Sparky Dragon', emoji: '🐲', desc: 'Friendly reader with a fiery imagination' },
    { id: 'owl', name: 'Starlight Owl', emoji: '🦉', desc: 'Wise phonics guide and book lover' },
    { id: 'puppy', name: 'Sunny Pup', emoji: '🐶', desc: 'Playful and always cheering you on' },
  ];

  const accessories = [
    { id: 'star_badge', name: 'First Star Pin', icon: '⭐', cost: 0, desc: 'Starter scholar badge' },
    { id: 'rainbow_cape', name: 'Rainbow Cape', icon: '🌈', cost: 10, desc: 'Swishes with magic colors' },
    { id: 'wizard_hat', name: 'Wizard Hat', icon: '🧙', cost: 25, desc: 'For casting math spells' },
    { id: 'golden_crown', name: 'Golden Crown', icon: '👑', cost: 50, desc: 'Royal learning champion' },
    { id: 'explorer_goggles', name: 'Explorer Goggles', icon: '🥽', cost: 75, desc: 'For deep book discoveries' },
  ];

  const handleSelectCompanion = (comp: { id: string; name: string }) => {
    soundFx.playTap();
    const updated = { ...profile, avatarId: comp.id, companionName: comp.name };
    setProfile(updated);
    saveProfile(updated);
    if (voiceEnabled) {
      speakText(`You chose ${comp.name} as your learning companion!`);
    }
  };

  const handleEquipAccessory = (acc: { id: string; cost: number; name: string }) => {
    soundFx.playTap();
    const isUnlocked = profile.unlockedAccessories.includes(acc.id);

    if (!isUnlocked) {
      if (profile.totalStars >= acc.cost) {
        // Unlock accessory
        soundFx.playFanfare();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });

        const updated = {
          ...profile,
          totalStars: profile.totalStars - acc.cost,
          unlockedAccessories: [...profile.unlockedAccessories, acc.id],
          equippedAccessory: acc.id,
        };
        setProfile(updated);
        saveProfile(updated);

        if (voiceEnabled) {
          speakText(`Hooray! You unlocked the ${acc.name}!`);
        }
      } else {
        soundFx.playTryAgain();
        if (voiceEnabled) {
          speakText(`You need ${acc.cost - profile.totalStars} more stars to unlock this! Keep learning!`);
        }
      }
    } else {
      // Toggle or equip
      const updated = {
        ...profile,
        equippedAccessory: profile.equippedAccessory === acc.id ? undefined : acc.id,
      };
      setProfile(updated);
      saveProfile(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Star Vault Banner */}
      <div className="bg-gradient-to-r from-[#ffeaa7] via-[#fdcb6e] to-[#ff7675] rounded-[32px] p-6 sm:p-8 text-[#1e272e] shadow-md border-2 border-[#fdcb6e] border-b-6 border-b-[#e17055] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-18 h-18 rounded-[24px] bg-white border-2 border-[#fdcb6e] flex items-center justify-center text-4xl shadow-xs animate-bounce select-none">
            ⭐
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2d3436]">Raena&apos;s Star Vault</h2>
            <p className="text-[#2d3436]/90 text-sm font-black mt-1">
              {profile.totalStars} Stars &bull; {profile.totalXp} XP &bull; {profile.currentStreak} Day Learning Streak
            </p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md px-6 py-3.5 rounded-[24px] border-2 border-white shadow-xs text-center">
          <div className="text-xs uppercase font-black tracking-wider text-[#e17055]">Daily Study Time</div>
          <div className="text-xl font-black text-[#2d3436]">{profile.minutesLearnedToday} / {profile.dailyGoalMinutes} Minutes</div>
        </div>
      </div>

      {/* Companion Dressing Room & Avatar Selection */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-[#a29bfe]/40 border-b-6 border-b-[#6c5ce7] shadow-sm space-y-6">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-[#6c5ce7]" />
          <h3 className="text-lg sm:text-xl font-black text-[#2d3436]">Customize Raena&apos;s Learning Buddy</h3>
        </div>

        {/* Choose Buddy */}
        <div>
          <span className="text-xs font-black uppercase text-[#636e72] tracking-wider mb-3 block">
            Choose Your Buddy:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {companions.map((comp) => {
              const isSelected = profile.avatarId === comp.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => handleSelectCompanion(comp)}
                  className={`p-4 sm:p-5 rounded-[24px] border-2 border-b-4 text-center transition-all active:border-b-2 active:translate-y-0.5 ${
                    isSelected
                      ? 'bg-[#a29bfe]/25 border-[#6c5ce7] shadow-xs ring-2 ring-[#a29bfe]/40'
                      : 'bg-[#faf8f5] border-slate-200 hover:bg-[#a29bfe]/15 hover:border-[#a29bfe]'
                  }`}
                >
                  <div className="text-5xl mb-2 animate-float-slow select-none">{comp.emoji}</div>
                  <div className="font-black text-sm text-[#2d3436]">{comp.name}</div>
                  <p className="text-[11px] text-[#636e72] font-bold mt-1 leading-tight">{comp.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wardrobe / Star Accessory Shop */}
        <div>
          <span className="text-xs font-black uppercase text-[#636e72] tracking-wider mb-3 block">
            Star Rewards Wardrobe (Unlock with Stars ⭐):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {accessories.map((acc) => {
              const isUnlocked = profile.unlockedAccessories.includes(acc.id);
              const isEquipped = profile.equippedAccessory === acc.id;

              return (
                <button
                  key={acc.id}
                  onClick={() => handleEquipAccessory(acc)}
                  className={`p-4 rounded-[22px] border-2 border-b-4 text-center transition-all relative active:border-b-2 active:translate-y-0.5 ${
                    isEquipped
                      ? 'bg-[#ffeaa7]/50 border-[#fdcb6e] ring-2 ring-[#ffeaa7]'
                      : isUnlocked
                      ? 'bg-[#faf8f5] border-slate-300 hover:bg-[#ffeaa7]/20'
                      : 'bg-slate-100 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="text-3xl mb-1.5 animate-float-slow select-none">{acc.icon}</div>
                  <div className="font-black text-xs text-[#2d3436]">{acc.name}</div>

                  <div className="mt-2.5 text-[11px] font-black">
                    {isEquipped ? (
                      <span className="text-[#d63031] bg-[#ffeaa7] border border-[#fdcb6e] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Check className="w-3 h-3" /> Wearing
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[#00b894] bg-[#55efc4]/30 border border-[#00b894] px-2.5 py-0.5 rounded-full">
                        Equip
                      </span>
                    ) : (
                      <span className="text-[#d63031] bg-[#ffeaa7]/60 border border-[#fdcb6e] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Lock className="w-3 h-3" /> {acc.cost} ⭐
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Badges & Achievements Gallery */}
      <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-[#fdcb6e]/50 border-b-6 border-b-[#e17055] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#fdcb6e]" />
            <h3 className="text-lg font-black text-[#2d3436]">Raena&apos;s Milestone Badges</h3>
          </div>
          <span className="text-xs font-black text-[#636e72] bg-[#faf8f5] px-3 py-1 rounded-full border border-slate-200">
            {badges.filter((b) => b.unlockedAt).length} of {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            return (
              <div
                key={badge.id}
                className={`p-4.5 rounded-[22px] border-2 border-b-4 flex items-start gap-3.5 transition-all ${
                  isUnlocked
                    ? 'bg-gradient-to-b from-[#ffeaa7]/30 to-white border-[#fdcb6e] shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="text-3xl p-2.5 rounded-2xl bg-white border-2 border-slate-200 shadow-2xs shrink-0 select-none animate-float-slow">
                  {badge.icon}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-[#2d3436] flex items-center gap-1">
                    {badge.title}
                    {isUnlocked && <span className="text-[#00b894] text-xs font-black">✓</span>}
                  </h4>
                  <p className="text-xs text-[#636e72] font-bold mt-0.5 leading-snug">{badge.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
