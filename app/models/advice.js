'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

/**
 * Advice Schema
 */

const AdviceSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.ObjectId, ref: 'User'},
  content: String,
  email: String
});

/**
 * Validations
 */

AdviceSchema.path('content').required(true, 'advice content cannot be blank');
 
/**
 * Pre-remove hook
 */

AdviceSchema.pre('remove', function(next) {
  next();
});

/**
 * Methods
 */

AdviceSchema.methods = {
  /**
   * Save advice
   *
   * @api private
   */

  uploadAndSave: function() {
    const err = this.validateSync();
    if (err && err.toString()) throw new Error(err.toString());
    return this.save();
  },
};

/**
 * Statics
 */

AdviceSchema.statics = {
  /**
   * Find advice by id
   *
   * @param {ObjectId} id
   * @api private
   */

  load: function(_id) {
    return this.findOne({ _id })
      .exec();
  },

  /**
   * List advices
   *
   * @param {Object} options
   * @api private
   */

  list: function(options) {
    const criteria = options.criteria || {};
    const page = options.page || 0;
    const limit = options.limit || 30;
    return this.find(criteria)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * page)
      .exec();
  }
};

mongoose.model('Advice', AdviceSchema);
