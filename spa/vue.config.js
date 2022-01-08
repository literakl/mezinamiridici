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
    externals: {
      moment: 'moment'
    },
    devServer: {
      watchOptions: {
        ignored: [/node_modules/, /public/],
      },
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
    ],
  },
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
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
