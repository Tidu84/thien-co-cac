import { BirthDateSelector } from './BirthDateSelector';
import React, { useState, useEffect } from 'react';
import { useAppVoice } from '../contexts/VoiceContext';
import { UserDossier, NavTab } from '../types';
import { 
  getUserDossiers, 
  getActiveDossierName, 
  setActiveDossierName, 
  upsertUserDossier, 
  deleteUserDossier,
  syncDossiersWithCloudNow
} from '../services/dossierService';
import { getCloudConfig } from '../services/cloudStorageService';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  Calendar, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Bookmark, 
  X,
  ShieldCheck,
  Flame,
  Search,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkle,
  Briefcase,
  Heart,
  ShieldAlert,
  Award,
  ScrollText,
  Compass,
  Layers,
  Camera,
  Hand,
  Eye,
  Activity,
  Cloud,
  RefreshCw,
  Filter,
  Lock
} from 'lucide-react';
import { getCurrentUser } from '../services/authService';
import { buildTuViProfileAndLifeDossier, CompleteTuViBundle } from '../services/tuViService';
import { MasterDestinySynthesisModal } from './MasterDestinySynthesisModal';

interface RecentDossiersBannerProps {
  onNavigateTab: (tab: NavTab, subMode?: 'face' | 'palm' | 'body') => void;
}

export const RecentDossiersBanner: React.FC<RecentDossiersBannerProps> = ({ onNavigateTab }) => {
  const { speak, stopSpeaking: stopAppSpeaking } = useAppVoice();
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [activeName, setActiveName] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Modal xem Bảng Tử Vi & Luận Bàn Bản Mệnh Cả Đời của hồ sơ được chọn
  const [viewingTuViBundle, setViewingTuViBundle] = useState<CompleteTuViBundle | null>(null);
  const [viewingDossier, setViewingDossier] = useState<UserDossier | null>(null);
  const [modalTab, setModalTab] = useState<'photos' | 'tamKy' | 'fivePillars' | 'palaces' | 'scores'>('photos');
  const [previewZoomImage, setPreviewZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [synthesisDossier, setSynthesisDossier] = useState<UserDossier | null>(null);

  // Form thêm hồ sơ mới & Xem hộ người quen
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<string>('Bản thân');
  const [newGender, setNewGender] = useState<'nam' | 'nu'>('nam');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newBirthHour, setNewBirthHour] = useState('Thìn (07h00 - 09h00)');
  const [newNotes, setNewNotes] = useState('');

  // Modal bổ sung ngày sinh cho hồ sơ chưa có ngày sinh
  const [dossierToEditBirthDate, setDossierToEditBirthDate] = useState<UserDossier | null>(null);
  const [supplementBirthDate, setSupplementBirthDate] = useState<string>('');
  const [supplementBirthHour, setSupplementBirthHour] = useState<string>('Thìn (07h00 - 09h00)');

  // Lọc và tìm kiếm hồ sơ người thân / người quen
  const [filterRelation, setFilterRelation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [cloudSyncedTime, setCloudSyncedTime] = useState<string>('');
  const [syncSuccessInfo, setSyncSuccessInfo] = useState<{ count: number; time: string; project: string } | null>(null);

  // Nạp danh sách hồ sơ & lắng nghe sự kiện thay đổi
  const reloadDossiers = () => {
    setDossiers(getUserDossiers());
    setActiveName(getActiveDossierName());
  };

  // Khóa cuộn trang nền khi có bất kỳ modal nào đang mở (tránh tương tác nhầm với trang phía dưới)
  const isAnyModalOpen = !!(showAddModal || viewingTuViBundle || previewZoomImage || synthesisDossier || syncSuccessInfo || dossierToEditBirthDate);

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAnyModalOpen]);

  useEffect(() => {
    reloadDossiers();

    const handleUpdate = () => {
      setCurrentUser(getCurrentUser());
      reloadDossiers();
    };
    window.addEventListener('thien_co_cac_dossier_updated', handleUpdate);
    window.addEventListener('thien_co_cac_active_name_changed', handleUpdate);
    window.addEventListener('thien_co_cac_auth_state_changed', handleUpdate);

    return () => {
      window.removeEventListener('thien_co_cac_dossier_updated', handleUpdate);
      window.removeEventListener('thien_co_cac_active_name_changed', handleUpdate);
      window.removeEventListener('thien_co_cac_auth_state_changed', handleUpdate);
    };
  }, []);

  const handleSelectDossier = (dossier: UserDossier, initialTab?: 'photos' | 'tamKy') => {
    setActiveDossierName(dossier.fullName);
    setActiveName(dossier.fullName);

    // BẮT BUỘC: Hồ sơ phải có ngày sinh mới được xem bói / lập lá số Tử Vi!
    if (!dossier.birthDate || !/^\d{4}-\d{1,2}-\d{1,2}$/.test(dossier.birthDate.trim())) {
      setSupplementBirthDate('');
      setSupplementBirthHour(dossier.birthHour || 'Thìn (07h00 - 09h00)');
      setDossierToEditBirthDate(dossier);
      return;
    }

    const bundle = buildTuViProfileAndLifeDossier(dossier);
    if (!bundle) {
      setSupplementBirthDate('');
      setSupplementBirthHour(dossier.birthHour || 'Thìn (07h00 - 09h00)');
      setDossierToEditBirthDate(dossier);
      return;
    }

    setViewingTuViBundle(bundle);
    setViewingDossier(dossier);
    setModalTab(initialTab || (dossier.faceImage || dossier.palmImage || dossier.bodyImage ? 'photos' : 'tamKy'));
  };

  const handleOpenInTuViTab = (dossier: UserDossier) => {
    setActiveDossierName(dossier.fullName);
    setActiveName(dossier.fullName);
    stopVoice();
    setViewingTuViBundle(null);
    setViewingDossier(null);
    onNavigateTab('tuvi');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const speakVoice = (text: string) => {
    const cleanVoiceText = text
      .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return speak(cleanVoiceText, {
      lang: 'vi-VN', tone: 'mystic',
      onStart: () => setIsVoiceSpeaking(true),
      onEnd: () => setIsVoiceSpeaking(false),
      onStop: () => setIsVoiceSpeaking(false),
      onError: () => setIsVoiceSpeaking(false)
    });
  };

  const stopVoice = () => {
    stopAppSpeaking();
    setIsVoiceSpeaking(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn xóa hồ sơ của "${name}" khỏi danh sách không?`)) {
      deleteUserDossier(id);
      reloadDossiers();
    }
  };

  const handleCloudSync = async () => {
    if (!currentUser) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('thien_co_cac_request_auth', {
          detail: {
            mode: 'login',
            message: 'Vui lòng đăng nhập tài khoản để đồng bộ dữ liệu hồ sơ lên Đám Mây Cloud!'
          }
        }));
      }
      return;
    }

    setIsSyncingCloud(true);
    try {
      const merged = await syncDossiersWithCloudNow();
      setDossiers(merged);
      const timeStr = new Date().toLocaleTimeString('vi-VN');
      setCloudSyncedTime(timeStr);
      setSyncSuccessInfo({
        count: merged.length,
        time: timeStr,
        project: 'ai-vibe-coder-vn'
      });
    } catch (e: any) {
      console.warn("Cloud sync error:", e);
      alert("Lỗi khi kết nối Google Cloud: " + (e?.message || e));
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const RELATION_OPTIONS = [
    { label: '👑 Bản thân', value: 'Bản thân' },
    { label: '👨‍👩‍👧 Bố mẹ', value: 'Bố mẹ' },
    { label: '💍 Vợ chồng', value: 'Vợ chồng' },
    { label: '👶 Con cái', value: 'Con cái' },
    { label: '💖 Người yêu', value: 'Người yêu' },
    { label: '🤝 Bạn bè', value: 'Bạn bè' },
    { label: '💼 Đối tác', value: 'Đối tác' },
    { label: '👥 Khác', value: 'Khác' },
  ];

  const filteredDossiers = dossiers.filter(d => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = d.fullName.toLowerCase().includes(q);
      const matchCanChi = (d.canChiYear || '').toLowerCase().includes(q);
      const matchNotes = (d.notes || '').toLowerCase().includes(q);
      if (!matchName && !matchCanChi && !matchNotes) return false;
    }
    if (filterRelation === 'all') return true;
    if (filterRelation === 'self') return !d.relation || d.relation === 'Bản thân';
    if (filterRelation === 'family') return ['Bố mẹ', 'Vợ chồng', 'Con cái'].includes(d.relation || '');
    if (filterRelation === 'friends') return ['Bạn bè', 'Người yêu'].includes(d.relation || '');
    if (filterRelation === 'work') return ['Đối tác', 'Khác'].includes(d.relation || '');
    return true;
  });

  const handleCreateNewDossier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("⚠️ Chức năng Xem Hộ người thân/bạn bè yêu cầu Đăng Nhập tài khoản để lưu trữ đám mây. Chưa đăng nhập chỉ xem cho một mình bản thân bạn!");
      return;
    }

    const trimmed = newName.trim();
    if (!trimmed || trimmed === 'Hồ sơ trống' || trimmed === 'Khách Vãng Lai') {
      alert("⚠️ Bắt buộc phải nhập Họ và Tên của người xem để tạo hồ sơ!");
      return;
    }

    if (!newBirthDate || !/^\d{4}-\d{2}-\d{2}$/.test(newBirthDate)) {
      alert("⚠️ Bắt buộc phải chọn đầy đủ Ngày, Tháng và Năm sinh! Chưa điền ngày tháng năm sinh thì chưa được phép xem bói.");
      return;
    }

    upsertUserDossier({
      fullName: trimmed,
      relation: newRelation,
      gender: newGender,
      birthDate: newBirthDate,
      birthHour: newBirthHour || undefined,
      notes: newNotes || undefined
    });

    setNewName('');
    setNewBirthDate('');
    setNewNotes('');
    setNewRelation('Bản thân');
    setShowAddModal(false);
    reloadDossiers();
  };

  const currentActiveDossier = (activeName && activeName.trim() !== '' && activeName !== 'Khách Vãng Lai' && activeName !== 'Hồ sơ trống')
    ? (dossiers.find(d => d.fullName.trim().toLowerCase() === activeName.trim().toLowerCase()) || null)
    : null;

  return (
    <div className="bg-slate-900/75 border border-slate-800/90 rounded-2xl p-3.5 sm:p-4 shadow-lg backdrop-blur-md transition-all">
      {/* THANH THU GỌN (1 DÒNG DUY NHẤT - HIỂN THỊ ĐƯƠNG SỐ ĐANG XEM) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {currentActiveDossier ? (
            <>
              <div
                onClick={() => handleSelectDossier(currentActiveDossier)}
                className="relative cursor-pointer shrink-0"
              >
                {currentActiveDossier.faceImage ? (
                  <img
                    src={currentActiveDossier.faceImage}
                    alt={currentActiveDossier.fullName}
                    className="w-10 h-10 rounded-xl object-cover border border-amber-400/60"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-base">
                    {currentActiveDossier.gender === 'nu' ? '🌸' : '👤'}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-slate-400">Đang xem cho:</span>
                  <button
                    onClick={() => handleSelectDossier(currentActiveDossier)}
                    className="font-bold text-sm text-amber-300 hover:underline truncate"
                  >
                    {currentActiveDossier.fullName}
                  </button>
                  {currentActiveDossier.relation && currentActiveDossier.relation !== 'Bản thân' && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {currentActiveDossier.relation}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap mt-0.5">
                  <span>{currentActiveDossier.gender === 'nu' ? 'Nữ mạng' : 'Nam mạng'}</span>
                  {currentActiveDossier.canChiYear && (
                    <span>• <strong className="text-slate-200">{currentActiveDossier.canChiYear}</strong></span>
                  )}
                  {currentActiveDossier.birthDate ? (
                    <span>• {currentActiveDossier.birthDate}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSupplementBirthDate('');
                        setSupplementBirthHour(currentActiveDossier.birthHour || 'Thìn (07h00 - 09h00)');
                        setDossierToEditBirthDate(currentActiveDossier);
                      }}
                      className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[10px] hover:bg-rose-500/30 transition flex items-center gap-1 shadow-sm"
                    >
                      ⚠️ Chưa có ngày sinh (Bấm để bổ sung)
                    </button>
                  )}
                  {currentUser ? (
                    <span className="text-emerald-400/80 text-[10px] hidden md:inline">• ☁️ Đã sao lưu Cloud</span>
                  ) : (
                    <span className="text-slate-400 text-[10px] hidden md:inline">• 💾 Lưu tại máy (Cục bộ)</span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-200">Hồ sơ trống • Khách Vãng Lai</p>
                <p className="text-[11px] text-slate-400">Chưa chọn hồ sơ đương số. Bạn có thể chọn từ danh sách hoặc xem tự do.</p>
              </div>
            </div>
          )}
        </div>

        {/* Cụm nút thao tác nhanh gọn gàng */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {currentActiveDossier && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (!currentActiveDossier.birthDate) {
                    setSupplementBirthDate('');
                    setSupplementBirthHour(currentActiveDossier.birthHour || 'Thìn (07h00 - 09h00)');
                    setDossierToEditBirthDate(currentActiveDossier);
                    return;
                  }
                  setSynthesisDossier(currentActiveDossier);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                title="Xem Đại Tổng Luận Vận Mệnh Toàn Thư"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>Đại Tổng Luận</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDossier(currentActiveDossier)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              >
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>Chi Tiết</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDossierName('');
                  setActiveName('');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition active:scale-95"
                title="Chuyển về trạng thái Khách Vãng Lai (Hồ sơ trống)"
              >
                <span>Bỏ chọn</span>
              </button>
            </>
          )}

          {/* NÚT XEM HỘ: YÊU CẦU ĐĂNG NHẬP NẾU CHƯA ĐĂNG NHẬP */}
          {currentUser ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Xem Hộ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('thien_co_cac_request_auth', {
                    detail: {
                      mode: 'login',
                      message: 'Tính năng Xem Hộ người thân/bạn bè yêu cầu Đăng Nhập tài khoản để lưu trữ an toàn trên Đám Mây Cloud.'
                    }
                  }));
                }
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition active:scale-95"
              title="Đăng nhập để mở khóa chức năng Xem Hộ"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Xem Hộ (Cần Đăng Nhập)</span>
            </button>
          )}

          {/* CHỈ HIỆN ĐỔI NGƯỜI KHI ĐÃ ĐĂNG NHẬP VÀ CÓ TỪ 2 HỒ SƠ TRỞ LÊN */}
          {currentUser && dossiers.length > 1 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition ${
                isExpanded
                  ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{isExpanded ? 'Thu gọn' : `Đổi người (${dossiers.length})`}</span>
            </button>
          )}
        </div>
      </div>

      {/* DANH SÁCH HỒ SƠ MỞ RỘNG (CHỈ HIỆN KHI BẤM "ĐỔI NGƯỜI") */}
      {isExpanded && (
        <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-3 animate-fadeIn">
          {/* Bộ Lọc Quan Hệ & Tìm Kiếm Hồ Sơ */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `Tất cả (${dossiers.length})` },
                { id: 'self', label: 'Bản thân' },
                { id: 'family', label: 'Gia đình' },
                { id: 'friends', label: 'Người yêu & Bạn bè' },
                { id: 'work', label: 'Đối tác & Khác' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterRelation(tab.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition whitespace-nowrap ${
                    filterRelation === tab.id
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 font-semibold'
                      : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên, can chi..."
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-400/50 rounded-xl pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <button
                onClick={handleCloudSync}
                disabled={isSyncingCloud}
                className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-300 border border-slate-800 text-[11px] flex items-center gap-1 transition shrink-0"
                title="Đồng bộ thủ công với Google Cloud Firebase"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingCloud ? 'animate-spin text-amber-400' : ''}`} />
                <span className="hidden sm:inline">{isSyncingCloud ? 'Đang lưu...' : 'Đồng bộ mây'}</span>
              </button>
            </div>
          </div>

          {filteredDossiers.length === 0 ? (
            <div className="text-center py-4 px-4 bg-slate-950/50 rounded-xl border border-slate-800/60 text-xs text-slate-400">
              Không tìm thấy hồ sơ phù hợp. Hãy bấm <strong>"+ Xem Hộ"</strong> để tạo mới.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {/* Thẻ Hồ sơ trống (Khách Vãng Lai) */}
              <div
                onClick={() => {
                  setActiveDossierName('');
                  setActiveName('');
                  setIsExpanded(false);
                }}
                className={`p-3 rounded-xl border transition cursor-pointer group flex items-center justify-between gap-2 ${
                  !currentActiveDossier
                    ? 'bg-amber-500/10 border-amber-400/60 text-amber-200'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-sm text-slate-400">
                    ⚪
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs truncate text-slate-100">
                      Hồ sơ trống
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Khách vãng lai • Chưa chọn người
                    </p>
                  </div>
                </div>
                {!currentActiveDossier && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                )}
              </div>

              {filteredDossiers.map((dossier) => {
                const isActive = activeName.trim().toLowerCase() === dossier.fullName.trim().toLowerCase();
                return (
                  <div
                    key={dossier.id}
                    onClick={() => {
                      setActiveDossierName(dossier.fullName);
                      setActiveName(dossier.fullName);
                      setIsExpanded(false);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer group flex items-center justify-between gap-2 ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-400/60 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 text-sm">
                        {dossier.gender === 'nu' ? '🌸' : '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-semibold text-xs truncate text-slate-100">
                            {dossier.fullName}
                          </h4>
                          {dossier.relation && dossier.relation !== 'Bản thân' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 shrink-0">
                              {dossier.relation}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {dossier.canChiYear || dossier.birthDate || (dossier.gender === 'nu' ? 'Nữ mạng' : 'Nam mạng')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDossier(dossier);
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-amber-300 border border-slate-700"
                      >
                        Mở
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, dossier.id, dossier.fullName)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Bảng Tử Vi & Luận Bàn Bản Mệnh Cả Đời */}
      {viewingTuViBundle && (
        <div 
          onClick={() => {
            stopVoice();
            setViewingTuViBundle(null);
          }}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-5 animate-fadeIn overflow-y-auto overscroll-contain touch-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full my-auto bg-slate-900/95 border-2 border-amber-400/60 rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-start gap-3">
                <div className="relative">
                  {viewingDossier?.faceImage ? (
                    <img 
                      src={viewingDossier.faceImage} 
                      alt="Avatar" 
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-amber-400/30 shrink-0 cursor-pointer" 
                      onClick={() => setPreviewZoomImage({ url: viewingDossier.faceImage!, title: `Ảnh Khuôn Mặt: ${viewingDossier.fullName}` })}
                      title="Bấm để phóng to ảnh khuôn mặt"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md shrink-0">
                      {viewingTuViBundle.profile.gender === 'nu' ? '🌸' : '👤'}
                    </div>
                  )}
                  {viewingDossier?.palmImage && (
                    <div 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 border border-purple-400 flex items-center justify-center text-xs shadow cursor-pointer" 
                      onClick={() => setPreviewZoomImage({ url: viewingDossier.palmImage!, title: `Ảnh Chỉ Tay: ${viewingDossier.fullName}` })}
                      title="Đã có ảnh chỉ tay (Bấm để xem)"
                    >
                      ✋
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                      Hồ Sơ Đương Số & Tử Vi Trọn Đời
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {viewingTuViBundle.profile.gender === 'nu' ? 'Nữ mạng' : 'Nam mạng'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Cục: {viewingTuViBundle.profile.cuc}
                    </span>
                    {(viewingDossier?.faceImage || viewingDossier?.palmImage) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 flex items-center gap-1">
                        <Camera className="w-2.5 h-2.5" />
                        <span>Đã lưu ảnh tướng mạo</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-mystic text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 mt-1">
                    {viewingTuViBundle.profile.fullName}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Can Chi: <strong className="text-amber-300">{viewingTuViBundle.profile.canChiYear}</strong> ({viewingTuViBundle.profile.menhNguHanh}) • {viewingTuViBundle.profile.cungMenh} • Cung Thân: {viewingTuViBundle.profile.cungThan} • Giờ: {viewingTuViBundle.profile.birthHour}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {isVoiceSpeaking ? (
                  <button
                    onClick={stopVoice}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng đọc</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const speechText = `Bảng Tử Vi luận giải trọn đời cho đương số ${viewingTuViBundle.profile.fullName}, tuổi ${viewingTuViBundle.profile.canChiYear}, bản mệnh ${viewingTuViBundle.profile.menhNguHanh}. Tiền vận: ${viewingTuViBundle.lifeDossier.tienVan.detail}. Trung vận: ${viewingTuViBundle.lifeDossier.trungVan.detail}. Hậu vận: ${viewingTuViBundle.lifeDossier.hauVan.detail}.`;
                      speakVoice(speechText);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nghe Thầy đọc</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    stopVoice();
                    setViewingTuViBundle(null);
                    setViewingDossier(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition"
                  title="Đóng bảng"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Khẩu Quyết / Lời Phán Tổng Quan */}
            <div className="text-xs sm:text-sm text-amber-200/95 bg-gradient-to-r from-amber-950/60 via-purple-950/50 to-slate-900/80 p-4 rounded-2xl border border-amber-400/40 leading-relaxed italic shadow-inner">
              ☯ <strong className="text-amber-300 not-italic">Khẩu quyết bản mệnh:</strong> "{viewingTuViBundle.generalVerdict}"
            </div>

            {/* Thanh Tab điều hướng nội dung */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => {
                  if (viewingDossier) {
                    setSynthesisDossier(viewingDossier);
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>⭐ ĐẠI TỔNG LUẬN VẬN MỆNH</span>
              </button>

              <button
                onClick={() => setModalTab('photos')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'photos'
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-purple-200 border border-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>1. Tướng Mạo & Chỉ Tay (Ảnh Chụp)</span>
                {(viewingDossier?.faceImage || viewingDossier?.palmImage) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                )}
              </button>

              <button
                onClick={() => setModalTab('tamKy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'tamKy'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>2. Tam Kỳ Vận Mệnh (Tiền - Trung - Hậu Vận)</span>
              </button>

              <button
                onClick={() => setModalTab('fivePillars')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'fivePillars'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3. Ngũ Trụ Cuộc Đời (5 Trụ Cột)</span>
              </button>

              <button
                onClick={() => setModalTab('palaces')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'palaces'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4. Lá Số 12 Cung Tử Vi</span>
              </button>

              <button
                onClick={() => setModalTab('scores')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'scores'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>5. Thước Đo Cát Hung & Cải Vận</span>
              </button>
            </div>

            {/* TAB 1: ẢNH CHỤP TƯỚNG MẠO & CHỈ TAY */}
            {modalTab === 'photos' && viewingDossier && (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-amber-950/50 p-4 rounded-2xl border border-amber-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow">
                  <div>
                    <h4 className="font-mystic font-bold text-amber-300 text-sm sm:text-base flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Hồ Sơ Ảnh Chụp Thực Tế Của Đương Số</span>
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Ảnh chụp trực tiếp từ camera/thiết bị của <strong className="text-amber-200">{viewingDossier.fullName}</strong>, được lưu trữ trong hồ sơ để đối chiếu diện mạo, chỉ tay với lá số Tử Vi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        stopVoice();
                        setViewingTuViBundle(null);
                        setViewingDossier(null);
                        onNavigateTab('facepalm', 'face');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Chụp ảnh mới</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. KHUÔN MẶT */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-400/50 transition flex flex-col justify-between space-y-3 shadow-lg">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-amber-400" />
                          <span>1. Nhân Diện (Khuôn Mặt)</span>
                        </span>
                        {viewingDossier.faceImage ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            ✓ Đã chụp
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                            Chưa chụp
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col items-center justify-center">
                        {viewingDossier.faceImage ? (
                          <div 
                            onClick={() => setPreviewZoomImage({ url: viewingDossier.faceImage!, title: `Ảnh Khuôn Mặt: ${viewingDossier.fullName}` })}
                            className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-xl group cursor-pointer bg-slate-900"
                            title="Bấm để phóng to xem chi tiết"
                          >
                            <img src={viewingDossier.faceImage} alt="Khuôn mặt" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-amber-300 text-xs font-bold gap-1">
                              <Search className="w-4 h-4" />
                              <span>Phóng to</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900/60 flex flex-col items-center justify-center p-3 text-center text-slate-500">
                            <Eye className="w-8 h-8 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-400 font-semibold">Chưa có ảnh mặt</span>
                            <span className="text-[10px] text-slate-500 mt-1">Soi Tam Đình Ngũ Quan</span>
                          </div>
                        )}

                        {viewingDossier.faceCapturedAt && (
                          <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Chụp lúc: {viewingDossier.faceCapturedAt}</span>
                          </span>
                        )}

                        {viewingDossier.faceVerdict && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed text-left w-full line-clamp-3">
                            <strong className="text-amber-300">Luận giải:</strong> {viewingDossier.faceVerdict}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        stopVoice();
                        setViewingTuViBundle(null);
                        setViewingDossier(null);
                        onNavigateTab('facepalm', 'face');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{viewingDossier.faceImage ? 'Chụp lại ảnh khuôn mặt' : 'Bấm mở camera chụp mặt'}</span>
                    </button>
                  </div>

                  {/* 2. LÒNG BÀN TAY (CHỈ TAY) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-purple-400/50 transition flex flex-col justify-between space-y-3 shadow-lg">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                          <Hand className="w-3.5 h-3.5 text-purple-400" />
                          <span>2. Thủ Tướng (Lòng Bàn Tay)</span>
                        </span>
                        {viewingDossier.palmImage ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                            ✓ {viewingDossier.palmSide === 'left' ? 'Tay Trái' : 'Tay Phải'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                            Chưa chụp
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col items-center justify-center">
                        {viewingDossier.palmImage ? (
                          <div 
                            onClick={() => setPreviewZoomImage({ url: viewingDossier.palmImage!, title: `Ảnh Chỉ Tay: ${viewingDossier.fullName} (${viewingDossier.palmSide === 'left' ? 'Tay Trái' : 'Tay Phải'})` })}
                            className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-purple-400/60 shadow-xl group cursor-pointer bg-slate-900"
                            title="Bấm để phóng to xem chi tiết"
                          >
                            <img src={viewingDossier.palmImage} alt="Chỉ tay" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-purple-300 text-xs font-bold gap-1">
                              <Search className="w-4 h-4" />
                              <span>Phóng to</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900/60 flex flex-col items-center justify-center p-3 text-center text-slate-500">
                            <Hand className="w-8 h-8 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-400 font-semibold">Chưa có ảnh chỉ tay</span>
                            <span className="text-[10px] text-slate-500 mt-1">Sinh Đạo, Trí Đạo, Tâm Đạo</span>
                          </div>
                        )}

                        {viewingDossier.palmCapturedAt && (
                          <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Chụp lúc: {viewingDossier.palmCapturedAt}</span>
                          </span>
                        )}

                        {viewingDossier.palmCategory && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 mt-1">
                            Phân loại: {viewingDossier.palmCategory}
                          </span>
                        )}

                        {viewingDossier.palmVerdict && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed text-left w-full line-clamp-3">
                            <strong className="text-purple-300">Luận giải:</strong> {viewingDossier.palmVerdict}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        stopVoice();
                        setViewingTuViBundle(null);
                        setViewingDossier(null);
                        onNavigateTab('facepalm', 'palm');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-400/40 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{viewingDossier.palmImage ? 'Chụp lại ảnh chỉ tay' : 'Bấm mở camera chụp chỉ tay'}</span>
                    </button>
                  </div>

                  {/* 3. TOÀN THÂN (CỐT CÁCH) */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-400/50 transition flex flex-col justify-between space-y-3 shadow-lg">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>3. Cốt Cách (Toàn Thân)</span>
                        </span>
                        {viewingDossier.bodyImage ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                            ✓ Đã chụp
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-500 border border-slate-800">
                            Chưa chụp
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-col items-center justify-center">
                        {viewingDossier.bodyImage ? (
                          <div 
                            onClick={() => setPreviewZoomImage({ url: viewingDossier.bodyImage!, title: `Ảnh Toàn Thân: ${viewingDossier.fullName}` })}
                            className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-xl group cursor-pointer bg-slate-900"
                            title="Bấm để phóng to xem chi tiết"
                          >
                            <img src={viewingDossier.bodyImage} alt="Toàn thân" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-emerald-300 text-xs font-bold gap-1">
                              <Search className="w-4 h-4" />
                              <span>Phóng to</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-36 h-36 rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-900/60 flex flex-col items-center justify-center p-3 text-center text-slate-500">
                            <Activity className="w-8 h-8 text-slate-600 mb-1" />
                            <span className="text-xs text-slate-400 font-semibold">Chưa có ảnh toàn thân</span>
                            <span className="text-[10px] text-slate-500 mt-1">Soi cốt cách hình tướng</span>
                          </div>
                        )}

                        {viewingDossier.bodyCapturedAt && (
                          <span className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Chụp lúc: {viewingDossier.bodyCapturedAt}</span>
                          </span>
                        )}

                        {viewingDossier.bodyVerdict && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 leading-relaxed text-left w-full line-clamp-3">
                            <strong className="text-emerald-300">Luận giải:</strong> {viewingDossier.bodyVerdict}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        stopVoice();
                        setViewingTuViBundle(null);
                        setViewingDossier(null);
                        onNavigateTab('facepalm', 'body');
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{viewingDossier.bodyImage ? 'Chụp lại ảnh toàn thân' : 'Bấm mở camera chụp toàn thân'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Tam Kỳ Vận Mệnh */}
            {modalTab === 'tamKy' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
                {/* Tiền Vận */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-blue-900/50 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {viewingTuViBundle.lifeDossier.tienVan.ageRange}
                      </span>
                    </div>
                    <h4 className="font-bold text-blue-300 text-sm">
                      {viewingTuViBundle.lifeDossier.tienVan.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {viewingTuViBundle.lifeDossier.tienVan.detail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-blue-300/90 font-semibold italic">
                    🔑 {viewingTuViBundle.lifeDossier.tienVan.keyword}
                  </div>
                </div>

                {/* Trung Vận */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/40 shadow-lg space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        {viewingTuViBundle.lifeDossier.trungVan.ageRange}
                      </span>
                    </div>
                    <h4 className="font-bold text-amber-300 text-sm">
                      {viewingTuViBundle.lifeDossier.trungVan.title}
                    </h4>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {viewingTuViBundle.lifeDossier.trungVan.detail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-300 font-bold italic">
                    🔑 {viewingTuViBundle.lifeDossier.trungVan.keyword}
                  </div>
                </div>

                {/* Hậu Vận */}
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-900/50 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {viewingTuViBundle.lifeDossier.hauVan.ageRange}
                      </span>
                    </div>
                    <h4 className="font-bold text-emerald-300 text-sm">
                      {viewingTuViBundle.lifeDossier.hauVan.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {viewingTuViBundle.lifeDossier.hauVan.detail}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300/90 font-semibold italic">
                    🔑 {viewingTuViBundle.lifeDossier.hauVan.keyword}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Ngũ Trụ Cuộc Đời */}
            {modalTab === 'fivePillars' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 animate-fadeIn">
                {viewingTuViBundle.lifeDossier.fivePillars.map((p) => (
                  <div key={p.id} className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 hover:border-amber-400/40 transition">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        <span>{p.title}</span>
                      </h4>
                      <span className="text-[10px] text-slate-400 italic">{p.subtitle}</span>
                    </div>
                    <p className="text-xs text-amber-200/90 font-semibold">
                      💡 {p.keyFact}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {p.deepAnalysis}
                    </p>
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-xl border border-emerald-900/40">
                      <strong>Lời khuyên:</strong> {p.advice}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: 12 Cung Lá Số Tử Vi */}
            {modalTab === 'palaces' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 animate-fadeIn">
                {viewingTuViBundle.palaces.map((palace, idx) => (
                  <div key={idx} className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 space-y-1.5 hover:border-amber-400/40 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-mystic font-bold text-amber-300 text-xs">
                        {palace.name}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {palace.stars.map((s, sIdx) => (
                        <span key={sIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800/40">
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2">
                      {palace.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: Thước Đo Cát Hung */}
            {modalTab === 'scores' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewingTuViBundle.lifeDossier.destinyScores.map((sc, idx) => (
                    <div key={idx} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{sc.label}</span>
                        <span className="font-extrabold text-amber-300">{sc.score}/100 • {sc.level}</span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                        <div className={`h-full ${sc.color}`} style={{ width: `${sc.score}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 italic">{sc.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Phương Pháp Cải Mệnh */}
                <div className="bg-slate-950/90 p-4 rounded-2xl border border-amber-400/30 space-y-2">
                  <h4 className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Phương Thức Tu Tâm Dưỡng Tướng & Cải Mệnh</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-amber-300 font-semibold block text-[11px]">🎨 Màu sắc vượng khí:</span>
                      <span>{viewingTuViBundle.lifeDossier.masterRemedy.luckyColors}</span>
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-emerald-300 font-semibold block text-[11px]">🧭 Hướng cát đại lợi:</span>
                      <span>{viewingTuViBundle.lifeDossier.masterRemedy.luckyDirections}</span>
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-purple-300 font-semibold block text-[11px]">⏰ Khung giờ hoàng đạo:</span>
                      <span>{viewingTuViBundle.lifeDossier.masterRemedy.goldenHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Hồ sơ: <strong className="text-amber-300">{viewingTuViBundle.profile.fullName}</strong> • Đã đồng bộ toàn hệ thống
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    const matched = dossiers.find(d => d.fullName.toLowerCase() === viewingTuViBundle.profile.fullName.toLowerCase());
                    if (matched) handleOpenInTuViTab(matched);
                    else {
                      stopVoice();
                      setViewingTuViBundle(null);
                      onNavigateTab('tuvi');
                    }
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Mở Toàn Diện Tại Tab Tử Vi Lý Số (Hỏi Sâu AI) →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopVoice();
                    setViewingTuViBundle(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Hồ Sơ Mới */}
      {showAddModal && (
        <div 
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto overscroll-contain touch-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto overscroll-contain flex flex-col touch-pan-y"
          >
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-md z-10 flex items-center justify-between border-b border-slate-800 pb-3 -mt-1 pt-1 shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
                  Thêm Hồ Sơ / Xem Hộ Người Quen
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDossier} className="space-y-3.5 flex-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ và tên người xem: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An, Trần Thị Bích..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-sm text-amber-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mối quan hệ (Xem cho ai):
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {RELATION_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNewRelation(opt.value)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition border ${
                        newRelation === opt.value
                          ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-amber-400/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giới tính:</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as 'nam' | 'nu')}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="nam">Nam mạng</option>
                    <option value="nu">Nữ mạng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ sinh:</label>
                  <select
                    value={newBirthHour}
                    onChange={e => setNewBirthHour(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Tý (23h00 - 01h00)">Tý (23h00 - 01h00)</option>
                    <option value="Sửu (01h00 - 03h00)">Sửu (01h00 - 03h00)</option>
                    <option value="Dần (03h00 - 05h00)">Dần (03h00 - 05h00)</option>
                    <option value="Mão (05h00 - 07h00)">Mão (05h00 - 07h00)</option>
                    <option value="Thìn (07h00 - 09h00)">Thìn (07h00 - 09h00)</option>
                    <option value="Tỵ (09h00 - 11h00)">Tỵ (09h00 - 11h00)</option>
                    <option value="Ngọ (11h00 - 13h00)">Ngọ (11h00 - 13h00)</option>
                    <option value="Mùi (13h00 - 15h00)">Mùi (13h00 - 15h00)</option>
                    <option value="Thân (15h00 - 17h00)">Thân (15h00 - 17h00)</option>
                    <option value="Dậu (17h00 - 19h00)">Dậu (17h00 - 19h00)</option>
                    <option value="Tuất (19h00 - 21h00)">Tuất (19h00 - 21h00)</option>
                    <option value="Hợi (21h00 - 23h00)">Hợi (21h00 - 23h00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ngày sinh Dương lịch (Ngày / Tháng / Năm): <span className="text-rose-400">* Bắt buộc</span>
                </label>
                <BirthDateSelector
                  day={(() => {
                    const p = (newBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[2], 10) || 0 : 0;
                  })()}
                  month={(() => {
                    const p = (newBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[1], 10) || 0 : 0;
                  })()}
                  year={(() => {
                    const p = (newBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[0], 10) || 0 : 0;
                  })()}
                  onChange={(d, m, y) => {
                    if (d > 0 && m > 0 && y > 0) {
                      setNewBirthDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
                    } else {
                      setNewBirthDate('');
                    }
                  }}
                  theme="amber"
                  compact={true}
                  allowEmpty={true}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi chú (quan hệ, công việc...):</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Ví dụ: Bạn thân, đồng nghiệp, người yêu..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md pt-3 -mb-1 pb-1 border-t border-slate-800/80 flex gap-2 z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-extrabold shadow-lg transition active:scale-95"
                >
                  Tạo & Kích Hoạt Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đại Tổng Luận Vận Mệnh Toàn Thư */}
      {synthesisDossier && (
        <MasterDestinySynthesisModal
          dossier={synthesisDossier}
          onClose={() => setSynthesisDossier(null)}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* Lightbox Phóng To Ảnh */}
      {previewZoomImage && (
        <div 
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto overscroll-contain touch-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full my-auto bg-slate-900 border border-amber-400/60 rounded-3xl p-4 shadow-2xl flex flex-col items-center touch-pan-y"
          >
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-mystic font-bold text-amber-300 text-sm flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <span>{previewZoomImage.title}</span>
              </span>
              <button
                onClick={() => setPreviewZoomImage(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-3 w-full max-h-[70vh] flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 p-2">
              <img src={previewZoomImage.url} alt="Phóng to" className="max-h-[65vh] max-w-full w-auto h-auto object-contain rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      )}

      {/* Modal Báo Cáo Đồng Bộ Google Firebase Thành Công */}
      {syncSuccessInfo && (
        <div 
          onClick={() => setSyncSuccessInfo(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto overscroll-contain touch-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-md w-full my-auto shadow-2xl text-center space-y-4 touch-pan-y"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
              🔥
            </div>

            <div>
              <h3 className="font-mystic font-bold text-amber-300 text-lg sm:text-xl">
                Đồng Bộ Đám Mây Cloud Thành Công!
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Toàn bộ dữ liệu hồ sơ và quẻ bói của bạn đã được sao lưu an toàn.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span>Dự án Cloud:</span>
                <strong className="text-amber-400">Google Cloud Firestore</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Trạng thái bảo mật:</span>
                <strong className="text-emerald-400">Đã mã hóa và phân lập</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Số hồ sơ đã lưu an toàn:</span>
                <strong className="text-amber-300">{syncSuccessInfo.count} hồ sơ</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Thời gian đồng bộ:</span>
                <span className="text-slate-300">{syncSuccessInfo.time}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {currentUser?.role === 'admin' && (
                <a
                  href={`https://console.firebase.google.com/project/${syncSuccessInfo.project}/firestore`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition active:scale-95"
                >
                  <span>Mở Firebase Console Xem Dữ Liệu ↗</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setSyncSuccessInfo(null)}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Bổ Sung Ngày Sinh Cho Hồ Sơ Chưa Có Ngày Sinh */}
      {dossierToEditBirthDate && (
        <div 
          onClick={() => setDossierToEditBirthDate(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn overflow-y-auto overscroll-contain touch-none"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto overscroll-contain flex flex-col touch-pan-y"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
                  Bổ Sung Ngày Sinh Để Xem Bói
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setDossierToEditBirthDate(null)}
                className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl text-xs text-amber-200/90 leading-relaxed">
              💡 Hồ sơ của <strong className="text-amber-300 font-bold">{dossierToEditBirthDate.fullName}</strong> hiện chưa có Ngày Tháng Năm Sinh.
              Tất cả các môn huyền thuật (Tử Vi, Bát Tự, Thần Số Học...) bắt buộc phải có ngày giờ sinh chính xác mới có thể an sao, lập quẻ và bình giải vận mệnh.
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (!supplementBirthDate || !/^\d{4}-\d{2}-\d{2}$/.test(supplementBirthDate)) {
                  alert("⚠️ Vui lòng chọn đầy đủ Ngày, Tháng và Năm sinh trước khi xem bói!");
                  return;
                }
                const updated = upsertUserDossier({
                  fullName: dossierToEditBirthDate.fullName,
                  birthDate: supplementBirthDate,
                  birthHour: supplementBirthHour
                });
                reloadDossiers();
                const targetDossier = updated;
                setDossierToEditBirthDate(null);
                if (targetDossier) {
                  handleSelectDossier(targetDossier);
                }
              }} 
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ngày sinh Dương lịch: <span className="text-rose-400">* Bắt buộc</span>
                </label>
                <BirthDateSelector
                  day={(() => {
                    const p = (supplementBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[2], 10) || 0 : 0;
                  })()}
                  month={(() => {
                    const p = (supplementBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[1], 10) || 0 : 0;
                  })()}
                  year={(() => {
                    const p = (supplementBirthDate || '').split('-');
                    return p.length === 3 ? parseInt(p[0], 10) || 0 : 0;
                  })()}
                  onChange={(d, m, y) => {
                    if (d > 0 && m > 0 && y > 0) {
                      setSupplementBirthDate(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
                    } else {
                      setSupplementBirthDate('');
                    }
                  }}
                  theme="amber"
                  compact={true}
                  allowEmpty={true}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giờ sinh:</label>
                <select
                  value={supplementBirthHour}
                  onChange={e => setSupplementBirthHour(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="Tý (23h00 - 01h00)">Tý (23h00 - 01h00)</option>
                  <option value="Sửu (01h00 - 03h00)">Sửu (01h00 - 03h00)</option>
                  <option value="Dần (03h00 - 05h00)">Dần (03h00 - 05h00)</option>
                  <option value="Mão (05h00 - 07h00)">Mão (05h00 - 07h00)</option>
                  <option value="Thìn (07h00 - 09h00)">Thìn (07h00 - 09h00)</option>
                  <option value="Tỵ (09h00 - 11h00)">Tỵ (09h00 - 11h00)</option>
                  <option value="Ngọ (11h00 - 13h00)">Ngọ (11h00 - 13h00)</option>
                  <option value="Mùi (13h00 - 15h00)">Mùi (13h00 - 15h00)</option>
                  <option value="Thân (15h00 - 17h00)">Thân (15h00 - 17h00)</option>
                  <option value="Dậu (17h00 - 19h00)">Dậu (17h00 - 19h00)</option>
                  <option value="Tuất (19h00 - 21h00)">Tuất (19h00 - 21h00)</option>
                  <option value="Hợi (21h00 - 23h00)">Hợi (21h00 - 23h00)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDossierToEditBirthDate(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-slate-950 text-xs font-black transition active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  Lưu & Xem Bói Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

