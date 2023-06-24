import TelegramBot from "node-telegram-bot-api"
import { getPrivatData, getMonoData } from "./load-data.js"

const exchangeMenu = {
    reply_markup: {
        keyboard: [
            ['USD', 'EUR'],
        ],
        one_time_keyboard: true,
    }
}

const formatData = (exchangeRate) => `*${exchangeRate.bank}*:\nBuy: ${exchangeRate.buy}\tSale: ${exchangeRate.sale}`

export default (token) => {
    const bot = new TelegramBot(token, { polling: true })

    bot.setMyCommands([{ command: '/exchange_rate', description: 'Get exchange rate' }])

    bot.onText(/\/start|\/exchange_rate/, (msg) => {
        const chatId = msg.chat.id 
        bot.sendMessage(chatId, 'Chose the currency', exchangeMenu)
    })

    bot.onText(/USD|EUR/, async (msg) => {
        const ccy = msg.text
        const chatId = msg.chat.id
        const privatData = await getPrivatData()
        const monoData = await getMonoData()
        const reply = [privatData[ccy], monoData[ccy]].map(formatData).join('\n')
        bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' })
    })

    return bot
}

