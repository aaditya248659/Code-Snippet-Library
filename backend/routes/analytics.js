const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Snippet = require('../models/Snippet');
const { protect } = require('../middleware/auth');

// @route   GET /api/analytics/overview
// @desc    Get platform overview stats
// @access  Public
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSnippets = await Snippet.countDocuments({ status: 'approved' });
    const totalViews = await Snippet.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalUpvotes = await Snippet.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$upvotes' } } }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalSnippets,
        totalViews: totalViews[0]?.total || 0,
        totalUpvotes: totalUpvotes[0]?.total || 0
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

// @route   GET /api/analytics/language-distribution
// @desc    Get snippets by language
// @access  Public
router.get('/language-distribution', async (req, res) => {
  try {
    const distribution = await Snippet.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.status(200).json({
      success: true,
      distribution
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/trending
// @desc    Get trending snippets
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const trending = await Snippet.find({
      status: 'approved',
      createdAt: { $gte: weekAgo }
    })
      .populate('submittedBy', 'username')
      .sort({ views: -1, upvotes: -1 })
      .limit(10);
    
    res.status(200).json({
      success: true,
      trending
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user/:username/activity
// @desc    Get user activity heatmap data
// @access  Public
router.get('/user/:username/activity', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get last 365 days of contributions
    const yearAgo = new Date();
    yearAgo.setDate(yearAgo.getDate() - 365);
    
    const contributions = await Snippet.aggregate([
      {
        $match: {
          submittedBy: user._id,
          status: 'approved',
          createdAt: { $gte: yearAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      activity: contributions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user/:username/chart
// @desc    Get user stats for charts
// @access  Public
router.get('/user/:username/chart', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get snippets with views and upvotes over time
    const snippets = await Snippet.find({
      submittedBy: user._id,
      status: 'approved'
    }).select('title views upvotes createdAt').sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      chartData: snippets
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