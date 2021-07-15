const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const ADX = require('technicalindicators').ADX;
const RSI = require('technicalindicators').RSI;

// formato de, ej: inputHistoryCandlestick[ETHUSDT]
// {
//     close: [],
//     high: [],
//     low: [],
//     period: 14
// }

// adx: distinguir tendencia
// rsi: en lateral
// mdi/pdi: en tendencia
// sma: en tendencia
const strategyAdxRsi = (src) => {
    let objectPoint = new Object();
    flagBuy = false;
    flagSell = false;
    let buy = 0;
    let sell = 0;
    let periodRsi = 3;
    let periodAdx = 14;

    let { open, close, high, low, period } = src;

    let inputRsi = { values: close, period: periodRsi };
    let arrayPointRsi = RSI.calculate(inputRsi);
    // console.log(util.inspect(arrayPointRsi, { maxArrayLength: null }));

    let inputAdx = { close, high, low, period: periodAdx };
    let arrayPointAdx = ADX.calculate(inputAdx);
    // console.log(util.inspect(arrayPointAdx, { maxArrayLength: null }));

    src.close.map((curr, idx, p) => {
        let i = 499 - idx; // sirve para ubicarnos en tradingview

        if (arrayPointAdx[idx - 27] != undefined) {
            let { adx, pdi, mdi } = arrayPointAdx[idx - 27];
            let rsi = arrayPointRsi[idx - periodRsi];

            // console.log(idx);
            // console.log(curr);
            // console.log(adx);
            // console.log(rsi);
            // console.log("---------------------------------");

            if (adx < 25) {
                if (rsi <= 15 && flagBuy == false) {
                    flagBuy = true;
                    flagSell = false;
                    buy += 1; // Contador buy
                    objectPoint[`Buy_${idx}-${i}`] = curr;
                } else if (rsi >= 85 && flagSell == false) {
                    flagBuy = false;
                    flagSell = true;
                    sell += 1; // Contador sell
                    objectPoint[`Sell_${idx}-${i}`] = curr;
                };
            } else if (adx >= 25 && flagBuy == false) {
                if (pdi > mdi) { // tendencia positiva
                    flagBuy = true;
                    flagSell = false;
                    buy += 1; // Contador buy
                    objectPoint[`Buy_${idx}-${i}`] = curr;
                } else if (mdi > pdi && flagSell == false) { // tendencia negativa
                    flagBuy = false;
                    flagSell = true;
                    sell += 1; // Contador sell
                    objectPoint[`Sell_${idx}-${i}`] = curr;
                };
            };

        };
    });
    // console.log(objectPoint);
    return objectPoint;
};


module.exports = strategyAdxRsi;