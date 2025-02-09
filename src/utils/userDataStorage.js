// User data storage utilities

export const saveUserData = (userId, data) => {
  try {
    const existingData = localStorage.getItem('speechTherapyUsers') || '{}';
    const users = JSON.parse(existingData);
    users[userId] = {
      ...users[userId],
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('speechTherapyUsers', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving user data:', error);
    return false;
  }
};

export const getUserData = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem('speechTherapyUsers') || '{}');
    return users[userId] || null;
  } catch (error) {
    console.error('Error retrieving user data:', error);
    return null;
  }
};

// New functions for session management
export const setCurrentUser = (userId) => {
  try {
    localStorage.setItem('currentUser', userId);
    return true;
  } catch (error) {
    console.error('Error setting current user:', error);
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const userId = localStorage.getItem('currentUser');
    if (!userId) return null;
    return getUserData(userId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const clearCurrentUser = () => {
  try {
    localStorage.removeItem('currentUser');
    return true;
  } catch (error) {
    console.error('Error clearing current user:', error);
    return false;
  }
};

export const saveAssessmentResults = (userId, results) => {
  try {
    const userData = getUserData(userId) || {};
    const assessments = userData.assessments || [];
    assessments.push({
      date: new Date().toISOString(),
      results
    });
    return saveUserData(userId, {
      ...userData,
      assessments
    });
  } catch (error) {
    console.error('Error saving assessment results:', error);
    return false;
  }
};

export const getLatestAssessment = (userId) => {
  const userData = getUserData(userId);
  if (!userData || !userData.assessments || userData.assessments.length === 0) {
    return null;
  }
  return userData.assessments[userData.assessments.length - 1];
}; 