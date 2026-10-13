/**
 * Notification sounds, synthesised rather than shipped.
 *
 * No mp3 in the repo: two sine tones through the Web Audio API are a few lines
 * of code, weigh nothing, need no network request, and cannot 404. They also
 * sound the same on every device, which a compressed sample does not.
 *
 * The unavoidable browser rule: **audio cannot start until the user has
 * interacted with the page.** Chrome and Safari suspend the audio context
 * until a real click or tap. That is not a bug to work around; it is why the
 * admin shows a "click to turn sound on" prompt, and why `unlock()` exists to
 * be called from inside a click handler.
 */

let context: AudioContext | null = null;

type AudioContextConstructor = new () => AudioContext;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/**
 * Call from inside a click handler. Returns whether sound will actually play.
 *
 * A suspended context resumes only on a user gesture, so this has to be
 * wired to a real button rather than run on mount.
 */
export async function unlockAudio(): Promise<boolean> {
  const ctx = audioContext();
  if (!ctx) return false;
  try {
    if (ctx.state === "suspended") await ctx.resume();
    return ctx.state === "running";
  } catch {
    return false;
  }
}

export function audioReady(): boolean {
  return audioContext()?.state === "running";
}

type Note = { hz: number; at: number; for: number; gain?: number };

function play(notes: Note[]): void {
  const ctx = audioContext();
  if (!ctx || ctx.state !== "running") return;

  const now = ctx.currentTime;
  for (const note of notes) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = note.hz;

    const start = now + note.at;
    const end = start + note.for;
    const peak = note.gain ?? 0.18;

    // A short fade in and out. A square-edged note clicks, and a click is the
    // part people find unpleasant, not the tone.
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

/** The guest's status change: two soft notes, a rising third. Quiet. */
export function playSoftChime(): void {
  play([
    { hz: 660, at: 0, for: 0.16, gain: 0.1 },
    { hz: 880, at: 0.14, for: 0.26, gain: 0.1 },
  ]);
}

/**
 * The merchant's new order: three notes, louder, repeated once.
 * It has to carry across a kitchen, so it is deliberately more insistent than
 * the guest's — but still a chime, not an alarm.
 */
export function playOrderAlert(): void {
  play([
    { hz: 880, at: 0, for: 0.14, gain: 0.26 },
    { hz: 1175, at: 0.13, for: 0.14, gain: 0.26 },
    { hz: 1480, at: 0.26, for: 0.3, gain: 0.26 },
    { hz: 880, at: 0.62, for: 0.14, gain: 0.2 },
    { hz: 1175, at: 0.75, for: 0.14, gain: 0.2 },
    { hz: 1480, at: 0.88, for: 0.3, gain: 0.2 },
  ]);
}
