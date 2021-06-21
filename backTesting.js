const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const Binance = require('node-binance-api');
const { prevPrice, percent } = require('./indicator/utils');
const { waves, wavesBackTesting } = require('./wavesStrategy');

//=================== Back-Testing ===================
// let buy = 0;
// let sell = 0;
// let flagSell = false;
// let flagBuy = false;
// let objectOperation = new Object();

let profit = 0;
let profitParcial = 0;
let parcialPercent;
let totalPercent = 0;
let percentFee = 0.1;

//si el profit parcial es negativo, entonces el fee debe sumarse, arreglar!
const backTesting = (src) => {
    // let symbol = "BTCUSDT";
    // let timeFrame = "4h";
    // let length = 7;
    // let arrayClose = new Array;

    let arrayOperation = Object.entries(src);
    console.log(arrayOperation);

    arrayOperation.forEach((operation, ix, arrayOperation) => {
        if (operation[0].includes('Buy') && prevPrice(ix, arrayOperation) != 0) {
            fee = percent(arrayOperation[ix][1], percentFee);
            profitParcial = (prevPrice(ix, arrayOperation) - arrayOperation[ix][1]) - fee;
            profit += profitParcial;
            parcialPercent = ((100 - ((arrayOperation[ix][1] / prevPrice(ix, arrayOperation)) * 100))) - percentFee;
            totalPercent += parcialPercent;
            console.log("-----------------------------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Buy (Iniciando long/cerrando short): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Parcial: ${parcialPercent}`);
            console.log(`% Total: ${totalPercent}`);
        } else if (operation[0].includes('Sell') && prevPrice(ix, arrayOperation) != 0) {
            fee = percent(arrayOperation[ix][1], percentFee);
            profitParcial = (arrayOperation[ix][1] - prevPrice(ix, arrayOperation)) - fee;
            profit += profitParcial;
            parcialPercent = (((arrayOperation[ix][1] / prevPrice(ix, arrayOperation)) * 100) - 100) - percentFee;
            totalPercent += parcialPercent;
            console.log("-----------------------------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Sell (Iniciando short/cerrando long): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Parcial: ${parcialPercent}`);
            console.log(`% Total: ${totalPercent}`);
        } else {
            console.log("-----------------------------------------------------------");
            console.log(`ix: ${ix}`);
            console.log(`Fee: ${percentFee}`);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit Total: ${profit}`);
            console.log(`% Total: ${totalPercent}`);
        };
    });

};

module.exports = backTesting;