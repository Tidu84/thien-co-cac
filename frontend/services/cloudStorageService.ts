// frontend/services/cloudStorageService.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserDossier, DivinationRecord } from '../types';
import { getCurrentUser } from './authService';

const CLOUD_CONFIG_KEY = 'thien_co_cac_cloud_config';

export interface CloudConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lấy cấu hình kết nối Cloud (Supabase)
 */
export function getCloudConfig(): CloudConfig {
  try {
    const raw = localStorage.getItem(CLOUD_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error reading cloud config:", e);
  }

  // Cấu hình mặc định hoặc từ biến môi trường Vite
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey,
    autoSync: true,
    lastSyncedAt: undefined
  };
}

/**
 * Lưu cấu hình kết nối Cloud (Supabase)
 */
export function saveCloudConfig(config: CloudConfig): void {
  try {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    supabaseInstance = null; // Reset để tạo client mới
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thien_co_cac_cloud_config_updated', { detail: config }));
    }
  } catch (e) {
    console.error("Error saving cloud config:", e);
  }
}

/**
 * Lấy hoặc khởi tạo Supabase Client
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getCloudConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return null;
  }

  try {
    supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    return supabaseInstance;
  } catch (e) {
    console.error("Error initializing Supabase client:", e);
    return null;
  }
}

/**
 * Kiểm tra kết nối tới Supabase Cloud
 */
export async function testCloudConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Chưa cấu hình Supabase URL hoặc Anon Key. Hãy điền thông tin kết nối!'
    };
  }

  try {
    // Thử truy vấn bảng dossiers
    const { data, error } = await client.from('dossiers').select('id').limit(1);
    if (error) {
      // Nếu bảng chưa tạo, vẫn kết nối được tới Supabase nhưng cần chạy script SQL
      if (error.code === '42P01') { // undefined_table
        return {
          success: true,
          message: 'Kết nối Supabase thành công! (Bảng dữ liệu chưa được khởi tạo, hãy bấm nút "Chạy SQL Khởi Tạo")'
        };
      }
      return {
        success: false,
        message: `Lỗi truy vấn Supabase: ${error.message} (${error.code || ''})`
      };
    }
    return {
      success: true,
      message: 'Kết nối Supabase thành công và các bảng dữ liệu đã sẵn sàng hoạt động!'
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Không thể kết nối tới Supabase: ${e.message || e}`
    };
  }
}

/**
 * Kịch bản SQL tạo bảng 1-Click để Admin Tidu dán vào Supabase SQL Editor
 */
export function getSupabaseInitSQL(): string {
  return `-- ====================================================================
-- HỆ THỐNG CƠ SỞ DỮ LIỆU ĐÁM MÂY THIÊN CƠ CÁC (TIDU PRODUCTION)
-- Dán toàn bộ mã này vào Supabase -> SQL Editor -> Nhấn RUN (1 lần duy nhất)
-- ====================================================================

-- 1. BẢNG HỒ SƠ ĐƯƠNG SỐ & NGƯỜI THÂN XEM HỘ (dossiers)
CREATE TABLE IF NOT EXISTS public.dossiers (
    id TEXT PRIMARY KEY,
    user_id TEXT,                        -- ID tài khoản người tạo hồ sơ (hoặc 'guest')
    full_name TEXT NOT NULL,             -- Họ tên đương số
    relation TEXT DEFAULT 'Bản thân',    -- Quan hệ: Bản thân, Bố mẹ, Vợ chồng, Con cái, Bạn bè, Đối tác...
    gender TEXT,                         -- 'nam' hoặc 'nu'
    birth_date TEXT,                     -- Ngày sinh dương lịch (YYYY-MM-DD)
    lunar_date TEXT,                     -- Ngày sinh âm lịch
    birth_hour TEXT,                     -- Giờ sinh (Tý, Sửu, Dần...)
    can_chi_year TEXT,                   -- Năm can chi (Giáp Thìn, Ất Tỵ...)
    menh_ngu_hanh TEXT,                  -- Mệnh ngũ hành (Phúc Đăng Hỏa, Hải Trung Kim...)
    notes TEXT,                          -- Ghi chú riêng
    records_count INTEGER DEFAULT 0,     -- Số lượng quẻ đã xem
    face_image TEXT,                     -- Ảnh tướng mặt (base64 hoặc URL)
    face_captured_at TEXT,
    face_verdict TEXT,
    palm_image TEXT,                     -- Ảnh chỉ tay (base64 hoặc URL)
    palm_captured_at TEXT,
    palm_side TEXT,
    palm_category TEXT,
    palm_verdict TEXT,
    body_image TEXT,                     -- Ảnh cốt cách toàn thân
    body_captured_at TEXT,
    body_verdict TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. BẢNG LỊCH SỬ QUẺ TIÊN TRI & TỬ VI (divination_records)
CREATE TABLE IF NOT EXISTS public.divination_records (
    id TEXT PRIMARY KEY,
    user_id TEXT,                        -- ID tài khoản người xem
    dossier_id TEXT,                     -- Liên kết với hồ sơ người được xem (nếu có)
    person_name TEXT,                    -- Họ tên người được xem
    type TEXT NOT NULL,                  -- 'tuvi', 'iching', 'numerology', 'love_match', 'face', 'palm'...
    title TEXT NOT NULL,                 -- Tiêu đề quẻ / hồ sơ
    summary TEXT,                        -- Tóm tắt luận giải
    full_content TEXT,                   -- Nội dung chi tiết luận giải
    captured_image TEXT,                 -- Ảnh đính kèm (nếu có)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. BẢNG THÀNH VIÊN ĐĂNG KÝ (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'user',            -- 'admin' hoặc 'user'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Bật tính năng cho phép đọc/ghi an toàn bằng Anon Key
ALTER TABLE public.dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách (Policies) cho phép thao tác qua Anon Key
CREATE POLICY "Public Read Dossiers" ON public.dossiers FOR SELECT USING (true);
CREATE POLICY "Public Insert Dossiers" ON public.dossiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Dossiers" ON public.dossiers FOR UPDATE USING (true);
CREATE POLICY "Public Delete Dossiers" ON public.dossiers FOR DELETE USING (true);

CREATE POLICY "Public Read Records" ON public.divination_records FOR SELECT USING (true);
CREATE POLICY "Public Insert Records" ON public.divination_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Delete Records" ON public.divination_records FOR DELETE USING (true);

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);
`;
}

/**
 * Đồng bộ danh sách Hồ Sơ giữa Local và Supabase Cloud
 */
export async function syncDossiersWithCloud(localDossiers: UserDossier[]): Promise<UserDossier[]> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // CHƯA ĐĂNG NHẬP: TUYỆT ĐỐI CHỈ LƯU TẠI MÁY CỦA NGƯỜI ĐÓ, KHÔNG SYNC CLOUD!
    return localDossiers;
  }

  const client = getSupabaseClient();
  if (!client) {
    return localDossiers;
  }

  const currentUserId = currentUser.id;
  const isAdmin = currentUser.role === 'admin';

  try {
    // 1. Tải hồ sơ từ Supabase Cloud
    let query = client.from('dossiers').select('*');
    if (!isAdmin) {
      query = query.eq('user_id', currentUser.id);
    }

    const { data: cloudData, error } = await query;
    if (error) {
      console.warn("[CloudStorage] Lỗi khi nạp hồ sơ từ Cloud:", error.message);
      return localDossiers;
    }

    const cloudDossiers: UserDossier[] = (cloudData || []).map(row => ({
      id: row.id,
      userId: row.user_id,
      relation: row.relation || 'Bản thân',
      fullName: row.full_name,
      gender: row.gender,
      birthDate: row.birth_date,
      lunarDate: row.lunar_date,
      birthHour: row.birth_hour,
      canChiYear: row.can_chi_year,
      menhNguHanh: row.menh_ngu_hanh,
      notes: row.notes,
      recordsCount: row.records_count || 0,
      faceImage: row.face_image,
      faceCapturedAt: row.face_captured_at,
      faceVerdict: row.face_verdict,
      palmImage: row.palm_image,
      palmCapturedAt: row.palm_captured_at,
      palmSide: row.palm_side,
      palmCategory: row.palm_category,
      palmVerdict: row.palm_verdict,
      bodyImage: row.body_image,
      bodyCapturedAt: row.body_captured_at,
      bodyVerdict: row.body_verdict,
      createdDate: row.created_at ? new Date(row.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
      lastUpdated: row.updated_at ? new Date(row.updated_at).toLocaleString('vi-VN') : new Date().toLocaleString('vi-VN'),
      syncStatus: 'synced'
    }));

    // 2. Hợp nhất (Merge) hồ sơ Local và Cloud
    const mergedMap = new Map<string, UserDossier>();

    // Đưa Cloud vào trước
    cloudDossiers.forEach(d => mergedMap.set(d.id, d));

    // Đưa Local vào (nếu trùng ID, giữ bản có ngày cập nhật mới hơn)
    localDossiers.forEach(d => {
      if (!mergedMap.has(d.id)) {
        mergedMap.set(d.id, { ...d, syncStatus: 'local' });
        // Đẩy lên cloud ngầm
        pushDossierToCloudAsync(d, currentUserId);
      }
    });

    const result = Array.from(mergedMap.values());

    // Cập nhật timestamp lần đồng bộ cuối
    const config = getCloudConfig();
    config.lastSyncedAt = new Date().toLocaleString('vi-VN');
    saveCloudConfig(config);

    return result;
  } catch (e) {
    console.error("[CloudStorage] Sync exception:", e);
    return localDossiers;
  }
}

/**
 * Đẩy một hồ sơ lên Cloud ngầm (CHỈ KHI ĐÃ ĐĂNG NHẬP)
 */
export async function pushDossierToCloudAsync(dossier: UserDossier, userId?: string): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // CHƯA ĐĂNG NHẬP: TUYỆT ĐỐI KHÔNG ĐƯỢC LƯU LÊN CLOUD!
    return;
  }

  const client = getSupabaseClient();
  if (!client) return;

  const resolvedUserId = userId || dossier.userId || currentUser.id;

  try {
    await client.from('dossiers').upsert({
      id: dossier.id,
      user_id: resolvedUserId,
      full_name: dossier.fullName,
      relation: dossier.relation || 'Bản thân',
      gender: dossier.gender,
      birth_date: dossier.birthDate,
      lunar_date: dossier.lunarDate,
      birth_hour: dossier.birthHour,
      can_chi_year: dossier.canChiYear,
      menh_ngu_hanh: dossier.menhNguHanh,
      notes: dossier.notes,
      records_count: dossier.recordsCount || 0,
      face_image: dossier.faceImage,
      face_captured_at: dossier.faceCapturedAt,
      face_verdict: dossier.faceVerdict,
      palm_image: dossier.palmImage,
      palm_captured_at: dossier.palmCapturedAt,
      palm_side: dossier.palmSide,
      palm_category: dossier.palmCategory,
      palm_verdict: dossier.palmVerdict,
      body_image: dossier.bodyImage,
      body_captured_at: dossier.bodyCapturedAt,
      body_verdict: dossier.bodyVerdict,
      updated_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn("[CloudStorage] Không thể đẩy hồ sơ lên Cloud:", e);
  }
}

/**
 * Xóa một hồ sơ trên Cloud
 */
export async function deleteDossierFromCloud(dossierId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('dossiers').delete().eq('id', dossierId);
  } catch (e) {
    console.warn("[CloudStorage] Lỗi xóa hồ sơ trên Cloud:", e);
  }
}

/**
 * Đẩy một bản ghi xem bói (DivinationRecord) lên Cloud (CHỈ KHI ĐÃ ĐĂNG NHẬP)
 */
export async function pushRecordToCloudAsync(record: DivinationRecord): Promise<void> {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    // CHƯA ĐĂNG NHẬP: TUYỆT ĐỐI KHÔNG LƯU QUẺ LÊN CLOUD!
    return;
  }

  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('divination_records').upsert({
      id: record.id,
      user_id: record.userId || currentUser.id,
      dossier_id: record.dossierId,
      person_name: record.personName,
      type: record.type,
      title: record.title,
      summary: record.summary,
      full_content: record.fullContent,
      captured_image: record.capturedImage
    });
  } catch (e) {
    console.warn("[CloudStorage] Không thể đẩy quẻ lên Cloud:", e);
  }
}

/**
 * Xóa quẻ trên Cloud
 */
export async function deleteRecordFromCloud(recordId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;

  try {
    await client.from('divination_records').delete().eq('id', recordId);
  } catch (e) {
    console.warn("[CloudStorage] Lỗi xóa quẻ trên Cloud:", e);
  }
}

/**
 * Xuất toàn bộ dữ liệu hệ thống ra tệp JSON dự phòng (Backup)
 */
export function exportFullBackupJSON(): string {
  const dossiers = localStorage.getItem('thien_co_cac_user_dossiers') || '[]';
  const records = localStorage.getItem('thien_co_cac_records') || '[]';
  const users = localStorage.getItem('thien_co_cac_registered_users') || '[]';
  const cloudConfig = getCloudConfig();

  const backupData = {
    version: '1.0.3',
    appName: 'Xem bói - nhân duyên - tiền căn - hệ quả (Thiên Cơ Các)',
    exportedAt: new Date().toISOString(),
    creator: 'Tidu Production',
    dossiers: JSON.parse(dossiers),
    records: JSON.parse(records),
    users: JSON.parse(users),
    cloudConfig
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Phục hồi dữ liệu hệ thống từ tệp JSON (Restore)
 */
export function importFullBackupJSON(jsonStr: string): { success: boolean; message: string; count: { dossiers: number; records: number } } {
  try {
    const data = JSON.parse(jsonStr);
    let dossiersCount = 0;
    let recordsCount = 0;

    if (Array.isArray(data.dossiers)) {
      const current = JSON.parse(localStorage.getItem('thien_co_cac_user_dossiers') || '[]');
      const mergedMap = new Map();
      current.forEach((d: any) => mergedMap.set(d.id, d));
      data.dossiers.forEach((d: any) => mergedMap.set(d.id, d));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('thien_co_cac_user_dossiers', JSON.stringify(merged));
      dossiersCount = data.dossiers.length;
    }

    if (Array.isArray(data.records)) {
      const current = JSON.parse(localStorage.getItem('thien_co_cac_records') || '[]');
      const mergedMap = new Map();
      current.forEach((r: any) => mergedMap.set(r.id, r));
      data.records.forEach((r: any) => mergedMap.set(r.id, r));
      const merged = Array.from(mergedMap.values());
      localStorage.setItem('thien_co_cac_records', JSON.stringify(merged));
      recordsCount = data.records.length;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('thien_co_cac_dossier_updated'));
      window.dispatchEvent(new CustomEvent('thien_co_cac_records_updated'));
    }

    return {
      success: true,
      message: `Phục hồi thành công ${dossiersCount} hồ sơ và ${recordsCount} quẻ bói!`,
      count: { dossiers: dossiersCount, records: recordsCount }
    };
  } catch (e: any) {
    return {
      success: false,
      message: `Tệp sao lưu không đúng định dạng: ${e.message}`,
      count: { dossiers: 0, records: 0 }
    };
  }
}
