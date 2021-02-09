/*
Test unitarios
*/
const Binance = require('node-binance-api');

const binance = new Binance().options({
    APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
    APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
});
console.log('Conexion Binance OK! - test1');
//==========================================================================
//=================== Historico: los 14 ultimos close ===================
//==========================================================================
let arrayCloseActual = [];
let period = 14;

binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
    ticks.forEach((val, i) => {
        arrayCloseActual.push(ticks[i][4]); //en indice 4 esta el close
    });
    console.log(arrayCloseActual);
    rsi(arrayCloseActual, period);
}, { limit: 14 });
//==========================================================================
//=================== Actualizacion ultimo close ===================
//==========================================================================
binance.websockets.candlesticks(['BTCUSDT'], "1m", (candlesticks) => {
    let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
    let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

    if (isFinal == true) {
        console.log('Ultimo precio: ' + close);
        arrayCloseActual.shift();
        arrayCloseActual.push(close);
        console.log(arrayCloseActual);
        rsi(arrayCloseActual, period);
    };
});

//==========================================================================
//=================== Calcular RSI ===================
//==========================================================================

// let arrayCloseActual = [10300.67000000, 10299.39000000, 10288.90000000, 10235.70000000, 10255.72000000, 10261.19000000, 10217.27000000, 10173.11000000, 10221.49000000, 10261.33000000, 10277.15000000, 10274.48000000, 10252.82000000, 10265.42000000];

const rsi = (arrayCloseActual, period) => {
    let difPositivas = 0;
    let difNegativas = 0;

    arrayCloseActual.forEach((val, idx, arrayCloseActual) => {

        const opDiferencia = () => {
            if (arrayCloseActual[idx] === undefined || arrayCloseActual[idx + 1] === undefined) {
                return 0;
            } else {
                let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
                return dif;
            };
        };
        // console.log(opDiferencia());

        if (Math.sign(opDiferencia()) === 1) { //diferencias + y -
            difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
            // console.log('difPositivas: ' + difPositivas);
        } else {
            difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
            // console.log('difNegativas: ' + difNegativas);
        };

        //*****************************Obtenemos promedios para up/down******************************//
        if (arrayCloseActual[idx] === arrayCloseActual[idx = (period - 1)]) {
            let promedioDown = difPositivas / period; //Calculo promedio clasico
            let promedioUp = difNegativas / period; //Calculo promedio clasico

            // promedioUp = ((difNegativas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado
            // promedioDown = ((difPositivas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado

            // console.log('promedioUp: ' + promedioUp);
            // console.log('promedioDown: ' + promedioDown);

            //*****************************calculos para RS******************************//
            let rs = promedioUp / promedioDown;

            // console.log('RS: ' + rs);

            //*****************************calculos para RSI******************************//
            // RSI = 100 - (100/1+RS)
            let calculateRsi = 100 - (100 / (1 + rs));
            console.log('RSI: ' + calculateRsi);
            return calculateRsi;
        };
    });
};

// rsi(arrayCloseActual, period);