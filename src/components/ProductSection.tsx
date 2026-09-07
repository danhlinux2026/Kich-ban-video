import React, { useState, useRef } from "react";
import { TechScript, CharacterProfile } from "../types";
import { CHARACTERS } from "../data/presets";
import {
  Package,
  Plus,
  Edit3,
  Sparkles,
  Upload,
  Link,
  Image as ImageIcon,
  Check,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  Tag,
  Zap,
  Info,
  Layers,
  Wand2,
  Camera,
  Trash2,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

interface ProductSectionProps {
  currentScript: TechScript;
  allScripts: TechScript[];
  onSelectScript: (scriptId: string) => void;
  onUpdateCurrentProduct: (updated: {
    productName: string;
    productCategory: string;
    coreBenefit: string;
    productImageUrl?: string;
    productBrand?: string;
  }) => void;
  onAddNewProductScript: (newScript: TechScript) => void;
  onDeleteCustomScript?: (scriptId: string) => void;
  onOpenGenerator: () => void;
  onOpenSettings?: () => void;
  onNextStep?: () => void;
}

const SAMPLE_QUICK_PRODUCTS = [
  {
    name: "Robot Hút Bụi Lau Nhà Dreame X40 Ultra",
    category: "Gia dụng thông minh",
    benefit: "Lực hút 12.000Pa tự gỡ tóc rối, camera AI né dây điện và vật cản cực nhạy, tự giặt sấy giẻ bằng nước nóng 70 độ.",
    brand: "Dreame",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Máy Lọc Không Khí & Quạt Không Cánh Dyson Purifier",
    category: "Thiết bị chăm sóc không khí",
    benefit: "Lọc sạch 99.95% bụi mịn PM0.1, màng lọc than hoạt tính khử mùi lập tức khi có khói hay mùi lạ xung quanh.",
    brand: "Dyson",
    imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Đồng Hồ Thông Minh Watch Ultra Cellular",
    category: "Thiết bị đeo & Smartwatch",
    benefit: "Còi báo động cứu hộ 86dB kêu vang xa 180m, cảm biến phát hiện va chạm mạnh và tự động gọi người thân.",
    brand: "TitanTech",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  },
  {
    name: "Máy Chiếu Mini Di Động Bỏ Túi CinemaPocket 4K",
    category: "Thiết bị nghe nhìn giải trí",
    benefit: "Chiếu thẳng lên trần nhà hoặc bờ tường đất thành màn hình 150 inch, tự động cân chỉnh góc méo trong 1 giây.",
    brand: "CineMax",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
  },
];

export const ProductSection: React.FC<ProductSectionProps> = ({
  currentScript,
  allScripts,
  onSelectScript,
  onUpdateCurrentProduct,
  onAddNewProductScript,
  onDeleteCustomScript,
  onOpenGenerator,
  onOpenSettings,
  onNextStep,
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingCurrent, setIsEditingCurrent] = useState(false);
  const [isImageInputOpen, setIsImageInputOpen] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit current product form states
  const [editName, setEditName] = useState(currentScript.productName);
  const [editCategory, setEditCategory] = useState(currentScript.productCategory);
  const [editBenefit, setEditBenefit] = useState(currentScript.coreBenefit);
  const [editBrand, setEditBrand] = useState(currentScript.productBrand || "");
  const [editImage, setEditImage] = useState(currentScript.productImageUrl || "");

  // New product form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Gia dụng thông minh");
  const [newBenefit, setNewBenefit] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newDuration, setNewDuration] = useState<"30s" | "45s" | "60s">("45s");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const newProductFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync edit state when currentScript changes
  React.useEffect(() => {
    setEditName(currentScript.productName);
    setEditCategory(currentScript.productCategory);
    setEditBenefit(currentScript.coreBenefit);
    setEditBrand(currentScript.productBrand || "");
    setEditImage(currentScript.productImageUrl || "");
    setIsEditingCurrent(false);
    setIsImageInputOpen(false);
  }, [currentScript.id]);

  // Handle uploading product image
  const handleUploadImage = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Vui lòng chọn tệp hình ảnh (.png, .jpg, .webp)");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg("Kích thước ảnh tối đa là 15MB");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await fetch("/api/upload-product-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageData: base64,
            productName: currentScript.productName,
            fileName: file.name,
          }),
        });
        const data = await res.json();
        if (data.success && data.imageUrl) {
          onSuccess(data.imageUrl);
        } else {
          setErrorMsg(data.error || "Không thể tải ảnh lên máy chủ");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Lỗi khi tải ảnh sản phẩm");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Generate AI Product Render
  const handleGenerateAiProductImage = async () => {
    setIsGeneratingAiImage(true);
    setErrorMsg(null);

    try {
      let imageConfig: any = null;
      try {
        const savedMulti = localStorage.getItem("scriptai_multi_model_config");
        if (savedMulti) {
          const parsed = JSON.parse(savedMulti);
          if (parsed.textToImage) imageConfig = parsed.textToImage;
        }
      } catch (e) {}

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isProductImage: true,
          targetProduct: {
            name: currentScript.productName,
            category: currentScript.productCategory,
            features: currentScript.coreBenefit,
          },
          imageConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        onUpdateCurrentProduct({
          productName: currentScript.productName,
          productCategory: currentScript.productCategory,
          coreBenefit: currentScript.coreBenefit,
          productImageUrl: data.imageUrl,
          productBrand: currentScript.productBrand,
        });
      } else {
        setErrorMsg(data.error || "Không thể tạo ảnh sản phẩm bằng AI. Hãy kiểm tra API Key.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi kết nối khi sinh ảnh AI.");
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  // Save current product edit
  const handleSaveEditCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setErrorMsg("Tên sản phẩm không được để trống!");
      return;
    }

    onUpdateCurrentProduct({
      productName: editName.trim(),
      productCategory: editCategory.trim(),
      coreBenefit: editBenefit.trim(),
      productBrand: editBrand.trim() || undefined,
      productImageUrl: editImage.trim() || undefined,
    });
    setIsEditingCurrent(false);
  };

  // Fill sample product
  const handleSelectSample = (sample: (typeof SAMPLE_QUICK_PRODUCTS)[0]) => {
    setNewName(sample.name);
    setNewCategory(sample.category);
    setNewBenefit(sample.benefit);
    setNewBrand(sample.brand);
    setNewImageUrl(sample.imageUrl);
  };

  // Quick Create New Product with Standard Template
  const handleQuickSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg("Vui lòng nhập tên sản phẩm!");
      return;
    }

    const newId = `product-script-${Date.now()}`;
    const brandLabel = newBrand.trim() || "Công nghệ mới";

    const createdScript: TechScript = {
      id: newId,
      title: `Trải Nghiệm Đột Phá Với ${newName.trim()} & Cú Va Chạm Bất Ngờ`,
      productName: newName.trim(),
      productCategory: newCategory.trim(),
      productBrand: brandLabel,
      productImageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80",
      targetDuration: newDuration,
      hookHeadline: `Khi công nghệ ${newName.trim()} ra tay, sự cố biến thành tiếng cười!`,
      coreBenefit: newBenefit.trim() || "Tính năng thông minh giúp xử lý tình huống cực nhạy và tiện lợi.",
      storyConcept: `Tái hiện phân cảnh kinh điển: Bé Áo Vàng cảnh báo, Bé Áo Đỏ ngây ngô tự tin, và sản phẩm ${newName.trim()} giải nguy ngoạn mục.`,
      characters: currentScript.characters || CHARACTERS,
      scenes: [
        {
          sceneNumber: 1,
          timecode: "00:00 - 00:04",
          durationSeconds: 4,
          phase: "Hook 3s",
          shotType: "Medium Shot (Trung cảnh 2 bé) -> Extreme Close-up",
          visual: `Bé Áo Vàng và Bé Áo Đỏ đang mải mê trên đường làng. Bé Áo Đỏ say sưa cắm mặt vào trải nghiệm, Bé Áo Vàng chỉ tay cảnh báo chướng ngại vật phía trước.`,
          dialogue: [
            { speaker: "Bé Áo Vàng", line: "Ê nhìn đường kìa! Cẩn thận coi chừng!", expression: "Hốt hoảng, mắt mở to, ngón tay chỉ thẳng phía trước" },
            { speaker: "Bé Áo Đỏ", line: "Biết rồi mà!...", expression: "Mắt vẫn chú tâm, giọng tự tin ngây thơ" },
          ],
          sfxMusic: "Tiếng bước chân chập chững -> Hiệu ứng âm thanh va chạm hài hước 'BONK!'",
          aiPrompt: `Cinematic medium shot of two cute chubby Asian toddlers walking on rural road, one pointing ahead in panic, one in red floral outfit, photorealistic 8k.`,
        },
        {
          sceneNumber: 2,
          timecode: "00:04 - 00:10",
          durationSeconds: 6,
          phase: "Xung đột & Sự cố",
          shotType: "Whip Pan -> Slow Motion",
          visual: `Sự cố bất ngờ ập đến nhưng sản phẩm ${newName.trim()} lập tức được kích hoạt để đối phó với tình huống.`,
          dialogue: [
            { speaker: "Voice-over", line: `Đừng lo! Đã có ${newName.trim()} trợ thủ đắc lực ngay bên cạnh!`, expression: "Giọng hào sảng, cuốn hút" },
            { speaker: "Bé Áo Đỏ", line: "Xem đây này, đỉnh chưa!", expression: "Khoe nụ cười tự hào, hai má bánh bao rung rinh" },
          ],
          sfxMusic: "Tiếng rewind tua ngược thời gian, âm thanh vi tính kích hoạt hiện đại",
          aiPrompt: `Close-up shot of hands revealing ${newName.trim()}, glowing with modern futuristic aura, high detail.`,
        },
        {
          sceneNumber: 3,
          timecode: "00:10 - 00:20",
          durationSeconds: 10,
          phase: "Xuất hiện Giải pháp",
          shotType: "Macro Product Shot & Feature Demonstration",
          visual: `Cận cảnh ${newName.trim()} vận hành. Tính năng: ${newBenefit || "Công nghệ xử lý tức thì giúp vượt qua khó khăn"}.`,
          dialogue: [
            { speaker: "Bé Áo Vàng", line: "Ủa hay vậy ta? Sao nó làm được thế?", expression: "Mắt tròn xoe, gãi đầu ngạc nhiên" },
            { speaker: "Bé Áo Đỏ", line: "Thấy chưa, tao đã bảo là 'Biết rồi mà'!", expression: "Cười toe toét đắc ý" },
          ],
          sfxMusic: "Âm thanh động cơ mượt mà, hiệu ứng giao diện công nghệ tương lai",
          aiPrompt: `Dynamic product hero showcase of ${newName.trim()}, studio lighting, sharp textures, high resolution.`,
        },
        {
          sceneNumber: 4,
          timecode: "00:20 - 00:32",
          durationSeconds: 12,
          phase: "Trải nghiệm & Tính năng",
          shotType: "Two-shot tương tác vui nhộn",
          visual: `Cả hai bé cùng nhau trải nghiệm sản phẩm trong tiếng cười giòn tan.`,
          dialogue: [
            { speaker: "Bé Áo Vàng", line: "Cho tao thử với coi!", expression: "Chồm tới tranh giành muốn bấm thử" },
            { speaker: "Bé Áo Đỏ", line: "Từ từ, xếp hàng nha bạn ơi!", expression: "Ôm khư khư sản phẩm như báu vật" },
          ],
          sfxMusic: "Tiếng cười nắc nẻ của 2 bé, giai điệu vui tươi rộn ràng",
          aiPrompt: `Two cute toddlers joyfully experimenting with ${newName.trim()} in rustic setting, cinematic warmth, 8k.`,
        },
        {
          sceneNumber: 5,
          timecode: "00:32 - 00:45",
          durationSeconds: 13,
          phase: "Cú Twist & Kêu gọi hành động (CTA)",
          shotType: "Ending Twist & Commercial Banner Overlay",
          visual: `Bé Áo Vàng mải nghịch quá đà lại gặp sự cố hài hước đối xứng. Màn hình hạ xuống poster sản phẩm ${newName.trim()} kèm ưu đãi.`,
          dialogue: [
            { speaker: "Bé Áo Vàng", line: "Cái này thông minh thiệt, nhưng người dùng phải khôn hơn cái máy nha!", expression: "Cười xòa gãi má" },
            { speaker: "Voice-over", line: `Sở hữu ngay ${newName.trim()} hôm nay để nâng tầm trải nghiệm. Nhấp vào giỏ hàng ngay!`, expression: "Nhiệt huyết, thúc giục mua sắm" },
          ],
          sfxMusic: "Tiếng cười ha hả kết thúc -> Jingle thương hiệu bắt tai",
          aiPrompt: `Commercial end-screen with high quality product render of ${newName.trim()} alongside happy cheerful toddlers.`,
        },
      ],
      cta: {
        visual: `Hộp sản phẩm ${newName.trim()} xoay 360 độ và ưu đãi ra mắt`,
        voiceOver: `Nhấp ngay vào liên kết bên dưới để nhận ưu đãi đặc biệt hôm nay!`,
        punchline: `Biết rồi mà, sắm ngay kẻo lỡ!`,
        actionButtonText: `Mua Ngay ${newName.trim()}`,
      },
      viralTips: [
        "Nhấn mạnh cú lật ngược tình thế ở giây thứ 3 để giữ chân người xem.",
        `Làm nổi bật tính năng "${newBenefit || "Đột phá"}" của sản phẩm để kích thích nhu cầu mua hàng.`,
        "Kết thúc bằng câu nói cửa miệng quen thuộc tạo độ viral nhận diện thương hiệu.",
      ],
    };

    onAddNewProductScript(createdScript);
    setIsAddingProduct(false);
    resetNewForm();
  };

  // AI Script Generation for New Product
  const handleGenerateAiScript = async () => {
    if (!newName.trim()) {
      setErrorMsg("Vui lòng nhập tên sản phẩm công nghệ!");
      return;
    }

    setIsGeneratingScript(true);
    setErrorMsg(null);

    let clientConfig = null;
    try {
      const savedMulti = localStorage.getItem("scriptai_multi_model_config");
      if (savedMulti) {
        const parsed = JSON.parse(savedMulti);
        if (parsed.scriptLLM) clientConfig = parsed.scriptLLM;
      }
    } catch (e) {}

    try {
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: newName.trim(),
          productCategory: newCategory.trim(),
          keyFeatures: newBenefit.trim(),
          duration: newDuration,
          customTone: "Hài hước đối đáp, Bé Áo Vàng cà khịa, Bé Áo Đỏ 'Biết rồi mà'",
          llmConfig: clientConfig,
        }),
      });

      const data = await res.json();
      if (data.success && data.script && data.script.scenes) {
        const generated: TechScript = {
          id: `custom-prod-${Date.now()}`,
          title: data.script.title || `Kịch Bản Giới Thiệu ${newName.trim()}`,
          productName: newName.trim(),
          productCategory: newCategory.trim(),
          productBrand: newBrand.trim() || "Công nghệ mới",
          productImageUrl: newImageUrl.trim() || "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80",
          targetDuration: newDuration,
          hookHeadline: data.script.hookHeadline || `Cú va chạm bất ngờ & Giải pháp từ ${newName.trim()}`,
          coreBenefit: newBenefit.trim() || "Tính năng thông minh vượt trội",
          storyConcept: data.script.title || "Bộ đôi nhí trải nghiệm công nghệ mới",
          characters: currentScript.characters || CHARACTERS,
          scenes: data.script.scenes.map((s: any, idx: number) => ({
            sceneNumber: idx + 1,
            timecode: s.timecode || `00:${idx * 8} - 00:${(idx + 1) * 8}`,
            durationSeconds: s.durationSeconds || 8,
            phase: s.phase || "Trải nghiệm & Tính năng",
            shotType: s.shotType || "Medium Shot",
            visual: s.visual || "",
            dialogue: s.dialogue || [],
            sfxMusic: s.sfxMusic || "",
            cameraMovement: s.cameraMovement || "Static",
            aiPrompt: s.aiPrompt || `Cinematic shot related to ${newName.trim()}, 8k.`,
          })),
          cta: {
            visual: data.script.cta?.visual || `Banner sản phẩm ${newName.trim()} và nút đặt hàng`,
            voiceOver: data.script.cta?.voiceOver || "Nhấp vào liên kết bên dưới để đặt mua ngay hôm nay!",
            punchline: data.script.cta?.punchline || "Biết rồi mà, sắm ngay kẻo lỡ!",
            actionButtonText: `Sắm Ngay ${newName.trim()}`,
          },
          viralTips: [
            "Giữ nguyên nhịp điệu tương tác đối đáp vui vẻ của 2 bé ở 3 giây đầu.",
            `Nhấn mạnh rõ tính năng "${newBenefit || "Cốt lõi"}" trong phân cảnh giải pháp.`,
          ],
        };

        onAddNewProductScript(generated);
        setIsAddingProduct(false);
        resetNewForm();
      } else {
        setErrorMsg(data.error || "Không thể sinh kịch bản AI. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi gọi AI sinh kịch bản");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const resetNewForm = () => {
    setNewName("");
    setNewCategory("Gia dụng thông minh");
    setNewBenefit("");
    setNewBrand("");
    setNewImageUrl("");
    setErrorMsg(null);
  };

  const isCustomCurrentScript = currentScript.id.startsWith("custom-") || currentScript.id.startsWith("product-");

  return (
    <section
      id="product-management-section"
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all"
    >
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadImage(file, (url) => {
              onUpdateCurrentProduct({
                productName: currentScript.productName,
                productCategory: currentScript.productCategory,
                coreBenefit: currentScript.coreBenefit,
                productImageUrl: url,
                productBrand: currentScript.productBrand,
              });
            });
          }
        }}
      />

      <input
        type="file"
        ref={newProductFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadImage(file, (url) => {
              setNewImageUrl(url);
            });
          }
        }}
      />

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Package className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Sản Phẩm Công Nghệ Mục Tiêu
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Tâm Điểm Chiến Dịch
              </span>
            </div>
            <p className="text-xs text-slate-300 hidden sm:block">
              Sản phẩm thật được tích hợp xuyên suốt các phân cảnh, lời thoại và visual prompt AI
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-add-product"
            onClick={() => {
              setIsAddingProduct(!isAddingProduct);
              setIsEditingCurrent(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isAddingProduct
                ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs"
            }`}
          >
            {isAddingProduct ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Đóng Form</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm Sản Phẩm Mới</span>
              </>
            )}
          </button>

          {!isAddingProduct && !isEditingCurrent && (
            <button
              id="btn-toggle-edit-current-product"
              onClick={() => setIsEditingCurrent(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Chỉnh Sửa Sản Phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="mx-5 mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SECTION 1: ADD NEW PRODUCT FORM (COLLAPSIBLE) */}
      {isAddingProduct && (
        <div className="p-5 bg-indigo-50/40 border-b border-indigo-100 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Khai Báo Sản Phẩm Công Nghệ Cần Làm Video</span>
              </h3>
              <p className="text-xs text-slate-500">
                Nhập thông tin sản phẩm của bạn hoặc chọn nhanh mẫu bên dưới để tạo kịch bản 5 cảnh ngay lập tức.
              </p>
            </div>
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full w-fit">
              Hỗ trợ AI Gemini & Agnes Video
            </span>
          </div>

          {/* Quick sample chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              Gợi ý sản phẩm mẫu (bấm để điền nhanh):
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUICK_PRODUCTS.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className="px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-700 text-xs font-medium transition-all shadow-2xs text-left truncate max-w-xs"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">
                Tên Sản Phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Robot hút bụi Dreame X40 Ultra, Máy chiếu bỏ túi CinePocket..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Thương Hiệu / Hãng
              </label>
              <input
                type="text"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                placeholder="VD: Dreame, Sony, Dyson..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Ngành Hàng / Danh Mục
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Gia dụng thông minh">Gia dụng thông minh (Robot, máy hút, bếp...)</option>
                <option value="Điện thoại & Máy tính bảng">Điện thoại & Máy tính bảng</option>
                <option value="Kính thông minh & AR/VR">Kính thông minh & Thực tế ảo AR/VR</option>
                <option value="Tai nghe & Âm thanh">Tai nghe & Thiết bị âm thanh</option>
                <option value="Thiết bị đeo & Smartwatch">Thiết bị đeo & Smartwatch</option>
                <option value="Thiết bị chăm sóc sức khỏe">Thiết bị chăm sóc sức khỏe / lọc khí</option>
                <option value="Phụ kiện công nghệ & Bảo vệ">Phụ kiện công nghệ & Bảo vệ (Ốp, sạc, giá đỡ...)</option>
                <option value="Laptop & Phụ kiện văn phòng">Laptop & Phụ kiện máy tính</option>
                <option value="Xe điện & Phương tiện di chuyển">Xe điện & Di chuyển thông minh</option>
                <option value="Thiết bị công nghệ khác">Khác (Tự do)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Thời Lượng Video Kịch Bản
              </label>
              <div className="flex items-center gap-2">
                {(["30s", "45s", "60s"] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setNewDuration(dur)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                      newDuration === dur
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">
                Hình Ảnh Sản Phẩm (Tùy Chọn)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Dán link ảnh URL hoặc tải file lên..."
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => newProductFileInputRef.current?.click()}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1 shrink-0"
                  title="Tải ảnh sản phẩm từ máy tính"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Tải ảnh</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="text-xs font-bold text-slate-700">
                Điểm Bán Hàng Độc Nhất (USP) & Tính Năng Nổi Bật <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                rows={2}
                placeholder="VD: Lực hút 12.000Pa tự gỡ tóc rối, camera AI né vật cản, tự động giặt sấy giẻ bằng nước nóng 70 độ..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Action Buttons for New Product */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-indigo-100">
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                resetNewForm();
              }}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={handleQuickSaveNewProduct}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-300 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Lưu Sản Phẩm (Dùng Kịch Bản Khung)</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateAiScript}
              disabled={isGeneratingScript || !newName.trim()}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white transition-all shadow-xs flex items-center gap-1.5"
            >
              {isGeneratingScript ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>AI Đang Viết Kịch Bản 5 Cảnh...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo Kịch Bản 5 Cảnh Bằng AI (Gemini)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: EDIT CURRENT PRODUCT FORM (INLINE) */}
      {isEditingCurrent && (
        <form
          onSubmit={handleSaveEditCurrent}
          className="p-5 bg-amber-50/40 border-b border-amber-200 space-y-4 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-2 uppercase tracking-wide">
              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
              <span>Chỉnh Sửa Thông Tin Sản Phẩm Hiện Tại</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingCurrent(false)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Tên Sản Phẩm</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Thương Hiệu</label>
              <input
                type="text"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                placeholder="VD: VisionAI, Sony..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Ngành Hàng</label>
              <input
                type="text"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
              />
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Đường Dẫn Ảnh Sản Phẩm (URL)</label>
              <input
                type="text"
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
              />
            </div>
            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Lợi Ích Cốt Lõi / USP</label>
              <textarea
                value={editBenefit}
                onChange={(e) => setEditBenefit(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60">
            <button
              type="button"
              onClick={() => setIsEditingCurrent(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md border border-slate-300 font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-md font-bold shadow-2xs"
            >
              Lưu Thay Đổi
            </button>
          </div>
        </form>
      )}

      {/* SECTION 3: ACTIVE PRODUCT CARD SHOWCASE */}
      <div className="p-5">
        <div className="flex flex-col lg:flex-row items-start gap-5">
          {/* Product Image & Thumbnail Controls */}
          <div className="relative group w-full lg:w-48 shrink-0 flex flex-col items-center">
            <div className="relative w-full h-40 sm:h-44 lg:h-36 rounded-xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-2xs flex items-center justify-center">
              {currentScript.productImageUrl ? (
                <img
                  src={currentScript.productImageUrl}
                  alt={currentScript.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center text-slate-400">
                  <Package className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-[11px] font-medium">Chưa có ảnh sản phẩm</span>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs flex items-center gap-1 border border-white/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Đang chọn
                </span>
              </div>

              {/* Loading overlay for image operations */}
              {(isUploading || isGeneratingAiImage) && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white text-xs gap-2 z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
                  <span>{isUploading ? "Đang tải ảnh lên..." : "AI Đang tạo ảnh..."}</span>
                </div>
              )}
            </div>

            {/* Quick Image Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isGeneratingAiImage}
                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 border border-slate-200"
                title="Tải ảnh sản phẩm từ máy"
              >
                <Camera className="w-3 h-3 text-slate-500" />
                <span>Đổi ảnh</span>
              </button>

              <button
                type="button"
                onClick={handleGenerateAiProductImage}
                disabled={isUploading || isGeneratingAiImage}
                className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition-colors flex items-center justify-center gap-1 border border-indigo-200"
                title="AI tạo ảnh sản phẩm studio chuyên nghiệp"
              >
                <Sparkles className="w-3 h-3 text-indigo-600" />
                <span>AI Tạo Ảnh</span>
              </button>
            </div>
          </div>

          {/* Product Information Details */}
          <div className="flex-1 space-y-3 w-full">
            {/* Header tags */}
            <div className="flex flex-wrap items-center gap-2">
              {currentScript.productBrand && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {currentScript.productBrand}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentScript.productCategory}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Thời lượng: {currentScript.targetDuration}
              </span>
              {isCustomCurrentScript && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Sản phẩm tự tạo
                </span>
              )}
            </div>

            {/* Title */}
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {currentScript.productName}
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5 italic">
                "{currentScript.hookHeadline}"
              </p>
            </div>

            {/* Core Benefit Card */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide text-indigo-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Điểm Bán Hàng Độc Nhất (USP) & Tính Năng Cốt Lõi:
              </span>
              <p className="text-slate-600 leading-relaxed text-xs">
                {currentScript.coreBenefit}
              </p>
            </div>

            {/* Integration Note */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span>Kịch bản hiện hành: <strong className="text-slate-800">{currentScript.title}</strong></span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenGenerator}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Tạo Kịch Bản Mới Cho Sản Phẩm Này</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: PRODUCT SWITCHER CHIPS (ALL AVAILABLE PRODUCTS) */}
        <div className="mt-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Danh Sách Các Sản Phẩm Đã Có Trong Ứng Dụng:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Bấm để chuyển nhanh sản phẩm & kịch bản tương ứng
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {allScripts.map((s) => {
              const isSelected = s.id === currentScript.id;
              const isCustom = s.id.startsWith("custom-") || s.id.startsWith("product-");

              return (
                <div
                  key={s.id}
                  className={`group relative p-2.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50/80 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs"
                      : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs"
                  }`}
                  onClick={() => onSelectScript(s.id)}
                >
                  {/* Small product thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    {s.productImageUrl ? (
                      <img
                        src={s.productImageUrl}
                        alt={s.productName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-indigo-600 truncate max-w-[120px]">
                        {s.productCategory}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {s.productName}
                    </h4>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {s.targetDuration} • {s.scenes.length} phân cảnh
                    </span>
                  </div>

                  {/* Delete button for custom scripts */}
                  {isCustom && onDeleteCustomScript && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Bạn có chắc muốn xóa sản phẩm "${s.productName}"?`)) {
                          onDeleteCustomScript(s.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-opacity shrink-0"
                      title="Xóa sản phẩm này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WORKFLOW BOTTOM STEP NAVIGATION BAR */}
      {onNextStep && (
        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-600 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Sản phẩm hiện tại:</span>
            <strong className="text-slate-900 font-bold">{currentScript.productName}</strong>
          </div>

          <button
            type="button"
            onClick={onNextStep}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-xs flex items-center gap-2"
          >
            <span>Tiếp tục: Chọn Nhân Vật (Bước 2)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
};
