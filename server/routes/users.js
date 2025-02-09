const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'hasCompletedIntake', 'intakeData'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: 'Error updating profile' });
  }
});

// Save assessment results
router.post('/me/assessments', auth, async (req, res) => {
  try {
    req.user.assessments.push({
      date: new Date(),
      results: req.body
    });
    await req.user.save();
    res.status(201).json(req.user.assessments[req.user.assessments.length - 1]);
  } catch (error) {
    res.status(400).json({ message: 'Error saving assessment results' });
  }
});

// Get latest assessment
router.get('/me/assessments/latest', auth, async (req, res) => {
  try {
    const assessments = req.user.assessments;
    if (assessments.length === 0) {
      return res.json(null);
    }
    res.json(assessments[assessments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assessment results' });
  }
});

module.exports = router; 