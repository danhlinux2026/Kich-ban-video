import { TechScript, CharacterProfile, SceneSetting } from "../types";

export const CHARACTERS: CharacterProfile[] = [
  {
    name: "Bé Áo Vàng",
    nickname: "Bé Vàng Lanh Lợi",
    outfit: "Bộ bà ba vàng hoa cúc, quấn khăn rằn vàng, đeo túi gấm thổ cẩm",
    personality: "Quan sát nhạy bén, lém lỉnh, thích 'cà khịa' nhưng rất quan tâm bạn, tiếng cười giòn tan lây lan",
    signatureQuote: "Ê nhìn đường kìa!... Ê ê, cột kìa!",
    roleInVideo: "Người tạo nút thắt kịch tính, người kiểm chứng thực tế, phản ứng thay cho người xem",
    avatarColor: "from-amber-400 to-yellow-500",
    badge: "Người cảnh báo & Cà khịa",
  },
  {
    name: "Bé Áo Đỏ",
    nickname: "Bé Đỏ Nghiện Tech",
    outfit: "Bộ bà ba đỏ chấm hoa nhí, quấn khăn đỏ, hai má bánh bao phúng phính",
    personality: "Tín đồ công nghệ chính hiệu, tự tin đến ngây thơ, biểu cảm cực 'meme' từ tự mãn đến phụng phịu",
    signatureQuote: "Biết rồi mà!...",
    roleInVideo: "Nhân vật trải nghiệm sản phẩm, tạo tình huống đau thương (pain point) và biến đổi thần kỳ",
    avatarColor: "from-red-500 to-rose-600",
    badge: "Tín đồ công nghệ số",
  },
];

export const DEFAULT_SCENE_SETTINGS: SceneSetting[] = [
  {
    id: "rural-vietnam",
    name: "Đường Làng Thôn Quê (Nguyên Bản Viral)",
    category: "rural",
    description: "Đường làng quê đất cát mộc mạc, hàng tre xanh, bờ ruộng ngô, cột điện bê tông thân thuộc, nắng vàng ấm áp.",
    environmentPrompt: "rustic rural Vietnamese village pathway, dirt road flanked by cornfields and green bamboo bushes, rustic concrete utility pole by roadside, tropical countryside sunny atmosphere, cinematic lighting, 8k photorealistic.",
    lighting: "Nắng vàng chiều rực rỡ, độ tương phản tự nhiên, ấm áp miền quê",
    cameraVibe: "Góc máy ngang hông trẻ con, tracking mượt mà dọc đường đất",
    thumbnailUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&auto=format&fit=crop&q=80",
    badge: "Kinh điển viral",
    cameraAngle: "Medium Shot ngang tầm mắt trẻ em",
    colorGrade: "Ấm áp, hoài niệm, màu phim Đông Nam Á",
  },
  {
    id: "modern-living-room",
    name: "Phòng Khách Gia Đình Tiện Nghi",
    category: "living_room",
    description: "Không gian nhà phố hiện đại, sàn gỗ sáng, sofa bọc vải êm ái, kệ tivi thông minh, ánh sáng tự nhiên từ cửa sổ lớn.",
    environmentPrompt: "modern cozy living room, warm wooden floor, plush contemporary sofa, large sunlit window, indoor potted plants, smart home appliances, clean aesthetics, warm interior lighting, 8k render.",
    lighting: "Ánh sáng tự nhiên từ cửa sổ lớn kết hợp đèn trần ấm áp",
    cameraVibe: "Góc quay cận cảnh sinh động trong phòng, lia máy mượt mà giữa các đồ vật",
    thumbnailUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=600&auto=format&fit=crop&q=80",
    badge: "Gia dụng & Smart Home",
    cameraAngle: "Eye-level & Over-the-shoulder",
    colorGrade: "Tự nhiên, sáng sủa, ấm cúng",
  },
  {
    id: "urban-street",
    name: "Góc Phố Đô Thị Nhộn Nhịp",
    category: "urban_street",
    description: "Vỉa hè lát đá hoa cương, cửa hàng phố xá hiện đại, biển hiệu tinh tế, dòng xe cộ xa xa, năng động trẻ trung.",
    environmentPrompt: "bustling modern Asian city sidewalk, clean paved walkway, stylish storefronts with glass displays, soft city lights, vibrant urban daytime vibe, shallow depth of field, 8k resolution.",
    lighting: "Ánh sáng ban ngày đô thị rực rỡ, phản chiếu mặt kính cửa hàng",
    cameraVibe: "Góc máy di chuyển linh hoạt theo bước chân, xóa phông nhẹ hậu cảnh",
    thumbnailUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=600&auto=format&fit=crop&q=80",
    badge: "Thiết bị di động & Đeo tay",
    cameraAngle: "Dynamic low tracking shot",
    colorGrade: "Hiện đại, tươi tắn, tương phản cao",
  },
  {
    id: "tech-office",
    name: "Không Gian Công Nghệ & Bàn Làm Việc",
    category: "tech_office",
    description: "Bàn làm việc tối giản phong cách Bắc Âu, laptop, đèn bàn LED dịu mắt, kệ sách, không gian sáng tạo chuyên nghiệp.",
    environmentPrompt: "minimalist Scandinavian style desk workspace, clean wooden desk, dual monitors, soft warm desk lamp, aesthetic indoor plants, sleek tech accessories, hyper-detailed commercial shot, 8k.",
    lighting: "Đèn bàn dịu mắt, ánh sáng mềm khuếch tán không bóng gắt",
    cameraVibe: "Macro cận cảnh tay cầm sản phẩm và góc nhìn thứ nhất (POV)",
    thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
    badge: "Văn phòng & Setup cá nhân",
    cameraAngle: "Top-down 45 độ & Macro Close-up",
    colorGrade: "Tối giản, tông màu lạnh kết hợp gỗ ấm",
  },
  {
    id: "studio-commercial",
    name: "Studio Thương Mại Cao Cấp (TVC Commercial)",
    category: "studio",
    description: "Phông nền studio vô cực tối giản, ánh sáng softbox đa hướng, viền neon tinh tế, tôn vinh từng góc cạnh tinh xảo.",
    environmentPrompt: "high-end minimalist commercial studio set, infinite seamless matte dark grey gradient backdrop, softbox studio key lighting, subtle cyan and amber rim lights, sleek reflective pedestal, advertisement grade 8k.",
    lighting: "Đèn softbox 3 điểm studio chuẩn quảng cáo, ánh sáng viền rim light sắc nét",
    cameraVibe: "Chuyển động xoay vòng 360 độ quanh sản phẩm, slow-motion mượt mà",
    thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80",
    badge: "Quảng cáo TVC chuẩn hãng",
    cameraAngle: "Hero Product Cam & Orbit 360",
    colorGrade: "Sang trọng, điện ảnh, độ nét cao",
  },
  {
    id: "outdoor-park",
    name: "Công Viên Xanh & Dã Ngoại Sinh Thái",
    category: "outdoor_park",
    description: "Thảm cỏ xanh mướt, lối đi bộ rợp bóng cây cổ thụ, hồ nước trong xanh, bầu trời trong vắt, tràn ngập sinh khí.",
    environmentPrompt: "sunlit lush green public park, paved garden walkway, large shade trees, clear blue sky with fluffy white clouds, fresh vibrant outdoor atmosphere, golden sun flare, photorealistic 8k.",
    lighting: "Nắng sớm trong lành, lốm đốm tia nắng xuyên qua tán cây xanh",
    cameraVibe: "Góc quay rộng toàn cảnh mở rộng không gian, lia theo chuyển động",
    thumbnailUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600&auto=format&fit=crop&q=80",
    badge: "Thiết bị dã ngoại & Pin di động",
    cameraAngle: "Wide Shot & Pan tự do",
    colorGrade: "Tươi mát, xanh mướt, giàu sức sống",
  },
];

export const PRESET_SCRIPTS: TechScript[] = [
  {
    id: "smart-glasses-ai",
    title: "Cú Đâm Cột Điện Triệu View & Cú Lội Ngược Dòng Của Kính AI",
    productName: "Kính Thông Minh VisionAI Neo (AR HUD & Radar Chống Va Chạm)",
    productCategory: "Kính thông minh thực tế ảo (Smart Glasses)",
    productImageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
    productBrand: "VisionAI",
    targetDuration: "45s",
    hookHeadline: "Đừng để 'Biết rồi mà' biến thành 'Ôi trán tôi ơi!'",
    coreBenefit: "Màn hình vô hình AR hiển thị trước mắt, radar quét vật cản 360 độ và trợ lý giọng nói cảnh báo tự động.",
    storyConcept: "Tái hiện cú tông cột điện viral 0-3s, sau đó 'Rewind' quay ngược thời gian với trang bị Kính VisionAI Neo để hóa thân thành điệp viên nhí né cột cực nghệ.",
    characters: CHARACTERS,
    scenes: [
      {
        sceneNumber: 1,
        timecode: "00:00 - 00:04",
        durationSeconds: 4,
        phase: "Hook 3s",
        shotType: "Medium Shot (Trung cảnh 2 bé bước đi) -> Extreme Close-up (Cận cảnh mặt đâm)",
        visual: "Bé Áo Vàng và Bé Áo Đỏ đi trên đường đất cạnh ruộng ngô. Bé Áo Đỏ cắm mặt bấm điện thoại. Bé Áo Vàng hốt hoảng chỉ tay: 'Ê nhìn đường kìa!'. Bé Áo Đỏ hếch cằm: 'Biết rồi mà!'. *RẦM!* Bé Áo Đỏ đâm sầm trán vào cột điện bê tông, ngả người ra sau ôm đầu.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Ê! Nhìn đường kìa!", expression: "Hốt hoảng, mắt mở to, ngón tay chỉ thẳng cột điện" },
          { speaker: "Bé Áo Đỏ", line: "Biết rồi mà...", expression: "Mắt vẫn dán chặt vào màn hình, cười tự tin" },
          { speaker: "Bé Áo Vàng", line: "Ê ê... CỘT KÌA!!", expression: "Thét lên giật mình" }
        ],
        sfxMusic: "Tiếng bước chân chập chững -> Tiếng va chạm 'BONK' bằng đồng vang rền -> Tiếng Bé Áo Vàng cười ha hả nắc nẻ",
        cameraMovement: "Tracking shot mượt mà ngang hông 2 bé, giật nhẹ camera rung lắc khi va chạm",
        aiPrompt: "Cinematic medium shot of two cute chubby toddlers walking in rural path near cornfield, one in yellow floral outfit pointing ahead anxiously, one in red floral outfit glued to smartphone, sudden funny bump into concrete utility pole, 8k, photorealistic."
      },
      {
        sceneNumber: 2,
        timecode: "00:04 - 00:10",
        durationSeconds: 6,
        phase: "Xung đột & Sự cố",
        shotType: "Whip Pan (Chuyển cảnh giật ngược thời gian với hiệu ứng Glitch)",
        visual: "Bé Áo Đỏ xoa trán u một cục nhỏ, mắt rơm rớm nước mắt phụng phịu. Đột nhiên màn hình xuất hiện hiệu ứng REWIND (băng tua ngược), tiếng đồng hồ tích tắc ngược lại giây thứ 0.",
        dialogue: [
          { speaker: "Voice-over", line: "Ai bảo ra đường vừa lướt mạng vừa đi bộ là phải trả giá bằng cái trán?", expression: "Giọng trầm ấm, hóm hỉnh đầy lôi cuốn" },
          { speaker: "Bé Áo Đỏ", line: "Hứ, xem đây này!", expression: "Lấy ngón tay gạt nước mắt, móc từ túi gấm ra một chiếc kính thời trang siêu ngầu" }
        ],
        sfxMusic: "Hiệu ứng âm thanh VHS Rewind xẹt xẹt điện tử, tiếng tim đập hồi hộp",
        cameraMovement: "Zoom cận cảnh vào túi gấm và chiếc kính thông minh công nghệ cao phát sáng viền xanh neon nhẹ",
        aiPrompt: "Extreme close-up shot of chubby Asian baby pulling out stylish high-tech smart glasses with glowing neon edge from pocket, retro sci-fi rewind effect."
      },
      {
        sceneNumber: 3,
        timecode: "00:10 - 00:22",
        durationSeconds: 12,
        phase: "Xuất hiện Giải pháp",
        shotType: "First-Person POV (Góc nhìn thứ nhất qua lăng kính AR HUD)",
        visual: "Bé Áo Đỏ đeo kính VisionAI Neo lên sống mũi. Mắt kính tự động kích hoạt giao diện AR trong suốt hiển thị bản đồ 3D, thông báo tin nhắn và màn hình ảo lơ lửng. Cảnh báo radar đỏ hiện chữ: [CHƯỚNG NGẠI VẬT: CỘT ĐIỆN - CÁCH 2 MÉT].",
        dialogue: [
          { speaker: "Voice-over", line: "Kính Thông Minh VisionAI Neo: Trực quan hóa dữ liệu AR ngay trước mắt, không cần cúi đầu!", expression: "Hào hứng, chuyên nghiệp" },
          { speaker: "Bé Áo Vàng", line: "Ủa! Mày đeo cái gì trông như Siêu nhân vậy?", expression: "Chống tay vào hông, mắt tò mò soi mói" },
          { speaker: "Bé Áo Đỏ", line: "Trợ lý AI vừa nhắc: 'Rẽ trái 15 độ để né cột điện!'. Haha!", expression: "Cười đắc chí, lách nhẹ một bước sang trái mượt mà" }
        ],
        sfxMusic: "Âm thanh kích hoạt công nghệ 'Swoosh', tiếng radar quét 'Ping... Ping!', tiếng trợ lý ảo giọng nữ ngọt ngào phát qua loa dẫn truyền xương",
        cameraMovement: "Chuyển mượt từ góc nhìn người thứ ba sang POV nhìn qua mắt kính với HUD ảo siêu hiện đại",
        aiPrompt: "First person POV HUD interface through futuristic smart glasses, displaying holographic transparent obstacle warning over rural cornfield road."
      },
      {
        sceneNumber: 4,
        timecode: "00:22 - 00:34",
        durationSeconds: 12,
        phase: "Trải nghiệm & Tính năng",
        shotType: "Over-the-shoulder Shot & Split Screen (Cận cảnh 2 bé tương tác)",
        visual: "Bé Áo Đỏ đi thẳng qua chiếc cột điện một cách an toàn mà vẫn xem xong video clip yêu thích. Bé Áo Vàng há hốc mồm, đưa tay vẫy vẫy trước mắt bạn xem có thấy đường thật không. Bé Áo Đỏ ra lệnh giọng nói: 'VisionAI, chụp ảnh bạn áo vàng đang ngạc nhiên!'. Đèn camera kính chớp sáng.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Thật á?! Cho mượn đeo thử một tí coi, năn nỉ đó!", expression: "Hai tay chắp lại, vẻ mặt xin xỏ nịnh nọt cực yêu" },
          { speaker: "Bé Áo Đỏ", line: "Nặng có 35 gram thôi nha, nghe nhạc, dịch thuật, gọi điện rảnh tay hết!", expression: "Hất mặt tự hào, tháo kính đưa cho bạn" }
        ],
        sfxMusic: "Tiếng chụp ảnh 'Tách!', tiếng bass sôi động hiện đại, nhịp điệu vui tươi",
        cameraMovement: "Pan ngang qua lại bắt trọn biểu cảm đối đáp hài hước giữa 2 khuôn mặt em bé",
        aiPrompt: "Cute toddler in yellow begging toddler in red to try on smart glasses, joyful interaction, bright sunny morning light, cinematic framing."
      },
      {
        sceneNumber: 5,
        timecode: "00:34 - 00:45",
        durationSeconds: 11,
        phase: "Cú Twist & Kêu gọi hành động (CTA)",
        shotType: "Wide Shot (Toàn cảnh) -> Product Showcase Graphic Card (Bảng thông tin ưu đãi)",
        visual: "Bé Áo Vàng hí hửng đeo kính vào, mải ngắm nghía giao diện ảo... đi giật lùi rồi BÙM, va mông vào gốc cây ngô ngã ngồi bệt xuống đất! Bé Áo Đỏ ôm bụng cười lăn lộn trả thù. Màn hình hạ xuống hiển thị hộp sản phẩm và ưu đãi giảm 30%.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "U là trời! Kính bảo né phía trước chứ nó không bảo né phía sau!", expression: "Ngồi bệt xoa mông, mặt nhăn nhó cười trừ" },
          { speaker: "Voice-over", line: "VisionAI Neo - Đi đến đâu, làm chủ công nghệ đến đó. Bấm vào giỏ hàng nhận ngay voucher giảm 30% hôm nay!", expression: "Giục giã, uy tín, cuốn hút" }
        ],
        sfxMusic: "Tiếng 'Thump' ngã bắp ngô nhẹ nhàng -> Tiếng cười khúc khích vang trời -> Jingle nhạc thương hiệu bắt tai kết thúc",
        cameraMovement: "Dolly out từ từ để lộ toàn cảnh ruộng ngô thơ mộng và pop-up CTA sản phẩm rực rỡ",
        aiPrompt: "Toddler in yellow falling backward into soft corn stalks laughing, toddler in red giggling joyfully, promotional banner overlay with smart glasses product."
      }
    ],
    cta: {
      visual: "Hộp sản phẩm kính VisionAI Neo mở nắp xoay 360 độ kèm 2 bé vẫy tay chào người xem",
      voiceOver: "Đặt mua ngay hôm nay tại link bên dưới để nhận bộ quà tặng bao da cao cấp!",
      punchline: "Nhớ nhìn đường, hoặc sắm ngay VisionAI Neo!",
      actionButtonText: "Sắm Kính AI Ngay - Giảm 30%"
    },
    viralTips: [
      "Giữ nguyên 3 giây đầu cú tông cột điện vì đây là phân đoạn có tỷ lệ Drop-off cực thấp.",
      "Sử dụng hiệu ứng âm thanh Sound Design dày dặn (tiếng Bonk kim loại, tiếng xẹt điện tử tua ngược) để kích thích giác quan người xem.",
      "Tạo cú twist đối xứng ở cuối: Bé Áo Vàng cười người trước hôm sau ngã bẹp dính chưởng, tăng comment tranh luận vui vẻ."
    ]
  },
  {
    id: "phone-screen-outdoor",
    title: "Màn Hình Siêu Sáng 3500 Nits & Trợ Lý Mắt Thần AI SafeWalk",
    productName: "Smartphone TitanPhone 16 Pro Max (Màn Siêu Sáng 3500 Nits & SafeWalk AI)",
    productCategory: "Điện thoại thông minh Flagship",
    productImageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
    productBrand: "TitanPhone",
    targetDuration: "30s",
    hookHeadline: "Nắng gắt đồng quê cũng không làm khó được siêu phẩm!",
    coreBenefit: "Màn hình chống lóa đỉnh cao nhìn rõ dưới ánh nắng chói chang, đi kèm camera AI cảnh báo vật cản khi đi bộ.",
    storyConcept: "30 giây tiết tấu cực nhanh, giải thích lý do tại sao Bé Áo Đỏ cắm mặt vào máy: vì màn hình quá đẹp, và tại sao lần này bé né được cột điện nhờ SafeWalk AI!",
    characters: CHARACTERS,
    scenes: [
      {
        sceneNumber: 1,
        timecode: "00:00 - 00:05",
        durationSeconds: 5,
        phase: "Hook 3s",
        shotType: "Close-up (Cận cảnh bước chân) -> Two-shot",
        visual: "Mặt trời rực lửa trên cánh đồng. Bé Áo Vàng che tay lên trán vì chói: 'Ê nhìn đường kìa! Cột điện to đùng đó!'. Bé Áo Đỏ không thèm ngước nhìn, bước chân sắp chạm cột thì... PHANH KÍT LẠI!",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Ê! Coi chừng cái cột!!", expression: "Hét toáng lên, tay vẫy lia lịa" },
          { speaker: "Bé Áo Đỏ", line: "Dừng!", expression: "Bé dừng chân đúng 2 cm trước mép cột điện một cách điềm tĩnh" }
        ],
        sfxMusic: "Tiếng ve kêu nắng hè chói chang -> Tiếng còi báo động vi mô 'Bíp bíp!' -> Tiếng phanh xe kít kịt hài hước",
        cameraMovement: "Camera lia nhanh từ mặt trời chói chang xuống trán bé và dừng khựng theo bước chân",
        aiPrompt: "Cinematic close-up of toddler stopping precisely 2cm before a concrete pole in sunny summer cornfield, high contrast, vivid colors."
      },
      {
        sceneNumber: 2,
        timecode: "00:05 - 00:15",
        durationSeconds: 10,
        phase: "Xuất hiện Giải pháp",
        shotType: "Macro Shot (Cận cảnh màn hình điện thoại siêu nét)",
        visual: "Bé Áo Đỏ xoay màn hình điện thoại về phía bạn. Dưới ánh nắng gắt gao, màn hình vẫn sáng rực rỡ, hiển thị thông báo: 'Tính năng SafeWalk: Đã phát hiện vật thể và tự rung phản hồi!'.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Ủa sao nắng chói chang thế này mà mày nhìn rõ mồn một vậy?", expression: "Chụm 2 tay che nắng nhìn vào màn hình điện thoại, mắt tròn xoe thán phục" },
          { speaker: "Bé Áo Đỏ", line: "Màn hình OLED 3500 nits chống lóa đỉnh chóp, còn rung cảnh báo rung giật tay nữa cơ!", expression: "Lắc lắc chiếc điện thoại khoe khoang" }
        ],
        sfxMusic: "Tiếng rung điện thoại tút tút, âm thanh shimmer ánh sáng lấp lánh",
        cameraMovement: "Camera zoom macro vào từng pixel sắc nét trên màn hình điện thoại ngoài trời",
        aiPrompt: "Ultra-sharp macro shot of smartphone screen displaying crystal clear graphics in blinding sunlight, anti-glare nano texture reflection."
      },
      {
        sceneNumber: 3,
        timecode: "00:15 - 00:25",
        durationSeconds: 10,
        phase: "Trải nghiệm & Tính năng",
        shotType: "Two-shot tương tác hài hước",
        visual: "Bé Áo Vàng lấy ngón tay quẹt quẹt thử màn hình 120Hz mượt như bơ. Bé Áo Đỏ cười khanh khách: 'Chơi game, lướt video 3 ngày không nóng máy!'",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Mượt dữ thần! Bấm cái ăn ngay, không bị bóng phản chiếu mặt tao luôn!", expression: "Mắt sáng rực, ngón tay lướt thoăn thoắt" },
          { speaker: "Voice-over", line: "TitanPhone 16 Pro Max - Chinh phục mọi điều kiện ánh sáng, bảo vệ bạn trên từng bước chân!", expression: "Năng động, tràn đầy năng lượng" }
        ],
        sfxMusic: "Nhạc beat điện tử sôi động, âm thanh swipe vuốt màn hình tí tách",
        cameraMovement: "Góc máy thấp tôn vinh vẻ đáng yêu của 2 bạn nhỏ mải mê bấm máy",
        aiPrompt: "Two adorable chubby babies giggling together while touching a glowing sleek smartphone, cinematic lighting."
      },
      {
        sceneNumber: 4,
        timecode: "00:25 - 00:30",
        durationSeconds: 5,
        phase: "Cú Twist & Kêu gọi hành động (CTA)",
        shotType: "Fast Cut to CTA",
        visual: "Bé Áo Vàng ôm luôn điện thoại chạy trước, Bé Áo Đỏ lạch bạch đuổi theo: 'Trả điện thoại cho tao!'. Đồ họa giá sốc xuất hiện.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Tao mượn tí thôi mà, chạy trước đây!!", expression: "Cười toe toét ôm máy chạy lon ton" },
          { speaker: "Voice-over", line: "Sở hữu ngay TitanPhone 16 Pro Max - Trả góp 0%, quà tặng 2 triệu!", expression: "Dứt khoát, hào sảng" }
        ],
        sfxMusic: "Tiếng trống dồn dập, tiếng cười rúc rích vui nhộn",
        cameraMovement: "Tracking shot đuổi theo 2 em bé chạy dọc bờ ruộng ngô",
        aiPrompt: "Toddler in yellow running joyfully along rural path holding phone, toddler in red chasing behind comically, promotional text overlay."
      }
    ],
    cta: {
      visual: "Khung hình đóng băng cảnh rượt đuổi dễ thương kèm nút Đặt Mua Ngay",
      voiceOver: "Truy cập ngay link để nhận ưu đãi mở bán có hạn!",
      punchline: "Màn hình sáng thì thích, nhưng cẩn thận bị bạn 'mượn' mất nhé!",
      actionButtonText: "Xem Ưu Đãi Mở Bán"
    },
    viralTips: [
      "Thời lượng 30s là 'Golden length' cho thuật toán TikTok và Instagram Reels.",
      "Đẩy xung đột 'màn hình bị lóa ngoài trời' thành giải pháp trực quan ngay giây thứ 8.",
      "Cảnh rượt đuổi cuối video giữ người xem ở lại đến mili-giây cuối cùng, tối ưu retention 100%."
    ]
  },
  {
    id: "shockproof-titan-case",
    title: "Người Đâm Cột Sưng Trán, Nhưng Máy Vẫn Nguyên Vẹn Nhờ Ốp TitanArmor",
    productName: "Ốp Lưng Chống Va Đập Chuẩn Quân Đội ArmorShield Titan",
    productCategory: "Phụ kiện bảo vệ cao cấp",
    productImageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&auto=format&fit=crop&q=80",
    productBrand: "ArmorShield",
    targetDuration: "60s",
    hookHeadline: "Khi va chạm xảy ra, máy bạn có sống sót như máy của Bé Áo Đỏ?",
    coreBenefit: "Chịu lực rơi từ 5 mét, đệm khí 4 góc hấp thụ 98% xung lực, mặt kính sapphire chống xước tuyệt đối.",
    storyConcept: "Khai thác tối đa nỗi sợ rơi vỡ điện thoại của mọi người. Khi Bé Áo Đỏ đâm cột, chiếc điện thoại văng lên không trung rơi tự do xuống nền đá nhọn hoắt... rồi điều bất ngờ xảy ra!",
    characters: CHARACTERS,
    scenes: [
      {
        sceneNumber: 1,
        timecode: "00:00 - 00:06",
        durationSeconds: 6,
        phase: "Hook 3s",
        shotType: "Slow Motion Extreme (Quay chậm 120fps)",
        visual: "Bé Áo Đỏ vừa đi vừa say mê chơi game. Bé Áo Vàng thét: 'Ê nhìn đường kìa!'. Cú va chạm với cột điện diễn ra. Lực tông làm chiếc smartphone văng khỏi tay Bé Áo Đỏ, bay lên không trung xoay 3 vòng trong hiệu ứng slow-motion nghẹt thở!",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Cột kìa mày ơiiii!!", expression: "Mồm há chữ O, mắt trừng to thất thần" },
          { speaker: "Bé Áo Đỏ", line: "Áaaaaa! Con cưng 30 củ của tôiii!", expression: "Hai tay chới với theo chiếc điện thoại đang bay" }
        ],
        sfxMusic: "Tiếng va đập vang dội -> Tiếng gió rít quay chậm (whoosh slow-mo) -> Nhịp tim thình thịch cực căng thẳng",
        cameraMovement: "Camera xoay 360 độ quanh chiếc điện thoại đang lơ lửng trên không trung",
        aiPrompt: "Cinematic ultra slow motion of a modern smartphone flying in the air after funny collision, chubby babies looking up in pure shock, high suspense."
      },
      {
        sceneNumber: 2,
        timecode: "00:06 - 00:16",
        durationSeconds: 10,
        phase: "Xung đột & Sự cố",
        shotType: "Ground-level Low Angle (Góc máy sát mặt đất)",
        visual: "Chiếc điện thoại rơi *CHOANG!* đập mạnh góc cạnh vào mỏm đá nhọn bên vệ đường, rồi nảy lên 2 lần trước khi tiếp đất úp mặt. Cả 2 bé nhắm tịt mắt, co rúm người lại sợ hãi.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Thôi xong... quả này nát bét màn hình rồi!", expression: "Lấy hai tay bịt mắt nhưng vẫn hé ngón tay nhìn lén" },
          { speaker: "Bé Áo Đỏ", line: "Huhu, mẹ tao mà biết là ăn đòn no đòn...", expression: "Mếu máo run rẩy không dám lại gần nhặt" }
        ],
        sfxMusic: "Tiếng nảy đá 'Cạch... Rầm!', tiếng dế kêu thinh lặng tái tê",
        cameraMovement: "Camera bò sát mặt đất, cận cảnh bụi đất bay mù mịt quanh chiếc máy nằm úp",
        aiPrompt: "Ground level close up of sleek phone falling on sharp gravel rocks, dust kicking up, dramatic lighting."
      },
      {
        sceneNumber: 3,
        timecode: "00:16 - 00:32",
        durationSeconds: 16,
        phase: "Xuất hiện Giải pháp",
        shotType: "Medium Close-up -> Hero Product Inspection",
        visual: "Bé Áo Vàng rón rén bước lại, dùng ngón chân gẩy nhẹ chiếc máy lật ngửa lên. Kỳ diệu thay: Màn hình sáng bừng! Không một vết nứt, ốp lưng chỉ hơi dính tí bụi đất vàng. Bé Áo Đỏ lập tức mở to mắt, lao tới chộp lấy máy lau vào áo.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Ủa khoan?! Màn hình vẫn nguyên xi?! Ốp này làm bằng thép à?", expression: "Ngồi xổm xuống soi kỹ từng góc cạnh, ngỡ ngàng tột độ" },
          { speaker: "Bé Áo Đỏ", line: "Hí hí! Người có thể sưng trán, chứ máy đã có ArmorShield Titan bọc 4 góc đệm khí quân đội rồi nha!", expression: "Gạt nước mắt cười tươi roi rói, giơ ốp lưng khoe viền titan sang trọng" }
        ],
        sfxMusic: "Âm thanh thiên thần 'Hallelujah' hài hước vang lên -> Tiếng lau màn hình sạch bóng 'Squeak squeak'",
        cameraMovement: "Dolly in chậm rãi từ khuôn mặt ngơ ngác của Bé Áo Vàng sang mặt hồ hởi của Bé Áo Đỏ",
        aiPrompt: "Chubby toddler in red picking up completely undamaged phone from dirt, wiping it clean, glowing pristine screen, amazed expressions."
      },
      {
        sceneNumber: 4,
        timecode: "00:32 - 00:48",
        durationSeconds: 16,
        phase: "Trải nghiệm & Tính năng",
        shotType: "Action Demonstration (Bé Áo Vàng kiểm chứng độ bền)",
        visual: "Bé Áo Vàng vẫn chưa tin, bèn nhặt một bắp ngô khô gõ cốc cốc vào lưng máy. Chiếc ốp titan không hề hấn gì. Bé Áo Đỏ giật lấy: 'Ê, ốp này còn có giá đỡ từ tính MagSafe xem phim không mỏi tay nữa nè!'. Bé bật chân chống kim loại dựng máy đứng trên tảng đá.",
        dialogue: [
          { speaker: "Voice-over", line: "ArmorShield Titan: Cấu trúc 3 lớp chống sốc, viền nhô bảo vệ cụm camera, tích hợp chân đế MagSafe siêu bền!", expression: "Thuyết phục, mạnh mẽ, bảo chứng chất lượng" },
          { speaker: "Bé Áo Vàng", line: "Được của nó đấy! Mua cho tao một cái màu vàng hợp mệnh coi!", expression: "Chỉ tay vào bộ đồ hoa cúc vàng của mình đòi mua cùng" }
        ],
        sfxMusic: "Tiếng gõ cốc cốc chắc nịch, tiếng bật chân chống 'Click' kim loại cao cấp đã tai",
        cameraMovement: "Quay 360 độ khoe thiết kế ốp lưng góc cạnh hầm hố mà vẫn tinh tế",
        aiPrompt: "Demonstration of durable shockproof phone case with metallic kickstand on rural stone, high detail product rendering."
      },
      {
        sceneNumber: 5,
        timecode: "00:48 - 00:60",
        durationSeconds: 12,
        phase: "Cú Twist & Kêu gọi hành động (CTA)",
        shotType: "Two-shot kết thúc & Call to action overlay",
        visual: "Hai bé ngồi cạnh nhau dựa vào cột điện, bật điện thoại tự dựng bằng chân đế để cùng nhau xem phim hoạt hình cười nghiêng ngả. Màn hình hạ xuống hiển thị chính sách bảo hành 1 đổi 1 trong 12 tháng.",
        dialogue: [
          { speaker: "Bé Áo Đỏ", line: "Lần sau có tông cột điện tiếp cũng khỏi lo hỏng máy!", expression: "Nháy mắt tinh nghịch" },
          { speaker: "Bé Áo Vàng", line: "Mày lo cho cái đầu mày trước đi con ơi!", expression: "Vỗ nhẹ vào trán bạn làm bạn la oai oái" },
          { speaker: "Voice-over", line: "Bảo vệ điện thoại của bạn ngay hôm nay cùng ArmorShield Titan. Mua 1 tặng 1 kính cường lực chỉ trong tuần này!", expression: "Chốt sale đanh thép, mời gọi" }
        ],
        sfxMusic: "Tiếng nhạc kết thúc vui tươi sôi động, tiếng cười giòn giã của 2 em bé",
        cameraMovement: "Crane shot nâng dần lên cao thu trọn cảnh 2 bé xem phim giữa bạt ngàn nương ngô xanh ngát",
        aiPrompt: "Warm sunset shot of two chubby babies sitting happily together by a concrete pole watching cartoons on a propped phone, happy ending."
      }
    ],
    cta: {
      visual: "Bộ sưu tập ốp lưng đa màu sắc (đặc biệt có bản Vàng hoa cúc và Đỏ rực rỡ)",
      voiceOver: "Click ngay link để nhận ưu đãi Mua 1 Tặng 1 và Miễn phí vận chuyển toàn quốc!",
      punchline: "Trán có thể sưng, nhưng máy phải nguyên vẹn!",
      actionButtonText: "Nhận Ưu Đãi Mua 1 Tặng 1"
    },
    viralTips: [
      "Hiệu ứng Slow-motion rơi điện thoại là chiêu 'dừng ngón tay' (Thumb-stopping) kinh điển đánh thẳng vào tâm lý xót của của người xem.",
      "Âm thanh gõ kim loại và bật chân đế 'Click' kích hoạt phản ứng ASMR làm tăng độ tin cậy về chất lượng gia công.",
      "Kịch bản dài 60s có đủ thời gian xây dựng sự đồng cảm và chứng minh 3 tính năng: Chống sốc + Bảo vệ camera + Chân đế MagSafe."
    ]
  },
  {
    id: "earbuds-ambient-mode",
    title: "Đeo Tai Nghe Chống Ồn Mà Vẫn Né Được Cột Điện Kịp Thời?!",
    productName: "Tai Nghe Không Dây SoundPulse Pro (Chống Ồn Thích Ứng & Smart Voice Aware)",
    productCategory: "Tai nghe thông minh (TWS Earbuds)",
    productImageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    productBrand: "SoundPulse",
    targetDuration: "45s",
    hookHeadline: "Chống ồn 100% nhưng tiếng bạn réo vẫn nghe rõ mồn một!",
    coreBenefit: "Tự động phân biệt tiếng ồn xung quanh và tiếng gọi cảnh báo nguy hiểm để truyền âm thanh tức thì vào tai.",
    storyConcept: "Bé Áo Đỏ đeo tai nghe phiêu theo nhạc remix, Bé Áo Vàng đứng xa hét cảnh báo... Nhờ công nghệ Voice Aware, Bé Áo Đỏ nghe rõ tiếng bạn và né cột điện trong gang tấc!",
    characters: CHARACTERS,
    scenes: [
      {
        sceneNumber: 1,
        timecode: "00:00 - 00:05",
        durationSeconds: 5,
        phase: "Hook 3s",
        shotType: "Close-up vào đầu Bé Áo Đỏ lắc lư theo nhạc -> Toàn cảnh đường đi",
        visual: "Bé Áo Đỏ đeo cặp tai nghe tí hon màu đỏ trong tai, vừa đi vừa lắc lư cái đầu cực phiêu theo điệu nhạc quẩy. Bé Áo Vàng đi phía sau hốt hoảng la to: 'Ê CỘT ĐIỆN KÌA! DỪNG LẠI!'. Ai cũng tưởng Bé Áo Đỏ sắp đâm sầm như mọi khi...",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Ê! ĐỨNG LẠI! CỘT KÌA MÀY!", expression: "Hai tay ôm miệng làm loa hét hết cỡ" },
          { speaker: "Bé Áo Đỏ", line: "Ủa?", expression: "Đang nhắm mắt phiêu nhạc bỗng mở to mắt dừng bước" }
        ],
        sfxMusic: "Tiếng nhạc quẩy sôi động đang phát trong tai nghe bỗng giảm âm lượng tự động (Duck Audio)",
        cameraMovement: "Camera zoom nhanh vào tai nghe đang phát sáng đèn LED thông minh",
        aiPrompt: "Cute baby in red floral outfit wearing miniature sleek wireless earbuds, grooving to music, suddenly stops before pole, dynamic angle."
      },
      {
        sceneNumber: 2,
        timecode: "00:05 - 00:15",
        durationSeconds: 10,
        phase: "Xuất hiện Giải pháp",
        shotType: "Visual Graphic Simulation (Mô phỏng sóng âm AI)",
        visual: "Đồ họa sóng âm hiển thị tai nghe SoundPulse Pro: Lọc sạch tiếng gió rít và tiếng ve sầu, nhưng khi nhận diện giọng người gọi tên hoặc cảnh báo, micro ngoài lập tức khuếch đại giọng Bé Áo Vàng truyền thẳng vào tai!",
        dialogue: [
          { speaker: "Voice-over", line: "SoundPulse Pro với tính năng Smart Voice Aware: Cách âm cả thế giới, nhưng không bỏ lỡ một lời cảnh báo!", expression: "Tự tin, chuyên nghiệp" },
          { speaker: "Bé Áo Đỏ", line: "Nghe thấy tiếng mày hét rồi nha! Tưởng tao điếc à?", expression: "Ngoảnh lại nháy mắt cười hì hì" }
        ],
        sfxMusic: "Hiệu ứng âm thanh từ ồn ào chuyển sang trong trẻo tách bạch, giọng Bé Áo Vàng vang lên rõ nét",
        cameraMovement: "Xoay vòng quanh tai nghe với đồ họa sóng âm lan tỏa 3D",
        aiPrompt: "3D visualization of sound waves entering wireless earbud, filtering background noise while highlighting human voice frequency."
      },
      {
        sceneNumber: 3,
        timecode: "00:15 - 00:32",
        durationSeconds: 17,
        phase: "Trải nghiệm & Tính năng",
        shotType: "Two-shot thân mật, cùng nhau trải nghiệm",
        visual: "Bé Áo Vàng chạy lại ngạc nhiên: 'Ủa đeo tai nghe kín mít mà vẫn nghe tao gọi từ xa 10 mét hả?'. Bé Áo Đỏ tháo một bên tai nghe gắn vào tai Bé Áo Vàng. Âm bass trầm ấm bùng nổ, Bé Áo Vàng lắc lư theo điệu nhạc.",
        dialogue: [
          { speaker: "Bé Áo Vàng", line: "Trời ơi bass đập đã tai dữ vậy! Mà giọng mày nói thầm tao vẫn nghe rõ!", expression: "Mắt mở to thích thú, nhún nhảy nhịp nhàng" },
          { speaker: "Bé Áo Đỏ", line: "Pin trâu 40 tiếng, chống nước chuẩn IPX7 rơi xuống bùn rửa nước vẫn chạy ngon!", expression: "Vỗ ngực tự hào giới thiệu" }
        ],
        sfxMusic: "Tiếng nhạc EDM bass boost sống động, ấm áp",
        cameraMovement: "Góc quay nhịp nhàng theo bước nhảy đáng yêu của 2 bé",
        aiPrompt: "Two cute toddlers sharing a pair of earbuds, dancing together happily on dirt road, high saturation, joyful atmosphere."
      },
      {
        sceneNumber: 4,
        timecode: "00:32 - 00:45",
        durationSeconds: 13,
        phase: "Cú Twist & Kêu gọi hành động (CTA)",
        shotType: "Chốt hạ & Banner ưu đãi",
        visual: "Hai bé vừa nghe nhạc vừa cùng nhau đi qua cột điện an toàn, quay lại vẫy tay chào chiếc cột điện. Khung hình chuyển sang bộ sản phẩm SoundPulse Pro kèm dock sạc trong suốt cực sang.",
        dialogue: [
          { speaker: "Cả hai", line: "Bái bai cột điện nha!!", expression: "Đồng thanh hô to, cười rạng rỡ" },
          { speaker: "Voice-over", line: "SoundPulse Pro - Âm thanh đỉnh cao, an toàn mọi lúc. Nhấn mua ngay để nhận quà tặng ốp bảo vệ silicon cao cấp!", expression: "Lôi cuốn, thúc đẩy hành động" }
        ],
        sfxMusic: "Nhạc kết thúc upbeat tràn ngập năng lượng, tiếng chuông thông báo giỏ hàng",
        cameraMovement: "Dolly lùi xa dần, 2 bé vừa đi vừa nhảy chân sáo xa dần",
        aiPrompt: "Two babies waving goodbye to concrete pole smiling, walking into sunny distance, product case showcase."
      }
    ],
    cta: {
      visual: "Dock sạc tai nghe mở nắp phát sáng đèn LED hiển thị pin 100%",
      voiceOver: "Trải nghiệm âm thanh tương lai với bảo hành chính hãng 24 tháng!",
      punchline: "Vừa chill âm nhạc, vừa an toàn đường phố!",
      actionButtonText: "Săn Deal Tai Nghe Ngay"
    },
    viralTips: [
      "Điểm hook đảo ngược mong đợi: Người xem tưởng sẽ lại đâm cột điện, nhưng cú phanh kít lại tạo sự bất ngờ thỏa mãn (Pattern Interrupt).",
      "Khai thác đúng 'Insight' của người dùng tai nghe: Sợ đeo tai nghe ngoài đường bị nguy hiểm vì không nghe thấy âm thanh xung quanh.",
      "Hành động chia sẻ một bên tai nghe biểu tượng cho tính tương tác và gắn kết bạn bè cực kỳ dễ thương."
    ]
  }
];
