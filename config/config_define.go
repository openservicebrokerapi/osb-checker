package config

type Config struct {
	URL             string      `json:"url"`
	APIVersion      string      `json:"apiVersion"`
	Authentication  *AuthOption `json:"authentication"`
	PollingInterval int         `json:"pollingInterval"`
	MaxPollingNum   int         `json:"maxPollingNum"`
	Services        []*Service  `json:"services"`
}

type AuthOption struct {
	AuthType string `json:"authType"`
	Username string `json:"username,omitempty"`
	Password string `json:"password,omitempty"`
}

type Service struct {
	Name             string       `json:"name"`
	ServiceID        string       `json:"service_id"`
	OrganizationGUID string       `json:"organization_guid"`
	SpaceGUID        string       `json:"space_guid"`
	Operations       []*Operation `json:"operations"`
}

type Operation struct {
	Type       string                 `json:"type"`
	PlanID     string                 `json:"plan_id,omitempty"`
	Async      bool                   `json:"async,omitempty"`
	Parameters map[string]interface{} `json:"parameters,omitempty"`
}
