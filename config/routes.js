'use strict';

/*
 * Module dependencies.
 */
const passport = require('passport')

const users = require('../app/controllers/users');
const homes = require('../app/controllers/homes');
const votes = require('../app/controllers/votes');
const advice = require('../app/controllers/advice');
const auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

const homeAuth = [auth.requiresLogin, auth.home.hasAuthorization];
const voteAuth = [auth.requiresLogin, auth.vote.hasAuthorization];
const adviceAuth = [auth.requiresLogin, auth.advice.hasAuthorization];

/**
 * Expose routes
 */

module.exports = function(app, passport) {
  app.get('/api/weapplogin',passport.authenticate('weapp'),function (req,res){
    res.end();
  });

  // user routes
  app.post('/users', users.create);
  app.post(
    '/users/session'
  );

  app.param('userId', users.load);

  // home routes
  app.param('id', homes.load);
  app.post('/homes', auth.requiresLogin, homes.create);
  app.get('/homes/:id', homeAuth, homes.getInfo);
  app.post('/homes/:id/addUser', auth.requiresLogin, homes.addUser);
  app.post('/homes/:id/removeUser', auth.requiresLogin, homes.removeUser);
  app.post('/homes/:id/configuration', homeAuth, homes.updateConfiguration);
  app.post('/homes/:id/status', homeAuth, homes.updateStatus);
  app.post('/homes/:id/nickname', homeAuth, homes.updateUserNickname);
  app.delete('/homes/:id', homeAuth, homes.destroy);

  // vote routes
  app.param('voteId', votes.load);
  app.post('/homes/:id/votes', auth.requiresLogin, votes.create);
  app.get('/homes/:id/votes', auth.requiresLogin, votes.index);
  app.post(
    '/homes/:id/votes/:voteId/process',
    voteAuth,
    votes.updateProcess
  );

  // tag routes
  app.post('/advice', auth.requiresLogin, advice.create);
  app.get('/advice', advice.index);

  /**
   * Error handling
   */

  app.use(function(err, req, res, next) {
    // treat as 404
    if (
      err.message &&
      (~err.message.indexOf('not found') ||
        ~err.message.indexOf('Cast to ObjectId failed'))
    ) {
      return next();
    }

    console.error(err.stack);

    if (err.stack.includes('ValidationError')) {
      res.status(422).send({ error: err.stack });
      return;
    }

    // error page
    res.status(500).send({ error: err.stack });
  });

  // assume 404 since no middleware responded
  app.use(function(req, res) {
    const payload = {
      url: req.originalUrl,
      error: 'Not found'
    };
    if (req.accepts('json')) return res.status(404).json(payload);
    res.status(404).send(payload);
  });
};
