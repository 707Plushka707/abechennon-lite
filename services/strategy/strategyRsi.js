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

                if (invertSignal == false && backTesting == false) {
                    signal = 'buy';
                } else if (invertSignal == false && backTesting == true) {
                    objectPoint[symbol][`Buy_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                } else if (invertSignal == true && backTesting == false) {
                    signal = 'sell';
                } else if (invertSignal == true && backTesting == true) {
                    objectPoint[symbol][`Sell_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                };

            } else if (flagSell == false && rsi > overbought) {
                flagBuy = false;
                flagSell = true;

                if (invertSignal == false && backTesting == false) {
                    signal = 'sell';
                } else if (invertSignal == false && backTesting == true) {
                    objectPoint[symbol][`Sell_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                } else if (invertSignal == true && backTesting == false) {
                    signal = 'buy';
                } else if (invertSignal == true && backTesting == true) {
                    objectPoint[symbol][`Buy_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
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