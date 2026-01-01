import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface Props {
  onComplete: () => void;
}

const LogicPuzzle: React.FC<Props> = ({ onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [solved, setSolved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playSFX('click');
    if (answer.trim() === '13' || answer.toLowerCase().includes('thirteen')) {
      setSolved(true);
      playSFX('success');
      setTimeout(onComplete, 1500);
    } else {
      setError(true);
      playSFX('error');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-6 glass-panel rounded-2xl animate-float">
      <h2 className="font-cinematic text-2xl text-cyan-300 mb-4 text-center">The Sequence of Destiny</h2>
      <p className="text-gray-300 text-center mb-6 font-light">
        The gears of time follow a natural order. Restore the sequence to wind the clock.
      </p>

      <div className="flex gap-4 mb-8 text-xl md:text-3xl font-cyber text-white tracking-widest">
        <div className="p-3 border border-white/20 rounded">1</div>
        <div className="p-3 border border-white/20 rounded">1</div>
        <div className="p-3 border border-white/20 rounded">2</div>
        <div className="p-3 border border-white/20 rounded">3</div>
        <div className="p-3 border border-white/20 rounded">5</div>
        <div className="p-3 border border-white/20 rounded">8</div>
        <div className="p-3 border border-pink-500/50 rounded bg-pink-500/10 animate-pulse text-pink-300">?</div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the missing number..."
          className="w-full bg-black/30 border border-white/20 rounded-lg p-3 text-center text-white focus:outline-none focus:border-cyan-400 transition-colors"
          autoFocus
        />
        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wider hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
        >
          {solved ? <CheckCircle2 /> : 'RESTORE TIME'}
        </button>
      </form>

      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 animate-bounce">
          <AlertCircle size={20} />
          <span>The gears grind... that is not the number.</span>
        </div>
      )}
      
      {solved && (
        <div className="mt-4 flex items-center gap-2 text-green-400">
          <CheckCircle2 size={20} />
          <span>Time resumes flowing...</span>
        </div>
      )}
    </div>
  );
};

export default LogicPuzzle;