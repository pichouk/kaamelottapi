'use strict';

/**
 * Set generic API response headers
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next Next function to call
 */
function setApiHeaders (req, res, next) {
	// Set content-type
	res.set('Content-Type', 'application/json; charset=utf-8');

	// Prevent browsers from MIME-type sniffing
	res.set('X-Content-Type-Options', 'nosniff');
	// Prevent browsers from using in iframe
	res.set('X-Frame-Options', 'deny');
	// Content security policy
	res.set('Content-Security-Policy', 'default-src \'none\'');

	// Remove fingerprint headers
	res.removeHeader('X-Powered-By');

	next();
}

module.exports.setApiHeaders = setApiHeaders;
