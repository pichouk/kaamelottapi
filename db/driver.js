'use strict';

const {Pool} = require('pg');
const path = require('path');
const _ = require('lodash');
const uuidv4 = require('uuid/v4');

// Load configuration
const config = require(path.resolve(__dirname, '..', 'config.json'));

// Connect to database
const conn = new Pool({
	host: config.database.host,
	port: config.database.port,
	database: config.database.database,
	user: config.database.user,
	password: config.database.password
});

/**
 * Perform a query on the database
 * @param  {Object} query Query object to run
 * @return {Object}       Returned data
 */
async function runQuery (query) {
	// Query database
	const res = await conn.query(query)
		.catch((e) => {
			throw e;
		});

	return res.rows;
}

/**
 * Build a quote object based on raw data returned by database
 * @param  {Array} rawData  Array of columns returned
 * @return {Object}         Quote object
 */
function buildQuote (rawData) {
	const quote = {
		'id': rawData.id,
		'quote': {
			'text': rawData.quote
		},
		'author': {
			'name': rawData.name,
			'fullName': rawData.full_name
		}
	};
	return quote;
}

/**
 * Build a characetr object based on raw data returned by database
 * @param  {Array} rawData  Array of columns returned
 * @return {Object}         Character object
 */
function buildCharacter (rawData) {
	const character = {
		'id': rawData.id,
		'character': {
			'name': rawData.name,
			'fullName': rawData.full_name
		}
	};
	return character;
}

/**
 * Get a character by name or id
 * @param  {string} idOrName  authorId to filter on
 * @return {Object} Character object
 */
async function getCharacter (idOrName) {
	// Prepare database query
	const query = {
		text: '',
		values: []
	};
	query.text = 'SELECT * FROM authors a ';

	// Test if it is an UUID or the character name
	const regexUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (regexUuid.test(idOrName)) {
		query.text += 'WHERE a.id = $1 ';
	} else {
		query.text += 'WHERE a.name = $1 ';
	}
	query.text += 'LIMIT 1;';
	query.values = [idOrName];

	// Get the character
	let data = [];
	try {
		data = await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Error when getting character in database');
	}

	// If not found
	if (_.isEmpty(data)) {
		return undefined;
	}

	// Build the character object
	return buildCharacter(data[0]);
}

/**
 * Return a random quote
 * @param  {string} authorId Optionnal authorId to filter on
 * @return {Object}          Quote object
 */
async function getRandomQuote (authorId) {
	// Prepare database query
	const query = {
		text: '',
		values: []
	};
	query.text = 'SELECT q.id, q.quote, a.name, a.full_name FROM quotes q, authors a WHERE q.author_id = a.id ';
	if (authorId) {
		query.text += 'AND q.author_id = $1 ';
		query.values = [authorId];
	}
	query.text += 'ORDER BY random() LIMIT 1;';

	// Get the quote
	let data = [];
	try {
		data = await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Error when getting quote in database');
	}

	// If not found
	if (_.isEmpty(data)) {
		return undefined;
	}

	// Build the quote object
	return buildQuote(data[0]);
}

/**
 * Get a specific quote (by id)
 * @param  {string} id Quote ID
 * @return {Object}          Quote object
 */
async function getQuote (id) {
	// Prepare database query
	const query = {
		text: 'SELECT q.id, q.quote, a.name, a.full_name FROM quotes q, authors a \
      WHERE q.author_id = a.id AND q.id = $1;',
		values: [id]
	};

	// Get the quote
	let data = [];
	try {
		data = await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Error when getting quote in database');
	}

	if (_.isEmpty(data)) {
		return undefined;
	}

	// Build the quote object
	return buildQuote(data[0]);
}

/**
 * Create a new author on database
 * @param  {Object} author   Author to insert
 */
async function createAuthor (author) {
	// Prepare creation query
	const query = {
		text: 'INSERT INTO authors(id, name, full_name) VALUES($1, $2, $3) \
  ON CONFLICT (name) DO NOTHING',
		values: [uuidv4(), author.name, author.fullName]
	};

	// Create
	try {
		await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Impossible to create new author in database');
	}
	console.log('Successfully inserted new author\n' + JSON.stringify(author));
}

/**
 * Create a new quote on database
 * @param  {Object} quote   Quote to insert
 */
async function createQuote (quote) {
	// Get the author id
	const author = await getCharacter(quote.author);
	if (author === undefined) {
		throw new Error('Non existing character ' + quote.author);
	}

	// Prepare creation query
	const query = {
		text: 'INSERT INTO quotes(id, author_id, quote) VALUES($1, $2, $3)',
		values: [uuidv4(), author.id, quote.quote.text]
	};

	try {
		await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Impossible to create new quote in database');
	}
	console.log('Successfully inserted new quote\n' + JSON.stringify(quote));
}

/**
 * Modify a quote on database
 * @param  {Object} quote   Quote to insert
 */
async function updateQuote (quote) {
	// Prepare update query
	const query = {
		text: 'UPDATE quotes SET author_id = $1, quote = $2 WHERE id = $3',
		values: [quote.author, quote.quote.text, quote.id]
	};

	// Run query
	try {
		await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Impossible to update quote in database');
	}
	console.log('Successfully updated quote\n' + JSON.stringify(quote));
}

/**
 * Delete a quote on database
 * @param  {string} id   Quote ID to delete
 */
async function deleteQuote (id) {
	// Prepare delete query
	const query = {
		text: 'DELETE FROM quotes WHERE id = $1',
		values: [id]
	};

	// Run query
	try {
		await runQuery(query);
	} catch (e) {
		console.error(e.message);
		throw new Error('Impossible to delete quote in database');
	}
	console.log('Successfully deleted quote ' + id);
}

// Exports
module.exports.runQuery = runQuery;
module.exports.getQuote = getQuote;
module.exports.getCharacter = getCharacter;
module.exports.getRandomQuote = getRandomQuote;
module.exports.createAuthor = createAuthor;
module.exports.createQuote = createQuote;
module.exports.updateQuote = updateQuote;
module.exports.deleteQuote = deleteQuote;
