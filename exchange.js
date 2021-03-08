const Binance = require('node-binance-api');

//============================ Conexion Binance ============================
const binance = new Binance().options({ //Hacer que lea la conexion desde el archivo exchange!! 
    APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
    APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
});
console.log('Conexion Binance OK! - exchange');

module.exports = binance;