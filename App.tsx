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
      case GameStage.INTRO: return 'url("https://picsum.photos/seed/darkness/1920/1080")';
      case GameStage.CHAPTER_1_LOGIC: return 'url("https://picsum.photos/seed/clock/1920/1080")';
      case GameStage.CHAPTER_2_MAZE: return 'url("https://picsum.photos/seed/neon/1920/1080")';
      case GameStage.CHAPTER_3_MEMORY: return 'url("https://picsum.photos/seed/galaxy/1920/1080")';
      case GameStage.FINALE: return 'url("https://picsum.photos/seed/fireworks/1920/1080")';
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
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-0"></div>

      {/* Audio Control */}
      <button 
        className="absolute top-4 right-4 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.3)]"
        onClick={toggleAudio}
      >
        {audioEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
      </button>

      {/* Main Content Area */}
      <main className={`relative z-10 flex flex-col items-center justify-center min-h-screen p-4 transition-opacity duration-1000 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Story Section */}
        {stage !== GameStage.FINALE && (
          <div className="max-w-2xl w-full mb-8 text-center animate-float">
             <div className="glass-panel p-6 md:p-10 rounded-3xl border-t border-l border-white/20 shadow-2xl">
                <h3 className="font-cyber text-xs tracking-[0.3em] text-cyan-400 mb-4 uppercase">
                  {stage.replace(/_/g, ' ')}
                </h3>
                {loadingStory ? (
                  <div className="flex justify-center py-8">
                    <Sparkles className="animate-spin text-pink-400" />
                  </div>
                ) : (
                  <p className="font-cinematic text-lg md:text-2xl leading-relaxed text-gray-100 drop-shadow-md">
                    {storyText}
                  </p>
                )}
             </div>
          </div>
        )}

        {/* Game Interactions */}
        <div className="w-full max-w-4xl flex justify-center">
          
          {stage === GameStage.INTRO && !loadingStory && (
            <button
              onClick={handleStartGame}
              className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full border border-white/30 text-white shadow-2xl transition-all hover:scale-105 hover:border-pink-500 cursor-pointer"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-3 font-cyber tracking-widest text-lg">
                ENTER THE VOID <Play size={18} fill="currentColor" />
              </span>
            </button>
          )}

          {stage === GameStage.CHAPTER_1_LOGIC && (
            <LogicPuzzle onComplete={advanceStage} />
          )}

          {stage === GameStage.CHAPTER_2_MAZE && (
            <MazeGame onComplete={advanceStage} />
          )}

          {stage === GameStage.CHAPTER_3_MEMORY && (
            <MemoryGame onComplete={advanceStage} />
          )}

          {stage === GameStage.FINALE && (
            <FinalCelebration />
          )}
        </div>
      </main>

      {/* Vignette Effect */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] z-20"></div>
    </div>
  );
};

export default App;