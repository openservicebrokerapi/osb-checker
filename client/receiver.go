package client

import (
	"encoding/json"
	"io/ioutil"
	"strings"
	"time"

	"github.com/astaxie/beego/httplib"
	"github.com/openservicebrokerapi/osb-checker/constants"
)

// ParamOption
type BrokerRequestParams struct {
	URL          string
	Method       string
	HeaderOption map[string]string
	QueryParam   map[string]string
	InputData    interface{}
	Username     string
	Password     string

	Timeout time.Duration
}

type BrokerResponse struct {
	Code    int
	Message []byte
}

// Receiver
type Receiver interface {
	Recv(params *BrokerRequestParams) (*BrokerResponse, error)
}

// NewReceiver
func NewReceiver() Receiver {
	return &receiver{}
}

type receiver struct{}

func (*receiver) Recv(params *BrokerRequestParams) (*BrokerResponse, error) {

	req := newRequest(params)
	return receive(req)
}

func newRequest(params *BrokerRequestParams) *httplib.BeegoHTTPRequest {
	req := httplib.NewBeegoRequest(params.URL, strings.ToUpper(params.Method))

	// Set the request timeout a little bit longer.
	params.Timeout = constants.HTTPRequestTimeout
	req.SetTimeout(params.Timeout, params.Timeout)
	// init body
	if params.InputData != nil {
		body, _ := json.MarshalIndent(params.InputData, "", "  ")
		req.Body(body)
	}
	// init header
	if params.HeaderOption != nil {
		for k, v := range params.HeaderOption {
			req.Header(k, v)
		}
	}
	// init query parameters
	if params.QueryParam != nil {
		for k, v := range params.QueryParam {
			req.Param(k, v)
		}
	}
	// init basic auth
	req.SetBasicAuth(params.Username, params.Password)

	return req
}

func receive(req *httplib.BeegoHTTPRequest) (*BrokerResponse, error) {
	// Get http response.
	resp, err := req.Response()
	if err != nil {
		return nil, err
	}
	rbody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	return &BrokerResponse{
		Code:    resp.StatusCode,
		Message: rbody,
	}, nil
}
