const apiKey = '89b8dd844aa773508f5ca09b43fb3642';
const placeholder = `<li>
                        <h2>Подождите, данные загружаются</h2>
                     </li>`
let currentID = localStorage.length

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
        case type === 'mist':
            return 'dust-64.ico'
    }
}

const fillChosen = (api) => fetch(api)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        const {speed, deg} = data.wind;
        const clouds = data.clouds.all;
        const {pressure, humidity} = data.main
        const temperature = Math.round(data.main.temp) - 273
        const {lon, lat} = data.coord

        document.querySelector('.wrap .chosen span').textContent = temperature + '˚C'
        document.querySelector('.wrap .chosen h2').textContent = data.name
        document.querySelector('.wrap .chosen img').setAttribute('src', weatherToIcon(data.weather[0].main))


        document.querySelector('.wrap ul.info li span.wind').textContent = speedToType(speed) + ', '
            + speed + 'm/s, ' + degreeToDirection(deg)
        document.querySelector('.wrap ul.info li span.cloudiness').textContent = cloudinessToType(clouds)
        document.querySelector('.wrap ul.info li span.pressure').textContent = pressure + 'hpa'
        document.querySelector('.wrap ul.info li span.humidity').textContent = humidity + '%'
        document.querySelector('.wrap ul.info li span.coordinates').textContent = '[' +
            Math.round(lat * 100) / 100 + ', ' + Math.round(lon * 100) / 100 + ']'

        document.querySelector('.wrap').style.display = 'flex'
        document.querySelector('.placeholder').style.display = 'none'


    });


const reloadChosen = () => {
    if (navigator.geolocation) {
        navigator.permissions.query({name: 'geolocation'}).then(permission => {
                if (permission.state === 'granted') {
                    navigator.geolocation.getCurrentPosition(position => {
                        const lon = position.coords.longitude;
                        const lat = position.coords.latitude;
                        const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

                        fillChosen(api)

                    })
                } else if (permission.state === 'prompt') {
                    navigator.geolocation.getCurrentPosition(position => {
                        const lon = position.coords.longitude;
                        const lat = position.coords.latitude;
                        const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

                        fillChosen(api)

                    })
                    reloadChosen()
                } else {
                    fillChosen(`https://api.openweathermap.org/data/2.5/weather?q=london&appid=${apiKey}`)
                }
            }
        )
    } else alert('Geolocation is not supported')
}

window.addEventListener('load', reloadChosen);

document.querySelector('header button.desktop').addEventListener('click', reloadChosen)
document.querySelector('header button.mobile').addEventListener('click', reloadChosen)

const deleteCity = button => {
    const city = button.parentNode.childNodes[1].textContent
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (localStorage.getItem(key) === city) {
            localStorage.removeItem(key)
            currentID--;
        }
    }
    const ul = button.parentNode.parentNode.parentNode
    ul.removeChild(button.parentNode.parentNode)
}

const generateCityLi = city => {
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
    return fetch(api)
        .then(response => response.ok ? response.json() : Promise.reject('City not found')
        )
        .then(data => {
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

            return `<li>
                <div class="city">
                    <h3>${city}</h3>
                    <span>${tempInfo}</span>
                    <img alt="weather icon" src="${icon}">
                    <button onclick="deleteCity(this)">x</button>
                </div>
                <ul class="info">
                    <li>Ветер <span>${windInfo}</span></li>
                    <li>Облачность <span>${cloudsInfo}</span></li>
                    <li>Давление <span>${pressureInfo}</span></li>
                    <li>Влажность <span>${humidityInfo}</span></li>
                    <li>Координаты <span>${coordsInfo}</span></li>
                </ul>
            </li>`
        })
}

const generateCityPlaceholder = city => {
    return `<li>
                <div class="city">
                    <h3>${city}</h3>
                    <button onclick="deleteCity(this)">x</button>
                </div>
                <ul>
                    ${placeholder}
                </ul>
            </li>`
}

const onSubmit = event => {
    event.preventDefault()
    const city = event.target[0].value
    if (city.trim() === '') {
        alert("Please fill city name");
        return
    }
    event.target[0].value = ''
    addCity(city, true)
}

const addCity = async (city, addToStorage = false) => {
    const ul = document.querySelector('.favourite ul')
    ul.insertAdjacentHTML('beforeend', generateCityPlaceholder(city))
    await generateCityLi(city).then(li => {
        ul.lastChild.style.display = 'none'
        ul.insertAdjacentHTML('beforeend', li)
        if (addToStorage) {
            localStorage.setItem(currentID++, city)
        }
        console.log(localStorage)
    }).catch(err => {
        ul.lastChild.style.display = 'none'
        alert(err)
    })
}

const addAllCities = async () => {
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        await addCity(localStorage.getItem(key));
    }
}

window.addEventListener('load', addAllCities);

document.forms[0].addEventListener('submit', onSubmit)


