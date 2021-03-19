const placeholder = `<li>
                        <h2>Подождите, данные загружаются</h2>
                     </li>`

const fillChosen = (api) => fetch(api)
    .then(response => response.json())
    .then(data => {
        document.querySelector('.wrap .chosen span').textContent = data.temperature
        document.querySelector('.wrap .chosen h2').textContent = data.city
        document.querySelector('.wrap .chosen img').setAttribute('src', data.icon)

        document.querySelector('.wrap ul.info li span.wind').textContent = data.wind
        document.querySelector('.wrap ul.info li span.cloudiness').textContent = data.clouds
        document.querySelector('.wrap ul.info li span.pressure').textContent = data.pressure
        document.querySelector('.wrap ul.info li span.humidity').textContent = data.humidity
        document.querySelector('.wrap ul.info li span.coordinates').textContent = data.coords

        document.querySelector('.wrap').style.display = 'flex'
        document.querySelector('.placeholder').style.display = 'none'
    });


const reloadChosen = () => {
    navigator.geolocation.getCurrentPosition(position => {
        const lon = position.coords.longitude;
        const lat = position.coords.latitude;
        const local = `http://localhost:3000/weather/coordinates?lat=${lat}&long=${lon}`
        fillChosen(local)

    }, _ => {
        fillChosen(`http://localhost:3000/weather/city?q=london`)
    })
}

window.addEventListener('load', reloadChosen);

document.querySelector('header button.desktop').addEventListener('click', reloadChosen)
document.querySelector('header button.mobile').addEventListener('click', reloadChosen)

const deleteCity = button => {
    const city = button.parentNode.childNodes[1].textContent
    fetch('http://localhost:3000/favourites', {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: city})
    }).then(() => {
        const ul = button.parentNode.parentNode.parentNode
        ul.removeChild(button.parentNode.parentNode)
    }).catch(er => console.log(er))
}

const generateCityLi = city => {
    const local = `http://localhost:3000/weather/city?q=${city}`
    return fetch(local)
        .then(response => response.ok ? response.json() : Promise.reject('City not found'))
        .then(data => {
            console.log(data)
            return `<li>
                <div class="city">
                    <h3>${data.city}</h3>
                    <span>${data.temperature}</span>
                    <img alt="weather icon" src="${data.icon}">
                    <button onclick="deleteCity(this)">x</button>
                </div>
                <ul class="info">
                    <li>Ветер <span>${data.wind}</span></li>
                    <li>Облачность <span>${data.clouds}</span></li>
                    <li>Давление <span>${data.pressure}</span></li>
                    <li>Влажность <span>${data.humidity}</span></li>
                    <li>Координаты <span>${data.coords}</span></li>
                </ul>
            </li>`;
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

const addCity = (city, addToStorage = false) => {
    const ul = document.querySelector('.favourite ul')
    ul.insertAdjacentHTML('beforeend', generateCityPlaceholder(city))
    generateCityLi(city).then(li => {
        if (addToStorage) {
            fetch('http://localhost:3000/favourites', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: city})
            })
                .then(() => {
                    ul.lastChild.style.display = 'none'
                    ul.insertAdjacentHTML('beforeend', li)
                })
        } else {
            ul.lastChild.style.display = 'none'
            ul.insertAdjacentHTML('beforeend', li)
        }
    }).catch(err => {
        ul.lastChild.style.display = 'none'
        alert(err)
    })
}

const addAllCities = () => {
    fetch('http://localhost:3000/favourites')
        .then(response => response.json())
        .then(cities => cities.forEach(city => addCity(city)))
}

window.addEventListener('load', addAllCities);

document.forms[0].addEventListener('submit', onSubmit)
