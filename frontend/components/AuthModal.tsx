// frontend/components/AuthModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Phone, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  AuthUser 
} from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Khóa cuộn trang nền khi mở AuthModal
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setEmail('');
    setPhone('');
    setConfirmPassword('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await loginUser(username, password);
      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
          resetForm();
        }, 600);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại không khớp!');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu tối thiểu phải từ 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        username,
        password,
        fullName,
        email,
        phone
      });

      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
          resetForm();
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err) {
      setErrorMessage('Đã xảy ra lỗi trong quá trình đăng ký!');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn overflow-y-auto overscroll-contain touch-none"
    >
      <div 
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-md my-auto max-h-[92vh] flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-slate-100 overflow-y-auto overscroll-contain touch-pan-y"
      >
        
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/70 hover:bg-slate-800 transition shadow-md"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Tiêu đề & Logo */}
        <div className="text-center mb-3 sm:mb-4 shrink-0">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-purple-700 text-xl sm:text-2xl shadow-lg shadow-amber-500/20 mb-1.5 sm:mb-2">
            ☯
          </div>
          <h2 className="font-serif-title text-lg sm:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-500">
            {mode === 'login' ? 'ĐĂNG NHẬP THIÊN CƠ CÁC' : 'ĐĂNG KÝ HỘI VIÊN MỚI'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
            {mode === 'login' 
              ? 'Thấu thị vận mệnh • Đồng bộ hồ sơ cá nhân' 
              : 'Ghi danh hội quán • Khởi tạo vận số cá nhân'}
          </p>
        </div>

        {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl sm:rounded-2xl border border-slate-800 mb-3 sm:mb-4 shrink-0">
          <button
            type="button"
            onClick={() => handleSwitchMode('login')}
            className={`py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('register')}
            className={`py-1.5 sm:py-2 text-xs font-bold rounded-lg sm:rounded-xl transition flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng Ký</span>
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {errorMessage && (
          <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-3 p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* FORM ĐĂNG NHẬP */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ví dụ: nguyễn văn A hoặc email..."
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition disabled:opacity-50 mt-1"
            >
              {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* FORM ĐĂNG KÝ */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-2.5 sm:space-y-3">
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                Họ và tên đầy đủ <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 truncate">
                  Tên đăng nhập <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="nguyenvanan"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 truncate">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="0987654321"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1">
                Email cá nhân <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@gmail.com"
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 truncate">
                  Mật khẩu <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-1 truncate">
                  Nhập lại mật khẩu <span className="text-amber-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 text-xs sm:text-sm focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 active:scale-98 transition disabled:opacity-50 mt-1 sm:mt-2"
            >
              {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
