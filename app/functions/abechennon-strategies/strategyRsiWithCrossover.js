const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const RSI = require('technicalindicators').RSI;


const classicRsiWithCrossover = (symbol, src, invertSignal = false, backTesting = false, length, oversold, overbought) => {
    return new Promise((resolve, reject) => {
        let { open, close, high, low } = src,
        arrayPointRsi = RSI.calculate({ values: close, period: length }),
            flagBuy = false,
            flagSell = false,
            oversoldZone = false,
            overboughtZone = false,
            signal,
            objectPoint = {
                [symbol]: {}
            };

        src.close.map((curr, idx) => {
            let i = 499 - idx; // es el indice pero al reves, sirve para ubicarnos en tradingview
            let rsi = arrayPointRsi[idx - length]; // sincronizacion del indice de los cierres con el indice del rsi
            signal = undefined;


            if (flagBuy == false && oversoldZone == true && rsi > oversold) { // buy zone, oversold
                oversoldZone = false;
                flagBuy = true;
                flagSell = false;

                if (backTesting == false) {
                    signal = 'buy';
                } else if (backTesting == true) {
                    objectPoint[symbol][`Buy_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                };
            } else if (flagSell == false && overboughtZone == true && rsi < overbought) { // sell zone, overbought
                overboughtZone = false;
                flagBuy = false;
                flagSell = true;

                if (backTesting == false) {
                    signal = 'sell';
                } else if (backTesting == true) {
                    objectPoint[symbol][`Sell_${idx}-${i}_Trigger: RSI: ${rsi}`] = curr;
                };
            };

            if (flagBuy == false && rsi < oversold) { // buy zone
                oversoldZone = true;
            } else if (flagSell == false && rsi > overbought) { // sell zone
                overboughtZone = true;
            };

        });

        if (backTesting == true) {
            resolve(objectPoint);
        } else {
            resolve(signal);
        };
    });
};


module.exports = classicRsiWithCrossover;