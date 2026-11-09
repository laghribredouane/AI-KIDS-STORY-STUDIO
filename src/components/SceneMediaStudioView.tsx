import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Film,
  Layers,
  Play,
} from 'lucide-react';
import { DiscoveredModels, StoryProject, StoryScene } from '../types';
import { Translations } from '../i18n';

interface SceneMediaStudioViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  models: DiscoveredModels;
  t: Translations;
  onProceedToVoice: () => void;
}

export const SceneMediaStudioView: React.FC<SceneMediaStudioViewProps> = ({
  project,
  onUpdateProject,
  models,
  t,
  onProceedToVoice,
}) => {
  const [selectedImageModel, setSelectedImageModel] = useState(
    models.imageModels[0]?.id || 'gemini-3.1-flash-lite-image'
  );
  const [selectedVideoModel, setSelectedVideoModel] = useState(
    models.videoModels[0]?.id || 'gemini-omni-1.2-flash'
  );
  const [busySceneImageId, setBusySceneImageId] = useState<string | null>(null);
  const [busySceneVideoId, setBusySceneVideoId] = useState<string | null>(null);
  const [videoProgressText, setVideoProgressText] = useState<Record<string, string>>({});
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const characterDNAArray = project.characters.map(
    (c) => `${c.name} (${c.role}): ${c.visualAppearance}`
  );

  const handleUpdateScene = (sceneId: string, patch: Partial<StoryScene>) => {
    const nextScenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, ...patch } : s
    );
    onUpdateProject({ ...project, scenes: nextScenes });
  };

  const handleGenerateSceneImage = async (scene: StoryScene) => {
    setBusySceneImageId(scene.id);
    setError(null);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Scene ${scene.sceneNumber} (${scene.title}) at ${scene.setting}: ${scene.visualPrompt}. Camera: ${scene.cameraDirection}`,
          characterDescriptions: characterDNAArray,
          visualStyle: project.visualStyle,
          aspectRatio: '16:9',
          model: selectedImageModel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to generate image for Scene ${scene.sceneNumber}`);
      }
      handleUpdateScene(scene.id, {
        imageUrl: data.imageUrl,
        imageModelUsed: data.modelUsed,
      });
    } catch (err: any) {
      setError(err?.message || 'Scene image generation error');
    } finally {
      setBusySceneImageId(null);
    }
  };

  const handleBatchGenerateMissingImages = async () => {
    setBatchGenerating(true);
    setError(null);
    const updatedScenes = [...project.scenes];

    for (let i = 0; i < updatedScenes.length; i++) {
      const scene = updatedScenes[i];
      if (scene.imageUrl) continue;
      setBusySceneImageId(scene.id);
      try {
        const response = await fetch('/api/image/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `Scene ${scene.sceneNumber} (${scene.title}) at ${scene.setting}: ${scene.visualPrompt}. Camera: ${scene.cameraDirection}`,
            characterDescriptions: characterDNAArray,
            visualStyle: project.visualStyle,
            aspectRatio: '16:9',
            model: selectedImageModel,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Batch stopped at Scene ${scene.sceneNumber}`);
        }
        updatedScenes[i] = {
          ...scene,
          imageUrl: data.imageUrl,
          imageModelUsed: data.modelUsed,
        };
        onUpdateProject({ ...project, scenes: [...updatedScenes] });
      } catch (err: any) {
        setError(err?.message || 'Batch image generation interrupted');
        break;
      }
    }
    setBusySceneImageId(null);
    setBatchGenerating(false);
  };

  const handleGenerateSceneVideo = async (scene: StoryScene) => {
    setBusySceneVideoId(scene.id);
    setError(null);
    setVideoProgressText((prev) => ({
      ...prev,
      [scene.id]: 'Initializing Veo / Omni Flash 16:9 animation interaction...',
    }));

    const timer = setInterval(() => {
      setVideoProgressText((prev) => ({
        ...prev,
        [scene.id]: 'Synthesizing 3D motion frames & camera movement...',
      }));
    }, 4500);

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${scene.visualPrompt}. Camera motion: ${scene.cameraDirection}`,
          imageDataUrl: scene.imageUrl?.startsWith('data:image/') ? scene.imageUrl : undefined,
          characterDescriptions: characterDNAArray,
          model: selectedVideoModel,
          duration: '5s',
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Video generation failed for Scene ${scene.sceneNumber}`);
      }
      handleUpdateScene(scene.id, {
        videoUrl: data.videoUrl,
        videoModelUsed: data.modelUsed,
      });
    } catch (err: any) {
      setError(err?.message || 'Scene video generation failed');
    } finally {
      clearInterval(timer);
      setBusySceneVideoId(null);
      setVideoProgressText((prev) => {
        const next = { ...prev };
        delete next[scene.id];
        return next;
      });
    }
  };

  const generatedImagesCount = project.scenes.filter((s) => Boolean(s.imageUrl)).length;
  const generatedVideosCount = project.scenes.filter((s) => Boolean(s.videoUrl)).length;

  return (
    <div className="space-y-8">
      {/* Studio Control Bar */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.visualsModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.visualsModule.subheading}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono tabular-nums">
            <span>
              16:9 Images: <strong className="text-white">{generatedImagesCount}/{project.scenes.length}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Veo Clips: <strong className="text-purple-300">{generatedVideosCount}/{project.scenes.length}</strong>
            </span>
          </div>
        </div>

        {/* Model Selection & Batch Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Google Image Generation Model (16:9)
            </label>
            <select
              value={selectedImageModel}
              onChange={(e) => setSelectedImageModel(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              {models.imageModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Google Veo / Omni Video Model (16:9)
            </label>
            <select
              value={selectedVideoModel}
              onChange={(e) => setSelectedVideoModel(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              {models.videoModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchGenerateMissingImages}
              disabled={batchGenerating}
              className="flex-1 py-2 px-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {batchGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.common.generating}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.visualsModule.generateAllImages}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onProceedToVoice}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer"
            >
              Voice Studio →
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
              onClick={() => setError(null)}
              className="px-2.5 py-1 bg-red-900/50 text-xs text-white rounded"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* 16:9 Scene Storyboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {project.scenes.map((scene) => {
          const isGeneratingImg = busySceneImageId === scene.id;
          const isGeneratingVid = busySceneVideoId === scene.id;
          const progressNote = videoProgressText[scene.id];

          return (
            <div
              key={scene.id}
              className="bg-[#111726] border border-slate-800/80 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              {/* 16:9 Widescreen Media Frame */}
              <div className="aspect-video w-full bg-[#090D16] relative overflow-hidden border-b border-slate-800">
                {scene.videoUrl ? (
                  <video
                    src={scene.videoUrl}
                    controls
                    loop
                    className="w-full h-full object-cover"
                  />
                ) : scene.imageUrl ? (
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#131B2E] via-[#090D16] to-purple-950/40">
                    <ImageIcon className="w-10 h-10 text-purple-400/60 mb-2" />
                    <p className="text-xs font-semibold text-slate-200">
                      {t.common.scene} {scene.sceneNumber}: {scene.title}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-md mt-1 line-clamp-2">
                      {scene.visualPrompt}
                    </p>
                  </div>
                )}

                {/* Top Overlay Scrim Metadata */}
                <div className="absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-white tabular-nums">
                    #{String(scene.sceneNumber).padStart(2, '0')} · {scene.title}
                  </span>
                  <span className="text-[11px] text-slate-300 font-mono tabular-nums">
                    16:9 · {scene.durationSeconds}s
                  </span>
                </div>

                {/* Live Video Generation Progress Overlay */}
                {isGeneratingVid && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                    <div className="text-xs font-semibold text-white">
                      {progressNote || 'Generating Veo Animated Clip...'}
                    </div>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 animate-pulse w-2/3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Scene Prompt & Generation Controls */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-medium text-slate-400">
                    16:9 Visual Prompt ({t.visualsModule.characterDnaInjected})
                  </label>
                  <textarea
                    rows={2}
                    value={scene.visualPrompt}
                    onChange={(e) =>
                      handleUpdateScene(scene.id, { visualPrompt: e.target.value })
                    }
                    className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGenerateSceneImage(scene)}
                      disabled={isGeneratingImg || isGeneratingVid}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {isGeneratingImg ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{t.common.generating}</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>
                            {scene.imageUrl
                              ? t.common.regenerate
                              : t.visualsModule.generateSceneImage}
                          </span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleGenerateSceneVideo(scene)}
                      disabled={isGeneratingVid || isGeneratingImg}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {isGeneratingVid ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Animating...</span>
                        </>
                      ) : (
                        <>
                          <Video className="w-3.5 h-3.5 text-purple-400" />
                          <span>
                            {scene.videoUrl
                              ? 'Regenerate Veo Clip'
                              : t.visualsModule.generateSceneVideo}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateScene(scene.id, {
                        imageApproved: !scene.imageApproved,
                      })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                      scene.imageApproved
                        ? 'bg-emerald-950/70 border border-emerald-700/70 text-emerald-300'
                        : 'bg-[#090D16] border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {scene.imageApproved ? t.common.approved : t.common.approve}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
