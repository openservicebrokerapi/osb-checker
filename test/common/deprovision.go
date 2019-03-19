package common

import (
	"testing"

	apiclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestDeprovision(
	t *testing.T,
	instanceID string,
	serviceID, planID string,
	async bool,
) {
	Convey("DEPROVISIONING - delete syntax", t, func() {

		So(testAPIVersionHeader(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldEqual, nil)
		So(testAuthentication(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldEqual, nil)
		if async {
			So(testAsyncParameters(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldEqual, nil)
		}

		Convey("should reject if missing service_id", func() {
			code, _, err := apiclient.Default.Deprovision(instanceID, "", planID, async)

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 400)
		})

		Convey("should reject if missing plan_id", func() {
			code, _, err := apiclient.Default.Deprovision(instanceID, serviceID, "", async)

			So(err, ShouldEqual, nil)
			So(code, ShouldEqual, 400)
		})

		Convey("should accept a valid service instance deletion request", func() {
			code, asyncBody, err := apiclient.Default.Deprovision(instanceID, serviceID, planID, async)

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
