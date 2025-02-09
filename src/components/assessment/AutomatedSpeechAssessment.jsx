import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, SkipForward, Volume2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { generateLessonPlan } from '../../utils/lessonPlanGenerator';
import { saveAssessmentResults, getUserData } from '../../utils/userDataStorage';
import { getWordImage } from '../../utils/imageGeneration';

const AutomatedSpeechAssessment = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [results, setResults] = useState({});
  const [feedback, setFeedback] = useState('');
  const recognitionRef = useRef(null);
  const [assessmentStep, setAssessmentStep] = useState('instructions');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState('simple');
  const [userLiteracyStatus, setUserLiteracyStatus] = useState(null);
  const [wordImages, setWordImages] = useState({});
  const [imageLoading, setImageLoading] = useState(false);

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

  // Load user literacy status
  useEffect(() => {
    const userData = getUserData(localStorage.getItem('currentUser'));
    if (userData) {
      setUserLiteracyStatus({
        canRead: userData.canRead,
        preferredLearningStyle: userData.preferredLearningStyle || [],
        age: userData.age || null
      });

      // Adjust word difficulty based on age
      if (userData.age) {
        if (userData.age < 7) {
          setAssessmentWords({
            simple: ['cat', 'dog', 'ball', 'book', 'hat'],
            moderate: ['apple', 'bird', 'fish', 'tree', 'star'],
            complex: ['rabbit', 'flower', 'pencil', 'table', 'house']
          });
        } else if (userData.age < 10) {
          setAssessmentWords({
            simple: ['cat', 'dog', 'ball', 'book', 'house'],
            moderate: ['elephant', 'butterfly', 'banana', 'umbrella', 'turtle'],
            complex: ['refrigerator', 'helicopter', 'rhinoceros', 'octopus', 'dinosaur']
          });
        }
        // Default words for age 10+ remain unchanged
      }
    }
  }, []);

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    window.speechSynthesis.speak(utterance);
  };

  // Add audio instruction function
  const speakInstruction = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const startAssessment = () => {
    try {
      setAssessmentStep('recording');
      const word = assessmentWords[currentDifficulty][currentWordIndex];
      setCurrentWord(word);
      loadWordImage(word);
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
      
      // Auto-advance after a short delay
      setTimeout(() => {
        nextWord();
      }, 2000);
      
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

  useEffect(() => {
    // Preload images for words
    const preloadImage = (word) => {
      const img = new Image();
      img.src = `/word-images/${word}.svg`;
    };
    
    // Preload cat image and other common words
    ['cat', 'dog', 'bird'].forEach(preloadImage);
  }, []);

  const loadWordImage = async (word) => {
    try {
      setImageLoading(true);
      const imageData = await getWordImage(word);
      if (imageData) {
        setWordImages(prev => ({
          ...prev,
          [word]: imageData
        }));
      }
    } catch (error) {
      console.error('Error loading image:', error);
    } finally {
      setImageLoading(false);
    }
  };

  const renderWordImage = () => {
    if (!currentWord) return null;
    
    if (imageLoading) {
      return <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>;
    }

    const imageData = wordImages[currentWord];
    if (!imageData) return null;

    return (
      <div className="flex justify-center mb-4">
        <img 
          src={imageData} 
          alt={`Visual representation of ${currentWord}`}
          className="max-h-48 object-contain rounded-lg shadow-md"
        />
      </div>
    );
  };

  // Add helper functions for emoji mapping
  const getEmojiForWord = (word) => {
    const emojiMap = {
      cat: '🐱',
      dog: '🐕',
      ball: '⚽',
      book: '📚',
      house: '🏠',
      elephant: '🐘',
      butterfly: '🦋',
      banana: '🍌',
      umbrella: '☂️',
      turtle: '🐢',
      refrigerator: '🗄️',
      helicopter: '🚁',
      rhinoceros: '🦏',
      octopus: '🐙',
      dinosaur: '🦖',
      apple: '🍎',
      bird: '🐦',
      fish: '🐟',
      tree: '🌳',
      star: '⭐',
      rabbit: '🐰',
      flower: '🌸',
      pencil: '✏️',
      table: '🪑'
    };
    return emojiMap[word.toLowerCase()] || '❓';
  };

  const getEmojiHexCode = (word) => {
    // Map words to OpenMoji hex codes
    const hexMap = {
      cat: '1F408',
      dog: '1F415',
      ball: '26BD',
      book: '1F4DA',
      house: '1F3E0',
      elephant: '1F418',
      butterfly: '1F98B',
      banana: '1F34C',
      umbrella: '2602',
      turtle: '1F422',
      refrigerator: '1F5C4',
      helicopter: '1F681',
      rhinoceros: '1F98F',
      octopus: '1F419',
      dinosaur: '1F996',
      apple: '1F34E',
      bird: '1F426',
      fish: '1F41F',
      tree: '1F333',
      star: '2B50',
      rabbit: '1F430',
      flower: '1F338',
      pencil: '270F',
      table: '1FA91'
    };
    return hexMap[word.toLowerCase()] || '2753';
  };

  const renderInstructions = () => (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold">How the Assessment Works</h3>
        <button
          onClick={() => speakInstruction("Welcome to the speech assessment. I will guide you through each step. Click the speaker icon anytime to hear instructions again.")}
          className="p-2 text-blue-600 hover:text-blue-700"
          aria-label="Listen to instructions"
        >
          <Volume2 className="h-6 w-6" />
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Mic className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">1. Recording</h4>
            <p className="text-gray-600">Click the microphone to start speaking</p>
            <button
              onClick={() => speakInstruction("First, click the microphone button when you're ready to speak.")}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <Volume2 className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">2. Speaking</h4>
            <p className="text-gray-600">Say the word shown in the picture</p>
            <button
              onClick={() => speakInstruction("Next, say the word shown in the picture clearly.")}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <SkipForward className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium mb-1">3. Next Word</h4>
            <p className="text-gray-600">Click the arrow for the next word</p>
            <button
              onClick={() => speakInstruction("Finally, click the arrow button to move to the next word.")}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              speakInstruction("Let's begin the assessment!");
              startAssessment();
            }}
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
        <div className="flex flex-col items-center mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Say this word: <span className="text-blue-600">{currentWord}</span>
          </h3>
          {renderWordImage()}
        </div>

        <div className="flex items-center justify-center space-x-4">
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
            >
              <Square className="h-5 w-5" />
              <span>Stop Recording</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Mic className="h-5 w-5" />
              <span>Start Recording</span>
            </button>
          )}
        </div>

        {feedback && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-blue-700">{feedback}</p>
              <button
                onClick={() => speakInstruction(feedback)}
                className="mt-2 text-blue-600 hover:text-blue-700"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
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

  const renderResults = () => {
    const averageScore = calculateAverageScore();
    const lessonPlan = generateLessonPlan('user1', {
      accuracy: averageScore,
      pronunciation: averageScore,
      fluency: averageScore
    }, Object.entries(results).map(([word, scores]) => ({
      text: word,
      ...scores
    })));

    return (
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6">Assessment Complete!</h3>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {averageScore.toFixed(1)}%
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
          </div>
        </div>

        {/* Immediate Lesson Plan */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">Your Personalized Lesson Plan</h3>
          <p className="text-gray-600 mb-6">Based on your assessment results, we've created a customized plan to help you improve.</p>

          <div className="space-y-6">
            {/* Today's Exercises */}
            <div>
              <h4 className="font-medium text-lg mb-4">Today's Exercises</h4>
              <div className="space-y-4">
                {lessonPlan.weeklyPlan[0].exercises.map((exercise, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{exercise.type}</h5>
                        <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                        {exercise.targetWords && (
                          <p className="text-sm text-blue-600 mt-2">
                            Focus words: {exercise.targetWords.join(', ')}
                          </p>
                        )}
                        {exercise.problemArea && (
                          <p className="text-sm text-orange-600 mt-1">
                            {exercise.problemArea}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span className="text-sm">{exercise.duration} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Recommendations</h4>
              <ul className="space-y-2">
                {lessonPlan.notes.map((note, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button
                onClick={() => {
                  setAssessmentStep('instructions');
                  setResults({});
                  setCurrentWordIndex(0);
                  setCurrentDifficulty('simple');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Start New Assessment
              </button>

              <button
                onClick={() => {
                  // Save assessment results and redirect to full lesson plan
                  saveAssessmentResults('user1', {
                    accuracy: averageScore,
                    pronunciation: averageScore,
                    fluency: averageScore,
                    attemptedWords: Object.entries(results).map(([word, scores]) => ({
                      text: word,
                      ...scores
                    }))
                  });
                  window.location.hash = '#lessons';
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                View Full Weekly Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (currentWord) {
      loadWordImage(currentWord);
    }
  }, [currentWord]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Automated Speech Assessment</h2>

      {assessmentStep === 'instructions' ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Instructions</h3>
          <p className="mb-4">
            You will be shown words to pronounce. Click the microphone button and speak the word clearly.
            The system will analyze your pronunciation and provide feedback.
          </p>
          <button
            onClick={startAssessment}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Start Assessment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">
            Say this word: <span className="text-blue-600">{currentWord}</span>
          </h3>
          
          {/* Word image display */}
          {renderWordImage()}
          
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={() => speakWord(currentWord)}
              className="bg-gray-100 p-3 rounded-full hover:bg-gray-200"
              title="Listen to word"
            >
              <Volume2 className="h-6 w-6" />
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full ${
                isRecording 
                  ? 'bg-red-100 hover:bg-red-200' 
                  : 'bg-blue-100 hover:bg-blue-200'
              }`}
              title={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <Square className="h-6 w-6 text-red-600" /> : <Mic className="h-6 w-6 text-blue-600" />}
            </button>
          </div>

          {feedback && (
            <div className="text-center text-gray-700 mb-4">
              {feedback}
            </div>
          )}
        </div>
      )}

      {/* Results display */}
      {Object.keys(results).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">Results</h3>
          {Object.entries(results).map(([word, scores]) => (
            <div key={word} className="mb-4">
              <h4 className="font-semibold mb-2">{word}</h4>
              {Object.entries(scores).map(([metric, score]) => (
                <div key={metric} className="flex items-center mb-2">
                  <span className="w-32 text-gray-600">{metric}:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 rounded-full h-4"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <span className="ml-2">{Math.round(score)}%</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomatedSpeechAssessment; 