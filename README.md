[![Build Status](https://travis-ci.org/openservicebrokerapi/osb-checker.svg?branch=master)](https://travis-ci.org/openservicebrokerapi/osb-checker "Travis")

# osb-checker
An automatic checker to verify an Open Service Broker API implementation against the [specification](https://github.com/openservicebrokerapi/servicebroker).

## Project Status

This project should be considered **experimental**. You should validate the results against the released [specification](https://github.com/openservicebrokerapi/servicebroker). In the case of any discrepancy, the specification should be considered correct.

## Usage - test against the mock OSB API endpoint

1. Clone the repository to a folder, for example c:\osb-checker
2. Launch the mock server
```bash
    cd c:\osb-checker\2.13\mocks
    npm install
    node mockOSB.js
```
3. Run tests
```bash
    cd c:\osb-checker\2.13\tests
    npm install
    npm test
```

# Usage - test against your own OSB API endpoint

1. Modify test configurations. By default, test parameters are loaded from the **test\configs\config_mock.json** file so that you can run tests directly against the mock server. For your own environment, you should create a new config file based on **test\configs\config_mock.json** and fill in your OSB endpoint info:

```json
    "url": "<your OSB endpoint>",
    "apiVersion" : "2.13",
    "user": "<your user name>",
    "password": "<your password>",
    "authentication": "basic",
    "caCertFile": "<path to ca-cert (optional)>",
```

If your server uses TLS with an untrusted certificate authority, specify the path to the CA certificate using the `caCertFile` property.

2. You should also modify your test configuration file to use match with your environment, such as using the correct service ids and plan ids. OSB-Checker is data-driven. You can define more test cases by modifying the test configuration file. For instance, to add a new service instance provision case, simply add a new item into the **provisions** array.


> **CALL FOR ACTION** Please contribute your test configurations back to the community.

3. Update **test.js** to use your own configuration:
```javascript
var config = require('./configs/config_mock.json'); //replace config_mock.json with your own configuration file
```
4. Run tests
```bash
    cd c:\osb-checker\2.13\tests
    npm install
    npm test
```

## What's covered
* All OSB API 2.13 verbs (~60 test cases)
* JSON schema check against all requests/responses (7 schemas)
* JSON schema check if OSB API returns schemas for parameters
* Extensible test cases by configuration files

## Customize

### Provisioning requests
Provisioning requests are configured by the **provisions** array in your test configuration file. You can modify the array to use different *service_ids* and *plan_ids*. You can specify *instance_id*. If you leave the field as an empty string, a random instance id will be used during tests.
Provision requests support a couple of different scenarios, driven by the "scenario" property:
* **new** check for provisioning a new service instance
* **conflict** check for service instance conflicts. To set this up, you need two provision requests with the same *instance_id* but different *plan_id* or *service_id*, with the first request marked as **new** and the second request marked as **conflict**. Please see the **EXISTING_ID** requests in **configs/config_mock.json** as an example. 

## Mock OSB API Endpoint
OSB Checker also comes with a mock OSB API server that can be used to test marketplace implementations. To launch the Mock server:
```bash
    cd c:\osb-checker\2.13\mocks
    npm install
    node mockOSB.js
```
Sample test outputs against the mock server

MOCK server

```
  GET /v2/catalog
    Query service catalog
      √ should reject requests without X-Broker-API-Version header with 412 (40ms)
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return list of registered service classes as JSON payload

  PUT /v2/service_instances/:instance_id
    PROVISION - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
      √ should reject if missing plan_id
      √ should reject if request payload is missing organization_guid
      √ should reject if request payload is missing space_guid
      √ should reject if service_id is invalid
      √ should reject if plan_id is invalid
      √ should reject if parameters are not following schema
    PROVISION - new
      √ should accept a valid provision request
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      PROVISION - query after new
        √ should return last operation status
    PROVISION - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
      √ should reject if missing plan_id
      √ should reject if request payload is missing organization_guid
      √ should reject if request payload is missing space_guid
      √ should reject if service_id is invalid
      √ should reject if plan_id is invalid
      √ should reject if parameters are not following schema
    PROVISION - new
      √ should accept a valid provision request
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      PROVISION - query after new
        √ should return last operation status
    PROVISION - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
      √ should reject if missing plan_id
      √ should reject if request payload is missing organization_guid
      √ should reject if request payload is missing space_guid
      √ should reject if service_id is invalid
      √ should reject if plan_id is invalid
      √ should reject if parameters are not following schema
    PROVISION - conflict
      √ should return conflict when instance Id exists with different properties

  PATCH /v2/service_instance/:instance_id
    UPDATE - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
    UPDATE
      √ should accept a valid update request
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      PROVISION - query after new
        √ should return last operation status

  PUT /v2/service_instance/:instance_id/service_bindings/:binding_id
    BINDING - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
      √ should reject if missing plan_id
      NEW
        √ should accept a valid binding request
    BINDING - request syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      √ should reject if missing service_id
      √ should reject if missing plan_id

  DELETE /v2/service_instance/:instance_id/service_bindings/:binding_id
    BINDING - delete syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      DELETE
        √ should reject if missing service_id
        √ should reject if missing plan_id
        √ should accept a valid binding deletion request

  DELETE /v2/service_instance/:instance_id
    DEPROVISIONING - delete syntax
      √ should reject requests without X-Broker-API-Version header with 412
      √ should reject unauthorized requests with 401
      √ should reject bad credentials with 401
      √ should return 422 if request doesn't have the accept_incomplete parameter
      √ should return 422 if request if the accept_incomplete parameter is false
      DELETE
        √ should reject if missing service_id
        √ should reject if missing plan_id
        √ should accept a valid service deletion request

  93 passing (670ms)
```
