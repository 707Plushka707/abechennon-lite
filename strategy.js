const rsi = require('./indicator/rsi');

let buy = 0;
let sell = 0;
let flagSell = false;
let flagBuy = false;
let objectOperation = new Object();

//Failure swing Rsi
const strategy1 = (src, length) => { //Funcion para armar el objectOperation(objeto con las operaciones de compra/venta), que sera usado por el backTesting
    let calculateRsi = rsi(src, length);

    calculateRsi.forEach((curr, i, p) => {
        if (flagBuy == false && curr < 30)
        //     &&curr >= p[i - 2] && curr > p[i - 1] && // valor actual (failure swing)
        //     p[i - 1] < p[i - 2] && p[i - 1] > p[i - 3] && // p[i - 1]
        //     p[i - 2] > p[i - 3] // p[i - 2]
        //     // (p[i - 3] < p[i - 4]) // p[i - 3]
        // ) 
        {
            // console.log("Long");
            flagBuy = true;
            flagSell = false;
            buy += 1; //Contador buy
            objectOperation[`Buy_i-${i}_Rsi: ${curr}`] = src[i + 14];
        } else if (flagSell == false && curr > 70)
        //     &&curr <= p[i - 2] && curr < p[i - 1] &&
        //     p[i - 1] > p[i - 2] && p[i - 1] < p[i - 3] && // p[i - 1]
        //     p[i - 2] < p[i - 3] // p[i - 2]
        //     // (p[i - 3] > p[i - 4]) // p[i - 3]
        // ) 
        {
            // console.log("Short");
            flagBuy = false;
            flagSell = true;
            sell += 1; //Contador sell
            objectOperation[`Sell_i-${i}_Rsi: ${curr}`] = src[i + 14];
        };
    });
    console.log(`Buy: ${buy}`);
    console.log(`Sell: ${sell}`);
    return objectOperation;
};

module.exports = { strategy1 };