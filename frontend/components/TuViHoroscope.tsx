import React, { useState, useEffect } from 'react';
import { TuViProfile, TuViPalace, NavTab } from '../types';
import { 
  PALACES, 
  TERRESTRIAL_BRANCHES, 
  calculateMenhThanPalaces, 
  calculateCuc 
} from '../constants';
import { convertSolar2Lunar, convertLunar2Solar, LunarDateResult } from '../services/lunarCalendar';
import { analyzeTuViWithGemini, askTuViDeepDiveQuestion } from '../services/geminiService';
import { 
  upsertUserDossier, 
  getActiveDossierName, 
  getUserDossiers 
} from '../services/dossierService';
import { buildTuViProfileAndLifeDossier } from '../services/tuViService';
import { 
  Sparkles, 
  BookmarkPlus, 
  Loader2, 
  Award, 
  Volume2, 
  CheckCircle2, 
  Sun, 
  Moon, 
  ScrollText, 
  Briefcase, 
  Heart, 
  AlertTriangle, 
  Sparkle,
  Flame,
  VolumeX,
  Play,
  Hand,
  Eye,
  Compass,
  Binary,
  Navigation,
  HelpCircle,
  Send,
  ArrowRight,
  ChevronRight,
  Calendar,
  ShieldAlert,
  Layers,
  Activity
} from 'lucide-react';

interface TuViProps {
  onSaveResult: (record: { title: string; summary: string; fullContent: string; type: 'tuvi'; personName?: string }) => void;
  onNavigateTab?: (tab: NavTab, subMode?: 'face' | 'palm' | 'body') => void;
}

// Cấu trúc phân mục bình giải
interface ParsedTuViSections {
  thayPhan: string;
  banMenh: string;
  congDanh: string;
  tinhDuyen: string;
  vanHan: string;
  nhanXet: string;
}

export const TuViHoroscope: React.FC<TuViProps> = ({ onSaveResult, onNavigateTab }) => {
  const [calendarMode, setCalendarMode] = useState<'solar' | 'lunar'>('solar');

  // Mặc định mẫu 10/10/1984 Giáp Tý (Hải Trung Kim)
  const [solarDay, setSolarDay] = useState<number>(10);
  const [solarMonth, setSolarMonth] = useState<number>(10);
  const [solarYear, setSolarYear] = useState<number>(1984);

  const [lunarDay, setLunarDay] = useState<number>(16);
  const [lunarMonth, setLunarMonth] = useState<number>(9);
  const [lunarYear, setLunarYear] = useState<number>(1984);
  const [isLeapMonth, setIsLeapMonth] = useState<boolean>(false);

  const [astronomyData, setAstronomyData] = useState<LunarDateResult | null>(null);

  const [fullName, setFullName] = useState(() => {
    try {
      const active = getActiveDossierName();
      if (active && active.trim()) return active.trim();
      const saved = localStorage.getItem('thien_co_cac_user_name');
      if (saved && saved.trim()) return saved.trim();
    } catch {}
    return 'Đương Số Giáp Tý';
  });
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [birthHour, setBirthHour] = useState('Thìn (07h00 - 09h00)');

  // Trạng thái giọng nói & UI
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);
  const [currentlySpeakingSection, setCurrentlySpeakingSection] = useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [readingResult, setReadingResult] = useState<string | null>(null);
  const [parsedSections, setParsedSections] = useState<ParsedTuViSections | null>(null);
  const [activeTopic, setActiveTopic] = useState<'thayPhan' | 'banMenh' | 'congDanh' | 'tinhDuyen' | 'vanHan' | 'nhanXet'>('thayPhan');

  const [palaces, setPalaces] = useState<TuViPalace[]>([]);
  const [profileSummary, setProfileSummary] = useState<TuViProfile | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Trạng thái Bước tiếp theo: Xem tiếp sâu hơn hoặc Xem cái khác
  const [nextActionTab, setNextActionTab] = useState<'deep_dive' | 'explore_others'>('deep_dive');
  const [deepDiveTopic, setDeepDiveTopic] = useState<'decade' | 'triad' | 'remedy' | 'qa'>('decade');
  const [selectedDecadeIdx, setSelectedDecadeIdx] = useState<number>(2);
  const [qaInput, setQaInput] = useState<string>('');
  const [qaLoading, setQaLoading] = useState<boolean>(false);
  const [qaAnswer, setQaAnswer] = useState<string | null>(null);

  // Tab hiển thị cho Bảng Chi Tiết Lý Giải Bản Mệnh Cả Đời
  const [lifeDossierTab, setLifeDossierTab] = useState<'all' | 'tamKy' | 'fivePillars' | 'scores'>('all');

  const askQuestionScript = "Bạn sinh ngày Dương lịch hay Âm lịch? Hãy chọn bên dưới, ta sẽ tự động chuyển đổi ngày sóc, tháng nhuận và tính Can Chi chuẩn xác để an sao lá số cho bạn nhé!";

  // Phát âm giọng thầy bói
  const speakVoice = (text: string, sectionKey?: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const cleanVoiceText = text
        .replace(/\[\/?(THAY_PHAN|BAN_MENH|CONG_DANH|TINH_DUYEN|VAN_HAN|NHAN_XET)\]/g, ' ')
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) utterance.voice = viVoice;
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.15;

      utterance.onstart = () => {
        setIsVoiceSpeaking(true);
        if (sectionKey) setCurrentlySpeakingSection(sectionKey);
      };
      utterance.onend = () => {
        setIsVoiceSpeaking(false);
        setCurrentlySpeakingSection(null);
      };
      utterance.onerror = () => {
        setIsVoiceSpeaking(false);
        setCurrentlySpeakingSection(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech error:", e);
    }
  };

  const stopVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsVoiceSpeaking(false);
      setCurrentlySpeakingSection(null);
    }
  };

  // Tự động chuyển đổi Âm - Dương
  useEffect(() => {
    if (calendarMode === 'solar') {
      try {
        const conv = convertSolar2Lunar(solarDay, solarMonth, solarYear);
        setLunarDay(conv.lunarDay);
        setLunarMonth(conv.lunarMonth);
        setLunarYear(conv.lunarYear);
        setIsLeapMonth(conv.isLeap);
        setAstronomyData(conv);
      } catch (err) {
        console.error("Solar to Lunar error:", err);
      }
    }
  }, [solarDay, solarMonth, solarYear, calendarMode]);

  const handleLunarChange = (d: number, m: number, y: number, leap: boolean) => {
    setLunarDay(d);
    setLunarMonth(m);
    setLunarYear(y);
    setIsLeapMonth(leap);
    try {
      const conv = convertLunar2Solar(d, m, y, leap);
      setSolarDay(conv.day);
      setSolarMonth(conv.month);
      setSolarYear(conv.year);
      const full = convertSolar2Lunar(conv.day, conv.month, conv.year);
      setAstronomyData(full);
    } catch (err) {
      console.error("Lunar to Solar error:", err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      speakVoice(askQuestionScript);
    }, 400);

    return () => {
      clearTimeout(timer);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Tự động đồng bộ và điền thông tin khi người dùng đổi hồ sơ trên thanh điều hướng hoặc banner
  useEffect(() => {
    const syncFromDossier = (activeName: string) => {
      if (!activeName) return;
      setFullName(activeName);

      const allDossiers = getUserDossiers();
      const matched = allDossiers.find(d => d.fullName.toLowerCase() === activeName.toLowerCase());
      if (matched) {
        if (matched.gender) setGender(matched.gender);
        if (matched.birthHour) setBirthHour(matched.birthHour);
        if (matched.birthDate) {
          const parts = matched.birthDate.split('-');
          if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10);
            const d = parseInt(parts[2], 10);
            if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
              setSolarYear(y);
              setSolarMonth(m);
              setSolarDay(d);
              setCalendarMode('solar');
              const conv = convertSolar2Lunar(d, m, y);
              setAstronomyData(conv);
            }
          }
        }

        // Tự động lập bảng lá số 12 cung & luận giải bản mệnh cả đời ngay lập tức
        try {
          const bundle = buildTuViProfileAndLifeDossier(matched);
          setPalaces(bundle.palaces);
          setProfileSummary(bundle.profileSummary);
          setHasAutoFilled(true);
          setReadingResult((prev) => prev || bundle.generalVerdict);
          setParsedSections((prev) => prev || {
            thayPhan: bundle.generalVerdict,
            banMenh: bundle.lifeDossier.tienVan.detail,
            congDanh: bundle.lifeDossier.fivePillars[1]?.deepAnalysis || 'Công danh hanh thông, tài lộc vượng phát.',
            tinhDuyen: bundle.lifeDossier.fivePillars[3]?.deepAnalysis || 'Tình duyên bền chặt, bạn đời đồng tâm hiệp lực.',
            vanHan: bundle.lifeDossier.trungVan.detail,
            nhanXet: `Đương số ${bundle.profileSummary.fullName} (${bundle.profileSummary.canChiYear} - ${bundle.profileSummary.menhNguHanh}): Vận số cát tường ${bundle.lifeDossier.destinyScores[0]?.score || 88}/100. Đức năng thắng số, tâm tịnh vạn sự thông.`
          });
        } catch (err) {
          console.warn("Auto build tuvi profile error:", err);
        }
      }
    };

    const handleActiveChange = (e: any) => {
      const activeName = e.detail?.name || getActiveDossierName();
      syncFromDossier(activeName);
    };

    // Tự động tải bảng tử vi ngay khi vừa vào tab nếu đã có hồ sơ đang chọn
    const initialActive = getActiveDossierName();
    if (initialActive) {
      syncFromDossier(initialActive);
    }

    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    };
  }, []);

  const handleNameChange = (val: string) => {
    setFullName(val);
    try {
      localStorage.setItem('thien_co_cac_user_name', val);
    } catch {}
    if (val.trim()) {
      upsertUserDossier({
        fullName: val.trim(),
        gender,
        birthHour
      });
    }
  };

  const getHourBranchIndex = (hourStr: string): number => {
    const branchName = hourStr.split(' ')[0];
    const idx = TERRESTRIAL_BRANCHES.indexOf(branchName);
    return idx >= 0 ? idx : 4;
  };

  // Tách text thô từ Gemini thành 6 phần nhỏ độc lập
  const parseSections = (rawText: string): ParsedTuViSections => {
    const extract = (tag: string, fallback: string): string => {
      const regex = new RegExp(`\\[${tag}\\]([\\s\\S]*?)\\[\\/${tag}\\]`, 'i');
      const match = rawText.match(regex);
      return match ? match[1].trim() : fallback;
    };

    return {
      thayPhan: extract('THAY_PHAN', 'Bản mệnh vững vàng tựa thái sơn,\nVượt qua thử thách rạng danh thơm.\nTâm lành tích đức duyên may tới,\nPhú quý vinh hoa đắc cát tường.'),
      banMenh: extract('BAN_MENH', 'Bản mệnh đắc ngũ hành vượng khí, tư chất thông minh, tính tình khẳng khái và coi trọng chữ tín trong giao tế.'),
      congDanh: extract('CONG_DANH', 'Sự nghiệp thăng hoa khi làm việc có tổ chức, tiền tài tích lũy vững bền theo thời gian.'),
      tinhDuyen: extract('TINH_DUYEN', 'Đường tình cảm ban đầu trải qua thử thách để thấu hiểu, hậu vận vợ chồng hòa thuận, đồng lòng xây dựng cơ nghiệp.'),
      vanHan: extract('VAN_HAN', 'Vận khí năm nay có bước chuyển mình tích cực. Cần chú ý giữ hòa khí và kiểm tra kỹ giấy tờ đầu tư.'),
      nhanXet: extract('NHAN_XET', 'Thầy bói nhận xét: Đương số có phúc khí tiềm tàng. Lấy nhẫn nhịn và thiện tâm làm gốc thì trăm sự đều thành cát lợi.')
    };
  };

  // LẬP LÁ SỐ VÀ BÌNH GIẢI
  const handleGenerateChart = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    const currentConv = astronomyData || convertSolar2Lunar(solarDay, solarMonth, solarYear);
    const solarStr = `${solarYear}-${String(solarMonth).padStart(2, '0')}-${String(solarDay).padStart(2, '0')}`;
    const lunarStr = `${currentConv.lunarDay}/${currentConv.lunarMonth}/${currentConv.lunarYear}${currentConv.isLeap ? ' (Nhuận)' : ''}`;

    const hourIdx = getHourBranchIndex(birthHour);
    const { cungMenh, cungThan, menhBranchIndex } = calculateMenhThanPalaces(currentConv.lunarMonth, hourIdx);
    const calculatedCuc = calculateCuc(currentConv.lunarYear, menhBranchIndex);

    const samplePalaces: TuViPalace[] = PALACES.map((pName, idx) => {
      const palaceBranchIdx = (menhBranchIndex + idx) % 12;
      const branchName = TERRESTRIAL_BRANCHES[palaceBranchIdx];
      const luck = 70 + ((currentConv.lunarYear + idx * 7 + currentConv.lunarDay) % 28);
      
      const starSets = [
        ["Tử Vi (Miếu)", "Thiên Phủ (Vượng)", "Hóa Khoa", "Tả Phụ"],
        ["Vũ Khúc (Vượng)", "Thiên Tướng (Đắc)", "Văn Xương", "Thiên Khôi"],
        ["Thái Dương (Miếu)", "Cự Môn (Hãm)", "Hóa Lộc", "Lộc Tồn"],
        ["Liêm Trinh (Đắc)", "Thất Sát (Vượng)", "Thiên Mã", "Long Trì"],
        ["Thiên Đồng (Vượng)", "Thiên Lương (Miếu)", "Hóa Quyền", "Phượng Các"],
        ["Thái Âm (Miếu)", "Hóa Kỵ", "Hữu Bật", "Thiên Việt"]
      ];

      return {
        name: pName,
        stars: starSets[idx % starSets.length],
        luckScore: luck,
        description: `Tọa thủ tại cung ${branchName}, đắc hội cát tinh chủ quản.`
      };
    });

    const summary: TuViProfile = {
      fullName,
      gender,
      solarDate: solarStr,
      lunarDate: lunarStr,
      isLeapMonth: currentConv.isLeap,
      birthHour,
      calendarType: calendarMode,
      canChiYear: currentConv.canChiYear,
      canChiMonth: currentConv.canChiMonth,
      canChiDay: currentConv.canChiDay,
      menhNguHanh: currentConv.napAm,
      cuc: calculatedCuc,
      cungMenh: cungMenh,
      cungThan: cungThan
    };

    setPalaces(samplePalaces);
    setProfileSummary(summary);
    setHasAutoFilled(true);

    // LƯU TỰ ĐỘNG VÀO HỒ SƠ ĐƯƠNG SỐ
    upsertUserDossier({
      fullName: fullName.trim() || 'Đương Số',
      gender,
      birthDate: solarStr,
      lunarDate: lunarStr,
      birthHour,
      canChiYear: currentConv.canChiYear,
      menhNguHanh: currentConv.napAm,
      notes: `Cung Mệnh: ${cungMenh} • Cục: ${calculatedCuc}`
    });

    const aiAnalysis = await analyzeTuViWithGemini(
      fullName,
      gender,
      solarStr,
      lunarStr,
      birthHour,
      cungMenh,
      cungThan,
      currentConv.napAm,
      calculatedCuc,
      currentConv.canChiDay,
      currentConv.canChiMonth,
      currentConv.canChiYear
    );

    setReadingResult(aiAnalysis);
    const parsed = parseSections(aiAnalysis);
    setParsedSections(parsed);
    setActiveTopic('thayPhan');
    setLoading(false);

    // Thầy bói tự động phán lời khẩu quyết đầu tiên
    const thayPhanSpeech = `Thầy bói phán cho đương số tuổi ${currentConv.canChiYear}, bản mệnh ${currentConv.napAm}: ${parsed.thayPhan}`;
    speakVoice(thayPhanSpeech, 'thayPhan');
  };

  const handleSave = () => {
    if (!readingResult || !profileSummary) return;
    onSaveResult({
      title: `Lá Số Tử Vi: ${profileSummary.fullName} (${profileSummary.canChiYear} - ${profileSummary.menhNguHanh})`,
      personName: profileSummary.fullName,
      summary: `Dương lịch: ${profileSummary.solarDate} • Âm lịch: ${profileSummary.lunarDate} • Cung Mệnh: ${profileSummary.cungMenh} (${profileSummary.cuc})`,
      fullContent: readingResult,
      type: 'tuvi'
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleQuickSample1984 = () => {
    setCalendarMode('solar');
    setSolarDay(10);
    setSolarMonth(10);
    setSolarYear(1984);
    setFullName('Đương Số Giáp Tý');
    setGender('nam');
  };

  // Xử lý hỏi thầy bói giang hồ chuyên sâu về lá số
  const handleAskQuestion = async (customQ?: string) => {
    const questionToAsk = (customQ || qaInput).trim();
    if (!questionToAsk || !profileSummary) return;

    setQaLoading(true);
    setQaAnswer(null);

    try {
      const answer = await askTuViDeepDiveQuestion(
        {
          fullName: profileSummary.fullName,
          gender: profileSummary.gender,
          canChiYear: profileSummary.canChiYear,
          menhNguHanh: profileSummary.menhNguHanh,
          cuc: profileSummary.cuc,
          cungMenh: profileSummary.cungMenh,
          cungThan: profileSummary.cungThan
        },
        questionToAsk
      );

      setQaAnswer(answer);
      setQaLoading(false);

      // Thầy bói tự phát âm câu trả lời
      speakVoice(answer, 'qa_response');
    } catch (err) {
      console.error(err);
      setQaLoading(false);
    }
  };

  // Tính toán 6 Đại Vận 10 năm theo Cục
  const getDecadeStartAge = (cucStr: string) => {
    if (cucStr.includes('Nhị')) return 2;
    if (cucStr.includes('Tam')) return 3;
    if (cucStr.includes('Tứ')) return 4;
    if (cucStr.includes('Ngũ')) return 5;
    if (cucStr.includes('Lục')) return 6;
    return 2;
  };

  const generateDecadesList = (cucStr: string, napAm: string) => {
    const startAge = getDecadeStartAge(cucStr);
    const titles = [
      "Khởi Trí & Tích Lũy Căn Cơ",
      "Khai Vận & Trui Rèn Bản Lĩnh",
      "Đại Phát Tài Lộc & Bứt Phá",
      "Đỉnh Cao Uy Vọng & Điền Sản",
      "Vững Vàng Hậu Vận & Viên Mãn",
      "An Khang Di Dưỡng Đại Phúc"
    ];

    const details = [
      `Giai đoạn thanh xuân tích lũy gốc rễ. Bản mệnh ${napAm} cần chú trọng trau dồi tri thức, kết giao bằng hữu chính trực, không nên nóng vội mưu đồ việc quá lớn.`,
      `Giai đoạn khởi nghiệp nhiều cơ hội đan xen thử thách. Có quý nhân âm phù dương trợ, cần quyết đoán nắm bắt thời cơ nhưng cẩn thận chi tiêu tiền tài.`,
      `Đại vận hoàng kim phát tài rực rỡ nhất. Sự nghiệp thăng tiến vùn vụt, tiền của tích tụ dồi dào. Càng làm việc thiện và giữ chữ tín thì tài lộc càng bền bỉ.`,
      `Vận thế ổn định ở đỉnh cao danh vọng. Thích hợp mở rộng quy mô, mua thêm đất đai điền sản, củng cố gia đạo bình an vững chãi.`,
      `Tài vận chín muồi, công thành danh toại. Hạn chế mạo hiểm thương trường, chuyển sang quản lý tài sản, giữ gìn sức khỏe và truyền thừa kinh nghiệm cho đời sau.`,
      `Hậu vận thong dong tự tại, con cháu phương trưởng hiển đạt. Phúc đức tổ tiên che chở, thọ trường an khang, gia môn rực rỡ.`
    ];

    return [0, 1, 2, 3, 4, 5].map((i) => {
      const fromAge = startAge + i * 10;
      const toAge = fromAge + 9;
      return {
        index: i,
        ageRange: `${fromAge} - ${toAge} tuổi`,
        title: titles[i],
        detail: details[i]
      };
    });
  };

  const getTriadDetails = (cungMenh: string, napAm: string) => {
    return {
      title: `Tam Hợp Quyền Lực: Cung Mệnh (${cungMenh}) - Cung Tài Bạch - Cung Quan Lộc`,
      overview: `Trong Tử Vi Đẩu Số, tam giác Mệnh - Tài - Quan là trục xương sống quyết định đến 80% thành bại của đời người. Với bản mệnh ${napAm}, thế tam hợp của bạn có nội lực rất lớn.`,
      menh: `Cung Mệnh (${cungMenh}): Nắm giữ chân mệnh cốt cách. Ý chí quật cường, biết nhìn xa trông rộng, có khí chất lãnh đạo bẩm sinh.`,
      tai: `Cung Tài Bạch: Nguồn tiền tài chủ yếu đến từ chuyên môn vững chắc hoặc tự thân vận động lập nghiệp. Càng về hậu vận kho tiền càng đầy.`,
      quan: `Cung Quan Lộc: Sự nghiệp hanh thông khi làm việc độc lập hoặc quản lý đội ngũ. Tránh dính líu đến các việc mập mờ tranh chấp pháp lý.`,
      advice: `Bí quyết cân bằng: Khi gặp năm xung khắc, hãy dùng cung Tài (làm từ thiện, tái đầu tư nâng cao năng lực) để bổ trợ cho cung Quan, ắt mọi trắc trở đều hóa thành bàn đạp vươn lên!`
    };
  };

  const getRemediesList = (napAm: string, canChiYear: string) => {
    return [
      {
        type: 'Hóa Giải Hung Tinh (Kình Dương, Đà La, Không, Kiếp)',
        desc: 'Hung tinh đóng cung không đáng sợ nếu biết cách chế ngự. Kình Đà chủ về va chạm, cạnh tranh -> Hãy biến nó thành động lực rèn luyện thể thao, quyết liệt trong công việc. Không Kiếp chủ về biến động tài chính -> Không tham lam lướt sóng may rủi, chia nhỏ tiền bạc thành nhiều tài sản thực.',
        badge: 'Hóa Hung Vi Cát',
        color: 'border-orange-500/40 bg-orange-500/10 text-orange-300'
      },
      {
        type: 'Kích Hoạt Cát Tinh (Hóa Lộc, Hóa Quyền, Tả Phù, Hữu Bật)',
        desc: `Người tuổi ${canChiYear} mang mệnh ${napAm} rất hợp với các tông màu tương sinh bản mệnh. Khi làm việc lớn, nên chọn giờ Hoàng Đạo và phương vị cát lợi để xuất hành. Giữ tâm niệm từ bi, nói lời ái ngữ sẽ kích hoạt sao Thiên Đức, Nguyệt Đức chiếu sáng vận mệnh.`,
        badge: 'Vượng Khí Chiêu Tài',
        color: 'border-amber-500/40 bg-amber-500/10 text-amber-300'
      },
      {
        type: 'Đức Năng Thắng Số (Phương Châm Cải Vận)',
        desc: 'Cổ nhân dạy: "Tâm còn chưa thiện, phong thủy vô ích. Bất hiếu cha mẹ, thờ cúng vô ích." Cải vận tốt nhất không phải là cúng bái tốn kém, mà là sửa đổi thói quen xấu, yêu thương gia đình và tích phúc mỗi ngày.',
        badge: 'Tâm Pháp Thượng Thừa',
        color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
      }
    ];
  };

  // Tạo Bảng Chi Tiết Lý Giải Bản Mệnh Cả Đời
  const generateLifeDestinyDossier = (profile: TuViProfile) => {
    const { menhNguHanh, canChiYear, cuc, cungMenh, cungThan } = profile;

    let element = 'Kim';
    if (menhNguHanh.includes('Mộc')) element = 'Mộc';
    else if (menhNguHanh.includes('Thủy')) element = 'Thủy';
    else if (menhNguHanh.includes('Hỏa')) element = 'Hỏa';
    else if (menhNguHanh.includes('Thổ')) element = 'Thổ';

    const tienVan = {
      ageRange: "Thuở ấu thơ đến 30 tuổi",
      title: "Tiền Vận: Trui Rèn Bản Lĩnh & Tích Lũy Căn Cơ",
      status: "Giai đoạn học vấn & lập thân",
      detail: `Thiếu thời của đương số tuổi ${canChiYear} mang tính chất rèn đúc ý chí. Bản tính vốn thông minh, tự lập từ sớm nhưng tiền vận thường trải qua vài phen thử thách trong học vấn hoặc bước đầu lập nghiệp. Đây là lúc trời thử lòng người, tích lũy kiến thức và đạo đức làm bệ phóng vững chãi cho tương lai.`,
      keyword: "Học đạo dưỡng tâm • Không nản chí",
      badgeColor: "bg-blue-500/20 text-blue-300 border-blue-400/40"
    };

    const trungVan = {
      ageRange: "Từ 31 đến 55 tuổi",
      title: "Trung Vận: Thời Kỳ Hoàng Kim & Bứt Phá Công Danh",
      status: "Giai đoạn đại phát tài lộc & lập nghiệp",
      detail: `Bước vào tuổi tam tuần, thiên thời địa lợi nhân hòa hội tụ. Cung Mệnh tại ${cungMenh} phối hợp Thân cư ${cungThan} kích hoạt vượng khí tài lộc. Đây là thời kỳ đương số gặt hái thành công vang dội nhất, gây dựng cơ nghiệp riêng, tiền của dồi dào, có tiếng nói và uy tín trong xã hội.`,
      keyword: "Nắm bắt thời cơ • Tài lộc bùng nổ",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-400/40"
    };

    const hauVan = {
      ageRange: "Từ 56 tuổi trở đi",
      title: "Hậu Vận: Viên Mãn Phúc Lộc & Điền Sản Vững Bền",
      status: "Giai đoạn an hưởng & phúc trạch",
      detail: `Hậu vận của đương số đạt được sự an nhàn, điền sản đất đai tích tụ dày dặn. Tâm tính trầm ổn, hướng thiện. Con cháu phương trưởng, thành đạt và hiếu thuận với cha mẹ. Đương số sống thọ, hưởng trọn phúc đức tổ tiên, gia môn vinh hiển muôn phần.`,
      keyword: "Đức năng thắng số • Gia đạo an khang",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
    };

    const fivePillars = [
      {
        id: 'pillar_personality',
        title: 'Căn Khí & Cốt Cách Bản Mệnh',
        subtitle: `Nạp Âm: ${menhNguHanh} • Mệnh tại: ${cungMenh}`,
        icon: Sparkles,
        color: 'border-yellow-400/40 text-yellow-300 bg-yellow-500/10',
        keyFact: `Khí chất kiên định của hành ${element}`,
        deepAnalysis: `Đương số sinh năm ${canChiYear} nạp âm ${menhNguHanh} là người có nội lực phi thường, trọng chữ tín và sống có nguyên tắc. Bản lĩnh dám nghĩ dám làm, ghét sự giả tạo, luôn sẵn lòng bảo bọc người thân cận. Tuy nhiên, đôi lúc quá cầu toàn, tự ôm đồm nhiều việc khiến tinh thần dễ lao lực.`,
        advice: `Học cách buông bớt sự kiểm soát, lắng nghe trực giác và cho phép bản thân nghỉ ngơi đúng lúc.`
      },
      {
        id: 'pillar_career',
        title: 'Quan Lộc & Con Đường Sự Nghiệp Cả Đời',
        subtitle: `Thân cư ${cungThan} • Cục: ${cuc}`,
        icon: Briefcase,
        color: 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10',
        keyFact: 'Hợp quản lý độc lập, thương mại hoặc chuyên môn sâu',
        deepAnalysis: `Đường công danh của bạn không thích hợp làm những việc rập khuôn hay phụ thuộc hoàn toàn vào người khác. Bạn phát huy tối đa năng lực khi làm chủ kinh doanh, quản lý đội ngũ, hoạch định chiến lược hoặc làm trong các lĩnh vực tài chính, công nghệ, sáng tạo. Trung vận có quý nhân nâng đỡ nâng tầm sự nghiệp.`,
        advice: `Chọn đối tác hợp mệnh (Thổ hoặc Kim), ký kết văn bản pháp lý minh bạch để tránh thị phi tiểu nhân.`
      },
      {
        id: 'pillar_wealth',
        title: 'Kho Tàng Tài Bạch & Điền Sản Đất Đai',
        subtitle: 'Tụ tài chính ngạch, càng tích lũy càng sung túc',
        icon: Award,
        color: 'border-amber-400/40 text-amber-300 bg-amber-500/10',
        keyFact: 'Tiền tài đến từ thực lực, hậu vận điền sản bề thế',
        deepAnalysis: `Lá số cho thấy bạn có cung Tài Bạch sáng, khả năng kiếm tiền nhạy bén nhưng thời trẻ dễ chi tiêu rộng rãi cho các mối quan hệ xã giao. Từ 35 tuổi trở đi, dòng tiền ổn định vững chắc, bạn có duyên lớn với bất động sản, đất đai điền trạch và các kênh tài sản giá trị thật.`,
        advice: `Nên biến tiền mặt thành tài sản cố định (nhà đất, vàng) để giữ của bền lâu, tránh đầu tư lướt sóng may rủi.`
      },
      {
        id: 'pillar_love',
        title: 'Hôn Nhân, Phu Thê & Duyên Nợ Cả Đời',
        subtitle: 'Duyên sâu nợ nặng, lạt mềm buộc chặt',
        icon: Heart,
        color: 'border-rose-400/40 text-rose-300 bg-rose-500/10',
        keyFact: 'Kết hôn sau 26–28 tuổi đại cát, bạn đời đồng lòng',
        deepAnalysis: `Chuyện tình cảm của bạn đòi hỏi sự thấu cảm và kiên nhẫn. Bạn đời là người có cá tính, giỏi giang và có trách nhiệm với tổ ấm. Thời kỳ đầu chung sống có thể xảy ra bất đồng quan điểm do cái tôi của hai bên, nhưng sau khi cùng nhau vượt qua thử thách kinh tế thì càng về già càng gắn bó khăng khít.`,
        advice: `Bớt một câu tranh cãi là thêm mười phần phúc khí. Lắng nghe và tôn trọng khoảng trời riêng của bạn đời.`
      },
      {
        id: 'pillar_health',
        title: 'Tật Ách, Sức Khỏe & Đại Hạn Cần Phòng',
        subtitle: 'Điều hòa khí huyết, giữ tâm an lạc',
        icon: ShieldAlert,
        color: 'border-cyan-400/40 text-cyan-300 bg-cyan-500/10',
        keyFact: 'Chú ý hệ tiêu hóa, giấc ngủ và các năm xung chi tuổi',
        deepAnalysis: `Do tính chất công việc nhiều lo toan, bạn cần lưu tâm đến tạng phủ thuộc hành khắc với bản mệnh, đặc biệt là hệ tiêu hóa, dạ dày và chứng đau đầu do căng thẳng. Cần cẩn trọng khi đi lại sông nước hoặc tham gia giao thông vào các tháng giữa năm trong các năm Tý - Ngọ - Mão - Dậu.`,
        advice: `Tập thiền định hoặc thể thao đều đặn, ăn uống thanh đạm, năng làm việc thiện để tiêu tai giải nạn.`
      }
    ];

    const destinyScores = [
      { label: 'Phúc Đức & Quý Nhân', score: 88, level: 'Đại Cát', comment: 'Luôn có lối thoát trong bế tắc, được bề trên che chở', color: 'bg-purple-500' },
      { label: 'Tài Lộc & Điền Sản', score: 86, level: 'Phát Vượng', comment: 'Khả năng tích lũy tiền của rất tốt từ tuổi 35 trở đi', color: 'bg-amber-500' },
      { label: 'Công Danh & Quyền Uy', score: 83, level: 'Thăng Tiến', comment: 'Có tố chất lãnh đạo, được đồng nghiệp nể phục', color: 'bg-emerald-500' },
      { label: 'Duyên Nợ & Hạnh Phúc', score: 80, level: 'Hòa Hợp', comment: 'Trải qua thử thách sẽ viên mãn, bạn đời biết lo toan', color: 'bg-rose-500' },
      { label: 'Khang Ninh & Thọ Trường', score: 90, level: 'Trường Thọ', comment: 'Cốt cách vững vàng, tâm an thì thân thể dẻo dai', color: 'bg-cyan-500' }
    ];

    const masterRemedy = {
      luckyColors: element === 'Kim' ? 'Trắng, Bạc, Ánh Kim, Vàng Đất, Nâu (Thổ sinh Kim)' :
                   element === 'Mộc' ? 'Xanh Lục, Xanh Lam, Đen (Thủy sinh Mộc)' :
                   element === 'Thủy' ? 'Đen, Xanh Dương, Trắng, Ghi Bạc (Kim sinh Thủy)' :
                   element === 'Hỏa' ? 'Đỏ, Hồng, Tím, Xanh Lá (Mộc sinh Hỏa)' :
                   'Vàng, Nâu, Đỏ, Hồng, Tím (Hỏa sinh Thổ)',
      luckyDirections: 'Đông Bắc (Sinh Khí), Tây Bắc (Thiên Y), Tây Nam (Diên Niên)',
      goldenHours: 'Giờ Thìn (07h-09h), Giờ Thân (15h-17h), Giờ Tý (23h-01h)',
      lifeMaxim: 'Đức năng thắng số • Tâm tịnh vạn sự thông • Hiếu kính cha mẹ là phong thủy số một.'
    };

    return { tienVan, trungVan, hauVan, fivePillars, destinyScores, masterRemedy };
  };

  // Danh sách các tab phân mục bình giải
  const topicsList = [
    { id: 'thayPhan', label: 'Lời Thầy Phán', icon: ScrollText, color: 'text-amber-400 border-amber-400/50 bg-amber-500/10' },
    { id: 'banMenh', label: 'Bản Mệnh & Tính Cách', icon: Sparkle, color: 'text-yellow-300 border-yellow-400/50 bg-yellow-500/10' },
    { id: 'congDanh', label: 'Tài Lộc & Công Danh', icon: Briefcase, color: 'text-emerald-400 border-emerald-400/50 bg-emerald-500/10' },
    { id: 'tinhDuyen', label: 'Tình Duyên & Phu Thê', icon: Heart, color: 'text-rose-400 border-rose-400/50 bg-rose-500/10' },
    { id: 'vanHan', label: 'Vận Hạn Năm Nay', icon: AlertTriangle, color: 'text-orange-400 border-orange-400/50 bg-orange-500/10' },
    { id: 'nhanXet', label: 'Thầy Nhận Xét & Cải Mệnh', icon: Flame, color: 'text-purple-300 border-purple-400/50 bg-purple-500/10' }
  ];

  const decadesList = profileSummary ? generateDecadesList(profileSummary.cuc, profileSummary.menhNguHanh) : [];
  const triadData = profileSummary ? getTriadDetails(profileSummary.cungMenh, profileSummary.menhNguHanh) : null;
  const remediesList = profileSummary ? getRemediesList(profileSummary.menhNguHanh, profileSummary.canChiYear) : [];

  const lifeDossier = profileSummary ? generateLifeDestinyDossier(profileSummary) : null;

  const dossierSpeechText = profileSummary && lifeDossier
    ? `Bản lý giải bản mệnh cả đời cho đương số ${profileSummary.fullName}, tuổi ${profileSummary.canChiYear}, nạp âm ${profileSummary.menhNguHanh}: Tiền vận từ nhỏ đến 30 tuổi là lúc trui rèn bản lĩnh, học hỏi và tích lũy căn cơ. Trung vận từ 31 đến 55 tuổi là thời kỳ hoàng kim, bứt phá công danh và đại phát tài lộc. Hậu vận từ 56 tuổi trở đi an hưởng viên mãn phúc đức, con cháu hiển đạt vinh hoa. Lời khuyên vàng của thầy bói: Đức năng thắng số, hiếu thảo cha mẹ và làm việc thiện là phong thủy cải vận tốt nhất!`
    : '';

  const teacherSuggestionSpeech = profileSummary
    ? `Đương số ${profileSummary.fullName}, xem xong lá số Tử Vi rồi, thầy bói khuyên bạn: Tử Vi là khung mệnh trời sinh ra, nhưng tướng tùy tâm sinh. Bạn nên soi chỉ tay hoặc xem tướng mặt ngay để đối chiếu xem hình tướng có ăn khớp với lá số hay không. Nếu muốn biết rõ khúc quanh đời mình, hãy xem tiếp mười năm đại vận ở dưới. Còn nếu đang có việc gấp cần quyết định ngay, hãy gieo một quẻ Kinh Dịch để ta bấm quẻ nhé!`
    : '';

  return (
    <div className="space-y-6">
      {/* KHUNG BỘ CHUYỂN ĐỔI LỊCH ÂM DƯƠNG & TỰ ĐỘNG AN SAO */}
      <div className="bg-gradient-to-r from-amber-500/20 via-purple-950/60 to-amber-500/20 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between pb-4 border-b border-amber-400/30">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-lg relative bg-slate-900">
              <img
                src="/assets/manga_master.jpg"
                alt="Thầy bói"
                className="w-full h-full object-cover"
              />
              {isVoiceSpeaking && (
                <div className="absolute inset-0 bg-amber-400/20 animate-pulse flex items-center justify-center">
                  <Volume2 className="w-6 h-6 text-amber-300 animate-bounce" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">☯</span>
                <h3 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
                  Bộ Chuyển Đổi Lịch Âm Dương & Tử Vi Thiên Văn
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                Quy đổi tự động ngày Sóc, tháng Nhuận, Can Chi để an Cung Mệnh Thân chuẩn xác.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleQuickSample1984}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 transition active:scale-95"
            >
              Mẫu: 10/10/1984 (Hải Trung Kim)
            </button>
            <button
              onClick={() => speakVoice(askQuestionScript)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/40 shadow active:scale-95 transition"
            >
              <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isVoiceSpeaking ? 'animate-bounce' : ''}`} />
              <span>{isVoiceSpeaking ? 'Đang hỏi...' : 'Nghe thầy hỏi'}</span>
            </button>
          </div>
        </div>

        {/* Tab chọn Dương lịch / Âm lịch */}
        <div className="mt-5 flex justify-center">
          <div className="bg-slate-950 p-1 rounded-2xl border border-amber-400/40 flex gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setCalendarMode('solar')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                calendarMode === 'solar'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span>Nhập Theo Dương Lịch</span>
            </button>
            <button
              type="button"
              onClick={() => setCalendarMode('lunar')}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
                calendarMode === 'lunar'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-purple-300'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span>Nhập Theo Âm Lịch</span>
            </button>
          </div>
        </div>

        {/* Form nhập ngày tháng */}
        <form onSubmit={handleGenerateChart} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">Họ và tên đương số:</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-200 mb-1">Giới tính:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('nam')}
                  className={`py-2 text-xs rounded-xl font-bold border transition ${
                    gender === 'nam'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  Nam Mạng
                </button>
                <button
                  type="button"
                  onClick={() => setGender('nu')}
                  className={`py-2 text-xs rounded-xl font-bold border transition ${
                    gender === 'nu'
                      ? 'bg-pink-600 text-white border-pink-400 shadow'
                      : 'bg-slate-950 text-slate-400 border-slate-700'
                  }`}
                >
                  Nữ Mạng
                </button>
              </div>
            </div>

            {calendarMode === 'solar' ? (
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-amber-200 mb-1">
                  Ngày sinh Dương lịch (Ngày / Tháng / Năm):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={solarDay}
                    onChange={(e) => setSolarDay(parseInt(e.target.value) || 1)}
                    placeholder="Ngày"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={solarMonth}
                    onChange={(e) => setSolarMonth(parseInt(e.target.value) || 1)}
                    placeholder="Tháng"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={solarYear}
                    onChange={(e) => setSolarYear(parseInt(e.target.value) || 1984)}
                    placeholder="Năm"
                    className="bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-amber-300"
                  />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-purple-200">
                    Ngày sinh Âm lịch (Ngày / Tháng / Năm):
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLeapMonth}
                      onChange={(e) => handleLunarChange(lunarDay, lunarMonth, lunarYear, e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    <span>Tháng Nhuận</span>
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={lunarDay}
                    onChange={(e) => handleLunarChange(parseInt(e.target.value) || 1, lunarMonth, lunarYear, isLeapMonth)}
                    placeholder="Ngày Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={lunarMonth}
                    onChange={(e) => handleLunarChange(lunarDay, parseInt(e.target.value) || 1, lunarYear, isLeapMonth)}
                    placeholder="Tháng Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                  <input
                    type="number"
                    min="1900"
                    max="2050"
                    required
                    value={lunarYear}
                    onChange={(e) => handleLunarChange(lunarDay, lunarMonth, parseInt(e.target.value) || 1984, isLeapMonth)}
                    placeholder="Năm Âm"
                    className="bg-slate-950 border border-purple-500/50 focus:border-purple-400 rounded-xl px-2 py-2 text-center text-sm font-bold text-purple-300"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-amber-200 mb-1">Giờ sinh (Theo Can Chi):</label>
              <select
                value={birthHour}
                onChange={(e) => setBirthHour(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none font-medium"
              >
                <option value="Tý (23h00 - 01h00)">Giờ Tý (23h00 - 01h00)</option>
                <option value="Sửu (01h00 - 03h00)">Giờ Sửu (01h00 - 03h00)</option>
                <option value="Dần (03h00 - 05h00)">Giờ Dần (03h00 - 05h00)</option>
                <option value="Mão (05h00 - 07h00)">Giờ Mão (05h00 - 07h00)</option>
                <option value="Thìn (07h00 - 09h00)">Giờ Thìn (07h00 - 09h00)</option>
                <option value="Tỵ (09h00 - 11h00)">Giờ Tỵ (09h00 - 11h00)</option>
                <option value="Ngọ (11h00 - 13h00)">Giờ Ngọ (11h00 - 13h00)</option>
                <option value="Mùi (13h00 - 15h00)">Giờ Mùi (13h00 - 15h00)</option>
                <option value="Thân (15h00 - 17h00)">Giờ Thân (15h00 - 17h00)</option>
                <option value="Dậu (17h00 - 19h00)">Giờ Dậu (17h00 - 19h00)</option>
                <option value="Tuất (19h00 - 21h00)">Giờ Tuất (19h00 - 21h00)</option>
                <option value="Hợi (21h00 - 23h00)">Giờ Hợi (21h00 - 23h00)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end items-end h-full pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang bấm quẻ an sao...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>An Sao & Nghe Thầy Phán</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Thông tin đối ứng thiên văn */}
        {astronomyData && (
          <div className="mt-4 p-4 bg-slate-950/90 border border-amber-400/40 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-start gap-2.5">
              <Sun className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Dương Lịch:</span>
                <span className="text-sm font-bold text-amber-300">
                  Ngày {solarDay}/{solarMonth}/{solarYear} • Giờ {birthHour.split(' ')[0]}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 flex items-start gap-2.5">
              <Moon className="w-5 h-5 text-purple-300 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-purple-300 block font-semibold">Âm Lịch Thiên Văn:</span>
                <span className="text-sm font-bold text-yellow-300">
                  Ngày {lunarDay}/{lunarMonth}/{lunarYear} {isLeapMonth ? '(Nhuận)' : ''}
                </span>
                <span className="text-[11px] text-emerald-300 block font-bold">
                  Năm {astronomyData.canChiYear} • Nạp Âm: {astronomyData.napAm}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KẾT QUẢ AN SAO VÀ CÁC PHẦN BÌNH GIẢI NGẮN GỌN VỚI GIỌNG THẦY BÓI */}
      {profileSummary && parsedSections && (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="bg-gradient-to-r from-purple-950/90 via-slate-900 to-purple-950/90 border-2 border-amber-400/50 rounded-2xl p-5 sm:p-6 shadow-2xl grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Đương Số</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.fullName}</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                ({profileSummary.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'})
              </span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Tứ Trụ Can Chi</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.canChiYear}</span>
              <span className="text-xs text-purple-300 block mt-0.5">Tháng {profileSummary.canChiMonth}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-amber-500/40 relative overflow-hidden">
              <div className="absolute top-1 right-1 text-amber-400 text-[10px]">★</div>
              <span className="text-[11px] text-amber-300/90 block font-medium">Bản Mệnh Nạp Âm</span>
              <span className="text-base font-bold text-yellow-300">{profileSummary.menhNguHanh}</span>
              <span className="text-xs text-emerald-400 block mt-0.5 font-semibold">Cục: {profileSummary.cuc}</span>
            </div>

            <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block font-medium">Cung Mệnh & Thân</span>
              <span className="text-base font-bold text-amber-300">{profileSummary.cungMenh}</span>
              <span className="text-xs text-amber-400 block mt-0.5">Thân cư {profileSummary.cungThan}</span>
            </div>
          </div>

          {/* KHUNG BÌNH GIẢI CHIA NHỎ: LỜI THẦY PHÁN VÀ NHẬN XÉT CÓ PHÁT ÂM */}
          <div className="bg-slate-950 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5">
            
            {/* Header chuyên mục & Nút Lưu */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow">
                  <ScrollText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300 flex items-center gap-2">
                    <span>Thầy Bói Giang Hồ Phán & Nhận Xét</span>
                    {isVoiceSpeaking && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-sans font-semibold animate-pulse">
                        <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                        <span>Đang đọc...</span>
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Chọn từng phần nhỏ bên dưới để xem và nghe thầy bói phán chi tiết từng vận thế
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isVoiceSpeaking ? (
                  <button
                    onClick={stopVoice}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Dừng Đọc</span>
                  </button>
                ) : (
                  <button
                    onClick={() => speakVoice(parsedSections[activeTopic], activeTopic)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nghe Thầy Đọc Phần Này</span>
                  </button>
                )}

                <button
                  onClick={handleSave}
                  className="px-4 py-1.5 rounded-xl bg-purple-900/40 hover:bg-purple-800/50 text-purple-200 border border-purple-500/40 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>{savedSuccess ? 'Đã lưu!' : 'Lưu lại'}</span>
                </button>
              </div>
            </div>

            {/* DANH SÁCH 6 TAB / NÚT CHỌN CHUYÊN MỤC NHỎ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {topicsList.map((topic) => {
                const Icon = topic.icon;
                const isActive = activeTopic === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopic(topic.id as any);
                      speakVoice(parsedSections[topic.id as keyof ParsedTuViSections], topic.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between gap-2 shadow ${
                      isActive
                        ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/30 scale-[1.02]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      {currentlySpeakingSection === topic.id && isVoiceSpeaking && (
                        <Volume2 className="w-3 h-3 text-emerald-400 animate-bounce" />
                      )}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                      {topic.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* VÙNG NỘI DUNG CHI TIẾT CỦA PHẦN ĐANG CHỌN */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-amber-400/30 shadow-inner relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <h4 className="font-mystic font-bold text-base text-amber-300">
                    {topicsList.find(t => t.id === activeTopic)?.label}
                  </h4>
                </div>

                <button
                  onClick={() => speakVoice(parsedSections[activeTopic], activeTopic)}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                  title="Nghe lại đoạn này"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Nghe lại</span>
                </button>
              </div>

              {/* Lời thầy phán dạng thơ kiếm hiệp nổi bật */}
              {activeTopic === 'thayPhan' ? (
                <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/15 to-amber-500/10 p-5 rounded-2xl border-l-4 border-amber-400 my-2">
                  <p className="font-serif-title text-base sm:text-lg text-amber-200 italic leading-relaxed whitespace-pre-line text-center sm:text-left">
                    "{parsedSections.thayPhan}"
                  </p>
                </div>
              ) : activeTopic === 'nhanXet' ? (
                <div className="bg-purple-950/30 p-5 rounded-2xl border-l-4 border-purple-400 my-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                    Lời Khuyên Chân Thành Của Thầy Bói:
                  </span>
                  <p className="text-sm text-purple-100 leading-relaxed whitespace-pre-line">
                    {parsedSections.nhanXet}
                  </p>
                </div>
              ) : (
                <div className="text-sm sm:text-base text-slate-200 leading-relaxed whitespace-pre-line py-1">
                  {parsedSections[activeTopic]}
                </div>
              )}
            </div>

          </div>

          {/* BẢNG CHI TIẾT LÝ GIẢI BẢN MỆNH CẢ ĐỜI (LIFELONG DESTINY DOSSIER) */}
          {lifeDossier && (
            <div className="bg-slate-950/95 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
              {/* Glowing decorative ambient */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

              {/* Header: Title, Description & Voice button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-400/30 pb-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg flex-shrink-0">
                    <ScrollText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold uppercase tracking-wider">
                        Thiên Cơ Toàn Thư
                      </span>
                      <span className="text-xs text-purple-300 flex items-center gap-1 font-semibold">
                        <Sparkle className="w-3 h-3 text-amber-400" />
                        Bản Mệnh Trọn Đời
                      </span>
                    </div>
                    <h3 className="font-mystic text-lg sm:text-2xl font-bold text-amber-300 mt-1">
                      Bảng Chi Tiết Lý Giải Bản Mệnh Cả Đời
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                      Luận giải Tam Kỳ Vận Mệnh (Tiền – Trung – Hậu Vận), Ngũ Trụ Cuộc Đời và Thước Đo Cát Hung cho đương số <strong className="text-amber-300">{profileSummary.fullName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
                  <button
                    onClick={() => speakVoice(dossierSpeechText, 'life_dossier')}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nghe Thầy Đọc Bản Mệnh Cả Đời</span>
                  </button>
                </div>
              </div>

              {/* Sub-tabs / Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: 'all', label: 'Toàn Bộ Bản Mệnh' },
                  { id: 'tamKy', label: 'Tam Kỳ (Tiền - Trung - Hậu Vận)' },
                  { id: 'fivePillars', label: 'Ngũ Trụ Cuộc Đời' },
                  { id: 'scores', label: 'Thước Đo Cát Hung & Cải Vận' }
                ].map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setLifeDossierTab(tb.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                      lifeDossierTab === tb.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 ring-1 ring-amber-400/40 shadow'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>

              {/* PHẦN 1: TAM KỲ VẬN MỆNH CẢ ĐỜI (TIỀN - TRUNG - HẬU VẬN) */}
              {(lifeDossierTab === 'all' || lifeDossierTab === 'tamKy') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      <span>1. Tam Kỳ Vận Mệnh Cả Đời (Ba Khúc Quanh Đời Người)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Tiền Vận • Trung Vận • Hậu Vận
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Tiền Vận */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 flex flex-col justify-between gap-3 shadow hover:border-blue-400 transition">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lifeDossier.tienVan.badgeColor}`}>
                            {lifeDossier.tienVan.ageRange}
                          </span>
                          <span className="text-[11px] text-blue-300 font-semibold">Khởi Nghiệp</span>
                        </div>
                        <h5 className="font-mystic font-bold text-sm text-blue-200">
                          {lifeDossier.tienVan.title}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {lifeDossier.tienVan.detail}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-blue-500/20 text-[11px] text-blue-300 font-medium">
                        🔑 {lifeDossier.tienVan.keyword}
                      </div>
                    </div>

                    {/* Trung Vận */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900/90 border-2 border-amber-400/50 flex flex-col justify-between gap-3 shadow-xl hover:border-amber-400 transition relative overflow-hidden">
                      <div className="absolute top-1 right-2 text-amber-400 text-xs font-bold animate-pulse">★ Hoàng Kim</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lifeDossier.trungVan.badgeColor}`}>
                            {lifeDossier.trungVan.ageRange}
                          </span>
                        </div>
                        <h5 className="font-mystic font-bold text-sm text-amber-300">
                          {lifeDossier.trungVan.title}
                        </h5>
                        <p className="text-xs text-slate-200 leading-relaxed">
                          {lifeDossier.trungVan.detail}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 text-[11px] text-amber-300 font-bold">
                        🔥 {lifeDossier.trungVan.keyword}
                      </div>
                    </div>

                    {/* Hậu Vận */}
                    <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/30 flex flex-col justify-between gap-3 shadow hover:border-emerald-400 transition">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lifeDossier.hauVan.badgeColor}`}>
                            {lifeDossier.hauVan.ageRange}
                          </span>
                          <span className="text-[11px] text-emerald-300 font-semibold">An Khang</span>
                        </div>
                        <h5 className="font-mystic font-bold text-sm text-emerald-200">
                          {lifeDossier.hauVan.title}
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {lifeDossier.hauVan.detail}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/20 text-[11px] text-emerald-300 font-medium">
                        🌿 {lifeDossier.hauVan.keyword}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PHẦN 2: BẢNG 5 TRỤ CỘT CUỘC ĐỜI (NGŨ TRỤ CỐT TỦY) */}
              {(lifeDossierTab === 'all' || lifeDossierTab === 'fivePillars') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span>2. Bảng Phân Tích 5 Trụ Cột Đời Người (Ngũ Trụ Cốt Tủy)</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                      Căn Khí • Sự Nghiệp • Tiền Tài • Hôn Nhân • Sức Khỏe
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {lifeDossier.fivePillars.map((p) => {
                      const Icon = p.icon;
                      return (
                        <div
                          key={p.id}
                          className={`p-4 rounded-2xl border ${p.color} bg-slate-950/80 flex flex-col justify-between gap-3 shadow hover:scale-[1.01] transition`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <span className="font-mystic font-bold text-sm flex items-center gap-1.5">
                                <Icon className="w-4 h-4" />
                                <span>{p.title}</span>
                              </span>
                            </div>
                            <span className="text-[11px] text-amber-300/80 font-semibold block">
                              {p.subtitle}
                            </span>
                            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-medium">
                              ⭐ <strong>Điểm then chốt:</strong> {p.keyFact}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed pt-1">
                              {p.deepAnalysis}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                            💡 <strong>Lời khuyên:</strong> {p.advice}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PHẦN 3: THƯỚC ĐO CÁT HUNG & BÍ PHÁP CẢI VẬN TRỌN ĐỜI */}
              {(lifeDossierTab === 'all' || lifeDossierTab === 'scores') && (
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Thước Đo Chỉ Số Cát Hung */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-3.5 shadow">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h5 className="font-mystic font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-400" />
                          <span>Thước Đo Chỉ Số Vận Số Cả Đời</span>
                        </h5>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30">
                          Thang 100 Điểm
                        </span>
                      </div>

                      <div className="space-y-3">
                        {lifeDossier.destinyScores.map((sc, i) => (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-200">{sc.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300 font-bold">
                                  {sc.level}
                                </span>
                                <span className="font-bold text-amber-300">{sc.score}/100</span>
                              </div>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${sc.color} transition-all duration-700`}
                                style={{ width: `${sc.score}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 block pt-0.5">
                              {sc.comment}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bí Pháp Cải Vận Trọn Đời Của Thầy Bói */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-purple-950/40 border border-amber-400/40 space-y-3.5 shadow">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <h5 className="font-mystic font-bold text-sm sm:text-base text-amber-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Bí Pháp Cải Mệnh Trọn Đời</span>
                        </h5>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                          Phong Thủy Thực Chiến
                        </span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                          <span className="text-slate-400 font-semibold block">🎨 Màu sắc bản mệnh tương sinh:</span>
                          <span className="text-amber-300 font-bold">{lifeDossier.masterRemedy.luckyColors}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                          <span className="text-slate-400 font-semibold block">🧭 Hướng cát đại vượng (Sinh Khí / Thiên Y):</span>
                          <span className="text-emerald-300 font-bold">{lifeDossier.masterRemedy.luckyDirections}</span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-0.5">
                          <span className="text-slate-400 font-semibold block">⏰ Khung giờ hoàng đạo vượng khí:</span>
                          <span className="text-yellow-300 font-bold">{lifeDossier.masterRemedy.goldenHours}</span>
                        </div>

                        <div className="p-3 rounded-xl bg-amber-500/10 border-l-4 border-amber-400 text-amber-200 italic font-serif-title leading-relaxed">
                          "📜 {lifeDossier.masterRemedy.lifeMaxim}"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* 12 Cung Tử Vi Matrix */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mystic text-lg font-bold text-amber-300 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>Bát Quái Thập Nhị Cung (Khởi từ Cung {profileSummary.cungMenh}):</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-400/30">
                12 Cung Số Mệnh
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {palaces.map((palace, i) => (
                <div
                  key={i}
                  className="bg-slate-950/90 border border-slate-800 hover:border-amber-400/50 p-3.5 rounded-xl transition duration-300 group shadow"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
                    <span className="font-mystic font-bold text-sm text-amber-300 group-hover:text-amber-200">
                      Cung {palace.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-semibold">
                      {palace.luckScore}% Cát
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {palace.stars.map((st, idx) => (
                      <span key={idx} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/90 border border-amber-500/20">
                        {st}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {palace.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* KHU VỰC BƯỚC TIẾP THEO: XEM TIẾP SÂU HƠN HOẶC XEM CÁI KHÁC */}
          <div className="bg-slate-950/95 border-2 border-amber-400/60 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
            {/* Background glowing ambient effect */}
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* THẦY BÓI GIANG HỒ TRỰC TIẾP CHỈ ĐIỂM XEM GÌ TIẾP THEO */}
            <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-950/70 to-amber-500/15 border-2 border-amber-400/60 shadow-2xl space-y-4 relative overflow-hidden backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-400/30 pb-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl border-2 border-amber-400 overflow-hidden flex-shrink-0 shadow-lg relative bg-slate-900 ring-2 ring-amber-400/40">
                    <img
                      src="/assets/manga_master.jpg"
                      alt="Thầy Bói Giang Hồ"
                      className="w-full h-full object-cover"
                    />
                    {isVoiceSpeaking && (
                      <div className="absolute inset-0 bg-amber-400/25 animate-pulse flex items-center justify-center">
                        <Volume2 className="w-6 h-6 text-amber-300 animate-bounce" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 text-lg">☯</span>
                      <h4 className="font-mystic font-bold text-amber-300 text-base sm:text-lg">
                        Thầy Bói Giang Hồ Chỉ Điểm: "Xem Xong Tử Vi, Nên Xem Gì Tiếp?"
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Gợi ý riêng cho <span className="text-amber-300 font-semibold">{profileSummary.fullName}</span> (Tuổi {profileSummary.canChiYear} • Mệnh {profileSummary.menhNguHanh})
                    </p>
                  </div>
                </div>

                {/* Nút nghe thầy bói khuyên */}
                <button
                  onClick={() => speakVoice(teacherSuggestionSpeech, 'teacher_suggestion')}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/60 text-xs sm:text-sm font-bold flex items-center gap-2 transition active:scale-95 shadow self-start sm:self-auto flex-shrink-0"
                >
                  <Volume2 className={`w-4 h-4 text-amber-400 ${isVoiceSpeaking ? 'animate-bounce' : ''}`} />
                  <span>Nghe Thầy Khuyên Xem Gì Tiếp</span>
                </button>
              </div>

              {/* Lời thầy bói dặn dò */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 text-xs sm:text-sm text-slate-200 leading-relaxed">
                <p className="italic text-amber-200 font-serif-title leading-relaxed">
                  "Lá số Tử Vi là <strong>'Bản Mệnh Trời Ban'</strong>, nhưng cổ nhân có dạy: <em>'Nhất Mệnh, Nhị Vận, Tam Phong Thủy, Tứ Tích Âm Đức, Ngũ Tướng Mạo'</em>. Muốn biết số mệnh này trong đời thực ra sao, ta chỉ điểm cho bạn 3 hướng tiếp theo:"
                </p>
              </div>

              {/* 3 Lựa chọn gợi ý có nút bấm chuyển nhanh */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                {/* Gợi ý 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-400/50 hover:border-amber-400 transition flex flex-col justify-between gap-3 shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 uppercase">
                        Khuyên xem nhất ⭐⭐⭐
                      </span>
                      <span className="text-amber-400 text-xs font-semibold">Đối Chiếu Hình Tướng</span>
                    </div>
                    <h5 className="font-mystic font-bold text-sm text-amber-200 mt-2">
                      1. Soi Chỉ Tay & Tướng Mặt
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Quét 3 đường Sinh Đạo và cung Tài Bạch (mũi) xem có tụ tài đúng như cung Mệnh Tử Vi không.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onNavigateTab?.('facepalm', 'palm')}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Hand className="w-3.5 h-3.5" />
                      <span>Soi Chỉ Tay</span>
                    </button>
                    <button
                      onClick={() => onNavigateTab?.('facepalm', 'face')}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem Tướng Mặt</span>
                    </button>
                  </div>
                </div>

                {/* Gợi ý 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-indigo-400/50 hover:border-indigo-400 transition flex flex-col justify-between gap-3 shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 uppercase">
                        Khuyên xem ⭐⭐
                      </span>
                      <span className="text-indigo-400 text-xs font-semibold">Vận Hạn 10 Năm</span>
                    </div>
                    <h5 className="font-mystic font-bold text-sm text-indigo-200 mt-2">
                      2. Bóc Tách 10 Năm Đại Vận
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Xem chặng đường 10 năm hiện tại của bạn đang vượng hay suy, hoặc hỏi điều riêng bạn đang băn khoăn.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setNextActionTab('deep_dive');
                        setDeepDiveTopic('decade');
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Xem Đại Vận</span>
                    </button>
                    <button
                      onClick={() => {
                        setNextActionTab('deep_dive');
                        setDeepDiveTopic('qa');
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Hỏi Thầy Bói</span>
                    </button>
                  </div>
                </div>

                {/* Gợi ý 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-400/50 hover:border-emerald-400 transition flex flex-col justify-between gap-3 shadow">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase">
                        Việc khẩn cấp ⚡
                      </span>
                      <span className="text-emerald-400 text-xs font-semibold">Kinh Dịch Hỏi Việc</span>
                    </div>
                    <h5 className="font-mystic font-bold text-sm text-emerald-200 mt-2">
                      3. Gieo Quẻ Hỏi Việc Gấp
                    </h5>
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      Nếu đang phân vân đầu tư, chuyển việc, ký hợp đồng trong tuần/tháng, hãy gieo 3 đồng Càn Khôn.
                    </p>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => onNavigateTab?.('home')}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/50 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gieo Quẻ Kinh Dịch Ngay</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Header Call to Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/30 to-purple-600/30 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg flex-shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 font-semibold uppercase tracking-wider">
                      Khám Phá Chi Tiết
                    </span>
                    <span className="text-xs text-purple-300 flex items-center gap-1">
                      <Sparkle className="w-3 h-3 text-amber-400" />
                      Tùy chọn tự do
                    </span>
                  </div>
                  <h3 className="font-mystic text-lg sm:text-xl font-bold text-amber-300 mt-1">
                    Hoặc Bạn Tự Chọn Mục Muốn Khám Phá:
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    Đào sâu vận hạn 10 năm, tam hợp quyền lực hoặc chuyển hẳn sang các bộ môn huyền thuật khác.
                  </p>
                </div>
              </div>

              {/* 2 NÚT CHÍNH: XEM TIẾP SÂU HƠN HOẶC XEM CÁI KHÁC */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-amber-500/30 rounded-2xl flex-shrink-0 self-start md:self-auto shadow-inner">
                <button
                  onClick={() => setNextActionTab('deep_dive')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    nextActionTab === 'deep_dive'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Xem Tiếp Sâu Hơn</span>
                </button>

                <button
                  onClick={() => setNextActionTab('explore_others')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                    nextActionTab === 'explore_others'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md font-extrabold'
                      : 'text-slate-300 hover:text-purple-300'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Xem Cái Khác (Chỉ Tay, Tướng Vận...)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: XEM TIẾP SÂU HƠN */}
            {nextActionTab === 'deep_dive' && (
              <div className="space-y-5">
                {/* 4 Chuyên đề luận giải sâu */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'decade', label: '10 Năm Đại Vận', icon: Calendar, desc: '6 chu kỳ đại vận cả đời' },
                    { id: 'triad', label: 'Tam Hợp Mệnh-Tài-Quan', icon: Activity, desc: 'Trục ba đỉnh thành bại' },
                    { id: 'remedy', label: 'Hóa Giải Hung & Cải Mệnh', icon: ShieldAlert, desc: 'Chuyển hung vi cát' },
                    { id: 'qa', label: 'Hỏi Thầy Bói Trực Tiếp', icon: HelpCircle, desc: 'Hỏi gì đáp nấy về lá số' }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = deepDiveTopic === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setDeepDiveTopic(tab.id as any)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-1.5 shadow ${
                          isActive
                            ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/30'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                        </div>
                        <div>
                          <div className={`text-xs font-bold leading-tight ${isActive ? 'text-amber-300' : 'text-slate-300'}`}>
                            {tab.label}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {tab.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* NỘI DUNG CHUYÊN ĐỀ 1: 10 NĂM ĐẠI VẬN */}
                {deepDiveTopic === 'decade' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>6 Giai Đoạn Đại Vận Cuộc Đời (Khởi từ Cục: {profileSummary.cuc})</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Nhấp chọn từng giai đoạn 10 năm để xem lời đoán định và nghe thầy bói phán:
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const item = decadesList[selectedDecadeIdx];
                          if (item) {
                            speakVoice(`Đại vận ${item.ageRange}, ${item.title}: ${item.detail}`, `decade_${selectedDecadeIdx}`);
                          }
                        }}
                        className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 shadow"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nghe Thầy Đọc Giai Đoạn Này</span>
                      </button>
                    </div>

                    {/* Vạch chọn 6 Đại vận */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                      {decadesList.map((d, idx) => {
                        const isChosen = selectedDecadeIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedDecadeIdx(idx);
                              speakVoice(`Đại vận ${d.ageRange}, ${d.title}: ${d.detail}`, `decade_${idx}`);
                            }}
                            className={`p-2.5 rounded-xl border text-center transition ${
                              isChosen
                                ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 text-amber-200'
                                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                            }`}
                          >
                            <span className="block text-xs font-extrabold text-amber-300">
                              {d.ageRange}
                            </span>
                            <span className="block text-[10px] text-slate-300 truncate mt-0.5">
                              {d.title.split(' ')[0]} {d.title.split(' ')[1] || ''}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Chi tiết đại vận đang chọn */}
                    {decadesList[selectedDecadeIdx] && (
                      <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                            {decadesList[selectedDecadeIdx].ageRange} • {decadesList[selectedDecadeIdx].title}
                          </span>
                          <span className="text-[11px] text-purple-300">
                            Khởi vận: {profileSummary.cuc}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200 leading-relaxed pt-1">
                          {decadesList[selectedDecadeIdx].detail}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* NỘI DUNG CHUYÊN ĐỀ 2: TAM HỢP MỆNH - TÀI - QUAN */}
                {deepDiveTopic === 'triad' && triadData && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>{triadData.title}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {triadData.overview}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-amber-400/30 space-y-1.5">
                        <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>1. Cung Mệnh (Cốt Cách)</span>
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {triadData.menh}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-emerald-400/30 space-y-1.5">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                          <span>2. Cung Quan Lộc (Sự Nghiệp)</span>
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {triadData.quan}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/90 border border-yellow-400/30 space-y-1.5">
                        <span className="text-xs font-bold text-yellow-300 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-yellow-400" />
                          <span>3. Cung Tài Bạch (Tiền Của)</span>
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {triadData.tai}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-start gap-2.5">
                      <Sparkle className="w-4 h-4 text-amber-300 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-purple-200 leading-relaxed">
                        {triadData.advice}
                      </p>
                    </div>
                  </div>
                )}

                {/* NỘI DUNG CHUYÊN ĐỀ 3: HÓA GIẢI HUNG TINH & CẢI MỆNH */}
                {deepDiveTopic === 'remedy' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-orange-400" />
                        <span>Hóa Hung Vi Cát & Kích Hoạt Vận Khí Cho Mệnh {profileSummary.menhNguHanh}</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Đức năng thắng số: Bí quyết dùng ngũ hành bản mệnh và tâm thức để chế ngự sát tinh.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {remediesList.map((item, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border ${item.color} space-y-1.5 shadow`}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{item.type}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950 border border-current font-bold uppercase tracking-wider">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* NỘI DUNG CHUYÊN ĐỀ 4: HỎI THẦY BÓI TRỰC TIẾP */}
                {deepDiveTopic === 'qa' && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-amber-400/30 space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <h4 className="font-mystic font-bold text-base text-amber-300 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-purple-400" />
                        <span>Hỏi Thầy Bói Giang Hồ Về Lá Số Này</span>
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Chọn một câu hỏi gợi ý nhanh hoặc tự nhập điều bạn đang băn khoăn nhất:
                      </p>
                    </div>

                    {/* Câu hỏi gợi ý nhanh */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Năm nay tôi có nên chuyển việc hay khởi sự kinh doanh không?",
                        "Tài chính hậu vận của tôi có dư dả đất đai điền sản không?",
                        "Tình duyên, hôn nhân của tôi khi nào thuận buồm xuôi gió?",
                        "Sức khỏe và đi lại trong 1-2 năm tới cần lưu ý gì?"
                      ].map((promptQ, qIdx) => (
                        <button
                          key={qIdx}
                          onClick={() => {
                            setQaInput(promptQ);
                            handleAskQuestion(promptQ);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-400/50 text-xs text-slate-300 hover:text-amber-300 transition text-left flex items-center gap-1.5"
                        >
                          <span className="text-amber-400 text-xs">💬</span>
                          <span>{promptQ}</span>
                        </button>
                      ))}
                    </div>

                    {/* Ô nhập câu hỏi riêng */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={qaInput}
                        onChange={(e) => setQaInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAskQuestion();
                          }
                        }}
                        placeholder="Nhập câu hỏi khác (ví dụ: Khi nào tôi mua được nhà? Có hợp đi xa xứ không?)..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-xs sm:text-sm text-slate-200 placeholder-slate-500 outline-none transition"
                      />
                      <button
                        onClick={() => handleAskQuestion()}
                        disabled={qaLoading || !qaInput.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition disabled:opacity-50 active:scale-95 shadow"
                      >
                        {qaLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Bấm quẻ...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Hỏi Thầy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Khung hiển thị câu trả lời của thầy bói */}
                    {qaAnswer && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-purple-950/40 border border-amber-400/40 space-y-2 mt-3 animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span>Thầy Bói Giang Hồ Chỉ Điểm:</span>
                          </span>
                          <button
                            onClick={() => speakVoice(qaAnswer, 'qa_response')}
                            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Nghe đọc</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                          {qaAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: XEM CÁI KHÁC (CHỈ TAY, TƯỚNG VẬN, KINH DỊCH, THẦN SỐ HỌC...) */}
            {nextActionTab === 'explore_others' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">
                    Bấm vào từng môn bên dưới để chuyển ngay sang xem đối chiếu vận mệnh:
                  </p>
                  <span className="text-xs text-amber-400 font-semibold hidden sm:inline">
                    ☯ Kết hợp Đa Môn Tướng Số
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Card 1: Xem Chỉ Tay */}
                  <div
                    onClick={() => onNavigateTab?.('facepalm', 'palm')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/60 transition group cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-2.5 group-hover:scale-110 transition">
                        <Hand className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-amber-300 text-sm group-hover:text-amber-200">
                          Xem Chỉ Tay (Ba Đường Sinh Đạo)
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                          Camera AI
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Quét 3 đường Sinh Đạo, Trí Đạo, Tâm Đạo đối chiếu xem chỉ tay có khớp với lá số Tử Vi vừa lập không.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition gap-1">
                      <span>Soi Chỉ Tay Ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 2: Xem Tướng Mạo */}
                  <div
                    onClick={() => onNavigateTab?.('facepalm', 'face')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-400/60 transition group cursor-pointer shadow-lg hover:shadow-purple-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-2.5 group-hover:scale-110 transition">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-purple-300 text-sm group-hover:text-purple-200">
                          Xem Tướng Mạo & Tướng Vận
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                          Tam Đình
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Quét Tam Đình Ngũ Quan, xem cung Tài Bạch (mũi), cung Quan Lộc (trán) để nhận diện khí sắc vượng suy.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition gap-1">
                      <span>Soi Tướng Mạo Ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 3: Gieo Quẻ Kinh Dịch */}
                  <div
                    onClick={() => onNavigateTab?.('home')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-400/60 transition group cursor-pointer shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mb-2.5 group-hover:scale-110 transition">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-emerald-300 text-sm group-hover:text-emerald-200">
                          Gieo Quẻ Kinh Dịch (Hỏi Việc Gấp)
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                          64 Quẻ
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Đang phân vân việc làm ăn, hợp đồng hay tình cảm trong tháng? Gieo 3 đồng Càn Khôn xin quẻ biến giải đáp ngay.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition gap-1">
                      <span>Gieo Quẻ Hỏi Việc</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 4: La Bàn Bát Trạch */}
                  <div
                    onClick={() => onNavigateTab?.('compass')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-400/60 transition group cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 mb-2.5 group-hover:scale-110 transition">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-cyan-300 text-sm group-hover:text-cyan-200">
                          La Bàn Phong Thủy Bát Trạch
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                          360° Số Hóa
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Xoay la bàn định 4 hướng tốt (Sinh Khí, Thiên Y) để đặt bàn làm việc, giường ngủ hợp với cung phi đương số.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition gap-1">
                      <span>Mở La Bàn Phong Thủy</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 5: Thần Số Học Pythagoras */}
                  <div
                    onClick={() => onNavigateTab?.('numerology')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-400/60 transition group cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 mb-2.5 group-hover:scale-110 transition">
                        <Binary className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-indigo-300 text-sm group-hover:text-indigo-200">
                          Thần Số Học Pythagoras
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          Số Chủ Đạo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Tính Con Số Chủ Đạo, Con Số Linh Hồn và 4 Đỉnh Cao Kim Tự Tháp theo tên và ngày sinh Dương Lịch.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition gap-1">
                      <span>Xem Thần Số Học</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Card 6: Hợp Duyên Tình Cảm Bát Tự */}
                  <div
                    onClick={() => onNavigateTab?.('love_match')}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-400/60 transition group cursor-pointer shadow-lg hover:shadow-rose-500/10 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400 mb-2.5 group-hover:scale-110 transition">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-mystic font-bold text-rose-300 text-sm group-hover:text-rose-200">
                          Hợp Duyên Tình Cảm Bát Tự
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                          Chấm Điểm
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        Nhập ngày sinh 2 người để chấm điểm Ngũ Hành, Can Chi, Cung Phi và hóa giải xung khắc nhân duyên.
                      </p>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-rose-400 group-hover:translate-x-1 transition gap-1">
                      <span>Chấm Điểm Hợp Duyên</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
