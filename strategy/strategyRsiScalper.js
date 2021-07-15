const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const RSI = require('technicalindicators').RSI;

const strategyRsiScalper = (src, length) => {
    let objectPoint = new Object();
    flagBuy = false;
    flagSell = false;
    let buy = 0;
    let sell = 0;
    let periodRsi = length;

    let { open, close, high, low, period } = src;
    let inputRsi = { values: close, period: periodRsi };
    let arrayPointRsi = RSI.calculate(inputRsi);
    // console.log(util.inspect(arrayPointRsi, { maxArrayLength: null }));

    // adx: distinguir tendencia
    // rsi: en lateral
    // mdi/pdi: en tendencia
    // sma: en tendencia

    src.close.map((curr, idx, p) => {
        let i = 499 - idx; // sirve para ubicarnos en tradingview
        let rsi = arrayPointRsi[idx - periodRsi];
        // console.log(idx);
        // console.log(curr);
        // console.log(rsi);
        // console.log("---------------------------------");
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
    });
    // console.log(objectPoint);
    return objectPoint;
};


module.exports = strategyRsiScalper;