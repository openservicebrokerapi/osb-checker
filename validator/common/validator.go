package common

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"reflect"
	"strconv"

	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	. "github.com/openservicebrokerapi/osb-checker/config"

	"github.com/go-openapi/spec"
	"github.com/go-openapi/strfmt"
	"github.com/go-openapi/validate"
)

func NewValidator() *Validator {
	return &Validator{
		client: apiclient.Default,
	}
}

type Validator struct {
	client *apiclient.Client
}

func (v *Validator) testAPIVersionHeader(url, method string) error {
	params := &apiclient.BrokerRequestParams{
		URL:          url,
		Method:       method,
		HeaderOption: map[string]string{},
		QueryParam: map[string]string{
			"accepts_incomplete": strconv.FormatBool(true),
		},
		Username: CONF.Authentication.Username,
		Password: CONF.Authentication.Password,
	}

	res, err := v.client.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 412) {
		return fmt.Errorf("Expected %d, got %d", 412, res.Code)
	}

	return nil
}

func (v *Validator) testAuthentication(url, method string) error {
	params := &apiclient.BrokerRequestParams{
		URL:    url,
		Method: method,
		HeaderOption: map[string]string{
			"X-Broker-API-Version": CONF.APIVersion,
		},
		QueryParam: map[string]string{
			"accepts_incomplete": strconv.FormatBool(true),
		},
	}

	res, err := v.client.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 401) {
		return fmt.Errorf("Expected %d, got %d", 401, res.Code)
	}

	return nil
}

func (v *Validator) testAsyncParameters(url, method string) error {
	params := &apiclient.BrokerRequestParams{
		URL:    url,
		Method: method,
		HeaderOption: map[string]string{
			"X-Broker-API-Version": CONF.APIVersion,
		},
		QueryParam: map[string]string{},
		Username:   CONF.Authentication.Username,
		Password:   CONF.Authentication.Password,
	}

	res, err := v.client.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 422) {
		return fmt.Errorf("Expected %d, got %d", 422, res.Code)
	}

	return nil
}

func (v *Validator) testJSONSchema(data interface{}, schemaFile string) error {
	schemaBody, err := ioutil.ReadFile(schemaFile)
	if err != nil {
		return err
	}
	schema := new(spec.Schema)
	json.Unmarshal(schemaBody, schema)

	return validate.AgainstSchema(schema, data, strfmt.Default)
}

func (v *Validator) testCatalogSchema() error {
	_, _, err := v.client.GetCatalog()
	if err != nil {
		return err
	}

	return nil
}
