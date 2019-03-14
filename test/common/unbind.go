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

		So(testAPIVersionHeader(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldEqual, nil)
		So(testAuthentication(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldEqual, nil)
		if async {
			So(testAsyncParameters(config.GenerateBindingURL(instanceID, bindingID), "DELETE"), ShouldEqual, nil)
		}

		Convey("should reject if missing service_id", func() {
			code, _, err := apiclient.Default.Unbind(instanceID, bindingID, "", planID)

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 400)
		})

		Convey("should reject if missing plan_id", func() {
			code, _, err := apiclient.Default.Unbind(instanceID, bindingID, serviceID, "")

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 400)
		})

		Convey("should accept a valid service binding deletion request", func() {
			code, asyncBody, err := apiclient.Default.Unbind(instanceID, bindingID, serviceID, planID)

			So(err, ShouldEqual, nil)
			if async {
				So(code, ShouldEqual, 202)
				So(testJSONSchema(asyncBody), ShouldEqual, nil)
			} else {
				So(code, ShouldEqual, 200)
			}
		})
	})
}
