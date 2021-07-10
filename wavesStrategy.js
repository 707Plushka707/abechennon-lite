const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { srcLength, changeUp, changeDown } = require('./indicator/utils');
const sma = require('./indicator/sma');

const waves = async(src, length) => {
    let arrayPointSma = sma(src, length); // suavizado de senales con sma, okok
    let signal;
    // console.log(util.inspect(arrayPointSma, { maxArrayLength: null }));

    arrayPointSma.map((curr, idx, p) => {
        signal = undefined;

        if (flagBuy == false &&
            curr > p[idx - 1] && curr > p[idx - 2]
            // && p[idx - 3] < p[idx - 4] && p[idx - 3] < p[idx - 2]
        ) {
            flagBuy = true;
            flagSell = false;
            signal = 'sell'; // default: 'buy'
        } else if (flagSell == false &&
            curr < p[idx - 1] && curr < p[idx - 2]
            // && p[idx - 3] > p[idx - 4] && p[idx - 3] > p[idx - 2]
        ) {
            flagBuy = false;
            flagSell = true;
            signal = 'buy'; // default: 'sell'
        }
        //  else {
        //     objectPoint[`${idx}-_${i}`] = curr;
        // };
    });
    // console.log(`signal: ${signal}`);

    return signal;
};

//=============================================================================================

let buy = 0;
let sell = 0;
let flagBuy = false;
let flagSell = false;

const wavesBackTesting = (src, length) => {
    let objectPoint = new Object();
    let arrayPointSma = sma(src, length); // suavizado de senales con sma, okok
    // let arrayPointSma = src; // muchas falsas senales..

    arrayPointSma.map((curr, idx, p) => {
        let i = 499 - idx; // sirve para ubicarnos en tradingview

        if (flagBuy == false &&
            // curr > p[idx - 1] && curr > p[idx - 2] // arriba
            curr < p[idx - 1] && curr < p[idx - 2] // abajo
            // && p[idx - 3] < p[idx - 4] && p[idx - 3] < p[idx - 2]
        ) {
            flagBuy = true;
            flagSell = false;
            buy += 1; //Contador buy

            // objectPoint[`Buy_${idx}-${i}`] = curr.toFixed(2); // error. estoy agregando el valor del sma y tiene que ser el valor del close
            objectPoint[`Buy_${idx}-${i}`] = src[idx + (length - 1)];
        } else if (flagSell == false &&
            // curr < p[idx - 1] && curr < p[idx - 2] // abajo
            curr > p[idx - 1] && curr > p[idx - 2] // arriba

            // && p[idx - 3] > p[idx - 4] && p[idx - 3] > p[idx - 2]
        ) {
            flagBuy = false;
            flagSell = true;
            sell += 1; //Contador sell

            // objectPoint[`Sell_${idx}-${i}`] = curr.toFixed(2); // error. estoy agregando el valor del sma y tiene que ser el valor del close
            objectPoint[`Sell_${idx}-${i}`] = src[idx + (length - 1)];
        };
        //  else {
        //     objectPoint[`${idx}-_${i}`] = curr;
        // };
    });

    // console.log(`Buy: ${buy}`);
    // console.log(`Sell: ${sell}`);
    // console.log(objectPoint);

    return objectPoint;
};



module.exports = { waves, wavesBackTesting };