'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

// Users schema definitions
var UserSchema = new Schema({
  // basic profile info
  'first_name': {
    type: String,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z ]{1,50}$/.test(name);
      },
      message: '{VALUE} is not a valid name!'
    },
    required: [true, 'First name is required!']
  },
  'last_name': {
    type: String,
    validate: {
      validator: function (name) {
        return /^[a-zA-Z ]{1,50}$/.test(name);
      },
      message: '{VALUE} is not a valid name!'
    },
    required: [true, 'Last name is required!']
  },
  'display_name': {
    type: String,
    validate: {
      validator: function (type) {
        return type === 'personal' || type === 'business';
      },
      message: '{VALUE} is not a valid user type!'
    }
  },
  'email': {
    type: String,
    lowercase: true,
    validate: {
      validator: function (email) {
        var regex = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        return regex.test(email);
      },
      message: '{VALUE} is not a valid email!'
    },
    required: [true, 'Email is required!']
  },
  'password': { type: String, required: true },
  'phone_number': {
    type: String,
    validate: {
      validator: function (value) {
        return /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value);
      },
      message: '{VALUE} is not a valid number!'
    }
  },
  'type': {
    type: String,
    validate: {
      validator: function (type) {
        return type === 'client' || type === 'admin';
      },
      message: '{VALUE} is not a valid user type!'
    },
    required: [true, 'User type is required!']
  },
  'status': { type: Boolean, default: false },
  'is_deleted': { type: Boolean, default: false },
  'created': { type: Date, default: Date.now() },
  'modified': { type: Date },
});

// search indexes list
UserSchema.index({
  'first_name': 'text',
  'last_name': 'text'
});

// Generate bcrypt password
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// Campare bcrypt password
UserSchema.methods.campareHash = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('users', UserSchema);  