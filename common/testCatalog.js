/* eslint-env node, mocha */
var testAPIVersionHeader = require('./testAPIVersionHeader')
var testAuthentication = require('./testAuthentication')
var validateJsonSchema = require('./validateJsonSchema')

var serviceCatalogSchema
var config
var preparedRequest

function testCatalog (apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    serviceCatalogSchema = require('../2.13/tests/test/schemas/service_catalog.json')
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testCatalog doesn\'t support this api version')
  }
  describe('Query service catalog', function () {
    testAPIVersionHeader('/v2/catalog', 'GET')
    testAuthentication('/v2/catalog', 'GET')

    it('should return list of registered service classes as JSON payload', function (done) {
      preparedRequest()
        .get('/v2/catalog')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) return done(err)
          var message = validateJsonSchema(res.body, serviceCatalogSchema)
          if (message !== '') { done(new Error(message)) } else { done() }
        })
    })
  })
}

module.exports = testCatalog
