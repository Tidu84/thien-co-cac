import React, { useState, useEffect } from 'react';
import { UserDossier, NavTab } from '../types';
import { 
  getUserDossiers, 
  getActiveDossierName, 
  setActiveDossierName, 
  upsertUserDossier, 
  deleteUserDossier 
} from '../services/dossierService';
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
  Activity
} from 'lucide-react';
import { buildTuViProfileAndLifeDossier, CompleteTuViBundle } from '../services/tuViService';

interface RecentDossiersBannerProps {
  onNavigateTab: (tab: NavTab, subMode?: 'face' | 'palm' | 'body') => void;
}

export const RecentDossiersBanner: React.FC<RecentDossiersBannerProps> = ({ onNavigateTab }) => {
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [activeName, setActiveName] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal xem Bảng Tử Vi & Luận Bàn Bản Mệnh Cả Đời của hồ sơ được chọn
  const [viewingTuViBundle, setViewingTuViBundle] = useState<CompleteTuViBundle | null>(null);
  const [viewingDossier, setViewingDossier] = useState<UserDossier | null>(null);
  const [modalTab, setModalTab] = useState<'photos' | 'tamKy' | 'fivePillars' | 'palaces' | 'scores'>('photos');
  const [previewZoomImage, setPreviewZoomImage] = useState<{ url: string; title: string } | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // Form thêm hồ sơ mới
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'nam' | 'nu'>('nam');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newBirthHour, setNewBirthHour] = useState('Thìn (07h00 - 09h00)');
  const [newNotes, setNewNotes] = useState('');

  // Nạp danh sách hồ sơ & lắng nghe sự kiện thay đổi
  const reloadDossiers = () => {
    setDossiers(getUserDossiers());
    setActiveName(getActiveDossierName());
  };

  useEffect(() => {
    reloadDossiers();

    const handleUpdate = () => reloadDossiers();
    window.addEventListener('thien_co_cac_dossier_updated', handleUpdate);
    window.addEventListener('thien_co_cac_active_name_changed', handleUpdate);

    return () => {
      window.removeEventListener('thien_co_cac_dossier_updated', handleUpdate);
      window.removeEventListener('thien_co_cac_active_name_changed', handleUpdate);
    };
  }, []);

  const handleSelectDossier = (dossier: UserDossier, initialTab?: 'photos' | 'tamKy') => {
    setActiveDossierName(dossier.fullName);
    setActiveName(dossier.fullName);
    const bundle = buildTuViProfileAndLifeDossier(dossier);
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
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();

      const cleanVoiceText = text
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.15;
      setIsVoiceSpeaking(true);
      utterance.onend = () => setIsVoiceSpeaking(false);
      utterance.onerror = () => setIsVoiceSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn xóa hồ sơ của "${name}" khỏi danh sách không?`)) {
      deleteUserDossier(id);
      reloadDossiers();
    }
  };

  const handleCreateNewDossier = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      alert("Vui lòng nhập họ và tên của người xem!");
      return;
    }

    upsertUserDossier({
      fullName: trimmed,
      gender: newGender,
      birthDate: newBirthDate || undefined,
      birthHour: newBirthHour || undefined,
      notes: newNotes || undefined
    });

    setNewName('');
    setNewBirthDate('');
    setNewNotes('');
    setShowAddModal(false);
    reloadDossiers();
  };

  return (
    <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-2 border-amber-400/40 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-md">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-mystic text-lg sm:text-xl font-bold text-amber-300">
                Sổ Hồ Sơ Đương Số Đã Xem
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                {dossiers.length} người
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Bất cứ khi nào khai tên hay thông tin, hệ thống tự động lưu vào đây. Bấm để chuyển người xem ngay tức khắc!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Thêm Hồ Sơ Mới</span>
          </button>

          <button
            onClick={() => onNavigateTab('history')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-200 border border-purple-500/40 text-xs font-semibold transition active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5 text-purple-300" />
            <span>Sổ Vận Mệnh</span>
          </button>
        </div>
      </div>

      {/* Danh Sách Hồ Sơ (Card Carousel / Grid) */}
      {dossiers.length === 0 ? (
        <div className="text-center py-6 px-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <UserCheck className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-60" />
          <p className="text-sm font-semibold text-slate-300">Chưa có hồ sơ người xem nào được ghi nhận</p>
          <p className="text-xs text-slate-500 mt-1">
            Hãy bấm nút <strong>"+ Thêm Hồ Sơ Mới"</strong> hoặc trò chuyện với Thầy Bói / lập lá số Tử Vi, hệ thống sẽ tự động lưu vào đây!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {dossiers.map((dossier) => {
            const isActive = activeName.trim().toLowerCase() === dossier.fullName.trim().toLowerCase();
            return (
              <div
                key={dossier.id}
                onClick={() => handleSelectDossier(dossier)}
                className={`p-4 rounded-2xl border transition duration-200 cursor-pointer relative group flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'bg-slate-900/95 border-amber-400 ring-2 ring-amber-400/50 shadow-xl shadow-amber-500/10 scale-[1.01]'
                    : 'bg-slate-950/80 border-slate-800 hover:border-amber-400/40 hover:bg-slate-900/70 text-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        {dossier.faceImage ? (
                          <img 
                            src={dossier.faceImage} 
                            alt={dossier.fullName} 
                            className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-400 shadow-md ring-2 ring-amber-400/20"
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shadow ${
                            isActive 
                              ? 'bg-amber-400 text-slate-950' 
                              : 'bg-purple-900/50 text-purple-200 border border-purple-500/30'
                          }`}>
                            {dossier.gender === 'nu' ? '🌸' : '👤'}
                          </div>
                        )}
                        {dossier.palmImage && (
                          <div 
                            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-purple-400 flex items-center justify-center text-[10px] shadow" 
                            title={`Đã có ảnh chỉ tay (${dossier.palmSide === 'left' ? 'Tay Trái' : 'Tay Phải'})`}
                          >
                            ✋
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className={`font-bold text-sm leading-tight ${isActive ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-200'}`}>
                            {dossier.fullName}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                              Đang chọn
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {dossier.gender === 'nu' ? 'Nữ mạng' : 'Nam mạng'}
                          {dossier.birthDate && ` • ${dossier.birthDate}`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, dossier.id, dossier.fullName)}
                      className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-slate-900 transition opacity-0 group-hover:opacity-100"
                      title="Xóa hồ sơ này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Trạng thái ảnh chụp tướng mạo & chỉ tay */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2">
                    {dossier.faceImage ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        <Camera className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Mặt: Đã chụp</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                        <Camera className="w-2.5 h-2.5 text-slate-500" />
                        <span>Chưa chụp mặt</span>
                      </span>
                    )}

                    {dossier.palmImage ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/40">
                        <Hand className="w-2.5 h-2.5 text-purple-400" />
                        <span>Chỉ tay: {dossier.palmSide === 'left' ? 'Tay Trái' : 'Tay Phải'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                        <Hand className="w-2.5 h-2.5 text-slate-500" />
                        <span>Chưa chụp chỉ tay</span>
                      </span>
                    )}
                  </div>

                  {/* Thông tin bổ sung */}
                  {(dossier.canChiYear || dossier.birthHour || dossier.notes) && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                      {dossier.canChiYear && (
                        <div>Can Chi: <strong className="text-amber-300/90">{dossier.canChiYear}</strong></div>
                      )}
                      {dossier.birthHour && (
                        <div className="truncate">Giờ sinh: {dossier.birthHour}</div>
                      )}
                      {dossier.notes && (
                        <div className="italic text-slate-500 truncate">"{dossier.notes}"</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer card */}
                <div className="pt-2 flex items-center justify-between text-[11px] border-t border-slate-800/60 text-slate-500">
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-amber-400/80" />
                    <span>{dossier.recordsCount || 0} quẻ/hồ sơ</span>
                  </span>

                  <span className={`font-semibold flex items-center gap-1 ${isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-amber-200'}`}>
                    <span>Bấm xem hồ sơ</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Quick Action Button */}
                <div className="pt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDossier(dossier, 'photos');
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 text-purple-200 border border-purple-500/40 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow"
                    title="Xem ảnh chụp khuôn mặt và lòng bàn tay"
                  >
                    <Camera className="w-3 h-3 text-purple-300" />
                    <span>Ảnh & Tướng</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDossier(dossier, 'tamKy');
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 shadow"
                  >
                    <ScrollText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bảng Tử Vi</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInTuViTab(dossier);
                    }}
                    className="py-1.5 px-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-200 border border-purple-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                    title="Mở toàn diện tại Tab Tử Vi Lý Số"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Bảng Tử Vi & Luận Bàn Bản Mệnh Cả Đời */}
      {viewingTuViBundle && (
        <div 
          onClick={() => {
            stopVoice();
            setViewingTuViBundle(null);
          }}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-slate-900/95 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
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
                      Ảnh chụp trực tiếp từ camera/thiết bị của <strong className="text-amber-200">{viewingDossier.fullName}</strong>, được lưu trữ vĩnh viễn trong hồ sơ để đối chiếu diện mạo, chỉ tay với lá số Tử Vi.
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
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {palace.luckScore}%
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
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <h3 className="font-mystic font-bold text-amber-300 text-lg">
                  Thêm Hồ Sơ Đương Số Mới
                </h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewDossier} className="space-y-3.5">
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ngày sinh (Dương lịch):</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={e => setNewBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
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

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-extrabold shadow-lg transition"
                >
                  Lưu & Chọn Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Phóng To Ảnh */}
      {previewZoomImage && (
        <div 
          onClick={() => setPreviewZoomImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-xl w-full bg-slate-900 border border-amber-400/60 rounded-3xl p-4 shadow-2xl flex flex-col items-center"
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
              <img src={previewZoomImage.url} alt="Phóng to" className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
