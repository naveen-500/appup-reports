const webpack = require('webpack');
module.exports = {
  runtimeCompiler: true,
  // Need to expose quilljs as globally. Ref: https://github.com/contentco/quill-emoji/issues/51#issuecomment-436208360
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        'window.Quill': 'quill/dist/quill.js',
        Quill: 'quill/dist/quill.js',
      })
    ],
  },
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  },
  publicPath: process.env.NODE_ENV === 'production' ? 'https://static.500apps.io/dev/' : '/'
};
