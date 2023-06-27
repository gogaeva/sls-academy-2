import fs from 'node:fs'

function transform (data) {
    const transformed = {}
    for (const item of data) {
        const userId = item.user._id
        const userName = item.user.name
        const vacation = {
            startDate: item.startDate,
            endDate: item.endDate,
        }

        if (!transformed[userId]) 
            transformed[userId] = {
                userId,
                userName,
                vacations: [],
            }

        transformed[userId].vacations.push(vacation)
    }
    return Object.values(transformed)
}

const json = fs.readFileSync('./sample.json')
const data = JSON.parse(json)
const transformed = transform(data)
console.log(transformed)

fs.writeFileSync('./transformed.json', JSON.stringify(transformed))