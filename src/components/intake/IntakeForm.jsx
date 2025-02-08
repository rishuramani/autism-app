import React, { useState } from 'react';

const IntakeForm = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    childName: '',
    dateOfBirth: '',
    parentName: '',
    contactEmail: '',
    contactPhone: '',
    
    // Speech & Communication
    currentSpeechLevel: '',
    primaryConcerns: '',
    previousTherapy: false,
    communicationMethods: [],
    
    // Medical & Developmental
    diagnosis: [],
    medications: '',
    developmentalConcerns: '',
    
    // Behavioral
    attention: '',
    sensoryIssues: [],
    interests: ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the data to your backend
  };

  const formSteps = [
    {
      title: 'Basic Information',
      fields: (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Child's Name</label>
              <input
                type="text"
                name="childName"
                value={formData.childName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Speech & Communication',
      fields: (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Speech Level</label>
              <select
                name="currentSpeechLevel"
                value={formData.currentSpeechLevel}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select level</option>
                <option value="nonverbal">Nonverbal</option>
                <option value="single-words">Single Words</option>
                <option value="phrases">Short Phrases</option>
                <option value="sentences">Full Sentences</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Concerns</label>
              <textarea
                name="primaryConcerns"
                value={formData.primaryConcerns}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="previousTherapy"
                  checked={formData.previousTherapy}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2">Previous Speech Therapy</span>
              </label>
            </div>
          </div>
        </>
      )
    },
    {
      title: 'Medical & Developmental',
      fields: (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
              <div className="mt-2 space-y-2">
                {['Autism', 'Speech Delay', 'Language Disorder', 'Other'].map(diagnosis => (
                  <label key={diagnosis} className="flex items-center">
                    <input
                      type="checkbox"
                      name="diagnosis"
                      value={diagnosis}
                      checked={formData.diagnosis.includes(diagnosis)}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          diagnosis: e.target.checked
                            ? [...prev.diagnosis, value]
                            : prev.diagnosis.filter(d => d !== value)
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2">{diagnosis}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Medications</label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Speech Therapy Intake Form</h2>
      
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {formSteps.map((step, index) => (
            <button
              key={step.title}
              onClick={() => setCurrentStep(index)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentStep === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {step.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {formSteps[currentStep].fields}

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={currentStep === 0}
          >
            Previous
          </button>

          {currentStep < formSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(formSteps.length - 1, prev + 1))}
              className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IntakeForm; 