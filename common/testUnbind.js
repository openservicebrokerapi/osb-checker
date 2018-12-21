/* eslint-env node, mocha */
var testAPIVersionHeader = require('./testAPIVersionHeader')
var testAuthentication = require('./testAuthentication')
var validateJsonSchema = require('./validateJsonSchema')

var bindingDeleteResponseSchema
var config = require('./config').getConfig()
var preparedRequest = require('./preparedRequest')

function testUnbind (instanceId, bindingId, queryStrings, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    bindingDeleteResponseSchema = require('../2.13/tests/test/schemas/binding_delete_response.json')
  } else {
    // supprt 2.14 here
    throw Error('testUnbind doesn\'t support this api version')
  }

  describe('UNBINDING - delete syntax', function () {
    testAPIVersionHeader('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'DELETE')
    testAuthentication('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'DELETE')

    describe('DELETE', function () {
      it('should reject if missing service_id', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId + '?plan_id=' + queryStrings.plan_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(400, done)
      })
      it('should reject if missing plan_id', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId + '?service_id=' + queryStrings.service_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(400, done)
      })
      it('should accept a valid binding deletion request', function (done) {
        preparedRequest()
          .delete('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId +
          '?plan_id=' + queryStrings.plan_id +
          '&service_id=' + queryStrings.service_id)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            var message = validateJsonSchema(res.body, bindingDeleteResponseSchema)
            if (message !== '') { done(new Error(message)) } else { done() }
          })
      })

      describe('DELETE - gone', function () {
        it('should return 410 Gone when binding Id does not exist', function (done) {
          preparedRequest()
            .delete('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId +
            '?plan_id=' + queryStrings.plan_id +
            '&service_id=' + queryStrings.service_id)
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .expect(410, done)
        })
      })
    })
  })
}

module.exports = testUnbind
