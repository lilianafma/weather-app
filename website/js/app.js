const form = document.querySelector('#weather-form');
const addButton = document.querySelector('#add');
const fragment = document.createDocumentFragment();
const showButton = document.querySelector('#show');
const favoriteSection = document.querySelector('.favorite-section');
const baseUrl = 'http://api.openweathermap.org/data/2.5/weather?';
const key = '38c7328c16e64f57d0b06c7632aebdd8';
let currentPlace = {};

form.addEventListener('submit',function(event) {
	event.preventDefault();
	getPlace(form.querySelector('input').value);
});

addButton.addEventListener('click', function(event) {

	if ( Object.entries(currentPlace).length !== 0 ) {
		const newFavorite = requestData ('POST', '/setFavoritePlaces', currentPlace);
		newFavorite.then (response => {
			if (response.status === '200') {
				const favoritePlaces = requestData ('POST', '/getFavoritePlaces');
				favoritePlaces.then (data => showFavoritePlaces(data));
			} else if (response.status === '409') {
				alert('Place already added like favorite');
			}
		});
	} else {
		alert('Write some place and search before to add to favorites');
	}	
});

showButton.addEventListener('click', function(event) {
	if (favoriteSection.classList.contains('hide')) {
		const favoritePlaces = requestData ('POST', '/getFavoritePlaces');
		favoriteSection.classList.remove('hide');
		favoritePlaces.then (data => showFavoritePlaces(data));
		event.target.innerHTML = 'Hide Favorites';
	} else {
		favoriteSection.classList.add('hide');
		event.target.innerHTML = 'Show Favorites';
	}
});

favoriteSection.addEventListener('click', function(event) {
	event.preventDefault();
	if (event.target.nodeName === 'A') {
		getPlace(event.target.getAttribute('data-name'));
	}
});

const removeAccents = (str) => {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
} 

const getUrl = (city) => {
	return baseUrl +'q='+city+'&appid='+key+'&units=metric';
}

function getPlace (place) {
	let data = getWeatherByAPICall(getUrl(place));
	data.then(data => requestData ('POST', '/saveWeatherData', data)).then(() => updateUI());
}

function showFavoritePlaces(places) {
	
	const list = favoriteSection.querySelector('ul');
	removeAllNodes(list);

	places.forEach( function(place) {
		const liElement = document.createElement('li');
		const aElement = document.createElement('a');
		aElement.innerText = place.name;
		aElement.href = '#';
		aElement.setAttribute('data-name', place.name);
		liElement.appendChild(aElement);
		fragment.appendChild(liElement);
	});

	list.appendChild(fragment);
	
}

function updateUI () {
	getWeatherByAPICall('/getWeatherData').then(data => showData(data));
}

function showData(weather) {

	let currentTime = new Date();
	const result = document.querySelector('.city-section');
	
	currentPlace = weather;

	result.querySelector('.overlay').classList.remove('hide');
	result.querySelector('.date').innerHTML = currentTime.toDateString();
	result.querySelector('.name').innerHTML = weather.name;
	result.querySelector('.temp').innerHTML = Math.round(weather.main.temp)+'<span>°</span>';
	result.querySelector('.humidity').innerHTML = 'Humidity: <span>' + weather.main.humidity + ' %</span>';
	result.querySelector('.pressure').innerHTML = 'Pressure: <span>' + weather.main.pressure + ' mmHg</span>';
	result.querySelector('.wind').innerHTML = 'Wind: <span>' + weather.wind.speed + ' km/h</span>';	
	result.querySelector('.weather').innerHTML = weather.weather[0].description;
	result.querySelector('.icon').src = 'http://openweathermap.org/img/wn/'+weather.weather[0].icon+'@2x.png';
}

function removeAllNodes (parent) {
	while(parent.firstChild) {
		parent.removeChild(parent.firstChild);
	}
}

const requestData = async ( method= '', url = '', data = {}) => {

    const response = await fetch(url, {
		method: method, 
		credentials: 'same-origin', 
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data)
	});

    try {
      const newData = await response.json();
      return newData
    } catch(error) {
    	console.log("error", error);
    }
}

const getWeatherByAPICall = async ( url = '', data = {}) => {
    const response = await fetch(url, {
		method: 'GET', 
		credentials: 'same-origin'
	});

    try {
    	const weatherData = await response.json();
        return weatherData;
    } catch(error) {
    	console.log("error", error);
    }
}