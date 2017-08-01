'use strict';
// Load configuration
const path = require('path');
const db = require(path.resolve(__dirname, 'driver'));

/**
 * Create the authors table
 */
async function createAuthorsTable () {
	const query = 'CREATE TABLE authors ( \
		id uuid PRIMARY KEY UNIQUE,\
		name text NOT NULL UNIQUE,\
		full_name text NOT NULL\
	);';
	await db.runQuery(query);
}

/**
 * Create the quotes table
 */
async function createQuotesTable () {
	const query = 'CREATE TABLE quotes ( \
		id uuid PRIMARY KEY UNIQUE,\
		author_id uuid references authors(id),\
		quote text NOT NULL\
	);';
	await db.runQuery(query);
}

/**
 * Check that the database is properly initialise, or do it
 */
async function checkDatabase () {
	// Check authors table
	const checkAuthorsTable = 'SELECT EXISTS ( \
		SELECT 1 \
		FROM   information_schema.tables \
		WHERE  table_name = \'authors\' \
	);';
	let res = await db.runQuery(checkAuthorsTable);
	if (!res[0].exists) {
		console.log('Creating missing authors table.');
		await createAuthorsTable();
	}

	// Check quotes table
	const checkQuotesTable = 'SELECT EXISTS ( \
		SELECT 1 \
		FROM   information_schema.tables \
		WHERE  table_name = \'quotes\' \
	);';
	res = await db.runQuery(checkQuotesTable);
	if (!res[0].exists) {
		console.log('Creating missing quotes table.');
		await createQuotesTable();
	}

}

module.exports.checkDatabase = checkDatabase;
