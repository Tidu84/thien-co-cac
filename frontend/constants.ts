import { TarotCard, DirectionQuality } from './types';

export const HEXAGRAMS_MAP: Record<number, { name: string; meaning: string; judgement: string }> = {
  1: { name: "Bát Thuần Càn (Càn Vi Thiên)", meaning: "Vạn vật khởi sinh, nguyên khí cực thịnh, thuận buồm xuôi gió", judgement: "Đại cát hanh thông, tượng trưng cho rồng bay trên trời. Cần giữ lòng kiên trực và chính đạo." },
  2: { name: "Bát Thuần Khôn (Khôn Vi Địa)", meaning: "Bao la đức dày, nhu thuận tiếp nhận thời cơ, tích tiểu thành đại", judgement: "Tốt cho việc thuận theo thời thế, không nên manh động, hãy học tính nhu hòa của đất mẹ." },
  11: { name: "Địa Thiên Thái", meaning: "Thời vận thái bình, âm dương giao hòa, cát tường như ý", judgement: "Vạn sự hanh thông, kẻ tiểu nhân lui xa, người quân tử tiến bước. Cơ hội vàng để khởi sự." },
  12: { name: "Thiên Địa Bĩ", meaning: "Bế tắc tạm thời, âm dương cách trở, nên ẩn nhẫn chờ thời", judgement: "Thời vận chưa thuận, không nên mưu sự lớn kẻo hao tài. Hãy trau dồi nội lực." },
  14: { name: "Hỏa Thiên Đại Hữu", meaning: "Mặt trời chiếu sáng thiên đình, của cải đầy nhà, công danh rực rỡ", judgement: "Quẻ cực thịnh, tiền bạc và sự nghiệp thăng hoa. Nhớ giữ đức khiêm nhường." },
  24: { name: "Địa Lôi Phục", meaning: "Phục sinh tái khởi, ánh sáng quay lại sau đêm dài tăm tối", judgement: "Đã qua giai đoạn gian nan, vận khí đang đâm chồi nảy lộc. Bạn bè tương trợ." },
  29: { name: "Bát Thuần Khảm (Khảm Vi Thủy)", meaning: "Trùng trùng hiểm trở, dòng nước cuộn xiết, cần vững tâm bền chí", judgement: "Gặp cảnh nguy khốn nhưng lòng thành tín sẽ mở lối thoát. Giữ tâm chính không hoảng loạn." },
  30: { name: "Bát Thuần Ly (Ly Vi Hỏa)", meaning: "Lửa sáng bừng soi bóng, vạn sự quang minh, minh bạch sáng tỏ", judgement: "Trí tuệ minh mẫn, văn chương thi cử đại lợi, nên gắn kết với người hiền tài." },
  42: { name: "Phong Lôi Ích", meaning: "Tăng ích bồi đắp, gió và sấm trợ thế, tài lộc dồi dào", judgement: "Lợi cho việc đi xa, tiến hành dự án mới, san sẻ phúc lành sẽ càng thêm thịnh vượng." },
  63: { name: "Thủy Hỏa Ký Tế", meaning: "Mọi việc đã hoàn thành, cân đối hoàn hảo, đề phòng sơ sểnh", judgement: "Thành công trước mắt, nhưng vật cực tất phản, cần thận trọng giữ gìn thành quả." },
  64: { name: "Hỏa Thủy Vị Tế", meaning: "Chưa xong, chuẩn bị bước vào chu kỳ đổi mới đầy hứa hẹn", judgement: "Đang trên đà phát triển, chuẩn bị vượt sông, cần chuẩn bị chu đáo sẽ thành đại nghiệp." }
};

export const TAROT_DECK: TarotCard[] = [
  {
    id: "fool",
    name: "The Fool",
    vietnameseName: "Kẻ Khờ Khạo (0)",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80",
    keywords: ["Khởi đầu mới", "Ngây thơ", "Tự do phiêu lưu", "Tiềm năng vô hạn"],
    meaningUpright: "Khởi đầu một hành trình mới đầy hứng khởi, bước đi với niềm tin mãnh liệt vào vũ trụ.",
    meaningReversed: "Sự bất cẩn, ngây thơ thái quá, liều lĩnh không tính toán dẫn đến rủi ro."
  },
  {
    id: "magician",
    name: "The Magician",
    vietnameseName: "Nhà Ảo Thuật (I)",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    keywords: ["Ý chí mạnh mẽ", "Tài năng", "Hiện thực hóa mục tiêu", "Quyền năng"],
    meaningUpright: "Bạn có đầy đủ tài nguyên và kỹ năng để biến ý tưởng thành hiện thực ngay lúc này.",
    meaningReversed: "Lợi dụng tài năng để thao túng, tài năng bị thui chột hoặc thiếu tự tin."
  },
  {
    id: "high_priestess",
    name: "The High Priestess",
    vietnameseName: "Nữ Tư Tế (II)",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&q=80",
    keywords: ["Trực giác", "Bí ẩn tiềm thức", "Trí tuệ nội tâm", "Tĩnh lặng"],
    meaningUpright: "Hãy lắng nghe tiếng nói sâu thẳm trong tâm hồn, câu trả lời nằm ở trực giác tĩnh lặng.",
    meaningReversed: "Lờ đi linh cảm, sống quá bề nổi, bí mật giấu kín có thể gây tổn thương."
  },
  {
    id: "empress",
    name: "The Empress",
    vietnameseName: "Nữ Hoàng (III)",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    keywords: ["Trù phú", "Nuôi dưỡng", "Sáng tạo nghệ thuật", "Tình mẫu tử"],
    meaningUpright: "Thời kỳ thu hoạch phước lành, tình cảm thăng hoa, tài lộc sinh sôi màu mỡ.",
    meaningReversed: "Tắc nghẽn sáng tạo, lệ thuộc cảm xúc hoặc bỏ bê chăm sóc bản thân."
  },
  {
    id: "emperor",
    name: "The Emperor",
    vietnameseName: "Hoàng Đế (IV)",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
    keywords: ["Kỷ luật", "Quyền lực", "Cấu trúc vững chãi", "Bảo vệ"],
    meaningUpright: "Thiết lập trật tự, lãnh đạo quyết đoán, bảo vệ vững chắc những gì đã gầy dựng.",
    meaningReversed: "Chuyên chế độc đoán, cứng nhắc, bất an trước sự thay đổi."
  },
  {
    id: "wheel_of_fortune",
    name: "Wheel of Fortune",
    vietnameseName: "Bánh Xe Số Phận (X)",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80",
    keywords: ["Thời vận", "Định mệnh", "Bước ngoặt lớn", "Cơ duyên"],
    meaningUpright: "Vận may xoay vần đem đến cơ hội hiếm có, bước ngoặt định mệnh đưa bạn lên tầm cao mới.",
    meaningReversed: "Chu kỳ xui rủi tạm thời, cảm giác mất kiểm soát, cần bình tâm nhẫn nại."
  },
  {
    id: "the_star",
    name: "The Star",
    vietnameseName: "Ngôi Sao Hy Vọng (XVII)",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&q=80",
    keywords: ["Hy vọng tái sinh", "Bình an tâm hồn", "Ánh sáng dẫn lối", "Chữa lành"],
    meaningUpright: "Ánh sáng chiếu rọi xua tan giông bão, tâm hồn an lạc và niềm tin được tái sinh.",
    meaningReversed: "Mất niềm tin, thất vọng chán nản, bi quan nhìn nhận vấn đề."
  },
  {
    id: "the_sun",
    name: "The Sun",
    vietnameseName: "Mặt Trời (XIX)",
    image: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?w=400&q=80",
    keywords: ["Chiến thắng", "Hân hoan", "Rạng rỡ", "Thành công trọn vẹn"],
    meaningUpright: "Thành công vang dội, niềm vui ngập tràn, sức sống rực rỡ và sự công nhận xứng đáng.",
    meaningReversed: "Thành công bị chậm trễ, niềm vui chưa trọn vẹn hoặc tự mãn quá mức."
  }
];

export const CELESTIAL_STEMS = ["Giáp", "Ất", "Bính", "Đinh", "Mậu", "Kỷ", "Canh", "Tân", "Nhâm", "Quý"];
export const TERRESTRIAL_BRANCHES = ["Tý", "Sửu", "Dần", "Mão", "Thìn", "Tỵ", "Ngọ", "Mùi", "Thân", "Dậu", "Tuất", "Hợi"];
export const FIVE_ELEMENTS = ["Kim", "Thủy", "Mộc", "Hỏa", "Thổ"];

export const PALACES = [
  "Mệnh", "Phụ Mẫu", "Phúc Đức", "Điền Trạch", 
  "Quan Lộc", "Nô Bộc", "Thiên Di", "Tật Ách", 
  "Tài Bạch", "Tử Tức", "Phu Thê", "Huynh Đệ"
];

/**
 * CƠ SỞ DỮ LIỆU CHUẨN XÁC TRỌN VẸN 60 LỤC THẬP HOA GIÁP & NẠP ÂM NGŨ HÀNH
 * Năm 1984 khởi điểm chu kỳ Can Chi: Giáp Tý (Hải Trung Kim)
 */
export interface HoaGiapEntry {
  canChi: string;
  napAm: string;
  hanh: 'Kim' | 'Thủy' | 'Mộc' | 'Hỏa' | 'Thổ';
  yNghia: string;
}

export const LUC_THAP_HOA_GIAP: HoaGiapEntry[] = [
  { canChi: "Giáp Tý", napAm: "Hải Trung Kim", hanh: "Kim", yNghia: "Vàng dưới đáy biển sâu, tiềm ẩn ngọc báu, tĩnh tại sâu sắc" },
  { canChi: "Ất Sửu", napAm: "Hải Trung Kim", hanh: "Kim", yNghia: "Vàng dưới biển, nội tâm kiên định, đại khí vãn thành" },
  { canChi: "Bính Dần", napAm: "Lư Trung Hỏa", hanh: "Hỏa", yNghia: "Lửa trong lò, nhiệt huyết dồi dào, ý chí tiên phong" },
  { canChi: "Đinh Mão", napAm: "Lư Trung Hỏa", hanh: "Hỏa", yNghia: "Lửa trong lò, quang minh rực rỡ, tinh anh phát tiết" },
  { canChi: "Mậu Thìn", napAm: "Đại Lâm Mộc", hanh: "Mộc", yNghia: "Cây rừng lớn, râm mát chở che, bản lĩnh vững vàng" },
  { canChi: "Kỷ Tỵ", napAm: "Đại Lâm Mộc", hanh: "Mộc", yNghia: "Gỗ rừng già, sức sống mãnh liệt, tài đức vẹn toàn" },
  { canChi: "Canh Ngọ", napAm: "Lộ Bàng Thổ", hanh: "Thổ", yNghia: "Đất ven đường, tâm tính quảng đại, rộng mở đón nhận" },
  { canChi: "Tân Mùi", napAm: "Lộ Bàng Thổ", hanh: "Thổ", yNghia: "Đất ven đường, nhân hậu thật thà, tích lũy trường cửu" },
  { canChi: "Nhâm Thân", napAm: "Kiếm Phong Kim", hanh: "Kim", yNghia: "Vàng mũi kiếm, sắc bén cương nghị, quyết đoán thành công" },
  { canChi: "Quý Dậu", napAm: "Kiếm Phong Kim", hanh: "Kim", yNghia: "Vàng mũi kiếm, tài năng xuất chúng, dũng cảm đối diện thử thách" },
  { canChi: "Giáp Tuất", napAm: "Sơn Đầu Hỏa", hanh: "Hỏa", yNghia: "Lửa trên đỉnh núi, tầm nhìn cao xa, rực rỡ chân trời" },
  { canChi: "Ất Hợi", napAm: "Sơn Đầu Hỏa", hanh: "Hỏa", yNghia: "Lửa trên núi, nhiệt thành tận tụy, phúc ấm sâu dày" },
  { canChi: "Bính Tý", napAm: "Giản Hạ Thủy", hanh: "Thủy", yNghia: "Nước khe suối, thông minh uyển chuyển, linh hoạt thích ứng" },
  { canChi: "Đinh Sửu", napAm: "Giản Hạ Thủy", hanh: "Thủy", yNghia: "Nước dưới khe, sâu lắng mẫn tiệp, tích tụ tài hoa" },
  { canChi: "Mậu Dần", napAm: "Thành Đầu Thổ", hanh: "Thổ", yNghia: "Đất trên bờ thành, thế vững ngàn thu, thành trì kiên cố" },
  { canChi: "Kỷ Mão", napAm: "Thành Đầu Thổ", hanh: "Thổ", yNghia: "Đất đắp lũy thành, trọng danh dự tín nghĩa, hậu vận bền vững" },
  { canChi: "Canh Thìn", napAm: "Bạch Lạp Kim", hanh: "Kim", yNghia: "Vàng trong sáp trắng, thuần khiết sáng ngời, thanh khiết vô nhiễm" },
  { canChi: "Tân Tỵ", napAm: "Bạch Lạp Kim", hanh: "Kim", yNghia: "Vàng trong sáp, tinh luyện thành khí, quý hiển phong lưu" },
  { canChi: "Nhâm Ngọ", napAm: "Dương Liễu Mộc", hanh: "Mộc", yNghia: "Cây dương liễu, nhu hòa uyển chuyển, ngoại nhu nội cương" },
  { canChi: "Quý Mùi", napAm: "Dương Liễu Mộc", hanh: "Mộc", yNghia: "Cành liễu xanh, khéo léo tinh tế, đắc nhân tâm" },
  { canChi: "Giáp Thân", napAm: "Tuyền Trung Thủy", hanh: "Thủy", yNghia: "Nước trong suối nguồn, trong trẻo bất tận, mưu sự chu toàn" },
  { canChi: "Ất Dậu", napAm: "Tuyền Trung Thủy", hanh: "Thủy", yNghia: "Nước giếng trong, nuôi dưỡng vạn vật, phúc lộc dồi dào" },
  { canChi: "Bính Tuất", napAm: "Ốc Thượng Thổ", hanh: "Thổ", yNghia: "Đất ngói lợp nhà, che chở phong ba, an cư lạc nghiệp" },
  { canChi: "Đinh Hợi", napAm: "Ốc Thượng Thổ", hanh: "Thổ", yNghia: "Ngói trên mái nhà, rèn luyện qua lửa đỏ, vững vàng phong thái" },
  { canChi: "Mậu Tý", napAm: "Tích Lịch Hỏa", hanh: "Hỏa", yNghia: "Lửa sấm sét, uy dũng kinh thiên, tạo lập đại sự" },
  { canChi: "Kỷ Sửu", napAm: "Tích Lịch Hỏa", hanh: "Hỏa", yNghia: "Lửa sấm chớp, thần tốc quyết đoán, chấn hưng cơ nghiệp" },
  { canChi: "Canh Dần", napAm: "Tùng Bách Mộc", hanh: "Mộc", yNghia: "Gỗ tùng bách, kiên cường vượt bão tuyết, phẩm tiết thanh cao" },
  { canChi: "Tân Mão", napAm: "Tùng Bách Mộc", hanh: "Mộc", yNghia: "Cây tùng xanh, sừng sững giữa trời, trường thọ vinh hoa" },
  { canChi: "Nhâm Thìn", napAm: "Trường Lưu Thủy", hanh: "Thủy", yNghia: "Dòng nước sông dài, chảy mãi ra biển lớn, chí hướng bao la" },
  { canChi: "Quý Tỵ", napAm: "Trường Lưu Thủy", hanh: "Thủy", yNghia: "Nước sông dài, bồi đắp phù sa, sinh sôi tài lộc" },
  { canChi: "Giáp Ngọ", napAm: "Sa Trung Kim", hanh: "Kim", yNghia: "Vàng trong cát, ẩn tàng giá trị, tôi luyện thành quý" },
  { canChi: "Ất Mùi", napAm: "Sa Trung Kim", hanh: "Kim", yNghia: "Vàng trong cát trắng, cần cù đãi cát tìm vàng, hậu vận đại phú" },
  { canChi: "Bính Thân", napAm: "Sơn Hạ Hỏa", hanh: "Hỏa", yNghia: "Lửa dưới chân núi, ấm áp soi rọi, tình nghĩa đong đầy" },
  { canChi: "Đinh Dậu", napAm: "Sơn Hạ Hỏa", hanh: "Hỏa", yNghia: "Lửa dưới núi, khiêm nhường tụ tài, bền bỉ tiến bước" },
  { canChi: "Mậu Tuất", napAm: "Bình Địa Mộc", hanh: "Mộc", yNghia: "Cây đồng bằng, xanh tươi sum suê, phúc trạch ấm no" },
  { canChi: "Kỷ Hợi", napAm: "Bình Địa Mộc", hanh: "Mộc", yNghia: "Gỗ bình nguyên, dễ sinh sôi phát triển, đón nhận cơ hội" },
  { canChi: "Canh Tý", napAm: "Bích Thượng Thổ", hanh: "Thổ", yNghia: "Đất trên vách tường, vững chãi tựa núi, bảo bọc bình an" },
  { canChi: "Tân Sửu", napAm: "Bích Thượng Thổ", hanh: "Thổ", yNghia: "Đất tường vách, kiên cố phòng hộ, sự nghiệp vững vàng" },
  { canChi: "Nhâm Dần", napAm: "Kim Bạch Kim", hanh: "Kim", yNghia: "Vàng dát bạc, óng ánh quý phái, thanh tao quyền quý" },
  { canChi: "Quý Mão", napAm: "Kim Bạch Kim", hanh: "Kim", yNghia: "Vàng trang sức, tinh xảo tuyệt mỹ, tài lộc hanh thông" },
  { canChi: "Giáp Thìn", napAm: "Phúc Đăng Hỏa", hanh: "Hỏa", yNghia: "Lửa đèn dầu, tỏa sáng đêm đen, soi đường dẫn lối" },
  { canChi: "Ất Tỵ", napAm: "Phúc Đăng Hỏa", hanh: "Hỏa", yNghia: "Lửa ngọn đèn, ấm áp soi tỏ, trí tuệ mẫn tiệp" },
  { canChi: "Bính Ngọ", napAm: "Thiên Hà Thủy", hanh: "Thủy", yNghia: "Nước mưa trời cao, tưới mát muôn loài, hào hiệp trượng nghĩa" },
  { canChi: "Đinh Mùi", napAm: "Thiên Hà Thủy", hanh: "Thủy", yNghia: "Nước sông ngân hà, thuần khiết vô tận, phúc phận cao dày" },
  { canChi: "Mậu Thân", napAm: "Đại Trạch Thổ", hanh: "Thổ", yNghia: "Đất cồn bãi lớn, nuôi dưỡng vạn vật, đôn hậu bao dung" },
  { canChi: "Kỷ Dậu", napAm: "Đại Trạch Thổ", hanh: "Thổ", yNghia: "Đất đầm lầy lớn, đón nhận dòng nước tài lộc, tích lũy vô biên" },
  { canChi: "Canh Tuất", napAm: "Thoa Xuyến Kim", hanh: "Kim", yNghia: "Vàng trang sức thoa xuyến, cao quý sang trọng, danh giá hiển vinh" },
  { canChi: "Tân Hợi", napAm: "Thoa Xuyến Kim", hanh: "Kim", yNghia: "Vàng trâm cài tóc, tinh tế thanh lịch, quý nhân phù trợ" },
  { canChi: "Nhâm Tý", napAm: "Tang Đố Mộc", hanh: "Mộc", yNghia: "Gỗ cây dâu tằm, dẻo dai kiên nhẫn, thích nghi mọi biến động" },
  { canChi: "Quý Sửu", napAm: "Tang Đố Mộc", hanh: "Mộc", yNghia: "Cây dâu bãi bồi, cần cù nuôi tằm dệt lụa, phúc lộc trường niên" },
  { canChi: "Giáp Dần", napAm: "Đại Khê Thủy", hanh: "Thủy", yNghia: "Nước khe lớn, sóng cuộn nghìn trùng, tung hoành bốn phương" },
  { canChi: "Ất Mão", napAm: "Đại Khê Thủy", hanh: "Thủy", yNghia: "Nước suối nguồn lớn, dạt dào sinh khí, thông tuệ mẫn tiệp" },
  { canChi: "Bính Thìn", napAm: "Sa Trung Thổ", hanh: "Thổ", yNghia: "Đất pha cát, khoáng đạt tự tại, linh hoạt chuyển biến" },
  { canChi: "Đinh Tỵ", napAm: "Sa Trung Thổ", hanh: "Thổ", yNghia: "Đất trong bãi cát, tích chứa mỏ quặng, tiềm năng vô hạn" },
  { canChi: "Mậu Ngọ", napAm: "Thiên Thượng Hỏa", hanh: "Hỏa", yNghia: "Lửa trên trời (ánh dương thái dương), quang minh lỗi lạc, chiếu sáng muôn cõi" },
  { canChi: "Kỷ Mùi", napAm: "Thiên Thượng Hỏa", hanh: "Hỏa", yNghia: "Lửa ánh mặt trời, rực rỡ chan hòa, mang lại sinh khí cát lành" },
  { canChi: "Canh Thân", napAm: "Thạch Lựu Mộc", hanh: "Mộc", yNghia: "Cây thạch lựu, cứng cáp bền bỉ như đá, kết trái sum sê" },
  { canChi: "Tân Dậu", napAm: "Thạch Lựu Mộc", hanh: "Mộc", yNghia: "Cây lựu nở hoa, hoa đỏ quả ngọt, tài lộc trĩu cành" },
  { canChi: "Nhâm Tuất", napAm: "Đại Hải Thủy", hanh: "Thủy", yNghia: "Nước biển mênh mông, khoáng đạt vĩ đại, bao dung vạn sông suối" },
  { canChi: "Quý Hợi", napAm: "Đại Hải Thủy", hanh: "Thủy", yNghia: "Nước đại dương sâu thẳm, trí tuệ vô biên, đại nghiệp ngút ngàn" }
];

/**
 * Tra cứu chính xác Can Chi và Nạp Âm Ngũ Hành theo năm dương lịch
 * Năm 1984 là Giáp Tý (index 0) -> Hải Trung Kim
 */
export function getCanChiNapAm(year: number): HoaGiapEntry {
  const index = ((year - 1984) % 60 + 60) % 60;
  return LUC_THAP_HOA_GIAP[index];
}

/**
 * Tính Cung Mệnh và Cung Thân chuẩn Tử Vi Đẩu Số
 */
export function calculateMenhThanPalaces(month: number, hourBranchIndex: number): { cungMenh: string; cungThan: string; menhBranchIndex: number } {
  const monthDanPos = (2 + (month - 1)) % 12;
  const menhBranchIndex = (monthDanPos - hourBranchIndex + 12) % 12;
  const cungMenh = `Cung ${TERRESTRIAL_BRANCHES[menhBranchIndex]}`;
  const thanBranchIndex = (monthDanPos + hourBranchIndex) % 12;
  const cungThan = `Cung ${TERRESTRIAL_BRANCHES[thanBranchIndex]}`;
  return { cungMenh, cungThan, menhBranchIndex };
}

/**
 * Định Cục theo Can Năm và Cung Mệnh
 */
export function calculateCuc(year: number, menhBranchIndex: number): string {
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const canGroup = stemIndex % 5;
  const cucMatrix: Record<number, string[]> = {
    0: ["Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục", "Thổ Ngũ Cục", "Hỏa Lục Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục", "Thổ Ngũ Cục", "Hỏa Lục Cục"],
    1: ["Hỏa Lục Cục", "Thổ Ngũ Cục", "Kim Tứ Cục", "Mộc Tam Cục", "Thủy Nhị Cục", "Thổ Ngũ Cục", "Hỏa Lục Cục", "Thổ Ngũ Cục", "Kim Tứ Cục", "Mộc Tam Cục", "Thủy Nhị Cục", "Thổ Ngũ Cục"],
    2: ["Thổ Ngũ Cục", "Kim Tứ Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục", "Thổ Ngũ Cục", "Kim Tứ Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục"],
    3: ["Mộc Tam Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Thổ Ngũ Cục", "Kim Tứ Cục", "Thủy Nhị Cục", "Mộc Tam Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Thổ Ngũ Cục", "Kim Tứ Cục", "Thủy Nhị Cục"],
    4: ["Kim Tứ Cục", "Mộc Tam Cục", "Thổ Ngũ Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục", "Kim Tứ Cục", "Mộc Tam Cục", "Thổ Ngũ Cục", "Thủy Nhị Cục", "Hỏa Lục Cục", "Mộc Tam Cục"],
  };
  const list = cucMatrix[canGroup] || cucMatrix[0];
  return list[menhBranchIndex] || "Kim Tứ Cục";
}

// ==========================================
// BÁT TRẠCH PHONG THỦY ĐỊA LÝ & LA BÀN SỐ
// ==========================================

export interface DirectionDefinition {
  code: string; // 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
  name: string;
  vietnameseName: string;
  degreesRange: [number, number];
  centerDegree: number;
  element: string; // Thủy, Thổ, Mộc, Hỏa, Kim
  subMounts: string[]; // 3 sơn hướng trong 24 sơn
}

export const EIGHT_DIRECTIONS: DirectionDefinition[] = [
  { code: 'N', name: 'North', vietnameseName: 'Bắc (Khảm)', degreesRange: [337.5, 22.5], centerDegree: 0, element: 'Thủy', subMounts: ['Nhâm', 'Tý', 'Quý'] },
  { code: 'NE', name: 'North-East', vietnameseName: 'Đông Bắc (Cấn)', degreesRange: [22.5, 67.5], centerDegree: 45, element: 'Thổ', subMounts: ['Sửu', 'Cấn', 'Dần'] },
  { code: 'E', name: 'East', vietnameseName: 'Đông (Chấn)', degreesRange: [67.5, 112.5], centerDegree: 90, element: 'Mộc', subMounts: ['Giáp', 'Mão', 'Ất'] },
  { code: 'SE', name: 'South-East', vietnameseName: 'Đông Nam (Tốn)', degreesRange: [112.5, 157.5], centerDegree: 135, element: 'Mộc', subMounts: ['Thìn', 'Tốn', 'Tỵ'] },
  { code: 'S', name: 'South', vietnameseName: 'Nam (Ly)', degreesRange: [157.5, 202.5], centerDegree: 180, element: 'Hỏa', subMounts: ['Bính', 'Ngọ', 'Đinh'] },
  { code: 'SW', name: 'South-West', vietnameseName: 'Tây Nam (Khôn)', degreesRange: [202.5, 247.5], centerDegree: 225, element: 'Thổ', subMounts: ['Mùi', 'Khôn', 'Thân'] },
  { code: 'W', name: 'West', vietnameseName: 'Tây (Đoài)', degreesRange: [247.5, 292.5], centerDegree: 270, element: 'Kim', subMounts: ['Canh', 'Dậu', 'Tân'] },
  { code: 'NW', name: 'North-West', vietnameseName: 'Tây Bắc (Càn)', degreesRange: [292.5, 337.5], centerDegree: 315, element: 'Kim', subMounts: ['Tuất', 'Càn', 'Hợi'] },
];

/**
 * Ma trận 8 Hướng Phong Thủy theo 8 Cung Phi Bản Mệnh (Bát Cung Phối Hướng)
 * Cung: Càn, Khảm, Cấn, Chấn, Tốn, Ly, Khôn, Đoài
 */
export const BAT_TRACH_MATRIX: Record<string, Record<string, DirectionQuality>> = {
  'Khảm': {
    'N': 'Phục Vị',
    'SE': 'Sinh Khí',
    'E': 'Thiên Y',
    'S': 'Diên Niên',
    'SW': 'Tuyệt Mệnh',
    'NE': 'Ngũ Quỷ',
    'NW': 'Lục Sát',
    'W': 'Họa Hại'
  },
  'Ly': {
    'S': 'Phục Vị',
    'E': 'Sinh Khí',
    'SE': 'Thiên Y',
    'N': 'Diên Niên',
    'NW': 'Tuyệt Mệnh',
    'W': 'Ngũ Quỷ',
    'SW': 'Lục Sát',
    'NE': 'Họa Hại'
  },
  'Chấn': {
    'E': 'Phục Vị',
    'S': 'Sinh Khí',
    'N': 'Thiên Y',
    'SE': 'Diên Niên',
    'W': 'Tuyệt Mệnh',
    'NW': 'Ngũ Quỷ',
    'NE': 'Lục Sát',
    'SW': 'Họa Hại'
  },
  'Tốn': {
    'SE': 'Phục Vị',
    'N': 'Sinh Khí',
    'S': 'Thiên Y',
    'E': 'Diên Niên',
    'NE': 'Tuyệt Mệnh',
    'SW': 'Ngũ Quỷ',
    'W': 'Lục Sát',
    'NW': 'Họa Hại'
  },
  'Càn': {
    'NW': 'Phục Vị',
    'W': 'Sinh Khí',
    'NE': 'Thiên Y',
    'SW': 'Diên Niên',
    'S': 'Tuyệt Mệnh',
    'E': 'Ngũ Quỷ',
    'N': 'Lục Sát',
    'SE': 'Họa Hại'
  },
  'Khôn': {
    'SW': 'Phục Vị',
    'NE': 'Sinh Khí',
    'W': 'Thiên Y',
    'NW': 'Diên Niên',
    'N': 'Tuyệt Mệnh',
    'SE': 'Ngũ Quỷ',
    'S': 'Lục Sát',
    'E': 'Họa Hại'
  },
  'Cấn': {
    'NE': 'Phục Vị',
    'SW': 'Sinh Khí',
    'NW': 'Thiên Y',
    'W': 'Diên Niên',
    'SE': 'Tuyệt Mệnh',
    'N': 'Ngũ Quỷ',
    'E': 'Lục Sát',
    'S': 'Họa Hại'
  },
  'Đoài': {
    'W': 'Phục Vị',
    'NW': 'Sinh Khí',
    'SW': 'Thiên Y',
    'NE': 'Diên Niên',
    'E': 'Tuyệt Mệnh',
    'S': 'Ngũ Quỷ',
    'SE': 'Lục Sát',
    'N': 'Họa Hại'
  }
};

export const DIRECTION_MEANINGS: Record<DirectionQuality, { star: string; isGood: boolean; meaning: string; advice: string }> = {
  'Sinh Khí': {
    star: 'Tham Lang Tinh',
    isGood: true,
    meaning: 'Cực đại cát lợi! Chủ về tài vận hanh thông, danh vọng thăng tiến, vạn sự sinh sôi, con cái đỗ đạt.',
    advice: 'Rất tốt để đặt Cửa Chính, Phòng Khách, Bàn Làm Việc hoặc Hướng Giường Ngủ.'
  },
  'Diên Niên': {
    star: 'Vũ Khúc Tinh',
    isGood: true,
    meaning: 'Thượng cát phước đức! Củng cố tình cảm vợ chồng keo sơn, nhân duyên bền chặt, gia đạo êm ấm trường thọ.',
    advice: 'Rất tốt cho Cửa Chính, Phòng Ngủ Master, Bàn Ăn gia đình.'
  },
  'Thiên Y': {
    star: 'Cự Môn Tinh',
    isGood: true,
    meaning: 'Trung cát quý nhân! Mang lại sức khỏe dồi dào, tiêu trừ bệnh tật, được thần linh và quý nhân che chở.',
    advice: 'Tốt nhất cho Phòng Ngủ người ốm/cao tuổi, Hướng Bếp (tọa hung hướng Thiên Y).'
  },
  'Phục Vị': {
    star: 'Tả Phù Tinh',
    isGood: true,
    meaning: 'Tiểu cát thanh tịnh! Giúp tâm trí an định, thi cử đỗ đạt, tài vận tích lũy đều đặn, bình an trường cửu.',
    advice: 'Thích hợp nhất để đặt Bàn Thờ Gia Tiên, Phòng Đọc Sách, Phòng Thiền định.'
  },
  'Họa Hại': {
    star: 'Lộc Tồn Tinh',
    isGood: false,
    meaning: 'Thứ hung! Dễ vướng vào thị phi khẩu thiệt, kiện tụng nhỏ, bất hòa trong lời ăn tiếng nói.',
    advice: 'Nên đặt Nhà Vệ Sinh, Nhà Kho (để trấn yểm hung khí). Tuyệt đối không đặt Bàn Thờ hay Cửa Chính.'
  },
  'Lục Sát': {
    star: 'Văn Khúc Tinh',
    isGood: false,
    meaning: 'Thứ hung sát khí! Trục trặc tình duyên, xáo trộn quan hệ đối ngoại, dễ bị tiểu nhân gièm pha.',
    advice: 'Nên đặt Bếp Tọa tại hướng này hoặc dùng bể cá / vật phẩm Thổ/Thủy hóa giải.'
  },
  'Ngũ Quỷ': {
    star: 'Liêm Trinh Tinh',
    isGood: false,
    meaning: 'Đại hung hao tài! Dễ sinh hỏa hoạn, mất trộm, hao tài tốn của, sức khỏe bất an hoặc tâm lý nóng nảy.',
    advice: 'Tọa Hung hướng Cát: Có thể đặt Bếp hoặc Nhà Vệ Sinh đè lên hướng này để tiêu trừ hung sát.'
  },
  'Tuyệt Mệnh': {
    star: 'Phá Quân Tinh',
    isGood: false,
    meaning: 'Cực đại hung! Nguy hại sức khỏe, tai ương trắc trở, phá sản hoặc bệnh tật nan giải.',
    advice: 'Cần tránh tuyệt đối mở Cửa Chính hay đặt Đầu Giường. Nếu lỡ hướng nhà, dùng gương Bát Quái lồi hoặc mở cửa phụ hướng Sinh Khí.'
  }
};
