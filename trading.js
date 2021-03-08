const Binance = require('node-binance-api');
// require('./exchange');
let { dataBackTesting, backTesting } = require('./backTesting');
// require('./indicator/rsi');

const getData = async() => {
    let arrayClose = [];
    let arrayCloseActual = [];
    let period = 14;

    // require('../exchange'); //Doble llamada

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

        //=================== Obtenemos 500 array de 14 periodos ===================
        for (let idx = 0; idx <= arrayClose.length; idx++) {
            start_index = idx - period;
            upto_index = idx;
            const arrayClosePeriod = arrayClose.slice(start_index, upto_index); //generamos el array arrayClosePeriod con 14 elem, para cada iteracion

            objectOperation = dataBackTesting(idx, arrayClosePeriod, period); //Generando el objeto con los datos de las operaciones de compra/venta que sera usado por el backTesting
        };
        backTesting(objectOperation);
    });

    //==========================================================================
    //=================== Los 14 ultimos close ===================
    //==========================================================================

    await binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
        ticks.forEach((val, i) => {
            arrayCloseActual.push(ticks[i][4]); //en indice 4 esta el close
        });
        // console.log(arrayCloseActual);
    }, { limit: 14 });

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