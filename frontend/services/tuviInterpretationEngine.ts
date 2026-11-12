// Cổ Thư Tử Vi Đẩu Số - Thư Viện Tri Thức & Bộ Máy Luận Giải Bản Mệnh Chuyên Sâu
// Dựa trên Tử Vi Đẩu Số Toàn Thư (Hi Di Tiên Sinh Trần Đoàn) & Tử Vi Nghiệm Lý
import { TuViProfile, TuViPalace } from '../types';
import { calculateTuViChart } from './tuviEngine';
import { LifeDestinyDossierData, LifeDossierTienVan, LifeDossierPillar } from './tuViService';

export const ALL_MAIN_STARS = [
  'Tử Vi', 'Liêm Trinh', 'Thiên Đồng', 'Vũ Khúc', 'Thái Dương', 'Thiên Cơ',
  'Thiên Phủ', 'Thái Âm', 'Tham Lang', 'Cự Môn', 'Thiên Tướng', 'Thiên Lương',
  'Thất Sát', 'Phá Quân'
];

export interface DetailedTuViInterpretation {
  thayPhan: string;
  banMenh: string;
  congDanh: string;
  tinhDuyen: string;
  vanHan: string;
  daiVanTien: string;
  daiVanDuongThoi: string;
  daiVanBuocNgoat: string;
  tieuVan: string;
  hoaGiai: string;
  nhanXet: string;
  lifeDossier: LifeDestinyDossierData;
  generalVerdict: string;
}

// Bảng tính ngũ hành của Cục
function getCucElement(cuc: string): 'Thủy' | 'Mộc' | 'Kim' | 'Thổ' | 'Hỏa' {
  if (cuc.includes('Thủy')) return 'Thủy';
  if (cuc.includes('Mộc')) return 'Mộc';
  if (cuc.includes('Kim')) return 'Kim';
  if (cuc.includes('Thổ')) return 'Thổ';
  return 'Hỏa';
}

// Bảng tính ngũ hành của Nạp Âm Mệnh
function getMenhElement(menhNguHanh: string): 'Thủy' | 'Mộc' | 'Kim' | 'Thổ' | 'Hỏa' {
  if (menhNguHanh.includes('Thủy')) return 'Thủy';
  if (menhNguHanh.includes('Mộc')) return 'Mộc';
  if (menhNguHanh.includes('Kim')) return 'Kim';
  if (menhNguHanh.includes('Thổ')) return 'Thổ';
  return 'Hỏa';
}

// Tính mối quan hệ sinh khắc giữa Mệnh và Cục
function getMenhCucRelation(menhHanh: string, cucHanh: string): {
  type: 'cuc_sinh_menh' | 'menh_cuc_ty_hoa' | 'menh_sinh_cuc' | 'menh_khac_cuc' | 'cuc_khac_menh';
  title: string;
  desc: string;
} {
  const sinhMap: Record<string, string> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
  const khacMap: Record<string, string> = { Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' };

  if (sinhMap[cucHanh] === menhHanh) {
    return {
      type: 'cuc_sinh_menh',
      title: 'Cục Sinh Mệnh (Thuận Thiên Ứng Vận)',
      desc: 'Hoàn cảnh môi trường xã hội luôn tương trợ nâng đỡ đương số, ra ngoài hay gặp may mắn, quý nhân phù trợ.'
    };
  }
  if (menhHanh === cucHanh) {
    return {
      type: 'menh_cuc_ty_hoa',
      title: 'Mệnh Cục Tỷ Hòa (Hòa Hợp Tự Nhiên)',
      desc: 'Tính cách hài hòa với hoàn cảnh, cuộc đời tương đối bằng phẳng, dễ thích nghi và hòa nhập môi trường.'
    };
  }
  if (sinhMap[menhHanh] === cucHanh) {
    return {
      type: 'menh_sinh_cuc',
      title: 'Mệnh Sinh Cục (Tâm Thiện Cống Hiến)',
      desc: 'Đương số phải hao tổn tâm sức, cống hiến hy sinh cho gia đình và xã hội trước khi gặt hái quả ngọt cho bản thân.'
    };
  }
  if (khacMap[menhHanh] === cucHanh) {
    return {
      type: 'menh_khac_cuc',
      title: 'Mệnh Khắc Cục (Ý Chí Quật Cường)',
      desc: 'Đương số tự lực cánh sinh, không ỷ lại hoàn cảnh, vượt qua nghịch cảnh bằng bản lĩnh thép để làm chủ số mệnh.'
    };
  }
  return {
    type: 'cuc_khac_menh',
    title: 'Cục Khắc Mệnh (Lửa Thử Vàng Gian Truân)',
    desc: 'Tiền vận gặp nhiều trắc trở, nghịch cảnh thử thách lòng kiên nhẫn. Cần lấy chữ Nhẫn và Thiện làm gốc thì hậu vận rực rỡ.'
  };
}

// Đánh giá bộ Chính Tinh tọa thủ Cung Mệnh
function analyzeMenhStars(stars: string[]) {
  const mainStars = stars.filter(s => ALL_MAIN_STARS.includes(s));
  
  if (mainStars.length === 0) {
    return {
      category: 'vo_chinh_dieu',
      name: 'Mệnh Vô Chính Diệu (Mượn Sao Xung Chiếu)',
      archetype: 'Người thông minh mẫn tiệp, linh hoạt tùy duyên, trung vận đại phát',
      keyTraits: 'Tính tình khôn ngoan, nhạy cảm với thời cuộc, giác quan bén nhạy. Hợp lập nghiệp xa quê hoặc làm con nuôi quý tộc.',
      poem: [
        'Mệnh Vô Chính Diệu dạ thông minh,',
        'Tùy duyên ứng biến thuận thời bình.',
        'Trung niên vững bước xây cơ nghiệp,',
        'Đức trọng tài cao rạng chữ tình.'
      ]
    };
  }

  if (mainStars.some(s => ['Tử Vi', 'Thiên Phủ'].includes(s))) {
    return {
      category: 'tu_phu_de_tinh',
      name: `Đế Tinh Tọa Thủ (${mainStars.join(' • ')})`,
      archetype: 'Tử Phủ Triều Viên • Quý Tướng Lãnh Đạo Đế Vương',
      keyTraits: 'Phong thái đĩnh đạc, khoan dung, có tầm nhìn chiến lược, trọng danh dự và chữ tín. Tụ tài lộc bền vững, được nhiều người kính trọng.',
      poem: [
        'Đế tinh tọa thủ chốn cung Mệnh,',
        'Áo gấm ngọc ngà hưởng phúc vinh.',
        'Kho trời hun đúc lòng nhân hậu,',
        'Cơ nghiệp muôn đời tỏa sáng linh.'
      ]
    };
  }

  if (mainStars.some(s => ['Thất Sát', 'Phá Quân', 'Tham Lang'].includes(s))) {
    return {
      category: 'sat_pha_tham',
      name: `Bộ Sát Phá Tham (${mainStars.join(' • ')})`,
      archetype: 'Phong Ba Bão Táp • Bản Lĩnh Khai Phá Tiên Phong',
      keyTraits: 'Cá tính mạnh mẽ, dám nghĩ dám làm, ưa mạo hiểm, ghét sự tầm thường. Tiền vận nhiều phen thăng trầm sóng gió, sau 32 tuổi bứt phá bạo phát thành đại nghiệp.',
      poem: [
        'Sát Phá bôn ba dệt chí trai,',
        'Gió sương trui rèn rạng sắc tài.',
        'Tiền vận dẫu phen chìm nổi sóng,',
        'Hậu vận cơ đồ định tương lai.'
      ]
    };
  }

  if (mainStars.some(s => ['Thiên Cơ', 'Thái Âm', 'Thiên Đồng', 'Thiên Lương'].includes(s))) {
    return {
      category: 'co_nguyet_dong_luong',
      name: `Bộ Cơ Nguyệt Đồng Lương (${mainStars.join(' • ')})`,
      archetype: 'Nho Nhã Thanh Cao • Mưu Trí Tham Mưu & Phúc Thọ',
      keyTraits: 'Tâm tính hiền hòa, thiện lương, thông tuệ mưu lược, giỏi chuyên môn, giáo dục, tài chính hoặc tham mưu chiến lược. Cuộc đời bình ổn ấm êm, sống thọ.',
      poem: [
        'Cơ Nguyệt Đồng Lương cốt cách nho,',
        'Tâm lành trí sáng dạ chẳng lo.',
        'Bình sinh tích đức gieo nhân thiện,',
        'Phúc thọ an khang hưởng ấm no.'
      ]
    };
  }

  if (mainStars.some(s => ['Cự Môn', 'Thái Dương'].includes(s))) {
    return {
      category: 'cu_nhat_quang_minh',
      name: `Bộ Cự Nhật Quang Minh (${mainStars.join(' • ')})`,
      archetype: 'Hùng Biện Khẩu Tài • Quang Minh Lỗi Lạc',
      keyTraits: 'Tư duy sắc sảo, tài hùng biện thuyết phục phi thường, hợp ngoại giao, luật, truyền thông, kinh doanh. Cần khiêm nhường để tránh thị phi đố kỵ.',
      poem: [
        'Cự Nhật quang minh rạng bốn phương,',
        'Khẩu tài hùng biện rạng văn chương.',
        'Giữ tâm ngay thẳng xua tà khí,',
        'Công danh vinh hiển đắc phi thường.'
      ]
    };
  }

  return {
    category: 'vu_tuong_liem',
    name: `Tài Tinh & Tướng Tinh (${mainStars.join(' • ')})`,
    archetype: 'Vũ Tướng Liêm Trinh • Cương Trực Quyết Đoán & Thực Lực',
    keyTraits: 'Trọng nguyên tắc, kỷ luật thép, tài chính và quản lý thực chiến xuất sắc. Lời nói đi đôi với việc làm, tự tạo dựng thành quả bằng mồ hôi công sức.',
    poem: [
      'Tài Tinh Tướng Tinh vững chữ tâm,',
      'Thương trường thực chiến tiếng vang lừng.',
      'Kỷ cương giữ trọn đường công chính,',
      'Tiền của bền lâu phúc ấm mừng.'
    ]
  };
}

// Phân tích cung Thân (Hậu vận từ 30 tuổi)
function analyzeCungThan(cungThan: string) {
  if (cungThan.includes('Mệnh')) {
    return {
      title: 'Thân Mệnh Đồng Cung (Tính Khí Bất Biến)',
      desc: 'Cả đời kiên định theo đuổi lý tưởng thuở thiếu thời, tự lực cánh sinh, số phận do chính mình định đoạt.'
    };
  }
  if (cungThan.includes('Phúc')) {
    return {
      title: 'Thân Cư Phúc Đức (Hưởng Phúc Tiên Nhân)',
      desc: 'Hậu vận gắn liền với mồ mả tổ tiên, dòng tộc và thế giới tâm linh chiều sâu. Năng tích đức thì phúc lộc tràn trề.'
    };
  }
  if (cungThan.includes('Quan')) {
    return {
      title: 'Thân Cư Quan Lộc (Người Của Sự Nghiệp)',
      desc: 'Từ 30 tuổi sự nghiệp trở thành trọng tâm cuộc đời. Dành trọn tâm huyết cho công danh và vị thế xã hội.'
    };
  }
  if (cungThan.includes('Tài')) {
    return {
      title: 'Thân Cư Tài Bạch (Thực Tiễn Kinh Tế)',
      desc: 'Nhạy bén với cơ hội đồng tiền, giỏi tích lũy bất động sản và tài sản vững chắc, cuộc sống ngày càng sung túc.'
    };
  }
  if (cungThan.includes('Phu') || cungThan.includes('Thê')) {
    return {
      title: 'Thân Cư Phu Thê (Đồng Lòng Gầy Dựng)',
      desc: 'Số mệnh trung hậu vận chịu ảnh hưởng rất lớn từ người bạn đời. Vợ chồng đồng lòng thì tát biển đông cũng cạn.'
    };
  }
  return {
    title: 'Thân Cư Thiên Di (Xuất Ngoại Phát Đạt)',
    desc: 'Càng đi xa quê hương, càng dịch chuyển ngoại giao thì vận khí càng hưng phát, danh tài song thu.'
  };
}

// Tính điểm Cát Hung thực tế dựa trên cách cục sao
function calculateAuthenticDestinyScores(menhStars: string[], menhCuc: any, palaces?: TuViPalace[]) {
  let phucScore = 78;
  let taiScore = 76;
  let congScore = 75;
  let duyenScore = 74;
  let thoScore = 80;

  // Cát tinh tăng điểm
  if (menhStars.some(s => ['Tử Vi', 'Thiên Phủ', 'Thiên Lương', 'Thiên Đồng'].includes(s))) {
    phucScore += 10;
    thoScore += 8;
  }
  if (menhStars.some(s => ['Vũ Khúc', 'Thiên Phủ', 'Hóa Lộc', 'Lộc Tồn'].includes(s))) {
    taiScore += 12;
  }
  if (menhStars.some(s => ['Tử Vi', 'Thái Dương', 'Thiên Tướng', 'Thất Sát', 'Hóa Quyền'].includes(s))) {
    congScore += 12;
  }
  if (menhStars.some(s => ['Thái Âm', 'Thiên Đồng', 'Văn Xương', 'Văn Khúc'].includes(s))) {
    duyenScore += 10;
  }
  if (menhStars.some(s => ['Tả Phụ', 'Hữu Bật'].includes(s))) {
    phucScore += 6;
    congScore += 5;
  }

  // Sát tinh điều chỉnh
  if (menhStars.some(s => ['Kình Dương', 'Đà La', 'Hóa Kỵ', 'Tang Môn', 'Bạch Hổ'].includes(s))) {
    congScore -= 4;
    duyenScore -= 6;
    thoScore -= 4;
  }

  // Mệnh Cục sinh khắc
  if (menhCuc.type === 'cuc_sinh_menh') {
    phucScore += 6;
    congScore += 6;
    taiScore += 5;
  } else if (menhCuc.type === 'cuc_khac_menh') {
    phucScore -= 5;
    congScore -= 4;
  }

  // Giới hạn trong khoảng 68 - 98
  const clamp = (val: number) => Math.min(98, Math.max(68, val));
  phucScore = clamp(phucScore);
  taiScore = clamp(taiScore);
  congScore = clamp(congScore);
  duyenScore = clamp(duyenScore);
  thoScore = clamp(thoScore);

  const getLevel = (sc: number) => sc >= 90 ? 'Thượng Cát' : sc >= 82 ? 'Phát Vượng' : sc >= 75 ? 'Hanh Thông' : 'Cần Tu Dưỡng';

  return [
    {
      label: 'Phúc Đức & Quý Nhân',
      score: phucScore,
      level: getLevel(phucScore),
      comment: phucScore >= 85 ? 'Được âm đức tổ tiên chở che, gặp dữ hóa lành' : 'Nên năng làm việc thiện, hiếu thuận để bồi dưỡng âm phúc',
      color: 'bg-purple-500'
    },
    {
      label: 'Tài Lộc & Điền Sản',
      score: taiScore,
      level: getLevel(taiScore),
      comment: taiScore >= 85 ? 'Tụ tài chính ngạch, hậu vận đất đai của cải dồi dào' : 'Tránh đầu tư may rủi, tích lũy tài sản thật bền vững',
      color: 'bg-amber-500'
    },
    {
      label: 'Công Danh & Quyền Uy',
      score: congScore,
      level: getLevel(congScore),
      comment: congScore >= 85 ? 'Có tố chất lãnh đạo, được cấp dưới nể phục và tin cậy' : 'Cần rèn luyện tính kiên nhẫn, lập kế hoạch cẩn trọng',
      color: 'bg-emerald-500'
    },
    {
      label: 'Duyên Nợ & Hạnh Phúc',
      score: duyenScore,
      level: getLevel(duyenScore),
      comment: duyenScore >= 85 ? 'Bạn đời đồng lòng, chia ngọt sẻ bùi xây dựng tổ ấm' : 'Tránh tranh cãi hơn thua, lắng nghe bạn đời nhiều hơn',
      color: 'bg-rose-500'
    },
    {
      label: 'Khang Ninh & Thọ Trường',
      score: thoScore,
      level: getLevel(thoScore),
      comment: thoScore >= 85 ? 'Cốt cách vững vàng, tâm tịnh thì thân thể trường thọ' : 'Chú ý điều hòa giấc ngủ, rèn luyện thể lực đều đặn',
      color: 'bg-cyan-500'
    }
  ];
}

/**
 * BỘ MÁY LUẬN GIẢI TỬ VI ĐẨU SỐ TOÀN DIỆN (ANCIENT ASTROLOGY RULE ENGINE)
 * Phân tích sâu sắc, độc bản 100% cho từng đương số dựa trên ngày giờ tháng năm sinh
 */
export function interpretTuViChartAuthentic(
  profile: TuViProfile,
  palaces?: TuViPalace[]
): DetailedTuViInterpretation {
  const { fullName, canChiYear, menhNguHanh, cuc, cungMenh, cungThan, gender } = profile;
  const menhHanh = getMenhElement(menhNguHanh);
  const cucHanh = getCucElement(cuc);
  const menhCuc = getMenhCucRelation(menhHanh, cucHanh);

  // Lấy danh sách sao tại Cung Mệnh (Tự tính nếu chưa truyền palaces)
  let activePalaces = palaces;
  if (!activePalaces || activePalaces.length === 0) {
    try {
      const parts = profile.solarDate ? profile.solarDate.split('-') : [];
      const sYear = parseInt(parts[0], 10);
      const sMonth = parseInt(parts[1], 10);
      const sDay = parseInt(parts[2], 10);
      if (sYear && sMonth && sDay) {
        const chart = calculateTuViChart({
          calendarType: 'solar',
          day: sDay,
          month: sMonth,
          year: sYear,
          birthHour: profile.birthHour,
          gender: profile.gender
        });
        activePalaces = chart.palaces;
      }
    } catch (e) {
      console.warn("Auto calculate palaces in tuviInterpretationEngine failed:", e);
    }
  }

  const menhPalace = activePalaces?.find(p => p.name.includes('Mệnh') || (p as any).isMenh) || activePalaces?.[0];
  const menhStars = menhPalace?.stars || [];
  const starAnalysis = analyzeMenhStars(menhStars);
  const thanAnalysis = analyzeCungThan(cungThan);
  const destinyScores = calculateAuthenticDestinyScores(menhStars, menhCuc, activePalaces);

  // Sinh Thơ Lời Thầy Phán (ThayPhan)
  const thayPhan = starAnalysis.poem.join('\n');

  // Sinh Bản Mệnh (BanMenh)
  const banMenh = `Đương số tuổi ${canChiYear}, nạp âm ${menhNguHanh}, đắc ${cuc} (${menhCuc.title}). Cung Mệnh tọa tại ${cungMenh} có ${starAnalysis.name}. Cốt cách mang hình thái "${starAnalysis.archetype}": ${starAnalysis.keyTraits} ${menhCuc.desc}`;

  // Sinh Công Danh (CongDanh)
  const congDanh = `Đường quan lộc và sự nghiệp gắn liền với ${thanAnalysis.title}: ${thanAnalysis.desc} Về phương diện mưu sinh, đương số hợp phát huy thế mạnh độc lập, nắm giữ cương vị quản lý hoặc chuyên môn cao. Cung Tài Bạch tích tụ tài lộc tốt nhất từ sau 33 tuổi, càng về sau càng vững bền.`;

  // Sinh Tình Duyên (TinhDuyen)
  const tinhDuyen = `Duyên nợ của đương số mang tính tiền định. Thời trẻ có thể trải qua vài mối tơ vương thử thách tính kiên nhẫn. Bạn đời là người có cá tính và trách nhiệm. Lời khuyên cổ thư: "Lạt mềm buộc chặt, nhường nhịn một bước biển rộng trời cao", sau tuổi 28 kết hôn gia đạo sẽ vững bền êm ấm.`;

  // Sinh Vận Hạn (VanHan)
  const currentYear = new Date().getFullYear();
  const birthYear = parseInt(profile.solarDate.split('-')[0], 10) || 1990;
  const currentAge = currentYear - birthYear;
  const vanHan = `Năm nay ${currentYear} (tuổi âm ${currentAge + 1}), vận trình của đương số mở ra nhiều chuyển biến mang tính bước ngoặt. Cần chú ý giữ gìn chữ tín trong giao kết hợp đồng, tránh thị phi khẩu thiệt và không nên nóng vội trong các quyết định tài chính mạo hiểm.`;

  // Đại Vận & Tiểu Vận
  const cucNum = cuc.includes('Nhị') ? 2 : cuc.includes('Tam') ? 3 : cuc.includes('Tứ') ? 4 : cuc.includes('Ngũ') ? 5 : 6;
  const dv1 = `${cucNum} - ${cucNum + 9}`;
  const dv2 = `${cucNum + 10} - ${cucNum + 19}`;
  const dv3 = `${cucNum + 20} - ${cucNum + 29}`;
  const dv4 = `${cucNum + 30} - ${cucNum + 39}`;
  const dv5 = `${cucNum + 40} - ${cucNum + 49}`;

  const daiVanTien = `Đại vận ${dv2} tuổi: Thời kỳ học tập, tích lũy kiến thức và trui rèn bản lĩnh sống. Khởi đầu có thể gặp đôi chút thử thách nhưng chính là bệ phóng cho tương lai.`;
  const daiVanDuongThoi = `Đại vận ${dv3} đến ${dv4} tuổi: Giai đoạn hoàng kim rực rỡ nhất đời người. Thiên thời địa lợi hội tụ, đương số bứt phá công danh, gầy dựng cơ nghiệp và vị thế xã hội vững vàng.`;
  const daiVanBuocNgoat = `Đại vận ${dv5} tuổi trở đi: Hậu vận chuyển sang thu liễm, tích tụ điền sản đất đai, hưởng phúc ấm gia đình và chứng kiến con cháu phương trưởng thành đạt.`;
  const tieuVan = `Trong 12-24 tháng tới: Cơ hội thăng tiến mở ra nếu đương số chủ động nâng cao năng lực chuyên môn. Hãy giữ chế độ sinh hoạt điều độ và tránh cho vay mượn thiếu cam kết rõ ràng.`;

  // Hóa Giải & Nhận Xét
  const hoaGiai = `Cải mệnh tối thượng lấy "Đức năng thắng số" làm kim chỉ nam. Năng làm việc thiện, hiếu kính phụ mẫu là gốc rễ tụ tài sinh phúc. Tránh chấp niệm hơn thua, tâm an thì vạn sự hanh thông.`;
  const nhanXet = `Thầy bói đúc kết: Đương số ${fullName} là người có phúc tướng tiềm tàng, ý chí kiên định tựa thái sơn. Cứ vững tin vào con đường chính đạo, bão giông qua đi ắt đón ánh bình minh rực rỡ.`;

  // Master Remedy
  const masterRemedy = {
    luckyColors: menhHanh === 'Kim' ? 'Trắng, Ánh Bạc, Ghi, Vàng Sậm, Nâu Đất (Thổ sinh Kim)' :
                 menhHanh === 'Mộc' ? 'Xanh Lục, Xanh Lá Cây, Xanh Nước Biển, Đen (Thủy sinh Mộc)' :
                 menhHanh === 'Thủy' ? 'Đen, Xanh Lam, Trắng, Ánh Kim (Kim sinh Thủy)' :
                 menhHanh === 'Hỏa' ? 'Đỏ, Tím, Hồng, Cam, Xanh Lá Mạ (Mộc sinh Hỏa)' :
                 'Vàng Hoàng Thổ, Nâu Đất, Đỏ, Hồng (Hỏa sinh Thổ)',
    luckyDirections: menhHanh === 'Kim' ? 'Tây, Tây Bắc, Đông Bắc' :
                     menhHanh === 'Mộc' ? 'Đông, Đông Nam, Bắc' :
                     menhHanh === 'Thủy' ? 'Bắc, Tây, Tây Bắc' :
                     menhHanh === 'Hỏa' ? 'Nam, Đông, Đông Nam' : 'Tây Nam, Đông Bắc, Nam',
    goldenHours: 'Giờ Thìn (07h-09h), Giờ Thân (15h-17h), Giờ Tý (23h-01h)',
    lifeMaxim: `Bản mệnh ${menhNguHanh} • Cốt cách ${starAnalysis.archetype} • Đức năng thắng số, tâm tịnh vạn sự thông.`
  };

  // Tam Kỳ Vận Mệnh (TienVan - TrungVan - HauVan)
  const tienVan: LifeDossierTienVan = {
    ageRange: `Thuở ấu thơ đến ${dv3.split('-')[0]} tuổi`,
    title: `Tiền Vận: Trui Rèn Bản Lĩnh (${starAnalysis.name})`,
    status: `Giai đoạn tích lũy căn cơ • ${menhCuc.title}`,
    detail: `Thiếu thời của đương số sinh năm ${canChiYear} mang đặc trưng của ${starAnalysis.name}. ${menhCuc.desc} Bản tính vốn thông minh nhạy bén, tự lập từ sớm. Dù bước đầu lập thân trải qua vài phen thử thách học vấn hoặc sự nghiệp, đây chính là lúc trời tôi luyện ý chí làm nền móng vững chắc cho tương lai.`,
    keyword: 'Học đạo dưỡng tâm • Tích lũy căn cơ',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40'
  };

  const trungVan: LifeDossierTienVan = {
    ageRange: `Từ ${dv3.split('-')[0]} đến 55 tuổi`,
    title: `Trung Vận: Thời Kỳ Hoàng Kim (${thanAnalysis.title})`,
    status: 'Giai đoạn đại phát tài lộc & xác lập vị thế',
    detail: `Bước vào tuổi tam tuần, thiên thời địa lợi nhân hòa hội tụ nhờ ${thanAnalysis.desc}. Cung Mệnh tại ${cungMenh} phối chiếu Cung Thân cư ${cungThan} kích hoạt vượng khí công danh. Đây là thời kỳ đương số gặt hái thành công vang dội nhất, tài chính hưng vượng, lời nói có trọng lượng trong xã hội.`,
    keyword: 'Nắm bắt thời cơ • Tài lộc bùng nổ',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40'
  };

  const hauVan: LifeDossierTienVan = {
    ageRange: 'Từ 56 tuổi trở đi',
    title: 'Hậu Vận: Viên Mãn Phúc Lộc & Điền Sản Bề Thế',
    status: 'Giai đoạn an hưởng thái bình & phúc trạch',
    detail: `Hậu vận của đương số đạt được sự an nhàn viên mãn, điền sản đất đai tích tụ dày dặn. Tâm tính trầm ổn, hướng thiện. Con cháu phương trưởng, thành đạt và hiếu thuận. Đương số hưởng trọn phúc đức tổ tiên, gia môn vinh hiển, trường thọ an khang.`,
    keyword: 'Đức năng thắng số • Gia đạo an khang',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
  };

  // Ngũ Trụ Cuộc Đời
  const fivePillars: LifeDossierPillar[] = [
    {
      id: 'pillar_personality',
      title: 'Căn Khí & Cốt Cách Bản Mệnh',
      subtitle: `Nạp Âm: ${menhNguHanh} • Mệnh tại: ${cungMenh}`,
      color: 'border-yellow-400/40 text-yellow-300 bg-yellow-500/10',
      keyFact: `${starAnalysis.name} • ${menhCuc.title}`,
      deepAnalysis: `Đương số sinh năm ${canChiYear} mang nạp âm ${menhNguHanh}, Cung Mệnh đắc ${starAnalysis.name}. Khí chất đặc trưng: ${starAnalysis.keyTraits} Bạn là người có nội lực phi thường, trọng chữ tín và sống có nguyên tắc. Bản lĩnh dám nghĩ dám làm, ghét sự giả tạo, luôn sẵn lòng bảo bọc người thân cận.`,
      advice: 'Học cách buông bớt sự kiểm soát, lắng nghe trực giác và cho phép bản thân nghỉ ngơi đúng lúc.'
    },
    {
      id: 'pillar_career',
      title: 'Quan Lộc & Con Đường Sự Nghiệp',
      subtitle: `Thân cư ${cungThan} • Cục: ${cuc}`,
      color: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
      keyFact: `${thanAnalysis.title}`,
      deepAnalysis: `Đường công danh gắn chặt với vị thế của ${thanAnalysis.desc}. Bạn phát huy tối đa năng lực khi làm chủ kinh doanh, quản lý đội ngũ, hoạch định chiến lược hoặc làm trong các lĩnh vực tài chính, công nghệ, sáng tạo. Trung vận có quý nhân nâng đỡ nâng tầm sự nghiệp.`,
      advice: `Chọn đối tác hợp mệnh (${masterRemedy.luckyColors.split(',')[0]}), ký kết văn bản pháp lý minh bạch để tránh thị phi tiểu nhân.`
    },
    {
      id: 'pillar_wealth',
      title: 'Kho Tàng Tài Bạch & Điền Sản Đất Đai',
      subtitle: 'Tụ tài chính ngạch, càng tích lũy càng sung túc',
      color: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
      keyFact: `Điểm Tài Bạch: ${destinyScores[1].score}/100 • ${destinyScores[1].level}`,
      deepAnalysis: `Lá số cho thấy Cung Tài Bạch sáng, khả năng kiếm tiền nhạy bén. Thời trẻ chi tiêu rộng rãi cho các mối quan hệ xã giao, nhưng từ sau tuổi 33, dòng tiền ổn định vững chắc, bạn có duyên lớn với bất động sản, đất đai điền trạch và các kênh tài sản giá trị thật.`,
      advice: 'Nên biến tiền mặt thành tài sản cố định (nhà đất, vàng) để giữ của bền lâu, tránh đầu tư lướt sóng may rủi.'
    },
    {
      id: 'pillar_love',
      title: 'Hôn Nhân, Phu Thê & Duyên Nợ Cả Đời',
      subtitle: 'Duyên sâu nợ nặng, lạt mềm buộc chặt',
      color: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
      keyFact: `Điểm Duyên Nợ: ${destinyScores[3].score}/100 • ${destinyScores[3].level}`,
      deepAnalysis: `Chuyện tình cảm đòi hỏi sự thấu cảm và kiên nhẫn. Bạn đời là người có cá tính, giỏi giang và có trách nhiệm với tổ ấm. Thời kỳ đầu chung sống có thể xảy ra bất đồng quan điểm do cái tôi của hai bên, nhưng sau khi cùng nhau vượt qua thử thách thì càng về già càng gắn bó khăng khít.`,
      advice: 'Bớt một câu tranh cãi là thêm mười phần phúc khí. Lắng nghe và tôn trọng khoảng trời riêng của bạn đời.'
    },
    {
      id: 'pillar_health',
      title: 'Tật Ách, Sức Khỏe & Đại Hạn Cần Phòng',
      subtitle: 'Điều hòa khí huyết, giữ tâm an lạc',
      color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
      keyFact: `Điểm Thọ Trường: ${destinyScores[4].score}/100 • ${destinyScores[4].level}`,
      deepAnalysis: `Do tính chất công việc nhiều lo toan, cần lưu tâm đến tạng phủ thuộc hành khắc với bản mệnh ${menhNguHanh}, đặc biệt là hệ tiêu hóa, dạ dày và chứng đau đầu do căng thẳng. Cần cẩn trọng khi đi lại sông nước hoặc tham gia giao thông vào các tháng giữa năm.`,
      advice: 'Tập thiền định hoặc thể thao đều đặn, ăn uống thanh đạm, năng làm việc thiện để tiêu tai giải nạn.'
    }
  ];

  const generalVerdict = `Đương số ${fullName} sinh năm ${canChiYear} (${menhNguHanh}), Cung Mệnh tọa tại ${cungMenh} đắc ${starAnalysis.name}, Cung Thân cư ${cungThan} (${thanAnalysis.title}), hưởng ${cuc} (${menhCuc.title}). Khí chất ${starAnalysis.archetype}, trung vận bứt phá ngoạn mục, hậu vận hưởng trọn an khang phúc lộc.`;

  return {
    thayPhan,
    banMenh,
    congDanh,
    tinhDuyen,
    vanHan,
    daiVanTien,
    daiVanDuongThoi,
    daiVanBuocNgoat,
    tieuVan,
    hoaGiai,
    nhanXet,
    generalVerdict,
    lifeDossier: {
      tienVan,
      trungVan,
      hauVan,
      fivePillars,
      destinyScores,
      masterRemedy
    }
  };
}
