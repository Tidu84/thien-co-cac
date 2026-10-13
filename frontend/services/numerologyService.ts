import { NumerologyReport, PyramidPeak } from '../types';

/**
 * Bảng chữ cái Pythagoras chuẩn phương Tây:
 * 1: A, J, S
 * 2: B, K, T
 * 3: C, L, U
 * 4: D, M, V
 * 5: E, N, W
 * 6: F, O, X
 * 7: G, P, Y
 * 8: H, Q, Z
 * 9: I, R
 */
const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9
};

// Loại bỏ dấu tiếng Việt để đối chiếu bảng chữ cái Latin
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Kiểm tra nguyên âm tiếng Việt/Anh (A, E, I, O, U và Y linh hoạt)
export function isVowel(char: string, prevChar?: string, nextChar?: string): boolean {
  const c = char.toLowerCase();
  if (['a', 'e', 'i', 'o', 'u'].includes(c)) return true;
  // Ký tự Y: đóng vai trò nguyên âm khi đứng một mình hoặc không đi liền kề trước một nguyên âm khác
  if (c === 'y') {
    if (!prevChar && !nextChar) return true;
    const isPrevVowel = prevChar && ['a', 'e', 'i', 'o', 'u'].includes(prevChar.toLowerCase());
    const isNextVowel = nextChar && ['a', 'e', 'i', 'o', 'u'].includes(nextChar.toLowerCase());
    return !(isPrevVowel || isNextVowel);
  }
  return false;
}

// Rút gọn tổng các chữ số về 1 chữ số (hoặc giữ lại Master Number nếu cần)
export function reduceToSingleDigit(num: number, allowMaster = false): number {
  if (allowMaster && (num === 11 || num === 22 || num === 33)) {
    return num;
  }
  let sum = num;
  while (sum > 9) {
    if (allowMaster && (sum === 11 || sum === 22 || sum === 33)) {
      return sum;
    }
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }
  return sum;
}

/**
 * Tính Con số chủ đạo (Life Path Number / Ruling Number theo trường phái Pythagoras)
 * Ở trường phái Pythagoras phổ biến tại Việt Nam: các số chủ đạo từ 2 đến 11, và đặc biệt là 22/4 (Master Number).
 */
export function calculateLifePathNumber(day: number, month: number, year: number): { number: number; is22_4: boolean } {
  const daySum = reduceToSingleDigit(day);
  const monthSum = reduceToSingleDigit(month);
  const yearSum = reduceToSingleDigit(year);

  // Tổng 3 thành phần
  const total = daySum + monthSum + yearSum;

  if (total === 22) {
    return { number: 4, is22_4: true };
  }

  // Rút gọn nhưng giữ 11
  let lifePath = total;
  while (lifePath > 11) {
    lifePath = String(lifePath).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  return { number: lifePath, is22_4: false };
}

/**
 * Tính Số Linh Hồn (Soul Urge Number) từ tổng nguyên âm trong tên
 */
export function calculateSoulUrgeNumber(cleanName: string): number {
  let sum = 0;
  const letters = cleanName.replace(/[^a-z]/g, '').split('');

  letters.forEach((char, idx) => {
    const prev = letters[idx - 1];
    const next = letters[idx + 1];
    if (isVowel(char, prev, next)) {
      sum += PYTHAGOREAN_MAP[char] || 0;
    }
  });

  return reduceToSingleDigit(sum, true);
}

/**
 * Tính Số Nhân Cách / Biểu Đạt (Personality Number) từ tổng phụ âm trong tên
 */
export function calculatePersonalityNumber(cleanName: string): number {
  let sum = 0;
  const letters = cleanName.replace(/[^a-z]/g, '').split('');

  letters.forEach((char, idx) => {
    const prev = letters[idx - 1];
    const next = letters[idx + 1];
    if (!isVowel(char, prev, next)) {
      sum += PYTHAGOREAN_MAP[char] || 0;
    }
  });

  return reduceToSingleDigit(sum, true);
}

/**
 * Tính Số Sứ Mệnh / Vận Mệnh (Destiny / Expression Number) từ toàn bộ chữ cái
 */
export function calculateDestinyNumber(cleanName: string): number {
  let sum = 0;
  const letters = cleanName.replace(/[^a-z]/g, '').split('');
  letters.forEach(char => {
    sum += PYTHAGOREAN_MAP[char] || 0;
  });
  return reduceToSingleDigit(sum, true);
}

/**
 * Tính Số Thái Độ (Attitude Number) = Ngày sinh + Tháng sinh
 */
export function calculateAttitudeNumber(day: number, month: number): number {
  return reduceToSingleDigit(day + month);
}

/**
 * Tính Năm Cá Nhân (Personal Year):
 * Năm cá nhân = Rút gọn (Ngày sinh + Tháng sinh + Năm hiện tại)
 */
export function calculatePersonalYear(day: number, month: number, currentYear = new Date().getFullYear()): number {
  const dayReduced = reduceToSingleDigit(day);
  const monthReduced = reduceToSingleDigit(month);
  const yearReduced = reduceToSingleDigit(currentYear);
  return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
}

/**
 * Tính 4 Đỉnh Cao Kim Tự Tháp Cuộc Đời (Pyramid Peaks)
 */
export function calculatePyramidPeaks(day: number, month: number, year: number, lifePath: number): PyramidPeak[] {
  const currentYear = new Date().getFullYear();
  const d = reduceToSingleDigit(day);
  const m = reduceToSingleDigit(month);
  const y = reduceToSingleDigit(year);

  // Chân đế kim tự tháp: Tháng (m), Ngày (d), Năm (y)
  // Đỉnh 1 = m + d
  const p1Num = reduceToSingleDigit(m + d);
  // Đỉnh 2 = d + y
  const p2Num = reduceToSingleDigit(d + y);
  // Đỉnh 3 = Đỉnh 1 + Đỉnh 2
  const p3Num = reduceToSingleDigit(p1Num + p2Num);
  // Đỉnh 4 = m + y
  const p4Num = reduceToSingleDigit(m + y);

  // Tuổi đỉnh cao 1 = 36 - Con số chủ đạo
  const baseAge = 36 - (lifePath === 4 ? 4 : lifePath);
  const age1 = Math.max(27, baseAge);
  const age2 = age1 + 9;
  const age3 = age2 + 9;
  const age4 = age3 + 9;

  const peakMeanings: Record<number, string> = {
    1: 'Giai đoạn độc lập, tự chủ, tự kiến tạo sự nghiệp cá nhân và khẳng định cái tôi bản lĩnh.',
    2: 'Giai đoạn phát triển tâm linh, cân bằng cảm xúc, gắn kết quan hệ và lắng nghe trực giác.',
    3: 'Giai đoạn mở mang trí tuệ, du lịch trải nghiệm, bùng nổ năng khiếu sáng tạo và ngôn từ.',
    4: 'Giai đoạn củng cố nền tảng vật chất, xây dựng tài sản bền vững và kỷ luật thực tế.',
    5: 'Giai đoạn bứt phá tự do, chuyển giao cơ hội lớn, thích ứng với những biến động mới.',
    6: 'Giai đoạn thăng hoa tình yêu thương, chăm lo gia đạo và sáng tạo nghệ thuật vị tha.',
    7: 'Giai đoạn học hỏi chiều sâu qua các thử thách, chiêm nghiệm triết lý và nội lực tâm hồn.',
    8: 'Giai đoạn gặt hái thành công tài chính, danh vọng, quyền lực và năng lực lãnh đạo độc lập.',
    9: 'Giai đoạn phụng sự nhân đạo, hoàn thành sứ mệnh lớn và đón nhận sự kính trọng từ cộng đồng.',
    10: 'Giai đoạn chuyển mình vượt bậc, thích nghi xuất sắc và lan tỏa năng lượng tích cực.',
    11: 'Giai đoạn thức tỉnh tâm linh mạnh mẽ, trực giác dẫn lối phụng sự và khai sáng cho tha nhân.'
  };

  return [
    { peakNumber: 1, age: age1, year: year + age1, number: p1Num, meaning: peakMeanings[p1Num] || 'Thời kỳ phát triển' },
    { peakNumber: 2, age: age2, year: year + age2, number: p2Num, meaning: peakMeanings[p2Num] || 'Thời kỳ thịnh vượng' },
    { peakNumber: 3, age: age3, year: year + age3, number: p3Num, meaning: peakMeanings[p3Num] || 'Thời kỳ chín muồi' },
    { peakNumber: 4, age: age4, year: year + age4, number: p4Num, meaning: peakMeanings[p4Num] || 'Thời kỳ viên mãn' }
  ];
}

/**
 * Tổng hợp báo cáo Thần Số Học hoàn chỉnh
 */
export function generateNumerologyReport(fullName: string, birthDate: string): NumerologyReport {
  const parts = birthDate.split('-');
  const year = parseInt(parts[0], 10) || 1990;
  const month = parseInt(parts[1], 10) || 1;
  const day = parseInt(parts[2], 10) || 1;
  const currentCalendarYear = new Date().getFullYear();

  const cleanName = removeVietnameseAccents(fullName);

  const { number: lifePath, is22_4 } = calculateLifePathNumber(day, month, year);
  const soulUrge = calculateSoulUrgeNumber(cleanName);
  const personality = calculatePersonalityNumber(cleanName);
  const destiny = calculateDestinyNumber(cleanName);
  const attitude = calculateAttitudeNumber(day, month);
  const personalYear = calculatePersonalYear(day, month, currentCalendarYear);
  const pyramidPeaks = calculatePyramidPeaks(day, month, year, lifePath);

  // Từ khóa cốt lõi theo số chủ đạo
  const keywordsMap: Record<number, string[]> = {
    2: ['Lắng nghe', 'Hòa giải', 'Nhạy cảm', 'Tâm hồn nghệ sĩ', 'Hợp tác'],
    3: ['Sáng tạo', 'Hài hước', 'Năng động', 'Hoạt ngôn', 'Truyền cảm hứng'],
    4: ['Thực tế', 'Kỷ luật', 'Tỉ mỉ', 'Đáng tin cậy', 'Nền tảng vững chắc'],
    5: ['Tự do', 'Phiêu lưu', 'Đột phá', 'Linh hoạt', 'Thích nghi'],
    6: ['Tình yêu thương', 'Trách nhiệm', 'Nuôi dưỡng', 'Bao dung', 'Mái ấm'],
    7: ['Tri thức', 'Chiêm nghiệm', 'Khám phá bí ẩn', 'Độc lập', 'Trực giác'],
    8: ['Tài chính', 'Điều hành', 'Bản lĩnh', 'Quyền lực', 'Thực tế'],
    9: ['Nhân đạo', 'Lý tưởng', 'Phụng sự', 'Bao dung', 'Cho đi'],
    10: ['Tự tin', 'Thích nghi', 'Quang minh', 'Lãnh đạo', 'Hòa đồng'],
    11: ['Trực giác tâm linh', 'Khai sáng', 'Thấu cảm cao', 'Nhạy bén', 'Tiên tri']
  };

  const masterKeywords = is22_4 ? ['Bậc thầy kiến tạo', 'Tiềm năng vô hạn', 'Tầm nhìn thế kỷ', 'Kỷ luật thép'] : (keywordsMap[lifePath] || ['Tự chủ', 'Bền bỉ']);

  const summaryBrief = is22_4
    ? 'Bạn sở hữu Con số chủ đạo Master 22/4 - Vua của những con số, mang sứ mệnh kiến tạo những công trình và giá trị vĩ đại cho nhân loại.'
    : `Bạn mang Con số chủ đạo ${lifePath}: Người đại diện cho năng lượng ${masterKeywords.slice(0, 3).join(', ')}.`;

  return {
    fullName,
    birthDate,
    lifePathNumber: lifePath,
    isMaster22: is22_4,
    soulUrgeNumber: soulUrge,
    personalityNumber: personality,
    destinyNumber: destiny,
    personalYear,
    currentCalendarYear,
    attitudeNumber: attitude,
    pyramidPeaks,
    coreKeywords: masterKeywords,
    summaryBrief
  };
}
