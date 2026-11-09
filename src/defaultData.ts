import { StoryProject } from './types';

export const HERO_BANNER_URL = '/src/assets/images/studio_hero_storybook_1794222192812.jpg';
export const NOOR_AVATAR_URL = '/src/assets/images/char_noor_explorer_1794222194311.jpg';
export const FENN_AVATAR_URL = '/src/assets/images/char_fenn_fox_1794222195713.jpg';
export const DEFAULT_SCENE_IMAGE_URL = '/src/assets/images/scene_whispering_observatory_1794222196635.jpg';

export const LICENSED_MUSIC_TRACKS = [
  {
    id: 'celestial-lullaby',
    name: 'Celestial Observatory Lullaby',
    composer: 'AI Studio Licensed Creative Commons Orchestra',
    license: 'CC-BY 4.0 Studio Safe License',
    mood: 'Magical, Gentle, Starlight Harp & Celesta',
    tempoBpm: 76,
    notes: [261.63, 329.63, 392.00, 523.25, 493.88, 392.00, 329.63, 293.66],
  },
  {
    id: 'clockwork-adventure',
    name: 'Clockwork Meadow March',
    composer: 'AI Studio Licensed Kids Production Library',
    license: 'Royalty-Free Broadcast & YouTube Safe',
    mood: 'Playful, Curious, Pizzicato Strings & Woodwinds',
    tempoBpm: 104,
    notes: [293.66, 349.23, 440.00, 587.33, 523.25, 440.00, 349.23, 329.63],
  },
  {
    id: 'desert-starlight',
    name: 'Oasis of Golden Lanterns',
    composer: 'AI Studio Licensed World Ensemble',
    license: 'Royalty-Free Worldwide YouTube Kids Safe',
    mood: 'Warm, Wonder-filled, Acoustic Oud & Soft Flute',
    tempoBpm: 88,
    notes: [220.00, 277.18, 329.63, 440.00, 392.00, 329.63, 277.18, 246.94],
  },
  {
    id: 'morning-sunbeams',
    name: 'Sunbeams in the Treehouse',
    composer: 'AI Studio Acoustic Ensemble',
    license: 'CC0 Public Domain Dedication',
    mood: 'Uplifting, Joyful, Acoustic Piano & Glockenspiel',
    tempoBpm: 96,
    notes: [329.63, 392.00, 493.88, 659.25, 587.33, 493.88, 392.00, 329.63],
  },
];

export const INITIAL_DEMO_PROJECT: StoryProject = {
  id: 'proj-lantern-of-lost-stars',
  title: 'Noor and the Lantern of Whispering Stars',
  synopsis:
    'Seven-year-old stargazer Noor and her clockwork silver fox Fenn climb to the Whispering Observatory when the village night sky suddenly dims. Through patience, teamwork, and sharing their warm lantern light, they guide twelve timid baby constellations back into the heavens.',
  moral:
    'Even the smallest light grows brighter when shared with kindness and patience.',
  language: 'en',
  ageGroup: '6-8',
  targetDurationMinutes: 6.0,
  theme: 'Curiosity, Kindness & Teamwork',
  visualStyle:
    '3D animated Pixar/DreamWorks storybook style, soft volumetric starlight, rich midnight-blue and royal-purple palette, warm golden lantern rim lighting, ultra-detailed tactile textures',
  characters: [
    {
      id: 'char-noor',
      name: 'Noor',
      role: 'protagonist',
      ageOrType: '7-year-old Young Astronomer',
      personality: 'Curious, gentle, observant, courageous when friends need help',
      visualAppearance:
        'Cute 3D Pixar-style 7-year-old girl named Noor with bouncy dark curly hair, warm expressive brown eyes, wearing a midnight-indigo explorer cape embroidered with golden stars, cream linen shirt, brown corduroy trousers, and a brass pocket compass',
      voiceName: 'Kore',
      avatarUrl: NOOR_AVATAR_URL,
    },
    {
      id: 'char-fenn',
      name: 'Fenn',
      role: 'companion',
      ageOrType: 'Clockwork Silver & Amber Fox Cub',
      personality: 'Playful, loyal, expressive ears that click softly when excited',
      visualAppearance:
        'Cute 3D Pixar-style small clockwork fox cub named Fenn made of brushed silver and warm copper plates, glowing sapphire-blue eyes, wearing a cozy knitted royal-purple scarf, articulated mechanical tail with a gentle amber glow',
      voiceName: 'Puck',
      avatarUrl: FENN_AVATAR_URL,
    },
  ],
  scenes: [
    {
      id: 'scene-1',
      sceneNumber: 1,
      title: 'The Quiet Night in Starfall Village',
      durationSeconds: 30,
      setting: 'Cobblestone balcony overlooking a sleepy hillside village under a deep indigo sky',
      narration:
        'Every evening before bedtime, seven-year-old Noor stepped onto her wooden balcony with her brass telescope. Beside her sat Fenn, a tiny clockwork fox whose silver ears gave a cheerful click whenever a shooting star danced across the clouds.',
      dialogue: [
        { characterName: 'Noor', text: 'Look closely, Fenn! Tonight is the Festival of the Twelve Lantern Stars.' },
        { characterName: 'Fenn', text: 'Click-whirr! My sapphire eyes are ready, Noor!' },
      ],
      visualPrompt:
        'Wide cinematic 16:9 3D animated shot of Noor and Fenn on a cozy wooden balcony at night overlooking a fairytale village, brass telescope, deep midnight blue sky, warm candlelit windows.',
      cameraDirection: 'Slow crane pan down from the starry sky to Noor adjusting her brass compass.',
      transition: 'fade',
      imageUrl: DEFAULT_SCENE_IMAGE_URL,
      imageModelUsed: 'Studio Pre-rendered 3D Asset',
      storyApproved: true,
      imageApproved: true,
      audioApproved: false,
    },
    {
      id: 'scene-2',
      sceneNumber: 2,
      title: 'The Vanishing Constellations',
      durationSeconds: 30,
      setting: 'Village rooftops wrapped in velvety purple twilight mist',
      narration:
        'But as the town clock chimed eight, a hush fell over the valley. One by one, the golden constellations above the mountain flickered like sleepy fireflies and vanished into a swirl of violet mist.',
      dialogue: [
        { characterName: 'Noor', text: 'Oh no... the Little Swan and the Silver Boat have gone dark!' },
      ],
      visualPrompt:
        '16:9 3D animated storybook scene of Noor looking up in surprise as glowing constellations fade into a magical purple nebula cloud above the mountains.',
      cameraDirection: 'Gentle zoom in on Noor’s wide expressive eyes reflecting the fading starlight.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-3',
      sceneNumber: 3,
      title: 'The Brass Compass Glows',
      durationSeconds: 30,
      setting: 'Noor’s study desk covered in star charts and glowing astrolabes',
      narration:
        'Inside her room, Noor’s brass pocket compass began to hum with a gentle golden melody. Its needle spun twice and pointed straight toward the ancient Whispering Observatory at the top of Moonbeam Hill.',
      dialogue: [
        { characterName: 'Fenn', text: 'Your compass knows where the stars are hiding!' },
        { characterName: 'Noor', text: 'Let us pack our warmest lantern. We have friends to find.' },
      ],
      visualPrompt:
        'Close-up 16:9 3D animated scene of Noor and Fenn leaning over an antique wooden desk with a glowing golden compass and unfurled celestial map.',
      cameraDirection: 'Orbit camera around the glowing brass compass illuminating their faces.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-4',
      sceneNumber: 4,
      title: 'Stepping into the Lavender Woods',
      durationSeconds: 30,
      setting: 'Enchanted forest path with bioluminescent purple ferns and stone lanterns',
      narration:
        'With her starry indigo cape fastened tight, Noor followed Fenn along the winding cobblestone trail. Soft lavender ferns glowed beneath their boots, lighting each careful step through the whispering trees.',
      dialogue: [
        { characterName: 'Noor', text: 'Stay close, Fenn. The forest listens when we walk with gentle footsteps.' },
      ],
      visualPrompt:
        '16:9 3D animated wide shot of Noor and clockwork fox Fenn walking along a stone path through a magical midnight forest with glowing purple ferns.',
      cameraDirection: 'Tracking side shot following Noor and Fenn from left to right.',
      transition: 'slide',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-5',
      sceneNumber: 5,
      title: 'The Bridge of Echoing Streams',
      durationSeconds: 30,
      setting: 'Arched stone bridge over a crystal stream reflecting nebula light',
      narration:
        'Halfway up the hill, they reached the Bridge of Echoing Streams. Sitting on the mossy railing was a tiny crystal star-sprite, shivering because its golden tail had lost its spark in the cool night breeze.',
      dialogue: [
        { characterName: 'Noor', text: 'You must be freezing, little star. Here, warm your hands by our lantern.' },
      ],
      visualPrompt:
        '16:9 3D animated scene on an arched stone bridge at night; Noor kneels kindly offering a warm glowing lantern to a tiny translucent star-sprite.',
      cameraDirection: 'Slow push-in toward the warm lantern light shared between Noor and the sprite.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-6',
      sceneNumber: 6,
      title: 'A Spark Shared is Doubled',
      durationSeconds: 30,
      setting: 'Stone bridge illuminated by swirling golden stardust',
      narration:
        'As Noor shared the warmth of her lantern, something wonderful happened. Instead of growing dimmer, her lantern blazed twice as bright, and the little star-sprite glowed like a freshly polished sunbeam.',
      dialogue: [
        { characterName: 'Fenn', text: 'Look! Sharing your light made both of you shine brighter!' },
      ],
      visualPrompt:
        '16:9 3D animated magical moment: golden ribbons of stardust swirl around Noor, Fenn, and the happy star-sprite on the stone bridge.',
      cameraDirection: 'Low-angle upward tilt capturing the swirling golden particles.',
      transition: 'fade',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-7',
      sceneNumber: 7,
      title: 'Gates of the Whispering Observatory',
      durationSeconds: 30,
      setting: 'Grand domed observatory atop Moonbeam Hill with brass arches',
      narration:
        'Guided by the grateful star-sprite, Noor and Fenn arrived at the towering oak doors of the Whispering Observatory. Inside, giant brass rings and glass globes floated silently beneath a vaulted dome.',
      dialogue: [
        { characterName: 'Noor', text: 'We made it! Hello? Is anyone hiding up in the dome?' },
      ],
      visualPrompt:
        '16:9 3D animated interior of a grand celestial observatory with floating brass astrolabes, spiral wooden stairs, and Noor and Fenn standing at the center.',
      cameraDirection: 'Wide establishing shot panning across the domed ceiling.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-8',
      sceneNumber: 8,
      title: 'The Shy Baby Constellations',
      durationSeconds: 30,
      setting: 'Upper gallery of the telescope dome',
      narration:
        'Curled behind the great brass telescope were eleven more baby constellations—a tiny Pegasus, a miniature Bear, and a timid Dolphin—hiding because a loud thundercloud had startled them earlier that evening.',
      dialogue: [
        { characterName: 'Noor', text: 'Do not be afraid. The thundercloud has already sailed past the sea.' },
        { characterName: 'Fenn', text: 'And I can play a soft clockwork lullaby until you feel brave again!' },
      ],
      visualPrompt:
        '16:9 3D animated heartwarming scene of glowing translucent star creatures peeking out shyly from behind a giant brass telescope while Noor and Fenn smile gently.',
      cameraDirection: 'Medium two-shot slowly gliding toward the baby constellations.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-9',
      sceneNumber: 9,
      title: 'Fenn’s Clockwork Lullaby',
      durationSeconds: 30,
      setting: 'Center platform of the observatory bathed in violet and gold light',
      narration:
        'Fenn wound his silver tail and chimed a gentle music-box melody. As the soothing notes floated through the hall, the baby constellations uncurled their paws and began to hum along in harmony.',
      dialogue: [
        { characterName: 'Noor', text: 'That is it, Fenn! Music and patience always chase away fear.' },
      ],
      visualPrompt:
        '16:9 3D animated scene of clockwork fox Fenn emitting glowing musical notes while baby star constellations float happily around Noor.',
      cameraDirection: 'Circular 360-degree camera drift around the glowing circle.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-10',
      sceneNumber: 10,
      title: 'Lighting the Great Celestial Lens',
      durationSeconds: 30,
      setting: 'Observatory prism platform beneath the open sky dome',
      narration:
        'Together, Noor lifted her lantern while Fenn aligned the crystal prism of the great telescope. A warm beam of golden light rose through the open dome, forming a shimmering staircase into the midnight sky.',
      dialogue: [
        { characterName: 'Noor', text: 'The skyway is open! Climb home, little stars!' },
      ],
      visualPrompt:
        '16:9 3D animated spectacle of a golden beam of light shooting from the observatory telescope into the night sky, forming a glowing stairway of stars.',
      cameraDirection: 'Dramatic tilt up following the golden light beam into the clouds.',
      transition: 'zoom',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-11',
      sceneNumber: 11,
      title: 'The Sky Blossoms in Gold',
      durationSeconds: 30,
      setting: 'Panoramic night sky over Starfall Village',
      narration:
        'One after another, the twelve constellations bounded up the golden beam and took their places in the heavens. Below in Starfall Village, children cheered from their windows as the night sky sparkled brighter than ever.',
      dialogue: [
        { characterName: 'Fenn', text: 'They formed a giant star-fox constellation just for us!' },
      ],
      visualPrompt:
        '16:9 3D animated panoramic view of the fairytale village at night as dazzling golden constellations illuminate the deep purple sky.',
      cameraDirection: 'High aerial sweep over the glowing village rooftops.',
      transition: 'dissolve',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
    {
      id: 'scene-12',
      sceneNumber: 12,
      title: 'Home Before Bedtime',
      durationSeconds: 30,
      setting: 'Noor’s cozy bedroom window bathed in peaceful starlight',
      narration:
        'Back in her cozy room, Noor tucked Fenn beside her pillow and placed the brass compass on her desk. She knew that whenever the world felt dark, a little patience and a shared light could brighten the entire sky.',
      dialogue: [
        { characterName: 'Noor', text: 'Goodnight, Fenn. Goodnight, whispering stars.' },
      ],
      visualPrompt:
        '16:9 3D animated peaceful closing scene of Noor and Fenn looking out a warm bedroom window at a tranquil starry midnight sky.',
      cameraDirection: 'Slow pull-back through the window frame into the starry night.',
      transition: 'fade',
      storyApproved: true,
      imageApproved: false,
      audioApproved: false,
    },
  ],
  editorConfig: {
    introEnabled: true,
    introTitle: 'Noor and the Lantern of Whispering Stars',
    introSubtitle: 'An Original 3D Animated Storybook Production',
    outroEnabled: true,
    outroMoralText: 'Moral: Even the smallest light grows brighter when shared with kindness and patience.',
    outroCallToAction: 'Thank you for watching AI Kids Story Studio!',
    subtitlesEnabled: true,
    subtitleSize: 'md',
    backgroundMusicId: 'celestial-lullaby',
    musicVolume: 0.35,
    narrationVolume: 0.95,
    resolution: '1080p',
  },
  reviewState: {
    storyReviewed: false,
    charactersReviewed: false,
    imagesReviewed: false,
    audioReviewed: false,
    videoReviewed: false,
    reviewerName: '',
    reviewerNotes: '',
    explicitPublishApproval: false,
  },
  youtubeMetadata: {
    title: 'Noor and the Lantern of Whispering Stars | 3D Animated Bedtime Story for Kids',
    description:
      'Join 7-year-old astronomer Noor and her clockwork fox Fenn on a heartwarming 3D animated adventure to help shy baby constellations find their way back to the night sky.\n\nMoral Lesson: Even the smallest light grows brighter when shared with kindness and patience.\n\nProduced with AI Kids Story Studio.',
    tags: ['kids story', '3d animation', 'bedtime story', 'children moral stories', 'animated storybook'],
    categoryId: '1',
    privacyStatus: 'private',
    selfDeclaredMadeForKids: true,
  },
  status: 'in_production',
  createdAt: '2026-11-09T02:30:00.000Z',
  updatedAt: '2026-11-09T02:55:00.000Z',
};
