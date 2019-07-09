'use strict';

var _loglevel = require('loglevel');

var logger = _interopRequireWildcard(_loglevel);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

//logger.disableAll();

if (typeof process !== 'undefined' && process.env.ROUNDWARE_DEBUG === "true") {
  /* istanbul ignore next */
  logger.setDefaultLevel('debug');
}

module.exports = {
  logger: logger
};