import React, { useState } from 'react';
import { IChingLine, IChingResult } from '../types';
import { HEXAGRAMS_MAP } from '../constants';
import { explainIChingWithGemini } from '../services/geminiService';
import { Sparkles, Coins, RotateCcw, BookmarkPlus, HelpCircle, Loader2 } from 'lucide-react';

interface IChingProps {
  initialQuestion?: string;
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'iching' }) => void;
}

export const IChingDivination: React.FC<IChingProps> = ({ initialQuestion = '', onSaveResult }) => {
  const [question, setQuestion] = useState(initialQuestion);
  const [lines, setLines] = useState<IChingLine[]>([]);
  const [tossing, setTossing] = useState(false);
  const [coinValues, setCoinValues] = useState<[number, number, number]>([3, 3, 2]); // 3: Ngửa (Dương), 2: Sấp (Âm)
  const [result, setResult] = useState<IChingResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gieo 1 hào (tương đương 3 đồng xu)
  const tossOneLine = () => {
    if (lines.length >= 6 || tossing) return;
    setTossing(true);

    let rolls = 0;
    const interval = setInterval(() => {
      // Simulate coin shaking
      const c1 = Math.random() > 0.5 ? 3 : 2;
      const c2 = Math.random() > 0.5 ? 3 : 2;
      const c3 = Math.random() > 0.5 ? 3 : 2;
      setCoinValues([c1, c2, c3]);
      rolls++;

      if (rolls >= 8) {
        clearInterval(interval);
        const finalC1 = Math.random() > 0.5 ? 3 : 2;
        const finalC2 = Math.random() > 0.5 ? 3 : 2;
        const finalC3 = Math.random() > 0.5 ? 3 : 2;
        const sum = finalC1 + finalC2 + finalC3; // 6, 7, 8, 9
        setCoinValues([finalC1, finalC2, finalC3]);

        const newLine: IChingLine = {
          value: sum,
          isYang: sum === 7 || sum === 9,
          isChanging: sum === 6 || sum === 9
        };

        const updatedLines = [...lines, newLine];
        setLines(updatedLines);
        setTossing(false);

        // Nếu đã đủ 6 hào -> tự động lập quẻ và luận giải
        if (updatedLines.length === 6) {
          finalizeHexagram(updatedLines);
        }
      }
    }, 100);
  };

  // Gieo nhanh đủ 6 hào
  const tossAllInstantly = () => {
    if (tossing) return;
    setTossing(true);
    const newLines: IChingLine[] = [];
    for (let i = 0; i < 6; i++) {
      const c1 = Math.random() > 0.5 ? 3 : 2;
      const c2 = Math.random() > 0.5 ? 3 : 2;
      const c3 = Math.random() > 0.5 ? 3 : 2;
      const sum = c1 + c2 + c3;
      newLines.push({
        value: sum,
        isYang: sum === 7 || sum === 9,
        isChanging: sum === 6 || sum === 9
      });
    }
    setTimeout(() => {
      setLines(newLines);
      setTossing(false);
      finalizeHexagram(newLines);
    }, 800);
  };

  // Xác định tên quẻ từ 6 hào
  const finalizeHexagram = async (completedLines: IChingLine[]) => {
    // Map binary of 6 lines to a hexagram
    const yangCount = completedLines.filter(l => l.isYang).length;
    let hexNumber = 11; // Default Địa Thiên Thái
    if (yangCount === 6) hexNumber = 1; // Thuần Càn
    else if (yangCount === 0) hexNumber = 2; // Thuần Khôn
    else if (yangCount === 5) hexNumber = 14; // Đại Hữu
    else if (yangCount === 1) hexNumber = 24; // Địa Lôi Phục
    else if (yangCount === 3 && completedLines[0].isYang) hexNumber = 63; // Ký Tế
    else if (yangCount === 3 && !completedLines[0].isYang) hexNumber = 64; // Vị Tế
    else if (yangCount === 4) hexNumber = 42; // Ích
    else if (yangCount === 2) hexNumber = 29; // Khảm
    else hexNumber = 30; // Ly

    const hexInfo = HEXAGRAMS_MAP[hexNumber] || {
      name: `Quẻ Dịch Số ${hexNumber}`,
      meaning: "Càn khôn biến hóa, cơ hội và thử thách đan xen",
      judgement: "Chính đạo tất hanh thông."
    };

    setLoadingAi(true);
    const lineValues = completedLines.map(l => l.value);
    const aiText = await explainIChingWithGemini(question, hexInfo.name, lineValues, hexInfo.meaning);
    setLoadingAi(false);

    setResult({
      hexagramNumber: hexNumber,
      name: hexInfo.name,
      meaning: hexInfo.meaning,
      originalJudgement: hexInfo.judgement,
      aiExplanation: aiText,
      lines: completedLines,
      timestamp: new Date().toLocaleString('vi-VN'),
      question: question || "Xin vận thế tổng quan"
    });
  };

  const resetIChing = () => {
    setLines([]);
    setResult(null);
    setSavedSuccess(false);
  };

  const handleSave = () => {
    if (!result) return;
    onSaveResult({
      title: `Kinh Dịch: ${result.name}`,
      summary: `Hỏi: "${result.question}" • ${result.meaning}`,
      fullContent: result.aiExplanation,
      type: 'iching'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl text-amber-400">🪙</span>
            <h2 className="font-mystic text-xl sm:text-2xl font-bold text-amber-300">
              Gieo Quẻ Kinh Dịch Miễn Phí
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gieo 3 đồng tiền cổ 6 lần để tạo dựng 6 hào (từ Hào 1 Sơ Cửu/Sơ Lục đến Hào 6 Thượng Cửu/Thượng Lục)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lines.length > 0 && (
            <button
              onClick={resetIChing}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Gieo lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Question Input */}
      <div className="mb-6">
        <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-2">
          Việc bạn muốn xin quẻ chỉ lối (Tâm thành ắt ứng):
        </label>
        <div className="relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ví dụ: Công việc sắp tới có thuận lợi không? Tình duyên có khởi sắc?..."
            className="w-full bg-slate-950/80 border border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition"
          />
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left: 3 Coins tossing visual */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/90 rounded-2xl border border-purple-500/20 shadow-inner">
          <div className="text-xs text-amber-400/80 font-medium mb-4 flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Đồng tiền càn khôn (Mặt Rồng: Dương = 3, Mặt Chữ: Âm = 2)</span>
          </div>

          {/* 3 Coins in a row with 3D-like gold styling */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 my-4">
            {coinValues.map((v, i) => (
              <div
                key={i}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 ${
                  v === 3
                    ? 'border-amber-300 bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 shadow-amber-500/40 text-slate-950'
                    : 'border-yellow-600 bg-gradient-to-br from-amber-700 via-yellow-800 to-amber-950 shadow-yellow-900/40 text-amber-200'
                } flex flex-col items-center justify-center shadow-xl transition-all duration-300 transform ${
                  tossing ? 'animate-spin scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Square hole in ancient Chinese/Vietnamese coin */}
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-slate-950 border border-amber-400/70 rounded-sm flex items-center justify-center shadow-inner">
                  <span className="text-[8px] text-amber-400">☯</span>
                </div>
                <span className="text-[10px] font-bold mt-1 tracking-tighter">
                  {v === 3 ? 'DƯƠNG (+3)' : 'ÂM (+2)'}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-2 mb-4">
            <span className="text-xs text-slate-400">
              {lines.length < 6
                ? `Đã gieo ${lines.length}/6 hào. Hãy tập trung và ấn nút gieo tiếp!`
                : 'Đã hoàn thành 6 hào của quẻ!'}
            </span>
          </div>

          {/* Buttons to toss */}
          <div className="flex flex-wrap gap-3 w-full justify-center">
            <button
              onClick={tossOneLine}
              disabled={lines.length >= 6 || tossing}
              className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                lines.length >= 6 || tossing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/25 active:scale-95'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>{tossing ? 'Đang tung xu...' : `Tung Hào ${lines.length + 1}`}</span>
            </button>

            {lines.length < 6 && (
              <button
                onClick={tossAllInstantly}
                disabled={tossing}
                className="py-2.5 px-4 rounded-xl font-medium text-xs bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 transition active:scale-95"
              >
                Gieo nhanh 6 hào
              </button>
            )}
          </div>
        </div>

        {/* Right: The 6 Hexagram Lines drawing from bottom to top */}
        <div className="md:col-span-7 bg-slate-950/70 border border-amber-500/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-amber-300">
            <span className="font-semibold uppercase tracking-wider">Hình tượng Quẻ (Đọc từ dưới lên trên):</span>
            <span>{lines.length} / 6 Hào</span>
          </div>

          {/* Hexagram Lines display (Reverse order so Line 6 is at top, Line 1 at bottom) */}
          <div className="space-y-2.5 my-3 py-2 bg-slate-900/60 rounded-xl px-4 border border-slate-800 min-h-[190px] flex flex-col justify-end">
            {Array.from({ length: 6 }).map((_, index) => {
              const lineIndex = 5 - index; // 5 is top (Hào 6), 0 is bottom (Hào 1)
              const line = lines[lineIndex];

              if (!line) {
                return (
                  <div key={lineIndex} className="h-6 border border-dashed border-slate-800 rounded flex items-center justify-center text-[11px] text-slate-600">
                    Hào {lineIndex + 1} (Chưa gieo)
                  </div>
                );
              }

              return (
                <div key={lineIndex} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 w-12">
                    Hào {lineIndex + 1}:
                  </span>
                  
                  {/* Line visual: Yang is solid bar, Yin is split bar */}
                  <div className="flex-1 flex items-center justify-center">
                    {line.isYang ? (
                      <div className={`h-4 w-full rounded-sm ${line.isChanging ? 'bg-amber-400 shadow-md shadow-amber-400/50' : 'bg-amber-500/90'} transition-all`} />
                    ) : (
                      <div className="h-4 w-full flex gap-3">
                        <div className={`h-full flex-1 rounded-sm ${line.isChanging ? 'bg-purple-400 shadow-md shadow-purple-400/50' : 'bg-slate-400'}`} />
                        <div className={`h-full flex-1 rounded-sm ${line.isChanging ? 'bg-purple-400 shadow-md shadow-purple-400/50' : 'bg-slate-400'}`} />
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] w-24 text-right font-medium ${line.isChanging ? 'text-amber-300 font-bold' : 'text-slate-400'}`}>
                    {line.value === 9 && 'Lão Dương (○ biến)'}
                    {line.value === 8 && 'Thiếu Âm (--)'}
                    {line.value === 7 && 'Thiếu Dương (—)'}
                    {line.value === 6 && 'Lão Âm (✕ biến)'}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-500 italic text-center">
            * Theo Chu Dịch: Hào 1, 2, 3 tạo nên Nội Quái (Hạ Quái); Hào 4, 5, 6 tạo nên Ngoại Quái (Thượng Quái).
          </p>
        </div>
      </div>

      {/* Loading AI spinner */}
      {loadingAi && (
        <div className="mt-6 p-6 rounded-2xl bg-purple-950/30 border border-purple-500/30 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-amber-200 font-mystic font-semibold tracking-wide">
            Đạo sĩ Thiên Cơ Các đang thấu thị hào tượng và khai mở lời sấm...
          </p>
        </div>
      )}

      {/* Result Display */}
      {result && !loadingAi && (
        <div className="mt-6 p-5 sm:p-7 rounded-2xl bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 border-2 border-amber-400/50 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/30 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold">
                  Quẻ #{result.hexagramNumber}
                </span>
                <h3 className="font-mystic text-xl sm:text-2xl font-bold text-amber-300">
                  {result.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-purple-200 mt-1">
                {result.meaning}
              </p>
            </div>

            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{savedSuccess ? 'Đã lưu vào Sổ!' : 'Lưu lại quẻ'}</span>
            </button>
          </div>

          {/* Original Judgement */}
          <div className="p-3.5 bg-amber-500/10 border-l-4 border-amber-400 rounded-r-xl mb-4">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Thoán Từ Cổ Truyền:
            </span>
            <p className="text-sm text-amber-100 font-serif-title italic">
              "{result.originalJudgement}"
            </p>
          </div>

          {/* Gemini Detailed Reading */}
          <div>
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Luận Giải Chi Tiết Của AI Đạo Sĩ:</span>
            </h4>
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/80 p-4 sm:p-5 rounded-xl border border-slate-800">
              {result.aiExplanation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
