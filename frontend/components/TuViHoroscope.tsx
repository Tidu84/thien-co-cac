import React, { useState, useEffect } from 'react';
import { TuViProfile, TuViPalace } from '../types';
import { 
  PALACES, 
  TERRESTRIAL_BRANCHES, 
  calculateMenhThanPalaces, 
  calculateCuc 
} from '../constants';
import { convertSolar2Lunar, convertLunar2Solar, LunarDateResult } from '../services/lunarCalendar';
import { analyzeTuViWithGemini } from '../services/geminiService';
import { 
  Sparkles, 
  BookmarkPlus, 
  Loader2, 
  Award, 
  Volume2, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ScrollText, 
  Briefcase, 
  Heart, 
  AlertTriangle, 
  Sparkle,
  Flame,
  VolumeX,
  Play
} from 'lucide-react';

interface TuViProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'tuvi' }) => void;
}

// Cấu trúc phân mục bình giải
interface ParsedTuViSections {
  thayPhan: string;
  banMenh: string;
  congDanh: string;
  tinhDuyen: string;
  vanHan: string;
  nhanXet: string;
}

export const TuViHoroscope: React.FC<TuViProps> = ({ onSaveResult }) => {
  const [calendarMode, setCalendarMode] = useState<'solar' | 'lunar'>('solar');

  // Mặc định mẫu 10/10/1984 Giáp Tý (Hải Trung Kim)
  const [solarDay, setSolarDay] = useState<number>(10);
  const [solarMonth, setSolarMonth] = useState<number>(10);
  const [solarYear, setSolarYear] = useState<number>(1984);

  const [lunarDay, setLunarDay] = useState<number>(16);
  const [lunarMonth, setLunarMonth] = useState<number>(9);
  const [lunarYear, setLunarYear] = useState<number>(1984);
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);

  const [astronomyData, setAstronomyData] = useState<LunarDateResult | null>(null);

  const [fullName, setFullName] = useState('Đương Số Giáp Tý');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [birthHour, setBirthHour] = useState('Thìn (07h00 - 09h00)');

  // Trạng thái giọng nói & UI
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [currentlySpeakingSection, setCurrentlySpeakingSection] = useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [parsedSections, setParsedSections] = useState<ParsedTuViSections | null>(null);
  const [activeTopic, setActiveTopic] = useState<'thayPhan' | 'banMenh' | 'congDanh' | 'tinhDuyen' | 'vanHan' | 'nhanXet'>('thayPhan');

  const [palaces, setPalaces] = useState<TuViPalace[]>([]);
  const [profileSummary, setProfileSummary] = useState<TuViProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const askQuestionScript = "Bạn sinh ngày Dương lịch hay Âm lịch? Hãy chọn bên dưới, ta sẽ tự động chuyển đổi ngày sóc, tháng nhuận và tính Can Chi chuẩn xác để an sao lá số cho bạn nhé!";

  // Phát âm giọng thầy bói
  const speakVoice = (text: string, sectionKey?: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const cleanVoiceText = text
        .replace(/\[\/?(THAY_PHAN|BAN_MENH|CONG_DANH|TINH_DUYEN|VAN_HAN|NHAN_XET)\]/g, ' ')
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

      utterance.onstart = () => {
        setIsVoiceSpeaking(true);
        if (sectionKey) setCurrentlySpeakingSection(sectionKey);
      };
      utterance.onend = () => {
        setIsVoiceSpeaking(false);
        setCurrentlySpeakingSection(null);
      };
      utterance.onerror = () => {
        setIsVoiceSpeaking(false);
        setCurrentlySpeakingSection(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
      setCurrentlySpeakingSection(null);
    }
  };

  // Tự động chuyển đổi Âm - Dương
  useEffect(() => {
    if (calendarMode === 'solar') {
      try {
        const conv = convertSolar2Lunar(solarDay, solarMonth, solarYear);
        setLunarDay(conv.lunarDay);
        setLunarMonth(conv.lunarMonth);
        setLunarYear(conv.lunarYear);
        setIsLeapMonth(conv.isLeap);
        setAstronomyData(conv);
      } catch (err) {
        console.error("Solar to Lunar error:", err);
      }
    }
  }, [solarDay, solarMonth, solarYear, calendarMode]);

  const handleLunarChange = (d: number, m: number, y: number, leap: boolean) => {
    setLunarDay(d);
    setLunarMonth(m);
    setLunarYear(y);
    setIsLeapMonth(leap);
    try {
      const conv = convertLunar2Solar(d, m, y, leap);
      setSolarDay(conv.day);
      setSolarMonth(conv.month);
      setSolarYear(conv.year);
      const full = convertSolar2Lunar(conv.day, conv.month, conv.year);
      setAstronomyData(full);
    } catch (err) {
      console.error("Lunar to Solar error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speakVoice(askQuestionScript);
    }, 400);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const getHourBranchIndex = (hourStr: string): number => {
    const branchName = hourStr.split(' ')[0];
    const idx = TERRESTRIAL_BRANCHES.indexOf(branchName);
    return idx >= 0 ? idx : 4;
  };

  // Tách text thô từ Gemini thành 6 phần nhỏ độc lập
  const parseSections = (rawText: string): ParsedTuViSections => {
    const extract = (tag: string, fallback: string): string => {
      const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
      const match = rawText.match(regex);
      return match ? match[1].trim() : fallback;
    };

    return {
      thayPhan: extract('THAY_PHAN', 'Bản mệnh vững vàng tựa thái sơn,\nVượt qua thử thách rạng danh thơm.\nTâm lành tích đức duyên may tới,\nPhú quý vinh hoa đắc cát tường.'),
      banMenh: extract('BAN_MENH', 'Bản mệnh đắc ngũ hành vượng khí, tư chất thông minh, tính tình khẳng khái và coi trọng chữ tín trong giao tế.'),
      congDanh: extract('CONG_DANH', 'Sự nghiệp thăng hoa khi làm việc có tổ chức, tiền tài tích lũy vững bền theo thời gian.'),
      tinhDuyen: extract('TINH_DUYEN', 'Đường tình cảm ban đầu trải qua thử thách để thấu hiểu, hậu vận vợ chồng hòa thuận, đồng lòng xây dựng cơ nghiệp.'),
      vanHan: extract('VAN_HAN', 'Vận khí năm nay có bước chuyển mình tích cực. Cần chú ý giữ hòa khí và kiểm tra kỹ giấy tờ đầu tư.'),
      nhanXet: extract('NHAN_XET', 'Thầy bói nhận xét: Đương số có phúc khí tiềm tàng. Lấy nhẫn nhịn và thiện tâm làm gốc thì trăm sự đều thành cát lợi.')
    };
  };

  // LẬP LÁ SỐ VÀ BÌNH GIẢI
  const handleGenerateChart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const currentConv = astronomyData || convertSolar2Lunar(solarDay, solarMonth, solarYear);
    const solarStr = `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`;
    const lunarStr = `${currentConv.lunarDay}/${currentConv.lunarMonth}/${currentConv.lunarYear}${currentConv.isLeap ? ' (Nhuận)' : ''}`;

    const hourIdx = getHourBranchIndex(birthHour);
    const { cungMenh, cungThan, menhBranchIndex } = calculateMenhThanPalaces(currentConv.lunarMonth, hourIdx);
    const calculatedCuc = calculateCuc(currentConv.lunarYear, menhBranchIndex);

    const samplePalaces: TuViPalace[] = PALACES.map((pName, idx) => {
      const palaceBranchIdx = (menhBranchIndex + idx) % 12;
      const branchName = TERRESTRIAL_BRANCHES[palaceBranchIdx];
      const luck = 70 + ((currentConv.lunarYear + idx * 7 + currentConv.lunarDay) % 28);
      
      const starSets = [
        ["Tử Vi (Miếu)", "Thiên Phủ (Vượng)", "Hóa Khoa", "Tả Phụ"],
        ["Vũ Khúc (Vượng)", "Thiên Tướng (Đắc)", "Văn Xương", "Thiên Khôi"],
        ["Thái Dương (Miếu)", "Cự Môn (Hãm)", "Hóa Lộc", "Lộc Tồn"],
        ["Liêm Trinh (Đắc)", "Thất Sát (Vượng)", "Thiên Mã", "Long Trì"],
        ["Thiên Đồng (Vượng)", "Thiên Lương (Miếu)", "Hóa Quyền", "Phượng Các"],
        ["Thái Âm (Miếu)", "Hóa Kỵ", "Hữu Bật", "Thiên Việt"]
      ];

      return {
        name: pName,
        stars: starSets[idx % starSets.length],
        luckScore: luck,
        description: `Tọa thủ tại cung ${branchName}, đắc hội cát tinh chủ quản.`
      };
    });

    const summary: TuViProfile = {
      fullName,
      gender,
      solarDate: solarStr,
      lunarDate: lunarStr,
      isLeapMonth: currentConv.isLeap,
      birthHour,
      calendarType: calendarMode,
      canChiYear: currentConv.canChiYear,
      canChiMonth: currentConv.canChiMonth,
      canChiDay: currentConv.canChiDay,
      menhNguHanh: currentConv.napAm,
      cuc: calculatedCuc,
      cungMenh: cungMenh,
      cungThan: cungThan
    };

    setPalaces(samplePalaces);
    setProfileSummary(summary);
    setHasAutoFilled(true);

    const aiAnalysis = await analyzeTuViWithGemini(
      fullName,
      gender,
      solarStr,
      lunarStr,
      birthHour,
      cungMenh,
      cungThan,
      currentConv.napAm,
      calculatedCuc,
      currentConv.canChiDay,
      currentConv.canChiMonth,
      currentConv.canChiYear
    );

    setReadingResult(aiAnalysis);
    const parsed = parseSections(aiAnalysis);
    setParsedSections(parsed);
    setActiveTopic('thayPhan');
    setLoading(false);

    // Thầy bói tự động phán lời khẩu quyết đầu tiên
    const thayPhanSpeech = `Thầy bói phán cho đương số tuổi ${currentConv.canChiYear}, bản mệnh ${currentConv.napAm}: ${parsed.thayPhan}`;
    speakVoice(thayPhanSpeech, 'thayPhan');
  };

  const handleSave = () => {
    if (!readingResult || !profileSummary) return;
    onSaveResult({
      title: `Lá Số Tử Vi: ${profileSummary.fullName} (${profileSummary.canChiYear} - ${profileSummary.menhNguHanh})`,
      summary: `Dương lịch: ${profileSummary.solarDate} • Âm lịch: ${profileSummary.lunarDate} • Cung Mệnh: ${profileSummary.cungMenh} (${profileSummary.cuc})`,
      fullContent: readingResult,
      type: 'tuvi'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleQuickSample1984 = () => {
    setCalendarMode('solar');
    setSolarDay(10);
    setSolarMonth(10);
    setSolarYear(1984);
    setFullName('Đương Số Giáp Tý');
    setGender('nam');
  };

  // Danh sách các tab phân mục bình giải
  const topicsList = [
    { id: 'thayPhan', label: 'Lời Thầy Phán', icon: ScrollText, color: 'text-amber-400 border-amber-400/50 bg-amber-500/10' },
    { id: 'banMenh', label: 'Bản Mệnh & Tính Cách', icon: Sparkle, color: 'text-yellow-300 border-yellow-400/50 bg-yellow-500/10' },
    { id: 'congDanh', label: 'Tài Lộc & Công Danh', icon: Briefcase, color: 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10' },
    { id: 'tinhDuyen', label: 'Tình Duyên & Phu Thê', icon: Heart, color: 'text-rose-400 border-rose-400/50 bg-rose-500/10' },
    { id: 'vanHan', label: 'Vận Hạn Năm Nay', icon: AlertTriangle, color: 'text-orange-400 border-orange-400/50 bg-orange-500/10' },
    { id: 'nhanXet', label: 'Thầy Nhận Xét & Cải Mệnh', icon: Flame, color: 'text-purple-300 border-purple-400/50 bg-purple-500/10' }
  ];

  return (
    <div className="space-y-6">
      {/* KHUNG BỘ CHUYỂN ĐỔI LỊCH ÂM DƯƠNG & TỰ ĐỘNG AN SAO */}
      <div className="bg-gradient-to-r from-amber-500/20 via-purple-950/60 to-amber-500/20 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between pb-4 border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-lg relative bg-slate-900">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                alt="Thầy bói"
                className="w-full h-full object-cover"
              />
              {isVoiceSpeaking && (
                <div className="absolute inset-0 bg-amber-400/20 animate-pulse flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-amber-300 animate-bounce" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">☯</span>
                <h3 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
                  Bộ Chuyển Đổi Lịch Âm Dương & Tử Vi Thiên Văn
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Quy đổi tự động ngày Sóc, tháng Nhuận, Can Chi để an Cung Mệnh Thân chuẩn xác.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleQuickSample1984}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 transition active:scale-95"
            >
              Mẫu: 10/10/1984 (Hải Trung Kim)
            </button>
            <button
              onClick={() => speakVoice(askQuestionScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 shadow active:scale-95 transition"
            >
              <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isVoiceSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isVoiceSpeaking ? 'Đang hỏi...' : 'Nghe thầy hỏi'}</span>
            </button>
          </div>
        </div>

        {/* Tab chọn Dương lịch / Âm lịch */}
        <div className="mt-5 flex justify-center">
          <div className="bg-slate-950 p-1 rounded-2xl border border-amber-400/40 flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setCalendarMode('solar')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                calendarMode === 'solar'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Nhập Theo Dương Lịch</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('lunar')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                calendarMode === 'lunar'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Nhập Theo Âm Lịch</span>
            </button>
          </div>
        </div>

        {/* Form nhập ngày tháng */}
        <form onSubmit={handleGenerateChart} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">Họ và tên đương số:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">Giới tính:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('nam')}
                  className={`py-2 text-xs rounded-xl font-bold border transition ${
                    gender === 'nam'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
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

            {calendarMode === 'solar' ? (
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Ngày sinh Dương lịch (Ngày / Tháng / Năm):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={solarDay}
                    onChange={(e) => setSolarDay(parseInt(e.target.value) || 1)}
                    placeholder="Ngày"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={solarMonth}
                    onChange={(e) => setSolarMonth(parseInt(e.target.value) || 1)}
                    placeholder="Tháng"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={solarYear}
                    onChange={(e) => setSolarYear(parseInt(e.target.value) || 1984)}
                    placeholder="Năm"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-purple-200">
                    Ngày sinh Âm lịch (Ngày / Tháng / Năm):
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLeapMonth}
                      onChange={(e) => handleLunarChange(lunarDay, lunarMonth, lunarYear, e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Tháng Nhuận</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={lunarDay}
                    onChange={(e) => handleLunarChange(parseInt(e.target.value) || 1, lunarMonth, lunarYear, isLeapMonth)}
                    placeholder="Ngày Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={lunarMonth}
                    onChange={(e) => handleLunarChange(lunarDay, parseInt(e.target.value) || 1, lunarYear, isLeapMonth)}
                    placeholder="Tháng Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={lunarYear}
                    onChange={(e) => handleLunarChange(lunarDay, lunarMonth, parseInt(e.target.value) || 1984, isLeapMonth)}
                    placeholder="Năm Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-amber-200 mb-1">Giờ sinh (Theo Can Chi):</label>
              <select
                value={birthHour}
                onChange={(e) => setBirthHour(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none font-medium"
              >
                <option value="Tý (23h00 - 01h00)">Giờ Tý (23h00 - 01h00)</option>
                <option value="Sửu (01h00 - 03h00)">Giờ Sửu (01h00 - 03h00)</option>
                <option value="Dần (03h00 - 05h00)">Giờ Dần (03h00 - 05h00)</option>
                <option value="Mão (05h00 - 07h00)">Giờ Mão (05h00 - 07h00)</option>
                <option value="Thìn (07h00 - 09h00)">Giờ Thìn (07h00 - 09h00)</option>
                <option value="Tỵ (09h00 - 11h00)">Giờ Tỵ (09h00 - 11h00)</option>
                <option value="Ngọ (11h00 - 13h00)">Giờ Ngọ (11h00 - 13h00)</option>
                <option value="Mùi (13h00 - 15h00)">Giờ Mùi (13h00 - 15h00)</option>
                <option value="Thân (15h00 - 17h00)">Giờ Thân (15h00 - 17h00)</option>
                <option value="Dậu (17h00 - 19h00)">Giờ Dậu (17h00 - 19h00)</option>
                <option value="Tuất (19h00 - 21h00)">Giờ Tuất (19h00 - 21h00)</option>
                <option value="Hợi (21h00 - 23h00)">Giờ Hợi (21h00 - 23h00)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end items-end h-full pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang bấm quẻ an sao...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>An Sao & Nghe Thầy Phán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Thông tin đối ứng thiên văn */}
        {astronomyData && (
          <div className="mt-4 p-4 bg-slate-950/90 border border-amber-400/40 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <Sun className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Dương Lịch:</span>
                <span className="text-sm font-bold text-amber-300">
                  Ngày {solarDay}/{solarMonth}/{solarYear} • Giờ {birthHour.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 flex items-start gap-2.5">
              <Moon className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-300 block font-semibold">Âm Lịch Thiên Văn:</span>
                <span className="text-sm font-bold text-yellow-300">
                  Ngày {lunarDay}/{lunarMonth}/{lunarYear} {isLeapMonth ? '(Nhuận)' : ''}
                </span>
                <span className="text-[11px] text-emerald-300 block font-bold">
                  Năm {astronomyData.canChiYear} • Nạp Âm: {astronomyData.napAm}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KẾT QUẢ AN SAO VÀ CÁC PHẦN BÌNH GIẢI NGẮN GỌN VỚI GIỌNG THẦY BÓI */}
      {profileSummary && parsedSections && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border-2 border-amber-400/50 rounded-2xl p-5 sm:p-6 shadow-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Đương Số</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.fullName}</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                ({profileSummary.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'})
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Tứ Trụ Can Chi</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.canChiYear}</span>
              <span className="text-xs text-purple-300 block mt-0.5">Tháng {profileSummary.canChiMonth}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-amber-500/40 relative overflow-hidden">
              <div className="absolute top-1 right-1 text-amber-400 text-[10px]">★</div>
              <span className="text-[11px] text-amber-300/90 block font-medium">Bản Mệnh Nạp Âm</span>
              <span className="text-base font-bold text-yellow-300">{profileSummary.menhNguHanh}</span>
              <span className="text-xs text-emerald-400 block mt-0.5 font-semibold">Cục: {profileSummary.cuc}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Cung Mệnh & Thân</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.cungMenh}</span>
              <span className="text-xs text-amber-400 block mt-0.5">Thân cư {profileSummary.cungThan}</span>
            </div>
          </div>

          {/* KHUNG BÌNH GIẢI CHIA NHỎ: LỜI THẦY PHÁN VÀ NHẬN XÉT CÓ PHÁT ÂM */}
          <div className="bg-slate-950 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
            
            {/* Header chuyên mục & Nút Lưu */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
                    <span>Thầy Bói Giang Hồ Phán & Nhận Xét</span>
                    {isVoiceSpeaking && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-sans font-semibold animate-pulse">
                        <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                        <span>Đang đọc...</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chọn từng phần nhỏ bên dưới để xem và nghe thầy bói phán chi tiết từng vận thế
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isVoiceSpeaking ? (
                  <button
                    onClick={stopVoice}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng Đọc</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakVoice(parsedSections[activeTopic], activeTopic)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nghe Thầy Đọc Phần Này</span>
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Đã lưu!' : 'Lưu lại'}</span>
                </button>
              </div>
            </div>

            {/* DANH SÁCH 6 TAB / NÚT CHỌN CHUYÊN MỤC NHỎ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {topicsList.map((topic) => {
                const Icon = topic.icon;
                const isActive = activeTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic.id as any);
                      speakVoice(parsedSections[topic.id as keyof ParsedTuViSections], topic.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 shadow ${
                      isActive
                        ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      {currentlySpeakingSection === topic.id && isVoiceSpeaking && (
                        <Volume2 className="w-3 h-3 text-emerald-400 animate-bounce" />
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* VÙNG NỘI DUNG CHI TIẾT CỦA PHẦN ĐANG CHỌN */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-400/30 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h4 className="font-mystic font-bold text-base text-amber-300">
                    {topicsList.find(t => t.id === activeTopic)?.label}
                  </h4>
                </div>

                <button
                  onClick={() => speakVoice(parsedSections[activeTopic], activeTopic)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  title="Nghe lại đoạn này"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe lại</span>
                </button>
              </div>

              {/* Lời thầy phán dạng thơ kiếm hiệp nổi bật */}
              {activeTopic === 'thayPhan' ? (
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 p-5 rounded-2xl border-l-4 border-amber-400 my-2">
                  <p className="font-serif-title text-base sm:text-lg text-amber-200 italic leading-relaxed whitespace-pre-line text-center sm:text-left">
                    "{parsedSections.thayPhan}"
                  </p>
                </div>
              ) : activeTopic === 'nhanXet' ? (
                <div className="bg-purple-950/30 p-5 rounded-2xl border-l-4 border-purple-400 my-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                    Lời Khuyên Chân Thành Của Thầy Bói:
                  </span>
                  <p className="text-sm text-purple-100 leading-relaxed whitespace-pre-line">
                    {parsedSections.nhanXet}
                  </p>
                </div>
              ) : (
                <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line py-1">
                  {parsedSections[activeTopic]}
                </div>
              )}
            </div>

          </div>

          {/* 12 Cung Tử Vi Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mystic text-lg font-bold text-amber-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Bát Quái Thập Nhị Cung (Khởi từ Cung {profileSummary.cungMenh}):</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30">
                12 Cung Số Mệnh
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {palaces.map((palace, i) => (
                <div
                  key={i}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 p-3.5 rounded-xl transition duration-300 group shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-mystic font-bold text-sm text-amber-300 group-hover:text-amber-200">
                      Cung {palace.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                      {palace.luckScore}% Cát
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {palace.stars.map((st, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/90 border border-amber-500/20">
                        {st}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {palace.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
