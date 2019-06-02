# \ServiceBindingsApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**ServiceBindingBinding**](ServiceBindingsApi.md#ServiceBindingBinding) | **Put** /v2/service_instances/{instance_id}/service_bindings/{binding_id} | generation of a service binding
[**ServiceBindingGet**](ServiceBindingsApi.md#ServiceBindingGet) | **Get** /v2/service_instances/{instance_id}/service_bindings/{binding_id} | gets a service binding
[**ServiceBindingLastOperationGet**](ServiceBindingsApi.md#ServiceBindingLastOperationGet) | **Get** /v2/service_instances/{instance_id}/service_bindings/{binding_id}/last_operation | last requested operation state for service binding
[**ServiceBindingUnbinding**](ServiceBindingsApi.md#ServiceBindingUnbinding) | **Delete** /v2/service_instances/{instance_id}/service_bindings/{binding_id} | deprovision of a service binding



## ServiceBindingBinding

> ServiceBinding ServiceBindingBinding(ctx, xBrokerAPIVersion, instanceId, bindingId, body, optional)
generation of a service binding

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**bindingId** | **string**| binding id of binding to create | 
**body** | [**ServiceBindingRequest**](ServiceBindingRequest.md)| parameters for the requested service binding | 
 **optional** | ***ServiceBindingBindingOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceBindingBindingOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------




 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 
 **acceptsIncomplete** | **optional.Bool**| asynchronous operations supported | 

### Return type

[**ServiceBinding**](ServiceBinding.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: application/json
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceBindingGet

> ServiceBindingResource ServiceBindingGet(ctx, xBrokerAPIVersion, instanceId, bindingId, optional)
gets a service binding

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**bindingId** | **string**| binding id of binding to create | 
 **optional** | ***ServiceBindingGetOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceBindingGetOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------



 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 

### Return type

[**ServiceBindingResource**](ServiceBindingResource.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)


## ServiceBindingLastOperationGet

> LastOperationResource ServiceBindingLastOperationGet(ctx, xBrokerAPIVersion, instanceId, bindingId, optional)
last requested operation state for service binding

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**bindingId** | **string**| binding id of binding to create | 
 **optional** | ***ServiceBindingLastOperationGetOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceBindingLastOperationGetOpts struct


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


## ServiceBindingUnbinding

> map[string]interface{} ServiceBindingUnbinding(ctx, xBrokerAPIVersion, instanceId, bindingId, serviceId, planId, optional)
deprovision of a service binding

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
**instanceId** | **string**| instance id of instance to provision | 
**bindingId** | **string**| binding id of binding to create | 
**serviceId** | **string**| id of the service associated with the instance being deleted | 
**planId** | **string**| id of the plan associated with the instance being deleted | 
 **optional** | ***ServiceBindingUnbindingOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a ServiceBindingUnbindingOpts struct


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

