import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PersonLoveInput, LoveMatchSummary } from '../types';
import { calculateLoveMatch, findIdealPartnerAdvice, IdealPartnerAdvice, CandidateIdealYear } from '../services/loveMatchService';
import { analyzeLoveMatchWithGemini } from '../services/geminiService';
import { 
  getActiveDossier, 
  getActiveDossierName, 
  getUserDossiers, 
  upsertUserDossier 
} from '../services/dossierService';
import { 
  Heart, 
  Sparkles, 
  BookmarkPlus, 
  Loader2, 
  Sun, 
  Moon, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Users, 
  Flame,
  ArrowRight,
  User,
  Calendar,
  Check,
  AlertTriangle,
  Volume2,
  VolumeX,
  Compass,
  Award,
  ChevronDown
} from 'lucide-react';

interface LoveMatchProps {
  onSaveResult: (record: { 
    title: string; 
    summary: string; 
    fullContent: string; 
    type: 'love_match';
    personName?: string;
  }) => void;
}

export const LoveMatch: React.FC<LoveMatchProps> = ({ onSaveResult }) => {
  const specificFormRef = useRef<HTMLDivElement | null>(null);

  // Người thứ nhất (Mặc định Nam 1984 Giáp Tý hoặc lấy từ hồ sơ đang mở)
  const [person1, setPerson1] = useState<PersonLoveInput>(() => {
    try {
      const active = getActiveDossier();
      if (active?.fullName?.trim()) {
        let y = 1984, m = 10, d = 10;
        if (active.birthDate) {
          const parts = active.birthDate.split('-');
          if (parts.length === 3) {
            y = parseInt(parts[0], 10) || 1984;
            m = parseInt(parts[1], 10) || 10;
            d = parseInt(parts[2], 10) || 10;
          }
        }
        return {
          name: active.fullName.trim(),
          gender: active.gender || 'nam',
          calendarMode: 'solar',
          day: d,
          month: m,
          year: y,
          isLeapMonth: false
        };
      }
    } catch {}
    return {
      name: 'Anh Nam',
      gender: 'nam',
      calendarMode: 'solar',
      day: 10,
      month: 10,
      year: 1984,
      isLeapMonth: false
    };
  });

  // Người thứ hai (Mặc định Nữ 1988 Mậu Thìn)
  const [person2, setPerson2] = useState<PersonLoveInput>({
    name: 'Chị Nữ',
    gender: 'nu',
    calendarMode: 'solar',
    day: 15,
    month: 8,
    year: 1988,
    isLeapMonth: false
  });

  const [hasPerson1BirthDate, setHasPerson1BirthDate] = useState<boolean>(() => {
    try {
      const active = getActiveDossier();
      return !!active?.birthDate;
    } catch {}
    return true;
  });
  const [isDossierSynced, setIsDossierSynced] = useState<boolean>(false);

  const [matchSummary, setMatchSummary] = useState<LoveMatchSummary | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Tự động phân tích Mẫu người hợp mệnh lý tưởng của Người thứ nhất trước
  const idealAdvice: IdealPartnerAdvice | null = useMemo(() => {
    try {
      return findIdealPartnerAdvice(person1);
    } catch (e) {
      console.warn("Lỗi tính ideal partner:", e);
      return null;
    }
  }, [person1.year, person1.month, person1.day, person1.gender, person1.calendarMode, person1.name]);

  // Giọng nói đọc lời phán của Thầy Bói
  const speakFortuneTeller = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  // Tự động đồng bộ Người thứ nhất với hồ sơ đang kích hoạt
  const syncFromDossier = (targetName?: string) => {
    const activeName = (targetName || getActiveDossierName()).trim();
    const allDossiers = getUserDossiers();
    const matched = allDossiers.find(d => d.fullName.trim().toLowerCase() === activeName.toLowerCase());

    if (matched) {
      setIsDossierSynced(true);
      let y = person1.year;
      let m = person1.month;
      let d = person1.day;

      if (matched.birthDate) {
        const parts = matched.birthDate.split('-');
        if (parts.length === 3) {
          const parsedY = parseInt(parts[0], 10);
          const parsedM = parseInt(parts[1], 10);
          const parsedD = parseInt(parts[2], 10);
          if (!isNaN(parsedY) && !isNaN(parsedM) && !isNaN(parsedD)) {
            y = parsedY;
            m = parsedM;
            d = parsedD;
            setHasPerson1BirthDate(true);
          }
        }
      } else {
        setHasPerson1BirthDate(false);
      }

      const p1Gen = matched.gender || 'nam';
      setPerson1(prev => ({
        ...prev,
        name: matched.fullName,
        gender: p1Gen,
        year: y,
        month: m,
        day: d,
        calendarMode: 'solar'
      }));

      // Tự động set giới tính Người 2 ngược lại
      setPerson2(prev => ({
        ...prev,
        gender: p1Gen === 'nam' ? 'nu' : 'nam'
      }));
    } else if (activeName) {
      setIsDossierSynced(false);
      setPerson1(prev => ({ ...prev, name: activeName }));
    }
  };

  useEffect(() => {
    syncFromDossier();

    const handleActiveChange = (e: any) => {
      const name = typeof e.detail === 'string' ? e.detail : e.detail?.name;
      syncFromDossier(name);
    };

    const handleDossierUpdate = () => {
      syncFromDossier();
    };

    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    window.addEventListener('thien_co_cac_dossier_updated', handleDossierUpdate);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
      window.removeEventListener('thien_co_cac_dossier_updated', handleDossierUpdate);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePerson1NameChange = (val: string) => {
    setPerson1(p => ({ ...p, name: val }));
    if (val.trim()) {
      upsertUserDossier({
        fullName: val.trim(),
        gender: person1.gender,
        birthDate: `${person1.year}-${String(person1.month).padStart(2, '0')}-${String(person1.day).padStart(2, '0')}`
      });
    }
  };

  const handlePerson1DateChange = (field: 'day' | 'month' | 'year', val: number) => {
    setPerson1(p => {
      const updated = { ...p, [field]: val };
      setHasPerson1BirthDate(true);
      if (updated.name.trim()) {
        upsertUserDossier({
          fullName: updated.name.trim(),
          gender: updated.gender,
          birthDate: `${updated.year}-${String(updated.month).padStart(2, '0')}-${String(updated.day).padStart(2, '0')}`
        });
      }
      return updated;
    });
  };

  // Chọn một ứng viên tuổi vàng từ gợi ý của thầy bói
  const handleSelectCandidate = (candidate: CandidateIdealYear) => {
    const oppGender = person1.gender === 'nam' ? 'nu' : 'nam';
    setPerson2({
      name: `Người ấy (${candidate.canChi})`,
      gender: oppGender,
      calendarMode: 'solar',
      day: 15,
      month: 6,
      year: candidate.year,
      isLeapMonth: false
    });

    // Cuộn mượt mà xuống phần form cụ thể
    setTimeout(() => {
      specificFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Xử lý chấm điểm
  const handleCalculateMatch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAiAnalysis(null);

    // Tính toán thuật số cổ truyền
    const summary = calculateLoveMatch(person1, person2);
    setMatchSummary(summary);

    // Tự động lưu hồ sơ của cả 2 đương số
    if (person1.name && person1.name.trim()) {
      upsertUserDossier({
        fullName: person1.name.trim(),
        gender: person1.gender,
        birthDate: `${person1.year}-${String(person1.month).padStart(2, '0')}-${String(person1.day).padStart(2, '0')}`,
        canChiYear: summary.person1.canChiYear,
        menhNguHanh: summary.person1.napAm
      });
    }
    if (person2.name && person2.name.trim()) {
      upsertUserDossier({
        fullName: person2.name.trim(),
        gender: person2.gender,
        birthDate: `${person2.year}-${String(person2.month).padStart(2, '0')}-${String(person2.day).padStart(2, '0')}`,
        canChiYear: summary.person2.canChiYear,
        menhNguHanh: summary.person2.napAm
      });
    }

    // AI phân tích chuyên sâu
    const analysis = await analyzeLoveMatchWithGemini(summary);
    setAiAnalysis(analysis);
    setLoading(false);

    // TỰ ĐỘNG LƯU VÀO SỔ TAY VẬN MỆNH (AUTO-SAVE 100%)
    onSaveResult({
      title: `Hợp Duyên: ${summary.person1.name} (${summary.person1.canChiYear}) ♥ ${summary.person2.name} (${summary.person2.canChiYear})`,
      personName: `${summary.person1.name} & ${summary.person2.name}`,
      summary: `Điểm tương hợp: ${summary.totalScore}/100 • ${summary.verdict} • Bản mệnh: ${summary.factors.nguHanh.title}`,
      fullContent: analysis,
      type: 'love_match'
    });
    setSavedSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. BANNER TIÊU ĐỀ & ĐỒNG BỘ HỒ SƠ CHỦ SỰ */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-pink-950/70 border-2 border-rose-400/50 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-rose-400/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Heart className="w-6 h-6 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💍</span>
                <h2 className="font-mystic font-bold text-lg sm:text-xl text-rose-300">
                  Hợp Duyên Tình Cảm & Bát Tự Hôn Nhân
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Khám phá mẫu người bạn đời tương sinh đắc lộc và chấm điểm nhân duyên tiền định.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-400/30">
              {person1.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'}
            </span>
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-400/30">
              Sinh: {person1.day}/{person1.month}/{person1.year}
            </span>
          </div>
        </div>

        {/* Thanh Chỉ Báo Trạng Thái Đồng Bộ Hồ Sơ Đương Số */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-950/80 border border-rose-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-200">
              Đương số: <strong className="text-rose-300 font-bold">{person1.name}</strong>
              {isDossierSynced && (
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 inline-flex items-center gap-1">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Đã đồng bộ từ Hồ sơ / Tử Vi</span>
                </span>
              )}
            </span>
          </div>
          {!hasPerson1BirthDate && (
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Chưa có ngày sinh • Vui lòng bổ sung bên dưới</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. PHẦN MỚI: THẦY BÓI ĐƯA THÔNG TIN NGƯỜI HỢP VỚI ĐƯƠNG SỐ TRƯỚC (PROACTIVE MATCH ADVICE) */}
      {idealAdvice && (
        <div className="bg-gradient-to-br from-slate-950 via-purple-950/60 to-slate-950 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl">
          {/* Header Thầy Phán Mẫu Người Hợp */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/30 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-2xl shadow-lg shadow-amber-500/30">
                🧙‍♂️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                    Lời Thầy Phán Tiền Định
                  </span>
                  <span className="text-xs text-purple-300 font-medium hidden sm:inline">• Thấu Thị Mẫu Người Hợp Mệnh</span>
                </div>
                <h3 className="font-mystic font-bold text-base sm:text-lg text-amber-300 mt-0.5">
                  Mẫu Người Bạn Đời Đại Cát Dành Cho {idealAdvice.userSummary.name}
                </h3>
              </div>
            </div>

            {/* Nút nghe đọc giọng Thầy Bói */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    stopSpeaking();
                  } else {
                    speakFortuneTeller(idealAdvice.fortuneTellerWords);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40'
                }`}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng giọng đọc</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Nghe Thầy Bói Phán</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Lời Giảng Luận Của Thầy Bói */}
          <div className="p-4 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed space-y-2">
            <p className="italic text-purple-200 font-serif-title">
              "Chào <strong className="text-amber-300 not-italic">{idealAdvice.userSummary.name}</strong>, xem tình duyên hôn phối là việc trọng đại cả đời người. 
              Thầy bấm quẻ Bát Tự cho con: Con là <strong className="text-rose-300 not-italic">{idealAdvice.userSummary.gender === 'nam' ? 'Nam' : 'Nữ'} mạng</strong>, 
              tuổi <strong className="text-amber-300 not-italic">{idealAdvice.userSummary.canChiYear}</strong>, 
              bản mệnh <strong className="text-amber-300 not-italic">{idealAdvice.userSummary.napAm}</strong>, 
              Cung Phi ngự tại <strong className="text-purple-300 not-italic">{idealAdvice.userSummary.cungPhi}</strong>."
            </p>
            <p className="text-slate-300">
              Để gia đạo hưng vượng, vợ chồng thuận hòa trăm năm, con nên tìm kiếm người bạn đời hội tụ các yếu tố tương sinh sau:
            </p>
          </div>

          {/* 4 Tiêu Chí Vàng Của Người Hợp Mệnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Tam Hợp / Lục Hợp */}
            <div className="p-3.5 bg-slate-900/90 border border-amber-500/30 rounded-2xl shadow">
              <div className="flex items-center gap-2 mb-1.5 text-amber-300 font-bold text-xs">
                <span>🐉</span>
                <span>Tuổi Địa Chi Cát Tường</span>
              </div>
              <p className="text-xs text-white font-semibold mb-1">
                Tam Hợp: <strong className="text-amber-300">{idealAdvice.idealCriteria.tamHopBranches.join(' • ')}</strong>
              </p>
              <p className="text-xs text-slate-300">
                Lục Hợp: <strong className="text-emerald-300">{idealAdvice.idealCriteria.lucHopBranch}</strong>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Hòa hợp tính khí, cùng chung chí hướng.</p>
            </div>

            {/* 2. Ngũ Hành Tương Sinh */}
            <div className="p-3.5 bg-slate-900/90 border border-rose-500/30 rounded-2xl shadow">
              <div className="flex items-center gap-2 mb-1.5 text-rose-300 font-bold text-xs">
                <span>⚡</span>
                <span>Ngũ Hành Dưỡng Mệnh</span>
              </div>
              <p className="text-xs text-white font-semibold mb-1">
                Hợp nhất: <strong className="text-rose-300">{idealAdvice.idealCriteria.sinhHanhList[0]}</strong>
              </p>
              <p className="text-[11px] text-slate-300">
                Hợp nhì: {idealAdvice.idealCriteria.sinhHanhList.slice(1).join(', ')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Tương trợ sinh khí, đắc tài đắc lộc.</p>
            </div>

            {/* 3. Cung Phi Phối Cát */}
            <div className="p-3.5 bg-slate-900/90 border border-purple-500/30 rounded-2xl shadow">
              <div className="flex items-center gap-2 mb-1.5 text-purple-300 font-bold text-xs">
                <span>🧭</span>
                <span>Cung Phi Bát Trạch</span>
              </div>
              <p className="text-xs text-white font-semibold mb-1">
                Các Cung Sinh Khí / Diên Niên:
              </p>
              <p className="text-[11px] text-purple-200">
                {idealAdvice.idealCriteria.cungPhiGoodList.slice(0, 2).join(' • ')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Con cái hiếu thảo, gia đạo an vui trường thọ.</p>
            </div>

            {/* 4. Thiên Can */}
            <div className="p-3.5 bg-slate-900/90 border border-emerald-500/30 rounded-2xl shadow">
              <div className="flex items-center gap-2 mb-1.5 text-emerald-300 font-bold text-xs">
                <span>🌟</span>
                <span>Thiên Can Tương Hợp</span>
              </div>
              <p className="text-xs text-white font-semibold mb-1">
                Can Hợp: <strong className="text-emerald-300">Can {idealAdvice.idealCriteria.hopCan}</strong>
              </p>
              <p className="text-[11px] text-slate-300">
                Vợ chồng hòa thuận, đồng tâm hiệp lực.
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Gặp khó hóa lành, sự nghiệp hanh thông.</p>
            </div>
          </div>

          {/* Danh Sách Top 5 Năm Sinh Tuổi Vàng Đại Cát Nhất */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h4 className="font-mystic font-bold text-sm text-amber-300">
                  Top Tuổi Vàng Kết Đôi Đại Cát Cho {person1.name} (Chấm điểm sơ bộ Bát Tự):
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 hidden sm:inline">
                Bấm vào tuổi vàng để tự động nạp sang khung chấm chi tiết bên dưới
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
              {idealAdvice.topCandidateYears.map((candidate, idx) => (
                <div
                  key={candidate.year}
                  onClick={() => handleSelectCandidate(candidate)}
                  className="bg-slate-900/80 hover:bg-purple-950/60 border border-amber-400/40 hover:border-amber-300 p-3 rounded-2xl cursor-pointer transition duration-300 flex flex-col justify-between shadow-lg group relative"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold border border-amber-400/40">
                      Top #{idx + 1}
                    </span>
                    <span className="text-xs font-black text-rose-300">
                      {candidate.score}/100 đ
                    </span>
                  </div>

                  <div>
                    <h5 className="font-bold text-white text-sm group-hover:text-amber-300 transition flex items-center gap-1">
                      <span>Năm {candidate.year}</span>
                      <span className="text-xs text-amber-300">({candidate.canChi})</span>
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      {candidate.napAm} • {candidate.ageDiffText}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {candidate.reasons.slice(0, 2).map((r, rIdx) => (
                        <span key={rIdx} className="text-[9px] bg-slate-950/80 text-purple-200 px-1.5 py-0.5 rounded border border-purple-500/20">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-amber-400 font-bold group-hover:text-amber-300">
                    <span>⚡ Chọn tuổi này</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. PHẦN HỎI CỦA THẦY BÓI & FORM NHẬP NGÀY SINH CỤ THỂ */}
      <div 
        ref={specificFormRef}
        className="bg-slate-950/90 border-2 border-rose-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-5"
      >
        {/* Câu Hỏi Tương Tác Của Thầy Bói */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950/80 via-slate-900 to-rose-950/80 border border-amber-400/50 rounded-2xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="text-3xl mt-0.5">🔮</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Thầy Bói Khảo Vấn Đương Số
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Sẵn sàng đặt quẻ
                </span>
              </div>
              <h3 className="font-mystic text-base sm:text-lg font-bold text-white mt-1">
                "Thế hiện tại con đã có ai trong lòng hoặc đang tìm hiểu ai có ngày sinh cụ thể để thầy xem cho không?"
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Hãy điền họ tên và ngày tháng năm sinh của người ấy vào khung bên phải bên dưới, thầy sẽ lập quẻ Bát Tự đối chiếu 4 phương diện và cho lời khuyên cải vận hôn nhân!
              </p>
            </div>
          </div>
        </div>

        {/* CẢNH BÁO NẾU THIẾU NGÀY SINH CỦA NGƯỜI THỨ NHẤT */}
        {!hasPerson1BirthDate && (
          <div className="p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400 text-amber-200 flex items-start gap-2.5 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-amber-300">
                Cần bổ sung Ngày sinh cho người thứ nhất "{person1.name}"
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Chấm điểm tình duyên Bát Tự cần ngày/tháng/năm sinh chính xác để đối chiếu Can Chi và Ngũ Hành Nạp Âm. Xin vui lòng điền ngày sinh ở khung bên trái bên dưới!
              </p>
            </div>
          </div>
        )}

        {/* Form nhập liệu 2 người song song */}
        <form onSubmit={handleCalculateMatch} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THÔNG TIN BÊN 1 (Chủ sự hồ sơ) */}
            <div className={`p-4 bg-slate-900/90 border rounded-2xl space-y-3 shadow-inner transition ${
              !hasPerson1BirthDate ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <h3 className="font-mystic font-bold text-sm text-rose-300">
                    Người Thứ Nhất (Chủ sự hồ sơ)
                  </h3>
                </div>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setPerson1(p => ({ ...p, gender: 'nam' }));
                      setPerson2(p => ({ ...p, gender: 'nu' }));
                      upsertUserDossier({ fullName: person1.name, gender: 'nam' });
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person1.gender === 'nam' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPerson1(p => ({ ...p, gender: 'nu' }));
                      setPerson2(p => ({ ...p, gender: 'nam' }));
                      upsertUserDossier({ fullName: person1.name, gender: 'nu' });
                    }}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person1.gender === 'nu' ? 'bg-pink-500 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tên hoặc biệt danh:</label>
                <input
                  type="text"
                  required
                  value={person1.name}
                  onChange={(e) => handlePerson1NameChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Lựa chọn loại lịch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span>Ngày sinh:</span>
                    {!hasPerson1BirthDate && <span className="text-rose-400 font-bold">* (Cần bổ sung)</span>}
                  </label>
                  <div className="flex gap-2 text-[10px]">
                    <label className="flex items-center gap-1 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="calMode1"
                        checked={person1.calendarMode === 'solar'}
                        onChange={() => setPerson1(p => ({ ...p, calendarMode: 'solar' }))}
                        className="accent-rose-500"
                      />
                      <span>Dương lịch</span>
                    </label>
                    <label className="flex items-center gap-1 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="calMode1"
                        checked={person1.calendarMode === 'lunar'}
                        onChange={() => setPerson1(p => ({ ...p, calendarMode: 'lunar' }))}
                        className="accent-rose-500"
                      />
                      <span>Âm lịch</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={person1.day}
                    onChange={(e) => handlePerson1DateChange('day', parseInt(e.target.value) || 1)}
                    placeholder="Ngày"
                    className="bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={person1.month}
                    onChange={(e) => handlePerson1DateChange('month', parseInt(e.target.value) || 1)}
                    placeholder="Tháng"
                    className="bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={person1.year}
                    onChange={(e) => handlePerson1DateChange('year', parseInt(e.target.value) || 1984)}
                    placeholder="Năm"
                    className="bg-slate-950 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                </div>
              </div>
            </div>

            {/* THÔNG TIN BÊN 2 (Người trong mộng / Đối tượng cụ thể) */}
            <div className="p-4 bg-slate-900/90 border border-pink-500/40 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
                  <h3 className="font-mystic font-bold text-sm text-pink-300">
                    Người Thứ Hai ({person2.gender === 'nu' ? 'Nữ / Người Ấy' : 'Nam / Người Ấy'})
                  </h3>
                </div>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPerson2(p => ({ ...p, gender: 'nam' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person2.gender === 'nam' ? 'bg-rose-500 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerson2(p => ({ ...p, gender: 'nu' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person2.gender === 'nu' ? 'bg-pink-500 text-white' : 'bg-slate-950 text-slate-400'
                    }`}
                  >
                    Nữ
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Tên hoặc biệt danh người ấy:</label>
                <input
                  type="text"
                  required
                  value={person2.name}
                  onChange={(e) => setPerson2(p => ({ ...p, name: e.target.value }))}
                  placeholder="Ví dụ: Bạn Thảo, Anh Hùng..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Lựa chọn loại lịch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400">Ngày sinh người ấy:</label>
                  <div className="flex gap-2 text-[10px]">
                    <label className="flex items-center gap-1 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="calMode2"
                        checked={person2.calendarMode === 'solar'}
                        onChange={() => setPerson2(p => ({ ...p, calendarMode: 'solar' }))}
                        className="accent-pink-500"
                      />
                      <span>Dương lịch</span>
                    </label>
                    <label className="flex items-center gap-1 text-slate-300 cursor-pointer">
                      <input
                        type="radio"
                        name="calMode2"
                        checked={person2.calendarMode === 'lunar'}
                        onChange={() => setPerson2(p => ({ ...p, calendarMode: 'lunar' }))}
                        className="accent-pink-500"
                      />
                      <span>Âm lịch</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={person2.day}
                    onChange={(e) => setPerson2(p => ({ ...p, day: parseInt(e.target.value) || 1 }))}
                    placeholder="Ngày"
                    className="bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={person2.month}
                    onChange={(e) => setPerson2(p => ({ ...p, month: parseInt(e.target.value) || 1 }))}
                    placeholder="Tháng"
                    className="bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={person2.year}
                    onChange={(e) => setPerson2(p => ({ ...p, year: parseInt(e.target.value) || 1988 }))}
                    placeholder="Năm"
                    className="bg-slate-950 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-3.5 px-9 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white flex items-center justify-center gap-2.5 shadow-xl shadow-rose-900/40 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang đối chiếu Ngũ Hành & Cung Phi...</span>
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  <span>Chấm Điểm Tương Hợp Tình Duyên Ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 4. HIỂN THỊ KẾT QUẢ CHẤM ĐIỂM & ĐỐI CHIẾU CHI TIẾT */}
      {matchSummary && (
        <div className="space-y-6">
          {/* BANNER TỔNG ĐIỂM & ĐỐI ỨNG 2 BÊN */}
          <div className="bg-gradient-to-r from-slate-950 via-purple-950/60 to-slate-950 border-2 border-rose-400/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800">
              
              {/* Thẻ Người 1 */}
              <div className="flex-1 w-full p-4 bg-slate-900/80 rounded-2xl border border-rose-500/30 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-rose-300 font-bold block mb-1">
                  {matchSummary.person1.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'}
                </span>
                <h4 className="text-lg font-bold text-white mb-2">{matchSummary.person1.name}</h4>
                <div className="space-y-1 text-xs text-slate-300">
                  <p>📅 Ngày sinh: <strong className="text-rose-200">{matchSummary.person1.solarDate}</strong> (ÂL: {matchSummary.person1.lunarDate})</p>
                  <p>🐉 Tuổi Can Chi: <strong className="text-amber-300">{matchSummary.person1.canChiYear}</strong></p>
                  <p>⚡ Bản Mệnh: <strong className="text-amber-300">{matchSummary.person1.napAm}</strong></p>
                  <p>🧭 Cung Phi: <strong className="text-purple-300">{matchSummary.person1.cungPhi}</strong></p>
                </div>
              </div>

              {/* Vòng Điểm Ở Giữa */}
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-rose-400 bg-gradient-to-br from-rose-950 via-slate-950 to-pink-950 flex flex-col items-center justify-center shadow-xl shadow-rose-500/20">
                  <Heart className="w-5 h-5 text-rose-400 fill-rose-500/50 mb-0.5 animate-pulse" />
                  <span className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-200 to-amber-300 font-mystic">
                    {matchSummary.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">/ 100 Điểm</span>
                </div>
                <span className="mt-2 text-xs font-bold text-rose-300 text-center max-w-[180px]">
                  {matchSummary.verdict}
                </span>
              </div>

              {/* Thẻ Người 2 */}
              <div className="flex-1 w-full p-4 bg-slate-900/80 rounded-2xl border border-pink-500/30 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-pink-300 font-bold block mb-1">
                  {matchSummary.person2.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'}
                </span>
                <h4 className="text-lg font-bold text-white mb-2">{matchSummary.person2.name}</h4>
                <div className="space-y-1 text-xs text-slate-300">
                  <p>📅 Ngày sinh: <strong className="text-pink-200">{matchSummary.person2.solarDate}</strong> (ÂL: {matchSummary.person2.lunarDate})</p>
                  <p>🐉 Tuổi Can Chi: <strong className="text-amber-300">{matchSummary.person2.canChiYear}</strong></p>
                  <p>⚡ Bản Mệnh: <strong className="text-amber-300">{matchSummary.person2.napAm}</strong></p>
                  <p>🧭 Cung Phi: <strong className="text-purple-300">{matchSummary.person2.cungPhi}</strong></p>
                </div>
              </div>

            </div>

            {/* LƯỚI 4 TIÊU CHÍ ĐỐI CHIẾU (NGŨ HÀNH, ĐỊA CHI, CUNG PHI, THIÊN CAN) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {Object.values(matchSummary.factors).map((factor, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 hover:border-rose-400/50 p-4 rounded-2xl transition duration-300 shadow"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <span className="font-mystic font-bold text-xs text-amber-300">{factor.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      factor.status === 'tot' 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : factor.status === 'binh'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-rose-950 text-rose-300 border border-rose-800'
                    }`}>
                      {factor.score}/{factor.maxScore} đ
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-rose-200 mb-1">{factor.title}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{factor.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* BÌNH GIẢI CHI TIẾT TỪ AI ĐẠI SƯ HỢP HÔN (GEMINI 2.5 FLASH) */}
          {aiAnalysis && (
            <div className="bg-slate-950 border-2 border-rose-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-400" />
                  <h3 className="font-mystic text-lg sm:text-xl font-bold text-rose-300">
                    Bình Giải Chi Tiết Của Đại Sư Tình Duyên & Hóa Giải Phong Thủy
                  </h3>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã tự động lưu vào Sổ</span>
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
