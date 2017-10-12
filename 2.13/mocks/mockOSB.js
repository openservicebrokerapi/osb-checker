const express = require('express');
const bodyParser = require('body-parser');
const app = express()
            .use(bodyParser.urlencoded({extended: false}))
            .use(bodyParser.json());

var Validator = require('jsonschema').Validator;
var validator = new Validator();
var provisionRequestSchema = require('./schemas/provision_request.json');
var updateRequestSchema = require('./schemas/update_request.json');
var bindingRequestSchema = require('./schemas/binding_request.json');

//Catalog Management
//- GET /v2/catalog
app.get('/v2/catalog', function (req,res) {
  if (!checkRequest(req,res))
    return;
    res.send(
        {
            "services": [{
              "name": "fake-service",
              "id": "acb56d7c-XXXX-XXXX-XXXX-feb140a59a66",
              "description": "fake service",
              "tags": ["no-sql", "relational"],
              "requires": ["route_forwarding"],
              "bindable": true,
              "metadata": {
                "provider": {
                  "name": "The name"
                },
                "listing": {
                  "imageUrl": "http://example.com/cat.gif",
                  "blurb": "Add a blurb here",
                  "longDescription": "A long time ago, in a galaxy far far away..."
                },
                "displayName": "The Fake Broker"
              },
              "dashboard_client": {
                "id": "398e2f8e-XXXX-XXXX-XXXX-19a71ecbcf64",
                "secret": "277cabb0-XXXX-XXXX-XXXX-7822c0a90e5d",
                "redirect_uri": "http://localhost:1234"
              },
              "plan_updateable": true,
              "plans": [{
                "name": "fake-plan-1",
                "id": "d3031751-XXXX-XXXX-XXXX-a42377d3320e",
                "description": "Shared fake Server, 5tb persistent disk, 40 max concurrent connections",
                "free": false,
                "metadata": {
                  "max_storage_tb": 5,
                  "costs":[
                      {
                         "amount":{
                            "usd":99.0
                         },
                         "unit":"MONTHLY"
                      },
                      {
                         "amount":{
                            "usd":0.99
                         },
                         "unit":"1GB of messages over 20GB"
                      }
                   ],
                  "bullets": [
                    "Shared fake server",
                    "5 TB storage",
                    "40 concurrent connections"
                  ]
                },
                "schemas": {
                  "service_instance": {
                    "create": {
                      "parameters": {
                        "$schema": "http://json-schema.org/draft-04/schema#",
                        "type": "object",
                        "properties": {
                          "billing-account": {
                            "description": "Billing account number used to charge use of shared fake server.",
                            "type": "string"
                          }
                        }
                      }
                    },
                    "update": {
                      "parameters": {
                        "$schema": "http://json-schema.org/draft-04/schema#",
                        "type": "object",
                        "properties": {
                          "billing-account": {
                            "description": "Billing account number used to charge use of shared fake server.",
                            "type": "string"
                          }
                        }
                      }
                    }
                  },
                  "service_binding": {
                    "create": {
                      "parameters": {
                        "$schema": "http://json-schema.org/draft-04/schema#",
                        "type": "object",
                        "properties": {
                          "billing-account": {
                            "description": "Billing account number used to charge use of shared fake server.",
                            "type": "string"
                          }
                        }
                      }
                    }
                  }
                }
              }, {
                "name": "fake-plan-2",
                "id": "0f4008b5-XXXX-XXXX-XXXX-dace631cd648",
                "description": "Shared fake Server, 5tb persistent disk, 40 max concurrent connections. 100 async",
                "free": false,
                "metadata": {
                  "max_storage_tb": 5,
                  "costs":[
                      {
                         "amount":{
                            "usd":199.0
                         },
                         "unit":"MONTHLY"
                      },
                      {
                         "amount":{
                            "usd":0.99
                         },
                         "unit":"1GB of messages over 20GB"
                      }
                   ],
                  "bullets": [
                    "40 concurrent connections"
                  ]
                }
              }]
            }]
          }
    )
})
app.put('/v2/service_instances/:instance_id', function (req,res) {  
  if (!checkRequest(req,res))
    return;
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete == 'false') {
    res.sendStatus(422);
    return;
  }
  
  var messages = validateJsonSchema(req.body, provisionRequestSchema);
  if (messages !="") {
    res.sendStatus(400);
    return;
  }
  res.status(202).send(
    {
      "dashboard_url" :"http://example-dashboard.example.com/9189kdfsk0vfnku",
      "operation": "task_10"
    }
  );
})

app.patch('/v2/service_instances/:instance_id', function (req,res) {  
  if (!checkRequest(req,res))
    return;
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete == 'false') {
    res.sendStatus(422);
    return;
  }
  
  var messages = validateJsonSchema(req.body, updateRequestSchema);
  if (messages !="") {
    console.log(messages);
    res.sendStatus(400);
    return;
  }

  res.status(202).send(
    {
      "operation": "task_10"
    }
  );
})

app.put('/v2/service_instances/:instance_id/service_bindings/:binding_id', function (req,res) {  
  if (!checkRequest(req,res))
    return;
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete == 'false') {
    res.sendStatus(422);
    return;
  }
  
  var messages = validateJsonSchema(req.body, bindingRequestSchema);
  if (messages !="") {
    console.log(messages);
    res.sendStatus(400);
    return;
  }

  res.status(201).send(
    {
      "credentials":{
        "uri":"mysql://mysqluser:pass@mysqlhost:3306/dbname",
        "username":"mysqluser",
        "password":"pass",
        "host":"mysqlhost",
        "port":3306,
        "database":"dbname"
      }
    }
  );
})

app.delete('/v2/service_instances/:instance_id/service_bindings/:binding_id', function (req,res) {  
  if (!checkRequest(req,res))
    return;
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete == 'false') {
    res.sendStatus(422);
    return;
  }
  
  if (!req.query.service_id || !req.query.plan_id) {
    res.sendStatus(400);
  } else {
    res.status(200).send({});
  }
})

app.delete('/v2/service_instances/:instance_id', function (req,res) {  
  if (!checkRequest(req,res))
    return;
  if (!req.query.accepts_incomplete || req.query.accepts_incomplete == 'false') {
    res.sendStatus(422);
    return;
  }
  
  if (!req.query.service_id || !req.query.plan_id) {
    res.sendStatus(400);
  } else {
    res.status(202)
    .send(
      {
        "operation":"task_10"
      }
    );
  }
})

app.get('/v2/service_instances/:instance_id/last_operation', function (req, res) {
  if (!checkRequest(req,res))
    return;
  res.send({
    "state": "in progress",
    "description": "Creating service (10% complete)."
  });
})
app.listen(3000, function(){
    console.log('Example app listening on port 3000!')
})

function checkRequest(req,res) {
  var username = '', password = '';
  if (req.header('Authorization')) {
    var token = req.header('Authorization').split(/\s+/).pop()||'';
    var auth = new Buffer(token, 'base64').toString();
    var parts = auth.split(/:/);
    username = parts[0];
    password = parts[1];
  }    
  if (!req.header('X-Broker-API-Version') || req.header('X-Broker-API-Version') != '2.13') {
    res.sendStatus(412);
    return false;
  }
  if (!username || !password || username != 'username' || password != 'password') {
    res.sendStatus(401);
    return false;
  }
  return true;
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