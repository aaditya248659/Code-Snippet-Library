const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Snippet = require('../models/Snippet');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/admin');

// @route   GET /api/snippets
// @desc    Get all approved snippets (with filters)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { lang, tag, search, sort } = req.query;
    
    let query = { status: 'approved' };
    
    // Filter by language
    if (lang) {
      query.language = lang.toLowerCase();
    }
    
    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemDescription: { $regex: search, $options: 'i' } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'popular') sortOption = { upvotes: -1 };
    if (sort === 'views') sortOption = { views: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const snippets = await Snippet.find(query)
      .populate('submittedBy', 'username githubProfile')
      .sort(sortOption);

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

// @route   GET /api/snippets/:id
// @desc    Get single snippet by ID and increment views
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id)
      .populate('submittedBy', 'username githubProfile bio')
      .populate('comments.user', 'username');

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    // Increment views
    await snippet.incrementViews();

    res.status(200).json({
      success: true,
      snippet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/snippets/submit
// @desc    Submit a new snippet
// @access  Private
router.post('/submit', [
  protect,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('problemDescription').trim().notEmpty().withMessage('Problem description is required'),
  body('language').isIn(['cpp', 'python', 'javascript', 'java', 'c', 'go', 'rust', 'typescript', 'php', 'ruby']).withMessage('Invalid language'),
  body('code').trim().notEmpty().withMessage('Code is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, problemDescription, language, tags, code } = req.body;

    const snippet = await Snippet.create({
      title,
      problemDescription,
      language: language.toLowerCase(),
      tags: tags ? tags.map(tag => tag.toLowerCase()) : [],
      code,
      submittedBy: req.user.id
    });

    // Add snippet to user's contributions
    await User.findByIdAndUpdate(req.user.id, {
      $push: { contributions: snippet._id }
    });

    res.status(201).json({
      success: true,
      message: 'Snippet submitted successfully and is pending approval',
      snippet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/snippets/:id
// @desc    Update own snippet
// @access  Private
router.put('/:id', [
  protect,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('problemDescription').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('Code cannot be empty')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    // Check ownership
    if (snippet.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this snippet'
      });
    }

    const { title, problemDescription, language, tags, code } = req.body;

    if (title) snippet.title = title;
    if (problemDescription) snippet.problemDescription = problemDescription;
    if (language) snippet.language = language.toLowerCase();
    if (tags) snippet.tags = tags.map(tag => tag.toLowerCase());
    if (code) snippet.code = code;

    // Reset to pending if not admin
    if (req.user.role !== 'admin') {
      snippet.status = 'pending';
    }

    await snippet.save();

    res.status(200).json({
      success: true,
      message: 'Snippet updated successfully',
      snippet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/snippets/user/:id
// @desc    Delete own snippet
// @access  Private
router.delete('/user/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    // Check ownership
    if (snippet.submittedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this snippet'
      });
    }

    await snippet.deleteOne();

    // Remove from user's contributions
    await User.findByIdAndUpdate(snippet.submittedBy, {
      $pull: { contributions: snippet._id }
    });

    res.status(200).json({
      success: true,
      message: 'Snippet deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/snippets/upvote/:id
// @desc    Upvote a snippet
// @access  Private
router.patch('/upvote/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    // Check if user already upvoted
    if (snippet.upvotedBy.includes(req.user.id)) {
      // Remove upvote
      snippet.upvotedBy = snippet.upvotedBy.filter(
        userId => userId.toString() !== req.user.id.toString()
      );
      snippet.upvotes -= 1;
    } else {
      // Add upvote
      snippet.upvotedBy.push(req.user.id);
      snippet.upvotes += 1;
    }

    await snippet.save();

    res.status(200).json({
      success: true,
      upvotes: snippet.upvotes,
      snippet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/snippets/favorite/:id
// @desc    Add/Remove snippet from favorites
// @access  Private
router.patch('/favorite/:id', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    // Ensure favorites is an array (older user docs may not have the field)
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];

    // Check if already favorited
    const isFavorited = favorites.some(id => id.toString() === snippet._id.toString());

    if (isFavorited) {
      // Remove from favorites
      user.favorites = favorites.filter(
        id => id.toString() !== snippet._id.toString()
      );
      snippet.favoritedBy = snippet.favoritedBy.filter(
        id => id.toString() !== req.user.id.toString()
      );
    } else {
      // Add to favorites
      favorites.push(snippet._id);
      user.favorites = favorites;
      snippet.favoritedBy.push(req.user.id);
    }

    await user.save();
    await snippet.save();

    res.status(200).json({
      success: true,
      isFavorited: !isFavorited,
      message: isFavorited ? 'Removed from favorites' : 'Added to favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/snippets/:id/comment
// @desc    Add comment to snippet
// @access  Private
router.post('/:id/comment', [
  protect,
  body('text').trim().notEmpty().withMessage('Comment cannot be empty').isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    snippet.comments.push(comment);
    await snippet.save();

    // Populate the new comment
    await snippet.populate('comments.user', 'username');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: snippet.comments[snippet.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/snippets/:snippetId/comment/:commentId
// @desc    Delete own comment
// @access  Private
router.delete('/:snippetId/comment/:commentId', protect, async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.snippetId);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    const comment = snippet.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.deleteOne();
    await snippet.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/snippets/pending/all
// @desc    Get all pending snippets
// @access  Private/Admin
router.get('/pending/all', protect, authorize('admin'), async (req, res) => {
  try {
    const snippets = await Snippet.find({ status: 'pending' })
      .populate('submittedBy', 'username email githubProfile')
      .sort({ createdAt: -1 });

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

// @route   PATCH /api/snippets/approve/:id
// @desc    Approve a snippet
// @access  Private/Admin
router.patch('/approve/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    snippet.status = 'approved';
    await snippet.save();

    res.status(200).json({
      success: true,
      message: 'Snippet approved successfully',
      snippet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/snippets/:id
// @desc    Delete a snippet (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const snippet = await Snippet.findById(req.params.id);

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    await snippet.deleteOne();

    // Remove snippet from user's contributions
    await User.findByIdAndUpdate(snippet.submittedBy, {
      $pull: { contributions: snippet._id }
    });

    res.status(200).json({
      success: true,
      message: 'Snippet deleted successfully'
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