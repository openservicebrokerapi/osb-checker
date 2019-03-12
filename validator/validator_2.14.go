package validator

import (
	"github.com/openservicebrokerapi/osb-checker/constants"
	"github.com/openservicebrokerapi/osb-checker/validator/common"
)

var val Validator = &validatorV214{
	Common: common.NewValidator(),
}

func init() {
	RegisterValidator(constants.Version214, val)
}

type validatorV214 struct {
	Common *common.Validator
}

func (v *validatorV214) GetCatalog() error {
	return nil
}

func (v *validatorV214) Provision() error {
	return nil
}

func (v *validatorV214) PollInstanceLastOperation() error {
	return nil
}

func (v *validatorV214) GetInstance() error {
	return nil
}

func (v *validatorV214) UpdateInstance() error {
	return nil
}

func (v *validatorV214) Deprovision() error {
	return nil
}

func (v *validatorV214) Bind() error {
	return nil
}

func (v *validatorV214) PollBindingLastOperation() error {
	return nil
}

func (v *validatorV214) GetBinding() error {
	return nil
}

func (v *validatorV214) Unbind() error {
	return nil
}
