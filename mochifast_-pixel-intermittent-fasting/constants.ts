
import { Accessory } from './types';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: '한국어' },
  { code: 'ja', name: '日本語' },
];

export const APP_NAME_SUGGESTIONS = [
  "CinnamoCloud",
  "SkyBunny IF",
  "MochiOrbit",
  "CloudyQuest",
  "Marshmallow Coach"
];

export const BINNIE_ACCESSORIES: Accessory[] = [
  { id: 'blue_bow', name: 'Blue Ribbon', type: 'head', cost: 10, icon: '🎀' },
  { id: 'crown', name: 'Cloud King', type: 'head', cost: 50, icon: '👑' },
  { id: 'star_wand', name: 'Star Wand', type: 'hand', cost: 25, icon: '🪄' },
  { id: 'angel_wings', name: 'Cloud Wings', type: 'back', cost: 100, icon: '🪽' },
  { id: 'cookie', name: 'Cinnamon Roll', type: 'hand', cost: 5, icon: '🍥' },
  { id: 'beret', name: 'Artist Beret', type: 'head', cost: 30, icon: '🧑‍🎨' },
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    sky: "Sky",
    diet: "Diet",
    talk: "Talk",
    circle: "Circle",
    goal: "Goal",
    prefs: "Prefs",
    fasting_active: "Cloud Flight Active",
    resting: "Resting in Clouds",
    start_quest: "Start Quest",
    end_quest: "Land & Eat",
    biometrics: "Biometrics",
    theme_color: "Theme Color",
    language: "Language",
    id_name: "ID Name",
    buddies: "Your Circle",
    favorite: "Favorite",
    age: "Age",
    stars_btn: "Stars",
    moon_btn: "Gift Moon",
    shop_title: "Cloud Boutique",
    cheat_day: "Cheat Day Mode",
    travel_mode: "Travel Mode",
    height: "Height (cm)",
    coach_name: "CinnamoCoach",
    coach_desc: "AI Sky Support",
    fast_history: "Quest Calendar"
  },
  ko: {
    sky: "하늘",
    diet: "식단",
    talk: "대화",
    circle: "친구",
    goal: "목표",
    prefs: "설정",
    fasting_active: "구름 비행 중",
    resting: "구름 속 휴식",
    start_quest: "퀘스트 시작",
    end_quest: "착륙 및 식사",
    biometrics: "신체 정보",
    theme_color: "테마 색상",
    language: "언어",
    id_name: "아이디",
    buddies: "나의 서클",
    favorite: "즐겨찾기",
    age: "나이",
    stars_btn: "스타즈",
    moon_btn: "달 조각 선물",
    shop_title: "구름 상점",
    cheat_day: "치트 데이",
    travel_mode: "여행 모드",
    height: "키 (cm)",
    coach_name: "시나모코치",
    coach_desc: "AI 하늘 지원",
    fast_history: "퀘스트 캘린더"
  },
  ja: {
    sky: "空",
    diet: "食事",
    talk: "お喋り",
    circle: "サークル",
    goal: "目標",
    prefs: "設定",
    fasting_active: "雲の上を飛行中",
    resting: "雲の中で休憩中",
    start_quest: "クエスト開始",
    end_quest: "着陸して食事",
    biometrics: "バイオメトリクス",
    theme_color: "テーマカラー",
    language: "言語",
    id_name: "ID名",
    buddies: "あなたのサークル",
    favorite: "お気に入り",
    age: "年齢",
    stars_btn: "スター",
    moon_btn: "月の欠片ギフト",
    shop_title: "雲のブティック",
    cheat_day: "チートデイ",
    travel_mode: "旅行モード",
    height: "身長 (cm)",
    coach_name: "シナモコーチ",
    coach_desc: "AIスカイサポート",
    fast_history: "クエストカレンダー"
  }
};

export const MOCHI_QUOTES = {
  NAPPING: [
    "Zzz... dreaming of cinnamon rolls...",
    "Soft clouds everywhere...",
    "Rest is a superpower! *mumble*",
    "I'll wake up when you're ready! Zzz..."
  ],
  FASTING: [
    "You're doing amazing! Flap those ears!",
    "I feel light as a cloud! ✨",
    "Stay hydrated, hopping friend!",
    "Our quest is going great! 🐰"
  ],
  TAPPED: [
    "Eek! That tickles! ^_^",
    "Boop! Love ya! ❤️",
    "Ready for more? Let's go!",
    "You found a moon! Shimmering! 🌙"
  ]
};

export const CALMING_MESSAGES = [
  "Breathe in... hold... breathe out...",
  "Cravings are just clouds passing through your mind.",
  "Drink some cool water and watch the stars.",
  "You're stronger than a cinnamon bun craving!"
];
