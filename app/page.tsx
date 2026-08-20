'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DailyMissionHub } from '@/components/DailyMissionHub';
import { MathQuest } from '@/components/MathQuest';
import { PhonicsLab } from '@/components/PhonicsLab';
import { StoryStudio } from '@/components/StoryStudio';
import { TrophyRoom } from '@/components/TrophyRoom';
import { ParentPortal } from '@/components/ParentPortal';
import { StudentProfile } from '@/lib/types';
import { getStoredProfile } from '@/lib/storage';

export default function HomePage() {
  const [profile, setProfile] = useState<StudentProfile>(() => getStoredProfile());
  const [activeTab, setActiveTab] = useState<'mission' | 'math' | 'phonics' | 'story' | 'trophy' | 'parent'>('mission');
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2d3436] flex flex-col selection:bg-[#ffeaa7] selection:text-[#2d3436] relative overflow-x-hidden">
      {/* Playful background ambient glow blobs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#fab1a0]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-10 w-96 h-96 bg-[#74b9ff]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 left-10 w-96 h-96 bg-[#55efc4]/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-[#a29bfe]/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <Navbar
        profile={profile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceEnabled={voiceEnabled}
        setVoiceEnabled={setVoiceEnabled}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'mission' && (
          <DailyMissionHub
            profile={profile}
            setActiveTab={setActiveTab}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === 'math' && (
          <MathQuest
            profile={profile}
            setProfile={setProfile}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === 'phonics' && (
          <PhonicsLab
            profile={profile}
            setProfile={setProfile}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === 'story' && (
          <StoryStudio
            profile={profile}
            setProfile={setProfile}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === 'trophy' && (
          <TrophyRoom
            profile={profile}
            setProfile={setProfile}
            voiceEnabled={voiceEnabled}
          />
        )}

        {activeTab === 'parent' && (
          <ParentPortal
            profile={profile}
            setProfile={setProfile}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-4 text-center text-xs text-slate-500 font-medium print:hidden">
        <p>
          Raena&apos;s Learning Journey &bull; Adaptive Multimodal AI Tutoring Suite for 7-Year-Old Scholars
        </p>
      </footer>
    </div>
  );
}
