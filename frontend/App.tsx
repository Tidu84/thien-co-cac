import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { NavTab, DivinationRecord } from './types';
import { Navbar } from './components/Navbar';
import { AnimeGuide } from './components/AnimeGuide';
import { IChingDivination } from './components/IChingDivination';
import { RecentDossiersBanner } from './components/RecentDossiersBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getUserDossiers, syncDossierRecordCounts, syncDossiersWithCloudNow } from './services/dossierService';
import { pushRecordToCloudAsync, deleteRecordFromCloud } from './services/cloudStorageService';
import { pushRecordToFirebaseAsync, deleteRecordFromFirebase } from './services/firebaseService';

const TuViHoroscope = lazy(() => import('./components/TuViHoroscope').then(m => ({ default: m.TuViHoroscope })));
const LoveMatch = lazy(() => import('./components/LoveMatch').then(m => ({ default: m.LoveMatch })));
const NumerologyView = lazy(() => import('./components/NumerologyView').then(m => ({ default: m.NumerologyView })));
const FengShuiCompass = lazy(() => import('./components/FengShuiCompass').then(m => ({ default: m.FengShuiCompass })));
const FaceAndPalmReading = lazy(() => import('./components/FaceAndPalmReading').then(m => ({ default: m.FaceAndPalmReading })));
const WesternDivination = lazy(() => import('./components/WesternDivination').then(m => ({ default: m.WesternDivination })));
const HistoryModal = lazy(() => import('./components/HistoryModal').then(m => ({ default: m.HistoryModal })));
const AuthModal = lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const AdminModal = lazy(() => import('./components/AdminModal').then(m => ({ default: m.AdminModal })));

const TabLoadingFallback = () => (
  <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-300/80">
    <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
    <span className="text-xs font-mystic tracking-wider">Đang khai mở thiên cơ...</span>
  </div>
);

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [facePalmInitialMode, setFacePalmInitialMode] = useState<'face' | 'palm' | 'body'>('face');
  const [savedRecords, setSavedRecords] = useState<DivinationRecord[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<string>('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleNavigateTab = useCallback((tab: NavTab, subMode?: 'face' | 'palm' | 'body') => {
    if (tab === 'facepalm' && subMode) {
      setFacePalmInitialMode(subMode);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load saved fortune records from LocalStorage & Cloud auto-sync
  useEffect(() => {
    const handleAuthRequest = () => setShowAuthModal(true);
    window.addEventListener('thien_co_cac_request_auth', handleAuthRequest);
    try {
      const curName = localStorage.getItem('thien_co_cac_user_name') || '';
      const curLower = curName.toLowerCase();
      if (curLower.includes('tidu') || curLower.includes('dũng') || curLower.includes('dung')) {
        localStorage.removeItem('thien_co_cac_user_name');
      }

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

    syncDossiersWithCloudNow().catch(() => {});

    return () => {
      window.removeEventListener('thien_co_cac_request_auth', handleAuthRequest);
    };
  }, []);

  // Save fortune record
  const handleSaveRecord = useCallback((item: { 
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
    setSavedRecords(prev => {
      const updated = [newRecord, ...prev];
      syncDossierRecordCounts(updated);
      try {
        localStorage.setItem('thien_co_cac_records', JSON.stringify(updated));
      } catch (e) {
        console.error("Could not save to localStorage:", e);
      }
      return updated;
    });

    pushRecordToFirebaseAsync(newRecord);
    pushRecordToCloudAsync(newRecord);
  }, []);

  const handleDeleteRecord = useCallback((id: string) => {
    setSavedRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      syncDossierRecordCounts(updated);
      localStorage.setItem('thien_co_cac_records', JSON.stringify(updated));
      return updated;
    });
    deleteRecordFromFirebase(id);
    deleteRecordFromCloud(id);
  }, []);

  const handleClearAllRecords = useCallback(() => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ sổ tay lưu quẻ không?")) {
      setSavedRecords([]);
      syncDossierRecordCounts([]);
      localStorage.removeItem('thien_co_cac_records');
    }
  }, []);

  const handleImportRecords = useCallback((imported: DivinationRecord[]) => {
    setSavedRecords(prev => {
      const merged = [...imported, ...prev];
      const unique = Array.from(new Map(merged.map(item => [item.id, item])).values());
      syncDossierRecordCounts(unique);
      localStorage.setItem('thien_co_cac_records', JSON.stringify(unique));
      return unique;
    });
  }, []);

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
            <RecentDossiersBanner onNavigateTab={handleNavigateTab} />
            <AnimeGuide
              onQuickQuestion={setActiveQuestion}
              onNavigateTab={handleNavigateTab}
            />
            <IChingDivination
              initialQuestion={activeQuestion}
              onSaveResult={handleSaveRecord}
            />
          </div>
        )}

        <Suspense fallback={<TabLoadingFallback />}>
          {/* Tab 2: Tử Vi Lý Số */}
          {currentTab === 'tuvi' && (
            <ErrorBoundary fallbackTitle="Lỗi hiển thị Tử Vi Lý Số">
              <TuViHoroscope
                onSaveResult={handleSaveRecord}
                onNavigateTab={handleNavigateTab}
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
        </Suspense>
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
      {showAuthModal && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onSuccess={(user) => {
              if (user.role === 'admin') {
                setShowAdminModal(true);
              }
            }}
          />
        </Suspense>
      )}

      {/* Admin Management Modal (Dành riêng cho Quản Trị Viên) */}
      {showAdminModal && (
        <ErrorBoundary fallbackTitle="Lỗi hiển thị Bảng Quản Trị Admin">
          <Suspense fallback={null}>
            <AdminModal
              isOpen={showAdminModal}
              onClose={() => setShowAdminModal(false)}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
