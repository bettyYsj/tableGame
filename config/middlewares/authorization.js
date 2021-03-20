'use strict';

/*
 *  Generic require login routing middleware
 */

exports.requiresLogin = function(req, res, next) {
  if (req.isAuthenticated()) return next();
};

/*
 *  User authorization routing middleware
 */

exports.user = {
  hasAuthorization: function(req, res, next) {
    if (req.profile._id != req.user._id) {
      return res.send({
        successful: false,
        id: req.profile._id
      });
    }
    next();
  }
};

/*
 *  home authorization routing middleware
 */

exports.home = {
  hasAuthorization: function(req, res, next) {
    console.log(req.home.users);
    if (req.home.users.map(user => user._id).indexOf(req.user._id) === -1) {
      return res.send({
        successful: false,
        userId: req.home.createdBy,
        homeId: req.home._id
      });
    }
    next();
  }
};

/**
 * vote authorization routing middleware
 */

exports.vote = {
  hasAuthorization: function(req, res, next) {
    // if the current user is comment owner or article owner
    // give them authority to delete
    if (
      req.user._id === req.vote.createdBy ||
      req.vote.requireUsers.indexOf(req.user._id) !== -1
    ) {
      next();
    } else {
      res.send({
        successful: false,
        id: req.vote._id
      });
    }
  }
};

/**
 * advice authorization routing middleware
 */

exports.advice = {
  hasAuthorization: function(req, res, next) {
    if (req.user._id !== req.advice.createdBy) {
      return res.send({
        successful: false,
        userId: req.advice.createdBy,
        adviceId: req.advice._id
      });
    }
    next();
  }
};
