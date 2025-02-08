import React, { useState } from 'react';
import VideoRecorder from '../VideoRecorder';

const soundCategories = {
  stops: {
    name: 'Stops',
    sounds: [
      { phoneme: 'p', words: { initial: ['pig', 'pen', 'pat'], medial: ['happy', 'apple', 'paper'], final: ['hop', 'cup', 'map'] } },
      { phoneme: 'b', words: { initial: ['boy', 'ball', 'bed'], medial: ['baby', 'rabbit', 'rubber'], final: ['web', 'tub', 'crab'] } },
      { phoneme: 't', words: { initial: ['top', 'tie', 'ten'], medial: ['water', 'letter', 'butter'], final: ['cat', 'hat', 'boat'] } },
      { phoneme: 'd', words: { initial: ['dog', 'day', 'door'], medial: ['ladder', 'pudding', 'reading'], final: ['bed', 'road', 'food'] } },
      { phoneme: 'k', words: { initial: ['cat', 'key', 'cup'], medial: ['cookie', 'monkey', 'chicken'], final: ['book', 'cake', 'duck'] } },
      { phoneme: 'g', words: { initial: ['go', 'girl', 'game'], medial: ['tiger', 'wagon', 'sugar'], final: ['dog', 'bag', 'pig'] } }
    ]
  },
  fricatives: {
    name: 'Fricatives',
    sounds: [
      { phoneme: 'f', words: { initial: ['fish', 'foot', 'fan'], medial: ['coffee', 'muffin', 'waffle'], final: ['leaf', 'roof', 'calf'] } },
      { phoneme: 'v', words: { initial: ['van', 'voice', 'vest'], medial: ['seven', 'over', 'moving'], final: ['five', 'love', 'give'] } },
      { phoneme: 's', words: { initial: ['sun', 'see', 'sock'], medial: ['sister', 'passing', 'messy'], final: ['bus', 'house', 'kiss'] } },
      { phoneme: 'z', words: { initial: ['zoo', 'zip', 'zero'], medial: ['lazy', 'busy', 'fuzzy'], final: ['buzz', 'cheese', 'nose'] } },
      { phoneme: 'ʃ', words: { initial: ['shoe', 'ship', 'shop'], medial: ['washing', 'fishing', 'dishes'], final: ['fish', 'brush', 'wash'] } },
      { phoneme: 'ʒ', words: { initial: [''], medial: ['measure', 'treasure', 'pleasure'], final: ['garage', 'beige', 'rouge'] } }
    ]
  },
  affricates: {
    name: 'Affricates',
    sounds: [
      { phoneme: 'tʃ', words: { initial: ['chair', 'cheese', 'chin'], medial: ['teacher', 'catching', 'matches'], final: ['beach', 'watch', 'catch'] } },
      { phoneme: 'dʒ', words: { initial: ['jump', 'juice', 'jam'], medial: ['magic', 'pajamas', 'engine'], final: ['bridge', 'cage', 'badge'] } }
    ]
  },
  nasals: {
    name: 'Nasals',
    sounds: [
      { phoneme: 'm', words: { initial: ['mom', 'man', 'mouse'], medial: ['hammer', 'lemon', 'summer'], final: ['room', 'time', 'game'] } },
      { phoneme: 'n', words: { initial: ['no', 'nose', 'night'], medial: ['funny', 'sunny', 'money'], final: ['rain', 'sun', 'moon'] } },
      { phoneme: 'ŋ', words: { initial: [''], medial: ['finger', 'singing', 'ringing'], final: ['ring', 'king', 'song'] } }
    ]
  },
  liquids: {
    name: 'Liquids',
    sounds: [
      { phoneme: 'l', words: { initial: ['lip', 'leg', 'leaf'], medial: ['yellow', 'color', 'balloon'], final: ['ball', 'hill', 'pull'] } },
      { phoneme: 'r', words: { initial: ['red', 'run', 'rain'], medial: ['sorry', 'carrot', 'arrow'], final: ['car', 'door', 'bear'] } }
    ]
  },
  glides: {
    name: 'Glides',
    sounds: [
      { phoneme: 'w', words: { initial: ['walk', 'water', 'wind'], medial: ['away', 'always', 'flower'], final: [''] } },
      { phoneme: 'j', words: { initial: ['yes', 'you', 'yellow'], medial: ['canyon', 'lawyer', 'beyond'], final: [''] } }
    ]
  }
};

const ArticulationAssessment = () => {
  const [selectedSound, setSelectedSound] = useState(null);
  const [assessments, setAssessments] = useState({});
  const [notes, setNotes] = useState({});
  const [isRecording, setIsRecording] = useState(false);

  const handleAssessment = (phoneme, position, word, score) => {
    setAssessments(prev => ({
      ...prev,
      [phoneme]: {
        ...prev[phoneme],
        [position]: {
          ...(prev[phoneme]?.[position] || {}),
          [word]: score
        }
      }
    }));
  };

  const handleNotes = (phoneme, note) => {
    setNotes(prev => ({
      ...prev,
      [phoneme]: note
    }));
  };

  const calculatePhonemeScore = (phoneme) => {
    const phonemeAssessments = assessments[phoneme];
    if (!phonemeAssessments) return null;

    let total = 0;
    let count = 0;

    Object.values(phonemeAssessments).forEach(positionScores => {
      Object.values(positionScores).forEach(score => {
        if (score) {
          total += score;
          count++;
        }
      });
    });

    return count ? Math.round((total / count) * 100) : null;
  };

  const renderWordAssessment = (phoneme, position, word) => (
    <div key={word} className="flex items-center space-x-2 mb-2">
      <span className="w-24 font-medium">{word}</span>
      <div className="space-x-2">
        {[0, 1, 2].map(score => (
          <button
            key={score}
            onClick={() => handleAssessment(phoneme, position, word, score)}
            className={`px-3 py-1 rounded ${
              assessments[phoneme]?.[position]?.[word] === score
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Articulation Assessment</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {Object.entries(soundCategories).map(([category, { name, sounds }]) => (
            <div key={category} className="border rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">{name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sounds.map(({ phoneme }) => (
                  <button
                    key={phoneme}
                    onClick={() => setSelectedSound(phoneme)}
                    className={`p-2 rounded ${
                      selectedSound === phoneme
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    /{phoneme}/
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border rounded-lg p-4">
          {selectedSound && (
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Assessment for /{selectedSound}/
                {calculatePhonemeScore(selectedSound) !== null && (
                  <span className="ml-2 text-sm text-gray-600">
                    Score: {calculatePhonemeScore(selectedSound)}%
                  </span>
                )}
              </h3>

              <div className="mb-6">
                <VideoRecorder
                  isRecording={isRecording}
                  onRecordingChange={setIsRecording}
                  filename={`articulation_${selectedSound}_${Date.now()}`}
                />
              </div>

              {Object.entries(soundCategories)
                .find(([_, { sounds }]) => 
                  sounds.some(s => s.phoneme === selectedSound)
                )?.[1].sounds
                .find(s => s.phoneme === selectedSound)
                ?.words && (
                <div className="space-y-6">
                  {['initial', 'medial', 'final'].map(position => {
                    const words = soundCategories[
                      Object.keys(soundCategories).find(cat =>
                        soundCategories[cat].sounds.some(s => s.phoneme === selectedSound)
                      )
                    ].sounds.find(s => s.phoneme === selectedSound).words[position];

                    return words.length > 0 && (
                      <div key={position}>
                        <h4 className="font-medium mb-2 capitalize">{position} Position</h4>
                        {words.map(word => renderWordAssessment(selectedSound, position, word))}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-medium mb-2">Clinical Notes</h4>
                <textarea
                  value={notes[selectedSound] || ''}
                  onChange={(e) => handleNotes(selectedSound, e.target.value)}
                  className="w-full h-32 p-2 border rounded"
                  placeholder="Enter clinical observations..."
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArticulationAssessment; 