'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Advice = mongoose.model('Advice');
const only = require('only');

/**
 * Create advice
 */

exports.create = async(function*(req, res) {
  const advice = new Advice(only(req.body, 'emial content'));
  advice.createdBy = req.user._id;
  try {
    yield advice.uploadAndSave();
    res.json({
      successful: true
    });
  } catch (err) {
    res.status(422).send({
      errors: [err.toString()]
    });
  }
});

/**
 * List
 */

exports.index = async(function*(req, res) {
  const page = (req.query.page > 0 ? req.query.page : 1) - 1;
  const _id = req.query.item;
  const limit = req.query.limit ? req.query.limit : 15;
  const options = {
    limit: limit,
    page: page
  };
  
  const adviceList = yield Advice.list(options);
  const count = yield Advice.countDocuments();

  res.json({
    advice: adviceList,
    total: Math.ceil(count / limit)
  });
});
