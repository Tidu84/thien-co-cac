import React, { useMemo, useEffect, useRef } from 'react';
import { Calendar } from 'lucide-react';

/**
 * Tính số ngày tối đa trong tháng Dương lịch (tự động tính năm nhuận)
 */
function getDaysInSolarMonth(month: number, year: number): number {
  const m = Math.max(1, Math.min(12, month || 1));
  const y = year || 1984;
  if (m === 2) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
    return isLeap ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(m)) {
    return 30;
  }
  return 31;
}

export interface BirthDateSelectorProps {
  day: number;
  month: number;
  year: number;
  onChange: (day: number, month: number, year: number) => void;
  isLunar?: boolean;
  minYear?: number;
  maxYear?: number;
  theme?: 'amber' | 'purple' | 'rose' | 'indigo' | 'emerald';
  compact?: boolean;
  showCalendarPicker?: boolean;
  className?: string;
  allowEmpty?: boolean;
}

export const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  day,
  month,
  year,
  onChange,
  isLunar = false,
  minYear = 1920,
  maxYear,
  theme = 'amber',
  compact = false,
  showCalendarPicker = true,
  className = '',
  allowEmpty = false
}) => {
  const hiddenDateInputRef = useRef<HTMLInputElement | null>(null);

  const isPartiallyEmpty = allowEmpty && (!day || !month || !year);

  // Mốc thời gian thực tế hiện tại: Ngày sinh KHÔNG THỂ ở tương lai
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  // Năm sinh tối đa chỉ được bằng năm hiện tại
  const effectiveMaxYear = useMemo(() => {
    return maxYear ? Math.min(maxYear, currentYear) : currentYear;
  }, [maxYear, currentYear]);

  // Tháng tối đa: Nếu chọn năm hiện tại thì không được vượt quá tháng hiện tại
  const maxMonth = useMemo(() => {
    if (!isLunar && year >= currentYear) {
      return currentMonth;
    }
    return 12;
  }, [isLunar, year, currentYear, currentMonth]);

  // Giới hạn ngày hợp lệ (tính theo tháng, năm nhuận và chặn ngày tương lai trong tháng hiện tại)
  const maxDays = useMemo(() => {
    if (isLunar) return 30;
    let maxD = getDaysInSolarMonth(month, year);
    if (year >= currentYear && month >= currentMonth) {
      maxD = Math.min(maxD, currentDay);
    }
    return Math.max(1, maxD);
  }, [isLunar, month, year, currentYear, currentMonth, currentDay]);

  // Tự động kiểm tra và đưa về mốc hợp lệ nếu dữ liệu ngày/tháng/năm vượt quá hiện tại
  useEffect(() => {
    if (allowEmpty && (!day || !month || !year)) {
      return; // Tuyệt đối không tự động gán ngày mặc định khi allowEmpty bật và người dùng chưa chọn
    }

    let newY = year;
    let newM = month;
    let newD = day;
    let changed = false;

    if (newY > effectiveMaxYear) {
      newY = effectiveMaxYear;
      changed = true;
    } else if (newY < minYear) {
      newY = minYear;
      changed = true;
    }

    const mLimit = (!isLunar && newY >= currentYear) ? currentMonth : 12;
    if (newM > mLimit) {
      newM = mLimit;
      changed = true;
    } else if (newM < 1) {
      newM = 1;
      changed = true;
    }

    let dLimit = isLunar ? 30 : getDaysInSolarMonth(newM, newY);
    if (!isLunar && newY >= currentYear && newM >= currentMonth) {
      dLimit = Math.min(dLimit, currentDay);
    }
    if (newD > dLimit) {
      newD = dLimit;
      changed = true;
    } else if (newD < 1) {
      newD = 1;
      changed = true;
    }

    if (changed) {
      onChange(newD, newM, newY);
    }
  }, [day, month, year, effectiveMaxYear, minYear, currentYear, currentMonth, currentDay, isLunar, onChange]);

  // Danh sách ngày hợp lệ (1..maxDays)
  const daysList = useMemo(() => {
    return Array.from({ length: maxDays }, (_, i) => i + 1);
  }, [maxDays]);

  // Danh sách tháng hợp lệ (1..maxMonth)
  const monthsList = useMemo(() => {
    return Array.from({ length: maxMonth }, (_, i) => i + 1);
  }, [maxMonth]);

  // Danh sách năm (chạy từ năm hiện tại lùi về minYear)
  const yearsList = useMemo(() => {
    const list: number[] = [];
    for (let y = effectiveMaxYear; y >= minYear; y--) {
      list.push(y);
    }
    return list;
  }, [minYear, effectiveMaxYear]);

  // Theme màu sắc
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'purple':
        return {
          border: 'border-purple-500/50 hover:border-purple-400 focus:border-purple-400',
          text: 'text-purple-300',
          badge: 'text-purple-400 bg-purple-950/40 border-purple-500/30'
        };
      case 'rose':
        return {
          border: 'border-slate-700 hover:border-rose-400 focus:border-rose-400',
          text: 'text-rose-300',
          badge: 'text-rose-400 bg-rose-950/40 border-rose-500/30'
        };
      case 'indigo':
        return {
          border: 'border-slate-700 hover:border-indigo-400 focus:border-indigo-400',
          text: 'text-indigo-200',
          badge: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30'
        };
      case 'emerald':
        return {
          border: 'border-slate-700 hover:border-emerald-400 focus:border-emerald-400',
          text: 'text-emerald-300',
          badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30'
        };
      case 'amber':
      default:
        return {
          border: 'border-slate-700 hover:border-amber-400 focus:border-amber-400',
          text: 'text-amber-300',
          badge: 'text-amber-400 bg-amber-950/40 border-amber-500/30'
        };
    }
  }, [theme]);

  // Chuỗi ISO cho input date ẩn (chặn ngày tương lai với max={todayIsoStr})
  const todayIsoStr = useMemo(() => {
    return `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
  }, [currentYear, currentMonth, currentDay]);

  const formattedIsoDate = useMemo(() => {
    const validY = Math.max(minYear, Math.min(effectiveMaxYear, year || 1984));
    const validM = Math.max(1, Math.min(maxMonth, month || 1));
    const validD = Math.max(1, Math.min(maxDays, day || 1));
    return `${validY}-${String(validM).padStart(2, '0')}-${String(validD).padStart(2, '0')}`;
  }, [year, month, day, minYear, effectiveMaxYear, maxMonth, maxDays]);

  // Xử lý khi người dùng chọn qua Calendar Picker popup
  const handleCalendarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      let pickedY = parseInt(parts[0], 10);
      let pickedM = parseInt(parts[1], 10);
      let pickedD = parseInt(parts[2], 10);

      // Chặn nếu chọn ngày tương lai
      if (pickedY > currentYear || (pickedY === currentYear && (pickedM > currentMonth || (pickedM === currentMonth && pickedD > currentDay)))) {
        pickedY = currentYear;
        pickedM = currentMonth;
        pickedD = currentDay;
      }

      if (!isNaN(pickedY) && !isNaN(pickedM) && !isNaN(pickedD)) {
        onChange(pickedD, pickedM, pickedY);
      }
    }
  };

  const padZero = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* 3 Dropdown chuẩn Ngày / Tháng / Năm */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {/* Chọn Ngày */}
        <div className="relative">
          <select
            value={day || 0}
            onChange={(e) => onChange(Number(e.target.value), month || 0, year || 0)}
            aria-label="Chọn ngày sinh"
            className={`w-full bg-slate-950 ${themeStyles.border} ${themeStyles.text} rounded-xl ${
              compact ? 'px-1.5 py-1.5 text-xs' : 'px-2 py-2 text-xs sm:text-sm'
            } font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer transition appearance-none shadow-inner`}
          >
            {allowEmpty && (
              <option value={0} className="bg-slate-900 text-slate-400 py-1">
                -- Ngày --
              </option>
            )}
            {daysList.map((d) => (
              <option key={d} value={d} className="bg-slate-900 text-slate-100 py-1">
                Ngày {padZero(d)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Chọn Tháng */}
        <div className="relative">
          <select
            value={month || 0}
            onChange={(e) => {
              const newM = Number(e.target.value);
              let maxDForNewM = isLunar ? 30 : getDaysInSolarMonth(newM, year || 1990);
              if (!isLunar && (year || 0) >= currentYear && newM >= currentMonth) {
                maxDForNewM = Math.min(maxDForNewM, currentDay);
              }
              const clampedD = day > 0 ? Math.min(day, maxDForNewM) : 0;
              onChange(clampedD, newM, year || 0);
            }}
            aria-label="Chọn tháng sinh"
            className={`w-full bg-slate-950 ${themeStyles.border} ${themeStyles.text} rounded-xl ${
              compact ? 'px-1.5 py-1.5 text-xs' : 'px-2 py-2 text-xs sm:text-sm'
            } font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer transition appearance-none shadow-inner`}
          >
            {allowEmpty && (
              <option value={0} className="bg-slate-900 text-slate-400 py-1">
                -- Tháng --
              </option>
            )}
            {monthsList.map((m) => (
              <option key={m} value={m} className="bg-slate-900 text-slate-100 py-1">
                Tháng {padZero(m)}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-slate-500 text-[10px]">
            ▼
          </div>
        </div>

        {/* Chọn Năm */}
        <div className="relative">
          <select
            value={year || 0}
            onChange={(e) => {
              const newY = Number(e.target.value);
              let newM = month || 0;
              if (!isLunar && newY >= currentYear && newM > currentMonth) {
                newM = currentMonth;
              }
              let maxDForNewY = isLunar ? 30 : getDaysInSolarMonth(newM || 1, newY || 1990);
              if (!isLunar && newY >= currentYear && newM >= currentMonth) {
                maxDForNewY = Math.min(maxDForNewY, currentDay);
              }
              const clampedD = day > 0 ? Math.min(day, maxDForNewY) : 0;
              onChange(clampedD, newM, newY);
            }}
            aria-label="Chọn năm sinh"
            className={`w-full bg-slate-950 ${themeStyles.border} ${themeStyles.text} rounded-xl ${
              compact ? 'px-1.5 py-1.5 text-xs' : 'px-2 py-2 text-xs sm:text-sm'
            } font-bold text-center focus:outline-none focus:ring-1 focus:ring-amber-400/50 cursor-pointer transition appearance-none shadow-inner`}
          >
            {allowEmpty && (
              <option value={0} className="bg-slate-900 text-slate-400 py-1">
                -- Năm --
              </option>
            )}
            {yearsList.map((y) => (
              <option key={y} value={y} className="bg-slate-900 text-slate-100 py-1">
                Năm {y}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-slate-500 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Dòng định dạng chuẩn hiển thị trực quan */}
      <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span>Định dạng:</span>
          {isPartiallyEmpty ? (
            <span className="px-2 py-0.5 rounded-lg font-bold border border-rose-500/50 bg-rose-500/10 text-rose-300 text-[10px]">
              ⚠️ Chưa chọn ngày sinh (Bắt buộc)
            </span>
          ) : (
            <span className={`px-2 py-0.5 rounded-lg font-bold border ${themeStyles.badge}`}>
              {padZero(day)}/{padZero(month)}/{year} {isLunar ? '(Âm lịch)' : '(Dương lịch)'}
            </span>
          )}
        </span>

        {/* Nút mở nhanh Lịch để tra ngày nếu là Dương lịch */}
        {!isLunar && showCalendarPicker && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                if (hiddenDateInputRef.current) {
                  try {
                    hiddenDateInputRef.current.showPicker();
                  } catch {
                    hiddenDateInputRef.current.focus();
                  }
                }
              }}
              className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-amber-300 transition py-0.5 px-1.5 rounded bg-slate-900/60 hover:bg-slate-800 border border-slate-800"
              title="Mở lịch chọn nhanh (tối đa hôm nay)"
            >
              <Calendar className="w-3 h-3 text-amber-400" />
              <span className="hidden xs:inline">Mở lịch</span>
            </button>
            <input
              ref={hiddenDateInputRef}
              type="date"
              tabIndex={-1}
              max={todayIsoStr}
              value={formattedIsoDate}
              onChange={handleCalendarPick}
              className="absolute opacity-0 pointer-events-none w-0 h-0 bottom-0 right-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};
