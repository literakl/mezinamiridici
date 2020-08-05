module.exports = {
  GOOGLE: {
    CLIENT_ID: '95508300833-qugcggn1r56acshl235oll2rp3i1boh8.apps.googleusercontent.com',
    CLIENT_SECRET: '1COTzhEH51s_wH690QPTlbcp',
    GRANT_TYPE: 'authorization_code',
    TOKEN_URL: 'https://accounts.google.com/o/oauth2/token',
    PROFILE_URL: 'https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses',
  },
  FACEBOOK: {
    CLIENT_ID: '262227181532658',
    CLIENT_SECRET: '2fe01bc4e14b9124d1daf0fb4d72374a',
    TOKEN_URL: 'https://graph.facebook.com/v2.4/oauth/access_token',
    PROFILE_URL: 'https://graph.facebook.com/v2.5/me?fields=email,name',
  },
  TWITTER: {
    CLIENT_ID: '16F8HYRJiVaeFaoBEvVgk6kfa',
    CLIENT_SECRET: 'euHhrar0ATMDzvDHqpw1AwWWzQeJ7AxZT7WAah9Ucl9lDfBHCd',
    PROFILE_URL: 'https://api.twitter.com/1.1/account/verify_credentials.json',
    REQUEST_URL: 'https://api.twitter.com/oauth/request_token',
    ACCESS_URL: 'https://api.twitter.com/oauth/access_token',
    ALGORITHM: 'HMAC-SHA1',
  },
};
