// Phoneme extraction and analysis
export const extractPhonemes = (text) => {
  // Basic English phoneme mapping
  const phonemeMap = {
    a: 'æ', // as in "cat"
    e: 'ɛ', // as in "bed"
    i: 'ɪ', // as in "bit"
    o: 'ɒ', // as in "hot"
    u: 'ʌ', // as in "but"
    th: 'θ', // as in "thin"
    sh: 'ʃ', // as in "ship"
    ch: 'tʃ', // as in "chip"
    ng: 'ŋ', // as in "sing"
    // Add more mappings as needed
  };

  let phonemes = [];
  let i = 0;
  
  while (i < text.length) {
    let found = false;
    
    // Check for two-character phonemes first
    if (i < text.length - 1) {
      const twoChars = text.substr(i, 2);
      if (phonemeMap[twoChars]) {
        phonemes.push(phonemeMap[twoChars]);
        i += 2;
        found = true;
      }
    }
    
    // If no two-character phoneme found, check single characters
    if (!found) {
      const char = text[i];
      if (phonemeMap[char]) {
        phonemes.push(phonemeMap[char]);
      } else {
        phonemes.push(char);
      }
      i++;
    }
  }
  
  return phonemes;
};

// Calculate phoneme accuracy based on expected phonemes
export const calculatePhonemesAccuracy = (phonemes, expectedPhonemes = null) => {
  if (!expectedPhonemes) {
    // If no expected phonemes provided, use basic scoring
    return Math.min(100, phonemes.length * 10);
  }

  let correctCount = 0;
  const totalPhonemes = Math.max(phonemes.length, expectedPhonemes.length);

  phonemes.forEach((phoneme, index) => {
    if (index < expectedPhonemes.length && phoneme === expectedPhonemes[index]) {
      correctCount++;
    }
  });

  return (correctCount / totalPhonemes) * 100;
};

// Speech rate analysis
export const calculateSpeechRate = (words, durationMs) => {
  const wordsPerMinute = (words.length / durationMs) * 60000;
  return wordsPerMinute;
};

export const normalizeSpeechRate = (wordsPerMinute) => {
  // Typical speech rate ranges from 120-150 words per minute
  const optimalRate = 135;
  const tolerance = 30;

  const difference = Math.abs(wordsPerMinute - optimalRate);
  const score = Math.max(0, 100 - (difference / tolerance) * 100);

  return Math.min(100, score);
};

// Pitch analysis
export const calculatePitchScore = (frequencyData) => {
  // Convert frequency data to pitch score
  const sum = frequencyData.reduce((a, b) => a + b, 0);
  const average = sum / frequencyData.length;
  
  // Normalize to 0-100 range
  return Math.min(100, (average / 255) * 100);
};

// Rhythm analysis
export const calculateRhythmScore = (frequencyData) => {
  let rhythmScore = 0;
  const chunks = splitArrayIntoChunks(frequencyData, 10);
  
  // Calculate variance between chunks to determine rhythm consistency
  const variances = chunks.map(chunk => calculateVariance(chunk));
  const averageVariance = variances.reduce((a, b) => a + b, 0) / variances.length;
  
  // Convert variance to a score (lower variance = higher score)
  rhythmScore = 100 - Math.min(100, (averageVariance / 1000) * 100);
  
  return rhythmScore;
};

// Helper functions
const splitArrayIntoChunks = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

const calculateVariance = (array) => {
  const mean = array.reduce((a, b) => a + b, 0) / array.length;
  const squareDiffs = array.map(value => Math.pow(value - mean, 2));
  return squareDiffs.reduce((a, b) => a + b, 0) / array.length;
};

// Stress pattern analysis
export const analyzeStressPatterns = (word) => {
  // Define stress patterns for common word lengths
  const stressPatterns = {
    1: ['1'],
    2: ['10', '01'],
    3: ['100', '010', '001'],
    4: ['1000', '0100', '0010', '0001']
  };

  const syllables = countSyllables(word);
  const expectedPattern = stressPatterns[syllables] || [];
  
  return {
    syllables,
    expectedPattern
  };
};

const countSyllables = (word) => {
  word = word.toLowerCase();
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
};

// Voice quality analysis
export const analyzeVoiceQuality = (audioData) => {
  // Analyze various aspects of voice quality
  const intensity = calculateIntensity(audioData);
  const stability = calculateStability(audioData);
  const clarity = calculateClarity(audioData);

  return {
    intensity,
    stability,
    clarity,
    overall: (intensity + stability + clarity) / 3
  };
};

const calculateIntensity = (audioData) => {
  const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
  return Math.min(100, (rms / 128) * 100);
};

const calculateStability = (audioData) => {
  const differences = [];
  for (let i = 1; i < audioData.length; i++) {
    differences.push(Math.abs(audioData[i] - audioData[i - 1]));
  }
  
  const averageDifference = differences.reduce((a, b) => a + b, 0) / differences.length;
  return Math.max(0, 100 - (averageDifference / 128) * 100);
};

const calculateClarity = (audioData) => {
  // Analyze signal-to-noise ratio and spectral clarity
  const maxAmplitude = Math.max(...audioData);
  const minAmplitude = Math.min(...audioData);
  const dynamicRange = maxAmplitude - minAmplitude;
  
  return Math.min(100, (dynamicRange / 255) * 100);
}; 