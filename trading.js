const Binance = require('node-binance-api');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { getDataBackTesting, backTesting } = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');
const binance = require('./exchange');

const trading = async() => {
    let pair = "BTCUSDT";
    let currency = "BTC";
    let fiat = "USDT";
    let timeFrame = "15m";
    let length = 7;
    let arrayClose = [];
    // let close;
    const lot = 13; // valor lote, default = 100usd
    let quantity = 0.0002;
    let flagStart = true; // default: true

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks(pair, timeFrame, (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(parseFloat(ticks[i][4]).toFixed(6)); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
        // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

        let dataBackTesting = wavesBackTesting(arrayClose, length); //<==
        backTesting(dataBackTesting); //<==
    });

    // binance.mgMarketBuy("BTCUSDT", quantity );
    // binance.mgMarketSell("BTCUSDT", quantity);
    // binance.mgRepay("USDT", lot, (error, response) => { //repay usdt
    //     if (error) return console.warn(error);
    //     else console.log(`Success! Transaction ID:`);
    //     // Success! Transaction ID: response.tranId
    // });

    // let quantity = (lot / close).toFixed(6); // calcular valor lote en BTC

    await binance.websockets.candlesticks([pair], timeFrame, (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            close = parseFloat(close).toFixed(6);
            console.log('---------------------------------------');
            console.log(`Last price: ${close}`);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            // let flagOp = 'undefined';
            let flagOp = waves(arrayClose, length); //<== aqui recibe las senales de la estrategia
            console.log(`flagOp: ${flagOp}`);
            console.log(`flagStart: ${flagStart}`);

            const order = (async _ => {
                try {
                    if (flagStart == true && flagOp != undefined) {
                        flagStart = false;
                        if (flagOp == 'buy') {
                            console.log(`1.0) Take borrow, lot: ${fiat} ${lot}`);
                            await binance.mgBorrow(fiat, lot, (error, response) => {
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Borrow Success! lot: ${fiat} ${lot}`);
                                    console.log(`1.1) First long.. lot: ${pair} ${quantity}`);
                                    binance.mgMarketBuy(pair, quantity);
                                };
                            });
                        } else if (flagOp == 'sell') {
                            console.log(`1.0) Take borrow, lot: ${currency} ${quantity}`);
                            await binance.mgBorrow(currency, quantity, (error, response) => {
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Borrow Success! lot: ${currency} ${quantity}`);
                                    console.log(`1.1) First short... ${pair} ${quantity}`);
                                    binance.mgMarketSell(pair, quantity);
                                };
                            });
                        };
                    } else if (flagStart == false && flagOp != undefined) {
                        if (flagOp == 'buy') { // arrastro un short
                            console.log(`2.0) Close short. ${pair} ${quantity}`);
                            await binance.mgMarketBuy(pair, quantity); //cerrar el short, debo btc
                            await binance.mgRepay(currency, quantity, (error, response) => { //repay btc
                                if (error) return console.warn(error);
                                else {
                                    console.log(`2.1) Success Repay! lot: ${currency} ${quantity}`); // Success! Transaction ID: response.tranId
                                    binance.mgBorrow(fiat, lot, (error, response) => { //borrow usdt y compro btc
                                        if (error) return console.warn(error);
                                        else {
                                            console.log(`2.2) Borrow Success! lot: ${fiat} ${lot}`);
                                            console.log(`2.3) Open long.. lot: ${pair} ${quantity}`);
                                            binance.mgMarketBuy(pair, quantity);
                                        };
                                    });
                                };
                            });
                        } else if (flagOp == 'sell') { // arrastro un long
                            console.log(`2.0) Open long. ${pair} ${quantity}`);
                            await binance.mgMarketSell(pair, quantity);
                            await binance.mgRepay(fiat, lot, (error, response) => { //repay usdt
                                if (error) return console.warn(error);
                                else {
                                    console.log(`2.1) Success Repay! lot:${fiat} ${lot}`) // Success! Transaction ID: response.tranId
                                    binance.mgBorrow(currency, quantity, (error, response) => {
                                        if (error) return console.warn(error);
                                        else {
                                            console.log(`2.2) Borrow Success! lot: ${currency} ${quantity}`);
                                            console.log(`2.3) Open short.. lot: ${pair} ${quantity}`);
                                            binance.mgMarketSell(pair, quantity);
                                        };
                                    });
                                };

                            });
                        };
                    };
                } catch (error) {
                    console.error(error);
                };
            })();


        };
    });

};

trading();

// module.exports = trading;