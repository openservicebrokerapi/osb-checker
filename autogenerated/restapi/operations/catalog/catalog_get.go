// Code generated by go-swagger; DO NOT EDIT.

package catalog

// This file was generated by the swagger tool.
// Editing this file might prove futile when you re-run the generate command

import (
	"net/http"

	middleware "github.com/go-openapi/runtime/middleware"
)

// CatalogGetHandlerFunc turns a function with the right signature into a catalog get handler
type CatalogGetHandlerFunc func(CatalogGetParams, interface{}) middleware.Responder

// Handle executing the request and returning a response
func (fn CatalogGetHandlerFunc) Handle(params CatalogGetParams, principal interface{}) middleware.Responder {
	return fn(params, principal)
}

// CatalogGetHandler interface for that can handle valid catalog get params
type CatalogGetHandler interface {
	Handle(CatalogGetParams, interface{}) middleware.Responder
}

// NewCatalogGet creates a new http.Handler for the catalog get operation
func NewCatalogGet(ctx *middleware.Context, handler CatalogGetHandler) *CatalogGet {
	return &CatalogGet{Context: ctx, Handler: handler}
}

/*CatalogGet swagger:route GET /v2/catalog Catalog catalogGet

get the catalog of services that the service broker offers

*/
type CatalogGet struct {
	Context *middleware.Context
	Handler CatalogGetHandler
}

func (o *CatalogGet) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	route, rCtx, _ := o.Context.RouteInfo(r)
	if rCtx != nil {
		r = rCtx
	}
	var Params = NewCatalogGetParams()

	uprinc, aCtx, err := o.Context.Authorize(r, route)
	if err != nil {
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}
	if aCtx != nil {
		r = aCtx
	}
	var principal interface{}
	if uprinc != nil {
		principal = uprinc
	}

	if err := o.Context.BindValidRequest(r, route, &Params); err != nil { // bind params
		o.Context.Respond(rw, r, route.Produces, route, err)
		return
	}

	res := o.Handler.Handle(Params, principal) // actually handle the request

	o.Context.Respond(rw, r, route.Produces, route, res)

}