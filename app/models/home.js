'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Home Schema
 */
// ** video **

const HomeSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User' },
  configuration: [
    {
      name: String,
      count: Number
    }
  ],
  confIndex: Number,
  users: [{
    _id: { type: Schema.ObjectId, ref: 'User' },
    nickname: String,
    role: String,
    info: { type: String, default: '' },
  }],
  total: Number,
  votes: [{
    vote: { type: Schema.ObjectId, ref: 'Vote' }
  }],
  status: { type: String, default: 'waiting', enum: ['waiting', 'ongoing', 'vote', 'closed'] },
  type: String
});

/**
 * Validations
 */

HomeSchema.path('type').required(true, '类型不得为空');

/**
 * Pre-remove hook
 */

HomeSchema.pre('remove', function(next) {
  next();
});

/**
 * Methods
 */

HomeSchema.methods = {
  /**
   * create home
   *
   * @api private
   */

  uploadAndSave: function() {
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
  },

  /**
   * remove user
   *
   * @param {String} UserId
   * @api private
   */

  removeUser: function(UserId) {
    const index = this.users.map(user => user.user).indexOf(UserId);

    if (~index) this.users.splice(index, 1);
    else throw new Error('Comment not found');
    return this.save();
  },
  
};

/**
 * Statics
 */

HomeSchema.statics = {
  /**
   * Find home by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .exec();
  },

  /**
   * List votes by homeId
   *
   * @param {ObjectId} id
   * @api private
   */

  votesList: function(_id) {
    return this.findOne({ _id })
      .populate('vote')
      .exec();
  }
};

mongoose.model('Home', HomeSchema);
