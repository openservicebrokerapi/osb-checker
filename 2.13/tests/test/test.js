var assert = require('assert');
var request = require('supertest');
var fs = require('fs');
var guid = require('guid');
var _ = require('underscore');

var config = require('./configs/config_mock.json');
var serviceCatalogSchema = require('./schemas/service_catalog.json');
var lastOperationSchema = require('./schemas/last_operation.json');
var provisionResponseSchema = require('./schemas/provision_response.json');
var updateResponseSchema = require('./schemas/provision_response.json');
var bindingResponseSchema = require('./schemas/binding_response.json');
var bindingDeleteResponseSchema = require('./schemas/binding_delete_response.json');
var provisioningDeleteResponseSchema = require('./schemas/provisioning_delete_response.json');
var Validator = require('jsonschema').Validator;
var validator = new Validator();

var url = config.url;
var apiVersion = config.apiVersion;

var caCert;
if (config.caCertFile) {
    caCert = fs.readFileSync(config.caCertFile);
}

function preparedRequest() {
    return caCert ? request.agent(url, {ca: caCert}) : request(url);
}

describe('GET /v2/catalog', function() {
    before(function() {
        //Plug in your environment initializer here
        // TODO: move it to the config file
    });

    describe('Query service catalog', function() {

        testAPIVersionHeader('/v2/catalog', 'GET');
        testAuthentication('/v2/catalog', 'GET');

        it('should return list of registered service classes as JSON payload', function(done){
            preparedRequest()
                .get('/v2/catalog')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res){
                    if (err) return done(err);
                    var message = validateJsonSchema(res.body, serviceCatalogSchema);
                    if (message != '')
                        done(new Error(message));
                    else
                        done();
                })
        });
    });
});

describe('Customized test cases', function(){
    _.each(config.cases, function(testCase){
        testLifecycle(testCase);
    });
});

function testLifecycle(testCase){
    describe(testCase.name, function() {
        var instanceId = guid.create().value;
        var currentPlanId;
        var currentBindingId;
        _.each(testCase.lifecycle, function(step){
            // TODO: expose an optional parameter for the timeout to the config file?
            switch (step.operation) {
                case 'provision':
                    currentPlanId = step.plan_id;
                    var validBody = {
                        'organization_guid': testCase.organization_guid,
                        'space_guid': testCase.space_guid,
                        'service_id': testCase.service_id,
                        'plan_id': currentPlanId,
                        'parameters': step.parameters
                    };
                    testProvision(instanceId, validBody, step.async);
                    break;
                case 'bind':
                    var validBody = {
                        'service_id': testCase.service_id,
                        'plan_id': currentPlanId,
                        'parameters': step.parameters
                    };
                    currentBindingId = guid.create().value;
                    testBind(instanceId, currentBindingId, validBody);
                    break;
                case 'unbind':
                    var queryStrings = {
                        'service_id': testCase.service_id,
                        'plan_id': currentPlanId
                    };
                    testUnbind(instanceId, currentBindingId, queryStrings);
                    break;
                case 'update':
                    var validBody = {
                        'service_id': testCase.service_id
                    };
                    if (step.plan_id) {
                        currentPlanId = step.plan_id;
                        validBody.plan_id = currentPlanId;
                    }
                    if (testCase.parameters) {
                        validBody.parameters = testCase.parameters;
                    }
                    testUpdate(instanceId, validBody, step.async);
                    break;
                case 'deprovision':
                    var queryStrings = {
                        'service_id': testCase.service_id,
                        'plan_id': currentPlanId
                    };
                    testDeprovision(instanceId, queryStrings, step.async);
                    break;
                default:
                    throw new Error('Unknown operation');
            }
        });
    });
}

function testProvision(instanceId, validBody, isAsync){
    describe('PROVISION - request syntax', function() {
        testAPIVersionHeader('/v2/service_instances/' + instanceId, 'PUT');
        testAuthentication('/v2/service_instances/' + instanceId, 'PUT');

        it ('should reject if missing service_id', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.service_id;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if missing plan_id', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.plan_id;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if request payload is missing organization_guid', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.organization_guid;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if request payload is missing space_guid', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.space_guid;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if service_id is invalid', function(done){
            var tempBody = _.clone(validBody);
            tempBody.service_id = 'xxxxx-xxxxx';
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if plan_id is invalid', function(done){
            var tempBody = _.clone(validBody);
            tempBody.plan_id = 'xxxxx-xxxxx';
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if parameters are not following schema', function(done){
            var tempBody = _.clone(validBody);
            tempBody.parameters = {
                'can-not': 'be-good'
            }
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
    });

    if (isAsync) {
        testAsyncParameter('/v2/service_instances/' + instanceId, 'PUT', validBody);
    }

    describe('PROVISION - new', function () {
        it ('should accept a valid provision request', function(done){
            var tempBody = _.clone(validBody);
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(isAsync ? 202 : 201)
            .end(function(err, res){
                if (err) return done(err);
                var message = validateJsonSchema(res.body, provisionResponseSchema);
                if (message!='')
                    done(new Error(message));
                else
                    done();
            })
        });

        testAPIVersionHeader('/v2/service_instances/' + instanceId + '/last_operation', 'GET');
        testAuthentication('/v2/service_instances/' + instanceId + '/last_operation', 'GET');

        // TODO: the query string should contain 'operation' for the last operation. FYI: https://github.com/openservicebrokerapi/servicebroker/blob/v2.13/spec.md#parameters.
        // TODO: https://github.com/openservicebrokerapi/osb-checker/pull/47 should fix polling until success here.
        describe('PROVISION - poll', function() {
            it ('should return last operation status', function(done){
                preparedRequest()
                    .get('/v2/service_instances/' + instanceId + '/last_operation')
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .expect(200)
                    .expect('Content-Type', /json/)
                    .end(function(err, res){
                        if (err) return done(err);
                        var message = validateJsonSchema(res.body, lastOperationSchema);
                        if (message!='')
                            done(new Error(message));
                        else
                            done();
                    })
                })
            });
    });

    describe('PROVISION - conflict', function () {
        it ('should return conflict when instance Id exists with different properties', function(done){
            if (!config.conflictiveProvision) {
                return done(new Error('missing conflictiveProvision in config file'));
            }
            var tempBody = _.clone(validBody);
            tempBody.service_id = config.conflictiveProvision.service_id;
            tempBody.plan_id = config.conflictiveProvision.plan_id;
            tempBody.parameters = config.conflictiveProvision.parameters;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId + (config.conflictiveProvision.async ? '?accepts_incomplete=true' : ''))
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(409, done)
        });
    });
}

function testUpdate(instanceId, validBody, isAsync){
    describe('UPDATE - request syntax', function() {

        testAPIVersionHeader('/v2/service_instances/' + instanceId, 'PATCH');
        testAuthentication('/v2/service_instances/' + instanceId, 'PATCH');

        if (isAsync) {
            testAsyncParameter('/v2/service_instances/' + instanceId, 'PATCH', validBody);
        }

        it ('should reject if missing service_id', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.service_id;
            preparedRequest()
            .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
    });

    describe('UPDATE', function () {
        testAPIVersionHeader('/v2/service_instances/' + instanceId + '/last_operation', 'GET');
        testAuthentication('/v2/service_instances/' + instanceId + '/last_operation', 'GET');

        // TODO: A similar fix like https://github.com/openservicebrokerapi/osb-checker/pull/47 should fix polling until success here.
        let testLastOperationStatus = function(body, done) {
            operation = body.operation
            endpoint = '/v2/service_instances/' + instanceId + '/last_operation'
            if (operation) {
                endpoint += '?operation=' + JSON.stringify(operation)
            }
            preparedRequest()
            .get(endpoint)
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res){
                if (err) return done(err);
                var message = validateJsonSchema(res.body, lastOperationSchema);
                if (message!='') done(new Error(message));
                done();
            })
        }

        it('should accept a valid update request', function(done){
            var tempBody = _.clone(validBody);
            preparedRequest()
            .patch('/v2/service_instances/' + instanceId + '?accepts_incomplete=true')
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(isAsync ? 202 : 200)
            .end(function(err, res){
                if (err) return done(err);
                var message = validateJsonSchema(res.body, updateResponseSchema);
                if (message!='') done(new Error(message));
                testLastOperationStatus(res.body, done)
            })
        });
    });
}

function testBind(instanceId, bindingId, validBody){
    describe('BINDING - request syntax', function() {

        testAPIVersionHeader('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'PUT');
        testAuthentication('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'PUT');

        it ('should reject if missing service_id', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.service_id;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId)
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        })
        it ('should reject if missing plan_id', function(done){
            var tempBody = _.clone(validBody);
            delete tempBody.plan_id;
            preparedRequest()
            .put('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId)
            .set('X-Broker-API-Version', apiVersion)
            .auth(config.user, config.password)
            .send(tempBody)
            .expect(400, done)
        });

        describe('NEW', function () {
            it ('should accept a valid binding request', function(done){
                var tempBody = _.clone(validBody);
                preparedRequest()
                .put('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(201)
                .end(function(err, res){
                    if (err) return done(err);
                    var message = validateJsonSchema(res.body, bindingResponseSchema);
                    if (message!='')
                    done(new Error(message));
                    else
                    done();
                })
            });
        });
    });
}

function testUnbind(instanceId, bindingId, queryStrings){
    describe('UNBINDING - delete syntax', function() {

        testAPIVersionHeader('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'DELETE');
        testAuthentication('/v2/service_instances/' + instanceId + '/service_bindings/' + bindingId, 'DELETE');

        describe('DELETE', function () {
            it ('should reject if missing service_id', function(done) {
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId + '?plan_id=' + queryStrings.plan_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(400, done)
            })
            it ('should reject if missing plan_id', function(done){
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId + '?service_id=' + queryStrings.service_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(400, done)
            })
            it ('should accept a valid binding deletion request', function(done){
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId +  '/service_bindings/' + bindingId
                + '?plan_id=' + queryStrings.plan_id
                + '&service_id=' + queryStrings.service_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(200)
                .end(function(err, res){
                    if (err) return done(err);
                    var message = validateJsonSchema(res.body, bindingDeleteResponseSchema);
                    if (message!='')
                    done(new Error(message));
                    else
                    done();
                })
            });
        });
    });
}

function testDeprovision(instanceId, queryStrings, isAsync){
    describe('DEPROVISIONING - delete syntax', function() {

        testAPIVersionHeader('/v2/service_instances/' + instanceId, 'DELETE');
        testAuthentication('/v2/service_instances/' + instanceId, 'DELETE');

        if (isAsync) {
            testAsyncParameter(
                '/v2/service_instances/' + instanceId + '?plan_id=' + queryStrings.plan_id + '&service_id=' + queryStrings.service_id,
                'DELETE',
                {}
            );
        }

        describe('DELETE', function () {
            it ('should reject if missing service_id', function(done) {
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId + '?accepts_incomplete=true&plan_id=' + queryStrings.plan_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(400, done)
            })
            it ('should reject if missing plan_id', function(done){
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId + '?accepts_incomplete=true&service_id=' + queryStrings.service_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(400, done)
            })
            it ('should accept a valid service deletion request', function(done){
                preparedRequest()
                .delete('/v2/service_instances/' + instanceId
                + '?accepts_incomplete=true&plan_id=' + queryStrings.plan_id
                + '&service_id=' + queryStrings.service_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(isAsync ? 202 : 200)
                .end(function(err, res){
                    if (err) return done(err);
                    var message = validateJsonSchema(res.body, provisioningDeleteResponseSchema);
                    if (message!='')
                    done(new Error(message));
                    else
                    done();
                })
            });
        });
    });
}

function testAuthentication(handler, verb) {
    if (config.authentication == 'basic') {
        it ('should reject unauthorized requests with 401', function(done) {
            if (verb == 'GET') {
                preparedRequest()
                    .get(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .expect(401, done);
            } else if (verb == 'PUT') {
                preparedRequest()
                    .put(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .send({})
                    .expect(401, done);
            } else if (verb == 'PATCH') {
                preparedRequest()
                    .patch(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .send({})
                    .expect(401, done);
            } else if (verb == 'DELETE') {
                preparedRequest()
                    .delete(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .send({})
                    .expect(401, done);
            }
        });
        it ('should reject bad credentials with 401', function(done) {
            if (verb == 'GET') {
                preparedRequest()
                    .get(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth('spock', 'spockpass')
                    .expect(401, done);
            } else if (verb == 'PUT') {
                preparedRequest()
                    .put(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth('spock', 'spockpass')
                    .send({})
                    .expect(401, done);
            } else if (verb == 'PATCH') {
                preparedRequest()
                    .patch(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth('spock', 'spockpass')
                    .send({})
                    .expect(401, done);
            } else if (verb == 'DELETE') {
                preparedRequest()
                    .delete(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth('spock', 'spockpass')
                    .expect(401, done);
            }
        })
    }
}

function testAPIVersionHeader(handler, verb) {
    it('should reject requests without X-Broker-API-Version header with 412', function(done) {
        if (verb == 'GET') {
            preparedRequest()
                .get(handler)
                .auth(config.user, config.password)
                .expect(412, done)
        } else if (verb == 'PUT') {
            preparedRequest()
                .put(handler)
                .auth(config.user, config.password)
                .send({})
                .expect(412, done)
        } else if (verb == 'PATCH') {
            preparedRequest()
                .patch(handler)
                .auth(config.user, config.password)
                .send({})
                .expect(412, done)
        } else if (verb == 'DELETE') {
            preparedRequest()
                .delete(handler)
                .auth(config.user, config.password)
                .expect(412, done)
        }
    })
}

function testAsyncParameter(handler, verb, body) {
    it ('should return 422 if request doesn\'t have the accepts_incomplete parameter', function(done) {
        if (verb == 'PUT') {
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
        } else if (verb == 'PATCH') {
            preparedRequest()
                .patch(handler)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({
                    service_id: body.service_id
                })
                .expect(422, done)
        } else if (verb == 'DELETE') {
            preparedRequest()
                .delete(handler)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(422, done)
        }
    });
    it ('should return 422 if request if the accepts_incomplete parameter is false', function(done) {
        if (verb == 'PUT') {
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
        } else if (verb == 'PATCH') {
            preparedRequest()
                .patch(handler + '?accepts_incomplete=false')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({
                    service_id: body.service_id
                })
                .expect(422, done)
        } else if (verb == 'DELETE') {
            preparedRequest()
                .delete(handler + '&accepts_incomplete=false')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(422, done)
        }
    });
}

function validateJsonSchema(body, schema) {
    var results = validator.validate(body, schema);
    if (!results.valid) {
        var message = 'Schema validation errors: ' + results.errors.length;
        results.errors.forEach(function(e){
            message += '\n' + e.instance + ' ' + e.message;
        });
        return message;
    }
    return '';
}
