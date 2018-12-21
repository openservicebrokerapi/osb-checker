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

var updateResponseSchema
var config = require('./config').getConfig()
var preparedRequest = require('./preparedRequest')

var maxDelayTimeout = 1800

function testUpdate (instanceId, validBody, isAsync, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    updateResponseSchema = require('../2.13/tests/test/schemas/update_response.json')
  } else {
    // supprt 2.14 here
    throw Error('testUpdate doesn\'t support this api version')
  }

  describe('UPDATE - request syntax', function () {
    testAPIVersionHeader('/v2/service_instances/' + instanceId, 'PATCH')
    testAuthentication('/v2/service_instances/' + instanceId, 'PATCH')

    if (isAsync) {
      testAsyncParameter('/v2/service_instances/' + instanceId, 'PATCH', validBody)
    }

    it('should reject if missing service_id', function (done) {
      var tempBody = _.clone(validBody)
      delete tempBody.service_id
      preparedRequest()
        .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
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
          var schemaCheckResult = validateCatalogSchema(tempBody, constants.TYPE_SERVICE_INSTANCE, constants.ACTION_UPDATE)
          callback(null, schemaCheckResult)
        },
        function (arg1, callback) {
          if (arg1 !== '') {
            preparedRequest()
              .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
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

  var lastOperationName
  describe('UPDATE', function () {
    it('should accept a valid update request', function (done) {
      var tempBody = _.clone(validBody)
      preparedRequest()
        .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send(tempBody)
        .expect(isAsync ? 202 : 200)
        .end(function (err, res) {
          if (err) return done(err)
          var message = validateJsonSchema(res.body, updateResponseSchema)
          if (message !== '') { done(new Error(message)) } else {
            lastOperationName = res.body.operation
            done()
          }
        })
    })

    if (isAsync) {
      describe('UPDATE - poll', function () {
        this.timeout(maxDelayTimeout * 1000)
        it('should return succeeded operation status after update', function (done) {
          pollInstanceLastOperationStatus(instanceId, lastOperationName, apiVersion, done)
        })
      })
    }

    describe('UPDATE - applied', function () {
      it('should return 200 OK when the request changes have been applied', function (done) {
        var tempBody = _.clone(validBody)
        preparedRequest()
          .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
          .set('X-Broker-API-Version', apiVersion)
          .auth(config.user, config.password)
          .send(tempBody)
          .expect(200, done)
      })
    })
  })
}

module.exports = testUpdate
