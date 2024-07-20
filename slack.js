const axios = require('axios')
const { SLACK_WEBHOOK_URL } = require('./config')

/**
 * Sends insights to a Slack channel using a webhook.
 *
 * @param {string} title - The title of the insights message.
 * @param {string} insights - The insights content to be sent.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function sendInsightsToSlack(title, insights) {
  const payload = {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: title,
          emoji: true
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: insights
        }
      }
    ]
  }
  await axios.post(SLACK_WEBHOOK_URL, payload)
}

module.exports = {
  sendInsightsToSlack
}
