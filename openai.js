const { OpenAI } = require('openai')
const { OPENAI_API_KEY, MODEL } = require('./config')
const JUDGE_PERSONALITIES = require('./judgePersonalities')

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
})

/**
 * Evaluates an insight using all judge personalities.
 *
 * @param {string} insight - The insight to be evaluated.
 * @returns {Promise<Array>} - A promise that resolves to an array of evaluation results.
 */
async function evaluateInsight(insight) {
  const evaluations = await Promise.all(
    JUDGE_PERSONALITIES.map(async (judgePersonality) => {
      const prompt = `You are a specialized AI assistant with expertise in a particular field. Your role and focus are defined as follows:
      <name>${judgePersonality.name}</name>
      
      <description>${judgePersonality.description}</description>

      <focus>${judgePersonality.focus}</focus>

      You have been asked to evaluate the following insight:

      <insight>${insight}</insight>

      Please evaluate this insight based on your area of expertise and the given focus. Consider its relevance, practicality, and potential impact in your field.
      Provide your evaluation and a score from 0 to 10, where 0 is the lowest quality and 10 is the highest quality. Your evaluation should be 1-2 sentences long.

      Your response should be in JSON format with two fields:
      1. "evaluation": Your detailed evaluation of the insight (1-2 sentences).
      2. "score": Your numerical score (0-10) for the insight.
      
      Remember to consider the specific focus provided when evaluating the insight. Ensure your score accurately reflects your written evaluation.`

      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI assistant that evaluates insights and provides scores.'
          },
          { role: 'user', content: prompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'provide_evaluation_and_score',
              description:
                'Provide an evaluation and score for the given insight',
              parameters: {
                type: 'object',
                properties: {
                  evaluation: {
                    type: 'string',
                    description:
                      'A detailed evaluation of the insight (1-2 sentences)'
                  },
                  score: {
                    type: 'number',
                    description: 'A numerical score between 0 and 10'
                  }
                },
                required: ['evaluation', 'score']
              }
            }
          }
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'provide_evaluation_and_score' }
        }
      })

      const result = JSON.parse(
        response.choices[0].message.tool_calls[0].function.arguments
      )
      return {
        judge: judgePersonality.name,
        evaluation: result.evaluation,
        score: result.score
      }
    })
  )

  return evaluations
}

/**
 * Generates actionable insights for HVAC usage based on filtered data.
 *
 * @param {Array} filteredData - The filtered HVAC event data to analyze.
 * @returns {Promise<string>} - A promise that resolves to a string containing the generated insights.
 */
async function generateNestInsights(filteredData, weatherData) {
  const prompt = `You are tasked with analyzing active HVAC events for a Nest thermostat and generating actionable items to reduce HVAC usage and save on bills. Follow these instructions carefully:

  1. Review the following HVAC event data and current weather data (all timestamps are in California time):
  <hvac_data>
  ${JSON.stringify(filteredData)}
  </hvac_data>

  <weather_data>
  ${JSON.stringify(weatherData)}
  </weather_data>

  2. Analyze the data to identify patterns, inefficiencies, or opportunities for energy savings, taking into account the current weather conditions.

  3. Generate 3 to 5 summaries based on your analysis. Each summary should:
    - Begin with an appropriate emoji
    - Be under 100 words
    - Provide an actionable insight to reduce HVAC usage

  4. Consider the following aspects when creating your summaries:
    - Temperature settings and their timing
    - Duration of HVAC events
    - Frequency of temperature changes
    - Potential impact on energy consumption

  5. Ensure your actionable items are specific, practical, and likely to result in energy savings. Examples of good actionable items include:
    - Adjusting temperature settings for specific times of day
    - Recommending programming changes to the thermostat
    - Suggesting complementary actions to reduce HVAC load (e.g., using curtains or fans)

  6. Present your summaries in the following format:
  [Emoji] [Your summary here, under 100 words]
  [Emoji] [Your summary here, under 100 words]
  [Emoji] [Your summary here, under 100 words]
  [Add more if you generate 4 or 5 summaries]

  Remember to focus on creating actionable, energy-saving recommendations based on the provided HVAC data. Do not include any personal opinions or information not derived from the given data.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          'Analyze active HVAC events for the Nest and provide actionable items.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  })
  return response.choices[0].message.content.trim()
}

/**
 * Generates insights based on work and home data over the past 3 days.
 *
 * @param {Array} workData - The data related to time spent at work.
 * @param {Array} homeData - The data related to time spent at home.
 * @returns {Promise<string>} - A promise that resolves to a string containing the generated insights.
 */
async function generateWorkHomeInsights(workData, homeData) {
  const prompt = `You are an AI assistant tasked with analyzing data about time spent at work and at home over the past 3 days. Your goal is to generate three insights based on this data. All timestamps are in California time.

  Here's the data you'll be working with:

  Work Data:
  <work_data>
   ${JSON.stringify(workData)}
  </work_data>

  Home Data:
  <home_data>
   ${JSON.stringify(homeData)}
  </home_data>

  Your task is to generate three types of insights:
  1. Highlight the good things that should continue
  2. Present some fun facts related to the data
  3. Suggest things that could be improved

  When analyzing the data:
  - Look for patterns, trends, and relationships between different data points
  - Consider the balance between work and home time
  - Identify any notable achievements or areas for improvement
  - Think about how the data relates to overall well-being and productivity

  Each insight should be under 100 words and start with an appropriate emoji. Here are some examples of the format:

  👍 Great job on maintaining a consistent work schedule!
  🎉 Fun fact: You spent an average of 8 hours at work each day this week.
  🔧 Consider taking more breaks during long work days to improve productivity.

  Generate your insights in the following format:

  [Your insight about good things to continue, starting with 👍]

  [Your fun fact insight, starting with 🎉]

  [Your insight about things to improve, starting with 🔧]

  Remember to keep each insight under 100 words and ensure they are directly related to the provided data.`

  const response = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content: 'Analyze work, home data and provide insights.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  })
  return response.choices[0].message.content.trim()
}

module.exports = {
  generateNestInsights,
  generateWorkHomeInsights,
  evaluateInsight
}
