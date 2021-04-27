const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { srcLength, changeUp, changeDown } = require('./indicator/utils');
const sma = require('./indicator/sma');

const waves = (src, length) => {
    let arrayPointSma = sma(src, 7); // suavizado de senales con sma, okok
    let flagOp;

    arrayPointSma.map((curr, idx, p) => {
        flagOp = undefined;

        if (flagBuy == false &&
            curr > p[idx - 1] && curr > p[idx - 2]
            // && p[idx - 3] < p[idx - 4] && p[idx - 3] < p[idx - 2]
        ) {
            flagBuy = true;
            flagSell = false;
            flagOp = 'buy';
        } else if (flagSell == false &&
            curr < p[idx - 1] && curr < p[idx - 2]
            // && p[idx - 3] > p[idx - 4] && p[idx - 3] > p[idx - 2]
        ) {
            flagBuy = false;
            flagSell = true;
            flagOp = 'sell';
        }
        //  else {
        //     objectPoint[`${idx}-_${i}`] = curr;
        // };
    });
    // console.log(`flagOp: ${flagOp}`);

    return flagOp;
};

//=============================================================================================

let buy = 0;
let sell = 0;
let flagBuy = false;
let flagSell = false;

const wavesBackTesting = (src, length) => {
    let objectPoint = new Object();
    let arrayPointSma = sma(src, 7); // suavizado de senales con sma, okok
    // let arrayPointSma = src; // muchas falsas senales..

    arrayPointSma.map((curr, idx, p) => {
        let i = 499 - idx; // sirve para ubicarnos en tradingview

        if (flagBuy == false &&
            curr > p[idx - 1] && curr > p[idx - 2]
            // && p[idx - 3] < p[idx - 4] && p[idx - 3] < p[idx - 2]
        ) {
            flagBuy = true;
            flagSell = false;
            buy += 1; //Contador buy
            objectPoint[`Buy_${idx}-${i}`] = curr;
        } else if (flagSell == false &&
            curr < p[idx - 1] && curr < p[idx - 2]
            // && p[idx - 3] > p[idx - 4] && p[idx - 3] > p[idx - 2]
        ) {
            flagBuy = false;
            flagSell = true;
            sell += 1; //Contador sell
            objectPoint[`Sell_${idx}-${i}`] = curr;
        }
        //  else {
        //     objectPoint[`${idx}-_${i}`] = curr;
        // };
    });

    console.log(`Buy: ${buy}`);
    console.log(`Sell: ${sell}`);

    return objectPoint;
};



module.exports = { waves, wavesBackTesting };