import React, { useState, useRef } from 'react';
import { Mic, Square, SkipForward, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';

const AutomatedSpeechAssessment = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [results, setResults] = useState({});
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef(null);
  const [assessmentStep, setAssessmentStep] = useState('instructions');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState('simple');

  // Assessment words organized by difficulty
  const assessmentWords = {
    simple: ['cat', 'dog', 'ball', 'book', 'house'],
    moderate: ['elephant', 'butterfly', 'telephone', 'banana', 'umbrella'],
    complex: ['refrigerator', 'helicopter', 'rhinoceros', 'octopus', 'dinosaur']
  };

  // Add these metric descriptions near the top of the component
  const metricDescriptions = {
    accuracy: "How closely your spoken word matches the target word. A perfect match scores 100%.",
    pronunciation: "The clarity and correctness of individual sounds in the word. Based on phonetic similarity.",
    fluency: "The smoothness and confidence of your speech. Higher confidence means better fluency."
  };

  const startAssessment = () => {
    try {
      setAssessmentStep('recording');
      const word = assessmentWords[currentDifficulty][currentWordIndex];
      setCurrentWord(word);
      console.log('Ready to assess word:', word);
    } catch (error) {
      console.error('Error starting assessment:', error);
      setFeedback('Error starting assessment. Please try again.');
    }
  };

  const startRecording = async () => {
    try {
      if (!currentWord) {
        throw new Error('No word selected for assessment');
      }

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
        console.log('Speech recognized:', { transcript, confidence });
        analyzeSpeech(transcript, confidence);
      };

      recognition.onerror = (event) => {
        console.error('Recognition error:', event.error);
        setFeedback(`Error: ${event.error}. Please try again.`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log('Recognition ended');
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setFeedback('Recording started - speak the word clearly');

    } catch (error) {
      console.error('Error starting recording:', error);
      setFeedback(error.message || 'Error starting recording. Please check your browser permissions.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      setFeedback('Recording stopped - check your results below');
    } catch (error) {
      console.error('Error stopping recording:', error);
      setFeedback('Error stopping recording. Please try again.');
    }
  };

  const analyzeSpeech = (transcript, confidence) => {
    try {
      console.log('Analyzing speech:', { transcript, currentWord });
      
      // Calculate accuracy score
      const accuracyScore = calculateAccuracyScore(transcript, currentWord);
      
      // Calculate pronunciation score (simplified)
      const pronunciationScore = accuracyScore * 0.9; // Slightly lower than accuracy
      
      // Calculate fluency score
      const fluencyScore = confidence * 100;

      const scores = {
        accuracy: accuracyScore,
        pronunciation: pronunciationScore,
        fluency: fluencyScore
      };

      console.log('Analysis results:', scores);

      // Update results
      setResults(prev => ({
        ...prev,
        [currentWord]: scores
      }));

      // Generate feedback
      generateFeedback(scores);
      
    } catch (error) {
      console.error('Error analyzing speech:', error);
      setFeedback('Error analyzing speech. Please try again.');
    }
  };

  const calculateAccuracyScore = (transcript, target) => {
    if (!transcript || !target) return 0;
    
    const cleanTranscript = transcript.trim().toLowerCase();
    const cleanTarget = target.trim().toLowerCase();
    
    if (cleanTranscript === cleanTarget) return 100;
    
    // Calculate similarity score
    const distance = levenshteinDistance(cleanTranscript, cleanTarget);
    const maxLength = Math.max(cleanTranscript.length, cleanTarget.length);
    return Math.max(0, 100 * (1 - distance / maxLength));
  };

  const nextWord = () => {
    if (currentWordIndex < assessmentWords[currentDifficulty].length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      const nextWord = assessmentWords[currentDifficulty][currentWordIndex + 1];
      setCurrentWord(nextWord);
      setFeedback(`Ready to practice: ${nextWord}`);
    } else if (currentDifficulty !== 'complex') {
      const nextDifficulty = currentDifficulty === 'simple' ? 'moderate' : 'complex';
      setCurrentDifficulty(nextDifficulty);
      setCurrentWordIndex(0);
      const nextWord = assessmentWords[nextDifficulty][0];
      setCurrentWord(nextWord);
      setFeedback(`Moving to ${nextDifficulty} difficulty. Ready to practice: ${nextWord}`);
    } else {
      setAssessmentStep('results');
      setFeedback('Assessment complete! Check your results below.');
    }
  };

  const generateFeedback = (scores) => {
    const feedbackMessages = [];
    
    if (scores.accuracy < 70) {
      feedbackMessages.push("Try speaking more clearly and slowly.");
    }
    if (scores.pronunciation < 70) {
      feedbackMessages.push("Focus on each sound in the word.");
    }
    if (scores.fluency < 70) {
      feedbackMessages.push("Practice saying the word smoothly without pauses.");
    }
    if (scores.accuracy >= 90) {
      feedbackMessages.push("Excellent pronunciation!");
    }

    setFeedback(feedbackMessages.join(' '));
  };

  // Utility function for word comparison
  const levenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  };

  const calculateAverageScore = () => {
    if (Object.keys(results).length === 0) return 0;
    
    const scores = Object.values(results).map(result => 
      (result.accuracy + result.pronunciation + result.fluency) / 3
    );
    
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const renderInstructions = () => (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h3 className="text-xl font-semibold mb-6">How the Assessment Works</h3>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mic className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium mb-1">1. Recording</h4>
            <p className="text-gray-600">Click "Start Recording" when you're ready to speak each word.</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Volume2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium mb-1">2. Speaking</h4>
            <p className="text-gray-600">Clearly pronounce the word shown on screen.</p>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <SkipForward className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium mb-1">3. Progress</h4>
            <p className="text-gray-600">Click "Next Word" after completing each word.</p>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={startAssessment}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
          >
            <Mic className="h-5 w-5" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderRecording = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">
            Current Word: <span className="text-blue-600">{currentWord}</span>
          </h3>
          <p className="text-gray-600">
            Difficulty Level: <span className="capitalize">{currentDifficulty}</span>
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {isRecording ? (
              <div className="flex items-center space-x-2">
                <div className="animate-pulse">
                  <Mic className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-red-600">Recording...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Mic className="h-6 w-6 text-gray-400" />
                <span className="text-gray-600">Ready to record</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isRecording ? (
              <button
                onClick={stopRecording}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Stop Recording</span>
              </button>
            ) : (
              <button
                onClick={startRecording}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Mic className="h-4 w-4" />
                <span>Start Recording</span>
              </button>
            )}

            <button
              onClick={nextWord}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              disabled={isRecording}
            >
              <SkipForward className="h-4 w-4" />
              <span>Next Word</span>
            </button>
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <p className="text-blue-700">{feedback}</p>
          </div>
        )}
      </div>

      {Object.keys(results).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Current Results</h3>
          
          <div className="space-y-4">
            {Object.entries(results).map(([word, scores]) => (
              <div key={word} className="border-b pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Word: {word}</h4>
                  {scores.accuracy >= 80 && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm">Great pronunciation!</span>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(scores).map(([metric, value]) => (
                    <div key={metric} className="relative group">
                      <div className="text-sm text-gray-600 capitalize mb-1 flex items-center">
                        {metric}
                        <div className="relative">
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                            {metricDescriptions[metric]}
                          </div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full ${
                            value >= 80 ? 'bg-green-500' :
                            value >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 mt-1">
                        {value.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-xl font-semibold mb-6">Assessment Complete!</h3>
      
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {calculateAverageScore().toFixed(1)}%
          </div>
          <p className="text-gray-600">Overall Score</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3 text-green-600 flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Strengths</span>
            </h4>
            <ul className="space-y-2">
              {Object.entries(results)
                .filter(([_, scores]) => scores.accuracy >= 80)
                .map(([word]) => (
                  <li key={word} className="text-gray-600">
                    ✓ Excellent pronunciation of "{word}"
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3 text-orange-600 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span>Areas for Improvement</span>
            </h4>
            <ul className="space-y-2">
              {Object.entries(results)
                .filter(([_, scores]) => scores.accuracy < 60)
                .map(([word]) => (
                  <li key={word} className="text-gray-600">
                    • Practice pronouncing "{word}"
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              setAssessmentStep('instructions');
              setResults({});
              setCurrentWordIndex(0);
              setCurrentDifficulty('simple');
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Automated Speech Assessment</h2>

      {assessmentStep === 'instructions' && renderInstructions()}
      {assessmentStep === 'recording' && renderRecording()}
      {assessmentStep === 'results' && renderResults()}
    </div>
  );
};

export default AutomatedSpeechAssessment; 