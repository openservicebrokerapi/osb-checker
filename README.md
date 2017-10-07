# osb-checker
An automatic checker to verify an Open Service Broker API implementation against spec.

## Usage

1. Clone the repository to a folder, for example c:\osb-checker
2. Modify test configurations. By default, test parameters are loaded from the **test\config_default.json** file. You need to update the **url**, **user**, and **password** fields to match with your OSB endpoint. 
```json
    "url": "<your OSB endpoint>",
    "apiVersion" : "2.1.3",
    "user": "<your user name>",
    "password": "<your password>",
```
3. Run tests
```bash
    cd c:\osb-checker\2.1.3\tests
    npm install
    mocha
```

## Customize

### Provisioning requests
Provisioning requests are configured by the **provisions** array in your test configuration file. You can modify the array to use different *service_ids* and *plan_ids*. You can specify *instnace_id*. If you leave the field as an empty string, a random instance id will be used during tests.
