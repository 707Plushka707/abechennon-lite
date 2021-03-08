const rsi = require('./indicator/rsi');

//=================== Back-Testing ===================
let buy = 0;
let sell = 0;
let profit = 0;
let profitParcial = 0;
let flagSell = false;
let flagBuy = false;
let objectOperation = new Object();

const dataBackTesting = (idx, arrayClosePeriod, period) => { //Funcion para armar el objectOperation(objeto con las operaciones de compra/venta), que sera usado en el backTesting
    let calculateRsi = rsi(arrayClosePeriod, period);

    if (calculateRsi <= 20 && flagBuy == false) {
        flagBuy = true;
        flagSell = false;
        buy = buy + 1; //Contador buy
        objectOperation['Buy_' + idx] = arrayClosePeriod[period - 1];
    } else if (calculateRsi >= 80 && flagSell == false) {
        flagSell = true;
        flagBuy = false;
        sell = sell + 1; //Contador sell
        objectOperation['Sell_' + idx] = arrayClosePeriod[period - 1];
    } else {};

    return objectOperation;
};

const backTesting = (objectOperation) => {
    let arrayOperation = Object.entries(objectOperation);
    console.log(arrayOperation);
    console.log(`Buy ${buy}`);
    console.log(`Sell ${sell}`);

    const prevPrice = (ix, arrayOperation) => {
        if (arrayOperation[ix - 1] === undefined) {
            return 0;
        } else {
            return arrayOperation[ix - 1][1]
        };
    };

    arrayOperation.forEach((operation, ix, arrayOperation) => {
        if (operation[0].includes('Buy') && prevPrice(ix, arrayOperation) != 0) {
            profitParcial = prevPrice(ix, arrayOperation) - arrayOperation[ix][1];
            profit = profit + profitParcial;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Buy (Iniciando long/cerrando short): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        } else if (operation[0].includes('Sell') && prevPrice(ix, arrayOperation) != 0) {
            profitParcial = arrayOperation[ix][1] - prevPrice(ix, arrayOperation);
            profit = profit + profitParcial;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Sell (Iniciando short/cerrando long): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        } else {
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        };
    });
};

module.exports = {
    dataBackTesting,
    backTesting
}