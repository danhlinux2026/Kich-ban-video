import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { generateAgnesVideo, generateAgnesImage, getAgnesBase, AGNES_V1 } from "./server/agnes";
import { composeVideo, getVoiceForSpeaker, VOICE_HOAI_MY, VOICE_NAM_MINH } from "./server/compose";
import { EdgeTTS } from "node-edge-tts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// In-memory job progress tracking for live polling (jobId -> progress)
interface JobProgressRecord {
  jobId: string;
  percent: number;
  stage: string;
  detail?: string;
  error?: string;
  completed?: boolean;
  resultUrl?: string;
  updatedAt: number;
}

const jobProgressMap = new Map<string, JobProgressRecord>();

function setJobProgress(
  jobId: string | undefined,
  percent: number,
  stage: string,
  detail?: string,
  resultUrl?: string,
  error?: string
) {
  if (!jobId) return;
  jobProgressMap.set(jobId, {
    jobId,
    percent,
    stage,
    detail,
    error,
    completed: percent >= 100,
    resultUrl,
    updatedAt: Date.now(),
  });
}

// Ensure public/outputs directory exists and is statically served
const outputsDir = path.join(process.cwd(), "public", "outputs");
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir, { recursive: true });
}
app.use("/outputs", express.static(outputsDir));

// Lazy-get GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasCustomEndpoint: Boolean(process.env.CUSTOM_LLM_ENDPOINT),
    time: new Date().toISOString(),
  });
});

// GET Job Progress (real progress bar % polling)
app.get("/api/progress/:jobId", (req, res) => {
  const { jobId } = req.params;
  const progress = jobProgressMap.get(jobId);
  if (!progress) {
    return res.json({
      jobId,
      percent: 0,
      stage: "Đang khởi tạo tác vụ...",
      completed: false,
    });
  }
  res.json(progress);
});

// API generate script
app.post("/api/generate-script", async (req, res) => {
  try {
    const {
      productName,
      productCategory,
      keyFeatures,
      productBrand,
      targetAudience,
      commercialAngle,
      duration = "45s",
      customTone,
      llmConfig,
      sceneSetting,
      characters,
    } = req.body;

    const charAName = characters?.[0]?.name || "Bé Áo Vàng";
    const charAOutfit = characters?.[0]?.outfit || "vàng hoa nhí, quấn khăn vàng";
    const charBName = characters?.[1]?.name || "Bé Áo Đỏ";
    const charBOutfit = characters?.[1]?.outfit || "đỏ hoa nhí, quấn khăn đỏ, má bánh bao";

    const prompt = `[BỐI CẢNH DỰ ÁN]: ĐÂY LÀ DỰ ÁN SẢN XUẤT VIDEO QUẢNG CÁO SẢN PHẨM & BÁN HÀNG VIRAL (COMMERCIAL PRODUCT ADVERTISING CAMPAIGN - TIKTOK SHOP / REELS / SHORTS).

VAI TRÒ CỦA BẠN: Bạn là Đạo Diễn Sáng Tạo & Biên Kịch Trưởng chuyên sản xuất Video Quảng Cáo Bán Hàng Trực Diện (Direct-Response Video Ads) với phong cách hài hước, giữ chân người xem từ giây 0 và thúc đẩy chuyển đổi mua hàng cao nhất.

THÔNG TIN CHIẾN DỊCH QUẢNG CÁO:
- Tên sản phẩm quảng cáo: ${productName || "Kính Thông Minh AI Smart Vision"}
- Thương hiệu / Nhãn hàng: ${productBrand || "Thương hiệu chính hãng"}
- Danh mục ngành hàng: ${productCategory || "Thiết bị công nghệ thông minh"}
- Điểm bán hàng độc nhất (USP) & Tính năng cốt lõi: ${keyFeatures || "Cảnh báo chướng ngại vật AR, trợ lý AI rảnh tay, pin trâu 48h"}
- Đối tượng khách hàng mục tiêu: ${targetAudience || "Người dùng thích tiện lợi, người mê công nghệ & gia đình trẻ"}
- Góc tiếp cận quảng cáo (Marketing Angle): ${commercialAngle || "Tình huống va chạm hài hước đời thực ➡️ Trình diễn sản phẩm cứu nguy (Problem - Agitate - Solve - Product Demo)"}
- Phối cảnh / Bối cảnh quay: ${sceneSetting?.name || "Đường Làng Thôn Quê"} (${sceneSetting?.description || "đường làng quê mộc mạc"}). Toàn bộ 5 phân cảnh phải diễn ra tại không gian phối cảnh này.
- Tone giọng kịch bản: ${customTone || "Hài hước, đối đáp dí dỏm, làm nổi bật công năng sản phẩm, kêu gọi hành động mua hàng tự nhiên cuốn hút"}

2 DIỄN VIÊN NHÍ TRẢI NGHIỆM SẢN PHẨM:
1. "${charAName}" (${charAOutfit}): Nhanh nhẹn, lém lỉnh, thực tế, đóng vai người chứng kiến/nhắc nhở và trầm trồ trước công năng sản phẩm.
2. "${charBName}" (${charBOutfit}): Tín đồ công nghệ, thích đập hộp trải nghiệm đồ mới, ngây ngô "Biết rồi mà!", hay gặp sự cố đời thường và dùng sản phẩm để giải quyết cực ngầu.

QUY CHUẨN CẤU TRÚC 5 PHÂN ĐOẠN QUẢNG CÁO CHUYÊN NGHIỆP:
- Cảnh 1 (Hook 3s đầu): Tình huống gặp rắc rối đời thực hoặc va chạm bất ngờ khi CHƯA có sản phẩm (Gây tò mò, chặn ngón tay lướt qua).
- Cảnh 2 (Xung đột & Xuất hiện giải pháp): Rắc rối lên cao ➡️ Rút ngay bảo bối "${productName || "sản phẩm"}" ra cứu nguy, mở hộp / trên tay cận cảnh sản phẩm.
- Cảnh 3 (Trình diễn tính năng thực tế - Live Product Demo): Trực tiếp sử dụng tính năng USP của sản phẩm để xử lý triệt để vấn đề, thể hiện rõ công nghệ và chất lượng đỉnh cao.
- Cảnh 4 (Trải nghiệm vượt trội & Tiện ích cộng thêm): Khám phá thêm tính năng độc đáo khác, hai bé tương tác khen ngợi sản phẩm một cách duyên dáng.
- Cảnh 5 (Cú Twist hài hước, Đúc kết & Kêu gọi chốt đơn CTA): Đúc kết giá trị, đối thoại hóm hỉnh tạo ấn tượng và lời kêu gọi người xem mua ngay / bấm vào giỏ hàng.

QUY TẮC PROMPT HÌNH ẢNH / VIDEO AI (aiPrompt):
- Trường "aiPrompt" của mỗi cảnh PHẢI mô tả bằng tiếng Anh chuẩn cho Kling/Runway/Luma/Flux, nêu rõ nhân vật tương tác trực tiếp hoặc cầm trên tay sản phẩm "${productName || "the product"}", góc quay thương mại (Commercial product cinematography, close-up details, 8k, aspect ratio 9:16 vertical).

Hãy trả về định dạng JSON thuần túy (không kèm markdown \`\`\`json) với cấu trúc:
{
  "title": "Tiêu đề video quảng cáo giật trend",
  "hookHeadline": "Câu hook giật gân 3 giây đầu đánh trúng nỗi đau khách hàng",
  "targetDuration": "${duration}",
  "productName": "${productName || "Kính Thông Minh AI Smart Vision"}",
  "productCategory": "${productCategory || "Thiết bị công nghệ thông minh"}",
  "coreBenefit": "${keyFeatures || "Cảnh báo chướng ngại vật AR, trợ lý AI rảnh tay"}",
  "characters": [
    { "name": "${charAName}", "outfit": "${charAOutfit}", "role": "Người chứng kiến lém lỉnh" },
    { "name": "${charBName}", "outfit": "${charBOutfit}", "role": "Người trải nghiệm sản phẩm" }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "timecode": "00:00 - 00:04",
      "phase": "Hook 3s",
      "shotType": "Toàn cảnh -> Cận cảnh",
      "visual": "Mô tả chi tiết hành động và tình huống rắc rối tại ${sceneSetting?.name || "phối cảnh"}",
      "dialogue": [
        { "speaker": "${charAName}", "line": "Ê coi chừng vấp kìa!", "expression": "Chỉ tay hốt hoảng" },
        { "speaker": "${charBName}", "line": "Biết rồi mà... Ủa!", "expression": "Giật mình suýt ngã" }
      ],
      "sfxMusic": "Tiếng bước chân gấp gáp, hiệu ứng âm thanh cảnh báo vui nhộn",
      "aiPrompt": "Commercial vertical video ad, shot of two cute toddlers on rural dirt road, sudden clumsy trip situation, dramatic funny expression, 8k, photorealistic, cinematic lighting, 9:16"
    }
  ],
  "cta": {
    "visual": "Hai bé cười rạng rỡ khoe hộp sản phẩm ${productName || "sản phẩm"} trên tay",
    "voiceOver": "Sở hữu ngay ${productName || "sản phẩm"} hôm nay để nhận ưu đãi cực hot!",
    "punchline": "Mua ngay kẻo lỡ nha cả nhà ơi!"
  },
  "viralTips": [
    "Nhấn mạnh công năng giải quyết nỗi đau ngay từ giây thứ 10",
    "Giữ nhịp đối đáp nhanh gọn, dí dỏm để người xem nhớ tên sản phẩm",
    "Cận cảnh chi tiết sản phẩm ở cảnh 3 để tăng độ uy tín và tỷ lệ chốt đơn"
  ]
}`;

    const isAgnes = llmConfig?.provider === "agnes" || (llmConfig?.endpointUrl && llmConfig.endpointUrl.includes("agnes"));
    let customEndpoint = llmConfig?.endpointUrl?.trim() || process.env.CUSTOM_LLM_ENDPOINT?.trim();
    if (isAgnes && !customEndpoint) {
      customEndpoint = AGNES_V1;
    }
    const customApiKey = llmConfig?.apiKey?.trim() || process.env.CUSTOM_LLM_API_KEY?.trim();
    const customModel = llmConfig?.modelName?.trim() || (isAgnes ? "agnes-2.5-flash" : process.env.CUSTOM_LLM_MODEL?.trim());

    if (customEndpoint || isAgnes) {
      try {
        const base = isAgnes ? getAgnesBase(customEndpoint) : (customEndpoint || "").replace(/\/+$/, "");
        const fetchUrl = base.includes("/chat/completions") ? base : `${base}/v1/chat/completions`;

        const customRes = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(customApiKey ? { Authorization: `Bearer ${customApiKey}` } : {}),
          },
          body: JSON.stringify({
            model: customModel || (isAgnes ? "agnes-2.5-flash" : "gpt-4o-mini"),
            messages: [
              {
                role: "system",
                content: "You are a master commercial video creative director and viral product marketing copywriter. You produce direct-response, high-converting product commercial scripts. Always reply in valid JSON format only, matching the exact required schema.",
              },
              { role: "user", content: prompt },
            ],
            temperature: llmConfig?.temperature ?? 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (customRes.ok) {
          const customData = await customRes.json();
          const rawContent = customData.choices?.[0]?.message?.content;
          if (rawContent) {
            const cleanJson = rawContent.replace(/```json/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            parsed.id = "script_" + Date.now();
            parsed.productName = productName || "Kính Thông Minh AI Smart Vision";
            parsed.productCategory = productCategory || "Thiết bị công nghệ thông minh";
            parsed.coreBenefit = keyFeatures || "Cảnh báo chướng ngại vật AR, trợ lý AI rảnh tay";
            return res.json({
              success: true,
              script: parsed,
              source: `custom_endpoint (${isAgnes ? "Agnes AI" : customModel || "LLM"})`,
            });
          }
        } else {
          const errBody = await customRes.text();
          console.warn("Custom LLM endpoint failed, falling back to Gemini:", customRes.status, errBody);
        }
      } catch (err: any) {
        console.warn("Error calling custom LLM, falling back to Gemini:", err.message);
      }
    }

    // 2. Gemini fallback
    const gemini = getGenAIClient();
    if (gemini) {
      const chosenModel = "gemini-2.5-flash";
      const response = await gemini.models.generateContent({
        model: chosenModel,
        contents: prompt,
        config: {
          systemInstruction: "Bạn là Giám Đốc Sáng Tạo & Biên Kịch Trưởng chuyên sản xuất kịch bản Video Quảng Cáo Bán Hàng Sản Phẩm (Commercial Product Video Ads) ngắn 30s-60s triệu view. Bạn luôn xây dựng câu chuyện giải quyết nỗi đau khách hàng, biểu diễn tính năng sản phẩm chân thực và chốt đơn tự nhiên.",
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const cleanJson = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);
      parsed.id = "script_" + Date.now();
      parsed.productName = productName || "Kính Thông Minh AI Smart Vision";
      parsed.productCategory = productCategory || "Thiết bị công nghệ thông minh";
      parsed.coreBenefit = keyFeatures || "Cảnh báo chướng ngại vật AR, trợ lý AI rảnh tay";
      return res.json({ success: true, script: parsed, source: `gemini (${chosenModel})` });
    }

    return res.json({
      success: true,
      message: "Generated from curated template",
      source: "curated_template",
    });
  } catch (error: any) {
    console.error("Error generating script:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate script",
    });
  }
});

// API Upload Character Image (Avatar / Reference Image)
app.post("/api/upload-character-image", async (req, res) => {
  try {
    const { imageData, characterRole, fileName } = req.body;
    if (!imageData || typeof imageData !== "string") {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp dữ liệu hình ảnh (base64 hoặc URL)." });
    }

    const role = characterRole === "char_b" ? "char_b" : "char_a";
    const timestamp = Date.now();
    let ext = ".png";
    if (imageData.includes("image/jpeg") || (fileName && fileName.endsWith(".jpg"))) ext = ".jpg";
    if (imageData.includes("image/webp") || (fileName && fileName.endsWith(".webp"))) ext = ".webp";

    const savedFileName = `${role}_${timestamp}_${Math.random().toString(36).slice(2, 6)}${ext}`;
    const filePath = path.join(outputsDir, savedFileName);

    if (imageData.startsWith("data:")) {
      const base64Content = imageData.split(";base64,").pop();
      if (!base64Content) {
        throw new Error("Không thể đọc chuỗi base64 của ảnh");
      }
      fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
    } else if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      const remoteRes = await fetch(imageData);
      if (!remoteRes.ok) {
        throw new Error(`Không thể tải ảnh từ URL: ${remoteRes.statusText}`);
      }
      const arrayBuffer = await remoteRes.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    } else {
      fs.writeFileSync(filePath, Buffer.from(imageData, "base64"));
    }

    const publicUrl = `/outputs/${savedFileName}`;
    console.log(`[CharacterImage] Đã lưu ảnh nhân vật (${role}): ${publicUrl}`);

    return res.json({
      success: true,
      imageUrl: publicUrl,
      role,
      fileName: savedFileName,
    });
  } catch (err: any) {
    console.error("Lỗi khi tải ảnh nhân vật:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi lưu ảnh nhân vật" });
  }
});

// API Upload Product Image (Photo, Mockup, PNG)
app.post("/api/upload-product-image", async (req, res) => {
  try {
    const { imageData, productName, fileName } = req.body;
    if (!imageData || typeof imageData !== "string") {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp dữ liệu hình ảnh (base64 hoặc URL)." });
    }

    const safeName = (productName || "product").toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 20);
    const timestamp = Date.now();
    let ext = ".png";
    if (imageData.includes("image/jpeg") || (fileName && fileName.endsWith(".jpg"))) ext = ".jpg";
    if (imageData.includes("image/webp") || (fileName && fileName.endsWith(".webp"))) ext = ".webp";

    const savedFileName = `prod_${safeName}_${timestamp}_${Math.random().toString(36).slice(2, 6)}${ext}`;
    const filePath = path.join(outputsDir, savedFileName);

    if (imageData.startsWith("data:")) {
      const base64Content = imageData.split(";base64,").pop();
      if (!base64Content) {
        throw new Error("Không thể đọc chuỗi base64 của ảnh");
      }
      fs.writeFileSync(filePath, Buffer.from(base64Content, "base64"));
    } else if (imageData.startsWith("http://") || imageData.startsWith("https://")) {
      const remoteRes = await fetch(imageData);
      if (!remoteRes.ok) {
        throw new Error(`Không thể tải ảnh từ URL: ${remoteRes.statusText}`);
      }
      const arrayBuffer = await remoteRes.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
    } else {
      fs.writeFileSync(filePath, Buffer.from(imageData, "base64"));
    }

    const publicUrl = `/outputs/${savedFileName}`;
    console.log(`[ProductImage] Đã lưu ảnh sản phẩm: ${publicUrl}`);

    return res.json({
      success: true,
      imageUrl: publicUrl,
      fileName: savedFileName,
    });
  } catch (err: any) {
    console.error("Lỗi khi tải ảnh sản phẩm:", err);
    res.status(500).json({ success: false, error: err.message || "Lỗi khi lưu ảnh sản phẩm" });
  }
});

// API generate image (Text-to-Image with Character Consistency)
app.post("/api/generate-image", async (req, res) => {
  try {
    const {
      prompt,
      imageConfig,
      sceneNumber,
      isCharacterPortrait,
      targetCharacter,
      isProductImage,
      targetProduct,
      characterA,
      characterB,
    } = req.body;

    if (!prompt && !targetCharacter && !targetProduct) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    const provider = imageConfig?.provider || "agnes";
    const endpoint = imageConfig?.endpointUrl?.trim() || (provider === "agnes" ? AGNES_V1 : process.env.IMAGE_AI_ENDPOINT?.trim());
    const apiKey = imageConfig?.apiKey?.trim() || process.env.IMAGE_AI_API_KEY?.trim();
    const model = imageConfig?.modelName?.trim() || (provider === "agnes" ? "agnes-image-2.5-flash" : "dall-e-3");
    const aspectRatio = imageConfig?.aspectRatio || (isCharacterPortrait ? "9:16" : "9:16");

    // Build enriched prompt incorporating character descriptions for visual consistency
    let finalPrompt = prompt || "";
    if (isProductImage && targetProduct) {
      const prodName = targetProduct.name || "Tech Product";
      const prodCategory = targetProduct.category || "Tech Device";
      const prodFeatures = targetProduct.features || "";
      finalPrompt = `High-end commercial hero product photograph, clean studio lighting, hyper-realistic 8k render of ${prodName}, Category: ${prodCategory}. Features: ${prodFeatures}. Elegant modern product design, studio softbox illumination, clean background, sharp details, commercial advertisement grade, ultra high definition.`;
    } else if (isCharacterPortrait && targetCharacter) {
      const charName = targetCharacter.name || "Character";
      const charOutfit = targetCharacter.outfit || "";
      const charAppearance = targetCharacter.appearancePrompt || "";
      finalPrompt = `Masterpiece full-body concept model sheet, 9:16 vertical photorealistic cinematic portrait of ${charName}. Details: ${charOutfit}. Appearance: ${charAppearance}. Expressive face, vibrant lighting, highly detailed texture, 8k resolution, clean background.`;
    } else {
      // Scene generation: Enrich prompt with character cues if relevant
      const charNotes: string[] = [];
      if (characterA?.name && (finalPrompt.includes("Vàng") || finalPrompt.includes(characterA.name) || finalPrompt.includes("A"))) {
        charNotes.push(`Character A [${characterA.name}]: ${characterA.outfit || "yellow traditional Vietnamese outfit"}`);
      }
      if (characterB?.name && (finalPrompt.includes("Đỏ") || finalPrompt.includes(characterB.name) || finalPrompt.includes("B"))) {
        charNotes.push(`Character B [${characterB.name}]: ${characterB.outfit || "red traditional Vietnamese outfit"}`);
      }
      if (charNotes.length > 0) {
        finalPrompt = `${finalPrompt}. Character visual specs for consistency: ${charNotes.join("; ")}`;
      }
    }

    // 1. If Agnes AI Image
    if (provider === "agnes" || (endpoint && endpoint.includes("agnes"))) {
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: "Vui lòng nhập API Key cho Agnes Image trong mục Cấu hình AI Models.",
        });
      }

      const imageUrl = await generateAgnesImage(finalPrompt, apiKey, endpoint, aspectRatio);
      return res.json({
        success: true,
        imageUrl,
        source: `agnes_image (${model})`,
        promptUsed: finalPrompt,
      });
    }

    // 2. If OpenAI / DALL-E / Custom Image API
    if (endpoint || apiKey) {
      const fetchUrl = endpoint
        ? (endpoint.includes("/generations") ? endpoint : `${endpoint.replace(/\/$/, "")}/generations`)
        : "https://api.openai.com/v1/images/generations";

      const size = aspectRatio === "9:16" ? "1024x1792" : aspectRatio === "16:9" ? "1792x1024" : "1024x1024";

      const apiRes = await fetch(fetchUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model: model || "dall-e-3",
          prompt: `Cinematic photorealistic 9:16 vertical shot: ${finalPrompt}`,
          n: 1,
          size,
        }),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Image API error (${apiRes.status}): ${errText}`);
      }

      const data = await apiRes.json();
      const imageUrl = data.data?.[0]?.url || data.images?.[0]?.url;
      if (imageUrl) {
        return res.json({
          success: true,
          imageUrl,
          source: `live_api (${model})`,
          promptUsed: finalPrompt,
        });
      }
    }

    return res.json({
      success: true,
      previewPrompt: finalPrompt,
      sceneNumber,
      message: "Prompt đã chuẩn hóa cho Agnes Image / FLUX / DALL-E 3.",
      source: "formatted_prompt",
    });
  } catch (err: any) {
    console.error("Image generation error:", err);
    res.status(500).json({ success: false, error: err.message || "Failed to generate image" });
  }
});

// API generate video (Text/Image-to-Video)
app.post("/api/generate-video", async (req, res) => {
  const { prompt, startImageUrl, videoConfig, sceneNumber, durationSeconds, jobId } = req.body;
  const provider = videoConfig?.provider || "agnes";
  const endpoint = videoConfig?.endpointUrl?.trim() || (provider === "agnes" ? AGNES_V1 : process.env.VIDEO_AI_ENDPOINT?.trim());
  const apiKey = videoConfig?.apiKey?.trim() || process.env.VIDEO_AI_API_KEY?.trim();
  const model = videoConfig?.modelName?.trim() || (provider === "agnes" ? "agnes-video-2.5-flash" : "kling-v1.5");

  try {
    setJobProgress(jobId, 5, "Bắt đầu sinh video clip...", `Cảnh #${sceneNumber || 1}`);

    // 1. Agnes AI Video Generation with 429 backoff and model checking
    if (provider === "agnes" || (endpoint && endpoint.includes("agnes"))) {
      if (!apiKey) {
        setJobProgress(jobId, 0, "Lỗi thiếu API Key", undefined, undefined, "Vui lòng nhập API Key cho Agnes Video trong cài đặt");
        return res.status(400).json({
          success: false,
          error: "Vui lòng nhập API Key cho Agnes Video trong mục Cấu hình AI Models.",
        });
      }

      const videoUrl = await generateAgnesVideo({
        prompt,
        startImageUrl,
        model,
        apiKey,
        endpointUrl: endpoint,
        durationSeconds: durationSeconds || 5,
        jobId,
        onProgress: (percent, stage, detail) => {
          setJobProgress(jobId, percent, stage, detail);
        },
      });

      setJobProgress(jobId, 100, "Hoàn thành video clip!", undefined, videoUrl);
      return res.json({
        success: true,
        videoUrl,
        source: `agnes_video (${model})`,
        sceneNumber,
      });
    }

    // 2. Custom Webhook or other API
    if (endpoint) {
      setJobProgress(jobId, 25, "Đang gửi yêu cầu tới Video Endpoint...", `Model: ${model}`);
      const apiRes = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          prompt,
          image_url: startImageUrl,
          mode: videoConfig?.motionMode || "image-to-video",
          camera_motion: videoConfig?.cameraMotion || "camera tracks sideways",
          duration: durationSeconds || 5,
        }),
      });

      if (!apiRes.ok) {
        const errText = await apiRes.text();
        throw new Error(`Video API error (${apiRes.status}): ${errText}`);
      }

      const data = await apiRes.json();
      const videoUrl = data.video_url || data.output?.video || data.url;
      setJobProgress(jobId, 100, "Hoàn tất video clip!", undefined, videoUrl);
      return res.json({
        success: true,
        taskId: data.id || data.task_id || "task_" + Date.now(),
        videoUrl,
        source: `live_video_api (${provider})`,
      });
    }

    // Direct Web Links Fallback
    const directLinks: Record<string, string> = {
      kling: "https://klingai.com/",
      luma: "https://lumalabs.ai/dream-machine",
      runway: "https://app.runwayml.com/",
      minimax: "https://hailuoai.video/",
      agnes: "https://agnes-ai.com/",
    };

    setJobProgress(jobId, 100, "Prompt sẵn sàng cho Studio", directLinks[provider]);
    return res.json({
      success: true,
      readyPrompt: prompt,
      provider,
      sceneNumber,
      directUrl: directLinks[provider] || "https://klingai.com/",
      message: `Prompt đã được chuẩn hóa cho ${provider.toUpperCase()}.`,
      source: "ready_for_studio",
    });
  } catch (err: any) {
    console.error("Video generation error:", err);
    setJobProgress(jobId, 0, "Lỗi tạo video", undefined, undefined, err.message);
    res.status(500).json({ success: false, error: err.message || "Failed to generate video" });
  }
});

// API Compose Video: Full pipeline (FFmpeg + Edge TTS + Subtitles)
app.post("/api/compose-video", async (req, res) => {
  const { script, clips, ttsConfig, jobId } = req.body;
  try {
    if (!script || !script.scenes) {
      return res.status(400).json({ success: false, error: "Dữ liệu kịch bản không hợp lệ" });
    }

    setJobProgress(jobId, 2, "Bắt đầu quy trình dựng video hoàn chỉnh...", "Kiểm tra các phân cảnh");

    const videoUrl = await composeVideo({
      script,
      clips: clips || {},
      ttsConfig: ttsConfig || {},
      jobId,
      onProgress: (percent, stage, detail) => {
        setJobProgress(jobId, percent, stage, detail);
      },
    });

    setJobProgress(jobId, 100, "Hoàn tất dựng video!", "Đã xuất file MP4 thành công", videoUrl);
    return res.json({
      success: true,
      videoUrl,
      message: "Đã dựng video hoàn chỉnh thành công!",
    });
  } catch (err: any) {
    console.error("Video compose error:", err);
    setJobProgress(jobId, 0, "Lỗi dựng video", undefined, undefined, err.message);
    res.status(500).json({ success: false, error: err.message || "Failed to compose video" });
  }
});

// API Edge TTS: Generate audio clip by speaker (Bé Vàng: hoai-my, Bé Đỏ: nam-minh) or specific voice
app.post("/api/tts", async (req, res) => {
  try {
    const { text, speaker, voice } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ success: false, error: "Vui lòng cung cấp nội dung thoại (text)." });
    }

    const resolvedVoice = voice ? getVoiceForSpeaker(voice, voice) : getVoiceForSpeaker(speaker, VOICE_HOAI_MY);
    const fileName = `tts_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.mp3`;
    const outPath = path.join(outputsDir, fileName);

    const tts = new EdgeTTS({ voice: resolvedVoice, lang: "vi-VN" });
    await tts.ttsPromise(text.trim(), outPath);

    return res.json({
      success: true,
      audioUrl: `/outputs/${fileName}`,
      voice: resolvedVoice,
      speaker: speaker || (resolvedVoice === VOICE_NAM_MINH ? "Bé Đỏ" : "Bé Vàng"),
    });
  } catch (err: any) {
    console.error("TTS generation error:", err);
    res.status(500).json({ success: false, error: err.message || "Không thể tạo giọng đọc Edge TTS." });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
