module.exports = {
  configureWebpack: {
    devtool: 'source-map',
  },
  productionSourceMap: true,
  devServer: {
    host: '0.0.0.0',
  },
  pwa: {
    iconPaths: {
      favicon32: 'img/fav/32.png',
      favicon16: 'img/fav/16.png',
      appleTouchIcon: 'img/fav/152.png',
    },
  },
  chainWebpack: (config) => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap((options) => {
        // eslint-disable-next-line no-param-reassign
        options.transformAssetUrls = {
          img: 'src',
          image: 'xlink:href',
          'b-avatar': 'src',
          'b-img': 'src',
          'b-img-lazy': ['src', 'blank-src'],
          'b-card': 'img-src',
          'b-card-img': 'src',
          'b-card-img-lazy': ['src', 'blank-src'],
          'b-carousel-slide': 'img-src',
          'b-embed': 'src',
        };
        return options;
      });
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
