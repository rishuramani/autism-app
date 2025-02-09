import React, { useState, useEffect } from 'react';
import { getUserData, saveUserData } from '../../utils/userDataStorage';

const IntakeForm = ({ onComplete, userId }) => {
  const [formData, setFormData] = useState({
    // Child Information
    childName: '',
    dateOfBirth: '',
    gender: '',
    canRead: false,
    readingLevel: '',
    canWrite: false,
    writingLevel: '',
    preferredLearningStyle: [],
    
    // Parent/Guardian Information
    parentName: '',
    relationship: '',
    contactEmail: '',
    contactPhone: '',
    preferredContact: 'email',
    
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
    interests: '',
    
    // Goals & Preferences
    goals: '',
    preferredActivities: '',
    challengingActivities: ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Load existing data when component mounts
    const userData = getUserData(userId);
    if (userData?.intakeData) {
      setFormData(prevData => ({
        ...prevData,
        ...userData.intakeData
      }));
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'canRead' || name === 'canWrite') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
            ? [...(prev[name] || []), value]
            : (prev[name] || []).filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to local storage
    const userData = getUserData(userId);
    const updatedUserData = {
      ...userData,
      intakeData: formData,
      hasCompletedIntake: true
    };
    saveUserData(userId, updatedUserData);
    onComplete(formData);
  };

  const formSteps = [
    {
      title: 'Child Information',
      fields: (
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
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Literacy & Learning Style</h3>
            
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
                    { value: 'visual', label: 'Visual (Pictures and Images)' },
                    { value: 'auditory', label: 'Auditory (Listening and Speaking)' },
                    { value: 'kinesthetic', label: 'Kinesthetic (Movement and Touch)' },
                    { value: 'reading', label: 'Reading/Writing' }
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
                      <span className="ml-2">{style.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Parent/Guardian Information',
      fields: (
        <div className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700">Relationship to Child</label>
            <input
              type="text"
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="e.g., Mother, Father, Guardian"
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Contact Method</label>
            <select
              name="preferredContact"
              value={formData.preferredContact}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="text">Text Message</option>
            </select>
          </div>
        </div>
      )
    },
    {
      title: 'Speech & Communication',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Speech Level</label>
            <select
              name="currentSpeechLevel"
              value={formData.currentSpeechLevel}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select level</option>
              <option value="nonverbal">Nonverbal</option>
              <option value="single-words">Single Words</option>
              <option value="phrases">Short Phrases</option>
              <option value="sentences">Full Sentences</option>
              <option value="complex">Complex Communication</option>
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
              placeholder="Describe your main concerns about your child's speech and communication"
              required
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
              <span className="ml-2">Previous Speech Therapy Experience</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Communication Methods</label>
            <div className="mt-2 space-y-2">
              {['Speech', 'Gestures', 'Sign Language', 'AAC Device', 'Picture Exchange'].map(method => (
                <label key={method} className="flex items-center">
                  <input
                    type="checkbox"
                    name="communicationMethods"
                    value={method}
                    checked={formData.communicationMethods.includes(method)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Medical & Developmental',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
            <div className="mt-2 space-y-2">
              {['Autism', 'Speech Delay', 'Language Disorder', 'Hearing Impairment', 'Other'].map(diagnosis => (
                <label key={diagnosis} className="flex items-center">
                  <input
                    type="checkbox"
                    name="diagnosis"
                    value={diagnosis}
                    checked={formData.diagnosis.includes(diagnosis)}
                    onChange={handleInputChange}
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
              placeholder="List any current medications (or write 'none')"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Developmental Concerns</label>
            <textarea
              name="developmentalConcerns"
              value={formData.developmentalConcerns}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Describe any developmental concerns or delays"
            />
          </div>
        </div>
      )
    },
    {
      title: 'Behavioral & Interests',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Attention Span</label>
            <select
              name="attention"
              value={formData.attention}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select attention level</option>
              <option value="very-short">Very Short (0-5 minutes)</option>
              <option value="short">Short (5-10 minutes)</option>
              <option value="moderate">Moderate (10-20 minutes)</option>
              <option value="good">Good (20-30 minutes)</option>
              <option value="excellent">Excellent (30+ minutes)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sensory Issues</label>
            <div className="mt-2 space-y-2">
              {[
                'Noise Sensitivity',
                'Light Sensitivity',
                'Touch Sensitivity',
                'Movement Sensitivity',
                'Texture/Food Sensitivity'
              ].map(issue => (
                <label key={issue} className="flex items-center">
                  <input
                    type="checkbox"
                    name="sensoryIssues"
                    value={issue}
                    checked={formData.sensoryIssues.includes(issue)}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{issue}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Interests & Motivators</label>
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="List favorite activities, toys, characters, etc."
            />
          </div>
        </div>
      )
    },
    {
      title: 'Goals & Preferences',
      fields: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Communication Goals</label>
            <textarea
              name="goals"
              value={formData.goals}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What are your main goals for speech therapy?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Preferred Activities</label>
            <textarea
              name="preferredActivities"
              value={formData.preferredActivities}
              onChange={handleInputChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What activities does your child enjoy?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Challenging Activities</label>
            <textarea
              name="challengingActivities"
              value={formData.challengingActivities}
              onChange={handleInputChange}
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="What activities does your child find challenging?"
            />
          </div>
        </div>
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
              Complete Intake
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default IntakeForm; 