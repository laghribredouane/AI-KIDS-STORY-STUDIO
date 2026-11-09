import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Image as ImageIcon,
  Volume2,
  Lock,
  Unlock,
} from 'lucide-react';
import { StoryProject, StoryScene } from '../types';
import { Translations } from '../i18n';
import { DEFAULT_SCENE_IMAGE_URL } from '../defaultData';

interface HumanReviewViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  t: Translations;
  onProceedToYouTube: () => void;
}

export const HumanReviewView: React.FC<HumanReviewViewProps> = ({
  project,
  onUpdateProject,
  t,
  onProceedToYouTube,
}) => {
  const handleUpdateScene = (sceneId: string, patch: Partial<StoryScene>) => {
    const nextScenes = project.scenes.map((s) =>
      s.id === sceneId ? { ...s, ...patch, storyApproved: patch.storyApproved ?? s.storyApproved } : s
    );
    onUpdateProject({ ...project, scenes: nextScenes });
  };

  const handleBulkApprove = (field: 'storyApproved' | 'imageApproved' | 'audioApproved') => {
    const nextScenes = project.scenes.map((s) => ({ ...s, [field]: true }));
    onUpdateProject({
      ...project,
      scenes: nextScenes,
    });
  };

  const storyApprovedCount = project.scenes.filter((s) => s.storyApproved).length;
  const imageApprovedCount = project.scenes.filter((s) => s.imageApproved).length;
  const audioApprovedCount = project.scenes.filter((s) => s.audioApproved).length;

  const allScenesApproved =
    storyApprovedCount === project.scenes.length &&
    imageApprovedCount === project.scenes.length &&
    audioApprovedCount === project.scenes.length;

  const canSignOff =
    allScenesApproved && project.reviewState.reviewerName.trim().length >= 2;

  const handleToggleFinalSignOff = () => {
    if (!canSignOff && !project.reviewState.explicitPublishApproval) return;
    const nextApproved = !project.reviewState.explicitPublishApproval;
    onUpdateProject({
      ...project,
      status: nextApproved ? 'approved' : 'in_review',
      reviewState: {
        ...project.reviewState,
        storyReviewed: true,
        charactersReviewed: true,
        imagesReviewed: true,
        audioReviewed: true,
        videoReviewed: true,
        explicitPublishApproval: nextApproved,
        approvedAt: nextApproved ? new Date().toISOString() : undefined,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Mandatory Human Review Gate Header */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.reviewModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.reviewModule.subheading}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
            <span className={storyApprovedCount === project.scenes.length ? 'text-emerald-400' : 'text-amber-300'}>
              Script: {storyApprovedCount}/{project.scenes.length}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={imageApprovedCount === project.scenes.length ? 'text-emerald-400' : 'text-amber-300'}>
              Visuals: {imageApprovedCount}/{project.scenes.length}
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className={audioApprovedCount === project.scenes.length ? 'text-emerald-400' : 'text-amber-300'}>
              Audio: {audioApprovedCount}/{project.scenes.length}
            </span>
          </div>
        </div>

        {/* Bulk Review Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => handleBulkApprove('storyApproved')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.reviewModule.approveAllStory}</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkApprove('imageApproved')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.reviewModule.approveAllImages}</span>
            </button>

            <button
              type="button"
              onClick={() => handleBulkApprove('audioApproved')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-400" />
              <span>{t.reviewModule.approveAllAudio}</span>
            </button>
          </div>

          <div className="text-xs text-amber-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{t.reviewModule.gateWarning}</span>
          </div>
        </div>
      </div>

      {/* Scene-by-Scene Inspection & Inline Editing Table */}
      <div className="space-y-4">
        {project.scenes.map((scene) => (
          <div
            key={scene.id}
            className="bg-[#111726] border border-slate-800/80 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center"
          >
            {/* Scene Thumbnail Preview */}
            <div className="lg:col-span-3 aspect-video rounded-lg overflow-hidden bg-[#090D16] border border-slate-800 relative">
              <img
                src={scene.imageUrl || DEFAULT_SCENE_IMAGE_URL}
                alt={scene.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/75 rounded text-[11px] font-mono text-white tabular-nums">
                #{String(scene.sceneNumber).padStart(2, '0')}
              </div>
            </div>

            {/* Editable Narration & Moral Check */}
            <div className="lg:col-span-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <input
                  type="text"
                  value={scene.title}
                  onChange={(e) =>
                    handleUpdateScene(scene.id, { title: e.target.value })
                  }
                  className="bg-[#090D16] border border-slate-800 rounded px-2.5 py-1 text-xs font-bold text-white w-full"
                />
              </div>
              <textarea
                rows={2}
                value={scene.narration}
                onChange={(e) =>
                  handleUpdateScene(scene.id, { narration: e.target.value })
                }
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 leading-relaxed"
              />
              {scene.audioUrl && (
                <audio src={scene.audioUrl} controls className="h-8 w-full max-w-xs" />
              )}
            </div>

            {/* 3-Pillar Approval Checkboxes */}
            <div className="lg:col-span-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() =>
                  handleUpdateScene(scene.id, { storyApproved: !scene.storyApproved })
                }
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                  scene.storyApproved
                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300'
                    : 'bg-[#090D16] border-slate-800 text-slate-400'
                }`}
              >
                <span>1. Story & Dialogue</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleUpdateScene(scene.id, { imageApproved: !scene.imageApproved })
                }
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                  scene.imageApproved
                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300'
                    : 'bg-[#090D16] border-slate-800 text-slate-400'
                }`}
              >
                <span>2. 16:9 Scene Visual</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleUpdateScene(scene.id, { audioApproved: !scene.audioApproved })
                }
                className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-between border transition-colors cursor-pointer ${
                  scene.audioApproved
                    ? 'bg-emerald-950/60 border-emerald-700/70 text-emerald-300'
                    : 'bg-[#090D16] border-slate-800 text-slate-400'
                }`}
              >
                <span>3. Voiceover Audio</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Final Human Reviewer Sign-Off Box */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Final Human Sign-Off & Child Safety Attestation
            </h3>
            <p className="text-xs text-slate-400">
              Confirm that story morals, visuals, and audio meet child-safety standards before unlocking YouTube upload.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.reviewModule.reviewerNameLabel} *
            </label>
            <input
              type="text"
              value={project.reviewState.reviewerName}
              onChange={(e) =>
                onUpdateProject({
                  ...project,
                  reviewState: {
                    ...project.reviewState,
                    reviewerName: e.target.value,
                  },
                })
              }
              placeholder="e.g., Sarah Al-Mansoor, Lead Children's Producer"
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              {t.reviewModule.reviewerNotesLabel}
            </label>
            <input
              type="text"
              value={project.reviewState.reviewerNotes}
              onChange={(e) =>
                onUpdateProject({
                  ...project,
                  reviewState: {
                    ...project.reviewState,
                    reviewerNotes: e.target.value,
                  },
                })
              }
              placeholder="Verified age-appropriate vocabulary, 3D character consistency, and audio clarity."
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={handleToggleFinalSignOff}
            disabled={!canSignOff && !project.reviewState.explicitPublishApproval}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
              project.reviewState.explicitPublishApproval
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : canSignOff
                ? 'bg-purple-600 hover:bg-purple-500 text-white'
                : 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
            }`}
          >
            {project.reviewState.explicitPublishApproval ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>{t.reviewModule.signOffConfirmed}</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>{t.reviewModule.finalSignOff}</span>
              </>
            )}
          </button>

          {project.reviewState.explicitPublishApproval && (
            <button
              type="button"
              onClick={onProceedToYouTube}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Proceed to YouTube Publisher →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
