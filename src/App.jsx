import { useState, useEffect } from 'react';
import IntakeForm from './components/intake/IntakeForm';
import SpeechAssessment from './components/assessment/SpeechAssessment';
import LessonPlan from './components/lessons/LessonPlan';
import Authentication from './components/auth/Authentication';
import LiteracyCheck from './components/auth/LiteracyCheck';
import { saveUserData } from './utils/userDataStorage';

function App() {
  const [currentView, setCurrentView] = useState('auth');
  const [user, setUser] = useState(null);
  const [showLiteracyCheck, setShowLiteracyCheck] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setCurrentView(userData.hasCompletedIntake ? 'home' : 'intake');
    }
  }, []);

  const handleAuthComplete = (userData) => {
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
    if (!userData.hasCompletedIntake) {
      // Only show literacy check for new users during intake
      setShowLiteracyCheck(true);
    } else {
      setCurrentView('home');
    }
  };

  const handleLiteracyCheckComplete = (literacyData) => {
    const updatedUser = {
      ...user,
      ...literacyData,
      hasCompletedLiteracyCheck: true
    };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    saveUserData(user.email, updatedUser);
    setShowLiteracyCheck(false);
    setCurrentView('intake');
  };

  const handleIntakeComplete = (intakeData) => {
    const updatedUser = {
      ...user,
      hasCompletedIntake: true,
      intakeData
    };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    saveUserData(user.email, updatedUser);
    setCurrentView('home');
  };

  const handleLogout = () => {
    // Clear current session state
    setUser(null);
    setCurrentView('auth');
    setShowLiteracyCheck(false);
    
    // Only remove current session data
    localStorage.removeItem('currentUser');
    
    // Clear any session-specific data
    sessionStorage.clear();
  };

  const renderContent = () => {
    if (showLiteracyCheck) {
      return (
        <LiteracyCheck
          onComplete={handleLiteracyCheckComplete}
          initialData={{
            canRead: user.canRead,
            readingLevel: user.readingLevel,
            canWrite: user.canWrite,
            writingLevel: user.writingLevel,
            preferredLearningStyle: user.preferredLearningStyle
          }}
        />
      );
    }

    switch (currentView) {
      case 'auth':
        return <Authentication onAuthComplete={handleAuthComplete} />;
      case 'intake':
        return <IntakeForm onComplete={handleIntakeComplete} userId={user.email} />;
      case 'assessment':
        return <SpeechAssessment userId={user.email} />;
      case 'lessons':
        return <LessonPlan userId={user.email} />;
      default:
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <button
                onClick={() => setCurrentView('assessment')}
                className="p-6 text-left border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-2xl font-semibold mb-4">Speech Assessment</h2>
                <p className="text-gray-600">
                  Complete a comprehensive speech and communication assessment.
                </p>
              </button>

              <button
                onClick={() => setCurrentView('lessons')}
                className="p-6 text-left border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-2xl font-semibold mb-4">Weekly Lessons</h2>
                <p className="text-gray-600">
                  View and track your personalized weekly lesson plan.
                </p>
              </button>

              <button
                onClick={() => setCurrentView('intake')}
                className="p-6 text-left border rounded-lg hover:shadow-lg transition-shadow bg-white"
              >
                <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
                <p className="text-gray-600">
                  Update your profile and communication preferences.
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  if (currentView === 'auth' || showLiteracyCheck) {
    return renderContent();
  }

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
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-gray-600">
                  Welcome, {user.name}
                </span>
              )}
              
              {currentView !== 'home' && (
                <button
                  onClick={() => setCurrentView('home')}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  ← Back to Home
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-900"
              >
                Logout
              </button>
            </div>
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