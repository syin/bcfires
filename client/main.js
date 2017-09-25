import * as utils from './utils'
import jsonfile from './output_simplified.json'

const express = require('express');
const app = express();
const port = 3000;

app.use((request, response, next) => {
    next();
});

app.use((err, request, response, next) => {
    console.log(err);
    response.status(500).send("error");
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/map.html");
});

app.get('/map.js', (request, response) => {
    response.sendFile(__dirname + "/map.js");
});

app.get('/output_simplified.json', (request, response) => {
    response.sendFile(__dirname + "/output_simplified.json");
});

app.get('/2014-fires', (req, res) => {
    const fires = jsonfile.features
    const firesIn2014 = utils.filterFiresByYear(2014)(fires)
    res.send(firesIn2014)
})

app.listen(port, (err) => {
    if (err) {
        return console.log("error", err);
    }
    console.log("server is listening on ", port);
});
