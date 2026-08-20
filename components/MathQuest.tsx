'use client';

import React, { useState, useCallback } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Volume2, CheckCircle2, Lightbulb, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathProblem, StudentProfile } from '@/lib/types';
import { STARTER_MATH_PROBLEMS } from '@/lib/curriculum';
import { soundFx, speakText } from '@/lib/sound';
import { addStarsAndXp, recordSessionLog, addLearnedMinutes } from '@/lib/storage';

interface MathQuestProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  voiceEnabled: boolean;
}

export const MathQuest: React.FC<MathQuestProps> = ({ profile, setProfile, voiceEnabled }) => {
  const [currentLevel, setCurrentLevel] = useState<number>(profile.levelMath || 1);
  const [problemIndex, setProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>(() => {
    const p = STARTER_MATH_PROBLEMS.find((prob) => prob.level === (profile.levelMath || 1)) || STARTER_MATH_PROBLEMS[0];
    return p;
  });
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [stepByStepVisible, setStepByStepVisible] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<{ gentleEncouragement: string; steps: string[]; interactivePrompt: string } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [activeTabVisual, setActiveTabVisual] = useState<'objects' | 'ten_frame' | 'number_line'>('objects');

  const switchLevel = (lvl: number) => {
    soundFx.playTap();
    setCurrentLevel(lvl);
    const levelProblems = STARTER_MATH_PROBLEMS.filter((p) => p.level === lvl);
    const nextProb = levelProblems[0] || STARTER_MATH_PROBLEMS[0];
    setCurrentProblem(nextProb);
    setProblemIndex(0);
    setSelectedOption(null);
    setFeedbackStatus('idle');
    setStepByStepVisible(false);
    setAiExplanation(null);
    setActiveTabVisual(nextProb.manipulativeType === 'ten_frame' ? 'ten_frame' : 'objects');

    if (voiceEnabled) {
      speakText(`Level ${lvl}! ${nextProb.prompt}`);
    }
  };

  const handleAskAiCoach = useCallback(async (wrongAns?: number) => {
    setIsLoadingAi(true);
    setStepByStepVisible(true);
    try {
      const res = await fetch('/api/gemini/math-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'explain_step_by_step',
          currentProblem,
          wrongAnswerGiven: wrongAns !== undefined ? wrongAns : selectedOption,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setAiExplanation(data.explanation);
        if (voiceEnabled) {
          speakText(`${data.explanation.gentleEncouragement} ${data.explanation.steps.join('. ')}`);
        }
      } else {
        setAiExplanation({
          gentleEncouragement: "You're doing great Raena! Let's count them one by one.",
          steps: currentProblem.stepByStep,
          interactivePrompt: "Count each item carefully and tap the right number!",
        });
      }
    } catch {
      setAiExplanation({
        gentleEncouragement: "You're doing great Raena! Let's count them one by one.",
        steps: currentProblem.stepByStep,
        interactivePrompt: "Count each item carefully and tap the right number!",
      });
    } finally {
      setIsLoadingAi(false);
    }
  }, [currentProblem, selectedOption, voiceEnabled]);

  const handleSelectOption = (num: number) => {
    if (feedbackStatus === 'correct') return;
    soundFx.playTap();
    setSelectedOption(num);

    if (num === currentProblem.correctAnswer) {
      soundFx.playCorrect();
      setFeedbackStatus('correct');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      const updated = addStarsAndXp(3, 20, 'math');
      addLearnedMinutes(2);
      setProfile(updated);

      recordSessionLog({
        subject: 'math',
        durationSeconds: 90,
        problemsAttempted: 1,
        problemsCorrect: 1,
        starsEarned: 3,
        struggledConcepts: [],
        masteredConcepts: [`Level ${currentLevel} ${currentProblem.type}`],
      });

      if (voiceEnabled) {
        speakText(`Super job Raena! ${num} is correct! ${currentProblem.explanation}`);
      }
    } else {
      soundFx.playTryAgain();
      setFeedbackStatus('incorrect');
      if (voiceEnabled) {
        speakText(`Good try Raena! Let's count together to find the answer.`);
      }
      handleAskAiCoach(num);
    }
  };

  const handleNextProblem = async () => {
    soundFx.playTap();
    setSelectedOption(null);
    setFeedbackStatus('idle');
    setStepByStepVisible(false);
    setAiExplanation(null);

    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/math-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: currentLevel,
          mode: 'generate_problem',
        }),
      });
      const data = await res.json();
      if (data.success && data.problem) {
        setCurrentProblem(data.problem);
        setActiveTabVisual(data.problem.manipulativeType === 'ten_frame' ? 'ten_frame' : 'objects');
        if (voiceEnabled) {
          speakText(data.problem.prompt);
        }
      } else {
        const levelProblems = STARTER_MATH_PROBLEMS.filter((p) => p.level === currentLevel);
        const nextIdx = (problemIndex + 1) % (levelProblems.length || 1);
        setProblemIndex(nextIdx);
        const nextP = levelProblems[nextIdx] || STARTER_MATH_PROBLEMS[0];
        setCurrentProblem(nextP);
        setActiveTabVisual(nextP.manipulativeType === 'ten_frame' ? 'ten_frame' : 'objects');
        if (voiceEnabled) {
          speakText(nextP.prompt);
        }
      }
    } catch {
      const levelProblems = STARTER_MATH_PROBLEMS.filter((p) => p.level === currentLevel);
      const nextIdx = (problemIndex + 1) % (levelProblems.length || 1);
      setProblemIndex(nextIdx);
      const nextP = levelProblems[nextIdx] || STARTER_MATH_PROBLEMS[0];
      setCurrentProblem(nextP);
      setActiveTabVisual(nextP.manipulativeType === 'ten_frame' ? 'ten_frame' : 'objects');
    } finally {
      setIsLoadingAi(false);
    }
  };

  const levelLabels = [
    { level: 1, title: 'Level 1: Counting 1-10', icon: '🍎' },
    { level: 2, title: 'Level 2: Adding Up (+)', icon: '➕' },
    { level: 3, title: 'Level 3: Taking Away (-)', icon: '🎈' },
    { level: 4, title: 'Level 4: Ten-Frames (10-20)', icon: '🔟' },
    { level: 5, title: 'Level 5: Groups & Sharing', icon: '🪺' },
  ];

  return (
    <div className="space-y-6">
      {/* Level Selection Bar */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border-2 border-[#74b9ff]/40 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#74b9ff] to-[#0984e3] text-white flex items-center justify-center font-black text-xl shadow-xs animate-float-slow">
              🧮
            </div>
            <div>
              <h2 className="text-base font-black text-[#2d3436]">Math Quest with Barnaby</h2>
              <p className="text-xs text-[#636e72] font-bold">Hands-on visual math tailored for 7-year-old beginners</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#ffeaa7]/50 px-3.5 py-1.5 rounded-full border-2 border-[#fdcb6e] text-xs font-black text-[#d63031]">
            <Star className="w-3.5 h-3.5 fill-[#feca57] text-[#d63031]" />
            <span>+3 Stars per challenge</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {levelLabels.map((lvl) => (
            <button
              key={lvl.level}
              onClick={() => switchLevel(lvl.level)}
              className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black text-left transition-all active:border-b-2 active:translate-y-0.5 ${
                currentLevel === lvl.level
                  ? 'bg-gradient-to-r from-[#74b9ff] to-[#0984e3] text-white border-[#0984e3] shadow-xs ring-2 ring-[#74b9ff]/40'
                  : 'bg-slate-50 text-[#2d3436] border-slate-200 hover:bg-[#74b9ff]/10 hover:border-[#74b9ff]/40'
              }`}
            >
              <div className="text-lg mb-0.5">{lvl.icon}</div>
              <div className="truncate">{lvl.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Challenge Card */}
      <div className="bg-white rounded-[32px] p-5 sm:p-8 border-2 border-[#74b9ff]/40 border-b-6 border-b-[#0984e3] shadow-sm relative overflow-hidden">
        {/* Question Header & Speech Button */}
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#74b9ff]/20 text-[#0984e3] border border-[#74b9ff]/50 text-xs font-black mb-2">
              <Sparkles className="w-3 h-3 text-[#0984e3]" />
              {currentProblem.type.toUpperCase()} CHALLENGE
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#2d3436] leading-snug">
              {currentProblem.prompt}
            </h3>
          </div>

          <button
            onClick={() => speakText(currentProblem.prompt)}
            className="shrink-0 p-3 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            title="Read question aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>

        {/* Visual Manipulatives Stage */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              Visual Aid (Tap to count with your finger!)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTabVisual('objects')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTabVisual === 'objects' ? 'bg-white text-slate-800 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Emoji Counters
              </button>
              <button
                onClick={() => setActiveTabVisual('ten_frame')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTabVisual === 'ten_frame' ? 'bg-white text-slate-800 shadow-2xs border border-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Ten-Frame Box
              </button>
            </div>
          </div>

          {/* Render Mode A: Emoji Objects */}
          {activeTabVisual === 'objects' && (
            <div className="py-4">
              {currentProblem.type === 'addition' && (
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-center">
                  {/* Group A */}
                  <div className="bg-white px-4 py-3 rounded-2xl border border-blue-200 shadow-2xs">
                    <div className="flex flex-wrap justify-center gap-2 mb-1">
                      {Array.from({ length: currentProblem.visualCountA }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => soundFx.playTap()}
                          className="text-3xl sm:text-4xl hover:scale-125 transition-transform active:scale-95"
                        >
                          {currentProblem.visualEmoji}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-blue-600">{currentProblem.visualCountA} items</span>
                  </div>

                  <span className="text-2xl font-black text-slate-400">+</span>

                  {/* Group B */}
                  <div className="bg-white px-4 py-3 rounded-2xl border border-amber-200 shadow-2xs">
                    <div className="flex flex-wrap justify-center gap-2 mb-1">
                      {Array.from({ length: currentProblem.visualCountB || 0 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => soundFx.playTap()}
                          className="text-3xl sm:text-4xl hover:scale-125 transition-transform active:scale-95"
                        >
                          {currentProblem.visualEmoji}
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-600">{currentProblem.visualCountB || 0} items</span>
                  </div>
                </div>
              )}

              {currentProblem.type === 'subtraction' && (
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <div className="bg-white px-5 py-4 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-wrap justify-center gap-2.5">
                      {Array.from({ length: currentProblem.visualCountA }).map((_, i) => {
                        const isTakenAway = i >= currentProblem.visualCountA - (currentProblem.visualCountB || 0);
                        return (
                          <div key={i} className="relative text-3xl sm:text-4xl">
                            <span className={isTakenAway ? 'opacity-30' : ''}>{currentProblem.visualEmoji}</span>
                            {isTakenAway && (
                              <span className="absolute inset-0 flex items-center justify-center text-rose-500 font-bold text-xl">
                                ❌
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-2 text-center text-xs font-bold text-slate-600">
                      {currentProblem.visualCountA} total &bull; Take away {currentProblem.visualCountB}
                    </div>
                  </div>
                </div>
              )}

              {(currentProblem.type === 'counting' || currentProblem.type === 'comparing' || currentProblem.type === 'early_mult') && (
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: currentProblem.visualCountA }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        soundFx.playTap();
                        speakText(`${i + 1}`);
                      }}
                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:scale-110 active:scale-95 transition-all text-center flex flex-col items-center"
                    >
                      <span className="text-4xl">{currentProblem.visualEmoji}</span>
                      <span className="text-xs font-bold text-slate-500 mt-1">#{i + 1}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Render Mode B: Ten-Frame Grid */}
          {activeTabVisual === 'ten_frame' && (
            <div className="py-2 flex flex-col items-center">
              <div className="grid grid-cols-5 gap-2 max-w-sm w-full bg-white p-3 rounded-2xl border-2 border-slate-300">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const filled = idx < (currentProblem.visualCountA + (currentProblem.visualCountB || 0));
                  return (
                    <div
                      key={idx}
                      onClick={() => soundFx.playTap()}
                      className={`h-14 rounded-xl border-2 border-dashed flex items-center justify-center text-2xl transition-all ${
                        filled ? 'bg-amber-100 border-amber-400 shadow-inner' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {filled ? currentProblem.visualEmoji : <span className="text-xs text-slate-300">{idx + 1}</span>}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-2">
                Ten-Frame shows numbers visually in groups of 10!
              </p>
            </div>
          )}
        </div>

        {/* Answer Options */}
        <div className="mb-6">
          <div className="text-center text-sm font-black text-[#2d3436] mb-3">
            Choose the correct answer:
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
            {currentProblem.options.map((option) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentProblem.correctAnswer;
              let btnClass = 'bg-white hover:bg-[#74b9ff]/15 text-[#2d3436] border-2 border-slate-200 border-b-6 border-b-slate-300 hover:border-[#74b9ff]';

              if (feedbackStatus === 'correct' && isCorrect) {
                btnClass = 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-2 border-[#00b894] border-b-6 border-b-[#008f72] shadow-md ring-4 ring-[#55efc4]/40';
              } else if (feedbackStatus === 'incorrect' && isSelected) {
                btnClass = 'bg-[#ff7675]/20 text-[#d63031] border-2 border-[#ff7675] border-b-6 border-b-[#d63031] ring-2 ring-[#ff7675]/40';
              }

              return (
                <button
                  key={option}
                  onClick={() => handleSelectOption(option)}
                  className={`h-20 sm:h-24 rounded-2xl text-3xl sm:text-4xl font-black transition-all flex flex-col items-center justify-center shadow-xs active:border-b-2 active:translate-y-1 ${btnClass}`}
                >
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackStatus === 'correct' && (
          <div className="bg-[#55efc4]/20 border-2 border-[#00b894] rounded-[24px] p-4 sm:p-5 mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-[#00b894] shrink-0 animate-bounce" />
              <div>
                <h4 className="text-base font-black text-[#1e272e]">Brilliant work, Raena! ⭐ +3 Stars</h4>
                <p className="text-xs sm:text-sm text-[#2d3436] font-bold">{currentProblem.explanation}</p>
              </div>
            </div>

            <button
              onClick={handleNextProblem}
              disabled={isLoadingAi}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00b894] hover:bg-[#00a383] text-white border-2 border-[#00b894] border-b-4 border-b-[#008f72] font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:translate-y-0.5 active:border-b-2"
            >
              {isLoadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Next Challenge <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* Help / Step-by-Step AI Coach Drawer */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
          <button
            onClick={() => handleAskAiCoach()}
            disabled={isLoadingAi}
            className="flex items-center gap-2 text-xs sm:text-sm font-black text-[#d63031] bg-[#ffeaa7]/50 hover:bg-[#ffeaa7] border-2 border-[#fdcb6e] border-b-4 border-b-[#e17055] px-4 py-2.5 rounded-2xl transition-all shadow-2xs active:border-b-2 active:translate-y-0.5"
          >
            <Lightbulb className="w-4 h-4 text-[#e17055]" />
            {isLoadingAi ? 'Barnaby is thinking...' : 'Ask Barnaby for a Hint'}
          </button>

          <button
            onClick={handleNextProblem}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-[#636e72] hover:text-[#2d3436] transition-colors"
          >
            <span>Skip / New Problem</span>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Step by step coaching box */}
        {stepByStepVisible && aiExplanation && (
          <div className="mt-4 bg-[#ffeaa7]/40 border-2 border-[#fdcb6e] rounded-[24px] p-4 sm:p-5 animate-fade-in shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl animate-float-slow">🐰</span>
              <h4 className="text-sm font-black text-[#d63031]">
                {aiExplanation.gentleEncouragement}
              </h4>
            </div>

            <ul className="space-y-2 my-3 pl-2">
              {aiExplanation.steps.map((step, idx) => (
                <li key={idx} className="text-xs sm:text-sm font-black text-[#2d3436] flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#fdcb6e] text-[#2d3436] text-xs flex items-center justify-center shrink-0 font-black border border-[#e17055]/30">
                    {idx + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between text-xs font-black text-[#d63031]">
              <span>{aiExplanation.interactivePrompt}</span>
              <button
                onClick={() => speakText(`${aiExplanation.gentleEncouragement}. ${aiExplanation.steps.join('. ')}`)}
                className="flex items-center gap-1 text-[#e17055] hover:text-[#d63031] underline font-black"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Listen again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
