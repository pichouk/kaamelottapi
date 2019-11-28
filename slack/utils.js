'use strict';
const request = require('request-promise-native');

/**
 * Reply an error to Slack server
 * @param  {string} response_url   URL to send response to Slack
 * @param  {string} text Error message
 */
async function sendSlackError(response_url, text) {
  const response = {
    'response_type': 'ephemeral'
  };

  if (text) {
    response.text = text;
  } else {
    response.text = 'Unknown error from API.';
  }

  // Send error
  const responseOptions = {
    uri: response_url,
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    json: response
  };
  await request(responseOptions);
}

module.exports.sendSlackError = sendSlackError;
