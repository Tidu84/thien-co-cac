import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

type VoiceTone = 'mystic' | 'lively' | 'neutral';

type VoiceOptions = {
  lang?: string;
  tone?: VoiceTone;
  rate?: number;
  pitch?: number;
  voiceGender?: 'male' | 'female';
  gender?: 'male' | 'female';
  force?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onStop?: () => void;
  onError?: () => void;
};

type VoiceContextValue = {
  voiceEnabled: boolean;
  setVoiceEnabled: (enabled: boolean) => void;
  toggleVoice: (introText?: string) => boolean;
  unlockAudio: () => boolean;
  speak: (text: string, options?: VoiceOptions) => boolean;
  stopSpeaking: () => void;
};

const VOICE_ENABLED_KEY = 'thien_co_cac_voice_enabled';
const VoiceContext = createContext<VoiceContextValue | null>(null);

const voiceToneSettings: Record<VoiceTone, { rate: number; pitch: number }> = {
  mystic: { rate: 0.95, pitch: 0.98 },
  lively: { rate: 1.02, pitch: 1.05 },
  neutral: { rate: 0.98, pitch: 1.0 }
};

const readInitialVoicePreference = () => {
  try {
    const saved = localStorage.getItem(VOICE_ENABLED_KEY);
    if (saved === null) return true;
    return saved === 'true';
  } catch {
    return true;
  }
};

const prepareVoiceText = (text: string) => text
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\b(để ta xem nào)\s*[,;:]?/gi, '$1...')
  .replace(/\.{4,}/g, '...')
  .replace(/[ \t]+/g, ' ')
  .replace(/\s*([—–])\s*/g, '... ')
  .replace(/\s*;\s*/g, ', ')
  .replace(/\s+/g, ' ')
  .trim();

function splitIntoAudioChunks(text: string): string[] {
  const sentences = text.split(/([.!?;:\n]+)/);
  const chunks: string[] = [];
  let cur = '';

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if ((cur + part).length < 130) {
      cur += part;
    } else {
      if (cur.trim()) chunks.push(cur.trim());
      cur = part;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(c => c.length > 0 && !/^[,.;!?:_\-\s]+$/.test(c));
}

const isVietnameseVoice = (voice: SpeechSynthesisVoice) => {
  const lang = (voice.lang || '').toLowerCase();
  return lang.includes('vi') || lang.startsWith('vi-') || lang.startsWith('vi_');
};

const normalizedVoiceName = (voice: SpeechSynthesisVoice) => (voice.name || '').toLocaleLowerCase('vi-VN');
const hasFemaleName = (voice: SpeechSynthesisVoice) => /female|woman|nữ|hoaimy/i.test(normalizedVoiceName(voice));
const hasMaleName = (voice: SpeechSynthesisVoice) => /namminh|microsoft\s+nam|(^|[^a-z])male([^a-z]|$)|(^|[^a-z])man([^a-z]|$)/i.test(normalizedVoiceName(voice));

type VoiceSelection = { voice?: SpeechSynthesisVoice; isFemaleVoice: boolean };

const chooseVietnameseVoice = (voices: SpeechSynthesisVoice[], gender?: 'male' | 'female'): VoiceSelection => {
  if (!voices || voices.length === 0) {
    return { isFemaleVoice: gender === 'female' };
  }

  const vietnameseVoices = voices.filter(isVietnameseVoice);
  const nonMaleVoices = vietnameseVoices.filter(voice => !hasMaleName(voice));

  if (gender === 'female') {
    const selectedFemaleVoice =
      vietnameseVoices.find(voice => /microsoft\s+hoaimy.*online.*natural.*vietnamese/i.test(normalizedVoiceName(voice)))
      ?? vietnameseVoices.find(voice => /hoaimy/i.test(normalizedVoiceName(voice)))
      ?? vietnameseVoices.find(hasFemaleName)
      ?? nonMaleVoices.find(voice => /google.*(tiếng việt|vietnamese)|tiếng việt.*google/i.test(normalizedVoiceName(voice)))
      ?? nonMaleVoices.find(voice => /natural|neural|enhanced/i.test(normalizedVoiceName(voice)));

    if (selectedFemaleVoice) return { voice: selectedFemaleVoice, isFemaleVoice: true };
    if (vietnameseVoices.length > 0) return { voice: vietnameseVoices[0], isFemaleVoice: false };
    return { isFemaleVoice: true };
  }

  const selectedMaleVoice =
    vietnameseVoices.find(voice => /microsoft\s+namminh.*online.*natural.*vietnamese/i.test(normalizedVoiceName(voice)))
    ?? vietnameseVoices.find(voice => /namminh/i.test(normalizedVoiceName(voice)))
    ?? vietnameseVoices.find(hasMaleName)
    ?? vietnameseVoices.find(voice => !hasFemaleName(voice))
    ?? vietnameseVoices[0];

  if (selectedMaleVoice) return { voice: selectedMaleVoice, isFemaleVoice: false };
  return { isFemaleVoice: false };
};

export const VoiceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [voiceEnabled, setVoiceEnabledState] = useState(readInitialVoicePreference);
  const voiceEnabledRef = useRef(voiceEnabled);
  const utteranceIdRef = useRef(0);
  const activeCallbacksRef = useRef<VoiceOptions | null>(null);
  const voiceListRef = useRef<SpeechSynthesisVoice[]>([]);
  const cancelActiveAudioStreamRef = useRef<(() => void) | null>(null);

  const setVoiceEnabled = useCallback((enabled: boolean) => {
    voiceEnabledRef.current = enabled;
    setVoiceEnabledState(enabled);
    try {
      localStorage.setItem(VOICE_ENABLED_KEY, String(enabled));
    } catch {}
  }, []);

  const syncVoiceList = useCallback((voices: SpeechSynthesisVoice[]) => {
    if (voices && voices.length > 0) {
      voiceListRef.current = voices;
      const vi = voices.filter(isVietnameseVoice);
      console.log('[VoiceContext] Loaded voices:', voices.length, 'Vietnamese voices:', vi.map(v => v.name));
    }
  }, []);

  useEffect(() => {
    voiceEnabledRef.current = voiceEnabled;
  }, [voiceEnabled]);

  // Nạp danh sách voices trên trình duyệt / Android WebView
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const refreshVoices = () => {
      try {
        const v = window.speechSynthesis.getVoices();
        syncVoiceList(v);
      } catch {}
    };

    refreshVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }

    const t1 = setTimeout(refreshVoices, 300);
    const t2 = setTimeout(refreshVoices, 1200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [syncVoiceList]);

  // Mở khóa âm thanh an toàn khi người dùng chạm vào màn hình (Đồng thời kích hoạt Web Audio API)
  const unlockAudio = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      // 1. Đánh thức Web Audio Context
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = (window as any).__sharedAudioCtx || new AudioCtx();
        (window as any).__sharedAudioCtx = ctx;
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
      // 2. Đánh thức Web Speech API nếu có
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gestureEvents = ['pointerdown', 'touchstart', 'click'];
    const unlockFromGesture = () => {
      unlockAudio();
      gestureEvents.forEach(eventName => window.removeEventListener(eventName, unlockFromGesture, true));
    };
    gestureEvents.forEach(eventName => window.addEventListener(eventName, unlockFromGesture, { once: true, capture: true, passive: true }));
    return () => gestureEvents.forEach(eventName => window.removeEventListener(eventName, unlockFromGesture, true));
  }, [unlockAudio]);

  const stopSpeaking = useCallback(() => {
    // 1. Dừng Audio Stream nếu đang phát
    if (cancelActiveAudioStreamRef.current) {
      cancelActiveAudioStreamRef.current();
      cancelActiveAudioStreamRef.current = null;
    }

    // 2. Dừng Android Native TTS
    if (typeof window !== 'undefined' && (window as any).AndroidNativeTTS?.stop) {
      try {
        (window as any).AndroidNativeTTS.stop();
      } catch {}
    }

    // 3. Dừng Web Speech API
    const callbacks = activeCallbacksRef.current;
    activeCallbacksRef.current = null;
    utteranceIdRef.current += 1;
    (window as any).__activeUtterance = null;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    callbacks?.onStop?.();
  }, []);

  // Hàm phát chuỗi Audio TTS trực tuyến dự phòng khi máy ảo hoặc Android WebView không có voice tiếng Việt
  const playFallbackAudioStream = useCallback((spokenText: string, options: VoiceOptions, currentUtteranceId: number, isMale: boolean = true) => {
    const chunks = splitIntoAudioChunks(spokenText);
    if (chunks.length === 0) {
      options.onEnd?.();
      return;
    }

    let chunkIdx = 0;
    let isCancelled = false;
    let activeAudio: HTMLAudioElement | null = null;

    const playNext = () => {
      if (isCancelled || currentUtteranceId !== utteranceIdRef.current) return;
      if (chunkIdx >= chunks.length) {
        options.onEnd?.();
        return;
      }

      const textChunk = chunks[chunkIdx++];
      const queryParams = `ie=UTF-8&q=${encodeURIComponent(textChunk)}&tl=vi&client=tw-ob`;
      const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      // Trên môi trường dev/localhost ưu tiên proxy tts-stream của Vite để triệt tiêu chặn Referer từ trình duyệt (như Firefox)
      const primaryUrl = isLocalhost ? `/tts-stream?${queryParams}` : `https://translate.google.com/translate_tts?${queryParams}`;
      const fallbackUrl = `https://translate.google.com/translate_tts?${queryParams}`;

      const audio = document.createElement('audio');
      audio.referrerPolicy = 'no-referrer';
      audio.preload = 'auto';
      audio.src = primaryUrl;
      // Điều chỉnh tốc độ & cao độ: Nam (Chân Nhân) = 0.88x (trầm, chậm), Nữ (Tiên Nương) = 1.05x (trong trẻo, nhanh nhẹn)
      audio.playbackRate = isMale ? 0.88 : 1.05;
      activeAudio = audio;
      (window as any).__activeAudioElement = audio;

      audio.onplay = () => {
        if (chunkIdx === 1) options.onStart?.();
      };
      audio.onended = () => {
        playNext();
      };
      audio.onerror = (e) => {
        console.warn('[VoiceContext] Lỗi phát đoạn âm thanh stream, thử URL fallback:', e);
        if (audio.src !== fallbackUrl) {
          audio.src = fallbackUrl;
          audio.load();
          audio.play().catch(() => playNext());
        } else {
          playNext();
        }
      };

      audio.play().catch(err => {
        console.warn('[VoiceContext] Play audio stream failed:', err);
        if (audio.src !== fallbackUrl) {
          audio.src = fallbackUrl;
          audio.load();
          audio.play().catch(() => options.onError?.());
        } else {
          options.onError?.();
        }
      });
    };

    cancelActiveAudioStreamRef.current = () => {
      isCancelled = true;
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
      }
      (window as any).__activeAudioElement = null;
    };

    playNext();
  }, []);

  const speak = useCallback((text: string, options: VoiceOptions = {}) => {
    // Nếu người dùng chạm vào nhân vật hoặc force=true, tự động bật giọng đọc
    if (!voiceEnabledRef.current) {
      if (options.force) {
        setVoiceEnabled(true);
      } else {
        return false;
      }
    }

    const spokenText = prepareVoiceText(text);
    if (!spokenText) return false;

    const requestedGender: 'male' | 'female' = options.gender ?? options.voiceGender ?? 'male';
    const isMale = requestedGender === 'male';

    // Phát âm thanh chuông huyền diệu (Web Audio API): Nam = 432Hz (trầm ấm), Nữ = 528Hz (trong trẻo)
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = (window as any).__sharedAudioCtx || new AudioCtx();
        (window as any).__sharedAudioCtx = ctx;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isMale ? 432 : 528, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {}

    // Hủy lệnh đang nói trước đó
    stopSpeaking();
    const utteranceId = ++utteranceIdRef.current;
    activeCallbacksRef.current = options;

    // ĐẶC BIỆT: THIẾT LẬP THÔNG SỐ TÁCH BIỆT RÕ RÀNG GIỮA NAM (CHÂN NHÂN) & NỮ (TIÊN NƯƠNG)
    // Giọng Nam (Chân Nhân): Trầm ấm, uy nghiêm, đĩnh đạc -> pitch hạ sâu 0.70, rate hơi chậm 0.90
    // Giọng Nữ (Tiên Nương): Thanh thoát, dịu dàng, trong trẻo -> pitch cao 1.20, rate nhanh nhẹn 1.02
    const safeRate = options.rate ?? (isMale ? 0.90 : 1.02);
    const safePitch = options.pitch ?? (isMale ? 0.70 : 1.20);

    // =========================================================================
    // LỚP 1: CẦU NỐI NATIVE ANDROID TEXT-TO-SPEECH (MÁY THẬT VÀ MÁY ẢO ANDROID STUDIO)
    // =========================================================================
    if (typeof window !== 'undefined' && (window as any).AndroidNativeTTS?.isAvailable?.()) {
      console.log('[Voice] Sử dụng Android Native TTS Bridge qua MainActivity');
      (window as any).__onAndroidTTSStart = () => {
        if (utteranceId === utteranceIdRef.current) options.onStart?.();
      };
      (window as any).__onAndroidTTSEnd = () => {
        if (utteranceId === utteranceIdRef.current) {
          (window as any).__onAndroidTTSStart = null;
          (window as any).__onAndroidTTSEnd = null;
          options.onEnd?.();
        }
      };
      (window as any).__onAndroidTTSError = () => {
        console.warn('[Voice] Android Native TTS gặp sự cố, tự động kích hoạt Audio Stream dự phòng');
        playFallbackAudioStream(spokenText, options, utteranceId, isMale);
      };

      try {
        if ((window as any).AndroidNativeTTS.speakWithGender) {
          (window as any).AndroidNativeTTS.speakWithGender(spokenText, safeRate, safePitch, requestedGender);
        } else {
          (window as any).AndroidNativeTTS.speak(spokenText, safeRate, safePitch);
        }
        return true;
      } catch (e) {
        console.warn('[Voice] Gọi AndroidNativeTTS lỗi, chuyển fallback:', e);
      }
    }

    // =========================================================================
    // LỚP 2: BROWSER WEB SPEECH API (DÀNH CHO CHROME / DESKTOP WEB)
    // =========================================================================
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      let voices = voiceListRef.current;
      if (!voices || voices.length === 0) {
        try {
          voices = window.speechSynthesis.getVoices();
          syncVoiceList(voices);
        } catch {}
      }

      const selectedVoice = chooseVietnameseVoice(voices, requestedGender);

      // Nếu không có voice tiếng Việt trên máy ảo/máy thật, chuyển thẳng sang Lớp 3 (Audio Stream)
      if (!selectedVoice.voice && (!voices || !voices.some(isVietnameseVoice))) {
        console.log('[Voice] Không tìm thấy gói giọng tiếng Việt trong hệ thống, chuyển sang Audio Stream');
        playFallbackAudioStream(spokenText, options, utteranceId, isMale);
        return true;
      }

      const utterance = new SpeechSynthesisUtterance(spokenText);
      if (selectedVoice.voice) {
        utterance.voice = selectedVoice.voice;
        utterance.lang = selectedVoice.voice.lang || 'vi-VN';
      } else {
        utterance.lang = 'vi-VN';
      }

      utterance.rate = Math.min(1.3, Math.max(0.7, safeRate));
      utterance.pitch = Math.min(1.3, Math.max(0.65, safePitch));
      utterance.volume = 1.0;

      (window as any).__activeUtterance = utterance;

      utterance.onstart = () => {
        if (utteranceId === utteranceIdRef.current) options.onStart?.();
      };

      utterance.onend = () => {
        if (utteranceId === utteranceIdRef.current) {
          (window as any).__activeUtterance = null;
          options.onEnd?.();
        }
      };

      utterance.onerror = (event) => {
        console.warn('[Voice] Web Speech báo lỗi:', event.error, '-> Kích hoạt luồng Audio Stream dự phòng ngay');
        playFallbackAudioStream(spokenText, options, utteranceId, isMale);
      };

      try {
        window.speechSynthesis.speak(utterance);
        return true;
      } catch (err) {
        console.warn('[Voice] speechSynthesis.speak error:', err);
      }
    }

    // =========================================================================
    // LỚP 3: DỰ PHÒNG TOÀN NĂNG - GOOGLE TTS AUDIO STREAM (HOẠT ĐỘNG 100% TRÊN MỌI MÁY ẢO)
    // =========================================================================
    console.log('[Voice] Kích hoạt chế độ Universal Audio Stream cho máy ảo');
    playFallbackAudioStream(spokenText, options, utteranceId, isMale);
    return true;
  }, [stopSpeaking, syncVoiceList, setVoiceEnabled, playFallbackAudioStream]);

  const toggleVoice = useCallback((introText?: string) => {
    const nextState = !voiceEnabledRef.current;
    setVoiceEnabled(nextState);

    if (nextState) {
      unlockAudio();
      if (introText) {
        speak(introText, { tone: 'mystic', force: true });
      }
    } else {
      stopSpeaking();
    }
    return nextState;
  }, [unlockAudio, speak, stopSpeaking, setVoiceEnabled]);

  const value = {
    voiceEnabled,
    setVoiceEnabled,
    toggleVoice,
    unlockAudio,
    speak,
    stopSpeaking
  };

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
};

export const useAppVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useAppVoice must be used within a VoiceProvider');
  }
  return context;
};
