import axios from 'axios'
import TelegramBot from 'node-telegram-bot-api'
import formatForecast from './format-forecast.js'

const { API_KEY, BOT_TOKEN, CITY } = process.env
const API_URL = `http://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric`


const bot = new TelegramBot(BOT_TOKEN, { polling: true })

const openweather = axios.create({
    baseURL: API_URL,
    timeout: 1000,
})

const citiesMenu = {
    reply_markup: {
        keyboard: [[CITY]],
    },
}

const intervalChoiceMenu = {
    reply_markup: {
        keyboard: [
            ['3 hours'],
            ['6 hours'],
        ],
        one_time_keyboard: true,
    },
}

bot.setMyCommands([{ command: '/forecast', description: 'Get forecast for coming days' }])

bot.onText(/\/start|\/forecast/, (msg) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'Select the city for which you want to get the forecast', citiesMenu)
})

bot.onText(/Kyiv/, (msg) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'Select the time interval at which the weather data will be displayed', intervalChoiceMenu)
})

bot.onText(/[36] hours/, async (msg, match) => {
    const chatId = msg.chat.id
    const interval = match.input.split('')[0]
    try {
        const response = await openweather.get()
        const data = response.data
        const forecast = formatForecast(data.list, interval)
        bot.sendMessage(chatId, forecast, {parse_mode: 'Markdown'})
    } catch (err) {
        console.log(err.message)
        bot.sendMessage(chatId, 'Something went wrong. Try again later')
    }
})
