'use client';

import React, { useState } from 'react';
import { ShieldCheck, Printer, RefreshCw, Sparkles, FileText, CheckCircle2, TrendingUp, Sliders, Calendar } from 'lucide-react';
import { StudentProfile, LearningSessionLog } from '@/lib/types';
import { getStoredSessionLogs, saveProfile } from '@/lib/storage';
import { soundFx } from '@/lib/sound';

interface ParentPortalProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
}

export const ParentPortal: React.FC<ParentPortalProps> = ({ profile, setProfile }) => {
  const [logs] = useState<LearningSessionLog[]>(() => getStoredSessionLogs());
  const [insights, setInsights] = useState<{
    overallAssessment: string;
    milestonesAchieved: string[];
    nextFocusAreas: string[];
    twoHourDailyPlan: { timeBlock: string; subject: string; activityDescription: string; pedagogicalGoal: string }[];
    gradeReadinessScore: number;
    encouragingNoteToParents: string;
  } | null>(null);

  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [worksheetData, setWorksheetData] = useState<{
    worksheetTitle: string;
    subtitle: string;
    mathSection: { problemNumber: number; question: string; visualAid: string; blankLine: string }[];
    phonicsSection: { wordWithBlank: string; clue: string; choices: string[] }[];
    sightWordsSection: { word: string; traceGuide: string; sentence: string }[];
    creativeSection: { prompt: string; starterSentence: string };
  } | null>(null);

  const [isLoadingWorksheet, setIsLoadingWorksheet] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'worksheet' | 'curriculum'>('analytics');

  const fetchParentInsights = async () => {
    setIsLoadingInsights(true);
    soundFx.playTap();
    try {
      const res = await fetch('/api/gemini/parent-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: profile,
          sessionLogs: logs,
          mode: 'insights',
        }),
      });
      const data = await res.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
      }
    } catch {
      alert('Could not generate insights right now. Please try again.');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const generatePrintableWorksheet = async () => {
    setIsLoadingWorksheet(true);
    soundFx.playTap();
    try {
      const res = await fetch('/api/gemini/parent-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentProfile: profile,
          sessionLogs: logs,
          mode: 'generate_worksheet',
        }),
      });
      const data = await res.json();
      if (data.success && data.worksheet) {
        setWorksheetData(data.worksheet);
        setActiveTab('worksheet');
      }
    } catch {
      alert('Could not generate worksheet. Please try again.');
    } finally {
      setIsLoadingWorksheet(false);
    }
  };

  const handleLevelChange = (field: 'levelMath' | 'levelPhonics' | 'levelSightWords' | 'levelStorytelling', val: number) => {
    soundFx.playTap();
    const updated = { ...profile, [field]: val };
    setProfile(updated);
    saveProfile(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#2d3436] text-white rounded-[32px] p-6 sm:p-8 shadow-md border-2 border-slate-700 border-b-6 border-b-[#1e272e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#ffeaa7] text-[#2d3436] border-2 border-[#fdcb6e] flex items-center justify-center font-black text-2xl shadow-xs animate-float-slow">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black">Parent & Tutor Diagnostic Portal</h2>
              <span className="bg-[#ffeaa7]/20 text-[#ffeaa7] text-xs font-black px-2.5 py-0.5 rounded-full border border-[#ffeaa7]/40">
                Pedagogical Suite
              </span>
            </div>
            <p className="text-xs text-slate-300 font-bold mt-0.5">
              Curriculum progression, 2-hour daily learning planner & printable offline worksheets for Raena
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchParentInsights}
            disabled={isLoadingInsights}
            className="px-5 py-2.5 rounded-2xl bg-[#ffeaa7] hover:bg-[#fdcb6e] text-[#2d3436] border-2 border-[#fdcb6e] border-b-4 border-b-[#e17055] font-black text-xs flex items-center gap-1.5 transition-all shadow-xs active:border-b-2 active:translate-y-0.5"
          >
            {isLoadingInsights ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#e17055]" />}
            <span>Generate AI Diagnostic</span>
          </button>

          <button
            onClick={generatePrintableWorksheet}
            disabled={isLoadingWorksheet}
            className="px-5 py-2.5 rounded-2xl bg-[#74b9ff] hover:bg-[#0984e3] text-white border-2 border-[#74b9ff] border-b-4 border-b-[#0984e3] font-black text-xs flex items-center gap-1.5 transition-all active:border-b-2 active:translate-y-0.5"
          >
            {isLoadingWorksheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            <span>Printable Worksheet</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2.5 border-b-2 border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all border-2 border-b-4 active:border-b-2 active:translate-y-0.5 ${
            activeTab === 'analytics'
              ? 'bg-[#2d3436] text-white border-[#2d3436] border-b-[#1e272e] shadow-xs'
              : 'bg-white text-[#2d3436] border-slate-200 hover:bg-slate-100'
          }`}
        >
          Diagnostic & 2-Hour Plan
        </button>
        <button
          onClick={() => setActiveTab('worksheet')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all border-2 border-b-4 active:border-b-2 active:translate-y-0.5 ${
            activeTab === 'worksheet'
              ? 'bg-[#2d3436] text-white border-[#2d3436] border-b-[#1e272e] shadow-xs'
              : 'bg-white text-[#2d3436] border-slate-200 hover:bg-slate-100'
          }`}
        >
          Printable Worksheet
        </button>
        <button
          onClick={() => setActiveTab('curriculum')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all border-2 border-b-4 active:border-b-2 active:translate-y-0.5 ${
            activeTab === 'curriculum'
              ? 'bg-[#2d3436] text-white border-[#2d3436] border-b-[#1e272e] shadow-xs'
              : 'bg-white text-[#2d3436] border-slate-200 hover:bg-slate-100'
          }`}
        >
          Curriculum Levels & Logs
        </button>
      </div>

      {/* Tab 1: Diagnostic Insights & 2-Hour Daily Plan */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white p-4.5 rounded-[24px] border-2 border-[#74b9ff]/40 border-b-4 border-b-[#74b9ff] shadow-xs">
              <span className="text-xs font-black text-[#636e72] block">Today&apos;s Progress</span>
              <div className="text-2xl font-black text-[#2d3436] mt-1">
                {profile.minutesLearnedToday} / {profile.dailyGoalMinutes}m
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full mt-2 overflow-hidden border border-slate-200">
                <div
                  className="bg-[#74b9ff] h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (profile.minutesLearnedToday / profile.dailyGoalMinutes) * 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-4.5 rounded-[24px] border-2 border-[#fdcb6e]/50 border-b-4 border-b-[#fdcb6e] shadow-xs">
              <span className="text-xs font-black text-[#636e72] block">Total Stars</span>
              <div className="text-2xl font-black text-[#e17055] mt-1 flex items-center gap-1">
                <span>⭐</span> {profile.totalStars}
              </div>
              <span className="text-[11px] text-[#636e72] font-bold">{profile.totalXp} XP accumulated</span>
            </div>

            <div className="bg-white p-4.5 rounded-[24px] border-2 border-[#ff7675]/40 border-b-4 border-b-[#ff7675] shadow-xs">
              <span className="text-xs font-black text-[#636e72] block">Learning Streak</span>
              <div className="text-2xl font-black text-[#d63031] mt-1 flex items-center gap-1">
                <span>🔥</span> {profile.currentStreak} Days
              </div>
              <span className="text-[11px] text-[#636e72] font-bold">Consistent daily practice</span>
            </div>

            <div className="bg-white p-4.5 rounded-[24px] border-2 border-[#55efc4]/50 border-b-4 border-b-[#00b894] shadow-xs">
              <span className="text-xs font-black text-[#636e72] block">Grade Readiness</span>
              <div className="text-2xl font-black text-[#00b894] mt-1 flex items-center gap-1">
                <span>📈</span> {insights ? `${insights.gradeReadinessScore}%` : '85%'}
              </div>
              <span className="text-[11px] text-[#00b894] font-bold">Foundational Milestones</span>
            </div>
          </div>

          {/* AI Insights Card */}
          {insights ? (
            <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-slate-200 border-b-6 border-b-slate-300 shadow-sm space-y-6 animate-fade-in">
              <div>
                <span className="text-xs font-black uppercase text-[#e17055] tracking-wider block mb-1">
                  Developmental Assessment
                </span>
                <p className="text-base font-black text-[#2d3436] leading-relaxed">
                  {insights.overallAssessment}
                </p>
              </div>

              {/* Milestones & Next Focus Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#55efc4]/20 border-2 border-[#00b894] rounded-[24px] p-4.5 shadow-xs">
                  <h4 className="text-sm font-black text-[#1e272e] flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00b894]" />
                    Milestones Raena Has Mastered
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.milestonesAchieved.map((m, idx) => (
                      <li key={idx} className="text-xs font-black text-[#2d3436] flex items-start gap-1.5">
                        <span className="text-[#00b894] font-black">&bull;</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#ffeaa7]/40 border-2 border-[#fdcb6e] rounded-[24px] p-4.5 shadow-xs">
                  <h4 className="text-sm font-black text-[#d63031] flex items-center gap-1.5 mb-2">
                    <TrendingUp className="w-5 h-5 text-[#d63031]" />
                    Recommended Focus Areas
                  </h4>
                  <ul className="space-y-1.5">
                    {insights.nextFocusAreas.map((f, idx) => (
                      <li key={idx} className="text-xs font-black text-[#2d3436] flex items-start gap-1.5">
                        <span className="text-[#e17055] font-black">&bull;</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 2-Hour Daily Structured Routine Plan */}
              <div>
                <h4 className="text-sm font-black text-[#2d3436] flex items-center gap-1.5 mb-3">
                  <Calendar className="w-5 h-5 text-[#74b9ff]" />
                  Recommended 2-Hour Daily Learning Structure
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {insights.twoHourDailyPlan.map((block, idx) => (
                    <div key={idx} className="bg-[#faf8f5] border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-[22px] p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <span className="text-[11px] font-black text-[#0984e3] uppercase tracking-wider block">
                          Block {idx + 1} &bull; {block.timeBlock}
                        </span>
                        <h5 className="font-black text-xs text-[#2d3436] mt-1 mb-1">{block.subject}</h5>
                        <p className="text-xs text-[#636e72] font-bold leading-snug">{block.activityDescription}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200 text-[11px] font-black text-[#2d3436]">
                        🎯 Goal: {block.pedagogicalGoal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#faf8f5] border-2 border-slate-200 rounded-[24px] p-4.5 text-xs font-bold text-[#2d3436]">
                💬 <strong className="text-[#2d3436] font-black">Note for Parents:</strong> {insights.encouragingNoteToParents}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-8 sm:p-10 border-2 border-slate-200 border-b-6 border-b-slate-300 text-center space-y-3 shadow-xs">
              <div className="text-5xl animate-float-slow select-none">📊</div>
              <h3 className="text-lg font-black text-[#2d3436]">Generate Real-Time AI Diagnostic</h3>
              <p className="text-xs text-[#636e72] font-bold max-w-md mx-auto">
                Gemini evaluates Raena&apos;s active learning logs across Math, Phonics, Sight Words, and Storytelling to generate targeted insights and a 2-hour daily schedule.
              </p>
              <button
                onClick={fetchParentInsights}
                disabled={isLoadingInsights}
                className="px-7 py-3 rounded-2xl bg-[#2d3436] hover:bg-[#1e272e] text-white border-2 border-[#2d3436] border-b-4 border-b-[#1e272e] font-black text-xs shadow-xs transition-all inline-flex items-center gap-2 active:border-b-2 active:translate-y-0.5"
              >
                {isLoadingInsights ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#ffeaa7]" />}
                <span>Generate Diagnostic Report</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Printable Custom Worksheet */}
      {activeTab === 'worksheet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#2d3436]">
              Offline Pencil & Paper Practice Sheet
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={generatePrintableWorksheet}
                disabled={isLoadingWorksheet}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-200 text-[#2d3436] text-xs font-black flex items-center gap-1.5 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWorksheet ? 'animate-spin' : ''}`} />
                <span>New Worksheet</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-[#74b9ff] hover:bg-[#0984e3] text-white border-2 border-[#74b9ff] border-b-4 border-b-[#0984e3] text-xs font-black flex items-center gap-1.5 shadow-xs active:border-b-2 active:translate-y-0.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Page</span>
              </button>
            </div>
          </div>

          {worksheetData ? (
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border-3 border-slate-300 shadow-sm print:border-none print:shadow-none print:p-0 space-y-6">
              {/* Worksheet Header */}
              <div className="border-b-3 border-slate-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900">{worksheetData.worksheetTitle}</h2>
                  <p className="text-xs text-slate-600 font-bold">{worksheetData.subtitle}</p>
                </div>
                <div className="text-right text-xs font-bold text-slate-700 space-y-1">
                  <div>Name: <span className="underline decoration-dotted font-black text-sm">Raena</span></div>
                  <div>Date: ____________________</div>
                </div>
              </div>

              {/* Section A: Math */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">
                  SECTION A: Visual Math Fun (Count & Solve)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {worksheetData.mathSection.map((item) => (
                    <div key={item.problemNumber} className="border-2 border-slate-300 rounded-2xl p-3.5 text-center">
                      <div className="text-2xl mb-1">{item.visualAid}</div>
                      <p className="text-xs font-black text-slate-800 mb-2">{item.question}</p>
                      <div className="text-xs font-black text-slate-500">Answer: [ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ]</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Phonics */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">
                  SECTION B: Phonics Sound Detective (Fill in the Missing Letter)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {worksheetData.phonicsSection.map((item, idx) => (
                    <div key={idx} className="border-2 border-slate-300 rounded-2xl p-3.5">
                      <div className="text-xl font-black tracking-widest text-slate-900 text-center mb-1">
                        {item.wordWithBlank}
                      </div>
                      <p className="text-[11px] text-slate-600 font-bold mb-1.5">{item.clue}</p>
                      <div className="text-[11px] font-black text-slate-700">
                        Choices: {item.choices.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section C: Sight Words */}
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-2 border-b-2 border-slate-200 pb-1">
                  SECTION C: Sight Word Rainbow Tracing
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {worksheetData.sightWordsSection.map((sw, idx) => (
                    <div key={idx} className="border-2 border-slate-300 rounded-2xl p-3.5 flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black tracking-widest text-slate-800">{sw.word}</div>
                        <p className="text-xs text-slate-500 font-bold">&ldquo;{sw.sentence}&rdquo;</p>
                      </div>
                      <div className="border-2 border-dashed border-slate-400 px-3.5 py-2 rounded-xl text-xs font-black text-slate-400">
                        Trace 3x ✏️
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section D: Creative Sentence & Drawing */}
              <div className="border-2 border-slate-300 rounded-2xl p-4.5">
                <h4 className="text-xs font-black text-slate-900 mb-1">
                  SECTION D: Story Drawing & Creative Sentence
                </h4>
                <p className="text-xs text-slate-600 font-bold mb-3">{worksheetData.creativeSection.prompt}</p>
                <div className="h-32 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-xs text-slate-400 font-black mb-3">
                  Draw your story scene here! 🎨
                </div>
                <div className="text-xs font-black text-slate-800">
                  Sentence starter: {worksheetData.creativeSection.starterSentence} ______________________________________
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-[32px] border-2 border-slate-200 text-center space-y-3 shadow-xs">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <h4 className="font-black text-sm text-[#2d3436]">No Worksheet Generated Yet</h4>
              <p className="text-xs text-[#636e72] font-bold max-w-sm mx-auto">
                Generate a tailored printable worksheet with tracing, visual counting, and phonics matching for offline practice.
              </p>
              <button
                onClick={generatePrintableWorksheet}
                disabled={isLoadingWorksheet}
                className="px-6 py-2.5 rounded-2xl bg-[#2d3436] text-white border-2 border-[#2d3436] border-b-4 border-b-[#1e272e] font-black text-xs shadow-xs active:border-b-2 active:translate-y-0.5"
              >
                {isLoadingWorksheet ? 'Creating Worksheet...' : 'Generate Printable Worksheet'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Curriculum Levels & Session Logs */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          {/* Level Adjusters */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-slate-200 border-b-6 border-b-slate-300 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#2d3436]" />
              <h3 className="text-base font-black text-[#2d3436]">Adjust Curriculum Starting Levels</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'levelMath' as const, label: 'Math Quest Level', current: profile.levelMath || 1 },
                { key: 'levelPhonics' as const, label: 'Phonics Level', current: profile.levelPhonics || 1 },
                { key: 'levelSightWords' as const, label: 'Sight Words Level', current: profile.levelSightWords || 1 },
                { key: 'levelStorytelling' as const, label: 'Story Studio Level', current: profile.levelStorytelling || 1 },
              ].map((item) => (
                <div key={item.key} className="bg-[#faf8f5] border-2 border-slate-200 border-b-4 border-b-slate-300 rounded-[24px] p-4.5 text-center shadow-2xs">
                  <span className="text-xs font-black text-[#636e72] block mb-2">{item.label}</span>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleLevelChange(item.key, Math.max(1, item.current - 1))}
                      className="w-9 h-9 rounded-xl bg-white border-2 border-slate-300 border-b-4 font-black text-[#2d3436] hover:bg-slate-100 active:border-b-2 active:translate-y-0.5"
                    >
                      -
                    </button>
                    <span className="text-lg font-black text-[#2d3436]">Level {item.current}</span>
                    <button
                      onClick={() => handleLevelChange(item.key, Math.min(5, item.current + 1))}
                      className="w-9 h-9 rounded-xl bg-white border-2 border-slate-300 border-b-4 font-black text-[#2d3436] hover:bg-slate-100 active:border-b-2 active:translate-y-0.5"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session Logs Table */}
          <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-slate-200 border-b-6 border-b-slate-300 shadow-sm space-y-3">
            <h3 className="text-base font-black text-[#2d3436]">Recent Session Learning Logs</h3>
            {logs.length === 0 ? (
              <p className="text-xs text-[#636e72] font-bold py-4 text-center">No learning logs recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[#636e72] font-black">
                      <th className="py-2.5">Time</th>
                      <th className="py-2.5">Subject</th>
                      <th className="py-2.5">Accuracy</th>
                      <th className="py-2.5">Stars</th>
                      <th className="py-2.5">Mastered Concepts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-[#2d3436]">
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-2.5 text-[#636e72]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2.5 font-black capitalize text-[#2d3436]">{log.subject}</td>
                        <td className="py-2.5 text-[#00b894] font-black">{log.problemsCorrect}/{log.problemsAttempted}</td>
                        <td className="py-2.5 font-black text-[#e17055]">+{log.starsEarned} ⭐</td>
                        <td className="py-2.5 text-[#636e72] truncate max-w-xs">{log.masteredConcepts.join(', ') || 'Practice drill'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
