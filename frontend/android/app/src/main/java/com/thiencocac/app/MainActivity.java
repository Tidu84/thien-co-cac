package com.thiencocac.app;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import java.util.Locale;

public class MainActivity extends BridgeActivity {
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            WebView webView = this.bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                // 1. Khóa tỷ lệ chữ 100% tránh tràn vỡ giao diện trên máy Xiaomi/Poco có font hệ thống lớn
                settings.setTextZoom(100);
                // 2. Cho phép phát âm thanh giọng đọc không bị Android WebView chặn gesture
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setAllowFileAccess(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);

                // 3. Khởi tạo Android Native Text-To-Speech cho máy thật và máy ảo
                initNativeTTS(webView);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void initNativeTTS(final WebView webView) {
        try {
            textToSpeech = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
                @Override
                public void onInit(int status) {
                    if (status == TextToSpeech.SUCCESS) {
                        int result = textToSpeech.setLanguage(new Locale("vi", "VN"));
                        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                            textToSpeech.setLanguage(Locale.getDefault());
                        }
                        ttsReady = true;
                    }
                }
            });

            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override
                public void onStart(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            webView.evaluateJavascript("window.__onAndroidTTSStart && window.__onAndroidTTSStart()", null);
                        } catch (Exception ignored) {}
                    });
                }

                @Override
                public void onDone(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            webView.evaluateJavascript("window.__onAndroidTTSEnd && window.__onAndroidTTSEnd()", null);
                        } catch (Exception ignored) {}
                    });
                }

                @Override
                public void onError(String utteranceId) {
                    runOnUiThread(() -> {
                        try {
                            webView.evaluateJavascript("window.__onAndroidTTSError && window.__onAndroidTTSError()", null);
                        } catch (Exception ignored) {}
                    });
                }
            });

            // Cầu nối Javascript Interface cho WebView
            webView.addJavascriptInterface(new Object() {
                @JavascriptInterface
                public boolean isAvailable() {
                    return ttsReady;
                }

                @JavascriptInterface
                public void speak(String text, float rate, float pitch) {
                    speakWithGender(text, rate, pitch, "neutral");
                }

                @JavascriptInterface
                public void speakWithGender(String text, float rate, float pitch, String gender) {
                    if (textToSpeech != null && ttsReady) {
                        try {
                            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.LOLLIPOP) {
                                java.util.Set<android.speech.tts.Voice> voices = textToSpeech.getVoices();
                                if (voices != null) {
                                    for (android.speech.tts.Voice v : voices) {
                                        if (v.getLocale() != null && v.getLocale().getLanguage().equals("vi")) {
                                            String vName = v.getName().toLowerCase();
                                            if ("male".equalsIgnoreCase(gender) && (vName.contains("male") || vName.contains("nam"))) {
                                                textToSpeech.setVoice(v);
                                                break;
                                            } else if ("female".equalsIgnoreCase(gender) && (vName.contains("female") || vName.contains("nu") || vName.contains("hoa"))) {
                                                textToSpeech.setVoice(v);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            textToSpeech.setSpeechRate(rate);
                            textToSpeech.setPitch(pitch);
                            textToSpeech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "Utterance_" + System.currentTimeMillis());
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                }

                @JavascriptInterface
                public void stop() {
                    if (textToSpeech != null) {
                        try {
                            textToSpeech.stop();
                        } catch (Exception ignored) {}
                    }
                }
            }, "AndroidNativeTTS");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onDestroy() {
        if (textToSpeech != null) {
            try {
                textToSpeech.stop();
                textToSpeech.shutdown();
            } catch (Exception ignored) {}
        }
        super.onDestroy();
    }
}
