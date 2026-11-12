// frontend/components/AdminModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  Mail, 
  ShieldAlert, 
  Trash2, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Phone, 
  UserCheck,
  Database,
  Cloud,
  Copy,
  Check,
  Search,
  Upload,
  Sparkles,
  FileText,
  Flame
} from 'lucide-react';
import { 
  getCurrentUser,
  getRegisteredUsers, 
  getAdminNotifications, 
  deleteUserByAdmin, 
  AuthUser, 
  AdminNotification 
} from '../services/authService';
import { 
  getUserDossiers, 
  deleteUserDossier 
} from '../services/dossierService';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  testFirebaseConnection, 
  getFirestoreRules, 
  isFirebaseConfigured, 
  getAllCloudDossiersForAdmin,
  deleteDossierFromFirebase,
  FirebaseConfig 
} from '../services/firebaseService';
import { 
  getCloudConfig, 
  saveCloudConfig, 
  testCloudConnection, 
  getSupabaseInitSQL, 
  exportFullBackupJSON, 
  importFullBackupJSON,
  CloudConfig 
} from '../services/cloudStorageService';
import { UserDossier } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [dossiers, setDossiers] = useState<UserDossier[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'dossiers' | 'emails' | 'cloud'>('users');
  const [msg, setMsg] = useState('');

  // Google Firebase state
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig>(getFirebaseConfig());
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);

  // Supabase state (Tùy chọn phụ)
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(getCloudConfig());
  const [showSupabaseExtra, setShowSupabaseExtra] = useState(false);

  // Dossiers filter
  const [dossierSearch, setDossierSearch] = useState('');
  const [dossierRelationFilter, setDossierRelationFilter] = useState('all');
  const [isFetchingCloudDossiers, setIsFetchingCloudDossiers] = useState(false);

  // Khóa cuộn trang nền khi modal Admin mở
  useEffect(() => {
    if (!isOpen) return;
    setCurrentUser(getCurrentUser());
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  const reloadData = async () => {
    setUsers(getRegisteredUsers());
    setNotifications(getAdminNotifications());
    setFirebaseConfig(getFirebaseConfig());
    setCloudConfig(getCloudConfig());

    if (isFirebaseConfigured()) {
      setIsFetchingCloudDossiers(true);
      try {
        const cloudList = await getAllCloudDossiersForAdmin();
        if (cloudList && cloudList.length > 0) {
          setDossiers(cloudList);
        } else {
          setDossiers(getUserDossiers());
        }
      } catch {
        setDossiers(getUserDossiers());
      } finally {
        setIsFetchingCloudDossiers(false);
      }
    } else {
      setDossiers(getUserDossiers());
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadData();
      setMsg('');
      setFirebaseTestResult(null);
    }
  }, [isOpen]);

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${name}" khỏi hệ thống không?`)) {
      if (deleteUserByAdmin(userId)) {
        reloadData();
        setMsg(`Đã xóa thành viên "${name}" thành công!`);
        setTimeout(() => setMsg(''), 3000);
      }
    }
  };

  const handleDeleteDossier = async (dossierId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của "${name}" trên toàn bộ hệ thống & Cloud không?`)) {
      deleteUserDossier(dossierId);
      await deleteDossierFromFirebase(dossierId);
      reloadData();
      setMsg(`Đã xóa hồ sơ của "${name}" thành công!`);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleExportUsersCSV = () => {
    const headers = ['ID', 'Họ Và Tên', 'Tên Đăng Nhập', 'Email', 'Số Điện Thoại', 'Ngày Đăng Ký'];
    const rows = users.map(u => [
      u.id,
      `"${u.fullName}"`,
      u.username,
      u.email,
      u.phone || '',
      `"${u.createdAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_thanh_vien_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportDossiersCSV = () => {
    const headers = ['ID', 'Họ Và Tên', 'Quan Hệ', 'Giới Tính', 'Ngày Sinh', 'Giờ Sinh', 'Can Chi', 'Mệnh', 'Số Quẻ Đã Xem'];
    const rows = dossiers.map(d => [
      d.id,
      `"${d.fullName}"`,
      `"${d.relation || 'Bản thân'}"`,
      d.gender === 'nu' ? 'Nữ' : 'Nam',
      d.birthDate || '',
      `"${d.birthHour || ''}"`,
      `"${d.canChiYear || ''}"`,
      `"${d.menhNguHanh || ''}"`,
      d.recordsCount || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_ho_so_duong_so_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveFirebaseSettings = () => {
    saveFirebaseConfig(firebaseConfig);
    setMsg('Đã lưu cấu hình Google Cloud Firebase thành công!');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    saveFirebaseConfig(firebaseConfig);
    try {
      const res = await testFirebaseConnection();
      setFirebaseTestResult(res);
    } catch (e: any) {
      setFirebaseTestResult({ success: false, message: e.message || 'Lỗi kiểm tra' });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleCopyRules = () => {
    const rules = getFirestoreRules();
    navigator.clipboard.writeText(rules);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 2500);
  };

  const handleExportBackup = () => {
    const jsonStr = exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thien_co_cac_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const res = importFullBackupJSON(content);
      if (res.success) {
        reloadData();
        setMsg(res.message);
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Lọc hồ sơ
  const filteredDossiers = dossiers.filter(d => {
    if (dossierSearch.trim()) {
      const q = dossierSearch.toLowerCase().trim();
      const matchName = d.fullName.toLowerCase().includes(q);
      const matchCanChi = (d.canChiYear || '').toLowerCase().includes(q);
      if (!matchName && !matchCanChi) return false;
    }
    if (dossierRelationFilter === 'all') return true;
    if (dossierRelationFilter === 'self') return !d.relation || d.relation === 'Bản thân';
    if (dossierRelationFilter === 'family') return ['Bố mẹ', 'Vợ chồng', 'Con cái'].includes(d.relation || '');
    if (dossierRelationFilter === 'friends') return ['Bạn bè', 'Người yêu'].includes(d.relation || '');
    if (dossierRelationFilter === 'work') return ['Đối tác', 'Khác'].includes(d.relation || '');
    return true;
  });

  const activeUser = currentUser || getCurrentUser();
  if (!isOpen || activeUser?.role !== 'admin') return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain touch-none"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-5xl my-auto max-h-[92vh] bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col text-slate-100 overflow-hidden touch-auto"
      >
        
        {/* Header Quản Trị - Cố định ở đỉnh */}
        <div className="p-3.5 sm:p-5 border-b border-amber-500/30 flex items-center justify-between bg-slate-950/95 shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-lg sm:text-xl shadow-md shadow-amber-500/30 shrink-0">
              👑
            </div>
            <div>
              <h2 className="font-mystic text-base sm:text-xl font-bold text-amber-300">
                BẢNG ĐIỀU HÀNH HỆ THỐNG QUẢN TRỊ VIÊN
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Kênh thông báo bảo mật: <span className="text-emerald-400 font-semibold">Đã mã hóa an toàn</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={reloadData}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-300 rounded-xl bg-slate-900 border border-slate-800 transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 transition"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Thông báo thao tác */}
        {msg && (
          <div className="px-4 py-2 bg-emerald-950/80 border-b border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
            <span>{msg}</span>
          </div>
        )}

        {/* Khung nội dung toàn diện có thể cuộn trơn tru */}
        <div className="flex-1 overflow-y-auto overscroll-contain touch-pan-y flex flex-col">
          {/* Thẻ thống kê 4 cột */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-950/40 border-b border-slate-800 shrink-0">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Thành viên</p>
                <h3 className="text-lg sm:text-xl font-bold text-amber-400 mt-0.5">{users.length}</h3>
              </div>
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/60 shrink-0" />
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Hồ sơ đã lưu</p>
                <h3 className="text-lg sm:text-xl font-bold text-indigo-400 mt-0.5">{dossiers.length}</h3>
              </div>
              <Database className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400/60 shrink-0" />
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-purple-500/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Email đã báo</p>
                <h3 className="text-lg sm:text-xl font-bold text-purple-400 mt-0.5">{notifications.length}</h3>
              </div>
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400/60 shrink-0" />
            </div>

            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Google Firebase</p>
                <p className="text-[11px] sm:text-xs font-bold text-amber-400 mt-1 truncate">
                  {isFirebaseConfigured() ? '🔥 Đã Kết Nối' : 'Chưa Kết Nối'}
                </p>
              </div>
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400/80 shrink-0" />
            </div>
          </div>

          {/* Thanh công cụ chuyển 4 Tab - Dính ngay dưới Header */}
          <div className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-10 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-between border-b border-slate-800 gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Thành viên ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dossiers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'dossiers'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Hồ sơ & Xem hộ ({dossiers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('emails')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'emails'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Thông báo đăng ký ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('cloud')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'cloud'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Firebase & Sao Lưu</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'users' && users.length > 0 && (
              <button
                onClick={handleExportUsersCSV}
                className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV Thành Viên</span>
              </button>
            )}

            {activeTab === 'dossiers' && dossiers.length > 0 && (
              <button
                onClick={handleExportDossiersCSV}
                className="px-3 py-1.5 rounded-xl bg-indigo-950 border border-indigo-500/40 text-indigo-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất CSV Hồ Sơ</span>
              </button>
            )}
          </div>
        </div>

        {/* Nội dung danh sách theo Tab */}
        <div className="p-3 sm:p-5 flex-1">
          {/* TAB 1: DANH SÁCH THÀNH VIÊN */}
          {activeTab === 'users' && (
            <div>
              {users.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Users className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Chưa có thành viên nào đăng ký tài khoản mới.</p>
                  <p className="text-xs text-slate-500 mt-1">Khi có thành viên mới đăng ký, danh sách sẽ tự động xuất hiện tại đây.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                        <th className="py-2.5 px-3">Họ và Tên</th>
                        <th className="py-2.5 px-3">Tên đăng nhập</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Số điện thoại</th>
                        <th className="py-2.5 px-3">Ngày đăng ký</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3 font-bold text-amber-200">
                            {u.fullName}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-300">
                            @{u.username}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {u.email}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {u.phone || '—'}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {u.createdAt}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.fullName)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition"
                              title="Xóa thành viên"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HỒ SƠ ĐƯƠNG SỐ & XEM HỘ KHÁCH HÀNG */}
          {activeTab === 'dossiers' && (
            <div className="space-y-3">
              {/* Tiêu đề & Làm mới từ Cloud */}
              <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-xs text-amber-300">
                    Toàn Bộ Hồ Sơ Trên Cloud Firestore ({dossiers.length})
                  </h3>
                  {isFetchingCloudDossiers && (
                    <span className="text-[10px] text-amber-400 animate-pulse flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Đang tải từ Cloud...
                    </span>
                  )}
                </div>
                <button
                  onClick={() => reloadData()}
                  disabled={isFetchingCloudDossiers}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3 h-3 ${isFetchingCloudDossiers ? 'animate-spin' : ''}`} />
                  <span>Tải lại từ Cloud</span>
                </button>
              </div>

              {/* Thanh lọc & Tìm kiếm hồ sơ */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs w-full sm:w-auto">
                  <button
                    onClick={() => setDossierRelationFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      dossierRelationFilter === 'all'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Tất cả ({dossiers.length})
                  </button>
                  <button
                    onClick={() => setDossierRelationFilter('self')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      dossierRelationFilter === 'self'
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    👑 Bản thân
                  </button>
                  <button
                    onClick={() => setDossierRelationFilter('family')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      dossierRelationFilter === 'family'
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    👨‍👩‍👧 Gia đình
                  </button>
                  <button
                    onClick={() => setDossierRelationFilter('friends')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      dossierRelationFilter === 'friends'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    💖 Người yêu & Bạn bè
                  </button>
                  <button
                    onClick={() => setDossierRelationFilter('work')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      dossierRelationFilter === 'work'
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    💼 Đối tác & Khác
                  </button>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={dossierSearch}
                    onChange={e => setDossierSearch(e.target.value)}
                    placeholder="Tìm theo tên, can chi..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-amber-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              {filteredDossiers.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Database className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Chưa có hồ sơ đương số nào được lưu.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold bg-slate-950/50">
                        <th className="py-2.5 px-3">Họ và Tên</th>
                        <th className="py-2.5 px-3">Quan hệ (Xem hộ)</th>
                        <th className="py-2.5 px-3">Tài khoản & Thiết bị tạo</th>
                        <th className="py-2.5 px-3">Giới tính</th>
                        <th className="py-2.5 px-3">Ngày sinh & Can Chi</th>
                        <th className="py-2.5 px-3">Giờ sinh</th>
                        <th className="py-2.5 px-3 text-center">Quẻ đã xem</th>
                        <th className="py-2.5 px-3 text-center">Hình ảnh</th>
                        <th className="py-2.5 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDossiers.map(d => (
                        <tr key={d.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3 font-bold text-amber-200">
                            {d.fullName}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                              {d.relation || 'Bản thân'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-[11px] font-semibold text-amber-300 truncate max-w-[130px]">
                              {d.userId && d.userId !== 'guest' ? `👤 ${d.userId}` : 'Khách vãng lai'}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]">
                              📱 {d.deviceId || 'Máy cũ'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            {d.gender === 'nu' ? '🌸 Nữ' : '👤 Nam'}
                          </td>
                          <td className="py-3 px-3 text-slate-300">
                            <div>{d.birthDate || 'Chưa rõ'}</div>
                            {d.canChiYear && (
                              <div className="text-[10px] text-amber-400/80 font-semibold">{d.canChiYear}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400">
                            {d.birthHour || '—'}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                              {d.recordsCount || 0} quẻ
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="text-[11px]">
                              {d.faceImage ? '👤' : '—'} {d.palmImage ? '✋' : ''} {d.bodyImage ? '🧍' : ''}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteDossier(d.id, d.fullName)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/60 rounded-lg transition"
                              title="Xóa hồ sơ khỏi Cloud"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LỊCH SỬ THÔNG BÁO ĐĂNG KÝ HỆ THỐNG */}
          {activeTab === 'emails' && (
            <div>
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Mail className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">Chưa có nhật ký gửi email nào.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 shrink-0 mt-0.5">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-200">
                            Thông báo thành viên mới: <span className="text-amber-300">{n.fullName}</span> (@{n.username})
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Email: {n.email} {n.phone ? `• SĐT: ${n.phone}` : ''}
                          </p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Kênh thông báo bảo mật lúc: {n.timestamp}</span>
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-950/60 text-emerald-400 border-emerald-500/40">
                        Đã gửi
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GOOGLE FIREBASE & SAO LƯU */}
          {activeTab === 'cloud' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* KHỐI 1: GOOGLE FIREBASE CLOUD FIRESTORE (ƯU TIÊN SỐ 1) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border-2 border-amber-500/40 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
                    <div>
                      <h3 className="font-mystic font-bold text-amber-300 text-sm sm:text-base">
                        Google Cloud Firebase (Firestore Database)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Hệ sinh thái chính chủ Google &bull; Tốc độ cao &bull; Miễn phí trọn đời
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                    Google Ecosystem
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Dữ liệu hồ sơ người dùng và các quẻ tiên tri sẽ được lưu trữ tự động trên <strong>Google Cloud Firestore</strong> của anh. Anh có thể xem và chỉnh sửa trực tiếp trên Firebase Console bằng chính tài khoản Google của mình.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Web API Key (apiKey):
                    </label>
                    <input
                      type="password"
                      value={firebaseConfig.apiKey}
                      onChange={e => setFirebaseConfig({ ...firebaseConfig, apiKey: e.target.value.trim() })}
                      placeholder="AIzaSy..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Project ID (projectId):
                    </label>
                    <input
                      type="text"
                      value={firebaseConfig.projectId}
                      onChange={e => {
                        const proj = e.target.value.trim();
                        setFirebaseConfig({ 
                          ...firebaseConfig, 
                          projectId: proj,
                          authDomain: proj ? `${proj}.firebaseapp.com` : ''
                        });
                      }}
                      placeholder="Ví dụ: thien-co-cac, ai-vibe-coder-vn..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      App ID (appId):
                    </label>
                    <input
                      type="text"
                      value={firebaseConfig.appId}
                      onChange={e => setFirebaseConfig({ ...firebaseConfig, appId: e.target.value.trim() })}
                      placeholder="1:1234567890:web:abcdef..."
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Auth Domain (authDomain):
                    </label>
                    <input
                      type="text"
                      value={firebaseConfig.authDomain}
                      onChange={e => setFirebaseConfig({ ...firebaseConfig, authDomain: e.target.value.trim() })}
                      placeholder="project-id.firebaseapp.com"
                      className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-amber-200 placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveFirebaseSettings}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs shadow-lg transition active:scale-95"
                    >
                      Lưu Cấu Hình Firebase
                    </button>

                    <button
                      onClick={handleTestFirebase}
                      disabled={isTestingFirebase}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-semibold text-xs transition active:scale-95 flex items-center gap-1.5"
                    >
                      {isTestingFirebase ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang kiểm tra kết nối...</span>
                        </>
                      ) : (
                        <span>Kiểm Tra Kết Nối</span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleCopyRules}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                    title="Sao chép Firestore Security Rules để dán vào tab Rules trên Firebase"
                  >
                    {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRules ? 'Đã Sao Chép Rules!' : 'Sao Chép Firestore Rules'}</span>
                  </button>
                </div>

                {firebaseTestResult && (
                  <div className={`p-3 rounded-xl text-xs border ${
                    firebaseTestResult.success 
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                      : 'bg-red-950/80 border-red-500/40 text-red-300'
                  }`}>
                    {firebaseTestResult.message}
                  </div>
                )}

                {/* Hướng Dẫn 3 Bước Google Firebase */}
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1.5 text-slate-300">
                  <p className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>📌</span>
                    <span>Cách lấy cấu hình Firebase của Google trong 1 phút:</span>
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>Vào <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">console.firebase.google.com</a> &rarr; Bấm <strong>Tạo dự án</strong> (Create a project).</li>
                    <li>Ở trang chủ dự án, bấm biểu tượng Web <strong>&lt;/&gt;</strong> để đăng ký app &rarr; Copy các dòng <code>apiKey</code>, <code>projectId</code>, <code>appId</code> dán vào ô bên trên.</li>
                    <li>Vào menu trái <strong>Build &rarr; Firestore Database</strong> &rarr; Bấm <strong>Create database</strong> &rarr; Chọn tab <strong>Rules</strong> &rarr; Bấm nút <strong>"Sao Chép Firestore Rules"</strong> ở trên rồi dán vào và nhấn <strong>Publish</strong> là xong!</li>
                  </ol>
                </div>
              </div>

              {/* KHỐI 2: SAO LƯU & PHỤC HỒI DỮ LIỆU JSON DỰ PHÒNG */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-purple-300 text-xs sm:text-sm">
                    Sao Lưu & Phục Hồi Toàn Bộ Dữ Liệu (Backup JSON)
                  </h4>
                </div>

                <p className="text-xs text-slate-400">
                  Xuất toàn bộ danh sách hồ sơ đương số, quẻ bói và tài khoản thành 1 file JSON lưu trên máy tính, hoặc phục hồi dữ liệu từ file JSON bất cứ lúc nào.
                </p>

                <div className="flex items-center gap-3 pt-1 flex-wrap">
                  <button
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải File Sao Lưu (.JSON)</span>
                  </button>

                  <label className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-300 border border-purple-500/40 font-semibold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Phục Hồi Từ File (.JSON)</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* KHỐI 3: SUPABASE (TÙY CHỌN DỰ PHÒNG NẾU CẦN) */}
              <div className="border border-slate-800/80 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSupabaseExtra(!showSupabaseExtra)}
                  className="w-full px-4 py-3 bg-slate-950/60 hover:bg-slate-900/60 flex items-center justify-between text-xs text-slate-400 font-semibold transition"
                >
                  <span className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span>Cấu hình dự phòng Supabase (Tùy chọn)</span>
                  </span>
                  <span>{showSupabaseExtra ? '▲ Ẩn bớt' : '▼ Mở rộng'}</span>
                </button>

                {showSupabaseExtra && (
                  <div className="p-4 bg-slate-950/40 space-y-3 border-t border-slate-800 text-xs">
                    <p className="text-slate-400 text-[11px]">
                      Hệ thống ưu tiên số 1 cho Google Firebase. Nếu anh muốn chạy thêm Supabase dự phòng thì có thể cấu hình tại đây:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Project URL:</label>
                        <input
                          type="text"
                          value={cloudConfig.supabaseUrl}
                          onChange={e => setCloudConfig({ ...cloudConfig, supabaseUrl: e.target.value.trim() })}
                          placeholder="https://xxx.supabase.co"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-sky-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Anon Key:</label>
                        <input
                          type="password"
                          value={cloudConfig.supabaseAnonKey}
                          onChange={e => setCloudConfig({ ...cloudConfig, supabaseAnonKey: e.target.value.trim() })}
                          placeholder="eyJhbGci..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-sky-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        saveCloudConfig(cloudConfig);
                        setMsg("Đã lưu cấu hình Supabase dự phòng!");
                        setTimeout(() => setMsg(''), 3000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 font-semibold text-xs transition"
                    >
                      Lưu Supabase
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      </div>
    </div>
  );
};
