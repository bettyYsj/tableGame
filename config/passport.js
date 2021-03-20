'use strict';

/*!
 * Module dependencies.
 */

const mongoose = require('mongoose');
const User = mongoose.model('User');
const LocalStrategy = require('passport-local').Strategy;

/**
 * Expose
 */

module.exports = function(passport) {
  // serialize sessions
  passport.serializeUser((user, cb) => cb(null, user.id));
  passport.deserializeUser((id, cb) =>
    User.load({ criteria: { _id: id } }, cb)
  );

  // use these strategies
  passport.use(new LocalStrategy(User.authenticate()));
};
