var assert = require('assert');
var request = require('supertest');  
var fs = require('fs');
var guid = require('guid');

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
                    if (message != "")
                        done(new Error(message));
                    else
                        done();
                })
        });
    });
});

describe('PUT /v2/service_instances/:instance_id', function(){
    config.provisions.forEach(function(provision){
        var instance_id = provision.instance_id;
        if (!instance_id)
            instance_id = guid.create().value;        
        describe('PROVISION - request syntax', function() {     
            
            testAPIVersionHeader('/v2/service_instances/' + instance_id, 'PUT');
            testAuthentication('/v2/service_instances/' + instance_id, 'PUT');

            if (provision.async) 
                testAsyncParameter('/v2/service_instances/' + instance_id, 'PUT');

            it ('should reject if missing service_id', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.service_id;
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if missing plan_id', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.plan_id;
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if request payload is missing organization_guid', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.organization_guid;
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if request payload is missing space_guid', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.space_guid;
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if service_id is invalid', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                tempBody.service_id = "xxxxx-xxxxx";
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if plan_id is invalid', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                tempBody.plan_id = "xxxxx-xxxxx";
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if parameters are not following schema', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                tempBody.parameters = {
                    "can-not": "be-good"
                }                
                preparedRequest()
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
        });
        if (provision.scenario == "new") {
            describe("PROVISION - new", function () {
                it ('should accept a valid provision request', function(done){
                    tempBody = JSON.parse(JSON.stringify(provision.body)); 
                    preparedRequest()
                    .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(202)
                    .end(function(err, res){
                        if (err) return done(err);
                        var message = validateJsonSchema(res.body, provisionResponseSchema);
                        if (message!="")
                            done(new Error(message));
                        else
                            done();
                    })
                });
                
                testAPIVersionHeader('/v2/service_instances/' + instance_id + '/last_operation', 'GET');
                testAuthentication('/v2/service_instances/' + instance_id + '/last_operation', 'GET');

                describe("PROVISION - query after new", function() {
                    it ('should return last operation status', function(done){
                        preparedRequest()
                            .get('/v2/service_instances/' + instance_id + '/last_operation')
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .end(function(err, res){
                                if (err) return done(err);
                                var message = validateJsonSchema(res.body, lastOperationSchema);
                                if (message!="")
                                    done(new Error(message));
                                else
                                    done();
                            })
                        })
                    });
            });
        } else if (provision.scenario == "conflict") {
            describe("PROVISION - conflict", function () {
                it ('should return conflict when instance Id exists with different properties', function(done){
                    tempBody = JSON.parse(JSON.stringify(provision.body)); 
                    preparedRequest()
                    .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(409, done)                    
                });
            });
        }
    })
})

describe('PATCH /v2/service_instance/:instance_id', function() {
    config.updates.forEach(function(update) {
        var instance_id = update.instance_id;
        if (!instance_id)
            instance_id = guid.create().value;   
        describe('UPDATE - request syntax', function() {     
            
            testAPIVersionHeader('/v2/service_instances/' + instance_id, 'PATCH');
            testAuthentication('/v2/service_instances/' + instance_id, 'PATCH');

            if (update.async) 
                testAsyncParameter('/v2/service_instances/' + instance_id, 'PATCH');

            it ('should reject if missing service_id', function(done){
                tempBody = JSON.parse(JSON.stringify(update.body)); 
                delete tempBody.service_id;
                preparedRequest()
                    .patch('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(400, done)
            })
        });
        if (update.scenario == "update") {
            describe("UPDATE", function () {
                it ('should accept a valid update request', function(done){
                    tempBody = JSON.parse(JSON.stringify(update.body)); 
                    preparedRequest()
                    .patch('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(202)
                    .end(function(err, res){
                        if (err) return done(err);
                        var message = validateJsonSchema(res.body, updateResponseSchema);
                        if (message!="")
                            done(new Error(message));
                        else
                            done();
                    })
                });
                
                testAPIVersionHeader('/v2/service_instances/' + instance_id + '/last_operation', 'GET');
                testAuthentication('/v2/service_instances/' + instance_id + '/last_operation', 'GET');

                describe("PROVISION - query after new", function() {
                    it ('should return last operation status', function(done){
                        preparedRequest()
                            .get('/v2/service_instances/' + instance_id + '/last_operation')
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(200)
                            .expect('Content-Type', /json/)
                            .end(function(err, res){
                                if (err) return done(err);
                                var message = validateJsonSchema(res.body, lastOperationSchema);
                                if (message!="")
                                    done(new Error(message));
                                else
                                    done();
                            })
                        })
                    });
            });
        }
    });
});

describe('PUT /v2/service_instance/:instance_id/service_bindings/:binding_id', function() {
    config.bindings.forEach(function(binding) {
        var instance_id = binding.instance_id;
        if (!instance_id)
            instance_id = guid.create().value;   
        var binding_id = binding.binding_id;
        if (!binding_id)
            binding_id = guid.create().value;   
        
        describe('BINDING - request syntax', function() {     
                                
            testAPIVersionHeader('/v2/service_instances/' + instance_id + '/service_bindings/' + binding_id, 'PUT');
            testAuthentication('/v2/service_instances/' + instance_id + '/service_bindings/' + binding_id, 'PUT');

            it ('should reject if missing service_id', function(done){
                tempBody = JSON.parse(JSON.stringify(binding.body)); 
                delete tempBody.service_id;
                preparedRequest()
                    .put('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(400, done)
            })
            it ('should reject if missing plan_id', function(done){
                tempBody = JSON.parse(JSON.stringify(binding.body)); 
                delete tempBody.plan_id;
                preparedRequest()
                    .put('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(400, done)
            });

            if (binding.scenario == "new") {
                describe("NEW", function () {
                    it ('should accept a valid binding request', function(done){
                        tempBody = JSON.parse(JSON.stringify(binding.body)); 
                        preparedRequest()
                        .put('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id)
                        .set('X-Broker-API-Version', apiVersion)
                        .auth(config.user, config.password)
                        .send(tempBody)
                        .expect(201)
                        .end(function(err, res){
                            if (err) return done(err);
                            var message = validateJsonSchema(res.body, bindingResponseSchema);
                            if (message!="")
                                done(new Error(message));
                            else
                                done();
                        })
                    });
                });
            }
        });
    });
});

describe('DELETE /v2/service_instance/:instance_id/service_bindings/:binding_id', function() {
    config.bindings.forEach(function(binding) {
        if (binding.scenario == "delete") {
            var instance_id = binding.instance_id;
            if (!instance_id)
                instance_id = guid.create().value;   
            var binding_id = binding.binding_id;
            if (!binding_id)
                binding_id = guid.create().value;   
            describe('BINDING - delete syntax', function() {     
                
                testAPIVersionHeader('/v2/service_instances/' + instance_id + '/service_bindings/' + binding_id, 'DELETE');
                testAuthentication('/v2/service_instances/' + instance_id + '/service_bindings/' + binding_id, 'DELETE');

                describe('DELETE', function () {
                    it ('should reject if missing service_id', function(done) {                
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id + "?plan_id=" + binding.body.plan_id)
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(400, done)
                    })
                    it ('should reject if missing plan_id', function(done){                
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id + "?service_id=" + binding.body.service_id)                    
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(400, done)
                        })
                    it ('should accept a valid binding deletion request', function(done){
                        tempBody = JSON.parse(JSON.stringify(binding.body)); 
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id +  '/service_bindings/' + binding_id 
                                + "?plan_id=" + binding.body.plan_id
                                + "&service_id=" + binding.body.service_id)
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(200)
                            .end(function(err, res){
                                if (err) return done(err);
                                var message = validateJsonSchema(res.body, bindingDeleteResponseSchema);
                                if (message!="")
                                    done(new Error(message));
                                else
                                    done();
                        })
                    });
                });
            });
        }
    });
});

describe('DELETE /v2/service_instance/:instance_id', function() {
    config.bindings.forEach(function(binding) {
        if (binding.scenario == "delete") {
            var instance_id = binding.instance_id;
            if (!instance_id)
                instance_id = guid.create().value;   
            
            describe('DEPROVISIONING - delete syntax', function() {     
                
                testAPIVersionHeader('/v2/service_instances/' + instance_id, 'DELETE');
                testAuthentication('/v2/service_instances/' + instance_id, 'DELETE');

                if (binding.async) 
                    testAsyncParameter('/v2/service_instances/' + instance_id, 'DELETE');

                describe("DELETE", function () { 
                    it ('should reject if missing service_id', function(done) {                
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id + "?accepts_incomplete=true&plan_id=" + binding.body.plan_id)
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(400, done)
                    })
                    it ('should reject if missing plan_id', function(done){                
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id + "?accepts_incomplete=true&service_id=" + binding.body.service_id)                    
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(400, done)
                        })
                    it ('should accept a valid service deletion request', function(done){
                        tempBody = JSON.parse(JSON.stringify(binding.body)); 
                        preparedRequest()
                            .delete('/v2/service_instances/' + instance_id 
                                + "?accepts_incomplete=true&plan_id=" + binding.body.plan_id
                                + "&service_id=" + binding.body.service_id)
                            .set('X-Broker-API-Version', apiVersion)
                            .auth(config.user, config.password)
                            .expect(202)
                            .end(function(err, res){
                                if (err) return done(err);
                                var message = validateJsonSchema(res.body, provisioningDeleteResponseSchema);
                                if (message!="")
                                    done(new Error(message));
                                else
                                    done();
                        })
                    });
                });
            });
        }
    });
});

function testAuthentication(handler, verb) {
    if (config.authentication == "basic") {
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
                    .auth("spock", "spockpass")
                    .expect(401, done);
            } else if (verb == 'PUT') {
                preparedRequest()
                    .put(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth("spock", "spockpass")
                    .send({})
                    .expect(401, done);
            } else if (verb == 'PATCH') {
                preparedRequest()
                    .patch(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth("spock", "spockpass")
                    .send({})
                    .expect(401, done);
            } else if (verb == 'DELETE') {
                preparedRequest()
                    .delete(handler)
                    .set('X-Broker-API-Version', apiVersion)
                    .auth("spock", "spockpass")
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
function testAsyncParameter(handler, verb) {
    it ('should return 422 if request doesn\'t have the accept_incomplete parameter', function(done) {
        if (verb == 'PUT') {
            preparedRequest()
                .put(handler)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({})
                .expect(422, done)
        } else if (verb == 'PATCH') {
            preparedRequest()
                .patch(handler)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({})
                .expect(422, done)
        } else if (verb == 'DELETE') {
            preparedRequest()
                .delete(handler)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(422, done)
        }
    });
    it ('should return 422 if request if the accept_incomplete parameter is false', function(done) {
        if (verb == 'PUT') {
            preparedRequest()
                .put(handler + '?accepts_incomplete=false')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({})
                .expect(422, done)
        } else if (verb == 'PATCH') {
            preparedRequest()
                .patch(handler + '?accepts_incomplete=false')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send({})
                .expect(422, done)
        } else if (verb == 'DELETE') {
            preparedRequest()
                .delete(handler + '?accepts_incomplete=false')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(422, done)
        }
    });
}
function validateJsonSchema(body, schema) {
    var results = validator.validate(body, schema);
    if (!results.valid) {
        var message = "Schema validation errors: " + results.errors.length;
        results.errors.forEach(function(e){
            message += "\n" + e.instance + " " + e.message;
        });
        return message;
    }
    else
        return "";
}