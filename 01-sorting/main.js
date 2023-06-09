const readline = require('node:readline/promises').createInterface({
    input: process.stdin,
    output: process.stdout,
})

const greating = 'Hello! Enter 10 words or numbers divided by spaces: '

const modeChoice = 
    'How would you like to sort your values? \n' +
    '1. Words alphabetically\n' +
    '2. Numbers from smallest to largest\n' +
    '3. Numbers from largest to smallest\n' +
    '4. Words by quantity of letters\n' +
    '5. Only unique words\n' +
    '6. Unique values (both words and numbers)\n\n' +
    'Select [1-6] and press ENTER or type \'exit\' to exit: '

const goodbye = 'Good bye! Come back again!'

const preprocess = (arr) => arr.map((item) => {
    parsed = parseFloat(item)
    return isNaN(parsed) ? item : parsed  
})

const filterWords = (arr) => arr.filter(item => typeof item === 'string')

const filterNums = (arr) => arr.filter((item) => typeof item === 'number')

const strategies = {
    '1': (items) => filterWords(items).sort((a, b) => {
        const A = a.toUpperCase() 
        const B = b.toUpperCase()
        if (A < B) return -1
        if (A > B) return 1
        return 0
    }),
    '2': (items) => filterNums(items).sort((a, b) => a - b),
    '3': (items) => filterNums(items).sort((a, b) => b - a),
    '4': (items) => filterWords(items).sort((a, b) => a.length - b.length),
    '5': (items) => Array.from(new Set(filterWords(items))),
    '6': (items) => Array.from(new Set(items)),
}

const main = async () => {
    const input = await readline.question(greating)
    const mode = await readline.question(modeChoice)

    if (mode === 'exit') {
        readline.close()
        console.log(goodbye)
        return
    }

    let values = input.split(' ')
    values = preprocess(values)
    
    const result = strategies[mode](values)
    console.log(result)

    main()
}

main()