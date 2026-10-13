import React, { useState, useRef } from 'react';
import { analyzeFaceOrPalmWithGemini } from '../services/geminiService';
import { Camera, Upload, Eye, Hand, Sparkles, Loader2, BookmarkPlus, RefreshCw } from 'lucide-react';

interface FacePalmProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'face' | 'palm' }) => void;
}

export const FaceAndPalmReading: React.FC<FacePalmProps> = ({ onSaveResult }) => {
  const [activeMode, setActiveMode] = useState<'face' | 'palm'>('face');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Mở webcam
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
      setImagePreview(null);
      setAnalysisText(null);
    } catch (err) {
      alert("Không thể truy cập camera. Vui lòng cho phép quyền máy ảnh hoặc dùng tính năng tải ảnh từ máy.");
    }
  };

  // Dừng camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Chụp ảnh từ video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImagePreview(dataUrl);
      stopCamera();
    }
  };

  // Tải ảnh từ file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        stopCamera();
        setAnalysisText(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Sử dụng ảnh mẫu để test nhanh
  const useSampleImage = () => {
    stopCamera();
    if (activeMode === 'face') {
      setImagePreview("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80");
    } else {
      setImagePreview("https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&q=80");
    }
    setAnalysisText(null);
  };

  // Phân tích với Gemini Vision
  const handleAnalyze = async () => {
    if (!imagePreview) return;
    setLoading(true);

    // Chuyển URL sang base64 nếu dùng ảnh mẫu
    let base64 = imagePreview;
    if (imagePreview.startsWith('http')) {
      try {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const reader = new FileReader();
        base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn("Could not fetch sample image for base64 conversion, using fallback text");
      }
    }

    const result = await analyzeFaceOrPalmWithGemini(base64, activeMode);
    setAnalysisText(result);
    setLoading(false);
  };

  const handleSave = () => {
    if (!analysisText) return;
    onSaveResult({
      title: activeMode === 'face' ? 'Tướng Pháp: Nhân Diện Khuôn Mặt' : 'Thủ Tướng: Xem Chỉ Tay',
      summary: activeMode === 'face' ? 'Phân tích Tam Đình Ngũ Quan & Khí sắc' : 'Phân tích Sinh Đạo, Trí Đạo, Tâm Đạo',
      fullContent: analysisText,
      type: activeMode
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-slate-900 p-1.5 rounded-2xl border border-amber-500/30 flex gap-2 shadow-xl">
          <button
            onClick={() => { setActiveMode('face'); setImagePreview(null); setAnalysisText(null); stopCamera(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeMode === 'face'
                ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-amber-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Xem Tướng Mặt (Nhân Diện)</span>
          </button>
          <button
            onClick={() => { setActiveMode('palm'); setImagePreview(null); setAnalysisText(null); stopCamera(); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition ${
              activeMode === 'palm'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-purple-200'
            }`}
          >
            <Hand className="w-4 h-4" />
            <span>Xem Chỉ Tay (Thủ Tướng)</span>
          </button>
        </div>
      </div>

      {/* Guide Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-center max-w-3xl mx-auto">
        <h2 className="font-mystic text-xl sm:text-2xl font-bold text-amber-300">
          {activeMode === 'face' ? 'Tướng Pháp Ma Y • Soi Khuôn Mặt Định Vận Mệnh' : 'Thủ Tướng Học • Khai Mở Đường Chỉ Tay Thần Kỳ'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
          {activeMode === 'face'
            ? 'Chụp ảnh chính diện rõ nét, để lộ trán và cằm để AI phân tích Tam Đình, Ngũ Quan, cung Tài Bạch, Phu Thê.'
            : 'Mở rộng lòng bàn tay (tay thuận hoặc tay trái) trước camera để AI quét đường Sinh Đạo, Trí Đạo, Tâm Đạo.'}
        </p>
      </div>

      {/* Camera / Upload Section */}
      <div className="max-w-xl mx-auto bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col items-center">
        {/* Viewport Box */}
        <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden border-2 border-dashed border-amber-400/50 bg-slate-900 flex items-center justify-center shadow-inner">
          {isCameraActive ? (
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror" />
          ) : imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center p-6 text-center text-slate-500">
              {activeMode === 'face' ? (
                <Eye className="w-16 h-16 text-amber-400/30 mb-2 animate-pulse" />
              ) : (
                <Hand className="w-16 h-16 text-purple-400/30 mb-2 animate-pulse" />
              )}
              <span className="text-sm text-slate-400">Chưa có ảnh nào được tải lên</span>
              <span className="text-xs text-slate-600 mt-1">Bấm nút bên dưới để mở Camera hoặc Tải ảnh từ thư viện</span>
            </div>
          )}

          {/* Golden scanning grid line effect when analyzing */}
          {loading && (
            <div className="absolute inset-0 bg-amber-500/10 pointer-events-none flex flex-col justify-between">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-bounce shadow-lg shadow-amber-400" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5 w-full">
          {!isCameraActive ? (
            <>
              <button
                onClick={startCamera}
                className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Mở Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 border border-purple-500/40 text-xs sm:text-sm font-semibold flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Tải ảnh lên</span>
              </button>

              <button
                onClick={useSampleImage}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
              >
                Dùng ảnh mẫu
              </button>
            </>
          ) : (
            <>
              <button
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"
              >
                <Camera className="w-4 h-4" />
                <span>Chụp ảnh này</span>
              </button>
              <button
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition"
              >
                Hủy Camera
              </button>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Analyze button */}
        {imagePreview && !isCameraActive && (
          <div className="mt-5 w-full">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang soi chiếu tướng mạo & thần khí...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Phân Tích {activeMode === 'face' ? 'Tướng Mặt' : 'Chỉ Tay'} Bằng AI</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Analysis Output Result */}
      {analysisText && (
        <div className="max-w-3xl mx-auto bg-slate-950 border-2 border-amber-400/40 rounded-2xl p-5 sm:p-7 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔮</span>
              <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300">
                Lời Bình Tướng Pháp Thần Cơ
              </h3>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>{savedSuccess ? 'Đã lưu kết quả!' : 'Lưu lại'}</span>
            </button>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            {analysisText}
          </div>
        </div>
      )}
    </div>
  );
};
