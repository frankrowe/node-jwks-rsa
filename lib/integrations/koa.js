'use strict';

var _errors = require('../errors');

var _JwksClient = require('../JwksClient');

module.exports.koaJwtSecret = function () {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


  if (!options.jwksUri) {
    throw new _errors.ArgumentError('No JWKS URI provided');
  }

  var client = new _JwksClient.JwksClient(options);

  return function secretProvider() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        alg = _ref.alg,
        kid = _ref.kid;

    return new Promise(function (resolve, reject) {

      // Only RS256 is supported.
      if (alg !== 'RS256') {
        return reject(new Error('Missing / invalid token algorithm'));
      }

      client.getSigningKey(kid, function (err, key) {
        if (err) {

          if (options.handleSigningKeyError) {
            return options.handleSigningKeyError(err).then(reject);
          }

          return reject(err);
        }

        // Provide the key.
        resolve(key.publicKey || key.rsaPublicKey);
      });
    });
  };
};