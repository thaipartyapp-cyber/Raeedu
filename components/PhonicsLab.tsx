'use client';

import React, { useState } from 'react';
import { Volume2, Sparkles, CheckCircle2, ArrowRight, RefreshCw, Star, Layers, Eye, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhonicsExercise, SightWord, StudentProfile } from '@/lib/types';
import { STARTER_PHONICS_EXERCISES, STARTER_SIGHT_WORDS } from '@/lib/curriculum';
import { soundFx, speakText } from '@/lib/sound';
import { addStarsAndXp, recordSessionLog, addLearnedMinutes } from '@/lib/storage';

interface PhonicsLabProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  voiceEnabled: boolean;
}

export const PhonicsLab: React.FC<PhonicsLabProps> = ({ profile, setProfile, voiceEnabled }) => {
  const [activeSubTab, setActiveSubTab] = useState<'word_builder' | 'sight_words'>('word_builder');
  
  // Phonics Word Builder state
  const [phonicsIndex, setPhonicsIndex] = useState(0);
  const [currentPhonics, setCurrentPhonics] = useState<PhonicsExercise>(STARTER_PHONICS_EXERCISES[0]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [phonicsSolved, setPhonicsSolved] = useState(false);

  // Sight Word Drill state
  const [sightWordIndex, setSightWordIndex] = useState(0);
  const [currentSightWord, setCurrentSightWord] = useState<SightWord>(STARTER_SIGHT_WORDS[0]);
  const [assembledLetters, setAssembledLetters] = useState<string[]>([]);
  const [sightWordSolved, setSightWordSolved] = useState(false);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Handle Phonics Letter Selection
  const handleSelectPhonicsLetter = (letter: string) => {
    if (phonicsSolved) return;
    soundFx.playTap();
    setSelectedLetter(letter);

    const correctLetter = currentPhonics.targetWord[currentPhonics.missingLetterIndex];
    if (letter.toUpperCase() === correctLetter.toUpperCase()) {
      soundFx.playCorrect();
      setPhonicsSolved(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      const updated = addStarsAndXp(3, 20, 'phonics');
      addLearnedMinutes(2);
      setProfile(updated);

      recordSessionLog({
        subject: 'phonics',
        durationSeconds: 90,
        problemsAttempted: 1,
        problemsCorrect: 1,
        starsEarned: 3,
        struggledConcepts: [],
        masteredConcepts: [`Phonics sound /${currentPhonics.sound}/ in ${currentPhonics.targetWord}`],
      });

      if (voiceEnabled) {
        speakText(`Awesome Raena! /${currentPhonics.sound}/ makes the word ${currentPhonics.targetWord}!`);
      }
    } else {
      soundFx.playTryAgain();
      if (voiceEnabled) {
        speakText(`Good try Raena! Let's listen to the sound: /${currentPhonics.audioPronunciation}/.`);
      }
    }
  };

  const handleNextPhonics = async () => {
    soundFx.playTap();
    setSelectedLetter(null);
    setPhonicsSolved(false);

    // Try AI generation
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/phonics-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'phonics_exercise',
          level: profile.levelPhonics || 1,
        }),
      });
      const data = await res.json();
      if (data.success && data.exercise) {
        setCurrentPhonics(data.exercise);
        if (voiceEnabled) {
          speakText(data.exercise.clue);
        }
      } else {
        const nextIdx = (phonicsIndex + 1) % STARTER_PHONICS_EXERCISES.length;
        setPhonicsIndex(nextIdx);
        setCurrentPhonics(STARTER_PHONICS_EXERCISES[nextIdx]);
        if (voiceEnabled) {
          speakText(STARTER_PHONICS_EXERCISES[nextIdx].clue);
        }
      }
    } catch {
      const nextIdx = (phonicsIndex + 1) % STARTER_PHONICS_EXERCISES.length;
      setPhonicsIndex(nextIdx);
      setCurrentPhonics(STARTER_PHONICS_EXERCISES[nextIdx]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Sight Words Scramble handlers
  const handleAddLetterToWord = (char: string, indexToRemove: number) => {
    soundFx.playTap();
    const nextAssembled = [...assembledLetters, char];
    setAssembledLetters(nextAssembled);

    // Check if fully spelled
    const target = currentSightWord.word.toUpperCase();
    if (nextAssembled.join('') === target) {
      soundFx.playCorrect();
      setSightWordSolved(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });

      const updated = addStarsAndXp(3, 20, 'sight_words');
      addLearnedMinutes(2);
      setProfile(updated);

      recordSessionLog({
        subject: 'sight_words',
        durationSeconds: 90,
        problemsAttempted: 1,
        problemsCorrect: 1,
        starsEarned: 3,
        struggledConcepts: [],
        masteredConcepts: [`Sight word: ${currentSightWord.word}`],
      });

      if (voiceEnabled) {
        speakText(`Fantastic reading, Raena! The sight word is ${currentSightWord.word}! ${currentSightWord.sentence}`);
      }
    }
  };

  const handleResetSightWordSpelling = () => {
    soundFx.playTap();
    setAssembledLetters([]);
    setSightWordSolved(false);
  };

  const handleNextSightWord = async () => {
    soundFx.playTap();
    setAssembledLetters([]);
    setSightWordSolved(false);

    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/gemini/phonics-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'sight_word',
          level: profile.levelSightWords || 1,
        }),
      });
      const data = await res.json();
      if (data.success && data.sightWord) {
        setCurrentSightWord(data.sightWord);
        if (voiceEnabled) {
          speakText(`Let's learn the word: ${data.sightWord.word}.`);
        }
      } else {
        const nextIdx = (sightWordIndex + 1) % STARTER_SIGHT_WORDS.length;
        setSightWordIndex(nextIdx);
        setCurrentSightWord(STARTER_SIGHT_WORDS[nextIdx]);
        if (voiceEnabled) {
          speakText(`Let's learn the word: ${STARTER_SIGHT_WORDS[nextIdx].word}.`);
        }
      }
    } catch {
      const nextIdx = (sightWordIndex + 1) % STARTER_SIGHT_WORDS.length;
      setSightWordIndex(nextIdx);
      setCurrentSightWord(STARTER_SIGHT_WORDS[nextIdx]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tab Switcher */}
      <div className="bg-white rounded-[28px] p-4 sm:p-5 border-2 border-[#55efc4]/50 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#55efc4] to-[#00b894] text-white flex items-center justify-center font-black text-xl shadow-xs animate-float-slow">
              🔤
            </div>
            <div>
              <h2 className="text-base font-black text-[#2d3436]">Phonics & Sight Words Land</h2>
              <p className="text-xs text-[#636e72] font-bold">Letter sounds, CVC word building & high-frequency reader drills</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#55efc4]/20 px-3.5 py-1.5 rounded-full border-2 border-[#00b894] text-xs font-black text-[#00b894]">
            <Star className="w-3.5 h-3.5 fill-[#00b894] text-[#00b894]" />
            <span>+3 Stars per word</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              setActiveSubTab('word_builder');
              soundFx.playTap();
            }}
            className={`p-3 rounded-2xl border-2 border-b-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:border-b-2 active:translate-y-0.5 ${
              activeSubTab === 'word_builder'
                ? 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-[#00b894] shadow-xs ring-2 ring-[#55efc4]/40'
                : 'bg-slate-50 text-[#2d3436] border-slate-200 hover:bg-[#55efc4]/15 hover:border-[#55efc4]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>CVC Sound & Word Builder</span>
          </button>

          <button
            onClick={() => {
              setActiveSubTab('sight_words');
              soundFx.playTap();
            }}
            className={`p-3 rounded-2xl border-2 border-b-4 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:border-b-2 active:translate-y-0.5 ${
              activeSubTab === 'sight_words'
                ? 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-[#00b894] shadow-xs ring-2 ring-[#55efc4]/40'
                : 'bg-slate-50 text-[#2d3436] border-slate-200 hover:bg-[#55efc4]/15 hover:border-[#55efc4]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Sight Words Flashcards</span>
          </button>
        </div>
      </div>

      {/* Mode 1: CVC Word Builder */}
      {activeSubTab === 'word_builder' && (
        <div className="bg-white rounded-[32px] p-5 sm:p-8 border-2 border-[#55efc4]/40 border-b-6 border-b-[#00b894] shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#55efc4]/25 text-[#00b894] border border-[#00b894]/40 text-xs font-black mb-2">
                <Sparkles className="w-3 h-3 text-[#00b894]" />
                TARGET SOUND: /{currentPhonics.sound}/ &bull; {currentPhonics.soundExample}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#2d3436]">
                {currentPhonics.clue}
              </h3>
            </div>

            <button
              onClick={() => speakText(`${currentPhonics.clue}. Sound clue: ${currentPhonics.audioPronunciation}`)}
              className="p-3 rounded-2xl bg-[#55efc4]/20 text-[#00b894] border-2 border-[#00b894]/40 hover:bg-[#55efc4]/40 shrink-0 transition-transform active:scale-95"
              title="Listen to clue"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Interactive Word Stage with Missing Letter Slot */}
          <div className="bg-[#faf8f5] border-2 border-[#55efc4]/40 rounded-[28px] p-6 sm:p-8 flex flex-col items-center justify-center shadow-xs">
            <div className="text-6xl sm:text-7xl mb-4 animate-bounce select-none">
              {currentPhonics.imageEmoji}
            </div>

            {/* Letter Tiles Display */}
            <div className="flex items-center gap-3 sm:gap-4">
              {currentPhonics.targetWord.split('').map((char, idx) => {
                const isMissing = idx === currentPhonics.missingLetterIndex;
                const isFilled = isMissing && selectedLetter !== null;
                const displayChar = isMissing ? (selectedLetter || '?') : char;

                return (
                  <div
                    key={idx}
                    className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-xs transition-all ${
                      isMissing
                        ? isFilled
                          ? phonicsSolved
                            ? 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-2 border-[#00b894] border-b-6 border-b-[#008f72] animate-pulse'
                            : 'bg-[#ff7675]/20 text-[#d63031] border-2 border-[#ff7675] border-b-6 border-b-[#d63031]'
                          : 'bg-white border-3 border-dashed border-[#00b894] text-[#00b894] animate-pulse'
                        : 'bg-white border-2 border-slate-200 border-b-6 border-b-slate-300 text-[#2d3436]'
                    }`}
                  >
                    {displayChar}
                  </div>
                );
              })}
            </div>

            {/* Sound-out Button */}
            <button
              onClick={() => speakText(`The sound is /${currentPhonics.audioPronunciation}/`)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-[#ffeaa7] text-[#d63031] border-2 border-[#fdcb6e] border-b-4 border-b-[#e17055] rounded-full text-xs sm:text-sm font-black hover:bg-[#fdcb6e] transition-all active:border-b-2 active:translate-y-0.5 shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-[#e17055]" />
              Hear Sound: &ldquo;/{currentPhonics.audioPronunciation}/&rdquo;
            </button>
          </div>

          {/* Missing Letter Choices */}
          <div>
            <div className="text-center text-sm font-black text-[#2d3436] mb-3">
              Tap the missing letter sound:
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-sm mx-auto">
              {currentPhonics.letterChoices.map((letter) => {
                const isSelected = selectedLetter === letter;
                const isCorrect = letter.toUpperCase() === currentPhonics.targetWord[currentPhonics.missingLetterIndex].toUpperCase();

                let btnStyle = 'bg-white hover:bg-[#55efc4]/20 text-[#2d3436] border-2 border-slate-200 border-b-6 border-b-slate-300 hover:border-[#00b894]';
                if (phonicsSolved && isCorrect) {
                  btnStyle = 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-2 border-[#00b894] border-b-6 border-b-[#008f72] ring-4 ring-[#55efc4]/40';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-[#ff7675]/20 text-[#d63031] border-2 border-[#ff7675] border-b-6 border-b-[#d63031]';
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectPhonicsLetter(letter)}
                    className={`h-20 rounded-2xl text-3xl font-black transition-all flex items-center justify-center shadow-xs active:border-b-2 active:translate-y-1 ${btnStyle}`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rhyme Explorer Banner */}
          {phonicsSolved && (
            <div className="bg-[#55efc4]/20 border-2 border-[#00b894] rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-7 h-7 text-[#00b894] shrink-0 animate-bounce" />
                  <h4 className="text-base font-black text-[#1e272e]">You built &ldquo;{currentPhonics.targetWord}&rdquo;! ⭐ +3 Stars</h4>
                </div>
                <div className="text-xs sm:text-sm text-[#2d3436] font-bold">
                  Rhymes with: {currentPhonics.rhymingWords.join(' &bull; ')}
                </div>
              </div>

              <button
                onClick={handleNextPhonics}
                disabled={isLoadingAi}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00b894] hover:bg-[#00a383] text-white border-2 border-[#00b894] border-b-4 border-b-[#008f72] font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all shrink-0 active:border-b-2 active:translate-y-0.5"
              >
                {isLoadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Next Word <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Sight Words Flashcards & Scramble */}
      {activeSubTab === 'sight_words' && (
        <div className="bg-white rounded-[32px] p-5 sm:p-8 border-2 border-[#55efc4]/40 border-b-6 border-b-[#00b894] shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#55efc4]/25 text-[#00b894] border border-[#00b894]/40 text-xs font-black mb-2">
                <BookOpen className="w-3 h-3" />
                DOLCH SIGHT WORD ({currentSightWord.category.toUpperCase()})
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#2d3436]">
                Sight Word Flashcard: &ldquo;{currentSightWord.word}&rdquo;
              </h3>
            </div>

            <button
              onClick={() => speakText(`${currentSightWord.word}. ${currentSightWord.sentence}`)}
              className="p-3 rounded-2xl bg-[#55efc4]/20 text-[#00b894] border-2 border-[#00b894]/40 hover:bg-[#55efc4]/40 shrink-0 transition-transform active:scale-95"
              title="Hear sight word and sentence"
            >
              <Volume2 className="w-6 h-6" />
            </button>
          </div>

          {/* Flashcard Box */}
          <div className="bg-gradient-to-tr from-[#55efc4] via-[#00b894] to-[#00a383] text-[#1e272e] rounded-[28px] p-6 sm:p-8 text-center shadow-md relative overflow-hidden border-2 border-[#00b894]">
            <div className="text-5xl mb-2 select-none animate-float-slow">{currentSightWord.emoji}</div>
            <div className="text-5xl sm:text-7xl font-black tracking-wider mb-4 text-white drop-shadow-sm">
              {currentSightWord.word}
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 max-w-lg mx-auto border border-white/30">
              <p className="text-base sm:text-lg font-black text-white leading-relaxed">
                &ldquo;{currentSightWord.sentence}&rdquo;
              </p>
            </div>

            <button
              onClick={() => speakText(currentSightWord.sentence)}
              className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-[#00b894] rounded-full text-xs sm:text-sm font-black hover:bg-[#faf8f5] transition-all shadow-xs border-2 border-white active:scale-95"
            >
              <Volume2 className="w-4 h-4 text-[#00b894]" />
              Listen to the Sentence
            </button>
          </div>

          {/* Letter Builder / Unscrambler */}
          <div className="bg-[#faf8f5] border-2 border-[#55efc4]/40 rounded-[28px] p-5 sm:p-6 text-center shadow-xs">
            <h4 className="text-sm font-black text-[#2d3436] mb-3">
              Practice Spelling &ldquo;{currentSightWord.word}&rdquo; (Tap the letters in order!):
            </h4>

            {/* Assembled Word Slot */}
            <div className="flex justify-center gap-2 min-h-14 mb-4">
              {currentSightWord.word.split('').map((_, idx) => {
                const letter = assembledLetters[idx];
                return (
                  <div
                    key={idx}
                    className={`w-12 h-14 rounded-2xl flex items-center justify-center text-2xl font-black border-2 transition-all ${
                      letter
                        ? 'bg-gradient-to-r from-[#55efc4] to-[#00b894] text-[#1e272e] border-[#00b894] border-b-4 border-b-[#008f72] shadow-2xs'
                        : 'bg-white border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    {letter || ''}
                  </div>
                );
              })}
            </div>

            {/* Scrambled Letter Tiles to tap */}
            <div className="flex flex-wrap justify-center gap-2.5 max-w-sm mx-auto mb-3">
              {currentSightWord.scrambledLetters.map((letter, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddLetterToWord(letter, idx)}
                  disabled={sightWordSolved || assembledLetters.length >= currentSightWord.word.length}
                  className="w-14 h-14 rounded-2xl bg-white hover:bg-[#55efc4]/20 text-[#2d3436] border-2 border-slate-200 border-b-4 border-b-slate-300 text-2xl font-black shadow-2xs hover:scale-105 active:scale-95 active:border-b-2 transition-all disabled:opacity-50"
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetSightWordSpelling}
                className="text-xs font-black text-[#e17055] hover:text-[#d63031] underline"
              >
                Clear / Try Again
              </button>
            </div>
          </div>

          {/* Success & Next */}
          {sightWordSolved && (
            <div className="bg-[#55efc4]/20 border-2 border-[#00b894] rounded-[24px] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in shadow-xs">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-[#00b894] shrink-0 animate-bounce" />
                <div>
                  <h4 className="text-base font-black text-[#1e272e]">Mastered &ldquo;{currentSightWord.word}&rdquo;! ⭐ +3 Stars</h4>
                  <p className="text-xs text-[#2d3436] font-bold">Added to Raena&apos;s sight word memory bank.</p>
                </div>
              </div>

              <button
                onClick={handleNextSightWord}
                disabled={isLoadingAi}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00b894] hover:bg-[#00a383] text-white border-2 border-[#00b894] border-b-4 border-b-[#008f72] font-black text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:border-b-2 active:translate-y-0.5"
              >
                {isLoadingAi ? <RefreshCw className="w-4 h-4 animate-spin" /> : <>Next Sight Word <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
