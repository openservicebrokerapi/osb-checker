package config

import (
	"encoding/json"
	"errors"
	"io/ioutil"
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

	return nil
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
