const rsii = require('./indicator/rsi');

let buy = 0;
let sell = 0;
let profit = 0;

const backTesting = (array, period) => {
    let calculateRsi = rsii.rsi(array, period);

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

module.exports = backTesting;