import React, { useState, useEffect } from 'react';
import { UserDossier, DivinationRecord } from '../types';
import { 
  buildMasterDestinySynthesis, 
  MasterDestinySynthesis 
} from '../services/masterSynthesisService';
import { generateMasterDestinySynthesisWithGemini } from '../services/geminiService';
import { 
  Sparkles, 
  X, 
  Award, 
  Volume2, 
  VolumeX, 
  Printer, 
  ShieldCheck, 
  Heart, 
  Compass, 
  Binary, 
  Camera, 
  Eye, 
  Hand, 
  Layers, 
  ScrollText, 
  CheckCircle2, 
  Loader2, 
  Sparkle,
  ArrowRight,
  Flame,
  HelpCircle,
  ExternalLink,
  MapPin,
  Clock,
  TrendingUp,
  Milestone
} from 'lucide-react';

interface MasterSynthesisModalProps {
  dossier: UserDossier;
  allRecords?: DivinationRecord[];
  onClose: () => void;
  onNavigateTab?: (tab: any, subMode?: any) => void;
}

export const MasterDestinySynthesisModal: React.FC<MasterSynthesisModalProps> = ({
  dossier,
  allRecords = [],
  onClose,
  onNavigateTab
}) => {
  const [synthesis, setSynthesis] = useState<MasterDestinySynthesis>(() => {
    return buildMasterDestinySynthesis(dossier, allRecords);
  });

  const [aiText, setAiText] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'fourStages' | 'crossDomain' | 'fullArticle' | 'remedy'>('overview');

  // Khởi tạo và nạp phân tích AI sâu rộng
  useEffect(() => {
    const syn = buildMasterDestinySynthesis(dossier, allRecords);
    setSynthesis(syn);

    // Kích hoạt Gemini AI tạo bài đại tổng luận
    let isCancelled = false;
    const fetchAiSynthesis = async () => {
      setLoadingAi(true);
      try {
        const result = await generateMasterDestinySynthesisWithGemini({
          personName: syn.personName,
          gender: syn.gender,
          solarDateStr: syn.solarDateStr,
          lunarDateStr: syn.lunarDateStr,
          canChiYear: syn.canChiYear,
          menhNguHanh: syn.menhNguHanh,
          cuc: syn.cuc,
          cungMenh: syn.cungMenh,
          cungThan: syn.cungThan,
          cungPhi: syn.cungPhi,
          batTrachGroup: syn.batTrachGroup,
          lifePathNumber: syn.numerology?.lifePathNumber,
          hasFace: syn.physiognomy.hasFace,
          hasPalm: syn.physiognomy.hasPalm,
          faceVerdict: syn.physiognomy.faceVerdict,
          palmVerdict: syn.physiognomy.palmVerdict,
          bodyVerdict: syn.physiognomy.bodyVerdict,
          currentAge: syn.currentStageAnalysis.ageAtCapture,
          lunarAge: syn.currentStageAnalysis.lunarAge,
          captureDateStr: syn.currentStageAnalysis.captureDateStr,
          currentStageTitle: syn.currentStageAnalysis.stageTitle,
          stageProgressPercent: syn.currentStageAnalysis.progressPercent,
          tuViThanTransition: syn.currentStageAnalysis.tuViThanTransition,
          facePalmRealtimeReflection: syn.currentStageAnalysis.facePalmRealtimeReflection,
          immediateActionAdvice: syn.currentStageAnalysis.immediateActionAdvice,
          overallScore: syn.overallDestinyScore,
          offlineFallback: syn.synthesisArticle
        });
        if (!isCancelled) {
          setAiText(result);
        }
      } catch (err) {
        console.warn("Lỗi tạo AI Master Synthesis:", err);
        if (!isCancelled) {
          setAiText(syn.synthesisArticle);
        }
      } finally {
        if (!isCancelled) {
          setLoadingAi(false);
        }
      }
    };

    fetchAiSynthesis();

    return () => {
      isCancelled = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [dossier.id, dossier.fullName, dossier.birthDate, dossier.faceImage, dossier.palmImage]);

  // Giọng đọc thầy bói
  const speakVoice = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const clean = textToSpeak
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓🌱⚔️⚡👑📍]/g, ' ')
        .replace(/═+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(clean);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      utterance.onstart = () => setIsVoiceSpeaking(true);
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

  // In hoặc xuất bản thư
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative max-w-5xl w-full bg-slate-900/95 border-2 border-amber-400/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.25)] space-y-5 max-h-[92vh] overflow-y-auto"
      >
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER: ĐẠI TỔNG LUẬN VẬN MỆNH */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/30 pb-5">
          <div className="flex items-start gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/30 shrink-0">
              ☯
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                  <span>Đại Tổng Luận Vận Mệnh Toàn Thư</span>
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {synthesis.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Mệnh {synthesis.menhNguHanh}
                </span>
              </div>
              <h2 className="font-mystic text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 mt-1">
                {synthesis.personName} • Hội Tụ Tiên Thiên & Hậu Thiên
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Sinh: {synthesis.solarDateStr} (Dương) • {synthesis.lunarDateStr} • Cung Phi {synthesis.cungPhi} ({synthesis.batTrachGroup})
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                if (isVoiceSpeaking) {
                  stopVoice();
                } else {
                  speakVoice(aiText || synthesis.synthesisArticle);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow ${
                isVoiceSpeaking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/40'
              }`}
            >
              {isVoiceSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Dừng đọc</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe Đạo Sĩ Phán</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition shadow active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>In Bản Thư</span>
            </button>
          </div>
        </div>

        {/* 4 PHÂN KHU HỘI TỤ (THE 4 PILLARS OF EVIDENCE) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* 1. Tử Vi */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-amber-500/30 shadow">
            <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
              <ScrollText className="w-3.5 h-3.5" />
              <span>1. Tử Vi Tiên Thiên</span>
            </div>
            <p className="text-xs text-white font-semibold">Mệnh: {synthesis.cungMenh}</p>
            <p className="text-[11px] text-slate-400">Thân: {synthesis.cungThan} • Cục: {synthesis.cuc}</p>
          </div>

          {/* 2. Tướng Pháp */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-purple-500/30 shadow">
            <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold mb-1">
              <Camera className="w-3.5 h-3.5" />
              <span>2. Tướng Pháp Hậu Thiên</span>
            </div>
            <p className="text-xs text-white font-semibold">
              {synthesis.physiognomy.hasFace && synthesis.physiognomy.hasPalm ? 'Đủ Mặt & Chỉ Tay' : synthesis.physiognomy.hasFace ? 'Đã có Tướng Mặt' : synthesis.physiognomy.hasPalm ? 'Đã có Chỉ Tay' : 'Chưa chụp ảnh'}
            </p>
            <p className="text-[11px] text-slate-400">Tam Đình & Ba Đại Lộ</p>
          </div>

          {/* 3. Thần Số Học */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-indigo-500/30 shadow">
            <div className="flex items-center gap-1.5 text-indigo-300 text-xs font-bold mb-1">
              <Binary className="w-3.5 h-3.5" />
              <span>3. Thần Số Học Vũ Trụ</span>
            </div>
            <p className="text-xs text-white font-semibold">
              Số Chủ Đạo: <strong className="text-indigo-300">{synthesis.numerology?.lifePathNumber}</strong>
              {synthesis.numerology?.isMaster22 && ' (Master 22/4)'}
            </p>
            <p className="text-[11px] text-slate-400">Số Linh Hồn: {synthesis.numerology?.soulUrgeNumber}</p>
          </div>

          {/* 4. Bát Trạch */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/30 shadow">
            <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>4. Địa Khí Bát Trạch</span>
            </div>
            <p className="text-xs text-white font-semibold">Cung {synthesis.cungPhi} ({synthesis.batTrachGroup})</p>
            <p className="text-[11px] text-slate-400">Cát: {synthesis.fengShui.luckyDirections[0].split(' ')[0]}</p>
          </div>
        </div>

        {/* THANH ĐIỀU HƯỚNG MỤC TỔNG LUẬN (5 TABS) */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'overview'
                ? 'bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-400/20'
                : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>1. Thước Đo 5 Trục</span>
          </button>

          <button
            onClick={() => setActiveSection('fourStages')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'fourStages'
                ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                : 'bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>2. 4 Giai Đoạn & Tọa Độ Thời Điểm Chụp Ảnh</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </button>

          <button
            onClick={() => setActiveSection('crossDomain')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'crossDomain'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-purple-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>3. Đối Chiếu Tiên Thiên & Hậu Thiên</span>
          </button>

          <button
            onClick={() => setActiveSection('fullArticle')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'fullArticle'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-rose-200 border border-slate-800'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>4. Toàn Văn Đại Tổng Luận (AI)</span>
            {loadingAi && <Loader2 className="w-3 h-3 animate-spin text-amber-300" />}
          </button>

          <button
            onClick={() => setActiveSection('remedy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSection === 'remedy'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-black shadow-lg'
                : 'bg-slate-950 text-slate-400 hover:text-emerald-200 border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>5. Tứ Trụ Cải Vận</span>
          </button>
        </div>

        {/* SECTION 1: 5 TRỤC ĐỊNH MỆNH TỔNG HÒA */}
        {activeSection === 'overview' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Banner Điểm Định Mệnh Trung Tâm */}
            <div className="bg-gradient-to-r from-slate-950 via-purple-950/60 to-slate-950 border-2 border-amber-400/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-400 bg-gradient-to-br from-amber-950 via-slate-950 to-purple-950 flex flex-col items-center justify-center shadow-xl shadow-amber-500/20 shrink-0">
                  <Sparkle className="w-5 h-5 text-amber-400 animate-spin mb-0.5" />
                  <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-300 font-mystic">
                    {synthesis.overallDestinyScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">/ 100 ĐIỂM</span>
                </div>
                <div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase font-bold tracking-wider">
                    Chỉ Số Định Mệnh Tổng Hòa
                  </span>
                  <h3 className="font-mystic font-bold text-base sm:text-lg text-amber-200 mt-1">
                    {synthesis.overallVerdict}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    Được tính toán dựa trên sự tổng hòa ma trận giữa lá số Tử Vi, tướng mạo, tần số rung động Pythagoras và trường khí phong thủy Bát Trạch.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => setActiveSection('fourStages')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
                >
                  <MapPin className="w-4 h-4 text-slate-950" />
                  <span>Xem Tọa Độ Thời Điểm Chụp Ảnh</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Banner: Tọa Độ Hiện Tại của Đương Số */}
            <div 
              onClick={() => setActiveSection('fourStages')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-400/40 flex items-center justify-between gap-3 cursor-pointer hover:border-amber-400 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Tọa Độ Thời Khắc Chụp Ảnh:</span>
                  <p className="text-xs font-semibold text-slate-100">
                    {synthesis.personName} đang ở độ tuổi <strong>{synthesis.currentStageAnalysis.ageAtCapture}</strong> ({synthesis.currentStageAnalysis.lunarAge} tuổi mụ) — Ngự tại chặng <strong>{synthesis.currentStageAnalysis.stageTitle}</strong>
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-300 font-bold flex items-center gap-1 shrink-0">
                <span>Khám phá 4 giai đoạn</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 5 Thanh Chỉ Số Chi Tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {synthesis.destinyScores.map((scoreItem, idx) => (
                <div 
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/40 transition shadow space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{scoreItem.icon}</span>
                      <h4 className="font-mystic font-bold text-xs sm:text-sm text-slate-100">{scoreItem.category}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-amber-300">{scoreItem.score}/100 đ</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full bg-gradient-to-r ${scoreItem.color} rounded-full transition-all duration-1000`} 
                      style={{ width: `${scoreItem.score}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-semibold">{scoreItem.level}</span>
                    <span className="text-slate-400 italic">{scoreItem.highlight}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-1 border-t border-slate-900">
                    {scoreItem.deepAnalysis}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 2: 4 GIAI ĐOẠN ĐỊNH MỆNH & TỌA ĐỘ THỜI ĐIỂM CHỤP ẢNH */}
        {activeSection === 'fourStages' && (
          <div className="space-y-5 animate-fadeIn">
            {/* 1. HERO BOX: TỌA ĐỘ VẬN MỆNH TẠI THỜI KHẮC CHỤP ẢNH */}
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-950/60 via-purple-950/80 to-slate-950 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.25)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-500/30">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/30 shrink-0">
                    <MapPin className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow">
                        <Sparkle className="w-3 h-3 text-slate-950 animate-spin" />
                        <span>Tọa Độ Định Mệnh Hiện Tại</span>
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                        {synthesis.currentStageAnalysis.ageAtCapture} Tuổi Dương • {synthesis.currentStageAnalysis.lunarAge} Tuổi Mụ
                      </span>
                      <span className="text-xs text-slate-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Lưu ảnh: {synthesis.currentStageAnalysis.captureDateStr}</span>
                      </span>
                    </div>
                    <h3 className="font-mystic text-lg sm:text-xl font-black text-amber-200 mt-1">
                      Đang Ngự Tại: {synthesis.currentStageAnalysis.stageTitle}
                    </h3>
                  </div>
                </div>

                <div className="shrink-0 bg-slate-950/80 border border-amber-400/40 rounded-2xl p-3 px-4 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tiến Trình Dòng Đời</span>
                  <span className="font-mystic text-xl font-black text-amber-300">
                    ~{synthesis.currentStageAnalysis.progressPercent}%
                  </span>
                  <span className="text-[10px] text-slate-400 block">hành trình nhân sinh</span>
                </div>
              </div>

              {/* TIMELINE THANH TIẾN TRÌNH DÒNG ĐỜI (0 - 80+ TUỔI) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Milestone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hành Trình Nhân Sinh 4 Chặng Đường</span>
                  </span>
                  <span className="text-amber-300 font-bold">
                    📍 Vị trí của bạn: {synthesis.currentStageAnalysis.ageAtCapture} tuổi
                  </span>
                </div>

                {/* Multi-segment progress track */}
                <div className="relative w-full h-4 bg-slate-900 rounded-full p-0.5 border border-slate-700 overflow-hidden flex">
                  {/* Segment 1: 0 - 18 (22.5%) */}
                  <div className="h-full bg-sky-600/70 border-r border-slate-800" style={{ width: '22.5%' }} title="Khởi Sinh (0-18t)" />
                  {/* Segment 2: 19 - 30 (15%) */}
                  <div className="h-full bg-amber-600/70 border-r border-slate-800" style={{ width: '15%' }} title="Tu Luyện (19-30t)" />
                  {/* Segment 3: 31 - 50 (25%) */}
                  <div className="h-full bg-purple-600/70 border-r border-slate-800" style={{ width: '25%' }} title="Thực Chiến (31-50t)" />
                  {/* Segment 4: 51+ (37.5%) */}
                  <div className="h-full bg-emerald-600/70" style={{ width: '37.5%' }} title="Hậu Vận (51t+)" />

                  {/* Marker Pin at current progress */}
                  <div 
                    className="absolute top-0 bottom-0 w-2.5 bg-yellow-300 border-2 border-slate-950 rounded-full shadow-[0_0_12px_#fbbf24] animate-pulse"
                    style={{ left: `calc(${synthesis.currentStageAnalysis.progressPercent}% - 5px)` }}
                  />
                </div>

                {/* Sub-labels below progress track */}
                <div className="grid grid-cols-4 gap-1 text-[11px] pt-1">
                  <div className={`text-center ${synthesis.currentStageAnalysis.stageKey === 'khoiSinh' ? 'text-sky-300 font-black' : 'text-slate-400'}`}>
                    🌱 0-18t: Khởi Sinh
                  </div>
                  <div className={`text-center ${synthesis.currentStageAnalysis.stageKey === 'tuLuyen' ? 'text-amber-300 font-black' : 'text-slate-400'}`}>
                    ⚔️ 19-30t: Tu Luyện
                  </div>
                  <div className={`text-center ${synthesis.currentStageAnalysis.stageKey === 'thucChien' ? 'text-purple-300 font-black' : 'text-slate-400'}`}>
                    ⚡ 31-50t: Thực Chiến
                  </div>
                  <div className={`text-center ${synthesis.currentStageAnalysis.stageKey === 'hauVan' ? 'text-emerald-300 font-black' : 'text-slate-400'}`}>
                    👑 51t+: Hậu Vận
                  </div>
                </div>
              </div>

              {/* 2. NHẬN ĐỊNH SÂU TẠI THỜI ĐIỂM CHỤP ẢNH */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                {/* Cột 1: Khí Sắc & Tướng Mạo Thời Khắc Chụp Ảnh */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/40 space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <Camera className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-200">Khí Sắc & Tướng Mạo Thời Điểm Chụp</span>
                  </div>
                  
                  {/* Thumbnails */}
                  {(synthesis.physiognomy.faceImage || synthesis.physiognomy.palmImage) && (
                    <div className="flex items-center gap-2 py-1">
                      {synthesis.physiognomy.faceImage && (
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          <img src={synthesis.physiognomy.faceImage} alt="Mặt" className="w-7 h-7 rounded-md object-cover border border-amber-400" />
                          <span className="text-[10px] text-slate-300">Tướng Mặt</span>
                        </div>
                      )}
                      {synthesis.physiognomy.palmImage && (
                        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          <img src={synthesis.physiognomy.palmImage} alt="Chỉ tay" className="w-7 h-7 rounded-md object-cover border border-purple-400" />
                          <span className="text-[10px] text-slate-300">Chỉ Tay</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {synthesis.currentStageAnalysis.facePalmRealtimeReflection}
                  </p>
                </div>

                {/* Cột 2: Bước Ngoặt Chuyển Giao Tử Vi (Mệnh -> Thân) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-400/40 space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <ScrollText className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-purple-200">Chuyển Giao Tử Vi (Mệnh ➔ Thân)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-purple-300 font-semibold">
                    <span>Mệnh: {synthesis.cungMenh}</span>
                    <span>➔</span>
                    <span>Thân: {synthesis.cungThan}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {synthesis.currentStageAnalysis.tuViThanTransition}
                  </p>
                </div>

                {/* Cột 3: Kim Chỉ Nam Hành Động Tức Thời */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-400/40 space-y-2">
                  <div className="flex items-center gap-2 pb-1.5 border-b border-slate-800">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-200">Kim Chỉ Nam Tại Giao Điểm Này</span>
                  </div>
                  <p className="text-xs text-emerald-200 font-semibold leading-relaxed">
                    ⚡ {synthesis.currentStageAnalysis.immediateActionAdvice}
                  </p>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                    🎯 Bước kế tiếp: {synthesis.currentStageAnalysis.nextStagePreparation}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. LƯỚI CHI TIẾT 4 ĐẠI GIAI ĐOẠN ĐỊNH MỆNH */}
            <div className="space-y-3 pt-2">
              <h4 className="font-mystic font-bold text-sm sm:text-base text-amber-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Chi Tiết Bốn Đại Giai Đoạn Vận Mệnh Trọn Đời</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {synthesis.fourLifeStages.map((stage) => {
                  const isCurrent = stage.isCurrentStage;
                  return (
                    <div 
                      key={stage.stageKey}
                      className={`relative p-4 sm:p-5 rounded-2xl transition-all duration-300 space-y-3 ${
                        isCurrent 
                          ? 'bg-slate-900 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50' 
                          : 'bg-slate-950/80 border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Badge if current */}
                      {isCurrent && (
                        <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-950" />
                          <span>Bạn Đang Ở Đây ({synthesis.currentStageAnalysis.ageAtCapture} Tuổi)</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">{stage.icon}</span>
                          <div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${stage.badgeColor}`}>
                              {stage.ageRange}
                            </span>
                            <h5 className="font-mystic font-bold text-sm sm:text-base text-white mt-1">
                              {stage.title}
                            </h5>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-amber-200/90 italic font-medium">
                        "{stage.theme}"
                      </p>

                      <div className="space-y-2 text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                        <div className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold shrink-0">☯ Tử Vi:</span>
                          <span className="leading-relaxed">{stage.tuViAspect}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-purple-400 font-bold shrink-0">👁️ Tướng Pháp:</span>
                          <span className="leading-relaxed">{stage.physiognomyAspect}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold shrink-0">💡 Diệu Pháp:</span>
                          <span className="leading-relaxed">{stage.remedyAdvice}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ĐỐI CHIẾU TIÊN THIÊN & HẬU THIÊN */}
        {activeSection === 'crossDomain' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Box 1: Tử Vi vs Tướng Mạo */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-purple-500/40 shadow space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-mystic font-bold text-sm text-purple-300 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-400" />
                  <span>1. Tử Vi (Tiên Thiên) Soi Chiếu Cùng Nhân Tướng & Chỉ Tay (Hậu Thiên)</span>
                </h4>
                {synthesis.physiognomy.hasFace && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 font-bold">
                    ✓ Đã có ảnh thực tế
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {synthesis.crossDomainInsights.tuViVsPhysiognomy}
              </p>

              {/* Hiển thị ảnh chụp nếu có */}
              {(synthesis.physiognomy.faceImage || synthesis.physiognomy.palmImage) && (
                <div className="flex items-center gap-3 pt-2">
                  {synthesis.physiognomy.faceImage && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <img src={synthesis.physiognomy.faceImage} alt="Mặt" className="w-10 h-10 rounded-lg object-cover border border-amber-400" />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-200 block">Tướng Mặt</span>
                        <span className="text-slate-400">Đã lưu hồ sơ</span>
                      </div>
                    </div>
                  )}
                  {synthesis.physiognomy.palmImage && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                      <img src={synthesis.physiognomy.palmImage} alt="Chỉ tay" className="w-10 h-10 rounded-lg object-cover border border-purple-400" />
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-200 block">Chỉ Tay ({dossier.palmSide === 'right' ? 'Phải' : 'Trái'})</span>
                        <span className="text-slate-400">Đã lưu hồ sơ</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Box 2: Tử Vi vs Thần Số Học */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/40 shadow space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-mystic font-bold text-sm text-indigo-300 flex items-center gap-2">
                  <Binary className="w-4 h-4 text-indigo-400" />
                  <span>2. Bản Mệnh Tử Vi & Con Số Sứ Mệnh Pythagoras</span>
                </h4>
                <span className="text-xs font-bold text-amber-300">
                  Số Chủ Đạo {synthesis.numerology?.lifePathNumber}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {synthesis.crossDomainInsights.tuViVsNumerology}
              </p>
            </div>

            {/* Box 3: Bát Trạch & Địa Khí */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/40 shadow space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-mystic font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>3. Phong Thủy Bát Trạch Hóa Giải Vận Hạn & Đón Tài Lộc</span>
                </h4>
                <span className="text-xs font-bold text-emerald-300">
                  Cung {synthesis.cungPhi} ({synthesis.batTrachGroup})
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {synthesis.crossDomainInsights.fengShuiHarmonization}
              </p>
            </div>

            {/* Box 4: Đức Năng Thắng Số */}
            <div className="p-4 rounded-2xl bg-slate-950/90 border border-amber-500/40 shadow space-y-2">
              <h4 className="font-mystic font-bold text-sm text-amber-300 flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkle className="w-4 h-4 text-amber-400" />
                <span>4. Đức Năng Thắng Số & Tướng Tùng Tâm Sinh</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {synthesis.crossDomainInsights.karmaAndFreeWill}
              </p>
            </div>
          </div>
        )}

        {/* SECTION 4: TOÀN VĂN ĐẠI TỔNG LUẬN TỪ GEMINI AI */}
        {activeSection === 'fullArticle' && (
          <div className="space-y-4 animate-fadeIn">
            {loadingAi ? (
              <div className="p-10 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col items-center justify-center gap-3 text-center">
                <Loader2 className="w-9 h-9 text-amber-400 animate-spin" />
                <p className="text-sm text-amber-200 font-mystic font-semibold tracking-wide">
                  Chưởng Môn Thiên Cơ Các đang thấu thị toàn bộ hồ sơ (Tử Vi, Tướng Mạo, Thần Số, Bát Trạch và Tọa Độ Thời Điểm Chụp Ảnh) để chấp bút bài Đại Tổng Luận...
                </p>
              </div>
            ) : (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-amber-400/40 shadow-xl space-y-4 text-sm text-slate-200 leading-relaxed whitespace-pre-line font-serif-title">
                {aiText || synthesis.synthesisArticle}
              </div>
            )}
          </div>
        )}

        {/* SECTION 5: TỨ TRỤ CẢI VẬN TOÀN THƯ */}
        {activeSection === 'remedy' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 shadow">
              <h4 className="font-mystic font-bold text-emerald-300 text-sm sm:text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Tứ Trụ Cải Vận Toàn Thư (Kim Chỉ Nam Hành Động)</span>
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Số mệnh do trời định nhưng Phúc vận do người tạo. Bốn phương pháp rèn luyện toàn diện để đương số đón cát tránh hung:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Tu Thân */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-yellow-500/30 shadow space-y-2">
                <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs sm:text-sm">
                  <span>🧘</span>
                  <span>1. TU THÂN (Phong Thái & Cốt Cách)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {synthesis.fourPillarsRemedy.tuThan}
                </p>
              </div>

              {/* 2. Dưỡng Tâm */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-rose-500/30 shadow space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                  <span>❤️</span>
                  <span>2. DƯỠNG TÂM (Phước Đức & Thiện Lành)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {synthesis.fourPillarsRemedy.duongTam}
                </p>
              </div>

              {/* 3. Luyện Trí */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-500/30 shadow space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                  <span>🧠</span>
                  <span>3. LUYỆN TRÍ (Trí Tuệ & Sứ Mệnh Số Học)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {synthesis.fourPillarsRemedy.luyenTri}
                </p>
              </div>

              {/* 4. Tụ Khí */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-emerald-500/30 shadow space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                  <span>🧭</span>
                  <span>4. TỤ KHÍ (Phong Thủy Bát Trạch & Địa Lợi)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {synthesis.fourPillarsRemedy.tuKhi}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
