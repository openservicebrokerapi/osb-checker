package config

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/url"
	"strings"

	"github.com/ghodss/yaml"
)

var CONF = &Config{}

func Load(path string) error {
	// Check if the config path is empty
	if path == "" {
		return errors.New("config path can not be empty")
	}
	// Try to parse config file type
	s := strings.Split(path, ".")
	fType := s[len(s)-1]

	switch strings.ToUpper(fType) {
	case "JSON":
		 loadFromJSON(path)
		 break
	case "YAML", "YML":
		 loadFromYAML(path)
		 break
	default:
		return errors.New("cannot load " + path + " file")
	}

	return validate(CONF)
}

func loadFromJSON(path string) error {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}

	return json.Unmarshal(f, CONF)
}

func loadFromYAML(path string) error {
	f, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}

	return yaml.Unmarshal(f, CONF)
}

func validate(cfg *Config) error {
	// Currently the test framework only supports v2.14
	if cfg.APIVersion != Version214 {
		return errors.New("version " + cfg.APIVersion + " is not supported")
	}
	// Validate the legality of url
	if _, err := url.Parse(cfg.URL); err != nil {
		return err
	}
	return nil
}
