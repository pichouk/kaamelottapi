'use strict';

const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db', 'driver.js'));
const utils = require(path.resolve(__dirname, 'utils'));

// Get a random quote
exports.getRandomQuote = async function (req, res) {
	// Get the quote
	let quote = {};
	try {
		quote = await db.getRandomQuote();
		// Return 404 if not found
		if (quote === undefined) {
			res.status(404).json({'status': 404, 'message': 'Impossible to get a quote.'});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Set the icon url
	quote.author.iconUrl = utils.getIconUrl(quote.author, req);

	// Send quote
	res.json(quote);
};

// Get a quote by ID
exports.getQuoteById = async function (req, res) {
	// Get the quote
	let quote = {};
	try {
		quote = await db.getQuote(req.params.id);
		// Return 404 if not found
		if (quote === undefined) {
			res.status(404).json({'status': 404, 'message': 'Impossible to get quote ' + req.params.id});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Set the icon url
	quote.author.iconUrl = utils.getIconUrl(quote.author, req);

	// Send quote
	res.json(quote);
};

// Get a quote by character (id or name)
exports.getQuoteByAuthor = async function (req, res) {
	// Get the character
	let character = {};
	try {
		character = await db.getCharacter(req.params.id);
		// Return 404 if not found
		if (character === undefined) {
			res.status(404).json({'status': 404, 'message': 'Character ' + req.params.id + ' not found'});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Get a quote from this author
	let quote = {};
	try {
		quote = await db.getRandomQuote(character.id);
		// Return 404 if not found
		if (quote === undefined) {
			res.status(404).json({'status': 404, 'message': 'Impossible to get a quote for character ' + character.name});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Set the icon url
	quote.author.iconUrl = utils.getIconUrl(quote.author, req);

	// Send quote
	res.json(quote);
};

// Get a character by ID
exports.getCharacterById = async function (req, res) {
	// Get the character
	let character = {};
	try {
		character = await db.getCharacter(req.params.id);
		// Return 404 if not found
		if (character === undefined) {
			res.status(404).json({'status': 404, 'message': 'Character ' + req.params.id + ' not found'});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Set the icon url
	character.character.iconUrl = utils.getIconUrl(character.character, req);

	// Send quote
	res.json(character);
};

// Create a quote
exports.createQuote = async function (req, res) {
	// Validate parameters
	const data = req.body;
	if (data.quote === undefined || data.quote.text === undefined || data.author === undefined) {
		res.status(422).json({'status': 422, 'message': 'Incorrect quote object'});
		return;
	}

	// Create the quote
	try {
		await db.createQuote(data);
	} catch (e) {
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	res.json({'status': 200, 'message': 'Successfully inserted new quote'});
};

// Modify a quote
exports.modifyQuote = async function (req, res) {
	// Get data
	const data = req.body;

	// Get the existing quote
	let quote = {};
	try {
		quote = await db.getQuote(req.params.id);
		// Return 404 if not found
		if (quote === undefined) {
			res.status(404).json({'status': 404, 'message': 'Quote ' + req.params.id + ' does not exists'});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	// Change quote text if specified
	if (data.quote !== undefined && data.quote.text !== undefined) {
		quote.quote = data.quote;
	}

	// Change author if specified. Or get the ID of the current one if not
	let character = {};
	let authorId = quote.author.name;
	if (data.author !== undefined) {
		authorId = data.author;
	}
	// Get the author
	try {
		character = await db.getCharacter(authorId);
		// Return 404 if not found
		if (character === undefined) {
			res.status(404).json({'status': 404, 'message': 'Character ' + authorId + ' not found'});
			return;
		}
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}
	quote.author = character.id;

	// Update the quote
	try {
		await db.updateQuote(quote);
	} catch (e) {
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	res.json({'status': 200, 'message': 'Successfully updated quote ' + quote.id});
};

// Delete a quote
exports.deleteQuote = async function (req, res) {
	// Delete the quote
	try {
		await db.deleteQuote(req.params.id);
	} catch (e) {
		// Return 500 if internal error
		res.status(500).json({'status': 500, 'message': e.message});
		return;
	}

	res.json({'status': 200, 'message': 'Successfully delete quote ' + req.params.id});
};
