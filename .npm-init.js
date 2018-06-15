const 
  path = require('path')
  process = require('process')

const 
  envConfig = require(path.resolve('./config/env/' + process.env.NODE_ENV + '.js'))

module.exports = {
  config: envConfig
}