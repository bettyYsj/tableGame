'use strict';

/**
 * Module dependencies.
 */

const mongoose = require('mongoose');
const { wrap: async } = require('co');
const only = require('only');
const { home } = require('../../config/middlewares/authorization');
const Home = mongoose.model('Home');
const User = mongoose.model('User');
const assign = Object.assign;
const wodi = require('./wodi');
const wodiTotal = 1;

/**
 * Load
 */

exports.load = async(function*(req, res, next, id) {
  try {
    req.home = yield Home.load(id);
    if (!req.home) return next(new Error('Home not found'));
  } catch (err) {
    return next(err);
  }
  next();
});

exports.getInfo = async(function*(req, res) {
  try {
    res.json(req.home);
  } catch (err) {
    return next(err);
  }
  next();
});

/**
 * Create a home
 */

exports.create = async(function*(req, res) {
  // console.log(123);
  let user = req.user;
  const index = user.homes && user.homes.length ? user.homes.map(home => home.types).indexOf(req.body.type) : -1;
  console.log(index);
  if (index === -1) {
    const home = new Home(only(req.body, 'configuration type confIndex total'));
    home.createdBy = req.user._id;
    home.users = [{
      _id: req.user._id,
      nickname: '',
      role: ''
    }];
    user.homes = [{
      _id: home._id,
      types: req.body.type
    }];
    try {
      yield home.save();
      yield user.save();
      res.json(home);
    } catch (err) {
      res.status(422).send({
        errors: [err.toString()]
      });
    }
  }
  else {
    try {
      const home = yield Home.load(user.homes[index]._id);
      res.json(home);
    } catch (err) {
      res.status(422).send({
        errors: [err.toString()]
      });
    }
  }
});

/**
 * Update conf
 */

exports.updateConfiguration = async(function*(req, res) {
  console.log(req.home);
  console.log(req.body);
  const home = req.home;
  home.configuration = req.body.configuration;
  home.confIndex = req.body.confIndex;
  home.total = req.body.total;
  try {
    yield home.uploadAndSave();
    res.json({
      successful: true,
      home
    });
  } catch (err) {
    res.status(422).send({
      errors: [err.toString()]
    });
  }
});

/**
 * Update status
 */

exports.updateStatus = async(function*(req, res) {
  const home = req.home;
  const status = req.body.status;
  if (status === 'ongoing') {
    if (home.total > home.users.length) {
      res.status(422).send({
        errors: 'user not enough'
      });
      return;
    }
    const users = home.users.filter(item => {
      return !item.nickname;
    });
    if (users.length) {
      res.status(422).send({
        errors: 'someone has not nickname'
      });
      return;
    }
  }
  home.status = status;
  let conf = [];
  let numArr = [];
  for (let i = 0; i < total; i ++) {
    if (i < home.configuration.length) {
      for (let j = 0; j < home.configuration[i].count; j ++) conf.push(home.configuration[i].name);
    }
    numArr[i] = i;
  }
  for (let i = 0; i < total; i ++) {
    const iRand = parseInt(total * Math.random());
    const temp = numArr[i];
    numArr[i] = numArr[iRand];
    numArr[iRand] = temp;
  }
  
  const idx = parseInt(wodiTotal * Math.random());
  const mUsers = home.users.map((item, index) => {
    item.role = conf[numArr[index]];
    if (home.type === 'wodi') {
      home.info = item.role === '平民' ? wodi[idx][0] : (item.role === '卧底' ? wodi[idx][1] : '白板');
    }
    return item;
  });
  if (home.type === 'Avalon') {
    for (let i = 0; i < mUsers.length; i ++) {
      if (mUsers[i].role === '亚瑟的忠臣' || mUsers[i].role === '奥伯伦') {
        mUsers[i].info = '';
        continue;
      }
      for (let j = 0; j < mUsers.length; j ++) {
        if (j === i) continue;
        if (mUsers[i].role === '梅林' && (mUsers[j].role === '莫甘娜' || mUsers[j].role === '爪牙' || mUsers[j].role === '刺客' || mUsers[j].role === '奥伯伦')) {
          mUsers[i].info = mUsers[i].info + mUsers[j].nickname;
        }
        if (mUsers[i].role === '派西维尔' && (mUsers[j].role === '梅林' || mUsers[j].role === '莫甘娜')) {
          mUsers[i].info = mUsers[i].info + mUsers[j].nickname;
        }
        if ((mUsers[i].role === '莫甘娜' || mUsers[i].role === '爪牙' || mUsers[i].role === '刺客' || mUsers[i].role === '莫德雷德') && (mUsers[j].role === '莫甘娜' || mUsers[j].role === '爪牙' || mUsers[j].role === '刺客' || mUsers[j].role === '莫德雷德')) {
          mUsers[i].info = mUsers[i].info + mUsers[j].nickname;
        }
      }
    }
  }
  home.users = mUsers;

  try {
    yield home.uploadAndSave();

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
 * Add user
 */

exports.addUser = async(function*(req, res) {
  const home = req.home;
  const index = home.users.map(user => user._id).indexOf(req.user._id);
  if (index === -1) {
    if (home.status !== 'waiting') {
      res.status(422).send({
        errors: 'game start!'
      });
    }
    if (home.total >= home.users.length) {
      res.status(422).send({
        errors: 'users enough!'
      });
    }
    home.users.push({
      _id: req.user._id,
      nickname: '',
      role: ''
    });
  }
  const user = req.user;
  if (user.homes.map(item => item._id).indexOf(req.home._id) === -1) {
    user.homes.push({
      _id: req.home._id,
      types: home.type
    });
  }
  try {
    yield home.uploadAndSave();
    yield user.save();
    res.json(home);
  } catch (err) {
    res.status(422).send({
      errors: [err.toString()]
    });
  }
});

/**
 * Update user nickname
 */

exports.updateUserNickname = async(function*(req, res) {
  const home = req.home;
  const index = home.users.map(user => user._id).indexOf(req.user._id);
  if (index === -1) {
    home.users.push({
      _id: req.user._id,
      nickname: req.body.nickname
    });
  }
  else {
    home.users[index].nickname = req.body.nickname;
  }
  try {
    yield home.uploadAndSave();
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
 * remove user nickname
 */

exports.removeUser = async(function*(req, res) {
  const home = req.home;
  const user = req.user;
  try {
    yield home.removeUser(req.user._id);
    yield user.removeHome(req.home._id);
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
 * Delete a home
 */

exports.destroy = async(function*(req, res) {
  yield req.home.remove();
  res.json({
    successful: true
  });
});
