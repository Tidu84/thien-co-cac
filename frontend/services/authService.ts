// frontend/services/authService.ts
import { pushProfileToFirebaseAsync } from './firebaseService';

export interface AuthUser {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  createdAt: string;
  avatar?: string;
}

export interface AdminNotification {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  timestamp: string;
  status: 'sent' | 'pending';
}

const USERS_STORAGE_KEY = 'thien_co_cac_registered_users';
const CURRENT_USER_KEY = 'thien_co_cac_current_user';
const NOTIFICATIONS_KEY = 'thien_co_cac_admin_notifications';
const DEVICE_ID_KEY = 'thien_co_cac_device_id';

/**
 * Lấy hoặc khởi tạo Device ID định danh duy nhất cho máy/thiết bị này
 */
export function getOrCreateDeviceId(): string {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
  } catch {
    return 'dev_fallback';
  }
}

export function getDeviceId(): string {
  return getOrCreateDeviceId();
}

// Cấu hình tài khoản Quản Trị Viên Hệ Thống (Bảo mật tối cao, không lộ ra UI hay Export)
const ADMIN_EMAIL = 'tidu888@gmail.com';
const ADMIN_USERNAMES = ['tidu', 'admin'];
const ADMIN_PASSWORDS = ['Tidudaulau'];

export function isReservedAdminUsername(username: string): boolean {
  const u = (username || '').trim().toLowerCase();
  return ADMIN_USERNAMES.includes(u) || u === 'quantri' || u === 'administrator';
}

/**
 * Lấy danh sách toàn bộ người dùng đã đăng ký
 */
export function getRegisteredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading users:", e);
    return [];
  }
}

/**
 * Lưu danh sách người dùng
 */
function saveUsers(users: AuthUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("Error saving users:", e);
  }
}

/**
 * Lấy người dùng đang đăng nhập
 */
export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

/**
 * Lưu phiên đăng nhập hiện tại
 */
export function setCurrentUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('thien_co_cac_auth_changed', { detail: user }));
  }
}

/**
 * Lấy danh sách lịch sử thông báo đã gửi về mail Admin
 */
export function getAdminNotifications(): AdminNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * Gửi email thông báo tự động về tidu888@gmail.com khi có thành viên mới đăng ký
 */
async function sendEmailNotificationToAdmin(newUser: AuthUser): Promise<void> {
  const notification: AdminNotification = {
    id: 'notif-' + Date.now(),
    userId: newUser.id,
    username: newUser.username,
    fullName: newUser.fullName,
    email: newUser.email,
    phone: newUser.phone,
    timestamp: new Date().toLocaleString('vi-VN'),
    status: 'pending'
  };

  // Lưu trước vào nhật ký quản trị
  const currentNotifs = getAdminNotifications();
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([notification, ...currentNotifs]));

  try {
    // Gửi email thực sự qua dịch vụ FormSubmit AJAX tới tidu888@gmail.com
    const response = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        _subject: `🎉 [Tidu Production] Có người dùng mới đăng ký: ${newUser.fullName} (${newUser.username})`,
        _template: 'table',
        _captcha: 'false',
        'Họ và tên': newUser.fullName,
        'Tên đăng nhập': newUser.username,
        'Email thành viên': newUser.email,
        'Số điện thoại': newUser.phone || 'Chưa cung cấp',
        'Thời gian đăng ký': notification.timestamp,
        'Ứng dụng': 'Xem bói - nhân duyên - tiền căn - hệ quả (Thiên Cơ Các)',
        'Ghi chú': 'Thông báo tự động từ hệ sinh thái Tidu Production'
      })
    });

    if (response.ok) {
      notification.status = 'sent';
      const updated = getAdminNotifications().map(n => n.id === notification.id ? { ...n, status: 'sent' as const } : n);
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
      console.log(`[AuthService] Đã gửi thông báo đăng ký tới ${ADMIN_EMAIL} thành công!`);
    }
  } catch (error) {
    console.warn("[AuthService] Gửi email ngầm tới FormSubmit: (Dữ liệu đã được lưu an toàn trong hàng đợi Admin)", error);
  }
}

/**
 * Đăng ký tài khoản người dùng mới
 */
export async function registerUser(params: {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
}): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  const usernameClean = params.username.trim().toLowerCase();
  const emailClean = params.email.trim().toLowerCase();

  if (!usernameClean || !params.password || !params.fullName.trim() || !emailClean) {
    return { success: false, message: 'Vui lòng điền đầy đủ các trường thông tin bắt buộc!' };
  }

  // Không cho trùng tên tài khoản Quản trị
  if (isReservedAdminUsername(usernameClean)) {
    return { success: false, message: 'Tên đăng nhập này được dành riêng cho Quản Trị Viên Hệ Thống!' };
  }

  const users = getRegisteredUsers();
  const existingUser = users.find(
    u => u.username.toLowerCase() === usernameClean || u.email.toLowerCase() === emailClean
  );

  if (existingUser) {
    return { success: false, message: 'Tên đăng nhập hoặc Email này đã có người đăng ký!' };
  }

  const newUser: AuthUser = {
    id: 'user-' + Date.now(),
    username: usernameClean,
    fullName: params.fullName.trim(),
    email: emailClean,
    phone: params.phone?.trim() || '',
    role: 'user',
    createdAt: new Date().toLocaleString('vi-VN'),
    avatar: '☯️'
  };

  // Lưu danh sách người dùng (mã hóa cơ bản mật khẩu)
  const passwordKey = `pwd_${newUser.id}`;
  try {
    localStorage.setItem(passwordKey, btoa(params.password));
  } catch {}

  users.unshift(newUser);
  saveUsers(users);

  // Tự động gửi email thông báo về cho Admin ngầm (Không lộ email ra giao diện)
  sendEmailNotificationToAdmin(newUser);

  // Đẩy hồ sơ thành viên lên Google Firebase
  pushProfileToFirebaseAsync(newUser);

  // Tự động đăng nhập
  setCurrentUser(newUser);

  return { 
    success: true, 
    message: 'Đăng ký tài khoản thành công! Dữ liệu hồ sơ của bạn đã được bảo vệ và đồng bộ an toàn.', 
    user: newUser 
  };
}

/**
 * Đăng nhập tài khoản
 */
export async function loginUser(
  usernameOrEmail: string,
  passwordInput: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  const inputClean = usernameOrEmail.trim().toLowerCase();

  if (!inputClean || !passwordInput) {
    return { success: false, message: 'Vui lòng nhập tên đăng nhập/email và mật khẩu!' };
  }

  // 1. Kiểm tra tài khoản Quản Trị Viên Hệ Thống
  const isAdminMatch = (ADMIN_USERNAMES.includes(inputClean) || inputClean === ADMIN_EMAIL.toLowerCase()) &&
    ADMIN_PASSWORDS.includes(passwordInput);

  if (isAdminMatch) {
    const adminUser: AuthUser = {
      id: 'admin-master',
      username: 'admin',
      fullName: 'Quản Trị Viên Hệ Thống',
      email: 'quantri@thiencocac.vn',
      role: 'admin',
      createdAt: 'Khởi nguyên',
      avatar: '👑'
    };
    setCurrentUser(adminUser);
    return { success: true, message: 'Chào mừng Quản Trị Viên đăng nhập thành công!', user: adminUser };
  }

  // 2. Kiểm tra tài khoản thành viên thông thường
  const users = getRegisteredUsers();
  const matchedUser = users.find(
    u => u.username.toLowerCase() === inputClean || u.email.toLowerCase() === inputClean
  );

  if (!matchedUser) {
    return { success: false, message: 'Không tìm thấy tài khoản người dùng này!' };
  }

  const passwordKey = `pwd_${matchedUser.id}`;
  const storedHash = localStorage.getItem(passwordKey);
  const isPasswordCorrect = storedHash ? (atob(storedHash) === passwordInput) : true;

  if (!isPasswordCorrect) {
    return { success: false, message: 'Mật khẩu không chính xác, vui lòng kiểm tra lại!' };
  }

  setCurrentUser(matchedUser);
  return { success: true, message: `Chào mừng ${matchedUser.fullName} trở lại!`, user: matchedUser };
}

/**
 * Đăng xuất
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Xóa người dùng (Dành riêng cho Admin)
 */
export function deleteUserByAdmin(userId: string): boolean {
  try {
    const users = getRegisteredUsers().filter(u => u.id !== userId);
    saveUsers(users);
    localStorage.removeItem(`pwd_${userId}`);
    return true;
  } catch (e) {
    return false;
  }
}
