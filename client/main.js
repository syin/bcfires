const express = require('express');
const app = express();
const port = 3000;

app.use((request, response, next) => {
    console.log(request.headers);
    next();
});

app.use((err, request, response, next) => {
    console.log(err);
    response.status(500).send("error");
});

app.get('/', (request, response) => {
    response.sendFile(__dirname + "/map.html");
});

app.listen(port, (err) => {
    if (err) {
        return console.log("error", err);
    }
    console.log("server is listening on ", port);
});
