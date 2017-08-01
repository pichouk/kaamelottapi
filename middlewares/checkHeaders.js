'use strict';

/**
 * Validate Accept header of a request, or return a 406 code
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next Next function to call
 */
function validateAcceptHeader (req, res, next) {
	// Only accept json
	if (req.accepts('application/json')) {
		next();
	} else {
		res.status(406).json({'status': 406, 'message': 'You should accept JSON Content-Type'});
	}
}

module.exports.validateAcceptHeader = validateAcceptHeader;
