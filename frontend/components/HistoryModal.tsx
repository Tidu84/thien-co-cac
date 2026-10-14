import React, { useRef, useState } from 'react';
import { DivinationRecord } from '../types';
import { Bookmark, Trash2, Calendar, FileText, Download, Upload, Info, HelpCircle, HardDrive, User, Search, Filter, Eye } from 'lucide-react';

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
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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

  // Danh sách các đương số duy nhất đã được lưu hồ sơ
  const uniquePersons = Array.from(new Set(records.map(r => r.personName?.trim() || 'Hữu Duyên Khách')));

  // Lọc theo đương số và từ khóa tìm kiếm
  const filteredRecords = records.filter(rec => {
    const recPerson = rec.personName?.trim() || 'Hữu Duyên Khách';
    const matchesPerson = selectedPersonFilter === 'all' || recPerson === selectedPersonFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || 
      recPerson.toLowerCase().includes(query) || 
      rec.title.toLowerCase().includes(query) || 
      rec.summary.toLowerCase().includes(query);
    return matchesPerson && matchesSearch;
  });

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
                💾 <strong className="text-amber-200">2. Nơi lưu các hồ sơ và quẻ:</strong> Được lưu tự động trong bộ nhớ cục bộ (<code className="bg-slate-950 px-1 py-0.5 rounded text-purple-300">localStorage</code>) của trình duyệt trên chính máy tính hoặc điện thoại bạn đang dùng, phân loại chính xác theo từng tên người xem!
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
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            <h2 className="font-mystic text-xl sm:text-2xl font-bold text-amber-300">
              Sổ Tay Vận Mệnh ({records.length} hồ sơ đã lưu)
            </h2>
          </div>
          {records.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-800 transition active:scale-95 self-start sm:self-auto"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Lọc theo Tên Đương Số & Tìm Kiếm */}
        {records.length > 0 && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            {/* Quick Person Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0 mr-1 font-semibold">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                <span>Lọc theo tên:</span>
              </span>
              <button
                onClick={() => setSelectedPersonFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                  selectedPersonFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Tất cả ({records.length})
              </button>
              {uniquePersons.map((name) => {
                const count = records.filter(r => (r.personName?.trim() || 'Hữu Duyên Khách') === name).length;
                const isSelected = selectedPersonFilter === name;
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedPersonFilter(name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex-shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800'
                    }`}
                  >
                    <User className="w-3 h-3 text-amber-400" />
                    <span>{name}</span>
                    <span className="text-[10px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu đề, nội dung..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}

        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2 opacity-50" />
            <p className="text-sm">Chưa có quẻ nào được lưu trong sổ tay.</p>
            <p className="text-xs mt-1 text-slate-600">
              Hãy chụp ảnh tướng mạo, gieo quẻ Kinh Dịch hoặc an sao Tử Vi rồi bấm "Lưu lại" để ghi chép hồ sơ nhé!
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">Không tìm thấy hồ sơ nào khớp với bộ lọc.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-950 border border-slate-800 hover:border-amber-400/40 rounded-2xl p-4 sm:p-5 transition shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 uppercase tracking-wide">
                        {rec.type === 'face' ? 'Tướng Mặt' : rec.type === 'palm' ? 'Chỉ Tay' : rec.type === 'body' ? 'Toàn Thân' : rec.type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                        <User className="w-3 h-3 text-amber-400" />
                        <span>{rec.personName || 'Hữu Duyên Khách'}</span>
                      </span>
                    </div>

                    <h3 className="font-bold text-amber-300 text-sm sm:text-base">
                      {rec.title}
                    </h3>

                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onDeleteRecord(rec.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition flex-shrink-0"
                    title="Xóa hồ sơ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                  {/* Ảnh chụp đã lưu (nếu có ảnh khuôn mặt, chỉ tay, toàn thân) */}
                  {rec.capturedImage && (
                    <div 
                      onClick={() => setPreviewImage(rec.capturedImage || null)}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-amber-500/40 bg-slate-900 flex-shrink-0 relative group cursor-pointer shadow-md"
                      title="Bấm để xem ảnh phóng to"
                    >
                      <img
                        src={rec.capturedImage}
                        alt={rec.title}
                        className="w-full h-full object-contain bg-slate-950 group-hover:scale-105 transition duration-200"
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Eye className="w-5 h-5 text-amber-300" />
                      </div>
                    </div>
                  )}

                  <div className="flex-1 space-y-2 w-full">
                    <p className="text-xs text-purple-200/90 font-medium">
                      {rec.summary}
                    </p>

                    <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 max-h-48 overflow-y-auto whitespace-pre-line leading-relaxed">
                      {rec.fullContent}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal phóng to ảnh đã chụp */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div className="relative max-w-lg w-full bg-slate-900 border-2 border-amber-400 rounded-3xl p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-300">Ảnh Tướng Pháp Đã Chụp</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Đóng ✕
              </button>
            </div>
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
              <img src={previewImage} alt="Ảnh chụp" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
