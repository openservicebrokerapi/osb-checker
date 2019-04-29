package common

import (
	"testing"

	osbclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestDeprovision(
	t *testing.T,
	instanceID string,
	serviceID, planID string,
	async, looseCheck bool,
) {
	Convey("DEPROVISIONING - delete syntax", t, func() {

		So(testAPIVersionHeader(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldBeNil)
		So(testAuthentication(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldBeNil)
		if async {
			So(testAsyncParameters(config.GenerateInstanceURL(instanceID), "DELETE"), ShouldBeNil)
		}

		if !looseCheck {
			Convey("should reject if missing service_id", func() {
				code, _, err := osbclient.Default.Deprovision(instanceID, "", planID, async)

				So(err, ShouldBeNil)
				So(code, ShouldEqual, 400)
			})

			Convey("should reject if missing plan_id", func() {
				code, _, err := osbclient.Default.Deprovision(instanceID, serviceID, "", async)

				So(err, ShouldBeNil)
				So(code, ShouldEqual, 400)
			})
		}

	})

	Convey("DEPROVISIONING - delete", t, func() {
		Convey("should accept a valid service instance deletion request", func() {
			code, asyncBody, err := osbclient.Default.Deprovision(instanceID, serviceID, planID, async)

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
		Convey("DEPROVISIONING - poll", t, func(c C) {
			testPollInstanceLastOperation(instanceID)

			So(pollInstanceLastOperationStatus(instanceID), ShouldBeNil)
		})
	}
}
