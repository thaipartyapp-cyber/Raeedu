'use client';

import React from 'react';
import { Sparkles, Star, Flame, Clock, Award, BookOpen, Calculator, Volume2, VolumeX, ShieldCheck, Heart } from 'lucide-react';
import { StudentProfile } from '@/lib/types';
import { speakText, stopSpeaking } from '@/lib/sound';

interface NavbarProps {
  profile: StudentProfile;
  activeTab: 'mission' | 'math' | 'phonics' | 'story' | 'trophy' | 'parent';
  setActiveTab: (tab: 'mission' | 'math' | 'phonics' | 'story' | 'trophy' | 'parent') => void;
  voiceEnabled: boolean;
  setVoiceEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  voiceEnabled,
  setVoiceEnabled,
}) => {
  const toggleVoice = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next) {
      speakText(`Voice is turned on! Hello Raena!`);
    } else {
      stopSpeaking();
    }
  };

  const navItems: { id: 'mission' | 'math' | 'phonics' | 'story' | 'trophy' | 'parent'; label: string; icon: React.ReactNode; activeClasses: string }[] = [
    { id: 'mission', label: 'Daily Hub', icon: <Sparkles className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#ffeaa7] to-[#fab1a0] text-[#2d3436] border-[#fdcb6e] shadow-sm' },
    { id: 'math', label: 'Math Quest', icon: <Calculator className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#74b9ff] to-[#0984e3] text-white border-[#0984e3] shadow-sm' },
    { id: 'phonics', label: 'Phonics & Words', icon: <BookOpen className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-[#00b894] shadow-sm' },
    { id: 'story', label: 'Story Studio', icon: <Heart className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#ff7675] to-[#fd79a8] text-white border-[#d63031] shadow-sm' },
    { id: 'trophy', label: 'Trophies & Avatar', icon: <Award className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#a29bfe] to-[#6c5ce7] text-white border-[#6c5ce7] shadow-sm' },
    { id: 'parent', label: 'Parent Portal', icon: <ShieldCheck className="w-5 h-5" />, activeClasses: 'bg-gradient-to-r from-[#2d3436] to-[#636e72] text-white border-slate-700 shadow-sm' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#fab1a0]/30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Student Welcome */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('mission')}
              className="flex items-center gap-2.5 text-left group transition-transform hover:scale-105 active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ff7675] via-[#fdcb6e] to-[#fab1a0] border-2 border-white shadow-sm flex items-center justify-center text-white font-bold text-2xl animate-float-slow">
                🌟
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-black text-[#2d3436] tracking-tight">Raena&apos;s Learning Journey</h1>
                  <span className="bg-[#ffeaa7] text-[#d63031] text-xs font-black px-2.5 py-0.5 rounded-full border border-[#fdcb6e]">Age 7</span>
                </div>
                <p className="text-xs text-[#636e72] font-bold">Daily Adaptive AI Scholar & Companion</p>
              </div>
            </button>
          </div>

          {/* Quick Stats Bar (Stars, Streak, Daily 2-hr Timer, Audio Voice Toggle) */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
            {/* Stars Counter */}
            <div className="flex items-center gap-1.5 bg-[#ffeaa7]/50 border-2 border-[#fdcb6e] px-3.5 py-1.5 rounded-full shadow-2xs">
              <Star className="w-4 h-4 text-[#d63031] fill-[#feca57] animate-pulse" />
              <span className="text-sm font-black text-[#d63031]">{profile.totalStars} Stars</span>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-[#fab1a0]/30 border-2 border-[#e17055]/50 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Flame className="w-4 h-4 text-[#e17055] fill-[#ff7675]" />
              <span className="text-sm font-black text-[#d63031]">{profile.currentStreak} Day Streak</span>
            </div>

            {/* Daily Session Timer (e.g. 18 / 120 mins) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#74b9ff]/20 border-2 border-[#74b9ff]/60 px-3.5 py-1.5 rounded-full shadow-2xs">
              <Clock className="w-4 h-4 text-[#0984e3]" />
              <span className="text-sm font-black text-[#0984e3]">
                {profile.minutesLearnedToday} / {profile.dailyGoalMinutes}m Today
              </span>
            </div>

            {/* Audio Voice Narration Toggle */}
            <button
              onClick={toggleVoice}
              title={voiceEnabled ? "Voice narration is ON" : "Voice narration is OFF"}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-2 text-xs font-black transition-all shadow-2xs active:scale-95 ${
                voiceEnabled
                  ? 'bg-[#55efc4]/40 text-[#00b894] border-[#00b894] hover:bg-[#55efc4]/60'
                  : 'bg-slate-100 text-[#636e72] border-slate-300 hover:bg-slate-200'
              }`}
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-[#00b894] animate-bounce" />
                  <span className="hidden md:inline">Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-[#636e72]" />
                  <span className="hidden md:inline">Voice OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (voiceEnabled) {
                    speakText(`Let's go to ${item.label}!`);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all whitespace-nowrap border-2 border-b-4 active:border-b-2 active:translate-y-0.5 ${
                  isActive
                    ? `${item.activeClasses} scale-[1.02]`
                    : `bg-white text-[#636e72] hover:bg-[#faf8f5] hover:text-[#2d3436] border-slate-200 hover:border-slate-300`
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
