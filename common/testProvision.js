/* eslint-env node, mocha */
var _ = require('underscore')
var async = require('async')

var testAPIVersionHeader = require('./testAPIVersionHeader')
var testAuthentication = require('./testAuthentication')
var testAsyncParameter = require('./testAsyncParameter')
var validateCatalogSchema = require('./validateCatalogSchema')
var pollInstanceLastOperationStatus = require('./pollInstanceLastOperationStatus')
var constants = require('./constants')
var validateJsonSchema = require('./validateJsonSchema')

var provisionResponseSchema
var config
var preparedRequest

var maxDelayTimeout = 1800

function testProvision (instanceId, validBody, isAsync, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    provisionResponseSchema = require('../2.13/tests/test/schemas/provision_response.json')
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testProvision doesn\'t support this api version')
  }

  describe('PROVISION - request syntax', function () {
    testAPIVersionHeader('/v2/service_instances/' + instanceId, 'PUT')
    testAuthentication('/v2/service_instances/' + instanceId, 'PUT')

    it('should reject if missing service_id', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.service_id
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if missing plan_id', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.plan_id
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if request payload is missing organization_guid', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.organization_guid
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if request payload is missing space_guid', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.space_guid
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if service_id is invalid', function (done) {
      var tempBody = _.clone(validBody)
      tempBody.service_id = 'xxxxx-xxxxx'
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(400, done)
    })
    it('should reject if plan_id is invalid', function (done) {
      var tempBody = _.clone(validBody)
      tempBody.plan_id = 'xxxxx-xxxxx'
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
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
          var schemaCheckResult = validateCatalogSchema(tempBody, constants.TYPE_SERVICE_INSTANCE, constants.ACTION_CREATE)
          callback(null, schemaCheckResult)
        },
        function (arg1, callback) {
          if (arg1 !== '') {
            preparedRequest()
              .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
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
  })

  if (isAsync) {
    testAsyncParameter('/v2/service_instances/' + instanceId, 'PUT', validBody)
  }

  var lastOperationName
  describe('PROVISION - new', function () {
    it('should accept a valid provision request', function (done) {
      var tempBody = _.clone(validBody)
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + (isAsync ? '?accepts_incomplete=true' : ''))
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(isAsync ? 202 : 201)
        .end(function (err, res) {
          if (err) return done(err)
          var message = validateJsonSchema(res.body, provisionResponseSchema)
          if (message !== '') { done(new Error(message)) } else {
            lastOperationName = res.body.operation
            done()
          }
        })
    })

    if (isAsync) {
      describe('PROVISION - poll', function () {
        this.timeout(maxDelayTimeout * 1000)
        testAPIVersionHeader('/v2/service_instances/' + instanceId + '/last_operation', 'GET')
        testAuthentication('/v2/service_instances/' + instanceId + '/last_operation', 'GET')

        it('should return succeeded operation status after provision', function (done) {
          pollInstanceLastOperationStatus(instanceId, lastOperationName, apiVersion, done)
        })
      })
    }
  })

  describe('PROVISION - existed', function () {
    it('should return 200 OK when instance Id exists with identical properties', function (done) {
      var tempBody = _.clone(validBody)
      preparedRequest()
        .put('/v2/service_instances/' + instanceId + (isAsync ? '?accepts_incomplete=true' : ''))
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(200)
        .end(function (err, res) {
          if (err) return done(err)
          var message = validateJsonSchema(res.body, provisionResponseSchema)
          if (message !== '') { done(new Error(message)) } else { done() }
        })
    })
  })

  if (config.conflictiveProvision) {
    describe('PROVISION - conflict', function () {
      it('should return 409 Conflict when instance Id exists with different properties', function (done) {
        var tempBody = _.clone(validBody)
        tempBody.service_id = config.conflictiveProvision.service_id
        tempBody.plan_id = config.conflictiveProvision.plan_id
        tempBody.parameters = config.conflictiveProvision.parameters
        preparedRequest()
          .put('/v2/service_instances/' + instanceId + (config.conflictiveProvision.async ? '?accepts_incomplete=true' : ''))
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .send(tempBody)
          .expect(409, done)
      })
    })
  }
}

module.exports = testProvision
