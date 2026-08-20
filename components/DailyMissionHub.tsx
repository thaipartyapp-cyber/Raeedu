'use client';

import React, { useState } from 'react';
import { Sparkles, Calculator, BookOpen, Heart, Award, ArrowRight, Play, CheckCircle2, Star, Clock, Smile } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile } from '@/lib/types';
import { CompanionWidget } from './CompanionWidget';
import { soundFx, speakText } from '@/lib/sound';

interface DailyMissionHubProps {
  profile: StudentProfile;
  setActiveTab: (tab: 'mission' | 'math' | 'phonics' | 'story' | 'trophy' | 'parent') => void;
  voiceEnabled: boolean;
}

export const DailyMissionHub: React.FC<DailyMissionHubProps> = ({
  profile,
  setActiveTab,
  voiceEnabled,
}) => {
  const [wiggleBreakActive, setWiggleBreakActive] = useState(false);

  const startWiggleBreak = () => {
    soundFx.playFanfare();
    setWiggleBreakActive(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.5 },
    });
    if (voiceEnabled) {
      speakText("Wiggle time! Stand up, stretch your arms high, wiggle your fingers, and take 3 big deep breaths!");
    }
  };

  const missions = [
    {
      id: 'math',
      title: 'Math Quest Adventure',
      desc: 'Count apples, explore ten-frames & add treats with Barnaby Bunny!',
      subject: 'math' as const,
      icon: <Calculator className="w-8 h-8 text-[#0984e3]" />,
      color: 'from-[#74b9ff]/20 via-[#74b9ff]/10 to-[#0984e3]/15 border-[#74b9ff] border-b-6 shadow-md hover:shadow-xl',
      badgeColor: 'bg-[#74b9ff]/30 text-[#0984e3]',
      starsReward: '+3 Stars per problem',
      btnStyle: 'bg-[#0984e3] hover:bg-[#0070c9] text-white border-2 border-[#0984e3] border-b-4 border-b-[#0767b1]',
      tab: 'math' as const,
      emoji: '🧮',
      progressLabel: `Level ${profile.levelMath || 1} &bull; Counting & Addition`,
    },
    {
      id: 'phonics',
      title: 'Phonics & Sight Word Land',
      desc: 'Discover letter sounds, build CVC words like CAT, and learn sight words!',
      subject: 'phonics' as const,
      icon: <BookOpen className="w-8 h-8 text-[#00b894]" />,
      color: 'from-[#55efc4]/25 via-[#55efc4]/15 to-[#00b894]/20 border-[#55efc4] border-b-6 shadow-md hover:shadow-xl',
      badgeColor: 'bg-[#55efc4]/40 text-[#00b894]',
      starsReward: '+3 Stars per word',
      btnStyle: 'bg-[#00b894] hover:bg-[#00a383] text-white border-2 border-[#00b894] border-b-4 border-b-[#008f72]',
      tab: 'phonics' as const,
      emoji: '🔤',
      progressLabel: `Level ${profile.levelPhonics || 1} &bull; Letter Sounds & Dolch Words`,
    },
    {
      id: 'story',
      title: 'Magic Story Studio',
      desc: 'Co-author an illustrated bedtime storybook and watch AI bring your words to life!',
      subject: 'storytelling' as const,
      icon: <Heart className="w-8 h-8 text-[#d63031]" />,
      color: 'from-[#ff7675]/25 via-[#ff7675]/15 to-[#fd79a8]/20 border-[#ff7675] border-b-6 shadow-md hover:shadow-xl',
      badgeColor: 'bg-[#ff7675]/25 text-[#d63031]',
      starsReward: '+5 Stars per chapter',
      btnStyle: 'bg-[#ff7675] hover:bg-[#ee5253] text-white border-2 border-[#ff7675] border-b-4 border-b-[#d63031]',
      tab: 'story' as const,
      emoji: '📖',
      progressLabel: `Level ${profile.levelStorytelling || 1} &bull; Creative Sentence Builder`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Companion Greeting */}
      <CompanionWidget
        profile={profile}
        message={`Good morning, Raena! Ready for today's learning adventure? Let's earn stars in Math, Phonics, and Story Studio! ⭐`}
        voiceEnabled={voiceEnabled}
      />

      {/* Daily 2-Hour Routine Banner */}
      <div className="bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#fab1a0]/50 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#0984e3]" />
              <h3 className="text-base font-black text-[#2d3436]">Raena&apos;s Daily 2-Hour Study Progress</h3>
            </div>
            <p className="text-xs text-[#636e72] font-bold mt-0.5">
              Working daily in joyful, focused blocks with step-by-step guidance
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={startWiggleBreak}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffeaa7] text-[#d63031] hover:bg-[#fdcb6e] text-xs font-black transition-all shadow-xs border-2 border-[#fdcb6e] border-b-4 active:border-b-2 active:translate-y-0.5"
            >
              <Smile className="w-4 h-4 text-[#e17055]" />
              <span>Take a Wiggle Break 🕺</span>
            </button>

            <div className="text-right">
              <span className="text-xs font-black text-[#2d3436]">
                {profile.minutesLearnedToday} / {profile.dailyGoalMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden p-0.5 border-2 border-slate-200 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#74b9ff] via-[#55efc4] to-[#ffeaa7] h-full rounded-full transition-all duration-500 shadow-xs"
            style={{
              width: `${Math.min(100, Math.max(5, (profile.minutesLearnedToday / profile.dailyGoalMinutes) * 100))}%`,
            }}
          />
        </div>

        {/* Wiggle Break Modal / Banner */}
        {wiggleBreakActive && (
          <div className="mt-4 bg-[#ffeaa7]/50 border-2 border-[#fdcb6e] rounded-2xl p-4 flex items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🕺✨</span>
              <div>
                <h4 className="text-sm font-black text-[#d63031]">2-Minute Fun Wiggle Break!</h4>
                <p className="text-xs text-[#2d3436] font-bold">Stand up, stretch your arms to the sky, and do 5 happy jumps!</p>
              </div>
            </div>

            <button
              onClick={() => setWiggleBreakActive(false)}
              className="px-4 py-2 rounded-xl bg-[#ff7675] text-white text-xs font-black hover:bg-[#ee5253] border-b-3 border-[#d63031] active:translate-y-0.5 shadow-xs"
            >
              Back to Learning &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main 3 Mission Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-[#2d3436] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fdcb6e]" />
            Choose Your Learning Mission
          </h3>
          <span className="text-xs font-black text-[#636e72]">Multimodal & Adaptive</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {missions.map((m) => (
            <div
              key={m.id}
              className={`bg-gradient-to-b ${m.color} rounded-[28px] p-5 sm:p-6 border-2 transition-all hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border-2 border-white flex items-center justify-center text-3xl animate-float-slow">
                    {m.emoji}
                  </div>

                  <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border border-current ${m.badgeColor}`}>
                    {m.starsReward}
                  </span>
                </div>

                <h4 className="text-lg font-black text-[#2d3436] mb-1">{m.title}</h4>
                <p className="text-xs sm:text-sm text-[#2d3436]/80 font-bold mb-3 leading-snug">
                  {m.desc}
                </p>

                <div className="text-[11px] font-black text-[#636e72] bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200/80 mb-4">
                  {m.progressLabel}
                </div>
              </div>

              <button
                onClick={() => {
                  soundFx.playTap();
                  setActiveTab(m.tab);
                }}
                className={`w-full py-3 rounded-2xl ${m.btnStyle} font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:translate-y-1 active:border-b-2`}
              >
                <span>Start Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Trophy & Parent Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => {
            soundFx.playTap();
            setActiveTab('trophy');
          }}
          className="bg-white hover:bg-[#a29bfe]/10 p-5 rounded-[28px] border-2 border-[#a29bfe]/40 border-b-4 border-b-[#a29bfe] shadow-xs flex items-center gap-4 text-left transition-all group active:translate-y-0.5"
        >
          <div className="w-13 h-13 rounded-2xl bg-[#a29bfe]/30 text-[#6c5ce7] flex items-center justify-center text-3xl font-bold group-hover:rotate-6 transition-transform shadow-2xs">
            🏆
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-sm text-[#2d3436]">Trophy Room & Companion Wardrobe</h4>
            <p className="text-xs text-[#636e72] font-bold mt-0.5">
              Spend stars on outfits, inspect unlocked badges & customize buddies
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            soundFx.playTap();
            setActiveTab('parent');
          }}
          className="bg-white hover:bg-slate-50 p-5 rounded-[28px] border-2 border-slate-300 border-b-4 border-b-slate-400 shadow-xs flex items-center gap-4 text-left transition-all group active:translate-y-0.5"
        >
          <div className="w-13 h-13 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center text-3xl font-bold group-hover:rotate-6 transition-transform shadow-2xs">
            📊
          </div>
          <div className="min-w-0">
            <h4 className="font-black text-sm text-[#2d3436]">Parent Diagnostic & Printable Worksheets</h4>
            <p className="text-xs text-[#636e72] font-bold mt-0.5">
              Review AI developmental report, 2-hour daily schedule & print worksheets
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
