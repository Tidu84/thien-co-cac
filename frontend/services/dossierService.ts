import { UserDossier, DivinationRecord } from '../types';

const DOSSIERS_STORAGE_KEY = 'thien_co_cac_user_dossiers';
const ACTIVE_NAME_STORAGE_KEY = 'thien_co_cac_user_name';

/**
 * Lấy danh sách toàn bộ hồ sơ đương số đã lưu trữ
 */
export function getUserDossiers(): UserDossier[] {
  try {
    const raw = localStorage.getItem(DOSSIERS_STORAGE_KEY);
    if (!raw) {
      // Khởi tạo hồ sơ mặc định ban đầu nếu có tên đã lưu
      const activeName = getActiveDossierName();
      if (activeName && activeName !== 'Hữu Duyên Khách') {
        const initDossier: UserDossier = {
          id: 'dos-' + Date.now(),
          fullName: activeName,
          createdDate: new Date().toLocaleDateString('vi-VN'),
          lastUpdated: new Date().toLocaleString('vi-VN'),
          recordsCount: 0
        };
        saveDossiers([initDossier]);
        return [initDossier];
      }
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Error reading user dossiers from storage:", e);
    return [];
  }
}

/**
 * Lưu danh sách hồ sơ vào LocalStorage và phát sự kiện đồng bộ
 */
function saveDossiers(dossiers: UserDossier[]): void {
  try {
    localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(dossiers));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thien_co_cac_dossier_updated', { detail: dossiers }));
    }
  } catch (e) {
    console.error("Error saving dossiers:", e);
  }
}

/**
 * Lấy tên của đương số đang hoạt động (active)
 */
export function getActiveDossierName(): string {
  try {
    return localStorage.getItem(ACTIVE_NAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

/**
 * Lấy chi tiết hồ sơ của đương số đang chọn
 */
export function getActiveDossier(): UserDossier | null {
  const activeName = getActiveDossierName();
  if (!activeName) return null;
  const list = getUserDossiers();
  return list.find(d => d.fullName.trim().toLowerCase() === activeName.trim().toLowerCase()) || null;
}

/**
 * Đổi đương số đang chọn và thông báo toàn app
 */
export function setActiveDossierName(name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(ACTIVE_NAME_STORAGE_KEY, trimmed);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thien_co_cac_active_name_changed', { detail: trimmed }));
    }
  } catch (e) {
    console.error("Error setting active name:", e);
  }
}

/**
 * BẤT CỨ KHI NÀO NGƯỜI DÙNG KHAI TÊN HOẶC THÔNG TIN -> TỰ ĐỘNG LƯU / CẬP NHẬT HỒ SƠ NGAY
 */
export function upsertUserDossier(info: {
  fullName: string;
  gender?: 'nam' | 'nu';
  birthDate?: string;
  lunarDate?: string;
  birthHour?: string;
  canChiYear?: string;
  menhNguHanh?: string;
  notes?: string;
}): UserDossier {
  const trimmedName = info.fullName.trim();
  if (!trimmedName || trimmedName === 'Hữu Duyên Khách') {
    // Không lưu nếu là tên mặc định trống
    return {
      id: 'temp',
      fullName: trimmedName || 'Hữu Duyên Khách',
      createdDate: new Date().toLocaleDateString('vi-VN'),
      lastUpdated: new Date().toLocaleString('vi-VN')
    };
  }

  const dossiers = getUserDossiers();
  const existingIndex = dossiers.findIndex(
    d => d.fullName.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  const nowStr = new Date().toLocaleString('vi-VN');
  let targetDossier: UserDossier;

  if (existingIndex >= 0) {
    // Đã có -> Cập nhật thông tin mới nhất
    targetDossier = {
      ...dossiers[existingIndex],
      fullName: trimmedName,
      gender: info.gender || dossiers[existingIndex].gender,
      birthDate: info.birthDate || dossiers[existingIndex].birthDate,
      lunarDate: info.lunarDate || dossiers[existingIndex].lunarDate,
      birthHour: info.birthHour || dossiers[existingIndex].birthHour,
      canChiYear: info.canChiYear || dossiers[existingIndex].canChiYear,
      menhNguHanh: info.menhNguHanh || dossiers[existingIndex].menhNguHanh,
      notes: info.notes !== undefined ? info.notes : dossiers[existingIndex].notes,
      lastUpdated: nowStr
    };
    dossiers[existingIndex] = targetDossier;
  } else {
    // Người mới -> Tạo hồ sơ mới
    targetDossier = {
      id: 'dos-' + Date.now(),
      fullName: trimmedName,
      gender: info.gender,
      birthDate: info.birthDate,
      lunarDate: info.lunarDate,
      birthHour: info.birthHour,
      canChiYear: info.canChiYear,
      menhNguHanh: info.menhNguHanh,
      notes: info.notes,
      createdDate: new Date().toLocaleDateString('vi-VN'),
      lastUpdated: nowStr,
      recordsCount: 0
    };
    dossiers.unshift(targetDossier);
  }

  saveDossiers(dossiers);
  setActiveDossierName(trimmedName);

  return targetDossier;
}

/**
 * Xóa một hồ sơ
 */
export function deleteUserDossier(id: string): void {
  const dossiers = getUserDossiers();
  const filtered = dossiers.filter(d => d.id !== id);
  saveDossiers(filtered);

  const activeName = getActiveDossierName();
  const deleted = dossiers.find(d => d.id === id);
  if (deleted && deleted.fullName === activeName) {
    if (filtered.length > 0) {
      setActiveDossierName(filtered[0].fullName);
    } else {
      localStorage.removeItem(ACTIVE_NAME_STORAGE_KEY);
    }
  }
}

/**
 * Tự động tính toán lại số lượng quẻ của từng người dựa vào sổ tay records
 */
export function syncDossierRecordCounts(records: DivinationRecord[]): void {
  const dossiers = getUserDossiers();
  if (dossiers.length === 0) return;

  let hasChanged = false;
  const updated = dossiers.map(d => {
    const count = records.filter(
      r => (r.personName || '').trim().toLowerCase() === d.fullName.trim().toLowerCase()
    ).length;
    if (d.recordsCount !== count) {
      hasChanged = true;
      return { ...d, recordsCount: count };
    }
    return d;
  });

  if (hasChanged) {
    saveDossiers(updated);
  }
}
