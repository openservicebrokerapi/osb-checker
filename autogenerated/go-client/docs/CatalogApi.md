# \CatalogApi

All URIs are relative to *http://localhost:3000*

Method | HTTP request | Description
------------- | ------------- | -------------
[**CatalogGet**](CatalogApi.md#CatalogGet) | **Get** /v2/catalog | get the catalog of services that the service broker offers



## CatalogGet

> Catalog CatalogGet(ctx, xBrokerAPIVersion, optional)
get the catalog of services that the service broker offers

### Required Parameters


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------
**ctx** | **context.Context** | context for authentication, logging, cancellation, deadlines, tracing, etc.
**xBrokerAPIVersion** | **string**| version number of the Service Broker API that the Platform will use | 
 **optional** | ***CatalogGetOpts** | optional parameters | nil if no parameters

### Optional Parameters

Optional parameters are passed through a pointer to a CatalogGetOpts struct


Name | Type | Description  | Notes
------------- | ------------- | ------------- | -------------

 **xBrokerAPIOriginatingIdentity** | **optional.String**| identity of the user that initiated the request from the Platform | 
 **xBrokerAPIRequestIdentity** | **optional.String**| idenity of the request from the Platform | 

### Return type

[**Catalog**](Catalog.md)

### Authorization

[basicAuth](../README.md#basicAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: application/json

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints)
[[Back to Model list]](../README.md#documentation-for-models)
[[Back to README]](../README.md)

