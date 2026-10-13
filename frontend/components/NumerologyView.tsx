import React, { useState } from 'react';
import { NumerologyReport } from '../types';
import { generateNumerologyReport } from '../services/numerologyService';
import { analyzeNumerologyWithGemini } from '../services/geminiService';
import { 
  Sparkles, 
  BookmarkPlus, 
  Loader2, 
  Binary, 
  Flame, 
  Compass, 
  Award, 
  Calendar, 
  User, 
  Layers, 
  Zap, 
  HelpCircle,
  ArrowUpRight
} from 'lucide-react';

interface NumerologyProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'numerology' }) => void;
}

export const NumerologyView: React.FC<NumerologyProps> = ({ onSaveResult }) => {
  const [fullName, setFullName] = useState('Nguyễn Văn An');
  const [birthDate, setBirthDate] = useState('1998-08-18');
  const [report, setReport] = useState<NumerologyReport | null>(null);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Xử lý tính toán và luận giải AI
  const handleCalculate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setAiReading(null);

    // Tính toán theo trường phái Pythagoras
    const generated = generateNumerologyReport(fullName, birthDate);
    setReport(generated);

    // Gọi Gemini phân tích chuyên sâu
    const analysis = await analyzeNumerologyWithGemini(generated);
    setAiReading(analysis);
    setLoading(false);
  };

  const handleSave = () => {
    if (!report || !aiReading) return;
    onSaveResult({
      title: `Thần Số Học: ${report.fullName} (Số Chủ Đạo ${report.isMaster22 ? '22/4' : report.lifePathNumber})`,
      summary: `Số Chủ Đạo: ${report.isMaster22 ? '22/4' : report.lifePathNumber} • Số Linh Hồn: ${report.soulUrgeNumber} • Năm Cá Nhân: ${report.personalYear}`,
      fullContent: aiReading,
      type: 'numerology'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const setSampleData = (name: string, date: string) => {
    setFullName(name);
    setBirthDate(date);
  };

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu Thần Số Học Pythagoras */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 border-2 border-indigo-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-indigo-500/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Binary className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🔢</span>
                <h2 className="font-mystic font-bold text-lg sm:text-xl text-indigo-300">
                  Thần Số Học Pythagoras Phương Tây (Numerology)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Khai mở mật mã linh hồn qua <strong className="text-indigo-200">Con số chủ đạo</strong>, <strong className="text-purple-200">Số linh hồn</strong>, <strong className="text-cyan-200">Năm cá nhân</strong> và <strong className="text-amber-200">4 Đỉnh cao kim tự tháp</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSampleData('Lê Hoàng Long', '1990-10-24')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 transition active:scale-95"
            >
              Mẫu: Số Chủ Đạo 8
            </button>
            <button
              onClick={() => setSampleData('Trần Minh Tuấn', '1984-10-10')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 transition active:scale-95"
            >
              Mẫu: Số Chủ Đạo 6
            </button>
          </div>
        </div>

        {/* Form nhập Họ tên và Ngày sinh */}
        <form onSubmit={handleCalculate} className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-indigo-200 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Họ và tên đầy đủ (trên giấy tờ):</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn An"
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-indigo-200 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ngày sinh Dương lịch:</span>
            </label>
            <input
              type="date"
              required
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang giải mã số học...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Tra Cứu Bản Đồ Số</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* KẾT QUẢ THẦN SỐ HỌC */}
      {report && (
        <div className="space-y-6">
          {/* BANNER 4 CHỈ SỐ CỐT LÕI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Con số chủ đạo */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border-2 border-indigo-400/60 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-2">
                <span>CON SỐ CHỦ ĐẠO</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/40">Life Path</span>
              </div>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-mystic">
                  {report.isMaster22 ? '22/4' : report.lifePathNumber}
                </span>
                {report.isMaster22 && (
                  <span className="text-[11px] text-amber-300 font-bold">Master Number</span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-2">
                {report.summaryBrief}
              </p>
            </div>

            {/* 2. Con số Linh hồn */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-purple-500/40 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-2">
                <span>SỐ LINH HỒN</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/40">Soul Urge</span>
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-purple-300 font-mystic">
                  {report.soulUrgeNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Khát vọng sâu kín và động lực tinh thần thẳm sâu nhất trong tâm hồn bạn.
              </p>
            </div>

            {/* 3. Con số Sứ mệnh */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-cyan-500/40 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-bold mb-2">
                <span>SỐ SỨ MỆNH</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">Destiny</span>
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mystic">
                  {report.destinyNumber}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Vai trò, mục đích lớn lao và năng lực bạn được trao gửi để phụng sự cuộc đời.
              </p>
            </div>

            {/* 4. Năm Cá Nhân */}
            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/40 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-2">
                <span>NĂM CÁ NHÂN {report.currentCalendarYear}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">Personal Year</span>
              </div>
              <div className="my-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-mystic">
                  Số {report.personalYear}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tần số rung động năng lượng của chu kỳ 9 năm trong năm {report.currentCalendarYear}.
              </p>
            </div>
          </div>

          {/* CHỈ SỐ NHÂN CÁCH & THÁI ĐỘ + TỪ KHÓA BẢN MỆNH */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Số Nhân Cách (Ấn tượng đối ngoại):</span>
                <span className="text-lg font-bold text-purple-300 font-mystic">Số {report.personalityNumber}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-700">
                <span className="text-[11px] text-slate-400 block">Số Thái Độ (Cách đón nhận biến cố):</span>
                <span className="text-lg font-bold text-amber-300 font-mystic">Số {report.attitudeNumber}</span>
              </div>
            </div>

            {/* Tags từ khóa */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-400 font-semibold mr-1">Năng lượng cốt lõi:</span>
              {report.coreKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* 4 ĐỈNH CAO KIM TỰ THÁP CUỘC ĐỜI */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-mystic font-bold text-base sm:text-lg text-amber-300">
                  4 Đỉnh Cao Kim Tự Tháp Cuộc Đời (Pyramid Peaks)
                </h3>
              </div>
              <span className="text-xs text-slate-400">Chu kỳ 9 năm chuyển biến</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {report.pyramidPeaks.map((peak) => (
                <div
                  key={peak.peakNumber}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl transition duration-300 shadow group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-amber-300">
                        Đỉnh Cao {peak.peakNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                        {peak.age} Tuổi ({peak.year})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 my-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center font-mystic font-bold text-lg text-amber-300">
                        {peak.number}
                      </div>
                      <span className="text-xs font-bold text-slate-200">Năng Lượng Số {peak.number}</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {peak.meaning}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BÌNH GIẢI CHI TIẾT TỪ AI CHUYÊN GIA SỐ HỌC (GEMINI 2.5 FLASH) */}
          {aiReading && (
            <div className="bg-slate-950 border-2 border-indigo-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-mystic text-lg sm:text-xl font-bold text-indigo-300">
                    Bình Giải Chi Tiết Bản Đồ Thần Số Học (AI Pythagoras)
                  </h3>
                </div>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{savedSuccess ? 'Đã lưu sổ tay!' : 'Lưu kết quả này'}</span>
                </button>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80">
                {aiReading}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
