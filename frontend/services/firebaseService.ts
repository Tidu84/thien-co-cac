// frontend/services/firebaseService.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { UserDossier, DivinationRecord } from '../types';
import { getCurrentUser, getDeviceId } from './authService';

const FIREBASE_CONFIG_KEY = 'thien_co_cac_firebase_config';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  lastSyncedAt?: string;
}

// Cấu hình chính thức Google Firebase của tài khoản tidu888@gmail.com
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyC1lNAb3BdBNGEtjeymTcA47utiWEwXJPk",
  authDomain: "ai-vibe-coder-vn.firebaseapp.com",
  projectId: "ai-vibe-coder-vn",
  storageBucket: "ai-vibe-coder-vn.firebasestorage.app",
  messagingSenderId: "749325002016",
  appId: "1:749325002016:web:08ca1830f71b4caf1f2345"
};

let firebaseAppInstance: FirebaseApp | null = null;
let firestoreDbInstance: Firestore | null = null;

/**
 * Lấy cấu hình kết nối Google Firebase (Được cấu hình sẵn tự động 100%)
 */
export function getFirebaseConfig(): FirebaseConfig {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Error reading Firebase config:", e);
  }

  // Cấu hình từ Vite env nếu có, hoặc dùng cấu hình mặc định chính thức của Tidu Production
  const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envAuth = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN;
  const envProj = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  const envApp = (import.meta as any).env?.VITE_FIREBASE_APP_ID;
  const envBucket = (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET;

  return {
    apiKey: envKey || DEFAULT_FIREBASE_CONFIG.apiKey,
    authDomain: envAuth || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId: envProj || DEFAULT_FIREBASE_CONFIG.projectId,
    storageBucket: envBucket || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: envApp || DEFAULT_FIREBASE_CONFIG.appId,
    lastSyncedAt: undefined
  };
}

/**
 * Lưu cấu hình kết nối Google Firebase
 */
export function saveFirebaseConfig(config: FirebaseConfig): void {
  try {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    // Reset instance để khởi tạo lại
    firebaseAppInstance = null;
    firestoreDbInstance = null;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thien_co_cac_firebase_config_updated', { detail: config }));
    }
  } catch (e) {
    console.error("Error saving Firebase config:", e);
  }
}

/**
 * Khởi tạo hoặc lấy Firebase App
 */
export function getFirebaseApp(): FirebaseApp | null {
  if (firebaseAppInstance) return firebaseAppInstance;

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !config.appId) {
    return null;
  }

  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseAppInstance = existingApps[0];
    } else {
      firebaseAppInstance = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
        projectId: config.projectId,
        storageBucket: config.storageBucket || `${config.projectId}.firebasestorage.app`,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId,
        measurementId: config.measurementId
      });
    }
    return firebaseAppInstance;
  } catch (e) {
    console.error("Error initializing Google Firebase app:", e);
    return null;
  }
}

/**
 * Lấy Firestore Database instance
 */
export function getFirebaseDb(): Firestore | null {
  if (firestoreDbInstance) return firestoreDbInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    firestoreDbInstance = getFirestore(app);
    return firestoreDbInstance;
  } catch (e) {
    console.error("Error initializing Firestore:", e);
    return null;
  }
}

/**
 * Kiểm tra xem Firebase đã được thiết lập đủ thông tin hay chưa
 */
export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId && config.appId);
}

/**
 * Kiểm tra kết nối tới Google Cloud Firestore
 */
export async function testFirebaseConnection(): Promise<{ success: boolean; message: string }> {
  const db = getFirebaseDb();
  if (!db) {
    return {
      success: false,
      message: 'Chưa điền đủ thông tin Firebase (API Key, Project ID, App ID). Hãy điền và bấm Lưu!'
    };
  }

  try {
    const pingRef = doc(db, 'system_health', 'ping');
    await setDoc(pingRef, {
      status: 'online',
      appName: 'Xem bói - nhân duyên - tiền căn - hệ quả (Thiên Cơ Các)',
      testedBy: 'Admin Tidu',
      timestamp: new Date().toISOString()
    }, { merge: true });

    const snap = await getDoc(pingRef);
    if (snap.exists()) {
      return {
        success: true,
        message: 'Kết nối Google Cloud Firestore thành công mỹ mãn! Toàn bộ cơ sở dữ liệu đã sẵn sàng.'
      };
    } else {
      return {
        success: false,
        message: 'Ghi được dữ liệu nhưng không đọc lại được. Hãy kiểm tra lại Firestore Rules.'
      };
    }
  } catch (e: any) {
    console.error("Firebase test error:", e);
    if (e.code === 'permission-denied') {
      return {
        success: false,
        message: 'Bị chặn quyền truy cập (Permission Denied). Hãy bấm "Sao Chép Firestore Rules" và dán vào tab Rules trên Firebase Console.'
      };
    }
    return {
      success: false,
      message: `Lỗi kết nối Firebase: ${e.message || e}`
    };
  }
}

/**
 * Quy tắc bảo mật Firestore (Security Rules) 1-Click Copy
 */
export function getFirestoreRules(): string {
  return `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc/ghi dữ liệu hồ sơ và quẻ bói an toàn
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
}

/**
 * Đẩy một hồ sơ lên Google Firestore ngầm (CHỈ dành cho tài khoản ĐÃ ĐĂNG NHẬP)
 * Hồ sơ chưa đăng nhập TUYỆT ĐỐI chỉ lưu tại máy người đó (LocalStorage)
 */
export async function pushDossierToFirebaseAsync(dossier: UserDossier, userId?: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // Chưa đăng nhập: TUYỆT ĐỐI KHÔNG ĐƯỢC LƯU LÊN CLOUD! Chỉ lưu tại máy của người đó.
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  const currentDeviceId = dossier.deviceId || getDeviceId();
  const resolvedUserId = userId || dossier.userId || currentUser.id;

  try {
    const ref = doc(db, 'dossiers', dossier.id);
    await setDoc(ref, {
      id: dossier.id,
      userId: resolvedUserId,
      deviceId: currentDeviceId,
      fullName: dossier.fullName,
      relation: dossier.relation || 'Bản thân',
      gender: dossier.gender || 'nam',
      birthDate: dossier.birthDate || '',
      lunarDate: dossier.lunarDate || '',
      birthHour: dossier.birthHour || '',
      canChiYear: dossier.canChiYear || '',
      menhNguHanh: dossier.menhNguHanh || '',
      notes: dossier.notes || '',
      recordsCount: dossier.recordsCount || 0,
      faceImage: dossier.faceImage || null,
      faceCapturedAt: dossier.faceCapturedAt || null,
      faceVerdict: dossier.faceVerdict || null,
      palmImage: dossier.palmImage || null,
      palmCapturedAt: dossier.palmCapturedAt || null,
      palmSide: dossier.palmSide || null,
      palmCategory: dossier.palmCategory || null,
      palmVerdict: dossier.palmVerdict || null,
      bodyImage: dossier.bodyImage || null,
      bodyCapturedAt: dossier.bodyCapturedAt || null,
      bodyVerdict: dossier.bodyVerdict || null,
      createdDate: dossier.createdDate || new Date().toLocaleDateString('vi-VN'),
      lastUpdated: new Date().toLocaleString('vi-VN'),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("[Firebase] Lỗi khi đẩy hồ sơ lên Cloud Firestore:", e);
  }
}

/**
 * Xóa một hồ sơ trên Firestore
 */
export async function deleteDossierFromFirebase(dossierId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const ref = doc(db, 'dossiers', dossierId);
    await deleteDoc(ref);
  } catch (e) {
    console.warn("[Firebase] Lỗi xóa hồ sơ trên Firestore:", e);
  }
}

/**
 * Lấy TOÀN BỘ hồ sơ trên Cloud Firestore (Dành riêng cho Quản Trị Viên Master ID)
 */
export async function getAllCloudDossiersForAdmin(): Promise<UserDossier[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const dossiersCol = collection(db, 'dossiers');
    const snapshot = await getDocs(dossiersCol);
    const list: UserDossier[] = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const fullName = (data.fullName || '').toLowerCase().trim();
      const isForbidden = fullName.includes('tidu') || fullName.includes('dũng') || fullName.includes('dung');
      if (isForbidden) return;

      list.push({
        id: data.id || docSnap.id,
        userId: data.userId || 'Chưa định danh',
        deviceId: data.deviceId || 'Chưa có mã máy',
        relation: data.relation || 'Bản thân',
        fullName: data.fullName,
        gender: data.gender,
        birthDate: data.birthDate,
        lunarDate: data.lunarDate,
        birthHour: data.birthHour,
        canChiYear: data.canChiYear,
        menhNguHanh: data.menhNguHanh,
        notes: data.notes,
        recordsCount: data.recordsCount || 0,
        faceImage: data.faceImage || undefined,
        faceCapturedAt: data.faceCapturedAt || undefined,
        faceVerdict: data.faceVerdict || undefined,
        palmImage: data.palmImage || undefined,
        palmCapturedAt: data.palmCapturedAt || undefined,
        palmSide: data.palmSide || undefined,
        palmCategory: data.palmCategory || undefined,
        palmVerdict: data.palmVerdict || undefined,
        bodyImage: data.bodyImage || undefined,
        bodyCapturedAt: data.bodyCapturedAt || undefined,
        bodyVerdict: data.bodyVerdict || undefined,
        createdDate: data.createdDate || '',
        lastUpdated: data.lastUpdated || '',
        syncStatus: 'synced'
      });
    });

    return list;
  } catch (e) {
    console.error("[Firebase] Admin fetch all cloud dossiers error:", e);
    return [];
  }
}

/**
 * Đồng bộ hồ sơ giữa LocalStorage và Firestore
 * CƠ CHẾ BẢO MẬT PHÂN LẬP MÁY & TÀI KHOẢN:
 * 1. Khách vãng lai: CHỈ tải hồ sơ tạo bởi chính thiết bị này (deviceId == currentDeviceId).
 * 2. Thành viên: CHỈ tải hồ sơ thuộc về userId của mình và deviceId máy này.
 * 3. Tuyệt đối không tải hồ sơ của các thiết bị hay người dùng khác.
 */
export async function syncDossiersWithFirebase(localDossiers: UserDossier[]): Promise<UserDossier[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // CHƯA ĐĂNG NHẬP: TUYỆT ĐỐI CHỈ LƯU TẠI MÁY CỦA NGƯỜI ĐÓ, KHÔNG SYNC CLOUD!
    return localDossiers;
  }

  const db = getFirebaseDb();
  if (!db) {
    return localDossiers;
  }

  const currentDeviceId = getDeviceId();

  try {
    const dossiersCol = collection(db, 'dossiers');
    const cloudDocsMap = new Map<string, any>();

    // 1. Người dùng đã đăng nhập: Tải các hồ sơ thuộc về tài khoản này
    const qUser = query(dossiersCol, where('userId', '==', currentUser.id));
    const snapUser = await getDocs(qUser);
    snapUser.forEach(docSnap => cloudDocsMap.set(docSnap.id, docSnap.data()));

    const cloudDossiers: UserDossier[] = [];

    cloudDocsMap.forEach((data, docId) => {
      const fullName = (data.fullName || '').toLowerCase().trim();
      const isForbidden = fullName.includes('tidu') || fullName.includes('dũng') || fullName.includes('dung');
      if (isForbidden) {
        deleteDoc(doc(db, 'dossiers', docId)).catch(() => {});
        return;
      }
      cloudDossiers.push({
        id: data.id || docId,
        userId: data.userId || (currentUser ? currentUser.id : 'guest'),
        deviceId: data.deviceId || '',
        relation: data.relation || 'Bản thân',
        fullName: data.fullName,
        gender: data.gender,
        birthDate: data.birthDate,
        lunarDate: data.lunarDate,
        birthHour: data.birthHour,
        canChiYear: data.canChiYear,
        menhNguHanh: data.menhNguHanh,
        notes: data.notes,
        recordsCount: data.recordsCount || 0,
        faceImage: data.faceImage || undefined,
        faceCapturedAt: data.faceCapturedAt || undefined,
        faceVerdict: data.faceVerdict || undefined,
        palmImage: data.palmImage || undefined,
        palmCapturedAt: data.palmCapturedAt || undefined,
        palmSide: data.palmSide || undefined,
        palmCategory: data.palmCategory || undefined,
        palmVerdict: data.palmVerdict || undefined,
        bodyImage: data.bodyImage || undefined,
        bodyCapturedAt: data.bodyCapturedAt || undefined,
        bodyVerdict: data.bodyVerdict || undefined,
        createdDate: data.createdDate || new Date().toLocaleDateString('vi-VN'),
        lastUpdated: data.lastUpdated || new Date().toLocaleString('vi-VN'),
        syncStatus: 'synced'
      });
    });

    // 2. Hợp nhất (Merge)
    const mergedMap = new Map<string, UserDossier>();
    cloudDossiers.forEach(d => mergedMap.set(d.id, d));

    // Đưa hồ sơ local của máy này lên cloud nếu chưa có
    localDossiers.forEach(d => {
      // Chỉ đồng bộ nếu hồ sơ thuộc về máy này hoặc tài khoản này
      const isMine = (currentUser && d.userId === currentUser.id) || (d.deviceId === currentDeviceId);
      if (!isMine && currentUser?.role !== 'admin') return;

      if (!mergedMap.has(d.id)) {
        const enriched: UserDossier = {
          ...d,
          userId: currentUser?.id || d.userId || 'guest',
          deviceId: d.deviceId || currentDeviceId,
          syncStatus: 'local'
        };
        mergedMap.set(d.id, enriched);
        pushDossierToFirebaseAsync(enriched, currentUser?.id);
      }
    });

    const currentUserIsAdmin = currentUser?.role === 'admin';
    const allMerged = Array.from(mergedMap.values());
    const result = currentUserIsAdmin
      ? allMerged
      : allMerged.filter(d => {
          if (currentUser && d.userId && d.userId === currentUser.id) return true;
          if (d.deviceId && d.deviceId === currentDeviceId) return true;
          return false;
        });

    // Cập nhật timestamp
    const config = getFirebaseConfig();
    config.lastSyncedAt = new Date().toLocaleString('vi-VN');
    saveFirebaseConfig(config);

    return result;
  } catch (e) {
    console.error("[Firebase] Sync exception:", e);
    return localDossiers;
  }
}

/**
 * Đẩy một bản ghi xem bói (DivinationRecord) lên Firestore (CHỈ khi đã đăng nhập)
 */
export async function pushRecordToFirebaseAsync(record: DivinationRecord): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // Chưa đăng nhập: TUYỆT ĐỐI KHÔNG ĐƯỢC LƯU LÊN CLOUD! Chỉ lưu tại máy của người đó.
    return;
  }

  const db = getFirebaseDb();
  if (!db) return;

  const currentDeviceId = record.deviceId || getDeviceId();

  try {
    const ref = doc(db, 'divination_records', record.id);
    await setDoc(ref, {
      id: record.id,
      userId: record.userId || currentUser?.id || 'guest',
      deviceId: currentDeviceId,
      dossierId: record.dossierId || null,
      personName: record.personName || 'Hữu Duyên Khách',
      type: record.type,
      title: record.title,
      summary: record.summary,
      fullContent: record.fullContent,
      capturedImage: record.capturedImage || null,
      date: record.date || new Date().toLocaleString('vi-VN'),
      createdAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("[Firebase] Lỗi khi đẩy quẻ lên Firestore:", e);
  }
}

/**
 * Xóa quẻ trên Firestore
 */
export async function deleteRecordFromFirebase(recordId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const ref = doc(db, 'divination_records', recordId);
    await deleteDoc(ref);
  } catch (e) {
    console.warn("[Firebase] Lỗi xóa quẻ trên Firestore:", e);
  }
}

/**
 * Đẩy tài khoản người dùng đăng ký lên Firestore
 */
export async function pushProfileToFirebaseAsync(user: any): Promise<void> {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const ref = doc(db, 'profiles', user.id);
    await setDoc(ref, {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      createdAt: user.createdAt || new Date().toLocaleString('vi-VN'),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    console.warn("[Firebase] Lỗi lưu profile lên Firestore:", e);
  }
}
