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
 * Hỏi Thầy Bói Giang Hồ chuyên sâu về lá số Tử Vi (vận hạn 10 năm, việc cụ thể, hóa giải sao...)
 */
export async function askTuViDeepDiveQuestion(
  profileSummary: {
    fullName: string;
    gender: string;
    canChiYear: string;
    menhNguHanh: string;
    cuc: string;
    cungMenh: string;
    cungThan: string;
  },
  question: string
): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là Thầy Bói Giang Hồ đại sư Tử Vi Đẩu Số và nhân tướng học Á Đông.
Đương số: ${profileSummary.fullName} (${profileSummary.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'}), tuổi ${profileSummary.canChiYear}, bản mệnh ${profileSummary.menhNguHanh}, Cục: ${profileSummary.cuc}, Cung Mệnh tại ${profileSummary.cungMenh}, Cung Thân tại ${profileSummary.cungThan}.

Câu hỏi cần giải đáp chuyên sâu:
"${question}"

YÊU CẦU TRẢ LỜI:
- Trả lời bằng phong thái Thầy Bói Giang Hồ: hào sảng, sắc bén, chân thành, gãy gọn (khoảng 70 - 130 từ).
- Luận rõ thời cơ, nguy cơ và đưa ra 1 lời khuyên thực tế để chuyển hung hóa cát.
- Có thể dùng 1 câu khẩu quyết hoặc vần điệu ngắn gọn cuối câu.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || generateOfflineTuViAnswer(profileSummary, question);
  } catch (error) {
    console.error("Gemini TuVi Deep Dive error:", error);
    return generateOfflineTuViAnswer(profileSummary, question);
  }
}

function generateOfflineTuViAnswer(
  profileSummary: {
    fullName: string;
    gender: string;
    canChiYear: string;
    menhNguHanh: string;
    cuc: string;
    cungMenh: string;
    cungThan: string;
  },
  question: string
): string {
  const qLower = question.toLowerCase();

  if (qLower.includes('việc') || qLower.includes('công việc') || qLower.includes('đổi việc') || qLower.includes('thăng tiến') || qLower.includes('sự nghiệp')) {
    return `Chiếu theo cung Quan Lộc và bản mệnh ${profileSummary.menhNguHanh} (${profileSummary.canChiYear}), năm nay đương số có thời vận chuyển động. Nếu đổi việc hay khởi sự mới, nên chọn tháng 8 hoặc tháng 10 âm lịch khi quý nhân tương trợ. Tránh nóng vội hấp tấp giữa năm kẻo dính khẩu thiệt thị phi. Vững tâm giữ chữ tín, ắt có công danh rực rỡ!`;
  }

  if (qLower.includes('tiền') || qLower.includes('tài chính') || qLower.includes('đầu tư') || qLower.includes('kinh doanh') || qLower.includes('làm ăn') || qLower.includes('giàu')) {
    return `Cung Tài Bạch của đương số đắc cách tích lũy, tiền vào như nước nhưng cũng dễ hao tán do chi tiêu rộng rãi. Đầu tư năm nay cần chọn tài sản thực chất, tránh lướt sóng mạo hiểm. Người mang mệnh ${profileSummary.menhNguHanh} nên hợp tác cùng người mệnh Thổ hoặc Kim để giữ vững kho tiền tài, hậu vận điền sản dư dả!`;
  }

  if (qLower.includes('tình') || qLower.includes('duyên') || qLower.includes('hôn nhân') || qLower.includes('người yêu') || qLower.includes('vợ') || qLower.includes('chồng')) {
    return `Cung Phu Thê và Thân cư ${profileSummary.cungThan} cho thấy duyên phận của bạn tiền định sâu đậm nhưng cần vượt qua giai đoạn tôi luyện cái tôi. Người bạn đời là người có tài, cá tính rõ ràng. Lời khuyên của thầy: "Lạt mềm buộc chặt", bớt một câu tranh cãi là thêm mười phần phúc khí, gia đạo ắt êm ấm hạnh phúc!`;
  }

  if (qLower.includes('sức khỏe') || qLower.includes('bệnh') || qLower.includes('tai ương') || qLower.includes('hạn')) {
    return `Cung Tật Ách của tuổi ${profileSummary.canChiYear} chủ yếu lưu ý hệ tiêu hóa và áp lực tinh thần do suy nghĩ quá nhiều. Hạn chế thức khuya và chú ý đi lại sông nước vào tháng 5 âm lịch. Tâm bình thì khí hòa, năng phóng sinh hoặc làm việc thiện sẽ giải trừ mọi hung tinh quấy phá!`;
  }

  return `Thầy bói bấm đốt ngón tay soi lá số của bạn (${profileSummary.canChiYear} - ${profileSummary.menhNguHanh}): Thời vận đang trong chu kỳ tích lũy để bùng nổ. Về việc "${question}", thiên cơ mách bảo hãy hành sự cẩn trọng nhưng quyết đoán, tin vào trực giác và đạo đức bản thân. Đức năng thắng số, thời cơ chín muồi ắt vạn sự hanh thông!`;
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
 * Phân tích Nhân Tướng Học (Tướng Khuôn Mặt, Tướng Chỉ Tay hoặc Tướng Toàn Thân) qua ảnh base64
 */
export async function analyzeFaceOrPalmWithGemini(
  imageBase64: string,
  type: 'face' | 'palm' | 'body',
  sampleDetail?: { name: string; description: string; analysisDetail: string },
  personName?: string,
  handSide?: 'left' | 'right',
  gender?: 'nam' | 'nu'
): Promise<string> {
  const displayName = personName?.trim() || 'Hữu Duyên Khách';
  const handLabel = handSide === 'right' ? 'Tay Phải (Nữ Hữu)' : 'Tay Trái (Nam Tả)';
  const genderLabel = gender === 'nu' ? 'Nữ mạng' : 'Nam mạng';

  try {
    const ai = getAiClient();
    const mimeType = imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    let prompt = '';
    if (type === 'face') {
      prompt = `Bạn là một bậc thầy Nhân Tướng Học (Tướng Pháp Ma Y thần tướng & Liễu Trang tướng pháp).
Hãy nhìn bức ảnh khuôn mặt của đương số: "${displayName}" (${genderLabel}) và phân tích tướng mạo cát hung.
BƯỚC 1: XÁC ĐỊNH & PHÂN LOẠI khuôn mặt thuộc kiểu tướng mạo nào (ví dụ: Tướng Mặt Phúc Hậu Chuẩn Mực, Tướng Mặt Uy Nghi Quyền Biến, Tướng Mặt Thanh Tú Trí Tuệ...).
BƯỚC 2: Luận giải chi tiết theo định dạng thẻ:

[PHAN_LOAI] <Tên kiểu diện mạo được phân loại> (Độ tương hợp: 92% - 98%) [/PHAN_LOAI]
[DAC_DIEM]
- Tam Đình (Thượng Đình - Trán, Trung Đình - Mắt & Mũi, Hạ Đình - Miệng & Cằm)
- Ngũ Quan (Thiên Đình, Nhãn thần, Tài Bạch tinh, Địa Các)
[/DAC_DIEM]
[LUAN_BAN]
Luận bàn sự nghiệp, phúc lộc, hôn nhân và vận thế các giai đoạn cuộc đời cho ${displayName}.
[/LUAN_BAN]
[LOI_KHUYEN]
Lời khuyên tu tâm dưỡng tướng và kích hoạt vượng khí.
[/LOI_KHUYEN]`;
    } else if (type === 'palm') {
      prompt = `Bạn là bậc thầy Xem Chỉ Tay (Thủ Tướng Học Đông Tây kết hợp, am hiểu sâu sắc các nghiên cứu của Bác sĩ Josef Ranald, Ernst Issberner - Haldane Berlin 1922, Henry Rem và Cổ thư Á Đông).
Đương số: "${displayName}" (${genderLabel}, chụp ${handLabel}).

BƯỚC QUAN TRỌNG NHẤT:
Hãy quan sát thật kỹ bức ảnh lòng bàn tay của ${displayName} và PHÂN LOẠI CỤ THỂ xem lòng bàn tay này thuộc về kiểu nào trong 12 dạng chuẩn sau:
1. Chỉ Tay Chữ M Cát Tường (Sinh Đạo, Trí Đạo, Tâm Đạo kết hợp đường Định Mệnh thành chữ M)
2. Chỉ Tay Chữ Nhất (Simian Line / Quán Thông Thủ - Tâm Đạo và Trí Đạo chập một đường vắt ngang)
3. Chỉ Tay Thỏi Vàng (Nguyên Bảo - đan kín thành thỏi vàng tụ tài)
4. Ba Đường Tam Tài Cát Tướng (Sinh Đạo, Trí Đạo, Tâm Đạo sâu dài, mềm mại, song hành cát lợi)
5. Chỉ Tay Chữ X Thần Bí (Chữ thập X giữa Trí Đạo và Tâm Đạo)
6. Đường Trí Đạo Đuôi Cá (Đuôi đường trí tuệ rẽ nhánh cá uyên bác)
7. Bàn Tay Nóng Nảy / Hỏa Tướng (Theo BS. Josef Ranald - da đỏ hồng, nhiều vân phụ li ti đan chéo)
8. Bàn Tay Lãnh Đạm / Thủy Tướng (Theo BS. Josef Ranald - lòng tay mềm dày, ít đường chỉ, da trắng nhạt)
9. Bàn Tay Tự Ái / Hờn Giận / Kim Tướng (Theo BS. Josef Ranald - lòng bàn tay trũng sâu, ngón cái rất dài)
10. Bàn Tay Ương Ngạnh / Thổ Tướng (Theo BS. Josef Ranald - tay dày chắc nịch, gò Kim Tinh nổi gồ)
11. Ngón Cái Bay & Gò Kim Tinh Vượng (Tướng Danh Nhân Henry Rem)
12. Tiểu Thủ Mẫn Tiệp (Bàn tay nhỏ nhắn mẫn tiệp, gò Thái Dương sáng)

BẮT BUỘC ĐỊNH DẠNG ĐẦU RA THEO CÁC THẺ SAU:
[PHAN_LOAI] <Tên kiểu chỉ tay cụ thể được xếp loại> (Độ tương hợp: 90% - 98%) [/PHAN_LOAI]
[DAC_DIEM]
<Mô tả đặc điểm nhận dạng cụ thể trên lòng bàn tay: hình thế bàn tay (${handLabel}), độ sâu và đường đi của Sinh Đạo, Trí Đạo, Tâm Đạo cùng các gò Thái Dương, Kim Tinh, Mộc Tinh>
[/DAC_DIEM]
[LUAN_BAN]
<Luận giải chi tiết vận mệnh, sự nghiệp, tài lộc, tình duyên, hậu vận của ${displayName}>
[/LUAN_BAN]
[SUC_KHOE]
<Khảo cứu bệnh lý y khoa & thần kinh theo Bác sĩ Josef Ranald>
[/SUC_KHOE]
[LOI_KHUYEN]
<Lời khuyên phong thủy, tu dưỡng tâm tính để phát huy tối đa điềm lành>
[/LOI_KHUYEN]`;
    } else {
      prompt = `Bạn là Đại Sư Hình Tướng Cốt Cách Học (Tướng Pháp Toàn Thân & Khí Phách Á Đông).
Hãy nhìn bức ảnh dáng vóc toàn thân của đương số: "${displayName}" (${genderLabel}) và phân tích hình tướng.
BẮT BUỘC ĐỊNH DẠNG ĐẦU RA THEO CÁC THẺ SAU:
[PHAN_LOAI] <Tên kiểu cốt cách hình tướng: Long Hành Hổ Bộ / Cốt Cách Thanh Quý / Ngũ Hành Kim Mộc Thủy Hỏa Thổ> [/PHAN_LOAI]
[DAC_DIEM]
Tỷ lệ cơ thể, thế đứng, bờ vai, sống lưng và dáng dấp toát ra.
[/DAC_DIEM]
[LUAN_BAN]
Đại vận sự nghiệp, uy quyền, tài lộc và độ vững vàng hậu vận cho ${displayName}.
[/LUAN_BAN]
[LOI_KHUYEN]
Phương pháp bồi dưỡng chính khí và phong thái để chiêu tài tụ phúc.
[/LOI_KHUYEN]`;
    }

    if (sampleDetail) {
      prompt += `\n\nLƯU Ý CỔ THƯ: Bức ảnh này minh họa mẫu tướng: "${sampleDetail.name}". ${sampleDetail.description}. Hãy phân loại chính xác là "${sampleDetail.name}" và luận giải chuyên sâu bám sát vào mẫu này cho đương số ${displayName}!`;
    }

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

    return response.text || (sampleDetail?.analysisDetail || `[PHAN_LOAI] Tướng Mạo Cát Tường [/PHAN_LOAI]\n[LUAN_BAN] Tướng mạo của đương số ${displayName} thanh quý, khí sắc tràn trề phúc lộc. [/LUAN_BAN]`);
  } catch (error) {
    console.error("Gemini Vision Reading error:", error);
    if (sampleDetail?.analysisDetail) {
      return sampleDetail.analysisDetail;
    }
    if (type === 'face') {
      return `[PHAN_LOAI] Tướng Mặt Phúc Hậu Cát Tường (Độ tương hợp: 95%) [/PHAN_LOAI]
[DAC_DIEM]
Khuôn mặt của đương số ${displayName} có tỷ lệ Tam Đình cân đối, vầng trán cao rộng biểu lộ tư duy thông tuệ, ánh mắt có thần quang kiên định, Địa Các vững chãi.
[/DAC_DIEM]
[LUAN_BAN]
Đương số có gốc rễ phúc ấm sâu dày, làm việc có trách nhiệm và giữ chữ tín. Trung vận công danh hanh thông, hậu vận an khang, con cháu hiếu thuận vinh hiển.
[/LUAN_BAN]
[LOI_KHUYEN]
Giữ nụ cười hòa ái và tâm từ bi, "tướng tùy tâm sinh", phước đức sẽ ngày càng bồi đắp dồi dào.
[/LOI_KHUYEN]`;
    }
    if (type === 'palm') {
      return `[PHAN_LOAI] Ba Đường Tam Tài Cát Tướng (Độ tương hợp: 96%) [/PHAN_LOAI]
[DAC_DIEM]
Lòng bàn tay của đương số ${displayName} (${handLabel}) đầy đặn, sắc da hồng hào. Ba trục đại lộ Sinh Đạo - Trí Đạo - Tâm Đạo sâu dài, đường nét liền mạch không bị đứt đoạn, gò Kim Tinh nở nang vững chắc.
[/DAC_DIEM]
[LUAN_BAN]
Sinh lực dồi dào, trí tuệ mạch lạc và có khả năng ứng biến linh hoạt. Đường sự nghiệp có quý nhân tương trợ, tài vận tích lũy bền vững, hậu vận đại phát điền sản.
[/LUAN_BAN]
[SUC_KHOE]
Theo khảo cứu của Bác sĩ Josef Ranald: Khí huyết lưu thông điều hòa, sức bền tốt. Cần tránh thức khuya và giảm căng thẳng mắt khi làm việc với máy tính.
[/SUC_KHOE]
[LOI_KHUYEN]
Phát huy trực giác nhạy bén, giữ vững chữ tín trong thương trường ắt vạn sự hanh thông cát lợi.
[/LOI_KHUYEN]`;
    }
    return `[PHAN_LOAI] Cốt Cách Thanh Quý Tựa Thái Sơn (Độ tương hợp: 94%) [/PHAN_LOAI]
[DAC_DIEM]
Dáng vóc vững chãi, vai nở cân đối, thế đứng thẳng thắn tựa cây tùng trước gió.
[/DAC_DIEM]
[LUAN_BAN]
Bản mệnh có chí khí phi thường, phong thái đĩnh đạc tạo niềm tin cậy cho cộng sự. Đại vận trung niên có quyền uy và danh vọng lớn.
[/LUAN_BAN]
[LOI_KHUYEN]
Tập luyện khí công, đi đứng chững chạc để duy trì thần thái đế vương và tụ phúc khí dài lâu.
[/LOI_KHUYEN]`;
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


/**
 * Đại Tổng Luận Vận Mệnh Toàn Thư (Master Destiny Synthesis with Gemini 2.5 Flash)
 */
export async function generateMasterDestinySynthesisWithGemini(
  synthesisData: {
    personName: string;
    gender: 'nam' | 'nu';
    solarDateStr: string;
    lunarDateStr: string;
    canChiYear: string;
    menhNguHanh: string;
    cuc: string;
    cungMenh: string;
    cungThan: string;
    cungPhi: string;
    batTrachGroup: string;
    lifePathNumber?: number;
    hasFace: boolean;
    hasPalm: boolean;
    faceVerdict?: string;
    palmVerdict?: string;
    bodyVerdict?: string;
    currentAge?: number;
    lunarAge?: number;
    captureDateStr?: string;
    currentStageTitle?: string;
    stageProgressPercent?: number;
    tuViThanTransition?: string;
    facePalmRealtimeReflection?: string;
    immediateActionAdvice?: string;
    overallScore: number;
    offlineFallback: string;
  }
): Promise<string> {
  try {
    const ai = getAiClient();
    const prompt = `Bạn là Chưởng Môn Thiên Cơ Các - Bậc Thầy Tối Cao thông tuệ cả 4 môn huyền học Á Đông: Tử Vi Đẩu Số, Nhân Tướng Học, Thần Số Học Pythagoras và Phong Thủy Bát Trạch.
Hôm nay bạn tiến hành viết "ĐẠI TỔNG LUẬN VẬN MỆNH TOÀN THƯ" kết hợp toàn diện tất cả các thông tin đã thu thập được cho đương số:

THÔNG TIN ĐƯƠNG SỐ:
- Họ tên: ${synthesisData.personName} (${synthesisData.gender === 'nam' ? 'Nam Mạng' : 'Nữ Mạng'})
- Ngày sinh: ${synthesisData.solarDateStr} Dương Lịch (${synthesisData.lunarDateStr})
- Năm sinh: ${synthesisData.canChiYear} • Nạp Âm: ${synthesisData.menhNguHanh}
- Cung Mệnh: ${synthesisData.cungMenh} • Cung Thân: ${synthesisData.cungThan} • Cục: ${synthesisData.cuc}
- Bát Trạch Cung Phi: ${synthesisData.cungPhi} (${synthesisData.batTrachGroup})
- Con số chủ đạo Pythagoras: Số ${synthesisData.lifePathNumber || 8}
- Tướng Mạo & Chỉ Tay:
  ${synthesisData.hasFace ? `+ Tướng Mặt: ${synthesisData.faceVerdict || 'Tam Đình cân đối, trán cao sáng, mắt có thần quang'}` : '+ Chưa chụp tướng mặt'}
  ${synthesisData.hasPalm ? `+ Chỉ Tay: ${synthesisData.palmVerdict || 'Ba đại lộ Sinh - Trí - Tâm đạo sâu dài liền mạch, gò bàn tay nở nang'}` : '+ Chưa chụp chỉ tay'}
  ${synthesisData.bodyVerdict ? `+ Dáng vóc: ${synthesisData.bodyVerdict}` : ''}
- Thời điểm lưu dấu ảnh chụp: ${synthesisData.captureDateStr || 'Thời điểm lập hồ sơ'}
- Độ tuổi tại thời điểm chụp: ${synthesisData.currentAge || 35} tuổi (${synthesisData.lunarAge || 36} tuổi mụ)
- Chặng đường vận mệnh hiện tại: [${synthesisData.currentStageTitle || 'Thực Chiến • Xung Trận Lập Nghiệp'}] (Tiến trình dòng đời: ~${synthesisData.stageProgressPercent || 45}%)
- Điểm Vận Mệnh Định Mệnh Tổng Hòa: ${synthesisData.overallScore} / 100 Điểm.

YÊU CẦU BÀI ĐẠI TỔNG LUẬN:
Viết bài phân tích tổng hòa sâu sắc, uyên bác, văn phong kiếm hiệp / huyền học Á Đông trang trọng, mạch lạc, đắt giá gồm 5 chương:
1. TIÊN THIÊN VÀ HẬU THIÊN HỘI TỤ:
   - Tử Vi (Tiên thiên) kết hợp cùng Tướng Mạo & Chỉ tay (Hậu thiên): Tướng tùng tâm sinh, tướng mạo thực tế đang trợ lực hay chuyển hóa cung số thế nào?
   - Con số chủ đạo Pythagoras cộng hưởng ra sao với Cung Mệnh và Cung Thân?
2. BÁT TRẠCH ĐỊA KHÍ BẢO HỘ:
   - Cung Phi Bát Trạch tương tác thế nào để chiêu tài, tụ phúc và hóa giải hung sát.
3. TỔNG KẾT 4 ĐẠI GIAI ĐOẠN ĐỊNH MỆNH:
   - 1. Khởi Sinh (0 - 18 tuổi): Ươm mầm căn cốt, hấp thu phúc đức gia đình.
   - 2. Tu Luyện (19 - 30 tuổi): Mài gươm luyện ý chí, trui rèn qua thử thách đầu đời.
   - 3. Thực Chiến (31 - 50 tuổi): Hoàng kim bùng nổ, gặt hái thành tựu danh vọng.
   - 4. Hậu Vận (Từ 51 tuổi trở đi): Viên mãn an lạc, tích phúc truyền thừa, thọ trường điền sản.
4. ĐẶC BIỆT: NHẬN XÉT TỌA ĐỘ VẬN MỆNH TẠI THỜI ĐIỂM CHỤP ẢNH:
   - Nhận xét chi tiết: Ở thời điểm chụp ảnh (tuổi ${synthesisData.currentAge || 35}, tuổi mụ ${synthesisData.lunarAge || 36}), đương số đang đứng ở đâu trên hành trình nhân sinh?
   - Thần thái nét mặt, ánh mắt và chỉ tay chụp lại phản ánh nội lực và khí thế chiến đấu/tu dưỡng ra sao?
   - Sự chuyển giao quyền năng từ Cung Mệnh (${synthesisData.cungMenh}) sang Cung Thân (${synthesisData.cungThan}) trong Tử Vi đang tác động thế nào?
   - Lời khuyên hành động tức thời mang tính bước ngoặt ngay tại thời điểm này!
5. TỔNG LUẬN CẢI MỆNH PHÁP (TỨ TRỤ CẢI VẬN):
   - Lời khuyên vàng về Tu Thân, Dưỡng Tâm, Luyện Trí và Hành Thiện để đạt đến cảnh giới Đức Năng Thắng Số.
   
Định dạng bài viết đẹp, giàu cảm hứng và truyền năng lượng tích cực cho đương số.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || synthesisData.offlineFallback;
  } catch (err) {
    console.error("Gemini Master Synthesis error:", err);
    return synthesisData.offlineFallback;
  }
}
