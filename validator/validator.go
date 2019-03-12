package validator

import (
	"fmt"

	"github.com/openservicebrokerapi/osb-checker/constants"
)

type Validator interface {
	GetCatalog() error

	Provision() error

	PollInstanceLastOperation() error

	GetInstance() error

	UpdateInstance() error

	Deprovision() error

	Bind() error

	PollBindingLastOperation() error

	GetBinding() error

	Unbind() error
}

var vals = map[string]Validator{}

// NewValidator implementation
func NewValidator(version, url string) Validator {
	var val Validator
	var exist bool

	val, exist = vals[version]
	if !exist {
		fmt.Printf("%s is not registered to validator list, use default one",
			version)
		val = vals[constants.Version214]
	}

	return val
}

// RegisterValidator implementation
func RegisterValidator(version string, val Validator) error {
	if _, exist := vals[version]; exist {
		return fmt.Errorf("Validator %s already exists", version)
	}

	vals[version] = val
	return nil
}

// UnregisterValidator implementation
func UnregisterValidator(version string) {
	if _, exist := vals[version]; !exist {
		return
	}

	delete(vals, version)
	return
}
