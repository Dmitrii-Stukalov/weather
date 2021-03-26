const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const apiKey = '89b8dd844aa773508f5ca09b43fb3642';
const fetch = require('node-fetch')

const PORT = process.env.PORT || 3000

const app = express()
app.use(cors())
app.use(require('body-parser').json())

const schema = new mongoose.Schema({name: {type: String, required: true}})
const City = mongoose.model('City', schema)

async function start() {
    try {
        await mongoose.connect(
            'mongodb+srv://dima:weblab3@cluster0.8ohck.mongodb.net/weather',
            {
                useNewUrlParser: true,
                useFindAndModify: false,
                useUnifiedTopology: true
            }
        )
        app.listen(PORT, () => {
            console.log('Server has been started...')
        })
    } catch (e) {
        console.log(e)
    }
}

const degreeToDirection = deg => {
    const val = (deg / 22.5) + .5
    const directions = ['North', 'North-northeast', 'Northeast', 'East-northeast', 'East', 'East-southeast',
        'Southeast', 'South-southeast', 'South', 'South-southwest', 'Southwest', 'West-southwest', 'West',
        'West-northwest', 'Northwest', 'North-northwest']
    return directions[Math.ceil(val) % 16]
};

const speedToType = speed => {
    switch (true) {
        case speed < 0.5:
            return 'Calm'
        case speed < 1.5:
            return 'Light air'
        case speed < 3.3:
            return 'Light breeze'
        case speed < 5.5:
            return 'Gentle breeze'
        case speed < 7.9:
            return 'Moderate breeze'
        case speed < 10.7:
            return 'Fresh breeze'
        case speed < 13.8:
            return 'Strong breeze'
        case speed < 17.1:
            return 'Near gale'
        case speed < 20.7:
            return 'Gale'
        case speed < 24.4:
            return 'Strong gale'
        case speed < 28.4:
            return 'Storm'
        case speed < 32.6:
            return 'Violent storm'
        default:
            return 'Hurricane'
    }
}

const cloudinessToType = cloudiness => {
    switch (true) {
        case cloudiness < 25:
            return 'Sunny'
        case cloudiness < 50:
            return 'Mostly sunny'
        case cloudiness < 69:
            return 'Partly sunny'
        case cloudiness < 87:
            return 'Mostly cloudy'
        default:
            return 'Cloudy'
    }
}

const weatherToIcon = type => {
    switch (true) {
        case type === 'Clear':
            return 'sun-64.ico'
        case type === 'Few clouds':
            return 'partly-cloudy-day-64.ico'
        case type === 'Scattered clouds' || type === 'Broken clouds' || type === 'Clouds':
            return 'clouds-64.ico'
        case type === 'Shower rain' || type === 'Rain':
            return 'rain-64.ico'
        case type === 'Thunderstorm':
            return 'storm-64.ico'
        case type === 'Snow':
            return 'snow-64.ico'
        case type === 'Fog' || type === 'Mist':
            return 'dust-64.ico'
    }
}

const processData = data => {
    const {speed, deg} = data.wind;
    const clouds = data.clouds.all;
    const {pressure, humidity} = data.main
    const temperature = Math.round(data.main.temp) - 273
    const {lon, lat} = data.coord

    const tempInfo = temperature + '˚C'
    const icon = weatherToIcon(data.weather[0].main)

    const windInfo = speedToType(speed) + ', ' + speed + 'm/s, ' + degreeToDirection(deg)
    const cloudsInfo = cloudinessToType(clouds)
    const pressureInfo = pressure + 'hpa'
    const humidityInfo = humidity + '%'
    const coordsInfo = '[' + Math.round(lat * 100) / 100 + ', ' + Math.round(lon * 100) / 100 + ']'

    return {
        city: data.name,
        temperature: tempInfo,
        icon: icon,
        wind: windInfo,
        clouds: cloudsInfo,
        pressure: pressureInfo,
        humidity: humidityInfo,
        coords: coordsInfo
    }
}


app.get('/weather/city', (req, res) => {
    const city = req.query.q
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    fetch(api)
        .then(response => response.ok ? response.json() : Promise.reject('City not found'))
        .then(data => res.status(200).send(processData(data)))
        .catch(er => res.status(404).send(er))
})

app.get('/weather/coordinates', (req, res) => {
    const lon = req.query.long
    const lat = req.query.lat
    const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
    fetch(api)
        .then(response => response.ok ? response.json() : Promise.reject('Api failed'))
        .then(data => res.status(200).send(processData(data)))
        .catch(er => res.status(404).send(er))
})

app.get('/favourites', (req, res) => {
    City.find({}, (err, cities) => {
        const names = Array()
        cities.forEach(city => names.push(city.name))
        res.status(200).send(names)
    })
})

app.post('/favourites', (req, res) => {
    City({name: req.body.name}).save()
        .then(res.status(200).send())
        .catch(er => res.status(500).send(er))
})

app.delete('/favourites', (req, res) => {
    City.deleteOne({name: req.body.name})
        .then(res.status(200).send())
        .catch(er => res.status(500).send(er))
})

start()
