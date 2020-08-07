const mongo = require('../../utils/mongo.js');
const api = require('../../utils/api.js');
const auth = require('../../utils/authenticate');
const logger = require('../../utils/logging');
const passport = require('passport');

const passportFacebook = require('../socialAuth/facebook');
const passportTwitter = require('../socialAuth/twitter');
const passportGoogle = require('../socialAuth/google');


module.exports = (app) => {
  // app.options('/v1/auth/facebook', auth.cors);
  // app.options('/v1/auth/facebook/callback', auth.cors);
  // app.options('/v1/auth/twitter', auth.cors);
  // app.options('/v1/auth/twitter/callback', auth.cors);
  // app.options('/v1/auth/google', auth.cors);
  // app.options('/v1/auth/google/callback', auth.cors);
  
  // app.options("/fail", auth.cors);
  // app.options("/", auth.cors);
  
  app.get("/fail", auth.cors, (req, res) => {
    res.send("Failed attempt");
  });

  app.get("/", auth.cors, (req, res) => {
    console.log(req);
    res.send("Success");
  });


  // app.use(passport.initialize());
  // app.use(passport.session());

    /* FACEBOOK ROUTER */
  app.get('/v1/auth/facebook', auth.cors, passportFacebook.authenticate('facebook', { scope : 'email', display: 'popup' }));

  app.get('/v1/auth/facebook/callback', auth.cors,
  passportFacebook.authenticate('facebook', { successRedirect: "/", failureRedirect: '/fail' }));

  /* TWITTER ROUTER */
  app.get('/v1/auth/twitter', auth.cors, passportTwitter.authenticate('twitter', {scope:['include_email=true'], display: 'popup'}));

  app.get('/v1/auth/twitter/callback', auth.cors,
  passportTwitter.authenticate('twitter', { successRedirect: "/", failureRedirect: '/fail' },
  (req, res) => {
    console.log('req ===> ', req);
    console.log('res ===> ', res);

   //  const token = checkAndGetToken(req);
   //  console.log(token);
   //  res.redirect(`http://localhost:8080/social/${token}`);

  }));

  /* GOOGLE ROUTER */
  app.get('/v1/auth/google', passportGoogle.authenticate('google', {  session: false, scope: 'https://www.google.com/m8/feeds https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'}));

  app.get('/api/auth/google/callback', auth.cors,
    passportGoogle.authenticate('google', { failureRedirect: 'http://localhost:8080/fail' },
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

    const {email} = userData;

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
          new Date(), null, '1m', process.env.JWT_AUDIENCE, user.auth.email, user.auth.socialUser)
      
      
    }else{

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
}

const createSocialUser = (dbClient, data) => {
  const id = mongo.generateTimeId();
  const now = new Date();
  const {email, socialId, provider, firstName, lastName} = data;

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
}