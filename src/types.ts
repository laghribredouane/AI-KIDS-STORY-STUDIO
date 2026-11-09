export type LanguageCode = 'en' | 'ar' | 'fr';
export type AgeGroup = '3-5' | '6-8' | '9-12';

export interface CharacterProfile {
  id: string;
  name: string;
  role: 'protagonist' | 'companion' | 'mentor' | 'antagonist';
  ageOrType: string;
  personality: string;
  visualAppearance: string; // Detailed 3D prompt anchor for consistency across all scenes
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  avatarUrl: string;
}

export interface DialogueLine {
  characterName: string;
  text: string;
}

export interface StoryScene {
  id: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number; // Target 28-40s per scene so 10-14 scenes = 5 to 8 minutes
  setting: string;
  narration: string;
  dialogue: DialogueLine[];
  visualPrompt: string;
  cameraDirection: string;
  transition: 'fade' | 'dissolve' | 'slide' | 'zoom';
  // Generated assets
  imageUrl?: string;
  imageModelUsed?: string;
  videoUrl?: string;
  videoModelUsed?: string;
  audioUrl?: string;
  audioModelUsed?: string;
  audioVoiceUsed?: string;
  // Human review approvals
  storyApproved: boolean;
  imageApproved: boolean;
  audioApproved: boolean;
}

export interface VideoEditorConfig {
  introEnabled: boolean;
  introTitle: string;
  introSubtitle: string;
  outroEnabled: boolean;
  outroMoralText: string;
  outroCallToAction: string;
  subtitlesEnabled: boolean;
  subtitleSize: 'sm' | 'md' | 'lg';
  backgroundMusicId: string;
  customMusicUrl?: string;
  musicVolume: number; // 0 to 1
  narrationVolume: number; // 0 to 1
  resolution: '1080p' | '720p';
}

export interface YouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId: string; // '1' Film & Animation or '27' Education
  privacyStatus: 'private' | 'unlisted' | 'public';
  selfDeclaredMadeForKids: boolean;
  publishedVideoId?: string;
  publishedUrl?: string;
  publishedAt?: string;
}

export interface HumanReviewState {
  storyReviewed: boolean;
  charactersReviewed: boolean;
  imagesReviewed: boolean;
  audioReviewed: boolean;
  videoReviewed: boolean;
  reviewerName: string;
  reviewerNotes: string;
  explicitPublishApproval: boolean;
  approvedAt?: string;
}

export interface StoryProject {
  id: string;
  title: string;
  synopsis: string;
  moral: string;
  language: LanguageCode;
  ageGroup: AgeGroup;
  targetDurationMinutes: number; // 5 to 8 minutes
  theme: string;
  visualStyle: string;
  characters: CharacterProfile[];
  scenes: StoryScene[];
  editorConfig: VideoEditorConfig;
  reviewState: HumanReviewState;
  youtubeMetadata: YouTubeMetadata;
  status: 'draft' | 'in_production' | 'in_review' | 'approved' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredModels {
  textModels: { id: string; label: string; available: boolean }[];
  imageModels: { id: string; label: string; available: boolean; requiresPaidKey?: boolean }[];
  videoModels: { id: string; label: string; available: boolean; requiresPaidKey?: boolean }[];
  ttsModels: { id: string; label: string; available: boolean }[];
  musicModels: { id: string; label: string; available: boolean; requiresPaidKey?: boolean }[];
  apiKeyConfigured: boolean;
}
