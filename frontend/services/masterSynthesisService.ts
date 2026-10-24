import { UserDossier, DivinationRecord } from '../types';
import { buildTuViProfileAndLifeDossier, CompleteTuViBundle } from './tuViService';
import { generateNumerologyReport } from './numerologyService';
import { calculateCungPhi } from './loveMatchService';
import { convertSolar2Lunar, LunarDateResult } from './lunarCalendar';

export type LifeStageKey = 'khoiSinh' | 'tuLuyen' | 'thucChien' | 'hauVan';

export interface DestinyLifeMilestone {
  stageKey: LifeStageKey;
  title: string;
  ageRange: string;
  theme: string;
  icon: string;
  color: string;
  badgeColor: string;
  tuViAspect: string;
  physiognomyAspect: string;
  numerologyAspect: string;
  summary: string;
  remedyAdvice: string;
  isCurrentStage: boolean;
}

export interface CurrentStageAnalysis {
  ageAtCapture: number;
  lunarAge: number;
  captureYear: number;
  captureDateStr: string;
  hasPhoto: boolean;
  stageKey: LifeStageKey;
  stageTitle: string;
  stageAgeRange: string;
  progressPercent: number; // 0 - 100% dòng đời (mốc 0-80 tuổi)
  positionDescription: string;
  facePalmRealtimeReflection: string; // Tướng mạo & chỉ tay thời điểm chụp ảnh phản ánh điều gì
  tuViThanTransition: string; // Sự chuyển giao Mệnh -> Thân trong Tử Vi
  immediateActionAdvice: string; // Lời khuyên hành động ngay ở thời điểm này
  nextStagePreparation: string; // Chuẩn bị cho chặng kế tiếp
}

export interface DestinyDimensionScore {
  category: string;
  score: number;
  level: string;
  icon: string;
  color: string;
  highlight: string;
  deepAnalysis: string;
}

export interface MasterDestinySynthesis {
  personName: string;
  gender: 'nam' | 'nu';
  birthDate: string;
  solarDateStr: string;
  lunarDateStr: string;
  canChiYear: string;
  menhNguHanh: string;
  cuc: string;
  cungMenh: string;
  cungThan: string;
  cungPhi: string;
  cungPhiHanh: string;
  batTrachGroup: string;

  // Tử Vi
  tuViBundle: CompleteTuViBundle;

  // Thần Số Học
  numerology: {
    lifePathNumber: number;
    isMaster22: boolean;
    soulUrgeNumber: number;
    destinyNumber: number;
    personalYear: number;
    coreKeywords: string[];
    brief: string;
  } | null;

  // Phong Thủy Bát Trạch
  fengShui: {
    cung: string;
    hanh: string;
    group: string;
    luckyDirections: string[];
    unluckyDirections: string[];
  };

  // Tướng Pháp & Chỉ Tay
  physiognomy: {
    hasFace: boolean;
    hasPalm: boolean;
    hasBody: boolean;
    faceImage?: string;
    palmImage?: string;
    bodyImage?: string;
    faceVerdict?: string;
    palmVerdict?: string;
    bodyVerdict?: string;
  };

  // Lịch sử bói toán đã lưu
  relatedRecords: {
    total: number;
    tuviCount: number;
    numerologyCount: number;
    facePalmCount: number;
    ichingCount: number;
    tarotCount: number;
    loveMatchCount: number;
    compassCount: number;
  };

  // Đối chiếu tương tác liên ngành (Cross-domain correlation)
  crossDomainInsights: {
    tuViVsPhysiognomy: string;    // Tiên Thiên (Tử Vi) vs Hậu Thiên (Tướng Mạo)
    tuViVsNumerology: string;      // Bản Mệnh vs Con Số Sứ Mệnh Vũ Trụ
    fengShuiHarmonization: string; // Vai trò Địa Khí Bát Trạch hóa giải
    karmaAndFreeWill: string;      // Tướng tùng tâm sinh & Đức năng thắng số
  };

  // 4 Đại Giai Đoạn Vận Mệnh (Khởi Sinh - Tu Luyện - Thực Chiến - Hậu Vận)
  fourLifeStages: DestinyLifeMilestone[];
  currentStageAnalysis: CurrentStageAnalysis;

  // 5 Trục Chỉ Số Vận Mệnh Định Mệnh (0 - 100)
  destinyScores: DestinyDimensionScore[];
  overallDestinyScore: number;
  overallVerdict: string;

  // Toàn văn bài Tổng Luận
  synthesisArticle: string;

  // Tứ Trụ Cải Vận Toàn Thư (Thân - Tâm - Trí - Khí)
  fourPillarsRemedy: {
    tuThan: string;
    duongTam: string;
    luyenTri: string;
    tuKhi: string;
  };
}

/**
 * Xây dựng báo cáo Đại Tổng Luận Vận Mệnh dựa trên tất cả thông tin thu thập được
 */
export function buildMasterDestinySynthesis(
  dossier: UserDossier,
  allRecords: DivinationRecord[] = []
): MasterDestinySynthesis {
  const personName = dossier.fullName.trim() || 'Hữu Duyên Khách';
  const gender = dossier.gender || 'nam';

  // 1. Dữ liệu ngày sinh & Tử Vi
  let y = 1984, m = 10, d = 10;
  if (dossier.birthDate) {
    const parts = dossier.birthDate.split('-');
    if (parts.length === 3) {
      y = parseInt(parts[0], 10) || 1984;
      m = parseInt(parts[1], 10) || 10;
      d = parseInt(parts[2], 10) || 10;
    }
  }

  const birthDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const solarDateStr = `${d}/${m}/${y}`;

  const conv = convertSolar2Lunar(d, m, y);
  const lunarDateStr = `${conv.lunarDay}/${conv.lunarMonth}/${conv.lunarYear}${conv.isLeap ? ' (Nhuận)' : ''} Âm Lịch`;

  // Xây dựng gói Tử Vi Đẩu Số hoàn chỉnh
  const tuViBundle = buildTuViProfileAndLifeDossier(dossier);
  const canChiYear = tuViBundle.profile.canChiYear;
  const menhNguHanh = tuViBundle.profile.menhNguHanh;
  const cuc = tuViBundle.profile.cuc;
  const cungMenh = tuViBundle.profile.cungMenh;
  const cungThan = tuViBundle.profile.cungThan;

  // 2. Thần Số Học Pitago
  let numerologyData: MasterDestinySynthesis['numerology'] = null;
  try {
    const numReport = generateNumerologyReport(personName, birthDateStr);
    numerologyData = {
      lifePathNumber: numReport.lifePathNumber,
      isMaster22: numReport.isMaster22,
      soulUrgeNumber: numReport.soulUrgeNumber,
      destinyNumber: numReport.destinyNumber,
      personalYear: numReport.personalYear,
      coreKeywords: numReport.coreKeywords,
      brief: numReport.summaryBrief
    };
  } catch (e) {
    console.warn("Lỗi tính Thần số học trong Đại tổng luận:", e);
  }

  // 3. Phong Thủy Bát Trạch
  const cungPhiRes = calculateCungPhi(conv.lunarYear, gender);
  const tayTu = ['Càn', 'Khôn', 'Cấn', 'Đoài'];
  const isTayTu = tayTu.includes(cungPhiRes.cung);
  const batTrachGroup = isTayTu ? 'Tây Tứ Mệnh' : 'Đông Tứ Mệnh';

  const luckyDirections = isTayTu
    ? ['Tây (Sinh Khí / Đoài)', 'Tây Nam (Diên Niên / Khôn)', 'Đông Bắc (Thiên Y / Cấn)', 'Tây Bắc (Phục Vị / Càn)']
    : ['Đông Nam (Sinh Khí / Tốn)', 'Nam (Diên Niên / Ly)', 'Đông (Phục Vị / Chấn)', 'Bắc (Thiên Y / Khảm)'];

  const unluckyDirections = isTayTu
    ? ['Nam (Tuyệt Mệnh)', 'Bắc (Lục Sát)', 'Đông (Ngũ Quỷ)', 'Đông Nam (Họa Hại)']
    : ['Tây Nam (Tuyệt Mệnh)', 'Tây Bắc (Lục Sát)', 'Đông Bắc (Ngũ Quỷ)', 'Tây (Họa Hại)'];

  // 4. Nhân Tướng Học & Thủ Tướng Chỉ Tay
  const hasFace = !!dossier.faceImage;
  const hasPalm = !!dossier.palmImage;
  const hasBody = !!dossier.bodyImage;

  // 5. Thống kê lịch sử bói toán của đương số
  const personRecords = allRecords.filter(r => 
    (r.personName && r.personName.trim().toLowerCase() === personName.toLowerCase()) ||
    (r.title && r.title.toLowerCase().includes(personName.toLowerCase()))
  );

  const relatedRecords = {
    total: personRecords.length,
    tuviCount: personRecords.filter(r => r.type === 'tuvi').length,
    numerologyCount: personRecords.filter(r => r.type === 'numerology').length,
    facePalmCount: personRecords.filter(r => r.type === 'face' || r.type === 'palm' || r.type === 'body').length,
    ichingCount: personRecords.filter(r => r.type === 'iching').length,
    tarotCount: personRecords.filter(r => r.type === 'tarot' || r.type === 'crystal').length,
    loveMatchCount: personRecords.filter(r => r.type === 'love_match').length,
    compassCount: personRecords.filter(r => r.type === 'compass').length
  };

  // 6. Luận giải tương tác liên ngành (Cross-domain correlations)
  let tuViVsPhysiognomy = '';
  if (hasFace || hasPalm) {
    tuViVsPhysiognomy = `Cổ nhân có câu: "Tướng tùy tâm sinh, Tướng phá số hay Tướng trợ mệnh". Đương số đã lưu trữ ảnh chụp ${hasFace ? 'Khuôn mặt' : ''} ${hasFace && hasPalm ? 'và' : ''} ${hasPalm ? 'Chỉ tay' : ''} thực tế. Thần thái diện mạo Tam Đình cân phân kết hợp ba trục đại lộ Sinh Đạo - Trí Đạo - Tâm Đạo sâu dài đã bồi đắp nguồn sinh khí hậu thiên dồi dào. Khí sắc tươi nhuận này đóng vai trò như một tấm khiên phong thủy tự nhiên, nâng đỡ Cung Mệnh tại ${cungMenh}, hóa giải những sát tinh hoặc vận hạn gập ghềnh trong lá số Tử Vi, biến nghịch cảnh thành bàn đạp thăng hoa.`;
  } else {
    tuViVsPhysiognomy = `Hiện tại hồ sơ của đương số chưa chụp lưu ảnh tướng mặt và chỉ tay. Theo phép xem tướng số cổ truyền Á Đông, lá số Tử Vi là "Tiên Thiên Thiên Mệnh" (bản thiết kế lúc sinh ra), còn diện mạo và vân tay là "Hậu Thiên Tâm Tính" (sự trui rèn và tích phúc sau này). Khuyên đương số nên mở Camera chụp ảnh tướng mặt và chỉ tay để hệ thống đối chiếu chính xác xem hiện tại tướng mạo đang trợ lực hay làm tiêu hao phúc khí của lá số!`;
  }

  const lifePathNum = numerologyData ? numerologyData.lifePathNumber : 8;
  const tuViVsNumerology = `Sứ mệnh Thần số học của đương số gắn liền với Con số chủ đạo ${lifePathNum}${numerologyData?.isMaster22 ? ' (Master 22/4)' : ''}. Đây là nguồn năng lượng rung động của sự ${numerologyData?.coreKeywords.slice(0, 3).join(', ') || 'kiên định, tài chính và điều hành'}. Khi soi chiếu cùng Cung Mệnh (${cungMenh}) và Cung Quan Lộc của Tử Vi, hai trường năng lượng này tương hỗ nhịp nhàng: Tử Vi định hình thiên thời địa lợi, còn Thần Số Học vạch rõ bài học nhận thức và phương thức hành động để gặt hái thành tựu cao nhất.`;

  const fengShuiHarmonization = `Đương số mang Cung Phi ${cungPhiRes.cung} (${cungPhiRes.hanh}), thuộc nhóm ${batTrachGroup}. Đây là trục năng lượng quyết định sự hòa hợp giữa con người và không gian sinh sống. Việc bài trí hướng bàn làm việc, hướng cửa chính hoặc đầu giường quay về các phương vị Sinh Khí (${luckyDirections[0]}) hoặc Diên Niên (${luckyDirections[1]}) sẽ giúp kích hoạt tài vận cho Cung Tài Bạch và bình an cho Cung Tật Ách của Tử Vi.`;

  const karmaAndFreeWill = `"Đức năng thắng số, Tâm khởi thì tướng đổi, Mệnh định nhưng Vận tùy nhân tác". Đại Tổng Luận này cho thấy bản mệnh của đương số có căn cơ phúc đức dày dặn, hậu vận hưng vượng. Bằng cách giữ tâm từ bi, đối đãi chân thành và sống có kỷ luật, đương số hoàn toàn có thể làm chủ vận mệnh, biến hung thành cát, đạt tới cảnh giới viên mãn cả về tài lộc lẫn đạo đức.`;

  // 7. Xác định thời điểm chụp ảnh & Tính tuổi tại thời khắc chụp ảnh
  const captureRawStr = dossier.faceCapturedAt || dossier.palmCapturedAt || dossier.bodyCapturedAt || dossier.lastUpdated || dossier.createdDate;
  let captureYear = 2026;
  let formattedCaptureDate = 'Thời điểm lưu hồ sơ';
  if (captureRawStr) {
    try {
      const dObj = new Date(captureRawStr);
      if (!isNaN(dObj.getTime())) {
        captureYear = dObj.getFullYear();
        formattedCaptureDate = `${dObj.getDate()}/${dObj.getMonth() + 1}/${dObj.getFullYear()} ${String(dObj.getHours()).padStart(2, '0')}:${String(dObj.getMinutes()).padStart(2, '0')}`;
      }
    } catch {
      captureYear = 2026;
    }
  } else {
    const now = new Date();
    captureYear = 2026;
    formattedCaptureDate = `${now.getDate()}/${now.getMonth() + 1}/2026`;
  }

  // Tuổi dương và tuổi mụ (tuổi ta)
  const ageAtCapture = Math.max(1, captureYear - y);
  const lunarAge = ageAtCapture + 1;

  // Xác định giai đoạn hiện tại trong 4 chặng đường
  let currentStageKey: LifeStageKey = 'thucChien';
  if (ageAtCapture <= 18) {
    currentStageKey = 'khoiSinh';
  } else if (ageAtCapture <= 30) {
    currentStageKey = 'tuLuyen';
  } else if (ageAtCapture <= 50) {
    currentStageKey = 'thucChien';
  } else {
    currentStageKey = 'hauVan';
  }

  // Tiến trình dòng đời (0 - 100%, lấy mốc 80 tuổi làm thước đo hành trình)
  const progressPercent = Math.min(100, Math.max(5, Math.round((ageAtCapture / 80) * 100)));

  // Bốn đại giai đoạn định mệnh
  const fourLifeStages: DestinyLifeMilestone[] = [
    {
      stageKey: 'khoiSinh',
      title: 'Khởi Sinh • Ươm Mầm Tiên Thiên',
      ageRange: '0 – 18 tuổi',
      theme: 'Thụ bẩm khí huyết cha mẹ, ươm mầm căn cốt & tích lũy phúc ấm tổ tiên',
      icon: '🌱',
      color: 'from-sky-500 to-blue-600',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
      tuViAspect: `Cung Mệnh (${cungMenh}) và Cung Phụ Mẫu giữ vai trò chủ đạo. Căn cốt ngũ hành ${menhNguHanh} cùng Cục ${cuc} bắt đầu hấp thụ linh khí trời đất, định hình tính cách nền tảng.`,
      physiognomyAspect: `Thượng Đình (vùng trán từ chân tóc tới chân mày) và hình dáng đôi tai (Luân Quách) biểu lộ trí tuệ bẩm sinh. Gốc đường Sinh Đạo chỉ rõ sự cứng cáp về thể trạng thuở ấu thơ.`,
      numerologyAspect: `Sự thức tỉnh ban sơ của Con số chủ đạo ${lifePathNum}. Đương số bộc lộ thiên hướng tư duy đặc trưng ngay từ trong ghế nhà trường.`,
      summary: `Giai đoạn xây nền đắp móng. Mọi sự bình an thuở nhỏ đều là phúc ấm của gia đình che chở, là hạt giống để chuẩn bị cho những bước nhảy vọt sau này.`,
      remedyAdvice: `Nuôi dưỡng lòng hiếu thảo, rèn luyện thể chất dẻo dai, giữ tâm hồn trong sáng và tiếp thu tri thức văn hóa nền tảng vững vàng.`,
      isCurrentStage: currentStageKey === 'khoiSinh'
    },
    {
      stageKey: 'tuLuyen',
      title: 'Tu Luyện • Trui Rèn Bản Lĩnh',
      ageRange: '19 – 30 tuổi',
      theme: 'Học tập sâu rộng, đối diện thử thách đầu đời, mài gươm luyện ý chí',
      icon: '⚔️',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
      tuViAspect: `Vận hành qua các đại vận tiền tài và thử nghiệp. Cung Mệnh (${cungMenh}) tương tác mạnh mẽ với Cung Nô Bộc và Huynh Đệ, mở rộng quan hệ xã hội và nhận diện quý nhân lẫn tiểu nhân.`,
      physiognomyAspect: `Vùng Ấn Đường (khoảng cách giữa hai đầu chân mày) mở rộng, ánh mắt bắt đầu có chiều sâu và sự quyết liệt. Điểm giao giữa Sinh Đạo và Trí Đạo phân nhánh rõ ràng định hình nghề nghiệp.`,
      numerologyAspect: `Giai đoạn hấp thụ bài học then chốt của Số ${lifePathNum}. Đương số học cách tự lập, chịu trách nhiệm và khai phá tiềm năng vô hạn của bản thân.`,
      summary: `Thời kỳ "ngọc bất trác bất thành khí". Những gập ghềnh, va vấp và thử thách thời kỳ này chính là lò luyện kim cương, tôi luyện bản lĩnh của bậc tài hoa.`,
      remedyAdvice: `Không nản lòng trước thất bại tạm thời. Lấy việc học làm trọng, tìm kiếm minh sư và quý nhân dẫn đường, kiên trì trau dồi tay nghề lõi.`,
      isCurrentStage: currentStageKey === 'tuLuyen'
    },
    {
      stageKey: 'thucChien',
      title: 'Thực Chiến • Xung Trận Lập Nghiệp',
      ageRange: '31 – 50 tuổi',
      theme: 'Hoàng kim bùng nổ, Cung Thân tiếp quản, gặt hái đại thành tựu và danh vọng',
      icon: '⚡',
      color: 'from-purple-500 to-indigo-600',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      tuViAspect: `Bước ngoặt định mệnh: Từ tuổi 30 trở đi, Cung Thân ngự tại ${cungThan} chính thức tiếp quản cán cân quyền lực, phối hợp cùng Cung Quan Lộc và Tài Bạch tạo nên đại vận thăng hoa tột đỉnh!`,
      physiognomyAspect: `Trung Đình (Mũi - Chuẩn Đầu, Lưỡng Quyền, Thần Quang đôi mắt) làm chủ đại cục. Ba trục chỉ tay sâu đậm, gò Thái Dương và Thái Âm nở nang phản ánh năng lực quản trị, uy quyền và dòng tiền dồi dào.`,
      numerologyAspect: `Năng lượng Con Số Chủ Đạo ${lifePathNum} đạt đỉnh cao phát tiết. Tố chất lãnh đạo, khả năng biến ý tưởng thành tài sản cụ thể và tạo dựng vị thế xã hội vững bền.`,
      summary: `Thời khắc đại khai nhãn giới, tung hoành ngang dọc. Toàn bộ kiến thức tu luyện thời trẻ được đem ra thực chiến, tạo lập cơ nghiệp rực rỡ và gia tài hiển hách.`,
      remedyAdvice: `Thời cơ vàng mười không thể chần chừ! Quyết đoán nắm bắt cơ hội chiến lược, giữ vững chữ tín, quản trị lòng tham và luôn đối đãi công bằng với cộng sự.`,
      isCurrentStage: currentStageKey === 'thucChien'
    },
    {
      stageKey: 'hauVan',
      title: 'Hậu Vận • Viên Mãn & Truyền Thừa',
      ageRange: 'Từ 51 tuổi trở đi',
      theme: 'Quy nguyên đại phúc, điền sản dồi dào, con cháu phương trưởng, an lạc trường thọ',
      icon: '👑',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      tuViAspect: `Cung Thân (${cungThan}) làm chủ toàn diện, hội tụ cùng Cung Điền Trạch và Cung Tử Tức. Phúc lộc từ trung niên kết tinh thành sự an nhàn, điền sản đất đai vững như bàn thạch.`,
      physiognomyAspect: `Hạ Đình (Địa Các cằm tròn đầy đặn, rãnh Pháp Lệnh rộng mở bao quanh khóe miệng) biểu thị thọ trường cao, con đàn cháu đống. Đuôi chỉ tay tạo thành vân tài khố tụ tài khang kiện.`,
      numerologyAspect: `Chuyển hóa năng lượng số học sang tầng rung động thông thái, truyền cảm hứng và trao truyền giá trị tinh hoa cho thế hệ kế tiếp.`,
      summary: `Cảnh giới "Đức năng thắng số" đơm hoa kết trái. Sống an nhiên giữa đời thường, hưởng phúc lộc trời ban, gia đình hòa thuận, tiếng thơm lưu truyền.`,
      remedyAdvice: `Buông bớt tranh đoạt danh lợi bên ngoài, quay về chăm sóc thân tâm, dưỡng sinh điều độ, tích cực làm việc thiện lành để bồi đắp phúc âm muôn đời cho con cháu.`,
      isCurrentStage: currentStageKey === 'hauVan'
    }
  ];

  // Chi tiết nhận định vị trí tại thời điểm chụp ảnh
  let stageTitle = '';
  let stageAgeRange = '';
  let positionDescription = '';
  let tuViThanTransition = '';
  let facePalmRealtimeReflection = '';
  let immediateActionAdvice = '';
  let nextStagePreparation = '';

  const hasPhoto = hasFace || hasPalm;

  if (currentStageKey === 'khoiSinh') {
    stageTitle = 'Khởi Sinh • Ươm Mầm Tiên Thiên';
    stageAgeRange = '0 – 18 tuổi';
    positionDescription = `Ở thời điểm lưu dấu ảnh chụp (${formattedCaptureDate}), đương số đang ở tuổi ${ageAtCapture} (${lunarAge} tuổi mụ) — nằm trọn trong chặng đường KHỞI SINH.`;
    tuViThanTransition = `Cung Mệnh tại ${cungMenh} đang nắm toàn quyền dẫn dắt. Cung Thân tại ${cungThan} vẫn đang ở trạng thái tích tụ tiềm năng ngầm.`;
    facePalmRealtimeReflection = hasPhoto 
      ? `Bức ảnh chụp ghi nhận nét diện tướng trong trẻo, Thượng Đình (trán) cao sáng biểu hiện trí thông minh thiên bẩm. Các đường chỉ tay đang dần định hình, cho thấy thể chất và ý chí đang phát triển rất tích cực.`
      : `Hồ sơ chưa có ảnh chụp thời điểm này. Chụp ảnh sẽ giúp ghi nhận chuẩn xác khí sắc Thượng Đình thời niên thiếu.`;
    immediateActionAdvice = `Tập trung trui rèn kiến thức nền tảng, vâng lời cha mẹ và xây dựng thói quen kỷ luật tự giác.`;
    nextStagePreparation = `Chuẩn bị tâm thế độc lập để sẵn sàng bước vào giai đoạn TU LUYỆN đầy thử thách ở tuổi 19.`;
  } else if (currentStageKey === 'tuLuyen') {
    stageTitle = 'Tu Luyện • Trui Rèn Bản Lĩnh';
    stageAgeRange = '19 – 30 tuổi';
    positionDescription = `Ở thời điểm lưu dấu ảnh chụp (${formattedCaptureDate}), đương số đang ở tuổi ${ageAtCapture} (${lunarAge} tuổi mụ) — đang ở tâm điểm của chặng đường TU LUYỆN & TÔI Ý CHÍ.`;
    tuViThanTransition = `Cung Mệnh tại ${cungMenh} vẫn là ngọn hải đăng chỉ lối, nhưng đương số bắt đầu cảm nhận rõ rệt sự thức tỉnh của Cung Thân tại ${cungThan} thông qua những khát khao khẳng định sự nghiệp.`;
    facePalmRealtimeReflection = hasPhoto
      ? `Bức ảnh chụp ${hasFace ? 'gương mặt' : ''} ${hasFace && hasPalm ? 'và' : ''} ${hasPalm ? 'chỉ tay' : ''} phản ánh thần thái một chiến binh đang mài gươm. Ánh mắt có thần, đường Trí Đạo sâu dài cho thấy tư duy phân tích nhạy bén. Dù có đôi chút ưu tư về định hướng tương lai, nhưng cốt cách toát lên sự kiên trì hiếm có.`
      : `Hồ sơ chưa có ảnh chụp thời điểm này. Chụp ảnh gương mặt và lòng bàn tay sẽ giúp soi rõ thần khí Ấn Đường và sự phân nhánh đường Trí Đạo ở độ tuổi lập thân này.`;
    immediateActionAdvice = `Đừng sợ vấp ngã hay thử thách! Đây là thời điểm vàng để tích lũy kinh nghiệm, mở rộng mạng lưới quý nhân và rèn giũa kỹ năng then chốt của Số ${lifePathNum}.`;
    nextStagePreparation = `Chuẩn bị nền tảng tài chính và chiến lược sự nghiệp vững vàng để bước vào giai đoạn THỰC CHIẾN bùng nổ từ tuổi 31.`;
  } else if (currentStageKey === 'thucChien') {
    stageTitle = 'Thực Chiến • Xung Trận Đại Lập Nghiệp';
    stageAgeRange = '31 – 50 tuổi';
    positionDescription = `Ở thời điểm lưu dấu ảnh chụp (${formattedCaptureDate}), đương số đang ở tuổi ${ageAtCapture} (${lunarAge} tuổi mụ) — chính xác đang ngự tại thời kỳ HOÀNG KIM THỰC CHIẾN rực rỡ nhất của đời người!`;
    tuViThanTransition = `ĐÂY LÀ BƯỚC NGOẶT ĐỊNH MỆNH TRỌNG ĐẠI TRONG TỬ VI: Đương số đã bước qua tuổi 30, quyền lực vận mệnh đang được Cung Thân ngự tại ${cungThan} tiếp quản và phát huy uy lực tối đa! Mọi sự nỗ lực và quyết định lúc này sẽ trực tiếp quyết định tầm vóc của cả cuộc đời.`;
    facePalmRealtimeReflection = hasPhoto
      ? `Bức ảnh chụp thời khắc này (${formattedCaptureDate}) ${dossier.faceVerdict ? `với tướng mạo "${dossier.faceVerdict}"` : ''} ${dossier.palmVerdict ? `cùng chỉ tay "${dossier.palmVerdict}"` : ''} biểu lộ khí chất phong trần, từng trải nhưng vô cùng đĩnh đạc! Trung Đình (mũi và gò má) đầy đặn, ánh mắt hội tụ thần quang kiên định. Đây là nét tướng của một thủ lĩnh đang giữa trận tiền, sẵn sàng đón nhận cơ hội lớn và kiến tạo bước ngoặt tài chính vĩ đại.`
      : `Hồ sơ chưa lưu ảnh chụp thời điểm thực chiến này. Hãy bật máy ảnh chụp ngay khuôn mặt và chỉ tay để đạo sĩ xem sắc khí Chuẩn Đầu và các vân tài lộc đang chuyển biến ra sao ở độ tuổi đại phát này!`;
    immediateActionAdvice = `THỜI CƠ VÀNG MƯỜI ĐÃ ĐẾN, TUYỆT ĐỐI KHÔNG CHẦN CHỪ! Hãy dồn toàn tâm toàn lực vào các mục tiêu lớn, quyết đoán trong kinh doanh/sự nghiệp, kích hoạt thế mạnh số ${lifePathNum}, đồng thời quản trị rủi ro chặt chẽ và giữ tâm bình thản trước biến động.`;
    nextStagePreparation = `Tích lũy tài sản thực (bất động sản, điền sản) và xây dựng bộ máy kế cận vững chắc để tạo đà chuyển tiếp hoàn mỹ sang HẬU VẬN phú quý sau tuổi 50.`;
  } else {
    stageTitle = 'Hậu Vận • Viên Mãn & Truyền Thừa';
    stageAgeRange = 'Từ 51 tuổi trở đi';
    positionDescription = `Ở thời điểm lưu dấu ảnh chụp (${formattedCaptureDate}), đương số đang ở tuổi ${ageAtCapture} (${lunarAge} tuổi mụ) — đã bước vào cảnh giới HẬU VẬN VIÊN MÃN, quả ngọt của cả một đời dâng hiến.`;
    tuViThanTransition = `Cung Thân tại ${cungThan} đã nắm giữ trọn vẹn quyền trượng vận mệnh, phối chiếu Cung Điền Trạch và Tử Tức tỏa sáng phước lành.`;
    facePalmRealtimeReflection = hasPhoto
      ? `Bức ảnh lưu lại nét thần thái an hòa, bao dung của bậc tiền bối đức độ. Hạ Đình (Địa Các cằm) vững chãi, các nếp nhăn pháp lệnh rộng mở bao bọc phúc khí. Đường sinh đạo sâu dài biểu thị thọ khang miên viễn, gia đạo sum vầy.`
      : `Hồ sơ chưa có ảnh chụp thời điểm hậu vận. Chụp ảnh chân dung sẽ giúp ghi nhận phúc tướng Địa Các và sắc thái an khang của đương số.`;
    immediateActionAdvice = `Dưỡng tâm an lạc, buông bỏ lo toan thương trường bên ngoài, tập trung giữ gìn sức khỏe, vui vầy cùng con cháu và chia sẻ kinh nghiệm sống quý báu cho đời.`;
    nextStagePreparation = `Di dưỡng tinh thần, tích cực gieo mầm phước đức qua các hoạt động thiện nguyện để để lại tiếng thơm muôn đời.`;
  }

  const currentStageAnalysis: CurrentStageAnalysis = {
    ageAtCapture,
    lunarAge,
    captureYear,
    captureDateStr: formattedCaptureDate,
    hasPhoto,
    stageKey: currentStageKey,
    stageTitle,
    stageAgeRange,
    progressPercent,
    positionDescription,
    facePalmRealtimeReflection,
    tuViThanTransition,
    immediateActionAdvice,
    nextStagePreparation
  };

  // 8. Năm Trục Chỉ Số Định Mệnh Tổng Hòa (Thang 100 điểm)
  const destinyScores: DestinyDimensionScore[] = [
    {
      category: 'Phúc Thọ & Căn Cơ Bản Mệnh',
      score: hasPalm ? 94 : 88,
      level: 'Thượng Cát (Phúc trạch sâu dày)',
      icon: '🛡️',
      color: 'from-amber-400 to-yellow-500',
      highlight: `Cung Mệnh tại ${cungMenh} • Cung Thân tại ${cungThan}`,
      deepAnalysis: `Bản tính cương trực, có sức đề kháng và sinh lực dồi dào. Đường thọ trường hanh thông, luôn có ơn trên che chở tai qua nạn khỏi.`
    },
    {
      category: 'Tài Lộc & Điền Sản Thịnh Vượng',
      score: (lifePathNum === 8 || lifePathNum === 10 || lifePathNum === 22) ? 95 : 90,
      level: 'Đại Vượng (Tiền bạc tích lũy vững bền)',
      icon: '💰',
      color: 'from-emerald-400 to-teal-500',
      highlight: `Nạp Âm ${menhNguHanh} • Cung Tài Bạch đắc lộc`,
      deepAnalysis: `Khả năng quản trị tài chính nhạy bén, tích lũy đất đai điền sản về hậu vận cực tốt. Trung niên tài vận bùng nổ, tiền bạc hanh thông.`
    },
    {
      category: 'Công Danh & Uy Lực Lãnh Đạo',
      score: 91,
      level: 'Hanh Thông (Có tiếng nói & uy tín)',
      icon: '👑',
      color: 'from-purple-400 to-indigo-500',
      highlight: `Số chủ đạo ${lifePathNum} • Hợp làm chủ và điều hành`,
      deepAnalysis: `Tố chất tiên phong, không thích sự gò bó phụ thuộc. Thích hợp nắm giữ vai trò chiến lược, dẫn dắt đội ngũ hoặc chuyên môn đỉnh cao.`
    },
    {
      category: 'Tình Duyên & Gia Đạo Hạnh Phúc',
      score: 87,
      level: 'Hài Hòa (Vợ chồng tương trợ đồng lòng)',
      icon: '❤️',
      color: 'from-rose-400 to-pink-500',
      highlight: `Cung Phu Thê Tử Vi • Cung Phi ${cungPhiRes.cung}`,
      deepAnalysis: `Tiền vận tình duyên có đôi chút trắc trở để rèn giũa thấu cảm. Hậu vận trăm năm gắn kết, con cái phương trưởng hiếu nghĩa.`
    },
    {
      category: 'Trực Giác & Trí Tuệ Tâm Linh',
      score: 92,
      level: 'Tinh Thông (Trực giác nhạy bén, tâm thiện)',
      icon: '🔮',
      color: 'from-cyan-400 to-blue-500',
      highlight: `Cục: ${cuc} • Giác quan thứ 6 phát triển`,
      deepAnalysis: `Khả năng linh cảm và nhìn thấu bản chất sự việc rất chuẩn xác. Có duyên với triết lý, huyền thuật và luôn hướng thiện giúp đời.`
    }
  ];

  const overallDestinyScore = Math.round(
    destinyScores.reduce((acc, cur) => acc + cur.score, 0) / destinyScores.length
  );

  let overallVerdict = 'Đại Cát Đại Lợi • Tiền Hung Hậu Kiết • Vinh Hiển Trọn Đời';
  if (overallDestinyScore >= 92) {
    overallVerdict = 'Thượng Thượng Cát • Thiên Địa Hội Tụ • Phú Quý An Khang';
  } else if (overallDestinyScore >= 85) {
    overallVerdict = 'Đại Cát Hanh Thông • Khổ Tận Cam Lai • Hậu Vận Đại Phát';
  }

  // 9. Toàn văn bài Tổng Luận Vận Mệnh (Offline Synthesis Text)
  const synthesisArticle = `📜 ĐẠI TỔNG LUẬN VẬN MỆNH TOÀN THƯ
Đương số: ${personName} (${gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'})
Sinh ngày: ${solarDateStr} (Dương Lịch) — ${lunarDateStr}
Niên Mệnh: ${canChiYear} • Nạp Âm: ${menhNguHanh}
Cung Mệnh: ${cungMenh} • Cung Thân: ${cungThan} • Cục: ${cuc}
Bát Trạch Cung Phi: ${cungPhiRes.cung} (${cungPhiRes.hanh} - ${batTrachGroup})
${numerologyData ? `Con Số Chủ Đạo Pythagoras: Số ${numerologyData.lifePathNumber}${numerologyData.isMaster22 ? ' (Master 22/4)' : ''}` : ''}

═══════════════════════════════════════════════════════
CHƯƠNG I: THIÊN MỆNH TIÊN THIÊN (LÁ SỐ TỬ VI & THẦN SỐ HỌC)
═══════════════════════════════════════════════════════
Đương số sinh nhằm năm ${canChiYear}, mang trong mình khí chất tinh hoa của nạp âm ${menhNguHanh}. Mệnh tọa thủ tại cung ${cungMenh}, Thân cư tại ${cungThan}, thuộc thế Cục ${cuc}. 

Về bản tính, đương số là người có ý chí sắt đá, trọng danh dự và sống có tình có nghĩa. Khác với những người chỉ trông chờ vào may rủi, cuộc đời đương số là một hành trình tự lực cánh sinh đầy kiêu hãnh. 

Kết hợp cùng Con số chủ đạo Pythagoras ${lifePathNum}, tần số rung động linh hồn của đương số mang trọng trách của ${numerologyData?.coreKeywords.join(', ') || 'sự phát triển vượt bậc'}. Đây là một phối hợp hiếm có: Tử Vi định hình căn cốt vững chãi, còn Thần Số Học trang bị tư duy chiến lược và tinh thần cầu tiến không ngừng.

═══════════════════════════════════════════════════════
CHƯƠNG II: HẬU THIÊN BIỂU TƯỚNG (TƯỚNG MẠO & CHỈ TAY ĐỐI CHIẾU)
═══════════════════════════════════════════════════════
${tuViVsPhysiognomy}

${dossier.faceVerdict ? `• Luận bàn Tướng Mặt đã ghi nhận: "${dossier.faceVerdict}"` : ''}
${dossier.palmVerdict ? `• Luận bàn Chỉ Tay đã ghi nhận: "${dossier.palmVerdict}"` : ''}
${dossier.bodyVerdict ? `• Luận bàn Dáng Vóc Toàn Thân đã ghi nhận: "${dossier.bodyVerdict}"` : ''}

Nếu lá số Tử Vi ví như hạt giống ban đầu, thì Tướng mạo chính là mảnh đất và sự chăm bón. Việc giữ nụ cười an hòa, ánh mắt chính trực và đôi bàn tay chăm chỉ lao động sẽ tiếp tục khai mở các vân tài khố cát tường, giúp tài lộc chảy vào như nước mùa xuân.

═══════════════════════════════════════════════════════
CHƯƠNG III: ĐỊA LỢI & PHƯƠNG VỊ PHONG THỦY BÁT TRẠCH
═══════════════════════════════════════════════════════
Đương số ngự tại Cung Phi ${cungPhiRes.cung}, thuộc dòng ${batTrachGroup}. 
• Các hướng Đại Cát nghênh tài tụ phúc: ${luckyDirections.join(', ')}.
• Các hướng Đại Hung cần tránh hoặc hóa giải: ${unluckyDirections.join(', ')}.

Trong bài trí phong thủy: Đặt bàn làm việc quay về hướng ${luckyDirections[0]} để đón nhận Sinh Khí khai mở công danh; phòng ngủ và đầu giường hướng về ${luckyDirections[1]} để gia đạo hòa hợp, giấc ngủ an lành, thân thể khang kiện.

═══════════════════════════════════════════════════════
CHƯƠNG IV: TỔNG KẾT BỐN ĐẠI GIAI ĐOẠN ĐỊNH MỆNH
═══════════════════════════════════════════════════════
1. KHỞI SINH (0 – 18 tuổi): Ươm mầm căn cốt, thụ bẩm phúc đức tổ tiên và hoàn thiện thể chất.
2. TU LUYỆN (19 – 30 tuổi): Mài gươm luyện ý chí, vượt qua gập ghềnh đầu đời để tôi luyện bản lĩnh tài hoa.
3. THỰC CHIẾN (31 – 50 tuổi): Hoàng kim bùng nổ, Cung Thân tiếp quản, gặt hái đại thành tựu và danh vọng hiển hách.
4. HẬU VẬN (Từ 51 tuổi trở đi): Viên mãn an lạc, điền sản dồi dào, con cháu vinh hiển, hưởng phước trọn vẹn.

═══════════════════════════════════════════════════════
CHƯƠNG V: TỌA ĐỘ VẬN MỆNH TẠI THỜI KHẮC CHỤP ẢNH
═══════════════════════════════════════════════════════
• Thời khắc lưu dấu ảnh chụp: ${formattedCaptureDate}
• Độ tuổi đương số tại thời điểm chụp: ${ageAtCapture} tuổi (${lunarAge} tuổi mụ).
• Phân vị hiện tại: Đang ngự tại chặng đường [${stageTitle.toUpperCase()}].
• Tiến trình dòng đời đã qua: ~${progressPercent}% hành trình cuộc đời.
• Chuyển giao Tử Vi: ${tuViThanTransition}
• Nhận định Tướng Mạo & Khí Sắc tại thời khắc chụp ảnh:
  ${facePalmRealtimeReflection}
• Kim chỉ nam hành động tức thời:
  ${immediateActionAdvice}
• Định hướng cho chặng kế tiếp:
  ${nextStagePreparation}

═══════════════════════════════════════════════════════
CHƯƠNG VI: TỨ TRỤ CẢI VẬN PHÁP (KIM CHỈ NAM HÀNH ĐỘNG)
═══════════════════════════════════════════════════════
1. TU THÂN: Đi đứng đĩnh đạc, lưng thẳng mắt sáng, giữ chữ tín như giữ mạng sống. Nụ cười hòa ái là bùa chiêu tài số một.
2. DƯỠNG TÂM: Làm việc thiện không vụ lợi, hiếu kính cha mẹ tổ tiên, buông bớt sự kiểm soát để tâm an trí sáng.
3. LUYỆN TRÍ: Phát huy tối đa con số chủ đạo ${lifePathNum}, chọn cộng sự và đối tác làm ăn hợp mệnh, ký kết minh bạch.
4. TỤ KHÍ: Sống và làm việc thuận theo phương vị Bát Trạch cát tường, giữ không gian nhà ở thông thoáng, đủ ánh sáng.

ĐIỂM ĐỊNH MỆNH TỔNG HÒA: ${overallDestinyScore} / 100 ĐIỂM (${overallVerdict})
Lời kết: "Tâm còn chưa thiện, phong thủy vô ích; Bất hiếu cha mẹ, thờ cúng vô ích." Lấy đạo đức làm gốc, vạn sự ắt hanh thông!`;

  // 10. Tứ Trụ Cải Mệnh Pháp
  const fourPillarsRemedy = {
    tuThan: `Rèn luyện phong thái chững chạc, đi đứng vững chãi, giữ ánh mắt có thần và nụ cười hòa nhã. Tránh ăn to nói lớn lúc giận dữ.`,
    duongTam: `Lấy hiếu kính cha mẹ làm gốc rễ phúc phần. Tích cực phóng sinh, làm việc thiện cứu giúp người khó khăn để bồi đắp thọ khí.`,
    luyenTri: `Phát huy năng lực con số chủ đạo ${lifePathNum}: Độc lập, kỷ luật và có tầm nhìn xa. Đọc sách thánh hiền để mở rộng nhãn quan.`,
    tuKhi: `Bố trí không gian sống theo Cung Phi ${cungPhiRes.cung}: Bàn làm việc hướng ${luckyDirections[0]}, giường ngủ hướng ${luckyDirections[1]}, dùng các vật phẩm phong thủy tương sinh bản mệnh ${menhNguHanh}.`
  };

  return {
    personName,
    gender,
    birthDate: birthDateStr,
    solarDateStr,
    lunarDateStr,
    canChiYear,
    menhNguHanh,
    cuc,
    cungMenh,
    cungThan,
    cungPhi: cungPhiRes.cung,
    cungPhiHanh: cungPhiRes.hanh,
    batTrachGroup,
    tuViBundle,
    numerology: numerologyData,
    fengShui: {
      cung: cungPhiRes.cung,
      hanh: cungPhiRes.hanh,
      group: batTrachGroup,
      luckyDirections,
      unluckyDirections
    },
    physiognomy: {
      hasFace,
      hasPalm,
      hasBody,
      faceImage: dossier.faceImage,
      palmImage: dossier.palmImage,
      bodyImage: dossier.bodyImage,
      faceVerdict: dossier.faceVerdict,
      palmVerdict: dossier.palmVerdict,
      bodyVerdict: dossier.bodyVerdict
    },
    relatedRecords,
    crossDomainInsights: {
      tuViVsPhysiognomy,
      tuViVsNumerology,
      fengShuiHarmonization,
      karmaAndFreeWill
    },
    fourLifeStages,
    currentStageAnalysis,
    destinyScores,
    overallDestinyScore,
    overallVerdict,
    synthesisArticle,
    fourPillarsRemedy
  };
}
