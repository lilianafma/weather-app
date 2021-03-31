const express = require('express')
const fetch = require("node-fetch")
const bodyParser = require('body-parser')
let projectData = {};
let favoritePlaces = []; 

const app = express();
const port = 3030;
const server = app.listen(port, ()=>{console.log(`running on localhost: ${port}`)})

app.use(express.static('website'))

app.use(
	bodyParser.urlencoded({
		extended: true,
	})
)

app.use(bodyParser.json());

app.post('/setFavoritePlaces', (req,res) => {
	const found = favoritePlaces.findIndex(element => element.name === req.body.name);
	if (found < 0) {
		favoritePlaces.push(req.body);
		res.send({'message': 'Place Added', 'status': '200'});
	} else {
		res.send({'message': 'Place Already Add', 'status': '409'});
	}

});

app.post('/saveWeatherData', (req,res) => {
	projectData = req.body;
	res.send ({'message': 'Save weather data', 'status': '200'});
});

app.get('/getWeatherData', (req,res) => {
	res.send (projectData);
});

app.post('/getFavoritePlaces', (req,res) => {
	res.send(favoritePlaces);
});

