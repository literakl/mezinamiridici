const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const dotenv = require("dotenv");
const { parsePollFilterParams } = require('../../utils/api');
  
dotenv.config();

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

passport.use(
  new GoogleStrategy(
    {
      clientID        : process.env.GOOGLE_CLIENT_ID,
      clientSecret    : process.env.GOOGLE_CLIENT_SECRET,
      callbackURL     : process.env.GOOGLE_REDIRECT_URI,
    },
    function(accessToken, refreshToken, profile, done) {



      process.nextTick(function() {

        const { email, given_name, family_name } = profile._json;
        const userData = {
          socialId: profile.id,
          provider: profile.provider,
          email,
          firstName: given_name,
          lastName: family_name
        };
        console.log("callback function starts=================================================================================================================");
        done(null, userData);
        
      });

    }
  )
);

module.exports = passport;