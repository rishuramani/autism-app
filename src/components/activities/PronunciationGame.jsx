import React, { useState, useRef } from 'react';
import { Mic, Volume2, CheckCircle2, AlertCircle, Play, Square } from 'lucide-react';

const PronunciationGame = ({ words, onComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [attempts, setAttempts] = useState({});
  const [feedback, setFeedback] = useState(null);
  const recognitionRef = useRef(null);

  const currentWord = words[currentWordIndex];
  const score = Object.values(attempts).filter(a => a.correct).length;

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser');
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        const confidence = event.results[0][0].confidence;
        analyzePronunciation(transcript, confidence);
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        setFeedback({
          type: 'error',
          message: `Error: ${event.error}. Please try again.`
        });
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setFeedback({
        type: 'info',
        message: 'Listening... Say the word clearly.'
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Error starting recording. Please try again.'
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const analyzePronunciation = (transcript, confidence) => {
    const correct = transcript === currentWord.toLowerCase();
    const attempt = {
      transcript,
      confidence: confidence * 100,
      correct,
      timestamp: new Date()
    };

    setAttempts(prev => ({
      ...prev,
      [currentWord]: attempt
    }));

    if (correct) {
      setFeedback({
        type: 'success',
        message: 'Perfect pronunciation! Great job!'
      });
      speakWord('Perfect! Well done!');
    } else {
      setFeedback({
        type: 'error',
        message: `Almost! Try saying "${currentWord}" again.`
      });
      speakWord('Try again!');
    }
  };

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setFeedback(null);
    } else {
      onComplete?.({
        score,
        totalWords: words.length,
        attempts
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Pronunciation Practice</h3>
        <p className="text-gray-600">Practice saying each word clearly</p>
        <div className="mt-2 flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <span className="text-gray-700">Score: {score}/{words.length}</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Current Word Display */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="text-lg font-medium mb-2">Say this word:</h4>
            <div className="flex items-center space-x-3">
              <span className="text-2xl text-blue-600">{currentWord}</span>
              <button
                onClick={() => speakWord(currentWord)}
                className="text-blue-600 hover:text-blue-700"
                aria-label="Listen to word"
              >
                <Volume2 className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <img
              src={`/word-images/${currentWord}.png`}
              alt={currentWord}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.src = '/word-images/placeholder.png';
              }}
            />
          </div>
        </div>

        {/* Recording Controls */}
        <div className="flex justify-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Mic className="h-5 w-5" />
              <span>Start Recording</span>
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop Recording</span>
            </button>
          )}

          <button
            onClick={nextWord}
            disabled={!attempts[currentWord]?.correct}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 ${
              attempts[currentWord]?.correct
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Play className="h-5 w-5" />
            <span>Next Word</span>
          </button>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div className={`p-4 rounded-lg ${
            feedback.type === 'success' ? 'bg-green-50' :
            feedback.type === 'error' ? 'bg-red-50' :
            'bg-blue-50'
          }`}>
            <div className="flex items-center space-x-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Mic className="h-5 w-5 text-blue-600" />
              )}
              <span className={
                feedback.type === 'success' ? 'text-green-700' :
                feedback.type === 'error' ? 'text-red-700' :
                'text-blue-700'
              }>
                {feedback.message}
              </span>
            </div>
          </div>
        )}

        {/* Attempt History */}
        {attempts[currentWord] && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Your Attempt:</h4>
            <div className="space-y-2">
              <p className="text-gray-600">
                You said: "{attempts[currentWord].transcript}"
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  Confidence: {Math.round(attempts[currentWord].confidence)}%
                </span>
                {attempts[currentWord].correct && (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PronunciationGame; 