'use strict';

/**
 * Generate the icon URL for a quote
 * @param  {Object} author Author object
 * @param  {Object} req   Express request object
 * @return {string}       URL for the author icon
 */
function getIconUrl (author, req) {
	return req.protocol + '://' + req.get('host') + '/icons/' + author.name + '.jpg';
}

module.exports.getIconUrl = getIconUrl;
