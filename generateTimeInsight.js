const { fetchEntityHistory, filterLastEventOfDay } = require('./homeAssistant')
const { generateWorkHomeInsights, evaluateInsight } = require('./openai')
const { sendInsightsToSlack } = require('./slack')

async function main() {
  try {
    const timeAtWorkData = await fetchEntityHistory('sensor.time_at_work', 3)
    const filteredTimeAtWorkData = filterLastEventOfDay(timeAtWorkData)

    const timeAtHomeData = await fetchEntityHistory('sensor.time_at_home', 3)
    const filteredTimeAtHomeData = filterLastEventOfDay(timeAtHomeData)

    // Generate 4 versions of insights
    const insightVersions = await Promise.all(
      Array.from({ length: 4 }).map((_) => {
        return generateWorkHomeInsights(
          filteredTimeAtWorkData,
          filteredTimeAtHomeData
        )
      })
    )

    // Evaluate insights using different judge personalities
    const evaluations = await Promise.all(
      insightVersions.map(async (insight) => {
        const scores = await evaluateInsight(insight)

        const { sum, count } = scores.reduce(
          (accumulator, score) => {
            const numericScore = Number(score.score)

            if (Number.isFinite(numericScore)) {
              accumulator.sum += numericScore
              accumulator.count += 1
            }

            return accumulator
          },
          { sum: 0, count: 0 }
        )

        const averageScore = count > 0 ? sum / count : 0

        return {
          insight,
          averageScore,
          scores
        }
      })
    )

    // Log detailed information for each evaluation
    evaluations.forEach((evaluation, index) => {
      console.log(`\nInsight Version ${index + 1}:`)
      console.log(evaluation.insight)
      console.log('\nScores:')
      evaluation.scores.forEach((score) => {
        console.log(`${score.judge}: ${score.score} - ${score.evaluation}`)
      })
      console.log(`Average Score: ${evaluation.averageScore.toFixed(2)}`)
    })

    // Find the best version based on average score
    const bestVersion = evaluations.reduce((best, current) =>
      current.averageScore > best.averageScore ? current : best
    )

    // Send the best version to Slack
    await sendInsightsToSlack('Time at work vs home', bestVersion.insight)
    console.log('\nBest insights sent to Slack successfully!')
    console.log(
      'Best version average score:',
      bestVersion.averageScore.toFixed(2)
    )
  } catch (error) {
    console.error('Error:', error)
  }
}

main()
