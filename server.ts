import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_DEMO_PROJECT } from './src/defaultData.ts';
import type { StoryProject } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Persistent server-side project storage
const DATA_DIR = path.resolve(process.cwd(), '.data');
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadProjects(): StoryProject[] {
  try {
    if (!fs.existsSync(PROJECTS_FILE)) {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify([INITIAL_DEMO_PROJECT], null, 2), 'utf-8');
      return [INITIAL_DEMO_PROJECT];
    }
    const raw = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [INITIAL_DEMO_PROJECT];
  } catch (err) {
    console.error('Error loading projects:', err);
    return [INITIAL_DEMO_PROJECT];
  }
}

function saveProjects(projects: StoryProject[]): void {
  try {
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving projects:', err);
  }
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured. Please select your API key in the AI Studio Settings > Secrets panel.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: any): { status: number; message: string; code: string } {
  const rawMsg = err?.message || String(err);
  if (rawMsg.includes('GEMINI_API_KEY is not configured')) {
    return {
      status: 401,
      code: 'API_KEY_MISSING',
      message: 'GEMINI_API_KEY is not configured. Please select or add your Gemini API key in the Settings > Secrets panel in AI Studio.',
    };
  }
  if (rawMsg.includes('403') || rawMsg.includes('PERMISSION_DENIED') || rawMsg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      code: 'PERMISSION_DENIED',
      message: 'API key permission denied or invalid. Please check or re-select your GEMINI_API_KEY in the Settings > Secrets panel.',
    };
  }
  if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota')) {
    return {
      status: 429,
      code: 'RESOURCE_EXHAUSTED',
      message: 'API quota reached or model requires a billing-enabled API key in Settings > Secrets. Please retry or switch models.',
    };
  }
  if (rawMsg.includes('404') || rawMsg.includes('NOT_FOUND')) {
    return {
      status: 404,
      code: 'MODEL_NOT_FOUND',
      message: 'The requested model ID was not found or is not available in your region. Please select an alternative model from the selector.',
    };
  }
  return {
    status: 500,
    code: 'GENERATION_ERROR',
    message: rawMsg,
  };
}

// ============================================================================
// 1. DYNAMIC MODEL DETECTION ENDPOINT
// ============================================================================
app.get('/api/models', async (_req, res) => {
  const catalog = {
    textModels: [
      { id: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash (Fast Story & Script Engine)', available: true },
      { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite (High-Throughput)', available: true },
      { id: 'gemini-4-argon', label: 'Gemini 4 Argon (Deep Narrative Reasoning)', available: true },
    ],
    imageModels: [
      { id: 'gemini-3.1-flash-lite-image', label: 'Gemini 3.1 Flash Lite Image (16:9 Scene Illustrator)', available: true, requiresPaidKey: true },
      { id: 'gemini-nano-banana-2.1', label: 'Gemini Nano Banana 2.1 (High-Res 3D Storybook)', available: true, requiresPaidKey: true },
      { id: 'gemini-3-pro-image', label: 'Gemini 3 Pro Image (Studio Master)', available: true, requiresPaidKey: true },
    ],
    videoModels: [
      { id: 'gemini-omni-1.2-flash', label: 'Gemini Omni 1.2 Flash / Veo (16:9 Scene Animator)', available: true, requiresPaidKey: true },
    ],
    ttsModels: [
      { id: 'gemini-3.8-flash-lite-tts', label: 'Gemini 3.8 Flash Lite TTS (Multilingual Narrator)', available: true },
      { id: 'gemini-3.8-flash-tts', label: 'Gemini 3.8 Flash TTS (Expressive Multi-Speaker)', available: true },
    ],
    musicModels: [
      { id: 'lyria-3-clip-preview', label: 'Lyria 3 Clip Preview (30s Orchestral Score)', available: true, requiresPaidKey: true },
    ],
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  };

  try {
    const ai = getGenAIClient();
    const pager = await ai.models.list();
    const discoveredIds = new Set<string>();
    for await (const m of pager) {
      if (m.name) {
        const cleanName = m.name.replace(/^models\//, '');
        discoveredIds.add(cleanName);
      }
    }
    if (discoveredIds.size > 0) {
      catalog.textModels = catalog.textModels.map((m) => ({
        ...m,
        available: discoveredIds.has(m.id) || m.available,
      }));
    }
  } catch {
    // Keep verified fallback catalog if list call is restricted
  }

  res.json(catalog);
});

// ============================================================================
// 2. PERSISTENT PROJECT MANAGEMENT ENDPOINTS
// ============================================================================
app.get('/api/projects', (_req, res) => {
  const projects = loadProjects();
  res.json({ projects });
});

app.post('/api/projects', (req, res) => {
  const incoming: StoryProject = req.body.project;
  if (!incoming || !incoming.id) {
    res.status(400).json({ error: 'Invalid project payload' });
    return;
  }
  const projects = loadProjects();
  const idx = projects.findIndex((p) => p.id === incoming.id);
  const updatedProject: StoryProject = {
    ...incoming,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) {
    projects[idx] = updatedProject;
  } else {
    projects.unshift(updatedProject);
  }
  saveProjects(projects);
  res.json({ project: updatedProject, projects });
});

app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  let projects = loadProjects();
  projects = projects.filter((p) => p.id !== id);
  if (projects.length === 0) {
    projects = [INITIAL_DEMO_PROJECT];
  }
  saveProjects(projects);
  res.json({ projects });
});

// ============================================================================
// 3. STORY GENERATOR MODULE (10-14 SCENES, 5-8 MINUTES, AR / EN / FR)
// ============================================================================
app.post('/api/story/generate', async (req, res) => {
  try {
    const {
      prompt,
      language = 'en',
      ageGroup = '6-8',
      targetDurationMinutes = 6,
      sceneCount = 12,
      theme = 'Kindness & Discovery',
      visualStyle = '3D animated Pixar/DreamWorks storybook aesthetic, rich midnight blue and purple lighting',
      model = 'gemini-3.8-flash',
    } = req.body;

    const clampedScenes = Math.max(10, Math.min(14, Number(sceneCount) || 12));
    const clampedMinutes = Math.max(5, Math.min(8, Number(targetDurationMinutes) || 6));
    const secondsPerScene = Math.round((clampedMinutes * 60) / clampedScenes);

    const langName = language === 'ar' ? 'Arabic (العربية الفصحى المبسطة للأطفال)' : language === 'fr' ? 'French (Français)' : 'English';

    const ai = getGenAIClient();

    const systemInstruction = `You are an award-winning children's animated film director and pedagogical writer for ages ${ageGroup}.
Write an original, safe, heartwarming children's story in ${langName}.
Requirements:
- Total target duration: ${clampedMinutes} minutes (${clampedMinutes * 60} seconds total).
- Split the story into EXACTLY ${clampedScenes} cinematic scenes (each scene ~${secondsPerScene} seconds).
- Age group appropriateness: ${ageGroup} years old (vocabulary, pacing, gentle emotional arc, clear moral value).
- Visual direction: 3D animated storybook style.
- Write all titles, synopsis, moral, scene titles, narration, and character dialogue in ${langName}.
- Write 'visualPrompt' and 'visualAppearance' in detailed English so 3D image/video generators maintain consistent character appearance across every scene.`;

    const response = await ai.models.generateContent({
      model,
      contents: `Create a complete ${clampedScenes}-scene children's animated story based on this concept: "${prompt || 'A young explorer and a magical companion help their village rediscover the music of the stars'}".
Theme: ${theme}.
Visual Style: ${visualStyle}.`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Story title in target language' },
            synopsis: { type: Type.STRING, description: '2-3 sentence story synopsis in target language' },
            moral: { type: Type.STRING, description: 'Clear moral lesson in target language' },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING, description: 'protagonist, companion, mentor' },
                  ageOrType: { type: Type.STRING },
                  personality: { type: Type.STRING },
                  visualAppearance: {
                    type: Type.STRING,
                    description: 'Detailed 3D cartoon character visual appearance (hair, eyes, exact outfit colors, accessories) for cross-scene consistency',
                  },
                },
                required: ['name', 'role', 'ageOrType', 'personality', 'visualAppearance'],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  setting: { type: Type.STRING },
                  narration: {
                    type: Type.STRING,
                    description: 'Rich, expressive storyteller narration paragraph (45-70 words) in target language',
                  },
                  dialogue: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        characterName: { type: Type.STRING },
                        text: { type: Type.STRING },
                      },
                      required: ['characterName', 'text'],
                    },
                  },
                  visualPrompt: {
                    type: Type.STRING,
                    description: '16:9 3D animated scene description including environment, lighting, and character action',
                  },
                  cameraDirection: { type: Type.STRING },
                },
                required: ['sceneNumber', 'title', 'setting', 'narration', 'dialogue', 'visualPrompt', 'cameraDirection'],
              },
            },
          },
          required: ['title', 'synopsis', 'moral', 'characters', 'scenes'],
        },
      },
    });

    const jsonText = (response.text ?? '{}').trim();
    const parsed = JSON.parse(jsonText);

    const voices: Array<'Kore' | 'Puck' | 'Zephyr' | 'Fenrir' | 'Charon'> = ['Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'];

    const formattedCharacters = (parsed.characters || []).map((c: any, index: number) => ({
      id: `char-${Date.now()}-${index}`,
      name: c.name || `Character ${index + 1}`,
      role: ['protagonist', 'companion', 'mentor', 'antagonist'].includes(c.role) ? c.role : index === 0 ? 'protagonist' : 'companion',
      ageOrType: c.ageOrType || 'Storybook Character',
      personality: c.personality || 'Curious and kind',
      visualAppearance: c.visualAppearance || 'Cute 3D Pixar-style animated character with expressive eyes and colorful storybook attire',
      voiceName: voices[index % voices.length],
      avatarUrl: '',
    }));

    const formattedScenes = (parsed.scenes || []).map((s: any, index: number) => ({
      id: `scene-${Date.now()}-${index + 1}`,
      sceneNumber: index + 1,
      title: s.title || `Scene ${index + 1}`,
      durationSeconds: secondsPerScene,
      setting: s.setting || 'Enchanted Storybook World',
      narration: s.narration || '',
      dialogue: Array.isArray(s.dialogue) ? s.dialogue : [],
      visualPrompt: s.visualPrompt || '',
      cameraDirection: s.cameraDirection || 'Gentle cinematic pan across the 3D scene',
      transition: index === 0 ? 'fade' : 'dissolve',
      storyApproved: false,
      imageApproved: false,
      audioApproved: false,
    }));

    res.json({
      title: parsed.title,
      synopsis: parsed.synopsis,
      moral: parsed.moral,
      characters: formattedCharacters,
      scenes: formattedScenes,
    });
  } catch (err: any) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

// ============================================================================
// 4. CHARACTER & 16:9 SCENE IMAGE GENERATOR (WITH CHARACTER CONSISTENCY DNA)
// ============================================================================
app.post('/api/image/generate', async (req, res) => {
  try {
    const {
      prompt,
      characterDescriptions = [],
      visualStyle = '3D animated Pixar/DreamWorks storybook render, rich midnight blue and purple cinema lighting, warm golden rim light',
      aspectRatio = '16:9',
      model = 'gemini-3.1-flash-lite-image',
    } = req.body;

    const consistencyBlock =
      Array.isArray(characterDescriptions) && characterDescriptions.length > 0
        ? `\nMANDATORY 3D CHARACTER CONSISTENCY DNA (keep exact outfits, colors, and features identical across scenes):\n${characterDescriptions.join('\n')}`
        : '';

    const fullPrompt = `${visualStyle}. ${prompt}.${consistencyBlock} High-resolution 3D animated children's movie frame, clean composition, no text watermarks.`;

    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: fullPrompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio === '1:1' ? '1:1' : '16:9',
        },
      },
    });

    let imageUrl = '';
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? 'image/png';
        imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error('Model completed without returning an image payload.');
    }

    res.json({ imageUrl, modelUsed: model });
  } catch (err: any) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

// ============================================================================
// 5. VIDEO GENERATOR (VEO / GEMINI OMNI 1.2 FLASH VIA INTERACTIONS API)
// ============================================================================
app.post('/api/video/generate', async (req, res) => {
  try {
    const {
      prompt,
      imageDataUrl,
      characterDescriptions = [],
      model = 'gemini-omni-1.2-flash',
      duration = '5s',
    } = req.body;

    const ai = getGenAIClient();
    const consistencyNote =
      Array.isArray(characterDescriptions) && characterDescriptions.length > 0
        ? ` Characters: ${characterDescriptions.join(' | ')}`
        : '';

    const inputParts: any[] = [];
    if (imageDataUrl && typeof imageDataUrl === 'string' && imageDataUrl.startsWith('data:image/')) {
      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        inputParts.push({
          type: 'image',
          mime_type: match[1],
          data: match[2],
        });
      }
    }

    inputParts.push({
      type: 'text',
      text: `3D animated children's storybook cinematic motion: ${prompt}.${consistencyNote} Smooth camera movement, expressive character animation.`,
    });

    const interaction = await (ai as any).interactions.create(
      {
        model,
        input: inputParts.length === 1 ? inputParts[0].text : inputParts,
        background: false,
        store: false,
        stream: false,
        response_format: {
          type: 'video',
          aspect_ratio: '16:9',
          duration,
          resolution: '720p',
        },
      },
      { timeout: 300000 }
    );

    const videoPart = interaction?.output_video;
    if (videoPart?.data) {
      const mime = videoPart.mime_type || 'video/mp4';
      res.json({
        videoUrl: `data:${mime};base64,${videoPart.data}`,
        modelUsed: model,
      });
      return;
    }

    if (videoPart?.uri) {
      res.json({
        videoUrl: videoPart.uri,
        modelUsed: model,
      });
      return;
    }

    throw new Error('Video generation completed without returning video bytes.');
  } catch (err: any) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

// ============================================================================
// 6. VOICE STUDIO (GEMINI TTS IN ARABIC, ENGLISH & FRENCH)
// ============================================================================
app.post('/api/voice/generate', async (req, res) => {
  try {
    const {
      text,
      dialogue = [],
      language = 'en',
      voiceName = 'Kore',
      model = 'gemini-3.8-flash-lite-tts',
    } = req.body;

    if (!text && (!dialogue || dialogue.length === 0)) {
      res.status(400).json({ error: 'Narration text is required for TTS synthesis.' });
      return;
    }

    const ai = getGenAIClient();
    const dialogueLines = Array.isArray(dialogue)
      ? dialogue.map((d: any) => `${d.characterName}: "${d.text}"`).join(' ')
      : '';
    const combinedScript = [text, dialogueLines].filter(Boolean).join(' ');

    const stylePrompt =
      language === 'ar'
        ? 'Warm, clear, expressive Arabic children’s audiobook storyteller'
        : language === 'fr'
        ? 'Warm, expressive French children’s fairy-tale narrator'
        : 'Warm, expressive, engaging children’s storybook narrator';

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: combinedScript,
              speechMetadata: {
                style: stylePrompt,
              },
            } as any,
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName,
            },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('TTS model did not return audio data.');
    }

    res.json({
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
      modelUsed: model,
      voiceUsed: voiceName,
    });
  } catch (err: any) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

// ============================================================================
// 7. BACKGROUND MUSIC GENERATION (LYRIA 3 CLIP PREVIEW)
// ============================================================================
app.post('/api/music/generate', async (req, res) => {
  try {
    const { prompt = 'Gentle 30-second whimsical orchestral children’s storybook instrumental score with celesta, harp, and warm strings' } = req.body;
    const ai = getGenAIClient();

    const responseStream = await ai.models.generateContentStream({
      model: 'lyria-3-clip-preview',
      contents: prompt,
    });

    const audioChunks: Buffer[] = [];
    let mimeType = 'audio/mpeg';

    for await (const chunk of responseStream) {
      const parts = chunk.candidates?.[0]?.content?.parts;
      if (!parts) continue;
      for (const part of parts) {
        if (part.inlineData?.data) {
          if (audioChunks.length === 0 && part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
        }
      }
    }

    if (audioChunks.length === 0) {
      throw new Error('Lyria model stream completed without returning audio chunks.');
    }

    const audioBase64 = Buffer.concat(audioChunks).toString('base64');
    res.json({
      audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
      modelUsed: 'lyria-3-clip-preview',
    });
  } catch (err: any) {
    const formatted = formatGeminiError(err);
    res.status(formatted.status).json({ error: formatted.message, code: formatted.code });
  }
});

// ============================================================================
// 8. YOUTUBE DATA API v3 OAUTH 2.0 & PRIVATE UPLOAD INTEGRATION
// ============================================================================
let youtubeTokens: { access_token?: string; refresh_token?: string; expiry_date?: number } | null = null;

function getYouTubeRedirectUri(): string {
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${baseUrl}/auth/youtube/callback`;
}

app.get('/api/youtube/status', (_req, res) => {
  res.json({
    connected: Boolean(youtubeTokens?.access_token),
    clientConfigured: Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET),
    redirectUri: getYouTubeRedirectUri(),
  });
});

app.get('/api/youtube/auth-url', (_req, res) => {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    res.status(400).json({
      error: 'YOUTUBE_CLIENT_ID is not configured in Settings > Secrets. Add your Google Cloud OAuth Client ID and Secret or provide an OAuth Access Token directly.',
      redirectUri: getYouTubeRedirectUri(),
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getYouTubeRedirectUri(),
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.json({
    url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  });
});

const handleYouTubeCallback = async (req: express.Request, res: express.Response) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    res.status(400).send('Missing OAuth code parameter.');
    return;
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID || '',
        client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
        redirect_uri: getYouTubeRedirectUri(),
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || tokenData.error || 'OAuth token exchange failed');
    }

    youtubeTokens = tokenData;

    res.send(`<!doctype html>
<html>
  <body style="background:#090D16;color:#F8FAFC;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
    <div style="text-align:center;padding:24px;border:1px solid #1E293B;border-radius:12px;background:#111726;">
      <h3 style="margin:0 0 8px 0;">YouTube OAuth 2.0 Connected</h3>
      <p style="color:#94A3B8;font-size:14px;">Returning to AI Kids Story Studio...</p>
      <script>
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'youtube' }, '*');
          window.close();
        } else {
          window.location.href = '/';
        }
      </script>
    </div>
  </body>
</html>`);
  } catch (err: any) {
    res.status(500).send(`OAuth Callback Error: ${err?.message || String(err)}`);
  }
};

app.get(['/auth/youtube/callback', '/auth/youtube/callback/'], handleYouTubeCallback);

app.post('/api/youtube/upload', async (req, res) => {
  try {
    const {
      title,
      description,
      tags = [],
      categoryId = '1',
      privacyStatus = 'private',
      selfDeclaredMadeForKids = true,
      humanApproved = false,
      confirmPublic = false,
      videoBase64,
      videoMimeType = 'video/webm',
      manualAccessToken,
    } = req.body;

    // 1. Enforce Mandatory Human Review Gate
    if (!humanApproved) {
      res.status(403).json({
        error: 'Human review approval is strictly required before uploading any video to YouTube.',
      });
      return;
    }

    // 2. Enforce Private-by-Default & Explicit Public Confirmation
    const finalPrivacy = privacyStatus === 'public' && confirmPublic ? 'public' : privacyStatus === 'unlisted' ? 'unlisted' : 'private';

    const accessToken = manualAccessToken || youtubeTokens?.access_token;
    if (!accessToken) {
      res.status(401).json({
        error: 'YouTube OAuth 2.0 token not found. Please connect your YouTube account via OAuth 2.0 first.',
      });
      return;
    }

    if (!videoBase64) {
      res.status(400).json({
        error: 'Rendered video file is required. Please render your 1080p master video in the Video Editor first.',
      });
      return;
    }

    const videoBuffer = Buffer.from(videoBase64, 'base64');

    // Step 1: Initiate YouTube Data API v3 Resumable Upload Session
    const metadataPayload = {
      snippet: {
        title: (title || 'AI Kids Story Studio Animated Production').slice(0, 100),
        description: description || 'Produced with AI Kids Story Studio.',
        tags: Array.isArray(tags) ? tags : [],
        categoryId: String(categoryId || '1'),
      },
      status: {
        privacyStatus: finalPrivacy,
        selfDeclaredMadeForKids: Boolean(selfDeclaredMadeForKids),
      },
    };

    const initResponse = await fetch(
      'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Length': String(videoBuffer.length),
          'X-Upload-Content-Type': videoMimeType,
        },
        body: JSON.stringify(metadataPayload),
      }
    );

    if (!initResponse.ok) {
      const errText = await initResponse.text();
      throw new Error(`YouTube Data API v3 initialization failed (${initResponse.status}): ${errText}`);
    }

    const uploadUrl = initResponse.headers.get('location');
    if (!uploadUrl) {
      throw new Error('YouTube Data API v3 did not return a resumable upload Location header.');
    }

    // Step 2: Upload the binary video stream to YouTube
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': videoMimeType,
        'Content-Length': String(videoBuffer.length),
      },
      body: videoBuffer,
    });

    const uploadResult = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(uploadResult?.error?.message || `YouTube binary upload failed (${uploadResponse.status})`);
    }

    res.json({
      videoId: uploadResult.id,
      url: `https://studio.youtube.com/video/${uploadResult.id}/edit`,
      watchUrl: `https://www.youtube.com/watch?v=${uploadResult.id}`,
      privacyStatus: finalPrivacy,
      selfDeclaredMadeForKids: Boolean(selfDeclaredMadeForKids),
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'YouTube upload failed' });
  }
});

// ============================================================================
// VITE DEV SERVER OR STATIC PRODUCTION SERVING
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Kids Story Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
