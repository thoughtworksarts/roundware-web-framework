"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GeoPosition = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _shims = require("./shims");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var initialGeoTimeoutSeconds = 1;

var defaultCoords = {
  latitude: 1,
  longitude: 1
};

// for an initial rapid, low-accuracy position
var fastGeolocationPositionOptions = {
  enableHighAccuracy: false,
  timeout: initialGeoTimeoutSeconds
};

// subsequent position monitoring should be high-accuracy
var accurateGeolocationPositionOptions = {
  enableHighAccuracy: true
};

/** Responsible for tracking the user's position, when geo listening is enabled and the browser is capable
 * @property {Boolean} geoListenEnabled - whether or not the geo positioning system is enabled and available
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation **/

var GeoPosition = exports.GeoPosition = function () {
  /** Create a new GeoPosition.
   * @param {Object} navigator - provides access to geolocation system
   * @param {Object} options - parameters for initializing this GeoPosition
   * @param {Boolean} [options.geoListenEnabled = false] - whether or not to attempt to use geolocation **/
  function GeoPosition(navigator) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, GeoPosition);

    this._navigator = navigator;
    this._initialGeolocationPromise = Promise.resolve(defaultCoords);
    this._lastCoords = defaultCoords;

    if (this._navigator.geolocation && options.geoListenEnabled) {
      this.geoListenEnabled = true;
    } else {
      this.geoListenEnabled = false;
    }
  }

  /** @return {String} Human-readable representation of this GeoPosition **/


  _createClass(GeoPosition, [{
    key: "toString",
    value: function toString() {
      return "GeoPosition (enabled: " + this.geoListenEnabled + ")";
    }

    /** @return {Object} coordinates - last known coordinates received from the geolocation system (defaults to latitude 1, longitude 1) **/

  }, {
    key: "getLastCoords",
    value: function getLastCoords() {
      return this._lastCoords;
    }

    /** Attempts to get an initial rough geographic location for the listener, then sets up a callback
     * to update the position.
     * @param {Function} geoUpdateCallback - object that should receive geolocation coordinate updates
     * @see geoListenEnabled **/

  }, {
    key: "connect",
    value: function connect() {
      var _this = this;

      var geoUpdateCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      if (!this.geoListenEnabled) {
        _shims.logger.info("Geolocation disabled");
        this._initialGeolocationPromise = Promise.resolve({});
        return;
      }

      _shims.logger.info("Initializing geolocation system");

      this._initialGeolocationPromise = new Promise(function (resolve, reject) {
        _this._navigator.geolocation.getCurrentPosition(function (initialPosition) {
          var coords = initialPosition.coords;
          _shims.logger.info("Received initial geolocation", coords);
          geoUpdateCallback(coords);
          _this._lastCoords = coords;

          var geoWatchId = _this._navigator.geolocation.watchPosition(function (updatedPosition) {
            var newCoords = updatedPosition.coords;
            geoUpdateCallback(newCoords);
            _this._lastCoords = coords;
          }, function (error) {
            _shims.logger.warn("Unable to watch position: " + error.message + " (code #" + error.code + ")");
          }, accurateGeolocationPositionOptions);

          _shims.logger.info("Monitoring geoposition updates (watch ID " + geoWatchId + ")");
          resolve(coords);
        }, function initialGeoError(error) {
          _shims.logger.warn("Unable to get initial geolocation: " + error.message + " (code #" + error.code + ")");
          resolve(defaultCoords);
        }, fastGeolocationPositionOptions);
      });
    }

    /** Allows you to wait on the progress of the .connect() behavior, attempting to get an initial
     * estimate of the user's position. Note that this promise will never fail - if we cannot get an
     * accurate estimate, we fall back to default coordinates (currently latitude 1, longitude 1)
     * @return {Promise} Represents the attempt to get an initial estimate of the user's position **/

  }, {
    key: "waitForInitialGeolocation",
    value: function waitForInitialGeolocation() {
      return this._initialGeolocationPromise;
    }
  }]);

  return GeoPosition;
}();