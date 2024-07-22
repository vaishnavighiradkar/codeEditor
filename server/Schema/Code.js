const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Code = mongoose.model('Code', codeSchema);

module.exports = Code;
