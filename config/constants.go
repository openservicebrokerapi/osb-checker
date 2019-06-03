package config

import (
	"time"
)

const (
	Version214 = "2.14"
)

const (
	TypeNoauth    = "noauth"
	TypeBasicAuth = "basic"
)

const (
	MockBrokerEndpoint = "localhost:3000"
	HTTPRWTimeout      = 30 * time.Second
	HTTPIdleTimeout    = 60 * time.Second
)

const (
	TypeServiceInstance = "service_instance"
	TypeServiceBinding  = "service_binding"

	ActionCreate = "create"
	ActionUpdate = "update"
)
