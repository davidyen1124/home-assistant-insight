const axios = require('axios')
const { DateTime } = require('luxon')
const {
  HOME_ASSISTANT_URL,
  HOME_ASSISTANT_TOKEN,
  TIMEZONE
} = require('./config')

/**
 * Fetches the history of a specific entity from Home Assistant for a given number of days.
 *
 * @param {string} entityId - The ID of the entity to fetch history for.
 * @param {number} [days=1] - The number of days of history to fetch.
 * @returns {Promise<Array>} - A promise that resolves to the entity history data.
 */
async function fetchEntityHistory(entityId, days = 1) {
  // Get current time in the specified timezone
  const now = DateTime.now().setZone(TIMEZONE)

  // Set endTime to the end of today (23:59:59.999) in the specified timezone
  const endDate = now.endOf('day')

  // Set startTime to the start of the day 'days' days ago (00:00:00.000) in the specified timezone
  const startDate = endDate.minus({ days: days }).startOf('day')

  // Format the dates in ISO format with the correct timezone offset
  const startTime = startDate.toISO()
  const endTime = endDate.toISO()

  const url = `${HOME_ASSISTANT_URL}/api/history/period/${startTime}`
  const headers = {
    Authorization: `Bearer ${HOME_ASSISTANT_TOKEN}`,
    'Content-Type': 'application/json'
  }
  const params = {
    filter_entity_id: entityId,
    end_time: endTime
  }
  const response = await axios.get(url, { headers, params })
  return response.data
}

/**
 * Filters the HVAC action data to exclude 'idle' states.
 *
 * @param {Array} data - The data to filter.
 * @returns {Array} - The filtered data excluding 'idle' states.
 */
function filterHvacAction(data) {
  return data
    .flatMap((entityData) => entityData)
    .filter((item) => item.attributes.hvac_action !== 'idle')
}

/**
 * Filters the last event of the day for each entity and returns the maximum state for each day.
 *
 * @param {Array} data - The data to filter.
 * @returns {Array} - An array of objects containing the date, the maximum state for that date, and the locale string.
 */
function filterLastEventOfDay(data) {
  const result = data
    .flatMap((entityData) => entityData)
    .reduce((acc, item) => {
      const dateTime = DateTime.fromISO(item.last_changed).setZone(TIMEZONE)
      // Use the full ISO string with the timezone as the key
      const startOfDay = dateTime.startOf('day').toISO()
      const state = parseFloat(item.state)

      // Store the maximum state for each startOfDay
      if (!acc[startOfDay] || state > acc[startOfDay]) {
        acc[startOfDay] = state
      }
      return acc
    }, {})

  return Object.keys(result).map((isoString) => {
    // Convert the ISO string back to a DateTime object to get the formatted date and weekday
    const dateTime = DateTime.fromISO(isoString)
    const weekday = dateTime.weekdayLong
    const formattedDate = dateTime.toISODate()

    return {
      date: `${formattedDate} (${weekday})`,
      hours: result[isoString].toFixed(2)
    }
  })
}

/**
 * Filters the weather data to include only necessary fields.
 *
 * @param {Object} data - The weather data to filter.
 * @returns {Object} - The filtered weather data.
 */
function filterWeatherData(data) {
  return data
    .flatMap((entityData) => entityData)
    .map((item) => ({
      temperature: item.attributes.temperature,
      dew_point: item.attributes.dew_point,
      humidity: item.attributes.humidity,
      cloud_coverage: item.attributes.cloud_coverage,
      pressure: item.attributes.pressure,
      wind_bearing: item.attributes.wind_bearing,
      wind_speed: item.attributes.wind_speed,
      last_updated: item.last_updated
    }))
}

module.exports = {
  fetchEntityHistory,
  filterHvacAction,
  filterLastEventOfDay,
  filterWeatherData
}
