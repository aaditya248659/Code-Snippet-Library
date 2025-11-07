const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// NOTE: You'll need to install: npm install openai
// And add OPENAI_API_KEY to your .env file

// @route   POST /api/ai/explain
// @desc    Get AI explanation of code
// @access  Private
router.post('/explain', protect, async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }
    
    // For now, return a mock response
    // In production, integrate with OpenAI API
    const explanation = generateMockExplanation(code, language);
    
    res.status(200).json({
      success: true,
      explanation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/ai/optimize
// @desc    Get AI suggestions to optimize code
// @access  Private
router.post('/optimize', protect, async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }
    
    // Mock optimization suggestions
    const suggestions = [
      {
        type: 'performance',
        severity: 'medium',
        message: 'Consider using const instead of let for variables that don\'t change',
        line: 1
      },
      {
        type: 'readability',
        severity: 'low',
        message: 'Add comments to explain complex logic',
        line: 5
      }
    ];
    
    res.status(200).json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Mock function - Replace with actual OpenAI integration
function generateMockExplanation(code, language) {
  return {
    summary: 'This code snippet demonstrates a basic implementation in ' + language,
    breakdown: [
      'Line 1-3: Variable declarations and initialization',
      'Line 4-6: Main logic implementation',
      'Line 7-9: Return statement with result'
    ],
    complexity: 'O(n)',
    recommendations: [
      'Consider edge case handling',
      'Add input validation',
      'Improve variable naming'
    ]
  };
}

module.exports = router;