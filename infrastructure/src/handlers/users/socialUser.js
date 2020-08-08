const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const mongo = require('../../utils/mongo.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');

setupPassport();
// require('https').globalAgent.options.rejectUnauthorized = false;

module.exports = (app) => {
  // app.options('/api/auth/facebook', auth.cors);
  // app.options('/api/auth/facebook/callback', auth.cors);
  // app.options('/api/auth/twitter', auth.cors);
  // app.options('/api/auth/twitter/callback', auth.cors);
  // app.options('/api/auth/google', auth.cors);
  // app.options('/api/auth/google/callback', auth.cors);

  // app.options("/fail", auth.cors);
  // app.options("/", auth.cors);

  app.get('/fail', auth.cors, (req, res) => {
    res.send('Failed attempt');
  });

  app.get('/', auth.cors, (req, res) => {
    console.log(req);
    res.send('Success');
  });

  app.use(session({ secret: 'melody hensley is my spirit animal' }));
  app.use(passport.initialize());
  app.use(passport.session());

  /* FACEBOOK ROUTER */
  app.get('/api/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

  app.get('/api/auth/facebook/callback',
    passport.authenticate('facebook', { successRedirect: '/', failureRedirect: '/fail' }));

  /* TWITTER ROUTER */
  app.get('/api/auth/twitter', passport.authenticate('twitter', { scope: ['include_email=true'] }));

  app.get('/api/auth/twitter/callback',
    passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/fail' },
      (req, res) => {
        console.log('req ===> ', req);
        console.log('res ===> ', res);

        //  const token = checkAndGetToken(req);
        //  console.log(token);
        //  res.redirect(`http://localhost:8080/social/${token}`);
      }));

  /* GOOGLE ROUTER */
  app.get('/api/auth/google', passport.authenticate('google', { session: false, scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile' }));

  app.get('/api/auth/google/callback', auth.cors,
    passport.authenticate('google', { failureRedirect: 'http://localhost:8080/fail' },
      (req, res) => {
        console.log('req ===> ', req);
        console.log('res ===> ', res);

        //  const token = checkAndGetToken(req);
        //  console.log(token);
        //  res.redirect(`http://localhost:8080/social/${token}`);
      }));
};

const checkAndGetToken = async (userData) => {
  try {
    const dbClient = await mongo.connectToDatabase();
    logger.debug('Mongo connected');

    const { email } = userData;

    const user = await mongo.findUser(dbClient, { email }, { projection: { auth: 1, 'bio.nickname': 1, roles: 1 } });
    logger.debug('User fetched');

    if (user) {
      logger.debug(`User found ${email}`);

      // when normal user login as social or the user is completed social user.
      if (user.auth.verified) {
        return auth.createTokenFromUser(user);
      }
      // the user is incomplete user
      return auth.createToken(user._id, user.bio.nickname,
        new Date(), null, '1m', process.env.JWT_AUDIENCE, user.auth.email, user.auth.socialUser);
    } else {
      // the user is new social user

      // jwt.verify(token, process.env.JWT_SECRET ,{ audience: process.env.JWT_AUDIENCE }, function(err, decoded) {
      //   console.log(err, decoded);
      // });

      logger.debug(`User not found ${email}`);
      const socialUser = await createSocialUser(dbClient, userData);

      const token = auth.createToken(socialUser._id, socialUser.bio.nickname,
        new Date(), null, '1m', process.env.JWT_AUDIENCE, socialUser.email, socialUser.auth.socialUser);

      return token;
    }
  } catch (err) {
    logger.error('Request failed', err);
  }
};

const createSocialUser = (dbClient, data) => {
  const id = mongo.generateTimeId();
  const now = new Date();
  const { email, socialId, provider, firstName, lastName } = data;

  const userDoc = {
    _id: id,
    auth: {
      email,
      pwdTimestamp: now,
      verified: false,
      socialUser: true,
      oaut: {
        socialId,
        provider,
        firstName,
        lastName,
      },
    },
    bio: {
      nickname: firstName + lastName,
    },
    driving: {},
    prefs: {
      public: true,
    },
    consent: {
      terms: now,
      data: now,
    },
  };

  dbClient.db().collection('users').insertOne(userDoc);
  return userDoc;
};

passport.serializeUser((user, cb) => {
  console.log('serializeUser to session');
  console.log(user);
  cb(null, user);
});

passport.deserializeUser((obj, cb) => {
  console.log('deserializeUser from session');
  console.log(obj);
  cb(null, obj);
});

function setupPassport() {
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
}
