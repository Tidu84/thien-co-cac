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

    <!-- Các Gò Bàn Tay -->
    <text x="145" y="340" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Gò Kim Tinh</text>
    <text x="175" y="225" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Mộc Tinh</text>
    <text x="235" y="210" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Thổ Tinh</text>
    <text x="285" y="210" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Thái Dương</text>
    <text x="325" y="255" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Thủy Tinh</text>
    <text x="300" y="440" fill="#a78bfa" font-size="10" font-family="sans-serif" opacity="0.7">Thái Âm</text>
  `;

  let patternContent = '';

  if (type === 'm_shape') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 245 440 C 248 370, 252 300, 258 245" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <text x="245" y="325" fill="#fef08a" font-size="34" font-weight="extrabold" font-family="serif" text-anchor="middle" filter="url(#goldGlow)">M</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">👑 CHỈ TAY CHỮ M • PHÚ QUÝ SONG TOÀN</text>
    `;
  } else if (type === 'simian_line') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.6" />
      <line x1="165" y1="290" x2="335" y2="290" stroke="url(#goldLine)" stroke-width="6" stroke-linecap="round" filter="url(#goldGlow)" />
      <text x="250" y="278" fill="#fef08a" font-size="11" font-weight="bold" font-family="sans-serif" text-anchor="middle">Đường Quán Thông (Tâm Trí Nhất Thể)</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">⚔️ CHỈ TAY CHỮ NHẤT • Ý CHÍ QUÂN VƯƠNG</text>
    `;
  } else if (type === 'gold_ingot') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.5" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.5" />
      <polygon points="215,310 280,318 295,365 210,360" fill="url(#goldLine)" fill-opacity="0.35" stroke="url(#goldLine)" stroke-width="3" filter="url(#goldGlow)" />
      <text x="250" y="345" fill="#fef08a" font-size="20" text-anchor="middle">🪙</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">💰 THỎI VÀNG NGUYÊN BẢO • TỤ TÀI KHỐ</text>
    `;
  } else if (type === 'tam_tai') {
    patternContent = `
      <path d="M 185 285 C 165 330, 170 395, 215 465" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 185 285 C 225 315, 265 345, 315 370" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 335 305 C 290 300, 240 275, 205 270" fill="none" stroke="url(#goldLine)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">🕊️ TAM TÀI CÁT TƯỚNG • TRƯỜNG THỌ BÌNH AN</text>
    `;
  } else if (type === 'mystic_cross') {
    patternContent = `
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#ef4444" stroke-width="2.5" opacity="0.6" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.6" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#ec4899" stroke-width="2.5" opacity="0.6" />
      <line x1="235" y1="290" x2="265" y2="330" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <line x1="265" y1="290" x2="235" y2="330" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <circle cx="250" cy="310" r="28" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.7" />
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">🔮 CHỮ X HUYỀN BÍ • GIÁC QUAN THỨ SÁU</text>
    `;
  } else if (type === 'fish_tail') {
    patternContent = `
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#3b82f6" stroke-width="2.5" opacity="0.6" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#ec4899" stroke-width="2.5" opacity="0.6" />
      <path d="M 185 285 C 170 330, 175 390, 205 435" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 205 435 C 215 450, 230 465, 238 480" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <path d="M 205 435 C 195 450, 185 465, 178 480" fill="none" stroke="url(#goldLine)" stroke-width="3.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="14" font-weight="bold" font-family="serif" text-anchor="middle">🌊 ĐUÔI CÁ NGƯ VĨ • HẬU VẬN ĐẠI PHÁT</text>
    `;
  } else if (type === 'hand_nong_nay') {
    // Sắc thái bàn tay nóng nảy của Bác sĩ Josef Ranald (Tâm đạo dây thừng, ngón út ngắn, nhiều nếp nhăn)
    patternContent = `
      <!-- Tâm đạo dạng xoắn xích dây thừng -->
      <path d="M 335 305 C 290 300, 240 270, 205 270" fill="none" stroke="#f43f5e" stroke-width="4" stroke-dasharray="6 3" filter="url(#glow)" />
      <path d="M 335 302 C 290 297, 240 273, 205 273" fill="none" stroke="#fb7185" stroke-width="2" opacity="0.8" />
      <text x="270" y="260" fill="#f43f5e" font-size="10" font-weight="bold">Tâm Đạo Hình Dây Thừng</text>
      <!-- Nhiều chỉ tay chằng chịt lo âu & dục tốc -->
      <line x1="205" y1="315" x2="235" y2="340" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="225" y1="345" x2="255" y2="360" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="260" y1="320" x2="285" y2="350" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="240" y1="285" x2="270" y2="310" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <line x1="180" y1="360" x2="210" y2="380" stroke="#fda4af" stroke-width="1.2" opacity="0.7" />
      <!-- Đánh dấu ngón út ngắn -->
      <circle cx="372" cy="195" r="16" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3 3" />
      <text x="375" y="225" fill="#fda4af" font-size="9" font-weight="bold">Ngón út ngắn</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f43f5e" stroke-width="1.5" />
      <text x="250" y="546" fill="#fda4af" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">🔥 BÀN TAY NÓNG NẢY • DỤC TỐC (RANALD)</text>
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
      <text x="250" y="325" fill="#93c5fd" font-size="11" font-weight="bold" text-anchor="middle">Ít Chỉ Tay • Da Trắng Nhạt Mềm Dày</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#3b82f6" stroke-width="1.5" />
      <text x="250" y="546" fill="#bfdbfe" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">❄️ BÀN TAY LÃNH ĐẠM • TRẦM MẶC (RANALD)</text>
    `;
  } else if (type === 'hand_hon_gian') {
    // Sắc thái bàn tay hờn giận / tự ái (lòng bàn trũng, Trí đạo dài thẳng tắp, ngón cái rất dài)
    patternContent = `
      <!-- Lòng bàn tay trũng sâu (vùng chứa tham vọng & tự ái) -->
      <ellipse cx="250" cy="330" rx="42" ry="28" fill="#d97706" fill-opacity="0.18" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3" />
      <text x="250" y="335" fill="#fef08a" font-size="10" font-weight="bold" text-anchor="middle">Lòng Bàn Trũng Sâu</text>
      <!-- Trí đạo thẳng tắp, sâu đậm cắt ngang bàn tay -->
      <line x1="185" y1="285" x2="335" y2="335" stroke="url(#goldLine)" stroke-width="4.5" stroke-linecap="round" filter="url(#goldGlow)" />
      <!-- Đánh dấu ngón cái rất dài vươn cao -->
      <line x1="110" y1="210" x2="75" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2" />
      <circle cx="75" cy="180" r="5" fill="#f59e0b" />
      <text x="75" y="165" fill="#fef08a" font-size="9" font-weight="bold">Ngón cái dài</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#f59e0b" stroke-width="1.5" />
      <text x="250" y="546" fill="#fef08a" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">⚡ BÀN TAY TỰ ÁI & THAM VỌNG (RANALD)</text>
    `;
  } else if (type === 'hand_uong_nganh') {
    // Sắc thái bàn tay ương ngạnh (gò Kim Tinh nở vồng cứng chắc, chỉ tay son đậm)
    patternContent = `
      <!-- Gò Kim Tinh nổi cứng chắc và phát quang -->
      <path d="M 160 300 C 135 340, 155 440, 205 465 C 215 420, 205 340, 160 300 Z" fill="#ec4899" fill-opacity="0.3" stroke="#f43f5e" stroke-width="2.5" filter="url(#glow)" />
      <text x="180" y="385" fill="#fb7185" font-size="10" font-weight="bold">Kim Tinh Cứng Nở</text>
      <!-- 3 đường chỉ tay son đậm màu hồng -->
      <path d="M 185 285 C 170 330, 175 390, 215 460" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 185 285 C 220 310, 260 340, 310 365" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <path d="M 335 305 C 290 300, 240 280, 205 275" fill="none" stroke="#fb7185" stroke-width="4.5" stroke-linecap="round" filter="url(#glow)" />
      <!-- Đánh dấu ngón cái ngắn -->
      <text x="110" y="240" fill="#f43f5e" font-size="9" font-weight="bold">Cái ngắn</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#fb7185" stroke-width="1.5" />
      <text x="250" y="546" fill="#fbcfe8" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">⛰️ BÀN TAY ƯƠNG NGẠNH • BẢN LĨNH (RANALD)</text>
    `;
  } else if (type === 'hand_spatula') {
    // Ngón tay hình cái bay (Doigts Spatulés của Henry Rem: Napoléon, Rembrandt, Rubens)
    patternContent = `
      <!-- Đầu các ngón nở bè hình cái bay / cái xẻng -->
      <ellipse cx="200" cy="120" rx="16" ry="11" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <ellipse cx="260" cy="72" rx="18" ry="12" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <ellipse cx="322" cy="115" rx="16" ry="11" fill="#c084fc" fill-opacity="0.4" stroke="#c084fc" stroke-width="2" />
      <text x="260" y="45" fill="#e9d5ff" font-size="10" font-weight="bold" text-anchor="middle">Đầu Ngón Hình Cái Bay (Spatulés)</text>
      <!-- Gò Thái Dương rực sáng nghệ thuật & danh vọng -->
      <circle cx="285" cy="225" r="16" fill="url(#goldLine)" fill-opacity="0.4" stroke="#f59e0b" stroke-width="2" filter="url(#goldGlow)" />
      <text x="285" y="230" fill="#fef08a" font-size="10" font-weight="bold" text-anchor="middle">Thái Dương</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#c084fc" stroke-width="1.5" />
      <text x="250" y="546" fill="#e9d5ff" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">🎨 NGÓN TAY CÁI BAY • BẬC DANH NHÂN</text>
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
      <text x="250" y="330" fill="#7dd3fc" font-size="11" font-weight="bold" text-anchor="middle">Tỉ Mỉ • Khéo Léo • Nhận Thức Nhanh</text>
      <rect x="75" y="520" width="350" height="42" rx="12" fill="#180e28" stroke="#38bdf8" stroke-width="1.5" />
      <text x="250" y="546" fill="#bae6fd" font-size="13" font-weight="bold" font-family="serif" text-anchor="middle">💡 BÀN TAY NHỎ TINH TẾ • KHÉO LÉO</text>
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

// Danh sách các loại tướng mặt chuẩn sách hướng dẫn
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
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80'
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
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80'
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
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&q=80'
  }
];

// Sinh SVG hình dáng toàn thân chuẩn đồ họa cổ thư hình tướng học
function generateBodySvg(type: 'long_hanh' | 'kim_hinh' | 'moc_hinh'): string {
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
      <text x="250" y="40" fill="#38bdf8" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">KIM HÌNH CƯƠNG TRỰC • UY NGHI LÃNH ĐẠO</text>
      <text x="250" y="475" fill="#93c5fd" font-size="10" text-anchor="middle">Cốt cách kiên định • Bản lĩnh xoay chuyển càn khôn</text>
    `;
  } else {
    specificSvg = `
      <ellipse cx="250" cy="85" rx="26" ry="34" fill="url(#bodyGrad)" stroke="#34d399" stroke-width="2.5" filter="url(#bodyGlow)" />
      <path d="M 238 120 L 232 140 L 190 165 C 180 172, 175 185, 178 250 L 180 340 C 182 348, 198 348, 200 340 L 205 240 L 215 250 L 215 355 L 210 470 C 208 480, 228 480, 230 470 L 240 370 L 260 370 L 270 470 C 272 480, 292 480, 290 470 L 285 355 L 285 250 L 295 240 L 300 340 C 302 348, 318 348, 320 340 L 322 250 C 325 185, 320 172, 310 165 L 268 140 L 262 120 Z" 
            fill="url(#bodyGrad)" stroke="#34d399" stroke-width="2" filter="url(#bodyGlow)" />
      <line x1="250" y1="120" x2="250" y2="370" stroke="#34d399" stroke-width="2" stroke-dasharray="4 4" filter="url(#bodyGlow)" />
      <text x="250" y="40" fill="#34d399" font-size="13" font-weight="bold" text-anchor="middle" letter-spacing="1">MỘC HÌNH THANH TÚ • NHO NHÃ VĂN NHÂN</text>
      <text x="250" y="475" fill="#a7f3d0" font-size="10" text-anchor="middle">Thanh cao đài các • Trí tuệ uyên bác danh vang</text>
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

// Danh sách các loại hình tướng toàn thân chuẩn sách cổ
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
