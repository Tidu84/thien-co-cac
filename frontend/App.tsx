import React, { useState, useEffect } from 'react';
import { NavTab, DivinationRecord } from './types';
import { Navbar } from './components/Navbar';
import { AnimeGuide } from './components/AnimeGuide';
import { IChingDivination } from './components/IChingDivination';
import { TuViHoroscope } from './components/TuViHoroscope';
import { LoveMatch } from './components/LoveMatch';
import { NumerologyView } from './components/NumerologyView';
import { FengShuiCompass } from './components/FengShuiCompass';
import { FaceAndPalmReading } from './components/FaceAndPalmReading';
import { WesternDivination } from './components/WesternDivination';
import { HistoryModal } from './components/HistoryModal';
import { RecentDossiersBanner } from './components/RecentDossiersBanner';
import { syncDossierRecordCounts } from './services/dossierService';
import { Compass, Sparkles, Moon, Eye, ShieldCheck, Heart, Binary, Navigation } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [facePalmInitialMode, setFacePalmInitialMode] = useState<'face' | 'palm' | 'body'>('face');
  const [savedRecords, setSavedRecords] = useState<DivinationRecord[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string>('');

  // Load saved fortune records from LocalStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem('thien_co_cac_records');
      if (data) {
        const parsed = JSON.parse(data);
        setSavedRecords(parsed);
        syncDossierRecordCounts(parsed);
      }
    } catch (e) {
      console.error("Could not load stored records:", e);
    }
  }, []);

  // Save fortune record
  const handleSaveRecord = (item: { 
    title: string; 
    summary: string; 
    fullContent: string; 
    type: DivinationRecord['type'];
    personName?: string;
    capturedImage?: string;
  }) => {
    let defaultPersonName = '';
    try {
      defaultPersonName = localStorage.getItem('thien_co_cac_user_name') || '';
    } catch {}

    const newRecord: DivinationRecord = {
      id: Date.now().toString(),
      ...item,
      personName: item.personName || defaultPersonName || 'Hữu Duyên Khách',
      date: new Date().toLocaleString('vi-VN')
    };
    const updated = [newRecord, ...savedRecords];
    setSavedRecords(updated);
    syncDossierRecordCounts(updated);
    try {
      localStorage.setItem('thien_co_cac_records', JSON.stringify(updated));
    } catch (e) {
      console.error("Could not save to localStorage:", e);
    }
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    syncDossierRecordCounts(updated);
    localStorage.setItem('thien_co_cac_records', JSON.stringify(updated));
  };

  const handleClearAllRecords = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sổ tay lưu quẻ không?")) {
      setSavedRecords([]);
      syncDossierRecordCounts([]);
      localStorage.removeItem('thien_co_cac_records');
    }
  };

  const handleImportRecords = (imported: DivinationRecord[]) => {
    const merged = [...imported, ...savedRecords];
    // Remove duplicates by ID
    const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
    setSavedRecords(unique);
    syncDossierRecordCounts(unique);
    localStorage.setItem('thien_co_cac_records', JSON.stringify(unique));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Mystical Background Stars & Nebulas */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
      <div className="fixed top-1/3 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedRecords.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 relative z-10">
        {/* Large Interactive Anime Guide Character (Visible on Home & Guides) */}
        {currentTab === 'home' && (
          <AnimeGuide
            onQuickQuestion={(q) => {
              setActiveQuestion(q);
            }}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
            }}
          />
        )}

        {/* Tab 1: Home / I-Ching Free Toss & Dossiers */}
        {currentTab === 'home' && (
          <div className="space-y-6">
            {/* Hồ Sơ Những Người Đã Xem Trước Đó - Xuất hiện ngay khi vào app */}
            <RecentDossiersBanner onNavigateTab={setCurrentTab} />

            <IChingDivination
              initialQuestion={activeQuestion}
              onSaveResult={handleSaveRecord}
            />

            {/* Quick Explore Grid to Other Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 pt-4">
              <div
                onClick={() => setCurrentTab('tuvi')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-amber-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 mb-2.5 group-hover:scale-110 transition">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-mystic font-bold text-amber-300 text-sm">Tử Vi Lý Số</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Đổi lịch Âm Dương thiên văn, an sao 12 cung chuẩn xác.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('compass')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 mb-2.5 group-hover:scale-110 transition">
                  <Navigation className="w-5 h-5" />
                </div>
                <h3 className="font-mystic font-bold text-emerald-300 text-sm">La Bàn Bát Trạch</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Xoay 360°, định 4 hướng tốt, 4 hướng xấu theo Cung Phi.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('numerology')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-indigo-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 mb-2.5 group-hover:scale-110 transition">
                  <Binary className="w-5 h-5" />
                </div>
                <h3 className="font-mystic font-bold text-indigo-300 text-sm">Thần Số Học</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Số chủ đạo, số linh hồn, năm cá nhân và kim tự tháp.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('love_match')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-300 mb-2.5 group-hover:scale-110 transition">
                  <Heart className="w-5 h-5 fill-rose-300/40" />
                </div>
                <h3 className="font-mystic font-bold text-rose-300 text-sm">Hợp Duyên Bát Tự</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Chấm điểm Ngũ Hành, Can Chi, Cung Phi Bát Tự 2 người.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('facepalm')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-purple-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 mb-2.5 group-hover:scale-110 transition">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-mystic font-bold text-purple-300 text-sm">Nhân Diện & Chỉ Tay</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Dùng camera soi tướng mạo Tam Đình Ngũ Quan & 3 chỉ tay.
                </p>
              </div>

              <div
                onClick={() => setCurrentTab('western')}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-400/50 p-4 rounded-2xl cursor-pointer transition shadow-lg group"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-2.5 group-hover:scale-110 transition">
                  <Moon className="w-5 h-5" />
                </div>
                <h3 className="font-mystic font-bold text-cyan-300 text-sm">Tarot & Cầu Pha Lê</h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  Trải bài Tarot 3 lá và nhận sấm truyền từ khối pha lê.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Tử Vi Lý Số */}
        {currentTab === 'tuvi' && (
          <TuViHoroscope
            onSaveResult={handleSaveRecord}
            onNavigateTab={(tab, subMode) => {
              if (tab === 'facepalm' && subMode) {
                setFacePalmInitialMode(subMode);
              }
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 3: La Bàn Bát Trạch Số Hóa */}
        {currentTab === 'compass' && (
          <FengShuiCompass onSaveResult={handleSaveRecord} />
        )}

        {/* Tab 4: Thần Số Học Pythagoras */}
        {currentTab === 'numerology' && (
          <NumerologyView onSaveResult={handleSaveRecord} />
        )}

        {/* Tab 5: Hợp Duyên Tình Cảm Bát Tự */}
        {currentTab === 'love_match' && (
          <LoveMatch onSaveResult={handleSaveRecord} />
        )}

        {/* Tab 6: Face & Palm Reading */}
        {currentTab === 'facepalm' && (
          <FaceAndPalmReading
            initialMode={facePalmInitialMode}
            onSaveResult={handleSaveRecord}
          />
        )}

        {/* Tab 7: Western Divination (Tarot & Crystal Ball) */}
        {currentTab === 'western' && (
          <WesternDivination onSaveResult={handleSaveRecord} />
        )}

        {/* Tab 8: History Log & Storage Backup */}
        {currentTab === 'history' && (
          <HistoryModal
            records={savedRecords}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAllRecords}
            onImportRecords={handleImportRecords}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-mystic text-sm">☯ Thiên Cơ Các</span>
            <span>• Vận Mệnh Do Tâm, Họa Phúc Do Hành</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Dữ liệu lưu an toàn trên máy bạn • Bấm Ctrl+D để lưu trang</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
