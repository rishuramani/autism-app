// Lesson plan generator based on assessment results

const exerciseTypes = {
  articulation: {
    easy: [
      { type: 'word-repetition', duration: 10, description: 'Repeat simple words with target sound' },
      { type: 'sound-isolation', duration: 5, description: 'Practice target sound in isolation' },
      { type: 'minimal-pairs', duration: 10, description: 'Practice similar-sounding words' }
    ],
    medium: [
      { type: 'sentence-practice', duration: 15, description: 'Use target sounds in simple sentences' },
      { type: 'word-chains', duration: 10, description: 'Create chains of words with target sounds' },
      { type: 'reading-practice', duration: 10, description: 'Read short passages with target sounds' }
    ],
    hard: [
      { type: 'conversation', duration: 20, description: 'Practice in conversational speech' },
      { type: 'storytelling', duration: 15, description: 'Tell stories using target sounds' },
      { type: 'tongue-twisters', duration: 10, description: 'Practice challenging tongue twisters' }
    ]
  },
  fluency: {
    easy: [
      { type: 'breathing', duration: 5, description: 'Deep breathing exercises' },
      { type: 'slow-speech', duration: 10, description: 'Practice speaking slowly and deliberately' },
      { type: 'rhythm-practice', duration: 10, description: 'Speaking with rhythmic patterns' }
    ],
    medium: [
      { type: 'paced-reading', duration: 15, description: 'Read text at a controlled pace' },
      { type: 'delayed-auditory', duration: 10, description: 'Practice with delayed auditory feedback' },
      { type: 'stress-patterns', duration: 10, description: 'Work on speech stress patterns' }
    ],
    hard: [
      { type: 'phone-calls', duration: 15, description: 'Practice phone conversations' },
      { type: 'presentations', duration: 20, description: 'Give short presentations' },
      { type: 'debate-practice', duration: 15, description: 'Engage in structured debates' }
    ]
  },
  pronunciation: {
    easy: [
      { type: 'mirror-practice', duration: 10, description: 'Practice mouth positions using a mirror' },
      { type: 'sound-matching', duration: 10, description: 'Match sounds to pictures' },
      { type: 'syllable-tapping', duration: 5, description: 'Tap out syllables in words' }
    ],
    medium: [
      { type: 'word-stress', duration: 15, description: 'Practice word stress patterns' },
      { type: 'sound-blending', duration: 10, description: 'Blend sounds together smoothly' },
      { type: 'rhythm-matching', duration: 10, description: 'Match speech to rhythmic patterns' }
    ],
    hard: [
      { type: 'rapid-naming', duration: 15, description: 'Quick naming of objects/pictures' },
      { type: 'minimal-pairs-advanced', duration: 15, description: 'Practice subtle sound differences' },
      { type: 'prosody-practice', duration: 15, description: 'Work on intonation and expression' }
    ]
  }
};

const getDifficultyLevel = (score) => {
  if (score < 60) return 'easy';
  if (score < 80) return 'medium';
  return 'hard';
};

const generateDailyExercises = (assessmentResults, attemptedWords) => {
  const exercises = [];
  const { accuracy, pronunciation, fluency } = assessmentResults;

  // Analyze specific problem areas from attempted words
  const problemAreas = analyzeProblems(attemptedWords);
  
  // Add targeted exercises based on problem areas
  problemAreas.forEach(problem => {
    const level = getDifficultyLevel(problem.score);
    const exercisePool = exerciseTypes[problem.type][level];
    const selectedExercise = {
      ...exercisePool[Math.floor(Math.random() * exercisePool.length)],
      targetWords: problem.words,
      problemArea: problem.description
    };
    exercises.push(selectedExercise);
  });

  // Add general exercises based on overall scores
  if (pronunciation < 70) {
    const level = getDifficultyLevel(pronunciation);
    exercises.push(...exerciseTypes.pronunciation[level]);
  }
  
  if (fluency < 70) {
    const level = getDifficultyLevel(fluency);
    exercises.push(...exerciseTypes.fluency[level]);
  }

  return exercises;
};

const analyzeProblems = (attemptedWords) => {
  const problems = [];
  
  attemptedWords.forEach(word => {
    if (word.accuracy < 70) {
      problems.push({
        type: 'articulation',
        score: word.accuracy,
        words: [word.text],
        description: `Difficulty with word "${word.text}"`
      });
    }
    if (word.pronunciation < 70) {
      problems.push({
        type: 'pronunciation',
        score: word.pronunciation,
        words: [word.text],
        description: `Pronunciation issues with "${word.text}"`
      });
    }
  });

  return problems;
};

export const generateWeeklyPlan = (assessmentResults, attemptedWords) => {
  const weeklyPlan = [];
  
  // Generate exercises for each day
  for (let day = 1; day <= 7; day++) {
    const dailyExercises = generateDailyExercises(assessmentResults, attemptedWords);
    
    // Shuffle exercises to create variety while maintaining problem-focused order
    const shuffledExercises = dailyExercises.sort(() => Math.random() - 0.5);
    
    // Take first 3-4 exercises for the day
    const numberOfExercises = Math.floor(Math.random() * 2) + 3; // 3-4 exercises
    const dayPlan = shuffledExercises.slice(0, numberOfExercises);
    
    weeklyPlan.push({
      day,
      exercises: dayPlan,
      totalDuration: dayPlan.reduce((sum, exercise) => sum + exercise.duration, 0),
      focusAreas: dayPlan.map(ex => ex.problemArea).filter(Boolean)
    });
  }

  return weeklyPlan;
};

export const generateLessonPlan = (userId, assessmentResults, attemptedWords) => {
  const weeklyPlan = generateWeeklyPlan(assessmentResults, attemptedWords);
  
  // Generate activities based on assessment results
  const activities = generateActivities(assessmentResults, attemptedWords);
  
  return {
    userId,
    startDate: new Date().toISOString(),
    weeklyPlan,
    assessmentResults,
    attemptedWords,
    activities,
    totalDuration: weeklyPlan.reduce((sum, day) => sum + day.totalDuration, 0),
    recommendedFrequency: 'daily',
    notes: generateRecommendations(assessmentResults, attemptedWords)
  };
};

const generateActivities = (assessmentResults, attemptedWords) => {
  const activities = [];
  
  // Add word matching activity if there are pronunciation issues
  if (assessmentResults.pronunciation < 80) {
    activities.push({
      id: 'word-matching-1',
      type: 'matching',
      title: 'Word Recognition',
      description: 'Match words with their corresponding pictures',
      difficulty: 'beginner',
      words: attemptedWords.slice(0, 5).map(w => w.text)
    });
  }
  
  // Add pronunciation activity for challenging words
  const challengingWords = attemptedWords.filter(w => w.pronunciation < 70);
  if (challengingWords.length > 0) {
    activities.push({
      id: 'pronunciation-1',
      type: 'pronunciation',
      title: 'Pronunciation Practice',
      description: 'Practice pronouncing challenging words',
      difficulty: 'intermediate',
      words: challengingWords.slice(0, 5).map(w => w.text)
    });
  }
  
  // Add sentence building activity if fluency needs improvement
  if (assessmentResults.fluency < 80) {
    activities.push({
      id: 'sentence-1',
      type: 'sentence',
      title: 'Sentence Building',
      description: 'Create sentences using simple words',
      difficulty: 'intermediate',
      sentences: [
        { text: 'The cat is sleeping', imageUrl: '/sentence-images/sleeping-cat.png' },
        { text: 'A dog plays with ball', imageUrl: '/sentence-images/dog-ball.png' },
        { text: 'Birds fly in sky', imageUrl: '/sentence-images/birds-sky.png' }
      ]
    });
  }
  
  return activities;
};

const generateRecommendations = (assessmentResults, attemptedWords) => {
  const { accuracy, pronunciation, fluency } = assessmentResults;
  const recommendations = [];

  // Add specific word-based recommendations
  const problemWords = attemptedWords.filter(word => 
    word.accuracy < 70 || word.pronunciation < 70
  );
  
  if (problemWords.length > 0) {
    recommendations.push(
      `Focus on practicing these specific words: ${problemWords.map(w => w.text).join(', ')}`
    );
  }

  // Add general recommendations based on scores
  if (accuracy < 70) {
    recommendations.push('Focus on clear articulation of individual sounds');
  }
  if (pronunciation < 70) {
    recommendations.push('Practice mouth positioning and sound formation');
  }
  if (fluency < 70) {
    recommendations.push('Work on smooth speech transitions and breathing techniques');
  }

  return recommendations;
}; 