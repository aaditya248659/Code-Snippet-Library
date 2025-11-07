const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/:username
// @desc    Get user profile by username
// @access  Public
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('contributions')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get approved snippets count
    const approvedSnippets = await Snippet.countDocuments({
      submittedBy: user._id,
      status: 'approved'
    });

    // Get total upvotes on user's snippets
    const snippets = await Snippet.find({ submittedBy: user._id, status: 'approved' });
    const totalUpvotes = snippets.reduce((sum, snippet) => sum + snippet.upvotes, 0);

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          totalContributions: user.contributions.length,
          approvedSnippets,
          totalUpvotes
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/:username/snippets
// @desc    Get user's approved snippets
// @access  Public
router.get('/:username/snippets', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const snippets = await Snippet.find({
      submittedBy: user._id,
      status: 'approved'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: snippets.length,
      snippets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/users/me/favorites
// @desc    Get current user's favorite snippets
// @access  Private
router.get('/me/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'favorites',
      populate: { path: 'submittedBy', select: 'username' }
    });

    const favorites = Array.isArray(user.favorites) ? user.favorites : [];

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/users/me/profile
// @desc    Update user profile
// @access  Private
router.put('/me/profile', [
  protect,
  body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
  body('githubProfile').optional().isURL().withMessage('Must be a valid URL')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { bio, githubProfile } = req.body;
    const user = await User.findById(req.user.id);

    if (bio !== undefined) user.bio = bio;
    if (githubProfile !== undefined) user.githubProfile = githubProfile;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;