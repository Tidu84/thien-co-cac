import { CELESTIAL_STEMS, TERRESTRIAL_BRANCHES, getCanChiNapAm, HoaGiapEntry } from '../constants';

/**
 * Thuật toán thiên văn chuyển đổi Lịch Âm Dương Việt Nam (Múi giờ GMT+7)
 * Tính điểm Sóc (New Moon) và Tiết Khí dựa trên cơ học thiên thể Jean Meeus
 */

const PI = Math.PI;

// Chuyển ngày Dương lịch sang Julian Day Number (JDN)
export function jdFromDate(dd: number, mm: number, yy: number): number {
  let y = yy;
  let m = mm;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dd + b - 1524.5;
}

// Chuyển Julian Day Number sang ngày Dương lịch (dd, mm, yyyy)
export function jdToDate(jd: number): { day: number; month: number; year: number } {
  const z = Math.floor(jd + 0.5);
  const f = (jd + 0.5) - z;
  let alpha = Math.floor((z - 1867216.25) / 36524.25);
  let a = z + 1 + alpha - Math.floor(alpha / 4);
  let b = a + 1524;
  let c = Math.floor((b - 122.1) / 365.25);
  let d = Math.floor(365.25 * c);
  let e = Math.floor((b - d) / 30.6001);
  let day = b - d - Math.floor(30.6001 * e) + f;
  let month = e < 14 ? e - 1 : e - 13;
  let year = month > 2 ? c - 4716 : c - 4715;
  return { day: Math.floor(day), month, year };
}

// Tính điểm Sóc (New Moon) theo chỉ số k
function getNewMoonDay(k: number, timezone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  // Mặt trời & Mặt trăng bất thường
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * dr * F) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -= 0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 += 0.0010 * Math.sin((2 * F - Mpr) * dr) + 0.0005 * Math.sin((M + 2 * Mpr) * dr);

  const JdNew = Jd1 + C1;
  return Math.floor(JdNew + 0.5 + timezone / 24);
}

// Kinh độ Mặt Trời (Sun Longitude) tại thời điểm JD
function getSunLongitude(jdn: number, timezone = 7): number {
  const T = (jdn - 2451545.0 - timezone / 24) / 36525;
  const dr = PI / 180;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.5291 + 35999.0503 * T - 0.0001603 * T * T;
  const C = (1.9146 - 0.004817 * T) * Math.sin(M * dr) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.00029 * Math.sin(3 * M * dr);
  let theta = L0 + C;
  theta = (theta % 360 + 360) % 360;
  return Math.floor(theta / 30);
}

export interface LunarDateResult {
  lunarDay: number;
  lunarMonth: number;
  lunarYear: number;
  isLeap: boolean;
  canChiYear: string;
  canChiMonth: string;
  canChiDay: string;
  napAm: string;
  solarDay: number;
  solarMonth: number;
  solarYear: number;
}

/**
 * Đổi ngày Dương lịch sang Âm lịch (Việt Nam UTC+7)
 */
export function convertSolar2Lunar(dd: number, mm: number, yy: number, timezone = 7): LunarDateResult {
  const currentJd = jdFromDate(dd, mm, yy);
  const k = Math.floor((currentJd - 2415021.0769986) / 29.530588853);
  
  let nm = getNewMoonDay(k + 1, timezone);
  let knm = k + 1;
  if (nm > currentJd) {
    nm = getNewMoonDay(k, timezone);
    knm = k;
  }

  // Ngày âm lịch = Ngày hiện tại - Ngày sóc + 1
  const lunarDay = currentJd - nm + 1;

  // Tìm tháng 11 âm lịch (tháng chứa Đông Chí) của năm trước và năm nay
  const a11 = getSunLongitude(nm, timezone);
  
  // Lấy các điểm Sóc quanh năm
  let k11 = Math.floor((jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853);
  while (getSunLongitude(getNewMoonDay(k11, timezone), timezone) !== 8) {
    k11--;
  }
  let nm11 = getNewMoonDay(k11, timezone);
  if (currentJd < nm11) {
    k11 = Math.floor((jdFromDate(31, 12, yy - 1) - 2415021.0769986) / 29.530588853);
    while (getSunLongitude(getNewMoonDay(k11, timezone), timezone) !== 8) {
      k11--;
    }
  }

  let offset = knm - k11;
  let leapMonthDiff = 0;
  let isLeap = false;

  // Kiểm tra tháng nhuận
  const k11Next = k11 + 12;
  let hasLeap = false;
  let leapIndex = -1;
  let prevSun = 8;

  for (let i = 1; i <= 14; i++) {
    const sunLong = getSunLongitude(getNewMoonDay(k11 + i, timezone), timezone);
    if (sunLong === prevSun) {
      hasLeap = true;
      leapIndex = i;
      break;
    }
    prevSun = sunLong;
  }

  let lunarMonth = offset + 11;
  if (hasLeap && offset >= leapIndex) {
    if (offset === leapIndex) {
      isLeap = true;
      lunarMonth = offset + 10;
    } else {
      lunarMonth = offset + 10;
    }
  }

  let lunarYear = yy;
  if (lunarMonth > 12) {
    lunarMonth -= 12;
  } else if (lunarMonth < 1) {
    lunarMonth += 12;
    lunarYear -= 1;
  }
  
  // Nếu tháng 11, 12 rơi vào đầu năm dương
  if (mm <= 2 && lunarMonth >= 11) {
    lunarYear = yy - 1;
  }

  // Tra Can Chi Năm và Nạp Âm từ constants Lục Thập Hoa Giáp
  const hoaGiap = getCanChiNapAm(lunarYear);

  // Tính Can Chi Tháng
  // Can tháng = (Can Năm * 2 + Tháng Âm + 1) % 10
  const yearStemIdx = (lunarYear - 4) % 10 >= 0 ? (lunarYear - 4) % 10 : (lunarYear - 4) % 10 + 10;
  const monthStemIdx = (yearStemIdx * 2 + lunarMonth + 1) % 10;
  const monthBranchIdx = (lunarMonth + 1) % 12; // Tháng 1 là Dần (2), tháng 2 Mão (3)...
  const canChiMonth = `${CELESTIAL_STEMS[monthStemIdx]} ${TERRESTRIAL_BRANCHES[monthBranchIdx]}`;

  // Tính Can Chi Ngày theo Julian Day Number
  // JD 2451545 (1/1/2000) là ngày Mậu Ngọ (Canh 4, Chi 6)
  const dayStemIdx = Math.floor(currentJd + 9.5) % 10;
  const dayBranchIdx = Math.floor(currentJd + 1.5) % 12;
  const canChiDay = `${CELESTIAL_STEMS[dayStemIdx]} ${TERRESTRIAL_BRANCHES[dayBranchIdx]}`;

  return {
    lunarDay,
    lunarMonth,
    lunarYear,
    isLeap,
    canChiYear: hoaGiap.canChi,
    canChiMonth,
    canChiDay,
    napAm: hoaGiap.napAm,
    solarDay: dd,
    solarMonth: mm,
    solarYear: yy
  };
}

/**
 * Đổi ngày Âm lịch sang Dương lịch (Việt Nam UTC+7)
 */
export function convertLunar2Solar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  isLeapMonth = false,
  timezone = 7
): { day: number; month: number; year: number; canChiYear: string; canChiMonth: string; canChiDay: string; napAm: string } {
  // Tìm tháng 11 năm trước
  let k11 = Math.floor((jdFromDate(31, 12, lunarYear - 1) - 2415021.0769986) / 29.530588853);
  while (getSunLongitude(getNewMoonDay(k11, timezone), timezone) !== 8) {
    k11--;
  }

  // Tìm tháng nhuận nếu có
  let hasLeap = false;
  let leapIndex = -1;
  let prevSun = 8;
  for (let i = 1; i <= 14; i++) {
    const sunLong = getSunLongitude(getNewMoonDay(k11 + i, timezone), timezone);
    if (sunLong === prevSun) {
      hasLeap = true;
      leapIndex = i;
      break;
    }
    prevSun = sunLong;
  }

  let offset = lunarMonth - 11;
  if (offset < 0) offset += 12;

  if (hasLeap && leapIndex <= offset + 1) {
    if (isLeapMonth && offset + 1 === leapIndex) {
      offset = leapIndex;
    } else if (offset + 1 >= leapIndex) {
      offset += 1;
    }
  }

  const newMoonJd = getNewMoonDay(k11 + offset, timezone);
  const targetJd = newMoonJd + lunarDay - 1;
  const dateObj = jdToDate(targetJd);

  // Lấy can chi ngày tháng
  const full = convertSolar2Lunar(dateObj.day, dateObj.month, dateObj.year, timezone);

  return {
    day: dateObj.day,
    month: dateObj.month,
    year: dateObj.year,
    canChiYear: full.canChiYear,
    canChiMonth: full.canChiMonth,
    canChiDay: full.canChiDay,
    napAm: full.napAm
  };
}
