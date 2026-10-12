import type { GameEvent } from '../game/types';
export class SoundFx {
  private context: AudioContext | null = null;
  enabled = false;
  toggle(): boolean { this.enabled = !this.enabled; return this.enabled; }
  playEvents(events: GameEvent[]): void {
    if (!this.enabled || !events.length) return;
    const event = events.find((e) => e.type === 'revolt' || e.type === 'capture');
    if (!event) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') void this.context.resume();
      const now = this.context.currentTime, osc = this.context.createOscillator(), gain = this.context.createGain();
      osc.type='triangle';osc.frequency.setValueAtTime(event.type==='revolt'?290:440,now);
      osc.frequency.exponentialRampToValueAtTime(event.type==='revolt'?520:660,now+.15);
      gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(.045,now+.025);
      gain.gain.exponentialRampToValueAtTime(.0001,now+.22);
      osc.connect(gain).connect(this.context.destination);osc.start(now);osc.stop(now+.23);
    } catch { this.enabled=false; }
  }
}
