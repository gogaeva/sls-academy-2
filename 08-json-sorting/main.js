import fs from 'node:fs/promises'
import axios from 'axios'

function findField(obj, target, type) {
  const stack = [obj]
  while (stack.length > 0) {
    const currentObj = stack.pop()
    for (const key in currentObj) {
      const value = currentObj[key]
      if (key === target && typeof value === type) {
        return value
      } else if (Array.isArray(value)) {
        for (const elem of value) {
          if (typeof elem === 'object')
            stack.push(elem)
        }
      } else if (typeof value === 'object') {
        stack.push(value)
      }
    }
  }
}

async function getData(url, options = {maxRetries: 3}) {
  const maxRetries = options.maxRetries
  for (const i = 1; i <= maxRetries; i++) {
    try {
      const response = await axios.get(url)
      return response.data
    } catch (err) {
      if (i === maxRetries)
        throw new Error(err.message)
    }
  }
}

;(async () => {
  const urls = (await fs.readFile('./urls.txt')).toString().split('\n')
  const results = []
  for (const url of urls) {
    try {
      const data = await getData(url)
      const isDone = findField(data, 'isDone', 'boolean')
      results.push(isDone)
      console.log(`[Success] ${url}: isDone - ${isDone}`)
    } catch (err) {
      console.log(`[Fail] ${url}: ${err.message}`)
    }
  }
  const trueValuesCount = results.filter((val) => val).length
  const falseValuesCount = results.filter((val) => !val).length
  console.log(`Found True values: ${trueValuesCount}`)
  console.log(`Found False values: ${falseValuesCount}`)
})()