var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

passport.use(new LocalStrategy({
    usernameField: 'email'
  },
  function(username, password, done) {
    User.findOne({ email: username }, function (err, user) {
      if (err) { return done(err); }
      // Return if user not found in database
      if (!user) {
        return done(null, false, {
          error_type: 'email',
          message: 'User not found'
        });
      }
      // Return if password is wrong
      if (!user.validPassword(password)) {
        return done(null, false, {
          error_type: 'pass',
          message: 'Password is wrong'
        });
      }
      // Return if has  not activate his account
      if (!user.active) {
        return done(null, false, {
          error_type: 'no-active',
          message: 'Please check your email address. An email is sent to activate your account'
        });
      }
      // If credentials are correct, return the user object
      return done(null, user);
    });
  }
));