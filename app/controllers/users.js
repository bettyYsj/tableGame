'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const User = mongoose.model('User');

/**
 * Load
 */

exports.load = async(function*(req, res, next, _id) {
  const criteria = { _id };
  try {
    req.profile = yield User.load({ criteria });
    if (!req.profile) return next(new Error('User not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * Create user
 */

exports.create = async(function*(req, res) {
  const user = new User(req.body);
  try {
    yield user.save();
    res.json({
      id: user._id
    });
  } catch (err) {
    const errors = Object.keys(err.errors).map(
      field => err.errors[field].message
    );

    res.status(500).send({
      errors
    });
  }
});
