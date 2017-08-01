'use strict';

// Some modules
const path = require('path');

// Load config
const config = require(path.resolve(__dirname, '..', 'config.json'));

/**
 * Validate Authorization header of a request
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next Next function to call
 */
function checkAuth (req, res, next) {
	// Protect only non-GET method
	// Check that authorization token contains the admin token
	if (req.method !== 'GET' && config.authentication.adminToken !== req.get('Authorization')) {
		res.status(401).json({'status': 401, 'message': 'You need a valid admin token'});
	} else {
		next();
	}
}

module.exports.checkAuth = checkAuth;
