package common

import (
	"testing"

	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestPollInstanceLastOperation(
	t *testing.T,
	instanceID string,
) {
	Convey("POLL INSTANCE LAST OPERATION", t, func() {

		So(testAPIVersionHeader(config.GeneratePollInstanceLastOperationURL(instanceID), "GET"), ShouldEqual, nil)
		So(testAuthentication(config.GeneratePollInstanceLastOperationURL(instanceID), "GET"), ShouldEqual, nil)

		Convey("should accept a valid poll instance last operation request", func() {
			code, body, err := apiclient.Default.PollInstanceLastOperation(instanceID)

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 200)
			So(testJSONSchema(body), ShouldEqual, nil)
		})
	})
}

func TestPollBindingLastOperation(
	t *testing.T,
	instanceID, bindingID string,
) {
	Convey("POLL BINDING LAST OPERATION", t, func() {

		So(testAPIVersionHeader(config.GeneratePollBindingLastOperationURL(instanceID, bindingID), "GET"), ShouldEqual, nil)
		So(testAuthentication(config.GeneratePollBindingLastOperationURL(instanceID, bindingID), "GET"), ShouldEqual, nil)

		Convey("should accept a valid poll binding last operation request", func() {
			code, body, err := apiclient.Default.PollBindingLastOperation(instanceID, bindingID)

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 200)
			So(testJSONSchema(body), ShouldEqual, nil)
		})
	})
}
