package config

type Config struct {
	URL            string      `yaml:"url"`
	APIVersion     string      `yaml:"apiVersion"`
	Authentication *AuthOption `yaml:"authentication"`
	Services       []*Service  `yaml:"services"`
}

type AuthOption struct {
	AuthType string `yaml:"authType"`
	Username string `yaml:"username,omitempty"`
	Password string `yaml:"password,omitempty"`
}

type Service struct {
	Name             string       `yaml:"name"`
	ServiceID        string       `yaml:"service_id"`
	OrganizationGUID string       `yaml:"organization_guid"`
	SpaceGUID        string       `yaml:"space_guid"`
	Operations       []*Operation `yaml:"operations"`
}

type Operation struct {
	Type       string      `yaml:"type"`
	PlanID     string      `yaml:"plan_id,omitempty"`
	Async      bool        `yaml:"async,omitempty"`
	Parameters interface{} `yaml:"parameters,omitempty"`
}
