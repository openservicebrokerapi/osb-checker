// It should be assigned by the test framework
var config = {}

module.exports = {
  setConfig: function (_config) {
    config = _config
  },
  getConfig: function () {
    return config
  }
}
