import React, { useEffect, useState, useRef } from 'react';
import { Heart, Stars, Gift, Music, Volume2 } from 'lucide-react';
import { playSFX } from '../utils/audio';

const FinalCelebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  // Fixed: Removed unused state 'setVolume'. Volume is now a constant.
  const volume = 0.6;
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play memory.mp3
  useEffect(() => {
    // The build script copies 'memory.mp3' from root to 'public/' automatically.
    // So we access it at the root path '/memory.mp3'.
    audioRef.current = new Audio('/memory.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = volume;
    
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          setAudioPlaying(true);
        }
      } catch (err) {
        console.warn("Autoplay prevented or file missing. User interaction needed.", err);
        setAudioPlaying(false);
      }
    };
    
    // Try playing immediately
    playAudio();

    // Fallback: If browser blocked autoplay, play on the very next click anywhere
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => setAudioPlaying(true)).catch(() => {});
      }
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setAudioPlaying(!audioPlaying);
    }
  };

  // Fireworks and Visualizer Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#00FFFF', '#FF1493'];

    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      color: string;
      size: number;
      alpha: number;
      decay: number;

      constructor(x: number, y: number, color?: string) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.color = color || colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 4 + 1;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.005;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.05; // Gravity
        this.alpha -= this.decay;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const createFirework = () => {
      const x = Math.random() * width;
      const y = Math.random() * (height * 0.6);
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle(x, y, color));
      }
    };

    let time = 0;
    const animate = () => {
      if (!ctx) return;
      time++;
      
      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Random fireworks
      if (Math.random() < 0.05) createFirework();

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
      }

      // Draw "Visualizer" bars at bottom (Simulated)
      if (audioPlaying) {
        const barWidth = width / 50;
        for (let i = 0; i < 50; i++) {
          const barHeight = Math.sin(time * 0.1 + i * 0.5) * 50 + Math.random() * 30 + 20;
          const hue = (time + i * 10) % 360;
          ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.5)`;
          ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        }
      }

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [audioPlaying]);

  // Timer for Secret Button (60 seconds = 60000ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSecretButton(true);
      playSFX('success'); 
    }, 60000); 
    return () => clearTimeout(timer);
  }, []);

  const handleReveal = () => {
    playSFX('click');
    playSFX('win_game');
    setShowMessage(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden z-10 py-10">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      {/* Music Control */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 animate-fade-in">
        <button 
          onClick={toggleMusic}
          className={`p-3 rounded-full text-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.3)] ${audioPlaying ? "bg-green-500/20 hover:bg-green-500/40 animate-pulse" : "bg-red-500/20 hover:bg-red-500/40"}`}
          title={audioPlaying ? "Pause Music" : "Play Music"}
        >
          {audioPlaying ? <Volume2 size={24} /> : <Music size={24} />}
        </button>
        {!audioPlaying && (
           <span className="text-xs text-white/70 bg-black/50 px-2 py-1 rounded">Click to play song</span>
        )}
      </div>

      <div className="z-10 flex flex-col items-center text-center p-8 glass-panel rounded-3xl max-w-3xl m-4 animate-float animate-rainbow-border bg-black/40">
        <h1 className="font-cinematic text-5xl md:text-8xl font-bold mb-6 animate-rainbow-text tracking-wider drop-shadow-2xl">
          HAPPY NEW YEAR!
        </h1>
        
        <p className="font-light text-xl md:text-2xl text-white mb-8 leading-relaxed font-cyber drop-shadow-lg max-w-lg mx-auto">
          The timeline is restored.<br/>
          The universe is bright again.<br/>
          <span className="text-cyan-300 font-bold neon-text-glow">You are the Guardian of your own destiny.</span>
        </p>
        
        <div className="flex gap-8 mb-8 justify-center items-center">
          <Heart className="text-red-500 animate-heartbeat w-16 h-16 drop-shadow-[0_0_20px_rgba(255,0,0,0.8)]" fill="currentColor" />
          <Stars className="text-yellow-400 animate-spin-slow w-16 h-16 drop-shadow-[0_0_20px_rgba(255,255,0,0.8)]" />
          <Heart className="text-pink-500 animate-heartbeat w-16 h-16 drop-shadow-[0_0_20px_rgba(236,72,153,0.8)]" fill="currentColor" />
        </div>

        <div className="p-6 bg-white/5 rounded-2xl mb-4 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 italic text-lg md:text-xl font-medium">
            "Time is not a line, it's a circle. And in every circle, I'll always find you."
          </p>
        </div>
      </div>

      {/* Secret Button Section */}
      <div className="min-h-[120px] w-full flex flex-col items-center justify-center z-20 mt-4 space-y-4">
        {showSecretButton && !showMessage && (
          <button
            onClick={handleReveal}
            className="group flex items-center gap-3 px-10 py-5 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_30px_rgba(192,38,211,0.6)] transform hover:scale-110 transition-all duration-300 animate-pulse border-2 border-white/20"
          >
            <Gift className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-cyber tracking-widest text-lg">A SURPRISE FOR YOU</span>
          </button>
        )}

        {showMessage && (
          <div className="glass-panel p-8 md:p-12 rounded-[2rem] animate-bounce-in border-4 border-yellow-400/50 shadow-[0_0_80px_rgba(250,204,21,0.4)] transform hover:scale-105 transition-transform duration-500 bg-black/80 max-w-2xl mx-4">
             <p className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 font-cinematic text-center leading-tight mb-4">
               Make me admin of your telegram channel 🥺
             </p>
             <div className="flex justify-center mt-6 space-x-4">
                <span className="text-5xl animate-bounce">🎁</span>
                <span className="text-5xl animate-bounce delay-100">✨</span>
                <span className="text-5xl animate-bounce delay-200">👑</span>
             </div>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }
        @keyframes bounce-in {
            0% { transform: scale(0.5); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
            animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default FinalCelebration;