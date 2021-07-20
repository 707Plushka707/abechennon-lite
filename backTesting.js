const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { prevPrice, percent } = require('./utils');
const { waves, wavesBackTesting } = require('./pStrategy/strategyWaves');
const classicRsi = require('./strategy/strategyRsi');


const backTesting = (src) => {
    let profit = 0,
        profitParcial = 0,
        parcialPercent,
        totalProfit = 0,
        totalOperations = 0,
        winners = 0,
        losers = 0,
        profitLoss = 0,
        profitWin = 0,
        buy = 0, // contador buy
        sell = 0, // contador sell
        percentFee = 0.1,
        arrayOperation = Object.entries(src);

    console.log("=====================***BACKTESTING***=====================");

    arrayOperation.forEach((operation, ix, arrayOperation) => {
        let previousPrice = prevPrice(ix, arrayOperation);
        let currentPrice = arrayOperation[ix][1];

        if (operation[0].includes('Buy') && previousPrice != 0) {
            buy += 1;
            totalOperations += 1;
            fee = percent(currentPrice, percentFee);
            profitParcial = (previousPrice - currentPrice) - fee;
            profit += profitParcial;
            parcialPercent = ((100 - ((currentPrice / previousPrice) * 100))) - percentFee;
            totalProfit += parcialPercent;
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
            // console.log(`% Total: ${totalProfit}`);
            // console.log("-----------------------------------------------------------");


        } else if (operation[0].includes('Sell') && previousPrice != 0) {
            sell += 1;
            totalOperations += 1;
            fee = percent(currentPrice, percentFee);
            profitParcial = (currentPrice - previousPrice) - fee;
            profit += profitParcial;
            parcialPercent = (((currentPrice / previousPrice) * 100) - 100) - percentFee;
            totalProfit += parcialPercent;
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
            // console.log(`% Total: ${totalProfit}`);
            // console.log("-----------------------------------------------------------");

        };
    });
    let totalOperation = winners + losers;
    let success = (winners * 100) / totalOperations; // % aciertos
    let profitAverageLoss = profitLoss / losers;
    let profitAveragewin = profitWin / winners;
    console.log(`Total Operations: ${totalOperation} (Counter, Buy: ${buy}| Sell: ${sell})`);
    console.log(`Winners: ${winners}, Losers: ${losers}`);
    console.log(`Success: % ${success}`);
    console.log(`Total Profit: % ${totalProfit}`);
    console.log("=========================================================== \n");
};

module.exports = backTesting;