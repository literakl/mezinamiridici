require('./path_env');

module.exports = {
  GOOGLE: {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GRANT_TYPE: 'authorization_code',
    TOKEN_URL: 'https://accounts.google.com/o/oauth2/token',
    PROFILE_URL: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
  },
  FACEBOOK: {
    CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
    CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,
    TOKEN_URL: 'https://graph.facebook.com/v2.4/oauth/access_token',
    PROFILE_URL: 'https://graph.facebook.com/v2.5/me?fields=email,name',
  },
  TWITTER: {
    CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    ALGORITHM: 'HMAC-SHA1',
    REQUEST_URL: 'https://api.twitter.com/oauth/request_token',
    ACCESS_URL: 'https://api.twitter.com/oauth/access_token',
    PROFILE_URL: 'https://api.twitter.com/1.1/account/verify_credentials.json',
  },
};
