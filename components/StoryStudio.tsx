'use client';

import React, { useState } from 'react';
import { Sparkles, Volume2, Mic, MicOff, Star, Library, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StoryBook, StoryChapter, StudentProfile } from '@/lib/types';
import { STARTER_STORY_PROMPTS } from '@/lib/curriculum';
import { soundFx, speakText } from '@/lib/sound';
import { addStarsAndXp, recordSessionLog, addLearnedMinutes, saveStory, getStoredStories } from '@/lib/storage';

interface StoryStudioProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  voiceEnabled: boolean;
}

export const StoryStudio: React.FC<StoryStudioProps> = ({ profile, setProfile, voiceEnabled }) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [activeStory, setActiveStory] = useState<StoryBook>({
    id: 'story_active_1',
    title: STARTER_STORY_PROMPTS[0].title,
    theme: STARTER_STORY_PROMPTS[0].theme,
    createdAt: '2025-01-01T00:00:00.000Z',
    completed: false,
    coverEmoji: STARTER_STORY_PROMPTS[0].coverEmoji,
    chapters: [
      {
        id: 'ch_1',
        chapterNumber: 1,
        storyStarter: STARTER_STORY_PROMPTS[0].initialStarter,
        imagePromptDescription: 'A cute bunny in an enchanted sunlit meadow admiring a glowing acorn',
        visualEmoji: STARTER_STORY_PROMPTS[0].coverEmoji,
        weavedNarrative: STARTER_STORY_PROMPTS[0].initialStarter,
        nextPrompt: 'What should Barnaby do with the magical acorn?',
        suggestedWords: STARTER_STORY_PROMPTS[0].suggestedWords,
      },
    ],
  });

  const [inputSentence, setInputSentence] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingWeave, setIsLoadingWeave] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [comprehensionAnswered, setComprehensionAnswered] = useState<string | null>(null);
  const [viewingLibrary, setViewingLibrary] = useState(false);
  const [savedStoriesList, setSavedStoriesList] = useState<StoryBook[]>(() => getStoredStories());

  const currentChapter = activeStory.chapters[currentChapterIndex] || activeStory.chapters[0];

  // Voice speech-to-text dictation
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    
    interface SpeechGrammarEvent extends Event {
      results: { [index: number]: { [index: number]: { transcript: string } } };
    }
    interface SpeechRecognitionInstance extends EventTarget {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((event: SpeechGrammarEvent) => void) | null;
      onerror: ((event: Event) => void) | null;
      onend: ((event: Event) => void) | null;
    }

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };

    const SpeechRecognitionClass = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert('Speech recognition is not supported in this browser. You can type or tap the word chips below!');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      setIsListening(true);
      soundFx.playTap();

      recognition.onresult = (event: SpeechGrammarEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputSentence((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSelectSuggestedChip = (phrase: string) => {
    soundFx.playTap();
    setInputSentence((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const handleWeaveChapter = async () => {
    if (!inputSentence.trim()) return;

    soundFx.playTap();
    setIsLoadingWeave(true);

    try {
      const res = await fetch('/api/gemini/story-weave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: activeStory.theme,
          storyTitle: activeStory.title,
          chapterNumber: currentChapter.chapterNumber + 1,
          raenaInput: inputSentence,
          storyHistory: activeStory.chapters,
        }),
      });

      const data = await res.json();
      if (data.success && data.chapter) {
        const chapterId = `ch_${activeStory.id}_${activeStory.chapters.length + 1}`;
        const newChapter: StoryChapter = {
          id: chapterId,
          chapterNumber: currentChapter.chapterNumber + 1,
          storyStarter: currentChapter.nextPrompt,
          imagePromptDescription: data.chapter.imagePromptDescription,
          visualEmoji: data.chapter.visualEmoji || '✨',
          raenaInput: inputSentence,
          gentleCorrection: data.chapter.gentleCorrection,
          weavedNarrative: data.chapter.weavedNarrative,
          nextPrompt: data.chapter.nextPrompt,
          suggestedWords: data.chapter.suggestedWords || [],
          comprehensionQuestion: data.chapter.comprehensionQuestion,
        };

        const updatedChapters = [...activeStory.chapters, newChapter];
        const updatedStory: StoryBook = {
          ...activeStory,
          chapters: updatedChapters,
          completed: updatedChapters.length >= 4,
        };

        setActiveStory(updatedStory);
        setCurrentChapterIndex(updatedChapters.length - 1);
        saveStory(updatedStory);
        setSavedStoriesList(getStoredStories());

        // Rewards
        soundFx.playFanfare();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });

        const updatedProf = addStarsAndXp(5, 35, 'storytelling');
        addLearnedMinutes(4);
        setProfile(updatedProf);

        recordSessionLog({
          subject: 'storytelling',
          durationSeconds: 180,
          problemsAttempted: 1,
          problemsCorrect: 1,
          starsEarned: 5,
          struggledConcepts: [],
          masteredConcepts: [`Story Chapter ${newChapter.chapterNumber}: Creative Sentence Building`],
        });

        setInputSentence('');
        setComprehensionAnswered(null);

        if (voiceEnabled) {
          const praise = newChapter.gentleCorrection
            ? `${newChapter.gentleCorrection.encouragement} ${newChapter.weavedNarrative}`
            : newChapter.weavedNarrative;
          speakText(praise);
        }
      }
    } catch {
      alert('Could not weave story chapter right now. Please try again!');
    } finally {
      setIsLoadingWeave(false);
    }
  };

  const handleStartNewStoryTheme = (index: number) => {
    soundFx.playTap();
    const prompt = STARTER_STORY_PROMPTS[index];
    setSelectedPromptIndex(index);
    const storyId = `story_${prompt.id}_${savedStoriesList.length + 1}`;
    const newStory: StoryBook = {
      id: storyId,
      title: prompt.title,
      theme: prompt.theme,
      createdAt: '2025-01-01T00:00:00.000Z',
      completed: false,
      coverEmoji: prompt.coverEmoji,
      chapters: [
        {
          id: `ch_${prompt.id}_1`,
          chapterNumber: 1,
          storyStarter: prompt.initialStarter,
          imagePromptDescription: 'Opening scene illustration of the children adventure book',
          visualEmoji: prompt.coverEmoji,
          weavedNarrative: prompt.initialStarter,
          nextPrompt: 'What should our hero do next?',
          suggestedWords: prompt.suggestedWords,
        },
      ],
    };
    setActiveStory(newStory);
    setCurrentChapterIndex(0);
    setInputSentence('');
    setViewingLibrary(false);
    if (voiceEnabled) {
      speakText(`Let's create a brand new story book: ${prompt.title}! ${prompt.initialStarter}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Story Selector */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border-2 border-[#ff7675]/40 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff7675] to-[#fd79a8] text-white flex items-center justify-center font-black text-xl shadow-xs animate-float-slow">
              📖
            </div>
            <div>
              <h2 className="text-base font-black text-[#2d3436]">Magic Story Studio</h2>
              <p className="text-xs text-[#636e72] font-bold">Co-author illustrated storybooks with AI guidance & gentle spelling coaching</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewingLibrary(!viewingLibrary)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border-2 border-slate-200 border-b-4 text-xs font-black text-[#2d3436] hover:bg-[#faf8f5] transition-all shadow-2xs active:border-b-2 active:translate-y-0.5"
            >
              <Library className="w-3.5 h-3.5 text-[#ff7675]" />
              <span>My Books ({savedStoriesList.length})</span>
            </button>

            <div className="flex items-center gap-1 bg-[#ff7675]/20 px-3.5 py-1.5 rounded-full border-2 border-[#ff7675] text-xs font-black text-[#d63031]">
              <Star className="w-3.5 h-3.5 fill-[#feca57] text-[#d63031]" />
              <span>+5 Stars / Chapter</span>
            </div>
          </div>
        </div>

        {/* Story Theme Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {STARTER_STORY_PROMPTS.map((prompt, idx) => (
            <button
              key={prompt.id}
              onClick={() => handleStartNewStoryTheme(idx)}
              className={`p-3 rounded-2xl border-2 border-b-4 text-xs font-black text-left transition-all flex items-center gap-2.5 active:border-b-2 active:translate-y-0.5 ${
                selectedPromptIndex === idx && !viewingLibrary
                  ? 'bg-gradient-to-r from-[#ff7675] to-[#fd79a8] text-white border-[#d63031] shadow-xs ring-2 ring-[#ff7675]/40'
                  : 'bg-slate-50 text-[#2d3436] border-slate-200 hover:bg-[#ff7675]/10 hover:border-[#ff7675]'
              }`}
            >
              <span className="text-2xl shrink-0">{prompt.coverEmoji}</span>
              <div className="min-w-0">
                <div className="truncate font-black">{prompt.title}</div>
                <div className="text-[11px] opacity-80 truncate">{prompt.theme}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Library View (if toggled) */}
      {viewingLibrary && (
        <div className="bg-white rounded-[32px] p-6 sm:p-8 border-2 border-[#ff7675]/40 border-b-6 border-b-[#d63031] shadow-sm animate-fade-in space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#2d3436] flex items-center gap-2">
              <Library className="w-5 h-5 text-[#ff7675]" />
              Raena&apos;s Illustrated Book Shelf
            </h3>
            <button
              onClick={() => setViewingLibrary(false)}
              className="text-xs font-black text-[#ff7675] hover:underline"
            >
              Back to Studio &rarr;
            </button>
          </div>

          {savedStoriesList.length === 0 ? (
            <p className="text-sm text-[#636e72] font-bold py-6 text-center">No saved storybooks yet. Co-author your first book below!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {savedStoriesList.map((story) => (
                <div
                  key={story.id}
                  onClick={() => {
                    setActiveStory(story);
                    setCurrentChapterIndex(0);
                    setViewingLibrary(false);
                  }}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-[#ff7675] hover:shadow-md cursor-pointer transition-all bg-gradient-to-b from-white to-[#ff7675]/10 active:scale-95"
                >
                  <div className="text-4xl mb-2 animate-float-slow">{story.coverEmoji}</div>
                  <h4 className="font-black text-[#2d3436] text-sm mb-1">{story.title}</h4>
                  <p className="text-xs text-[#636e72] font-bold mb-2">{story.chapters.length} Chapters &bull; {story.theme}</p>
                  <span className="text-[11px] font-black text-[#d63031] bg-[#ff7675]/20 px-2.5 py-1 rounded-xl border border-[#ff7675]/40">
                    Open & Read Aloud &rarr;
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Story Reader & Co-Authoring Workspace */}
      {!viewingLibrary && (
        <div className="bg-white rounded-[32px] p-5 sm:p-8 border-2 border-[#ff7675]/40 border-b-6 border-b-[#d63031] shadow-sm space-y-6">
          {/* Chapter Progress Tabs */}
          <div className="flex items-center justify-between border-b-2 border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-3xl animate-float-slow">{activeStory.coverEmoji}</span>
              <div>
                <h3 className="text-base sm:text-lg font-black text-[#2d3436]">{activeStory.title}</h3>
                <span className="text-xs text-[#636e72] font-bold">Chapter {currentChapter.chapterNumber} of {activeStory.chapters.length}</span>
              </div>
            </div>

            {/* Read Aloud Button */}
            <button
              onClick={() => speakText(currentChapter.weavedNarrative)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#ff7675]/20 text-[#d63031] hover:bg-[#ff7675]/30 font-black text-xs border-2 border-[#ff7675]/40 transition-transform active:scale-95 shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-[#d63031]" />
              <span>Read Chapter Aloud</span>
            </button>
          </div>

          {/* Chapter Illustration & Story Content */}
          <div className="bg-gradient-to-b from-[#ff7675]/10 via-[#faf8f5] to-[#ffeaa7]/20 border-2 border-[#fab1a0]/50 rounded-[28px] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border-3 border-[#fdcb6e] shadow-md flex items-center justify-center text-6xl sm:text-7xl shrink-0 select-none animate-float-slow">
                {currentChapter.visualEmoji || activeStory.coverEmoji}
              </div>

              <div className="space-y-3 flex-1 text-center sm:text-left">
                <span className="inline-block px-3.5 py-1 rounded-full bg-[#ff7675] text-white text-xs font-black shadow-xs">
                  CHAPTER {currentChapter.chapterNumber}
                </span>

                <p className="text-base sm:text-lg font-black text-[#2d3436] leading-relaxed">
                  {currentChapter.weavedNarrative}
                </p>
              </div>
            </div>

            {/* Gentle Spelling/Grammar Coaching Bubble */}
            {currentChapter.gentleCorrection && (
              <div className="bg-[#ffeaa7]/40 border-2 border-[#fdcb6e] rounded-[24px] p-4 mb-4 flex items-start gap-3 shadow-xs">
                <span className="text-2xl shrink-0 animate-bounce">🐰</span>
                <div className="text-xs sm:text-sm">
                  <span className="font-black text-[#d63031] block mb-0.5">
                    Barnaby&apos;s Gentle Writing Tip:
                  </span>
                  <p className="text-[#2d3436] font-bold">{currentChapter.gentleCorrection.encouragement}</p>
                </div>
              </div>
            )}

            {/* Comprehension Mini Check */}
            {currentChapter.comprehensionQuestion && (
              <div className="bg-[#74b9ff]/15 border-2 border-[#74b9ff]/60 rounded-[24px] p-4 mt-4 shadow-xs">
                <span className="text-xs font-black text-[#0984e3] uppercase tracking-wider block mb-1">
                  Reading Check:
                </span>
                <p className="text-sm font-black text-[#2d3436] mb-2">
                  {currentChapter.comprehensionQuestion.question}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {currentChapter.comprehensionQuestion.options.map((opt) => {
                    const isCorrect = opt === currentChapter.comprehensionQuestion?.correctAnswer;
                    const isSelected = comprehensionAnswered === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          soundFx.playTap();
                          setComprehensionAnswered(opt);
                          if (isCorrect) {
                            soundFx.playCorrect();
                            if (voiceEnabled) speakText(`That's right! Good listening!`);
                          }
                        }}
                        className={`p-2.5 rounded-xl text-xs font-black border-2 border-b-4 transition-all active:border-b-2 active:translate-y-0.5 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-[#00b894]'
                              : 'bg-[#ff7675]/20 text-[#d63031] border-[#ff7675]'
                            : 'bg-white text-[#2d3436] border-slate-200 hover:bg-[#74b9ff]/20'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Authoring Box */}
          <div className="bg-[#faf8f5] border-2 border-[#fab1a0]/50 rounded-[28px] p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-[#ff7675] uppercase tracking-wider">
                  Raena&apos;s Turn as Co-Author:
                </span>
                <h4 className="text-base sm:text-lg font-black text-[#2d3436]">
                  {currentChapter.nextPrompt || "What should happen next in the story?"}
                </h4>
              </div>

              <button
                onClick={() => speakText(currentChapter.nextPrompt || "What happens next?")}
                className="p-2.5 rounded-xl bg-white border-2 border-slate-200 text-[#636e72] hover:text-[#2d3436] transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Word & Phrase Chips for Easy Tap-to-Build */}
            {currentChapter.suggestedWords && currentChapter.suggestedWords.length > 0 && (
              <div>
                <span className="text-xs font-black text-[#636e72] mb-1.5 block">
                  Tap to add friendly ideas:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentChapter.suggestedWords.map((word) => (
                    <button
                      key={word}
                      onClick={() => handleSelectSuggestedChip(word)}
                      className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#ffeaa7] text-[#2d3436] hover:text-[#d63031] border-2 border-[#fdcb6e] border-b-4 border-b-[#e17055] text-xs sm:text-sm font-black shadow-2xs transition-all active:border-b-2 active:translate-y-0.5"
                    >
                      + &ldquo;{word}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Field + Voice Dictation Mic + Weave Button */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputSentence}
                  onChange={(e) => setInputSentence(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWeaveChapter()}
                  placeholder="Type a sentence or tap word chips (e.g. 'He gave the puppy a treat')..."
                  className="w-full h-14 pl-4 pr-12 rounded-2xl bg-white border-2 border-slate-300 focus:border-[#ff7675] focus:ring-3 focus:ring-[#ff7675]/20 outline-hidden text-sm sm:text-base font-black text-[#2d3436] placeholder:text-[#636e72]/60 shadow-inner"
                />

                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`absolute right-2 top-2 h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-[#ff7675] text-white animate-pulse'
                      : 'bg-slate-100 text-[#636e72] hover:bg-slate-200'
                  }`}
                  title="Speak with microphone"
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              </div>

              <button
                onClick={handleWeaveChapter}
                disabled={isLoadingWeave || !inputSentence.trim()}
                className="h-14 px-7 rounded-2xl bg-[#ff7675] hover:bg-[#ee5253] disabled:opacity-50 text-white border-2 border-[#ff7675] border-b-4 border-b-[#d63031] font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 active:border-b-2 active:translate-y-0.5"
              >
                {isLoadingWeave ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>AI Weaving Story...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Weave My Idea!</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
