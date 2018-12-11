var _ = require('underscore')

var constants = require('./constants')
var validateJsonSchema = require('./validateJsonSchema')

var config
var preparedRequest

function validateCatalogSchema (tempBody, schemaType, action, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testProvision doesn\'t support this api version')
  }

  preparedRequest()
    .get('/v2/catalog')
    .set('X-Broker-API-Version', apiVersion)
    .auth(config.user, config.password)
    .expect(200)
    .expect('Content-Type', /json/)
    .end(function (err, res) {
      if (err) {
        var message = 'Get catalog result failed: ' + err
        return message
      }
      var catalog = _.clone(res.body)
      var schemaCheckResults = parametersSchemaCheck(catalog, tempBody.service_id, tempBody.plan_id, schemaType, action, tempBody.parameters)
      if (schemaCheckResults !== '') {
        message = 'Validate schema parameters failed!'
        return message
      }
    })
  return ''
}

function findWhichContains (obj, key, value) {
  if (!obj) {
    return null
  }
  if (Array.isArray(obj)) {
    for (var i in obj) {
      var found = findWhichContains(obj[i], key, value)
      if (found) return found
    }
  } else if (typeof obj === 'object') {
    for (var k in obj) {
      if (k === key && obj[k] === value) {
        return obj
      }
      found = findWhichContains(obj[k], key, value)
      if (found) return found
    }
  }
  return null
}

function parametersSchemaCheck (catalog, serviceId, planId, schemaType, action, parameters) {
  var service = findWhichContains(catalog.services, 'id', serviceId)
  var plan = findWhichContains(service.plans, 'id', planId)
  var schemas = plan.schemas
  var schemaParameters
  if (schemaType === constants.TYPE_SERVICE_INSTANCE) {
    if (!schemas || !schemas.service_instance || !schemas.service_instance[action]) {
      return ''
    }
    schemaParameters = schemas.service_instance[action].parameters
  } else if (schemaType === constants.TYPE_SERVICE_BINDING) {
    if (!schemas || !schemas.service_binding || !schemas.service_binding[action]) {
      return ''
    }
    schemaParameters = schemas.service_binding[action].parameters
  }
  if (!schemaParameters) {
    return ''
  }
  return validateJsonSchema(parameters, schemaParameters)
}

module.exports = validateCatalogSchema
