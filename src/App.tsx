/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Users,
  Image as ImageIcon,
  Mic,
  Film,
  ShieldCheck,
  Upload,
  FolderKanban,
  Save,
  Check,
  Sparkles,
} from 'lucide-react';
import { DiscoveredModels, LanguageCode, StoryProject } from './types';
import { TRANSLATIONS } from './i18n';
import { INITIAL_DEMO_PROJECT, HERO_BANNER_URL } from './defaultData';
import { StoryGeneratorView } from './components/StoryGeneratorView';
import { CharacterStudioView } from './components/CharacterStudioView';
import { SceneMediaStudioView } from './components/SceneMediaStudioView';
import { VoiceStudioView } from './components/VoiceStudioView';
import { VideoEditorView } from './components/VideoEditorView';
import { HumanReviewView } from './components/HumanReviewView';
import { YouTubePublishView } from './components/YouTubePublishView';
import { ProjectDrawerModal } from './components/ProjectDrawerModal';

type StudioModuleId =
  | 'story'
  | 'characters'
  | 'visuals'
  | 'voice'
  | 'editor'
  | 'review'
  | 'youtube';

const DEFAULT_MODELS: DiscoveredModels = {
  textModels: [
    { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', available: true },
    { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', available: true },
    { id: 'gemini-4-argon', label: 'Gemini 4 Argon', available: true },
  ],
  imageModels: [
    { id: 'gemini-3.1-flash-lite-image', label: 'Gemini 3.1 Flash Lite Image (16:9)', available: true },
    { id: 'gemini-nano-banana-2.1', label: 'Gemini Nano Banana 2.1 (High-Res)', available: true },
    { id: 'gemini-3-pro-image', label: 'Gemini 3 Pro Image', available: true },
  ],
  videoModels: [
    { id: 'gemini-omni-1.2-flash', label: 'Gemini Omni 1.2 Flash (Veo 16:9)', available: true },
  ],
  ttsModels: [
    { id: 'gemini-3.8-flash-lite-tts', label: 'Gemini 3.8 Flash Lite TTS', available: true },
    { id: 'gemini-3.8-flash-tts', label: 'Gemini 3.8 Flash TTS (Multi-Speaker)', available: true },
  ],
  musicModels: [
    { id: 'lyria-3-clip-preview', label: 'Lyria 3 Clip Preview (30s)', available: true },
  ],
  apiKeyConfigured: true,
};

export default function App() {
  const [projects, setProjects] = useState<StoryProject[]>([INITIAL_DEMO_PROJECT]);
  const [activeProject, setActiveProject] = useState<StoryProject>(INITIAL_DEMO_PROJECT);
  const [activeModule, setActiveModule] = useState<StudioModuleId>('story');
  const [models, setModels] = useState<DiscoveredModels>(DEFAULT_MODELS);
  const [isProjectDrawerOpen, setIsProjectDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  // Rendered 1080p master video state for direct YouTube upload or download
  const [renderedVideoBase64, setRenderedVideoBase64] = useState<string | null>(null);
  const [renderedVideoMimeType, setRenderedVideoMimeType] = useState<string>('video/webm');
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);

  const lang: LanguageCode = activeProject.language || 'en';
  const isRTL = lang === 'ar';
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Load dynamically discovered models and saved projects on mount
  useEffect(() => {
    fetch('/api/models')
      .then((r) => r.json())
      .then((data) => {
        if (data && data.textModels) {
          setModels(data);
        }
      })
      .catch(() => {});

    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.projects) && data.projects.length > 0) {
          setProjects(data.projects);
          setActiveProject(data.projects[0]);
        }
      })
      .catch(() => {});
  }, []);

  const persistProject = useCallback(async (projToSave: StoryProject) => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: projToSave }),
      });
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      }
    } catch {
      // Fallback to local state if network hiccups
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleUpdateProject = useCallback(
    (updated: StoryProject) => {
      setActiveProject(updated);
      persistProject(updated);
    },
    [persistProject]
  );

  const handleCreateNewProject = () => {
    const fresh: StoryProject = {
      ...INITIAL_DEMO_PROJECT,
      id: `proj-${Date.now()}`,
      title: 'Untitled 3D Storybook Adventure',
      synopsis: 'A brand-new animated children’s story ready for production.',
      moral: 'Kindness and curiosity open every door.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      reviewState: {
        storyReviewed: false,
        charactersReviewed: false,
        imagesReviewed: false,
        audioReviewed: false,
        videoReviewed: false,
        reviewerName: '',
        reviewerNotes: '',
        explicitPublishApproval: false,
      },
    };
    handleUpdateProject(fresh);
    setActiveModule('story');
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (Array.isArray(data.projects) && data.projects.length > 0) {
        setProjects(data.projects);
        if (activeProject.id === id) {
          setActiveProject(data.projects[0]);
        }
      }
    } catch {
      // Ignore error
    }
  };

  const sidebarItems: { id: StudioModuleId; label: string; icon: React.ComponentType<any> }[] = [
    { id: 'story', label: t.nav.story, icon: BookOpen },
    { id: 'characters', label: t.nav.characters, icon: Users },
    { id: 'visuals', label: t.nav.visuals, icon: ImageIcon },
    { id: 'voice', label: t.nav.voice, icon: Mic },
    { id: 'editor', label: t.nav.editor, icon: Film },
    { id: 'review', label: t.nav.review, icon: ShieldCheck },
    { id: 'youtube', label: t.nav.youtube, icon: Upload },
  ];

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col"
    >
      {/* Top Bar Contract: Zone 1 (Single-element Brand Wordmark) — Zone 2 (5 Single-Line Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800/80 bg-[#0D1322]/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('story');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 font-display"
        >
          {t.studioName}
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <a
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('story');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'story' ? 'text-white underline underline-offset-8 decoration-purple-500' : ''
            }`}
          >
            {t.nav.story}
          </a>
          <a
            href="#characters"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('characters');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'characters' ? 'text-white underline underline-offset-8 decoration-purple-500' : ''
            }`}
          >
            {t.nav.characters}
          </a>
          <a
            href="#visuals"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('visuals');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'visuals' ? 'text-white underline underline-offset-8 decoration-purple-500' : ''
            }`}
          >
            {t.nav.visuals}
          </a>
          <a
            href="#editor"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('editor');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'editor' ? 'text-white underline underline-offset-8 decoration-purple-500' : ''
            }`}
          >
            {t.nav.editor}
          </a>
          <a
            href="#youtube"
            onClick={(e) => {
              e.preventDefault();
              setActiveModule('youtube');
            }}
            className={`hover:text-white transition-colors whitespace-nowrap shrink-0 ${
              activeModule === 'youtube' ? 'text-white underline underline-offset-8 decoration-purple-500' : ''
            }`}
          >
            {t.nav.youtube}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => persistProject(activeProject)}
            className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            {justSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.common.saved}</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? t.common.saving : t.common.saveProject}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Studio Pipeline Sidebar (260px on Desktop) */}
        <aside className="w-full lg:w-64 bg-[#0D1322] border-b lg:border-b-0 lg:border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            {/* Active Project Selector Button */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsProjectDrawerOpen(true)}
                className="w-full p-3 rounded-xl bg-[#111726] border border-slate-800 hover:border-purple-500/60 text-left transition-colors flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-purple-400 font-medium">
                    Active Story Project
                  </div>
                  <div className="text-xs font-bold text-white truncate mt-0.5">
                    {activeProject.title}
                  </div>
                </div>
                <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Quick Language Switcher (AR RTL / EN LTR / FR LTR) */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg">
                {(['en', 'ar', 'fr'] as LanguageCode[]).map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() =>
                      handleUpdateProject({ ...activeProject, language: code })
                    }
                    className={`py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      activeProject.language === code
                        ? 'bg-purple-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {code === 'en' ? 'EN' : code === 'ar' ? 'عربي' : 'FR'}
                  </button>
                ))}
              </div>
            </div>

            {/* 7-Step Production Pipeline Navigation */}
            <div className="space-y-1">
              <div className="px-2 pb-1.5 text-[11px] font-medium text-slate-400">
                Production Pipeline
              </div>
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    className={`w-full px-3 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between gap-2.5 transition-colors whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-[#111726] hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {item.id === 'review' &&
                      activeProject.reviewState.explicitPublishApproval && (
                        <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                      )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Project Summary Footer */}
          <div className="hidden lg:block pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5 font-mono tabular-nums">
            <div>
              Scenes: <span className="text-slate-200">{activeProject.scenes.length}</span>
            </div>
            <div>
              Characters: <span className="text-slate-200">{activeProject.characters.length}</span>
            </div>
            <div>
              Review Gate:{' '}
              <span
                className={
                  activeProject.reviewState.explicitPublishApproval
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }
              >
                {activeProject.reviewState.explicitPublishApproval
                  ? 'Approved'
                  : 'Pending'}
              </span>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Studio Hero Banner on Story Tab */}
          {activeModule === 'story' && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-[#111726]">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                <div className="lg:col-span-7 p-6 lg:p-8 flex flex-col justify-center space-y-3">
                  <div className="text-xs font-medium text-purple-300">
                    3D Animated Storybook Production Suite · Arabic (RTL) · English · French
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight font-display">
                    {activeProject.title}
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                    {activeProject.synopsis}
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono tabular-nums">
                    <span>Ages {activeProject.ageGroup}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeProject.scenes.length} Cinematic Scenes</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeProject.targetDurationMinutes} Min Runtime</span>
                    <span aria-hidden="true">·</span>
                    <span>1080p Master Export</span>
                  </div>
                </div>
                <div className="lg:col-span-5 relative min-h-[200px]">
                  <img
                    src={HERO_BANNER_URL}
                    alt="AI Kids Story Studio 3D Storybook"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#111726] via-transparent to-transparent hidden lg:block" />
                </div>
              </div>
            </div>
          )}

          {/* Active Studio Module */}
          {activeModule === 'story' && (
            <StoryGeneratorView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              models={models}
              t={t}
              onProceedToCharacters={() => setActiveModule('characters')}
            />
          )}

          {activeModule === 'characters' && (
            <CharacterStudioView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              models={models}
              t={t}
              onProceedToVisuals={() => setActiveModule('visuals')}
            />
          )}

          {activeModule === 'visuals' && (
            <SceneMediaStudioView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              models={models}
              t={t}
              onProceedToVoice={() => setActiveModule('voice')}
            />
          )}

          {activeModule === 'voice' && (
            <VoiceStudioView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              models={models}
              t={t}
              onProceedToEditor={() => setActiveModule('editor')}
            />
          )}

          {activeModule === 'editor' && (
            <VideoEditorView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              t={t}
              renderedVideoUrl={renderedVideoUrl}
              onRenderedVideoReady={(base64, mimeType, blobUrl) => {
                setRenderedVideoBase64(base64);
                setRenderedVideoMimeType(mimeType);
                setRenderedVideoUrl(blobUrl);
              }}
              onProceedToReview={() => setActiveModule('review')}
            />
          )}

          {activeModule === 'review' && (
            <HumanReviewView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              t={t}
              onProceedToYouTube={() => setActiveModule('youtube')}
            />
          )}

          {activeModule === 'youtube' && (
            <YouTubePublishView
              project={activeProject}
              onUpdateProject={handleUpdateProject}
              t={t}
              renderedVideoBase64={renderedVideoBase64}
              renderedVideoMimeType={renderedVideoMimeType}
              onGoToReview={() => setActiveModule('review')}
              onGoToEditor={() => setActiveModule('editor')}
            />
          )}
        </main>
      </div>

      {/* Persistent Project Management Modal */}
      <ProjectDrawerModal
        isOpen={isProjectDrawerOpen}
        onClose={() => setIsProjectDrawerOpen(false)}
        projects={projects}
        activeProjectId={activeProject.id}
        onSelectProject={(proj) => setActiveProject(proj)}
        onCreateNewProject={handleCreateNewProject}
        onDeleteProject={handleDeleteProject}
        t={t}
      />
    </div>
  );
}
