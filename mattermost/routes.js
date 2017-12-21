'use strict';

const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db', 'driver.js'));
const utils = require(path.resolve(__dirname, 'utils'));

// Get a quote
exports.getQuote = async function (req, res) {
	// Get request data
	const data = req.body;

	let character = {};
	if (data.text !== undefined && data.text !== '') {
		// Filter on a specific character
		try {
			character = await db.getCharacter(data.text);
			// If not found
			if (character === undefined) {
				utils.sendMattermostError(res, 'Character ' + data.text + ' not found');
				return;
			}
		} catch (e) {
			// If internal error
			utils.sendMattermostError(res, e.message);
			return;
		}
	}

	// Get a quote
	let quote = {};
	try {
		quote = await db.getRandomQuote(character.id);
		// If not found
		if (quote === undefined) {
			utils.sendMattermostError(res, 'Impossible to get a quote');
			return;
		}
	} catch (e) {
		// If internal error
		utils.sendMattermostError(res, e.message);
		return;
	}

	// Build answer
	const response = {
		'username': quote.author.fullName,
		'icon_url': utils.getIconUrl(quote.author, req),
		'response_type': 'in_channel',
		'text': quote.quote.text
	};

	// Send quote
	res.json(response);
};
