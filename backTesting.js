const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
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

const dataTrackerRsi = (src, length) => {

    let arrayTrackerRsi = tulind.indicators.rsi.indicator([src], [length], function(err, results) { // Resultados ok con tradingView
        console.log(results[0])
            // return results[0];
    });

    // console.log(util.inspect(arrayTrackerRsi, { maxArrayLength: null }))

    // console.log(arrayTrackerRsi)
    // src.forEach((curr, idx, src) => {
    //     // console.log(curr)

    //     //     if (arrayTrackerRsi[idx] > arrayTrackerRsi[idx - 1] && arrayTrackerRsi[idx - 2] > arrayTrackerRsi[idx - 3] && flagBuy == false) {
    //     //         flagBuy = true;
    //     //         flagSell = false;
    //     //         buy += 1; //Contador buy
    //     //         objectOperation['Buy_' + idx] = arrayTrackerRsi[idx];
    //     //     } else if (arrayTrackerRsi[idx] < arrayTrackerRsi[idx - 1] && arrayTrackerRsi[idx - 2] < arrayTrackerRsi[idx - 3] && flagSell == false) {
    //     //         flagBuy = false;
    //     //         flagSell = true;
    //     //         sell += 1; //Contador sell
    //     //         objectOperation['Sell_' + idx] = arrayTrackerRsi[idx];
    //     //     } else {};
    // });
    // console.log(objectOperation)
    // return objectOperation;
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