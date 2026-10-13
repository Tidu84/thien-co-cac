import React, { useRef } from 'react';
import { DivinationRecord } from '../types';
import { Bookmark, Trash2, Calendar, FileText, Download, Upload, Info, HelpCircle, HardDrive } from 'lucide-react';

interface HistoryProps {
  records: DivinationRecord[];
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onImportRecords?: (imported: DivinationRecord[]) => void;
}

export const HistoryModal: React.FC<HistoryProps> = ({ 
  records, 
  onDeleteRecord, 
  onClearAll,
  onImportRecords 
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Xuất file JSON để lưu vĩnh viễn về máy
  const handleExportBackup = () => {
    if (records.length === 0) {
      alert("Chưa có quẻ nào để xuất dữ liệu!");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Thien_Co_Cac_So_Van_Menh_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Khôi phục dữ liệu từ file JSON
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportRecords) {
          onImportRecords(parsed);
          alert(`Đã khôi phục thành công ${parsed.length} quẻ vận mệnh vào sổ tay!`);
        } else {
          alert("Tệp sao lưu không đúng định dạng.");
        }
      } catch (err) {
        alert("Lỗi khi đọc tệp dữ liệu.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* EXPLANATION BOX: WHERE APP & DATA ARE SAVED */}
      <div className="bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-amber-400/40 rounded-2xl p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex-shrink-0">
            <HardDrive className="w-6 h-6 text-amber-400" />
          </div>
          <div className="space-y-2">
            <h3 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
              Ứng dụng và Quẻ bói của bạn được lưu ở đâu?
            </h3>
            <div className="text-xs sm:text-sm text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                🌐 <strong className="text-amber-200">1. Nơi lưu ứng dụng:</strong> Toàn bộ ứng dụng này nằm trong dự án của bạn trên nền tảng <strong>Vertex AI Studio / Google Cloud</strong>. 
                Bạn chỉ cần <span className="text-amber-300 font-bold underline">nhấn Ctrl + D (hoặc Cmd + D trên Mac)</span> để lưu Bookmark thanh dấu trang trình duyệt, hoặc mở lại lịch sử cuộc trò chuyện là vào được ngay lập tức!
              </p>
              <p>
                💾 <strong className="text-amber-200">2. Nơi lưu các quẻ và lá số:</strong> Được lưu tự động trong bộ nhớ cục bộ (<code className="bg-slate-950 px-1 py-0.5 rounded text-purple-300">localStorage</code>) của trình duyệt trên chính máy tính hoặc điện thoại bạn đang dùng. Không sợ bị lộ ra ngoài!
              </p>
            </div>

            {/* Quick backup buttons */}
            <div className="pt-2 flex flex-wrap gap-2.5">
              <button
                onClick={handleExportBackup}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold transition shadow active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Tải dữ liệu về máy (.JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition shadow active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-purple-300" />
                <span>Nhập lại file sao lưu</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImportFile}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SAVED RECORDS LOG */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-mystic text-xl sm:text-2xl font-bold text-amber-300">
              Sổ Tay Vận Mệnh ({records.length} quẻ đã lưu)
            </h2>
          </div>
          {records.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800 transition active:scale-95"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm">Chưa có quẻ nào được lưu trong sổ tay.</p>
            <p className="text-xs mt-1 text-slate-600">
              Hãy gieo quẻ Kinh Dịch, an sao Tử Vi hoặc xem chỉ tay rồi ấn "Lưu lại" để ghi chép vào đây nhé!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-950 border border-slate-800 hover:border-amber-400/40 rounded-xl p-4 transition shadow-lg"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                        {rec.type}
                      </span>
                      <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                        {rec.title}
                      </h3>
                    </div>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition"
                    title="Xóa quẻ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-purple-200/90 font-medium mb-2">
                  {rec.summary}
                </p>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 max-h-40 overflow-y-auto whitespace-pre-line leading-relaxed">
                  {rec.fullContent}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
