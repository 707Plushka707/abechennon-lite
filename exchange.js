const Binance = require('node-binance-api');
require('dotenv').config();

//============================ Conexion Binance ============================
const binance = new Binance().options({
    APIKEY: process.env.DEVAPIKEY,
    APISECRET: process.env.DEVAPISECRET,
    // APIKEY = 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ'
    // APISECRET = 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
    // DEVAPIKEY: '3QvmVLVVANbQz8GuTiltOKHHuB1Z4sk388tU51Ij6KoHoGcljjCX8ITClEp1OwJt'
    // DEVAPISECRET: 'UiFyytLnkBhbaN8pIY2VlPWmWFUamkKsLps8LUmExmJ1VakxJVRJvo2VJoF4MIRH'
    // 'test': true
});

module.exports = binance;