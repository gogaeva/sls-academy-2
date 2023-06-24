import axios from "axios"
import NodeCache from "node-cache"


const PRIVAT_API_URL = 'https://api.privatbank.ua/p24api/pubinfo?exchange&coursid=5'
const privatAPI = axios.create({
    baseURL: PRIVAT_API_URL,
    timeout: 1000,
})

const MONO_API_URL = 'https://api.monobank.ua/bank/currency'
const monoAPI = axios.create({
    baseURL: MONO_API_URL,
    timeout: 1000,
})

const resources = {
    'privat': privatAPI,
    'mono': monoAPI
}

const currencyCodes = {
    'UAH': 980,
    'USD': 840,
    'EUR': 978,
}

class exchangeRate {
    constructor(bank, currency, baseCurrency, buy, sale) {
        this.bank = bank
        this.currency = currency
        this.baseCurrency = baseCurrency
        this.buy = parseFloat(buy).toFixed(2)
        this.sale = parseFloat(sale).toFixed(2)
    }

    static fromPrivatData(data) {
        return new exchangeRate('PrivatBank', data.ccy, data.base_ccy, data.buy, data.sale)
    }

    static fromMonoData(data) {
        return new exchangeRate('Monobank', data)
    }
}

const cache = new NodeCache({ stdTTL: 60 * 5 })

async function load(bank) {
    let data = cache.get(bank)
    if (!data) {
        const response = await resources[bank].get()
        data = response.data
        console.log('From api')
        cache.set(bank, data)
    }
    if (!data) throw new Error('Data loading failed')
    return data
}

async function getPrivatData() {
    const data = await load('privat')
    const euroData = data[0]
    const usdData = data[1]
    const euroExchangeRate = new exchangeRate('PrivatBank', euroData.ccy, euroData.base_ccy, euroData.buy, euroData.sale)
    const usdExchangeRate = new exchangeRate('PrivatBank', usdData.ccy, usdData.base_ccy, usdData.buy, usdData.sale)    
    return { 'EUR': euroExchangeRate, 'USD': usdExchangeRate }
}

const selectCurrency = (data, currency) => data.filter((item) => item.currencyCodeA === currencyCodes[currency] && item.currencyCodeB === currencyCodes['UAH']).pop()

async function getMonoData() {
    const data = await load('mono')
    const euroData = selectCurrency(data, 'EUR')
    const usdData = selectCurrency(data, 'USD')

    const euroExchangeRate = new exchangeRate('Monobank', 'EUR', 'UAH', euroData.rateBuy, euroData.rateSell)
    const usdExchangeRate = new exchangeRate('Monobank', 'USD', 'UAH', usdData.rateBuy, usdData.rateSell)
    return { 'EUR': euroExchangeRate, 'USD': usdExchangeRate }
}

export { getPrivatData, getMonoData }