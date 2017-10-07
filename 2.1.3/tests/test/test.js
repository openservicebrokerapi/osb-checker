var assert = require('assert');
var request = require('supertest');  
var guid = require('guid');

var config = require('./config_azure.json');
var serviceCatalogSchema = require('./service_catalog.json');
var Validator = require('jsonschema').Validator;

var validator = new Validator();

var url = config.url;
var apiVersion = config.apiVersion;

describe('/v2/catalog', function() {
    describe('GET', function() {
        it('should reject requests without X-Broker-API-Version header', function(done){
            request(url)
                .get('/v2/catalog')
                .auth(config.user, config.password)
                .expect(412, done);
        })
        it ('should reject unauthorized requests', function(done) {
            request(url)
                .get('/v2/catalog')
                .expect(401, done);
        })
        it('should return list of registered service classes', function(done){
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
        describe('PROVISION', function() {
            var instance_id = provision.instance_id;
            if (!instance_id)
                instance_id = guid.create().value;
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
    })
})