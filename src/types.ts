export interface DialogueLine {
  speaker: "Bé Áo Vàng" | "Bé Áo Đỏ" | "Voice-over" | "Cả hai";
  line: string;
  expression: string;
  tone?: string;
}

export interface Scene {
  sceneNumber: number;
  timecode: string;
  durationSeconds: number;
  phase: "Hook 3s" | "Xung đột & Sự cố" | "Xuất hiện Giải pháp" | "Trải nghiệm & Tính năng" | "Cú Twist & Kêu gọi hành động (CTA)";
  shotType: string;
  visual: string;
  dialogue: DialogueLine[];
  sfxMusic: string;
  cameraMovement?: string;
  aiPrompt?: string;
  generatedImageUrl?: string;
  generatedVideoUrl?: string;
}

export interface CharacterProfile {
  id?: string;
  name: string;
  nickname: string;
  outfit: string;
  personality: string;
  signatureQuote: string;
  roleInVideo: string;
  avatarColor: string;
  badge: string;
  avatarUrl?: string; // Reference image URL for AI generation & visual consistency
  appearancePrompt?: string; // Detailed visual description for AI prompt generation
  voice?: "vi-VN-HoaiMyNeural" | "vi-VN-NamMinhNeural" | string;
  gender?: "female" | "male" | "other";
}

export interface LLMConfig {
  provider: "agnes" | "gemini" | "openai" | "deepseek" | "custom";
  modelName: string;
  apiKey: string;
  endpointUrl: string; // e.g. https://apihub.agnes-ai.com/v1 or https://api.openai.com/v1
  temperature?: number;
}

export interface ImageModelConfig {
  provider: "agnes" | "openai" | "fal" | "flux" | "recraft" | "custom";
  modelName: string;
  apiKey: string;
  endpointUrl: string; // e.g. https://apihub.agnes-ai.com/v1 or https://api.openai.com/v1/images/generations
  aspectRatio: "9:16" | "16:9" | "1:1";
  imageStyle?: string;
}

export interface VideoModelConfig {
  provider: "agnes" | "kling" | "luma" | "runway" | "minimax" | "custom";
  modelName: string; // agnes-video-2.5-flash | agnes-video-v2.0 | agnes-video-2.5 | kling-v1.5 | ...
  apiKey: string;
  endpointUrl: string; // e.g. https://apihub.agnes-ai.com/v1 or custom
  motionMode: "image-to-video" | "text-to-video";
  cameraMotion: string;
  // Compose settings
  clipDurationMode?: "auto" | "fixed_5s" | "fixed_10s";
  ttsVoice?: "vi-VN-HoaiMyNeural" | "vi-VN-NamMinhNeural" | "dialogue_duo";
  autoSubtitles?: boolean;
  backgroundMusicUrl?: string;
}

export interface AIStudioConfig {
  scriptLLM: LLMConfig;
  textToImage: ImageModelConfig;
  textToVideo: VideoModelConfig;
}

export interface PipelineSceneProgress {
  sceneNumber: number;
  status: "idle" | "image_generating" | "image_done" | "video_generating" | "completed" | "error";
  imageUrl?: string;
  videoUrl?: string;
  error?: string;
}

export interface PipelineCheckpoint {
  scriptId: string;
  images: Record<number, string>;
  clips: Record<number, string>;
  lastUpdated: number;
  composedVideoUrl?: string;
}

export interface JobProgress {
  jobId: string;
  percent: number;
  stage: string;
  detail?: string;
  error?: string;
  completed?: boolean;
  resultUrl?: string;
}

export interface SceneSetting {
  id: string;
  name: string;
  category: "rural" | "living_room" | "urban_street" | "tech_office" | "studio" | "outdoor_park" | "custom";
  description: string;
  environmentPrompt: string;
  lighting: string;
  cameraVibe: string;
  thumbnailUrl: string;
  badge?: string;
  cameraAngle?: string;
  colorGrade?: string;
}

export interface TechScript {
  id: string;
  title: string;
  productName: string;
  productCategory: string;
  productImageUrl?: string;
  productBrand?: string;
  productKeyFeatures?: string;
  targetDuration: "30s" | "45s" | "60s";
  hookHeadline: string;
  coreBenefit: string;
  storyConcept: string;
  characters: CharacterProfile[];
  sceneSetting?: SceneSetting;
  scenes: Scene[];
  cta: {
    visual: string;
    voiceOver: string;
    punchline: string;
    actionButtonText?: string;
  };
  viralTips: string[];
}
