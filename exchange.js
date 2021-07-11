const Binance = require('node-binance-api');
require('dotenv').config();
// if (process.env.NODE_ENV = 'production') {
//     require('dotenv').config();
// };

//============================ Conexion Binance ============================
const binance = new Binance().options({
    APIKEY: process.env.DEVAPIKEY,
    APISECRET: process.env.DEVAPISECRET,
    // 'test': true
});

module.exports = binance;