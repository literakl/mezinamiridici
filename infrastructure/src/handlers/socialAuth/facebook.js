const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require("dotenv");
  
dotenv.config();
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});
passport.use('facebook',
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI,
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile)
      const { email, first_name, last_name } = profile._json;
      const userData = {
        email,
        firstName: first_name,
        lastName: last_name
      };
      done(null, profile);
    }
  )
);

module.exports = passport;