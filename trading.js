// const Binance = require('node-binance-api');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { getDataBackTesting, backTesting } = require('./backTesting');
const { strategy1, strategy2 } = require('./strategy');
const binance = require('./exchange');
const { waves, wavesBackTesting } = require('./wavesStrategy');

const trading = async() => {
    let length = 7;
    let arrayClose = [];

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(ticks[i][4]); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"

        // let dataBackTesting = getDataBackTesting(arrayClose, length);
        let dataBackTesting = wavesBackTesting(arrayClose, length);
        // let dataBackTesting = strategy1(arrayClose, length); //<==

        backTesting(dataBackTesting); //<==

    });

    const lot = 100; // lote valor = 100usd
    let flagStart = true;
    let flagFirstOp = true;

    await binance.websockets.candlesticks(['BTCUSDT'], "1m", (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            console.log('---------------------------------------');
            console.log('Ultimo precio: ' + close);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            let quantity = (lot * 1.000000) / close; // calcular valor lote en BTC
            // console.log(`quantity ${quantity}`);

            let flagOp = waves(arrayClose, length); // aqui la estrategia a usar
            console.log(`flagOp: ${flagOp}`);

            if (flagStart == true && flagOp == !undefined) {
                flagStart = false;
                console.log("Entrando: (flagStart == true && flagOp == !undefined)");
                const borrowStart = (async _ => {
                    try {
                        // await binance.mgBorrow("USDT", lot + 4, (error, response) => {
                        //     if (error) return console.warn(error);
                        //     else console.log("Borrow Success!");
                        // });
                        console.log(`borrowStart: flagStart: ${flagStart}. flagOp: ${flagOp}`)
                    } catch (error) {
                        console.error(error);
                    };
                })();
                borrowStart();
                if (flagOp == 'buy') {
                    const comprandoStart = (async _ => {
                        try {
                            // await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log(`comprandoStart: flagOp: ${flagOp}. Buy Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    comprandoStart();
                } else if (flagOp == 'sell') {
                    const vendiendoStart = (async _ => {
                        try {
                            // await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log(`vendiendoStart: flagOp: ${flagOp}. Sell Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    vendiendoStart();
                };
            } else if (flagStart == false && flagFirstOp == true) {
                flagFirstOp = false;
                if (flagOp == 'buy') {
                    const comprandoFirstOp = (async _ => {
                        try {
                            // await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log(`comprandoFirstOp: flagOp: ${flagOp}. Buy Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    comprandoFirstOp();
                } else if (flagOp == 'sell') {
                    const vendiendoFirstOp = (async _ => {
                        try {
                            // await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log(`vendiendoFirstOp: flagOp: ${flagOp}. Sell Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    vendiendoFirstOp();
                };
            } else if (flagStart == false && flagFirstOp == false) {
                if (flagOp == 'buy') {
                    const comprandoNormalize = (async _ => {
                        try {
                            // await binance.mgMarketBuy("BTCUSDT", quantity);
                            // await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log(`comprandoNormalize: flagOp: ${flagOp}. Buy Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    comprandoNormalize();
                } else if (flagOp == 'sell') {
                    const vendiendoNormalize = (async _ => {
                        try {
                            // await binance.mgMarketSell("BTCUSDT", quantity);
                            // await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log(`vendiendoNormalize: flagOp: ${flagOp}. Sell Success!`);
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                    vendiendoNormalize();
                };
            };

        };
    });

};

trading();