const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hasCompletedIntake: {
    type: Boolean,
    default: false
  },
  intakeData: {
    childName: String,
    childAge: Number,
    canRead: Boolean,
    preferredLearningStyle: [String],
    diagnoses: [String],
    currentTherapies: [String]
  },
  assessments: [{
    date: Date,
    results: {
      accuracy: Number,
      pronunciation: Number,
      fluency: Number,
      attemptedWords: [{
        text: String,
        accuracy: Number,
        pronunciation: Number,
        fluency: Number
      }]
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 