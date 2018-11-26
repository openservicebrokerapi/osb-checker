const express = require('express')
const bodyParser = require('body-parser')
const app = express()
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())

const maxLastOperationQueries = 0 // After this number of LastOperation queries, the operation result is set to "succeeded"

var Validator = require('jsonschema').Validator
var validator = new Validator()
var provisionRequestSchema = require('./schemas/provision_request.json')
var updateRequestSchema = require('./schemas/update_request.json')
var bindingRequestSchema = require('./schemas/binding_request.json')
var serviceCatalog = require('./data/service_catalog.json')
var serviceInstances = []
var serviceBindings = []
var lastOperationQueries = 0

// Enable CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-Broker-API-Version, X-Broker-API-Originating-Identity, Content-Type, Authorization, Accept')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE')
  next()
})

// Catalog Management
// - GET /v2/catalog

app.get('/v2/catalog', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  res.send(serviceCatalog)
})

// TODO: This mock only supports async. Need to allow two modes and support accepts_incomplete=false.

app.put('/v2/service_instances/:instance_id', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete === 'false') {
    res.sendStatus(422)
    return
  }

  var messages = validateJsonSchema(req.body, provisionRequestSchema)
  if (messages !== '') {
    res.sendStatus(400)
    return
  }

  if (!serviceIdExists(serviceCatalog, req.body.service_id) ||
    !planIdExists(serviceCatalog, req.body.service_id, req.body.plan_id)) {
    res.sendStatus(400)
    return
  }

  var schemaCheckResults = parametersSchemaCheck(serviceCatalog, req.body.service_id, req.body.plan_id, 'create', req.body.parameters)
  if (schemaCheckResults !== '') {
    res.sendStatus(400)
    return
  }

  if (serviceInstanceExistsWithDifferentProperties(req.body.service_id, req.body.plan_id, req.params.instance_id)) {
    res.status(409).send({})
    return
  }

  if (serviceInstanceExists(req.body.service_id, req.body.plan_id, req.params.instance_id)) {
    res.status(200).send({})
    return
  } else {
    serviceInstances.push({
      'service_id': req.body.service_id,
      'plan_id': req.body.plan_id,
      'instance_id': req.params.instance_id
    })
    lastOperationQueries = 0
  }

  res.status(202).send(
    {
      'dashboard_url': 'http://example-dashboard.example.com/9189kdfsk0vfnku',
      'operation': 'task_10'
    }
  )
})

app.patch('/v2/service_instances/:instance_id', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete === 'false') {
    res.sendStatus(422)
    return
  }

  var messages = validateJsonSchema(req.body, updateRequestSchema)
  if (messages !== '') {
    console.log(messages)
    res.sendStatus(400)
    return
  }

  res.status(202).send({
    'operation': 'task_10'
  })
})

app.put('/v2/service_instances/:instance_id/service_bindings/:binding_id', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (req.query.accepts_incomplete) {
    res.sendStatus(422)
    return
  }

  var messages = validateJsonSchema(req.body, bindingRequestSchema)
  if (messages !== '') {
    console.log(messages)
    res.sendStatus(400)
    return
  }

  if (!serviceIdExists(serviceCatalog, req.body.service_id) ||
    !planIdExists(serviceCatalog, req.body.service_id, req.body.plan_id)) {
    res.sendStatus(400)
    return
  }

  if (serviceBindingExistsWithDifferentProperties(req.body.service_id, req.body.plan_id, req.params.instance_id, req.params.binding_id)) {
    res.status(409).send({})
    return
  }

  if (serviceBindingExists(req.body.service_id, req.body.plan_id, req.params.instance_id, req.params.binding_id)) {
    res.status(200).send({})
    return
  } else {
    serviceBindings.push({
      'service_id': req.body.service_id,
      'plan_id': req.body.plan_id,
      'instance_id': req.params.instance_id,
      'binding_id': req.params.binding_id
    })
  }

  res.status(201).send({
    'credentials': {
      'uri': 'mysql://mysqluser:pass@mysqlhost:3306/dbname',
      'username': 'mysqluser',
      'password': 'pass',
      'host': 'mysqlhost',
      'port': 3306,
      'database': 'dbname'
    }
  })
})

app.delete('/v2/service_instances/:instance_id/service_bindings/:binding_id', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (req.query.accepts_incomplete) {
    res.sendStatus(422)
    return
  }

  if (!req.query.service_id || !req.query.plan_id) {
    res.sendStatus(400)
    return
  }
  
  if (!serviceBindingExists(req.query.service_id, req.query.plan_id, req.params.instance_id, req.params.binding_id)) {
    res.status(410).send({})
    return
  }

  var found = findWhichContains(serviceBindings, 'binding_id', req.params.binding_id)
  var i = serviceBindings.indexOf(found)
  if (i > -1) {
    delete serviceBindings[i]
  }

  res.status(200).send({})
})

app.delete('/v2/service_instances/:instance_id', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete === 'false') {
    res.sendStatus(422)
    return
  }

  if (!req.query.service_id || !req.query.plan_id) {
    res.sendStatus(400)
    return
  }
  
  var found = findWhichContains(serviceInstances, 'instance_id', req.params.instance_id)
  if (!found) {
    res.status(410).send({})
    return
  }
  var i = serviceInstances.indexOf(found)
  if (i > -1) {
    delete serviceInstances[i]
  }

  // Although the spec doesn't fomulate how to deal with related binding resource when deleting
  // service instances, the mock server would remove all binding info related to the instance.
  found = findWhichContains(serviceBindings, 'instance_id', req.params.instance_id)
  var k = serviceBindings.indexOf(found)
  if (k > -1) {
    delete serviceBindings[k]
  }
  lastOperationQueries = 0

  res.status(202).send({
    'operation': 'task_10'
  })
})

app.get('/v2/service_instances/:instance_id/last_operation', function (req, res) {
  if (!checkRequest(req, res)) {
    return
  }
  if (++lastOperationQueries >= maxLastOperationQueries) {
    res.send({
      'state': 'succeeded',
      'description': 'Created service.'
    })
  } else {
    res.send({
      'state': 'in progress',
      'description': 'Creating service.'
    })
  }
})

app.listen(3000, function () {
  console.log('Mock OSB listening on port 3000!')
})

function checkRequest (req, res) {
  var username = ''
  var password = ''
  if (req.header('Authorization')) {
    var token = req.header('Authorization').split(/\s+/).pop() || ''
    var auth = Buffer.from(token, 'base64').toString()
    var parts = auth.split(/:/)
    username = parts[0]
    password = parts[1]
  }
  if (!req.header('X-Broker-API-Version') || req.header('X-Broker-API-Version') !== '2.13') {
    res.sendStatus(412)
    return false
  }
  if (!username || !password || username !== 'username' || password !== 'password') {
    res.sendStatus(401)
    return false
  }
  return true
}

function validateJsonSchema (body, schema) {
  var results = validator.validate(body, schema)
  if (!results.valid) {
    var message = 'Schema validation errors: ' + results.errors.length
    results.errors.forEach(function (e) {
      message += '\n' + e.instance + ' ' + e.message
    })
    return message
  } else {
    return ''
  }
}

function serviceIdExists (catalog, serviceId) {
  return (findWhichContains(catalog.services, 'id', serviceId) !== null)
}

function planIdExists (catalog, serviceId, planId) {
  var service = findWhichContains(catalog.services, 'id', serviceId)
  return (findWhichContains(service.plans, 'id', planId) !== null)
}

function serviceInstanceExistsWithDifferentProperties (serviceId, planId, instanceId) {
  for (var i in serviceInstances) {
    if (serviceInstances[i].instance_id === instanceId &&
      (serviceInstances[i].service_id !== serviceId || serviceInstances[i].plan_id !== planId)) {
      return true
    }
  }
  return false
}

function serviceInstanceExists (serviceId, planId, instanceId) {
  for (var i in serviceInstances) {
    if (serviceInstances[i].instance_id === instanceId &&
      serviceInstances[i].service_id === serviceId &&
      serviceInstances[i].plan_id === planId) {
      return true
    }
  }
  return false
}

function serviceBindingExistsWithDifferentProperties (serviceId, planId, instanceId, bindingId) {
  for (var i in serviceBindings) {
    if (serviceBindings[i].binding_id === bindingId &&
      serviceBindings[i].instance_id === instanceId &&
      (serviceBindings[i].service_id !== serviceId || serviceBindings[i].plan_id !== planId)) {
      return true
    }
  }
  return false
}

function serviceBindingExists (serviceId, planId, instanceId, bindingId) {
  for (var i in serviceBindings) {
    if (serviceBindings[i].binding_id === bindingId &&
      serviceBindings[i].instance_id === instanceId &&
      serviceBindings[i].service_id === serviceId &&
      serviceBindings[i].plan_id === planId) {
      return true
    }
  }
  return false
}

function findWhichContains (obj, key, value) {
  if (!obj) {
    return null
  }
  var found
  if (Array.isArray(obj)) {
    for (var i in obj) {
      found = findWhichContains(obj[i], key, value)
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

function parametersSchemaCheck (catalog, serviceId, planId, action, parameters) {
  var service = findWhichContains(catalog.services, 'id', serviceId)
  var plan = findWhichContains(service.plans, 'id', planId)
  var schemas = plan.schemas
  if (!schemas || !schemas.service_instance || !schemas.service_instance[action]) {
    return ''
  }
  var schema = schemas.service_instance[action].parameters
  if (!schema) {
    return ''
  }
  console.log(JSON.stringify(parameters))
  console.log(JSON.stringify(schema))
  return validateJsonSchema(parameters, schema)
}
