const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Binance = require('node-binance-api');
const axios = require("axios");
const util = require('util'); // console.log(util.inspect(arrayClose, { maxArrayLength: null })) // console.log(util.inspect(arrayClose, { showHidden: false, depth: null }))
const async = require('async');
const Decimal = require('decimal.js');
const tulind = require('tulind');

// require('./rsi');
require('./config/config');


const app = express();

const bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, '../public')));

const binance = new Binance().options({
    APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
    APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
});

const inicializando = (async _ => {
    try {
        await mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
            (err, res) => {
                if (err) throw err;
                let response = 'MongoDB ONLINE';
                return console.log(response);
            });
        await app.listen(process.env.PORT, () => {
            let response = 'Escuchando en puerto: ' + process.env.PORT;
            return console.log(response);
        });
    } catch (error) {
        console.log(error);
    };
})();

//*******************************************************************************************//
//*****************************historico: los 500 ultimos close******************************//
//*******************************************************************************************//

// const historicoCloseVelas = ((err, res) => {
//     let arrayClose = [];

//     if (err) {
//         console.log(err)
//     } else {
//         binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima

//             ticks.forEach((val, i) => {
//                 arrayClose.push(ticks[i][4]); //en indice 4 esta el close
//             });

//             // console.log(util.inspect(arrayClose, { maxArrayLength: null }))
//             // console.log('arrayClose: ' + arrayClose.length);

//             return arrayClose;

//         }, { limit: 500 });
//     };
// });

// historicoCloseVelas();

//*******************************************************************************************//
//*****************************************Indicador RSI*************************************//
//*******************************************************************************************//
/*
suma_promedio_up = (p1DIF-p2) + (p2DIF-p3) + (p3DIF-p4) + ...... / nP  **el numerador queda negativo y ahi que convertirlo a positivo
suma_promedio_down = (p1DIF+p2) + (p2DIF+p3) + (p3DIF+p4) + ...... / nP
RS = suma_promedio_up/suma_promedio_down
RSI = 100 - (100/1+RS)

TALIB - The following is equivalent:
RSI = 100 * (prevGain/(prevGain+prevLoss))
*/

const rsi = ((err, res) => {
    let arrayClose = [];

    if (err) {
        console.log(err);
    } else {
        //*****************************historico: los 500 ultimos close******************************//
        binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
            ticks.forEach((val, i) => {
                arrayClose.push(ticks[i][4]); //en indice 4 esta el close
            });
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }))
            // console.log('arrayClose: ' + arrayClose.length);
            // return arrayClose;

            //*****************************obtenemos 500 array de 14 periodos******************************//
            arrayClose.forEach((val, idx, arrayClose) => { //iteracion en el array arrayClose
                let difPositivas = 0;
                let difNegativas = 0;

                start_index = idx - 14;
                upto_index = idx;
                const arrayClosePeriod = arrayClose.slice(start_index, upto_index); //generamos el array arrayClosePeriod con 14 elem, para cada iteracion
                console.log('***************************************');
                console.log('Indice arrayClose: ' + idx);
                console.log('arrayClosePeriod: ' + arrayClosePeriod);

                //*****************************calculos para cada array de 14 periodos******************************//
                arrayClosePeriod.forEach((val, idx, arrayClosePeriod) => {

                    let calcularRsi = (arrayClosePeriod) => {

                        const posicion1 = (arrayClosePeriod) => { //calcula la posicion1 en cada iteracion
                            let pos1;
                            if (arrayClosePeriod[idx] === undefined) {
                                pos1 = 0;
                                return pos1;
                            } else {
                                pos1 = arrayClosePeriod[idx];
                                return pos1;
                            };
                        };

                        const posicion2 = (arrayClosePeriod) => { //calcula la posicion2 en cada iteracion
                            if (arrayClosePeriod[idx + 1] === undefined) {
                                return pos2 = 0;
                            } else {
                                return pos2 = arrayClosePeriod[idx + 1];
                            };
                        };

                        const opDiferencia = () => { //calcula la diferencia entre las posiciones en cada iteracion
                            if (posicion1(arrayClosePeriod) === 0 || posicion2(arrayClosePeriod) === 0) {
                                return 0;
                            } else {
                                let dif = posicion1(arrayClosePeriod) - posicion2(arrayClosePeriod);
                                return dif;
                            };
                        };

                        if (Math.sign(opDiferencia()) === 1) { //diferencias + y -
                            difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
                            // console.log('difPositivas: ' + difPositivas);
                        } else {
                            difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
                            // console.log('difNegativas: ' + difNegativas);
                        };

                        if (arrayClosePeriod[idx] === arrayClosePeriod[idx = 13]) { //obtenemos promedios para up/down
                            let promedioDown = difPositivas;
                            let promedioUp = difNegativas;
                            // console.log('promedioUp: ' + promedioUp);
                            // console.log('promedioDown: ' + promedioDown);

                            //*****************************calculos para RS******************************//
                            rsUp = (promedioUp + (14 - 1) * 0) / 14;
                            rsDown = (promedioDown + (14 - 1) * 0) / 14;
                            // let rs = promedioUp / promedioDown
                            // console.log('RS: ' + rs);
                            //*****************************calculos para RSI******************************//
                            // RSI = 100 - (100/1+RS)
                            let rsi = 100 - (100 / (1 + (rsUp / rsDown)));

                            // RSI = 100 * (prevGain/(prevGain+prevLoss))
                            // let rsi = 100 * (rsUp / (rsUp + rsDown));

                            console.log('RSI: ' + rsi);
                        };
                        // console.log('pos1: ' + pos1);
                        // console.log('pos2: ' + pos2);
                        // console.log('Indice arrayClosePeriod: ' + idx);
                        // console.log('Dif_Positivas: ' + difPositivas)
                        // console.log('Dif_Negativas: ' + difNegativas);
                        // console.log('***********************************');
                    };
                    calcularRsi(arrayClosePeriod);
                });
            });
            // console.log(arrayClosePeriod);
        }, { limit: 500 });
    };
});

binance.websockets.candlesticks(['BTCUSDT'], "15m", (candlesticks) => {
    let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
    let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
    console.info(symbol + " " + interval + " candlestick update");
    console.info("open: " + open);
    console.info("high: " + high);
    console.info("low: " + low);
    console.info("close: " + close);
    console.info("volume: " + volume);
    console.info("isFinal: " + isFinal);
});

rsi();




//*******************************************************************************************//
//*******************************************************************************************//

// let closeCopy = close.slice(); //copio close[]
// closeCopy.pop(); //elimino el ultimo elemento
// console.log(close.length);
// console.log(Array.isArray(close));



//*******************************************************************************************//