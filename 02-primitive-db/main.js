import inquirer from 'inquirer'
import fs from 'node:fs/promises'

const addingQuestions = {
    name: {
        type: 'input',
        name: 'name',
        message: 'Enter the user\'s name. To cancel press ENTER:',
    },
    gender: {
        type: 'list',
        name: 'gender',
        message: 'Choose your gender:',
        choices: [
            'male',
            'female',
        ],
    },
    age: {
        type: 'number',
        name: 'age',
        message: 'Enter your age:',
        filter: (input) => {
            return isNaN(input) || input < 0 ? '' : parseInt(input)
        },
        validate: (input) => {
            const errMessage = 'Invalid age'
            return input === '' ? errMessage : true 
        },
    },
}

const searchQuestions = {
    confirmation: {
        type: 'confirm',
        name: 'isConfirmed',
        message: 'Would you like to search values in database?'
    },
    name: {
        type: 'input',
        name: 'name',
        message: 'Enter user\'s name you want to find in database:',
    },
}

class UI {
    constructor(questions) {
        this.questions = questions
    }

    async askFor(attributes) {
        const questions = []
        for (const attr of attributes) {
            const question = this.questions[attr]
            questions.push(question)
        }
        const answers = await inquirer.prompt(questions) 
        return answers
    }
}

class DB {
    constructor(fileHandle) {
        this.usersFile = fileHandle
    }

    static async init(path) {
        try {
            const fileHandle = await fs.open(path, 'a+')
            return new DB(fileHandle)
        } catch (err) {
            console.error('Unexpected error has occured:', err.message)
            process.exit(1)
        }
    }

    async addUser(userInfo) {
        await this.usersFile.write(JSON.stringify(userInfo) + '\n')
    }

    async findUser(name) {
        const result = []
        const lines = this.usersFile.readLines({
            start: 0,
            autoClose: false,
        })
        for await (const line of lines) {
            const user = JSON.parse(line)
            if (user.name.toUpperCase() === name.toUpperCase()) result.push(user)
        }
        return result
    }

    async close() {
        await this.usersFile.close()
    }
}

async function mainLoop(ui, db) {
    const { name } = await ui.adding.askFor(['name'])
    if (name) {
        const { gender, age } = await ui.adding.askFor(['gender', 'age'])
        await db.addUser({ name, gender, age })
        await mainLoop(ui, db)
    } else {
        const { isConfirmed } = await ui.search.askFor(['confirmation'])
        if (!isConfirmed) return
        const { name } = await ui.search.askFor(['name'])
        const users = await db.findUser(name)
        if (users.length) {
            console.log(`Found ${users.length} match(es):`)
            console.log(users)
        } else {
            console.log('No matches for this name')
        }
        await mainLoop(ui, db)
    }
}

;(async () => {
    const ui = {
        adding: new UI(addingQuestions),
        search: new UI(searchQuestions),
    }

    const db = await DB.init('./users.txt')

    await mainLoop(ui, db)

    await db.close()
    console.log('Good bye!!')
})()