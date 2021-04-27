const Binance = require('node-binance-api');

//============================ Conexion Binance ============================
const binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET,
    // APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
    // APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
    // 'test': true
});

module.exports = binance;