const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const Binance = require('node-binance-api');
const { prevPrice, percent } = require('./indicator/utils');
const { waves, wavesBackTesting } = require('./strategy/strategyWaves');

//=================== Back-Testing ===================

const backTesting = (src) => {
    let profit = 0;
    let profitParcial = 0;
    let parcialPercent;
    let totalPercent = 0;
    let percentFee = 0.1;
    let totalOperations = 0;
    let winners = 0;
    let losers = 0;
    let result;
    let profitLoss = 0;
    let profitWin = 0;

    let arrayOperation = Object.entries(src);
    // console.log(arrayOperation);

    console.log("=====================***BACKTESTING***=====================");

    arrayOperation.forEach((operation, ix, arrayOperation) => {
        let previousPrice = prevPrice(ix, arrayOperation);
        let currentPrice = arrayOperation[ix][1];

        if (operation[0].includes('Buy') && previousPrice != 0) {
            totalOperations += 1;
            fee = percent(currentPrice, percentFee);
            profitParcial = (previousPrice - currentPrice) - fee;
            profit += profitParcial;
            parcialPercent = ((100 - ((currentPrice / previousPrice) * 100))) - percentFee;
            totalPercent += parcialPercent;
            if (Math.sign(profitParcial) == 1) {
                winners += 1;
                result = 'WINNER';
                profitWin += profitParcial;
            } else if (Math.sign(profitParcial) == -1) {
                losers += 1;
                result = 'LOSER';
                profitLoss += profitParcial;
            };

            // console.log(`ix: ${ix} || ${result} || Winners: ${winners}, Losers: ${losers}`);
            // console.log("Buy (Cerrando short/Iniciando long): " + arrayOperation[ix][0]);
            // console.log(`Winners: ${winners}, Losers: ${losers}`);
            // console.log(`Venta: ${previousPrice}, Compra: ${currentPrice}. Fee: ${fee}`);
            // console.log(`Profit parcial: ${profitParcial}`);
            // console.log(`Profit Total: ${profit}`);
            // console.log(`% Parcial: ${parcialPercent}`);
            // console.log(`% Total: ${totalPercent}`);
            // console.log("-----------------------------------------------------------");


        } else if (operation[0].includes('Sell') && previousPrice != 0) {
            totalOperations += 1;
            fee = percent(currentPrice, percentFee);
            profitParcial = (currentPrice - previousPrice) - fee;
            profit += profitParcial;
            parcialPercent = (((currentPrice / previousPrice) * 100) - 100) - percentFee;
            totalPercent += parcialPercent;
            if (Math.sign(profitParcial) == 1) {
                winners += 1;
                result = 'WINNER';
                profitWin += profitParcial;
            } else if (Math.sign(profitParcial) == -1) {
                losers += 1;
                result = 'LOSER';
                profitLoss += profitParcial;
            };

            // console.log(`ix: ${ix} || ${result} || Winners: ${winners}, Losers: ${losers}`);
            // console.log("Sell (Cerrando long/Iniciando short): " + arrayOperation[ix][0]);
            // console.log(`Compra: ${previousPrice}, Venta: ${currentPrice}. Fee: ${fee}`);
            // console.log(`Profit parcial: ${profitParcial}`);
            // console.log(`Profit Total: ${profit}`);
            // console.log(`% Parcial: ${parcialPercent}`);
            // console.log(`% Total: ${totalPercent}`);
            // console.log("-----------------------------------------------------------");

        };
    });
    let totalOperation = winners + losers;
    let success = (winners * 100) / totalOperations; // % aciertos
    let profitAverageLoss = profitLoss / losers;
    let profitAveragewin = profitWin / winners;
    let profitFactorSimple = profitWin / profitLoss; // corregir
    let profitFactorComplex = (profitAveragewin * success) / (1 - success) * profitAverageLoss; // corregir
    // riesgo-beneficio > 1.5
    console.log(`Total Operations: ${totalOperation}`);
    console.log(`Winners: ${winners}, Losers: ${losers}`);
    console.log(`Success: % ${success}`);
    // console.log(`Profit Factor Simple: ${profitFactorSimple} || Profit Factor complex: ${profitFactorComplex}`);
    console.log(`Total Profit: % ${totalPercent}`);
    console.log("=========================================================== \n");
};

module.exports = backTesting;