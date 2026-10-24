import { convertSolar2Lunar, convertLunar2Solar, LunarDateResult } from './lunarCalendar';
import { PersonLoveInput, LoveMatchSummary, MatchFactor } from '../types';

/**
 * Tính Cung Phi Bát Trạch chuẩn xác cho Nam và Nữ theo năm sinh Âm lịch
 * 1: Khảm (Thủy), 2: Khôn (Thổ), 3: Chấn (Mộc), 4: Tốn (Mộc), 5: (Nam=Khôn, Nữ=Cấn),
 * 6: Càn (Kim), 7: Đoài (Kim), 8: Cấn (Thổ), 9: Ly (Hỏa).
 */
export function calculateCungPhi(lunarYear: number, gender: 'nam' | 'nu'): { cung: string; hanh: string; code: number } {
  // Tổng các chữ số năm sinh
  let sum = String(lunarYear).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9) {
    sum = String(sum).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  }

  let code = 1;
  if (lunarYear < 2000) {
    if (gender === 'nam') {
      code = (11 - sum) % 9;
      if (code === 0) code = 9;
    } else {
      code = (4 + sum) % 9;
      if (code === 0) code = 9;
    }
  } else {
    // Năm từ 2000 trở đi
    if (gender === 'nam') {
      code = (10 - sum) % 9;
      if (code === 0) code = 9;
    } else {
      code = (5 + sum) % 9;
      if (code === 0) code = 9;
    }
  }

  // Quy chuẩn số 5: Nam quy về Khôn (2), Nữ quy về Cấn (8)
  if (code === 5) {
    code = gender === 'nam' ? 2 : 8;
  }

  const cungMap: Record<number, { cung: string; hanh: string }> = {
    1: { cung: 'Khảm', hanh: 'Thủy' },
    2: { cung: 'Khôn', hanh: 'Thổ' },
    3: { cung: 'Chấn', hanh: 'Mộc' },
    4: { cung: 'Tốn', hanh: 'Mộc' },
    6: { cung: 'Càn', hanh: 'Kim' },
    7: { cung: 'Đoài', hanh: 'Kim' },
    8: { cung: 'Cấn', hanh: 'Thổ' },
    9: { cung: 'Ly', hanh: 'Hỏa' },
  };

  const res = cungMap[code] || { cung: 'Càn', hanh: 'Kim' };
  return { cung: res.cung, hanh: res.hanh, code };
}

/**
 * Ma trận kết hợp Cung Phi Bát Trạch (8 cung phối biến: Sinh Khí, Diên Niên, Thiên Y, Phục Vị / Tuyệt Mệnh, Ngũ Quỷ, Lục Sát, Họa Hại)
 */
export function evaluateBatTrach(cung1: string, cung2: string): { type: string; rating: 'tot' | 'binh' | 'xau'; points: number; desc: string } {
  const pair = [cung1, cung2].sort().join('-');

  // Các cặp Sinh Khí (Thượng cát - 25đ)
  const sinhKhiPairs = ['Càn-Đoài', 'Cấn-Khôn', 'Chấn-Ly', 'Khảm-Tốn'];
  // Các cặp Diên Niên / Phúc Đức (Thượng cát - 23đ)
  const dienNienPairs = ['Càn-Khôn', 'Cấn-Đoài', 'Chấn-Tốn', 'Khảm-Ly'];
  // Các cặp Thiên Y (Trung cát - 20đ)
  const thienYPairs = ['Càn-Cấn', 'Đoài-Khôn', 'Chấn-Khảm', 'Ly-Tốn'];
  // Các cặp Phục Vị (Tiểu cát - 18đ)
  const phucViPairs = ['Càn-Càn', 'Đoài-Đoài', 'Khôn-Khôn', 'Cấn-Cấn', 'Khảm-Khảm', 'Ly-Ly', 'Chấn-Chấn', 'Tốn-Tốn'];

  // Các cặp Hung hại
  // Tuyệt Mệnh (Đại hung - 3đ)
  const tuyetMenhPairs = ['Càn-Ly', 'Đoài-Chấn', 'Khôn-Khảm', 'Cấn-Tốn'];
  // Ngũ Quỷ (Đại hung - 5đ)
  const nguQuyPairs = ['Càn-Chấn', 'Đoài-Ly', 'Khôn-Tốn', 'Cấn-Khảm'];
  // Lục Sát (Thứ hung - 8đ)
  const lucSatPairs = ['Càn-Khảm', 'Đoài-Tốn', 'Khôn-Chấn', 'Cấn-Ly'];
  // Họa Hại (Tiểu hung - 10đ)
  const hoaHaiPairs = ['Càn-Tốn', 'Đoài-Khảm', 'Khôn-Ly', 'Cấn-Chấn'];

  if (sinhKhiPairs.includes(pair)) {
    return { type: 'Sinh Khí', rating: 'tot', points: 25, desc: 'Đại cát lợi! Sinh khí dồi dào, con cái thông minh hiếu thảo, gia đạo thịnh vượng phú quý.' };
  }
  if (dienNienPairs.includes(pair)) {
    return { type: 'Diên Niên (Phước Đức)', rating: 'tot', points: 23, desc: 'Thượng cát! Vợ chồng thủy chung gắn kết bền chặt trọn đời, hậu vận an khang.' };
  }
  if (thienYPairs.includes(pair)) {
    return { type: 'Thiên Y', rating: 'tot', points: 20, desc: 'Cát lành! Được trời phật che chở, sức khỏe khang kiện, tài lộc hanh thông bền vững.' };
  }
  if (phucViPairs.includes(pair)) {
    return { type: 'Phục Vị', rating: 'tot', points: 18, desc: 'Tiểu cát bình an! Tình cảm ổn định, tương trợ lẫn nhau vượt qua phong ba.' };
  }
  if (hoaHaiPairs.includes(pair)) {
    return { type: 'Họa Hại', rating: 'binh', points: 10, desc: 'Dễ xảy ra bất đồng khẩu thiệt, cần nhường nhịn và học đức bao dung để giữ hòa khí.' };
  }
  if (lucSatPairs.includes(pair)) {
    return { type: 'Lục Sát', rating: 'xau', points: 8, desc: 'Dễ gặp xáo trộn trong tình cảm hoặc công việc, cần hóa giải bằng hướng nhà hoặc sinh con hòa hợp.' };
  }
  if (nguQuyPairs.includes(pair)) {
    return { type: 'Ngũ Quỷ', rating: 'xau', points: 5, desc: 'Dễ bị hao tài thị phi hoặc tâm tính nóng nảy, nên hướng thiện và đặt bếp hướng lành.' };
  }
  if (tuyetMenhPairs.includes(pair)) {
    return { type: 'Tuyệt Mệnh', rating: 'xau', points: 3, desc: 'Xung khắc mạnh về Bát Trạch, hôn nhân cần nhiều bao dung, nhẫn nhịn và cầu an tích phúc.' };
  }

  return { type: 'Bình Hòa', rating: 'binh', points: 15, desc: 'Âm dương quân bình, vạn sự do hai người cùng vun đắp.' };
}

/**
 * Đánh giá Thiên Can
 */
export function evaluateThienCan(can1: string, can2: string): { status: 'tot' | 'binh' | 'xau'; points: number; title: string; desc: string } {
  const hopCan: Record<string, string> = {
    'Giáp': 'Kỷ', 'Kỷ': 'Giáp',
    'Ất': 'Canh', 'Canh': 'Ất',
    'Bính': 'Tân', 'Tân': 'Bính',
    'Đinh': 'Nhâm', 'Nhâm': 'Đinh',
    'Mậu': 'Quý', 'Quý': 'Mậu'
  };

  const khacCan: Record<string, string[]> = {
    'Giáp': ['Mậu', 'Canh'],
    'Ất': ['Kỷ', 'Tân'],
    'Bính': ['Canh', 'Nhâm'],
    'Đinh': ['Tân', 'Quý'],
    'Mậu': ['Nhâm', 'Giáp'],
    'Kỷ': ['Quý', 'Ất'],
    'Canh': ['Giáp', 'Bính'],
    'Tân': ['Ất', 'Đinh'],
    'Nhâm': ['Bính', 'Mậu'],
    'Quý': ['Đinh', 'Kỷ']
  };

  if (hopCan[can1] === can2) {
    return {
      status: 'tot',
      points: 20,
      title: `Tương Hợp (${can1} hợp ${can2})`,
      desc: 'Can hòa hợp tạo sinh khí may mắn, vợ chồng đồng lòng tát biển Đông cũng cạn.'
    };
  }

  if (khacCan[can1]?.includes(can2) || khacCan[can2]?.includes(can1)) {
    return {
      status: 'xau',
      points: 7,
      title: `Tương Khắc (${can1} khắc ${can2})`,
      desc: 'Thiên can tương khắc, dễ có lúc bất đồng quan điểm cá nhân, cần lắng nghe và tôn trọng nhau.'
    };
  }

  return {
    status: 'binh',
    points: 15,
    title: `Bình Hòa (${can1} - ${can2})`,
    desc: 'Không tương hợp cũng không tương hại, hai bên hòa thuận tự nhiên.'
  };
}

/**
 * Đánh giá Địa Chi (Lục Hợp, Tam Hợp, Tứ Hành Xung, Lục Hại)
 */
export function evaluateDiaChi(chi1: string, chi2: string): { status: 'tot' | 'binh' | 'xau'; points: number; title: string; desc: string } {
  const pair = [chi1, chi2].sort().join('-');

  // Lục hợp
  const lucHop = ['Sửu-Tý', 'Dần-Hợi', 'Mão-Tuất', 'Dậu-Thìn', 'Thân-Tỵ', 'Mùi-Ngọ'];
  // Tam hợp
  const tamHopGroups = [
    ['Thân', 'Tý', 'Thìn'],
    ['Dần', 'Ngọ', 'Tuất'],
    ['Tỵ', 'Dậu', 'Sửu'],
    ['Hợi', 'Mão', 'Mùi']
  ];
  const isTamHop = tamHopGroups.some(group => group.includes(chi1) && group.includes(chi2));

  // Tứ hành xung (Lục xung trực diện)
  const trucXung = ['Ngọ-Tý', 'Dậu-Mão', 'Dần-Thân', 'Hợi-Tỵ', 'Thìn-Tuất', 'Mùi-Sửu'];

  // Lục hại
  const lucHai = ['Mùi-Tý', 'Ngọ-Sửu', 'Dần-Tỵ', 'Mão-Thìn', 'Hợi-Thân', 'Dậu-Tuất'];

  if (lucHop.includes(pair)) {
    return {
      status: 'tot',
      points: 25,
      title: `Lục Hợp (${chi1} & ${chi2})`,
      desc: 'Địa chi Lục Hợp là duyên trời tác hợp sâu sắc, vạn sự tương trợ hòa thuận như cá gặp nước.'
    };
  }

  if (isTamHop) {
    return {
      status: 'tot',
      points: 23,
      title: `Tam Hợp (${chi1} & ${chi2})`,
      desc: 'Nằm trong vòng Tam Hợp quý nhân, gia đạo an vui, làm ăn kinh doanh phát đạt thịnh vượng.'
    };
  }

  if (trucXung.includes(pair)) {
    return {
      status: 'xau',
      points: 5,
      title: `Lục Xung (${chi1} xung ${chi2})`,
      desc: 'Địa chi chính xung, tính cách dễ có nét đối lập, cần nhẫn nại và tránh to tiếng lúc nóng giận.'
    };
  }

  if (lucHai.includes(pair)) {
    return {
      status: 'xau',
      points: 8,
      title: `Lục Hại (${chi1} hại ${chi2})`,
      desc: 'Phạm vào thế Lục Hại, nên tránh nghi kỵ lẫn nhau, cùng xây đắp niềm tin vững chắc.'
    };
  }

  if (chi1 === chi2) {
    return {
      status: 'binh',
      points: 15,
      title: `Đồng Chi (${chi1} - ${chi2})`,
      desc: 'Cùng tuổi, tâm tính tương đồng, dễ thấu hiểu suy nghĩ và thói quen của nhau.'
    };
  }

  return {
    status: 'binh',
    points: 16,
    title: `Bình Hòa (${chi1} - ${chi2})`,
    desc: 'Địa chi không xung không phạm, tương sinh tương trợ ôn hòa.'
  };
}

/**
 * Đánh giá Ngũ Hành Nạp Âm
 */
export function evaluateNguHanh(hanh1: string, napAm1: string, hanh2: string, napAm2: string): { status: 'tot' | 'binh' | 'xau'; points: number; title: string; desc: string } {
  // Quy luật tương sinh: Kim sinh Thủy, Thủy sinh Mộc, Mộc sinh Hỏa, Hỏa sinh Thổ, Thổ sinh Kim
  const sinhMap: Record<string, string> = {
    'Kim': 'Thủy',
    'Thủy': 'Mộc',
    'Mộc': 'Hỏa',
    'Hỏa': 'Thổ',
    'Thổ': 'Kim'
  };

  // Quy luật tương khắc: Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy, Thủy khắc Hỏa, Hỏa khắc Kim
  const khacMap: Record<string, string> = {
    'Kim': 'Mộc',
    'Mộc': 'Thổ',
    'Thổ': 'Thủy',
    'Thủy': 'Hỏa',
    'Hỏa': 'Kim'
  };

  // Kiểm tra tương sinh
  if (sinhMap[hanh1] === hanh2 || sinhMap[hanh2] === hanh1) {
    const whoSinhWho = sinhMap[hanh1] === hanh2 ? `${napAm1} dưỡng ${napAm2}` : `${napAm2} dưỡng ${napAm1}`;
    return {
      status: 'tot',
      points: 30,
      title: `Ngũ Hành Tương Sinh (${whoSinhWho})`,
      desc: 'Bản mệnh tương sinh đắc tài đắc lộc, người này là chỗ dựa vững chãi nâng đỡ phúc khí cho người kia.'
    };
  }

  // Tỉ hòa (Cùng hành)
  if (hanh1 === hanh2) {
    return {
      status: 'tot',
      points: 22,
      title: `Ngũ Hành Tỉ Hòa (${hanh1} & ${hanh2})`,
      desc: 'Cùng bản mệnh ngũ hành, tính khí tương thông, cùng chung chí hướng và mục tiêu xây dựng tổ ấm.'
    };
  }

  // Tương khắc
  if (khacMap[hanh1] === hanh2 || khacMap[hanh2] === hanh1) {
    const whoKhacWho = khacMap[hanh1] === hanh2 ? `${hanh1} khắc ${hanh2}` : `${hanh2} khắc ${hanh1}`;
    return {
      status: 'xau',
      points: 10,
      title: `Ngũ Hành Tương Khắc (${whoKhacWho})`,
      desc: 'Bản mệnh tương khắc, người mang tính cương người mang tính nhu, cần học cách bù trừ và dùng ngũ hành trung gian để hóa giải.'
    };
  }

  return {
    status: 'binh',
    points: 18,
    title: `Bản Mệnh Bình Hòa (${hanh1} - ${hanh2})`,
    desc: 'Không sinh không khắc, vạn sự tương phối tự nhiên.'
  };
}

/**
 * Hàm chính: Tính điểm tổng thể và tổng hợp kết quả đối chiếu Tình Duyên
 */
export function calculateLoveMatch(p1: PersonLoveInput, p2: PersonLoveInput): LoveMatchSummary {
  // Lấy dữ liệu ngày Âm lịch chuẩn thiên văn cho cả 2 người
  let conv1: LunarDateResult;
  let conv2: LunarDateResult;

  if (p1.calendarMode === 'solar') {
    conv1 = convertSolar2Lunar(p1.day, p1.month, p1.year);
  } else {
    const sol = convertLunar2Solar(p1.day, p1.month, p1.year, p1.isLeapMonth);
    conv1 = convertSolar2Lunar(sol.day, sol.month, sol.year);
  }

  if (p2.calendarMode === 'solar') {
    conv2 = convertSolar2Lunar(p2.day, p2.month, p2.year);
  } else {
    const sol = convertLunar2Solar(p2.day, p2.month, p2.year, p2.isLeapMonth);
    conv2 = convertSolar2Lunar(sol.day, sol.month, sol.year);
  }

  // Phân tích Can Chi
  const can1 = conv1.canChiYear.split(' ')[0];
  const chi1 = conv1.canChiYear.split(' ')[1];
  const can2 = conv2.canChiYear.split(' ')[0];
  const chi2 = conv2.canChiYear.split(' ')[1];

  // Phân tích Ngũ Hành Nạp Âm
  const hanh1 = conv1.napAm.split(' ').pop() || 'Kim';
  const hanh2 = conv2.napAm.split(' ').pop() || 'Kim';

  // Phân tích Cung Phi Bát Tự
  const phi1 = calculateCungPhi(conv1.lunarYear, p1.gender);
  const phi2 = calculateCungPhi(conv2.lunarYear, p2.gender);

  // 1. Chấm điểm Ngũ Hành (Tối đa 30 điểm)
  const nguHanhRes = evaluateNguHanh(hanh1, conv1.napAm, hanh2, conv2.napAm);
  const nguHanhFactor: MatchFactor = {
    name: 'Ngũ Hành Nạp Âm',
    score: nguHanhRes.points,
    maxScore: 30,
    status: nguHanhRes.status,
    title: nguHanhRes.title,
    description: nguHanhRes.desc
  };

  // 2. Chấm điểm Địa Chi (Tối đa 25 điểm)
  const diaChiRes = evaluateDiaChi(chi1, chi2);
  const diaChiFactor: MatchFactor = {
    name: 'Địa Chi (Tuổi)',
    score: diaChiRes.points,
    maxScore: 25,
    status: diaChiRes.status,
    title: diaChiRes.title,
    description: diaChiRes.desc
  };

  // 3. Chấm điểm Cung Phi Bát Trạch (Tối đa 25 điểm)
  const cungPhiRes = evaluateBatTrach(phi1.cung, phi2.cung);
  const cungPhiFactor: MatchFactor = {
    name: 'Cung Phi Bát Trạch',
    score: cungPhiRes.points,
    maxScore: 25,
    status: cungPhiRes.rating,
    title: `Phối Cung: ${phi1.cung} - ${phi2.cung} (${cungPhiRes.type})`,
    description: cungPhiRes.desc
  };

  // 4. Chấm điểm Thiên Can (Tối đa 20 điểm)
  const thienCanRes = evaluateThienCan(can1, can2);
  const thienCanFactor: MatchFactor = {
    name: 'Thiên Can',
    score: thienCanRes.points,
    maxScore: 20,
    status: thienCanRes.status,
    title: thienCanRes.title,
    description: thienCanRes.desc
  };

  // Tổng điểm 100
  const totalScore = Math.min(100, Math.max(0, nguHanhFactor.score + diaChiFactor.score + cungPhiFactor.score + thienCanFactor.score));

  let verdict = 'Duyên Trời Tác Hợp - Đại Cát Đại Lợi';
  if (totalScore >= 85) {
    verdict = 'Lương Duyên Tiền Định • Đại Cát Hanh Thông';
  } else if (totalScore >= 70) {
    verdict = 'Gia Đạo Hài Hòa • Hậu Vận Hưng Thịnh';
  } else if (totalScore >= 55) {
    verdict = 'Trung Bình Khá • Đồng Lòng Tát Biển Đông';
  } else {
    verdict = 'Tương Khắc Cần Hóa Giải • Đức Năng Thắng Số';
  }

  const p1SolarStr = `${conv1.solarDay}/${conv1.solarMonth}/${conv1.solarYear}`;
  const p1LunarStr = `${conv1.lunarDay}/${conv1.lunarMonth}/${conv1.lunarYear}${conv1.isLeap ? ' (Nhuận)' : ''}`;
  const p2SolarStr = `${conv2.solarDay}/${conv2.solarMonth}/${conv2.solarYear}`;
  const p2LunarStr = `${conv2.lunarDay}/${conv2.lunarMonth}/${conv2.lunarYear}${conv2.isLeap ? ' (Nhuận)' : ''}`;

  return {
    person1: {
      name: p1.name || (p1.gender === 'nam' ? 'Bạn Nam' : 'Bạn Nữ'),
      gender: p1.gender,
      solarDate: p1SolarStr,
      lunarDate: p1LunarStr,
      canChiYear: conv1.canChiYear,
      napAm: conv1.napAm,
      cungPhi: `${phi1.cung} (${phi1.hanh})`
    },
    person2: {
      name: p2.name || (p2.gender === 'nam' ? 'Bạn Nam' : 'Bạn Nữ'),
      gender: p2.gender,
      solarDate: p2SolarStr,
      lunarDate: p2LunarStr,
      canChiYear: conv2.canChiYear,
      napAm: conv2.napAm,
      cungPhi: `${phi2.cung} (${phi2.hanh})`
    },
    totalScore,
    verdict,
    factors: {
      nguHanh: nguHanhFactor,
      diaChi: diaChiFactor,
      cungPhi: cungPhiFactor,
      thienCan: thienCanFactor
    }
  };
}

/**
 * Cấu trúc thông tin Mẫu Người Hợp Duyên Lý Tưởng do Thầy Bói dự đoán trước
 */
export interface CandidateIdealYear {
  year: number;
  canChi: string;
  napAm: string;
  cungPhi: string;
  score: number;
  verdict: string;
  ageDiffText: string;
  reasons: string[];
}

export interface IdealPartnerAdvice {
  userSummary: {
    name: string;
    gender: 'nam' | 'nu';
    canChiYear: string;
    napAm: string;
    hanh: string;
    cungPhi: string;
    lunarYear: number;
  };
  idealCriteria: {
    tamHopBranches: string[];
    lucHopBranch: string;
    sinhHanhList: string[];
    cungPhiGoodList: string[];
    hopCan: string;
  };
  fortuneTellerWords: string;
  topCandidateYears: CandidateIdealYear[];
}

/**
 * Hàm phân tích trước mẫu người hợp với đương số (Proactive Ideal Match Prediction)
 */
export function findIdealPartnerAdvice(p1: PersonLoveInput): IdealPartnerAdvice {
  let conv1: LunarDateResult;
  if (p1.calendarMode === 'solar') {
    conv1 = convertSolar2Lunar(p1.day, p1.month, p1.year);
  } else {
    const sol = convertLunar2Solar(p1.day, p1.month, p1.year, p1.isLeapMonth);
    conv1 = convertSolar2Lunar(sol.day, sol.month, sol.year);
  }

  const can1 = conv1.canChiYear.split(' ')[0];
  const chi1 = conv1.canChiYear.split(' ')[1];
  const hanh1 = conv1.napAm.split(' ').pop() || 'Kim';
  const phi1 = calculateCungPhi(conv1.lunarYear, p1.gender);

  // Nhóm Tam Hợp & Lục Hợp
  const tamHopGroups = [
    ['Thân', 'Tý', 'Thìn'],
    ['Dần', 'Ngọ', 'Tuất'],
    ['Tỵ', 'Dậu', 'Sửu'],
    ['Hợi', 'Mão', 'Mùi']
  ];
  const matchedTamHop = tamHopGroups.find(g => g.includes(chi1))?.filter(c => c !== chi1) || [];

  const lucHopMap: Record<string, string> = {
    'Tý': 'Sửu', 'Sửu': 'Tý',
    'Dần': 'Hợi', 'Hợi': 'Dần',
    'Mão': 'Tuất', 'Tuất': 'Mão',
    'Thìn': 'Dậu', 'Dậu': 'Thìn',
    'Tỵ': 'Thân', 'Thân': 'Tỵ',
    'Ngọ': 'Mùi', 'Mùi': 'Ngọ'
  };
  const lucHopBranch = lucHopMap[chi1] || '';

  // Ngũ hành tương sinh & tương hợp
  const sinhPartnerHanh: Record<string, string[]> = {
    'Kim': ['Thổ (Thổ sinh Kim - dưỡng mệnh)', 'Thủy (Kim sinh Thủy)', 'Kim (Tỉ hòa)'],
    'Thủy': ['Kim (Kim sinh Thủy - dưỡng mệnh)', 'Mộc (Thủy sinh Mộc)', 'Thủy (Tỉ hòa)'],
    'Mộc': ['Thủy (Thủy sinh Mộc - dưỡng mệnh)', 'Hỏa (Mộc sinh Hỏa)', 'Mộc (Tỉ hòa)'],
    'Hỏa': ['Mộc (Mộc sinh Hỏa - dưỡng mệnh)', 'Thổ (Hỏa sinh Thổ)', 'Hỏa (Tỉ hòa)'],
    'Thổ': ['Hỏa (Hỏa sinh Thổ - dưỡng mệnh)', 'Kim (Thổ sinh Kim)', 'Thổ (Tỉ hòa)']
  };

  const hopCanMap: Record<string, string> = {
    'Giáp': 'Kỷ', 'Kỷ': 'Giáp',
    'Ất': 'Canh', 'Canh': 'Ất',
    'Bính': 'Tân', 'Tân': 'Bính',
    'Đinh': 'Nhâm', 'Nhâm': 'Đinh',
    'Mậu': 'Quý', 'Quý': 'Mậu'
  };
  const hopCan = hopCanMap[can1] || '';

  // Bát Trạch phối Cát
  const tayTu = ['Càn', 'Khôn', 'Cấn', 'Đoài'];
  const isTay = tayTu.includes(phi1.cung);
  const cungPhiGoodList = isTay
    ? ['Đoài (Sinh Khí)', 'Khôn (Diên Niên)', 'Cấn (Thiên Y)', 'Càn (Phục Vị)']
    : ['Tốn (Sinh Khí)', 'Ly (Diên Niên)', 'Khảm (Thiên Y)', 'Chấn (Phục Vị)'];

  // Quét các năm sinh tiềm năng xung quanh tuổi đương số (-12 đến +12)
  const candidateList: CandidateIdealYear[] = [];
  const targetGender = p1.gender === 'nam' ? 'nu' : 'nam';
  const startY = p1.year - 12;
  const endY = p1.year + 12;

  for (let y = startY; y <= endY; y++) {
    // Đối soát tượng trưng với ngày 15/6 âm lịch năm y
    const p2Candidate: PersonLoveInput = {
      name: `Ứng viên ${y}`,
      gender: targetGender,
      calendarMode: 'solar',
      day: 15,
      month: 6,
      year: y,
      isLeapMonth: false
    };

    const res = calculateLoveMatch(p1, p2Candidate);

    const diff = p1.year - y;
    let ageDiffText = 'Bằng tuổi';
    if (diff > 0) {
      ageDiffText = p1.gender === 'nam' ? `Kém ${diff} tuổi` : `Lớn hơn ${diff} tuổi`;
    } else if (diff < 0) {
      ageDiffText = p1.gender === 'nam' ? `Lớn hơn ${Math.abs(diff)} tuổi` : `Kém ${Math.abs(diff)} tuổi`;
    }

    const reasons: string[] = [];
    if (res.factors.diaChi.status === 'tot') reasons.push(res.factors.diaChi.title);
    if (res.factors.cungPhi.status === 'tot') reasons.push(res.factors.cungPhi.title);
    if (res.factors.nguHanh.status === 'tot') reasons.push(res.factors.nguHanh.title);
    if (res.factors.thienCan.status === 'tot') reasons.push(res.factors.thienCan.title);

    candidateList.push({
      year: y,
      canChi: res.person2.canChiYear,
      napAm: res.person2.napAm,
      cungPhi: res.person2.cungPhi,
      score: res.totalScore,
      verdict: res.verdict,
      ageDiffText,
      reasons: reasons.slice(0, 3)
    });
  }

  // Sắp xếp các năm sinh có số điểm cao nhất lên đầu
  candidateList.sort((a, b) => b.score - a.score);

  // Lọc ra top 5 năm sinh tuổi vàng phù hợp nhất
  const topCandidateYears = candidateList.slice(0, 5);

  const displayName = p1.name?.trim() || 'con';
  const fortuneTellerWords = `Chào ${displayName}, đường hôn nhân gia đạo là việc trọng đại cả đời. Thầy bấm quẻ Bát Tự Tiền Định cho con: Con là ${p1.gender === 'nam' ? 'Nam' : 'Nữ'} mạng, tuổi ${conv1.canChiYear}, bản mệnh ${conv1.napAm}, Cung Phi ngự tại ${phi1.cung} (${phi1.hanh}).

Theo cổ thư thuật số, để vợ chồng hòa thuận tương kính như tân, con cháu đuề huề, con hợp nhất với người bạn đời mang các nét tướng mệnh:
• Tuổi Địa Chi: Hợp nhất với các tuổi Tam Hợp (${matchedTamHop.join(', ')}) hoặc Lục Hợp (${lucHopBranch}).
• Ngũ Hành Bản Mệnh: Hợp nhất với người mệnh ${sinhPartnerHanh[hanh1]?.[0] || 'tương sinh'}.
• Cung Phi Bát Trạch: Phối Cát với các cung ${isTay ? 'Tây Tứ Mệnh (Đoài, Khôn, Cấn)' : 'Đông Tứ Mệnh (Khảm, Ly, Chấn, Tốn)'}.

Thầy đã xem sẵn cho con các Tuổi Vàng đại cát đại lợi ở bảng bên dưới. Bây giờ con đã có ai trong lòng hoặc đang tìm hiểu ai có ngày tháng năm sinh cụ thể chưa, để thầy đặt quẻ chấm duyên chi tiết cho hai đứa?`;

  return {
    userSummary: {
      name: displayName,
      gender: p1.gender,
      canChiYear: conv1.canChiYear,
      napAm: conv1.napAm,
      hanh: hanh1,
      cungPhi: `${phi1.cung} (${phi1.hanh})`,
      lunarYear: conv1.lunarYear
    },
    idealCriteria: {
      tamHopBranches: matchedTamHop,
      lucHopBranch,
      sinhHanhList: sinhPartnerHanh[hanh1] || [],
      cungPhiGoodList,
      hopCan
    },
    fortuneTellerWords,
    topCandidateYears
  };
}
