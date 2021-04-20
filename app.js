const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('./config/config');
require('./trading');

// creando el server
const app = express();

// parseo de data
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`Abechenoon!`)
});

//Lanzando el server
app.listen(process.env.PORT, () => {
    let response = 'Escuchando en puerto: ' + process.env.PORT;
    return console.log(response);
});

// mongodb+srv://pablob206:<password>@cluster0.fugtn.mongodb.net/test

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));

module.exports = app;