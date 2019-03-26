package common

import (
	"testing"

	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestUnbind(
	t *testing.T,
	instanceID, bindingID string,
	serviceID, planID string,
	async bool,
) {
	Convey("UNBINDING - delete syntax", t, func() {

		So(testAPIVersionHeader(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldBeNil)
		So(testAuthentication(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldBeNil)
		if async {
			So(testAsyncParameters(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldBeNil)
		}

		Convey("should reject if missing service_id", func() {
			code, _, err := apiclient.Default.Unbind(instanceID, bindingID, "", planID, async)

			So(err, ShouldBeNil)
			So(code, ShouldEqual, 400)
		})

		Convey("should reject if missing plan_id", func() {
			code, _, err := apiclient.Default.Unbind(instanceID, bindingID, serviceID, "", async)

			So(err, ShouldBeNil)
			So(code, ShouldEqual, 400)
		})
	})

	Convey("UNBINDING - delete", t, func() {
		Convey("should accept a valid service binding deletion request", func() {
			code, asyncBody, err := apiclient.Default.Unbind(instanceID, bindingID, serviceID, planID, async)

			So(err, ShouldBeNil)
			if async {
				So(code, ShouldEqual, 202)
				So(testJSONSchema(asyncBody), ShouldBeNil)
			} else {
				So(code, ShouldEqual, 200)
			}
		})
	})

	if async {
		Convey("UNBINDING - poll", t, func(c C) {
			testPollBindingLastOperation(instanceID, bindingID)

			So(pollBindingLastOperationStatus(instanceID, bindingID), ShouldBeNil)
		})
	}
}
