"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Asset = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var projectId, apiClient;

var Asset = exports.Asset = function () {
  function Asset(newProjectId, options) {
    _classCallCheck(this, Asset);

    projectId = newProjectId;
    apiClient = options.apiClient;
  }

  _createClass(Asset, [{
    key: "toString",
    value: function toString() {
      return "Roundware Assets '" + projectName + "' (#" + projectId + ")";
    }
  }, {
    key: "connect",
    value: function connect() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var path = "/assets/";
      // add project_id to any incoming filter data
      data['project_id'] = projectId;

      return apiClient.get(path, data).then(function connectionSuccess(data) {
        return data;
      });
    }
  }]);

  return Asset;
}();