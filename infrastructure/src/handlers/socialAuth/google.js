const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const dotenv = require('dotenv');

dotenv.config();

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    ((accessToken, refreshToken, profile, done) => {
      process.nextTick(() => {
        // eslint-disable-next-line camelcase
        const { email, given_name, family_name } = profile._json;
        const userData = {
          socialId: profile.id,
          provider: profile.provider,
          email,
          firstName: given_name,
          lastName: family_name,
        };
        console.log('userData ==>', userData);
        done(null, userData);
      });
    }),
  ),
);

module.exports = passport;
