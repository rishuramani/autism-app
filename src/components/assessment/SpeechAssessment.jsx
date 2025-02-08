import React, { useState } from 'react';
import ArticulationAssessment from './ArticulationAssessment';
import PhonologicalAnalysis from './PhonologicalAnalysis';
import AutomatedSpeechAssessment from './AutomatedSpeechAssessment';

const SpeechAssessment = () => {
  const [activeTab, setActiveTab] = useState('automated');
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    dateOfAssessment: new Date().toISOString().split('T')[0]
  });

  const handlePatientInfoChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Speech and Language Assessment</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={patientInfo.name}
              onChange={(e) => handlePatientInfoChange('name', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter patient name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              value={patientInfo.age}
              onChange={(e) => handlePatientInfoChange('age', e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter age"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Assessment
            </label>
            <input
              type="date"
              value={patientInfo.dateOfAssessment}
              onChange={(e) => handlePatientInfoChange('dateOfAssessment', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b">
          <nav className="flex space-x-4 px-6" aria-label="Assessment Tabs">
            <button
              onClick={() => setActiveTab('automated')}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === 'automated'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Automated Assessment
            </button>
            <button
              onClick={() => setActiveTab('articulation')}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === 'articulation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual Articulation Assessment
            </button>
            <button
              onClick={() => setActiveTab('phonological')}
              className={`py-4 px-2 text-sm font-medium border-b-2 ${
                activeTab === 'phonological'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manual Phonological Analysis
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'automated' ? (
            <AutomatedSpeechAssessment />
          ) : activeTab === 'articulation' ? (
            <ArticulationAssessment />
          ) : (
            <PhonologicalAnalysis />
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => {
            // TODO: Implement report generation
            console.log('Generating assessment report...');
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Generate Assessment Report
        </button>
      </div>
    </div>
  );
};

export default SpeechAssessment; 