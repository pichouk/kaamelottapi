'use strict';

/**
 * Reply an error to Mattermost server
 * @param  {Object} res   Express response object
 * @param  {string} text Error message
 */
function sendMattermostError (res, text) {
	const response = {
		'username': 'Kaamelott API',
		'icon_emoji': 'robot',
		'response_type': 'ephemeral'
	};

	if (text) {
		response.text = text;
	} else {
		response.text = 'Unknown error from API.';
	}

	res.json(response);
}

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
module.exports.sendMattermostError = sendMattermostError;
