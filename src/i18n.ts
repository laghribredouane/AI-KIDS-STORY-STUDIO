import { LanguageCode } from './types';

export interface Translations {
  studioName: string;
  nav: {
    projects: string;
    story: string;
    characters: string;
    visuals: string;
    voice: string;
    editor: string;
    review: string;
    youtube: string;
  };
  common: {
    saveProject: string;
    saved: string;
    saving: string;
    newProject: string;
    language: string;
    ageGroup: string;
    yearsOld: string;
    duration: string;
    minutes: string;
    seconds: string;
    scenes: string;
    scene: string;
    generate: string;
    regenerate: string;
    generating: string;
    approve: string;
    approved: string;
    pendingReview: string;
    retry: string;
    preview: string;
    download: string;
    edit: string;
    delete: string;
  };
  storyModule: {
    heading: string;
    subheading: string;
    promptLabel: string;
    promptPlaceholder: string;
    themeLabel: string;
    moralLabel: string;
    targetDurationLabel: string;
    sceneCountLabel: string;
    generateBtn: string;
    storyArchitecture: string;
    synopsis: string;
    moralLesson: string;
    narration: string;
    dialogue: string;
    visualPrompt: string;
    cameraDirection: string;
  };
  characterModule: {
    heading: string;
    subheading: string;
    addCharacter: string;
    generateCast: string;
    consistencyLock: string;
    consistencyDesc: string;
    visualDNA: string;
    personality: string;
    renderPortrait: string;
    role: string;
    voiceAssign: string;
  };
  visualsModule: {
    heading: string;
    subheading: string;
    imageStudioTab: string;
    videoStudioTab: string;
    generateAllImages: string;
    generateSceneImage: string;
    generateSceneVideo: string;
    characterDnaInjected: string;
    aspectRatio169: string;
    veoAnimationDesc: string;
  };
  voiceModule: {
    heading: string;
    subheading: string;
    narratorVoice: string;
    generateAllVoice: string;
    generateSceneVoice: string;
    licensedMusicTitle: string;
    licensedMusicDesc: string;
    aiMusicGenerate: string;
  };
  editorModule: {
    heading: string;
    subheading: string;
    playFullMovie: string;
    pauseMovie: string;
    exportMp4: string;
    exportingProgress: string;
    introCard: string;
    outroCard: string;
    subtitlesToggle: string;
    musicMix: string;
    narrationMix: string;
    timelineTitle: string;
  };
  reviewModule: {
    heading: string;
    subheading: string;
    gateWarning: string;
    approveAllStory: string;
    approveAllImages: string;
    approveAllAudio: string;
    reviewerNameLabel: string;
    reviewerNotesLabel: string;
    finalSignOff: string;
    signOffConfirmed: string;
  };
  youtubeModule: {
    heading: string;
    subheading: string;
    connectAccount: string;
    connectedStatus: string;
    uploadPrivateBtn: string;
    coppaCompliance: string;
    coppaDesc: string;
    privacyDefault: string;
    humanGateLocked: string;
    oauthInstructionsTitle: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    studioName: 'AI Kids Story Studio',
    nav: {
      projects: 'Projects',
      story: '1. Story Script',
      characters: '2. Characters',
      visuals: '3. Image & Video',
      voice: '4. Voice & Music',
      editor: '5. Video Editor',
      review: '6. Human Review',
      youtube: '7. YouTube Publish',
    },
    common: {
      saveProject: 'Save Project',
      saved: 'Saved',
      saving: 'Saving...',
      newProject: 'New Story Project',
      language: 'Story Language',
      ageGroup: 'Target Age',
      yearsOld: 'Years',
      duration: 'Target Duration',
      minutes: 'min',
      seconds: 'sec',
      scenes: 'Scenes',
      scene: 'Scene',
      generate: 'Generate',
      regenerate: 'Regenerate',
      generating: 'Generating...',
      approve: 'Approve',
      approved: 'Approved',
      pendingReview: 'Needs Review',
      retry: 'Retry',
      preview: 'Preview',
      download: 'Download',
      edit: 'Edit',
      delete: 'Delete',
    },
    storyModule: {
      heading: 'Multilingual Story Generator',
      subheading: 'Author 5 to 8 minute cinematic children’s stories segmented into 10–14 structured scenes with narration, character dialogue, and moral lessons.',
      promptLabel: 'Story Concept or Adventure Premise',
      promptPlaceholder: 'e.g., A curious young astronomer named Noor and her clockwork fox discover where fallen stars go to sleep...',
      themeLabel: 'Core Theme',
      moralLabel: 'Moral Value',
      targetDurationLabel: 'Target Runtime (5–8 Min)',
      sceneCountLabel: 'Cinematic Scenes (10–14)',
      generateBtn: 'Generate Full 12-Scene Story Script',
      storyArchitecture: 'Story Breakdown & Scene Script',
      synopsis: 'Story Synopsis',
      moralLesson: 'Core Moral Lesson',
      narration: 'Narrator Voiceover',
      dialogue: 'Character Dialogue',
      visualPrompt: '3D Scene Visual Direction',
      cameraDirection: 'Camera & Motion',
    },
    characterModule: {
      heading: '3D Character Studio',
      subheading: 'Design consistent 3D animated storybook characters. Character visual DNA is automatically locked across every generated scene.',
      addCharacter: 'Add New Character',
      generateCast: 'Auto-Extract Cast from Script',
      consistencyLock: 'Character Consistency DNA Lock Active',
      consistencyDesc: 'Exact clothing, colors, proportions, and facial features are appended to every scene image and video prompt.',
      visualDNA: '3D Visual Appearance Anchor (Consistency Prompt)',
      personality: 'Personality & Role',
      renderPortrait: 'Render 3D Portrait',
      role: 'Role',
      voiceAssign: 'Assigned Voice',
    },
    visualsModule: {
      heading: '16:9 Scene Image & Veo Video Studio',
      subheading: 'Generate 16:9 widescreen 3D storybook illustrations and animate scenes using Google Gemini Image and Veo / Omni Flash video models.',
      imageStudioTab: '16:9 Scene Illustrations',
      videoStudioTab: 'Veo Animated Video Clips',
      generateAllImages: 'Batch Generate Missing Scene Images',
      generateSceneImage: 'Generate 16:9 Image',
      generateSceneVideo: 'Animate Scene Clip (Veo)',
      characterDnaInjected: 'Includes Character Consistency DNA',
      aspectRatio169: '16:9 Widescreen HD',
      veoAnimationDesc: 'Animates the 16:9 scene illustration with camera movement and character motion.',
    },
    voiceModule: {
      heading: 'Multilingual Voice & Licensed Music Studio',
      subheading: 'Synthesize expressive narration in Arabic, English, or French using Google Gemini TTS models and pair with licensed background music.',
      narratorVoice: 'Primary Storyteller Voice',
      generateAllVoice: 'Generate All Scene Narrations',
      generateSceneVoice: 'Synthesize Scene Voiceover',
      licensedMusicTitle: 'Licensed Storybook Background Score',
      licensedMusicDesc: 'Royalty-free procedural orchestral music and Gemini Lyria score generation.',
      aiMusicGenerate: 'Generate Custom Score (Lyria)',
    },
    editorModule: {
      heading: '1080p Non-Linear Video Editor & Compositor',
      subheading: 'Combine 16:9 scenes, multilingual narration, licensed background score, animated transitions, intro/outro cards, and subtitles into a 1080p master.',
      playFullMovie: 'Play Full Story Preview',
      pauseMovie: 'Pause Preview',
      exportMp4: 'Render & Export 1080p Video',
      exportingProgress: 'Rendering 1080p Frames & Mixing Audio...',
      introCard: 'Cinematic Title Intro Card (5s)',
      outroCard: 'Moral Lesson & Credits Outro Card (6s)',
      subtitlesToggle: 'Burn-in Multilingual Subtitles (RTL/LTR)',
      musicMix: 'Background Music Volume',
      narrationMix: 'Voiceover Narration Volume',
      timelineTitle: 'Multi-Track Production Timeline (5–8 Min Target)',
    },
    reviewModule: {
      heading: 'Mandatory Human Quality & Safety Review',
      subheading: 'Children’s content is never published automatically. Inspect and approve every scene script, illustration, and voiceover before unlocking export and YouTube upload.',
      gateWarning: 'Explicit human approval is required across all scenes before YouTube publishing is unlocked.',
      approveAllStory: 'Approve All Scene Scripts',
      approveAllImages: 'Approve All Scene Visuals',
      approveAllAudio: 'Approve All Voiceovers',
      reviewerNameLabel: 'Human Reviewer Full Name',
      reviewerNotesLabel: 'Safety, Pedagogical & Quality Sign-off Notes',
      finalSignOff: 'Confirm Explicit Human Approval for Publishing',
      signOffConfirmed: 'Human Approval Verified & Locked',
    },
    youtubeModule: {
      heading: 'YouTube Data API v3 Safe Publisher',
      subheading: 'Authenticate via OAuth 2.0 and upload rendered story videos as PRIVATE by default with COPPA Made-for-Kids audience compliance.',
      connectAccount: 'Connect YouTube Channel (OAuth 2.0)',
      connectedStatus: 'YouTube OAuth 2.0 Connected',
      uploadPrivateBtn: 'Upload Video as PRIVATE to YouTube',
      coppaCompliance: 'COPPA Audience Declaration: Made for Kids (Required)',
      coppaDesc: 'Strictly sets status.selfDeclaredMadeForKids = true and status.privacyStatus = "private" per YouTube Data API v3 policy.',
      privacyDefault: 'Default Upload Visibility: PRIVATE (Locked for Safety)',
      humanGateLocked: 'Publishing Locked — Complete Mandatory Human Review in Step 6 First',
      oauthInstructionsTitle: 'YouTube Data API v3 OAuth 2.0 Setup',
    },
  },
  fr: {
    studioName: 'AI Kids Story Studio',
    nav: {
      projects: 'Projets',
      story: '1. Scénario',
      characters: '2. Personnages',
      visuals: '3. Images & Vidéo',
      voice: '4. Voix & Musique',
      editor: '5. Montage 1080p',
      review: '6. Révision Humaine',
      youtube: '7. YouTube',
    },
    common: {
      saveProject: 'Enregistrer',
      saved: 'Enregistré',
      saving: 'Enregistrement...',
      newProject: 'Nouvelle Histoire',
      language: 'Langue du Conte',
      ageGroup: 'Tranche d’âge',
      yearsOld: 'ans',
      duration: 'Durée Cible',
      minutes: 'min',
      seconds: 's',
      scenes: 'Scènes',
      scene: 'Scène',
      generate: 'Générer',
      regenerate: 'Régénérer',
      generating: 'Génération...',
      approve: 'Approuver',
      approved: 'Approuvé',
      pendingReview: 'À vérifier',
      retry: 'Réessayer',
      preview: 'Aperçu',
      download: 'Télécharger',
      edit: 'Modifier',
      delete: 'Supprimer',
    },
    storyModule: {
      heading: 'Générateur d’Histoires Multilingue',
      subheading: 'Créez des contes animés de 5 à 8 minutes découpés en 10 à 14 scènes cinématiques avec narration, dialogues et morale.',
      promptLabel: 'Idée ou Concept de l’Histoire',
      promptPlaceholder: 'ex: Une jeune astronome curieuse nommée Noor et son renard mécanique découvrent où dorment les étoiles filantes...',
      themeLabel: 'Thème Principal',
      moralLabel: 'Valeur Morale',
      targetDurationLabel: 'Durée Cible (5–8 Min)',
      sceneCountLabel: 'Scènes Cinématiques (10–14)',
      generateBtn: 'Générer le Scénario Complet (12 Scènes)',
      storyArchitecture: 'Structure du Conte & Découpage par Scène',
      synopsis: 'Synopsis de l’Histoire',
      moralLesson: 'Morale de l’Histoire',
      narration: 'Voix-off du Narrateur',
      dialogue: 'Dialogues des Personnages',
      visualPrompt: 'Direction Artistique 3D de la Scène',
      cameraDirection: 'Caméra & Mouvement',
    },
    characterModule: {
      heading: 'Studio de Personnages 3D',
      subheading: 'Créez des personnages de dessin animé 3D cohérents. L’ADN visuel est automatiquement injecté dans chaque scène.',
      addCharacter: 'Ajouter un Personnage',
      generateCast: 'Extraire les Personnages du Script',
      consistencyLock: 'Verrou de Cohérence Visuelle 3D Actif',
      consistencyDesc: 'Les tenues, couleurs et traits du visage sont préservés dans toutes les illustrations et vidéos.',
      visualDNA: 'Description Visuelle 3D (Ancre de Cohérence)',
      personality: 'Personnalité & Rôle',
      renderPortrait: 'Générer Portrait 3D',
      role: 'Rôle',
      voiceAssign: 'Voix Attribuée',
    },
    visualsModule: {
      heading: 'Studio d’Images 16:9 & Animation Veo',
      subheading: 'Générez une illustration 16:9 par scène et animez les plans avec les modèles Google Gemini Image et Veo / Omni Flash.',
      imageStudioTab: 'Illustrations 16:9 par Scène',
      videoStudioTab: 'Clips Animés Veo',
      generateAllImages: 'Générer Toutes les Images Manquantes',
      generateSceneImage: 'Générer Image 16:9',
      generateSceneVideo: 'Animer la Scène (Veo)',
      characterDnaInjected: 'ADN des Personnages Inclus',
      aspectRatio169: 'Format 16:9 Cinéma HD',
      veoAnimationDesc: 'Anime l’illustration 16:9 avec mouvement de caméra et animation des personnages.',
    },
    voiceModule: {
      heading: 'Studio Voix Multilingue & Musique Sous Licence',
      subheading: 'Générez la narration en arabe, anglais ou français via Google Gemini TTS avec musique d’ambiance sous licence.',
      narratorVoice: 'Voix du Conteur Principal',
      generateAllVoice: 'Générer Toutes les Voix-off',
      generateSceneVoice: 'Synthétiser la Voix-off',
      licensedMusicTitle: 'Musique de Fond Sous Licence',
      licensedMusicDesc: 'Musique orchestrale libre de droits et composition via Gemini Lyria.',
      aiMusicGenerate: 'Composer via Gemini Lyria',
    },
    editorModule: {
      heading: 'Éditeur Vidéo 1080p & Assemblage Final',
      subheading: 'Assemblez les scènes, la narration, la musique, les transitions, les sous-titres et l’intro/outro en 1080p.',
      playFullMovie: 'Lire le Film Complet',
      pauseMovie: 'Pause',
      exportMp4: 'Exporter le Master Vidéo 1080p',
      exportingProgress: 'Rendu 1080p et Mixage Audio en cours...',
      introCard: 'Écran Titre d’Introduction (5s)',
      outroCard: 'Écran de Fin & Morale (6s)',
      subtitlesToggle: 'Sous-titres Multilingues Intégrés',
      musicMix: 'Volume de la Musique',
      narrationMix: 'Volume de la Narration',
      timelineTitle: 'Timeline de Production Multi-Pistes (5–8 Min)',
    },
    reviewModule: {
      heading: 'Validation Humaine Obligatoire',
      subheading: 'Aucune publication automatique. Vérifiez et approuvez le texte, les images et l’audio avant l’export et YouTube.',
      gateWarning: 'L’approbation humaine explicite de chaque scène est requise avant la publication YouTube.',
      approveAllStory: 'Approuver Tous les Textes',
      approveAllImages: 'Approuver Toutes les Images',
      approveAllAudio: 'Approuver Tous les Audios',
      reviewerNameLabel: 'Nom du Responsable de Validation',
      reviewerNotesLabel: 'Notes de Validation Pédagogique & Sécurité',
      finalSignOff: 'Confirmer l’Approbation Humaine Explicite',
      signOffConfirmed: 'Approbation Humaine Confirmée',
    },
    youtubeModule: {
      heading: 'Publication Sécurisée YouTube Data API v3',
      subheading: 'Authentification OAuth 2.0 et mise en ligne en mode PRIVÉ par défaut avec conformité COPPA Enfants.',
      connectAccount: 'Connecter YouTube (OAuth 2.0)',
      connectedStatus: 'YouTube OAuth 2.0 Connecté',
      uploadPrivateBtn: 'Envoyer sur YouTube en mode PRIVÉ',
      coppaCompliance: 'Déclaration Audience COPPA : Conçu pour les enfants',
      coppaDesc: 'Configure automatiquement selfDeclaredMadeForKids = true et privacyStatus = "private".',
      privacyDefault: 'Visibilité par défaut : PRIVÉ (Sécurité Enfant)',
      humanGateLocked: 'Publication Verrouillée — Terminez la Révision Humaine à l’Étape 6',
      oauthInstructionsTitle: 'Configuration OAuth 2.0 YouTube Data API v3',
    },
  },
  ar: {
    studioName: 'استوديو قصص الأطفال بالذكاء الاصطناعي',
    nav: {
      projects: 'المشاريع',
      story: '1. مؤلف القصص',
      characters: '2. استوديو الشخصيات',
      visuals: '3. الصور والفيديو',
      voice: '4. الصوت والموسيقى',
      editor: '5. محرر الفيديو',
      review: '6. المراجعة البشرية',
      youtube: '7. النشر على يوتيوب',
    },
    common: {
      saveProject: 'حفظ المشروع',
      saved: 'تم الحفظ',
      saving: 'جاري الحفظ...',
      newProject: 'مشروع قصة جديد',
      language: 'لغة القصة',
      ageGroup: 'الفئة العمرية',
      yearsOld: 'سنوات',
      duration: 'المدة المستهدفة',
      minutes: 'دقائق',
      seconds: 'ثانية',
      scenes: 'المشاهد',
      scene: 'المشهد',
      generate: 'توليد',
      regenerate: 'إعادة التوليد',
      generating: 'جاري التوليد...',
      approve: 'اعتماد',
      approved: 'معتمد',
      pendingReview: 'بانتظار المراجعة',
      retry: 'إعادة المحاولة',
      preview: 'معاينة',
      download: 'تحميل',
      edit: 'تعديل',
      delete: 'حذف',
    },
    storyModule: {
      heading: 'مؤلف القصص السينمائية متعدد اللغات',
      subheading: 'تأليف قصص أطفال أصلية بمدة 5 إلى 8 دقائق مقسمة إلى 10-14 مشهداً سينمائياً مع السرد والحوار والعبرة الأخلاقية.',
      promptLabel: 'فكرة القصة أو المغامرة',
      promptPlaceholder: 'مثال: طفلة فضولية اسمها نور وثعلبها الآلي يكتشفان أين تنام النجوم الساقطة في مرصد السماء...',
      themeLabel: 'الموضوع الرئيسي',
      moralLabel: 'العبرة الأخلاقية',
      targetDurationLabel: 'المدة المستهدفة (5 - 8 دقائق)',
      sceneCountLabel: 'عدد المشاهد السينمائية (10 - 14)',
      generateBtn: 'توليد سيناريو القصة الكامل (12 مشهداً)',
      storyArchitecture: 'تفاصيل القصة وتقسيم المشاهد',
      synopsis: 'ملخص القصة',
      moralLesson: 'الحكمة والعبرة المستفادة',
      narration: 'السرد الصوتي للراوي',
      dialogue: 'حوار الشخصيات',
      visualPrompt: 'التوجيه البصري ثلاثي الأبعاد للمشهد',
      cameraDirection: 'حركة الكاميرا والإخراج',
    },
    characterModule: {
      heading: 'استوديو الشخصيات الكرتونية ثلاثية الأبعاد',
      subheading: 'ابتكار شخصيات كرتونية ثلاثية الأبعاد مع الحفاظ الصارم على تطابق المظهر والملابس في جميع المشاهد.',
      addCharacter: 'إضافة شخصية جديدة',
      generateCast: 'استخراج الشخصيات تلقائياً من القصة',
      consistencyLock: 'قفل تطابق الهوية البصرية للشخصيات مفعل',
      consistencyDesc: 'يتم دمج الوصف الدقيق للملابس والألوان والملامح تلقائياً في كل مشهد لضمان ثبات الشخصية.',
      visualDNA: 'البصمة البصرية ثلاثية الأبعاد (وصف الثبات)',
      personality: 'الشخصية والدور',
      renderPortrait: 'توليد صورة الشخصية 3D',
      role: 'الدور',
      voiceAssign: 'الصوت المخصص',
    },
    visualsModule: {
      heading: 'استوديو الصور السينمائية 16:9 وفيديو Veo',
      subheading: 'توليد صورة سينمائية 16:9 لكل مشهد وتحريك اللقطات باستخدام نماذج Google Gemini Image و Veo / Omni Flash.',
      imageStudioTab: 'صور المشاهد 16:9',
      videoStudioTab: 'مقاطع الفيديو المتحركة Veo',
      generateAllImages: 'توليد جميع صور المشاهد المتبقية',
      generateSceneImage: 'توليد صورة 16:9 للمشهد',
      generateSceneVideo: 'تحريك المشهد بالفيديو (Veo)',
      characterDnaInjected: 'يتضمن البصمة البصرية للشخصيات',
      aspectRatio169: 'أبعاد سينمائية 16:9 عالية الدقة',
      veoAnimationDesc: 'يحول صورة المشهد إلى لقطة كرتونية متحركة ثلاثية الأبعاد.',
    },
    voiceModule: {
      heading: 'استوديو التعليق الصوتي والموسيقى المرخصة',
      subheading: 'توليد السرد الصوتي بالعربية والإنجليزية والفرنسية عبر نماذج Google TTS مع موسيقى خلفية مرخصة.',
      narratorVoice: 'صوت الراوي الرئيسي',
      generateAllVoice: 'توليد الصوت لجميع المشاهد',
      generateSceneVoice: 'توليد السرد الصوتي للمشهد',
      licensedMusicTitle: 'الموسيقى التصويرية المرخصة للقصص',
      licensedMusicDesc: 'مقاطع موسيقية أوركسترالية مرخصة وآمنة للأطفال مع دعم توليد الموسيقى عبر Gemini Lyria.',
      aiMusicGenerate: 'توليد موسيقى مخصصة (Lyria)',
    },
    editorModule: {
      heading: 'محرر الفيديو الاحترافي بدقة 1080p',
      subheading: 'دمج المشاهد والصوت والانتقالات والترجمة النصية والمقدمة والخاتمة وتصدير الفيديو بدقة 1080p.',
      playFullMovie: 'تشغيل معاينة الفيلم الكامل',
      pauseMovie: 'إيقاف مؤقت',
      exportMp4: 'دمج وتصدير الفيديو بدقة 1080p',
      exportingProgress: 'جاري رندرة الفيديو بدقة 1080p ومزج الصوت...',
      introCard: 'بطاقة مقدمة القصة السينمائية (5 ثوانٍ)',
      outroCard: 'بطاقة الخاتمة والعبرة الأخلاقية (6 ثوانٍ)',
      subtitlesToggle: 'إظهار الترجمة النصية التلقائية على الفيديو',
      musicMix: 'مستوى صوت الموسيقى الخلفية',
      narrationMix: 'مستوى صوت الراوي',
      timelineTitle: 'الخط الزمني للإنتاج متعدد المسارات (5-8 دقائق)',
    },
    reviewModule: {
      heading: 'المراجعة البشرية الإلزامية وضبط الجودة',
      subheading: 'لا يتم النشر تلقائياً أبداً. يجب مراجعة القصة والصور والصوت والموافقة الصريحة قبل التصدير أو الرفع على يوتيوب.',
      gateWarning: 'تتطلب المنصة موافقة بشرية صريحة على جميع المشاهد قبل تفعيل النشر على يوتيوب.',
      approveAllStory: 'اعتماد جميع نصوص المشاهد',
      approveAllImages: 'اعتماد جميع صور المشاهد',
      approveAllAudio: 'اعتماد جميع المقاطع الصوتية',
      reviewerNameLabel: 'اسم المراجع البشري المسؤول',
      reviewerNotesLabel: 'ملاحظات المراجعة التربوية وجودة المحتوى',
      finalSignOff: 'تأكيد الموافقة البشرية النهائية للنشر',
      signOffConfirmed: 'تم توثيق الموافقة البشرية بنجاح',
    },
    youtubeModule: {
      heading: 'النشر الآمن عبر YouTube Data API v3',
      subheading: 'مصادقة OAuth 2.0 ورفع الفيديو كـ "خاص" (PRIVATE) افتراضياً مع إقرار المحتوى المخصص للأطفال.',
      connectAccount: 'ربط قناة يوتيوب (OAuth 2.0)',
      connectedStatus: 'تم الربط عبر YouTube OAuth 2.0',
      uploadPrivateBtn: 'رفع الفيديو كـ "خاص" (PRIVATE) إلى يوتيوب',
      coppaCompliance: 'إقرار الجمهور (COPPA): فيديو مخصص للأطفال',
      coppaDesc: 'يضبط تلقائياً selfDeclaredMadeForKids = true وحالة الخصوصية PRIVATE لحماية الأطفال.',
      privacyDefault: 'حالة الخصوصية الافتراضية: خاص (PRIVATE)',
      humanGateLocked: 'النشر مقفل — يرجى إكمال المراجعة البشرية الإلزامية في الخطوة 6 أولاً',
      oauthInstructionsTitle: 'إعدادات الربط مع YouTube Data API v3',
    },
  },
};
