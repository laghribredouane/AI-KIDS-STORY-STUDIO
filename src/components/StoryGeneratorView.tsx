import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Clock,
  Film,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Globe,
} from 'lucide-react';
import { AgeGroup, DiscoveredModels, LanguageCode, StoryProject, StoryScene } from '../types';
import { Translations } from '../i18n';

interface StoryGeneratorViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  models: DiscoveredModels;
  t: Translations;
  onProceedToCharacters: () => void;
}

export const StoryGeneratorView: React.FC<StoryGeneratorViewProps> = ({
  project,
  onUpdateProject,
  models,
  t,
  onProceedToCharacters,
}) => {
  const [prompt, setPrompt] = useState(
    'Seven-year-old stargazer Noor and her clockwork silver fox Fenn climb to the Whispering Observatory to guide twelve timid baby constellations back into the night sky.'
  );
  const [selectedModel, setSelectedModel] = useState(
    models.textModels[0]?.id || 'gemini-3.8-flash'
  );
  const [sceneCount, setSceneCount] = useState<number>(project.scenes.length || 12);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string>(project.scenes[0]?.id || '');

  const totalSeconds = project.scenes.reduce((acc, s) => acc + (s.durationSeconds || 30), 0);
  const totalMinutesFormatted = (totalSeconds / 60).toFixed(1);

  const handleGenerateStory = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language: project.language,
          ageGroup: project.ageGroup,
          targetDurationMinutes: project.targetDurationMinutes,
          sceneCount,
          theme: project.theme,
          visualStyle: project.visualStyle,
          model: selectedModel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate story script');
      }

      const updated: StoryProject = {
        ...project,
        title: data.title || project.title,
        synopsis: data.synopsis || project.synopsis,
        moral: data.moral || project.moral,
        characters: data.characters?.length ? data.characters : project.characters,
        scenes: data.scenes || project.scenes,
        editorConfig: {
          ...project.editorConfig,
          introTitle: data.title || project.title,
          outroMoralText: data.moral || project.moral,
        },
        youtubeMetadata: {
          ...project.youtubeMetadata,
          title: `${data.title || project.title} | 3D Animated Story for Kids`,
          description: `${data.synopsis || ''}\n\nMoral: ${data.moral || ''}\n\nProduced with AI Kids Story Studio.`,
        },
        reviewState: {
          ...project.reviewState,
          storyReviewed: false,
          explicitPublishApproval: false,
        },
        status: 'in_production',
      };

      onUpdateProject(updated);
      if (updated.scenes[0]) {
        setActiveSceneId(updated.scenes[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error during story generation');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateScene = (sceneId: string, patch: Partial<StoryScene>) => {
    const nextScenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, ...patch } : s
    );
    onUpdateProject({ ...project, scenes: nextScenes });
  };

  const handleAddScene = () => {
    if (project.scenes.length >= 14) return;
    const nextNum = project.scenes.length + 1;
    const newScene: StoryScene = {
      id: `scene-${Date.now()}`,
      sceneNumber: nextNum,
      title: `${t.common.scene} ${nextNum}`,
      durationSeconds: 30,
      setting: 'Enchanted Storybook Location',
      narration: 'New scene narration...',
      dialogue: [],
      visualPrompt: '16:9 3D animated storybook scene...',
      cameraDirection: 'Smooth cinematic pan',
      transition: 'dissolve',
      storyApproved: false,
      imageApproved: false,
      audioApproved: false,
    };
    const nextScenes = [...project.scenes, newScene];
    onUpdateProject({ ...project, scenes: nextScenes });
    setActiveSceneId(newScene.id);
  };

  const handleRemoveScene = (sceneId: string) => {
    if (project.scenes.length <= 10) return;
    const filtered = project.scenes
      .filter((s) => s.id !== sceneId)
      .map((s, idx) => ({ ...s, sceneNumber: idx + 1 }));
    onUpdateProject({ ...project, scenes: filtered });
    if (activeSceneId === sceneId && filtered[0]) {
      setActiveSceneId(filtered[0].id);
    }
  };

  const activeScene =
    project.scenes.find((s) => s.id === activeSceneId) || project.scenes[0];

  return (
    <div className="space-y-8">
      {/* Header & Parameters Panel */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.storyModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.storyModule.subheading}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 tabular-nums">
            <span>
              {t.common.language}: <strong className="text-white uppercase">{project.language}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.common.ageGroup}: <strong className="text-white">{project.ageGroup} {t.common.yearsOld}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.common.scenes}: <strong className="text-white">{project.scenes.length} (10–14)</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {t.common.duration}: <strong className="text-purple-300">{totalMinutesFormatted} {t.common.minutes}</strong>
            </span>
          </div>
        </div>

        {/* Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.common.language} (RTL / LTR)
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg">
              {(['en', 'ar', 'fr'] as LanguageCode[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => onUpdateProject({ ...project, language: lang })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    project.language === lang
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'ar' ? 'العربية' : 'Français'}
                </button>
              ))}
            </div>
          </div>

          {/* Age Group Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.common.ageGroup}
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#090D16] border border-slate-800 rounded-lg">
              {(['3-5', '6-8', '9-12'] as AgeGroup[]).map((age) => (
                <button
                  key={age}
                  type="button"
                  onClick={() => onUpdateProject({ ...project, ageGroup: age })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors tabular-nums whitespace-nowrap ${
                    project.ageGroup === age
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {age} {t.common.yearsOld}
                </button>
              ))}
            </div>
          </div>

          {/* Target Duration (5-8 minutes) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.storyModule.targetDurationLabel}: <span className="text-white font-mono tabular-nums">{project.targetDurationMinutes}m</span>
            </label>
            <input
              type="range"
              min={5}
              max={8}
              step={0.5}
              value={project.targetDurationMinutes}
              onChange={(e) => {
                const mins = parseFloat(e.target.value);
                const perScene = Math.round((mins * 60) / project.scenes.length);
                onUpdateProject({
                  ...project,
                  targetDurationMinutes: mins,
                  scenes: project.scenes.map((s) => ({ ...s, durationSeconds: perScene })),
                });
              }}
              className="w-full accent-purple-500 mt-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>5.0 min</span>
              <span>6.5 min</span>
              <span>8.0 min</span>
            </div>
          </div>

          {/* Scene Count (10-14 scenes) */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.storyModule.sceneCountLabel}: <span className="text-white font-mono tabular-nums">{sceneCount}</span>
            </label>
            <input
              type="range"
              min={10}
              max={14}
              step={1}
              value={sceneCount}
              onChange={(e) => setSceneCount(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 mt-2 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
              <span>10 scenes</span>
              <span>12 scenes</span>
              <span>14 scenes</span>
            </div>
          </div>

          {/* Dynamic Gemini Text Model Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Gemini Story Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              {models.textModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt Input & Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.storyModule.promptLabel}
            </label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t.storyModule.promptPlaceholder}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
          <div className="flex flex-col justify-between gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                {t.storyModule.themeLabel}
              </label>
              <input
                type="text"
                value={project.theme}
                onChange={(e) => onUpdateProject({ ...project, theme: e.target.value })}
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              type="button"
              onClick={handleGenerateStory}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t.common.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.storyModule.generateBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800/80 rounded-lg p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={handleGenerateStory}
              className="px-3 py-1 bg-red-800/60 hover:bg-red-700 text-xs text-white rounded-md whitespace-nowrap"
            >
              {t.common.retry}
            </button>
          </div>
        )}
      </div>

      {/* Story Title, Synopsis & Moral Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-medium text-slate-400">
              Story Title ({project.language.toUpperCase()})
            </label>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {project.scenes.length} Scenes · {totalMinutesFormatted} Min Total
            </span>
          </div>
          <input
            type="text"
            value={project.title}
            onChange={(e) => onUpdateProject({ ...project, title: e.target.value })}
            className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-4 py-2.5 text-lg font-bold text-white focus:outline-none focus:border-purple-500"
          />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.storyModule.synopsis}
            </label>
            <textarea
              rows={2}
              value={project.synopsis}
              onChange={(e) => onUpdateProject({ ...project, synopsis: e.target.value })}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-amber-400">
              {t.storyModule.moralLesson}
            </label>
            <textarea
              rows={3}
              value={project.moral}
              onChange={(e) => onUpdateProject({ ...project, moral: e.target.value })}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-amber-100 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Cast: {project.characters.length} 3D Characters
            </span>
            <button
              type="button"
              onClick={onProceedToCharacters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Open Character Studio →
            </button>
          </div>
        </div>
      </div>

      {/* 10-14 Cinematic Scenes Navigator & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scene List */}
        <div className="lg:col-span-4 bg-[#111726] border border-slate-800/80 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-sm font-semibold text-white">
              {t.storyModule.storyArchitecture} ({project.scenes.length})
            </h3>
            <button
              type="button"
              onClick={handleAddScene}
              disabled={project.scenes.length >= 14}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs text-slate-200 rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scene</span>
            </button>
          </div>

          <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
            {project.scenes.map((scene) => {
              const isSelected = scene.id === activeScene?.id;
              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/70 text-white'
                      : 'bg-[#090D16]/70 border-slate-800/70 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-semibold text-purple-400 tabular-nums">
                        #{String(scene.sceneNumber).padStart(2, '0')}
                      </span>
                      <span className="font-medium truncate">{scene.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-mono tabular-nums">
                      <span>{scene.durationSeconds}s</span>
                      <span aria-hidden="true">·</span>
                      <span>{scene.dialogue.length} dialogue lines</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {scene.storyApproved && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                    {project.scenes.length > 10 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveScene(scene.id);
                        }}
                        className="p-1 text-slate-500 hover:text-red-400 rounded"
                        title="Remove scene"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Scene Script Editor */}
        {activeScene && (
          <div className="lg:col-span-8 bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-semibold text-purple-400 tabular-nums">
                  {t.common.scene} {String(activeScene.sceneNumber).padStart(2, '0')}
                </span>
                <input
                  type="text"
                  value={activeScene.title}
                  onChange={(e) =>
                    handleUpdateScene(activeScene.id, { title: e.target.value })
                  }
                  className="bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-base font-semibold text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Duration (s):</span>
                  <input
                    type="number"
                    min={15}
                    max={60}
                    value={activeScene.durationSeconds}
                    onChange={(e) =>
                      handleUpdateScene(activeScene.id, {
                        durationSeconds: Math.max(15, Math.min(60, Number(e.target.value) || 30)),
                      })
                    }
                    className="w-16 bg-[#090D16] border border-slate-800 rounded px-2 py-1 text-xs font-mono tabular-nums text-white"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateScene(activeScene.id, {
                      storyApproved: !activeScene.storyApproved,
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeScene.storyApproved
                      ? 'bg-emerald-950/70 border border-emerald-700/70 text-emerald-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {activeScene.storyApproved ? t.common.approved : t.common.approve}
                  </span>
                </button>
              </div>
            </div>

            {/* Setting */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Scene Location & Atmosphere
              </label>
              <input
                type="text"
                value={activeScene.setting}
                onChange={(e) =>
                  handleUpdateScene(activeScene.id, { setting: e.target.value })
                }
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Narration */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                {t.storyModule.narration}
              </label>
              <textarea
                rows={3}
                value={activeScene.narration}
                onChange={(e) =>
                  handleUpdateScene(activeScene.id, { narration: e.target.value })
                }
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 leading-relaxed focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Character Dialogue */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-400">
                  {t.storyModule.dialogue}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateScene(activeScene.id, {
                      dialogue: [
                        ...activeScene.dialogue,
                        {
                          characterName: project.characters[0]?.name || 'Narrator',
                          text: '',
                        },
                      ],
                    })
                  }
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Line</span>
                </button>
              </div>

              {activeScene.dialogue.map((line, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={line.characterName}
                    onChange={(e) => {
                      const next = [...activeScene.dialogue];
                      next[idx] = { ...next[idx], characterName: e.target.value };
                      handleUpdateScene(activeScene.id, { dialogue: next });
                    }}
                    className="w-32 bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-semibold text-purple-300"
                    placeholder="Character"
                  />
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => {
                      const next = [...activeScene.dialogue];
                      next[idx] = { ...next[idx], text: e.target.value };
                      handleUpdateScene(activeScene.id, { dialogue: next });
                    }}
                    className="flex-1 bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                    placeholder="Dialogue line..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const next = activeScene.dialogue.filter((_, i) => i !== idx);
                      handleUpdateScene(activeScene.id, { dialogue: next });
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* 3D Visual Prompt & Camera Direction */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.storyModule.visualPrompt} (16:9)
                </label>
                <textarea
                  rows={3}
                  value={activeScene.visualPrompt}
                  onChange={(e) =>
                    handleUpdateScene(activeScene.id, { visualPrompt: e.target.value })
                  }
                  className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  {t.storyModule.cameraDirection}
                </label>
                <textarea
                  rows={3}
                  value={activeScene.cameraDirection}
                  onChange={(e) =>
                    handleUpdateScene(activeScene.id, { cameraDirection: e.target.value })
                  }
                  className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
