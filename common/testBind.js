/* eslint-env node, mocha */
var _ = require('underscore')
var async = require('async')

var testAPIVersionHeader = require('./testAPIVersionHeader')
var testAuthentication = require('./testAuthentication')
var validateCatalogSchema = require('./validateCatalogSchema')
var constants = require('./constants')
var validateJsonSchema = require('./validateJsonSchema')

var bindingResponseSchema
var config
var preparedRequest

function testBind (instanceId, bindingId, validBody, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    bindingResponseSchema = require('../2.13/tests/test/schemas/binding_response.json')
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testBind doesn\'t support this api version')
  }

  describe('BINDING - request syntax', function () {
    testAPIVersionHeader('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'PUT')
    testAuthentication('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'PUT')

    it('should reject if missing service_id', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.service_id
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if missing plan_id', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.plan_id
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if parameters are not following schema', function (done) {
      var tempBody = _.clone(validBody)
      tempBody.parameters = {
        'can-not': 'be-good'
      }
      async.waterfall([
        function (callback) {
          var schemaCheckResult = validateCatalogSchema(tempBody, constants.TYPE_SERVICE_BINDING, constants.ACTION_CREATE)
          callback(null, schemaCheckResult)
        },
        function (arg1, callback) {
          if (arg1 !== '') {
            preparedRequest()
              .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
              .set('X-Broker-API-Version', apiVersion)
              .auth(config.user, config.password)
              .send(tempBody)
              .expect(400, done)
          }
          callback(null)
        }
      ], function (err) {
        done(err)
      })
    })

    describe('NEW', function () {
      it('should accept a valid binding request', function (done) {
        var tempBody = _.clone(validBody)
        preparedRequest()
          .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .send(tempBody)
          .expect(201)
          .end(function (err, res) {
            if (err) return done(err)
            var message = validateJsonSchema(res.body, bindingResponseSchema)
            if (message !== '') { done(new Error(message)) } else { done() }
          })
      })

      describe('NEW - existed', function () {
        it('should return 200 OK when binding Id with same instance Id exists with identical properties', function (done) {
          var tempBody = _.clone(validBody)
          preparedRequest()
            .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(200, done)
        })
      })

      if (config.conflictiveBind) {
        describe('NEW - conflict', function () {
          it('should return 409 Conflict when bingding Id with same instance Id exists with different properties', function (done) {
            var tempBody = _.clone(validBody)
            tempBody.service_id = config.conflictiveBind.service_id
            tempBody.plan_id = config.conflictiveBind.plan_id
            tempBody.parameters = config.conflictiveBind.parameters
            preparedRequest()
              .put('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId)
              .set('X-Broker-API-Version', apiVersion)
              .auth(config.user, config.password)
              .send(tempBody)
              .expect(409, done)
          })
        })
      }
    })
  })
}

module.exports = testBind
