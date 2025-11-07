const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { VM } = require('vm2');
const axios = require('axios');
const CodeFork = require('../models/CodeFork');
const Snippet = require('../models/Snippet');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Piston API Configuration (FREE - No API key needed!)
// Allow overriding the Piston API endpoint via environment variable if needed
const PISTON_API = process.env.PISTON_API || 'https://emkc.org/api/v2/piston';

// Language mapping for Piston
const PISTON_LANGUAGES = {
  'javascript': 'javascript',
  'js': 'javascript',
  'python': 'python',
  'python3': 'python',
  'java': 'java',
  'c': 'c',
  'cpp': 'cpp',
  'c++': 'cpp',
  'csharp': 'csharp',
  'c#': 'csharp',
  'go': 'go',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'rust': 'rust',
  'php': 'php',
  'typescript': 'typescript',
  'ts': 'typescript',
  'r': 'r',
  'perl': 'perl',
  'scala': 'scala',
  'bash': 'bash',
  'shell': 'bash',
  'lua': 'lua',
  'haskell': 'haskell',
  'elixir': 'elixir',
  'crystal': 'crystal'
};

// @route   POST /api/playground/execute
// @desc    Execute code using Piston API (FREE)
// @access  Public (No authentication required)
router.post('/execute', async (req, res) => {
  try {
    const { code, language, input = '' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code is required'
      });
    }

    const startTime = Date.now();
    let result;

    // Use Piston API for all languages
    const langLower = language.toLowerCase();
    
    if (PISTON_LANGUAGES[langLower]) {
      result = await executeWithPiston(code, langLower, input);
    } else {
      return res.status(400).json({
        success: false,
        message: `Execution for ${language} is not supported yet`
      });
    }

    const executionTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      output: result.output,
      error: result.error,
      executionTime: `${executionTime}ms`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Execution failed',
      error: error.message
    });
  }
});

// Execute code using Piston API (FREE!)
async function executeWithPiston(code, language, input) {
  try {
    const pistonLang = PISTON_LANGUAGES[language];
    
    if (!pistonLang) {
      return { output: null, error: `Language ${language} not supported` };
    }

    // Make request to Piston API
    const response = await axios.post(`${PISTON_API}/execute`, {
      language: pistonLang,
      version: '*', // Use latest version
      files: [{
        name: getFileName(pistonLang),
        content: code
      }],
      stdin: input,
      args: [],
      compile_timeout: 10000,
      run_timeout: 5000,
      compile_memory_limit: -1,
      run_memory_limit: -1
    });

    const result = response.data;

    // Check for compilation errors
    if (result.compile && result.compile.code !== 0) {
      return { 
        output: null, 
        error: result.compile.stderr || result.compile.output || 'Compilation error'
      };
    }

    // Check for runtime errors
    if (result.run && result.run.code !== 0 && result.run.stderr) {
      return { 
        output: result.run.stdout || null, 
        error: result.run.stderr 
      };
    }

    // Success
    return { 
      output: result.run.stdout || result.run.output || 'Code executed successfully (no output)', 
      error: null 
    };
  } catch (error) {
    console.error('Piston API Error:', error.response?.data || error.message);
    return { output: null, error: `Failed to execute code: ${error.message}` };
  }
}

// Helper function to get appropriate filename for each language
function getFileName(language) {
  const fileNames = {
    'javascript': 'code.js',
    'python': 'code.py',
    'java': 'Main.java',
    'c': 'code.c',
    'cpp': 'code.cpp',
    'csharp': 'Code.cs',
    'go': 'code.go',
    'ruby': 'code.rb',
    'swift': 'code.swift',
    'kotlin': 'Code.kt',
    'rust': 'code.rs',
    'php': 'code.php',
    'typescript': 'code.ts',
    'r': 'code.r',
    'perl': 'code.pl',
    'scala': 'Code.scala',
    'bash': 'code.sh',
    'lua': 'code.lua',
    'haskell': 'code.hs',
    'elixir': 'code.ex',
    'crystal': 'code.cr'
  };
  return fileNames[language] || 'code.txt';
}

// Keep JavaScript local execution as backup
async function executeJavaScript(code, input) {
  try {
    const vm = new VM({
      timeout: 5000,
      sandbox: {
        console: {
          log: (...args) => console.log(...args)
        },
        input: input
      }
    });

    let output = '';
    const originalLog = console.log;
    console.log = (...args) => {
      output += args.join(' ') + '\n';
    };

    const result = vm.run(code);
    console.log = originalLog;

    if (result !== undefined) {
      output += String(result);
    }

    return { output: output || 'Code executed successfully (no output)', error: null };
  } catch (error) {
    return { output: null, error: error.message };
  }
}

// @route   POST /api/playground/fork
// @desc    Fork a snippet with modifications
// @access  Private
router.post('/fork', [
  protect,
  body('snippetId').notEmpty().withMessage('Snippet ID is required'),
  body('modifiedCode').notEmpty().withMessage('Modified code is required'),
  body('changes').notEmpty().withMessage('Please describe your changes')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { snippetId, modifiedCode, changes, description, testResults } = req.body;

    const snippet = await Snippet.findById(snippetId);
    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: 'Snippet not found'
      });
    }

    const fork = await CodeFork.create({
      originalSnippet: snippetId,
      forkedBy: req.user.id,
      title: `Improved: ${snippet.title}`,
      description: description || '',
      modifiedCode,
      language: snippet.language,
      changes,
      testResults: testResults || null
    });

    // Notify snippet owner
    // You can implement notification system here

    // Award points to user for contributing
    const user = await User.findById(req.user.id);
    user.points += 10; // 10 points for forking
    user.calculateLevel();
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Fork submitted successfully! The owner will be notified.',
      fork
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/playground/forks/:snippetId
// @desc    Get all forks for a snippet
// @access  Public
router.get('/forks/:snippetId', async (req, res) => {
  try {
    const forks = await CodeFork.find({ originalSnippet: req.params.snippetId })
      .populate('forkedBy', 'username level')
      .sort({ votes: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: forks.length,
      forks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/playground/fork/:forkId/vote
// @desc    Vote on a fork
// @access  Private
router.patch('/fork/:forkId/vote', protect, async (req, res) => {
  try {
    const fork = await CodeFork.findById(req.params.forkId);

    if (!fork) {
      return res.status(404).json({
        success: false,
        message: 'Fork not found'
      });
    }

    // Check if already voted
    if (fork.votedBy.includes(req.user.id)) {
      fork.votedBy = fork.votedBy.filter(
        userId => userId.toString() !== req.user.id.toString()
      );
      fork.votes -= 1;
    } else {
      fork.votedBy.push(req.user.id);
      fork.votes += 1;
    }

    await fork.save();

    res.status(200).json({
      success: true,
      votes: fork.votes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PATCH /api/playground/fork/:forkId/accept
// @desc    Accept a fork (owner only)
// @access  Private
router.patch('/fork/:forkId/accept', protect, async (req, res) => {
  try {
    const fork = await CodeFork.findById(req.params.forkId).populate('originalSnippet');

    if (!fork) {
      return res.status(404).json({
        success: false,
        message: 'Fork not found'
      });
    }

    // Check if user is the snippet owner
    if (fork.originalSnippet.submittedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the snippet owner can accept forks'
      });
    }

    // Update original snippet with forked code
    fork.originalSnippet.code = fork.modifiedCode;
    fork.originalSnippet.status = 'pending'; // Re-submit for admin approval
    await fork.originalSnippet.save();

    // Update fork status
    fork.status = 'accepted';
    await fork.save();

    // Award points to fork creator
    const forkCreator = await User.findById(fork.forkedBy);
    forkCreator.points += 50; // 50 points for accepted fork
    forkCreator.calculateLevel();
    await forkCreator.save();

    res.status(200).json({
      success: true,
      message: 'Fork accepted! Snippet has been updated.',
      fork
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/playground/fork/:forkId
// @desc    Delete a fork
// @access  Private
router.delete('/fork/:forkId', protect, async (req, res) => {
  try {
    const fork = await CodeFork.findById(req.params.forkId);

    if (!fork) {
      return res.status(404).json({
        success: false,
        message: 'Fork not found'
      });
    }

    // Check ownership
    if (fork.forkedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this fork'
      });
    }

    await fork.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Fork deleted successfully'
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