// frontend/components/Navbar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { NavTab, UserDossier } from '../types';
import { 
  getActiveDossierName, 
  getUserDossiers, 
  setActiveDossierName,
  syncDossiersWithCloudNow 
} from '../services/dossierService';
import { 
  getCurrentUser, 
  logoutUser, 
  AuthUser 
} from '../services/authService';
import { 
  Compass, 
  Sparkles, 
  User, 
  Eye, 
  Bookmark, 
  Moon, 
  Heart, 
  Binary, 
  Navigation, 
  ChevronDown, 
  Check,
  LogIn,
  LogOut,
  ShieldCheck,
  Flame,
  RefreshCw,
  Lock
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentTab, 
  onSelectTab, 
  savedCount,
  onOpenAuth,
  onOpenAdmin
}) => {
  const [activeDossier, setActiveDossier] = useState<string>('');
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [showDossierDropdown, setShowDossierDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  const handleSyncFirebase = async () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    setIsSyncing(true);
    try {
      const merged = await syncDossiersWithCloudNow();
      setDossiers(merged);
      setSyncToast('🔥 Đã đồng bộ thành công với Google Firebase!');
      setTimeout(() => setSyncToast(''), 3500);
    } catch (e) {
      setSyncToast('❌ Lỗi đồng bộ, vui lòng thử lại');
      setTimeout(() => setSyncToast(''), 3500);
    } finally {
      setIsSyncing(false);
    }
  };

  const refreshDossiers = () => {
    setActiveDossier(getActiveDossierName());
    setDossiers(getUserDossiers());
  };

  useEffect(() => {
    refreshDossiers();
    setCurrentUser(getCurrentUser());

    const handleUpdate = () => refreshDossiers();
    const handleAuth = () => setCurrentUser(getCurrentUser());

    window.addEventListener('thien_co_cac_active_name_changed', handleUpdate);
    window.addEventListener('thien_co_cac_dossier_updated', handleUpdate);
    window.addEventListener('thien_co_cac_auth_changed', handleAuth);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDossierDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleUpdate);
      window.removeEventListener('thien_co_cac_dossier_updated', handleUpdate);
      window.removeEventListener('thien_co_cac_auth_changed', handleAuth);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setShowUserDropdown(false);
  };

  const tabs = [
    { id: 'home', label: 'Sảnh Tiên Tri', icon: Compass },
    { id: 'tuvi', label: 'Tử Vi Lý Số', icon: Sparkles },
    { id: 'compass', label: 'La Bàn Bát Trạch', icon: Navigation },
    { id: 'numerology', label: 'Thần Số Học', icon: Binary },
    { id: 'love_match', label: 'Hợp Duyên', icon: Heart },
    { id: 'facepalm', label: 'Tướng Mặt & Chỉ Tay', icon: Eye },
    { id: 'western', label: 'Tarot & Pha Lê', icon: Moon },
    { id: 'history', label: `Sổ Vận Mệnh (${savedCount})`, icon: Bookmark },
  ];
  const mainTabs = tabs.filter(t => t.id !== 'history');
  const activeTab = tabs.find(tab => tab.id === currentTab) || tabs[0];
  const ActiveTabIcon = activeTab.icon;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 shadow-lg shadow-slate-950/50 overflow-x-clip">
      <div className="max-w-7xl mx-auto px-1.5 sm:px-6 py-1 sm:py-2.5">
        {/* TẦNG 1: LOGO + HỒ SƠ ĐANG XEM + SỔ VẬN MỆNH + TÀI KHOẢN */}
        <div className="flex items-center justify-between gap-1 sm:gap-3 w-full">
          {/* Logo */}
          <div 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-1 sm:gap-2 cursor-pointer group min-w-0 flex-1 overflow-hidden"
          >
            <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-900 flex items-center justify-center p-0.5 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                <span className="text-amber-400 font-mystic text-[10px] sm:text-base font-bold">☯</span>
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center">
                <span className="font-mystic text-[11px] xs:text-xs sm:text-base md:text-lg font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 truncate block">
                  THIÊN CƠ CÁC
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-light hidden sm:block">
                Nhân duyên • Tiền căn • Hệ quả
              </p>
            </div>
          </div>

          {/* Cụm Tiện Ích Bên Phải (Đương số + Sổ Vận Mệnh + Tài khoản) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Quick Active Dossier Switcher */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setShowDossierDropdown(!showDossierDropdown)}
                className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10.5px] sm:text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-amber-400/40 transition whitespace-nowrap shrink-0"
                title="Đương số đang xem (bấm để đổi hoặc chọn hồ sơ trống)"
              >
                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 hidden lg:inline">Đang xem:</span>
                <span className="font-semibold text-amber-300 max-w-[36px] xs:max-w-[60px] sm:max-w-[130px] truncate">
                  {activeDossier || 'Khách'}
                </span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />
              </button>

              {showDossierDropdown && (
                <>
                  {/* Backdrop cho mobile đóng khi bấm ra ngoài */}
                  <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
                    onClick={() => setShowDossierDropdown(false)}
                  />
                  <div 
                    className="fixed inset-x-2 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm mx-auto bg-slate-950 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-2.5 z-50 animate-fadeIn"
                    style={{ backgroundColor: '#020617' }}
                  >
                    <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-amber-400 flex items-center justify-between">
                      <span>{currentUser ? `HỒ SƠ ĐÃ LƯU (${dossiers.length})` : 'HỒ SƠ CỦA BẠN (CỤC BỘ)'}</span>
                      <button
                        onClick={() => {
                          setShowDossierDropdown(false);
                          onSelectTab('home');
                        }}
                        className="text-slate-400 hover:text-amber-300 text-[10px]"
                      >
                        Quản lý &rarr;
                      </button>
                    </div>
                    
                    <div className="max-h-56 overflow-y-auto space-y-1 py-1">
                      {/* MỤC HỒ SƠ TRỐNG (KHÁCH VÃNG LAI) */}
                      <div
                        onClick={() => {
                          setActiveDossierName('');
                          setActiveDossier('');
                          setShowDossierDropdown(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition mb-1 ${
                          !activeDossier
                            ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white border border-dashed border-slate-700/60'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                            <span className="font-semibold text-slate-200">Hồ sơ trống</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Khách vãng lai • Chưa chọn người
                          </div>
                        </div>
                        {!activeDossier && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      </div>

                      {dossiers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Chưa có hồ sơ nào trên máy này. Bắt đầu xem Tử Vi hoặc gieo quẻ để tự động lưu!
                        </div>
                      ) : (
                        dossiers.map(d => {
                          const isSel = d.fullName === activeDossier;
                          return (
                            <div
                              key={d.id}
                              onClick={() => {
                                setActiveDossierName(d.fullName);
                                setActiveDossier(d.fullName);
                                setShowDossierDropdown(false);
                              }}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                                isSel 
                                  ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' 
                                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                              }`}
                            >
                              <div className="truncate pr-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate">{d.fullName}</span>
                                  {d.relation && d.relation !== 'Bản thân' && (
                                    <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                                      {d.relation}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-500 font-normal">
                                  {d.birthDate || d.canChiYear || 'Chưa cập nhật ngày sinh'}
                                </div>
                              </div>
                              {isSel && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="p-1.5 border-t border-slate-800 mt-1">
                      {currentUser ? (
                        <button
                          onClick={() => {
                            handleSyncFirebase();
                            setShowDossierDropdown(false);
                          }}
                          disabled={isSyncing}
                          className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                        >
                          <RefreshCw className={`w-3 h-3 text-amber-400 ${isSyncing ? 'animate-spin' : ''}`} />
                          <span>{isSyncing ? 'Đang đồng bộ đám mây...' : 'Đồng bộ đám mây (Tự động)'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setShowDossierDropdown(false);
                            onOpenAuth();
                          }}
                          className="w-full py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
                        >
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>Đăng nhập để xem hộ & lưu Cloud</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Nút Sổ Vận Mệnh */}
            <button
              onClick={() => onSelectTab('history')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border shrink-0 ${
                currentTab === 'history'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700/80'
              }`}
              title="Sổ Vận Mệnh đã lưu"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Sổ Vận Mệnh</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Khu vực Tài khoản & Admin */}
            <div className="relative shrink-0" ref={userDropdownRef}>
              {currentUser ? (
                <div className="flex items-center gap-1 sm:gap-1.5">
                  {currentUser.role === 'admin' ? (
                    <button
                      onClick={onOpenAdmin}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 transition whitespace-nowrap shrink-0"
                      title="Mở Bảng Quản Trị Admin"
                    >
                      <span>👑 Admin</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center gap-1 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-medium bg-slate-900 text-slate-200 border border-slate-700/80 hover:bg-slate-800 transition shrink-0"
                    >
                      <span>{currentUser.avatar || '👤'}</span>
                      <span className="max-w-[48px] sm:max-w-[90px] truncate hidden xs:inline">{currentUser.fullName}</span>
                      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-1 sm:p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-800 transition shrink-0"
                    title="Đăng xuất"
                  >
                    <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[10.5px] sm:text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition whitespace-nowrap shrink-0 active:scale-95 shadow-sm shadow-amber-500/20"
                >
                  <LogIn className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span>Đăng Nhập</span>
                </button>
              )}

              {showUserDropdown && currentUser && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div 
                    className="fixed inset-x-2 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64 max-w-xs mx-auto bg-slate-950 border-2 border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn"
                    style={{ backgroundColor: '#020617' }}
                  >
                    <div className="p-2 border-b border-slate-800 text-xs">
                      <p className="font-bold text-amber-300 truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">@{currentUser.username}</p>
                      <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    </div>
                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-300 hover:bg-red-950/40 font-semibold flex items-center gap-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* TẦNG 2 (DESKTOP): THANH ĐIỀU HƯỚNG CÁC MÔN LUẬN ĐOÁN GỌN THOÁNG */}
        <nav className="hidden md:flex items-center justify-center gap-1.5 pt-2 mt-2 border-t border-slate-800/60 overflow-x-auto">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id as NavTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-400/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* TẦNG 2 (MOBILE): MENU THẢ XUỐNG GỌN GÀNG */}
        <div className="md:hidden pt-2 mt-2 border-t border-slate-800/60">
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setShowMobileNav(open => !open)}
              aria-expanded={showMobileNav}
              aria-label="Chọn tính năng"
              className="w-full min-h-9 flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-amber-200 text-xs font-semibold"
            >
              <span className="flex items-center gap-2 min-w-0">
                <ActiveTabIcon className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{activeTab.label}</span>
              </span>
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${showMobileNav ? 'rotate-180' : ''}`} />
            </button>

            {showMobileNav && (
              <nav aria-label="Các tính năng" className="absolute left-0 right-0 top-full mt-1.5 z-50 grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = currentTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        onSelectTab(tab.id as NavTab);
                        setShowMobileNav(false);
                      }}
                      className={`min-h-9 flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-left text-[11px] font-medium ${
                        isActive
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-400/50 font-semibold'
                          : 'bg-slate-800/80 text-slate-300 border border-slate-700/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="leading-tight truncate">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Toast Thông Báo Kết Quả Đồng Bộ Firebase */}
      {syncToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-slate-900 text-amber-300 font-semibold text-xs shadow-2xl border border-amber-400/50 flex items-center gap-2">
          <span>{syncToast}</span>
        </div>
      )}
    </header>
  );
};
