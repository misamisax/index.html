
export enum FastingState {
  EATING = 'EATING',
  FASTING = 'FASTING',
}

export type AppLanguage = 'en' | 'ko' | 'ja';
export type ThemeColor = 'blue' | 'pink';

export interface Accessory {
  id: string;
  name: string;
  type: 'head' | 'hand' | 'back';
  cost: number;
  icon: string;
}

export interface PFC {
  protein: number;
  fats: number;
  carbs: number;
  calories: number;
}

export interface MealRecord {
  id: string;
  name: string;
  timestamp: number;
  pfc: PFC;
}

export interface FastingHistoryRecord {
  id: string;
  startTime: number;
  endTime: number;
  goalHours: number;
  success: boolean;
  mode?: 'normal' | 'cheat' | 'travel';
}

export interface SleepRecord {
  id: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

export interface WeightRecord {
  date: string;
  timestamp: number;
  weight: number;
  bmi?: number;
  bodyFatPercent?: number;
  bodyFatKg?: number;
  visceralFat?: number;
  muscleMass?: number;
  bmr?: number;
}

export interface Buddy {
  id: string;
  name: string;
  inviteCode?: string;
  isFasting: boolean;
  isOnline: boolean;
  streak: number;
  weightLost: number;
  isFavorite: boolean;
  order: number;
  lastActionTime?: number;
}

export interface SocialNotification {
  id: string;
  from: string;
  type: 'star' | 'moon' | 'message' | 'fast_start';
  content?: string;
  timestamp: number;
  read: boolean;
}

export interface WeeklyReview {
  id: string;
  date: string;
  content: string;
  score: number;
}

export interface AppState {
  userProfile: {
    name: string;
    height: number;
    initialWeight: number;
    targetWeight: number;
    age: number;
    sex: 'male' | 'female' | 'other';
    language: AppLanguage;
    themeColor: ThemeColor;
  };
  customGoals: {
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    sleepHours: number;
  };
  inviteCode: string;
  isDarkMode: boolean;
  isCheatDay: boolean;
  isTravelMode: boolean;
  currentFastingState: FastingState;
  fastStartTime: number | null;
  fastDurationGoal: number;
  currentSleepStartTime: number | null;
  sleepLogs: SleepRecord[];
  weightLogs: WeightRecord[];
  mealLogs: MealRecord[];
  fastingHistory: FastingHistoryRecord[];
  weeklyReviews: WeeklyReview[];
  ownedAccessories: string[];
  activeAccessories: { head?: string; hand?: string; back?: string };
  waterIntake: number;
  waterGoal: number;
  streak: number;
  collectedItems: number; // Moon Shards
  starsReceived: number;
  notifications: SocialNotification[];
  settings: {
    notifications: boolean;
    reminders: boolean;
  };
  buddies: Buddy[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
