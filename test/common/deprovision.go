package common

import (
	"context"
	"testing"

	"github.com/antihax/optional"
	openapi "github.com/openservicebrokerapi/osb-checker/autogenerated/go-client"
	. "github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestDeprovision(
	t *testing.T,
	instanceID string,
	serviceID, planID string,
	async bool,
) {
	Convey("DEPROVISIONING - delete syntax", t, func() {

		Convey("should return 412 PreconditionFailed if missing X-Broker-API-Version header", func() {
			_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
				authCtx, "", instanceID, serviceID, planID,
				&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(async)})

			So(err, ShouldNotBeNil)
			So(resp.StatusCode, ShouldEqual, 412)
		})

		if CONF.Authentication.AuthType != TypeNoauth {
			Convey("should return 401 Unauthorized if missing Authorization header", func() {
				_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
					context.Background(), CONF.APIVersion, instanceID, serviceID, planID,
					&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(async)})

				So(err, ShouldNotBeNil)
				So(resp.StatusCode, ShouldEqual, 401)
			})
		}

		if async {
			Convey("should return 422 UnprocessableEntity if missing accepts_incomplete", func() {
				_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
					authCtx, CONF.APIVersion, instanceID, serviceID, planID,
					&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(false)})

				So(err, ShouldNotBeNil)
				So(resp.StatusCode, ShouldEqual, 422)
			})
		}

		Convey("should reject if missing service_id", func() {
			_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
				authCtx, CONF.APIVersion, instanceID, "", planID,
				&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(async)})

			So(err, ShouldNotBeNil)
			So(resp.StatusCode, ShouldEqual, 400)
		})

		Convey("should reject if missing plan_id", func() {
			_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
				authCtx, CONF.APIVersion, instanceID, serviceID, "",
				&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(async)})

			So(err, ShouldNotBeNil)
			So(resp.StatusCode, ShouldEqual, 400)
		})

	})

	Convey("DEPROVISIONING - delete", t, func() {
		Convey("should accept a valid service instance deletion request", func() {
			_, resp, err := cli.ServiceInstancesApi.ServiceInstanceDeprovision(
				authCtx, CONF.APIVersion, instanceID, serviceID, planID,
				&openapi.ServiceInstanceDeprovisionOpts{AcceptsIncomplete: optional.NewBool(async)})

			So(err, ShouldBeNil)
			if async {
				So(resp.StatusCode, ShouldEqual, 202)
			} else {
				So(resp.StatusCode, ShouldEqual, 200)
			}
		})
	})

	if async {
		Convey("DEPROVISIONING - poll", t, func(c C) {
			testPollInstanceLastOperation(instanceID)

			So(pollInstanceLastOperationStatus(instanceID, "deprovision"), ShouldBeNil)
		})
	}
}
