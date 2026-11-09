import React, { useState } from 'react';
import {
  Users,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { CharacterProfile, DiscoveredModels, StoryProject } from '../types';
import { Translations } from '../i18n';
import { NOOR_AVATAR_URL } from '../defaultData';

interface CharacterStudioViewProps {
  project: StoryProject;
  onUpdateProject: (updated: StoryProject) => void;
  models: DiscoveredModels;
  t: Translations;
  onProceedToVisuals: () => void;
}

export const CharacterStudioView: React.FC<CharacterStudioViewProps> = ({
  project,
  onUpdateProject,
  models,
  t,
  onProceedToVisuals,
}) => {
  const [selectedImageModel, setSelectedImageModel] = useState(
    models.imageModels[0]?.id || 'gemini-3.1-flash-lite-image'
  );
  const [generatingCharId, setGeneratingCharId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateCharacter = (id: string, patch: Partial<CharacterProfile>) => {
    const updatedChars = project.characters.map((c) =>
      c.id === id ? { ...c, ...patch } : c
    );
    onUpdateProject({ ...project, characters: updatedChars });
  };

  const handleAddCharacter = () => {
    const newChar: CharacterProfile = {
      id: `char-${Date.now()}`,
      name: `Character ${project.characters.length + 1}`,
      role: 'companion',
      ageOrType: 'Storybook Companion',
      personality: 'Warm, curious, and helpful',
      visualAppearance:
        'Cute 3D Pixar-style animated character with expressive eyes, wearing a royal purple adventure vest and brass lantern',
      voiceName: 'Zephyr',
      avatarUrl: '',
    };
    onUpdateProject({
      ...project,
      characters: [...project.characters, newChar],
    });
  };

  const handleDeleteCharacter = (id: string) => {
    if (project.characters.length <= 1) return;
    onUpdateProject({
      ...project,
      characters: project.characters.filter((c) => c.id !== id),
    });
  };

  const handleGeneratePortrait = async (char: CharacterProfile) => {
    setGeneratingCharId(char.id);
    setError(null);
    try {
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `3D Pixar/DreamWorks animated character portrait turnaround sheet of ${char.name} (${char.ageOrType}). ${char.visualAppearance}. Personality: ${char.personality}. Midnight blue and purple studio backdrop, soft rim lighting.`,
          aspectRatio: '1:1',
          model: selectedImageModel,
          visualStyle: project.visualStyle,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to render 3D character portrait');
      }
      handleUpdateCharacter(char.id, { avatarUrl: data.imageUrl });
    } catch (err: any) {
      setError(err?.message || 'Character portrait generation failed');
    } finally {
      setGeneratingCharId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Studio Header */}
      <div className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.characterModule.heading}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {t.characterModule.subheading}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedImageModel}
              onChange={(e) => setSelectedImageModel(e.target.value)}
              className="bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
            >
              {models.imageModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleAddCharacter}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.characterModule.addCharacter}</span>
            </button>

            <button
              type="button"
              onClick={onProceedToVisuals}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg whitespace-nowrap cursor-pointer"
            >
              Proceed to 16:9 Scene Studio →
            </button>
          </div>
        </div>

        {/* Character Consistency DNA Lock Banner */}
        <div className="bg-[#090D16] border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-white">
                {t.characterModule.consistencyLock}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {t.characterModule.consistencyDesc}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-purple-300 tabular-nums shrink-0">
            {project.characters.length} Active DNA Profiles
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

      {/* Character Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {project.characters.map((char) => {
          const isRendering = generatingCharId === char.id;
          return (
            <div
              key={char.id}
              className="bg-[#111726] border border-slate-800/80 rounded-xl p-6 flex flex-col sm:flex-row gap-6"
            >
              {/* Left 3D Avatar Preview */}
              <div className="w-full sm:w-48 shrink-0 flex flex-col gap-3">
                <div className="aspect-square w-full rounded-xl overflow-hidden bg-[#090D16] border border-slate-800 relative group">
                  {char.avatarUrl ? (
                    <img
                      src={char.avatarUrl}
                      alt={char.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-purple-950/50 via-[#090D16] to-indigo-950/50">
                      <Users className="w-10 h-10 text-purple-400/70 mb-2" />
                      <span className="text-xs font-semibold text-slate-200">
                        {char.name}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        3D Character Sheet
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleGeneratePortrait(char)}
                  disabled={isRendering}
                  className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer"
                >
                  {isRendering ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{t.common.generating}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{t.characterModule.renderPortrait}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Character Attributes & Consistency DNA */}
              <div className="flex-1 space-y-4 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={char.name}
                    onChange={(e) =>
                      handleUpdateCharacter(char.id, { name: e.target.value })
                    }
                    className="bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-base font-bold text-white focus:outline-none focus:border-purple-500 w-full"
                  />
                  {project.characters.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCharacter(char.id)}
                      className="p-2 text-slate-500 hover:text-red-400 rounded-lg"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t.characterModule.role}
                    </label>
                    <select
                      value={char.role}
                      onChange={(e) =>
                        handleUpdateCharacter(char.id, {
                          role: e.target.value as CharacterProfile['role'],
                        })
                      }
                      className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      <option value="protagonist">Protagonist</option>
                      <option value="companion">Companion</option>
                      <option value="mentor">Mentor</option>
                      <option value="antagonist">Antagonist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      {t.characterModule.voiceAssign}
                    </label>
                    <select
                      value={char.voiceName}
                      onChange={(e) =>
                        handleUpdateCharacter(char.id, {
                          voiceName: e.target.value as CharacterProfile['voiceName'],
                        })
                      }
                      className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
                    >
                      {(['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'] as const).map(
                        (v) => (
                          <option key={v} value={v}>
                            Gemini Voice: {v}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    {t.characterModule.personality}
                  </label>
                  <input
                    type="text"
                    value={char.personality}
                    onChange={(e) =>
                      handleUpdateCharacter(char.id, { personality: e.target.value })
                    }
                    className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-purple-300 mb-1">
                    {t.characterModule.visualDNA}
                  </label>
                  <textarea
                    rows={3}
                    value={char.visualAppearance}
                    onChange={(e) =>
                      handleUpdateCharacter(char.id, {
                        visualAppearance: e.target.value,
                      })
                    }
                    className="w-full bg-[#090D16] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
