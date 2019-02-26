package validator

import (
	"github.com/openservicebrokerapi/osb-checker/constants"
	"github.com/openservicebrokerapi/osb-checker/validator/abstract"
	"github.com/openservicebrokerapi/osb-checker/validator/common"

	osb "github.com/pmorie/go-open-service-broker-client/v2"
)

type AbstractValidator interface {
	GetCatalog() error

	Provision(*osb.ProvisionRequest) error

	PollInstanceLastOperation(*osb.LastOperationRequest) error

	GetInstance(instanceID string) error

	UpdateInstance(*osb.UpdateInstanceRequest) error

	Deprovision(*osb.DeprovisionRequest) error

	Bind(*osb.BindRequest) error

	PollBindingLastOperation(*osb.BindingLastOperationRequest) error

	GetBinding(*osb.GetBindingRequest) error

	Unbind(*osb.UnbindRequest) error
}

type Validator struct {
	*common.BaseValidator
	AbstractValidator

	Version string
}

func NewValidator(version, edp string) *Validator {
	var val AbstractValidator

	switch version {
	case constants.Version214:
		val = abstract.NewValidatorV214(edp)
		break
	default:
		val = abstract.NewValidatorV214(edp)
		break
	}

	return &Validator{
		BaseValidator:     common.NewBaseValidator(version, edp),
		AbstractValidator: val,
	}
}
