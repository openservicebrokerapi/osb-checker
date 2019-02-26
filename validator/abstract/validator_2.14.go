package abstract

import (
	"github.com/openservicebrokerapi/osb-checker/receiver"

	osb "github.com/pmorie/go-open-service-broker-client/v2"
)

func NewValidatorV214(edp string) *validatorV214 {
	return &validatorV214{
		Receiver:       receiver.NewReceiver(),
		brokerEndpoint: edp,
	}
}

type validatorV214 struct {
	receiver.Receiver

	brokerEndpoint string
}

func (v *validatorV214) GetCatalog() error {
	return nil
}

func (v *validatorV214) Provision(*osb.ProvisionRequest) error {
	return nil
}

func (v *validatorV214) PollInstanceLastOperation(*osb.LastOperationRequest) error {
	return nil
}

func (v *validatorV214) GetInstance(instanceID string) error {
	return nil
}

func (v *validatorV214) UpdateInstance(*osb.UpdateInstanceRequest) error {
	return nil
}

func (v *validatorV214) Deprovision(*osb.DeprovisionRequest) error {
	return nil
}

func (v *validatorV214) Bind(*osb.BindRequest) error {
	return nil
}

func (v *validatorV214) PollBindingLastOperation(*osb.BindingLastOperationRequest) error {
	return nil
}

func (v *validatorV214) GetBinding(*osb.GetBindingRequest) error {
	return nil
}

func (v *validatorV214) Unbind(*osb.UnbindRequest) error {
	return nil
}
