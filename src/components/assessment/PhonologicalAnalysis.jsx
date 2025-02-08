import React, { useState } from 'react';

const phonologicalProcesses = {
  syllableStructure: [
    {
      name: 'Final Consonant Deletion',
      description: 'Omission of final consonants',
      examples: ['cat → ca', 'dog → do', 'cup → cu'],
      age: '3;0'
    },
    {
      name: 'Cluster Reduction',
      description: 'Simplification of consonant clusters',
      examples: ['stop → top', 'play → pay', 'green → geen'],
      age: '4;0'
    },
    {
      name: 'Weak Syllable Deletion',
      description: 'Omission of unstressed syllables',
      examples: ['banana → nana', 'telephone → tefone'],
      age: '4;0'
    }
  ],
  substitution: [
    {
      name: 'Fronting',
      description: 'Replacing back sounds with front sounds',
      examples: ['key → tea', 'game → dame'],
      age: '3;6'
    },
    {
      name: 'Stopping',
      description: 'Replacing fricatives with stops',
      examples: ['sun → tun', 'fish → pit'],
      age: '3;0'
    },
    {
      name: 'Gliding',
      description: 'Replacing liquids with glides',
      examples: ['red → wed', 'light → wight'],
      age: '5;0'
    }
  ],
  assimilation: [
    {
      name: 'Velar Assimilation',
      description: 'Assimilating to velar consonants',
      examples: ['duck → guck', 'tag → kag'],
      age: '3;0'
    },
    {
      name: 'Nasal Assimilation',
      description: 'Assimilating to nasal consonants',
      examples: ['button → bunun', 'mitten → minnin'],
      age: '3;0'
    }
  ]
};

const PhonologicalAnalysis = () => {
  const [observations, setObservations] = useState({});
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [customExamples, setCustomExamples] = useState({});

  const handleObservation = (process, value) => {
    setObservations(prev => ({
      ...prev,
      [process]: value
    }));
  };

  const addCustomExample = (process, example) => {
    setCustomExamples(prev => ({
      ...prev,
      [process]: [...(prev[process] || []), example]
    }));
  };

  const renderProcessCategory = (category, processes) => (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{category}</h3>
      <div className="space-y-6">
        {processes.map(process => (
          <div
            key={process.name}
            className={`p-6 border rounded-lg transition-colors ${
              selectedProcess === process.name ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedProcess(process.name)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-medium">{process.name}</h4>
                <p className="text-sm text-gray-600">Typically resolved by age {process.age}</p>
              </div>
              <select
                value={observations[process.name] || ''}
                onChange={(e) => handleObservation(process.name, e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">Select frequency</option>
                <option value="never">Never observed</option>
                <option value="rare">Rarely observed</option>
                <option value="sometimes">Sometimes observed</option>
                <option value="frequent">Frequently observed</option>
                <option value="consistent">Consistently observed</option>
              </select>
            </div>

            <p className="text-gray-700 mb-3">{process.description}</p>

            <div className="space-y-3">
              <div>
                <h5 className="font-medium mb-2">Common Examples:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {process.examples.map(example => (
                    <li key={example} className="text-gray-600">{example}</li>
                  ))}
                </ul>
              </div>

              {customExamples[process.name]?.length > 0 && (
                <div>
                  <h5 className="font-medium mb-2">Observed Examples:</h5>
                  <ul className="list-disc list-inside space-y-1">
                    {customExamples[process.name].map((example, index) => (
                      <li key={index} className="text-gray-600">{example}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add observed example..."
                  className="flex-1 p-2 border rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      addCustomExample(process.name, e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(`input[placeholder="Add observed example..."]`);
                    if (input.value.trim()) {
                      addCustomExample(process.name, input.value.trim());
                      input.value = '';
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Phonological Process Analysis</h2>
      
      {Object.entries(phonologicalProcesses).map(([category, processes]) => (
        <div key={category}>
          {renderProcessCategory(
            category.charAt(0).toUpperCase() + category.slice(1) + ' Processes',
            processes
          )}
        </div>
      ))}

      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Summary</h3>
        <div className="space-y-4">
          {Object.entries(observations).filter(([_, value]) => value).map(([process, frequency]) => (
            <div key={process} className="flex justify-between items-center">
              <span className="font-medium">{process}</span>
              <span className="text-gray-600">{frequency}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhonologicalAnalysis; 