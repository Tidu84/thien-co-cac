import { GoogleGenAI } from '@google/genai';
import { LoveMatchSummary, NumerologyReport } from '../types';

// Initialize Gemini Client with preconfigured environment key
const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.API_KEY,
    vertexai: true,
  });
};

/**
 * Trò chuyện trực tiếp cùng Thầy Bói Giang Hồ (Xem tướng đoán mệnh)
 */
export async function chatWithLinhNhi(
  chatHistory: { role: 'user' | 'model'; text: string }[],
  userMessage: string
): Promise<{ reply: string; mood: 'mysterious' | 'happy' | 'thoughtful' | 'divine' | 'concerned'; suggestedTab?: 'iching' | 'tuvi' | 'love_match' | 'numerology' | 'facepalm' | 'western' }> {
  try {
    const ai = getAiClient();
    
    const formattedHistory = chatHistory.slice(-8).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const systemInstruction = `Bạn là một Thầy Bói Giang Hồ phong cách truyện tranh / kiếm hiệp Á Đông, tự xưng là "Ta", gọi người đối thoại là "bạn" hoặc "huynh đài/tiểu thư".

QUY TẮC ĐẶC BIỆT KHI ĐỐI THOẠI:
1. BAN ĐẦU:
   Câu cửa miệng mở màn là: "Ta là thầy bói giang hồ, có thể xem tướng đoán mệnh. Bạn có cần ta xem cho bạn một quẻ miễn phí không?"

2. KHI NGƯỜI DÙNG NÓI MUỐN XEM / ĐỒNG Ý XEM (ví dụ: "có", "xem giúp tôi", "xem đi", "tôi muốn xem", "đồng ý", "xem giùm"...):
   Lúc này BẠN MỚI BẮT ĐẦU GIỚI THIỆU CÁC CÁCH XEM để họ chọn lựa:
   - "Được thôi! Ta tinh thông nhiều môn huyền thuật, bạn muốn xem qua đường nào:
     1. Xem qua Tử Vi Lý Số (dựa theo ngày giờ sinh lập lá số 12 cung định đại vận cả đời).
     2. Xem qua Thần Số Học Pythagoras (tính con số chủ đạo, số linh hồn, năm cá nhân và 4 đỉnh cao kim tự tháp).
     3. Xem qua Chấm Điểm Hợp Duyên Tình Cảm (đối chiếu ngũ hành, can chi, cung phi 2 người).
     4. Xem qua Chỉ Tay & Tướng Mặt (dùng camera quét diện mạo và 3 đường sinh đạo).
     5. Xem qua Bài Tarot hay Quả Cầu Pha Lê phương Tây.
     Nếu bạn chưa biết chọn môn nào hoặc đang phân vân, hãy gieo một quẻ Kinh Dịch trước để xem cát/hung sắp tới nhé!"

3. NẾU NGƯỜI DÙNG HỎI VỀ THẦN SỐ HỌC / CON SỐ CHỦ ĐẠO / NĂM CÁ NHÂN:
   Gợi ý ngay: "Thần Số Học Pythagoras sẽ giải mã tần số rung động linh hồn và sứ mệnh cuộc đời bạn!" và gắn [TAB: numerology].

4. NẾU NGƯỜI DÙNG NÓI CHƯA BIẾT CHỌN GÌ, PHÂN VÂN, HOẶC MUỐN XEM CÁT HUNG NHANH:
   Khuyên ngay: "Nếu vậy, hãy gieo một quẻ Kinh Dịch càn khôn dưới đây để ta xem trước điềm cát hay hung sắp tới cho bạn nhé!" và gán [TAB: iching].

5. PHONG THÁI:
   Hào sảng, gãy gọn, dứt khoát, không lan man, bí ẩn nhưng thân thiện, hướng thiện.

Định dạng trả về:
Hãy trả lời tự nhiên (khoảng 60 - 120 từ).
Cuối câu trả lời, hãy đính kèm một dòng tag:
[MOOD: happy|mysterious|thoughtful|divine|concerned | TAB: iching|tuvi|love_match|numerology|facepalm|western|none]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: userMessage }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const rawText = response.text || "Vận mệnh biến hóa, lòng thành ắt ứng quẻ cát tường!";
    
    let mood: 'mysterious' | 'happy' | 'thoughtful' | 'divine' | 'concerned' = 'happy';
    let suggestedTab: 'iching' | 'tuvi' | 'love_match' | 'numerology' | 'facepalm' | 'western' | undefined = undefined;
    let cleanReply = rawText;

    const moodMatch = rawText.match(/\[MOOD:\s*(\w+)\s*\|\s*TAB:\s*(\w+)\]/i);
    if (moodMatch) {
      const parsedMood = moodMatch[1].toLowerCase();
      if (['happy', 'mysterious', 'thoughtful', 'divine', 'concerned'].includes(parsedMood)) {
        mood = parsedMood as any;
      }
      const parsedTab = moodMatch[2].toLowerCase();
      if (['iching', 'tuvi', 'love_match', 'numerology', 'facepalm', 'western'].includes(parsedTab)) {
        suggestedTab = parsedTab as any;
      }
      cleanReply = rawText.replace(/\[MOOD:.*?\]/i, '').trim();
    }

    return {
      reply: cleanReply,
      mood,
      suggestedTab
    };
  } catch (error) {
    console.error("Chat error:", error);
    return {
      reply: "Được thôi! Ta có thể xem qua Tử Vi, Thần Số Học Pythagoras, xem chỉ tay tướng mặt, bói bài Tarot hoặc chấm điểm tương hợp tình duyên 2 người. Nếu bạn chưa chọn được, hãy gieo quẻ Kinh Dịch để xem trước cát/hung sắp tới nhé!",
      mood: 'happy',
      suggestedTab: 'iching'
    };
  }
}

/**
 * AI giải quẻ Kinh Dịch chi tiết dựa trên câu hỏi của người dùng
 */
export async function explainIChingWithGemini(
  question: string,
  hexagramName: string,
  lines: number[],
  meaning: string
): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là một vị Đạo Sĩ - Tiên Tri Kinh Dịch uyên bác, thấu triệt lẽ Âm Dương Bát Quái và vận hành trời đất.
Người hỏi: "${question || 'Xin vận mệnh và lời khuyên tổng quan'}"
Quẻ nhận được: Quẻ số ${hexagramName}
Ý nghĩa cơ bản: ${meaning}
Các hào từ đáy lên đỉnh: ${lines.join(', ')}

Hãy phân tích quẻ này thật sâu sắc theo phong cách cổ phong uy nghi nhưng dễ hiểu:
1. Tổng quan vận thế (Thời - Vị - Trung - Chính).
2. Lời giải trực tiếp cho việc người hỏi đang băn khoăn (Tài lộc, Sự nghiệp, Tình cảm, Sức khỏe).
3. Hào động / lời khuyên đắc sách: Nên hành động thế nào để tránh hung tìm cát, hợp lẽ Đạo Trời.
Hãy trả lời khoảng 250 - 350 từ bằng tiếng Việt trang nhã, ấm áp, sâu sắc.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "Quẻ này cho thấy thời vận đang xoay vần, nên thủ chính giữ tâm an định.";
  } catch (error) {
    console.error("Gemini I Ching error:", error);
    return `Quẻ ${hexagramName} mang điềm ${meaning}. Trong giai đoạn này, lấy tĩnh chế động, tích đức hành thiện là thượng sách để đón lành tránh dữ.`;
  }
}

/**
 * Luận giải Tử Vi Lý Số / Bát Tự chia thành 6 phần nhỏ ngắn gọn, súc tích với phong thái Thầy Bói Giang Hồ phán và nhận xét
 */
export async function analyzeTuViWithGemini(
  name: string,
  gender: string,
  solarDate: string,
  lunarDate: string,
  birthHour: string,
  cungMenh: string,
  cungThan: string,
  menhNguHanh: string,
  cuc: string,
  canChiDay: string,
  canChiMonth: string,
  canChiYear: string
): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là một Thầy Bói Giang Hồ đại sư Tử Vi Đẩu Số. Hãy luận giải lá số cho:
- Đương số: ${name} (${gender === 'nam' ? 'Nam' : 'Nữ'})
- Sinh Dương lịch: ${solarDate} | Âm lịch: ${lunarDate}
- Năm ${canChiYear} • Tháng ${canChiMonth} • Ngày ${canChiDay} • Giờ ${birthHour}
- Bản Mệnh: ${menhNguHanh} | Cục: ${cuc}
- Cung Mệnh: ${cungMenh} | Cung Thân: ${cungThan}

YÊU CẦU ĐẶC BIỆT:
- Không viết bài văn dài lê thê! Phải chia thành 6 phần ngắn gọn, súc tích, sắc bén như một thầy bói giang hồ bấm ngón tay phán.
- BẮT BUỘC dùng đúng các thẻ định danh sau để phân chia nội dung:

[THAY_PHAN]
(Viết 2-3 câu thơ hoặc khẩu quyết phán đúc kết vận mệnh đương số, ngắn gọn, khí chất kiếm hiệp, vần điệu ấn tượng)
[/THAY_PHAN]

[BAN_MENH]
(2-3 câu ngắn về cốt cách, ưu thế trời ban và nhược điểm cần rèn của Nạp âm ${menhNguHanh})
[/BAN_MENH]

[CONG_DANH]
(2-3 câu về nghề nghiệp đại phát, cách giữ tiền của cải, tuổi nào tiền vào như nước)
[/CONG_DANH]

[TINH_DUYEN]
(2-3 câu về duyên số, người bạn đời hợp mệnh, cách giữ lửa tổ ấm)
[/TINH_DUYEN]

[VAN_HAN]
(2-3 câu về vận hạn năm nay, tháng nào cần cẩn trọng tiểu nhân hao tài, tháng nào hanh thông)
[/VAN_HAN]

[NHAN_XET]
(Lời thầy bói nhận xét tổng kết và 1 bí quyết phong thủy cải mệnh thiết thực)
[/NHAN_XET]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || `[THAY_PHAN]
Bản mệnh kiên cường vượt bão giông,
Tiền tài danh vọng ắt hanh thông.
Tâm thiện tích đức đời hưng thịnh,
Phúc lộc tràn trề tựa biển Đông.
[/THAY_PHAN]
[BAN_MENH]
Bản mệnh ${menhNguHanh} tọa thủ ${cungMenh}, đắc ${cuc}. Bạn là người có nội tâm sâu sắc, có ý chí kiên định tựa vàng ròng, làm việc có trách nhiệm và chữ tín.
[/BAN_MENH]
[CONG_DANH]
Sự nghiệp hợp với vai trò quản lý, kinh doanh độc lập hoặc chuyên môn cao. Trung vận tiền bạc hanh thông, càng tích lũy càng sung túc.
[/CONG_DANH]
[TINH_DUYEN]
Duyên nợ tiền định cần sự kiên nhẫn và thấu hiểu. Bạn đời là người biết chia sẻ, đồng lòng cùng bạn vượt qua mọi thử thách.
[/TINH_DUYEN]
[VAN_HAN]
Năm nay thiên thời chuyển biến cát lợi. Cần cẩn trọng giấy tờ tài chính vào tháng giữa năm, cuối năm đại cát đại lợi.
[/VAN_HAN]
[NHAN_XET]
Thầy nhận xét: Số này hậu vận an nhàn, có quý nhân phù trợ. Hãy giữ tâm sáng, năng làm việc thiện thì hung hóa cát, vạn sự bình an.
[/NHAN_XET]`;
  } catch (error) {
    console.error("Gemini TuVi error:", error);
    return `[THAY_PHAN]
Bản mệnh kiên cường vượt bão giông,
Tiền tài danh vọng ắt hanh thông.
[/THAY_PHAN]
[BAN_MENH]
Bản mệnh ${menhNguHanh} (${canChiYear}) tọa thủ ${cungMenh}. Bạn là người có nội lực vững vàng, trọng tín nghĩa.
[/BAN_MENH]
[CONG_DANH]
Sự nghiệp cần kiên trì, trung vận và hậu vận tích lũy tài sản rất tốt.
[/CONG_DANH]
[TINH_DUYEN]
Hôn nhân gia đạo hòa thuận khi hai bên biết lắng nghe và tôn trọng nhau.
[/TINH_DUYEN]
[VAN_HAN]
Năm nay vận khí tương đối ổn định, cẩn thận chi tiêu vào mùa hạ, mùa đông gặt hái thành quả.
[/VAN_HAN]
[NHAN_XET]
Thầy nhận xét: Đức năng thắng số, tâm an thì vạn sự ắt lành.
[/NHAN_XET]`;
  }
}

/**
 * AI Luận Giải Chi Tiết Thần Số Học Pythagoras (Numerology)
 */
export async function analyzeNumerologyWithGemini(report: NumerologyReport): Promise<string> {
  try {
    const ai = getAiClient();
    const peaksText = report.pyramidPeaks
      .map(p => `- Đỉnh cao ${p.peakNumber} (Năm ${p.year}, ${p.age} tuổi): Mang năng lượng số ${p.number} -> ${p.meaning}`)
      .join('\n');

    const prompt = `Bạn là một Chuyên Gia Thần Số Học Pythagoras (Numerology Master) chuẩn mực và giàu thấu cảm.
Hãy viết bản luận giải số học toàn diện và sâu sắc cho đương số:

1. BỘ CHỈ SỐ CỐT LÕI:
- Họ tên: ${report.fullName}
- Ngày sinh Dương lịch: ${report.birthDate}
- Con số chủ đạo (Life Path / Ruling Number): Số ${report.isMaster22 ? '22/4 (Master Number)' : report.lifePathNumber}
- Con số Linh hồn (Soul Urge / Khát vọng thẳm sâu): Số ${report.soulUrgeNumber}
- Con số Nhân cách (Personality / Ấn tượng đối ngoại): Số ${report.personalityNumber}
- Con số Sứ mệnh (Destiny / Mục đích cuộc đời): Số ${report.destinyNumber}
- Con số Thái độ: Số ${report.attitudeNumber}
- Năm cá nhân hiện tại (${report.currentCalendarYear}): Số ${report.personalYear}
- 4 Đỉnh cao Kim Tự Tháp cuộc đời:
${peaksText}

HÃY PHÂN TÍCH CHUYÊN SÂU THEO CÁC MỤC:
1. Ý NGHĨA CON SỐ CHỦ ĐẠO & BẢN ĐỒ TIỀM NĂNG:
   - Điểm mạnh trời ban, đặc tính tư duy và phong thái hành động.
   - Những bẫy tâm lý, bài học cuộc đời cần vượt qua để chạm tới sự tự do tài chính và an lạc.
2. TIẾNG NÓI LINH HỒN & ĐỘNG LỰC SÂU KÍN:
   - Con số Linh hồn ${report.soulUrgeNumber} phản ánh điều gì khiến bạn thực sự cảm thấy trọn vẹn và hạnh phúc?
   - Sự tương hợp giữa Số Linh Hồn và Số Nhân Cách ${report.personalityNumber}.
3. ĐỊNH HƯỚNG SỰ NGHIỆP & SỨ MỆNH CUỘC ĐỜI:
   - Những lĩnh vực nghề nghiệp thăng hoa vượt bậc tương ứng với Số Sứ Mệnh ${report.destinyNumber}.
4. DỰ BÁO NĂM CÁ NHÂN ${report.personalYear} (NĂM ${report.currentCalendarYear}):
   - Năm nay là chu kỳ của sự khởi đầu, tích lũy, bứt phá hay củng cố nội lực?
   - Những việc NÊN LÀM và KHÔNG NÊN LÀM trong năm nay để đón vận may.
5. LỜI KHUYÊN PHÁT TRIỂN BẢN THÂN:
   - Thông điệp chuyển hóa tinh thần giúp bạn khai mở tiềm năng tối đa.

Viết với văn phong hiện đại, tích cực, truyền cảm hứng mạnh mẽ, sâu sắc và chữa lành.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "Bộ chỉ số của bạn sở hữu trường năng lượng mạnh mẽ và độc đáo. Hãy tự tin bước đi trên hành trình sứ mệnh của riêng mình.";
  } catch (error) {
    console.error("Gemini Numerology error:", error);
    return `Con số chủ đạo ${report.isMaster22 ? '22/4' : report.lifePathNumber} mang năng lượng độc đáo của ${report.coreKeywords.join(', ')}. Năm nay bạn bước vào Năm Cá Nhân số ${report.personalYear}, là thời điểm thuận lợi để bạn tập trung phát triển kỹ năng, mở rộng tầm nhìn và đón nhận những cơ hội thăng tiến vượt bậc.`;
  }
}

/**
 * AI Luận Giải Chi Tiết Tương Hợp Tình Duyên Hôn Nhân & Hóa Giải Xung Khắc
 */
export async function analyzeLoveMatchWithGemini(summary: LoveMatchSummary): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là một vị Đại Thầy Hợp Hôn Tiên Thiên & Phong Thủy Bát Tự uyên bác.
Hãy viết bản luận giải tương hợp tình duyên chi tiết, sâu sắc cho đôi lứa:

1. THÔNG TIN BẢN MỆNH ĐÔI BÊN:
- Người 1: ${summary.person1.name} (${summary.person1.gender === 'nam' ? 'Nam' : 'Nữ'})
  + Dương lịch: ${summary.person1.solarDate} • Âm lịch: ${summary.person1.lunarDate}
  + Can Chi: ${summary.person1.canChiYear} • Nạp Âm: ${summary.person1.napAm} • Cung Phi: ${summary.person1.cungPhi}
- Người 2: ${summary.person2.name} (${summary.person2.gender === 'nam' ? 'Nam' : 'Nữ'})
  + Dương lịch: ${summary.person2.solarDate} • Âm lịch: ${summary.person2.lunarDate}
  + Can Chi: ${summary.person2.canChiYear} • Nạp Âm: ${summary.person2.napAm} • Cung Phi: ${summary.person2.cungPhi}

2. KẾT QUẢ ĐỐI CHIẾU THUẬT SỐ:
- Điểm tương hợp tổng quan: ${summary.totalScore}/100 Điểm (${summary.verdict})
- Ngũ Hành Nạp Âm: ${summary.factors.nguHanh.title} (${summary.factors.nguHanh.score}/${summary.factors.nguHanh.maxScore} đ)
- Địa Chi (Tuổi): ${summary.factors.diaChi.title} (${summary.factors.diaChi.score}/${summary.factors.diaChi.maxScore} đ)
- Cung Phi Bát Trạch: ${summary.factors.cungPhi.title} (${summary.factors.cungPhi.score}/${summary.factors.cungPhi.maxScore} đ)
- Thiên Can: ${summary.factors.thienCan.title} (${summary.factors.thienCan.score}/${summary.factors.thienCan.maxScore} đ)

HÃY BÌNH GIẢI TOÀN DIỆN:
1. TỔNG QUAN DUYÊN PHẬN & HÚT NHAU: Mối lương duyên này mang thiên hướng gì? Gặp nhau là do duyên nợ hay tri kỷ?
2. CÁC ĐIỂM HỢP CÁT LỢI NHẤT: Tài lộc khi về chung một nhà, sự đồng điệu trong tâm hồn và tương trợ công danh.
3. THỬ THÁCH VÀ NGUY CƠ BẤT ĐỒNG: Những lúc dễ va chạm vì tính khí, quan niệm sống hay áp lực gia đình.
4. BÍ QUYẾT HÓA GIẢI XUNG KHẮC (NẾU CÓ):
   - Chọn hướng phòng ngủ / hướng nhà đại cát bồi đắp hòa khí.
   - Chọn năm sinh con hợp mệnh để làm cầu nối trung gian chuyển hóa tương khắc thành tương sinh.
   - Nguyên tắc đối nhân xử thế "Đức năng thắng số, thuận vợ thuận chồng".

Viết với văn phong trang nhã, ấm áp, thấu tình đạt lý, truyền cảm hứng yêu thương và xây đắp hôn nhân bền vững.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "Đôi lứa hữu duyên tương ngộ, thuận vợ thuận chồng tát biển Đông cũng cạn.";
  } catch (error) {
    console.error("Gemini Love Match error:", error);
    return `Đôi lứa ${summary.person1.name} (${summary.person1.canChiYear}) và ${summary.person2.name} (${summary.person2.canChiYear}) đạt mức hòa hợp ${summary.totalScore}/100 điểm. ${summary.verdict}. Bản mệnh ${summary.factors.nguHanh.title}, Cung Phi ${summary.factors.cungPhi.title}. Hai người chỉ cần thấu hiểu, nhường nhịn và đồng lòng thì gia đạo ắt hưng long đại cát.`;
  }
}

/**
 * Phân tích Nhân Tướng Học (Tướng Khuôn Mặt hoặc Tướng Chỉ Tay) qua ảnh base64
 */
export async function analyzeFaceOrPalmWithGemini(
  imageBase64: string,
  type: 'face' | 'palm'
): Promise<string> {
  try {
    const ai = getAiClient();
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const prompt = type === 'face'
      ? `Bạn là một bậc thầy Nhân Tướng Học (Tướng Pháp Ma Y thần tướng & Liễu Trang tướng pháp).
Hãy nhìn bức ảnh khuôn mặt này và phân tích tướng mạo cát hung theo nguyên lý nhân diện truyền thống:
1. Tam Đình (Thượng Đình - Trán, Trung Đình - Mắt & Mũi, Hạ Đình - Miệng & Cằm): Sự cân đối và vận thế thiếu - trung - hậu vận.
2. Ngũ Quan:
   - Trán (Thiên Đình): Trí tuệ, đường học vấn & phúc ấm tiền nhân.
   - Mắt (Nhãn thần): Tâm tính, sự kiên định, thần khí quang minh.
   - Mũi (Tài Bạch tinh): Đường tiền tài, năng lực giữ tiền.
   - Cằm & Miệng (Địa Các & Xuất Nạp quan): Hậu vận, con cháu, phước lộc về già.
3. Khí sắc hiện tại và điềm lành vận thế.
4. Lời khuyên tu tâm dưỡng tướng, cải thiện vận mệnh.

(Lưu ý: Luôn mang tính xây dựng, hướng thiện, truyền cảm hứng tích cực, tôn trọng nhân phẩm).`
      : `Bạn là bậc thầy Xem Chỉ Tay (Thủ Tướng Học Đông Tây kết hợp).
Hãy nhìn bức ảnh lòng bàn tay này và luận giải các gò cùng đường chỉ tay:
1. Đường Sinh Đạo (Đường đời): Thể lực, sức bền, sinh khí và đại vận cuộc đời.
2. Đường Trí Đạo (Đường trí tuệ): Khả năng tư duy, óc sáng tạo, học thức và ra quyết định.
3. Đường Tâm Đạo (Đường tình cảm): Tính cách tình cảm, nhân duyên, sự ấm áp trong các mối quan hệ.
4. Đường Định Mệnh / Thái Dương (nếu thấy): Sự nghiệp, quý nhân và tài lộc.
5. Các Gò Nổi Trội (Gò Kim Tinh, Gò Mộc Tinh, Gò Thủy Tinh...): Khí chất trời ban.
6. Lời khuyên để phát huy điểm mạnh bàn tay vàng.

Trình bày mạch lạc, uyên bác và đem lại năng lượng tích cực.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          { text: prompt }
        ]
      }
    });

    return response.text || "Tướng mạo thanh quý, khí sắc tràn trề phúc lộc.";
  } catch (error) {
    console.error("Gemini Vision Reading error:", error);
    return type === 'face'
      ? "Khuôn mặt có tướng mạo phúc hậu, trán cao biểu lộ tư duy thông tuệ, mắt có thần sắc kiên định. Hậu vận an khang, càng tích đức tu tâm thì tài lộc càng sung túc."
      : "Lòng bàn tay đầy đặn, các đường chỉ tay Sinh Đạo - Trí Đạo rõ nét, chứng tỏ sinh lực dồi dào, tư duy mạch lạc và có quý nhân tương trợ trên đường lập nghiệp.";
  }
}

/**
 * Luận giải bài Tarot 3 lá (Quá Khứ - Hiện Tại - Tương Lai)
 */
export async function explainTarotWithGemini(
  question: string,
  cards: { name: string; position: string; meaning: string }[]
): Promise<string> {
  try {
    const ai = getAiClient();
    const cardsDesc = cards.map(c => `- Vị trí ${c.position}: Lá ${c.name} (${c.meaning})`).join('\n');
    const prompt = `Bạn là một Tarot Reader huyền bí, giàu thấu cảm và trực giác sắc bén.
Người hỏi băn khoăn về: "${question || 'Định hướng cuộc sống và tình cảm sắp tới'}"
Trải bài 3 lá nhận được:
${cardsDesc}

Hãy liên kết mạch câu chuyện giữa Quá khứ - Hiện tại - Tương lai:
1. Bài học đã trải qua trong quá khứ tạo nên tình cảnh này.
2. Thử thách hoặc thông điệp cốt lõi ở hiện tại bạn cần đối diện.
3. Tiềm năng và chiều hướng phát triển ở tương lai.
4. Lời khuyên thiêng liêng từ những lá bài để bạn đạt được bình yên và thành công.

Trả lời với giọng văn huyền diệu, ấm áp, sâu sắc và chữa lành.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "Những lá bài khuyên bạn hãy dũng cảm lắng nghe trực giác để mở ra cánh cửa mới.";
  } catch (error) {
    console.error("Gemini Tarot error:", error);
    return "Trải bài cho thấy một giai đoạn chuyển giao mạnh mẽ. Hãy buông bỏ những điều cũ kỹ để đón nhận những cơ hội tươi sáng đang chờ đợi phía trước.";
  }
}

/**
 * Quả cầu thủy tinh thần dụ (Crystal Ball Scrying)
 */
export async function scryCrystalBallWithGemini(userQuestion: string): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là Linh Hồn Cổ Xưa trú ngụ trong Quả Cầu Pha Lê Tiên Tri Vĩ Đại.
Người tìm kiếm hỏi quả cầu: "${userQuestion || 'Tương lai phía trước của tôi sẽ ra sao?'}"

Hãy nhập vai xuất thần: sương mù đang cuộn xoáy trong khối pha lê trong suốt, những tia chớp màu lam và tím lóe lên... Bạn nhìn thấy viễn cảnh gì?
Đưa ra một lời sấm truyền huyền ảo, thi vị nhưng chứa đựng triết lý sâu sắc và chỉ dẫn đắt giá cho người hỏi. (Khoảng 150-200 từ).`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || "Trong làn sương pha lê, ta nhìn thấy một ngọn lửa hy vọng đang bùng cháy rực rỡ sau đám mây u tối.";
  } catch (error) {
    console.error("Gemini Crystal ball error:", error);
    return "Làn sương trong quả cầu từ từ hé lộ: Ngôi sao bản mệnh của bạn đang chuyển động vào cung cát lợi. Mọi sự chờ đợi và kiên trì thời gian qua sắp đơm hoa kết trái.";
  }
}
