// Cổ Thư Tướng Pháp - Bộ Mẫu Chỉ Tay & Tướng Mặt Chuẩn Sách Hướng Dẫn
// Tư liệu tham khảo: Funk Wagnalls New Encyclopedia, Ernst Issberner - Haldane (Berlin, 1922), Dr. Josef Ranald, Henry Rem

export interface PalmPattern {
  id: string;
  name: string;
  bookTitle: string;
  badge: string;
  badgeColor: string;
  category: 'auspicious' | 'ranald_temperament' | 'celebrity';
  meaning: string;
  keyLines: string;
  description: string;
  analysisDetail: string;
  healthNote?: string;
  svgImage: string;
}

export interface FacePattern {
  id: string;
  name: string;
  bookTitle: string;
  badge: string;
  badgeColor: string;
  meaning: string;
  description: string;
  analysisDetail: string;
  imageUrl: string;
}

export interface BodyPattern {
  id: string;
  name: string;
  bookTitle: string;
  badge: string;
  badgeColor: string;
  meaning: string;
  keyPosture: string;
  description: string;
  analysisDetail: string;
  svgImage: string;
}

// Hàm sinh SVG bàn tay chuẩn đồ họa cổ thư & nghiên cứu giải phẫu bàn tay
function generatePalmSvg(type: 
  'm_shape' | 'simian_line' | 'gold_ingot' | 'tam_tai' | 'mystic_cross' | 'fish_tail' |
  'hand_nong_nay' | 'hand_lanh_dam' | 'hand_hon_gian' | 'hand_uong_nganh' | 'hand_spatula' | 'hand_tieu_thu'
): string {
  const commonDefs = `
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0d0914" />
        <stop offset="50%" stop-color="#180e28" />
        <stop offset="100%" stop-color="#090510" />
      </linearGradient>
      <linearGradient id="handGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#2a1b42" stop-opacity="0.85" />
        <stop offset="100%" stop-color="#1a102b" stop-opacity="0.95" />
      </linearGradient>
      <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3.5" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur2" />
        <feMerge>
          <feMergeNode in="blur2" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  // Bàn tay cơ bản (Palm Outline)
  const handPath = `
    <!-- Vòng hào quang cổ thư -->
    <circle cx="250" cy="300" r="210" fill="none" stroke="#d97706" stroke-width="1" stroke-dasharray="4 6" opacity="0.3" />
    <circle cx="250" cy="300" r="190" fill="none" stroke="#8b5cf6" stroke-width="0.8" opacity="0.25" />

    <!-- Hình dáng bàn tay -->
    <path d="M 175 480 
             C 160 440, 140 370, 140 320
             C 140 290, 110 260, 95 240
             C 80 220, 90 200, 110 210
             C 135 220, 165 260, 175 280
             C 170 240, 160 170, 170 130
             C 175 110, 195 110, 200 130
             C 205 160, 210 230, 215 240
             C 215 200, 218 120, 230 80
             C 235 65, 255 65, 260 80
             C 265 120, 265 210, 268 240
             C 272 200, 280 140, 295 115
             C 305 100, 320 105, 322 125
             C 325 160, 320 225, 322 250
             C 328 220, 342 180, 355 170
             C 368 160, 378 175, 372 195
             C 360 230, 345 320, 340 370
             C 335 430, 320 480, 300 480
             Z" 
          fill="url(#handGrad)" 
          stroke="#f59e0b" 
          stroke-width="2.5" 
          stroke-linejoin="round"
          filter="url(#glow)" />

    <!-- Vòng ngấn cổ tay -->
    <path d="M 175 480 C 235 495, 280 492, 300 480" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" opacity="0.6" />
    <path d="M 180 492 C 235 505, 275 502, 295 492" fill="none" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
  `;

  let patternContent = '';

  if (type === 'm_shape') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 245 440 C 248 370, 252 300, 258 245" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <circle cx="245" cy="325" r="18" fill="url(#goldLine)" fill-opacity="0.25" stroke="#f59e0b" stroke-width="1.5" filter="url(#goldGlow)" />
    `;
  } else if (type === 'simian_line') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.6" />
      <line x1="165" y1="290" x2="335" y2="290" stroke="url(#goldLine)" stroke-width="6" stroke-linecap="round" filter="url(#goldGlow)" />
      <circle cx="250" cy="290" r="14" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="2" filter="url(#goldGlow)" />
    `;
  } else if (type === 'gold_ingot') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.5" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.5" />
      <polygon points="215,310 280,318 295,365 210,360" fill="url(#goldLine)" fill-opacity="0.35" stroke="url(#goldLine)" stroke-width="3" filter="url(#goldGlow)" />
    `;
  } else if (type === 'tam_tai') {
    patternContent = `
      <path d="M 185 285 C 165 330, 170 395, 215 465" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 185 285 C 225 315, 265 345, 315 370" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 335 305 C 290 300, 240 275, 205 270" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <circle cx="215" cy="465" r="5" fill="#f59e0b" filter="url(#goldGlow)" />
      <circle cx="315" cy="370" r="5" fill="#f59e0b" filter="url(#goldGlow)" />
      <circle cx="335" cy="305" r="5" fill="#f59e0b" filter="url(#goldGlow)" />
    `;
  } else if (type === 'mystic_cross') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.6" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.6" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#ec4899" stroke-width="2.5" opacity="0.6" />
      <line x1="235" y1="290" x2="265" y2="330" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <line x1="265" y1="290" x2="235" y2="330" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <circle cx="250" cy="310" r="28" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7" />
    `;
  } else if (type === 'fish_tail') {
    patternContent = `
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.6" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#ec4899" stroke-width="2.5" opacity="0.6" />
      <path d="M 185 285 C 170 330, 175 390, 205 435" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 205 435 C 215 450, 230 465, 238 480" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 205 435 C 195 450, 185 465, 178 480" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#goldGlow)" />
    `;
  } else if (type === 'hand_nong_nay') {
    // Sắc thái bàn tay nóng nảy của Bác sĩ Josef Ranald (Tâm đạo dây thừng, ngón út ngắn, nhiều nếp nhăn)
    patternContent = `
      <!-- Tâm đạo dạng xoắn xích dây thừng -->
      <path d="M 335 305 C 290 300, 240 270, 205 270" fill="none" stroke="#f43f5e" stroke-width="4" stroke-dasharray="6 3" filter="url(#glow)" />
      <path d="M 335 302 C 290 297, 240 273, 205 273" fill="none" stroke="#fb7185" stroke-width="2" opacity="0.8" />
      <!-- Nhiều chỉ tay chằng chịt lo âu & dục tốc -->
      <line x1="205" y1="315" x2="235" y2="340" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="225" y1="345" x2="255" y2="360" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="260" y1="320" x2="285" y2="350" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="240" y1="285" x2="270" y2="310" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="180" y1="360" x2="210" y2="380" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <!-- Đánh dấu ngón út ngắn -->
      <circle cx="372" cy="195" r="16" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3 3" />
    `;
  } else if (type === 'hand_lanh_dam') {
    // Sắc thái bàn tay lãnh đạm (mềm dày, ít chỉ tay, tàn nhang lấm chấm)
    patternContent = `
      <!-- Đốm tàn nhang lưng bàn tay -->
      <circle cx="230" cy="420" r="1.8" fill="#93c5fd" opacity="0.9" />
      <circle cx="245" cy="435" r="1.5" fill="#93c5fd" opacity="0.8" />
      <circle cx="260" cy="415" r="2" fill="#93c5fd" opacity="0.9" />
      <circle cx="275" cy="430" r="1.5" fill="#93c5fd" opacity="0.8" />
      <circle cx="285" cy="410" r="1.8" fill="#93c5fd" opacity="0.9" />
      <!-- Chỉ tay thưa thớt, mờ nhạt, biểu thị sự kiên nhẫn trầm lắng -->
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#60a5fa" stroke-width="2.5" opacity="0.45" />
      <path d="M 185 285 C 220 310, 260 335, 305 355" fill="none" stroke="#60a5fa" stroke-width="2.5" opacity="0.45" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#60a5fa" stroke-width="2.5" opacity="0.45" />
    `;
  } else if (type === 'hand_hon_gian') {
    // Sắc thái bàn tay hờn giận / tự ái (lòng bàn trũng, Trí đạo dài thẳng tắp, ngón cái rất dài)
    patternContent = `
      <!-- Lòng bàn tay trũng sâu (vùng chứa tham vọng & tự ái) -->
      <ellipse cx="250" cy="330" rx="42" ry="28" fill="#d97706" fill-opacity="0.18" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" />
      <!-- Trí đạo thẳng tắp, sâu đậm cắt ngang bàn tay -->
      <line x1="185" y1="285" x2="335" y2="335" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <!-- Đánh dấu ngón cái rất dài vươn cao -->
      <line x1="110" y1="210" x2="75" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2" />
      <circle cx="75" cy="180" r="5" fill="#f59e0b" />
    `;
  } else if (type === 'hand_uong_nganh') {
    // Sắc thái bàn tay ương ngạnh (gò Kim Tinh nở vồng cứng chắc, chỉ tay son đậm)
    patternContent = `
      <!-- Gò Kim Tinh nổi cứng chắc và phát quang -->
      <path d="M 160 300 C 135 340, 155 440, 205 465 C 215 420, 205 340, 160 300 Z" fill="#ec4899" fill-opacity="0.3" stroke="#f43f5e" stroke-width="2.5" filter="url(#glow)" />
      <!-- 3 đường chỉ tay son đậm màu hồng -->
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <!-- Đánh dấu ngón cái ngắn -->
      <circle cx="95" cy="235" r="14" fill="none" stroke="#f43f5e" stroke-width="1.8" stroke-dasharray="3 3" />
    `;
  } else if (type === 'hand_spatula') {
    // Ngón tay hình cái bay (Doigts Spatulés của Henry Rem: Napoléon, Rembrandt, Rubens)
    patternContent = `
      <!-- Đầu các ngón nở bè hình cái bay / cái xẻng -->
      <ellipse cx="200" cy="120" rx="16" ry="11" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <ellipse cx="260" cy="72" rx="18" ry="12" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <ellipse cx="322" cy="115" rx="16" ry="11" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <!-- Gò Thái Dương rực sáng nghệ thuật & danh vọng -->
      <circle cx="285" cy="225" r="16" fill="url(#goldLine)" fill-opacity="0.4" stroke="#f59e0b" stroke-width="2" filter="url(#goldGlow)" />
    `;
  } else {
    // Bàn tay nhỏ tinh tế (Tiểu thủ mẫn tiệp)
    patternContent = `
      <!-- Vòng hào quang sáng tạo tỉ mỉ -->
      <circle cx="250" cy="300" r="160" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6" />
      <!-- 3 đường chỉ tay thanh mảnh, sắc nét -->
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#38bdf8" stroke-width="2.5" />
    `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 580" width="100%" height="100%">
      ${commonDefs}
      <rect width="500" height="580" fill="url(#bgGrad)" />
      ${handPath}
      ${patternContent}
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Danh sách 12 dạng chỉ tay và sắc thái bàn tay chuẩn sách hướng dẫn
export const PALM_PATTERNS: PalmPattern[] = [
  // NHÓM 1: CÁC ĐƯỜNG CHỈ TAY CỔ THƯ CÁT TƯỜNG
  {
    id: 'm_shape',
    name: 'Chỉ Tay Chữ M',
    bookTitle: 'Ma Y Cổ Thư • Phú Quý Song Toàn Quý Tướng',
    badge: 'Quý Tướng Hiếm Có ⭐⭐⭐',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    category: 'auspicious',
    meaning: 'Trực giác bén nhạy, tài năng lãnh đạo, trung vận đại phát',
    keyLines: '4 đường Sinh Đạo, Trí Đạo, Định Mệnh và Tâm Đạo liên kết thành hình chữ M rõ nét.',
    description: 'Bàn tay chữ M là tướng tay của những người có tố chất lãnh đạo bẩm sinh, trực giác nhạy bén phi thường. Thời trẻ có thể thử thách nhưng từ tuổi 30 trở đi sự nghiệp bứt phá ngoạn mục, tiền tài vào như nước.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI CHỈ TAY CHỮ M]
1. NHẬN DIỆN VÂN TAY:
Bàn tay sở hữu thế "Chữ M Phú Quý" cực kỳ rõ nét. Sự giao thoa hiếm có giữa 4 đại lộ: Sinh Đạo (sức sống), Trí Đạo (tư duy), Định Mệnh (sự nghiệp) và Tâm Đạo (tâm tính).

2. CÔNG DANH & TÀI LỘC:
- Trực giác thương mại vô cùng nhạy bén, nhận biết thời cơ trước người khác một bước.
- Trung vận (từ 32 đến 48 tuổi) là giai đoạn hoàng kim: công danh thăng tiến vượt bậc, khởi nghiệp kinh doanh dựng nên cơ đồ lớn.

3. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Tài năng lớn phải đi đôi với tâm đức dày. Hãy giữ chữ tín và biết chia sẻ phúc lộc cho cộng đồng, ắt hậu vận điền sản nứt đố đổ vách, con cháu vinh hiển!`,
    svgImage: generatePalmSvg('m_shape')
  },
  {
    id: 'simian_line',
    name: 'Chỉ Tay Chữ Nhất (Simian Line)',
    bookTitle: 'Liễu Trang Tướng Pháp • Quán Thông Thủ',
    badge: 'Kỳ Tài Giang Hồ ⭐⭐⭐',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    category: 'auspicious',
    meaning: 'Tâm trí hợp nhất, ý chí gang thép, làm nên việc long trời lở đất',
    keyLines: 'Đường Tâm Đạo và Trí Đạo hòa làm một, chạy thẳng tắp vắt ngang lòng bàn tay.',
    description: 'Cổ nhân có câu: "Bàn tay chữ Nhất nắm giang sơn". Người có tướng tay này một khi đã muốn điều gì thì theo đuổi tới cùng, kiên định phi thường và có tài năng kiệt xuất trong lĩnh vực của mình.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI CHỈ TAY CHỮ NHẤT]
1. NHẬN DIỆN VÂN TAY:
Lòng bàn tay có duy nhất một đường vân chính sâu đậm chạy ngang từ gò Mộc Tinh sang gò Thủy Tinh (Quán Thông Thủ). Trí tuệ và Cảm xúc hòa quyện làm một thể thống nhất.

2. CỐT CÁCH & Ý CHÍ:
- Ý chí sắt đá, quyết đoán, một khi đã hạ quyết tâm thì không chùn bước trước bất kỳ nghịch cảnh nào.
- Thích hợp giữ vị trí chỉ huy, tiên phong khai phá, chuyên gia độc lập hoặc lãnh đạo tối cao.

3. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Ý chí mạnh dễ dẫn tới độc đoán. Cần học chữ "Nhu", lắng nghe cộng sự và gia đình để thành tựu thêm bền vững.`,
    svgImage: generatePalmSvg('simian_line')
  },
  {
    id: 'gold_ingot',
    name: 'Chỉ Tay Thỏi Vàng (Nguyên Bảo)',
    bookTitle: 'Ma Y Thần Tướng • Điền Trạch Tụ Tài Vân',
    badge: 'Kho Tiền Trời Cho ⭐⭐⭐',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    category: 'auspicious',
    meaning: 'Giữ tiền cực giỏi, tài lộc dồi dào, hậu vận đất đai nhà cửa bề thế',
    keyLines: 'Các đường vân nối với Sinh Đạo và Trí Đạo tạo thành một hình thang/tam giác khép kín ở giữa bàn tay.',
    description: 'Vân Nguyên Bảo (Thỏi Vàng) là biểu tượng của kho chứa tài sản trời ban. Người có tướng tay này không bao giờ rơi vào cảnh túng thiếu, kiếm tiền giỏi và giữ tiền cực kỳ bền chặt.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI CHỈ TAY THỎI VÀNG]
1. NHẬN DIỆN VÂN TAY:
Khu vực trung tâm lòng bàn tay có các đường vân đan kín tạo thành hình thỏi vàng Nguyên Bảo vững chắc, không có kẽ hở thoát tài.

2. TÀI CHÍNH & ĐIỀN SẢN:
- Càng về tuổi trung niên và hậu vận càng tích lũy nhiều đất đai, nhà cửa.
- Khả năng quản lý tài chính xuất sắc, tiền vào túi là giữ được và sinh sôi nảy nở.

3. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Tài khố dồi dào thì nên làm nhiều việc thiện nguyện để bồi đắp thêm phúc ấm cho con cháu hiển đạt vinh hoa.`,
    svgImage: generatePalmSvg('gold_ingot')
  },
  {
    id: 'tam_tai',
    name: 'Ba Đường Cát Tướng (Tam Tài)',
    bookTitle: 'Cổ Thư Tướng Pháp • Phúc Thọ Song Toàn',
    badge: 'Bình An Trường Thọ ⭐⭐',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    category: 'auspicious',
    meaning: 'Cuộc đời thanh nhàn, quý nhân nâng đỡ, gia đạo hòa thuận, sống thọ',
    keyLines: '3 đường Sinh Đạo - Trí Đạo - Tâm Đạo sâu dài, rõ nét, cong mềm mại không đứt quãng.',
    description: 'Tướng tay ba đường thanh tú là phúc tướng trời ban cho người có tâm tính thiện lương, cuộc đời êm đềm như dòng nước, ít gặp sóng to gió lớn, được mọi người quý mến giúp đỡ.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI TAM TÀI CÁT TƯỚNG]
1. NHẬN DIỆN VÂN TAY:
Ba đường Sinh Đạo, Trí Đạo, Tâm Đạo phân minh, thế tựa rồng bay phượng múa, không có vân tạp cắt phá.

2. PHÚC KHÍ CUỘC ĐỜI:
- Thân thể khỏe mạnh, ít ốm đau bệnh tật, tâm trí sáng suốt minh mẫn đến tuổi già.
- Đời sống gia đạo thuận hòa, con cái hiếu thảo, luôn có quý nhân trợ lực khi cần.`,
    svgImage: generatePalmSvg('tam_tai')
  },
  {
    id: 'mystic_cross',
    name: 'Chữ X Huyền Bí (Mystic Cross)',
    bookTitle: 'Tướng Pháp Bí Truyền • Giác Quan Thứ Sáu',
    badge: 'Căn Duyên Huyền Học ⭐⭐⭐',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    category: 'auspicious',
    meaning: 'Trực giác tâm linh nhạy bén, linh cảm chuẩn xác, tai qua nạn khỏi kỳ diệu',
    keyLines: 'Dấu chữ X sắc nét nằm giữa đường Tâm Đạo và Trí Đạo (khu vực Gò Hỏa Tinh).',
    description: 'Chữ X Thần Bí là dấu hiệu của người có năng lượng tâm linh và trực giác siêu việt. Thường có khả năng tiên cảm điều sắp xảy ra, có quý nhân vô hình che chở thoát hiểm trong gang tấc.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI CHỮ X HUYỀN BÍ]
1. NHẬN DIỆN VÂN TAY:
Dấu chữ X cân đối nằm trọn giữa hai đường Tâm Đạo và Trí Đạo.

2. TRỰC GIÁC & LINH CẢM:
- Nhạy cảm với năng lượng xung quanh, đọc vị tâm lý người khác chỉ qua vài ánh nhìn.
- Hợp với nghiên cứu, tư vấn, chữa lành, nghệ thuật hoặc quản trị nhân sự.`,
    svgImage: generatePalmSvg('mystic_cross')
  },
  {
    id: 'fish_tail',
    name: 'Đuôi Cá Hậu Vận (Ngư Vĩ Vân)',
    bookTitle: 'Tướng Pháp Bí Truyền • Hậu Vận Phát Phúc',
    badge: 'Khổ Trước Sướng Sau ⭐⭐',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    category: 'auspicious',
    meaning: 'Tiền vận gian nan bươn chải, trung hậu vận đại phát, con cháu hiển vinh',
    keyLines: 'Cuối đường Sinh Đạo phân thành 2 nhánh mềm mại hướng lên tựa đuôi cá chép vượt vũ môn.',
    description: 'Vân Ngư Vĩ (Đuôi Cá) tượng trưng cho cá chép hóa rồng. Người sở hữu tướng tay này thường phải tự thân lập nghiệp, nhưng hậu vận lại cực kỳ rực rỡ, giàu sang phú quý vượt bậc.',
    analysisDetail: `[THỦ TƯỚNG HỌC LUẬN GIẢI ĐUÔI CÁ NGƯ VĨ]
1. NHẬN DIỆN VÂN TAY:
Cuối đường Sinh Đạo chẽ thành hai nhánh mềm mại tựa đuôi cá bơi ngược dòng (ngư vĩ hóa long).

2. VẬN THẾ CẢ ĐỜI:
- Tuổi trẻ bôn ba tha hương từ hai bàn tay trắng. Sau 45 tuổi kinh tế bứt phá ngoạn mục, của cải dồi dào, gia sản bề thế. Con cháu thông minh, đỗ đạt.`,
    svgImage: generatePalmSvg('fish_tail')
  },

  // NHÓM 2: 4 SẮC THÁI KHÍ CHẤT & BỆNH LÝ BÀN TAY (BÁC SĨ JOSEF RANALD)
  {
    id: 'hand_nong_nay',
    name: 'Bàn Tay Nóng Nảy (Hỏa Tướng)',
    bookTitle: 'Bác Sĩ Josef Ranald • Khảo Cứu Sắc Thái Bàn Tay & Bệnh Lý',
    badge: 'Dục Tốc & Sáng Tạo 🔥',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    category: 'ranald_temperament',
    meaning: 'Dục tốc, phản xạ siêu nhanh, tự cao, giàu trí tưởng tượng nhưng tính khí thất thường',
    keyLines: 'Bàn tay nhỏ, dài, tam giác, nhiều nếp nhăn & nhiều chỉ tay li ti. Ngón út ngắn, da tay thô, đường Tâm Đạo vặn xoắn như dây thừng.',
    description: 'Theo nghiên cứu của Bác sĩ Josef Ranald, bàn tay này đại diện cho người mang hỏa khí thịnh: làm việc gì cũng muốn có kết quả tức thì, thông minh sáng tạo đột phá nhưng thiếu nhẫn nại và dễ bốc đồng.',
    analysisDetail: `[KHẢO CỨU Y HỌC & TƯỚNG PHÁP - BÀN TAY NÓNG NẢY (JOSEF RANALD)]
1. ĐẶC ĐIỂM GIẢI PHẪU:
- Bàn tay hẹp, hình tam giác, ngón mềm mỏng nhọn, ngón út ngắn hơn đốt thứ hai ngón áp út.
- Đường Tâm Đạo có dạng xích vặn xoắn như dây thừng, nhiều vân phụ li ti đan chéo biểu lộ tâm tư luôn dao động.

2. TÂM LÝ & CÁ TÍNH:
- Phản xạ cực nhanh, giàu sức tưởng tượng, có nhiều ý tưởng độc đáo đi trước thời đại.
- Nhược điểm: Dục tốc, nóng giận bất chợt, tự cao và dễ bỏ cuộc giữa chừng khi gặp trở ngại kéo dài.

3. DẤU HIỆU BỆNH LÝ (BÁC SĨ RANALD LƯU Ý):
- Dễ bị căng thẳng hệ thần kinh thực vật, tim đập nhanh, hồi hộp, huyết áp dao động thất thường do năng lượng đốt cháy quá nhanh.

4. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Tập hít thở sâu, trước khi ra quyết định lớn hãy dừng lại 3 giây. Thiền định và ăn nhiều rau xanh giải nhiệt sẽ giúp tâm an, sự nghiệp thăng hoa bền vững.`,
    healthNote: 'Lưu ý tim mạch, huyết áp và căng thẳng thần kinh do thức khuya hay áp lực dồn dập.',
    svgImage: generatePalmSvg('hand_nong_nay')
  },
  {
    id: 'hand_lanh_dam',
    name: 'Bàn Tay Lãnh Đạm (Thủy Tướng)',
    bookTitle: 'Bác Sĩ Josef Ranald • Khảo Cứu Sắc Thái Bàn Tay & Bệnh Lý',
    badge: 'Trầm Mặc Đa Tình ❄️',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    category: 'ranald_temperament',
    meaning: 'Trầm mặc, lạnh lùng kín đáo bên ngoài nhưng đa tình sâu sắc, chuộng lý luận logic',
    keyLines: 'Lòng bàn tay mềm, dày, ẩm ướt, ít chỉ tay, da rộng trắng nhạt. Móng tay rộng, lưng bàn tay có lấm chấm tàn nhang.',
    description: 'Nhóm người trầm tĩnh, ít biểu lộ cảm xúc ra ngoài mặt nhưng bên trong nội tâm vô cùng thâm sâu. Có tư duy logic sắc sảo, kiên nhẫn làm việc tới cùng và có khả năng giữ bí mật phi thường.',
    analysisDetail: `[KHẢO CỨU Y HỌC & TƯỚNG PHÁP - BÀN TAY LÃNH ĐẠM (JOSEF RANALD)]
1. ĐẶC ĐIỂM GIẢI PHẪU:
- Lòng bàn tay mềm, dày dặn, ẩm ướt, sắc da trắng nhạt, ngón tay ngắn không đều, móng rộng. Lưng bàn tay có đốm tàn nhang nhỏ.
- Lòng bàn tay rất ít chỉ tay, các đường chính mờ nhạt nhưng sâu kín.

2. TÂM LÝ & CÁ TÍNH:
- Người trầm mặc, lạnh lùng, bình thản trước biến cố, kiên nhẫn bền bỉ.
- Rất chuộng lý luận và bằng chứng thực tế. Trong tình cảm là người chung thủy, đa tình nhưng không thích phô trương.

3. DẤU HIỆU BỆNH LÝ (BÁC SĨ RANALD LƯU Ý):
- Tuần hoàn máu ngoại vi kém, dễ lạnh chân tay, nhạy cảm với khí lạnh, thấp khớp hoặc hệ bài tiết thận.

4. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Nên cởi mở chia sẻ tâm tư với người thân, tăng cường vận động ngoài trời đón ánh nắng ban mai để kích hoạt dương khí, công danh sẽ hanh thông gấp bội.`,
    healthNote: 'Lưu ý tuần hoàn máu, chứng lạnh bàn tay chân và các bệnh lý phong hàn thấp khớp.',
    svgImage: generatePalmSvg('hand_lanh_dam')
  },
  {
    id: 'hand_hon_gian',
    name: 'Bàn Tay Tự Ái / Hờn Giận (Kim Tướng)',
    bookTitle: 'Bác Sĩ Josef Ranald • Khảo Cứu Sắc Thái Bàn Tay & Bệnh Lý',
    badge: 'Khát Vọng Quyền Lực ⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    category: 'ranald_temperament',
    meaning: 'Tự ái cao, tham vọng lớn lao, tự kiêu, ý chí thống trị và vươn lên đỉnh cao mạnh mẽ',
    keyLines: 'Bàn tay vuông/chữ nhật, nhiều thịt, nóng ấm, lòng bàn tay trũng sâu. Chỉ tay rõ nét sậm màu, ngón dài, đầu ngón bè ra, đường Trí Đạo dài thẳng, ngón cái rất dài.',
    description: 'Người có lòng bàn tay trũng sâu và ngón cái dài vượt trội thường có tham vọng chính trị hoặc kinh doanh tột bậc. Lòng tự ái và danh dự cá nhân cực cao, một khi bị xúc phạm sẽ quyết tâm phục thù bằng thành công vượt bậc.',
    analysisDetail: `[KHẢO CỨU Y HỌC & TƯỚNG PHÁP - BÀN TAY TỰ ÁI (JOSEF RANALD)]
1. ĐẶC ĐIỂM GIẢI PHẪU:
- Khung bàn tay vuông vức, lòng bàn tay trũng như lòng chảo tạo thế tụ tài. Ngón cái rất dài và khỏe.
- Đường ngang dưới (Trí Đạo) dài và thẳng tắp cắt ngang qua gò Hỏa Tinh.

2. TÂM LÝ & CÁ TÍNH:
- Tự ái cao, ghét cảm giác bị coi thường. Ý chí tranh đấu mãnh liệt, không bao giờ chấp nhận vị trí thứ hai.
- Có khả năng lãnh đạo, quản lý sát sao, đòi hỏi sự hoàn hảo ở bản thân và người khác.

3. DẤU HIỆU BỆNH LÝ (BÁC SĨ RANALD LƯU Ý):
- Năng lượng đốt cháy quá mức, dễ bị stress dạ dày, viêm loét đường tiêu hóa, gan nóng và huyết áp cao do áp lực ganh đua.

4. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Học cách buông bỏ chấp niệm hơn thua. "Lùi một bước trời cao biển rộng", bao dung với người khác chính là tích lũy thêm đại phúc để giữ vững ngai vàng.`,
    healthNote: 'Lưu ý bệnh lý dạ dày, loét bao tử và huyết áp cao do làm việc căng thẳng quá độ.',
    svgImage: generatePalmSvg('hand_hon_gian')
  },
  {
    id: 'hand_uong_nganh',
    name: 'Bàn Tay Ương Ngạnh (Thổ Tướng)',
    bookTitle: 'Bác Sĩ Josef Ranald • Khảo Cứu Sắc Thái Bàn Tay & Bệnh Lý',
    badge: 'Cương Trực Bất Khuất ⛰️',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    category: 'ranald_temperament',
    meaning: 'Ngang ngạnh, khảng khái, không ưa sự giả tạo, có tư tưởng độc lập cao siêu',
    keyLines: 'Bàn tay rộng, ngắn, dày, nóng ướt, màu hồng hào. Lưng bàn tay có lông, ngón cái ngắn, gò Kim Tinh nổi cứng chắc, chỉ tay đậm màu hồng nhưng ít đường rườm rà.',
    description: 'Tướng tay của người bản lĩnh, nói là làm, không sợ cường quyền. Thích tranh luận bảo vệ chân lý, sống thẳng thắn không vụ lợi nhưng đôi khi quá cứng rắn khiến người khác e dè.',
    analysisDetail: `[KHẢO CỨU Y HỌC & TƯỚNG PHÁP - BÀN TAY ƯƠNG NGẠNH (JOSEF RANALD)]
1. ĐẶC ĐIỂM GIẢI PHẪU:
- Bàn tay dày cộm, chắc nịch, gò Kim Tinh (dưới ngón cái) nở vồng cứng cáp như đá tảng.
- Chỉ tay màu hồng son đậm, sắc nét, ít đường vân phụ li ti, ngón cái ngắn vững chãi.

2. TÂM LÝ & CÁ TÍNH:
- Cương trực, bất khuất, ghét thói nịnh bợ. Tư tưởng tự do, độc lập, không chịu gò bó theo khuôn mẫu định sẵn.
- Trực tính, có tài hùng biện, dám đứng mũi chịu sào bảo vệ công lý.

3. DẤU HIỆU BỆNH LÝ (BÁC SĨ RANALD LƯU Ý):
- Thể lực dồi dào, sức đề kháng cao nhưng cần lưu ý gan mật, axit uric và bệnh xương khớp khi về già do thói quen ăn uống đạm bạc không điều độ.

4. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Cần rèn luyện sự mềm mỏng, "cương nhu tương tế". Tránh tranh cãi vô bổ, dồn sức lực vào việc ích quốc lợi dân ắt tạo dựng sự nghiệp lưu danh thiên cổ.`,
    healthNote: 'Lưu ý chức năng gan mật, hạn chế rượu bia và thức ăn nhiều dầu mỡ cay nóng.',
    svgImage: generatePalmSvg('hand_uong_nganh')
  },

  // NHÓM 3: TƯỚNG BÀN TAY BẬC DANH NHÂN THẾ GIỚI (HENRY REM & ISSBERNER HALDANE)
  {
    id: 'hand_spatula',
    name: 'Ngón Tay Cái Bay (Doigts Spatulés)',
    bookTitle: 'Henry Rem & Ernst Issberner - Haldane (Berlin 1922)',
    badge: 'Tướng Bậc Danh Nhân 🎨',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    category: 'celebrity',
    meaning: 'Tướng tay của các bậc danh tướng (Napoléon II) & danh họa bậc thầy (Rubens, Rembrandt)',
    keyLines: 'Đầu các ngón tay nở bè ra hai bên hình chiếc bay/cái xẻng thợ nề (spatulé), khớp xương nổi rõ, gò Thái Dương & Hỏa Tinh phát triển rực rỡ.',
    description: 'Nhà nghiên cứu Henry Rem thống kê các vĩ nhân lịch sử có bàn tay hình chiếc bay đều sở hữu năng lực thực tế và óc sáng tạo siêu phàm: từ Hoàng đế Napoléon II, triết gia Lamennais, đến các đại danh họa Rembrandt, Rubens, Bouguereau...',
    analysisDetail: `[KHẢO CỨU DANH NHÂN THẾ GIỚI - NGÓN TAY CÁI BAY (HENRY REM)]
1. ĐẶC ĐIỂM GIẢI PHẪU CỔ THƯ:
- Đầu ngón tay nở rộng như hình cái xẻng (doigts spatulés), gò Thái Dương (nghệ thuật - danh vọng) nổi trội.
- Khớp xương rõ ràng, đại diện cho năng lượng hành động thực tiễn bùng nổ.

2. SỨ MỆNH & TÀI NĂNG BẬC THẦY:
- Ghét lý thuyết suông, luôn hiện thực hóa ý tưởng thành tác phẩm, công trình hoặc chiến lược cụ thể.
- Tinh thần tiên phong mở đường, không ngại khó khăn thử thách, có khả năng tạo ra bước ngoặt lịch sử trong chuyên môn.

3. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Hãy tập trung toàn bộ năng lượng vào một đam mê cốt lõi lớn nhất. Sự kiên trì và tài hoa thực tế của bạn sẽ để lại di sản trường tồn với thời gian!`,
    svgImage: generatePalmSvg('hand_spatula')
  },
  {
    id: 'hand_tieu_thu',
    name: 'Bàn Tay Nhỏ Tinh Tế (Tiểu Thủ Tinh Tú)',
    bookTitle: 'Tài Liệu Thư Viện Bodleian (Đại Học Oxford, Thế Kỷ 13)',
    badge: 'Mẫn Tiệp Khéo Léo 💡',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    category: 'celebrity',
    meaning: 'Tỉ mỉ, khéo léo bẩm sinh, có tài bắt chước, suy đoán và nhận thức nhanh nhạy phi thường',
    keyLines: 'Kích thước bàn tay nhỏ nhắn so với tỷ lệ chiều cao cơ thể, ngón tay thanh thoát mềm dẻo, chỉ tay sắc bén.',
    description: 'Người có bàn tay nhỏ nhắn so với tỷ lệ thân thể sở hữu trực giác quan sát tinh tế đến từng tiểu tiết. Có tài suy đoán tâm lý người khác, học một biết mười, rất khéo léo trong ngoại giao và nghệ thuật.',
    analysisDetail: `[KHẢO CỨU CỔ THƯ OXFORD - TIỂU THỦ TINH TÚ]
1. ĐẶC ĐIỂM HÌNH HỌC:
- Bàn tay nhỏ nhắn, các ngón thuôn dài uyển chuyển, độ linh hoạt của khớp tay cực cao.

2. TRÍ TUỆ & CÔNG DANH:
- Khả năng nhận thức vấn đề trong chớp mắt, bắt chước và phát triển kỹ năng với tốc độ kinh ngạc.
- Rất giỏi trong giao tiếp, đàm phán thương mãi, chế tác tinh xảo hoặc ngoại giao chiến lược.

3. LỜI KHUYÊN CẢI VẬN CỦA THẦY:
Tránh sa đà vào việc lo nghĩ những chuyện vụn vặt gây hao tổn nguyên khí. Hãy rèn luyện tầm nhìn đại cục để công danh rạng rỡ muôn nơi!`,
    svgImage: generatePalmSvg('hand_tieu_thu')
  }
];

// Danh sách các loại tướng mặt chuẩn sách hướng dẫn (Thập Diện Tướng Pháp - Ma Y Thần Tướng & Liễu Trang Tướng Pháp)
export const FACE_PATTERNS: FacePattern[] = [
  {
    id: 'face_dien',
    name: 'Tướng Mặt Chữ Điền',
    bookTitle: 'Ma Y Thần Tướng • Trung Hậu Thành Cơ',
    badge: 'Phúc Hậu Vững Vàng ⭐⭐⭐',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    meaning: 'Khuôn mặt vuông vức đầy đặn, sống có tình có nghĩa, hậu vận giàu sang',
    description: 'Mặt chữ Điền là chuẩn mực của người trung thực, đáng tin cậy, có ý chí bền bỉ vượt bậc, gầy dựng sự nghiệp vững như bàn thạch.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ ĐIỀN]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Trán vuông vức, xương hàm nở nang đầy đặn, khuôn mặt cân đối hình chữ Điền (田).

2. TÍNH CÁCH & VẬN SỐ:
- Tính tình cương trực, trọng chữ tín, làm việc cẩn trọng và kiên nhẫn.
- Là trụ cột vững chắc của gia đình và tổ chức. Trung vận tích lũy tài sản rất lớn.`,
    imageUrl: '/assets/tuong_mat_chu_dien.jpg'
  },
  {
    id: 'face_vien',
    name: 'Tướng Mặt Chữ Viên',
    bookTitle: 'Thần Tướng Toàn Thư • Viên Mãn Phú Khí',
    badge: 'Phúc Đức Đôn Hậu ⭐⭐⭐',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-400/40',
    meaning: 'Khuôn mặt tròn trịa đầy đặn, tính tình hòa nhã, kinh doanh buôn bán đại phát',
    description: 'Mặt chữ Viên (Hình Thủy) chủ về tính tình khoan dung độ lượng, duyên ăn nói khéo léo, tiền tài dồi dào, hậu vận ấm no sung túc.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ VIÊN (MẶT TRÒN)]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Khuôn mặt tròn trịa, gò má và cằm đầy đặn, da dẻ nhuận hồng, mắt sáng miệng hay cười thân thiện.

2. TÀI LỘC & NHÂN DUYÊN:
- Tính tình cởi mở, bao dung, dễ kết giao và rất được lòng mọi người xung quanh.
- Duyên kinh thương buôn bán cực vượng, tụ tài tụ lộc, gia đình hòa thuận an vui.`,
    imageUrl: '/assets/tuong_mat_chu_vien.jpg'
  },
  {
    id: 'face_xoan',
    name: 'Tướng Mặt Trái Xoan',
    bookTitle: 'Liễu Trang Tướng Pháp • Thanh Tú Quý Tướng',
    badge: 'Quý Nhân Phù Trợ ⭐⭐⭐',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
    meaning: 'Khuôn mặt thanh thoát thon gọn, thông minh khéo léo, duyên phận tốt lành',
    description: 'Mặt trái xoan thanh tú chủ về người thông minh, nhạy bén trong giao tiếp, được quý nhân yêu thương che chở, cuộc đời hanh thông.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT TRÁI XOAN]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Đường nét khuôn mặt mềm mại, cằm thon tròn, trán cao vừa phải, khí sắc quang minh nhuận hồng.

2. NHÂN DUYÊN & TÀI LỘC:
- Rất giỏi ngoại giao và nghệ thuật, được mọi người xung quanh nâng đỡ.
- Đời sống tinh thần phong phú, gia đạo êm ấm viên mãn.`,
    imageUrl: '/assets/tuong_mat_trai_xoan.jpg'
  },
  {
    id: 'face_giap',
    name: 'Tướng Mặt Chữ Giáp',
    bookTitle: 'Liễu Trang Tướng Pháp • Thông Minh Tuệ Giác',
    badge: 'Tài Hoa Xuất Chúng ⭐⭐⭐',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    meaning: 'Trán cao rộng, cằm thon thanh tú, trí tuệ siêu quần, tiền vận thăng tiến vinh hiển',
    description: 'Mặt chữ Giáp (甲) có thượng đình phát triển vượt trội, chủ về người học rộng tài cao, sáng tạo xuất chúng, sớm thành công trong học thuật và nghệ thuật.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ GIÁP]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Trán cao rộng và nở nang biểu trưng cho tư duy uyên bác; khuôn mặt thon gọn dần về phía cằm thanh tú.

2. CÔNG DANH & TRÍ TUỆ:
- Khả năng tiếp thu và xử lý thông tin cực nhanh, có năng khiếu đặc biệt về chiến lược và sáng tạo.
- Tiền vận đỗ đạt hoặc tạo dựng danh tiếng sớm, cuộc sống phong lưu nho nhã.`,
    imageUrl: '/assets/tuong_mat_chu_giap.jpg'
  },
  {
    id: 'face_do',
    name: 'Tướng Mặt Chữ Do',
    bookTitle: 'Ma Y Thần Tướng • Khổ Tận Cam Lai',
    badge: 'Hậu Vận Đại Phát ⭐⭐⭐',
    badgeColor: 'bg-amber-600/20 text-amber-200 border-amber-500/40',
    meaning: 'Trán hẹp cằm nở, cần cù chịu khó, trung và hậu vận tích lũy điền sản rất lớn',
    description: 'Mặt chữ Do (由) có hạ đình nở nang vững chắc, chủ về người tự lực cánh sinh, bền bỉ kiên trì, càng lớn tuổi càng giàu sang phú quý.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ DO]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Thượng đình (trán) hơi hẹp, nhưng từ gò má xuống xương hàm và cằm nở nang vững chãi, cằm dày thịt.

2. VẬN MỆNH & ĐIỀN SẢN:
- Thời trẻ bươn chải kiên cường, tôi rèn bản lĩnh, không bao giờ bỏ cuộc trước nghịch cảnh.
- Bước vào trung và hậu vận đại cát đại phát, tài sản đất đai tích tụ dồi dào, con cháu hiếu thuận.`,
    imageUrl: '/assets/tuong_mat_chu_do.jpg'
  },
  {
    id: 'face_dong',
    name: 'Tướng Mặt Chữ Đồng',
    bookTitle: 'Thái Ất Thần Tướng • Ngũ Nhạc Triều Quy',
    badge: 'Vương Giả Lãnh Tụ ⭐⭐⭐',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    meaning: 'Mặt vuông tròn hài hòa, ngũ nhạc triều quy, cốt cách đại tướng, danh lừng bốn bể',
    description: 'Mặt chữ Đồng (同) là tướng mạo hoàn mỹ của bậc lãnh đạo, khí phách phi phàm, tài đức vẹn toàn, quyền uy hiển hách được muôn người kính trọng.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ ĐỒNG]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Khuôn mặt hình chữ nhật vuông vức nhưng góc cạnh tròn trịa đầy đặn, mày rậm mắt sáng, ngũ quan tương xứng quy về sống mũi.

2. QUYỀN UY & SỰ NGHIỆP:
- Tố chất thủ lĩnh bẩm sinh, tầm nhìn sâu rộng, quyết đoán và có sức hiệu triệu lớn.
- Thường nắm giữ vị trí chủ chốt hoặc đứng đầu các tổ chức lớn, để lại sự nghiệp rạng danh.`,
    imageUrl: '/assets/tuong_mat_chu_dong.jpg'
  },
  {
    id: 'face_muc',
    name: 'Tướng Mặt Chữ Mục',
    bookTitle: 'Quản Lạc Nhân Tướng • Thanh Cao Diên Thọ',
    badge: 'Thâm Trầm Trường Thọ ⭐⭐⭐',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    meaning: 'Khuôn mặt thon dài thanh nhã, thâm trầm kín đáo, thích tư duy triết lý, phúc thọ an khang',
    description: 'Mặt chữ Mục (目 • Hình Mộc) chủ về người có chiều sâu nội tâm, phong thái nho nhã, sống thanh tao thoát tục, trường thọ diên niên.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TƯỚNG MẶT CHỮ MỤC]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Khuôn mặt thon dài, sống mũi cao thẳng, khoảng cách các bộ vị thanh nhã, ánh mắt tĩnh lặng thâm thúy.

2. TÂM TÍNH & TUỔI THỌ:
- Thích sự tĩnh lặng, nghiên cứu sâu sắc về đạo lý, chuyên môn hoặc học thuật đỉnh cao.
- Tâm tính an nhiên, không chuộng phù hoa náo nhiệt, hưởng tuổi thọ cao và hậu vận an nhàn.`,
    imageUrl: '/assets/tuong_mat_chu_muc.jpg'
  },
  {
    id: 'face_tam_dinh',
    name: 'Tướng Mặt Tam Đình Bình Quân',
    bookTitle: 'Thần Tướng Toàn Thư • Tam Đình Cân Đối',
    badge: 'Công Thành Danh Toại ⭐⭐⭐',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    meaning: 'Thượng đình, Trung đình, Hạ đình đều tăm tắp, cả đời phú quý thọ khang',
    description: 'Khoảng cách từ chân tóc đến chân mày, từ chân mày đến đầu mũi, và từ đầu mũi đến cằm chia đều tỉ lệ vàng 1:1:1. Tướng người hoàn hảo cả tiền - trung - hậu vận.',
    analysisDetail: `[NHÂN DIỆN HỌC LUẬN GIẢI TAM ĐÌNH BÌNH QUÂN]
1. ĐẶC ĐIỂM NHẬN DIỆN:
Thượng Đình (Trí tuệ), Trung Đình (Công danh sự nghiệp) và Hạ Đình (Hậu vận con cháu) cân xứng tuyệt mỹ.

2. VẬN HẠN CẢ ĐỜI:
- Cả ba giai đoạn tiền vận, trung vận và hậu vận đều phát triển thuận lợi, không có thăng trầm đứt gãy lớn.
- Số đại cát đại lợi, tuổi thọ cao và phúc đức truyền đời.`,
    imageUrl: '/assets/tuong_mat_tam_dinh.jpg'
  }
];

// Sinh SVG hình dáng toàn thân chuẩn đồ họa cổ thư hình tướng học
function generateBodySvg(type: 'long_hanh' | 'kim_hinh' | 'moc_hinh' | 'thuy_hinh' | 'hoa_hinh' | 'tho_hinh' | 'hac_hinh' | 'quy_boi'): string {
  const commonDefs = `
    <defs>
      <linearGradient id="bodyBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0a0715" />
        <stop offset="50%" stop-color="#150d24" />
        <stop offset="100%" stop-color="#070410" />
      </linearGradient>
      <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b2059" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#1e1133" stop-opacity="0.95" />
      </linearGradient>
      <linearGradient id="goldChakra" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="50%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>
      <linearGradient id="cyanChakra" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#67e8f9" />
        <stop offset="100%" stop-color="#0891b2" />
      </linearGradient>
      <linearGradient id="fireChakra" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fde047" />
        <stop offset="50%" stop-color="#f97316" />
        <stop offset="100%" stop-color="#dc2626" />
      </linearGradient>
      <filter id="bodyGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  let specificSvg = '';

  if (type === 'long_hanh') {
    specificSvg = `
      <circle cx="250" cy="90" r="32" fill="url(#bodyGrad)" stroke="#f59e0b" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 235 120 L 230 140 L 175 165 C 160 172, 155 185, 160 250 L 165 330 C 168 340, 185 340, 188 330 L 195 240 L 205 250 L 205 350 L 200 460 C 198 475, 222 475, 225 460 L 235 365 L 245 365 L 255 365 L 265 365 L 275 460 C 278 475, 302 475, 300 460 L 295 350 L 295 250 L 305 240 L 312 330 C 315 340, 332 340, 335 330 L 340 250 C 345 185, 340 172, 325 165 L 270 140 L 265 120 Z" 
            fill="url(#bodyGrad)" stroke="#f59e0b" stroke-width="2" filter="url(#bodyGlow)" />
      <line x1="250" y1="125" x2="250" y2="365" stroke="#fef08a" stroke-width="3" stroke-dasharray="3 3" filter="url(#bodyGlow)" />
      <circle cx="250" cy="250" r="180" fill="none" stroke="#f59e0b" stroke-width="1.2" stroke-dasharray="6 8" opacity="0.4" />
      <circle cx="250" cy="90" r="48" fill="none" stroke="#a855f7" stroke-width="1" stroke-dasharray="2 4" opacity="0.6" />
      <circle cx="250" cy="180" r="7" fill="url(#goldChakra)" filter="url(#bodyGlow)" />
      <circle cx="250" cy="275" r="9" fill="url(#goldChakra)" filter="url(#bodyGlow)" />
      <text x="250" y="278" fill="#090510" font-size="9" font-weight="bold" text-anchor="middle">Đan</text>
      <text x="250" y="40" fill="#fef08a" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">LONG HÀNH HỔ BỘ • THÂN HÌNH CÂN ĐỐI</text>
      <text x="250" y="475" fill="#a78bfa" font-size="10" text-anchor="middle">Vai rộng ngực nở • Dáng đứng tựa thái sơn</text>
    `;
  } else if (type === 'kim_hinh') {
    specificSvg = `
      <rect x="220" y="60" width="60" height="65" rx="12" fill="url(#bodyGrad)" stroke="#38bdf8" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 235 125 L 225 145 L 160 165 C 145 172, 145 190, 150 255 L 155 330 C 158 340, 178 340, 180 330 L 190 240 L 200 250 L 200 350 L 195 460 C 193 475, 222 475, 225 460 L 235 365 L 265 365 L 275 460 C 278 475, 307 475, 305 460 L 300 350 L 300 250 L 310 240 L 320 330 C 322 340, 342 340, 345 330 L 350 255 C 355 190, 355 172, 340 165 L 275 145 L 265 125 Z" 
            fill="url(#bodyGrad)" stroke="#38bdf8" stroke-width="2" filter="url(#bodyGlow)" />
      <line x1="250" y1="130" x2="250" y2="365" stroke="#38bdf8" stroke-width="3" filter="url(#bodyGlow)" />
      <circle cx="250" cy="250" r="170" fill="none" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="4 6" opacity="0.35" />
      <text x="250" y="40" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">KIM HÌNH CƯƠNG TRỰC • UY NGHI LÃNH ĐẠO</text>
      <text x="250" y="475" fill="#93c5fd" font-size="10" text-anchor="middle">Cốt cách kiên định • Bản lĩnh xoay chuyển càn khôn</text>
    `;
  } else if (type === 'moc_hinh') {
    specificSvg = `
      <ellipse cx="250" cy="85" rx="26" ry="34" fill="url(#bodyGrad)" stroke="#34d399" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 238 120 L 232 140 L 190 165 C 180 172, 175 185, 178 250 L 180 340 C 182 348, 198 348, 200 340 L 205 240 L 215 250 L 215 355 L 210 470 C 208 480, 228 480, 230 470 L 240 370 L 260 370 L 270 470 C 272 480, 292 480, 290 470 L 285 355 L 285 250 L 295 240 L 300 340 C 302 348, 318 348, 320 340 L 322 250 C 325 185, 320 172, 310 165 L 268 140 L 262 120 Z" 
            fill="url(#bodyGrad)" stroke="#34d399" stroke-width="2" filter="url(#bodyGlow)" />
      <line x1="250" y1="120" x2="250" y2="370" stroke="#34d399" stroke-width="2" stroke-dasharray="4 4" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">MỘC HÌNH THANH TÚ • NHO NHÃ VĂN NHÂN</text>
      <text x="250" y="475" fill="#a7f3d0" font-size="10" text-anchor="middle">Thanh cao đài các • Trí tuệ uyên bác danh vang</text>
    `;
  } else if (type === 'thuy_hinh') {
    specificSvg = `
      <circle cx="250" cy="85" r="34" fill="url(#bodyGrad)" stroke="#06b6d4" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 235 120 C 215 135, 165 160, 165 240 C 165 310, 185 330, 190 325 L 200 245 C 205 270, 205 340, 195 455 C 193 470, 225 470, 228 455 L 238 360 C 245 365, 255 365, 262 360 L 272 455 C 275 470, 307 470, 305 455 C 295 340, 295 270, 300 245 L 310 325 C 315 330, 335 310, 335 240 C 335 160, 285 135, 265 120 Z" 
            fill="url(#bodyGrad)" stroke="#06b6d4" stroke-width="2" filter="url(#bodyGlow)" />
      <circle cx="250" cy="245" r="42" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-dasharray="4 4" opacity="0.6" />
      <circle cx="250" cy="245" r="10" fill="url(#cyanChakra)" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#22d3ee" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">THỦY HÌNH ĐÔN HẬU • TỤ KHÍ PHÚC LỘC</text>
      <text x="250" y="475" fill="#67e8f9" font-size="10" text-anchor="middle">Thân hình tròn trịa • Tụ tài tụ lộc đại phú an khang</text>
    `;
  } else if (type === 'hoa_hinh') {
    specificSvg = `
      <polygon points="250,55 285,115 215,115" fill="url(#bodyGrad)" stroke="#f97316" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 235 120 L 225 140 L 155 160 C 145 168, 150 185, 160 245 L 170 330 C 172 340, 188 338, 190 328 L 202 235 L 215 245 L 220 345 L 215 460 C 213 475, 235 475, 238 460 L 246 360 L 254 360 L 262 460 C 265 475, 287 475, 285 460 L 280 345 L 285 245 L 298 235 L 310 328 C 312 338, 328 340, 330 330 L 340 245 C 350 185, 355 168, 345 160 L 275 140 L 265 120 Z" 
            fill="url(#bodyGrad)" stroke="#f97316" stroke-width="2" filter="url(#bodyGlow)" />
      <circle cx="250" cy="190" r="8" fill="url(#fireChakra)" filter="url(#bodyGlow)" />
      <line x1="250" y1="125" x2="250" y2="350" stroke="#f97316" stroke-width="2.5" stroke-dasharray="5 3" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#fb923c" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">HỎA HÌNH DUỆ TRÍ • DŨNG KHÍ TIÊN PHONG</text>
      <text x="250" y="475" fill="#fdba74" font-size="10" text-anchor="middle">Khí phách quyết liệt • Đi đầu đột phá tạo đại nghiệp</text>
    `;
  } else if (type === 'tho_hinh') {
    specificSvg = `
      <rect x="215" y="60" width="70" height="65" rx="8" fill="url(#bodyGrad)" stroke="#ca8a04" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 230 128 L 215 145 L 145 165 C 135 172, 138 195, 142 260 L 148 335 C 150 345, 175 345, 178 335 L 188 245 L 195 255 L 195 355 L 188 460 C 185 475, 220 475, 222 460 L 235 365 L 265 365 L 278 460 C 280 475, 315 475, 312 460 L 305 355 L 305 255 L 312 245 L 322 335 C 325 345, 350 345, 352 335 L 358 260 C 362 195, 365 172, 355 165 L 285 145 L 270 128 Z" 
            fill="url(#bodyGrad)" stroke="#ca8a04" stroke-width="2.2" filter="url(#bodyGlow)" />
      <rect x="200" y="220" width="100" height="70" rx="10" fill="none" stroke="#facc15" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.5" />
      <circle cx="250" cy="255" r="9" fill="url(#goldChakra)" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#facc15" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">THỔ HÌNH TRẦM ỔN • ĐIỀN SẢN VẠN LƯỢNG</text>
      <text x="250" y="475" fill="#fde047" font-size="10" text-anchor="middle">Lưng dày vai gấu • Tích lũy cơ nghiệp trường tồn muôn đời</text>
    `;
  } else if (type === 'hac_hinh') {
    specificSvg = `
      <ellipse cx="250" cy="80" rx="22" ry="30" fill="url(#bodyGrad)" stroke="#2dd4bf" stroke-width="2.2" filter="url(#bodyGlow)" />
      <line x1="250" y1="110" x2="250" y2="140" stroke="#2dd4bf" stroke-width="3" filter="url(#bodyGlow)" />
      <path d="M 240 135 L 235 150 L 195 175 C 188 182, 185 195, 188 250 L 190 345 C 192 355, 204 355, 206 345 L 210 245 L 220 255 L 220 360 L 215 475 C 213 485, 230 485, 232 475 L 242 375 L 258 375 L 268 475 C 270 485, 287 485, 285 475 L 280 360 L 280 255 L 290 245 L 294 345 C 296 355, 308 355, 310 345 L 312 250 C 315 195, 312 182, 305 175 L 265 150 L 260 135 Z" 
            fill="url(#bodyGrad)" stroke="#2dd4bf" stroke-width="1.8" filter="url(#bodyGlow)" />
      <path d="M 170 200 C 150 220, 140 260, 145 300" stroke="#5eead4" stroke-width="1.2" stroke-dasharray="3 5" fill="none" opacity="0.6" />
      <path d="M 330 200 C 350 220, 360 260, 355 300" stroke="#5eead4" stroke-width="1.2" stroke-dasharray="3 5" fill="none" opacity="0.6" />
      <text x="250" y="40" fill="#5eead4" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">HẠC HÌNH TIÊN CỐT • DIÊN THỌ AN NHIÊN</text>
      <text x="250" y="475" fill="#99f6e4" font-size="10" text-anchor="middle">Cổ cao thanh thoát • Tâm hồn tự tại thoát tục trường thọ</text>
    `;
  } else {
    // quy_boi: Tướng Lưng Rùa (Quy Bối)
    specificSvg = `
      <circle cx="250" cy="95" r="30" fill="url(#bodyGrad)" stroke="#818cf8" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 235 125 L 225 145 L 165 170 C 150 180, 150 200, 155 255 L 162 335 C 165 345, 185 345, 188 335 L 195 245 L 205 255 L 205 350 L 198 460 C 196 475, 225 475, 228 460 L 238 365 L 262 365 L 272 460 C 275 475, 304 475, 302 460 L 295 350 L 295 255 L 305 245 L 312 335 C 315 345, 335 345, 338 335 L 345 255 C 350 200, 350 180, 335 170 L 275 145 L 265 125 Z" 
            fill="url(#bodyGrad)" stroke="#818cf8" stroke-width="2" filter="url(#bodyGlow)" />
      <ellipse cx="250" cy="235" rx="50" ry="60" fill="none" stroke="#a5b4fc" stroke-width="1.8" stroke-dasharray="6 4" opacity="0.6" filter="url(#bodyGlow)" />
      <polygon points="250,195 275,210 275,240 250,255 225,240 225,210" fill="none" stroke="#c7d2fe" stroke-width="1" opacity="0.7" />
      <circle cx="250" cy="275" r="8" fill="url(#goldChakra)" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#a5b4fc" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">QUY BỐI PHÚC HẬU • TRƯỜNG TỒN PHÚC ĐỨC</text>
      <text x="250" y="475" fill="#c7d2fe" font-size="10" text-anchor="middle">Lưng rùa dày thịt • Vượt qua mọi giông bão bình an trường thọ</text>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%">
      ${commonDefs}
      <rect width="500" height="500" fill="url(#bodyBg)" />
      <circle cx="250" cy="250" r="235" fill="none" stroke="#eab308" stroke-width="1.2" opacity="0.3" />
      <circle cx="250" cy="250" r="220" fill="none" stroke="#a855f7" stroke-width="0.8" stroke-dasharray="3 5" opacity="0.35" />
      ${specificSvg}
    </svg>
  `;

  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent.trim());
}

// Danh sách các loại hình tướng toàn thân chuẩn sách cổ (Ngũ Hành Thể Tướng & Dị Tướng Cổ Thư)
export const BODY_PATTERNS: BodyPattern[] = [
  {
    id: 'body_long_hanh',
    name: 'Tướng Quý Phái (Long Hành Hổ Bộ)',
    bookTitle: 'Hình Tướng Toàn Thư • Cốt Cách Đế Vương',
    badge: 'Đại Phú Đại Quý ⭐⭐⭐',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-400/40',
    meaning: 'Dáng đi uyển chuyển như rồng, ngồi vững như núi, vai rộng ngực nở',
    keyPosture: 'Trục cột sống thẳng tắp, hai vai nở cân đối, bước đi vững chãi đĩnh đạc.',
    description: 'Tướng "Long Hành Hổ Bộ" (Đi như rồng lượn, bước như hổ đi) là một trong những quý tướng hàng đầu trong sách tướng cổ. Người mang tướng này có uy phong tự nhiên, sự nghiệp vang dội, nắm giữ quyền quý.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI LONG HÀNH HỔ BỘ]
1. ĐẶC ĐIỂM HÌNH TƯỚNG & CỐT CÁCH:
- Tỷ lệ cơ thể cân đối đỉnh cao, lưng thẳng như tùng bách, ngực nở nang, bước chân vững như bàn thạch.
- Thần thái toát ra sự trầm tĩnh, tự tin và uy nghi khiến người đối diện kính nể.

2. CÔNG DANH & TÀI LỘC:
- Tố chất lãnh đạo bẩm sinh, làm việc quyết đoán, trung vận và hậu vận lập nên đại nghiệp.
- Tài lộc dồi dào, giàu sang bền vững, lưu truyền phúc đức cho nhiều đời sau.`,
    svgImage: generateBodySvg('long_hanh')
  },
  {
    id: 'body_kim_hinh',
    name: 'Tướng Uy Dũng (Kim Hình Cương Trực)',
    bookTitle: 'Ma Y Thần Tướng • Thân Cốt Kim Hình',
    badge: 'Ý Chí Sắt Đá ⭐⭐⭐',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-400/40',
    meaning: 'Khung xương vuông vắn vững chắc, tính tình quả quyết, thích hợp cầm quân làm chủ',
    keyPosture: 'Dáng đứng sừng sững, cơ thể săn chắc, khớp xương rắn rỏi, phong thái quyết liệt.',
    description: 'Người thuộc Kim hình toàn thân có khung xương vững chắc, tính tình khảng khái, cương trực, trọng chữ tín. Trong gian khó luôn là người tiên phong dẫn dắt đoàn thể.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI KIM HÌNH CƯƠNG TRỰC]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Khung xương vuông vức, các khớp xương chắc khỏe, dáng đứng hiên ngang, giọng nói sang sảng.

2. VẬN SỐ & SỰ NGHIỆP:
- Thích hợp các ngành nghề kinh doanh độc lập, tài chính, quân sự, kỹ thuật cao hoặc quản lý cấp cao.
- Tuổi trẻ dốc sức bươn chải, sau 35 tuổi định hình sự nghiệp vững như thép đã tôi luyện.`,
    svgImage: generateBodySvg('kim_hinh')
  },
  {
    id: 'body_moc_hinh',
    name: 'Tướng Thanh Nhã (Mộc Hình Thanh Tú)',
    bookTitle: 'Liễu Trang Tướng Pháp • Tiên Phong Đạo Cốt',
    badge: 'Trí Tuệ Uyên Bác ⭐⭐⭐',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    meaning: 'Thân hình thanh mảnh cao ráo, ngón tay búp măng, phong thái nho nhã học sĩ',
    keyPosture: 'Dáng người cao ráo, bước đi nhẹ nhàng thanh thoát, cổ cao thanh tú.',
    description: 'Tướng Mộc hình mang khí chất của cây xanh vươn cao đón ánh mặt trời. Người có tướng này trí tuệ mẫn tiệp, am hiểu văn chương học thuật, cuộc sống an nhiên thanh tao.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI MỘC HÌNH THANH TÚ]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Thân hình cao ráo, tứ chi thon dài, cử chỉ khoan thai nhã nhặn, ánh mắt sáng suốt tinh anh.

2. CÔNG DANH & HỌC VẤN:
- Cực kỳ có duyên với các lĩnh vực sáng tạo, nghiên cứu, y tế, giáo dục hoặc nghệ thuật.
- Được nhiều bạn bè tri kỷ ngưỡng mộ, danh tiếng vang xa, hậu vận an nhàn thanh nhã.`,
    svgImage: generateBodySvg('moc_hinh')
  },
  {
    id: 'body_thuy_hinh',
    name: 'Tướng Viên Mãn (Thủy Hình Đôn Hậu)',
    bookTitle: 'Thần Tướng Toàn Thư • Thủy Tướng Tụ Phúc',
    badge: 'Tài Lộc Hanh Thông ⭐⭐⭐',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    meaning: 'Thân hình tròn trịa đẫy đà, vai tròn mông nở, bước đi đĩnh đạc, tụ tài tụ lộc',
    keyPosture: 'Đường nét cơ thể mềm mại tròn đầy, da dẻ tươi mát, ngồi vững chãi uy nghiêm.',
    description: 'Tướng Thủy hình chủ về người phúc hậu, tính tình bao dung độ lượng, có tài vận và duyên kinh thương đặc biệt lớn, tích lũy của cải bền vững.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI THỦY HÌNH ĐÔN HẬU]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Khung người đẫy đà tròn trịa, các khớp xương giấu kín dưới làn da thịt hồng hào mỡ màng, sắc thái thư thái an nhàn.

2. VẬN HẠN & TÀI PHÚ:
- Có tài lộc trời ban, khéo thu phục lòng người, rất phát đạt trong buôn bán tài chính.
- Trung niên và hậu vận đại phú quý, gia đình thịnh vượng con đàn cháu đống.`,
    svgImage: generateBodySvg('thuy_hinh')
  },
  {
    id: 'body_hoa_hinh',
    name: 'Tướng Duệ Trí (Hỏa Hình Tinh Anh)',
    bookTitle: 'Ma Y Thần Tướng • Hỏa Hình Phấn Phát',
    badge: 'Dũng Khí Tiên Phong ⭐⭐⭐',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    meaning: 'Dáng chữ V ngược, vai rộng eo thon, bước chân nhanh nhẹn quyết liệt, khí phách tiên phong',
    keyPosture: 'Dáng đứng dũng mãnh, các đường nét gân guốc thể thao, bước đi dứt khoát như lửa cuộn.',
    description: 'Tướng Hỏa hình có năng lượng hành động phi thường, dám nghĩ dám làm, tư duy đột phá, luôn là ngọn đuốc tiên phong mở đường lập nghiệp.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI HỎA HÌNH TINH ANH]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Phần thân trên nở nang, eo thắt gọn, cơ bắp săn chắc gân guốc, ánh mắt rực sáng linh hoạt.

2. SỰ NGHIỆP & Ý CHÍ:
- Tinh thần khai phá mãnh liệt, không ngại thử thách mạo hiểm, thăng tiến thần tốc khi nắm bắt thời cơ.
- Rất hợp lĩnh vực công nghệ, khởi nghiệp, thể thao, quân sự và truyền thông.`,
    svgImage: generateBodySvg('hoa_hinh')
  },
  {
    id: 'body_tho_hinh',
    name: 'Tướng Trung Kiên (Thổ Hình Vững Chắc)',
    bookTitle: 'Thái Ất Thần Tướng • Thổ Đức Hậu Trọng',
    badge: 'Điền Sản Dồi Dào ⭐⭐⭐',
    badgeColor: 'bg-amber-600/20 text-amber-200 border-amber-500/40',
    meaning: 'Thân hình vạm vỡ đầm chắc, vai gấu lưng dày, trầm ổn như đại địa, giữ chữ tín ngàn vàng',
    keyPosture: 'Dáng đứng sừng sững như khối đá hoa cương, bước đi chậm rãi chắc nịch.',
    description: 'Tướng Thổ hình mang khí chất của đất mẹ bao dung và kiên định. Người có tướng này ăn chắc mặc bền, chữ tín làm đầu, hậu vận đất đai điền sản dồi dào vô tận.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI THỔ HÌNH VỮNG CHẮC]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Lưng dày vai nở, bước chân chắc nịch không rung lắc, phong thái điềm tĩnh vững như kiềng ba chân.

2. CƠ NGHIỆP TRƯỜNG TỒN:
- Từng bước gầy dựng cơ đồ bằng thực lực kiên trì, không ham lợi trước mắt, tích lũy tài sản khổng lồ.
- Hậu vận đất đai nhà cửa bao la, danh tiếng trường tồn, là điểm tựa vững chãi của dòng tộc.`,
    svgImage: generateBodySvg('tho_hinh')
  },
  {
    id: 'body_hac_hinh',
    name: 'Tướng Trường Thọ (Hạc Hình Siêu Thoát)',
    bookTitle: 'Quản Lạc Nhân Tướng • Hạc Cốt Tiên Phong',
    badge: 'Trường Thọ An Nhiên ⭐⭐⭐',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-400/40',
    meaning: 'Cổ cao thanh thoát, người thanh mảnh không mỡ thừa, cốt cách tiêu sái, trường thọ vô ưu',
    keyPosture: 'Dáng đứng thẳng tắp khoan thai, bước đi nhẹ lướt như hạc nội mây ngàn.',
    description: 'Tướng Hạc hình là một trong các dị tướng siêu phàm trong sách cổ. Người mang tướng này tính tình thanh khiết, sống thiện lương, tinh thần tự tại minh triết và hưởng đại thọ.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI HẠC HÌNH SIÊU THOÁT]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Thân hình thanh mảnh cao ráo, xương cổ và sống lưng thẳng tắp, không có mỡ thừa, cử chỉ ung dung tự tại.

2. PHÚC ĐỨC & DIÊN THỌ:
- Ít khi vướng bận danh lợi phàm trần, tâm an vạn sự an, duyên phận gắn bó với tri thức tâm linh và nghiên cứu.
- Sức đề kháng dẻo dai phi thường, tuổi thọ cao vượt trội, con cháu hiếu thảo hòa thuận.`,
    svgImage: generateBodySvg('hac_hinh')
  },
  {
    id: 'body_quy_boi',
    name: 'Tướng Phúc Đức (Quy Bối Hậu Trọng)',
    bookTitle: 'Thần Tướng Cổ Thư • Quy Bối Phúc Đức',
    badge: 'Phúc Đức Lưu Truyền ⭐⭐⭐',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40',
    meaning: 'Lưng tròn đầy đặn như mai rùa (Quy bối), khí tức sâu dài, vững chãi vượt qua mọi giông bão',
    keyPosture: 'Lưng dày thịt u tròn tự nhiên, ngồi vững như núi, hơi thở đan điền sâu lắng.',
    description: 'Tướng "Quy Bối" (Lưng rùa dày thịt) là dấu hiệu của bậc đại phước đại thọ. Người mang tướng này có khả năng chống chịu nghịch cảnh vô song, biến hung thành cát, hưởng phúc trọn đời.',
    analysisDetail: `[HÌNH TƯỚNG HỌC LUẬN GIẢI QUY BỐI PHÚC HẬU]
1. ĐẶC ĐIỂM HÌNH TƯỚNG:
- Vùng lưng sau gáy tròn đầy dày thịt như mai rùa, không phải gù lưng do bệnh lý mà là cốt nhục thiên phú vững chãi.

2. ĐẠI PHÚC & HẬU VẬN:
- Càng gặp sóng gió cuộc đời lại càng vững vàng tiến lên, quý nhân che chở trong gang tấc.
- Tài lộc tích tụ càng về già càng sung túc, phúc trạch truyền đời ấm êm viên mãn.`,
    svgImage: generateBodySvg('quy_boi')
  }
];

// CẨM NANG KHẢO CỨU THỦ TƯỚNG HỌC (HISTORICAL & SCIENTIFIC DATABASE)
export const PALMISTRY_HISTORICAL_DOC = {
  title: 'Tổng Hợp Khoa Học & Cổ Thư Khảo Cứu Chỉ Tay (Chiromancy)',
  author: 'Funk & Wagnalls New Encyclopedia (1992) • Bác Sĩ Josef Ranald • Henry Rem',
  summary: 'Hệ thống tài liệu nghiên cứu xuyên suốt từ thời Chaldeans, Ai Cập Cổ Đại, triết học Aristotle & Plato (thế kỷ 4 TCN), thư viện Bodleian Oxford (thế kỷ 13), công trình John Lydgate (1420), Ernst Issberner - Haldane (Berlin, 1922) đến các nghiên cứu y khoa, tâm lý học và chẩn đoán bệnh lý của Josef Ranald.',
  sections: [
    {
      title: 'I. Lịch Sử Phát Triển Hơn 4.000 Năm',
      content: `Thuật xem chỉ tay (Palmistry / Chiromancy) là một bộ môn tìm hiểu đời người phát triển từ lâu đời. Theo Funk & Wagnalls New Encyclopedia (1992), thuật này được biết đến từ thời cực thịnh của người Chaldeans, Assyrians, người Ai Cập Cổ Đại và người Hebrews.

Những triết gia vĩ đại như Plato (428 - 347 TCN) và Aristotle (384 - 322 TCN) đã lưu tâm sâu sắc đến mối liên hệ giữa các dấu hiệu trên bàn tay với cá tính và bệnh lý con người.

Tại thư viện Bodleian ở Đại học Oxford, các nhà nghiên cứu đã tìm thấy các tư liệu và tranh vẽ dạng thể bàn tay từ thế kỷ 13. Năm 1420, John Lydgate tiếp tục hệ thống hóa. Đến năm 1922, Ernst Issberner - Haldane xuất bản công trình danh tiếng "Die Wissenschaftliche Handlesekunst Chirosophie" tại Berlin mô tả chi tiết ảnh hưởng và biểu tượng của các gò và đường chỉ tay.`
    },
    {
      title: 'II. Mối Liên Hệ Y Khoa, Tâm Lý Học & Chẩn Đoán Bệnh Lý',
      content: `Ngày nay, các nhà khoa học, đặc biệt là các nhà sinh lý học và tâm lý học (Corman, Kurt Lewin, Haymaaus, Kretchmer, Binet Simon, Le Senne, Wiersma, Henry Rem, Charlotte Wolfe, Josef Ranald, V.Pardo Costello...) đã chứng minh sự liên quan mật thiết giữa hệ thần kinh, não bộ với các nếp nhăn và vân tay.

Bàn tay phản ánh tình trạng khí huyết, hoạt động của các tuyến nội tiết và hệ thần kinh thực vật. Sự thay đổi màu sắc, độ sâu, các dấu hiệu cắt phá trên đường Sinh Đạo, Trí Đạo, Tâm Đạo giúp chẩn đoán sớm các nguy cơ về tim mạch, huyết áp, suy nhược thần kinh hay rối loạn tiêu hóa.`
    },
    {
      title: 'III. Bốn Sắc Thái Khí Chất Của Bác Sĩ Josef Ranald',
      content: `Bác sĩ Josef Ranald đã phân loại 4 sắc thái khí chất cốt lõi dựa trên giải phẫu bàn tay:

1. Bàn tay Nóng Nảy: Bàn tay tam giác nhỏ dài, nhiều nếp nhăn, ngón út ngắn, da tay thô, đường Tâm Đạo như dây thừng vặn xoắn. Cá tính nóng nảy, dục tốc, tự cao, giàu tưởng tượng nhưng tính khí thất thường. Sức khỏe dễ căng thẳng tim mạch, huyết áp.

2. Bàn tay Lãnh Đạm: Lòng bàn tay mềm, dày, ẩm ướt, ngón ngắn không đều, ít chỉ tay, da trắng nhạt, có lấm chấm tàn nhang. Cá tính trầm mặc, lạnh lùng bề ngoài nhưng đa tình sâu sắc, chuộng lý luận logic. Sức khỏe lưu ý tuần hoàn máu và phong hàn thấp khớp.

3. Bàn tay Hờn Giận (Tự Ái): Bàn tay vuông/chữ nhật, nhiều thịt, lòng bàn tay trũng, chỉ tay rõ nét sậm màu, ngón cái rất dài, Trí Đạo dài thẳng tắp. Cá tính tự ái cao, tham vọng quyền lực tột bậc. Bác sĩ Ranald cảnh báo người mang tướng tay này dễ tổn hao sức lực do stress dạ dày và ganh đua.

4. Bàn tay Ương Ngạnh: Bàn tay rộng ngắn dày, nóng ướt, màu hồng son, gò Kim Tinh nổi cứng chắc, ngón cái ngắn, chỉ tay đậm hồng nhưng ít đường vụn vặt. Cá tính cương nghị, bất khuất, thẳng thắn, không nể nang ai, có tư tưởng độc lập cao siêu.`
    },
    {
      title: 'IV. Ngón Tay Hình Cái Bay (Doigts Spatulés) Của Bậc Danh Nhân',
      content: `Nhà nghiên cứu Henry Rem phát hiện nhóm ngón tay hình chiếc bay/chiếc xẻng thợ nề (doigts spatulés) đặc trưng cho những người có năng lượng hành động thực tiễn phi thường và sáng tạo kiệt xuất:

- Về chính khách & quân sự: Hoàng đế Napoléon II, Lamennais, Fernand Lubori...
- Về hội họa danh họa: Rembrandt, Rubens, Jordaens, Bouguereau...
- Về kịch nghệ & nghệ thuật: Faure de L'Opéra, Antoine...

Người có ngón tay hình cái bay luôn biến lý thuyết thành hành động thực tiễn, thích khai phá những con đường mới và gặt hái những thành tựu để đời cho nhân loại.`
    }
  ]
};
