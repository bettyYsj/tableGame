'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const Vote = mongoose.model('Vote');

/**
 * Load vote
 */

exports.load = function(req, res, next, id) {
  try {
    // TODO: yield
    req.vote = Vote.load(id);
    if (!req.vote) return next(new Error('Home not found'));
  } catch (err) {
    return next(err);
  }
  next();
};

/**
 * Create vote
 */

exports.create = async(function*(req, res) {
  const home = req.home;
  const vote = new Home(only(req.body, 'title type requireUsers'));
  vote.createdBy = req.user._id;
  vote.home = home._id;
  try {
    yield vote.uploadAndSave();
    yield home.addVote(vote._id);
    res.json({
      id: vote._id
    });
  } catch (err) {
    res.status(422).send({
      errors: [err.toString()]
    });
  }
});

/**
 * Update process
 */

exports.updateProcess = async(function*(req, res) {
  const vote = req.vote;
  const votePro = req.body.process;
  // 检查是否有资格投票
  const requireUsers = vote.requireUsers;
  if (requireUsers.indexOf(req.user._id) === -1) {
    res.status(422).send({
      errors: "Not eligible to vote"
    });
  }
  // 避免重复投票 || 投票的选项不存在
  let total = 0;
  let hasExist = false;
  const process = vote.process.map(item => {
    total += users.length;
    if (item.value === votePro.value) {
      hasExist = true;
      const users = item.users;
      if (users.indexOf(req.user._id) === -1) {
        total ++;
        return {
          value: item.value,
          users: item.users.push(req.user._id)
        }
      }
      return item;
    }
    const users = item.users;
    const index = users.indexOf(req.user._id);
    if (index === -1) return item;
    total --;
    return {
      value: item.value,
      users: users.splice(index, 1)
    };
  });
  if (!hasExist) {
    process.push({
      value: votePro.value,
      users: [req.user._id]
    });
    total ++;
  }
  if (total >= requireUsers.length) {
    vote.status = closed;
    process.sort(item => item.users.length);
    if (process.length === 1 || process[0].users.length > process[1].users.length) vote.result = process[0].value;
    else if (vote.type === 'Avalon-1') vote.result = '成功';
    else vote.result = '平局';
  }
  vote.process = process;
  try {
    yield vote.uploadAndSave();
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
    page: page,
    criteria: {
      home: req.home._id
    }
  };

  const votes = yield Vote.list(options);
  const count = yield Vote.countDocuments();

  res.json({
    votes: votes,
    total: Math.ceil(count / limit)
  });
});
