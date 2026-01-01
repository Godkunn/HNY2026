import React, { useState, useEffect } from 'react';
import { GameStage } from './types';
import { generateStorySegment } from './services/geminiService';
import LogicPuzzle from './components/LogicPuzzle';
import MazeGame from './components/MazeGame';
import MemoryGame from './components/MemoryGame';
import FinalCelebration from './components/FinalCelebration';
import { Play, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { initAudio, startAmbience, stopAmbience, playSFX } from './utils/audio';

const App: React.FC = () => {
  const [stage, setStage] = useState<GameStage>(GameStage.INTRO);
  const [storyText, setStoryText] = useState<string>("");
  const [loadingStory, setLoadingStory] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  // Load intro story on mount
  useEffect(() => {
    loadStory(GameStage.INTRO);
  }, []);

  // Manage ambience based on stage and audioEnabled
  useEffect(() => {
    if (audioEnabled) {
      if (stage === GameStage.FINALE) {
        stopAmbience(); // Final celebration has its own music
      } else {
        startAmbience();
      }
    } else {
      stopAmbience();
    }
  }, [audioEnabled, stage]);

  const toggleAudio = () => {
    initAudio(); // Initialize on user interaction
    setAudioEnabled(!audioEnabled);
    playSFX('click');
  };

  const loadStory = async (currentStage: GameStage) => {
    setLoadingStory(true);
    const text = await generateStorySegment(currentStage);
    setStoryText(text);
    setLoadingStory(false);
  };

  const advanceStage = () => {
    if (audioEnabled) playSFX('win_game');
    setTransitioning(true);
    setTimeout(async () => {
      let nextStage = GameStage.INTRO;
      switch (stage) {
        case GameStage.INTRO: nextStage = GameStage.CHAPTER_1_LOGIC; break;
        case GameStage.CHAPTER_1_LOGIC: nextStage = GameStage.CHAPTER_2_MAZE; break;
        case GameStage.CHAPTER_2_MAZE: nextStage = GameStage.CHAPTER_3_MEMORY; break;
        case GameStage.CHAPTER_3_MEMORY: nextStage = GameStage.FINALE; break;
        default: nextStage = GameStage.FINALE;
      }
      await loadStory(nextStage);
      setStage(nextStage);
      setTransitioning(false);
    }, 1500); // Extended fade out time for dramatic effect
  };

  const handleStartGame = () => {
    if (!audioEnabled) {
      initAudio();
      setAudioEnabled(true);
    } else {
      playSFX('success');
    }
    advanceStage();
  };

  const getBackground = () => {
    switch (stage) {
      case GameStage.INTRO: return 'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop")';
      case GameStage.CHAPTER_1_LOGIC: return 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop")';
      case GameStage.CHAPTER_2_MAZE: return 'url("https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop")';
      case GameStage.CHAPTER_3_MEMORY: return 'url("https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop")';
      case GameStage.FINALE: return 'url("https://images.unsplash.com/photo-1467810563316-b5476525c0f9?q=80&w=2069&auto=format&fit=crop")';
      default: return 'black';
    }
  };

  return (
    <div className="relative min-h-screen w-full text-white overflow-hidden bg-black transition-all duration-1000"
         style={{
           backgroundImage: getBackground(),
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
      
      {/* Overlay for readability and cinematic vibe */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-0"></div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-0 pointer-events-none"></div>

      {/* Audio Control */}
      <button 
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.5)] border border-cyan-500/30"
        onClick={toggleAudio}
      >
        {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Main Content Area */}
      <main className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-4 transition-opacity duration-1000 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Story Section */}
        {stage !== GameStage.FINALE && (
          <div className="max-w-2xl w-full mb-10 text-center animate-float">
             <div className="glass-panel p-8 md:p-12 rounded-[2rem] border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.3)] bg-black/30 backdrop-blur-xl">
                <h3 className="font-cyber text-sm tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-6 uppercase drop-shadow-md">
                  {stage.replace(/_/g, ' ')}
                </h3>
                {loadingStory ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-4">
                    <Sparkles className="animate-spin text-pink-400 w-8 h-8" />
                    <span className="text-xs text-pink-300 font-cyber tracking-widest animate-pulse">GENERATING REALITY...</span>
                  </div>
                ) : (
                  <p className="font-cinematic text-xl md:text-3xl leading-relaxed text-gray-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {storyText}
                  </p>
                )}
             </div>
          </div>
        )}

        {/* Game Interactions */}
        <div className="w-full max-w-5xl flex justify-center">
          
          {stage === GameStage.INTRO && !loadingStory && (
            <button
              onClick={handleStartGame}
              className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full border border-white/40 text-white shadow-[0_0_30px_rgba(236,72,153,0.4)] transition-all hover:scale-105 hover:border-pink-500 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 opacity-20 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative flex items-center gap-4 font-cyber tracking-[0.2em] text-xl z-10">
                BEGIN JOURNEY <Play size={20} fill="currentColor" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          )}

          {stage === GameStage.CHAPTER_1_LOGIC && (
            <div className="transform transition-all hover:scale-[1.01]">
              <LogicPuzzle onComplete={advanceStage} />
            </div>
          )}

          {stage === GameStage.CHAPTER_2_MAZE && (
            <div className="transform transition-all hover:scale-[1.01]">
              <MazeGame onComplete={advanceStage} />
            </div>
          )}

          {stage === GameStage.CHAPTER_3_MEMORY && (
            <div className="transform transition-all hover:scale-[1.01]">
              <MemoryGame onComplete={advanceStage} />
            </div>
          )}

          {stage === GameStage.FINALE && (
            <FinalCelebration />
          )}
        </div>
      </main>

      {/* Vignette Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.9)_100%)] z-20"></div>
    </div>
  );
};

export default App;