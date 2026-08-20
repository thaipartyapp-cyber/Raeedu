import { StudentProfile, Badge, StoryBook, LearningSessionLog, LearningSubject } from './types';
import { INITIAL_BADGES } from './curriculum';

const PROFILE_STORAGE_KEY = 'raena_student_profile_v1';
const BADGES_STORAGE_KEY = 'raena_badges_v1';
const STORIES_STORAGE_KEY = 'raena_stories_v1';
const LOGS_STORAGE_KEY = 'raena_session_logs_v1';

export const DEFAULT_PROFILE: StudentProfile = {
  name: 'Raena',
  age: 7,
  gradeEquivalent: 'Kindergarten / Early 1st Grade Foundational',
  avatarId: 'bunny',
  companionName: 'Barnaby Bunny',
  totalStars: 15,
  totalXp: 120,
  currentStreak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  minutesLearnedToday: 18,
  dailyGoalMinutes: 120, // 2-hour daily learning target
  unlockedAccessories: ['star_badge', 'rainbow_cape'],
  equippedAccessory: 'star_badge',
  levelMath: 1,
  levelPhonics: 1,
  levelSightWords: 1,
  levelStorytelling: 1,
};

export function getStoredProfile(): StudentProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      saveProfile(DEFAULT_PROFILE);
      return DEFAULT_PROFILE;
    }
    const parsed = JSON.parse(raw);
    // Check if new day
    const today = new Date().toISOString().split('T')[0];
    if (parsed.lastActiveDate !== today) {
      // Calculate streak
      const lastDate = new Date(parsed.lastActiveDate);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        parsed.currentStreak += 1;
      } else if (diffDays > 1) {
        parsed.currentStreak = 1;
      }
      parsed.lastActiveDate = today;
      parsed.minutesLearnedToday = 0;
      saveProfile(parsed);
    }
    return parsed;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: StudentProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
}

export function addStarsAndXp(stars: number, xp: number, subject?: LearningSubject): StudentProfile {
  const profile = getStoredProfile();
  profile.totalStars += stars;
  profile.totalXp += xp;

  if (subject === 'math' && profile.totalXp % 100 < xp) {
    profile.levelMath = Math.min(5, profile.levelMath + 1);
  } else if (subject === 'phonics' && profile.totalXp % 100 < xp) {
    profile.levelPhonics = Math.min(5, profile.levelPhonics + 1);
  } else if (subject === 'sight_words' && profile.totalXp % 100 < xp) {
    profile.levelSightWords = Math.min(5, profile.levelSightWords + 1);
  } else if (subject === 'storytelling' && profile.totalXp % 100 < xp) {
    profile.levelStorytelling = Math.min(5, profile.levelStorytelling + 1);
  }

  saveProfile(profile);
  return profile;
}

export function addLearnedMinutes(minutes: number): StudentProfile {
  const profile = getStoredProfile();
  profile.minutesLearnedToday += minutes;
  saveProfile(profile);
  return profile;
}

export function getStoredBadges(): Badge[] {
  if (typeof window === 'undefined') return INITIAL_BADGES;
  try {
    const raw = localStorage.getItem(BADGES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(INITIAL_BADGES));
      return INITIAL_BADGES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_BADGES;
  }
}

export function unlockBadge(badgeId: string): Badge[] {
  const badges = getStoredBadges();
  const updated = badges.map((b) => {
    if (b.id === badgeId && !b.unlockedAt) {
      return { ...b, unlockedAt: new Date().toISOString() };
    }
    return b;
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function getStoredStories(): StoryBook[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORIES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStory(story: StoryBook): void {
  if (typeof window === 'undefined') return;
  try {
    const stories = getStoredStories();
    const index = stories.findIndex((s) => s.id === story.id);
    if (index >= 0) {
      stories[index] = story;
    } else {
      stories.unshift(story);
    }
    localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(stories));
  } catch (err) {
    console.error('Failed to save story', err);
  }
}

export function getStoredSessionLogs(): LearningSessionLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordSessionLog(log: Omit<LearningSessionLog, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getStoredSessionLogs();
    const newLog: LearningSessionLog = {
      ...log,
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 50 logs
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (err) {
    console.error('Failed to log session', err);
  }
}
