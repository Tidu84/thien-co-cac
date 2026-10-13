import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Github, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Terminal, 
  X, 
  Compass, 
  Camera, 
  Volume2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface MobileAndGitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAndGitHubModal: React.FC<MobileAndGitHubModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'github' | 'mobile_features'>('scan');
  const [currentUrl, setCurrentUrl] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  if (!isOpen) return null;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(currentUrl || 'https://vertexai.google.com')}&bgcolor=020617&color=f59e0b`;

  const gitCommands = [
    { label: '1. Khởi tạo Git repository trong thư mục code:', cmd: 'git init\ngit add .\ngit commit -m "Khoi tao ung dung Thien Co Cac AI"' },
    { label: '2. Tạo repo mới trên GitHub rồi liên kết và đẩy code lên:', cmd: 'git remote add origin https://github.com/<tai-khoan-cua-ban>/thien-co-cac.git\ngit branch -M main\ngit push -u origin main' },
    { label: '3. Triển khai miễn phí để mở trên điện thoại (Vercel hoặc GitHub Pages):', cmd: 'npm i -g vercel\nvercel' }
  ];

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tiêu đề Modal */}
        <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-mystic font-bold text-lg sm:text-xl text-amber-300">
              Kiểm Tra Trên Điện Thoại & Hướng Dẫn Đưa Lên GitHub
            </h3>
            <p className="text-xs text-slate-400">
              Cách quét mã mở ngay trên smartphone và các bước đẩy mã nguồn lên GitHub
            </p>
          </div>
        </div>

        {/* Tab chọn cách xem */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-5">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'scan'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>1. Quét QR Mở Ngay</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'github'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-purple-300'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>2. Đẩy Lên GitHub</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile_features')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'mobile_features'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. Trải Nghiệm Mobile</span>
          </button>
        </div>

        {/* TAB 1: QUÉT QR CODE MỞ TRỰC TIẾP TRÊN ĐIỆN THOẠI */}
        {activeTab === 'scan' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/80 p-5 rounded-2xl border border-amber-400/30">
              {/* QR Image */}
              <div className="relative p-3 bg-slate-900 rounded-2xl border-2 border-amber-400/50 shadow-xl flex-shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="Mã QR mở ứng dụng"
                  className="w-44 h-44 object-contain rounded-xl"
                />
                <span className="absolute -bottom-2.5 inset-x-0 text-center mx-auto text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full shadow max-w-[130px]">
                  Quét bằng Camera
                </span>
              </div>

              {/* Hướng dẫn thao tác nhanh */}
              <div className="space-y-2.5 text-xs sm:text-sm leading-relaxed">
                <h4 className="font-bold text-amber-300 text-base flex items-center gap-1.5">
                  <span>Cách mở ngay trên iPhone / Android:</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Mở ứng dụng <strong>Camera</strong> (hoặc Zalo / trình quét QR) trên điện thoại của bạn.</li>
                  <li>Hướng máy ảnh vào mã QR bên cạnh để nhận diện liên kết.</li>
                  <li>Bấm vào thông báo hiện lên để <strong>mở trực tiếp Thiên Cơ Các</strong> trên trình duyệt điện thoại!</li>
                </ol>
                <div className="p-2.5 bg-amber-500/10 border border-amber-400/30 rounded-xl text-xs text-amber-200">
                  💡 <strong>Mẹo:</strong> Trên Safari (iOS) hoặc Chrome (Android), bạn có thể bấm <em>&quot;Thêm vào Màn hình chính (Add to Home Screen)&quot;</em> để biến app thành biểu tượng app trên điện thoại.
                </div>
              </div>
            </div>

            {/* Đường link sao chép */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-400 truncate flex-1 font-mono">
                {currentUrl}
              </span>
              <button
                onClick={() => handleCopy(currentUrl, 99)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 text-xs font-semibold flex items-center gap-1 transition active:scale-95 flex-shrink-0"
              >
                {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIndex === 99 ? 'Đã chép link' : 'Chép liên kết'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: HƯỚNG DẪN PUSH GITHUB */}
        {activeTab === 'github' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-purple-950/40 border border-purple-500/40 rounded-2xl text-xs leading-relaxed text-purple-200">
              <p>
                <strong>Lưu ý về quyền hạn:</strong> Vertex AI Studio là môi trường trình duyệt trực tiếp, không tích hợp quyền truy cập tài khoản cá nhân GitHub của bạn để tự động `git push`.
                Tuy nhiên bạn có thể xuất toàn bộ mã nguồn này và đưa lên GitHub chỉ với <strong>3 bước cực kỳ đơn giản</strong>:
              </p>
            </div>

            <div className="space-y-3">
              {/* Bước 0: Tải file từ thanh công cụ */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-amber-300 block mb-1">
                  Bước 0: Lấy mã nguồn về máy tính
                </span>
                <p className="text-xs text-slate-300">
                  Ở góc trên màn hình, cạnh tab <em>&quot;Preview&quot;</em> có nút <strong>&quot;Code&quot;</strong> (như trong ảnh bạn chụp). Bạn có thể bấm vào đó để xem và tải toàn bộ các file code về máy tính.
                </p>
              </div>

              {/* Các câu lệnh terminal */}
              {gitCommands.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-200">{item.label}</span>
                    <button
                      onClick={() => handleCopy(item.cmd, idx)}
                      className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 transition"
                    >
                      {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === idx ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap">
                    {item.cmd}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CÁC TÍNH NĂNG TƯƠNG TÁC ĐẶC SẮC TRÊN MOBILE */}
        {activeTab === 'mobile_features' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-emerald-400 font-bold">
                  <Compass className="w-4 h-4" />
                  <span>Cảm Biến La Bàn Xoay Thực Tế</span>
                </div>
                <p className="text-slate-300">
                  Khi mở tab <strong>La Bàn Bát Trạch</strong> trên điện thoại, xoay người theo hướng nhà nào thì la bàn phong thủy sẽ tự động quay theo góc thực tế của cảm biến con quay hồi chuyển (gyroscope)!
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-purple-400 font-bold">
                  <Camera className="w-4 h-4" />
                  <span>Chụp Tướng Mặt & Chỉ Tay Trực Tiếp</span>
                </div>
                <p className="text-slate-300">
                  Mở camera trước hoặc sau điện thoại để AI soi trực tiếp đường Sinh Đạo, Trí Đạo, Tâm Đạo và Tam Đình Ngũ Quan tức thì.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-amber-400 font-bold">
                  <Volume2 className="w-4 h-4" />
                  <span>Thầy Bói Tự Động Nói Chuyện</span>
                </div>
                <p className="text-slate-300">
                  Âm thanh tiếng nói đàm đạo phát trực tiếp qua loa điện thoại, miệng nhân vật chuyển động đồng bộ theo từng âm điệu.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 mb-1 text-rose-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>Giao Diện Cảm Ứng Mượt Mà</span>
                </div>
                <p className="text-slate-300">
                  Toàn bộ bảng điều khiển, tung đồng xu Kinh Dịch, trải bài Tarot đều được tối ưu hóa cho thao tác chạm vuốt một tay trên màn hình dọc.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nút đóng chân modal */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
