import React, { useState } from 'react';
import VideoRecorder from './VideoRecorder';

const assessmentTasks = [
  {
    id: 1,
    type: 'articulation',
    title: 'Initial Sounds',
    prompt: 'Please say the following words:',
    words: ['ball', 'dog', 'cat', 'sun'],
    targetSounds: ['b', 'd', 'k', 's']
  },
  {
    id: 2,
    type: 'phrases',
    title: 'Short Phrases',
    prompt: 'Please repeat these phrases:',
    phrases: [
      'big blue ball',
      'happy red dog',
      'jumping yellow cat'
    ]
  },
  {
    id: 3,
    type: 'conversation',
    title: 'Conversation',
    prompt: 'Tell me about your favorite:',
    topics: [
      'toy',
      'game',
      'food',
      'activity'
    ]
  }
];

const SpeechAssessment = () => {
  const [currentTask, setCurrentTask] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [scores, setScores] = useState({});

  const handleTaskComplete = (recordingBlob) => {
    // Here you would typically:
    // 1. Upload the recording
    // 2. Process it for speech analysis
    // 3. Update scores
    
    // For now, we'll simulate scoring
    setScores(prev => ({
      ...prev,
      [currentTask]: {
        clarity: Math.floor(Math.random() * 100),
        completion: Math.floor(Math.random() * 100),
        accuracy: Math.floor(Math.random() * 100)
      }
    }));

    if (currentTask < assessmentTasks.length - 1) {
      setCurrentTask(prev => prev + 1);
    } else {
      setAssessmentComplete(true);
    }
  };

  const renderTaskPrompt = () => {
    const task = assessmentTasks[currentTask];
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">{task.title}</h3>
        <p className="text-gray-600 mb-4">{task.prompt}</p>
        
        {task.words && (
          <div className="flex flex-wrap gap-2">
            {task.words.map((word, index) => (
              <span
                key={word}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full"
              >
                {word}
              </span>
            ))}
          </div>
        )}
        
        {task.phrases && (
          <ul className="list-disc list-inside space-y-2">
            {task.phrases.map(phrase => (
              <li key={phrase} className="text-gray-700">{phrase}</li>
            ))}
          </ul>
        )}
        
        {task.topics && (
          <ul className="list-disc list-inside space-y-2">
            {task.topics.map(topic => (
              <li key={topic} className="text-gray-700">{topic}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const overallScore = Object.values(scores).reduce((acc, curr) => {
      return {
        clarity: acc.clarity + curr.clarity,
        completion: acc.completion + curr.completion,
        accuracy: acc.accuracy + curr.accuracy
      };
    }, { clarity: 0, completion: 0, accuracy: 0 });

    const totalTasks = assessmentTasks.length;

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Assessment Results</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-lg font-medium text-gray-700">Speech Clarity</h4>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(overallScore.clarity / totalTasks)}%
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-lg font-medium text-gray-700">Task Completion</h4>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(overallScore.completion / totalTasks)}%
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="text-lg font-medium text-gray-700">Pronunciation Accuracy</h4>
            <div className="text-3xl font-bold text-blue-600">
              {Math.round(overallScore.accuracy / totalTasks)}%
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <p className="text-blue-700">
            These results provide a baseline assessment. We recommend scheduling a follow-up
            session with a speech therapist to discuss a personalized therapy plan.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Speech Assessment</h2>
        {!assessmentComplete && (
          <div className="text-sm text-gray-500">
            Task {currentTask + 1} of {assessmentTasks.length}
          </div>
        )}
      </div>

      {!assessmentComplete ? (
        <>
          {renderTaskPrompt()}
          <VideoRecorder onRecordingComplete={handleTaskComplete} />
        </>
      ) : (
        renderResults()
      )}
    </div>
  );
};

export default SpeechAssessment; 