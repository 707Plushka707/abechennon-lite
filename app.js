const express = require('express');
const path = require('path');
require('./config/config');
require('./trading');

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send(`Abechennon online!`);
});

app.listen(process.env.PORT, () => {
    let response = '- Listening port: ' + process.env.PORT;
    return console.log(response);
});

// mongodb+srv://pablob206:<password>@cluster0.fugtn.mongodb.net/test

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());
app.use(express.static(path.resolve(__dirname, '../public')));

module.exports = app;