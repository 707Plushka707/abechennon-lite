const rsi = require('../indicator/rsi');
const sma = require('../indicator/sma');

let buy = 0;
let sell = 0;
let flagSell = false;
let flagBuy = false;
let objectOperation = new Object();

//Failure swing Rsi
const strategy1 = (src, length) => { //Funcion para armar el objectOperation(objeto con las operaciones de compra/venta), que sera usado por el backTesting
    let calculateRsi = rsi(src, length);

    calculateRsi.forEach((curr, i, p) => {
        if (flagBuy == false && //BUY
            curr < 50 &&
            curr >= p[i - 2] && curr > p[i - 1] && // valor actual (failure swing)
            p[i - 1] < p[i - 2] && p[i - 1] > p[i - 3] && // p[i - 1]
            p[i - 2] > p[i - 3] && // p[i - 2]
            (p[i - 3] < p[i - 4]) // p[i - 3]
        ) {
            flagBuy = true;
            flagSell = false;
            buy += 1; //Contador buy
            objectOperation[`Buy_i-${i}_Rsi: ${curr}`] = src[i + length];
        } else if (flagSell == false && // SELL
            curr > 50 &&
            curr <= p[i - 2] && curr < p[i - 1] &&
            p[i - 1] > p[i - 2] && p[i - 1] < p[i - 3] && // p[i - 1]
            p[i - 2] < p[i - 3] && // p[i - 2]
            (p[i - 3] > p[i - 4]) // p[i - 3]
        ) {
            flagBuy = false;
            flagSell = true;
            sell += 1; //Contador sell
            objectOperation[`Sell_i-${i}_Rsi: ${curr}`] = src[i + length];
        };
    });
    console.log(`Buy: ${buy}`);
    console.log(`Sell: ${sell}`);
    return objectOperation;
};

//=============================================================================================

//Failure swing Rsi
const strategy2 = (src, length) => {
    let calculateRsi = rsi(src, length);
    let flagOp;

    calculateRsi.forEach((curr, i, p) => {
        flagOp = undefined;

        if (flagBuy == false && // BUY
            curr < 50 &&
            curr >= p[i - 2] && curr > p[i - 1] &&
            p[i - 1] < p[i - 2] && p[i - 1] > p[i - 3] && // p[i - 1]
            p[i - 2] > p[i - 3] && // p[i - 2]
            (p[i - 3] < p[i - 4]) // p[i - 3]
        ) {
            flagBuy = true;
            flagSell = false;
            flagOp = 'buy';

        } else if (flagSell == false && // SELL
            curr > 50 &&
            curr <= p[i - 2] && curr < p[i - 1] &&
            p[i - 1] > p[i - 2] && p[i - 1] < p[i - 3] && // p[i - 1]
            p[i - 2] < p[i - 3] && // p[i - 2]
            (p[i - 3] > p[i - 4]) // p[i - 3]
        ) {
            flagBuy = false;
            flagSell = true;
            flagOp = 'sell';
        };
    });
    // console.log(`flagOp: ${flagOp}`);

    return flagOp;
};

//=============================================================================================

const strategy3 = (src, length) => {
    let calculateRsi = rsi(src, length);
    let flagOp;

    calculateRsi.forEach((curr, i, p) => {
        flagOp = undefined;

        if (flagBuy == false && // BUY
            curr < 50 &&
            curr >= p[i - 2] && curr > p[i - 1] &&
            p[i - 1] < p[i - 2] && p[i - 1] > p[i - 3] && // p[i - 1]
            p[i - 2] > p[i - 3] && // p[i - 2]
            (p[i - 3] < p[i - 4]) // p[i - 3]
        ) {
            flagBuy = true;
            flagSell = false;
            flagOp = 'buy';

        } else if (flagSell == false && // SELL
            curr > 50 &&
            curr <= p[i - 2] && curr < p[i - 1] &&
            p[i - 1] > p[i - 2] && p[i - 1] < p[i - 3] && // p[i - 1]
            p[i - 2] < p[i - 3] && // p[i - 2]
            (p[i - 3] > p[i - 4]) // p[i - 3]
        ) {
            flagBuy = false;
            flagSell = true;
            flagOp = 'sell';
        };
    });
    // console.log(`flagOp: ${flagOp}`);

    return flagOp;
};


module.exports = { strategy1, strategy2 };