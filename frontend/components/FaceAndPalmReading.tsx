import React, { useState, useRef, useEffect } from 'react';
import { analyzeFaceOrPalmWithGemini } from '../services/geminiService';
import { 
  upsertUserDossier, 
  getActiveDossierName,
  getUserDossiers 
} from '../services/dossierService';
import { 
  PALM_PATTERNS, 
  FACE_PATTERNS, 
  BODY_PATTERNS,
  PALMISTRY_HISTORICAL_DOC,
  PalmPattern, 
  FacePattern,
  BodyPattern 
} from '../constants/palmSampleData';
import { 
  Camera, 
  Upload, 
  Eye, 
  Hand, 
  Sparkles, 
  Loader2, 
  BookmarkPlus, 
  RefreshCw, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sparkle, 
  Check, 
  UserCheck, 
  Activity, 
  User, 
  ShieldCheck, 
  FileText, 
  X,
  Scan,
  CheckCircle2,
  HeartPulse,
  Award,
  Layers,
  ArrowRight
} from 'lucide-react';

interface ParsedAnalysis {
  phanLoai: string;
  dacDiem: string;
  luanBan: string;
  sucKhoe?: string;
  loiKhuyen: string;
}

const parseAnalysisSections = (text: string, defaultName: string): ParsedAnalysis => {
  const extract = (tag: string): string | null => {
    const reg = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
    const match = text.match(reg);
    return match ? match[1].trim() : null;
  };

  const phanLoai = extract('PHAN_LOAI') || defaultName;
  const dacDiem = extract('DAC_DIEM') || 'Các đường nét và thần thái biểu hiện rõ khí chất cát tường.';
  const luanBan = extract('LUAN_BAN') || text.replace(/\[\/?(PHAN_LOAI|DAC_DIEM|LUAN_BAN|SUC_KHOE|LOI_KHUYEN)\]/gi, '').trim();
  const sucKhoe = extract('SUC_KHOE');
  const loiKhuyen = extract('LOI_KHUYEN') || 'Giữ tâm thiện lành, hành sự cẩn trọng thì phước lộc tràn trề.';

  return { phanLoai, dacDiem, luanBan, sucKhoe: sucKhoe || undefined, loiKhuyen };
};

interface FacePalmProps {
  onSaveResult: (record: { 
    title: string; 
    summary: string; 
    fullContent: string; 
    type: 'face' | 'palm' | 'body';
    personName?: string;
    capturedImage?: string;
  }) => void;
  initialMode?: 'face' | 'palm' | 'body';
}

export const FaceAndPalmReading: React.FC<FacePalmProps> = ({ onSaveResult, initialMode = 'face' }) => {
  const [activeMode, setActiveMode] = useState<'face' | 'palm' | 'body'>(initialMode);

  // Tên của đương số / người được xem tướng (đồng bộ từ hồ sơ & localStorage)
  const [userName, setUserName] = useState<string>(() => {
    try {
      return getActiveDossierName() || localStorage.getItem('thien_co_cac_user_name') || '';
    } catch {
      return '';
    }
  });

  // Giới tính và tay xem chỉ tay (Quy tắc Nam Tả - Nữ Hữu)
  const [userGender, setUserGender] = useState<'nam' | 'nu'>(() => {
    try {
      const activeName = getActiveDossierName();
      if (activeName) {
        const d = getUserDossiers().find(x => x.fullName.toLowerCase() === activeName.toLowerCase());
        if (d?.gender) return d.gender;
      }
    } catch {}
    return 'nam';
  });

  const [handSide, setHandSide] = useState<'left' | 'right'>(() => {
    try {
      const activeName = getActiveDossierName();
      if (activeName) {
        const d = getUserDossiers().find(x => x.fullName.toLowerCase() === activeName.toLowerCase());
        if (d?.gender === 'nu') return 'right';
      }
    } catch {}
    return 'left';
  });

  // Khung mẫu căn chỉnh trên màn hình camera (Overlay Guide)
  const [showOverlayGuide, setShowOverlayGuide] = useState<boolean>(true);

  // Lắng nghe thay đổi hồ sơ đang kích hoạt
  useEffect(() => {
    const handleActiveChange = (e: any) => {
      const activeName = e.detail?.name || getActiveDossierName();
      if (activeName) {
        setUserName(activeName);
        const allDossiers = getUserDossiers();
        const matched = allDossiers.find(d => d.fullName.toLowerCase() === activeName.toLowerCase());
        if (matched?.gender) {
          setUserGender(matched.gender);
          setHandSide(matched.gender === 'nu' ? 'right' : 'left');
        }
      }
    };
    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    };
  }, []);

  const handleNameChange = (val: string) => {
    setUserName(val);
    try {
      localStorage.setItem('thien_co_cac_user_name', val);
    } catch {}
    if (val.trim()) {
      upsertUserDossier({ fullName: val.trim(), gender: userGender });
    }
  };

  // Bộ lọc danh mục chỉ tay (Tất cả, Cổ thư cát tường, Khí chất Josef Ranald, Tướng Danh Nhân)
  const [palmCategoryFilter, setPalmCategoryFilter] = useState<'all' | 'auspicious' | 'ranald_temperament' | 'celebrity'>('all');
  const [showHistoryDocModal, setShowHistoryDocModal] = useState(false);

  // Mẫu chỉ tay / tướng mặt / tướng toàn thân được chọn từ sách hướng dẫn
  const [selectedPalmPattern, setSelectedPalmPattern] = useState<PalmPattern | null>(PALM_PATTERNS[0]);
  const [selectedFacePattern, setSelectedFacePattern] = useState<FacePattern | null>(FACE_PATTERNS[0]);
  const [selectedBodyPattern, setSelectedBodyPattern] = useState<BodyPattern | null>(BODY_PATTERNS[0]);

  // Preview mặc định nạp mẫu đầu tiên của mode tương ứng
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (initialMode === 'palm') return PALM_PATTERNS[0].svgImage;
    if (initialMode === 'body') return BODY_PATTERNS[0].svgImage;
    return FACE_PATTERNS[0].imageUrl;
  });

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [savedPhotoToast, setSavedPhotoToast] = useState<string | null>(null);
  const [isSavedDossierPhoto, setIsSavedDossierPhoto] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraViewportRef = useRef<HTMLDivElement | null>(null);

  // Hàm tự động nạp ảnh đã lưu của hồ sơ đang chọn
  const loadPhotoFromDossier = (dossierName?: string, mode?: 'face' | 'palm' | 'body') => {
    const targetName = (dossierName || userName).trim();
    if (!targetName) return false;
    const targetMode = mode || activeMode;
    const allDossiers = getUserDossiers();
    const matched = allDossiers.find(d => d.fullName.toLowerCase() === targetName.toLowerCase());
    if (matched) {
      if (targetMode === 'face' && matched.faceImage) {
        setImagePreview(matched.faceImage);
        setIsSavedDossierPhoto(true);
        setSelectedFacePattern(null);
        return true;
      } else if (targetMode === 'palm' && matched.palmImage) {
        setImagePreview(matched.palmImage);
        setIsSavedDossierPhoto(true);
        setSelectedPalmPattern(null);
        if (matched.palmSide) setHandSide(matched.palmSide);
        return true;
      } else if (targetMode === 'body' && matched.bodyImage) {
        setImagePreview(matched.bodyImage);
        setIsSavedDossierPhoto(true);
        setSelectedBodyPattern(null);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (initialMode) {
      setActiveMode(initialMode);
      const loaded = loadPhotoFromDossier(userName, initialMode);
      if (!loaded) {
        setIsSavedDossierPhoto(false);
        if (initialMode === 'palm') {
          setSelectedPalmPattern(PALM_PATTERNS[0]);
          setImagePreview(PALM_PATTERNS[0].svgImage);
        } else if (initialMode === 'body') {
          setSelectedBodyPattern(BODY_PATTERNS[0]);
          setImagePreview(BODY_PATTERNS[0].svgImage);
        } else {
          setSelectedFacePattern(FACE_PATTERNS[0]);
          setImagePreview(FACE_PATTERNS[0].imageUrl);
        }
      }
      setAnalysisText(null);
    }
  }, [initialMode]);

  // Cleanup camera khi unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Gắn stream vào video element khi camera kích hoạt
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      video.play().catch(err => {
        console.warn("Lỗi tự động phát camera:", err);
      });
    }
  }, [isCameraActive]);

  // Mở webcam
  const startCamera = async () => {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setImagePreview(null);
      setAnalysisText(null);
      setTimeout(() => {
        cameraViewportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    } catch (err) {
      console.error("Lỗi mở camera:", err);
      alert("Không thể truy cập camera. Vui lòng kiểm tra quyền cho phép máy ảnh trên trình duyệt hoặc chọn 1 trong các mẫu cổ điển bên dưới.");
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Chụp ảnh từ video stream (áp dụng cho khuôn mặt, lòng bàn tay hoặc toàn thân)
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Đảo ngược ngang để ảnh chụp tự nhiên như gương
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      setIsSavedDossierPhoto(true);
      setSelectedPalmPattern(null);
      setSelectedFacePattern(null);
      setSelectedBodyPattern(null);
      stopCamera();

      // TỰ ĐỘNG LƯU NGAY VÀO HỒ SƠ ĐƯƠNG SỐ
      const currentPerson = userName.trim() || 'Hữu Duyên Khách';
      const nowStr = new Date().toLocaleString('vi-VN');
      if (activeMode === 'face') {
        upsertUserDossier({
          fullName: currentPerson,
          gender: userGender,
          faceImage: dataUrl,
          faceCapturedAt: nowStr
        });
        setSavedPhotoToast(`✓ Đã lưu ảnh khuôn mặt vào hồ sơ của ${currentPerson}`);
      } else if (activeMode === 'palm') {
        upsertUserDossier({
          fullName: currentPerson,
          gender: userGender,
          palmImage: dataUrl,
          palmCapturedAt: nowStr,
          palmSide: handSide
        });
        setSavedPhotoToast(`✓ Đã lưu ảnh lòng bàn tay (${handSide === 'left' ? 'Tay Trái' : 'Tay Phải'}) vào hồ sơ của ${currentPerson}`);
      } else if (activeMode === 'body') {
        upsertUserDossier({
          fullName: currentPerson,
          gender: userGender,
          bodyImage: dataUrl,
          bodyCapturedAt: nowStr
        });
        setSavedPhotoToast(`✓ Đã lưu ảnh toàn thân vào hồ sơ của ${currentPerson}`);
      }
      setTimeout(() => setSavedPhotoToast(null), 4000);
    }
  };

  // Tải ảnh từ file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setIsSavedDossierPhoto(true);
        setSelectedPalmPattern(null);
        setSelectedFacePattern(null);
        setSelectedBodyPattern(null);
        stopCamera();
        setAnalysisText(null);

        // TỰ ĐỘNG LƯU NGAY VÀO HỒ SƠ ĐƯƠNG SỐ
        const currentPerson = userName.trim() || 'Hữu Duyên Khách';
        const nowStr = new Date().toLocaleString('vi-VN');
        if (activeMode === 'face') {
          upsertUserDossier({
            fullName: currentPerson,
            gender: userGender,
            faceImage: dataUrl,
            faceCapturedAt: nowStr
          });
          setSavedPhotoToast(`✓ Đã lưu ảnh khuôn mặt vào hồ sơ của ${currentPerson}`);
        } else if (activeMode === 'palm') {
          upsertUserDossier({
            fullName: currentPerson,
            gender: userGender,
            palmImage: dataUrl,
            palmCapturedAt: nowStr,
            palmSide: handSide
          });
          setSavedPhotoToast(`✓ Đã lưu ảnh lòng bàn tay (${handSide === 'left' ? 'Tay Trái' : 'Tay Phải'}) vào hồ sơ của ${currentPerson}`);
        } else if (activeMode === 'body') {
          upsertUserDossier({
            fullName: currentPerson,
            gender: userGender,
            bodyImage: dataUrl,
            bodyCapturedAt: nowStr
          });
          setSavedPhotoToast(`✓ Đã lưu ảnh toàn thân vào hồ sơ của ${currentPerson}`);
        }
        setTimeout(() => setSavedPhotoToast(null), 4000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Chọn loại chỉ tay mẫu từ sách hướng dẫn
  const handleSelectPalmPattern = (pattern: PalmPattern) => {
    stopCamera();
    setSelectedPalmPattern(pattern);
    setImagePreview(pattern.svgImage);
    setAnalysisText(null);
  };

  // Chọn loại tướng mặt mẫu từ sách hướng dẫn
  const handleSelectFacePattern = (pattern: FacePattern) => {
    stopCamera();
    setSelectedFacePattern(pattern);
    setImagePreview(pattern.imageUrl);
    setAnalysisText(null);
  };

  // Chọn loại tướng toàn thân mẫu từ sách hướng dẫn
  const handleSelectBodyPattern = (pattern: BodyPattern) => {
    stopCamera();
    setSelectedBodyPattern(pattern);
    setImagePreview(pattern.svgImage);
    setAnalysisText(null);
  };

  // Render khung căn chỉnh lòng bàn tay (Silhouette Guide Overlay)
  const renderPalmGuideOverlay = () => {
    const isLeft = handSide === 'left';
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-2.5 select-none z-20">
        {/* Hàng đỉnh: 2 góc và huy hiệu hướng dẫn */}
        <div className="w-full flex items-center justify-between px-1">
          <div className="w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-lg shadow-md" />
          <div className="bg-slate-950/95 border border-amber-400/90 text-amber-300 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkle className="w-3 h-3 text-amber-400 animate-spin" />
            <span>
              {isLeft 
                ? '✋ LÒNG TAY TRÁI: Ngón cái bên PHẢI' 
                : '🤚 LÒNG TAY PHẢI: Ngón cái bên TRÁI'}
            </span>
          </div>
          <div className="w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-lg shadow-md" />
        </div>

        {/* Silhouette Bàn Tay 5 Ngón Chuẩn Xác & 3 Đại Lộ Chỉ Tay */}
        <div className="relative w-48 h-56 sm:w-56 sm:h-64 flex items-center justify-center -my-2">
          <svg
            viewBox="0 0 480 540"
            className="w-full h-full drop-shadow-[0_0_20px_rgba(245,158,11,0.65)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lòng bàn tay trong gương/camera selfie:
                - Tay Trái (Nam Tả): ngón út ở bên TRÁI, ngón cái choãi sang bên PHẢI (isLeft -> lật ngang)
                - Tay Phải (Nữ Hữu): ngón cái choãi sang bên TRÁI, ngón út ở bên PHẢI (!isLeft -> để nguyên) */}
            <g transform={isLeft ? "translate(480, 0) scale(-1, 1)" : undefined}>
              {/* Vòng hào quang cổ thư */}
              <circle cx="240" cy="275" r="195" fill="none" stroke="#d97706" strokeWidth="1" strokeDasharray="5 7" opacity="0.35" />

              {/* Đường viền bàn tay 5 ngón hoàn chỉnh, sắc nét */}
              <path
                d="M 175 480 
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
                fill="rgba(245, 158, 11, 0.12)"
                stroke="#fbbf24"
                strokeWidth="3.5"
                strokeDasharray="7 5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />

              {/* Điểm định vị 5 đầu ngón tay */}
              <circle cx="100" cy="225" r="4.5" fill="#f59e0b" opacity="0.85" />
              <circle cx="185" cy="120" r="4.5" fill="#f59e0b" opacity="0.85" />
              <circle cx="245" cy="73" r="5" fill="#f59e0b" opacity="0.9" />
              <circle cx="310" cy="112" r="4.5" fill="#f59e0b" opacity="0.85" />
              <circle cx="365" cy="180" r="4.5" fill="#f59e0b" opacity="0.85" />

              {/* Ngấn Cổ Tay */}
              <path
                d="M 175 480 C 235 495, 275 493, 300 480"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeDasharray="4 3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 180 492 C 235 505, 270 503, 295 492"
                stroke="#d97706"
                strokeWidth="1.8"
                strokeDasharray="3 3"
                strokeLinecap="round"
                fill="none"
              />

              {/* Sinh Đạo (Màu xanh lục - ôm gò Kim Tinh ở gốc ngón cái) */}
              <path
                d="M 175 280 C 160 330, 165 395, 205 460"
                stroke="#10b981"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Trí Đạo (Màu chàm tím - chạy ngang qua lòng bàn tay) */}
              <path
                d="M 175 280 C 220 310, 270 345, 320 375"
                stroke="#818cf8"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Tâm Đạo (Màu hồng đào - từ dưới ngón út chạy sang) */}
              <path
                d="M 345 280 C 300 285, 240 270, 195 260"
                stroke="#f472b6"
                strokeWidth="4"
                strokeDasharray="6 4"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          </svg>

          {/* Vòng tâm nhắm trung tâm */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 border-2 border-amber-400/60 rounded-full animate-ping" />
            <div className="w-3 h-3 bg-amber-400 rounded-full shadow-lg" />
          </div>
        </div>

        {/* Chú thích màu sắc 3 đường */}
        <div className="flex items-center gap-2.5 text-[9px] sm:text-[10px] text-slate-300 bg-slate-950/85 px-3 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm mb-14">
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>Sinh Đạo</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block"/>Trí Đạo</span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-400 inline-block"/>Tâm Đạo</span>
        </div>

        {/* Khung góc đáy */}
        <div className="w-full flex justify-between">
          <div className="w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-lg shadow-md" />
          <div className="w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-lg shadow-md" />
        </div>
      </div>
    );
  };

  // Render khung căn chỉnh khuôn mặt (Tam Đình Ngũ Quan)
  const renderFaceGuideOverlay = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-2.5 select-none z-20">
        <div className="w-full flex items-center justify-between px-1">
          <div className="w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-lg shadow-md" />
          <div className="bg-slate-950/95 border border-amber-400/90 text-amber-300 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkle className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Khuôn mặt thẳng vào khung Tam Đình</span>
          </div>
          <div className="w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-lg shadow-md" />
        </div>

        <div className="relative w-44 h-52 sm:w-52 sm:h-60 flex items-center justify-center -my-1">
          <svg
            viewBox="0 0 200 240"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elip đầu */}
            <ellipse cx="100" cy="115" rx="65" ry="85" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 4" fill="rgba(245, 158, 11, 0.06)" className="animate-pulse" />
            {/* Trục đối xứng */}
            <line x1="100" y1="35" x2="100" y2="195" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
            {/* Thượng Đình (Trán) */}
            <line x1="50" y1="85" x2="150" y2="85" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Mắt */}
            <circle cx="78" cy="100" r="4" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="122" cy="100" r="4" stroke="#fbbf24" strokeWidth="1.5" />
            {/* Trung Đình (Mũi) */}
            <line x1="55" y1="135" x2="145" y2="135" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Hạ Đình (Miệng & Cằm) */}
            <line x1="65" y1="165" x2="135" y2="165" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
        </div>

        <div className="text-[9px] sm:text-[10px] text-amber-300/80 bg-slate-950/85 px-3 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm mb-14">
          Xanh: Trán • Vàng: Mũi • Hồng: Miệng
        </div>

        <div className="w-full flex justify-between">
          <div className="w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-lg shadow-md" />
          <div className="w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-lg shadow-md" />
        </div>
      </div>
    );
  };

  // Render khung căn chỉnh toàn thân
  const renderBodyGuideOverlay = () => {
    return (
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-2.5 select-none z-20">
        <div className="w-full flex items-center justify-between px-1">
          <div className="w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg shadow-md" />
          <div className="bg-slate-950/95 border border-emerald-400/90 text-emerald-300 text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5">
            <Sparkle className="w-3 h-3 text-emerald-400 animate-spin" />
            <span>Lùi lại khoảng 2m để toàn thân vào khung</span>
          </div>
          <div className="w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg shadow-md" />
        </div>

        <div className="relative w-40 h-56 sm:w-48 sm:h-64 flex items-center justify-center -my-1">
          <svg
            viewBox="0 0 160 260"
            className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="80" cy="30" r="15" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" fill="rgba(16, 185, 129, 0.08)" />
            <path
              d="M 50,55 C 60,50 100,50 110,55 L 105,125 C 105,130 95,140 80,140 C 65,140 55,130 55,125 Z"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="5 4"
              fill="rgba(16, 185, 129, 0.08)"
              className="animate-pulse"
            />
            <path d="M 50,55 L 38,120 L 40,145" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
            <path d="M 110,55 L 122,120 L 120,145" stroke="#10b981" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
            <path d="M 68,140 L 65,235" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
            <path d="M 92,140 L 95,235" stroke="#10b981" strokeWidth="2.5" strokeDasharray="4 3" strokeLinecap="round" />
            <line x1="30" y1="240" x2="130" y2="240" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        <div className="text-[9px] sm:text-[10px] text-emerald-300/80 bg-slate-950/85 px-3 py-0.5 rounded-full border border-slate-800 backdrop-blur-sm mb-14">
          Giữ thẳng lưng, hai tay thả lỏng tự nhiên
        </div>

        <div className="w-full flex justify-between">
          <div className="w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg shadow-md" />
          <div className="w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-lg shadow-md" />
        </div>
      </div>
    );
  };

  // Phát âm giọng đọc lời bình
  const speakVoice = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const defaultName = activeMode === 'palm' 
        ? (selectedPalmPattern?.name || 'Ba Đường Tam Tài Cát Tướng') 
        : activeMode === 'face' 
        ? (selectedFacePattern?.name || 'Tướng Mặt Cát Tường')
        : 'Cốt Cách Thanh Quý';
      const parsed = parseAnalysisSections(text, defaultName);

      const voiceScript = `Kết quả phân loại tướng pháp: ${parsed.phanLoai}. Đặc điểm: ${parsed.dacDiem}. Luận bàn: ${parsed.luanBan}. ${parsed.sucKhoe ? `Sức khỏe y học: ${parsed.sucKhoe}.` : ''} Lời khuyên cải vận: ${parsed.loiKhuyen}`;

      const cleanVoiceText = voiceScript
        .replace(/\[\/?(PHAN_LOAI|DAC_DIEM|LUAN_BAN|SUC_KHOE|LOI_KHUYEN|THỦ TƯỚNG HỌC|NHÂN DIỆN HỌC|HÌNH TƯỚNG HỌC|KHẢO CỨU Y HỌC & TƯỚNG PHÁP|KHẢO CỨU DANH NHÂN THẾ GIỚI|KHẢO CỨU CỔ THƯ OXFORD|LUẬN GIẢI|ĐẶC ĐIỂM|CÔNG DANH|TÀI LỘC|CỐT CÁCH|Ý CHÍ|TÀI CHÍNH|ĐIỀN SẢN|VẬN HẠN|SỨC KHỎE|THỌ TRƯỜNG|TÌNH CẢM|GIA ĐẠO|LINH CẢM|TÂM THỨC|SỨ MỆNH|VẬN THẾ|PHÚC PHẬN|LỜI KHUYÊN)\]/gi, ' ')
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
      setIsVoiceSpeaking(true);
      utterance.onend = () => setIsVoiceSpeaking(false);
      utterance.onerror = () => setIsVoiceSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
  };

  // Phân tích với Gemini Vision hoặc giải luận cổ thư
  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);

    let base64 = imagePreview;
    if (imagePreview.startsWith('http')) {
      try {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const reader = new FileReader();
        base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Could not fetch sample image for base64 conversion, using fallback text");
      }
    }

    const patternDetail = activeMode === 'palm'
      ? (selectedPalmPattern ? { name: selectedPalmPattern.name, description: selectedPalmPattern.description, analysisDetail: selectedPalmPattern.analysisDetail } : undefined)
      : activeMode === 'face'
      ? (selectedFacePattern ? { name: selectedFacePattern.name, description: selectedFacePattern.description, analysisDetail: selectedFacePattern.analysisDetail } : undefined)
      : (selectedBodyPattern ? { name: selectedBodyPattern.name, description: selectedBodyPattern.description, analysisDetail: selectedBodyPattern.analysisDetail } : undefined);

    const result = await analyzeFaceOrPalmWithGemini(
      base64, 
      activeMode, 
      patternDetail, 
      userName, 
      handSide, 
      userGender
    );
    setAnalysisText(result);
    setLoading(false);

    // Tự động đọc lời bình tướng pháp
    speakVoice(result);
  };

  // Lưu hồ sơ vào Sổ Tay Vận Mệnh chính xác theo tên người dùng
  const handleSave = () => {
    if (!analysisText) return;
    const finalPersonName = userName.trim() || 'Hữu Duyên Khách';
    upsertUserDossier({ fullName: finalPersonName });
    const typeLabel = activeMode === 'face' 
      ? 'Tướng Mặt' 
      : activeMode === 'palm' 
      ? 'Chỉ Tay' 
      : 'Tướng Toàn Thân';

    const patternTitle = activeMode === 'face'
      ? (selectedFacePattern ? selectedFacePattern.name : 'Nhân Diện Cát Tường')
      : activeMode === 'palm'
      ? (selectedPalmPattern ? selectedPalmPattern.name : 'Thủ Tướng Cát Tường')
      : (selectedBodyPattern ? selectedBodyPattern.name : 'Cốt Cách Khí Phách');

    onSaveResult({
      title: `Hồ Sơ ${typeLabel}: ${finalPersonName} - ${patternTitle}`,
      personName: finalPersonName,
      capturedImage: imagePreview || undefined,
      summary: `Luận giải ${activeMode === 'face' ? 'Tam Đình Ngũ Quan' : activeMode === 'palm' ? 'Sinh Đạo, Trí Đạo, Tâm Đạo' : 'Hình tướng cốt cách & tỷ lệ thân vóc'} cho đương số ${finalPersonName}`,
      fullContent: analysisText,
      type: activeMode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Danh sách chỉ tay sau khi lọc theo danh mục
  const filteredPalmPatterns = palmCategoryFilter === 'all'
    ? PALM_PATTERNS
    : PALM_PATTERNS.filter(p => p.category === palmCategoryFilter);

  return (
    <div className="space-y-6">
      {/* Hồ Sơ Chủ Sự (Person Name Sync Banner) */}
      <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-950/80 via-slate-900/90 to-indigo-950/80 border border-amber-400/40 rounded-2xl p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow">
              <UserCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hồ Sơ Tướng Pháp Đương Số</span>
              </span>
              <p className="text-xs text-slate-300">
                {userName ? (
                  <>Lưu trữ hồ sơ cho: <strong className="text-amber-300">{userName}</strong></>
                ) : (
                  'Nhập họ tên để tự động gắn vào ảnh chụp & sổ tay'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-60">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={userName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Họ tên người xem tướng..."
                className="w-full bg-slate-950/90 border border-amber-500/50 rounded-xl pl-8 pr-3 py-1.5 text-xs text-amber-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 shadow-inner font-semibold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switcher: 3 Tướng Pháp (Mặt, Chỉ Tay, Toàn Thân) */}
      <div className="flex justify-center">
        <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-amber-500/30 flex flex-wrap justify-center gap-1.5 shadow-xl">
          <button
            onClick={() => { 
              setActiveMode('face'); 
              const loaded = loadPhotoFromDossier(userName, 'face');
              if (!loaded) {
                setIsSavedDossierPhoto(false);
                setSelectedFacePattern(FACE_PATTERNS[0]);
                setImagePreview(FACE_PATTERNS[0].imageUrl);
              }
              setAnalysisText(null); 
              stopCamera(); 
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeMode === 'face'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Tướng Mặt (Nhân Diện)</span>
          </button>

          <button
            onClick={() => { 
              setActiveMode('palm'); 
              const loaded = loadPhotoFromDossier(userName, 'palm');
              if (!loaded) {
                setIsSavedDossierPhoto(false);
                setSelectedPalmPattern(PALM_PATTERNS[0]);
                setImagePreview(PALM_PATTERNS[0].svgImage);
              }
              setAnalysisText(null); 
              stopCamera(); 
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeMode === 'palm'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>Xem Chỉ Tay (Thủ Tướng)</span>
          </button>

          <button
            onClick={() => { 
              setActiveMode('body'); 
              const loaded = loadPhotoFromDossier(userName, 'body');
              if (!loaded) {
                setIsSavedDossierPhoto(false);
                setSelectedBodyPattern(BODY_PATTERNS[0]);
                setImagePreview(BODY_PATTERNS[0].svgImage);
              }
              setAnalysisText(null); 
              stopCamera(); 
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeMode === 'body'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-emerald-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Tướng Toàn Thân (Cốt Cách)</span>
          </button>
        </div>
      </div>

      {/* Guide Header */}
      <div className={`bg-slate-900/80 border border-slate-800 rounded-3xl text-center max-w-3xl mx-auto shadow-xl relative overflow-hidden transition-all ${isCameraActive ? 'p-3' : 'p-5 sm:p-6'}`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-amber-400 text-base">☯</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
            {activeMode === 'face' ? 'Ma Y Thần Tướng' : activeMode === 'palm' ? 'Thủ Tướng Học Á Đông & Y Khoa' : 'Hình Tướng Cốt Cách Học'}
          </span>
        </div>
        <h2 className="font-mystic text-lg sm:text-2xl font-bold text-amber-300">
          {activeMode === 'face' 
            ? 'Tướng Pháp Ma Y • Soi Khuôn Mặt Định Vận Mệnh' 
            : activeMode === 'palm'
            ? 'Thủ Tướng Học • Khai Mở Chỉ Tay & 4 Sắc Thái Khí Chất'
            : 'Hình Tướng Toàn Thân • Soi Cốt Cách & Dáng Vóc Đế Vương'}
        </h2>
        {!isCameraActive && (
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl mx-auto">
            {activeMode === 'face'
              ? 'Bật Camera chụp khuôn mặt, tải ảnh lên hoặc chọn mẫu diện mạo kinh điển bên dưới để AI phân tích.'
              : activeMode === 'palm'
              ? 'Bật Camera chụp lòng bàn tay, tải ảnh lên hoặc chọn 1 trong 12 mẫu chỉ tay chuẩn cổ thư và nghiên cứu y học bên dưới.'
              : 'Bật Camera chụp toàn thân (dáng đứng/ngồi), tải ảnh lên hoặc đối chiếu với 3 mẫu cốt cách hình tướng kinh điển.'}
          </p>
        )}
      </div>

      {/* Camera / Upload & Preview Section */}
      <div className={`max-w-xl mx-auto bg-slate-950/90 border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col items-center backdrop-blur-xl transition-all ${isCameraActive ? 'p-3 sm:p-4' : 'p-5 sm:p-6'}`}>
        {/* Nam Tả - Nữ Hữu Hand Switcher for Palm */}
        {activeMode === 'palm' && (
          <div className="w-full mb-3 p-2.5 bg-purple-950/70 border border-amber-400/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                <span>☯</span>
                <span>Nam Tả - Nữ Hữu:</span>
              </span>
              <span className="text-[11px] text-purple-200">
                {userGender === 'nam' ? 'Nam mạng chụp tay Trái' : 'Nữ mạng chụp tay Phải'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
              <button
                type="button"
                onClick={() => setHandSide('left')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  handSide === 'left'
                    ? 'bg-amber-400 text-slate-950 shadow-md ring-1 ring-amber-300 font-extrabold'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-amber-300'
                }`}
              >
                <span>✋ Tay Trái (Nam Tả)</span>
              </button>

              <button
                type="button"
                onClick={() => setHandSide('right')}
                className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  handSide === 'right'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md ring-1 ring-pink-300 font-extrabold'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-pink-300'
                }`}
              >
                <span>🤚 Tay Phải (Nữ Hữu)</span>
              </button>
            </div>
          </div>
        )}

        {/* Viewport Box */}
        <div 
          ref={cameraViewportRef}
          className="relative w-full max-w-sm aspect-[4/3] sm:aspect-square max-h-[48vh] sm:max-h-[380px] rounded-2xl overflow-hidden border-2 border-amber-400/60 bg-slate-950 flex items-center justify-center shadow-2xl"
        >
          {isCameraActive ? (
            <>
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(e => console.warn("Lỗi phát video:", e));
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Khung Mẫu Căn Chỉnh Trên Màn Hình Camera (Silhouette Guide Overlay) */}
              {showOverlayGuide && (
                activeMode === 'palm' 
                  ? renderPalmGuideOverlay() 
                  : activeMode === 'face' 
                  ? renderFaceGuideOverlay() 
                  : renderBodyGuideOverlay()
              )}

              {/* THANH ĐIỀU KHIỂN NỔI (FLOATING SHUTTER BAR) NGAY TRÊN CAMERA */}
              <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-2 z-30 pointer-events-auto">
                {/* Nút Đóng */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 text-slate-300 border border-slate-700/80 text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-md active:scale-95 transition"
                >
                  <X className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Hủy</span>
                </button>

                {/* NÚT CHỤP ẢNH LỚN NỔI BẬT Ở TRUNG TÂM */}
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="flex-1 max-w-[210px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.7)] border border-amber-200 flex items-center justify-center gap-1.5 active:scale-95 transition animate-pulse"
                >
                  <Camera className="w-4 h-4 text-slate-950" />
                  <span>CHỤP ẢNH NGAY</span>
                </button>

                {/* Nút Ẩn/Hiện Khung Mẫu */}
                <button
                  type="button"
                  onClick={() => setShowOverlayGuide(!showOverlayGuide)}
                  className={`px-2.5 py-2 rounded-xl border text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1 active:scale-95 transition ${
                    showOverlayGuide
                      ? 'bg-amber-500/25 text-amber-300 border-amber-400/60'
                      : 'bg-slate-950/85 text-slate-400 border-slate-700/80'
                  }`}
                  title={showOverlayGuide ? 'Ẩn khung mẫu' : 'Hiện khung mẫu'}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{showOverlayGuide ? 'Ẩn' : 'Hiện'}</span>
                </button>
              </div>
            </>
          ) : imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-slate-950" />
          ) : (
            <div className="flex flex-col items-center p-6 text-center text-slate-500">
              {activeMode === 'face' ? (
                <Eye className="w-16 h-16 text-amber-400/30 mb-2 animate-pulse" />
              ) : activeMode === 'palm' ? (
                <Hand className="w-16 h-16 text-purple-400/30 mb-2 animate-pulse" />
              ) : (
                <Activity className="w-16 h-16 text-emerald-400/30 mb-2 animate-pulse" />
              )}
              <span className="text-sm text-slate-400 font-semibold">Chưa có ảnh nào được nạp</span>
              <span className="text-xs text-slate-500 mt-1">Bấm Mở Camera hoặc chọn một mẫu trong sách hướng dẫn bên dưới</span>
            </div>
          )}

          {/* Golden scanning grid line effect when analyzing */}
          {loading && (
            <div className="absolute inset-0 bg-amber-500/10 pointer-events-none flex flex-col justify-between z-30">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-lg shadow-amber-400" />
            </div>
          )}
        </div>

        {/* Nút bật tắt khung mẫu khi camera đang chạy */}
        {isCameraActive && (
          <div className="flex items-center justify-between w-full px-2 mt-2">
            <span className="text-[11px] text-amber-300/80 font-semibold flex items-center gap-1">
              <Scan className="w-3.5 h-3.5 text-amber-400" />
              <span>Khung căn chỉnh {activeMode === 'palm' ? (handSide === 'left' ? 'Tay Trái' : 'Tay Phải') : activeMode === 'face' ? 'Khuôn Mặt' : 'Toàn Thân'}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowOverlayGuide(!showOverlayGuide)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                showOverlayGuide
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {showOverlayGuide ? '👁️ Ẩn khung mẫu' : '👁️ Hiện khung mẫu'}
            </button>
          </div>
        )}

        {/* Thông tin mẫu đang xem (nếu chọn mẫu từ sách hướng dẫn) */}
        {activeMode === 'palm' && selectedPalmPattern && imagePreview === selectedPalmPattern.svgImage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-amber-400/50 w-full space-y-2 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>{selectedPalmPattern.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedPalmPattern.badgeColor}`}>
                {selectedPalmPattern.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-amber-200">Đặc điểm nhận diện:</strong> {selectedPalmPattern.keyLines}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              📖 {selectedPalmPattern.bookTitle} • {selectedPalmPattern.meaning}
            </p>

            {/* Cảnh báo sức khỏe / bệnh lý theo nghiên cứu y khoa của Bác sĩ Josef Ranald */}
            {selectedPalmPattern.healthNote && (
              <div className="text-[11px] text-rose-300 bg-rose-950/40 p-2.5 rounded-xl border border-rose-800/40 leading-relaxed mt-1 flex items-start gap-1.5">
                <span className="text-base flex-shrink-0">🩺</span>
                <div>
                  <strong className="text-rose-200">Cảnh báo sức khỏe (BS. Josef Ranald):</strong> {selectedPalmPattern.healthNote}
                </div>
              </div>
            )}
          </div>
        )}

        {activeMode === 'body' && selectedBodyPattern && imagePreview === selectedBodyPattern.svgImage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-400/50 w-full space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedBodyPattern.name}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedBodyPattern.badgeColor}`}>
                {selectedBodyPattern.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-200">Thế đứng cốt cách:</strong> {selectedBodyPattern.keyPosture}
            </p>
            <p className="text-[11px] text-slate-400 italic">
              📖 {selectedBodyPattern.bookTitle} • {selectedBodyPattern.meaning}
            </p>
          </div>
        )}

        {/* Action Controls: Camera / Upload / Analyze */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 w-full">
          {isCameraActive ? (
            <>
              <button
                onClick={capturePhoto}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-extrabold text-sm shadow-lg hover:brightness-110 active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Chụp ảnh này</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition"
              >
                Hủy Camera
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/50 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 text-xs sm:text-sm font-semibold transition active:scale-95"
              >
                <Camera className="w-4 h-4 text-purple-300" />
                <span>Mở Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs sm:text-sm font-semibold transition active:scale-95"
              >
                <Upload className="w-4 h-4 text-slate-400" />
                <span>Tải ảnh lên</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </>
          )}

          {/* Phân tích luận giải */}
          {imagePreview && !isCameraActive && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Đang soi tướng pháp...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Bắt Đầu Luận Giải ({userName.trim() || 'Hữu Duyên Khách'})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Guidebook Archetypes Selection Box */}
      <div id="archetype-guide-section" className="max-w-5xl mx-auto bg-slate-900/90 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mystic font-bold text-base sm:text-lg text-amber-300 flex items-center gap-2">
                <span>
                  {activeMode === 'palm' 
                    ? 'Bộ Mẫu Chỉ Tay & Khí Chất Sắc Thái Chuẩn Cổ Thư (12 Dạng)' 
                    : activeMode === 'body'
                    ? 'Bộ Mẫu Hình Tướng & Cốt Cách Toàn Thân Chuẩn Cổ Thư'
                    : 'Bộ Mẫu Tướng Mặt Kinh Điển Trong Cổ Thư'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {activeMode === 'palm'
                  ? 'Bấm chọn một dạng chỉ tay hoặc sắc thái giải phẫu để nạp đồ họa và nghe Thầy Bói luận giải:'
                  : activeMode === 'body'
                  ? 'Bấm chọn một loại hình tướng bên dưới để đối chiếu dáng vóc, thế ngồi và cốt cách:'
                  : 'Bấm chọn một mẫu diện mạo bên dưới để đối chiếu Tam Đình Ngũ Quan:'}
              </p>
            </div>
          </div>

          {activeMode === 'palm' && (
            <button
              onClick={() => setShowHistoryDocModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-xs font-bold transition shadow self-start sm:self-auto active:scale-95"
            >
              <FileText className="w-3.5 h-3.5 text-purple-300" />
              <span>Khảo Cứu Cổ Thư & Y Khoa</span>
            </button>
          )}
        </div>

        {/* Thanh phân loại danh mục Chỉ Tay (khi xem mode Chỉ tay) */}
        {activeMode === 'palm' && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
            <span className="text-xs text-slate-400 font-semibold mr-1">Phân loại:</span>
            <button
              onClick={() => setPalmCategoryFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                palmCategoryFilter === 'all'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-200'
              }`}
            >
              Tất cả (12)
            </button>
            <button
              onClick={() => setPalmCategoryFilter('auspicious')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                palmCategoryFilter === 'auspicious'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-amber-200'
              }`}
            >
              Cổ Thư Vận Mệnh (6)
            </button>
            <button
              onClick={() => setPalmCategoryFilter('ranald_temperament')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                palmCategoryFilter === 'ranald_temperament'
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-rose-200'
              }`}
            >
              Khí Chất & Bệnh Lý (Ranald - 4)
            </button>
            <button
              onClick={() => setPalmCategoryFilter('celebrity')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                palmCategoryFilter === 'celebrity'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-purple-200'
              }`}
            >
              Tướng Danh Nhân (2)
            </button>
          </div>
        )}

        {/* Danh sách 12 mẫu chỉ tay theo phân loại */}
        {activeMode === 'palm' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {filteredPalmPatterns.map((pattern) => {
              const isSelected = selectedPalmPattern?.id === pattern.id && imagePreview === pattern.svgImage;
              return (
                <button
                  key={pattern.id}
                  onClick={() => handleSelectPalmPattern(pattern)}
                  className={`p-2.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition duration-200 group relative ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-xl scale-[1.02]'
                      : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900 relative">
                    <img 
                      src={pattern.svgImage} 
                      alt={pattern.name} 
                      className="w-full h-full object-contain p-1" 
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-extrabold shadow">
                        ✓
                      </div>
                    )}
                  </div>
                  <div>
                    <span className={`block text-xs font-bold leading-tight ${isSelected ? 'text-amber-300' : 'text-slate-300 group-hover:text-amber-200'}`}>
                      {pattern.name}
                    </span>
                    <span className="block text-[10px] text-amber-400/80 truncate mt-0.5 font-medium">
                      {pattern.badge.split(' ')[0]} {pattern.badge.split(' ')[1] || ''}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Danh sách 3 mẫu tướng toàn thân */}
        {activeMode === 'body' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BODY_PATTERNS.map((pattern) => {
              const isSelected = selectedBodyPattern?.id === pattern.id && imagePreview === pattern.svgImage;
              return (
                <button
                  key={pattern.id}
                  onClick={() => handleSelectBodyPattern(pattern)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition duration-200 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl'
                      : 'bg-slate-950/80 border-slate-800 hover:border-emerald-400/50 text-slate-300'
                  }`}
                >
                  <img src={pattern.svgImage} alt={pattern.name} className="w-16 h-16 rounded-xl object-contain bg-slate-900 p-1 flex-shrink-0 border border-slate-700" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-200'}`}>
                        {pattern.name}
                      </span>
                      {isSelected && <span className="text-emerald-400 text-xs font-bold">✓</span>}
                    </div>
                    <span className="block text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {pattern.meaning}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Danh sách 3 mẫu tướng mặt */}
        {activeMode === 'face' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FACE_PATTERNS.map((pattern) => {
              const isSelected = selectedFacePattern?.id === pattern.id && imagePreview === pattern.imageUrl;
              return (
                <button
                  key={pattern.id}
                  onClick={() => handleSelectFacePattern(pattern)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition duration-200 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                      : 'bg-slate-950/80 border-slate-800 hover:border-purple-400/50 text-slate-300'
                  }`}
                >
                  <img src={pattern.imageUrl} alt={pattern.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-slate-700" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                        {pattern.name}
                      </span>
                      {isSelected && <span className="text-amber-400 text-xs">✓</span>}
                    </div>
                    <span className="block text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {pattern.meaning}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Analysis Output Result */}
      {analysisText && (
        <div className="max-w-3xl mx-auto bg-slate-950 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
                  <span>Lời Bình Tướng Pháp Thần Cơ</span>
                  {isVoiceSpeaking && (
                    <span className="text-xs text-emerald-400 font-sans font-semibold animate-pulse flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>Đang đọc...</span>
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeMode === 'face' 
                    ? `Luận giải nhân diện Tam Đình Ngũ Quan cho: ${userName.trim() || 'Hữu Duyên Khách'}` 
                    : activeMode === 'palm'
                    ? `Luận giải các gò, chỉ tay & sắc thái giải phẫu cho: ${userName.trim() || 'Hữu Duyên Khách'}`
                    : `Luận giải hình tướng cốt cách & tỷ lệ thân hình cho: ${userName.trim() || 'Hữu Duyên Khách'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isVoiceSpeaking ? (
                <button
                  onClick={stopVoice}
                  className="px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Dừng đọc</span>
                </button>
              ) : (
                <button
                  onClick={() => speakVoice(analysisText)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nghe thầy đọc</span>
                </button>
              )}

              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:brightness-110 text-amber-200 border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-amber-400" />
                <span>{savedSuccess ? 'Đã lưu hồ sơ!' : `Lưu hồ sơ (${userName.trim() || 'Đương số'})`}</span>
              </button>
            </div>
          </div>

          {(() => {
            const parsed = parseAnalysisSections(
              analysisText, 
              activeMode === 'palm' ? 'Chỉ Tay Quý Tướng Đặc Biệt' : activeMode === 'body' ? 'Cốt Cách Quý Tướng' : 'Quý Tướng Tam Đình'
            );
            return (
              <div className="space-y-4">
                {/* Bảng Phân Loại Cụ Thể (Archetype Classification Card) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/70 via-purple-950/60 to-slate-900/90 border-2 border-amber-400/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                          {activeMode === 'palm' ? 'Phân Loại Chỉ Tay Cổ Thư' : activeMode === 'body' ? 'Phân Loại Cốt Cách' : 'Phân Loại Tướng Mạo'}
                        </span>
                        {activeMode === 'palm' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            {handSide === 'left' ? '✋ Tay Trái (Nam Tả)' : '🤚 Tay Phải (Nữ Hữu)'}
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg sm:text-xl font-mystic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 mt-1">
                        {parsed.phanLoai}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const el = document.getElementById('archetype-guide-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-2 transition active:scale-95 shadow shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    <span>Đối chiếu 12 mẫu &darr;</span>
                  </button>
                </div>

                {/* 4 Khối Chi Tiết */}
                <div className="grid grid-cols-1 gap-3.5">
                  {/* Khối 1: Đặc Điểm Nhận Diện */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition">
                    <h5 className="font-bold text-amber-300 text-sm flex items-center gap-2 mb-2">
                      <Scan className="w-4 h-4 text-amber-400" />
                      <span>1. Đặc Điểm Nhận Diện Tướng Pháp</span>
                    </h5>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line pl-6">
                      {parsed.dacDiem}
                    </p>
                  </div>

                  {/* Khối 2: Luận Bàn Vận Mệnh & Tài Lộc */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition">
                    <h5 className="font-bold text-amber-300 text-sm flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>2. Luận Bàn Vận Mệnh, Công Danh & Tài Lộc</span>
                    </h5>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line pl-6">
                      {parsed.luanBan}
                    </p>
                  </div>

                  {/* Khối 3: Khảo Cứu Sức Khỏe (Josef Ranald) */}
                  {parsed.sucKhoe && (
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/50 hover:border-emerald-500/40 transition">
                      <h5 className="font-bold text-emerald-400 text-sm flex items-center gap-2 mb-2">
                        <HeartPulse className="w-4 h-4 text-emerald-400" />
                        <span>3. Khảo Cứu Bệnh Lý & Sức Khỏe (Theo Bác Sĩ Josef Ranald)</span>
                      </h5>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line pl-6">
                        {parsed.sucKhoe}
                      </p>
                    </div>
                  )}

                  {/* Khối 4: Lời Khuyên Cải Vận */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-900/50 hover:border-purple-500/40 transition">
                    <h5 className="font-bold text-purple-300 text-sm flex items-center gap-2 mb-2">
                      <Award className="w-4 h-4 text-purple-400" />
                      <span>{parsed.sucKhoe ? '4. Lời Khuyên Tu Tâm Dưỡng Tướng Cải Vận' : '3. Lời Khuyên Tu Tâm Dưỡng Tướng Cải Vận'}</span>
                    </h5>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line pl-6">
                      {parsed.loiKhuyen}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Modal Khảo Cứu Cổ Thư & Khoa Học Giải Phẫu Bàn Tay */}
      {showHistoryDocModal && (
        <div 
          onClick={() => setShowHistoryDocModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Tư Liệu Cổ Thư & Khoa Học Giải Phẫu Bàn Tay</span>
                </span>
                <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300 mt-0.5">
                  {PALMISTRY_HISTORICAL_DOC.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Nguồn: {PALMISTRY_HISTORICAL_DOC.author}
                </p>
              </div>
              <button 
                onClick={() => setShowHistoryDocModal(false)}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-amber-200/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 leading-relaxed italic">
              {PALMISTRY_HISTORICAL_DOC.summary}
            </div>

            <div className="space-y-4">
              {PALMISTRY_HISTORICAL_DOC.sections.map((sec, idx) => (
                <div key={idx} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{sec.title}</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowHistoryDocModal(false)}
                className="px-6 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition shadow active:scale-95"
              >
                Đã hiểu, quay lại xem mẫu chỉ tay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
