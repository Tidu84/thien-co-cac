import { GoogleGenAI } from '@google/genai';
import { LoveMatchSummary, NumerologyReport, TuViPalace, TuViProfile } from '../types';
import { interpretTuViChartAuthentic } from './tuviInterpretationEngine';

// Initialize Gemini Client with preconfigured environment key
const getAiClient = () => {
  return new GoogleGenAI({
    apiKey: process.env.API_KEY,
    vertexai: true,
  });
};

/**
 * TRIẾT LÝ CỐT LÕI: CHỮA LÀNH, THẤU CẢM & TIẾP THÊM ĐỘNG LỰC SỐNG
 * Đa phần người tìm đến huyền học đều đang có nỗi niềm trăn trở, bế tắc hoặc mất phương hướng.
 * Mọi lời luận giải phải giữ chuẩn học thuật nhưng luôn hướng về ánh sáng, hy vọng và nghị lực.
 */
const HEALING_AND_HOPE_DIRECTIVE = `
NGUYÊN TẮC TÂM LÝ & ĐẠO ĐỨC LUẬN ĐOÁN (BẮT BUỘC TUÂN THỦ):
1. THẤU CẢM & CHỮA LÀNH: Hiểu rằng người tìm đến xem quẻ/lá số thường đang có nỗi niềm trăn trở, mệt mỏi hoặc đứng trước ngã rẽ cuộc đời. Hãy trò chuyện và luận giải như một người tri kỷ thông tuệ, ấm áp, nâng đỡ tinh thần.
2. CHUYỂN HUNG HÓA CÁT - BĨ CỰC THÁI LAI: Dù lá số có sao xấu, quẻ có hào động thử thách hay tuổi tác có phần xung khắc, TUYỆT ĐỐI KHÔNG phán bi quan, tuyệt vọng hay hù dọa tai ương. Hãy giải thích thử thách chỉ là giai đoạn "lửa thử vàng", là bước lùi lấy đà để đón vận hội mới tốt đẹp hơn.
3. TIẾP THÊM ĐỘNG LỰC & HY VỌNG: Luôn làm nổi bật điểm mạnh, giá trị đáng quý và nội lực tiềm ẩn của đương số. Kết thúc bằng những lời khích lệ thiết thực, giúp họ tin vào bản thân ("Đức năng thắng số, tâm sáng ắt vạn sự hanh thông") và cảm thấy nhẹ lòng, có thêm động lực vươn lên trong cuộc sống.`;

/**
 * Trò chuyện trực tiếp cùng Thầy Bói Giang Hồ (Xem tướng đoán mệnh)
 */
export async function chatWithLinhNhi(
  chatHistory: { role: 'user' | 'model'; text: string }[],
  userMessage: string,
  persona: 'male' | 'female' = 'male',
  userGender?: 'nam' | 'nu'
): Promise<{ reply: string; mood: 'mysterious' | 'happy' | 'thoughtful' | 'divine' | 'concerned'; suggestedTab?: 'iching' | 'tuvi' | 'love_match' | 'numerology' | 'facepalm' | 'western' }> {
  try {
    const ai = getAiClient();
    
    const formattedHistory = chatHistory.slice(-8).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const userAddress = persona === 'female' && userGender === 'nam'
      ? 'tiên sinh'
      : userGender === 'nam' ? 'thiện nam' : userGender === 'nu' ? 'nữ thí chủ' : 'bạn hữu';
    const personaIdentity = persona === 'female'
      ? `Bạn là Nữ Thầy Bói Nguyệt Cơ Tiên Nương, phong cách huyền bí cổ phong, dịu dàng và cuốn hút. Tự xưng là "Ta" hoặc "Thiếp", gọi người xem là "${userAddress}". Giữ lời nói tự nhiên, không tán tỉnh quá mức.`
      : `Bạn là Thiên Cơ Chân Nhân, Thầy Bói Giang Hồ phong cách truyện tranh / kiếm hiệp Á Đông. Tự xưng là "Ta" hoặc "Bần đạo", gọi người xem là "${userAddress}".`;
    const systemInstruction = `${personaIdentity}

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

5. PHONG THÁI & TÂM LÝ CHỮA LÀNH:
   Hào sảng, ấm áp, thấu cảm sâu sắc. Nếu thấy người dùng đang buồn bã, bế tắc, thất tình hay lo âu về tiền bạc/cuộc sống, hãy an ủi, khích lệ họ trước tiên để họ thấy nhẹ lòng và có hy vọng, rồi mới dẫn dắt vào quẻ bói.
${HEALING_AND_HOPE_DIRECTIVE}

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
      reply: persona === 'female'
        ? "Được thôi! Thiếp có thể cùng bạn hữu xem Tử Vi, Thần Số Học, Chỉ Tay, Tướng Mạo hoặc gieo một quẻ Kinh Dịch để soi đường sắp tới."
        : "Được thôi! Bần đạo có thể giúp bạn hữu xem Tử Vi, Thần Số Học, Chỉ Tay, Tướng Mạo hoặc gieo một quẻ Kinh Dịch để soi đường sắp tới.",
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

Hãy phân tích quẻ này thật sâu sắc theo phong cách cổ phong uy nghi nhưng dễ hiểu, ấm áp và truyền động lực:
1. Tổng quan vận thế (Thời - Vị - Trung - Chính): Nhấn mạnh cơ hội chuyển mình và ánh sáng hy vọng phía trước.
2. Lời giải trực tiếp cho việc người hỏi đang băn khoăn (Tài lộc, Sự nghiệp, Tình cảm, Sức khỏe): Giúp họ tháo gỡ nút thắt tâm lý.
3. Hào động / lời khuyên đắc sách: Hướng dẫn hành động tích cực để chuyển khó khăn thành bàn đạp vươn lên.
${HEALING_AND_HOPE_DIRECTIVE}
Hãy trả lời khoảng 250 - 350 từ bằng tiếng Việt trang nhã, ấm áp, sâu sắc và tiếp thêm niềm tin cuộc sống.`;

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
  canChiYear: string,
  palaceSummary = '',
  palacesData?: TuViPalace[]
): Promise<string> {
  const profile: TuViProfile = {
    fullName: name || 'Đương số',
    gender: (gender === 'nu' ? 'nu' : 'nam'),
    solarDate: solarDate || '1990-01-01',
    lunarDate: lunarDate || '',
    birthHour: birthHour || 'Thìn (07h00 - 08h59)',
    calendarType: 'solar',
    canChiYear: canChiYear || 'Canh Ngọ',
    canChiMonth: canChiMonth || '',
    canChiDay: canChiDay || '',
    menhNguHanh: menhNguHanh || 'Lộ Bàng Thổ',
    cuc: cuc || 'Thổ Ngũ Cục',
    cungMenh: cungMenh || 'Thìn',
    cungThan: cungThan || 'Tuất'
  };

  const getAuthenticFallback = () => {
    const interp = interpretTuViChartAuthentic(profile, palacesData);
    return `[THAY_PHAN]
${interp.thayPhan}
[/THAY_PHAN]
[BAN_MENH]
${interp.banMenh}
[/BAN_MENH]
[CONG_DANH]
${interp.congDanh}
[/CONG_DANH]
[TINH_DUYEN]
${interp.tinhDuyen}
[/TINH_DUYEN]
[VAN_HAN]
${interp.vanHan}
[/VAN_HAN]
[DAI_VAN_TIEN]
${interp.daiVanTien}
[/DAI_VAN_TIEN]
[DAI_VAN_DUONG_THOI]
${interp.daiVanDuongThoi}
[/DAI_VAN_DUONG_THOI]
[DAI_VAN_BUOC_NGOAT]
${interp.daiVanBuocNgoat}
[/DAI_VAN_BUOC_NGOAT]
[TIEU_VAN]
${interp.tieuVan}
[/TIEU_VAN]
[HOA_GIAI]
${interp.hoaGiai}
[/HOA_GIAI]
[NHAN_XET]
${interp.nhanXet}
[/NHAN_XET]`;
  };

  try {
    const ai = getAiClient();
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const birthYear = Number(solarDate.slice(0, 4));
    const currentAge = Number.isFinite(birthYear) && birthYear > 0 ? currentYear - birthYear : undefined;
    const decadeStart = currentAge === undefined ? 30 : Math.floor(currentAge / 10) * 10;
    const previousDecade = `${Math.max(0, decadeStart - 10)}-${Math.max(9, decadeStart - 1)}`;
    const currentDecade = `${decadeStart}-${decadeStart + 9}`;
    const nextDecade = `${decadeStart + 10}-${decadeStart + 19}`;
    const prompt = `Bạn là một Thầy Bói Giang Hồ đại sư Tử Vi Đẩu Số. Hãy luận giải lá số cho:
- Đương số: ${name} (${gender === 'nam' ? 'Nam' : 'Nữ'})
- Sinh Dương lịch: ${solarDate} | Âm lịch: ${lunarDate}
- Năm ${canChiYear} • Tháng ${canChiMonth} • Ngày ${canChiDay} • Giờ ${birthHour}
- Bản Mệnh: ${menhNguHanh} | Cục: ${cuc}
- Cung Mệnh: ${cungMenh} | Cung Thân: ${cungThan}
- Sao tại 12 cung đã an: ${palaceSummary || 'Chưa có dữ liệu sao chi tiết'}
- Năm hiện tại: ${currentYear}; năm kế tiếp: ${nextYear}; tuổi dương hiện tại ước tính: ${currentAge ?? 'chưa rõ'}

YÊU CẦU ĐẶC BIỆT:
- Không viết bài văn dài lê thê! Chia thành các phần ngắn gọn, súc tích, dễ nghe.
- Luận vận hạn theo hướng tham khảo và tự chiêm nghiệm; không khẳng định tai họa, không bịa tháng cụ thể khi thiếu dữ liệu, không khuyên cúng bái hay chi tiền giải hạn.
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
(2-3 câu về xu hướng chung của ${currentYear}; nêu cơ hội và điều nên cẩn trọng, không phán chắc tháng cụ thể)
[/VAN_HAN]

[DAI_VAN_TIEN]
(Một giai đoạn đại vận trước tuổi hiện tại: ghi khoảng tuổi 10 năm và 1-2 câu về cơ hội/thử thách; nếu đương số còn trẻ, chọn giai đoạn sắp tới thay vì bịa quá khứ)
[/DAI_VAN_TIEN]

[DAI_VAN_DUONG_THOI]
(Giai đoạn 10 năm bao quanh tuổi hiện tại ${currentAge ?? 'chưa rõ'} hoặc giai đoạn gần nhất; ghi rõ khoảng tuổi và trọng tâm cần xây dựng)
[/DAI_VAN_DUONG_THOI]

[DAI_VAN_BUOC_NGOAT]
(Một giai đoạn 10 năm khác có ý nghĩa bước ngoặt; ghi khoảng tuổi và 1-2 câu. Các giai đoạn phải hợp lý, tránh lời phán tuyệt đối)
[/DAI_VAN_BUOC_NGOAT]

[TIEU_VAN]
(Luận 12-24 tháng tới, tập trung ${currentYear} và ${nextYear}: 2-3 câu nêu điểm sáng có thể chủ động nắm bắt và cạm bẫy thực tế nên tránh về tiền bạc, thị phi, sức khỏe hoặc tình duyên. Không khẳng định sự kiện chắc chắn)
[/TIEU_VAN]

[HOA_GIAI]
(1-2 câu ngắn, thực tế, tích cực theo tinh thần đức năng thắng số; khuyên hành động cụ thể, không mê tín dị đoan)
[/HOA_GIAI]

[NHAN_XET]
(Lời thầy bói nhận xét tổng kết đầy ấm áp, khích lệ tinh thần và 1 bí quyết cải mệnh thiết thực giúp đương số thêm vững tin yêu đời)
[/NHAN_XET]

${HEALING_AND_HOPE_DIRECTIVE}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      }
    });

    return response.text || getAuthenticFallback();
  } catch (error) {
    console.error("Gemini TuVi error, switching to authentic ancient TuVi engine:", error);
    return getAuthenticFallback();
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
- Trả lời bằng phong thái Thầy Bói Giang Hồ: hào sảng, sắc bén, chân thành, ấm áp và tiếp thêm động lực (khoảng 70 - 130 từ).
- Luận rõ thời cơ, cách vượt qua thử thách và đưa ra 1 lời khuyên thực tế để chuyển hung hóa cát, giúp đương số vững tâm.
- Có thể dùng 1 câu khẩu quyết hoặc vần điệu ngắn gọn khích lệ tinh thần cuối câu.
${HEALING_AND_HOPE_DIRECTIVE}`;

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

    const prompt = `Bạn là một Nhà Tiên Tri Thần Số Học Pythagoras phương Tây (Western Numerology Prophet) uyên bác, giàu thấu cảm và am tường trường năng lượng các con số.
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

Viết với văn phong trang nhã, ấm áp, thấu tình đạt lý, truyền cảm hứng yêu thương và xây đắp hôn nhân bền vững.
${HEALING_AND_HOPE_DIRECTIVE}`;

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
      prompt = `Bạn là một bậc thầy Nhân Tướng Học (Tướng Pháp Ma Y Thần Tướng & Liễu Trang Tướng Pháp).
Hãy quan sát bức ảnh khuôn mặt chụp thực tế của đương số: "${displayName}" (${genderLabel}) và phân tích tướng mạo cát hung.

DANH SÁCH 8 MẪU TƯỚNG KHUÔN MẶT CHUẨN CỔ THƯ ĐỂ ĐỐI CHIẾU:
1. "Tướng Mặt Chữ Điền": Khuôn mặt vuông vức đầy đặn, xương quai hàm nở nang, cương trực, trung hậu, hậu vận giàu sang vững như bàn thạch.
2. "Tướng Mặt Chữ Viên": Khuôn mặt tròn trịa đầy đặn, má bầu bĩnh phúc hậu, tính tình hòa nhã, duyên kinh doanh buôn bán đại phát, tụ tài tụ phúc.
3. "Tướng Mặt Trái Xoan": Khuôn mặt thon gọn thanh tú, đường nét mềm mại, cằm thon tròn, thông minh khéo léo, quý nhân phù trợ, gia đạo êm ấm.
4. "Tướng Mặt Chữ Giáp": Trán cao rộng, khuôn mặt thon dần về cằm thanh tú (hình tam giác ngược), trí tuệ siêu quần, tài hoa xuất chúng, tiền vận sớm đỗ đạt danh vọng.
5. "Tướng Mặt Chữ Do": Trán hẹp cằm nở (hình tam giác xuôi), tự lực cánh sinh, bền bỉ kiên cường, khổ tận cam lai, trung và hậu vận đại phát điền sản đất đai.
6. "Tướng Mặt Chữ Đồng": Mặt chữ nhật vuông tròn hài hòa, ngũ nhạc triều quy, mày rậm mắt sáng, cốt cách đại tướng lãnh tụ uy quyền hiển hách, tài đức vẹn toàn.
7. "Tướng Mặt Chữ Mục": Khuôn mặt thon dài thanh nhã, sống mũi cao thẳng, thâm trầm kín đáo, thích tư duy triết lý sâu sắc, tâm tính thanh cao trường thọ.
8. "Tướng Mặt Tam Đình Bình Quân": Thượng đình, Trung đình, Hạ đình chia đều tỉ lệ vàng 1:1:1, cả tiền vận - trung vận - hậu vận đều hanh thông đại cát đại lợi.

QUY TẮC ĐỐI CHIẾU MẪU CỔ THƯ BẮT BUỘC:
1. So sánh hình ảnh thực tế của đương số với 8 mẫu chuẩn trên, chọn ra DUY NHẤT 1 mẫu mà khuôn mặt của đương số tương đồng hoặc gần giống nhất.
2. Nói rõ với đương số biết họ thuộc mẫu nào ngay tại thẻ [PHAN_LOAI] và câu đầu tiên của [DAC_DIEM].
3. Đưa ra toàn bộ luận giải cát hung, sự nghiệp, tài lộc, tình duyên theo đúng quy chuẩn cổ thư của mẫu đó!

BẮT BUỘC ĐỊNH DẠNG ĐẦU RA THEO CÁC THẺ:
[PHAN_LOAI] <Tên 1 trong 8 mẫu chuẩn ở trên> (Độ tương hợp: 90% - 98%) [/PHAN_LOAI]
[DAC_DIEM]
Dựa trên hình ảnh chụp thực tế của bạn, nét tướng mặt tương đồng gần nhất với mẫu: <Tên Mẫu Chuẩn>. Các đặc điểm cụ thể đối chiếu gồm:
- Tam Đình (Thượng Đình - Trán, Trung Đình - Mắt & Mũi, Hạ Đình - Miệng & Cằm)
- Ngũ Quan & hình dáng khung xương đối chiếu với mẫu
[/DAC_DIEM]
[LUAN_BAN]
Luận bàn tính cách, sự nghiệp, tài lộc, hôn nhân và vận thế các giai đoạn cuộc đời bám sát theo mẫu chuẩn đã đối chiếu cho đương số ${displayName}.
[/LUAN_BAN]
[LOI_KHUYEN]
Lời khuyên tu tâm dưỡng tướng và kích hoạt vượng khí theo phép nhân tướng học.
[/LOI_KHUYEN]`;
    } else if (type === 'palm') {
      prompt = `Bạn là bậc thầy Xem Chỉ Tay (Thủ Tướng Học Đông Tây kết hợp: Cổ thư Á Đông và nghiên cứu giải phẫu của Bác sĩ Josef Ranald & Henry Rem).
Đương số: "${displayName}" (${genderLabel}, chụp ${handLabel}).

DANH SÁCH 12 MẪU CHỈ TAY CHUẨN ĐỂ ĐỐI CHIẾU:
1. "Chỉ Tay Chữ M": Sinh Đạo, Trí Đạo, Định Mệnh và Tâm Đạo kết hợp thành chữ M rõ nét. Trực giác siêu phàm, lãnh đạo kiệt xuất, trung vận đại phát.
2. "Chỉ Tay Chữ Nhất (Simian Line)": Tâm Đạo và Trí Đạo chập làm một đường ngang duy nhất (Quán Thông Thủ). Bản lĩnh phi thường, quyết đoán sắt đá, kỳ tài giang hồ.
3. "Chỉ Tay Thỏi Vàng (Nguyên Bảo)": Các đường chỉ tay đan kín thành hình thang/thỏi vàng tụ tài. Có kho cất giữ tiền của trời ban, giữ tiền cực giỏi, đại phú.
4. "Ba Đường Tam Tài Cát Tướng": Sinh Đạo, Trí Đạo, Tâm Đạo sâu dài, mềm mại, song hành cát lợi. Vạn sự hanh thông, quý nhân phù trợ trọn đời.
5. "Chỉ Tay Chữ X Thần Bí": Chữ thập X ngự giữa Trí Đạo và Tâm Đạo. Giác quan thứ 6 nhạy bén, tâm thiện lương, có duyên với huyền thuật và được bề trên che chở.
6. "Đường Trí Đạo Đuôi Cá": Đuôi đường trí tuệ rẽ nhánh đuôi cá uyên bác. Trí tuệ song toàn, tư duy sắc sảo, giỏi cả chuyên môn lẫn ngoại giao.
7. "Bàn Tay Nóng Nảy (Hỏa Tướng)": Theo BS. Josef Ranald - lòng bàn tay đỏ hồng, nhiều vân phụ li ti đan chéo, cá tính quyết liệt, hành động nhanh.
8. "Bàn Tay Lãnh Đạm (Thủy Tướng)": Theo BS. Josef Ranald - lòng tay mềm dày, ít đường chỉ phụ, da trắng nhạt, tư duy logic, điềm tĩnh sâu sắc.
9. "Bàn Tay Tự Ái (Kim Tướng)": Theo BS. Josef Ranald - lòng bàn tay trũng sâu, ngón cái rất dài, Trí Đạo thẳng tắp, tham vọng lớn, ý chí kiên định.
10. "Bàn Tay Ương Ngạnh (Thổ Tướng)": Theo BS. Josef Ranald - bàn tay dày chắc nịch, gò Kim Tinh nổi gồ, ngay thẳng, không khuất phục trước khó khăn.
11. "Ngón Cái Bay & Gò Kim Tinh Vượng": Tướng Danh Nhân theo Henry Rem - ngón tay hình cái bay, năng lực thực tiễn phi thường và sáng tạo kiệt xuất.
12. "Tiểu Thủ Mẫn Tiệp": Bàn tay nhỏ nhắn thanh thoát, gò Thái Dương sáng rực, khéo léo thông minh, ứng biến tài tình.

QUY TẮC ĐỐI CHIẾU MẪU CỔ THƯ BẮT BUỘC:
1. So sánh hình ảnh bàn tay thực tế (${handLabel}) của đương số với 12 mẫu chuẩn trên, chọn ra DUY NHẤT 1 mẫu mà các đường chỉ tay hoặc hình thế bàn tay của đương số gần giống hoặc tương đồng nhất.
2. Nói rõ với đương số biết họ thuộc mẫu nào ngay tại thẻ [PHAN_LOAI] và câu đầu tiên của [DAC_DIEM].
3. Đưa ra toàn bộ luận giải chi tiết theo đúng quy chuẩn của mẫu đó!

BẮT BUỘC ĐỊNH DẠNG ĐẦU RA THEO CÁC THẺ:
[PHAN_LOAI] <Tên 1 trong 12 mẫu chuẩn ở trên> (Độ tương hợp: 90% - 98%) [/PHAN_LOAI]
[DAC_DIEM]
Dựa trên hình ảnh chụp thực tế bàn tay (${handLabel}) của bạn, đường chỉ tay và gò bàn tay tương đồng gần nhất với mẫu: <Tên Mẫu Chuẩn>. Các đặc điểm cụ thể đối chiếu gồm:
- Thế bàn tay, độ sâu và hướng đi của 3 đường Sinh Đạo, Trí Đạo, Tâm Đạo đối chiếu với mẫu
- Trạng thái các gò (Thái Dương, Kim Tinh, Mộc Tinh) và các vân đặc biệt
[/DAC_DIEM]
[LUAN_BAN]
Luận giải chi tiết sự nghiệp, tài lộc, tình duyên, hậu vận bám sát theo mẫu chuẩn đã đối chiếu cho đương số ${displayName}.
[/LUAN_BAN]
[SUC_KHOE]
Khảo cứu sức khỏe và hệ thần kinh theo nghiên cứu của Bác sĩ Josef Ranald.
[/SUC_KHOE]
[LOI_KHUYEN]
Lời khuyên phong thủy và tu dưỡng tâm tính để phát huy tối đa điềm lành.
[/LOI_KHUYEN]`;
    } else {
      prompt = `Bạn là Đại Sư Hình Tướng Cốt Cách Học (Tướng Pháp Toàn Thân & Khí Phách Á Đông).
Đương số: "${displayName}" (${genderLabel}).

DANH SÁCH 8 MẪU TƯỚNG DÁNG NGƯỜI CỐT CÁCH CHUẨN CỔ THƯ ĐỂ ĐỐI CHIẾU:
1. "Tướng Quý Phái (Long Hành Hổ Bộ)": Dáng đi uyển chuyển như rồng lượn, bước chân vững như hổ phục, vai rộng ngực nở, ngồi vững như núi Thái Sơn. Đại phú đại quý, cốt cách đế vương lãnh tụ.
2. "Tướng Uy Dũng (Kim Hình Cương Trực)": Khung xương vuông vắn vững chắc, khớp xương rắn rỏi, dáng đứng sừng sững, giọng nói hào sảng. Bản lĩnh quả quyết, ý chí sắt đá, thích hợp làm chủ cầm quân.
3. "Tướng Thanh Nhã (Mộc Hình Thanh Tú)": Thân hình thanh mảnh cao ráo, ngón tay búp măng, phong thái nho nhã học sĩ, bước đi thanh thoát. Trí tuệ uyên bác, tiên phong đạo cốt.
4. "Tướng Viên Mãn (Thủy Hình Đôn Hậu)": Thân hình tròn trịa đẫy đà, vai tròn mông nở, bước đi đĩnh đạc vững vàng. Tính tình hòa nhã bao dung, tụ khí tụ tài, hậu vận hưởng đại phú quý.
5. "Tướng Duệ Trí (Hỏa Hình Tinh Anh)": Dáng chữ V ngược, vai rộng eo thon, bước chân nhanh nhẹn quyết liệt như lửa cuộn. Năng lượng hành động phi thường, dũng khí tiên phong khai phá đại nghiệp.
6. "Tướng Trung Kiên (Thổ Hình Vững Chắc)": Thân hình vạm vỡ đầm chắc, vai gấu lưng dày, trầm ổn như đại địa, ăn chắc mặc bền, giữ chữ tín ngàn vàng, điền sản đất đai dồi dào muôn đời.
7. "Tướng Trường Thọ (Hạc Hình Siêu Thoát)": Cổ cao thanh thoát, thân hình thanh mảnh không chút mỡ thừa, bước đi khoan thai tự tại như hạc nội mây ngàn. Cốt cách thoát tục, trường thọ vô ưu.
8. "Tướng Phúc Đức (Quy Bối Hậu Trọng)": Lưng tròn đầy đặn dày thịt u lên tự nhiên như mai rùa (Quy bối), khí tức sâu dài, ngồi vững như kiềng ba chân. Phúc trạch sâu dày, vượt mọi bão giông bình an.

QUY TẮC ĐỐI CHIẾU MẪU CỔ THƯ BẮT BUỘC:
1. So sánh hình ảnh thực tế dáng vóc của đương số với 8 mẫu chuẩn trên, chọn ra DUY NHẤT 1 mẫu mà dáng người của đương số tương đồng hoặc gần giống nhất.
2. Nói rõ với đương số biết họ thuộc mẫu nào ngay tại thẻ [PHAN_LOAI] và câu đầu tiên của [DAC_DIEM].
3. Đưa ra toàn bộ luận giải chi tiết theo đúng quy chuẩn cổ thư của mẫu đó!

BẮT BUỘC ĐỊNH DẠNG ĐẦU RA THEO CÁC THẺ:
[PHAN_LOAI] <Tên 1 trong 8 mẫu chuẩn ở trên> (Độ tương hợp: 90% - 98%) [/PHAN_LOAI]
[DAC_DIEM]
Dựa trên hình ảnh chụp thực tế của bạn, dáng vóc cốt cách tương đồng gần nhất với mẫu: <Tên Mẫu Chuẩn>. Các đặc điểm cụ thể đối chiếu gồm:
- Tỷ lệ cơ thể, bờ vai, sống lưng, thế đứng đối chiếu với mẫu
[/DAC_DIEM]
[LUAN_BAN]
Đại vận sự nghiệp, uy quyền, tài lộc và độ vững vàng hậu vận bám sát theo mẫu chuẩn đã đối chiếu cho đương số ${displayName}.
[/LUAN_BAN]
[LOI_KHUYEN]
Phương pháp bồi dưỡng chính khí và phong thái để chiêu tài tụ phúc.
[/LOI_KHUYEN]`;
    }

    if (sampleDetail) {
      prompt += `\n\nLƯU Ý CỔ THƯ: Bức ảnh này minh họa mẫu tướng: "${sampleDetail.name}". ${sampleDetail.description}. Hãy phân loại chính xác là "${sampleDetail.name}" và luận giải chuyên sâu bám sát vào mẫu này cho đương số ${displayName}!`;
    }
    prompt += `\n${HEALING_AND_HOPE_DIRECTIVE}`;

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
    const prompt = `Bạn là một Nhà Tiên Tri Tarot huyền bí phương Tây, sở hữu trực giác sắc bén và khả năng thấu thị vận mệnh sâu sắc.
Người hỏi băn khoăn về: "${question || 'Định hướng cuộc sống và tình cảm sắp tới'}"
Trải bài 3 lá nhận được:
${cardsDesc}

Hãy liên kết mạch câu chuyện giữa Quá khứ - Hiện tại - Tương lai:
1. Bài học đã trải qua trong quá khứ tạo nên tình cảnh này.
2. Thử thách hoặc thông điệp cốt lõi ở hiện tại bạn cần đối diện.
3. Tiềm năng và chiều hướng phát triển ở tương lai.
4. Lời sấm truyền thiêng liêng từ Nhà Tiên Tri để đương số đạt được bình yên và thành công.

Trả lời với giọng văn của một Nhà Tiên Tri huyền bí, ấm áp, sâu sắc và chữa lành.`;

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
    const prompt = `Bạn là Nhà Tiên Tri Cổ Xưa sở hữu Quả Cầu Pha Lê Thần Dụ phương Tây.
Người tìm kiếm hỏi quả cầu: "${userQuestion || 'Tương lai phía trước của tôi sẽ ra sao?'}"

Hãy nhập vai Nhà Tiên Tri xuất thần: sương mù đang cuộn xoáy trong khối pha lê trong suốt, những tia chớp màu lam và tím lóe lên... Bạn nhìn thấy viễn cảnh gì?
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
Viết bài phân tích tổng hòa sâu sắc, uyên bác, văn phong kiếm hiệp / huyền học Á Đông trang trọng, mạch lạc, đắt giá gồm 6 chương:
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
5. VẬN HẠN & THỜI VẬN:
   - Nêu 2-3 đại vận 10 năm theo các mốc tuổi hợp lý với tuổi hiện tại ${synthesisData.currentAge ?? 'chưa rõ'}; chỉ rõ một giai đoạn tiền vận và giai đoạn đương thời/bước ngoặt.
   - Phân tích 12-24 tháng tính từ năm ${new Date().getFullYear()}, gồm điểm sáng có thể nắm bắt và rủi ro thực tế nên phòng ngừa về tiền bạc, quan hệ, sức khỏe hoặc tình cảm.
   - Dùng ngôn ngữ tham khảo, không khẳng định tai họa hay sự kiện chắc chắn; không khuyên cúng bái hoặc chi tiền giải hạn.
6. TỔNG LUẬN CẢI MỆNH PHÁP (TỨ TRỤ CẢI VẬN):
   - Lời khuyên vàng về Tu Thân, Dưỡng Tâm, Luyện Trí và Hành Thiện để đạt đến tinh thần Đức Năng Thắng Số; kèm 1-2 hành động thực tế.
   
Định dạng bài viết đẹp, giàu cảm hứng và truyền năng lượng tích cực cho đương số.
${HEALING_AND_HOPE_DIRECTIVE}`;

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

