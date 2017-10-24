# osb-checker
An automatic checker to verify an Open Service Broker API implementation against spec.

## Usage

1. Clone the repository to a folder, for example c:\osb-checker
2. Modify test configurations. By default, test parameters are loaded from the **test\config_mock.json** file so that you can run tests directly against the mock server. For your own environments, you need to update the **url**, **user**, and **password** fields to match with your OSB endpoint. 
```json
    "url": "<your OSB endpoint>",
    "apiVersion" : "2.13",
    "user": "<your user name>",
    "password": "<your password>",
```
3. Run tests
```bash
    cd c:\osb-checker\2.13\tests
    npm install
    mocha
```

## What's covered
* All OSB API 2.13 verbs (~60 test cases)
* JSON schema check against all requests/responses (7 schemas)
* Extensible test cases by configuration files

## Customize

### Provisioning requests
Provisioning requests are configured by the **provisions** array in your test configuration file. You can modify the array to use different *service_ids* and *plan_ids*. You can specify *instnace_id*. If you leave the field as an empty string, a random instance id will be used during tests.

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
      √ should reject requests without X-Broker-API-Version header with 412 (38ms)
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


  63 passing (440ms)

  ```