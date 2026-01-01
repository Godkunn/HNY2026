import React, { useEffect, useState, useRef } from 'react';
import { Heart, Stars, Gift, Music } from 'lucide-react';
import { playSFX } from '../utils/audio';

const FinalCelebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play memory.mp3
  useEffect(() => {
    // Note: The file 'memory.mp3' must be in the 'public' folder of the project root.
    audioRef.current = new Audio('/memory.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.6;
    
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
          setAudioPlaying(true);
        }
      } catch (err) {
        console.warn("Autoplay prevented or file missing.", err);
        setAudioPlaying(false);
      }
    };
    playAudio();

    return () => {
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

  // Fireworks Logic
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
    // Rainbow colors
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
        ctx.shadowBlur = 10;
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

    const animate = () => {
      if (!ctx) return;
      // Fade out effect for trails
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.08) createFirework();

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
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
  }, []);

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
    // Extra fireworks burst on reveal
    const canvas = canvasRef.current;
    if(canvas) {
       // Logic handled in loop, but we can assume visual feedback via component state or just SFX
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden z-10 py-10">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      {/* Music Control in case autoplay fails */}
      <button 
        onClick={toggleMusic}
        className="absolute top-4 left-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/30 text-white transition animate-pulse"
        title={audioPlaying ? "Pause Music" : "Play Music"}
      >
        <Music size={24} className={audioPlaying ? "animate-spin-slow" : ""} />
      </button>

      <div className="z-10 flex flex-col items-center text-center p-8 glass-panel rounded-3xl max-w-3xl m-4 animate-float animate-rainbow-border bg-black/40">
        <h1 className="font-cinematic text-5xl md:text-8xl font-bold mb-6 animate-rainbow-text tracking-wider">
          HAPPY NEW YEAR!
        </h1>
        
        <p className="font-light text-xl md:text-2xl text-white mb-8 leading-relaxed font-cyber drop-shadow-lg">
          The timeline is restored.<br/>
          The universe is bright again.<br/>
          <span className="text-cyan-300 font-bold">You are the Guardian of your own destiny.</span>
        </p>
        
        <div className="flex gap-6 mb-8">
          <Heart className="text-red-500 animate-bounce w-12 h-12 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" fill="currentColor" />
          <Stars className="text-yellow-400 animate-spin-slow w-12 h-12 drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]" />
          <Heart className="text-pink-500 animate-bounce w-12 h-12 drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" fill="currentColor" />
        </div>

        <div className="p-6 bg-white/5 rounded-2xl mb-4 border border-white/10 backdrop-blur-md">
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 italic text-lg md:text-xl">
            "Time is not a line, it's a circle. And in every circle, I'll always find you."
          </p>
        </div>
      </div>

      {/* Secret Button Section */}
      <div className="min-h-[100px] w-full flex flex-col items-center justify-center z-20 mt-8 space-y-4">
        {showSecretButton && !showMessage && (
          <button
            onClick={handleReveal}
            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 text-white font-bold shadow-[0_0_20px_rgba(192,38,211,0.6)] transform hover:scale-110 transition-all duration-300 animate-pulse border border-white/20"
          >
            <Gift className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="font-cyber tracking-widest">A MESSAGE FOR YOU</span>
          </button>
        )}

        {showMessage && (
          <div className="glass-panel p-8 rounded-2xl animate-float border-2 border-yellow-400/50 shadow-[0_0_50px_rgba(250,204,21,0.5)] transform scale-110 transition-all duration-500 bg-black/60">
             <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 font-cinematic text-center leading-tight">
               Make me admin of your telegram channel 🥺
             </p>
             <div className="flex justify-center mt-4 space-x-2">
                <span className="text-4xl animate-bounce">🎁</span>
                <span className="text-4xl animate-bounce delay-100">✨</span>
                <span className="text-4xl animate-bounce delay-200">👑</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalCelebration;