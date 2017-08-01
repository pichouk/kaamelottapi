'use strict';

const path = require('path');
const db = require(path.resolve(__dirname, '..', 'db', 'driver.js'));
const yargs = require('yargs');
const fs = require('mz/fs');

/**
 * Parse and return the application arguments
 *
 * @returns {Object}
 */
function parseArgs () {
	const y = yargs
		.strict()
		.usage('Usage: $0 --file <JSON_FILE>')
		.demand(0, 0)
		.command(
			'loadJson',
			'Load some JSON data to API database'
		);

	y.demand('file', true)
		.nargs('file', 1)
		.describe('file', 'Path to the JSON file to load')
		.string('file');

	y.help('h')
		.alias('h', 'help');

	return y.argv;
}

/**
 * Load a JSON file to API database
 */
async function main () {
	// Get CLI args
	const args = parseArgs();

	// Load the JSON file
	let data = {};
	try {
		data = JSON.parse(await fs.readFile(path.resolve(process.cwd(), args.file), 'utf-8'));
	} catch (e) {
		throw (e);
	}

	// Load authors
	if (data.authors) {
		for (const author of data.authors) {
			await db.createAuthor(author);
		}
	}

	// Load quotes
	if (data.quotes) {
		for (const quote of data.quotes) {
			await db.createQuote(quote);
		}
	}
}

main();
