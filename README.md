# Home Assistant Insights

## Description
Home Assistant Insights is a Node.js application that analyzes data from Home Assistant and provides actionable insights to optimize various aspects of home management. It integrates with Home Assistant to fetch historical data and uses OpenAI's API to generate insights based on the collected data.

## Features
- Fetches event history from Home Assistant
- Generates actionable insights for various home management tasks
- Analyzes HVAC data from Nest thermostats
- Provides insights on time management based on work and home data
- Sends insights to Slack for easy sharing and collaboration

## Prerequisites
- Node.js (v22 or later recommended)
- Home Assistant instance with API access
- OpenAI API key
- Slack webhook URL (for sending insights to Slack)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/davidyen1124/home-assistant-insights.git
   cd home-assistant-insights
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following environment variables:
   ```
   HOME_ASSISTANT_URL=your_home_assistant_url
   HOME_ASSISTANT_TOKEN=your_long_lived_access_token
   OPENAI_API_KEY=your_openai_api_key
   SLACK_WEBHOOK_URL=your_slack_webhook_url
   ```

## Usage
To generate insights for home management, run the following commands:

1. For generating Nest insights:
   ```bash
   node generateNestInsight.js
   ```

2. For generating time insights:
   ```bash
   node generateTimeInsight.js
   ```

## Configuration
You can customize the behavior of the application by modifying the `config.js` file. This includes setting up entity IDs, adjusting time ranges, and configuring judge personalities for insight evaluation. When adjusting time ranges, remember that the `days` argument passed to `fetchEntityHistory` is inclusive—for example, requesting `3` days returns data for today and the previous two days.

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the ISC License.
