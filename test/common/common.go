package common

import (
	"fmt"
	"reflect"
	"strconv"

	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	. "github.com/openservicebrokerapi/osb-checker/config"

	"github.com/go-openapi/strfmt"
)

func testAPIVersionHeader(url, method string) error {
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

	res, err := apiclient.Default.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 412) {
		return fmt.Errorf("Expected %d, got %d", 412, res.Code)
	}

	return nil
}

func testAuthentication(url, method string) error {
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

	res, err := apiclient.Default.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 401) {
		return fmt.Errorf("Expected %d, got %d", 401, res.Code)
	}

	return nil
}

func testAsyncParameters(url, method string) error {
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

	res, err := apiclient.Default.Recv(params)
	if err != nil {
		return err
	}
	if !reflect.DeepEqual(res.Code, 422) {
		return fmt.Errorf("Expected %d, got %d", 422, res.Code)
	}

	return nil
}

type Schema interface {
	Validate(formats strfmt.Registry) error

	MarshalBinary() ([]byte, error)

	UnmarshalBinary(b []byte) error
}

func testJSONSchema(schema Schema) error {
	return schema.Validate(strfmt.Default)
}

// TODO: For provision, update and bind operation, testCatalogSchema should be
// called to assert the legality of parameters schema.
func testCatalogSchema() error {
	_, _, err := apiclient.Default.GetCatalog()
	if err != nil {
		return err
	}

	return nil
}

func deepCopy(src Schema, dst Schema) error {
	srcByte, err := src.MarshalBinary()
	if err != nil {
		return err
	}

	return dst.UnmarshalBinary(srcByte)
}
