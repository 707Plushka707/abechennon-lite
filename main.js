const express = require('express');
const app = express();

// const path = require('path');
require('./app/config/config');

const { dbConnection } = require('./app/config/db/instanceDb');
// dbConnection();

require('./app/functions/TradingService');


// app.set('view engine', 'ejs');

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