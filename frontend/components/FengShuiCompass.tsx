import React, { useState, useEffect, useRef } from 'react';
import { CompassProfile, CompassDirectionInfo } from '../types';
import { 
  EIGHT_DIRECTIONS, 
  BAT_TRACH_MATRIX, 
  DIRECTION_MEANINGS, 
  getCanChiNapAm 
} from '../constants';
import { calculateCungPhi } from '../services/loveMatchService';
import { 
  Navigation, 
  RotateCw, 
  RotateCcw, 
  Compass as CompassIcon, 
  Sparkles, 
  BookmarkPlus, 
  ShieldCheck, 
  AlertTriangle, 
  Home, 
  Bed, 
  Flame, 
  HelpCircle,
  Radio,
  Sliders,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';

interface FengShuiCompassProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'compass' }) => void;
}

export const FengShuiCompass: React.FC<FengShuiCompassProps> = ({ onSaveResult }) => {
  // Thông tin đương số
  const [userName, setUserName] = useState('Gia Chủ');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [birthYear, setBirthYear] = useState<number>(1984); // Mặc định 1984 Giáp Tý (Cung Đoài Tây Tứ Mệnh cho Nam)

  // Trạng thái la bàn
  const [heading, setHeading] = useState<number>(0); // Góc xoay hiện tại (0 - 359 độ)
  const [isSensorActive, setIsSensorActive] = useState<boolean>(false);
  const [sensorPermission, setSensorPermission] = useState<string>('prompt');
  const [isLocked, setIsLocked] = useState<boolean>(false); // Khóa hướng đang đo

  // Thông tin Bát Trạch sau khi tính toán
  const [compassProfile, setCompassProfile] = useState<CompassProfile | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<CompassDirectionInfo | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Tính toán hồ sơ Bát Trạch theo Cung Phi của đương số
  const calculateCompassProfile = (year: number, gen: 'nam' | 'nu', nameStr: string): CompassProfile => {
    const hoaGiap = getCanChiNapAm(year);
    const canChi = hoaGiap.canChi;
    const napAm = hoaGiap.napAm;

    // Tính cung phi
    const phi = calculateCungPhi(year, gen);
    const cungName = phi.cung; // Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài

    // Xác định Đông Tứ Mệnh hay Tây Tứ Mệnh
    const dongTu = ['Khảm', 'Ly', 'Chấn', 'Tốn'];
    const menhQuai = dongTu.includes(cungName) ? 'Đông Tứ Mệnh' : 'Tây Tứ Mệnh';

    const matrixForCung = BAT_TRACH_MATRIX[cungName] || BAT_TRACH_MATRIX['Càn'];

    // Lập danh sách 8 hướng với thông tin Cát / Hung
    const directions: CompassDirectionInfo[] = EIGHT_DIRECTIONS.map(dir => {
      const quality = matrixForCung[dir.code] || 'Phục Vị';
      const info = DIRECTION_MEANINGS[quality];
      return {
        directionName: dir.vietnameseName,
        directionCode: dir.code,
        degreesRange: dir.degreesRange,
        centerDegree: dir.centerDegree,
        element: dir.element,
        quality: quality,
        isGood: info.isGood,
        starName: info.star,
        meaning: info.meaning,
        advice: info.advice
      };
    });

    return {
      name: nameStr,
      gender: gen,
      birthYear: year,
      canChiYear: canChi,
      napAm: napAm,
      cungPhi: `${cungName} (${phi.hanh})`,
      menhQuai: menhQuai,
      directions: directions
    };
  };

  // Cập nhật khi thay đổi năm sinh / giới tính
  useEffect(() => {
    const prof = calculateCompassProfile(birthYear, gender, userName);
    setCompassProfile(prof);

    // Mặc định chọn hướng Sinh Khí
    const sinhKhi = prof.directions.find(d => d.quality === 'Sinh Khí') || prof.directions[0];
    setSelectedDirection(sinhKhi);
  }, [birthYear, gender, userName]);

  // Cảm biến xoay thiết bị (DeviceOrientation)
  useEffect(() => {
    if (isLocked) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Trên iOS Safari có webkitCompassHeading, trên Android có alpha
      let currentDegree: number | null = null;
      
      const evtAny = event as any;
      if (typeof evtAny.webkitCompassHeading !== 'undefined') {
        currentDegree = evtAny.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Trên Android, alpha ngược chiều kim đồng hồ
        currentDegree = (360 - event.alpha) % 360;
      }

      if (currentDegree !== null) {
        setHeading(Math.round(currentDegree));
        setIsSensorActive(true);
      }
    };

    // Kiểm tra xem trình duyệt có hỗ trợ không
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isLocked]);

  // Yêu cầu quyền cảm biến la bàn trên iOS 13+
  const requestCompassPermission = async () => {
    const dOrient = DeviceOrientationEvent as any;
    if (typeof dOrient.requestPermission === 'function') {
      try {
        const response = await dOrient.requestPermission();
        if (response === 'granted') {
          setSensorPermission('granted');
          setIsSensorActive(true);
        } else {
          alert('Bạn đã từ chối quyền cảm biến chuyển động la bàn. Bạn vẫn có thể xoay bằng tay.');
        }
      } catch (err) {
        console.warn('Compass permission error:', err);
      }
    }
  };

  // Tìm hướng hiện tại theo góc xoay (heading)
  const getCurrentDirection = (deg: number): CompassDirectionInfo | null => {
    if (!compassProfile) return null;
    const normalized = (deg % 360 + 360) % 360;
    return compassProfile.directions.find(d => {
      const [start, end] = d.degreesRange;
      if (start > end) {
        // Hướng Bắc (337.5 -> 22.5)
        return normalized >= start || normalized < end;
      }
      return normalized >= start && normalized < end;
    }) || null;
  };

  const currentFacingDir = getCurrentDirection(heading);

  // Điều khiển xoay thủ công
  const rotateCompass = (step: number) => {
    if (isLocked) return;
    setHeading(prev => (prev + step + 360) % 360);
  };

  // Đặt thẳng góc đến hướng chỉ định
  const snapToDirection = (deg: number, dirInfo: CompassDirectionInfo) => {
    setHeading(deg);
    setSelectedDirection(dirInfo);
  };

  const handleSaveToHistory = () => {
    if (!compassProfile || !currentFacingDir) return;
    const goodDirs = compassProfile.directions.filter(d => d.isGood).map(d => `${d.directionName} (${d.quality})`).join(', ');
    const badDirs = compassProfile.directions.filter(d => !d.isGood).map(d => `${d.directionName} (${d.quality})`).join(', ');

    const fullText = `HỒ SƠ BÁT TRẠCH PHONG THỦY ĐƯƠNG SỐ:
- Gia chủ: ${compassProfile.name} (${compassProfile.gender === 'nam' ? 'Nam' : 'Nữ'})
- Năm sinh: ${compassProfile.birthYear} (${compassProfile.canChiYear})
- Bản mệnh Nạp Âm: ${compassProfile.napAm}
- Cung Phi Bát Trạch: ${compassProfile.cungPhi} • ${compassProfile.menhQuai}

1. BỐN HƯỚNG TỐT (CÁT KHÍ):
${compassProfile.directions.filter(d => d.isGood).map(d => `+ Hướng ${d.directionName}: Đắc ${d.quality} (${d.starName}) -> ${d.meaning}\n  Lời khuyên: ${d.advice}`).join('\n')}

2. BỐN HƯỚNG XẤU (HUNG KHÍ CẦN HÓA GIẢI):
${compassProfile.directions.filter(d => !d.isGood).map(d => `+ Hướng ${d.directionName}: Phạm ${d.quality} (${d.starName}) -> ${d.meaning}\n  Hóa giải: ${d.advice}`).join('\n')}

HƯỚNG ĐANG ĐO:
- Góc: ${heading}° (${currentFacingDir.directionName} - ${currentFacingDir.quality})
- Đánh giá: ${currentFacingDir.isGood ? 'HƯỚNG TỐT ĐẠI CÁT' : 'HƯỚNG XẤU CẦN TRÁNH HOẶC TRẤN YỂM'}`;

    onSaveResult({
      title: `La Bàn Phong Thủy: ${compassProfile.name} (${compassProfile.cungPhi} - ${compassProfile.menhQuai})`,
      summary: `Hướng đo: ${heading}° (${currentFacingDir.directionName} - ${currentFacingDir.quality}) • 4 Hướng Tốt: ${goodDirs}`,
      fullContent: fullText,
      type: 'compass'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* BANNER ĐẦU TRANG & NHẬP THÔNG TIN GIA CHỦ */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-amber-950/70 border-2 border-emerald-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-emerald-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-amber-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
              <Navigation className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🧭</span>
                <h2 className="font-mystic font-bold text-lg sm:text-xl text-emerald-300">
                  La Bàn Phong Thủy Bát Trạch Số Hóa
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Xoay theo cảm biến la bàn thực tế hoặc điều khiển 360°, tự động định 4 hướng tốt (Sinh Khí, Diên Niên, Thiên Y, Phục Vị) và 4 hướng hung hiểm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setBirthYear(1984);
                setGender('nam');
                setUserName('Gia Chủ Giáp Tý');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition active:scale-95"
            >
              Mẫu: Nam 1984 (Cung Đoài - Tây Tứ Mệnh)
            </button>
            <button
              onClick={() => {
                setBirthYear(1990);
                setGender('nu');
                setUserName('Gia Chủ Canh Ngọ');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 transition active:scale-95"
            >
              Mẫu: Nữ 1990 (Cung Cấn - Tây Tứ Mệnh)
            </button>
          </div>
        </div>

        {/* Form nhập thông tin gia chủ */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">Họ tên gia chủ:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">Giới tính:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setGender('nam')}
                className={`py-2 text-xs rounded-xl font-bold border transition ${
                  gender === 'nam'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-700'
                }`}
              >
                Nam Mạng
              </button>
              <button
                type="button"
                onClick={() => setGender('nu')}
                className={`py-2 text-xs rounded-xl font-bold border transition ${
                  gender === 'nu'
                    ? 'bg-pink-600 text-white border-pink-400 shadow'
                    : 'bg-slate-950 text-slate-400 border-slate-700'
                }`}
              >
                Nữ Mạng
              </button>
            </div>
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-emerald-200 mb-1">Năm sinh (Âm lịch):</label>
            <input
              type="number"
              min="1920"
              max="2035"
              value={birthYear}
              onChange={(e) => setBirthYear(parseInt(e.target.value) || 1984)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2 text-sm text-center font-bold text-amber-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Thẻ Cung Phi & Quái Mệnh của gia chủ */}
        {compassProfile && (
          <div className="mt-4 p-4 bg-slate-950/80 rounded-2xl border border-emerald-400/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Năm Can Chi:</span>
              <span className="text-sm font-bold text-amber-300">{compassProfile.canChiYear}</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800">
              <span className="text-slate-400 block">Bản Mệnh Nạp Âm:</span>
              <span className="text-sm font-bold text-yellow-300">{compassProfile.napAm}</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-emerald-500/40">
              <span className="text-emerald-300 block font-semibold">Cung Phi Bát Trạch:</span>
              <span className="text-sm font-bold text-emerald-300">{compassProfile.cungPhi}</span>
            </div>
            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-emerald-500/40">
              <span className="text-emerald-300 block font-semibold">Mệnh Quái:</span>
              <span className="text-sm font-bold text-amber-300">{compassProfile.menhQuai}</span>
            </div>
          </div>
        )}
      </div>

      {/* KHU VỰC CHÍNH: LA BÀN BÁT QUÁI 360 ĐỘ & BẢNG ĐIỀU KHIỂN HƯỚNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* CỘT LA BÀN XOAY (7 CỘT TRÊN MÀN LỚN) */}
        <div className="lg:col-span-7 bg-slate-900/90 border-2 border-amber-400/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col items-center relative overflow-hidden">
          
          {/* Header trạng thái đo */}
          <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-slate-200">
                Góc hướng: <strong className="text-amber-300 font-mono text-base">{heading}°</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Nút khóa hướng */}
              <button
                onClick={() => setIsLocked(!isLocked)}
                className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                  isLocked 
                    ? 'bg-amber-500 text-slate-950 border-amber-400' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
                title={isLocked ? 'Mở khóa góc xoay' : 'Khóa góc xoay để xem'}
              >
                {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{isLocked ? 'Đã Khóa' : 'Khóa Hướng'}</span>
              </button>

              <button
                onClick={handleSaveToHistory}
                className="px-3 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1 transition"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>{savedSuccess ? 'Đã Lưu!' : 'Lưu Sổ'}</span>
              </button>
            </div>
          </div>

          {/* VÙNG CHỈ BÁO HƯỚNG ĐANG ĐỨNG / HƯỚNG MẶT TIỀN */}
          {currentFacingDir && (
            <div className={`w-full max-w-md p-3 rounded-2xl mb-4 border text-center transition-all ${
              currentFacingDir.isGood 
                ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-200' 
                : 'bg-rose-950/60 border-rose-400/60 text-rose-200'
            }`}>
              <div className="flex items-center justify-center gap-2">
                {currentFacingDir.isGood ? (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
                <span className="text-sm sm:text-base font-bold font-mystic">
                  Hướng {currentFacingDir.directionName}: {currentFacingDir.quality} ({currentFacingDir.isGood ? 'HƯỚNG TỐT' : 'HƯỚNG XẤU'})
                </span>
              </div>
              <p className="text-[11px] opacity-90 mt-0.5 line-clamp-1">
                Sao {currentFacingDir.starName} • {currentFacingDir.meaning}
              </p>
            </div>
          )}

          {/* HÌNH ẢNH LA BÀN SỐ HÓA XOAY TRÒN (FENG SHUI COMPASS DIAL) */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 my-2 select-none flex items-center justify-center">
            
            {/* Kim chỉ tiêu ngắm cố định trên nóc la bàn (Đường thẳng màu đỏ ngắm hướng) */}
            <div className="absolute -top-3 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[14px] border-t-red-500 filter drop-shadow" />
              <div className="w-0.5 h-8 bg-red-500/80" />
            </div>

            {/* Mâm La Bàn xoay theo góc (-heading để mô phỏng xoay thực tế) */}
            <div 
              style={{ transform: `rotate(${-heading}deg)` }}
              className="w-full h-full rounded-full border-4 border-amber-400/70 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 shadow-2xl relative transition-transform duration-200 ease-out flex items-center justify-center"
            >
              {/* Vòng ngoài cùng: Vạch chia độ 0-360 */}
              <div className="absolute inset-1 rounded-full border border-amber-500/30 pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                  <div
                    key={deg}
                    style={{ transform: `rotate(${deg}deg)` }}
                    className="absolute inset-0 flex justify-center text-[10px] text-amber-300 font-mono font-bold pt-1"
                  >
                    |
                  </div>
                ))}
              </div>

              {/* Vòng 8 Cung Phương Vị (Bắc, Đông Bắc, Đông, ...) với màu Cát (Xanh) / Hung (Đỏ) */}
              {compassProfile && compassProfile.directions.map((dir, idx) => {
                const deg = dir.centerDegree;
                return (
                  <div
                    key={idx}
                    style={{ transform: `rotate(${deg}deg)` }}
                    className="absolute inset-0 flex flex-col items-center pt-5 pointer-events-none"
                  >
                    <span className={`text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                      dir.isGood 
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/60' 
                        : 'bg-rose-950/80 text-rose-300 border border-rose-500/60'
                    }`}>
                      {dir.directionCode}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-bold mt-1 ${dir.isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {dir.quality}
                    </span>
                  </div>
                );
              })}

              {/* Vòng 24 Sơn Hướng Cổ Truyền */}
              <div className="absolute inset-12 sm:inset-14 rounded-full border border-amber-400/40 bg-slate-950/80 flex items-center justify-center pointer-events-none">
                {/* Thái Cực Đồ Ở Tâm La Bàn */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-400 to-purple-600 p-0.5 shadow-xl flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border border-amber-400/50">
                    <span className="text-xl sm:text-2xl font-mystic text-amber-300 font-bold animate-pulse">
                      ☯
                    </span>
                  </div>
                </div>
              </div>

              {/* Kim Chỉ Nam Châm (Đầu Đỏ chỉ Bắc, Đầu Trắng chỉ Nam) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-1.5 h-36 sm:h-44 relative flex flex-col items-center justify-between">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[36px] border-b-rose-600 shadow-md" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 z-10 border border-slate-950" />
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[36px] border-t-slate-300 shadow-md" />
                </div>
              </div>

            </div>
          </div>

          {/* NÚT ĐIỀU KHIỂN XOAY THỦ CÔNG & BẬT CẢM BIẾN */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Xoay góc */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Xoay la bàn:</span>
              <button
                onClick={() => rotateCompass(-5)}
                disabled={isLocked}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95 disabled:opacity-40"
                title="Quay sang trái 5 độ"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => rotateCompass(5)}
                disabled={isLocked}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95 disabled:opacity-40"
                title="Quay sang phải 5 độ"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setHeading(0)}
                disabled={isLocked}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 disabled:opacity-40"
              >
                Về Bắc 0°
              </button>
            </div>

            {/* Cảm biến la bàn điện thoại */}
            <div className="flex items-center gap-2">
              <button
                onClick={requestCompassPermission}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  isSensorActive 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' 
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-amber-300'
                }`}
              >
                <Radio className={`w-3.5 h-3.5 ${isSensorActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{isSensorActive ? 'Cảm biến thiết bị: BẬT' : 'Bật La Bàn Tự Động'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* CỘT CHI TIẾT 4 HƯỚNG TỐT & 4 HƯỚNG XẤU (5 CỘT) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* HỘP 4 HƯỚNG TỐT (CÁT) */}
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mystic font-bold text-sm sm:text-base text-emerald-300">
                  4 Hướng Cát Lợi (Tốt)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                Nên mở Cửa • Đặt Bàn Thờ
              </span>
            </div>

            <div className="space-y-2.5">
              {compassProfile && compassProfile.directions.filter(d => d.isGood).map((dir, idx) => {
                const isCurrent = currentFacingDir?.directionCode === dir.directionCode;
                return (
                  <div
                    key={idx}
                    onClick={() => snapToDirection(dir.centerDegree, dir)}
                    className={`p-3 rounded-2xl border cursor-pointer transition duration-300 ${
                      isCurrent
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-md ring-2 ring-emerald-400/30'
                        : 'bg-slate-950/70 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-300 text-xs sm:text-sm">
                          {dir.directionName} ({dir.centerDegree}°)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-600">
                          {dir.quality}
                        </span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono font-semibold">
                        {dir.starName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {dir.meaning}
                    </p>
                    <div className="mt-1.5 text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                      <Home className="w-3 h-3 text-emerald-400" />
                      <span>{dir.advice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HỘP 4 HƯỚNG XẤU (HUNG) */}
          <div className="bg-slate-900/90 border border-rose-500/40 rounded-3xl p-4 sm:p-5 shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-500/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h3 className="font-mystic font-bold text-sm sm:text-base text-rose-300">
                  4 Hướng Hung Hiểm (Cần Tránh)
                </h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold">
                Đặt Bếp/Vệ sinh để Trấn
              </span>
            </div>

            <div className="space-y-2.5">
              {compassProfile && compassProfile.directions.filter(d => !d.isGood).map((dir, idx) => {
                const isCurrent = currentFacingDir?.directionCode === dir.directionCode;
                return (
                  <div
                    key={idx}
                    onClick={() => snapToDirection(dir.centerDegree, dir)}
                    className={`p-3 rounded-2xl border cursor-pointer transition duration-300 ${
                      isCurrent
                        ? 'bg-rose-950/80 border-rose-400 shadow-md ring-2 ring-rose-400/30'
                        : 'bg-slate-950/70 border-slate-800 hover:border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-300 text-xs sm:text-sm">
                          {dir.directionName} ({dir.centerDegree}°)
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200 border border-rose-600">
                          {dir.quality}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {dir.starName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 line-clamp-2">
                      {dir.meaning}
                    </p>
                    <div className="mt-1.5 text-[10px] text-amber-300 font-medium flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{dir.advice}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* BẢNG HƯỚNG DẪN BỐ TRÍ PHONG THỦY BÁT TRẠCH CỤ THỂ */}
      {compassProfile && (
        <div className="bg-slate-950/90 border border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-mystic font-bold text-base sm:text-lg text-amber-300">
              Quy Tắc Bố Trí Phong Thủy Cho Người {compassProfile.menhQuai} ({compassProfile.cungPhi})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                <Home className="w-4 h-4 text-emerald-400" />
                <span>1. Hướng Cửa Chính & Phòng Khách:</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Nên quay về các hướng cát: <strong className="text-emerald-300">{compassProfile.directions.filter(d => d.isGood).map(d => d.directionName.split(' ')[0]).join(', ')}</strong> để đón trọn vẹn sinh khí và tài lộc ngập tràn.
              </p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                <Bed className="w-4 h-4 text-indigo-400" />
                <span>2. Hướng Ban Thờ & Giường Ngủ:</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Ban thờ ưu tiên hướng <strong className="text-emerald-300">Phục Vị</strong> hoặc <strong className="text-emerald-300">Sinh Khí</strong> để tọa cát hướng cát. Đầu giường ngủ nên quay về hướng <strong className="text-emerald-300">Thiên Y</strong> để dưỡng sức khỏe và bình an.
              </p>
            </div>

            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1.5">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>3. Nguyên Tắc Đặt Bếp (Tọa Hung Hướng Cát):</span>
              </h4>
              <p className="text-slate-400 leading-relaxed">
                Bếp đun đặt đè lên các hướng xấu: <strong className="text-rose-300">{compassProfile.directions.filter(d => !d.isGood).map(d => d.directionName.split(' ')[0]).join(', ')}</strong> để thiêu đốt hung khí, và mặt bếp hướng về cung lành cát tường.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
