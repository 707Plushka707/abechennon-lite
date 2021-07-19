const express = require('express');
const app = express();

// const path = require('path');
require('./config/config');
const { dbConnection } = require('./config/db');
require('./trading');

dbConnection();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app.use(express.static(path.resolve(__dirname, '../public')));
app.use(express.static('public'));

// const orders = require('./routes/orders');
// app.use(orders);

app.use('/resources', express.static(__dirname + '/public'));
// console.log(__dirname);

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(process.env.PORT, (req, res) => {
    let response = `- Server Up! http://localhost:${process.env.PORT}`;
    return console.log(response);
});




module.exports = app;