import { UserDossier, TuViProfile, TuViPalace } from '../types';
import { 
  PALACES, 
  TERRESTRIAL_BRANCHES, 
  calculateMenhThanPalaces, 
  calculateCuc 
} from '../constants';
import { convertSolar2Lunar, LunarDateResult } from './lunarCalendar';

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

export const getHourBranchIndex = (hourStr: string): number => {
  const branchName = hourStr.split(' ')[0];
  const idx = TERRESTRIAL_BRANCHES.indexOf(branchName);
  return idx >= 0 ? idx : 4;
};

// Tạo Bảng Chi Tiết Lý Giải Bản Mệnh Cả Đời
export const generateLifeDestinyDossier = (profile: TuViProfile): LifeDestinyDossierData => {
  const { menhNguHanh, canChiYear, cuc, cungMenh, cungThan } = profile;

  let element = 'Kim';
  if (menhNguHanh.includes('Mộc')) element = 'Mộc';
  else if (menhNguHanh.includes('Thủy')) element = 'Thủy';
  else if (menhNguHanh.includes('Hỏa')) element = 'Hỏa';
  else if (menhNguHanh.includes('Thổ')) element = 'Thổ';

  const tienVan: LifeDossierTienVan = {
    ageRange: "Thuở ấu thơ đến 30 tuổi",
    title: "Tiền Vận: Trui Rèn Bản Lĩnh & Tích Lũy Căn Cơ",
    status: "Giai đoạn học vấn & lập thân",
    detail: `Thiếu thời của đương số tuổi ${canChiYear} mang tính chất rèn đúc ý chí. Bản tính vốn thông minh, tự lập từ sớm nhưng tiền vận thường trải qua vài phen thử thách trong học vấn hoặc bước đầu lập nghiệp. Đây là lúc trời thử lòng người, tích lũy kiến thức và đạo đức làm bệ phóng vững chãi cho tương lai.`,
    keyword: "Học đạo dưỡng tâm • Không nản chí",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40"
  };

  const trungVan: LifeDossierTienVan = {
    ageRange: "Từ 31 đến 55 tuổi",
    title: "Trung Vận: Thời Kỳ Hoàng Kim & Bứt Phá Công Danh",
    status: "Giai đoạn đại phát tài lộc & lập nghiệp",
    detail: `Bước vào tuổi tam tuần, thiên thời địa lợi nhân hòa hội tụ. Cung Mệnh tại ${cungMenh} phối hợp Thân cư ${cungThan} kích hoạt vượng khí tài lộc. Đây là thời kỳ đương số gặt hái thành công vang dội nhất, gây dựng cơ nghiệp riêng, tiền của dồi dào, có tiếng nói và uy tín trong xã hội.`,
    keyword: "Nắm bắt thời cơ • Tài lộc bùng nổ",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40"
  };

  const hauVan: LifeDossierTienVan = {
    ageRange: "Từ 56 tuổi trở đi",
    title: "Hậu Vận: Viên Mãn Phúc Lộc & Điền Sản Vững Bền",
    status: "Giai đoạn an hưởng & phúc trạch",
    detail: `Hậu vận của đương số đạt được sự an nhàn, điền sản đất đai tích tụ dày dặn. Tâm tính trầm ổn, hướng thiện. Con cháu phương trưởng, thành đạt và hiếu thuận với cha mẹ. Đương số sống thọ, hưởng trọn phúc đức tổ tiên, gia môn vinh hiển muôn phần.`,
    keyword: "Đức năng thắng số • Gia đạo an khang",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
  };

  const fivePillars: LifeDossierPillar[] = [
    {
      id: 'pillar_personality',
      title: 'Căn Khí & Cốt Cách Bản Mệnh',
      subtitle: `Nạp Âm: ${menhNguHanh} • Mệnh tại: ${cungMenh}`,
      color: 'border-yellow-400/40 text-yellow-300 bg-yellow-500/10',
      keyFact: `Khí chất kiên định của hành ${element}`,
      deepAnalysis: `Đương số sinh năm ${canChiYear} nạp âm ${menhNguHanh} là người có nội lực phi thường, trọng chữ tín và sống có nguyên tắc. Bản lĩnh dám nghĩ dám làm, ghét sự giả tạo, luôn sẵn lòng bảo bọc người thân cận. Tuy nhiên, đôi lúc quá cầu toàn, tự ôm đồm nhiều việc khiến tinh thần dễ lao lực.`,
      advice: `Học cách buông bớt sự kiểm soát, lắng nghe trực giác và cho phép bản thân nghỉ ngơi đúng lúc.`
    },
    {
      id: 'pillar_career',
      title: 'Quan Lộc & Con Đường Sự Nghiệp Cả Đời',
      subtitle: `Thân cư ${cungThan} • Cục: ${cuc}`,
      color: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
      keyFact: 'Hợp quản lý độc lập, thương mại hoặc chuyên môn sâu',
      deepAnalysis: `Đường công danh của bạn không thích hợp làm những việc rập khuôn hay phụ thuộc hoàn toàn vào người khác. Bạn phát huy tối đa năng lực khi làm chủ kinh doanh, quản lý đội ngũ, hoạch định chiến lược hoặc làm trong các lĩnh vực tài chính, công nghệ, sáng tạo. Trung vận có quý nhân nâng đỡ nâng tầm sự nghiệp.`,
      advice: `Chọn đối tác hợp mệnh (Thổ hoặc Kim), ký kết văn bản pháp lý minh bạch để tránh thị phi tiểu nhân.`
    },
    {
      id: 'pillar_wealth',
      title: 'Kho Tàng Tài Bạch & Điền Sản Đất Đai',
      subtitle: 'Tụ tài chính ngạch, càng tích lũy càng sung túc',
      color: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
      keyFact: 'Tiền tài đến từ thực lực, hậu vận điền sản bề thế',
      deepAnalysis: `Lá số cho thấy bạn có cung Tài Bạch sáng, khả năng kiếm tiền nhạy bén nhưng thời trẻ dễ chi tiêu rộng rãi cho các mối quan hệ xã giao. Từ 35 tuổi trở đi, dòng tiền ổn định vững chắc, bạn có duyên lớn với bất động sản, đất đai điền trạch và các kênh tài sản giá trị thật.`,
      advice: `Nên biến tiền mặt thành tài sản cố định (nhà đất, vàng) để giữ của bền lâu, tránh đầu tư lướt sóng may rủi.`
    },
    {
      id: 'pillar_love',
      title: 'Hôn Nhân, Phu Thê & Duyên Nợ Cả Đời',
      subtitle: 'Duyên sâu nợ nặng, lạt mềm buộc chặt',
      color: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
      keyFact: 'Kết hôn sau 26–28 tuổi đại cát, bạn đời đồng lòng',
      deepAnalysis: `Chuyện tình cảm của bạn đòi hỏi sự thấu cảm và kiên nhẫn. Bạn đời là người có cá tính, giỏi giang và có trách nhiệm với tổ ấm. Thời kỳ đầu chung sống có thể xảy ra bất đồng quan điểm do cái tôi của hai bên, nhưng sau khi cùng nhau vượt qua thử thách kinh tế thì càng về già càng gắn bó khăng khít.`,
      advice: `Bớt một câu tranh cãi là thêm mười phần phúc khí. Lắng nghe và tôn trọng khoảng trời riêng của bạn đời.`
    },
    {
      id: 'pillar_health',
      title: 'Tật Ách, Sức Khỏe & Đại Hạn Cần Phòng',
      subtitle: 'Điều hòa khí huyết, giữ tâm an lạc',
      color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      keyFact: 'Chú ý hệ tiêu hóa, giấc ngủ và các năm xung chi tuổi',
      deepAnalysis: `Do tính chất công việc nhiều lo toan, bạn cần lưu tâm đến tạng phủ thuộc hành khắc với bản mệnh, đặc biệt là hệ tiêu hóa, dạ dày và chứng đau đầu do căng thẳng. Cần cẩn trọng khi đi lại sông nước hoặc tham gia giao thông vào các tháng giữa năm trong các năm Tý - Ngọ - Mão - Dậu.`,
      advice: `Tập thiền định hoặc thể thao đều đặn, ăn uống thanh đạm, năng làm việc thiện để tiêu tai giải nạn.`
    }
  ];

  const destinyScores = [
    { label: 'Phúc Đức & Quý Nhân', score: 88, level: 'Đại Cát', comment: 'Luôn có lối thoát trong bế tắc, được bề trên che chở', color: 'bg-purple-500' },
    { label: 'Tài Lộc & Điền Sản', score: 86, level: 'Phát Vượng', comment: 'Khả năng tích lũy tiền của rất tốt từ tuổi 35 trở đi', color: 'bg-amber-500' },
    { label: 'Công Danh & Quyền Uy', score: 83, level: 'Thăng Tiến', comment: 'Có tố chất lãnh đạo, được đồng nghiệp nể phục', color: 'bg-emerald-500' },
    { label: 'Duyên Nợ & Hạnh Phúc', score: 80, level: 'Hòa Hợp', comment: 'Trải qua thử thách sẽ viên mãn, bạn đời biết lo toan', color: 'bg-rose-500' },
    { label: 'Khang Ninh & Thọ Trường', score: 90, level: 'Trường Thọ', comment: 'Cốt cách vững vàng, tâm an thì thân thể dẻo dai', color: 'bg-cyan-500' }
  ];

  const masterRemedy = {
    luckyColors: element === 'Kim' ? 'Trắng, Bạc, Ánh Kim, Vàng Đất, Nâu (Thổ sinh Kim)' :
                 element === 'Mộc' ? 'Xanh Lục, Xanh Lam, Đen (Thủy sinh Mộc)' :
                 element === 'Thủy' ? 'Đen, Xanh Dương, Trắng, Ghi Bạc (Kim sinh Thủy)' :
                 element === 'Hỏa' ? 'Đỏ, Hồng, Tím, Xanh Lá (Mộc sinh Hỏa)' :
                 'Vàng, Nâu, Đỏ, Hồng, Tím (Hỏa sinh Thổ)',
    luckyDirections: 'Đông Bắc (Sinh Khí), Tây Bắc (Thiên Y), Tây Nam (Diên Niên)',
    goldenHours: 'Giờ Thìn (07h-09h), Giờ Thân (15h-17h), Giờ Tý (23h-01h)',
    lifeMaxim: 'Đức năng thắng số • Tâm tịnh vạn sự thông • Hiếu kính cha mẹ là phong thủy số một.'
  };

  return { tienVan, trungVan, hauVan, fivePillars, destinyScores, masterRemedy };
};

// Hàm tổng hợp trọn bộ Tử Vi & Bản Mệnh cho bất kỳ Hồ Sơ người dùng nào
export const buildTuViProfileAndLifeDossier = (dossier: UserDossier): CompleteTuViBundle => {
  let sYear = 1984;
  let sMonth = 10;
  let sDay = 10;

  if (dossier.birthDate) {
    const parts = dossier.birthDate.split('-');
    if (parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        sYear = y;
        sMonth = m;
        sDay = d;
      }
    }
  }

  const birthHour = dossier.birthHour || 'Thìn (07h00 - 09h00)';
  const gender = dossier.gender || 'nam';
  const fullName = dossier.fullName.trim() || 'Đương Số';

  const lunarData = convertSolar2Lunar(sDay, sMonth, sYear);
  const solarStr = `${sYear}-${String(sMonth).padStart(2, '0')}-${String(sDay).padStart(2, '0')}`;
  const lunarStr = `${lunarData.lunarDay}/${lunarData.lunarMonth}/${lunarData.lunarYear}${lunarData.isLeap ? ' (Nhuận)' : ''}`;

  const hourIdx = getHourBranchIndex(birthHour);
  const { cungMenh, cungThan, menhBranchIndex } = calculateMenhThanPalaces(lunarData.lunarMonth, hourIdx);
  const calculatedCuc = calculateCuc(lunarData.lunarYear, menhBranchIndex);

  const starSets = [
    ["Tử Vi (Miếu)", "Thiên Phủ (Vượng)", "Hóa Khoa", "Tả Phụ"],
    ["Vũ Khúc (Vượng)", "Thiên Tướng (Đắc)", "Văn Xương", "Thiên Khôi"],
    ["Thái Dương (Miếu)", "Cự Môn (Hãm)", "Hóa Lộc", "Lộc Tồn"],
    ["Liêm Trinh (Đắc)", "Thất Sát (Vượng)", "Thiên Mã", "Long Trì"],
    ["Thiên Đồng (Vượng)", "Thiên Lương (Miếu)", "Hóa Quyền", "Phượng Các"],
    ["Thái Âm (Miếu)", "Hóa Kỵ", "Hữu Bật", "Thiên Việt"]
  ];

  const palaces: TuViPalace[] = PALACES.map((pName, idx) => {
    const palaceBranchIdx = (menhBranchIndex + idx) % 12;
    const branchName = TERRESTRIAL_BRANCHES[palaceBranchIdx];
    const luck = 70 + ((lunarData.lunarYear + idx * 7 + lunarData.lunarDay) % 28);

    return {
      name: pName,
      stars: starSets[idx % starSets.length],
      luckScore: luck,
      description: `Tọa thủ tại cung ${branchName}, đắc hội cát tinh chủ quản.`
    };
  });

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

  const lifeDossier = generateLifeDestinyDossier(profile);

  const generalVerdict = `Đương số ${fullName} sinh năm ${lunarData.canChiYear} (${lunarData.napAm}), Cung Mệnh tọa tại ${cungMenh}, Cung Thân cư ${cungThan}, đắc ${calculatedCuc}. Khí chất thông tuệ, trung vận đại phát, hậu vận hưởng trọn an khang phúc lộc.`;

  return {
    profile,
    profileSummary: profile,
    palaces,
    lunarData,
    lifeDossier,
    generalVerdict
  };
};
