import { useState } from 'react';
import IntakeForm from './components/intake/IntakeForm';
import SpeechAssessment from './components/assessment/SpeechAssessment';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'intake':
        return <IntakeForm />;
      case 'assessment':
        return <SpeechAssessment />;
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => setCurrentView('intake')}
                className="p-6 text-left border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-2xl font-semibold mb-4">Patient Intake Form</h2>
                <p className="text-gray-600">
                  Complete the initial assessment form to help us understand your child's needs.
                </p>
              </button>

              <button
                onClick={() => setCurrentView('assessment')}
                className="p-6 text-left border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-2xl font-semibold mb-4">Speech Assessment</h2>
                <p className="text-gray-600">
                  Complete a comprehensive speech and communication assessment.
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 
              className="text-3xl font-bold text-gray-900 cursor-pointer"
              onClick={() => setCurrentView('home')}
            >
              Speech Therapy Assistant
            </h1>
            
            {currentView !== 'home' && (
              <button
                onClick={() => setCurrentView('home')}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                ← Back to Home
              </button>
            )}
          </div>
        </div>
      </header>
      
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App; 