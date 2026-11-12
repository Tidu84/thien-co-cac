import { CELESTIAL_STEMS, PALACES, TERRESTRIAL_BRANCHES, LUC_THAP_HOA_GIAP, calculateMenhThanPalaces } from '../constants';
import { convertLunar2Solar, convertSolar2Lunar, LunarDateResult } from './lunarCalendar';
import { TuViPalace } from '../types';

export type TuViBirthInput = { calendarType: 'solar' | 'lunar'; day: number; month: number; year: number; isLeapMonth?: boolean; birthHour: string | number; gender: 'nam' | 'nu' | 'male' | 'female' };
export interface TuViChart {
  input: TuViBirthInput; solarDate: { day: number; month: number; year: number };
  lunarDate: { day: number; month: number; year: number; isLeap: boolean };
  canChi: { year: string; month: string; day: string; hour: string };
  birthHourBranch: string; menhBranch: string; thanBranch: string; cungMenh: string; cungThan: string;
  cuc: string; cucNumber: number; tuViBranch: string;
  palaces: Array<TuViPalace & { branch: string; branchIndex: number; isMenh: boolean; isThan: boolean }>;
}
const mod = (n: number, base: number) => ((n % base) + base) % base;
const MAIN = [{ name: 'Tử Vi', offset: 0 }, { name: 'Thiên Cơ', offset: -1 }, { name: 'Thái Dương', offset: -3 }, { name: 'Vũ Khúc', offset: -4 }, { name: 'Thiên Đồng', offset: -5 }, { name: 'Liêm Trinh', offset: -8 }];
const TIAN_FU = ['Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương', 'Thất Sát', '', '', '', 'Phá Quân'];
const THAI_TUE = ['Thái Tuế', 'Thiếu Dương', 'Tang Môn', 'Thiếu Âm', 'Quan Phù', 'Tử Phù', 'Tuế Phá', 'Long Đức', 'Bạch Hổ', 'Phúc Đức', 'Điếu Khách', 'Trực Phù'];
const TU_HOA: Record<string, [string, string, string, string]> = {
  Giáp: ['Liêm Trinh', 'Phá Quân', 'Vũ Khúc', 'Thái Dương'], Ất: ['Thiên Cơ', 'Thiên Lương', 'Tử Vi', 'Thái Âm'],
  Bính: ['Thiên Đồng', 'Thiên Cơ', 'Văn Xương', 'Liêm Trinh'], Đinh: ['Thái Âm', 'Thiên Đồng', 'Thiên Cơ', 'Cự Môn'],
  Mậu: ['Tham Lang', 'Thái Âm', 'Hữu Bật', 'Thiên Cơ'], Kỷ: ['Vũ Khúc', 'Tham Lang', 'Thiên Lương', 'Văn Khúc'],
  Canh: ['Thái Dương', 'Vũ Khúc', 'Thái Âm', 'Thiên Đồng'], Tân: ['Cự Môn', 'Thái Dương', 'Văn Khúc', 'Văn Xương'],
  Nhâm: ['Thiên Lương', 'Tử Vi', 'Tả Phụ', 'Vũ Khúc'], Quý: ['Phá Quân', 'Cự Môn', 'Thái Âm', 'Tham Lang'],
};
const LOC_TON: Record<string, number> = { Giáp: 2, Ất: 3, Bính: 5, Mậu: 5, Đinh: 6, Kỷ: 6, Canh: 8, Tân: 9, Nhâm: 11, Quý: 0 };
const CUC_NUM: Record<string, number> = { 'Thủy Nhị Cục': 2, 'Mộc Tam Cục': 3, 'Kim Tứ Cục': 4, 'Thổ Ngũ Cục': 5, 'Hỏa Lục Cục': 6 };

/** Chuyển dương lịch sang âm lịch Việt Nam theo múi giờ UTC+7. */
export const solarToLunar = (day: number, month: number, year: number): LunarDateResult => convertSolar2Lunar(day, month, year, 7);
export function getCanChi(lunar: LunarDateResult, hourIndex: number) {
  const dayCan = CELESTIAL_STEMS.indexOf(lunar.canChiDay.split(' ')[0]);
  const hourCan = mod((dayCan % 5) * 2 + hourIndex, 10);
  return { year: lunar.canChiYear, month: lunar.canChiMonth, day: lunar.canChiDay, hour: `${CELESTIAL_STEMS[hourCan]} ${TERRESTRIAL_BRANCHES[hourIndex]}` };
}
function getHourIndex(hour: string | number): number {
  if (typeof hour === 'number' && Number.isInteger(hour) && hour >= 0 && hour < 12) return hour;
  const index = TERRESTRIAL_BRANCHES.findIndex((branch) => String(hour).trim().toLowerCase().startsWith(branch.toLowerCase()));
  if (index >= 0) return index;
  throw new Error('Giờ sinh chưa hợp lệ. Hãy chọn một trong 12 giờ địa chi.');
}
function ziweiPosition(day: number, cuc: number): number {
  const quotient = Math.ceil(day / cuc), remainder = quotient * cuc - day;
  return mod(2 + quotient - 1 + (remainder % 2 === 0 ? remainder : -remainder), 12);
}

/** Pure calculation core: lập dữ liệu 12 cung, chính tinh, phụ tinh cơ bản và Tứ Hóa. */
export function calculateTuViChart(input: TuViBirthInput): TuViChart {
  const lunar = input.calendarType === 'solar' ? solarToLunar(input.day, input.month, input.year) : (() => {
    const solar = convertLunar2Solar(input.day, input.month, input.year, Boolean(input.isLeapMonth), 7);
    const converted = solarToLunar(solar.day, solar.month, solar.year);
    if (converted.lunarDay !== input.day || converted.lunarMonth !== input.month || converted.lunarYear !== input.year || converted.isLeap !== Boolean(input.isLeapMonth)) throw new Error('Ngày âm lịch hoặc tháng nhuận này không tồn tại trong năm đã chọn.');
    return converted;
  })();
  const hourIndex = getHourIndex(input.birthHour);
  const { cungMenh, cungThan, menhBranchIndex } = calculateMenhThanPalaces(lunar.lunarMonth, hourIndex);
  const yearStemIndexForPalace = CELESTIAL_STEMS.indexOf(lunar.canChiYear.split(' ')[0]);
  const palaceStemAtDan = [2, 4, 6, 8, 0][yearStemIndexForPalace % 5];
  const palaceStem = mod(palaceStemAtDan + menhBranchIndex - 2, 10);
  const palaceCanChi = `${CELESTIAL_STEMS[palaceStem]} ${TERRESTRIAL_BRANCHES[menhBranchIndex]}`;
  const palaceHoaGiap = LUC_THAP_HOA_GIAP.find((entry) => entry.canChi === palaceCanChi);
  if (!palaceHoaGiap) throw new Error(`Can Chi cung Mệnh chưa có trong bảng lục thập hoa giáp: ${palaceCanChi}`);
  const cucElement = palaceHoaGiap.hanh;
  const cuc = cucElement === 'Thủy' ? 'Thủy Nhị Cục' : cucElement === 'Mộc' ? 'Mộc Tam Cục' : cucElement === 'Kim' ? 'Kim Tứ Cục' : cucElement === 'Thổ' ? 'Thổ Ngũ Cục' : 'Hỏa Lục Cục';
  const cucNumber = CUC_NUM[cuc];
  if (!cucNumber) throw new Error(`Không nhận diện được Cục: ${cuc}`);
  const yearCan = lunar.canChiYear.split(' ')[0], yearChiIndex = TERRESTRIAL_BRANCHES.indexOf(lunar.canChiYear.split(' ')[1]);
  const yearStemIndex = CELESTIAL_STEMS.indexOf(yearCan), ziwei = ziweiPosition(lunar.lunarDay, cucNumber), tianFu = mod(10 - ziwei, 12);
  const stars = Array.from({ length: 12 }, () => [] as string[]);
  const put = (branch: number, name: string) => {
    const index = mod(branch, 12);
    if (!Number.isInteger(index) || !stars[index]) {
      throw new Error('Vị trí cung sao không hợp lệ: ' + name + '. Hãy kiểm tra ngày và giờ sinh.');
    }
    stars[index].push(name);
  };
  MAIN.forEach(({ name, offset }) => put(ziwei + offset, name));
  TIAN_FU.forEach((name, offset) => { if (name) put(tianFu + offset, name); });
  const loc = LOC_TON[yearCan];
  if (loc !== undefined) { put(loc, 'Lộc Tồn'); put(loc + 1, 'Kình Dương'); put(loc - 1, 'Đà La'); put(loc + 8, 'Quốc Ấn'); put(loc - 7, 'Đường Phù'); }
  THAI_TUE.forEach((name, offset) => put(yearChiIndex + offset, name));
  const starPosition = (name: string): number => {
    const main = MAIN.find((item) => item.name === name); if (main) return mod(ziwei + main.offset, 12);
    const treasury = TIAN_FU.indexOf(name); if (treasury >= 0) return mod(tianFu + treasury, 12);
    if (name === 'Văn Xương') return mod(10 - hourIndex, 12);
    if (name === 'Văn Khúc') return mod(4 + hourIndex, 12);
    if (name === 'Tả Phụ') return mod(3 + lunar.lunarMonth, 12);
    if (name === 'Hữu Bật') return mod(11 - lunar.lunarMonth, 12);
    return -1;
  };
  (TU_HOA[yearCan] || []).forEach((star, index) => { const pos = starPosition(star); if (pos >= 0) put(pos, ['Hóa Lộc', 'Hóa Quyền', 'Hóa Khoa', 'Hóa Kỵ'][index]); });
  const tsStart: Record<string, number> = { 'Thủy Nhị Cục': 8, 'Mộc Tam Cục': 11, 'Kim Tứ Cục': 5, 'Thổ Ngũ Cục': 8, 'Hỏa Lục Cục': 2 };
  const forward = (yearStemIndex % 2 === 0) === (input.gender === 'nam' || input.gender === 'male');
  ['Tràng Sinh', 'Mộc Dục', 'Quan Đới', 'Lâm Quan', 'Đế Vượng', 'Suy', 'Bệnh', 'Tử', 'Mộ', 'Tuyệt', 'Thai', 'Dưỡng'].forEach((name, step) => put(tsStart[cuc] + (forward ? step : -step), name));
  const thanIndex = mod(2 + lunar.lunarMonth - 1 + hourIndex, 12);
  const palaces = PALACES.map((name, index) => {
    const branchIndex = mod(menhBranchIndex + index, 12), branch = TERRESTRIAL_BRANCHES[branchIndex], isThan = branchIndex === thanIndex;
    return { name, branch, branchIndex, isMenh: index === 0, isThan, stars: stars[branchIndex], description: [`Tọa tại cung ${branch}`, index === 0 ? 'Cung Mệnh' : '', isThan ? 'Thân cư' : ''].filter(Boolean).join(' • ') + '.' };
  });
  return {
    input, solarDate: { day: lunar.solarDay, month: lunar.solarMonth, year: lunar.solarYear },
    lunarDate: { day: lunar.lunarDay, month: lunar.lunarMonth, year: lunar.lunarYear, isLeap: lunar.isLeap },
    canChi: getCanChi(lunar, hourIndex), birthHourBranch: TERRESTRIAL_BRANCHES[hourIndex],
    menhBranch: TERRESTRIAL_BRANCHES[menhBranchIndex], thanBranch: TERRESTRIAL_BRANCHES[thanIndex],
    cungMenh, cungThan, cuc, cucNumber, tuViBranch: TERRESTRIAL_BRANCHES[ziwei], palaces,
  };
}





