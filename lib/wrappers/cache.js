'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (client) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options,
      _ref$cacheMaxEntries = _ref.cacheMaxEntries,
      cacheMaxEntries = _ref$cacheMaxEntries === undefined ? 5 : _ref$cacheMaxEntries,
      _ref$cacheMaxAge = _ref.cacheMaxAge,
      cacheMaxAge = _ref$cacheMaxAge === undefined ? (0, _ms2.default)('10m') : _ref$cacheMaxAge,
      _ref$useTmpFileCache = _ref.useTmpFileCache,
      useTmpFileCache = _ref$useTmpFileCache === undefined ? false : _ref$useTmpFileCache;

  var logger = (0, _debug2.default)('jwks');
  var getSigningKey = client.getSigningKey;

  logger('Configured caching of singing keys. Max: ' + cacheMaxEntries + ' / Age: ' + cacheMaxAge);

  var fileCacheGet = function fileCacheGet(kid, callback) {
    var filePath = '/tmp/jwks-cache';
    if (!(0, _fs.existsSync)(filePath)) {
      (0, _fs.writeFileSync)(filePath, JSON.stringify({}));
    }
    (0, _fs.readFile)(filePath, 'utf8', function (err, data) {
      if (err) {
        return callback(err);
      }
      var jsonData = JSON.parse(data);
      if (jsonData[kid]) {
        return callback(null, jsonData[kid]);
      }

      getSigningKey(kid, function (err, key) {
        if (err) {
          return callback(err);
        }
        logger('Caching signing key in filesystem for \'' + kid + '\':', key);
        var content = _extends({}, jsonData, _defineProperty({}, kid, key));
        (0, _fs.writeFile)(filePath, JSON.stringify(content), function (err) {
          if (err) {
            return callback(err);
          }
          return callback(null, key);
        });
      });
    });
  };

  return (0, _lruMemoizer2.default)({
    load: function load(kid, callback) {
      if (useTmpFileCache) {
        return fileCacheGet(kid, callback);
      }

      getSigningKey(kid, function (err, key) {
        if (err) {
          return callback(err);
        }

        logger('Caching signing key for \'' + kid + '\':', key);
        return callback(null, key);
      });
    },
    hash: function hash(kid) {
      return kid;
    },
    maxAge: cacheMaxAge,
    max: cacheMaxEntries
  });
};

var _ms = require('ms');

var _ms2 = _interopRequireDefault(_ms);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _lruMemoizer = require('lru-memoizer');

var _lruMemoizer2 = _interopRequireDefault(_lruMemoizer);

var _fs = require('fs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }