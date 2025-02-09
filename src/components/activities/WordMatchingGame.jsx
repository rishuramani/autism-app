import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, AlertCircle } from 'lucide-react';

const WordMatchingGame = ({ words, onComplete }) => {
  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [matches, setMatches] = useState({});
  const [draggedWord, setDraggedWord] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Shuffle words and images on component mount
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
    setShuffledImages([...shuffled].sort(() => Math.random() - 0.5));
  }, [words]);

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
  };

  const handleDragStart = (word) => {
    setDraggedWord(word);
    setFeedback(null);
  };

  const handleDrop = (targetWord) => {
    if (draggedWord === targetWord) {
      // Correct match
      setMatches(prev => ({ ...prev, [draggedWord]: true }));
      setScore(prev => prev + 1);
      setFeedback({
        type: 'success',
        message: 'Great job! That\'s correct!'
      });
      speakWord('Correct! Great job!');

      if (score + 1 === words.length) {
        onComplete?.({
          score: score + 1,
          totalWords: words.length
        });
      }
    } else {
      // Incorrect match
      setFeedback({
        type: 'error',
        message: 'Try again! Listen to the word carefully.'
      });
      speakWord('Not quite right. Try again!');
    }
    setDraggedWord(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Match the Words</h3>
        <p className="text-gray-600">Drag the words to their matching pictures</p>
        <div className="mt-2 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Score: {score}/{words.length}</span>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-lg mb-6 ${
          feedback.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            <span className={feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {feedback.message}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-8">
        {/* Words Column */}
        <div className="space-y-4">
          {shuffledWords.map(word => (
            <div
              key={word}
              draggable={!matches[word]}
              onDragStart={() => handleDragStart(word)}
              className={`p-4 border rounded-lg flex items-center justify-between ${
                matches[word] ? 'bg-green-50 border-green-200' : 'bg-white hover:bg-gray-50 cursor-grab'
              }`}
            >
              <span className="font-medium">{word}</span>
              <button
                onClick={() => speakWord(word)}
                className="text-blue-600 hover:text-blue-700"
                aria-label={`Listen to ${word}`}
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Images Column */}
        <div className="space-y-4">
          {shuffledImages.map(word => (
            <div
              key={word}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(word)}
              className={`p-4 border rounded-lg ${
                matches[word] ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-dashed'
              }`}
            >
              <div className="w-full h-32 relative">
                <img
                  src={`/word-images/${word}.svg`}
                  alt={word}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = '/word-images/placeholder.svg';
                  }}
                />
                {matches[word] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-50">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WordMatchingGame; 