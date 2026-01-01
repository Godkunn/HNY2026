import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { GridPosition } from '../types';
import { playSFX } from '../utils/audio';

interface Props {
  onComplete: () => void;
}

const MazeGame: React.FC<Props> = ({ onComplete }) => {
  // 0: Path, 1: Wall, 2: Start, 3: End
  const mazeLayout = [
    [2, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 1, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 3],
  ];

  const [playerPos, setPlayerPos] = useState<GridPosition>({ x: 0, y: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const move = (dx: number, dy: number) => {
    if (isComplete) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;

    // Check bounds
    if (newY >= 0 && newY < mazeLayout.length && newX >= 0 && newX < mazeLayout[0].length) {
       if (mazeLayout[newY][newX] !== 1) {
          // Valid move
          setPlayerPos({ x: newX, y: newY });
          if (mazeLayout[newY][newX] === 3) {
            setIsComplete(true);
            playSFX('success');
            setTimeout(onComplete, 1500);
          } else {
            playSFX('step');
          }
       } else {
          // Wall hit
          playSFX('error');
       }
    } else {
       // Out of bounds
       playSFX('error');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move(0, -1);
      if (e.key === 'ArrowDown') move(0, 1);
      if (e.key === 'ArrowLeft') move(-1, 0);
      if (e.key === 'ArrowRight') move(1, 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isComplete]);

  return (
    <div className="flex flex-col items-center glass-panel p-6 rounded-2xl">
      <h2 className="font-cinematic text-2xl text-purple-300 mb-2">The Neon Labyrinth</h2>
      <p className="text-sm text-gray-400 mb-4">Navigate the void to find the light.</p>

      <div className="relative bg-black/50 p-2 rounded-lg border border-purple-500/30">
        {mazeLayout.map((row, y) => (
          <div key={y} className="flex">
            {row.map((cell, x) => {
              let cellClass = "w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/5 ";
              if (cell === 1) cellClass += "bg-slate-800"; // Wall
              if (cell === 0) cellClass += "bg-transparent"; // Path
              
              const isPlayer = playerPos.x === x && playerPos.y === y;
              
              return (
                <div key={`${x}-${y}`} className={cellClass}>
                  {cell === 3 && <Star className="text-yellow-400 animate-spin-slow" fill="currentColor" />}
                  {isPlayer && <div className="w-6 h-6 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-pulse" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 md:hidden">
        <div />
        <button onClick={() => move(0, -1)} className="p-4 bg-white/10 rounded-full active:bg-white/30"><ArrowUp className="text-white" /></button>
        <div />
        <button onClick={() => move(-1, 0)} className="p-4 bg-white/10 rounded-full active:bg-white/30"><ArrowLeft className="text-white" /></button>
        <button onClick={() => move(0, 1)} className="p-4 bg-white/10 rounded-full active:bg-white/30"><ArrowDown className="text-white" /></button>
        <button onClick={() => move(1, 0)} className="p-4 bg-white/10 rounded-full active:bg-white/30"><ArrowRight className="text-white" /></button>
      </div>

      {isComplete && <div className="mt-4 text-yellow-300 font-bold animate-pulse">PATH FOUND!</div>}
    </div>
  );
};

export default MazeGame;