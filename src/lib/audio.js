// Generate Happy Birthday - expressive piano arrangement
// Features: left hand chords, right hand melody, sustain pedal, dynamics

function writeString(view, offset, str) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

function createWav(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(44 + i * 2, s * 0x7FFF, true)
  }
  return buffer
}

// Realistic piano tone with hammer attack, string resonance, and sustain
function pianoString(freq, t, duration, velocity) {
  if (freq === 0) return 0
  const sampleRate = 44100

  // Hammer attack: sharp transient in first ~3ms
  const attackPhase = 0.003
  const attackEnv = t < attackPhase ? Math.pow(t / attackPhase, 0.5) : 1.0

  // Sustain: exponential decay with rate depending on register
  // Lower notes ring longer, higher notes decay faster
  const register = Math.log2(freq / 261.63) // 0 = middle C
  const baseDecay = 4.0 + Math.max(0, -register) * 1.5 - Math.max(0, register) * 0.5
  const sustainEnv = Math.exp(-baseDecay * t / duration * duration)

  // Combined envelope
  const env = attackEnv * sustainEnv * velocity

  // String harmonics with realistic amplitudes
  const harmonics = [
    { n: 1, a: 1.0 },
    { n: 2, a: 0.45 },
    { n: 3, a: 0.22 },
    { n: 4, a: 0.14 },
    { n: 5, a: 0.08 },
    { n: 6, a: 0.04 },
    { n: 7, a: 0.025 },
    { n: 8, a: 0.015 },
    { n: 10, a: 0.008 },
    { n: 12, a: 0.004 },
  ]

  let tone = 0
  for (const { n, a } of harmonics) {
    const f = freq * n
    if (f > 16000) break
    // Slight inharmonicity (stiff strings)
    const inharmonicity = 1 + 0.0001 * n * n * (freq / 261.63)
    tone += Math.sin(2 * Math.PI * f * inharmonicity * t) * a
  }

  // Stereo-like detuning (two strings per note in real piano)
  const detune = 0.3 + Math.random() * 0.1 // cents
  const f2 = freq * Math.pow(2, detune / 1200)
  tone += Math.sin(2 * Math.PI * f2 * t) * 0.35

  return tone * env * 0.12
}

// Notes
const N = {
  G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
  G4: 392.00, A4: 440.00, Bb4: 466.16, C5: 523.25,
  D5: 587.33,
}

// Arrangement: [beat_time, [[freq, duration_beats, velocity], ...]]
// Multiple notes at same time = chord
const ARRANGEMENT = [
  // Intro - soft arpeggiated chord (beat 0-4)
  { t: 0,    notes: [[N.G3, 4, 0.15]] },
  { t: 0.5,  notes: [[N.C4, 3.5, 0.12]] },
  { t: 1,    notes: [[N.E4, 3, 0.1]] },

  // Line 1: Happy birthday to you (beat 4-11)
  { t: 4,    notes: [[N.G3, 3, 0.2], [N.C4, 0.75, 0.6]] },
  { t: 4.75, notes: [[N.C4, 0.25, 0.5]] },
  { t: 5,    notes: [[N.C4, 3, 0.15], [N.D4, 1, 0.65]] },
  { t: 6,    notes: [[N.G3, 1, 0.15], [N.C4, 1, 0.6]] },
  { t: 7,    notes: [[N.C4, 2, 0.18], [N.F4, 1, 0.65]] },
  { t: 8,    notes: [[N.G3, 3, 0.2], [N.E4, 2.5, 0.7]] },

  // Line 2: Happy birthday to you (beat 11-18)
  { t: 11,   notes: [[N.G3, 3, 0.2], [N.C4, 0.75, 0.6]] },
  { t: 11.75,notes: [[N.C4, 0.25, 0.5]] },
  { t: 12,   notes: [[N.C4, 3, 0.15], [N.D4, 1, 0.65]] },
  { t: 13,   notes: [[N.G3, 1, 0.15], [N.C4, 1, 0.6]] },
  { t: 14,   notes: [[N.G3, 2, 0.2], [N.G4, 1, 0.65]] },
  { t: 15,   notes: [[N.C4, 3, 0.22], [N.F4, 2.5, 0.7]] },

  // Line 3: Happy birthday dear xxx (beat 18-26)
  { t: 18,   notes: [[N.C4, 3, 0.2], [N.C4, 0.75, 0.55]] },
  { t: 18.75,notes: [[N.C4, 0.25, 0.45]] },
  { t: 19,   notes: [[N.C4, 3, 0.15], [N.C5, 1.5, 0.75]] },
  { t: 20.5, notes: [[N.A4, 1, 0.65]] },
  { t: 21.5, notes: [[N.F4, 2, 0.18], [N.F4, 1, 0.6]] },
  { t: 22.5, notes: [[N.C4, 1.5, 0.15], [N.E4, 1, 0.6]] },
  { t: 23.5, notes: [[N.G3, 1, 0.15], [N.D4, 1.5, 0.55]] },

  // Line 4: Happy birthday to you (beat 25-33)
  { t: 25,   notes: [[N.Bb3, 3, 0.22], [N.Bb4, 0.75, 0.6]] },
  { t: 25.75,notes: [[N.Bb4, 0.25, 0.5]] },
  { t: 26,   notes: [[N.Bb3, 2, 0.15], [N.A4, 1, 0.65]] },
  { t: 27,   notes: [[N.F4, 2, 0.2], [N.F4, 1, 0.6]] },
  { t: 28,   notes: [[N.C4, 2, 0.2], [N.G4, 1, 0.65]] },
  { t: 29,   notes: [[N.G3, 4, 0.25], [N.F4, 3, 0.8]] },

  // Ending - resolve to C
  { t: 32,   notes: [[N.C4, 4, 0.3], [N.E4, 3, 0.25], [N.G4, 2, 0.2]] },
  { t: 34,   notes: [[N.C5, 3, 0.4]] },
]

export function generateBirthdayMusic() {
  const sampleRate = 44100
  const bpm = 100 // beats per minute - gentle piano tempo
  const beatDur = 60 / bpm // seconds per beat
  const totalBeats = 37
  const totalSamples = Math.floor(totalBeats * beatDur * sampleRate)
  const samples = new Float32Array(totalSamples)

  // Simple reverb impulse (delay lines)
  const reverbLen = Math.floor(sampleRate * 1.5)
  const reverbBuf = new Float32Array(reverbLen)
  const reverbDelays = [0.023, 0.037, 0.051, 0.073, 0.097, 0.127]
  const reverbGains = [0.25, 0.2, 0.18, 0.14, 0.1, 0.08]

  for (const event of ARRANGEMENT) {
    const startSample = Math.floor(event.t * beatDur * sampleRate)
    for (const [freq, beats, velocity] of event.notes) {
      const noteSamples = Math.floor(beats * beatDur * sampleRate)
      const endSample = Math.min(startSample + noteSamples, totalSamples)
      for (let i = startSample; i < endSample; i++) {
        const t = (i - startSample) / sampleRate
        const dur = noteSamples / sampleRate
        const sample = pianoString(freq, t, dur, velocity)
        samples[i] += sample

        // Add to reverb buffer
        for (let r = 0; r < reverbDelays.length; r++) {
          const delaySamples = Math.floor(reverbDelays[r] * sampleRate)
          const reverbIdx = i + delaySamples
          if (reverbIdx < totalSamples) {
            samples[reverbIdx] += sample * reverbGains[r]
          }
        }
      }
    }
  }

  // Normalize
  let peak = 0
  for (let i = 0; i < totalSamples; i++) {
    peak = Math.max(peak, Math.abs(samples[i]))
  }
  if (peak > 0) {
    const gain = 0.85 / peak
    for (let i = 0; i < totalSamples; i++) {
      samples[i] *= gain
    }
  }

  // Fade in first 0.05s, fade out last 1s
  const fadeIn = Math.floor(0.05 * sampleRate)
  const fadeOut = Math.floor(1.0 * sampleRate)
  for (let i = 0; i < fadeIn; i++) {
    samples[i] *= i / fadeIn
  }
  for (let i = 0; i < fadeOut; i++) {
    const idx = totalSamples - fadeOut + i
    if (idx >= 0) samples[idx] *= i / fadeOut
  }

  const wavBuffer = createWav(samples, sampleRate)
  const blob = new Blob([wavBuffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}
