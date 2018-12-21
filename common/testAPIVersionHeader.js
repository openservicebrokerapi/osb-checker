/* eslint-env node, mocha */
require('./config')
var config = require('./config').getConfig()
var preparedRequest = require('./preparedRequest')

function testAPIVersionHeader (handler, verb, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion !== '2.13') {
    throw Error('testAPIVersionHeader doesn\'t support this api version')
  }

  it('should reject requests without X-Broker-API-Version header with 412', function (done) {
    if (verb === 'GET') {
      preparedRequest()
        .get(handler)
        .auth(config.user, config.password)
        .expect(412, done)
    } else if (verb === 'PUT') {
      preparedRequest()
        .put(handler)
        .auth(config.user, config.password)
        .send({})
        .expect(412, done)
    } else if (verb === 'PATCH') {
      preparedRequest()
        .patch(handler)
        .auth(config.user, config.password)
        .send({})
        .expect(412, done)
    } else if (verb === 'DELETE') {
      preparedRequest()
        .delete(handler)
        .auth(config.user, config.password)
        .expect(412, done)
    }
  })
}

module.exports = testAPIVersionHeader
