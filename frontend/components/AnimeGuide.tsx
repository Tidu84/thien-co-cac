import React, { useState, useRef, useEffect } from 'react';
import { CharacterMood, ChatMessage, NavTab } from '../types';
import { chatWithLinhNhi } from '../services/geminiService';
import { Character3D } from './Character3D';
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
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Trạng thái âm thanh & giọng nói
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasStartedSpeaking, setHasStartedSpeaking] = useState(false);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);

  // Trạng thái quyết định của người dùng: null (chưa chọn) | 'yes' (chọn Có) | 'no' (chọn Không)
  const [userChoice, setUserChoice] = useState<'yes' | 'no' | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const hasAutoSpokenRef = useRef(false);

  // Câu khẩu quyết mở màn đúng yêu cầu: hỏi có cần xem miễn phí không
  const initialIntroScript = "Ta là thầy bói giang hồ, có thể xem tướng đoán mệnh. Bạn có cần ta xem cho bạn một quẻ miễn phí không?";

  // Khung chat ban đầu
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'linhnhi',
      text: "Ta là thầy bói giang hồ, có thể xem tướng đoán mệnh. Bạn có cần ta xem cho bạn một quẻ miễn phí không?",
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

  // TỰ ĐỘNG PHÁT TIẾNG NÓI NGAY KHI MỞ APP
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      speakText(initialIntroScript);
      
      // Nếu sau 1.2s trình duyệt chặn autoplay không có tương tác người dùng
      setTimeout(() => {
        if (!window.speechSynthesis.speaking && !hasStartedSpeaking) {
          setShowAutoplayPrompt(true);
        }
      }, 1200);
    }, 350);

    const triggerOnFirstInteraction = () => {
      if (!hasStartedSpeaking || !window.speechSynthesis.speaking) {
        speakText(initialIntroScript);
        setShowAutoplayPrompt(false);
      }
    };

    window.addEventListener('click', triggerOnFirstInteraction, { once: true });
    window.addEventListener('touchstart', triggerOnFirstInteraction, { once: true });
    window.addEventListener('keydown', triggerOnFirstInteraction, { once: true });
    window.addEventListener('pointerdown', triggerOnFirstInteraction, { once: true });

    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        if (!hasAutoSpokenRef.current) {
          speakText(initialIntroScript);
        }
      };
    }

    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('click', triggerOnFirstInteraction);
      window.removeEventListener('touchstart', triggerOnFirstInteraction);
      window.removeEventListener('keydown', triggerOnFirstInteraction);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Cuộn chat tự động
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // KHI NGƯỜI DÙNG BẤM "CÓ" (ĐỒNG Ý XEM BÓI)
  const handleSelectYes = () => {
    setUserChoice('yes');

    const userText = "Có, hãy xem giúp tôi một quẻ miễn phí!";
    const teacherReply = "Được thôi! Ta tinh thông Tử Vi Lý Số, La Bàn Bát Trạch, Thần Số Học, Chấm điểm tình duyên, Soi tướng mặt chỉ tay và Bài Tarot. Bạn muốn chọn đường nào? Nếu chưa chọn được, hãy gieo một quẻ Kinh Dịch trước để xem cát/hung sắp tới nhé!";

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
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: {
        label: "🪙 Gieo Quẻ Kinh Dịch Xem Cát / Hung",
        targetTab: 'home'
      }
    };

    setMessages(prev => [...prev, userMsg, replyMsg]);
    speakText(teacherReply);
  };

  // KHI NGƯỜI DÙNG BẤM "KHÔNG" (TỪ CHỐI XEM)
  const handleSelectNo = () => {
    setUserChoice('no');

    const userText = "Không, tôi chưa cần xem bây giờ!";
    const teacherReply = "Không sao cả! Vạn sự tùy duyên. Bạn hữu cứ thong dong dạo chơi ngắm cảnh Thiên Cơ Các. Khi nào trong lòng có điều trăn trở, cứ gọi tên ta nhé!";

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
      {/* Background Magic Nebulas */}
      <div className="absolute -top-16 -right-16 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

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

      {/* TOP HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 mb-4 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">☯</span>
          <h2 className="font-mystic text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500">
            Thầy Bói Giang Hồ • Quả Cầu Ma Thuật & Áo Choàng Bí Ẩn
          </h2>

          {isSpeaking && (
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Đang nói chuyện (Khẩu hình đồng bộ)...</span>
              <span className="flex items-end gap-0.5 h-3 ml-1">
                <span className="w-0.5 h-2 bg-emerald-400 animate-bounce" />
                <span className="w-0.5 h-3 bg-emerald-400 animate-bounce delay-75" />
                <span className="w-0.5 h-1.5 bg-emerald-400 animate-bounce delay-150" />
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => speakText(userChoice === 'yes' ? messages[messages.length - 1]?.text : initialIntroScript)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/50 transition active:scale-95 shadow"
            title="Nghe lại lời thoại"
          >
            <Volume2 className={`w-3.5 h-3.5 text-amber-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? 'Đang đọc...' : 'Nghe lại'}</span>
          </button>
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
                Nữ Tiên Tri Quả Cầu Ma Thuật
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

        {/* CỘT PHẢI: KHUNG ĐỐI THOẠI & LỰA CHỌN CÁC MÔN XEM */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-slate-950/90 border border-amber-400/40 rounded-3xl p-4 shadow-xl">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
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

          {/* Lịch sử trò chuyện */}
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
                  <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm shadow leading-relaxed ${
                    isLinhNhi
                      ? 'bg-slate-900 border border-amber-400/40 text-slate-100 rounded-tl-sm'
                      : 'bg-gradient-to-r from-purple-800 to-indigo-700 text-white rounded-tr-sm'
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
              /* KHI CHỌN CÓ: HIỆN CÁC PHƯƠNG PHÁP XEM ĐỂ NGƯỜI DÙNG BẮT ĐẦU */
              <div className="space-y-2 mb-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <Sparkle className="w-3 h-3 text-amber-400" />
                    <span>Chọn phương pháp bạn muốn xem:</span>
                  </span>
                  <button
                    onClick={() => {
                      setUserChoice(null);
                      setMessages([messages[0]]);
                      speakText(initialIntroScript);
                    }}
                    className="text-[10px] text-slate-400 hover:text-amber-300 underline"
                  >
                    Hỏi lại Có / Không
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('tuvi')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 hover:border-amber-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    📜 Xem qua Tử Vi
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('compass')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    🧭 La Bàn Bát Trạch
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('numerology')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-700 hover:border-indigo-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    🔢 Thần Số Học
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('love_match')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-700 hover:border-rose-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    ❤️ Hợp Duyên Bát Tự
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('facepalm')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 hover:border-purple-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    👁️ Chỉ Tay & Tướng Mặt
                  </button>
                  <button
                    onClick={() => onNavigateTab && onNavigateTab('western')}
                    className="text-xs bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-400/50 px-2.5 py-1.5 rounded-lg transition text-left"
                  >
                    🃏 Bài Tarot
                  </button>
                </div>

                {/* Gợi ý gieo quẻ Kinh Dịch xem cát hung trước */}
                <button
                  onClick={handleDecideIChing}
                  className="w-full text-xs bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-900 hover:to-indigo-900 text-amber-300 border border-amber-400/50 font-bold px-3 py-1.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chưa chọn được? Gieo quẻ Kinh Dịch xem trước cát/hung sắp tới</span>
                </button>
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
