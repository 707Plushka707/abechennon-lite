const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
require('./config/config');
require('./config/conexion');
require('./exchange');
require('./indicator/rsi');

const app = express();

app.listen(process.env.PORT, () => {
    let response = 'Escuchando en puerto: ' + process.env.PORT;
    return console.log(response);
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, '../public')));

module.exports = app;