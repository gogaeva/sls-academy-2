import fs from 'node:fs'
import readline from 'node:readline/promises'

async function uniqueValues() {
    const uniqueUsernames = new Set()
    const files = fs.readdirSync('./data/')
    await Promise.all(files.map((file) => {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(`./data/${file}`)
            const rl = readline.createInterface({ input: stream })
            rl.on('line', (username) => uniqueUsernames.add(username))
            stream.on('close', () => resolve())
        })
    }))
    return uniqueUsernames.size
}

async function existInAtLeast(num) {
    const occurances = new Map()
    const files = fs.readdirSync('./data/')
    await Promise.all(files.map((file) => {
        return new Promise((resolve) => {
            const stream = fs.createReadStream(`./data/${file}`)
            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity,
            })
            rl.on('line', (username) => {
                if (!occurances.has(username)) occurances.set(username, new Set())
                occurances.get(username).add(file)
                
            })
            rl.on('close', () => {
                resolve()
            })
        })
    }))
    return Array.from(occurances.values()).filter((filesSet) => filesSet.size >= num).length
}


async function existInAllFiles() {
    const intersection = (setA, setB) => {
        const intersection = new Set()
        for (const elem of setB) {
          if (setA.has(elem)) {
            intersection.add(elem)
          }
        }
        return intersection
    }
    const files = fs.readdirSync('./data/')
    return Promise.all(files.map((file) => {
        return new Promise((resolve) => {
            const uniqueInFile = new Set()
            const stream = fs.createReadStream(`./data/${file}`)
            const rl = readline.createInterface({ input: stream })
            rl.on('line', (username) => uniqueInFile.add(username))
            rl.on('close', () => resolve(uniqueInFile))
        })
    })).then((results) => results.reduce(intersection).size)
}


;(async () => {
    console.time('Elapsed time for uniqueValues')
    const valuesNum = await uniqueValues()
    console.timeEnd('Elapsed time for uniqueValues')

    console.time('Elapsed time for existInAllFIles')
    const existInAllFilesCount = await existInAllFiles()
    console.timeEnd('Elapsed time for existInAllFIles')


    console.time('Elapsed time for existInAtLeast')
    const existIn10FilesCount = await existInAtLeast(10)
    console.timeEnd('Elapsed time for existInAtLeast')

    console.log(`Unique values: ${valuesNum}\nValues existed in all files: ${existInAllFilesCount}\nValues existed in at least 10 files: ${existIn10FilesCount}`)
})()