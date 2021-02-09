const Binance = require('node-binance-api');

//*****************************test1 Conexion a Binance******************************//
// const binanceConnect = Binance().options({
//     APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
//     APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
// });
// console.log('Conexion Binance OK! - Exchange');

//*****************************test2 Conexion a Binance******************************//
async function binanceConnect() {

    const binance = await new Binance().options({
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
    });
    console.log('Conexion Binance OK! - Exchange');
};

binanceConnect();

//async function binanceConnect() {

//     const binance = await new Binance().options({
//         APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
//         APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
//     });
//     process.env.BINANCE = binance; // Usar esta ruta
//     console.log('Conexion Binance OK! - Exchange');
// };

// binanceConnect(); 

module.exports = binanceConnect;