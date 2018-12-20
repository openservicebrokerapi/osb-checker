var async = require('async')

var validateJsonSchema = require('./validateJsonSchema')

var config = require('./config').getConfig()
var preparedRequest = require('./preparedRequest')
var lastOperationSchema

function pollInstanceLastOperationStatus (instanceId, lastOperationName, apiVersion, done) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    lastOperationSchema = require('../2.13/tests/test/schemas/last_operation.json')
  } else {
    // supprt 2.14 here
    throw Error('pollInstanceLastOperationStatus doesn\'t support this api version')
  }

  var count = 0
  var lastOperationState = 'in progress'
  async.whilst(
    function () {
      return lastOperationState === 'in progress' && count <= config.maxPollingNum
    },
    function (callback) {
      setTimeout(function () {
        count++
        console.log(count.toString() + 'th polling last operation...')
        var url = '/v2/service_instances/' + instanceId + '/last_operation'
        if (lastOperationName) url += '?operation=' + lastOperationName
        preparedRequest()
          .get(url)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            if (err) callback(err)
            var message = validateJsonSchema(res.body, lastOperationSchema)
            if (message !== '') callback(new Error(message))
            lastOperationState = res.body.state
          })
        callback(null)
      }, config.pollingInterval * 1000)
    },
    function (err) {
      if (err) {
        return done(new Error('Polling last operation error!'))
      } else if (lastOperationState === 'failed') {
        return done(new Error('Polling last operation status failed!'))
      } else {
        return done()
      }
    }
  )
}

module.exports = pollInstanceLastOperationStatus
