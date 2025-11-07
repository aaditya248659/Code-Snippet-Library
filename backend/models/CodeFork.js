const mongoose = require('mongoose');

const CodeForkSchema = new mongoose.Schema({
  originalSnippet: { type: mongoose.Schema.Types.ObjectId, ref: 'Snippet', required: true },
  forkedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  modifiedCode: { type: String, required: true },
  language: { type: String, default: '' },
  changes: { type: String, default: '' },
  testResults: { type: mongoose.Schema.Types.Mixed, default: null },
  votes: { type: Number, default: 0 },
  votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('CodeFork', CodeForkSchema);
