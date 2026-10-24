import React, { useState, useEffect, useRef } from 'react';
import { NavTab, UserDossier } from '../types';
import { 
  getActiveDossierName, 
  getUserDossiers, 
  setActiveDossierName 
} from '../services/dossierService';
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
  Check 
} from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, savedCount }) => {
  const [activeDossier, setActiveDossier] = useState<string>('');
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [showDossierDropdown, setShowDossierDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const refreshDossiers = () => {
    setActiveDossier(getActiveDossierName());
    setDossiers(getUserDossiers());
  };

  useEffect(() => {
    refreshDossiers();
    const handleUpdate = () => refreshDossiers();
    window.addEventListener('thien_co_cac_active_name_changed', handleUpdate);
    window.addEventListener('thien_co_cac_dossier_updated', handleUpdate);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDossierDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleUpdate);
      window.removeEventListener('thien_co_cac_dossier_updated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const tabs = [
    { id: 'home', label: 'Sảnh Tiên Tri & Kinh Dịch', icon: Compass },
    { id: 'tuvi', label: 'Tử Vi Lý Số', icon: Sparkles },
    { id: 'compass', label: 'La Bàn Bát Trạch', icon: Navigation },
    { id: 'numerology', label: 'Thần Số Học', icon: Binary },
    { id: 'love_match', label: 'Hợp Duyên Tình Cảm', icon: Heart },
    { id: 'facepalm', label: 'Tướng Mặt & Chỉ Tay AI', icon: Eye },
    { id: 'western', label: 'Tarot & Cầu Thủy Tinh', icon: Moon },
    { id: 'history', label: `Sổ Vận Mệnh (${savedCount})`, icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/85 border-b border-amber-500/20 shadow-lg shadow-purple-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo */}
        <div 
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-purple-600 to-indigo-900 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/30 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border border-amber-400/40">
              <span className="text-amber-400 font-mystic text-lg font-bold">☯</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mystic text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
                THIÊN CƠ CÁC
              </span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 font-semibold tracking-normal">
                AI 2.5
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-light hidden sm:block">
              Huyền Thuật Đông Tây • La Bàn Bát Trạch & Tử Vi Thần Toán
            </p>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          <nav className="flex items-center gap-1 sm:gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id as NavTab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20 font-bold'
                      : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Active Dossier Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDossierDropdown(!showDossierDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/90 hover:bg-amber-500/10 text-amber-300 border border-amber-400/40 shadow-sm transition whitespace-nowrap"
              title="Đương số đang kích hoạt (bấm để đổi người khác)"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 font-normal hidden md:inline">Đương số:</span>
              <span className="font-bold max-w-[110px] truncate">{activeDossier || 'Khách Vãng Lai'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showDossierDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 border border-amber-500/40 rounded-2xl shadow-2xl p-2 z-50 backdrop-blur-md animate-fadeIn">
                <div className="px-3 py-1.5 border-b border-slate-800 text-[11px] font-bold text-amber-400 flex items-center justify-between">
                  <span>HỒ SƠ ĐÃ LƯU ({dossiers.length})</span>
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
                  {dossiers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      Chưa có hồ sơ nào. Bắt đầu xem Tử Vi hoặc gieo quẻ để tự động lưu!
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
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                              : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div>{d.fullName}</div>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
