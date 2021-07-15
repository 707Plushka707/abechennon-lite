const Binance = require('node-binance-api');
require('dotenv').config();

/**
 * Conexion a binance
 */
const binance = new Binance().options({
    APIKEY: process.env.DEVAPIKEY,
    APISECRET: process.env.DEVAPISECRET,
    // 'test': true
});

module.exports = binance;