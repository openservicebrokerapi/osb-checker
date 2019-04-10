package common

import (
	"testing"

	osbclient "github.com/openservicebrokerapi/osb-checker/client"
	"github.com/openservicebrokerapi/osb-checker/config"
	. "github.com/smartystreets/goconvey/convey"
)

func TestGetCatalog(t *testing.T) {
	Convey("Query service catalog", t, func() {

		So(testAPIVersionHeader(config.GenerateCatalogURL(), "GET"), ShouldBeNil)
		So(testAuthentication(config.GenerateCatalogURL(), "GET"), ShouldBeNil)

		Convey("should return list of registered service classes as JSON payload", func() {
			code, body, err := osbclient.Default.GetCatalog()

			So(err, ShouldBeNil)
			So(code, ShouldEqual, 200)
			So(testJSONSchema(body), ShouldBeNil)
		})
	})
}
