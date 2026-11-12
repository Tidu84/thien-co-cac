import React, { useState, useRef, useEffect } from 'react';
import { useAppVoice } from '../contexts/VoiceContext';
import { CharacterMood, ChatMessage, NavTab } from '../types';
import { chatWithLinhNhi } from '../services/geminiService';
import { Character3D, FortuneTellerStyle } from './Character3D';
import {
  upsertUserDossier,
  getActiveDossierName,
  getActiveDossier
} from '../services/dossierService';
import {
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageSquareHeart,
  Loader2,
  ArrowRightCircle,
  Gift,
  Compass,
  Sparkle,
  CheckCircle,
  XCircle
} from 'lucide-react';

type GuidePersona = 'male' | 'female';

/** Chấp nhận các định dạng giới tính thường gặp trong hồ sơ cũ và mới. */
const normalizeDossierGender = (value: unknown): 'nam' | 'nu' | null => {
  if (value === null || value === undefined) return null;
  const gender = String(value).trim().toLocaleLowerCase('vi-VN');
  if (['nam', 'male', 'm', '1', 'trai'].includes(gender)) return 'nam';
  if (['nu', 'nữ', 'female', 'f', '0', '2', 'gai', 'gái'].includes(gender)) return 'nu';
  return null;
};

interface AnimeGuideProps {
  onQuickQuestion: (question: string) => void;
  onNavigateTab?: (tab: NavTab, subMode?: 'face' | 'palm' | 'body') => void;
}

export const AnimeGuide: React.FC<AnimeGuideProps> = ({ onQuickQuestion, onNavigateTab }) => {
  const { voiceEnabled, toggleVoice: toggleAppVoice, unlockAudio, speak, stopSpeaking } = useAppVoice();
  const [userGender, setUserGender] = useState<'nam' | 'nu'>(() => {
    try { return normalizeDossierGender(getActiveDossier()?.gender) ?? 'nam'; } catch { return 'nam'; }
  });
  const [manualPersona, setManualPersona] = useState<GuidePersona | null>(() => {
    try {
      const saved = localStorage.getItem('thien_co_cac_selected_persona');
      if (saved === 'male' || saved === 'female') return saved as GuidePersona;
      return null;
    } catch {
      return null;
    }
  });
  const guidePersona: GuidePersona = manualPersona ?? (userGender === 'nam' ? 'female' : 'male');
  const guideName = guidePersona === 'female' ? 'Nguyệt Cơ Tiên Nương' : 'Thiên Cơ Chân Nhân';
  const guideAddress = guidePersona === 'female'
    ? userGender === 'nam' ? 'tiên sinh' : userGender === 'nu' ? 'nữ thí chủ' : 'bạn hữu'
    : userGender === 'nam' ? 'thiện nam' : userGender === 'nu' ? 'nữ thí chủ' : 'bạn hữu';
  const [characterMood, setCharacterMood] = useState<CharacterMood>('happy');
  const [currentFortuneTellerStyle, setCurrentFortuneTellerStyle] = useState<FortuneTellerStyle>(() => {
    if (manualPersona === 'male') return 'manga_cool';
    if (manualPersona === 'female') return 'female_oracle';
    return userGender === 'nam' ? 'female_oracle' : 'manga_cool';
  });
  const activeCharacter = currentFortuneTellerStyle;

  useEffect(() => {
    console.log('[AnimeGuide] Current Gender:', userGender, 'Active Character:', activeCharacter);
  }, [userGender, guidePersona, activeCharacter]);
  // Nếu hồ sơ được nạp hoặc cập nhật sau khi AnimeGuide đã mở, đồng bộ lại giới tính.
  useEffect(() => {
    const syncGenderFromActiveDossier = () => {
      try {
        const activeDossier = getActiveDossier();
        const gender = normalizeDossierGender(activeDossier?.gender) ?? 'nam';
        setUserGender(gender);
        if (manualPersona === null) {
          setCurrentFortuneTellerStyle(gender === 'nam' ? 'female_oracle' : 'manga_cool');
        }
      } catch {
        setUserGender('nam');
        if (manualPersona === null) setCurrentFortuneTellerStyle('female_oracle');
      }
    };
    window.addEventListener('thien_co_cac_dossier_updated', syncGenderFromActiveDossier);
    return () => window.removeEventListener('thien_co_cac_dossier_updated', syncGenderFromActiveDossier);
  }, [manualPersona]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Trạng thái âm thanh & giọng nói
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false);
  const [hasIntroAppeared, setHasIntroAppeared] = useState(true);
  const [showIntroAudioPrompt, setShowIntroAudioPrompt] = useState(false);
  const voiceEnabledRef = useRef(voiceEnabled);
  const userHasInteractedRef = useRef(false);
  const introSpeechAttemptedRef = useRef(false);

  // Trạng thái quyết định của người dùng: null (chưa chọn) | 'yes' (chọn Có) | 'no' (chọn Không)
  const [userChoice, setUserChoice] = useState<'yes' | 'no' | null>(null);
  const [userName, setUserName] = useState<string>(() => {
    try {
      return getActiveDossierName() || localStorage.getItem('thien_co_cac_user_name') || '';
    } catch {
      return '';
    }
  });
  const [nameInput, setNameInput] = useState<string>('');

  // Lắng nghe thay đổi hồ sơ đang kích hoạt
  useEffect(() => {
    const handleActiveChange = (e: any) => {
      const newName = e.detail?.name || getActiveDossierName();
      if (newName) setUserName(newName);

      const activeDossier = e.detail?.dossier ?? getActiveDossier();
      const newGender = normalizeDossierGender(activeDossier?.gender) ?? 'nam';
      setUserGender(newGender);
      setManualPersona(null);
      setCurrentFortuneTellerStyle(newGender === 'nam' ? 'female_oracle' : 'manga_cool');
    };
    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    };
  }, []);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Lời mở đầu "hữu duyên" thay đổi theo nhân vật đang dẫn chuyện.
  const introForPersona = (persona: GuidePersona) => persona === 'female'
    ? 'Giờ này khắc này, giữa muôn vạn người lướt qua màn hình, duyên cớ nào đưa huynh bước vào đây? Tinh bàn vừa khẽ động, dường như có một điềm báo về vận số đang đón chờ huynh ở khúc quanh phía trước... Huynh có muốn cùng thiếp mở quẻ xem thử không?'
    : 'Không có cuộc hội ngộ nào là ngẫu nhiên cả. Kim đồng hồ điểm đúng khắc này nàng ghé bước, quẻ bài trên bàn đã sớm ứng nghiệm một chữ “Biến”. Nàng muốn tường tỏ sự chuyển biến này trong tình duyên hay tài lộc?';
  const initialIntroScript = introForPersona(guidePersona);

  const quickActions = [
    { label: 'Công danh & Tài lộc', icon: '🪙', tab: 'tuvi' as NavTab },
    { label: 'Tình duyên & Hợp khắc', icon: '💞', tab: 'love_match' as NavTab },
    { label: 'Vận hạn sắp tới', icon: '☯', tab: 'iching' as NavTab },
  ];
  const handleQuickAction = (tab: NavTab) => {
    if (tab === 'iching') {
      onQuickQuestion('Tôi muốn xem vận hạn sắp tới, công việc, tài lộc và điều cần lưu ý trong thời gian gần đây.');
      window.setTimeout(() => document.getElementById('iching-divination')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
      return;
    }
    onNavigateTab?.(tab);
  };

  // Khung chat ban đầu
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'linhnhi',
      text: initialIntroScript,
      timestamp: 'Vừa xong'
    }
  ]);

  // Phát lời thoại qua bộ quản lý giọng đọc dùng chung toàn ứng dụng.
  const speakText = (text: string, speaker?: GuidePersona) => {
    const currentSpeaker: GuidePersona = speaker || manualPersona || guidePersona;
    const cleanVoiceText = text
      .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
      .replace(/\d+\./g, 'Thứ ')
      .replace(/\s+/g, ' ')
      .trim();

    const isOpeningGreeting = text === introForPersona(currentSpeaker);
    if (isOpeningGreeting) introSpeechAttemptedRef.current = true;

    return speak(cleanVoiceText, {
      lang: 'vi-VN',
      tone: characterMood === 'happy' || characterMood === 'divine' ? 'lively' : 'mystic',
      voiceGender: currentSpeaker,
      gender: currentSpeaker,
      force: true,
      onStart: () => {
        setIsSpeaking(true);
        setHasStartedSpeaking(true);
      },
      onEnd: () => setIsSpeaking(false),
      onStop: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        if (isOpeningGreeting && voiceEnabledRef.current) setShowIntroAudioPrompt(true);
      }
    });
  };

  const speakTextRef = useRef(speakText);
  speakTextRef.current = speakText;
  const introScriptRef = useRef(initialIntroScript);
  introScriptRef.current = initialIntroScript;

  // TỰ ĐỘNG PHÁT TIẾNG NÓI CỦA NHÂN VẬT KHI MỞ ỨNG DỤNG (HOẶC KHI CHẠM MÀN HÌNH LẦN ĐẦU)
  useEffect(() => {
    let hasPlayed = false;

    const playIntroGreeting = () => {
      if (hasPlayed || introSpeechAttemptedRef.current) return;
      hasPlayed = true;
      unlockAudio();
      speakTextRef.current(introScriptRef.current);
    };

    // Thử phát ngay sau 400ms khi mở ứng dụng
    const timer = setTimeout(() => {
      playIntroGreeting();
    }, 400);

    // Xử lý chính sách Autoplay của trình duyệt/di động: phát ngay khi chạm/click lần đầu
    const onFirstUserAction = () => {
      playIntroGreeting();
      ['pointerdown', 'touchstart', 'click'].forEach(ev => {
        window.removeEventListener(ev, onFirstUserAction, true);
      });
    };

    ['pointerdown', 'touchstart', 'click'].forEach(ev => {
      window.addEventListener(ev, onFirstUserAction, { once: true, capture: true, passive: true });
    });

    return () => {
      clearTimeout(timer);
      ['pointerdown', 'touchstart', 'click'].forEach(ev => {
        window.removeEventListener(ev, onFirstUserAction, true);
      });
    };
  }, [unlockAudio]);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  useEffect(() => {
    setMessages(prev => prev.map(message => message.id === 'init-1'
      ? { ...message, text: initialIntroScript }
      : message));
  }, [initialIntroScript]);

  // Cuộn chat tự động
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, hasIntroAppeared]);

  // KHI NGƯỜI DÙNG BẤM "NHỜ TIÊN SINH CHỈ ĐIỂM" -> HỎI DANH TÍNH TRƯỚC
  const handleSelectYes = () => {
    setUserChoice('yes');

    const userText = guidePersona === 'female'
      ? 'Quả thực có điều trăn trở, nhờ tiên nương chỉ điểm giúp!'
      : 'Quả thực có điều trăn trở, nhờ tiên sinh chỉ điểm giúp!';
    const teacherReply = guidePersona === 'female'
      ? `Thiên cơ huyền vi, trước khi bấm quẻ, xin hỏi quý danh hoặc pháp danh của ${guideAddress} để ta tiện xưng hô?`
      : `Thiên cơ huyền vi, trước khi bấm quẻ, xin hỏi quý danh hoặc pháp danh của ${guideAddress} để bần đạo tiện xưng hô?`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'linhnhi',
      text: teacherReply,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, replyMsg]);
    speakText(teacherReply);
  };

  // KHI NGƯỜI DÙNG NHẬP XONG TÊN
  const handleConfirmName = (nameToSet?: string) => {
    const finalName = (nameToSet || nameInput).trim() || 'Hữu Duyên Khách';
    setUserName(finalName);
    try {
      localStorage.setItem('thien_co_cac_user_name', finalName);
    } catch (e) {
      console.warn("Could not save user name:", e);
    }
    // LƯU NGAY VÀO HỒ SƠ ĐƯƠNG SỐ (CẬP NHẬT TẤT CẢ DANH SÁCH & TAB)
    upsertUserDossier({ fullName: finalName });

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Tôi tên là ${finalName}.`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const teacherReply = guidePersona === 'female'
      ? `Chào ${finalName}! Thiếp có thể cùng ${guideAddress} xem về phương diện nào trước: Tử Vi vận số, Chỉ Tay hay Tướng Mạo?`
      : `Chào ${finalName}! Hôm nay bần đạo có thể giúp ${guideAddress} xem về phương diện nào trước: Tử Vi vận số, Chỉ Tay hay Tướng Mạo?`;

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'linhnhi',
      text: teacherReply,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, replyMsg]);
    speakText(teacherReply);
  };

  // KHI NGƯỜI DÙNG BẤM "TIỆN ĐƯỜNG DẠO CHƠI"
  const handleSelectNo = () => {
    setUserChoice('no');

    const userText = "Tôi chỉ tiện đường ghé qua dạo chơi thôi!";
    const teacherReply = guidePersona === 'female'
      ? `Haha, vạn sự tùy duyên! ${guideAddress} cứ thong thả dạo bước ngắm cảnh Thiên Cơ Các. Khi nào tâm động, cứ cất tiếng gọi ta.`
      : `Haha, vạn sự tùy duyên! ${guideAddress} cứ thong thả dạo bước ngắm cảnh Thiên Cơ Các. Khi nào tâm động, cứ cất tiếng hỏi ta.`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'linhnhi',
      text: teacherReply,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, replyMsg]);
    speakText(teacherReply);
  };

  // Người dùng phân vân -> Hướng dẫn gieo quẻ Kinh Dịch
  const handleDecideIChing = () => {
    const userText = "Tôi chưa chọn được, gieo quẻ xem trước cát hung cho tôi!";
    const replyText = "Được lắm! Lòng thành ắt ứng. Hãy tập trung tâm niệm và bấm gieo quẻ ở ngay bên dưới để xem điềm lành dữ sắp tới nào!";

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const replyMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'linhnhi',
      text: replyText,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: {
        label: "🪙 Chạm vào 3 đồng xu gieo quẻ ngay",
        targetTab: 'home'
      }
    };

    setMessages(prev => [...prev, userMsg, replyMsg]);
    speakText(replyText);
    onQuickQuestion("Xem trước cát hung sắp tới");

    setTimeout(() => {
      window.scrollBy({ top: 460, behavior: 'smooth' });
    }, 600);
  };

  // Gửi tin nhắn qua Gemini
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const lower = text.toLowerCase();
    if (userChoice === null && (lower.includes("có") || lower.includes("muốn") || lower.includes("xem") || lower.includes("được") || lower.includes("ok"))) {
      setInputText('');
      handleSelectYes();
      return;
    }
    if (userChoice === null && (lower.includes("không") || lower.includes("thôi") || lower.includes("chưa") || lower.includes("no"))) {
      setInputText('');
      handleSelectNo();
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      text: m.text
    }));

    const response = await chatWithLinhNhi(history, text, guidePersona, userGender ?? undefined);

    setCharacterMood(response.mood);

    let actionObj: ChatMessage['suggestedAction'] = undefined;
    if (response.suggestedTab) {
      const labels: Record<string, string> = {
        iching: "🪙 Đến Gieo Quẻ Kinh Dịch",
        tuvi: "📜 An Sao Lá Số Tử Vi",
        compass: "🧭 Mở La Bàn Bát Trạch",
        numerology: "🔢 Tra Cứu Thần Số Học",
        love_match: "❤️ Chấm Điểm Tình Duyên",
        facepalm: "👁️ Soi Tướng Mặt & Chỉ Tay",
        western: "🃏 Rút Bài Tarot"
      };
      actionObj = {
        label: labels[response.suggestedTab] || "Khám Phá Vận Mệnh",
        targetTab: response.suggestedTab === 'iching' ? 'home' : (response.suggestedTab as NavTab)
      };
    }

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'linhnhi',
      text: response.reply,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: actionObj
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);

    if (voiceEnabled) {
      speakText(response.reply);
    }
  };

  const toggleVoiceHandler = () => {
    const enabled = toggleAppVoice();
    if (enabled) {
      unlockAudio();
      setHasIntroAppeared(true);
      setShowIntroAudioPrompt(false);
      speakText(initialIntroScript);
    } else {
      setIsSpeaking(false);
    }
  };

  const switchGuidePersona = () => {
    const nextPersona: GuidePersona = guidePersona === 'female' ? 'male' : 'female';
    setManualPersona(nextPersona);
    setCurrentFortuneTellerStyle(nextPersona === 'female' ? 'female_oracle' : 'manga_cool');
    setHasIntroAppeared(true);
    setShowIntroAudioPrompt(false);
    if (voiceEnabled) {
      unlockAudio();
      speakText(introForPersona(nextPersona), nextPersona);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-purple-950/40 to-slate-950 border-2 border-amber-400/50 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
      {/* 1. LỚP SƯƠNG KHÓI HUYỀN HUYỄN BACKGROUND (CHUYỂN ĐỘNG TRÔI LƯỢN MƯỢT MÀ, KHÔNG NHẤP NHÁY) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Làn sương khói tím huyền ảo trôi chậm góc trên */}
        <div className="absolute -top-24 -left-24 w-[480px] h-[380px] bg-purple-600/15 rounded-full blur-[110px] fog-anim-1" />

        {/* Làn khói vàng kim tiên khí tỏa ra góc phải */}
        <div className="absolute top-10 -right-20 w-[420px] h-[360px] bg-amber-500/12 rounded-full blur-[100px] fog-anim-2" />

        {/* Lớp sương mù lam ngọc lượn sóng cuộn trôi dưới đáy */}
        <div className="absolute -bottom-16 inset-x-0 h-48 bg-gradient-to-t from-cyan-900/25 via-indigo-950/20 to-transparent blur-2xl fog-anim-1" />

        {/* Các dải khói mờ mờ trôi dạt ngang qua sân khấu */}
        <div className="absolute top-1/3 -left-32 w-[650px] h-28 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent rotate-6 blur-3xl fog-anim-2" />
        <div className="absolute bottom-1/4 -right-32 w-[650px] h-28 bg-gradient-to-l from-transparent via-purple-400/10 to-transparent -rotate-6 blur-3xl fog-anim-1" />
      </div>

      {/* TOP HEADER: CHỌN THẦY BÓI & BẬT/TẮT GIỌNG ĐỌC GỌN GÀNG TRÊN 1 DÒNG */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              unlockAudio();
              setHasIntroAppeared(true);
              speakText(userChoice === 'yes' ? messages[messages.length - 1]?.text : initialIntroScript);
            }}
            className="flex items-center gap-2 group text-left cursor-pointer active:scale-95 transition"
            title="Chạm để nghe lời dẫn"
          >
            <span className="text-lg">☯</span>
            <h2 className="font-mystic text-base sm:text-lg font-bold text-amber-300">
              {guideName}
            </h2>
          </button>

          {/* Chuyển đổi nhanh 1 Nam / 1 Nữ gọn nhẹ */}
          <div className="flex items-center bg-slate-950/90 p-0.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                unlockAudio();
                setManualPersona('male');
                try { localStorage.setItem('thien_co_cac_selected_persona', 'male'); } catch {}
                setCurrentFortuneTellerStyle('manga_cool');
                setHasIntroAppeared(true);
                speakText("Thiên Cơ Chân Nhân ta đây! Có điều gì trăn trở cứ việc cất lời.", 'male');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                guidePersona === 'male' || currentFortuneTellerStyle === 'manga_cool'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👨 Chân Nhân
            </button>

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                unlockAudio();
                setManualPersona('female');
                try { localStorage.setItem('thien_co_cac_selected_persona', 'female'); } catch {}
                setCurrentFortuneTellerStyle('female_oracle');
                setHasIntroAppeared(true);
                speakText(introForPersona('female'), 'female');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition whitespace-nowrap ${
                guidePersona === 'female' && currentFortuneTellerStyle === 'female_oracle'
                  ? 'bg-fuchsia-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              👩 Tiên Nương
            </button>
          </div>
        </div>

        {/* Nút Bật/Tắt Giọng & Làm mới */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleVoiceHandler}
            aria-label={voiceEnabled ? 'Tắt giọng đọc' : 'Bật giọng đọc'}
            aria-pressed={voiceEnabled}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
              voiceEnabled
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{voiceEnabled ? 'Giọng: BẬT' : 'Giọng: TẮT'}</span>
          </button>

          <button
            onClick={() => {
              setUserChoice(null);
              setHasIntroAppeared(false);
              setMessages([messages[0]]);
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
            title="Hỏi lại từ đầu"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN STAGE: MÔ HÌNH THẦY BÓI & KHUNG ĐỐI THOẠI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch relative z-10">

        {/* CỘT TRÁI: NHÂN VẬT THẦY BÓI */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-950/75 border border-slate-800/90 rounded-2xl p-3 relative overflow-visible">
          <div className="w-full flex-1 flex items-center justify-center relative">
            <Character3D
              isSpeaking={isSpeaking}
              mood={characterMood}
              userChoice={userChoice}
              currentStyle={currentFortuneTellerStyle}
              characterName={guideName}
              personaGender={guidePersona}
              onStyleChange={(st) => setCurrentFortuneTellerStyle(st)}
              onSelectYes={handleSelectYes}
              onSelectNo={handleSelectNo}
              onCharacterClick={() => {
                unlockAudio();
                setHasIntroAppeared(true);
                speakText(userChoice === 'yes' ? messages[messages.length - 1]?.text : initialIntroScript);
              }}
            />
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG ĐỐI THOẠI & LỰA CHỌN CÁC MÔN XEM */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/65 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-4">

          {/* Lịch sử trò chuyện */}
          <div
            ref={chatScrollRef}
            className="flex-1 mb-2.5 space-y-2.5 max-h-[250px] sm:max-h-[270px] overflow-y-auto pr-1"
          >
            {!hasIntroAppeared && messages.length <= 1 && (
              <div
                onClick={() => {
                  unlockAudio();
                  setHasIntroAppeared(true);
                  speakText(initialIntroScript);
                }}
                className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-dashed border-slate-800 hover:border-amber-400/40 bg-slate-900/30 cursor-pointer transition group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">☯</span>
                <p className="text-xs sm:text-sm font-semibold text-amber-300">
                  Chạm vào hình {guideName} để bắt đầu trò chuyện
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Hoặc nhập trực tiếp điều bạn đang trăn trở vào ô bên dưới
                </p>
              </div>
            )}
            {messages.filter(msg => msg.id !== 'init-1' || hasIntroAppeared).map((msg) => {
              const isLinhNhi = msg.sender === 'linhnhi';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isLinhNhi ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm shadow-lg leading-relaxed backdrop-blur-md ${
                    isLinhNhi
                      ? 'bg-slate-900/65 border border-amber-400/35 text-slate-100 rounded-tl-sm shadow-purple-950/40'
                      : 'bg-gradient-to-r from-purple-800/80 to-indigo-700/80 border border-purple-400/30 text-white rounded-tr-sm shadow-indigo-950/40'
                  }`}>
                    <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-amber-300 font-semibold">
                      <span>{isLinhNhi ? `☯ ${guideName}` : '👤 Bạn'}</span>
                      {isLinhNhi && (
                        <button
                          onClick={() => { unlockAudio(); speakText(msg.text); }}
                          className="text-amber-400 hover:text-amber-200"
                          title="Nghe câu này"
                        >
                          <Volume2 className="w-3 h-3 inline" />
                        </button>
                      )}
                    </div>

                    <p className="whitespace-pre-line leading-relaxed">
                      {msg.text}
                    </p>

                    {msg.id === 'init-1' && hasIntroAppeared && userChoice === null && (
                      <div className="mt-3 flex flex-wrap gap-2" aria-label="Chọn chủ đề muốn xem">
                        {quickActions.map((action) => (
                          <button
                            key={action.tab}
                            type="button"
                            onClick={() => handleQuickAction(action.tab)}
                            className="min-h-10 rounded-full border border-amber-300/50 bg-gradient-to-r from-amber-400/10 via-purple-500/15 to-indigo-400/10 px-3 py-2 text-[11px] font-semibold text-amber-100 shadow-sm shadow-purple-950/40 transition hover:border-amber-200 hover:from-amber-400/20 hover:to-indigo-400/20 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                          >
                            <span aria-hidden="true" className="mr-1">{action.icon}</span>{action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {msg.suggestedAction && (
                      <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-end">
                        <button
                          onClick={() => {
                            if (msg.suggestedAction?.label.includes("Kinh Dịch") || msg.suggestedAction?.label.includes("gieo quẻ")) {
                              handleDecideIChing();
                            } else if (onNavigateTab) {
                              onNavigateTab(msg.suggestedAction!.targetTab);
                            }
                          }}
                          className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/50 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                        >
                          <span>{msg.suggestedAction.label}</span>
                          <ArrowRightCircle className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-amber-300/80 italic p-2 bg-slate-900/60 rounded-xl border border-slate-800 max-w-[180px]">
                <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Đang bấm quẻ...</span>
              </div>
            )}
          </div>

          {/* VÙNG LỰA CHỌN CỦA NGƯỜI DÙNG */}
          <div className="pt-2 border-t border-slate-800/80">
            {!hasIntroAppeared ? null : userChoice === null ? (
              <div className="space-y-2 mb-2 p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-300">
                  Bạn có muốn {guidePersona === 'female' ? 'tiên nương' : 'thầy bói'} chỉ điểm một quẻ không?
                </span>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleSelectYes}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow active:scale-95 transition"
                  >
                    Có, xem ngay
                  </button>
                  <button
                    onClick={handleSelectNo}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 active:scale-95 transition"
                  >
                    Không
                  </button>
                </div>
              </div>
            ) : userChoice === 'yes' ? (
              /* KHI CHỌN ĐỒNG Ý: NẾU CHƯA CÓ TÊN THÌ HỎI TÊN, NẾU CÓ RỒI THÌ CHỈ HIỆN 3 LỰA CHỌN CƠ BẢN */
              <div className="space-y-2 mb-2">
                {!userName ? (
                  /* BƯỚC 1: HỎI HỌ TÊN NGƯỜI DÙNG */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirmName();
                    }}
                    className="p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-amber-400/40 space-y-2 shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nhập quý danh của bạn:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Ví dụ: Nguyễn Văn An, Thùy Linh..."
                        autoFocus
                        className="flex-1 bg-slate-950/80 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold rounded-xl shadow active:scale-95 transition whitespace-nowrap"
                      >
                        Xác nhận
                      </button>
                    </div>
                  </form>
                ) : (
                  /* BƯỚC 2: CHỈ CHO CHỌN 3 MỤC CƠ BẢN (TỬ VI, CHỈ TAY, TƯỚNG MẠO) */
                  <div className="p-3 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-amber-400/30 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>Chọn phương pháp luận đoán:</span>
                      <button
                        onClick={() => {
                          setUserName('');
                          setNameInput('');
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 underline font-normal"
                      >
                        Đổi tên ({userName})
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {/* LỰA CHỌN 1: XEM TỬ VI */}
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('tuvi')}
                        className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-400 text-center transition flex flex-col items-center justify-center gap-1 group shadow active:scale-95"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">📜</span>
                        <span className="text-xs font-bold text-amber-300">Xem Tử Vi</span>
                        <span className="text-[10px] text-slate-400">Vận số cả đời</span>
                      </button>

                      {/* LỰA CHỌN 2: XEM CHỈ TAY */}
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('facepalm', 'palm')}
                        className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-center transition flex flex-col items-center justify-center gap-1 group shadow active:scale-95"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">✋</span>
                        <span className="text-xs font-bold text-cyan-300">Xem Chỉ Tay</span>
                        <span className="text-[10px] text-slate-400">Đường chỉ vận mệnh</span>
                      </button>

                      {/* LỰA CHỌN 3: XEM TƯỚNG MẠO */}
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('facepalm', 'face')}
                        className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-400 text-center transition flex flex-col items-center justify-center gap-1 group shadow active:scale-95"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">👁️</span>
                        <span className="text-xs font-bold text-purple-300">Xem Tướng Mạo</span>
                        <span className="text-[10px] text-slate-400">Khuôn mặt & Khí sắc</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* KHI CHỌN KHÔNG: HIỆN LỜI NHẮC VÀ NÚT ĐỔI Ý */
              <div className="mb-2 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-300">
                  Bạn có thể thoải mái khám phá các công cụ ở thanh trên, hoặc đổi ý để xem bói bất cứ lúc nào!
                </span>
                <button
                  onClick={handleSelectYes}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 whitespace-nowrap active:scale-95 transition shadow"
                >
                  Đổi ý, xem giúp tôi!
                </button>
              </div>
            )}

            {/* Input trò chuyện */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 mt-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập câu trả lời hoặc điều bạn muốn hỏi..."
                disabled={isTyping}
                className="flex-1 bg-slate-950 border border-amber-500/30 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="px-4 py-2 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center gap-1 active:scale-95 transition disabled:opacity-50"
              >
                <span>Gửi</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

