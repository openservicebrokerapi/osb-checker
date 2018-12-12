/* eslint-env node, mocha */
var config
var preparedRequest

function testAsyncParameter (handler, verb, body, apiVersion) {
  if (!apiVersion) {
    apiVersion = '2.13'
  }
  if (apiVersion === '2.13') {
    config = require('../2.13/tests/test/configs/config_mock.json')
    preparedRequest = require('../2.13/tests/test/preparedRequest')
  } else {
    // supprt 2.14 here
    throw Error('testAsyncParameter doesn\'t support this api version')
  }

  it('should return 422 if request doesn\'t have the accepts_incomplete parameter', function (done) {
    if (verb === 'PUT') {
      preparedRequest()
        .put(handler)
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send({
          service_id: body.service_id,
          plan_id: body.plan_id,
          organization_guid: body.organization_guid,
          space_guid: body.space_guid
        })
        .expect(422, done)
    } else if (verb === 'PATCH') {
      preparedRequest()
        .patch(handler)
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send({
          service_id: body.service_id
        })
        .expect(422, done)
    } else if (verb === 'DELETE') {
      preparedRequest()
        .delete(handler)
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .expect(422, done)
    }
  })
  it('should return 422 if request if the accepts_incomplete parameter is false', function (done) {
    if (verb === 'PUT') {
      preparedRequest()
        .put(handler + '?accepts_incomplete=false')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send({
          service_id: body.service_id,
          plan_id: body.plan_id,
          organization_guid: body.organization_guid,
          space_guid: body.space_guid
        })
        .expect(422, done)
    } else if (verb === 'PATCH') {
      preparedRequest()
        .patch(handler + '?accepts_incomplete=false')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .send({
          service_id: body.service_id
        })
        .expect(422, done)
    } else if (verb === 'DELETE') {
      preparedRequest()
        .delete(handler + '&accepts_incomplete=false')
        .set('X-Broker-API-Version', apiVersion)
        .auth(config.user, config.password)
        .expect(422, done)
    }
  })
}

module.exports = testAsyncParameter
