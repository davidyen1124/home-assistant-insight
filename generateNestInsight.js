const { fetchEntityHistory, filterHvacAction } = require('./homeAssistant')
const { generateNestInsights } = require('./openai')
const { sendInsightsToSlack } = require('./slack')

async function main() {
  try {
    const upstairsClimate = await fetchEntityHistory('climate.upstairs_2', 7)
    const downstairsClimate = await fetchEntityHistory('climate.downstairs', 7)

    const filteredUpstairsHvacEvents = filterHvacAction(upstairsClimate)
    const filteredDownstairsHvacEvents = filterHvacAction(downstairsClimate)

    if (filteredUpstairsHvacEvents.length) {
      const upstairsInsights = await generateNestInsights(
        filteredUpstairsHvacEvents
      )
      await sendInsightsToSlack('Nest report for upstairs', upstairsInsights)
    }
    if (filteredDownstairsHvacEvents.length) {
      const downstairsInsights = await generateNestInsights(
        filteredDownstairsHvacEvents
      )
      await sendInsightsToSlack('Nest report for downstairs', downstairsInsights)
    }
    console.log('Insights sent to Slack successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
