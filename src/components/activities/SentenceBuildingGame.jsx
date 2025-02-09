import React, { useState, useEffect } from 'react';
import { Volume2, CheckCircle2, AlertCircle, Shuffle } from 'lucide-react';

const SentenceBuildingGame = ({ sentences, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const currentSentence = sentences[currentIndex];

  useEffect(() => {
    shuffleCurrentSentence();
  }, [currentIndex, currentSentence]);

  const shuffleCurrentSentence = () => {
    const words = currentSentence.text.split(' ');
    setShuffledWords([...words].sort(() => Math.random() - 0.5));
    setSelectedWords([]);
    setFeedback(null);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleWordSelect = (word) => {
    setSelectedWords(prev => [...prev, word]);
    setShuffledWords(prev => prev.filter(w => w !== word));
    
    // Check if sentence is complete
    const newSelected = [...selectedWords, word];
    if (newSelected.length === currentSentence.text.split(' ').length) {
      checkSentence(newSelected);
    }
  };

  const handleWordRemove = (index) => {
    const word = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setShuffledWords(prev => [...prev, word]);
  };

  const checkSentence = (words) => {
    const attempt = words.join(' ');
    const isCorrect = attempt === currentSentence.text;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback({
        type: 'success',
        message: 'Perfect! You formed the sentence correctly!'
      });
      speakText('Great job! That\'s correct!');

      // Move to next sentence after delay
      setTimeout(() => {
        if (currentIndex < sentences.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onComplete?.({
            score: score + 1,
            totalSentences: sentences.length
          });
        }
      }, 2000);
    } else {
      setFeedback({
        type: 'error',
        message: 'Not quite right. Try rearranging the words.'
      });
      speakText('Try again!');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Build the Sentence</h3>
        <p className="text-gray-600">Arrange the words to form a correct sentence</p>
        <div className="mt-2 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Score: {score}/{sentences.length}</span>
        </div>
      </div>

      {/* Image for context */}
      <div className="mb-6">
        <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
          <img
            src={currentSentence.imageUrl}
            alt="Scene context"
            className="max-w-full max-h-full object-contain"
            onError={(e) => {
              e.target.src = '/activity-images/placeholder.png';
            }}
          />
        </div>
        <button
          onClick={() => speakText(currentSentence.text)}
          className="mt-2 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
        >
          <Volume2 className="h-5 w-5" />
          <span>Listen to correct sentence</span>
        </button>
      </div>

      {/* Selected Words */}
      <div className="mb-6">
        <div className="p-4 bg-blue-50 rounded-lg min-h-[100px] flex flex-wrap gap-2">
          {selectedWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordRemove(index)}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>{word}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Available Words */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium">Available Words</h4>
          <button
            onClick={shuffleCurrentSentence}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            <Shuffle className="h-4 w-4" />
            <span>Shuffle Words</span>
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {shuffledWords.map((word, index) => (
            <button
              key={index}
              onClick={() => handleWordSelect(word)}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`p-4 rounded-lg ${
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
    </div>
  );
};

export default SentenceBuildingGame; 