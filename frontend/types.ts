export type NavTab = 'home' | 'iching' | 'tuvi' | 'love_match' | 'numerology' | 'compass' | 'facepalm' | 'western' | 'history';

export type CharacterMood = 'mysterious' | 'happy' | 'thoughtful' | 'divine' | 'concerned';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'linhnhi';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    targetTab: NavTab;
  };
}

export interface IChingLine {
  value: number; // 6: Lão Âm (biến), 7: Thiếu Dương, 8: Thiếu Âm, 9: Lão Dương (biến)
  isYang: boolean;
  isChanging: boolean;
}

export interface IChingResult {
  hexagramNumber: number;
  name: string;
  meaning: string;
  originalJudgement: string;
  aiExplanation: string;
  lines: IChingLine[];
  transformedHexagram?: {
    number: number;
    name: string;
    meaning: string;
  };
  timestamp: string;
  question: string;
}

export interface TuViProfile {
  fullName: string;
  gender: 'nam' | 'nu';
  solarDate: string; // YYYY-MM-DD
  lunarDate: string; // dd/mm/yyyy Âm lịch
  isLeapMonth?: boolean;
  birthHour: string;
  calendarType: 'solar' | 'lunar';
  canChiYear: string;
  canChiMonth: string;
  canChiDay: string;
  menhNguHanh: string;
  cuc: string;
  cungMenh: string;
  cungThan: string;
}

export interface TuViPalace {
  name: string;
  stars: string[];
  luckScore: number;
  description: string;
}

export interface TarotCard {
  id: string;
  name: string;
  vietnameseName: string;
  image: string;
  keywords: string[];
  meaningUpright: string;
  meaningReversed: string;
}

export interface DivinationRecord {
  id: string;
  type: 'iching' | 'tuvi' | 'love_match' | 'numerology' | 'compass' | 'face' | 'palm' | 'tarot' | 'crystal';
  title: string;
  summary: string;
  fullContent: string;
  date: string;
}

export interface PersonLoveInput {
  name: string;
  gender: 'nam' | 'nu';
  calendarMode: 'solar' | 'lunar';
  day: number;
  month: number;
  year: number;
  isLeapMonth?: boolean;
}

export interface MatchFactor {
  name: string;
  score: number; // Thang 100 hoặc theo trọng số
  maxScore: number;
  status: 'tot' | 'binh' | 'xau';
  title: string;
  description: string;
}

export interface LoveMatchSummary {
  person1: {
    name: string;
    gender: 'nam' | 'nu';
    solarDate: string;
    lunarDate: string;
    canChiYear: string;
    napAm: string;
    cungPhi: string;
  };
  person2: {
    name: string;
    gender: 'nam' | 'nu';
    solarDate: string;
    lunarDate: string;
    canChiYear: string;
    napAm: string;
    cungPhi: string;
  };
  totalScore: number; // 0 - 100
  verdict: string;
  factors: {
    nguHanh: MatchFactor;
    thienCan: MatchFactor;
    diaChi: MatchFactor;
    cungPhi: MatchFactor;
  };
}

// THẦN SỐ HỌC (NUMEROLOGY)
export interface PyramidPeak {
  peakNumber: number;
  age: number;
  year: number;
  number: number;
  meaning: string;
}

export interface NumerologyReport {
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  lifePathNumber: number; // Con số chủ đạo (2 - 11 hoặc 22/4)
  isMaster22: boolean;
  soulUrgeNumber: number; // Con số linh hồn
  personalityNumber: number; // Con số nhân cách / biểu đạt
  destinyNumber: number; // Con số sứ mệnh
  personalYear: number; // Năm cá nhân hiện tại
  currentCalendarYear: number;
  attitudeNumber: number; // Con số thái độ
  pyramidPeaks: PyramidPeak[]; // 4 Đỉnh cao kim tự tháp
  coreKeywords: string[];
  summaryBrief: string;
}

// LA BÀN BÁT TRẠCH PHONG THỦY (FENG SHUI COMPASS)
export type DirectionQuality = 'Sinh Khí' | 'Diên Niên' | 'Thiên Y' | 'Phục Vị' | 'Tuyệt Mệnh' | 'Ngũ Quỷ' | 'Lục Sát' | 'Họa Hại';

export interface CompassDirectionInfo {
  directionName: string; // 'Bắc', 'Đông Bắc', 'Đông', ...
  directionCode: string; // 'N', 'NE', 'E', ...
  degreesRange: [number, number]; // [startDeg, endDeg]
  centerDegree: number;
  element: string; // Thủy, Thổ, Mộc, Hỏa, Kim
  quality: DirectionQuality;
  isGood: boolean;
  starName: string; // Tham Lang, Cự Môn, Vũ Khúc,...
  meaning: string;
  advice: string;
}

export interface CompassProfile {
  name: string;
  gender: 'nam' | 'nu';
  birthYear: number;
  canChiYear: string;
  napAm: string;
  cungPhi: string; // Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài
  menhQuai: string; // 'Đông Tứ Mệnh' | 'Tây Tứ Mệnh'
  directions: CompassDirectionInfo[];
}
