import React, { useState, useRef, useEffect } from 'react';
import { CharacterMood, ChatMessage, NavTab } from '../types';
import { chatWithLinhNhi } from '../services/geminiService';
import { Character3D, FortuneTellerStyle } from './Character3D';
import { 
  upsertUserDossier, 
  getActiveDossierName, 
  setActiveDossierName 
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

interface AnimeGuideProps {
  onQuickQuestion: (question: string) => void;
  onNavigateTab?: (tab: NavTab) => void;
}

export const AnimeGuide: React.FC<AnimeGuideProps> = ({ onQuickQuestion, onNavigateTab }) => {
  const [characterMood, setCharacterMood] = useState<CharacterMood>('happy');
  const [currentFortuneTellerStyle, setCurrentFortuneTellerStyle] = useState<FortuneTellerStyle>('manga_cool');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Trạng thái âm thanh & giọng nói
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);

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
      if (newName) {
        setUserName(newName);
      }
    };
    window.addEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    return () => {
      window.removeEventListener('thien_co_cac_active_name_changed', handleActiveChange);
    };
  }, []);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const hasAutoSpokenRef = useRef(false);

  // Câu khẩu quyết mở màn tự giới thiệu bản thân đầy khí chất:
  const initialIntroScript = "Bần đạo là Thiên Cơ Chân Nhân. Hữu duyên tương ngộ nơi Thiên Cơ Các! Nhìn thần sắc người hôm nay... dường như trong lòng đang có điều trăn trở chưa tỏ?";

  // Khung chat ban đầu
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'linhnhi',
      text: "Bần đạo là Thiên Cơ Chân Nhân. Hữu duyên tương ngộ nơi Thiên Cơ Các! Nhìn thần sắc người hôm nay... dường như trong lòng đang có điều trăn trở chưa tỏ?",
      timestamp: 'Vừa xong'
    }
  ]);

  // Bộ phát âm giọng nói thầy bói tối ưu
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      
      const cleanVoiceText = text
        .replace(/[*#_~🪙📜👁️🃏🔮✨☯👤🌸👉❓\n]/g, ' ')
        .replace(/\d+\./g, 'Thứ ')
        .replace(/\s+/g, ' ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      const voices = window.speechSynthesis.getVoices();
      const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.lang.toLowerCase().includes('vie'));
      if (viVoice) {
        utterance.voice = viVoice;
      }
      
      utterance.lang = 'vi-VN';
      utterance.rate = 1.0;
      utterance.pitch = 1.15;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasStartedSpeaking(true);
        setShowAutoplayPrompt(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        console.warn("Speech error:", e);
        setIsSpeaking(false);
        if (!hasStartedSpeaking) {
          setShowAutoplayPrompt(true);
        }
      };

      window.speechSynthesis.speak(utterance);
      hasAutoSpokenRef.current = true;
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsSpeaking(false);
      setShowAutoplayPrompt(true);
    }
  };

  // TỰ ĐỘNG PHÁT TIẾNG NÓI NGAY KHI MỞ APP (TỰ MỞ GIỌNG KHÔNG CẦN BẤM LOA)
  useEffect(() => {
    let hasSpoken = false;

    const playIntroSpeech = () => {
      if (hasSpoken) return;
      hasSpoken = true;
      hasAutoSpokenRef.current = true;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
      speakText(initialIntroScript);
      setShowAutoplayPrompt(false);
    };

    // 1. Thử gọi phát ngay khi nạp trang
    const timer1 = setTimeout(() => {
      if (!hasSpoken && 'speechSynthesis' in window) {
        playIntroSpeech();
      }
    }, 250);

    // 2. Tự động phát ngay khi người dùng chạm bất kỳ đâu hoặc bấm phím (không cần bấm vào nút loa)
    const unlockEvents = ['pointerdown', 'mousedown', 'touchstart', 'keydown', 'wheel'];
    const handleFirstGesture = () => {
      if (!hasSpoken) {
        playIntroSpeech();
      }
      unlockEvents.forEach(evt => window.removeEventListener(evt, handleFirstGesture));
    };

    unlockEvents.forEach(evt => {
      window.addEventListener(evt, handleFirstGesture, { once: true, capture: true });
    });

    // 3. Khi trình duyệt nạp xong bộ giọng nói tiếng Việt
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        if (!hasSpoken) {
          playIntroSpeech();
        }
      };
    }

    return () => {
      clearTimeout(timer1);
      unlockEvents.forEach(evt => window.removeEventListener(evt, handleFirstGesture));
    };
  }, []);

  // Cuộn chat tự động
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // KHI NGƯỜI DÙNG BẤM "NHỜ TIÊN SINH CHỈ ĐIỂM" -> HỎI DANH TÍNH TRƯỚC
  const handleSelectYes = () => {
    setUserChoice('yes');

    const userText = "Quả thực có điều trăn trở, nhờ tiên sinh chỉ điểm giúp!";
    const teacherReply = "Thiên cơ huyền vi, trước khi bấm quẻ, xin hỏi quý danh hoặc pháp danh của bạn hữu là gì để ta tiện xưng hô?";

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

    const teacherReply = `Chào ${finalName}! Hôm nay bạn muốn ta xem về phương diện nào trước: Xem Tử Vi vận số, Xem Chỉ Tay hay Xem Tướng Mạo?`;

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
    const teacherReply = "Haha, vạn sự tùy duyên! Người cứ thong thả dạo bước ngắm cảnh Thiên Cơ Các. Khi nào tâm động hay có điều cần vấn, cứ việc cất tiếng hỏi ta.";

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

    const response = await chatWithLinhNhi(history, text);

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

  const toggleVoice = () => {
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    if (nextState) {
      speakText(initialIntroScript);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
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

      {/* BANNER NHẮC CHẠM BẬT TIẾNG NẾU TRÌNH DUYỆT CHẶN AUTOPLAY */}
      {showAutoplayPrompt && !isSpeaking && (
        <div 
          onClick={() => {
            speakText(initialIntroScript);
            setShowAutoplayPrompt(false);
          }}
          className="mb-4 p-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-2xl cursor-pointer shadow-lg shadow-amber-500/40 flex items-center justify-between gap-3 animate-pulse"
        >
          <div className="flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-slate-950 animate-bounce" />
            <p className="font-bold text-xs sm:text-sm">
              🌸 Chạm vào đây để Thầy Bói cất tiếng tự giới thiệu và đàm đạo cùng bạn!
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-950 text-amber-300 rounded-xl text-xs font-bold whitespace-nowrap shadow">
            Bật Tiếng Ngay
          </span>
        </div>
      )}

      {/* TOP HEADER: TIÊU ĐỀ BẤM PHÁT ÂM & LỰA CHỌN THẦY BÓI KHÁC NGAY TRÊN CÙNG DÒNG */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-500/30">
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút tiêu đề có thể click để nhân vật lập tức cất tiếng nói */}
          <button 
            onClick={() => speakText(userChoice === 'yes' ? messages[messages.length - 1]?.text : initialIntroScript)}
            className="flex items-center gap-2 group text-left cursor-pointer active:scale-95 transition"
            title="Chạm vào đây để Thầy Bói cất tiếng nói chuyện!"
          >
            <span className="text-xl group-hover:rotate-180 transition-transform duration-700">☯</span>
            <h2 className="font-mystic text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 group-hover:from-yellow-200 group-hover:to-amber-300 underline decoration-amber-400/30 underline-offset-4">
              Thầy Bói Giang Hồ
            </h2>
            <Volume2 className={`w-4 h-4 text-amber-400 ${isSpeaking ? 'animate-bounce' : 'opacity-80 group-hover:opacity-100'}`} />
          </button>

          {/* CÁC LỰA CHỌN THẦY BÓI KHÁC NGAY TRÊN CÙNG DÒNG */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 border-l border-amber-500/40 pl-3">
            <span className="text-[11px] font-bold text-amber-300/80 hidden sm:inline flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Đổi thầy:</span>
            </span>

            <button
              onClick={() => {
                setCurrentFortuneTellerStyle('manga_cool');
                speakText("Thiên Cơ Chân Nhân ta đây! Có điều gì trăn trở cứ việc cất lời.");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
                currentFortuneTellerStyle === 'manga_cool'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border-white shadow-md shadow-amber-500/40'
                  : 'bg-slate-900 text-amber-400 border-amber-500/30 hover:text-white'
              }`}
            >
              <span>🕶️ Manga Ngầu</span>
            </button>

            <button
              onClick={() => {
                setCurrentFortuneTellerStyle('hooded_green');
                speakText("Ta là nữ tiên tri áo choàng xanh. Linh khí đang vây quanh ta.");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
                currentFortuneTellerStyle === 'hooded_green'
                  ? 'bg-emerald-600 text-white border-amber-300 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🟢 Áo Choàng Xanh</span>
            </button>

            <button
              onClick={() => {
                setCurrentFortuneTellerStyle('turban_tarot');
                speakText("Lá bài Tarot sẽ chỉ lối cho vận mệnh tương lai của bạn.");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
                currentFortuneTellerStyle === 'turban_tarot'
                  ? 'bg-purple-600 text-white border-amber-300 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🟣 Turban & Tarot</span>
            </button>

            <button
              onClick={() => {
                setCurrentFortuneTellerStyle('crystal_maiden');
                speakText("Cầu pha lê sẽ phản chiếu những điều chưa tỏ trong tâm can.");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
                currentFortuneTellerStyle === 'crystal_maiden'
                  ? 'bg-cyan-600 text-white border-amber-300 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🔮 Cầu Pha Lê</span>
            </button>

            <button
              onClick={() => {
                setCurrentFortuneTellerStyle('crimson_sorceress');
                speakText("Hồng Y Nữ Vu bấm quẻ càn khôn, định đoạt cát hung!");
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition whitespace-nowrap flex items-center gap-1 ${
                currentFortuneTellerStyle === 'crimson_sorceress'
                  ? 'bg-red-700 text-white border-amber-300 shadow-md'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <span>🔴 Hồng Y</span>
            </button>
          </div>
        </div>

        {/* NÚT TRẠNG THÁI NÓI CHUYỆN */}
        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang cất tiếng nói...</span>
            </span>
          ) : (
            <span className="text-[11px] text-amber-400/70 hidden sm:inline italic">
              (Bấm vào tiêu đề để nghe nói)
            </span>
          )}
        </div>
      </div>

      {/* MAIN TWO-COLUMN STAGE: MÔ HÌNH THẦY BÓI & KHUNG ĐỐI THOẠI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        
        {/* CỘT TRÁI: NHÂN VẬT THẦY BÓI TRUYỆN TRANH (CÓ 2 Ô CÓ/KHÔNG GẮN NGAY BÊN CẠNH) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-between bg-slate-950/90 border border-purple-500/40 rounded-3xl p-3 shadow-xl relative overflow-visible group">
          <div className="w-full flex items-center justify-between px-2 pb-2 border-b border-slate-800 z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-mystic font-bold text-amber-300 text-xs tracking-wide">
                {currentFortuneTellerStyle === 'manga_cool' 
                  ? 'Thiên Cơ Chân Nhân' 
                  : currentFortuneTellerStyle === 'hooded_green'
                  ? 'Nữ Tiên Tri Áo Xanh'
                  : currentFortuneTellerStyle === 'turban_tarot'
                  ? 'Bà Bói Turban Tarot'
                  : currentFortuneTellerStyle === 'crystal_maiden'
                  ? 'Tiên Nữ Cầu Pha Lê'
                  : 'Hồng Y Nữ Vu'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-900/80 text-amber-200 border-amber-500/50">
              {isSpeaking ? 'Đang Đàm Đạo' : 'Trực Tuyến'}
            </span>
          </div>

          {/* Component Thầy Bói Truyện Tranh Khẩu Hình Đồng Bộ & 2 Ô CÓ/KHÔNG NGAY BÊN CẠNH */}
          <div className="w-full flex-1 flex items-center justify-center relative my-1">
            <Character3D
              isSpeaking={isSpeaking}
              mood={characterMood}
              userChoice={userChoice}
              currentStyle={currentFortuneTellerStyle}
              onStyleChange={(st) => setCurrentFortuneTellerStyle(st)}
              onSelectYes={handleSelectYes}
              onSelectNo={handleSelectNo}
              onCharacterClick={() => speakText(userChoice === 'yes' ? messages[messages.length - 1]?.text : initialIntroScript)}
            />
          </div>

          {/* Điều khiển âm thanh giọng nói */}
          <div className="w-full flex items-center justify-between px-2 pt-2 border-t border-slate-800 gap-2 z-10 text-xs">
            <span className="text-slate-400 text-[11px]">Chạm nhân vật để nghe nói</span>
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                voiceEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60' 
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{voiceEnabled ? 'Giọng: BẬT' : 'Giọng: TẮT'}</span>
            </button>
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG ĐỐI THOẠI & LỰA CHỌN CÁC MÔN XEM (NỀN XUYÊN THẤU GLASSMORPHISM ĐẲNG CẤP) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/60 backdrop-blur-xl border border-amber-400/40 rounded-3xl p-4 shadow-2xl shadow-purple-950/50">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/20">
            <div className="flex items-center gap-2">
              <MessageSquareHeart className="w-4 h-4 text-amber-400" />
              <h3 className="font-mystic text-sm font-bold text-amber-300">
                Trò Chuyện Cùng Thầy Bói
              </h3>
            </div>
            
            <button
              onClick={() => {
                setUserChoice(null);
                setMessages([messages[0]]);
                speakText(initialIntroScript);
              }}
              className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition"
              title="Làm mới cuộc trò chuyện"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Hỏi lại từ đầu</span>
            </button>
          </div>

          {/* Lịch sử trò chuyện với nền tin nhắn xuyên thấu mờ ảo */}
          <div 
            ref={chatScrollRef}
            className="flex-1 my-2.5 space-y-2.5 max-h-[240px] sm:max-h-[260px] overflow-y-auto pr-1"
          >
            {messages.map((msg) => {
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
                      <span>{isLinhNhi ? '☯ Thầy Bói Giang Hồ' : '👤 Bạn'}</span>
                      {isLinhNhi && (
                        <button 
                          onClick={() => speakText(msg.text)} 
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
            {userChoice === null ? (
              /* KHI VỪA MỞ RA: NHẮC NGƯỜI DÙNG CHỌN NGAY BÊN CẠNH NHÂN VẬT THẦY BÓI */
              <div className="space-y-2 mb-2 p-3 bg-gradient-to-r from-amber-500/10 via-purple-900/20 to-amber-500/10 rounded-2xl border border-amber-400/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                  <span>Hãy chọn <strong>"CÓ"</strong> hoặc <strong>"KHÔNG"</strong> ngay bên cạnh thầy bói để bắt đầu!</span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handleSelectYes}
                    className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow active:scale-95 transition"
                  >
                    Có, xem ngay
                  </button>
                  <button
                    onClick={handleSelectNo}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-rose-500/40 active:scale-95 transition"
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
                        onClick={() => onNavigateTab && onNavigateTab('facepalm')}
                        className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-400 text-center transition flex flex-col items-center justify-center gap-1 group shadow active:scale-95"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">✋</span>
                        <span className="text-xs font-bold text-cyan-300">Xem Chỉ Tay</span>
                        <span className="text-[10px] text-slate-400">Đường chỉ vận mệnh</span>
                      </button>

                      {/* LỰA CHỌN 3: XEM TƯỚNG MẠO */}
                      <button
                        onClick={() => onNavigateTab && onNavigateTab('facepalm')}
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
