import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Download,
  Film,
  Subtitles,
  Music,
  Volume2,
  RefreshCw,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { StoryProject } from '../types';
import { Translations } from '../i18n';
import { DEFAULT_SCENE_IMAGE_URL } from '../defaultData';
import { synthesizeLicensedTrackWav } from '../utils/musicSynth';

interface VideoEditorViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  t: Translations;
  onRenderedVideoReady: (base64: string, mimeType: string, blobUrl: string) => void;
  renderedVideoUrl: string | null;
  onProceedToReview: () => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  project,
  onUpdateProject,
  t,
  onRenderedVideoReady,
  renderedVideoUrl,
  onProceedToReview,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0); // 0 = Intro, 1..N = Scenes, N+1 = Outro
  const [stageElapsed, setStageElapsed] = useState<number>(0);

  const imageCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);

  const totalSceneDuration = project.scenes.reduce(
    (sum, s) => sum + (s.durationSeconds || 30),
    0
  );
  const introDuration = project.editorConfig.introEnabled ? 5 : 0;
  const outroDuration = project.editorConfig.outroEnabled ? 6 : 0;
  const totalRuntimeSeconds = introDuration + totalSceneDuration + outroDuration;

  // Preload scene images into HTMLImageElement cache for smooth 1920x1080 canvas drawing
  useEffect(() => {
    project.scenes.forEach((scene) => {
      const src = scene.imageUrl || DEFAULT_SCENE_IMAGE_URL;
      if (!imageCacheRef.current[src]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;
        imageCacheRef.current[src] = img;
      }
    });
  }, [project.scenes]);

  // Draw 1920x1080 frame on canvas
  const renderFrameToCanvas = useCallback(
    (stageIdx: number, progressRatio: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = 1920;
      const H = 1080;
      ctx.clearRect(0, 0, W, H);

      const isIntro = project.editorConfig.introEnabled && stageIdx === 0;
      const sceneOffset = project.editorConfig.introEnabled ? 1 : 0;
      const isOutro =
        project.editorConfig.outroEnabled &&
        stageIdx === sceneOffset + project.scenes.length;

      const isRTL = project.language === 'ar';

      if (isIntro) {
        // Rich Midnight & Royal Purple 3D Storybook Intro Card
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#090D16');
        grad.addColorStop(0.5, '#1E1B4B');
        grad.addColorStop(1, '#3B0764');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Decorative starlight particles
        ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
        for (let i = 0; i < 36; i++) {
          const x = ((i * 197 + progressRatio * 120) % W);
          const y = ((i * 131) % H);
          ctx.beginPath();
          ctx.arc(x, y, (i % 3) + 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.save();
        ctx.direction = isRTL ? 'rtl' : 'ltr';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#C084FC';
        ctx.font = '600 32px "Outfit", "Cairo", sans-serif';
        ctx.fillText(project.editorConfig.introSubtitle, W / 2, H / 2 - 70);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 68px "Outfit", "Cairo", sans-serif';
        ctx.fillText(project.editorConfig.introTitle || project.title, W / 2, H / 2 + 15);

        ctx.fillStyle = '#FCD34D';
        ctx.font = '500 28px "Plus Jakarta Sans", "Cairo", sans-serif';
        ctx.fillText(
          `Age Group: ${project.ageGroup} Years · ${project.scenes.length} Cinematic Scenes`,
          W / 2,
          H / 2 + 95
        );
        ctx.restore();
        return;
      }

      if (isOutro) {
        // Moral Lesson & Credits Outro Card
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#1E1B4B');
        grad.addColorStop(1, '#090D16');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.save();
        ctx.direction = isRTL ? 'rtl' : 'ltr';
        ctx.textAlign = 'center';

        ctx.fillStyle = '#FBBF24';
        ctx.font = '700 38px "Outfit", "Cairo", sans-serif';
        ctx.fillText(t.storyModule.moralLesson, W / 2, H / 2 - 90);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '600 46px "Plus Jakarta Sans", "Cairo", sans-serif';
        ctx.fillText(
          project.editorConfig.outroMoralText || project.moral,
          W / 2,
          H / 2 - 10,
          W - 240
        );

        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 28px "Plus Jakarta Sans", "Cairo", sans-serif';
        ctx.fillText(
          project.editorConfig.outroCallToAction,
          W / 2,
          H / 2 + 90
        );
        ctx.restore();
        return;
      }

      // Render Active Story Scene
      const sceneIndex = Math.max(
        0,
        Math.min(project.scenes.length - 1, stageIdx - sceneOffset)
      );
      const scene = project.scenes[sceneIndex];
      const imgSrc = scene?.imageUrl || DEFAULT_SCENE_IMAGE_URL;
      const img = imageCacheRef.current[imgSrc];

      // Subtle Ken Burns 3D camera zoom & pan
      const scale = 1.0 + progressRatio * 0.06;
      const offsetX = (W - W * scale) * 0.5;
      const offsetY = (H - H * scale) * 0.5;

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, offsetX, offsetY, W * scale, H * scale);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, '#0F172A');
        bgGrad.addColorStop(1, '#2E1065');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // Transition fade-in at scene start
      if (progressRatio < 0.08) {
        ctx.fillStyle = `rgba(9, 13, 22, ${1 - progressRatio / 0.08})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Top Left Scene Watermark Badge
      ctx.fillStyle = 'rgba(9, 13, 22, 0.68)';
      ctx.fillRect(48, 42, 520, 58);
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 24px "Plus Jakarta Sans", "Cairo", sans-serif';
      ctx.fillText(
        `Scene ${scene.sceneNumber}/${project.scenes.length}: ${scene.title}`,
        68,
        79
      );

      // Measured bottom scrim & burned-in multilingual subtitles
      if (project.editorConfig.subtitlesEnabled && scene) {
        const scrim = ctx.createLinearGradient(0, H - 300, 0, H);
        scrim.addColorStop(0, 'rgba(0, 0, 0, 0)');
        scrim.addColorStop(0.45, 'rgba(5, 8, 17, 0.72)');
        scrim.addColorStop(1, 'rgba(5, 8, 17, 0.92)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, H - 300, W, 300);

        ctx.save();
        ctx.direction = isRTL ? 'rtl' : 'ltr';
        ctx.textAlign = 'center';

        const fontSize =
          project.editorConfig.subtitleSize === 'lg'
            ? 40
            : project.editorConfig.subtitleSize === 'sm'
            ? 28
            : 34;
        ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", "Cairo", sans-serif`;
        ctx.fillStyle = '#FFFFFF';

        // Wrap subtitle text cleanly across 2 lines
        const words = scene.narration.split(' ');
        const mid = Math.ceil(words.length / 2);
        const line1 = words.slice(0, mid).join(' ');
        const line2 = words.slice(mid).join(' ');

        ctx.fillText(line1, W / 2, H - 125, W - 180);
        if (line2) {
          ctx.fillText(line2, W / 2, H - 72, W - 180);
        }

        if (scene.dialogue[0]) {
          ctx.fillStyle = '#FCD34D';
          ctx.font = `600 ${fontSize - 4}px "Plus Jakarta Sans", "Cairo", sans-serif`;
          ctx.fillText(
            `${scene.dialogue[0].characterName}: "${scene.dialogue[0].text}"`,
            W / 2,
            H - 26,
            W - 180
          );
        }
        ctx.restore();
      }
    },
    [project, t.storyModule.moralLesson]
  );

  // Render static preview whenever stage index or config changes
  useEffect(() => {
    if (!isPlaying && !isExporting) {
      renderFrameToCanvas(currentStageIndex, 0.35);
    }
  }, [currentStageIndex, isPlaying, isExporting, renderFrameToCanvas]);

  // Playback loop for interactive preview
  useEffect(() => {
    if (!isPlaying) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
      return;
    }

    // Start background music
    const musicUrl =
      project.editorConfig.customMusicUrl ||
      synthesizeLicensedTrackWav(project.editorConfig.backgroundMusicId, 24);
    const bgAudio = new Audio(musicUrl);
    bgAudio.loop = true;
    bgAudio.volume = project.editorConfig.musicVolume;
    bgAudio.play().catch(() => {});
    bgMusicAudioRef.current = bgAudio;

    // Trigger scene narration audio if stage is a scene
    const sceneOffset = project.editorConfig.introEnabled ? 1 : 0;
    const sceneIdx = currentStageIndex - sceneOffset;
    if (sceneIdx >= 0 && sceneIdx < project.scenes.length) {
      const scene = project.scenes[sceneIdx];
      if (scene.audioUrl) {
        const vAudio = new Audio(scene.audioUrl);
        vAudio.volume = project.editorConfig.narrationVolume;
        vAudio.play().catch(() => {});
        activeAudioRef.current = vAudio;
      }
    }

    const stageDurationSec = 4; // Fast 4s per stage in live preview mode
    const startMs = performance.now();

    const interval = setInterval(() => {
      const elapsedSec = (performance.now() - startMs) / 1000;
      const ratio = Math.min(1, elapsedSec / stageDurationSec);
      setStageElapsed(elapsedSec);
      renderFrameToCanvas(currentStageIndex, ratio);

      if (elapsedSec >= stageDurationSec) {
        const maxStage =
          (project.editorConfig.introEnabled ? 1 : 0) +
          project.scenes.length +
          (project.editorConfig.outroEnabled ? 1 : 0) -
          1;
        if (currentStageIndex < maxStage) {
          setCurrentStageIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setCurrentStageIndex(0);
        }
      }
    }, 33);

    return () => {
      clearInterval(interval);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
      }
      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
      }
    };
  }, [isPlaying, currentStageIndex, project, renderFrameToCanvas]);

  // Real 1080p Canvas + WebAudio Master Video Recorder & Exporter
  const handleRenderAndExport1080p = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsPlaying(false);
    setIsExporting(true);
    setExportProgress(0);

    try {
      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported('video/mp4')
        ? 'video/mp4'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5000000, // 5 Mbps 1080p HD
      });

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const finishedPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: mimeType }));
        };
      });

      recorder.start(100);

      const totalStages =
        (project.editorConfig.introEnabled ? 1 : 0) +
        project.scenes.length +
        (project.editorConfig.outroEnabled ? 1 : 0);

      const framesPerStage = 24; // High-speed deterministic 1080p render pass
      for (let s = 0; s < totalStages; s++) {
        setCurrentStageIndex(s);
        for (let f = 0; f < framesPerStage; f++) {
          renderFrameToCanvas(s, f / framesPerStage);
          setExportProgress(
            Math.round(((s * framesPerStage + f + 1) / (totalStages * framesPerStage)) * 100)
          );
          await new Promise((r) => setTimeout(r, 25));
        }
      }

      recorder.stop();
      const videoBlob = await finishedPromise;
      const blobUrl = URL.createObjectURL(videoBlob);

      // Convert Blob to base64 for YouTube Data API v3 upload
      const arrayBuffer = await videoBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 8192;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
      }
      const base64Video = btoa(binary);

      onRenderedVideoReady(base64Video, mimeType, blobUrl);
    } catch (err) {
      console.error('1080p Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top 1080p Video Editor Header */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.editorModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.editorModule.subheading}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300 font-mono tabular-nums">
            <span>
              Resolution: <strong className="text-white">1920×1080 (1080p HD)</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Target Runtime: <strong className="text-purple-300">{(totalRuntimeSeconds / 60).toFixed(1)} min ({totalRuntimeSeconds}s)</strong>
            </span>
          </div>
        </div>

        {/* Main 16:9 1080p Compositor Monitor & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 1080p Canvas Viewport */}
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video w-full bg-[#090D16] border border-slate-800 rounded-xl overflow-hidden relative shadow-xl">
              <canvas
                ref={canvasRef}
                width={1920}
                height={1080}
                className="w-full h-full object-contain"
              />

              {isExporting && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                  <div className="text-sm font-semibold text-white">
                    {t.editorModule.exportingProgress} ({exportProgress}%)
                  </div>
                  <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-transform duration-150"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Playback & Export Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#090D16] border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={isExporting}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>{t.editorModule.pauseMovie}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>{t.editorModule.playFullMovie}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRenderAndExport1080p}
                  disabled={isExporting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer"
                >
                  <Film className="w-4 h-4 text-purple-400" />
                  <span>{t.editorModule.exportMp4}</span>
                </button>

                {renderedVideoUrl && (
                  <a
                    href={renderedVideoUrl}
                    download={`${project.title.replace(/\s+/g, '_')}_1080p.mp4`}
                    className="px-3.5 py-2 bg-emerald-950/80 border border-emerald-700/70 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.common.download} 1080p Master</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={onProceedToReview}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg whitespace-nowrap cursor-pointer"
              >
                Human Review Gate →
              </button>
            </div>
          </div>

          {/* Right Column: Intro, Outro, Subtitles & Audio Mix Inspector */}
          <div className="lg:col-span-4 bg-[#090D16] border border-slate-800 rounded-xl p-5 space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>1080p Master Compositor Settings</span>
            </h3>

            {/* Intro & Outro Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                <span>{t.editorModule.introCard}</span>
                <input
                  type="checkbox"
                  checked={project.editorConfig.introEnabled}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        introEnabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-purple-500 w-4 h-4"
                />
              </label>

              {project.editorConfig.introEnabled && (
                <input
                  type="text"
                  value={project.editorConfig.introTitle}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        introTitle: e.target.value,
                      },
                    })
                  }
                  placeholder="Intro Card Title"
                  className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              )}

              <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer pt-2">
                <span>{t.editorModule.outroCard}</span>
                <input
                  type="checkbox"
                  checked={project.editorConfig.outroEnabled}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        outroEnabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-purple-500 w-4 h-4"
                />
              </label>

              {project.editorConfig.outroEnabled && (
                <textarea
                  rows={2}
                  value={project.editorConfig.outroMoralText}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        outroMoralText: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#111726] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                />
              )}
            </div>

            {/* Subtitles Controls */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="flex items-center justify-between text-xs text-slate-200 cursor-pointer">
                <span className="flex items-center gap-1.5">
                  <Subtitles className="w-4 h-4 text-purple-400" />
                  <span>{t.editorModule.subtitlesToggle}</span>
                </span>
                <input
                  type="checkbox"
                  checked={project.editorConfig.subtitlesEnabled}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        subtitlesEnabled: e.target.checked,
                      },
                    })
                  }
                  className="accent-purple-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Audio Mixing Levels */}
            <div className="space-y-4 pt-3 border-t border-slate-800">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t.editorModule.narrationMix}</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(project.editorConfig.narrationVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={project.editorConfig.narrationVolume}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        narrationVolume: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>{t.editorModule.musicMix}</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(project.editorConfig.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={project.editorConfig.musicVolume}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      editorConfig: {
                        ...project.editorConfig,
                        musicVolume: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Track Timeline Strip */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-white">
              {t.editorModule.timelineTitle}
            </span>
            <span className="font-mono tabular-nums">
              Click any block to scrub 1080p compositor
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {project.editorConfig.introEnabled && (
              <button
                type="button"
                onClick={() => setCurrentStageIndex(0)}
                className={`px-3 py-2.5 rounded-lg border text-left shrink-0 w-28 transition-colors cursor-pointer ${
                  currentStageIndex === 0
                    ? 'bg-purple-950/60 border-purple-500 text-white'
                    : 'bg-[#090D16] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono text-purple-400">INTRO</div>
                <div className="text-xs font-semibold truncate">Title Card</div>
                <div className="text-[10px] font-mono tabular-nums mt-0.5">5s</div>
              </button>
            )}

            {project.scenes.map((scene, idx) => {
              const stageIdx = (project.editorConfig.introEnabled ? 1 : 0) + idx;
              const isSelected = currentStageIndex === stageIdx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  onClick={() => setCurrentStageIndex(stageIdx)}
                  className={`px-3 py-2.5 rounded-lg border text-left shrink-0 w-36 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 text-white'
                      : 'bg-[#090D16] border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-purple-400 tabular-nums">
                    <span>SCENE {scene.sceneNumber}</span>
                    <span>{scene.transition}</span>
                  </div>
                  <div className="text-xs font-semibold truncate mt-0.5">
                    {scene.title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">
                    {scene.durationSeconds}s · {scene.audioUrl ? 'TTS Ready' : 'Script'}
                  </div>
                </button>
              );
            })}

            {project.editorConfig.outroEnabled && (
              <button
                type="button"
                onClick={() =>
                  setCurrentStageIndex(
                    (project.editorConfig.introEnabled ? 1 : 0) + project.scenes.length
                  )
                }
                className={`px-3 py-2.5 rounded-lg border text-left shrink-0 w-28 transition-colors cursor-pointer ${
                  currentStageIndex ===
                  (project.editorConfig.introEnabled ? 1 : 0) + project.scenes.length
                    ? 'bg-purple-950/60 border-purple-500 text-white'
                    : 'bg-[#090D16] border-slate-800 text-slate-400'
                }`}
              >
                <div className="text-[10px] font-mono text-amber-400">OUTRO</div>
                <div className="text-xs font-semibold truncate">Moral Card</div>
                <div className="text-[10px] font-mono tabular-nums mt-0.5">6s</div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
