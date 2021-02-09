const Binance = require('node-binance-api');
// require('../exchange');

async function data() {
    let arrayClose = [];
    let arrayCloseActual = [];
    let period = 14;

    await require('../exchange'); //Doble llamada
    //==========================================================================
    //============================ Conexion Binance ============================
    //==========================================================================
    //Hacer que lea la conexion desde el archivo exchange!! 

    // const binance = await Binance().options({
    const binance = await new Binance().options({
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
    });
    console.log('Conexion Binance OK! - rsi');

    //==========================================================================
    //=================== Historico: los 500 ultimos close =====================
    //==========================================================================
    await binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(ticks[i][4]); //en indice 4 esta el close
        });
        //==========================================================================
        //=================== Obtenemos 500 array de 14 periodos ===================
        //==========================================================================
        arrayClose.forEach((val, idx, arrayClose) => { //iteracion en el array arrayClose           
            start_index = idx - 14;
            upto_index = idx;
            const arrayClosePeriod = arrayClose.slice(start_index, upto_index); //generamos el array arrayClosePeriod con 14 elem, para cada iteracion
            console.log('Indice arrayClose: ' + idx);
            // console.log('arrayClosePeriod: ' + arrayClosePeriod);
            // rsi(arrayClosePeriod, period);
            // let calculateRsi = rsi(arrayClosePeriod, period);
            // console.log(`RSI ${calculateRsi}`);
            // strategy1(arrayClosePeriod, period);
            backTesting(arrayClosePeriod, period);
            console.log('***************************************');
        });
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
            console.log('Ultimo precio: ' + close);
            arrayCloseActual.shift();
            arrayCloseActual.push(close);
            // console.log(arrayCloseActual);
            // strategy1(arrayCloseActual, period);
            backTesting(arrayCloseActual, period);
            console.log('***************************************');
        };
    });
};

//==========================================================================
//=================== Calcular RSI ===================
//==========================================================================
// rsi= 100 - 100 / (1 + rs)
// rs = Average Gain / Average Loss

const rsi = (arrayCloseActual, period) => {
    let difPositivas = 0;
    let difNegativas = 0;
    let rsi;

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
            rsi = 100 - (100 / (1 + rs));
            // console.log('RSI: ' + calculateRsi);
        };
    });
    return rsi;
};

const strategy1 = (array, period) => {
    let quantity = 0.00043060; //Equivale u$d20 al 09/02/2021
    let calculateRsi = rsi(array, period);

    console.log(`Strategy RSI: ${calculateRsi}`);

    if (calculateRsi < 20) {
        console.log(`Buy ${quantity}`);
        // binance.marketBuy("BTCUSDT", quantity);
    }
    if (calculateRsi > 80) {
        console.log(`Sell ${quantity}`);
        // binance.marketSell("BTCUSDT", quantity);
    } else
        console.log('RSI dentro de rango');
};

let buy = 0;
let sell = 0;
let profit = 0;

const backTesting = (array, period) => {
    let calculateRsi = rsi(array, period);

    console.log(`BackTesting RSI: ${calculateRsi}`);

    if (calculateRsi < 20) {
        buy = buy + 1;
    }
    if (calculateRsi > 80) {
        sell = sell + 1;
    }
    console.log(`Buy ${buy}`);
    console.log(`Sell ${sell}`);
};


data();

module.exports = data;

// 'use strict'

// const async = require('async');
// const Decimal = require('decimal.js');

// class RSI {
//     constructor(values, period) {
//         this.values = values.reverse();
//         this.data = [];
//         this.period = period;
//     }
//     calculate(callback) {
//         async.series([
//                 (next) => this.lossOrGain(next),
//                 (next) => this.averageGain(next),
//                 (next) => this.averageLoss(next),
//                 (next) => this.calculateRS(next),
//                 (next) => this.calculateRSI(next)
//             ],
//             (err, results) => {
//                 if (err) {
//                     return callback(err);
//                 }
//                 callback(null, results[4]);
//             });
//     }
//     lossOrGain(callback) {
//         this.values.forEach((val, idx) => {
//             if (idx > 0) {
//                 const prevVal = this.values[idx - 1];
//                 const change = Decimal.sub(val, prevVal);
//                 this.data.push({
//                     value: val,
//                     change: change.toNumber(),
//                     gain: (change.toNumber() > 0) ? change.toNumber() : 0,
//                     loss: (change.toNumber() < 0) ? change.abs().toNumber() : 0
//                 });
//             } else {
//                 this.data.push({
//                     value: val,
//                     gain: 0,
//                     loss: 0,
//                     change: 0
//                 })
//             }
//         });
//         callback(null, this.data);
//     }
//     averageGain(callback) {
//         this.getAverages('gain', callback)
//     }
//     averageLoss(callback) {
//         this.getAverages('loss', callback)
//     }
//     getAverages(key, callback) {
//         let sum = new Decimal(0);
//         let avg = 0;
//         let overallAvg = 0;
//         const upperCaseKey = key.charAt(0).toUpperCase() + key.substr(1);
//         this.data.forEach((val, idx) => {
//             if (idx < this.period) {
//                 sum = sum.plus(val[key]);
//             } else if (idx === this.period) {
//                 sum = sum.plus(val[key]);
//                 avg = sum.dividedBy(this.period);
//                 this.data[idx][`avg${upperCaseKey}`] =
//                     avg.toNumber();
//             } else {
//                 overallAvg =
//                     Decimal.mul(this.data[idx - 1][`avg${upperCaseKey}`], (this.period - 1))
//                     .plus(val[key])
//                     .dividedBy(this.period);
//                 this.data[idx][`avg${upperCaseKey}`] =
//                     overallAvg.toNumber();
//             }
//         });
//         callback(null, this.data);
//     }
//     calculateRS(callback) {
//         let rs = 0;
//         this.data.forEach((val, idx) => {
//             if (val.avgGain !== undefined && val.avgLoss !== undefined &&
//                 !isNaN(parseFloat(val.avgGain)) && !isNaN(parseFloat(val.avgLoss))) {
//                 val.rs = Decimal.div(val.avgGain, val.avgLoss).toNumber();
//             }
//         });
//         callback(null, this.data);
//     }
//     calculateRSI(callback) {
//         let rs = 0;
//         this.data.forEach((val, idx) => {
//             if (val.avgLoss) {
//                 this.data[idx].rsi = Decimal.sub(100, Decimal.div(100, Decimal.add(1, val.rs))).toNumber();
//             } else if (val.rs != undefined) {
//                 this.data[idx].rsi = 100;
//             }
//         });
//         return callback(null, this.data);
//     }
// }
// module.exports = RSI;

//*********************************************************************************************************************************/
//*********************************************************************************************************************************/

// const binance = require('node-binance-api')

// ().options({
//     APIKEY: 'xxx',
//     APISECRET: 'xxx',
//     useServerTime: true,
//     test: true // True = SandboxMode 
// });
// /* VARIABLES */
// let listClose = [];
// let changeUp = 0;
// let changeDown = 0;
// let last_closeHigh = 0;
// let last_closeLow = 0;
// let current_time = Date.now();
// let period = 20;

// function calculateRSI() {

//     console.log("Generating RSI");

//     binance.candlesticks("ETHBTC", "1d", (error, ticks, symbol) => {

//         for (i = 0; i < ticks.length; i++) {

//             let last_tick = ticks[i];
//             let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;

//             listClose.push(close);

//             if (i == ticks.length - 1) {
//                 for (x = 0; x < ticks.length; x++) {
//                     previous_close = (parseFloat(listClose[x - 1]));
//                     current_close = (parseFloat(listClose[x])); // HIGH if (current_close > previous_close) 
//                     {
//                         upChange = current_close - previous_close;
//                         changeUp += upChange;
//                         if (x == ticks.length - 1) {
//                             last_closeHigh = current_close - previous_close;
//                         }
//                     }; // LOW if (previous_close > current_close) 
//                     {
//                         downChange = previous_close - current_close;
//                         changeDown += downChange;
//                         if (x == ticks.length - 1) {
//                             last_closeLow = previous_close - current_close;
//                         };
//                     };
//                     if (x == ticks.length - 1) {
//                         AVGHigh = changeUp / period;
//                         AVGLow = changeDown / period;
//                         Upavg = (AVGHigh * (period - 1) + last_closeHigh) / (period);
//                         Downavg = (AVGLow * (period - 1) + last_closeLow) / (period);
//                         RS = Upavg / Downavg;
//                         RSI = (100 - (100 / (1 + RS)));
//                         console.log(RSI);
//                         return RSI;
//                     };
//                 };
//             };
//         };
//     }, { limit: period, endTime: current_time });
// };

// calculateRSI();