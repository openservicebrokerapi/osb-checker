package receiver

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"strings"
	"time"

	"github.com/astaxie/beego/httplib"
)

// ParamOption
type HeaderOption map[string]string

type BrokerResponse struct {
	Code    int
	Message string
}

// Receiver
type Receiver interface {
	Recv(url, method string, headers HeaderOption, input interface{}) (*BrokerResponse, error)
}

// NewReceiver
func NewReceiver() Receiver {
	return &receiver{}
}

type receiver struct{}

func (*receiver) Recv(
	url, method string,
	headers HeaderOption,
	input interface{},
) (*BrokerResponse, error) {

	req := newRequest(url, method, headers, input)
	return receive(req)
}

func newRequest(url, method string, headers HeaderOption, input interface{}) *httplib.BeegoHTTPRequest {
	req := httplib.NewBeegoRequest(url, strings.ToUpper(method))

	// Set the request timeout a little bit longer.
	req.SetTimeout(time.Minute*6, time.Minute*6)
	// init body
	log.Printf("%s %s\n", strings.ToUpper(method), url)
	if input != nil {
		body, _ := json.MarshalIndent(input, "", "  ")
		log.Printf("Request body:\n%s\n", string(body))
		req.Body(body)
	}

	//init header
	if headers != nil {
		for k, v := range headers {
			req.Header(k, v)
		}
	}

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
		Message: string(rbody),
	}, nil
}
