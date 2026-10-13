import React, { useState } from 'react';
import { NavTab } from '../types';
import { MobileAndGitHubModal } from './MobileAndGitHubModal';
import { Compass, Sparkles, User, Eye, Bookmark, Moon, HelpCircle, HardDrive, Star, X, Heart, Binary, Navigation, Smartphone, Github } from 'lucide-react';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, savedCount }) => {
  const [showSaveHelp, setShowSaveHelp] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-amber-500/20 shadow-lg shadow-purple-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
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
            <nav className="flex items-center gap-1 sm:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectTab(tab.id as NavTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 via-purple-600/30 to-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm shadow-amber-500/20'
                        : 'text-slate-300 hover:text-amber-200 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Nút Xem trên Điện Thoại & GitHub */}
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-amber-500/20 to-purple-600/30 hover:from-amber-500/30 hover:to-purple-600/40 text-amber-300 border border-amber-400/50 transition whitespace-nowrap shadow-sm shadow-amber-500/20"
              title="Mở mã QR quét xem trên điện thoại và hướng dẫn push GitHub"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Mở Trên Điện Thoại & GitHub</span>
            </button>

            {/* Help / Storage Modal Button */}
            <button
              onClick={() => setShowSaveHelp(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs bg-slate-900 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition whitespace-nowrap shadow"
              title="Xem ứng dụng được lưu ở đâu và cách mở lại"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Lưu ở đâu?</span>
            </button>
          </div>
        </div>
      </header>

      {/* MODAL MỞ TRÊN ĐIỆN THOẠI & GITHUB */}
      <MobileAndGitHubModal
        isOpen={showMobileModal}
        onClose={() => setShowMobileModal(false)}
      />

      {/* STORAGE & ACCESS HELP POPUP MODAL */}
      {showSaveHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative text-slate-200">
            <button
              onClick={() => setShowSaveHelp(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📌</span>
              <h3 className="font-mystic font-bold text-lg text-amber-300">
                Ứng dụng này lưu ở đâu? Cách mở lại?
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>Cách 1: Lưu Bookmark để mở lại mỗi ngày</span>
                </h4>
                <p className="text-slate-300">
                  Nhấn tổ hợp phím <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">Ctrl + D</kbd> (hoặc <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-amber-300 font-mono">Cmd + D</kbd> trên Mac) ngay trên trình duyệt để thêm trang này vào thanh dấu trang (Bookmarks). Lần sau bạn chỉ cần bấm vào là mở ra ngay!
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <HardDrive className="w-4 h-4 text-purple-400" />
                  <span>Cách 2: Vào lại từ Vertex AI Studio / Google Cloud</span>
                </h4>
                <p className="text-slate-300">
                  Mã nguồn và ứng dụng được lưu trực tiếp trong tài khoản <strong>Google Vertex AI Studio</strong> của bạn. Bất cứ khi nào đăng nhập vào lại phiên trò chuyện này, app sẽ tự động hiển thị và chạy mượt mà.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <Bookmark className="w-4 h-4 text-emerald-400" />
                  <span>Cách 3: Sao lưu quẻ bói về máy vĩnh viễn</span>
                </h4>
                <p className="text-slate-300">
                  Vào tab <strong>"Sổ Vận Mệnh"</strong>, bạn có thể ấn nút <strong>"Tải dữ liệu về máy (.JSON)"</strong> để lưu lại toàn bộ các quẻ bói, tử vi, chỉ tay vào ổ cứng cá nhân.
                </p>
              </div>
            </div>

            <div className="mt-5 text-center">
              <button
                onClick={() => setShowSaveHelp(false)}
                className="px-6 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md active:scale-95 transition"
              >
                Đã hiểu, đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
