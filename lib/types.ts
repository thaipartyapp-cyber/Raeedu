export type LearningSubject = 'math' | 'phonics' | 'sight_words' | 'storytelling';

export interface StudentProfile {
  name: string;
  age: number;
  gradeEquivalent: string;
  avatarId: string;
  companionName: string;
  totalStars: number;
  totalXp: number;
  currentStreak: number;
  lastActiveDate: string;
  minutesLearnedToday: number;
  dailyGoalMinutes: number;
  unlockedAccessories: string[];
  equippedAccessory?: string;
  levelMath: number;
  levelPhonics: number;
  levelSightWords: number;
  levelStorytelling: number;
}

export type MathProblemType = 'counting' | 'addition' | 'subtraction' | 'ten_frame' | 'early_mult' | 'early_div' | 'comparing';

export interface MathProblem {
  id: string;
  level: number;
  type: MathProblemType;
  prompt: string;
  visualEmoji: string;
  visualCountA: number;
  visualCountB?: number;
  options: number[];
  correctAnswer: number;
  explanation: string;
  stepByStep: string[];
  manipulativeType: 'objects' | 'ten_frame' | 'number_line' | 'groups';
}

export interface PhonicsExercise {
  id: string;
  sound: string;
  soundExample: string;
  audioPronunciation: string;
  targetWord: string;
  missingLetterIndex: number;
  letterChoices: string[];
  imageEmoji: string;
  rhymingWords: string[];
  clue: string;
}

export interface SightWord {
  id: string;
  word: string;
  category: 'pre-primer' | 'primer' | 'grade-1';
  sentence: string;
  audioExample: string;
  scrambledLetters: string[];
  emoji: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  storyStarter: string;
  imagePromptDescription: string;
  visualEmoji: string;
  raenaInput?: string;
  gentleCorrection?: {
    original: string;
    corrected: string;
    encouragement: string;
  };
  weavedNarrative: string;
  nextPrompt: string;
  suggestedWords: string[];
  comprehensionQuestion?: {
    question: string;
    options: string[];
    correctAnswer: string;
  };
}

export interface StoryBook {
  id: string;
  title: string;
  theme: string;
  createdAt: string;
  chapters: StoryChapter[];
  completed: boolean;
  coverEmoji: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: LearningSubject | 'general';
}

export interface LearningSessionLog {
  id: string;
  timestamp: string;
  subject: LearningSubject;
  durationSeconds: number;
  problemsAttempted: number;
  problemsCorrect: number;
  starsEarned: number;
  struggledConcepts: string[];
  masteredConcepts: string[];
}
