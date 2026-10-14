import React, { useState } from 'react';
import { PersonLoveInput, LoveMatchSummary } from '../types';
import { calculateLoveMatch } from '../services/loveMatchService';
import { analyzeLoveMatchWithGemini } from '../services/geminiService';
import { upsertUserDossier } from '../services/dossierService';
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
  ArrowRight
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
  // Người thứ nhất (Mặc định Nam 1984 Giáp Tý)
  const [person1, setPerson1] = useState<PersonLoveInput>({
    name: 'Anh Nam',
    gender: 'nam',
    calendarMode: 'solar',
    day: 10,
    month: 10,
    year: 1984,
    isLeapMonth: false
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

  const [matchSummary, setMatchSummary] = useState<LoveMatchSummary | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
  };

  // Lưu vào sổ tay
  const handleSave = () => {
    if (!matchSummary || !aiAnalysis) return;
    onSaveResult({
      title: `Hợp Duyên: ${matchSummary.person1.name} (${matchSummary.person1.canChiYear}) ♥ ${matchSummary.person2.name} (${matchSummary.person2.canChiYear})`,
      personName: `${matchSummary.person1.name} & ${matchSummary.person2.name}`,
      summary: `Điểm tương hợp: ${matchSummary.totalScore}/100 • ${matchSummary.verdict} • Bản mệnh: ${matchSummary.factors.nguHanh.title}`,
      fullContent: aiAnalysis,
      type: 'love_match'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Cặp đôi mẫu nhanh
  const setQuickSample = (y1: number, y2: number, n1: string, n2: string) => {
    setPerson1({
      name: n1,
      gender: 'nam',
      calendarMode: 'solar',
      day: 10,
      month: 10,
      year: y1,
      isLeapMonth: false
    });
    setPerson2({
      name: n2,
      gender: 'nu',
      calendarMode: 'solar',
      day: 15,
      month: 8,
      year: y2,
      isLeapMonth: false
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner Giới Thiệu Chấm Điểm Tình Duyên */}
      <div className="bg-gradient-to-r from-rose-950/70 via-slate-900 to-pink-950/70 border-2 border-rose-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-rose-400/30">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Heart className="w-7 h-7 fill-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">💍</span>
                <h2 className="font-mystic font-bold text-lg sm:text-xl text-rose-300">
                  Chấm Điểm Tương Hợp Tình Duyên & Hôn Nhân Bát Tự
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Đối chiếu 4 yếu tố then chốt: <strong className="text-rose-200">Ngũ Hành Nạp Âm</strong>, <strong className="text-rose-200">Địa Chi (Tam Hợp/Lục Xung)</strong>, <strong className="text-rose-200">Cung Phi Bát Trạch</strong> và <strong className="text-rose-200">Thiên Can</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setQuickSample(1984, 1988, 'Giáp Tý (Nam)', 'Mậu Thìn (Nữ)')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 transition active:scale-95"
            >
              Mẫu: Tý ♥ Thìn (Tam Hợp)
            </button>
            <button
              onClick={() => setQuickSample(1995, 1999, 'Ất Hợi (Nam)', 'Kỷ Mão (Nữ)')}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/40 transition active:scale-95"
            >
              Mẫu: Hợi ♥ Mão
            </button>
          </div>
        </div>

        {/* Form nhập liệu 2 người song song */}
        <form onSubmit={handleCalculateMatch} className="mt-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* THÔNG TIN BÊN 1 */}
            <div className="p-4 bg-slate-950/80 border border-rose-500/30 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <h3 className="font-mystic font-bold text-sm text-rose-300">
                    Người Thứ Nhất (Nam / Chồng / Bạn)
                  </h3>
                </div>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPerson1(p => ({ ...p, gender: 'nam' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person1.gender === 'nam' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerson1(p => ({ ...p, gender: 'nu' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person1.gender === 'nu' ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400'
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
                  onChange={(e) => setPerson1(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Lựa chọn loại lịch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400">Ngày sinh:</label>
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
                    onChange={(e) => setPerson1(p => ({ ...p, day: parseInt(e.target.value) || 1 }))}
                    placeholder="Ngày"
                    className="bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={person1.month}
                    onChange={(e) => setPerson1(p => ({ ...p, month: parseInt(e.target.value) || 1 }))}
                    placeholder="Tháng"
                    className="bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={person1.year}
                    onChange={(e) => setPerson1(p => ({ ...p, year: parseInt(e.target.value) || 1984 }))}
                    placeholder="Năm"
                    className="bg-slate-900 border border-slate-700 focus:border-rose-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-rose-300"
                  />
                </div>
              </div>
            </div>

            {/* THÔNG TIN BÊN 2 */}
            <div className="p-4 bg-slate-950/80 border border-pink-500/30 rounded-2xl space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  <h3 className="font-mystic font-bold text-sm text-pink-300">
                    Người Thứ Hai (Nữ / Vợ / Bạn Đời)
                  </h3>
                </div>
                <div className="flex gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPerson2(p => ({ ...p, gender: 'nam' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person2.gender === 'nam' ? 'bg-rose-500 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    Nam
                  </button>
                  <button
                    type="button"
                    onClick={() => setPerson2(p => ({ ...p, gender: 'nu' }))}
                    className={`px-2 py-0.5 rounded-md font-bold transition ${
                      person2.gender === 'nu' ? 'bg-pink-500 text-white' : 'bg-slate-900 text-slate-400'
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
                  value={person2.name}
                  onChange={(e) => setPerson2(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-slate-100 focus:outline-none"
                />
              </div>

              {/* Lựa chọn loại lịch */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-slate-400">Ngày sinh:</label>
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
                    className="bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={person2.month}
                    onChange={(e) => setPerson2(p => ({ ...p, month: parseInt(e.target.value) || 1 }))}
                    placeholder="Tháng"
                    className="bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={person2.year}
                    onChange={(e) => setPerson2(p => ({ ...p, year: parseInt(e.target.value) || 1988 }))}
                    placeholder="Năm"
                    className="bg-slate-900 border border-slate-700 focus:border-pink-400 rounded-xl px-2 py-1.5 text-center text-xs sm:text-sm font-bold text-pink-300"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading}
              className="py-3 px-8 rounded-2xl font-bold text-sm sm:text-base bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-400 hover:to-pink-400 text-white flex items-center justify-center gap-2 shadow-xl shadow-rose-900/40 active:scale-95 transition disabled:opacity-50"
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

      {/* HIỂN THỊ KẾT QUẢ CHẤM ĐIỂM & ĐỐI CHIẾU CHI TIẾT */}
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
                <button
                  onClick={handleSave}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{savedSuccess ? 'Đã lưu sổ tay!' : 'Lưu kết quả này'}</span>
                </button>
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
