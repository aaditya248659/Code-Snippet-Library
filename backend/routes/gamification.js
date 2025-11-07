const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const { protect } = require('../middleware/auth');

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard (top users by points)
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'all', limit = 10 } = req.query;
    
    let dateFilter = {};
    if (timeframe === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (timeframe === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    }
    
    const users = await User.find(dateFilter)
      .select('username points level badges stats streak')
      .sort({ points: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: users.length,
      leaderboard: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/gamification/badges
// @desc    Get all available badges
// @access  Public
router.get('/badges', (req, res) => {
  const badges = [
    { name: 'First Snippet', icon: '🎯', description: 'Created your first snippet', requirement: '1 snippet' },
    { name: 'Contributor', icon: '⭐', description: 'Created 10 snippets', requirement: '10 snippets' },
    { name: 'Code Master', icon: '🏆', description: 'Created 50 snippets', requirement: '50 snippets' },
    { name: 'Popular', icon: '🔥', description: 'Received 100+ upvotes', requirement: '100 upvotes' },
    { name: 'Influencer', icon: '💎', description: 'Received 1000+ views', requirement: '1000 views' },
    { name: 'Consistent', icon: '⚡', description: '7 day contribution streak', requirement: '7 day streak' },
    { name: 'Helpful', icon: '💬', description: 'Made 50+ helpful comments', requirement: '50 comments' },
    { name: 'Rising Star', icon: '🌟', description: 'Reached level 10', requirement: 'Level 10' },
    { name: 'Legend', icon: '👑', description: 'Reached level 50', requirement: 'Level 50' },
  ];
  
  res.status(200).json({
    success: true,
    badges
  });
});

// @route   GET /api/gamification/stats/:username
// @desc    Get user gamification stats
// @access  Public
router.get('/stats/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username points level badges stats streak');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate rank
    const rank = await User.countDocuments({ points: { $gt: user.points } }) + 1;
    
    res.status(200).json({
      success: true,
      stats: {
        ...user.toObject(),
        rank
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

// @route   POST /api/gamification/award-points
// @desc    Award points to user (called internally)
// @access  Private
router.post('/award-points', protect, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.points += points;
    user.calculateLevel();
    const newBadges = await user.checkBadges();
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Awarded ${points} points for ${reason}`,
      newPoints: user.points,
      newLevel: user.level,
      newBadges
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