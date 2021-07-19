const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const RSI = require('technicalindicators').RSI;


const classicRsi = (src, invertSignal = false, backTesting = false, length, oversold, overbought) => {
    return new Promise((resolve, reject) => {
        let { open, close, high, low } = src,
        arrayPointRsi = RSI.calculate({ values: close, period: length }),
            flagBuy = false,
            flagSell = false,
            signal,
            objectPoint = new Object();

        src.close.map((curr, idx, p) => {
            let i = 499 - idx; // es el indice pero al reves, sirve para ubicarnos en tradingview
            let rsi = arrayPointRsi[idx - length]; // sincronizacion del indice de los cierres con el indice del rsi
            signal = undefined;

            if (flagBuy == false && rsi < oversold) {
                flagBuy = true;
                flagSell = false;

                if (invertSignal == false && backTesting == false) {
                    signal = 'buy';
                } else if (invertSignal == false && backTesting == true) {
                    objectPoint[`Buy_${idx}-${i}`] = curr;
                } else if (invertSignal == true && backTesting == false) {
                    signal = 'sell';
                } else if (invertSignal == true && backTesting == true) {
                    objectPoint[`Sell_${idx}-${i}`] = curr;
                };

            } else if (flagSell == false && rsi > overbought) {
                flagBuy = false;
                flagSell = true;

                if (invertSignal == false && backTesting == false) {
                    signal = 'sell';
                } else if (invertSignal == false && backTesting == true) {
                    objectPoint[`Sell_${idx}-${i}`] = curr;
                } else if (invertSignal == true && backTesting == false) {
                    signal = 'buy';
                } else if (invertSignal == true && backTesting == true) {
                    objectPoint[`Buy_${idx}-${i}`] = curr;
                };
            };
        });
        if (backTesting == true) {
            resolve(objectPoint);
        } else {
            resolve(signal);
        };
    });
};


module.exports = classicRsi;