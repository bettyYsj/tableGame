
const mongoose = require('mongoose');
const User = mongoose.model('User');

var passport = require('passport')
  , WeappStrategy = require('./passport-strategy-weapp')
  ;

module.exports = function(app) {
  
  passport.use('weapp',new WeappStrategy({
    requireState: false
  }, function(profile, done){
    User.findOne({weappid:profile['openId']},function(err,user){
      console.log(23333333333);
      console.log(user);
      if (user) {
						// 用户更改了昵称或者头像
						if (user.nickname != profile['nickName'] || user.avatar != profile['avatarUrl']){
							
			  			user.nickname = profile['nickName']
        			user.avatar   = profile['avatarUrl']
							user.save(function(err){
              
								return done(err, user);
							})
						} else {
            	return done(null, user); // user found, return that user
						}
      } else {
            // if there is no user found with that facebook id, create them
        var user = new User()
        console.log(profile)
        user.weappid  = profile['openId']
			  user.username = profile['openId']
			  user.nickname = profile['nickName']
        user.avatar   = profile['avatarUrl']
        user.sessionKey   = profile['sessionKey']

        user.save(function(err) {
           if (err) console.log(err);
              return done(err, user);
        });
        console.log(user._id);
      } // if...else

    }) // findOne
  })); //passport.use

}
