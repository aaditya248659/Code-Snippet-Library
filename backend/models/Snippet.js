const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  problemDescription: {
    type: String,
    required: [true, 'Please add a problem description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  language: {
    type: String,
    required: [true, 'Please specify a language'],
    enum: ['cpp', 'python', 'javascript', 'java', 'c', 'go', 'rust', 'typescript', 'php', 'ruby'],
    lowercase: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  code: {
    type: String,
    required: [true, 'Please add the code snippet']
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  favoritedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
snippetSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Instance method to increment views
snippetSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
};

module.exports = mongoose.model('Snippet', snippetSchema);