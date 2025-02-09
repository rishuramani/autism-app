import React, { useState } from 'react';
import { Volume2 } from 'lucide-react';

const LiteracyCheck = ({ onComplete, initialData }) => {
  const [formData, setFormData] = useState({
    canRead: initialData?.canRead ?? false,
    readingLevel: initialData?.readingLevel ?? '',
    canWrite: initialData?.canWrite ?? false,
    writingLevel: initialData?.writingLevel ?? '',
    preferredLearningStyle: initialData?.preferredLearningStyle ?? []
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'canRead' || name === 'canWrite') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // Handle learning style checkboxes
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...prev[name], value]
            : prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const playAudioInstructions = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(
      "Please indicate if you can read and write, and select your preferred way of learning. You can ask someone to help you complete this form."
    );
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-bold">Accessibility Preferences</h2>
        <button
          onClick={playAudioInstructions}
          className="p-2 text-blue-600 hover:text-blue-700"
          title="Listen to instructions"
        >
          <Volume2 className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="canRead"
                checked={formData.canRead}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Can Read</span>
            </label>
            
            {formData.canRead && (
              <select
                name="readingLevel"
                value={formData.readingLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={formData.canRead}
              >
                <option value="">Select reading level</option>
                <option value="beginner">Beginner - Recognizes letters and simple words</option>
                <option value="intermediate">Intermediate - Can read simple sentences</option>
                <option value="advanced">Advanced - Can read paragraphs</option>
              </select>
            )}
          </div>

          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                name="canWrite"
                checked={formData.canWrite}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Can Write</span>
            </label>
            
            {formData.canWrite && (
              <select
                name="writingLevel"
                value={formData.writingLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={formData.canWrite}
              >
                <option value="">Select writing level</option>
                <option value="beginner">Beginner - Can write letters and simple words</option>
                <option value="intermediate">Intermediate - Can write simple sentences</option>
                <option value="advanced">Advanced - Can write paragraphs</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Learning Style
            </label>
            <div className="space-y-2">
              {[
                { value: 'visual', label: 'Visual (Pictures and Images)', icon: '🖼️' },
                { value: 'auditory', label: 'Auditory (Listening and Speaking)', icon: '🔊' },
                { value: 'kinesthetic', label: 'Kinesthetic (Movement and Touch)', icon: '✋' },
                { value: 'reading', label: 'Reading/Writing', icon: '📝' }
              ].map(style => (
                <label key={style.value} className="flex items-center">
                  <input
                    type="checkbox"
                    name="preferredLearningStyle"
                    value={style.value}
                    checked={formData.preferredLearningStyle.includes(style.value)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{style.icon} {style.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default LiteracyCheck; 