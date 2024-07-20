require('dotenv').config()

module.exports = {
  HOME_ASSISTANT_URL: process.env.HOME_ASSISTANT_URL,
  HOME_ASSISTANT_TOKEN: process.env.HOME_ASSISTANT_TOKEN,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MODEL: 'gpt-4o-mini',
  TIMEZONE: 'America/Los_Angeles'
}
