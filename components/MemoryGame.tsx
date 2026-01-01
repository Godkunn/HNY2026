import React, { useState, useEffect } from 'react';
import { playSFX } from '../utils/audio';

interface Props {
  onComplete: () => void;
}

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJIS = ['🕰️', '🗝️', '🦄', '🌈', '🪐', '💎'];

const MemoryGame: React.FC<Props> = ({ onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Duplicate and shuffle
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(deck);
  }, []);

  const handleCardClick = (id: number) => {
    if (isProcessing) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isMatched || clickedCard.isFlipped) return;

    playSFX('flip');
    // Flip card
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === id); // Current is second

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match
        setTimeout(() => {
          playSFX('success');
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
          
          // Check win condition
          if (cards.filter(c => c.isMatched).length + 2 === cards.length) {
             setTimeout(onComplete, 1000);
          }
        }, 600);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
          ));
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="flex flex-col items-center glass-panel p-6 rounded-2xl w-full max-w-lg">
      <h2 className="font-cinematic text-2xl text-pink-300 mb-2">Memory Restoration</h2>
      <p className="text-gray-300 mb-6 text-center text-sm">Reconnect the scattered fragments of reality.</p>

      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map(card => (
          <div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`aspect-square cursor-pointer rounded-xl flex items-center justify-center text-3xl md:text-4xl transition-all duration-500 transform ${
              card.isFlipped || card.isMatched 
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 rotate-y-180 scale-95 shadow-[0_0_15px_rgba(236,72,153,0.6)]' 
                : 'bg-white/10 hover:bg-white/20'
            }`}
            style={{ perspective: '1000px' }}
          >
            <div className={`transition-opacity duration-300 ${card.isFlipped || card.isMatched ? 'opacity-100' : 'opacity-0'}`}>
              {card.emoji}
            </div>
            {/* Back of card design */}
            {!card.isFlipped && !card.isMatched && (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <span className="text-xs">?</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemoryGame;