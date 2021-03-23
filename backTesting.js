const rsi = require('./indicator/rsi');
let strategy1 = require('./strategy');

//=================== Back-Testing ===================
let buy = 0;
let sell = 0;
let profit = 0;
let profitParcial = 0;
let flagSell = false;
let flagBuy = false;
let objectOperation = new Object();
let parcialPercent;
let totalPercent = 0;
let arrayTrackerRsi = [];


const dataTrackerRsi = (totalClosePeriod, period) => {

    totalClosePeriod.forEach((currentValue, idx, totalClosePeriod) => {
        let calculateRsi = rsi(currentValue, period);

        if (calculateRsi !== undefined) {
            arrayTrackerRsi.push(calculateRsi);
        } else {
            arrayTrackerRsi.push(0);
        };
    });

    arrayTrackerRsi.forEach((currentValue, idx, arrayTrackerRsi) => {
        if (arrayTrackerRsi[idx] > arrayTrackerRsi[idx - 1] && arrayTrackerRsi[idx - 2] > arrayTrackerRsi[idx - 3]) {
            flagBuy = true;
            flagSell = false;
            buy = buy + 1; //Contador buy
            objectOperation['Buy_' + idx] = arrayTrackerRsi[idx];
        } else if (arrayTrackerRsi[idx] < arrayTrackerRsi[idx - 1] && arrayTrackerRsi[idx - 2] < arrayTrackerRsi[idx - 3]) {
            flagSell = true;
            flagBuy = false;
            sell = sell + 1; //Contador sell
            objectOperation['Sell_' + idx] = arrayTrackerRsi[idx];
        } else {};
    });
    // console.log(objectOperation)
    return objectOperation;
};

const dataBackTesting = (idx, arrayClosePeriod, period) => { //Funcion para armar el objectOperation(objeto con las operaciones de compra/venta), que sera usado por el backTesting
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
            parcialPercent = 100 - ((arrayOperation[ix][1] / prevPrice(ix, arrayOperation)) * 100);
            totalPercent = totalPercent + parcialPercent;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Buy (Iniciando long/cerrando short): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Parcial: ${parcialPercent}`);
            console.log(`% Total: ${totalPercent}`);
        } else if (operation[0].includes('Sell') && prevPrice(ix, arrayOperation) != 0) {
            profitParcial = arrayOperation[ix][1] - prevPrice(ix, arrayOperation);
            profit = profit + profitParcial;
            parcialPercent = ((arrayOperation[ix][1] / prevPrice(ix, arrayOperation)) * 100) - 100;
            totalPercent = totalPercent + parcialPercent;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Sell (Iniciando short/cerrando long): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Parcial: ${parcialPercent}`);
            console.log(`% Total: ${totalPercent}`);
        } else {
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Total: ${totalPercent}`);
        };
    });
};

module.exports = {
    dataBackTesting,
    backTesting,
    dataTrackerRsi
}