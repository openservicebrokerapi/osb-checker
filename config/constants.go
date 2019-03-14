package config

import (
	"time"
)

const (
	Version214 = "v2.14"
)

const (
	HTTPRequestTimeout = 30 * time.Second
)

const (
	MockBrokerEndpoint = "http://localhost:3000"
)

const (
	TypeServiceInstance = "service_instance"
	TypeServiceBinding  = "service_binding"

	ActionCreate = "create"
	ActionUpdate = "update"
)
