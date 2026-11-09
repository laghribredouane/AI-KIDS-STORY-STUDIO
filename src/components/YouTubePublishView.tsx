import React, { useState, useEffect } from 'react';
import {
  Upload,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  KeyRound,
} from 'lucide-react';
import { StoryProject } from '../types';
import { Translations } from '../i18n';

interface YouTubePublishViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  t: Translations;
  renderedVideoBase64: string | null;
  renderedVideoMimeType: string;
  onGoToReview: () => void;
  onGoToEditor: () => void;
}

export const YouTubePublishView: React.FC<YouTubePublishViewProps> = ({
  project,
  onUpdateProject,
  t,
  renderedVideoBase64,
  renderedVideoMimeType,
  onGoToReview,
  onGoToEditor,
}) => {
  const [oauthConnected, setOauthConnected] = useState(false);
  const [manualAccessToken, setManualAccessToken] = useState('');
  const [confirmPublicPublish, setConfirmPublicPublish] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState(project.youtubeMetadata.tags.join(', '));

  const checkYouTubeStatus = async () => {
    try {
      const res = await fetch('/api/youtube/status');
      const data = await res.json();
      setOauthConnected(Boolean(data.connected));
    } catch {
      // Ignore status check error
    }
  };

  useEffect(() => {
    checkYouTubeStatus();
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        checkYouTubeStatus();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnectOAuthPopup = async () => {
    setUploadError(null);
    try {
      const res = await fetch('/api/youtube/auth-url');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to construct YouTube OAuth URL');
      }
      window.open(data.url, 'youtube_oauth_popup', 'width=600,height=720');
    } catch (err: any) {
      setUploadError(err?.message || 'OAuth initialization failed');
    }
  };

  const handleUploadToYouTube = async () => {
    if (!project.reviewState.explicitPublishApproval) {
      setUploadError('Explicit human review approval is required before uploading.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await fetch('/api/youtube/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.youtubeMetadata.title,
          description: project.youtubeMetadata.description,
          tags: tagsInput
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          categoryId: project.youtubeMetadata.categoryId,
          privacyStatus: project.youtubeMetadata.privacyStatus,
          selfDeclaredMadeForKids: project.youtubeMetadata.selfDeclaredMadeForKids,
          humanApproved: project.reviewState.explicitPublishApproval,
          confirmPublic: confirmPublicPublish,
          videoBase64: renderedVideoBase64,
          videoMimeType: renderedVideoMimeType,
          manualAccessToken: manualAccessToken.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'YouTube Data API v3 upload failed');
      }

      onUpdateProject({
        ...project,
        status: 'published',
        youtubeMetadata: {
          ...project.youtubeMetadata,
          privacyStatus: data.privacyStatus,
          publishedVideoId: data.videoId,
          publishedUrl: data.watchUrl,
          publishedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      setUploadError(err?.message || 'YouTube upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const isHumanApproved = project.reviewState.explicitPublishApproval;

  return (
    <div className="space-y-8">
      {/* Top YouTube Data API v3 Header */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.youtubeModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.youtubeModule.subheading}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleConnectOAuthPopup}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                oauthConnected
                  ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {oauthConnected
                  ? t.youtubeModule.connectedStatus
                  : t.youtubeModule.connectAccount}
              </span>
            </button>
          </div>
        </div>

        {/* Human Review Gate Status Banner */}
        {!isHumanApproved ? (
          <div className="bg-amber-950/40 border border-amber-700/70 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-amber-200">
              <Lock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold">{t.youtubeModule.humanGateLocked}</div>
                <p className="text-amber-300/80 mt-0.5">
                  AI Kids Story Studio strictly prohibits automatic publishing without human sign-off.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onGoToReview}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer"
            >
              Go to Step 6: Human Review →
            </button>
          </div>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-800/70 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold">
                  Human Approval Verified by {project.reviewState.reviewerName}
                </span>
                <span className="text-emerald-300/80 ml-2">
                  · Default upload visibility is locked to PRIVATE.
                </span>
              </div>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="bg-red-950/50 border border-red-800/80 rounded-lg p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 text-xs text-red-200">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              type="button"
              onClick={() => setUploadError(null)}
              className="px-2.5 py-1 bg-red-900/50 text-xs text-white rounded"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Metadata & Audience Declaration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            YouTube Data API v3 Video Resource (`snippet` & `status`)
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Video Title (Max 100 chars)
            </label>
            <input
              type="text"
              maxLength={100}
              value={project.youtubeMetadata.title}
              onChange={(e) =>
                onUpdateProject({
                  ...project,
                  youtubeMetadata: {
                    ...project.youtubeMetadata,
                    title: e.target.value,
                  },
                })
              }
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Video Description
            </label>
            <textarea
              rows={4}
              value={project.youtubeMetadata.description}
              onChange={(e) =>
                onUpdateProject({
                  ...project,
                  youtubeMetadata: {
                    ...project.youtubeMetadata,
                    description: e.target.value,
                  },
                })
              }
              className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Direct OAuth 2.0 Bearer Access Token (Optional Fallback)
              </label>
              <input
                type="password"
                value={manualAccessToken}
                onChange={(e) => setManualAccessToken(e.target.value)}
                placeholder="ya29.a0..."
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Privacy, COPPA Compliance & Upload Trigger */}
        <div className="lg:col-span-4 bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
              Audience & Privacy Safeguards
            </h3>

            {/* COPPA Made For Kids Declaration */}
            <div className="bg-[#090D16] border border-slate-800 rounded-lg p-3.5 space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-white cursor-pointer">
                <span>{t.youtubeModule.coppaCompliance}</span>
                <input
                  type="checkbox"
                  checked={project.youtubeMetadata.selfDeclaredMadeForKids}
                  onChange={(e) =>
                    onUpdateProject({
                      ...project,
                      youtubeMetadata: {
                        ...project.youtubeMetadata,
                        selfDeclaredMadeForKids: e.target.checked,
                      },
                    })
                  }
                  className="accent-purple-500 w-4 h-4"
                />
              </label>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {t.youtubeModule.coppaDesc}
              </p>
            </div>

            {/* Privacy Status Selector (Private by default) */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Visibility Status (Defaults to PRIVATE)
              </label>
              <select
                value={project.youtubeMetadata.privacyStatus}
                onChange={(e) =>
                  onUpdateProject({
                    ...project,
                    youtubeMetadata: {
                      ...project.youtubeMetadata,
                      privacyStatus: e.target.value as 'private' | 'unlisted' | 'public',
                    },
                  })
                }
                className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="private">PRIVATE (Recommended Default)</option>
                <option value="unlisted">UNLISTED</option>
                <option value="public">PUBLIC (Requires Explicit Confirmation)</option>
              </select>
            </div>

            {project.youtubeMetadata.privacyStatus === 'public' && (
              <label className="flex items-start gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800 rounded-lg p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmPublicPublish}
                  onChange={(e) => setConfirmPublicPublish(e.target.checked)}
                  className="accent-amber-500 mt-0.5"
                />
                <span>
                  I explicitly confirm publishing this video as PUBLIC instead of PRIVATE.
                </span>
              </label>
            )}

            {/* Master Video Readiness Check */}
            <div className="bg-[#090D16] border border-slate-800 rounded-lg p-3 flex items-center justify-between text-xs">
              <span className="text-slate-400">Rendered 1080p Master:</span>
              {renderedVideoBase64 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onGoToEditor}
                  className="text-purple-400 hover:underline font-medium cursor-pointer"
                >
                  Render in Step 5 first →
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleUploadToYouTube}
              disabled={!isHumanApproved || isUploading}
              className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Uploading to YouTube Data API v3...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{t.youtubeModule.uploadPrivateBtn}</span>
                </>
              )}
            </button>

            {project.youtubeMetadata.publishedUrl && (
              <a
                href={project.youtubeMetadata.publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 bg-emerald-950/70 border border-emerald-700/70 text-emerald-200 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5"
              >
                <span>Open Uploaded Video on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
