'use strict';

// Some modules
const path = require('path');

// Load config
const config = require(path.resolve(__dirname, '..', 'config.json'));

/**
 * Check if a route is on protected routes
 * @param  {string}  route           Route to check
 * @param  {Object}  protectedRoutes  List of protected routes
 * @return {boolean}
 */
function isProtected (route, protectedRoutes) {
	for (const protectedRoute of protectedRoutes) {
		if (route.startsWith(protectedRoute)) {
			return true;
		}
	}
	return false;
}

/**
 * Validate Authorization header of a request
 * @param  {Object}   protectedRoutes  List of protected routes
 * @return  {Function}
 */
function checkAuth (protectedRoutes) {
	return function (req, res, next) {
		// Filter on protected routes
		if (isProtected(req.path, protectedRoutes)) {
			// Protect only non-GET method
			// Check that authorization token contains the admin token
			if (req.method !== 'GET' && config.authentication.adminToken !== req.get('Authorization')) {
				res.status(401).json({'status': 401, 'message': 'You need a valid admin token'});
			} else {
				next();
			}
		} else {
			next();
		}
	};
}

/**
 * Validate Mattermost token
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next Next function to call
 */
function validateMattermost (req, res, next) {
	// Check token sent by Mattermost
	if (req.body.token !== config.mattermost.token) {
		res.sendStatus(401);
	} else {
		next();
	}
}

module.exports.checkAuth = checkAuth;
module.exports.validateMattermost = validateMattermost;
