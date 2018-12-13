var Validator = require('jsonschema').Validator
var validator = new Validator()

function validateJsonSchema (body, schema) {
  var results = validator.validate(body, schema)
  if (!results.valid) {
    var message = 'Schema validation errors: ' + results.errors.length
    results.errors.forEach(function (e) {
      message += '\n' + e.instance + ' ' + e.message
    })
    return message
  }
  return ''
}

module.exports = validateJsonSchema
