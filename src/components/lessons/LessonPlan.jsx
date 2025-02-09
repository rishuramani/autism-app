import React, { useState, useEffect } from 'react';
import { getLatestAssessment } from '../../utils/userDataStorage';
import { generateLessonPlan } from '../../utils/lessonPlanGenerator';
import { Calendar, Clock, CheckCircle2, AlertCircle, Volume2, Play, Book, Mic, Video, X } from 'lucide-react';
import { getUserData } from '../../utils/userDataStorage';
import WordMatchingGame from '../activities/WordMatchingGame';
import PronunciationGame from '../activities/PronunciationGame';
import SentenceBuildingGame from '../activities/SentenceBuildingGame';

const LessonPlan = ({ userId }) => {
  const [lessonPlan, setLessonPlan] = useState(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [completedExercises, setCompletedExercises] = useState({});
  const [userLiteracyStatus, setUserLiteracyStatus] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeActivity, setActiveActivity] = useState(null);
  const [completedActivities, setCompletedActivities] = useState({});
  const [activeExercise, setActiveExercise] = useState(null);
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    const loadLessonPlan = () => {
      const assessment = getLatestAssessment(userId);
      if (assessment) {
        const plan = generateLessonPlan(userId, assessment.results);
        setLessonPlan(plan);
      }
    };

    const userData = getUserData(userId);
    if (userData) {
      setUserLiteracyStatus({
        canRead: userData.canRead,
        preferredLearningStyle: userData.preferredLearningStyle || []
      });
    }

    loadLessonPlan();
  }, [userId]);

  const toggleExerciseCompletion = (dayIndex, exerciseIndex) => {
    const key = `${dayIndex}-${exerciseIndex}`;
    setCompletedExercises(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleActivityComplete = (activityId, results) => {
    setCompletedActivities(prev => ({
      ...prev,
      [activityId]: {
        completed: true,
        score: results.score,
        timestamp: new Date().toISOString()
      }
    }));
    
    // Provide audio feedback
    if (results.score === results.totalWords || results.score === results.totalSentences) {
      speakText('Excellent work! You\'ve completed this activity perfectly!');
    } else {
      speakText('Good job! You\'ve completed this activity.');
    }
    
    // Close activity after delay
    setTimeout(() => {
      setActiveActivity(null);
    }, 2000);
  };

  const handleExerciseClick = (exercise) => {
    setActiveExercise(exercise);
    // Show appropriate activity component based on exercise type
    switch (exercise.type) {
      case 'sound-matching':
        setActiveActivity({
          type: 'matching',
          words: exercise.focusWords,
          title: exercise.description
        });
        break;
      case 'sound-isolation':
        setActiveActivity({
          type: 'pronunciation',
          words: exercise.focusWords,
          title: exercise.description
        });
        break;
      default:
        console.log('Exercise type not implemented:', exercise.type);
    }
  };

  const renderExerciseCard = (exercise, index) => (
    <div
      key={index}
      onClick={() => handleExerciseClick(exercise)}
      className="p-4 border rounded-lg transition-shadow hover:shadow-md cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{exercise.type}</h4>
          <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
          {exercise.focusWords && (
            <p className="text-sm text-blue-600 mt-2">
              Focus words: {exercise.focusWords.join(', ')}
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
          <span>{exercise.duration} min</span>
        </div>
      </div>
    </div>
  );

  const handleGenerateReport = async () => {
    if (!lessonPlan) return;
    
    // Generate report data
    const reportData = {
      startDate: lessonPlan.startDate,
      completedExercises: Object.keys(completedExercises).length,
      totalExercises: lessonPlan.weeklyPlan.reduce(
        (total, day) => total + day.exercises.length,
        0
      ),
      recommendations: lessonPlan.notes,
      progress: calculateProgress()
    };

    // TODO: Generate PDF report
    console.log('Generating report with data:', reportData);
    
    // Show success message
    setFeedback({
      type: 'success',
      message: 'Assessment report generated successfully!'
    });
  };

  const handleViewWeeklyPlan = () => {
    setShowFullPlan(true);
  };

  const renderActivityContent = (activity) => {
    switch (activity.type) {
      case 'matching':
        return (
          <WordMatchingGame
            words={activity.words}
            onComplete={(results) => handleActivityComplete(activity.id, results)}
          />
        );
      case 'pronunciation':
        return (
          <PronunciationGame
            words={activity.words}
            onComplete={(results) => handleActivityComplete(activity.id, results)}
          />
        );
      case 'sentence':
        return (
          <SentenceBuildingGame
            sentences={activity.sentences}
            onComplete={(results) => handleActivityComplete(activity.id, results)}
          />
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'reading':
        return <Book className="h-6 w-6 text-blue-600" />;
      case 'speaking':
        return <Mic className="h-6 w-6 text-blue-600" />;
      case 'video':
        return <Video className="h-6 w-6 text-blue-600" />;
      case 'matching':
        return <Book className="h-6 w-6 text-blue-600" />;
      case 'pronunciation':
        return <Mic className="h-6 w-6 text-blue-600" />;
      case 'sentence':
        return <Video className="h-6 w-6 text-blue-600" />;
      default:
        return null;
    }
  };

  if (!lessonPlan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No lesson plan available yet. Please complete the assessment first.</p>
        <button
          onClick={() => speakText("No lesson plan available yet. Please complete the assessment first.")}
          className="mt-2 text-blue-600 hover:text-blue-700"
        >
          <Volume2 className="h-5 w-5 mx-auto" />
        </button>
      </div>
    );
  }

  const currentDayPlan = lessonPlan.weeklyPlan[selectedDay - 1];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Weekly Lesson Plan</h2>
          <button
            onClick={() => speakText("Here is your weekly lesson plan. Each activity is designed to help improve your speech and communication skills.")}
            className="text-blue-600 hover:text-blue-700"
          >
            <Volume2 className="h-6 w-6" />
          </button>
        </div>
        
        {userLiteracyStatus && !userLiteracyStatus.canRead && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700">Audio instructions available for all activities</p>
            <button
              onClick={() => speakText("Audio instructions are available for all activities. Click the speaker icon to hear any text read aloud.")}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              <Volume2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-5 w-5 mr-2" />
          <span>Week starting {new Date(lessonPlan.startDate).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Day Selection */}
      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {lessonPlan.weeklyPlan.map((day, index) => (
          <button
            key={day.day}
            onClick={() => setSelectedDay(day.day)}
            className={`px-4 py-2 rounded-lg flex-shrink-0 ${
              selectedDay === day.day
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Day {day.day}
          </button>
        ))}
      </div>

      {/* Daily Exercises */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Day {selectedDay} Exercises</h3>
            <div className="flex items-center text-gray-600">
              <Clock className="h-5 w-5 mr-2" />
              <span>{currentDayPlan.totalDuration} minutes</span>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {currentDayPlan.exercises.map((exercise, index) => renderExerciseCard(exercise, index))}
        </div>
      </div>

      {/* Recommendations */}
      {lessonPlan.notes.length > 0 && (
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <ul className="space-y-2">
            {lessonPlan.notes.map((note, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lessonPlan.activities && lessonPlan.activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {lessonPlan.activities.map((activity, index) => (
            <div
              key={activity.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
                  <button
                    onClick={() => speakText(activity.title)}
                    className="text-blue-600 hover:text-blue-700"
                    aria-label="Listen to title"
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                </div>
                {getActivityIcon(activity.type)}
              </div>

              <div className="space-y-4">
                <p className="text-gray-600">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Difficulty: {activity.difficulty}
                  </span>
                  {completedActivities[activity.id]?.completed && (
                    <span className="text-sm text-green-600">
                      Score: {completedActivities[activity.id].score}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setActiveActivity(activity)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>{completedActivities[activity.id]?.completed ? 'Try Again' : 'Start Activity'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{activeLesson.title}</h3>
              <button
                onClick={() => setActiveLesson(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            {/* Activity content will be rendered here */}
            <div className="space-y-4">
              {/* Add specific activity components based on type */}
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {activeActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">{activeActivity.title}</h3>
              <button
                onClick={() => setActiveActivity(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {renderActivityContent(activeActivity)}
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={handleViewWeeklyPlan}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Full Weekly Plan
        </button>
        <button
          onClick={handleGenerateReport}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Generate Assessment Report
        </button>
      </div>

      {/* Full Weekly Plan Modal */}
      {showFullPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Full Weekly Plan</h3>
              <button
                onClick={() => setShowFullPlan(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              {lessonPlan.weeklyPlan.map((day, index) => (
                <div key={index} className="mb-8">
                  <h4 className="text-lg font-semibold mb-4">Day {day.day}</h4>
                  <div className="space-y-4">
                    {day.exercises.map((exercise, exerciseIndex) => 
                      renderExerciseCard(exercise, exerciseIndex)
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonPlan; 