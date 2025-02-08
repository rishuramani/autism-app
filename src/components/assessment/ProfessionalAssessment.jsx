import React, { useState } from 'react';
import VideoRecorder from './VideoRecorder';

// GFTA-3 inspired assessment structure
const assessmentAreas = {
  soundsInWords: {
    initial: [
      { sound: 'p', words: ['pig', 'penguin', 'piano'] },
      { sound: 'b', words: ['ball', 'banana', 'book'] },
      { sound: 't', words: ['table', 'tooth', 'toy'] },
      { sound: 'd', words: ['dog', 'door', 'duck'] },
      { sound: 'k', words: ['cat', 'cup', 'key'] },
      { sound: 'g', words: ['girl', 'game', 'gift'] }
    ],
    medial: [
      { sound: 'p', words: ['happy', 'jumping', 'sleeping'] },
      { sound: 'b', words: ['rabbit', 'robot', 'baby'] },
      { sound: 't', words: ['water', 'butter', 'sitting'] },
      { sound: 'd', words: ['ladder', 'reading', 'hiding'] }
    ],
    final: [
      { sound: 'p', words: ['soup', 'jump', 'help'] },
      { sound: 'b', words: ['web', 'crab', 'tube'] },
      { sound: 't', words: ['cat', 'boat', 'hat'] },
      { sound: 'd', words: ['bed', 'food', 'road'] }
    ]
  },
  blends: [
    { blend: 'st', words: ['star', 'stop', 'stick'] },
    { blend: 'bl', words: ['blue', 'black', 'block'] },
    { blend: 'kr', words: ['cry', 'crown', 'crab'] },
    { blend: 'fl', words: ['fly', 'flower', 'flag'] }
  ],
  phonologicalPatterns: [
    'Fronting',
    'Backing',
    'Stopping',
    'Final Consonant Deletion',
    'Cluster Reduction'
  ]
};

const ProfessionalAssessment = () => {
  const [currentSection, setCurrentSection] = useState('initial');
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [assessmentData, setAssessmentData] = useState({});
  const [observations, setObservations] = useState({
    articulation: {},
    phonology: {},
    fluency: {},
    voice: {}
  });

  const handleObservation = (category, key, value) => {
    setObservations(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderArticulationAssessment = () => {
    const currentSound = assessmentAreas.soundsInWords[currentSection][currentSoundIndex];

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4">
            Sound Assessment: /{currentSound.sound}/ in {currentSection} position
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {currentSound.words.map((word, index) => (
                <div key={word} className="p-4 border rounded-lg">
                  <p className="text-lg font-medium mb-2">{word}</p>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={assessmentData[`${currentSound.sound}_${word}`]?.correct || false}
                        onChange={(e) => {
                          setAssessmentData(prev => ({
                            ...prev,
                            [`${currentSound.sound}_${word}`]: {
                              ...prev[`${currentSound.sound}_${word}`],
                              correct: e.target.checked
                            }
                          }));
                        }}
                        className="mr-2"
                      />
                      Correct Production
                    </label>
                    
                    <input
                      type="text"
                      placeholder="Transcription"
                      value={assessmentData[`${currentSound.sound}_${word}`]?.transcription || ''}
                      onChange={(e) => {
                        setAssessmentData(prev => ({
                          ...prev,
                          [`${currentSound.sound}_${word}`]: {
                            ...prev[`${currentSound.sound}_${word}`],
                            transcription: e.target.value
                          }
                        }));
                      }}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h4 className="font-medium mb-2">Clinical Observations</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Placement</label>
                  <select
                    value={observations.articulation[`${currentSound.sound}_placement`] || ''}
                    onChange={(e) => handleObservation('articulation', `${currentSound.sound}_placement`, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select placement</option>
                    <option value="correct">Correct</option>
                    <option value="anterior">Too Anterior</option>
                    <option value="posterior">Too Posterior</option>
                    <option value="lateral">Lateralized</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Manner</label>
                  <select
                    value={observations.articulation[`${currentSound.sound}_manner`] || ''}
                    onChange={(e) => handleObservation('articulation', `${currentSound.sound}_manner`, e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select manner</option>
                    <option value="correct">Correct</option>
                    <option value="stopped">Stopped</option>
                    <option value="fricated">Fricated</option>
                    <option value="distorted">Distorted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea
                    value={observations.articulation[`${currentSound.sound}_notes`] || ''}
                    onChange={(e) => handleObservation('articulation', `${currentSound.sound}_notes`, e.target.value)}
                    className="w-full p-2 border rounded"
                    rows={3}
                    placeholder="Additional observations..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <VideoRecorder onRecordingComplete={(blob) => {
          // Store recording with assessment data
          setAssessmentData(prev => ({
            ...prev,
            [`${currentSound.sound}_recording`]: blob
          }));
        }} />

        <div className="flex justify-between mt-6">
          <button
            onClick={() => {
              if (currentSoundIndex > 0) {
                setCurrentSoundIndex(prev => prev - 1);
              } else if (currentSection === 'medial') {
                setCurrentSection('initial');
                setCurrentSoundIndex(assessmentAreas.soundsInWords.initial.length - 1);
              } else if (currentSection === 'final') {
                setCurrentSection('medial');
                setCurrentSoundIndex(assessmentAreas.soundsInWords.medial.length - 1);
              }
            }}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={currentSoundIndex === 0 && currentSection === 'initial'}
          >
            Previous Sound
          </button>

          <button
            onClick={() => {
              const currentSectionSounds = assessmentAreas.soundsInWords[currentSection];
              if (currentSoundIndex < currentSectionSounds.length - 1) {
                setCurrentSoundIndex(prev => prev + 1);
              } else if (currentSection === 'initial') {
                setCurrentSection('medial');
                setCurrentSoundIndex(0);
              } else if (currentSection === 'medial') {
                setCurrentSection('final');
                setCurrentSoundIndex(0);
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={currentSoundIndex === assessmentAreas.soundsInWords[currentSection].length - 1 && currentSection === 'final'}
          >
            Next Sound
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Professional Speech Assessment</h2>
      {renderArticulationAssessment()}
    </div>
  );
};

export default ProfessionalAssessment; 