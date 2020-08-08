const passport = require('passport');
const TwitterStrategy = require('passport-twitter').Strategy;
const dotenv = require('dotenv');

dotenv.config();

passport.serializeUser((user, cb) => {
  console.log(user);
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  console.log(obj);
  cb(null, obj);
});

passport.use('twitter',
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CLIENT_ID,
      consumerSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: process.env.TWITTER_REDIRECT_URI,
      // includeEmail    : true
      // passReqToCallback : true,
    },
    ((accessToken, refreshToken, profile, done) => {
      // eslint-disable-next-line camelcase
      const { email, first_name, last_name } = profile._json;
      const userData = {
        email,
        firstName: first_name,
        lastName: last_name,
      };
      console.log('userData ==>', userData);
      done(null, profile);// TODO userData?
    }),
  ));

module.exports = passport;
