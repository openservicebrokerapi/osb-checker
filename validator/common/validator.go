package common

func NewBaseValidator(version, edp string) *BaseValidator {
	return &BaseValidator{
		testVersion:    version,
		brokerEndpoint: edp,
	}
}

type BaseValidator struct {
	testVersion    string
	brokerEndpoint string
}

func (b *BaseValidator) ValidateAPIVersionHeader() error {
	return nil
}

func (b *BaseValidator) ValidateAuthentication() error {
	return nil
}

func (b *BaseValidator) ValidateAsyncParameters() error {
	return nil
}

func (b *BaseValidator) ValidateJSONSchema() error {
	return nil
}

func (b *BaseValidator) ValidateCatalogSchema() error {
	return nil
}
