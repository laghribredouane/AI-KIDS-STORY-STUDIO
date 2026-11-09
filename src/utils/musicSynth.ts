import { LICENSED_MUSIC_TRACKS } from '../defaultData';

/**
 * Generates a playable WAV data URL for any of the licensed procedural background music tracks
 * so that the Voice Studio and 1080p Video Editor always have crystal-clear, royalty-free
 * polyphonic storybook background music without external network failures.
 */
export function synthesizeLicensedTrackWav(trackId: string, durationSeconds = 16): string {
  const track = LICENSED_MUSIC_TRACKS.find((t) => t.id === trackId) || LICENSED_MUSIC_TRACKS[0];
  const sampleRate = 22050;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  // RIFF WAV Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  const beatDuration = 60 / track.tempoBpm;
  const notes = track.notes;

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const noteIndex = Math.floor(t / beatDuration) % notes.length;
    const noteTime = t % beatDuration;
    const freq = notes[noteIndex];
    const bassFreq = notes[0] * 0.5;

    // Gentle celesta / music-box envelope
    const attack = Math.min(1, noteTime / 0.03);
    const decay = Math.exp(-noteTime * 3.2);
    const env = attack * decay;

    // Warm harmonic overtones
    const melody =
      Math.sin(2 * Math.PI * freq * t) * 0.55 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.18 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.06;

    const pad = Math.sin(2 * Math.PI * bassFreq * t) * 0.18;

    const sampleValue = Math.max(-1, Math.min(1, (melody * env + pad) * 0.5));
    view.setInt16(44 + i * 2, sampleValue * 32767, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return `data:audio/wav;base64,${btoa(binary)}`;
}
