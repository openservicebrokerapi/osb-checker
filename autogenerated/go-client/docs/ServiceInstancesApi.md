# \ServiceInstancesApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ServiceInstanceDeprovision**](ServiceInstancesApi.md#ServiceInstanceDeprovision) | **Delete** /v2/service_instances/{instance_id} | deprovision a service instance
[**ServiceInstanceGet**](ServiceInstancesApi.md#ServiceInstanceGet) | **Get** /v2/service_instances/{instance_id} | gets a service instance
[**ServiceInstanceLastOperationGet**](ServiceInstancesApi.md#ServiceInstanceLastOperationGet) | **Get** /v2/service_instances/{instance_id}/last_operation | last requested operation state for service instance
[**ServiceInstanceProvision**](ServiceInstancesApi.md#ServiceInstanceProvision) | **Put** /v2/service_instances/{instance_id} | provision a service instance
[**ServiceInstanceUpdate**](ServiceInstancesApi.md#ServiceInstanceUpdate) | **Patch** /v2/service_instances/{instance_id} | update a service instance



## ServiceInstanceDeprovision

> map[string]interface{} ServiceInstanceDeprovision(ctx, xBrokerAPIVersion, instanceId, serviceId, planId, optional)
deprovision a service instance

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**serviceId** | **string**| id of the service associated with the instance being deleted | 
**planId** | **string**| id of the plan associated with the instance being deleted | 
 **optional** | ***ServiceInstanceDeprovisionOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceInstanceDeprovisionOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------




 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 
 **acceptsIncomplete** | **optional.Bool**| asynchronous operations supported | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceInstanceGet

> ServiceInstanceResource ServiceInstanceGet(ctx, xBrokerAPIVersion, instanceId, optional)
gets a service instance

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
 **optional** | ***ServiceInstanceGetOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceInstanceGetOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 

### Return type

[**ServiceInstanceResource**](ServiceInstanceResource.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceInstanceLastOperationGet

> LastOperationResource ServiceInstanceLastOperationGet(ctx, xBrokerAPIVersion, instanceId, optional)
last requested operation state for service instance

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
 **optional** | ***ServiceInstanceLastOperationGetOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceInstanceLastOperationGetOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------


 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 
 **serviceId** | **optional.String**| id of the service associated with the instance | 
 **planId** | **optional.String**| id of the plan associated with the instance | 
 **operation** | **optional.String**| a provided identifier for the operation | 

### Return type

[**LastOperationResource**](LastOperationResource.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceInstanceProvision

> ServiceInstanceProvisionResponse ServiceInstanceProvision(ctx, xBrokerAPIVersion, instanceId, body, optional)
provision a service instance

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**body** | [**ServiceInstanceProvisionRequest**](ServiceInstanceProvisionRequest.md)| parameters for the requested service instance provision | 
 **optional** | ***ServiceInstanceProvisionOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceInstanceProvisionOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 
 **acceptsIncomplete** | **optional.Bool**| asynchronous operations supported | 

### Return type

[**ServiceInstanceProvisionResponse**](ServiceInstanceProvisionResponse.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceInstanceUpdate

> map[string]interface{} ServiceInstanceUpdate(ctx, xBrokerAPIVersion, instanceId, body, optional)
update a service instance

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**body** | [**ServiceInstanceUpdateRequest**](ServiceInstanceUpdateRequest.md)| parameters for the requested service instance update | 
 **optional** | ***ServiceInstanceUpdateOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceInstanceUpdateOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 
 **acceptsIncomplete** | **optional.Bool**| asynchronous operations supported | 

### Return type

[**map[string]interface{}**](map[string]interface{}.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

