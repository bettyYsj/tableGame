'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * User Schema
 */

const UserSchema = new Schema({
  weappid: String,
  username: String,
  sessionKey: String,
  nickname: { type: String, default: '' },
  avator: String,
  weappid: { type: String },
  homes: [{
    _id: { type: Schema.ObjectId, ref: 'Home' },
    types: String
  }]
});

/**
 * Validations
 */

UserSchema.path('weappid').required(true, 'Name cannot be blank');

/**
 * Pre-save hook
 */

UserSchema.pre('save', function(next) {
  next();
});

/**
 * Methods
 */

UserSchema.methods = {
  /**
   * remove home
   *
   * @param {String} HomeId
   * @api private
   */

  removeHome: function(HomeId) {
    const index = this.homes.indexOf(HomeId);

    if (~index) this.homes.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  }
};

/**
 * Statics
 */

UserSchema.statics = {
  /**
   * Load
   *
   * @param {Object} options
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function(options, cb) {
    options.select = options.select || 'name username';
    return this.findOne(options.criteria)
      .exec(cb);
  },
};

UserSchema.plugin(passportLocalMongoose);

mongoose.model('User', UserSchema);
