'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

// Notes schema definitions
var NotesSchema = new Schema({
  // basic profile info
  'name': {
    type: String,
    required: [true, 'Subject is required!']
  },
  'desc': {
    type: String,
    required: [true, 'Description is required!']
  },
  'notes': {
    type: String
  },
  'user_id': {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: [true, 'User Id is required!']
  },
  'status': { type: Boolean, default: false },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date },
});

module.exports = mongoose.model('notes', NotesSchema);  