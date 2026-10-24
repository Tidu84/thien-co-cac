import React, { useState, useEffect } from 'react';
import { TAROT_DECK } from '../constants';
import { TarotCard } from '../types';
import { explainTarotWithGemini, scryCrystalBallWithGemini } from '../services/geminiService';
import { getActiveDossierName } from '../services/dossierService';
import { Sparkles, Moon, HelpCircle, BookmarkPlus, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';

interface WesternProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'tarot' | 'crystal'; personName?: string }) => void;
}

export const WesternDivination: React.FC<WesternProps> = ({ onSaveResult }) => {
  const [subTab, setSubTab] = useState<'tarot' | 'crystal'>('tarot');

  // Đương số đồng bộ từ hồ sơ
  const [activePersonName, setActivePersonName] = useState<string>(() => {
    try {
      return getActiveDossierName() || localStorage.getItem('thien_co_cac_user_name') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    const syncActive = (overrideName?: string) => {
      const name = overrideName || getActiveDossierName() || localStorage.getItem('thien_co_cac_user_name') || '';
      if (name) setActivePersonName(name);
    };

    syncActive();

    const handleActiveChange = (e: any) => {
      const activeName = e.detail?.name || (typeof e.detail === 'string' ? e.detail : null) || getActiveDossierName();
      syncActive(activeName);
    };

    const handleDossierUpdated = () => {
      syncActive();
    };

    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    window.addEventListener('thien_co_cac_dossier_updated', handleDossierUpdated);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
      window.removeEventListener('thien_co_cac_dossier_updated', handleDossierUpdated);
    };
  }, []);

  // Tarot State
  const [tarotQuestion, setTarotQuestion] = useState('Định hướng công danh và tình cảm sắp tới');
  const [selectedCards, setSelectedCards] = useState<{ card: TarotCard; isReversed: boolean; position: string }[]>([]);
  const [tarotReading, setTarotReading] = useState<string | null>(null);
  const [tarotLoading, setTarotLoading] = useState(false);

  // Crystal Ball State
  const [crystalQuestion, setCrystalQuestion] = useState('Tương lai gần có biến cố hay vận may gì chờ đợi tôi?');
  const [crystalProphecy, setCrystalProphecy] = useState<string | null>(null);
  const [crystalLoading, setCrystalLoading] = useState(false);
  const [crystalGlowing, setCrystalGlowing] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Rút 3 lá bài Tarot ngẫu nhiên (Quá khứ - Hiện tại - Tương lai)
  const drawTarotCards = async () => {
    setTarotLoading(true);
    setTarotReading(null);

    // Shuffle and pick 3 cards
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5);
    const picked = [
      { card: shuffled[0], isReversed: Math.random() > 0.7, position: "Quá Khứ (Past)" },
      { card: shuffled[1], isReversed: Math.random() > 0.7, position: "Hiện Tại (Present)" },
      { card: shuffled[2], isReversed: Math.random() > 0.7, position: "Tương Lai (Future)" },
    ];
    setSelectedCards(picked);

    const cardsForAi = picked.map(p => ({
      name: `${p.card.vietnameseName} (${p.isReversed ? 'Ngược' : 'Xuôi'})`,
      position: p.position,
      meaning: p.isReversed ? p.card.meaningReversed : p.card.meaningUpright
    }));

    const aiText = await explainTarotWithGemini(tarotQuestion, cardsForAi);
    setTarotReading(aiText);
    setTarotLoading(false);

    // TỰ ĐỘNG LƯU VÀO SỔ TAY VẬN MỆNH (AUTO-SAVE 100%)
    const finalPersonName = activePersonName.trim() || 'Hữu Duyên Khách';

    onSaveResult({
      title: `Tarot 3 Lá: ${picked.map(c => c.card.vietnameseName).join(' • ')}`,
      personName: finalPersonName,
      summary: `Hỏi: "${tarotQuestion || 'Thông điệp vận thế'}"`,
      fullContent: aiText,
      type: 'tarot'
    });
    setSavedSuccess(true);
  };

  // Kích hoạt quả cầu thủy tinh
  const handleScryCrystalBall = async () => {
    setCrystalLoading(true);
    setCrystalGlowing(true);
    setCrystalProphecy(null);

    const prophecy = await scryCrystalBallWithGemini(crystalQuestion);
    setCrystalProphecy(prophecy);
    setCrystalLoading(false);
    setTimeout(() => setCrystalGlowing(false), 2000);

    // TỰ ĐỘNG LƯU VÀO SỔ TAY VẬN MỆNH (AUTO-SAVE 100%)
    const finalPersonName = activePersonName.trim() || 'Hữu Duyên Khách';

    onSaveResult({
      title: `Thần Dụ Quả Cầu Thủy Tinh`,
      personName: finalPersonName,
      summary: `Hỏi: "${crystalQuestion || 'Xin sấm truyền tương lai'}"`,
      fullContent: prophecy,
      type: 'crystal'
    });
    setSavedSuccess(true);
  };

  const handleSaveTarot = () => {
    if (!tarotReading) return;
    const finalPersonName = activePersonName.trim() || 'Hữu Duyên Khách';
    onSaveResult({
      title: `Tarot 3 Lá: ${selectedCards.map(c => c.card.name).join(' • ')}`,
      personName: finalPersonName,
      summary: `Hỏi: "${tarotQuestion}"`,
      fullContent: tarotReading,
      type: 'tarot'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveCrystal = () => {
    if (!crystalProphecy) return;
    const finalPersonName = activePersonName.trim() || 'Hữu Duyên Khách';
    onSaveResult({
      title: `Thần Dụ Quả Cầu Thủy Tinh`,
      personName: finalPersonName,
      summary: `Hỏi: "${crystalQuestion}"`,
      fullContent: crystalProphecy,
      type: 'crystal'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Hồ Sơ Đương Số Trải Bài / Chiêm Bái */}
      {activePersonName && (
        <div className="max-w-2xl mx-auto bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/40 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-purple-200 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>🔮</span>
              <span>Đương số chiêm bái:</span>
            </span>
            <strong className="text-amber-300 font-bold bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
              {activePersonName}
            </strong>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
            ✓ Kết quả bài Tarot & Thần Dụ tự động lưu vào hồ sơ
          </span>
        </div>
      )}

      {/* Sub-tab selection */}
      <div className="flex justify-center">
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-purple-500/30 flex gap-2 shadow-xl">
          <button
            onClick={() => setSubTab('tarot')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition ${
              subTab === 'tarot'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <span>🃏</span>
            <span>Bói Bài Tarot 3 Lá</span>
          </button>
          <button
            onClick={() => setSubTab('crystal')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition ${
              subTab === 'crystal'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/30'
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <span>🔮</span>
            <span>Quả Cầu Thủy Tinh Ma Thuật</span>
          </button>
        </div>
      </div>

      {/* TAROT SECTION */}
      {subTab === 'tarot' && (
        <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="border-b border-slate-800 pb-3 mb-5">
            <h2 className="font-mystic text-xl sm:text-2xl font-bold text-purple-300">
              Trải Bài Tarot Quá Khứ • Hiện Tại • Tương Lai
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Rút 3 lá bài từ bộ Ẩn Phụ & Ẩn Chính để lắng nghe thông điệp chỉ lối từ trực giác vũ trụ
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
              Câu hỏi hoặc vấn đề bạn muốn xin thông điệp:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={tarotQuestion}
                onChange={(e) => setTarotQuestion(e.target.value)}
                placeholder="Ví dụ: Tôi và người ấy có tương lai không? Định hướng sự nghiệp tháng này?..."
                className="flex-1 bg-slate-950 border border-purple-500/30 focus:border-purple-400 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none"
              />
              <button
                onClick={drawTarotCards}
                disabled={tarotLoading}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 via-indigo-600 to-purple-700 hover:from-purple-400 hover:to-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition active:scale-95 disabled:opacity-50"
              >
                {tarotLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xào bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Trải 3 Lá Bài</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3 Tarot Cards display */}
          {selectedCards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 my-6">
              {selectedCards.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 flex flex-col items-center shadow-xl hover:border-amber-400/50 transition group"
                >
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest mb-2 px-3 py-1 bg-purple-950/80 rounded-full border border-purple-800">
                    {item.position}
                  </span>

                  {/* Card Image with Flip/Glow */}
                  <div className="relative w-44 h-64 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-2xl mb-3 bg-slate-900">
                    <img
                      src={item.card.image}
                      alt={item.card.name}
                      className={`w-full h-full object-cover transition duration-500 group-hover:scale-105 ${
                        item.isReversed ? 'rotate-180' : ''
                      }`}
                    />
                    {item.isReversed && (
                      <span className="absolute bottom-2 left-2 bg-red-950/90 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded border border-red-500/40">
                        Lá Ngược
                      </span>
                    )}
                  </div>

                  <h4 className="font-mystic font-bold text-base text-slate-100 text-center">
                    {item.card.vietnameseName}
                  </h4>
                  <p className="text-[11px] text-purple-300/80 italic text-center mb-2">
                    {item.card.keywords.join(' • ')}
                  </p>
                  <p className="text-xs text-slate-300 text-center line-clamp-3">
                    {item.isReversed ? item.card.meaningReversed : item.card.meaningUpright}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* AI Tarot Reading */}
          {tarotReading && (
            <div className="mt-6 bg-slate-950 border-2 border-purple-400/40 rounded-2xl p-5 sm:p-7 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="font-mystic text-lg font-bold text-purple-300 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Thông Điệp Của Người Đọc Bài Tarot AI:</span>
                </h3>
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã tự động lưu vào Sổ</span>
                </div>
              </div>

              <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                {tarotReading}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CRYSTAL BALL SECTION */}
      {subTab === 'crystal' && (
        <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl flex flex-col items-center text-center">
          <div className="max-w-xl mx-auto mb-6">
            <h2 className="font-mystic text-xl sm:text-2xl font-bold text-cyan-300">
              Quả Cầu Thủy Tinh Soi Thấu Vận Mệnh
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Nhập câu hỏi, đặt hai bàn tay tưởng tượng chạm vào quả cầu ma thuật và chờ đợi sương mù tan biến để đón nhận lời sấm truyền.
            </p>
          </div>

          {/* Interactive Crystal Ball Visual */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Glowing Aura Outer Ring */}
            <div
              className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full transition-all duration-1000 ${
                crystalGlowing || crystalLoading
                  ? 'bg-cyan-400/30 blur-3xl scale-125'
                  : 'bg-indigo-600/10 blur-2xl scale-100'
              }`}
            />

            {/* Glass Sphere */}
            <div
              onClick={handleScryCrystalBall}
              className={`relative cursor-pointer w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-cyan-300/40 bg-gradient-to-tr from-slate-950 via-indigo-950 to-cyan-900 shadow-2xl shadow-cyan-500/40 flex items-center justify-center overflow-hidden transition-all duration-700 ${
                crystalLoading ? 'scale-105 animate-pulse' : 'hover:scale-105'
              }`}
            >
              {/* Inner mist and magic sparks */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_60%)] pointer-events-none" />
              <div className="absolute inset-0 bg-cyan-400/10 mix-blend-overlay animate-spin duration-[10000ms]" />

              <div className="text-center p-4 z-10">
                {crystalLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-cyan-300 animate-spin mb-2" />
                    <span className="text-xs text-cyan-200 font-mystic">Làn sương đang xoáy...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl mb-1">🔮</span>
                    <span className="text-xs text-cyan-300 font-semibold tracking-wider uppercase">
                      Chạm để soi
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stand/Pedestal of the ball */}
            <div className="absolute -bottom-6 w-32 h-8 bg-gradient-to-b from-amber-600 to-amber-950 rounded-t-xl border border-amber-400/40 shadow-lg -z-0" />
          </div>

          {/* Question input */}
          <div className="w-full max-w-lg mt-8">
            <input
              type="text"
              value={crystalQuestion}
              onChange={(e) => setCrystalQuestion(e.target.value)}
              placeholder="Đặt câu hỏi bạn băn khoăn cho quả cầu..."
              className="w-full bg-slate-950 border border-cyan-500/30 focus:border-cyan-400 rounded-xl px-4 py-3 text-sm text-slate-100 text-center focus:outline-none"
            />
            <button
              onClick={handleScryCrystalBall}
              disabled={crystalLoading}
              className="mt-3 px-8 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-900/30 active:scale-95 transition disabled:opacity-50"
            >
              Khai Mở Thần Dụ
            </button>
          </div>

          {/* Prophecy Output */}
          {crystalProphecy && (
            <div className="mt-8 max-w-2xl w-full bg-slate-950 border-2 border-cyan-400/50 rounded-2xl p-6 shadow-2xl text-left">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="font-mystic text-cyan-300 font-bold text-base flex items-center gap-1.5">
                  <span>✨</span>
                  <span>Lời Sấm Truyền Từ Khối Pha Lê:</span>
                </span>
                <div className="px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã tự động lưu vào Sổ</span>
                </div>
              </div>
              <p className="text-sm sm:text-base text-cyan-100 font-serif-title leading-relaxed italic">
                "{crystalProphecy}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
