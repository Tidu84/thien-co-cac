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
  Layers
} from 'lucide-react';
import { buildTuViProfileAndLifeDossier, CompleteTuViBundle } from '../services/tuViService';

interface RecentDossiersBannerProps {
  onNavigateTab: (tab: NavTab) => void;
}

export const RecentDossiersBanner: React.FC<RecentDossiersBannerProps> = ({ onNavigateTab }) => {
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [activeName, setActiveName] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal xem Bảng Tử Vi & Luận Bàn Bản Mệnh Cả Đời của hồ sơ được chọn
  const [viewingTuViBundle, setViewingTuViBundle] = useState<CompleteTuViBundle | null>(null);
  const [modalTab, setModalTab] = useState<'tamKy' | 'fivePillars' | 'palaces' | 'scores'>('tamKy');
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

  const handleSelectDossier = (dossier: UserDossier) => {
    setActiveDossierName(dossier.fullName);
    setActiveName(dossier.fullName);
    const bundle = buildTuViProfileAndLifeDossier(dossier);
    setViewingTuViBundle(bundle);
    setModalTab('tamKy');
  };

  const handleOpenInTuViTab = (dossier: UserDossier) => {
    setActiveDossierName(dossier.fullName);
    setActiveName(dossier.fullName);
    stopVoice();
    setViewingTuViBundle(null);
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
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow ${
                        isActive 
                          ? 'bg-amber-400 text-slate-950' 
                          : 'bg-purple-900/50 text-purple-200 border border-purple-500/30'
                      }`}>
                        {dossier.gender === 'nu' ? '🌸' : '👤'}
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

                  {/* Thông tin bổ sung */}
                  {(dossier.canChiYear || dossier.birthHour || dossier.notes) && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
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
                    <span>Bấm xem Bảng Tử Vi</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Quick Action Button */}
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDossier(dossier);
                    }}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <ScrollText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bảng Tử Vi & Vận Mệnh</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenInTuViTab(dossier);
                    }}
                    className="py-1.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-200 border border-purple-500/30 text-[11px] font-semibold flex items-center justify-center gap-1 transition active:scale-95"
                    title="Mở toàn diện tại Tab Tử Vi Lý Số"
                  >
                    <Sparkles className="w-3 h-3 text-purple-300" />
                    <span className="hidden sm:inline">Tab Tử Vi</span>
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
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-2xl shadow-md shrink-0">
                  {viewingTuViBundle.profile.gender === 'nu' ? '🌸' : '👤'}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase tracking-wider">
                      Lá Số Tử Vi & Bản Mệnh Trọn Đời
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                      {viewingTuViBundle.profile.gender === 'nu' ? 'Nữ mạng' : 'Nam mạng'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Cục: {viewingTuViBundle.profile.cuc}
                    </span>
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
                onClick={() => setModalTab('tamKy')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  modalTab === 'tamKy'
                    ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-950 text-slate-400 hover:text-amber-200 border border-slate-800'
                }`}
              >
                <ScrollText className="w-3.5 h-3.5" />
                <span>1. Tam Kỳ Vận Mệnh (Tiền - Trung - Hậu Vận)</span>
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
                <span>2. Ngũ Trụ Cuộc Đời (5 Trụ Cột)</span>
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
                <span>3. Lá Số 12 Cung Tử Vi</span>
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
                <span>4. Thước Đo Cát Hung & Cải Vận</span>
              </button>
            </div>

            {/* TAB 1: Tam Kỳ Vận Mệnh */}
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
    </div>
  );
};
