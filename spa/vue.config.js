// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  css: {
    extract: false,
  },
  configureWebpack: {
    devtool: 'source-map',
    optimization: {
      splitChunks: false,
    },
    // mode: 'production',
    plugins: [
      // new BundleAnalyzerPlugin(),
    ],
  },
  productionSourceMap: true,
  devServer: {
    host: '0.0.0.0',
  },
  pwa: {
    iconPaths: {
      favicon32: 'images/fav/32.png',
      favicon16: 'images/fav/16.png',
      appleTouchIcon: 'images/fav/152.png',
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
    i18n: {
      locale: 'cz',
      fallbackLocale: 'cz',
      localeDir: 'locales',
      enableInSFC: true,
    },
  },
};
