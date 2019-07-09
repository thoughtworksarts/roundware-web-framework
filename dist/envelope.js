"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Envelope = exports.Envelope = function () {
  /** Create an Envelope
   * @param {number} sessionId - identifies the session associated with this asset
   * @param {ApiClient} apiClient - the API client object to use for server API calls
   * @param {geoPosition} geoPosition -
   **/
  function Envelope(sessionId, apiClient, geoPosition) {
    _classCallCheck(this, Envelope);

    this._envelopeId = "(unknown)";
    this._sessionId = sessionId;
    this._apiClient = apiClient;
    this._geoPosition = geoPosition;
  }

  /** @returns {String} human-readable representation of this asset **/


  _createClass(Envelope, [{
    key: "toString",
    value: function toString() {
      return "Envelope " + this._assetId;
    }

    /** Create a new Envelope in the server to which we can attach audio recordings as assets
     * @returns {Promise} represents the pending API call **/

  }, {
    key: "connect",
    value: function connect() {
      var _this = this;

      var data = {
        session_id: this._sessionId
      };

      return this._apiClient.post("/envelopes/", data).then(function (data) {
        _this._envelopeId = data.id;
      });
    }

    /** Sends an audio file to the server
     * @param {blob} audioData
     * @param {string} fileName - name of the file
     * @return {Promise} - represents the API call */

  }, {
    key: "upload",
    value: function upload(audioData, fileName) {
      var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (!this._envelopeId) {
        return Promise.reject("cannot upload audio without first connecting this envelope to the server");
      }

      var formData = new FormData();
      var coordinates = this._geoPosition.getLastCoords();
      console.log(coordinates);

      formData.append('session_id', this._sessionId);
      formData.append('file', audioData);
      formData.append('latitude', coordinates.latitude);
      formData.append('longitude', coordinates.longitude);

      if ('tag_ids' in data) {
        formData.append('tag_ids', data.tag_ids);
      }

      var path = "/envelopes/" + this._envelopeId + "/";

      console.info("Uploading " + fileName + " to envelope " + path);

      var options = {
        contentType: 'multipart/form-data',
        processData: false
      };

      return this._apiClient.patch(path, formData, options).then(function (data) {
        console.info("UPLOADDATA", data);
      });
    }
  }]);

  return Envelope;
}();