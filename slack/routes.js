'use strict';

const path = require('path');
const request = require('request-promise-native');
const db = require(path.resolve(__dirname, '..', 'db', 'driver.js'));
const utils = require(path.resolve(__dirname, 'utils'));

// Get a quote
exports.getQuote = async function (req, res) {
  // Get request data
  const data = req.body;

  // Check response_url
  if (data.response_url == undefined || data.response_url == '') {
    res.status(400).json({ 'status': 400, 'message': 'No response_url provided' });
    return;
  }
  // Send ACK to Slack
  const response_url = data.response_url;
  res.status(200).send();

  let character = {};
  if (data.text !== undefined && data.text !== '') {
    // Filter on a specific character
    try {
      character = await db.getCharacter(data.text);
      // If not found
      if (character === undefined) {
        await utils.sendSlackError(response_url, 'Character ' + data.text + ' not found');
        return;
      }
    } catch (e) {
      // If internal error
      await utils.sendSlackError(response_url, e.message);
      return;
    }
  }

  // Get a quote
  let quote = {};
  try {
    quote = await db.getRandomQuote(character.id);
    // If not found
    if (quote === undefined) {
      await utils.sendSlackError(response_url, 'Impossible to get a quote');
      return;
    }
  } catch (e) {
    // If internal error
    await utils.sendSlackError(response_url, e.message);
    return;
  }

  // Build answer
  const response = {
    'response_type': 'in_channel',
    'text': '> ' + quote.quote.text + '\n' + quote.author.fullName
  };
  // Send quote
  const responseOptions = {
    uri: response_url,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: response
  };
  await request(responseOptions);
};
