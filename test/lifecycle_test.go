package test

// +build lifecycle

import (
	"flag"

	"github.com/openservicebrokerapi/osb-checker/constants"
	"github.com/openservicebrokerapi/osb-checker/validator"
)

var (
	version        string
	brokerEndpoint string

	v *validator.Validator
)

func init() {
	// Parse some configuration fields from command line.
	flag.StringVar(&version, "version", constants.Version214, "Please specify the version of service broker you want to test!")
	flag.StringVar(&brokerEndpoint, "endpoint", constants.MockBrokerEndpoint, "Please specify the endpoint of broker!")
	flag.Parse()

	v = validator.NewValidator(version, brokerEndpoint)
}
