import React, { useState, useMemo } from 'react';
import {
  Mic,
  Music,
  Volume2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Play,
} from 'lucide-react';
import { DiscoveredModels, StoryProject, StoryScene } from '../types';
import { Translations } from '../i18n';
import { LICENSED_MUSIC_TRACKS } from '../defaultData';
import { synthesizeLicensedTrackWav } from '../utils/musicSynth';

interface VoiceStudioViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  models: DiscoveredModels;
  t: Translations;
  onProceedToEditor: () => void;
}

export const VoiceStudioView: React.FC<VoiceStudioViewProps> = ({
  project,
  onUpdateProject,
  models,
  t,
  onProceedToEditor,
}) => {
  const [selectedTtsModel, setSelectedTtsModel] = useState(
    models.ttsModels[0]?.id || 'gemini-3.8-flash-lite-tts'
  );
  const [selectedVoice, setSelectedVoice] = useState<
    'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon'
  >('Kore');
  const [busySceneId, setBusySceneId] = useState<string | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState(
    'Gentle whimsical 30-second orchestral children’s storybook score with celesta, warm strings, and soft flute'
  );
  const [generatingMusic, setGeneratingMusic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const licensedPreviewUrl = useMemo(() => {
    if (project.editorConfig.customMusicUrl) {
      return project.editorConfig.customMusicUrl;
    }
    return synthesizeLicensedTrackWav(project.editorConfig.backgroundMusicId, 16);
  }, [project.editorConfig.backgroundMusicId, project.editorConfig.customMusicUrl]);

  const handleUpdateScene = (sceneId: string, patch: Partial<StoryScene>) => {
    const nextScenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, ...patch } : s
    );
    onUpdateProject({ ...project, scenes: nextScenes });
  };

  const handleSynthesizeSceneVoice = async (scene: StoryScene) => {
    setBusySceneId(scene.id);
    setError(null);
    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scene.narration,
          dialogue: scene.dialogue,
          language: project.language,
          voiceName: selectedVoice,
          model: selectedTtsModel,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to generate TTS for Scene ${scene.sceneNumber}`);
      }
      handleUpdateScene(scene.id, {
        audioUrl: data.audioUrl,
        audioModelUsed: data.modelUsed,
        audioVoiceUsed: data.voiceUsed,
      });
    } catch (err: any) {
      setError(err?.message || 'TTS generation error');
    } finally {
      setBusySceneId(null);
    }
  };

  const handleBatchSynthesizeAll = async () => {
    setBatchBusy(true);
    setError(null);
    const updatedScenes = [...project.scenes];

    for (let i = 0; i < updatedScenes.length; i++) {
      const scene = updatedScenes[i];
      if (scene.audioUrl) continue;
      setBusySceneId(scene.id);
      try {
        const response = await fetch('/api/voice/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: scene.narration,
            dialogue: scene.dialogue,
            language: project.language,
            voiceName: selectedVoice,
            model: selectedTtsModel,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Batch TTS stopped at Scene ${scene.sceneNumber}`);
        }
        updatedScenes[i] = {
          ...scene,
          audioUrl: data.audioUrl,
          audioModelUsed: data.modelUsed,
          audioVoiceUsed: data.voiceUsed,
        };
        onUpdateProject({ ...project, scenes: [...updatedScenes] });
      } catch (err: any) {
        setError(err?.message || 'Batch TTS interrupted');
        break;
      }
    }
    setBusySceneId(null);
    setBatchBusy(false);
  };

  const handleGenerateLyriaMusic = async () => {
    setGeneratingMusic(true);
    setError(null);
    try {
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: musicPrompt }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Lyria music generation failed');
      }
      onUpdateProject({
        ...project,
        editorConfig: {
          ...project.editorConfig,
          customMusicUrl: data.audioDataUrl,
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to generate custom score with Lyria');
    } finally {
      setGeneratingMusic(false);
    }
  };

  const completedVoices = project.scenes.filter((s) => Boolean(s.audioUrl)).length;

  return (
    <div className="space-y-8">
      {/* Top Voice & Music Configuration Bar */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.voiceModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.voiceModule.subheading}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono tabular-nums">
            <span>
              Language: <strong className="text-white uppercase">{project.language}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Scene Narrations: <strong className="text-purple-300">{completedVoices}/{project.scenes.length}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Google Text-to-Speech Model
            </label>
            <select
              value={selectedTtsModel}
              onChange={(e) => setSelectedTtsModel(e.target.value)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              {models.ttsModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.voiceModule.narratorVoice} (Arabic / English / French)
            </label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value as any)}
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              <option value="Kore">Kore — Warm Expressive Storyteller</option>
              <option value="Puck">Puck — Playful Animated Youth</option>
              <option value="Zephyr">Zephyr — Gentle Bedtime Narrator</option>
              <option value="Fenrir">Fenrir — Deep Theatrical Guardian</option>
              <option value="Charon">Charon — Calm Wise Historian</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchSynthesizeAll}
              disabled={batchBusy}
              className="flex-1 py-2 px-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              {batchBusy ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.common.generating}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t.voiceModule.generateAllVoice}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onProceedToEditor}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer"
            >
              Video Editor →
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

      {/* Licensed Background Music Studio & Lyria Composer */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Music className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-white">
                {t.voiceModule.licensedMusicTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {t.voiceModule.licensedMusicDesc}
              </p>
            </div>
          </div>

          <audio
            src={licensedPreviewUrl}
            controls
            className="h-9 w-full md:w-72"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Licensed Presets */}
          <div className="space-y-2.5">
            <label className="block text-xs font-medium text-slate-400">
              Select Licensed Background Score (Royalty-Free & YouTube Kids Safe)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LICENSED_MUSIC_TRACKS.map((track) => {
                const isSelected =
                  !project.editorConfig.customMusicUrl &&
                  project.editorConfig.backgroundMusicId === track.id;
                return (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() =>
                      onUpdateProject({
                        ...project,
                        editorConfig: {
                          ...project.editorConfig,
                          backgroundMusicId: track.id,
                          customMusicUrl: undefined,
                        },
                      })
                    }
                    className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/40 border-purple-500 text-white'
                        : 'bg-[#090D16] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{track.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {track.mood}
                    </div>
                    <div className="text-[10px] text-purple-400 font-mono mt-1 tabular-nums">
                      {track.license} · {track.tempoBpm} BPM
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gemini Lyria Custom Score Generator */}
          <div className="space-y-3 bg-[#090D16] border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white">
                Gemini Lyria 3 Custom Score Generator (`lyria-3-clip-preview`)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">30s MP3</span>
            </div>
            <textarea
              rows={2}
              value={musicPrompt}
              onChange={(e) => setMusicPrompt(e.target.value)}
              className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleGenerateLyriaMusic}
              disabled={generatingMusic}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {generatingMusic ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Lyria Score...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t.voiceModule.aiMusicGenerate}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Per-Scene Narration & Dialogue Voice Synthesis List */}
      <div className="space-y-4">
        {project.scenes.map((scene) => {
          const isBusy = busySceneId === scene.id;
          return (
            <div
              key={scene.id}
              className="bg-[#111726] border border-slate-800/80 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="font-mono font-semibold text-purple-400 tabular-nums">
                    #{String(scene.sceneNumber).padStart(2, '0')}
                  </span>
                  <span className="font-bold text-white">{scene.title}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-slate-400 font-mono tabular-nums">
                    {scene.durationSeconds}s
                  </span>
                  {scene.audioVoiceUsed && (
                    <>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-purple-300 font-mono">
                        Voice: {scene.audioVoiceUsed}
                      </span>
                    </>
                  )}
                </div>

                <textarea
                  rows={2}
                  value={scene.narration}
                  onChange={(e) =>
                    handleUpdateScene(scene.id, { narration: e.target.value })
                  }
                  className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500"
                />

                {scene.dialogue.length > 0 && (
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {scene.dialogue.map((d, idx) => (
                      <span key={idx}>
                        <strong className="text-purple-300">{d.characterName}:</strong>{' '}
                        “{d.text}”
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {scene.audioUrl && (
                  <audio
                    src={scene.audioUrl}
                    controls
                    className="h-9 w-56"
                  />
                )}

                <button
                  type="button"
                  onClick={() => handleSynthesizeSceneVoice(scene)}
                  disabled={isBusy}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isBusy ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.common.generating}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>
                        {scene.audioUrl
                          ? t.common.regenerate
                          : t.voiceModule.generateSceneVoice}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleUpdateScene(scene.id, {
                      audioApproved: !scene.audioApproved,
                    })
                  }
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    scene.audioApproved
                      ? 'bg-emerald-950/70 border border-emerald-700/70 text-emerald-300'
                      : 'bg-[#090D16] border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {scene.audioApproved ? t.common.approved : t.common.approve}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
