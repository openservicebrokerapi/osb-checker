/* eslint-env node, mocha */
var testAPIVersionHeader = require('./testAPIVersionHeader')
var testAuthentication = require('./testAuthentication')
var testAsyncParameter = require('./testAsyncParameter')
var pollInstanceLastOperationStatus = require('./pollInstanceLastOperationStatus')
var validateJsonSchema = require('./validateJsonSchema')

var provisioningDeleteResponseSchema
var config
var preparedRequest

var maxDelayTimeout = 1800

function testDeprovision (instanceId, queryStrings, isAsync, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    provisioningDeleteResponseSchema = require('../2.13/tests/test/schemas/provisioning_delete_response.json')
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testDeprovision doesn\'t support this api version')
  }

  describe('DEPROVISIONING - delete syntax', function () {
    testAPIVersionHeader('/v2/service_instances/' + instanceId, 'DELETE')
    testAuthentication('/v2/service_instances/' + instanceId, 'DELETE')

    if (isAsync) {
      testAsyncParameter(
        '/v2/service_instances/' + instanceId + '?plan_id=' + queryStrings.plan_id + '&service_id=' + queryStrings.service_id,
        'DELETE',
        {}
      )
    }

    describe('DELETE', function () {
      it('should reject if missing service_id', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId + '?accepts_incomplete=true&plan_id=' + queryStrings.plan_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(400, done)
      })
      it('should reject if missing plan_id', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId + '?accepts_incomplete=true&service_id=' + queryStrings.service_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(400, done)
      })
      var lastOperationName
      it('should accept a valid service deletion request', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId +
          '?accepts_incomplete=true&plan_id=' + queryStrings.plan_id +
          '&service_id=' + queryStrings.service_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(isAsync ? 202 : 200)
          .end(function (err, res) {
            if (err) return done(err)
            var message = validateJsonSchema(res.body, provisioningDeleteResponseSchema)
            if (message !== '') { done(new Error(message)) } else {
              lastOperationName = res.body.operation
              done()
            }
          })
      })

      if (isAsync) {
        describe('DEPROVISION - poll', function () {
          this.timeout(maxDelayTimeout * 1000)
          it('should return succeeded operation status after deprovision', function (done) {
            pollInstanceLastOperationStatus(instanceId, lastOperationName, apiVersion, done)
          })
        })
      }
    })
  })
}

module.exports = testDeprovision
