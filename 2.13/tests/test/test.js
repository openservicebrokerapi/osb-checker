/* eslint-env node, mocha */
var guid = require('guid')
var _ = require('underscore')

var config = require('./configs/config_mock.json')

var testCatalog = require('../../../common/testCatalog')
var testProvision = require('../../../common/testProvision')
var testUpdate = require('../../../common/testUpdate')
var testBind = require('../../../common/testBind')
var testUnbind = require('../../../common/testUnbind')
var testDeprovision = require('../../../common/testDeprovision')

describe('GET /v2/catalog', function () {
  before(function () {
    // Plug in your environment initializer here
    // TODO: move it to the config file
  })
  testCatalog()
})

describe('Customized test cases', function () {
  _.each(config.cases, function (testCase) {
    testLifecycle(testCase)
  })
})

function testLifecycle (testCase) {
  describe(testCase.name, function () {
    var instanceId = guid.create().value
    var currentPlanId
    var currentBindingId
    _.each(testCase.lifecycle, function (step) {
      // TODO: expose an optional parameter for the timeout to the config file?
      var validBody, queryStrings
      switch (step.operation) {
        case 'provision':
          currentPlanId = step.plan_id
          validBody = {
            'organization_guid': testCase.organization_guid,
            'space_guid': testCase.space_guid,
            'service_id': testCase.service_id,
            'plan_id': currentPlanId,
            'parameters': step.parameters
          }
          testProvision(instanceId, validBody, step.async)
          break
        case 'bind':
          validBody = {
            'service_id': testCase.service_id,
            'plan_id': currentPlanId,
            'parameters': step.parameters
          }
          currentBindingId = guid.create().value
          testBind(instanceId, currentBindingId, validBody)
          break
        case 'unbind':
          queryStrings = {
            'service_id': testCase.service_id,
            'plan_id': currentPlanId
          }
          testUnbind(instanceId, currentBindingId, queryStrings)
          break
        case 'update':
          validBody = {
            'service_id': testCase.service_id
          }
          if (step.plan_id) {
            currentPlanId = step.plan_id
            validBody.plan_id = currentPlanId
          }
          if (testCase.parameters) {
            validBody.parameters = testCase.parameters
          }
          testUpdate(instanceId, validBody, step.async)
          break
        case 'deprovision':
          queryStrings = {
            'service_id': testCase.service_id,
            'plan_id': currentPlanId
          }
          testDeprovision(instanceId, queryStrings, step.async)
          break
        default:
          throw new Error('Unknown operation')
      }
    })
  })
}
