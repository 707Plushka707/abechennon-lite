const Binance = require('node-binance-api');
require('dotenv').config();

/**
 * Conexion a binance
 */
const binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET,
    // 'test': true
});

module.exports = binance;