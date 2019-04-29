package config

import (
	"strings"
)

func GenerateCatalogURL() string {
	return strings.Join([]string{
		CONF.URL,
		"v2/catalog",
	}, "/")
}

func GenerateInstanceURL(instanceID string) string {
	return strings.Join([]string{
		CONF.URL,
		"v2/service_instances",
		instanceID,
	}, "/")
}

func GeneratePollInstanceLastOperationURL(instanceID string) string {
	return strings.Join([]string{
		CONF.URL,
		"v2/service_instances",
		instanceID,
		"last_operation",
	}, "/")
}

func GenerateBindingURL(instanceID, bindingID string) string {
	return strings.Join([]string{
		CONF.URL,
		"v2/service_instances",
		instanceID,
		"service_bindings",
		bindingID,
	}, "/")
}

func GeneratePollBindingLastOperationURL(instanceID, bindingID string) string {
	return strings.Join([]string{
		CONF.URL,
		"v2/service_instances",
		instanceID,
		"service_bindings",
		bindingID,
		"last_operation",
	}, "/")
}
