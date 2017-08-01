'use strict';

// Some modules
const express = require('express');
const path = require('path');
const dbInit = require(path.resolve(__dirname, 'db', 'init'));
const morgan = require('morgan'); // Logging middleware
const bodyParser = require('body-parser'); // Parse data
const checkHeadersMid = require(path.resolve(__dirname, 'middlewares', 'checkHeaders')); // Check request headers
const setHeadersMid = require(path.resolve(__dirname, 'middlewares', 'setHeaders')); // Set response headers
const authMid = require(path.resolve(__dirname, 'middlewares', 'auth')); // Authentication middleware

// Load config
const config = require(path.resolve(__dirname, 'config.json'));

// Import routes
const apiRoutes = require(path.resolve(__dirname, 'api', 'routes'));

// CONSTANTS
const baseApiPath = '/api/v1';

/**
 * Main function
 */
async function main () {
	// Check database state
	await dbInit.checkDatabase();

	// Create Express.js server
	const app = express();

	// MIDDLEWARES
	// Logging
	app.use(morgan('combined'));
	// Static files
	app.use(express.static('static'));
	// Validate Accept Header
	app.use(checkHeadersMid.validateAcceptHeader);
	// Set response headers
	app.use(setHeadersMid.setApiHeaders);
	// Trust proxy if needed
	if (config.server.behindProxy) {
		app.enable('trust proxy');
	}
	// Parse JSON data
	app.use(bodyParser.json());
	// Protect admin routes (non-GET requests)
	app.use(authMid.checkAuth);

	// ROUTES
	app.get(baseApiPath + '/quote/random', apiRoutes.getRandomQuote);
	app.get(baseApiPath + '/quote/:id', apiRoutes.getQuoteById);
	app.get(baseApiPath + '/character/:id', apiRoutes.getCharacterById);
	app.get(baseApiPath + '/character/:id/random', apiRoutes.getQuoteByAuthor);

	// Admin routes
	app.post(baseApiPath + '/quote', apiRoutes.createQuote);
	app.patch(baseApiPath + '/quote/:id', apiRoutes.modifyQuote);
	app.delete(baseApiPath + '/quote/:id', apiRoutes.deleteQuote);


	// Return 404 if incorrect request route
	app.use(function (req, res) {
		res.status(404).json({'status': 404, 'message': 'Not found'});
	});

	app.listen(3000);
	console.log('Listening on port 3000...');
}

main();
