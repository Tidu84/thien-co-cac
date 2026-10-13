import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Eye, Zap, Volume2, Wand2, Flame, Heart, CheckCircle2, XCircle } from 'lucide-react';

interface Character3DProps {
  isSpeaking: boolean;
  mood: 'happy' | 'mysterious' | 'thoughtful' | 'divine' | 'concerned';
  userChoice: 'yes' | 'no' | null;
  onSelectYes: () => void;
  onSelectNo: () => void;
  onCharacterClick?: () => void;
}

export type FortuneTellerStyle = 'hooded_green' | 'turban_tarot' | 'crystal_maiden' | 'crimson_sorceress';

export const Character3D: React.FC<Character3DProps> = ({ 
  isSpeaking, 
  mood, 
  userChoice, 
  onSelectYes, 
  onSelectNo, 
  onCharacterClick 
}) => {
  // 4 Phong cách thầy bói chuẩn xác theo ảnh tham khảo
  const [currentStyle, setCurrentStyle] = useState<FortuneTellerStyle>('hooded_green');
  
  // Tương tác theo dõi chuột (Eye & Head Tracking)
  const [lookPos, setLookPos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  
  // Chớp mắt tự nhiên
  const [isBlinking, setIsBlinking] = useState(false);
  
  // Khẩu hình miệng chuẩn xác khi nói chuyện
  const [mouthState, setMouthState] = useState({
    openY: 0,
    openX: 0,
    jawDrop: 0,
    browLift: 0
  });

  const containerRef = useRef<HTMLDivElement | null>(null);

  // Hiệu ứng chớp mắt tự nhiên
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Bộ mô phỏng khẩu hình miệng sống động theo ngữ điệu phát âm
  useEffect(() => {
    let animId: number;
    let step = 0;

    const updateLipSync = () => {
      if (isSpeaking) {
        step += 0.32;
        const wave1 = Math.abs(Math.sin(step));
        const wave2 = Math.abs(Math.sin(step * 1.7 + 0.5));
        const wave3 = Math.sin(step * 0.8);

        const openHeight = wave1 * 0.75 + wave2 * 0.35;
        const openWidth = wave3 * 0.3;
        const jaw = openHeight * 8;
        const brow = Math.sin(step * 0.5) * 3;

        setMouthState({
          openY: Math.min(Math.max(openHeight, 0.15), 1.1),
          openX: openWidth,
          jawDrop: jaw,
          browLift: brow
        });
      } else {
        setMouthState({
          openY: 0,
          openX: 0,
          jawDrop: 0,
          browLift: 0
        });
      }
      animId = requestAnimationFrame(updateLipSync);
    };

    animId = requestAnimationFrame(updateLipSync);
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking]);

  // Di chuyển con trỏ chuột -> đầu & mắt liếc theo
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;

    setLookPos({
      x: nx * 18,
      y: ny * 14
    });

    setTilt({
      rx: -ny * 10,
      ry: nx * 14
    });
  };

  const handleMouseLeave = () => {
    setLookPos({ x: 0, y: 0 });
    setTilt({ rx: 0, ry: 0 });
  };

  const styleConfigs = {
    hooded_green: {
      name: 'Nữ Tiên Tri Áo Choàng Xanh (Hình 2)',
      hoodColor: '#064e3b',
      hoodInner: '#022c22',
      trimColor: '#f59e0b',
      eyeColor: '#10b981',
      orbColor: '#fef08a',
      orbGlow: 'rgba(245, 158, 11, 0.75)',
      description: 'Áo choàng trùm đầu huyền bí, bàn tay truyền linh lực bao quanh quả cầu'
    },
    turban_tarot: {
      name: 'Bà Bói Khăn Turban & Bài Tarot (Hình 1)',
      hoodColor: '#581c87',
      hoodInner: '#3b0764',
      trimColor: '#fbbf24',
      eyeColor: '#8b5cf6',
      orbColor: '#e0e7ff',
      orbGlow: 'rgba(168, 85, 247, 0.8)',
      description: 'Khăn xếp turban tím, trang sức vàng óng, tay xòe bài tarot'
    },
    crystal_maiden: {
      name: 'Tiên Nữ Cầu Pha Lê (Hình 3)',
      hoodColor: '#0f172a',
      hoodInner: '#020617',
      trimColor: '#38bdf8',
      eyeColor: '#06b6d4',
      orbColor: '#67e8f9',
      orbGlow: 'rgba(6, 182, 212, 0.85)',
      description: 'Khối cầu ma thuật trong suốt bao trùm tiên nữ cổ xưa'
    },
    crimson_sorceress: {
      name: 'Hồng Y Nữ Vu (Hình 4)',
      hoodColor: '#991b1b',
      hoodInner: '#450a0a',
      trimColor: '#fbbf24',
      eyeColor: '#ef4444',
      orbColor: '#fde047',
      orbGlow: 'rgba(239, 68, 68, 0.75)',
      description: 'Áo choàng đỏ rực, kết ấn càn khôn bói toán sắc sảo'
    }
  };

  const currentCfg = styleConfigs[currentStyle];
  const mouthW = 12 + mouthState.openX * 4;
  const mouthH = mouthState.openY * 16;
  const mouthYPos = 238 + mouthState.jawDrop * 0.4;

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onCharacterClick}
      style={{ perspective: '1200px' }}
      className="relative w-full h-[430px] sm:h-[480px] flex items-center justify-center select-none cursor-pointer group"
      title="Thầy Bói Giang Hồ: Đang đàm đạo và nói chuyện với bạn!"
    >
      {/* 1. HÀO QUANG VŨ TRỤ BÁT QUÁI SAU LƯNG THẦY BÓI */}
      <div 
        style={{
          boxShadow: `0 0 75px ${currentCfg.orbGlow}`
        }}
        className="absolute w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-tr from-purple-900/30 via-amber-500/10 to-indigo-900/30 blur-2xl pointer-events-none transition-all duration-700 animate-pulse"
      />

      {/* VÒNG TRÒN MA THUẬT QUAY CHẬM */}
      <div className="absolute w-60 h-60 sm:w-64 sm:h-64 rounded-full border-2 border-dashed border-amber-400/30 animate-spin duration-[24000ms] pointer-events-none flex items-center justify-center">
        <div className="w-52 h-52 rounded-full border border-purple-500/30" />
      </div>

      {/* 2. NHÂN VẬT THẦY BÓI 3D PARALLAX CHUẨN THEO HÌNH ẢNH THAM KHẢO */}
      <div 
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: tilt.rx === 0 ? 'transform 0.5s ease-out' : 'transform 0.08s ease-out'
        }}
        className="relative w-72 h-84 sm:w-80 sm:h-96 flex flex-col items-center justify-center filter drop-shadow-2xl"
      >
        <svg 
          viewBox="0 0 400 460" 
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="hoodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentCfg.hoodColor} />
              <stop offset="50%" stopColor={currentCfg.hoodColor} />
              <stop offset="100%" stopColor={currentCfg.hoodInner} />
            </linearGradient>

            <radialGradient id="hoodInnerShade" cx="50%" cy="45%" r="50%">
              <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.4" />
              <stop offset="75%" stopColor={currentCfg.hoodInner} stopOpacity="0.95" />
              <stop offset="100%" stopColor="#020617" stopOpacity="1" />
            </radialGradient>

            <radialGradient id="crystalBallGrad" cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="25%" stopColor={currentCfg.orbColor} stopOpacity="0.9" />
              <stop offset="70%" stopColor="#0f172a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
            </radialGradient>

            <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>

            <filter id="orbGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* LỚP 1: THÂN ÁO CHOÀNG PHÍA SAU */}
          <path
            d="M 100 240 C 60 320, 50 420, 40 460 L 360 460 C 350 420, 340 320, 300 240 Z"
            fill={currentCfg.hoodInner}
            stroke="#090514"
            strokeWidth="5"
          />

          {/* TÓC RỦ HAI BÊN VAI */}
          <path
            d="M 125 180 Q 95 260 115 340 Q 128 280 135 220 Z"
            fill="#181124"
            stroke="#090514"
            strokeWidth="3.5"
          />
          <path
            d="M 275 180 Q 305 260 285 340 Q 272 280 265 220 Z"
            fill="#181124"
            stroke="#090514"
            strokeWidth="3.5"
          />

          {/* KIỂU KHĂN TURBAN (HÌNH 1) HOẶC ÁO CHOÀNG TRÙM ĐẦU (HÌNH 2 & 3) */}
          {currentStyle === 'turban_tarot' ? (
            <g>
              <ellipse cx="200" cy="115" rx="95" ry="65" fill={currentCfg.hoodColor} stroke="#0f0b1e" strokeWidth="5" />
              <circle cx="200" cy="85" r="14" fill="#fbbf24" stroke="#0f0b1e" strokeWidth="3" />
              <circle cx="200" cy="85" r="7" fill="#ef4444" />
              {/* 3 Lá bài Tarot xòe trên tay trái */}
              <g transform="translate(65, 140) rotate(-22)">
                <rect x="0" y="0" width="36" height="58" rx="4" fill="#991b1b" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="18" cy="29" r="8" fill="none" stroke="#fef08a" strokeWidth="2" />
              </g>
              <g transform="translate(85, 130) rotate(-6)">
                <rect x="0" y="0" width="36" height="58" rx="4" fill="#581c87" stroke="#f59e0b" strokeWidth="2.5" />
                <path d="M 18 16 L 24 38 L 12 38 Z" fill="#fef08a" />
              </g>
              <g transform="translate(108, 130) rotate(12)">
                <rect x="0" y="0" width="36" height="58" rx="4" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2.5" />
                <circle cx="18" cy="29" r="6" fill="#f59e0b" />
              </g>
            </g>
          ) : (
            <g id="mysticHood">
              <path
                d="M 200 45 C 110 45, 90 120, 85 200 C 85 280, 115 350, 130 380 L 270 380 C 285 350, 315 280, 315 200 C 310 120, 290 45, 200 45 Z"
                fill="url(#hoodGrad)"
                stroke="#090514"
                strokeWidth="6"
              />
              <path
                d="M 125 210 C 120 125, 145 70, 200 70 C 255 70, 280 125, 275 210 C 275 250, 260 280, 255 295 L 240 295 C 248 275, 260 240, 260 200 C 260 135, 240 88, 200 88 C 160 88, 140 135, 140 200 C 140 240, 152 275, 160 295 L 145 295 C 140 280, 125 250, 125 210 Z"
                fill="url(#goldTrimGrad)"
                stroke="#090514"
                strokeWidth="2.5"
              />
              <ellipse cx="200" cy="190" rx="68" ry="78" fill="url(#hoodInnerShade)" />
            </g>
          )}

          {/* LỚP 2: KHUÔN MẶT THẦY BÓI TRUYỆN TRANH */}
          <g id="characterFace">
            <path
              d={`M 148 180 C 148 235, 175 ${260 + mouthState.jawDrop * 0.5}, 200 ${268 + mouthState.jawDrop * 0.7} C 225 ${260 + mouthState.jawDrop * 0.5}, 252 235, 252 180 C 252 140, 225 132, 200 132 C 175 132, 148 140, 148 180 Z`}
              fill="#ffe3d1"
              stroke="#0f0b1e"
              strokeWidth="3.5"
            />

            <path
              d="M 145 158 Q 170 178 200 162 Q 225 178 255 158 Q 235 142 200 142 Q 165 142 145 158 Z"
              fill="#181124"
              stroke="#0f0b1e"
              strokeWidth="3"
            />

            {/* MẮT TRÁI */}
            <g id="leftEye" transform="translate(170, 192)">
              <ellipse cx="0" cy="0" rx="16" ry={isBlinking ? 1 : 12} fill="#ffffff" stroke="#090514" strokeWidth="2.5" />
              {!isBlinking && (
                <>
                  <ellipse 
                    cx={lookPos.x * 0.4} 
                    cy={lookPos.y * 0.3} 
                    rx="10" 
                    ry="11" 
                    fill={currentCfg.eyeColor} 
                  />
                  <circle cx={lookPos.x * 0.4} cy={lookPos.y * 0.3} r="5.5" fill="#090514" />
                  <circle cx={lookPos.x * 0.4 - 3} cy={lookPos.y * 0.3 - 3} r="3.2" fill="#ffffff" />
                  <circle cx={lookPos.x * 0.4 + 3} cy={lookPos.y * 0.3 + 3} r="1.6" fill="#ffffff" />
                </>
              )}
              <path d="M -18 -8 Q 0 -16 18 -6" fill="none" stroke="#090514" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            {/* MẮT PHẢI */}
            <g id="rightEye" transform="translate(230, 192)">
              <ellipse cx="0" cy="0" rx="16" ry={isBlinking ? 1 : 12} fill="#ffffff" stroke="#090514" strokeWidth="2.5" />
              {!isBlinking && (
                <>
                  <ellipse 
                    cx={lookPos.x * 0.4} 
                    cy={lookPos.y * 0.3} 
                    rx="10" 
                    ry="11" 
                    fill={currentCfg.eyeColor} 
                  />
                  <circle cx={lookPos.x * 0.4} cy={lookPos.y * 0.3} r="5.5" fill="#090514" />
                  <circle cx={lookPos.x * 0.4 - 3} cy={lookPos.y * 0.3 - 3} r="3.2" fill="#ffffff" />
                  <circle cx={lookPos.x * 0.4 + 3} cy={lookPos.y * 0.3 + 3} r="1.6" fill="#ffffff" />
                </>
              )}
              <path d="M -18 -6 Q 0 -16 18 -8" fill="none" stroke="#090514" strokeWidth="4.5" strokeLinecap="round" />
            </g>

            {/* Lông mày nhướng cử động theo biểu cảm nói chuyện */}
            <path 
              d={`M 152 ${174 - mouthState.browLift} Q 170 ${166 - mouthState.browLift} 186 ${172 - mouthState.browLift}`} 
              fill="none" 
              stroke="#090514" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
            />
            <path 
              d={`M 248 ${174 - mouthState.browLift} Q 230 ${166 - mouthState.browLift} 214 ${172 - mouthState.browLift}`} 
              fill="none" 
              stroke="#090514" 
              strokeWidth="3.2" 
              strokeLinecap="round" 
            />

            <ellipse cx="200" cy="166" rx="2.5" ry="4" fill="#ef4444" />
            <path d="M 198 206 L 202 216 L 196 217" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" />

            <ellipse cx="162" cy="220" rx="8" ry="4" fill="#f43f5e" opacity="0.45" />
            <ellipse cx="238" cy="220" rx="8" ry="4" fill="#f43f5e" opacity="0.45" />

            {/* KHẨU HÌNH MIỆNG NÓI CHUYỆN LIP-SYNC SỐNG ĐỘNG */}
            <g transform={`translate(200, ${mouthYPos})`}>
              {mouthState.openY > 0.08 ? (
                <g>
                  <path
                    d={`M ${-mouthW} 0 C ${-mouthW * 0.7} ${mouthH}, ${mouthW * 0.7} ${mouthH}, ${mouthW} 0 C ${mouthW * 0.5} ${-mouthH * 0.3}, ${-mouthW * 0.5} ${-mouthH * 0.3}, ${-mouthW} 0 Z`}
                    fill="#4c0519"
                    stroke="#090514"
                    strokeWidth="2.5"
                  />
                  <path
                    d={`M ${-mouthW * 0.65} 0 Q 0 ${mouthH * 0.35} ${mouthW * 0.65} 0 Z`}
                    fill="#ffffff"
                  />
                  <path
                    d={`M ${-mouthW * 0.5} ${mouthH * 0.6} Q 0 ${mouthH * 0.3} ${mouthW * 0.5} ${mouthH * 0.6} Q 0 ${mouthH * 0.95} ${-mouthW * 0.5} ${mouthH * 0.6} Z`}
                    fill="#f43f5e"
                  />
                  <path
                    d={`M ${-mouthW - 2} 0 Q ${-mouthW * 0.5} ${-mouthH * 0.35 - 2} 0 ${-mouthH * 0.25} Q ${mouthW * 0.5} ${-mouthH * 0.35 - 2} ${mouthW + 2} 0`}
                    fill="none"
                    stroke="#be123c"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </g>
              ) : (
                <g>
                  <path
                    d="M -10 -2 Q 0 4 10 -2"
                    fill="none"
                    stroke="#be123c"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M -4 2 Q 0 4 4 2"
                    fill="none"
                    stroke="#fda4af"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </g>
          </g>

          {/* LỚP 3: HAI BÀN TAY HUYỀN BÍ TRUYỀN NĂNG LƯỢNG QUẢ CẦU */}
          <g id="mysticHands">
            <path
              d="M 90 320 C 110 270, 150 280, 160 310 C 150 330, 120 345, 80 345 Z"
              fill={currentCfg.hoodColor}
              stroke="#090514"
              strokeWidth="4"
            />
            <path
              d="M 310 320 C 290 270, 250 280, 240 310 C 250 330, 280 345, 320 345 Z"
              fill={currentCfg.hoodColor}
              stroke="#090514"
              strokeWidth="4"
            />

            <path
              d="M 142 300 C 145 285, 160 278, 168 290 C 172 298, 168 315, 155 325 C 146 320, 140 310, 142 300 Z"
              fill="#ffe3d1"
              stroke="#090514"
              strokeWidth="3"
            />
            <path d="M 160 285 Q 170 282 176 292" fill="none" stroke="#090514" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 155 293 Q 168 292 173 302" fill="none" stroke="#090514" strokeWidth="2.8" strokeLinecap="round" />

            <path
              d="M 258 300 C 255 285, 240 278, 232 290 C 228 298, 232 315, 245 325 C 254 320, 260 310, 258 300 Z"
              fill="#ffe3d1"
              stroke="#090514"
              strokeWidth="3"
            />
            <path d="M 240 285 Q 230 282 224 292" fill="none" stroke="#090514" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M 245 293 Q 232 292 227 302" fill="none" stroke="#090514" strokeWidth="2.8" strokeLinecap="round" />
          </g>

          {/* LỚP 4: QUẢ CẦU THỦY TINH MA THUẬT PHÁT SÁNG TRÊN BỆ GỖ */}
          <g id="crystalBallAltar">
            <path
              d="M 160 395 C 160 380, 175 372, 200 372 C 225 372, 240 380, 240 395 L 255 435 C 255 448, 145 448, 145 435 Z"
              fill="#2e1065"
              stroke="#f59e0b"
              strokeWidth="4"
            />
            <ellipse cx="200" cy="435" rx="65" ry="16" fill="#78350f" stroke="#090514" strokeWidth="3.5" />
            <ellipse cx="200" cy="374" rx="36" ry="9" fill="#f59e0b" stroke="#090514" strokeWidth="3" />

            <circle
              cx="200"
              cy="318"
              r="62"
              fill="url(#crystalBallGrad)"
              stroke="#fde047"
              strokeWidth="4"
              filter="url(#orbGlowFilter)"
            />

            <path
              d="M 170 325 Q 185 300 215 310 Q 230 330 210 340 Q 185 350 170 325 Z"
              fill={currentCfg.orbColor}
              opacity="0.65"
            />
            <path
              d="M 190 295 Q 210 285 225 305 Q 215 325 195 315 Z"
              fill="#ffffff"
              opacity="0.8"
            />

            <path
              d="M 165 285 A 48 48 0 0 1 215 270"
              fill="none"
              stroke="#ffffff"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.95"
            />
            <circle cx="162" cy="298" r="3" fill="#ffffff" opacity="0.9" />
          </g>
        </svg>
      </div>

      {/* 3. BẢNG HAI Ô LỰA CHỌN CÓ VÀ KHÔNG HIỆN NGAY BÊN CẠNH THẦY BÓI */}
      {userChoice === null && (
        <div 
          onClick={(e) => e.stopPropagation()}
          className="absolute -right-2 sm:-right-4 top-16 sm:top-20 z-30 max-w-[190px] sm:max-w-[210px] bg-slate-950/95 backdrop-blur-md p-3 rounded-2xl border-2 border-amber-400 shadow-2xl shadow-purple-950/60 animate-bounce duration-[3000ms] cursor-default"
        >
          {/* Mũi tên chỉ từ bảng thoại sang nhân vật thầy bói */}
          <div className="absolute top-6 -left-2.5 w-4 h-4 bg-slate-950 border-l-2 border-b-2 border-amber-400 transform rotate-45" />

          <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-[11px] mb-2 leading-tight">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
            <span>Thầy bói hỏi bạn:</span>
          </div>
          
          <p className="text-[11px] text-slate-200 leading-snug mb-3">
            "Bạn có cần ta xem cho một quẻ miễn phí không?"
          </p>

          {/* 2 Ô LỰA CHỌN CÓ / KHÔNG NGAY CẠNH NHÂN VẬT */}
          <div className="space-y-1.5">
            {/* Ô 1: CÓ */}
            <button
              onClick={onSelectYes}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 active:scale-95 transition border border-emerald-300"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
              <span>CÓ (Xem Giúp Tôi)</span>
            </button>

            {/* Ô 2: KHÔNG */}
            <button
              onClick={onSelectNo}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-rose-500/40 active:scale-95 transition"
            >
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>KHÔNG (Để Khi Khác)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. BẢNG CHỌN 4 PHONG CÁCH THẦY BÓI CHUẨN XÁC DƯỚI CHÂN */}
      <div className="absolute bottom-2 inset-x-2 bg-slate-950/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-amber-400/40 shadow-xl flex items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-amber-300 hidden sm:inline mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tạo hình:</span>
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); setCurrentStyle('hooded_green'); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
              currentStyle === 'hooded_green'
                ? 'bg-emerald-600 text-white border-amber-300 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>🟢 Áo Choàng Xanh (Hình 2)</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setCurrentStyle('turban_tarot'); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
              currentStyle === 'turban_tarot'
                ? 'bg-purple-600 text-white border-amber-300 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>🟣 Turban & Tarot (Hình 1)</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setCurrentStyle('crystal_maiden'); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
              currentStyle === 'crystal_maiden'
                ? 'bg-cyan-600 text-white border-amber-300 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>🔮 Cầu Pha Lê (Hình 3)</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); setCurrentStyle('crimson_sorceress'); }}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
              currentStyle === 'crimson_sorceress'
                ? 'bg-red-700 text-white border-amber-300 shadow-md'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <span>🔴 Hồng Y (Hình 4)</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="hidden md:inline">Khẩu hình khớp giọng nói</span>
        </div>
      </div>
    </div>
  );
};
