const util = require('util') // util.inspect expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { prevPrice, percent } = require('./utils');
const { waves, wavesBackTesting } = require('./pStrategy/strategyWaves');
const classicRsi = require('./strategy/strategyRsi');


// [
//     [ 'Buy_2-497', 0.6298 ],
//     [ 'Sell_39-460', 0.6291 ],
//     [ 'Buy_78-421', 0.6305 ],
//     [ 'Sell_82-417', 0.6348 ],
//     [ 'Buy_112-387', 0.6365 ],
//     [ 'Sell_135-364', 0.6407 ],
//     [ 'Buy_172-327', 0.6413 ],
//     [ 'Sell_192-307', 0.646 ],
//     [ 'Buy_218-281', 0.6449 ],
//     [ 'Sell_228-271', 0.6442 ],
//     [ 'Buy_232-267', 0.6463 ],
//     [ 'Sell_233-266', 0.6476 ],
//     [ 'Buy_260-239', 0.6446 ],
//     [ 'Sell_305-194', 0.642 ],
//     [ 'Buy_327-172', 0.6392 ],
//     [ 'Sell_328-171', 0.6408 ],
//     [ 'Buy_358-141', 0.6462 ],
//     [ 'Sell_415-84', 0.6346 ],
//     [ 'Buy_422-77', 0.6333 ],
//     [ 'Sell_431-68', 0.6337 ],
//     [ 'Buy_437-62', 0.6338 ],
//     [ 'Sell_438-61', 0.6326 ],
//     [ 'Buy_440-59', 0.6309 ],
//     [ 'Sell_465-34', 0.6322 ],
//     [ 'Buy_467-32', 0.6307 ]
//   ]

let resDataBackTesting = [];

const backTesting = src => {
    return new Promise((resolve, reject) => {
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
            symbol = Object.keys(src)[0],
            values = Object.values(src),
            arrayOperation = Object.entries(values[0]);

        // console.log("=====================***BACKTESTING***=====================");
        // console.log(`=======================***${symbol}***=======================`);

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
        // console.log("\n===========================================================");
        // console.log(`Symbol: ${symbol}`);
        // console.log(`Total Operations: ${totalOperation} (Counter, Buy: ${buy}| Sell: ${sell})`);
        // console.log(`Winners: ${winners}, Losers: ${losers}`);
        // console.log(`Success: % ${success}`);
        // console.log(`Total Profit: % ${totalProfit}`);

        dataBackTesting = {
            symbol: symbol,
            totalOperation: totalOperation,
            winners: winners,
            losers: losers,
            successPercent: success,
            totalProfitPercent: totalProfit,
        };

        resDataBackTesting.push(dataBackTesting);

        resDataBackTesting.sort((a, b) => {
            return (b.totalProfitPercent - a.totalProfitPercent);
        });

        resolve(resDataBackTesting);
    });
};

module.exports = { backTesting, resDataBackTesting };