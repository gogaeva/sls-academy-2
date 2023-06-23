import TelegramBot from 'node-telegram-bot-api'
import { Command } from 'commander'
import readline from 'node:readline/promises'
import fs from 'node:fs/promises' 

process.env["NTBA_FIX_350"] = 1

const TOKEN = process.env.TOKEN
const BOT = new TelegramBot(TOKEN)

let CHAT_ID = process.env.CHAT_ID

const program = new Command()

program
    .name('cli2telegram')
    .description('cli util for sending messages and image files to telegram bot')
    .version('1.0.0')
    .hook('preAction', async () => {
        if (!CHAT_ID)
            try {
                CHAT_ID = await loadChatId(BOT)
            } catch (err) {
                console.log(err.message)
                process.exit()
            }
    })
    .hook('postAction', () => process.exit())

program.command('message')
    .description('Send message to telegram bot')
    .argument('<text>', 'message')
    .alias('m')
    .action((text) => sendMessage(BOT, CHAT_ID, text))

program.command('photo')
    .description('Send photo to telegram bot')
    .argument('<path>', 'path to file with image')
    .alias('p')
    .action((path) => sendPhoto(BOT, CHAT_ID, path))


async function loadChatId(bot) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })
    const username = await rl.question('It seems you are using this bot for the first time. ' + 
        'Please ensure you have started the bot and enter here your telegram username in order to find out your chat id:\n')
    
    const updates = await bot.getUpdates()
    const fromCurrentUser = updates.filter((update) => update.message.from.username === username)[0]
    if (fromCurrentUser)
        try {
            const chatId = fromCurrentUser.message.chat.id
            await fs.writeFile('./.env', `\nCHAT_ID=${chatId.toString()}`, {flag: 'a'})
            console.log('Chat id was successfully saved')
            return parseInt(chatId)
        } catch (err) {
            throw new Error('Error while writing to file: ', err.message)
        }
    else {
        throw new Error('Cannot find chat with you. Try to restart bot or send some message to it in the application') 
    }
}


function handleBotError(err) {
    if (err.code === 'EFATAL') {
        console.log('Unexpected error occured')
        process.exit()
    } 
    if (err.code === 'ETELEGRAM') {
        console.log('Error: ', err.response.body.description)
        console.log('You may have done something wrong, check the arguments you are passing.')
        process.exit()
    }
}

async function sendMessage(bot, chatId, text) {
    await bot.sendMessage(chatId, text)
        .catch((err) => handleBotError(err))
    console.log('Message successfully sent!')
}

async function sendPhoto(bot, chatId, photoPath) {
    await bot.sendPhoto(chatId, photoPath)
        .catch((err) => handleBotError(err))
    console.log('Photo successfully sent!')
}

program.parse()
