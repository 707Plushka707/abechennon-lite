const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const RSI = require('technicalindicators').RSI;


const classicRsi = (symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought) => {
    return new Promise((resolve, reject) => {
        let { open, close, high, low } = src,
        inputRsi = { values: close, period: lengthRsi },
            arrayPointRsi = RSI.calculate(inputRsi),
            flagBuy = false,
            flagSell = false,
            signal,
            objectPoint = {
                [symbol]: {}
            };

        src.close.map((curr, idx, p) => {
            let i = 499 - idx; // es el indice pero al reves, sirve para ubicarnos en tradingview
            let rsi = arrayPointRsi[idx - lengthRsi]; // sincronizacion del indice de los cierres con el indice del rsi
            signal = undefined;

            if (flagBuy == false && rsi < oversold) {
                flagBuy = true;
                flagSell = false;
                if (invertSignal == true) {
                    signal = 'sell';
                } else {
                    signal = 'buy';
                };

                if (backTesting == false) {
                    signal;
                } else if (backTesting == true) {
                    objectPoint[symbol][`${signal}_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                };

            } else if (flagSell == false && rsi > overbought) {
                flagBuy = false;
                flagSell = true;
                if (invertSignal == true) {
                    signal = 'buy';
                } else {
                    signal = 'sell';
                };

                if (backTesting == false) {
                    signal;
                } else if (backTesting == true) {
                    objectPoint[symbol][`${signal}_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
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