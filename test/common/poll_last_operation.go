package common

import (
	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func testPollInstanceLastOperation(instanceID string) {
	So(testAPIVersionHeader(config.GeneratePollInstanceLastOperationURL(instanceID), "GET"), ShouldBeNil)
	So(testAuthentication(config.GeneratePollInstanceLastOperationURL(instanceID), "GET"), ShouldBeNil)

	Convey("should accept a valid poll instance last operation request", func() {
		code, body, err := apiclient.Default.PollInstanceLastOperation(instanceID)

		So(err, ShouldBeNil)
		So(code, ShouldEqual, 200)
		So(testJSONSchema(body), ShouldBeNil)
	})
}

func testPollBindingLastOperation(instanceID, bindingID string) {
	So(testAPIVersionHeader(config.GeneratePollBindingLastOperationURL(instanceID, bindingID), "GET"), ShouldBeNil)
	So(testAuthentication(config.GeneratePollBindingLastOperationURL(instanceID, bindingID), "GET"), ShouldBeNil)

	Convey("should accept a valid poll binding last operation request", func() {
		code, body, err := apiclient.Default.PollBindingLastOperation(instanceID, bindingID)

		So(err, ShouldBeNil)
		So(code, ShouldEqual, 200)
		So(testJSONSchema(body), ShouldBeNil)
	})
}
