module.exports = {
  productionSourceMap: true,
  devServer: {
    host: 'localhost'
  },
  pluginOptions: {
    s3Deploy: {
      registry: undefined,
      awsProfile: 'default',
      region: 'eu-central-1',
      bucket: 'mezinamiridici.cz',
      createBucket: true,
      staticHosting: true,
      staticIndexPage: 'index.html',
      staticErrorPage: 'index.html',
      assetPath: 'dist',
      assetMatch: '**',
      deployPath: '/',
      acl: 'public-read',
      pwa: true,
      pwaFiles: 'service-worker.js',
      enableCloudfront: false,
      uploadConcurrency: 5,
      pluginVersion: '3.0.0',
    },
    i18n: {
      locale: 'cz',
      fallbackLocale: 'cz',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
