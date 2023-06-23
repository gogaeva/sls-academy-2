const centigradeDegree = '\u00B0C'

const weatherEmojis = {
    'Clear': '\u2600',
    'Clouds': '\u2601',
    'Rain': '\u2614',
    'Drizzle': '\u2614',
    'Thunderstorm': '\u26A1',
    'Snow': '\u2744',
    'Mist': '\u{1F23B}'
}

function selectData(forecastItem) {
    const date = forecastItem.dt
    const temp = parseInt(forecastItem.main.temp)
    const mainWeather = forecastItem.weather[0].main
    const weather = forecastItem.weather[0].description
    const windSpeed = forecastItem.wind.speed
    const windGust = forecastItem.wind.gust

    return { date, temp, mainWeather, weather, windSpeed, windGust }
}

const castDate = (forecastItem) => {
    forecastItem.date = new Date(forecastItem.date * 1000)
    return forecastItem
}

function filterByIntervals(forecastList, interval) {
    return forecastList.filter((forecastItem) => {
        const hours = forecastItem.date.getHours()
        return !(hours % interval)
    })
}

function groupByDays(forecastList) {
    const grouped = new Map()
    for (const forecastItem of forecastList) {
        const day = forecastItem.date.getDay()

        if (grouped.get(day)) grouped.get(day).push(forecastItem)
        else grouped.set(day, [forecastItem])
    }
    return grouped
}

function format(groupedByDays) {
    const dayOptions = {
        month: 'long',
        weekday: 'long',
        day: 'numeric',
    }

    const timeOptions = {
        hour: 'numeric',
        minute: 'numeric',
    }

    let forecast = ''

    for (const dayData of groupedByDays.values()) {
        const first = dayData[0]
        const day = first.date.toLocaleString('en', dayOptions)
        forecast += `*${day}*\n`
        for (const dataItem of dayData) {
            const time = dataItem.date.toLocaleString('en', timeOptions)
            const temp = dataItem.temp
            const emoji = weatherEmojis[dataItem.mainWeather] || ''
            const weather = dataItem.weather
            const windSpeed = dataItem.windSpeed
            const windGust = dataItem.windGust
            forecast += `\t_${time}_\n\t${temp}${centigradeDegree}, ${emoji} ${weather}\n\twind speed ${windSpeed}m/s with gusts up to ${windGust}m/s\n`
        }
        forecast += '\n'
    }

    return forecast
}

function formatForecast(forecastList, interval) {
    const selected = forecastList.map(selectData)
    const casted = selected.map(castDate)
    const filtered = filterByIntervals(casted, interval)
    const grouped = groupByDays(filtered)
    
    return format(grouped)
}

export default formatForecast