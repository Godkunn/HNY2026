// Simple synth for UI sounds so we don't need external files for basic SFX
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let audioCtx: AudioContext | null = null;
let ambienceNodes: { osc: OscillatorNode, gain: GainNode, lfo?: OscillatorNode }[] = [];

export const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const playSFX = (type: 'click' | 'hover' | 'success' | 'error' | 'step' | 'flip' | 'win_game') => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'hover':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'step':
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'success':
      // Nice chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major
      freqs.forEach((f, i) => {
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.type = 'sine';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.05, now + i * 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
        o.start(now + i * 0.05);
        o.stop(now + 1.5);
      });
      break;
    case 'flip':
       osc.type = 'triangle';
       osc.frequency.setValueAtTime(300, now);
       osc.frequency.linearRampToValueAtTime(600, now + 0.1);
       gain.gain.setValueAtTime(0.05, now);
       gain.gain.linearRampToValueAtTime(0, now + 0.1);
       osc.start(now);
       osc.stop(now + 0.1);
      break;
     case 'win_game':
       const winFreqs = [440, 554, 659, 880, 1108, 1318]; // A Major extended
       winFreqs.forEach((f, i) => { 
        const o = audioCtx!.createOscillator();
        const g = audioCtx!.createGain();
        o.connect(g);
        g.connect(audioCtx!.destination);
        o.type = 'triangle';
        o.frequency.value = f;
        g.gain.setValueAtTime(0.05, now + i*0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        o.start(now + i*0.08);
        o.stop(now + 3);
      });
      break;
  }
};

export const startAmbience = () => {
  if (!audioCtx) initAudio();
  if (!audioCtx) return;
  stopAmbience();

  // Create a deep space drone (Time Void)
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();
  osc1.connect(gain1);
  gain1.connect(audioCtx.destination);
  osc1.type = 'sine';
  osc1.frequency.value = 65.41; // C2
  gain1.gain.value = 0.08;
  osc1.start();

  // A subtle detuned oscillator for thickness
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();
  osc2.connect(gain2);
  gain2.connect(audioCtx.destination);
  osc2.type = 'sine';
  osc2.frequency.value = 65.0; 
  gain2.gain.value = 0.06;
  osc2.start();

  // LFO to modulate volume slightly for "breathing" effect
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.connect(lfoGain);
  lfoGain.connect(gain1.gain);
  lfo.frequency.value = 0.05; // Very slow
  lfoGain.gain.value = 0.02;
  lfo.start();
  
  ambienceNodes.push({ osc: osc1, gain: gain1, lfo });
  ambienceNodes.push({ osc: osc2, gain: gain2 });
};

export const stopAmbience = () => {
  ambienceNodes.forEach(node => {
    try {
      node.osc.stop();
      node.osc.disconnect();
      node.gain.disconnect();
      if (node.lfo) {
        node.lfo.stop();
        node.lfo.disconnect();
      }
    } catch (e) {}
  });
  ambienceNodes = [];
};