'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Vote Schema
 */
// ** video **

const VoteSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },
  title: String,
  result: String,
  process: [
    {
      value: String,
      users: [
        { type: Schema.ObjectId, ref: 'User' }
      ]
    }
  ],
  type: String,
  status: { type: String, default: 'waiting', enum: ['waiting', 'closed'] },
  home: { type: Schema.ObjectId, ref: 'Home' },
  requireUsers: [
    { type: Schema.ObjectId, ref: 'User' }
  ]
});

/**
 * Validations
 */

VoteSchema.path('type').required(true, '类型不得为空');

/**
 * Pre-remove hook
 */

VoteSchema.pre('remove', function(next) {
  next();
});

/**
 * Methods
 */

VoteSchema.methods = {
  /**
   * create vote
   *
   * @api private
   */

  uploadAndSave: function() {
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
  }
};

/**
 * Statics
 */

VoteSchema.statics = {
  /**
   * Find vote by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .populate('createdBy', 'nickname')
      .populate('process.users', 'nickname')
      .populate('requireUsers', 'nickname')
      .exec();
  },

  /**
   * List votes
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .populate('process.users', 'nickname')
      .populate('requireUsers', 'nickname')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Vote', VoteSchema);
