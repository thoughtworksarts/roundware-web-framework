"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _project = require("./project");

var _session = require("./session");

var _speaker = require("./speaker");

var _geoPosition = require("./geo-position");

var _stream = require("./stream");

var _asset = require("./asset");

var _shims = require("./shims");

var _apiClient = require("./api-client");

var _user = require("./user");

var _envelope = require("./envelope");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** This class is the primary integration point between Roundware's server and your application
    NOTE that we depend on jQuery being injected, because we use its $.ajax function. As browsers
    evolve and the whatwg-fetch polyfill evolves, we may be able to switch over to using window.fetch

   @example
   var roundwareServerUrl = "http://localhost:8888/api/2";
   var roundwareProjectId = 1;

   var roundware = new Roundware(window,{
     serverUrl: roundwareServerUrl,
     projectId: roundwareProjectId
   });

   function ready() {
     console.info("Connected to Roundware Server. Ready to play.");
     // this is a good place to initialize audio player controls, etc.
   }

   // Generally we throw user-friendly messages and log a more technical message
   function handleError(userErrMsg) {
     console.error("Roundware Error: " + userErrMsg);
   }

  roundware.connect().
    then(ready).
    catch(handleError);

  function startListening(streamURL) {
    console.info("Loading " + streamURL);
    // good place to connect your audio player to the audio stream
  }

  roundware.play(startListening).catch(handleError);
**/
var Roundware = function () {
  /** Initialize a new Roundware instance
   * @param {Object} window - representing the context in which we are executing - provides references to window.navigator, window.console, etc.
   * @param {Object} options - Collection of parameters for configuring this Roundware instance
   * @param {String} options.serverUrl - identifies the Roundware server
   * @param {Number} options.projectId - identifies the Roundware project to connect
   * @param {Boolean} options.geoListenEnabled - whether or not to attempt to initialize geolocation-based listening
   * @throws Will throw an error if serveUrl or projectId are missing **/
  function Roundware(window) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Roundware);

    this._serverUrl = options.serverUrl;
    this._projectId = options.projectId;
    this._speakerFilters = options.speakerFilters;
    this._assetFilters = options.assetFilters;

    if (this._serverUrl === undefined) {
      throw "Roundware objects must be initialized with a serverUrl";
    }

    if (this._projectId === undefined) {
      throw "Roundware objects must be initialized with a projectId";
    }

    this._apiClient = new _apiClient.ApiClient(window, this._serverUrl);
    options.apiClient = this._apiClient;

    var navigator = window.navigator;

    this._user = options.user || new _user.User(options);
    this._geoPosition = options.geoPosition || new _geoPosition.GeoPosition(navigator, options);
    this._session = options.session || new _session.Session(navigator, this._projectId, this._geoPosition.geoListenEnabled, options);
    this._project = options.project || new _project.Project(this._projectId, options);
    this._stream = options.stream || new _stream.Stream(options);
    this._speaker = options.speaker || new _speaker.Speaker(this._projectId, options);
    this._asset = options.asset || new _asset.Asset(this._projectId, options);
  }

  /** Initiate a connection to Roundware
   *  @return {Promise} - Can be resolved in order to get the audio stream URL, or rejected to get an error message; see example above **/


  _createClass(Roundware, [{
    key: "connect",
    value: function connect() {
      var _this = this;

      var that = this;

      this._geoPosition.connect(function (newCoords) {
        // want to start this process as soon as possible, as it can take a few seconds
        that._stream.update(newCoords);
      });

      _shims.logger.info("Initializing Roundware for project ID #" + this._projectId);

      return this._user.connect().then(this._session.connect).then(function (sessionId) {
        return _this._project.connect(sessionId);
      }).then(function (sessionId) {
        return _this._sessionId = sessionId;
      }).then(this._project.uiconfig).then(function (uiConfig) {
        return _this._uiConfig = uiConfig;
      }).then(function (data) {
        return _this._speaker.connect(_this._speakerFilters);
      }).then(function (speakerData) {
        return _this._speakerData = speakerData;
      }).then(function (data) {
        return _this._asset.connect(_this._assetFilters);
      }).then(function (assetData) {
        return _this._assetData = assetData;
      });
    }

    /** Create or resume the audio stream
     * @see Stream.play **/

  }, {
    key: "play",
    value: function play() {
      var _this2 = this;

      var firstPlayCallback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

      return this._geoPosition.waitForInitialGeolocation().then(function (initialCoordinates) {
        return _this2._stream.play(_this2._sessionId, initialCoordinates, firstPlayCallback);
      });
    }

    /** Tell Roundware server to pause the audio stream. You should always call this when the local audio player has been paused.
     * @see Stream.pause **/

  }, {
    key: "pause",
    value: function pause() {
      this._stream.pause();
    }

    /** Tell Roundware server to kill the audio stream.
     * @see Stream.kill **/

  }, {
    key: "kill",
    value: function kill() {
      this._stream.kill();
    }

    /** Tell Roundware server to replay the current asset.
     * @see Stream.replay **/

  }, {
    key: "replay",
    value: function replay() {
      this._stream.replay();
    }

    /** Tell Roundware server to skip the current asset.
     * @see Stream.skip **/

  }, {
    key: "skip",
    value: function skip() {
      this._stream.skip();
    }

    /** Update the Roundware stream with new tag IDs
     * @param {string} tagIdStr - comma-separated list of tag IDs to send to the streams API **/

  }, {
    key: "tags",
    value: function tags(tagIdStr) {
      this._stream.update({ tag_ids: tagIdStr });
    }

    /** Update the Roundware stream with new tag IDs and or geo-position
     * @param {object} data - containing keys latitude, longitude and tagIds **/

  }, {
    key: "update",
    value: function update() {
      var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      // Object.keys(data).map(e => console.log(`key=${e}  value=${data[e]}`));
      this._stream.update(data);
    }

    /** Attach new assets to the project
     * @param {Object} audioData - the binary data from a recording to be saved as an asset
     * @param {string} fileName - name of the file
     * @return {promise} - represents the API calls to save an asset; can be tested to find out whether upload was successful
     * @see Envelope.upload */

  }, {
    key: "saveAsset",
    value: function saveAsset(audioData, fileName, data) {
      if (!this._sessionId) {
        return Promise.reject("can't save assets without first connecting to the server");
      }

      var envelope = new _envelope.Envelope(this._sessionId, this._apiClient, this._geoPosition);

      return envelope.connect().then(function () {
        envelope.upload(audioData, fileName, data);
      });
    }
  }]);

  return Roundware;
}();

// Slight hack here to export Roundware module to browser properly; see https://github.com/webpack/webpack/issues/3929


module.exports = Roundware;