const nodeCron = require('node-cron')

const cron = () => {
  nodeCron.schedule('*/5 * * * *', () => {
    console.log('scheduler :: cron')
  })
}

module.exports = {
  initialize: async () => {
    cron()
  }
}
