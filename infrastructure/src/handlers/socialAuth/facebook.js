const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');

dotenv.config();
passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
passport.use('facebook',
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: process.env.FACEBOOK_REDIRECT_URI,
    },
    ((accessToken, refreshToken, profile, done) => {
      console.log(profile);
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
