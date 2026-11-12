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
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { getUserDossiers, syncDossierRecordCounts, syncDossiersWithCloudNow } from './services/dossierService';
import { pushRecordToCloudAsync, deleteRecordFromCloud } from './services/cloudStorageService';
import { pushRecordToFirebaseAsync, deleteRecordFromFirebase } from './services/firebaseService';
import { Compass, Sparkles, Moon, Eye, Heart, Binary, Navigation } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [facePalmInitialMode, setFacePalmInitialMode] = useState<'face' | 'palm' | 'body'>('face');
  const [savedRecords, setSavedRecords] = useState<DivinationRecord[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Load saved fortune records from LocalStorage & Cloud auto-sync
  useEffect(() => {
    const handleAuthRequest = () => {
      setShowAuthModal(true);
    };
    window.addEventListener('thien_co_cac_request_auth', handleAuthRequest);
    try {
      // Dọn dẹp tên active nếu là hồ sơ cần xóa
      const curName = localStorage.getItem('thien_co_cac_user_name') || '';
      const curLower = curName.toLowerCase();
      if (curLower.includes('tidu') || curLower.includes('dũng') || curLower.includes('dung')) {
        localStorage.removeItem('thien_co_cac_user_name');
      }

      // Dọn dẹp và cô lập hồ sơ theo thiết bị/tài khoản (loại bỏ 63 hồ sơ của người khác)
      getUserDossiers();

      const data = localStorage.getItem('thien_co_cac_records');
      if (data) {
        let parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          parsed = parsed.filter((r: any) => {
            const name = (r.personName || '').toLowerCase();
            return !name.includes('tidu') && !name.includes('dũng') && !name.includes('dung');
          });
          localStorage.setItem('thien_co_cac_records', JSON.stringify(parsed));
        }
        setSavedRecords(parsed);
        syncDossierRecordCounts(parsed);
      }
    } catch (e) {
      console.error("Could not load stored records:", e);
    }

    // Tự động đồng bộ hồ sơ đám mây khi mở ứng dụng (chỉ khi đã đăng nhập)
    syncDossiersWithCloudNow().catch(err => console.log("[Cloud] Initial sync silent:", err));

    return () => {
      window.removeEventListener('thien_co_cac_request_auth', handleAuthRequest);
    };
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

    // Tự động đẩy quẻ lên Google Firebase & Cloud
    pushRecordToFirebaseAsync(newRecord);
    pushRecordToCloudAsync(newRecord);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = savedRecords.filter(r => r.id !== id);
    setSavedRecords(updated);
    syncDossierRecordCounts(updated);
    localStorage.setItem('thien_co_cac_records', JSON.stringify(updated));
    deleteRecordFromFirebase(id);
    deleteRecordFromCloud(id);
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
    <div className="mobile-lite min-h-screen bg-slate-950 text-slate-100 flex flex-col relative">
      {/* Mystical Background Stars & Nebulas */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))]" />
      <div className="fixed top-1/3 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-10 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        savedCount={savedRecords.length}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 relative z-10">
        {/* Tab 1: Home / Sảnh Tiên Tri & Kinh Dịch */}
        {currentTab === 'home' && (
          <div className="space-y-5">
            {/* Thanh Đương Số Đang Xem (Thu gọn 1 dòng, bấm mới xổ danh sách) */}
            <RecentDossiersBanner
              onNavigateTab={(tab, subMode) => {
                if (tab === 'facepalm' && subMode) {
                  setFacePalmInitialMode(subMode);
                }
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Khung Đàm Đạo Cùng Thầy Bói / Tiên Nương */}
            <AnimeGuide
              onQuickQuestion={(q) => {
                setActiveQuestion(q);
              }}
              onNavigateTab={(tab, subMode) => {
                if (tab === 'facepalm' && subMode) {
                  setFacePalmInitialMode(subMode);
                }
                setCurrentTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Bàn Gieo Quẻ Kinh Dịch */}
            <IChingDivination
              initialQuestion={activeQuestion}
              onSaveResult={handleSaveRecord}
            />
          </div>
        )}

        {/* Tab 2: Tử Vi Lý Số */}
        {currentTab === 'tuvi' && (
          <ErrorBoundary fallbackTitle="Lỗi hiển thị Tử Vi Lý Số">
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
          </ErrorBoundary>
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
            <span className="text-amber-400 font-serif-title text-sm tracking-wide">☯ Xem bói - Nhân duyên - Tiền căn - Hệ quả</span>
            <span>• Tidu Production</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Dữ liệu đã lưu an toàn trên máy bạn</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Đăng nhập / Đăng ký) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          if (user.role === 'admin') {
            setShowAdminModal(true);
          }
        }}
      />

      {/* Admin Management Modal (Dành riêng cho Quản Trị Viên) */}
      {showAdminModal && (
        <ErrorBoundary fallbackTitle="Lỗi hiển thị Bảng Quản Trị Admin">
          <AdminModal
            isOpen={showAdminModal}
            onClose={() => setShowAdminModal(false)}
          />
        </ErrorBoundary>
      )}
    </div>
  );
}
