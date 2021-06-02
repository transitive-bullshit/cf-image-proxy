'use strict'

const { EnvironmentPlugin } = require('webpack')
const pick = require('lodash.pick')

module.exports = {
  target: 'webworker',
  entry: './src/index.js',
  devtool: 'cheap-source-map',
  plugins: [new EnvironmentPlugin(pick(process.env, ['NODE_ENV']))]
}
