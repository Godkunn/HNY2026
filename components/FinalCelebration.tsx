import React, { useEffect, useState, useRef } from 'react';
import { Heart, Stars, Gift } from 'lucide-react';
import { playSFX } from '../utils/audio';

const FinalCelebration: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showSecretButton, setShowSecretButton] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Play memory.mp3
  useEffect(() => {
    const audio = new Audio('/memory.mp3');
    audio.loop = true;
    audio.volume = 0.5;
    
    // Attempt play. Interaction must have occurred previously in the app.
    const playAudio = async () => {
      try {
        await audio.play();
      } catch (err) {
        console.warn("Autoplay prevented or file missing.", err);
      }
    };
    playAudio();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

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
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

    class Particle {
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      color: string;
      size: number;
      alpha: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 3 + 1;
        this.alpha = 1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += 0.05; // Gravity
        this.alpha -= 0.01;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const createFirework = () => {
      const x = Math.random() * width;
      const y = Math.random() * (height / 2);
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle(x, y));
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.05) createFirework();

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
      playSFX('success'); // Sound cue when button appears
    }, 60000); 
    return () => clearTimeout(timer);
  }, []);

  const handleReveal = () => {
    playSFX('click');
    playSFX('win_game');
    setShowMessage(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden z-10">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <div className="z-10 flex flex-col items-center text-center p-8 glass-panel rounded-3xl max-w-2xl m-4 animate-float border-2 border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.3)]">
        <h1 className="font-cinematic text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 animate-gradient mb-6">
          HAPPY NEW YEAR!
        </h1>
        
        <p className="font-light text-lg md:text-xl text-white mb-8 leading-relaxed">
          The timeline is restored. The universe is bright again.
          <br/>
          May your year be filled with magic, adventure, and endless joy.
          <br/>
          You are the Guardian of your own destiny.
        </p>
        
        <div className="flex gap-4 mb-8">
          <Heart className="text-red-500 animate-bounce w-10 h-10" fill="currentColor" />
          <Stars className="text-yellow-400 animate-spin-slow w-10 h-10" />
          <Heart className="text-red-500 animate-bounce w-10 h-10" fill="currentColor" />
        </div>

        <div className="p-4 bg-white/10 rounded-xl mb-4">
          <p className="text-pink-300 italic">"Time is not a line, it's a circle. And in every circle, I'll always find you."</p>
        </div>
      </div>

      {/* Secret Button Section */}
      <div className="h-20 w-full flex items-center justify-center z-20 mt-10">
        {showSecretButton && !showMessage && (
          <button
            onClick={handleReveal}
            className="group flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold shadow-lg transform hover:scale-105 transition-all animate-pulse"
          >
            <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>A Message For You</span>
          </button>
        )}

        {showMessage && (
          <div className="glass-panel p-6 rounded-xl animate-float border border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.4)]">
             <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 font-cinematic text-center">
               Make me admin of your telegram channel 🥺
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalCelebration;