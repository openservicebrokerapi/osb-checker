package test

// +build lifecycle

import (
	"flag"
	"testing"

	. "github.com/openservicebrokerapi/osb-checker/config"
	"github.com/openservicebrokerapi/osb-checker/validator"
)

var (
	configPath string

	v *validator.Validator
)

func init() {
	// Parse some configuration fields from command line.
	flag.StringVar(&configFile, "config-file", "", "Please specify the config file of service broker you want to test!")
	flag.Parse()

	if err := Load(configPath); err != nil {
		panic(err)
	}

	v = validator.NewValidator(CONF.APIVersion, CONF.URL)
}

func TestCatalog(t *testing.T) {

}
