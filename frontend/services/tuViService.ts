import { UserDossier, TuViProfile, TuViPalace } from '../types';
import { convertSolar2Lunar, LunarDateResult } from './lunarCalendar';
import { calculateTuViChart } from './tuviEngine';
import { interpretTuViChartAuthentic } from './tuviInterpretationEngine';

export interface LifeDossierTienVan {
  ageRange: string;
  title: string;
  status: string;
  detail: string;
  keyword: string;
  badgeColor: string;
}

export interface LifeDossierPillar {
  id: string;
  title: string;
  subtitle: string;
  keyFact: string;
  deepAnalysis: string;
  advice: string;
  color: string;
}

export interface LifeDestinyDossierData {
  tienVan: LifeDossierTienVan;
  trungVan: LifeDossierTienVan;
  hauVan: LifeDossierTienVan;
  fivePillars: LifeDossierPillar[];
  destinyScores: Array<{
    label: string;
    score: number;
    level: string;
    comment: string;
    color: string;
  }>;
  masterRemedy: {
    luckyColors: string;
    luckyDirections: string;
    goldenHours: string;
    lifeMaxim: string;
  };
}

export interface CompleteTuViBundle {
  profile: TuViProfile;
  profileSummary: TuViProfile;
  palaces: TuViPalace[];
  lunarData: LunarDateResult;
  lifeDossier: LifeDestinyDossierData;
  generalVerdict: string;
}

// Tạo Bảng Chi Tiết Lý Giải Bản Mệnh Cả Đời Chuẩn Xác Cổ Thư Tử Vi
export const generateLifeDestinyDossier = (profile: TuViProfile, palaces?: TuViPalace[]): LifeDestinyDossierData => {
  return interpretTuViChartAuthentic(profile, palaces).lifeDossier;
};

// Hàm tổng hợp trọn bộ Tử Vi & Bản Mệnh cho bất kỳ Hồ Sơ người dùng nào
// BẮT BUỘC: Hồ sơ phải có đầy đủ Họ Tên và Ngày Tháng Năm Sinh thì mới được phép lập lá số xem bói!
export const buildTuViProfileAndLifeDossier = (dossier: UserDossier): CompleteTuViBundle | null => {
  if (!dossier || !dossier.fullName || !dossier.fullName.trim() || dossier.fullName === 'Khách Vãng Lai' || dossier.fullName === 'Hồ sơ trống') {
    return null;
  }

  // Tuyệt đối không tự động bịa ngày sinh khi hồ sơ chưa có ngày sinh
  if (!dossier.birthDate || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(dossier.birthDate.trim())) {
    return null;
  }

  const parts = dossier.birthDate.trim().split('-');
  const sYear = parseInt(parts[0], 10);
  const sMonth = parseInt(parts[1], 10);
  const sDay = parseInt(parts[2], 10);

  if (isNaN(sYear) || isNaN(sMonth) || isNaN(sDay) || sYear < 1920 || sMonth < 1 || sMonth > 12 || sDay < 1 || sDay > 31) {
    return null;
  }

  const birthHour = dossier.birthHour || 'Thìn (07h00 - 09h00)';
  const gender = dossier.gender || 'nam';
  const fullName = dossier.fullName.trim();

  const lunarData = convertSolar2Lunar(sDay, sMonth, sYear);
  const solarStr = `${sYear}-${String(sMonth).padStart(2, '0')}-${String(sDay).padStart(2, '0')}`;
  const lunarStr = `${lunarData.lunarDay}/${lunarData.lunarMonth}/${lunarData.lunarYear}${lunarData.isLeap ? ' (Nhuận)' : ''}`;

  const chart = calculateTuViChart({ calendarType: 'solar', day: sDay, month: sMonth, year: sYear, birthHour, gender });
  const { cungMenh, cungThan, cuc } = chart;
  const calculatedCuc = cuc;
  const palaces: TuViPalace[] = chart.palaces;

  const profile: TuViProfile = {
    fullName,
    gender,
    solarDate: solarStr,
    lunarDate: lunarStr,
    isLeapMonth: lunarData.isLeap,
    birthHour,
    calendarType: 'solar',
    canChiYear: lunarData.canChiYear,
    canChiMonth: lunarData.canChiMonth,
    canChiDay: lunarData.canChiDay,
    menhNguHanh: lunarData.napAm,
    cuc: calculatedCuc,
    cungMenh,
    cungThan
  };

  const interpretation = interpretTuViChartAuthentic(profile, palaces);

  return {
    profile,
    profileSummary: profile,
    palaces,
    lunarData,
    lifeDossier: interpretation.lifeDossier,
    generalVerdict: interpretation.generalVerdict
  };
};


