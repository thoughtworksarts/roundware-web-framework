"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Session = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var clientSystem = "Unknown";
var projectId, sessionId, geoListenEnabled;
var apiClient = {};

/** Responsible for establishing a session with the Roundware server **/

var Session = exports.Session = function () {
  /** Create a new Session
   * @param {object} navigator - provides access to the userAgent string
   * @param {Number} newProjectId - identifies the Roundware project to associate with this session
   * @param {Boolean} geoListenEnablement - whether the server should enable geo listening features
   * @param {Object} options - Various configuration parameters for this session
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
  **/
  function Session(navigator, newProjectId, geoListenEnablement, options) {
    _classCallCheck(this, Session);

    clientSystem = navigator.userAgent;

    if (clientSystem.length > 127) {
      // on mobile browsers, this string is longer than the server wants
      clientSystem = clientSystem.slice(0, 127);
    }

    projectId = newProjectId;
    geoListenEnabled = geoListenEnablement;

    apiClient = options.apiClient;
  }

  /** @returns {String} human-readable representation of this session **/


  _createClass(Session, [{
    key: "toString",
    value: function toString() {
      return "Roundware Session #" + sessionId;
    }

    /** Make an asynchronous API call to establish a session with the Roundware server
     * @return {Promise} represents the pending API call
     **/

  }, {
    key: "connect",
    value: function connect() {
      var requestData = {
        project_id: projectId,
        geo_listen_enabled: geoListenEnabled,
        client_system: clientSystem
      };

      return apiClient.post("/sessions/", requestData).then(function (data) {
        sessionId = data.id;
        return sessionId;
      });
    }
  }]);

  return Session;
}();