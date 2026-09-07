import { CharacterProfile } from "../types";

export interface CharacterPairPreset {
  id: string;
  name: string;
  description: string;
  styleTag: string;
  characterA: CharacterProfile;
  characterB: CharacterProfile;
}

export const DEFAULT_CHARACTER_A: CharacterProfile = {
  id: "char_a",
  name: "Bé Áo Vàng",
  nickname: "Bé Vàng Lanh Lợi",
  outfit: "Bộ bà ba vàng hoa cúc, quấn khăn rằn vàng, túi gấm thổ cẩm",
  personality: "Quan sát nhạy bén, lém lỉnh, thích cà khịa nhưng rất quan tâm bạn, tiếng cười giòn tan lây lan",
  signatureQuote: "Ê nhìn đường kìa!... Ê ê, cột kìa!",
  roleInVideo: "Người tạo nút thắt kịch tính, kiểm chứng thực tế, phản ứng hài hước thay cho người xem",
  avatarColor: "from-amber-400 to-yellow-500",
  badge: "Người cảnh báo & Cà khịa",
  avatarUrl: "",
  appearancePrompt:
    "Full body concept shot, cute 4-year-old Vietnamese rural girl toddler with chubby cheeks, cute bright eyes, wearing a traditional yellow floral pattern Ba Ba outfit with a yellow headband bandana, barefoot or tiny sandals, smiling playfully, vibrant cinematic warm lighting, high detail, 9:16 vertical",
  voice: "vi-VN-HoaiMyNeural",
  gender: "female",
};

export const DEFAULT_CHARACTER_B: CharacterProfile = {
  id: "char_b",
  name: "Bé Áo Đỏ",
  nickname: "Bé Đỏ Nghiện Tech",
  outfit: "Bộ bà ba đỏ chấm hoa nhí, quấn khăn đỏ, hai má bánh bao phúng phính",
  personality: "Tín đồ công nghệ chính hiệu, tự tin đến ngây thơ, biểu cảm cực meme từ đắc chí đến khóc thét",
  signatureQuote: "Biết rồi mà!...",
  roleInVideo: "Nhân vật trải nghiệm sản phẩm, tạo tình huống đau thương (pain point) và biến đổi thần kỳ",
  avatarColor: "from-red-500 to-rose-600",
  badge: "Tín đồ công nghệ số",
  avatarUrl: "",
  appearancePrompt:
    "Full body concept shot, cute 4-year-old Vietnamese rural boy toddler with round chubby cheeks, funny confident smile, wearing a traditional red polka-dot floral Ba Ba outfit with red headband, holding a futuristic smartphone with both hands, vibrant cinematic lighting, high detail, 9:16 vertical",
  voice: "vi-VN-NamMinhNeural",
  gender: "male",
};

export const CHARACTER_PAIR_PRESETS: CharacterPairPreset[] = [
  {
    id: "classic_rural_kids",
    name: "Bé Áo Vàng & Bé Áo Đỏ (Kinh Điển Hài Hước)",
    description: "Bộ đôi nhí nông thôn nguyên mẫu viral triệu view, sự đối lập giữa ngây thơ và công nghệ cao",
    styleTag: "Hài hước • Viral Nông thôn",
    characterA: DEFAULT_CHARACTER_A,
    characterB: DEFAULT_CHARACTER_B,
  },
  {
    id: "genz_tech_reviewers",
    name: "Linh Nhi & Minh Khang (Reviewer Gen Z)",
    description: "Cặp đôi sáng tạo nội dung công nghệ trẻ trung, năng động, bóc mẽ tính năng thực tế cực sắc",
    styleTag: "Hiện đại • Tech Review",
    characterA: {
      id: "char_a",
      name: "Linh Nhi",
      nickname: "Nhi Reviewer",
      outfit: "Áo hoodie croptop màu vàng pastel, quần cargo, kính cận gọng tròn",
      personality: "Thông minh, sắc sảo, thích thử thách giới hạn thiết bị, chuyên bóc mẽ quảng cáo",
      signatureQuote: "Nói thì hay lắm, để tôi thử xem có bền thật không nhé!",
      roleInVideo: "Người kiểm chứng, soi lỗi và thử độ bền sản phẩm",
      avatarColor: "from-yellow-400 to-amber-500",
      badge: "Chuyên gia bóc phốt",
      avatarUrl: "",
      appearancePrompt:
        "Full body concept shot of a cheerful 20-year-old Vietnamese female tech reviewer, trendy pastel yellow hoodie, stylish round glasses, dynamic friendly expression, modern studio background, high detail, 9:16 vertical",
      voice: "vi-VN-HoaiMyNeural",
      gender: "female",
    },
    characterB: {
      id: "char_b",
      name: "Minh Khang",
      nickname: "Khang Tech-Geek",
      outfit: "Áo thun đen tối giản in logo công nghệ, áo khoác đỏ bomber, đeo tai nghe trùm tai",
      personality: "Đam mê thông số kỹ thuật, yêu chuộng thiết kế tinh xảo, tự tin với mọi món đồ mới",
      signatureQuote: "Chưa thấy món đồ nào xịn sò và đáng tiền như thế này!",
      roleInVideo: "Người giới thiệu tính năng độc quyền và trải nghiệm thần kỳ",
      avatarColor: "from-rose-500 to-red-600",
      badge: "Tín đồ công nghệ",
      avatarUrl: "",
      appearancePrompt:
        "Full body concept shot of a cool 22-year-old Vietnamese male tech enthusiast, wearing a sleek red bomber jacket over black shirt, modern wireless headphones around neck, holding a gadget, studio lighting, 9:16 vertical",
      voice: "vi-VN-NamMinhNeural",
      gender: "male",
    },
  },
  {
    id: "chibi_3d_animation",
    name: "Chibi Vàng & Chibi Đỏ (Hoạt Hình 3D Pixar)",
    description: "Tạo hình nhân vật hoạt hình 3D dễ thương, mắt to tròn lấp lánh phong cách hoạt hình Hollywood",
    styleTag: "3D Animation • Pixar Style",
    characterA: {
      id: "char_a",
      name: "Chibi Vàng 3D",
      nickname: "Bé Vàng Hoạt Hình",
      outfit: "Bộ áo liền quần yếm màu vàng tươi, mũ beret vàng, giày búp bê bóng",
      personality: "Biểu cảm phong phú, nhảy nhót nhí nhảnh, phản ứng giật mình cực hài",
      signatureQuote: "Úi chà chà! Nhìn kìa nhìn kìa!",
      roleInVideo: "Dẫn dắt cảm xúc người xem với hoạt cảnh hoạt hình 3D",
      avatarColor: "from-amber-400 to-orange-400",
      badge: "Nhân vật 3D hoạt họa",
      avatarUrl: "",
      appearancePrompt:
        "3D Pixar Disney style render of a cute chibi little girl with huge expressive brown eyes, golden yellow overalls and yellow beret, big adorable smile, claymation octane render, smooth 3D lighting, 8k resolution, 9:16 vertical",
      voice: "vi-VN-HoaiMyNeural",
      gender: "female",
    },
    characterB: {
      id: "char_b",
      name: "Chibi Đỏ 3D",
      nickname: "Bé Đỏ Hoạt Hình",
      outfit: "Áo hoodie đỏ có tai gấu, quần shorts bò, giày sneaker đỏ phát sáng",
      personality: "Siêu nghịch ngợm, tự tin thái quá, liên tục phát minh và thử nghiệm món mới",
      signatureQuote: "Yên tâm, để tớ lo hết!",
      roleInVideo: "Thực hiện các pha hành động nghẹt thở và cú twist hài",
      avatarColor: "from-red-500 to-rose-500",
      badge: "Kỹ sư nhí 3D",
      avatarUrl: "",
      appearancePrompt:
        "3D Pixar Disney style render of a cute chibi little boy with huge sparkling eyes, bright red bear-ear hoodie, holding a glowing futuristic gadget, adorable funny expression, Pixar lighting, 8k resolution, 9:16 vertical",
      voice: "vi-VN-NamMinhNeural",
      gender: "male",
    },
  },
];
