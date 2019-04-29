package config

import (
	"encoding/json"
	"errors"
	"io/ioutil"
	"net/url"
	"strings"

	"gopkg.in/yaml.v2"
)

var CONF = &Config{}

func Load(path string) error {
	// Check if the config path is empty
	if path == "" {
		return errors.New("config path can not be empty")
	}
	// Try to parse config file type
	fType := getFileType(path)
	if fType == "" {
		return errors.New("cannot load " + path + " file")
	}

	switch fType {
	case "JSON":
		return loadFromJSON(path)
	case "YAML":
		return loadFromYAML(path)
	default:
		break
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

func getFileType(path string) string {
	s := strings.Split(path, ".")
	ext := s[len(s)-1]
	switch ext {
	case "yaml", "yml":
		return "YAML"
	}

	return ""
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
