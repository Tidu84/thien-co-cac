import { UserDossier, DivinationRecord } from '../types';
import { pushDossierToCloudAsync, deleteDossierFromCloud, syncDossiersWithCloud } from './cloudStorageService';
import { 
  pushDossierToFirebaseAsync, 
  deleteDossierFromFirebase, 
  syncDossiersWithFirebase, 
  isFirebaseConfigured 
} from './firebaseService';
import { getCurrentUser, getDeviceId } from './authService';

const DOSSIERS_STORAGE_KEY = 'thien_co_cac_user_dossiers';
const ACTIVE_NAME_STORAGE_KEY = 'thien_co_cac_user_name';

/**
 * Danh sách hồ sơ mẫu/cũ cần loại bỏ hoàn toàn
 */
const FORBIDDEN_NAMES = ['tidu nguyen', 'tidu nguyễn', 'nguyễn tiến dũng', 'nguyen tien dung'];

export function isForbiddenDossierName(name: string): boolean {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  return FORBIDDEN_NAMES.some(f => n === f || n.includes(f));
}

/**
 * Lấy danh sách toàn bộ hồ sơ đương số đã lưu trữ (Tự động dọn dẹp hồ sơ mẫu)
 */
export function getUserDossiers(): UserDossier[] {
  try {
    const raw = localStorage.getItem(DOSSIERS_STORAGE_KEY);
    let list: UserDossier[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    }

    const currentUser = getCurrentUser();
    const isAdmin = currentUser?.role === 'admin';
    const currentDeviceId = getDeviceId();

    // Dọn sạch kho tổng 63 hồ sơ đám mây còn đọng trong LocalStorage của máy người dùng/khách
    const hasPurged = localStorage.getItem('thien_co_cac_isolated_cloud_v4');
    if (!hasPurged) {
      localStorage.setItem('thien_co_cac_isolated_cloud_v4', 'done');
      if (!isAdmin) {
        list = list.filter(d => (d as any).isLocalCreated === true && d.userId !== 'guest');
        localStorage.setItem(DOSSIERS_STORAGE_KEY, JSON.stringify(list));
      }
    }

    // 1. Tự động loại bỏ hồ sơ của Tidu Nguyen và Nguyễn Tiến Dũng
    let cleanList = list.filter(d => !isForbiddenDossierName(d.fullName));

    // 2. PHÂN QUYỀN VÀ BẢO MẬT HỒ SƠ:
    // User request:
    // - Tất cả những hồ sơ chưa đăng nhập thì CHỈ LƯU TẠI MÁY của người đó, không cho lưu cloud.
    // - Nếu chưa đăng nhập thì KHÔNG có chức năng xem hộ, CHỈ XEM CHO MỘT MÌNH NGƯỜI ĐÓ THÔI.
    // - Hồ sơ admin thì cần phải quản lý bảo mật, tuyệt đối không được lộ bất kỳ thông tin trên ứng dụng.
    if (!currentUser) {
      // Khách chưa đăng nhập: Tuyệt đối chỉ cho phép xem đúng 1 hồ sơ cá nhân ("Bản thân") lưu cục bộ trên máy!
      const selfDossier = cleanList.find(d => d.relation === 'Bản thân' || !d.relation);
      return selfDossier ? [selfDossier] : [];
    }

    if (!isAdmin) {
      // Người dùng thành viên đã đăng nhập: Chỉ thấy các hồ sơ thuộc về userId của chính mình
      cleanList = cleanList.filter(d => d.userId && d.userId === currentUser.id);
    }

    if (cleanList.length !== list.length) {
      const deleted = list.filter(d => isForbiddenDossierName(d.fullName));
      deleted.forEach(d => {
        deleteDossierFromFirebase(d.id);
        deleteDossierFromCloud(d.id);
      });
      saveDossiers(cleanList);
    }

    // Kiểm tra tên đang kích hoạt
    const activeName = localStorage.getItem(ACTIVE_NAME_STORAGE_KEY) || '';
    if (isForbiddenDossierName(activeName) || !cleanList.some(d => d.fullName.toLowerCase() === activeName.toLowerCase())) {
      localStorage.removeItem(ACTIVE_NAME_STORAGE_KEY);
    }

    return cleanList;
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
    const name = localStorage.getItem(ACTIVE_NAME_STORAGE_KEY) || '';
    if (isForbiddenDossierName(name) || name === 'Khách Vãng Lai' || name === 'Hồ sơ trống') {
      localStorage.removeItem(ACTIVE_NAME_STORAGE_KEY);
      return '';
    }
    return name;
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
 * Nếu truyền rỗng hoặc "Khách Vãng Lai", chuyển về Hồ sơ trống
 */
export function setActiveDossierName(name: string): void {
  const trimmed = (name || '').trim();
  if (!trimmed || trimmed === 'Khách Vãng Lai' || trimmed === 'Hồ sơ trống' || isForbiddenDossierName(trimmed)) {
    try {
      localStorage.removeItem(ACTIVE_NAME_STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('thien_co_cac_active_name_changed', { 
          detail: { name: '', dossier: null } 
        }));
      }
    } catch (e) {
      console.error("Error clearing active name:", e);
    }
    return;
  }
  try {
    localStorage.setItem(ACTIVE_NAME_STORAGE_KEY, trimmed);
    if (typeof window !== 'undefined') {
      const activeDos = getActiveDossier();
      window.dispatchEvent(new CustomEvent('thien_co_cac_active_name_changed', { 
        detail: { name: trimmed, dossier: activeDos } 
      }));
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
  userId?: string;
  relation?: string;
  gender?: 'nam' | 'nu';
  birthDate?: string;
  lunarDate?: string;
  birthHour?: string;
  canChiYear?: string;
  menhNguHanh?: string;
  notes?: string;
  faceImage?: string;
  faceCapturedAt?: string;
  faceVerdict?: string;
  palmImage?: string;
  palmCapturedAt?: string;
  palmSide?: 'left' | 'right';
  palmCategory?: string;
  palmVerdict?: string;
  bodyImage?: string;
  bodyCapturedAt?: string;
  bodyVerdict?: string;
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

  const currentUser = getCurrentUser();
  const currentDeviceId = getDeviceId();
  const dossiers = getUserDossiers();
  const nowStr = new Date().toLocaleString('vi-VN');

  // NẾU CHƯA ĐĂNG NHẬP:
  // - Tuyệt đối chỉ lưu tại máy của người đó (LocalStorage)
  // - Không có chức năng xem hộ, chỉ xem cho một mình người đó thôi (Hồ sơ "Bản thân")
  // - Không đẩy lên Google Firebase hay Cloud
  if (!currentUser) {
    const existing = dossiers[0];
    const targetDossier: UserDossier = {
      id: existing ? existing.id : ('dos-local-' + Date.now()),
      userId: 'local-guest',
      deviceId: currentDeviceId,
      relation: 'Bản thân',
      fullName: trimmedName,
      gender: info.gender || existing?.gender,
      birthDate: info.birthDate || existing?.birthDate,
      lunarDate: info.lunarDate || existing?.lunarDate,
      birthHour: info.birthHour || existing?.birthHour,
      canChiYear: info.canChiYear || existing?.canChiYear,
      menhNguHanh: info.menhNguHanh || existing?.menhNguHanh,
      notes: info.notes !== undefined ? info.notes : existing?.notes,
      faceImage: info.faceImage || existing?.faceImage,
      faceCapturedAt: info.faceCapturedAt || (info.faceImage ? nowStr : existing?.faceCapturedAt),
      faceVerdict: info.faceVerdict !== undefined ? info.faceVerdict : existing?.faceVerdict,
      palmImage: info.palmImage || existing?.palmImage,
      palmCapturedAt: info.palmCapturedAt || (info.palmImage ? nowStr : existing?.palmCapturedAt),
      palmSide: info.palmSide || existing?.palmSide,
      palmCategory: info.palmCategory || existing?.palmCategory,
      palmVerdict: info.palmVerdict !== undefined ? info.palmVerdict : existing?.palmVerdict,
      bodyImage: info.bodyImage || existing?.bodyImage,
      bodyCapturedAt: info.bodyCapturedAt || (info.bodyImage ? nowStr : existing?.bodyCapturedAt),
      bodyVerdict: info.bodyVerdict !== undefined ? info.bodyVerdict : existing?.bodyVerdict,
      createdDate: existing?.createdDate || new Date().toLocaleDateString('vi-VN'),
      lastUpdated: nowStr,
      isLocalCreated: true,
      recordsCount: existing?.recordsCount || 0
    };
    saveDossiers([targetDossier]);
    setActiveDossierName(trimmedName);
    return targetDossier;
  }

  // ĐÃ ĐĂNG NHẬP: Được phép lưu nhiều hồ sơ (bản thân & xem hộ) và đồng bộ lên Cloud
  const currentUserId = info.userId || currentUser.id;
  const existingIndex = dossiers.findIndex(
    d => d.fullName.trim().toLowerCase() === trimmedName.toLowerCase()
  );

  let targetDossier: UserDossier;

  if (existingIndex >= 0) {
    // Đã có -> Cập nhật thông tin mới nhất và giữ lại các ảnh đã chụp nếu không nạp ảnh mới
    targetDossier = {
      ...dossiers[existingIndex],
      userId: currentUserId !== 'guest' ? currentUserId : (dossiers[existingIndex].userId || 'guest'),
      deviceId: dossiers[existingIndex].deviceId || currentDeviceId,
      relation: info.relation !== undefined ? info.relation : (dossiers[existingIndex].relation || 'Bản thân'),
      fullName: trimmedName,
      gender: info.gender || dossiers[existingIndex].gender,
      birthDate: info.birthDate || dossiers[existingIndex].birthDate,
      lunarDate: info.lunarDate || dossiers[existingIndex].lunarDate,
      birthHour: info.birthHour || dossiers[existingIndex].birthHour,
      canChiYear: info.canChiYear || dossiers[existingIndex].canChiYear,
      menhNguHanh: info.menhNguHanh || dossiers[existingIndex].menhNguHanh,
      notes: info.notes !== undefined ? info.notes : dossiers[existingIndex].notes,
      
      // Ảnh khuôn mặt
      faceImage: info.faceImage || dossiers[existingIndex].faceImage,
      faceCapturedAt: info.faceCapturedAt || (info.faceImage ? nowStr : dossiers[existingIndex].faceCapturedAt),
      faceVerdict: info.faceVerdict !== undefined ? info.faceVerdict : dossiers[existingIndex].faceVerdict,

      // Ảnh chỉ tay
      palmImage: info.palmImage || dossiers[existingIndex].palmImage,
      palmCapturedAt: info.palmCapturedAt || (info.palmImage ? nowStr : dossiers[existingIndex].palmCapturedAt),
      palmSide: info.palmSide || dossiers[existingIndex].palmSide,
      palmCategory: info.palmCategory || dossiers[existingIndex].palmCategory,
      palmVerdict: info.palmVerdict !== undefined ? info.palmVerdict : dossiers[existingIndex].palmVerdict,

      // Ảnh toàn thân
      bodyImage: info.bodyImage || dossiers[existingIndex].bodyImage,
      bodyCapturedAt: info.bodyCapturedAt || (info.bodyImage ? nowStr : dossiers[existingIndex].bodyCapturedAt),
      bodyVerdict: info.bodyVerdict !== undefined ? info.bodyVerdict : dossiers[existingIndex].bodyVerdict,

      lastUpdated: nowStr
    };
    dossiers[existingIndex] = targetDossier;
  } else {
    // Người mới -> Tạo hồ sơ mới
    targetDossier = {
      id: 'dos-' + Date.now(),
      userId: currentUserId,
      deviceId: currentDeviceId,
      relation: info.relation || 'Bản thân',
      fullName: trimmedName,
      gender: info.gender,
      birthDate: info.birthDate,
      lunarDate: info.lunarDate,
      birthHour: info.birthHour,
      canChiYear: info.canChiYear,
      menhNguHanh: info.menhNguHanh,
      notes: info.notes,
      faceImage: info.faceImage,
      faceCapturedAt: info.faceImage ? nowStr : undefined,
      faceVerdict: info.faceVerdict,
      palmImage: info.palmImage,
      palmCapturedAt: info.palmImage ? nowStr : undefined,
      palmSide: info.palmSide,
      palmCategory: info.palmCategory,
      palmVerdict: info.palmVerdict,
      bodyImage: info.bodyImage,
      bodyCapturedAt: info.bodyImage ? nowStr : undefined,
      bodyVerdict: info.bodyVerdict,
      createdDate: new Date().toLocaleDateString('vi-VN'),
      lastUpdated: nowStr,
      isLocalCreated: true,
      recordsCount: 0
    };
    dossiers.unshift(targetDossier);
  }

  saveDossiers(dossiers);
  setActiveDossierName(trimmedName);

  // Đẩy lên đám mây ngầm (Ưu tiên Google Firebase trước)
  pushDossierToFirebaseAsync(targetDossier, currentUserId);
  pushDossierToCloudAsync(targetDossier, currentUserId);

  return targetDossier;
}

/**
 * Xóa một hồ sơ
 */
export function deleteUserDossier(id: string): void {
  const dossiers = getUserDossiers();
  const filtered = dossiers.filter(d => d.id !== id);
  saveDossiers(filtered);

  // Xóa trên Google Firebase & Cloud
  deleteDossierFromFirebase(id);
  deleteDossierFromCloud(id);

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
 * Kích hoạt đồng bộ Cloud ngay lập tức (Ưu tiên Google Cloud Firebase)
 * CHỈ dành cho tài khoản ĐÃ ĐĂNG NHẬP. Chưa đăng nhập thì chỉ lưu tại máy!
 */
export async function syncDossiersWithCloudNow(): Promise<UserDossier[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // CHƯA ĐĂNG NHẬP: TUYỆT ĐỐI CHỈ LƯU TẠI MÁY CỦA NGƯỜI ĐÓ, KHÔNG SYNC CLOUD!
    return getUserDossiers();
  }

  const localList = getUserDossiers();
  let merged: UserDossier[] = localList;

  // Ưu tiên số 1: Google Cloud Firestore
  if (isFirebaseConfigured()) {
    try {
      merged = await syncDossiersWithFirebase(localList);
    } catch (e) {
      console.warn("[DossierService] Firebase sync notice:", e);
    }
  }

  // Hỗ trợ thêm Supabase nếu có
  try {
    merged = await syncDossiersWithCloud(merged);
  } catch (e) {
    console.warn("[DossierService] Supabase sync notice:", e);
  }

  const isAdmin = currentUser.role === 'admin';
  const currentDeviceId = getDeviceId();

  // Đảm bảo sau khi đồng bộ, nếu KHÔNG PHẢI admin thì TUYỆT ĐỐI không lưu hay trả về hồ sơ của máy/tài khoản khác!
  let safeMerged = (merged || []).filter(d => !isForbiddenDossierName(d.fullName));
  if (!isAdmin) {
    safeMerged = safeMerged.filter(d => {
      if (currentUser && d.userId && d.userId === currentUser.id) return true;
      if (d.deviceId && d.deviceId === currentDeviceId && (d as any).isLocalCreated === true) return true;
      return false;
    });
  }

  saveDossiers(safeMerged);
  return safeMerged;
}

/**
 * Tự động tính toán lại số lượng quẻ và đồng bộ ảnh chụp đã có vào hồ sơ
 */
export function syncDossierRecordCounts(records: DivinationRecord[]): void {
  const dossiers = getUserDossiers();
  if (dossiers.length === 0) return;

  let hasChanged = false;
  const updated = dossiers.map(d => {
    const userRecords = records.filter(
      r => (r.personName || '').trim().toLowerCase() === d.fullName.trim().toLowerCase()
    );
    const count = userRecords.length;
    let modifiedDossier = { ...d };

    if (d.recordsCount !== count) {
      hasChanged = true;
      modifiedDossier.recordsCount = count;
    }

    // Tự động khôi phục ảnh mặt, ảnh chỉ tay, ảnh toàn thân nếu hồ sơ chưa có nhưng trong sổ quẻ đã có
    if (!modifiedDossier.faceImage) {
      const faceRec = userRecords.find(r => r.type === 'face' && r.capturedImage);
      if (faceRec && faceRec.capturedImage) {
        modifiedDossier.faceImage = faceRec.capturedImage;
        modifiedDossier.faceCapturedAt = faceRec.date;
        modifiedDossier.faceVerdict = faceRec.summary;
        hasChanged = true;
      }
    }

    if (!modifiedDossier.palmImage) {
      const palmRec = userRecords.find(r => r.type === 'palm' && r.capturedImage);
      if (palmRec && palmRec.capturedImage) {
        modifiedDossier.palmImage = palmRec.capturedImage;
        modifiedDossier.palmCapturedAt = palmRec.date;
        modifiedDossier.palmVerdict = palmRec.summary;
        hasChanged = true;
      }
    }

    if (!modifiedDossier.bodyImage) {
      const bodyRec = userRecords.find(r => r.type === 'body' && r.capturedImage);
      if (bodyRec && bodyRec.capturedImage) {
        modifiedDossier.bodyImage = bodyRec.capturedImage;
        modifiedDossier.bodyCapturedAt = bodyRec.date;
        modifiedDossier.bodyVerdict = bodyRec.summary;
        hasChanged = true;
      }
    }

    return modifiedDossier;
  });

  if (hasChanged) {
    saveDossiers(updated);
  }
}
