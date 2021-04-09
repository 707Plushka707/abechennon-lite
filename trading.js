const Binance = require('node-binance-api');
const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
    // require('./exchange');
const { getDataBackTesting, backTesting } = require('./backTesting');
const strategy1 = require('./strategy');
const rsi = require('./indicator/rsi');

const getData = async() => {
    let arrayClose = [];
    let arrayCloseActual = [];
    let length = 14;
    let arrayClosePeriod = [];
    let totalClosePeriod = [];

    //============================ Conexion Binance ============================
    const binance = await new Binance().options({ //Hacer que lea la conexion desde el archivo exchange!! 
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
    });
    console.log('Conexion Binance OK! - rsi');

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(ticks[i][4]); //en indice 4 esta el close
        });
        // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

        // console.log(rsi(arrayClose, length));
        getDataBackTesting(arrayClose, length);
        // console.log(dataBackTesting(arrayClose, length));

        // arrayClose.map((currentValue, idx, arrayClose) => {
        //     start_index = idx - period;
        //     upto_index = idx;

        //     if (start_index >= 0) {
        //         arrayClosePeriod = arrayClose.slice(start_index, upto_index); //generamos el array arrayClosePeriod con 14 elem, para cada iteracion
        //     };

        //     // totalClosePeriod.push(arrayClosePeriod); // se genera un array con la coleccion de cada arrayClosePeriod

        //     // objectOperation = dataBackTesting(idx, arrayClosePeriod, period); //generando el objeto con los datos de las operaciones de compra/venta que sera usado por el backTesting
        // });

        // objectOperation = dataTrackerRsi(totalClosePeriod, period);  //dataTrackerRsi
        // backTesting(objectOperation); //recibo el objectOperation y lo procesa para calcular el backtesting
    });

    //=================== Los 14 ultimos close ===================

    // await binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
    //     ticks.forEach((val, i) => {
    //         arrayCloseActual.push(ticks[i][4]); //en indice 4 esta el close
    //     });
    //     // console.log(arrayCloseActual);
    // }, { limit: 14 });

    await binance.websockets.candlesticks(['BTCUSDT'], "1m", (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            console.log('---------------------------------------');
            console.log('Ultimo precio: ' + close);
            arrayCloseActual.shift();
            arrayCloseActual.push(close);
            // console.log(arrayCloseActual);
            // strategy1(arrayCloseActual, period);
            // backTesting(arrayCloseActual, period);
        };
    });
};

getData();

// module.exports = getData;