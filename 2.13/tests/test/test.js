var assert = require('assert');
var request = require('supertest');  
var guid = require('guid');

var config = require('./configs/config_mock.json');
var serviceCatalogSchema = require('./schemas/service_catalog.json');
var lastOperationSchema = require('./schemas/last_operation.json');
var Validator = require('jsonschema').Validator;

var validator = new Validator();

var url = config.url;
var apiVersion = config.apiVersion;

describe('/v2/catalog', function() {
    before(function() {
        //Plug in your environment initializer here
    });

    describe('GET', function() {
        it('should reject requests without X-Broker-API-Version header with 412', function(done){
            request(url)
                .get('/v2/catalog')
                .auth(config.user, config.password)
                .expect(412, done);
        })
        it ('should reject unauthorized requests with 401', function(done) {
            request(url)
                .get('/v2/catalog')
                .set('X-Broker-API-Version', apiVersion)
                .expect(401, done);
        })
        it ('should reject bad credentials with 401', function(done) {
            request(url)
                .get('/v2/catalog')
                .set('X-Broker-API-Version', apiVersion)
                .auth("spock", "spockpass")
                .expect(401, done);
        })
        it('should return list of registered service classes as JSON payload', function(done){
            request(url)
                .get('/v2/catalog')
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .expect(200)
                .expect('Content-Type', /json/)
                .end(function(err, res){
                    if (err) return done(err);
                    var results = validator.validate(res.body, serviceCatalogSchema);
                    if (!results.valid) {
                        var message = "Schema validation errors: " + results.errors.length;
                        results.errors.forEach(function(e){
                            message += "\n" + e.message;
                        });
                        done(new Error(message));
                    }
                    else
                        done();
                })
        });
    });
});

describe('/v2/service_instances/:instance_id', function(){
    config.provisions.forEach(function(provision){
        var instance_id = provision.instance_id;
        if (!instance_id)
            instance_id = guid.create().value;        
        describe('PROVISION - request syntax', function() {
            it ('should return 422 if request doesn\'t have the accept_incomplete parameter', function(done){
                request(url)
                .put('/v2/service_instances/' + instance_id)
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(provision.body)
                .expect(422, done)
            })
            it ('should reject if missing service_id', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.service_id;
                request(url)
                .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                .set('X-Broker-API-Version', apiVersion)
                .auth(config.user, config.password)
                .send(tempBody)
                .expect(400, done)
            })
            it ('should reject if missing plan_id', function(done){
                tempBody = JSON.parse(JSON.stringify(provision.body)); 
                delete tempBody.plan_id;
                request(url)
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
                    request(url)
                    .put('/v2/service_instances/' + instance_id + "?accepts_incomplete=true")
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .send(tempBody)
                    .expect(202, done)
                })
                it ('should return last operation status', function(done){
                    request(url)
                    .get('/v2/service_instances/' + instance_id + '/last_operation')
                    .set('X-Broker-API-Version', apiVersion)
                    .auth(config.user, config.password)
                    .expect(200, done)
                    .expect('Content-Type', /json/)
                    .end(function(err, res){
                        if (err) return done(err);
                        var results = validator.validate(res.body, lastOperationSchema);
                        if (!results.valid) {
                            var message = "Schema validation errors: " + results.errors.length;
                            results.errors.forEach(function(e){
                                message += "\n" + e.message;
                            });
                            done(new Error(message));
                        }
                        else
                            done();
                    })
                })
            });
        }
    })
})