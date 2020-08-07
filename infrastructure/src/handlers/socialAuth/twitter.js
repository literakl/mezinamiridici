const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const dotenv = require("dotenv");
  
dotenv.config();

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

passport.use('twitter',
  new TwitterStrategy(
    {
      consumerKey     : process.env.TWITTER_CLIENT_ID,
      consumerSecret  : process.env.TWITTER_CLIENT_SECRET,
      callbackURL     : process.env.TWITTER_REDIRECT_URI,
      // includeEmail    : true
      // passReqToCallback : true,
    },
    function(accessToken, refreshToken, profile, done) {
      const { email, first_name, last_name } = profile._json;
      const userData = {
        email,
        firstName: first_name,
        lastName: last_name
      };
      console.log('userData ==>', userData);
      done(null, profile);
    }
  )
);

module.exports = passport;