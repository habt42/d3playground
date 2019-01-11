const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  devServer: {
    publicPath: '/dist',
    contentBase: path.resolve(__dirname, './src'),
    watchContentBase: true,
    port: 3000,
  }
}
