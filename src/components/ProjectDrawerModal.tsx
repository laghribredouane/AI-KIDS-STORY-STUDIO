import React from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Clock,
  Globe,
  CheckCircle2,
  Play,
  Sparkles,
} from 'lucide-react';
import { StoryProject } from '../types';
import { Translations } from '../i18n';
import { HERO_BANNER_URL, DEFAULT_SCENE_IMAGE_URL } from '../defaultData';

interface ProjectDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StoryProject[];
  activeProjectId: string;
  onSelectProject: (project: StoryProject) => void;
  onCreateNewProject: () => void;
  onDeleteProject: (id: string) => void;
  t: Translations;
}

export const ProjectDrawerModal: React.FC<ProjectDrawerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateNewProject,
  onDeleteProject,
  t,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111726] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Top Modal Banner */}
        <div className="relative h-40 w-full overflow-hidden border-b border-slate-800">
          <img
            src={HERO_BANNER_URL}
            alt="AI Kids Story Studio"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111726] via-[#111726]/60 to-transparent p-6 flex flex-col justify-end">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Studio Story Projects & Persistent Assets
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Resume unfinished drafts, manage 12-scene scripts, or review completed 1080p productions.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onCreateNewProject();
                    onClose();
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.common.newProject}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const isCurrent = proj.id === activeProjectId;
            const coverImg = proj.scenes[0]?.imageUrl || DEFAULT_SCENE_IMAGE_URL;
            return (
              <div
                key={proj.id}
                onClick={() => {
                  onSelectProject(proj);
                  onClose();
                }}
                className={`p-4 rounded-xl border transition-colors cursor-pointer flex gap-4 ${
                  isCurrent
                    ? 'bg-purple-950/30 border-purple-500/80'
                    : 'bg-[#090D16] border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={coverImg}
                  alt={proj.title}
                  referrerPolicy="no-referrer"
                  className="w-28 h-20 object-cover rounded-lg border border-slate-800 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-white truncate">
                        {proj.title}
                      </h3>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject(proj.id);
                          }}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {proj.synopsis}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono tabular-nums mt-2">
                    <span className="uppercase text-purple-300">{proj.language}</span>
                    <span aria-hidden="true">·</span>
                    <span>Ages {proj.ageGroup}</span>
                    <span aria-hidden="true">·</span>
                    <span>{proj.scenes.length} Scenes</span>
                    <span aria-hidden="true">·</span>
                    <span>{proj.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
