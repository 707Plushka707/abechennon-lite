const Binance = require('node-binance-api');
// const binance = require('./exchange');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
    // const { getDataBackTesting, backTesting } = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');

const trading = async() => {
    let symbol = "BTCUSDT";
    let currency = "BTC";
    let fiat = "USDT";
    let timeFrame = "15m";
    let length = 7;
    let arrayClose = [];
    // let close;
    const lot = 13.00; // valor lote, default = 100usd
    let quantity = 0.0002;
    let flagStart = true; // default: true

    console.log("***Trader Bot Binance***");
    console.log(`TimeFrame: ${timeFrame} | Markets: ${symbol} | Lote Usdt: ${lot}`);
    // console.log(`fiat ${fiat}, lot ${lot}`);
    // console.log(`symbol ${symbol}, quantity ${quantity}`);
    // console.log(`currency ${currency}, quantity ${quantity}`);

    const binance = await new Binance().options({
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
        // useServerTime: true,
        // recvWindow: 60000, // Set a higher recvWindow to increase response timeout
        // verbose: true, // Add extra output when subscribing to WebSockets, etc
    });

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(parseFloat(ticks[i][4]).toFixed(2)); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
        // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

        // let dataBackTesting = wavesBackTesting(arrayClose, length); //<==
        // backTesting(dataBackTesting); //<==
    });

    // binance.mgMarketBuy("BTCUSDT", quantity);

    // binance.mgMarketSell("BTCUSDT", quantity);

    // const mgRepay = binance.mgRepay(fiat, lot, (error, response) => { //repay usdt
    //     let status;
    //     let attemps = 1;
    //     if (error) {
    //         statuts = "error";
    //         console.log("mgRepay Error..");
    //     } else {
    //         status = "ok"
    //         console.log("mgRepay OK..");
    //     };
    //     while (status == "error") {
    //         attemps++;
    //         setTimeout(mgRepay, 2500);
    //         console.log(`Attemps: ${attemps}`);
    //     };
    // });


    // const mgBorrow = binance.mgBorrow(fiat, lot, (error, response) => { //borrow usdt y compro btc
    //     let status;
    //     let attemps = 1;
    //     if (error) {
    //         statuts = "error";
    //         console.log(`mgBorrow, status: ${statuts}`);
    //     } else {
    //         status = "success"
    //         console.log(`mgBorrow status: ${status}`);
    //     };
    //     while (status == "error") {
    //         attemps++;
    //         setTimeout(mgBorrow, 2500);
    //         console.log(`Attemps: ${attemps}`);
    //     };
    // });


    await binance.websockets.candlesticks([symbol], timeFrame, (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            close = parseFloat(close).toFixed(2);
            // console.log('---------------------------------------');
            // console.log(`Last price: ${close}`);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            // let flagOp = 'undefined';
            let flagOp = waves(arrayClose, length); //<== aqui recibe las senales de la estrategia
            // console.log(`flagOp: ${flagOp}`);
            // console.log(`flagStart: ${flagStart}`);

            const order = (async _ => {
                try {
                    if (flagStart == true && flagOp != undefined) {
                        console.log(`Last price: ${close}`);
                        flagStart = false;
                        if (flagOp == 'buy') {
                            // console.log(`1.0) Take borrow, lot: ${fiat} ${lot}`);
                            const mgBorrowLong = await binance.mgBorrow(fiat, lot, (error, response) => { //borrow usdt y compro btc
                                let status;
                                let attemps = 0;
                                if (error) {
                                    statuts = "error";
                                } else {
                                    status = "success";
                                    console.log(`1.0) Start, mgBorrowLong BORROW Status: ${status}. lot: ${fiat} ${lot}`);
                                    console.log(`1.1) Start, long.. BUY lot: ${symbol} ${quantity}`);
                                    binance.mgMarketBuy(symbol, quantity);
                                };
                                while (status == "error") {
                                    attemps++;
                                    console.log(`1.0) Start, mgBorrowLong BORROW Status: ${status}. Attemps: ${attemps}`);
                                    setInterval(mgBorrowLong, 3000);
                                };
                            });
                            // console.log(`1.1) Start, long.. BUY lot: ${symbol} ${quantity}`);
                            // await binance.mgMarketBuy(symbol, quantity);

                        } else if (flagOp == 'sell') {
                            // console.log(`1.0) Take borrow, lot: ${currency} ${quantity}`);
                            const mgBorrowShort = await binance.mgBorrow(currency, quantity, (error, response) => { //borrow usdt y compro btc
                                let status;
                                let attemps = 0;
                                if (error) {
                                    statuts = "error";
                                } else {
                                    status = "success";
                                    console.log(`1.0) Start, mgBorrowShort BORROW Status: ${status} lot: ${currency} ${quantity}`);
                                    console.log(`1.1) Start, short.. SELL lot: ${symbol} ${quantity}`);
                                    binance.mgMarketSell(symbol, quantity);
                                };
                                while (status == "error") {
                                    attemps++;
                                    console.log(`1.0) Start, mgBorrowShort BORROW Status: ${status}. Attemps: ${attemps}`);
                                    setInterval(mgBorrowShort, 3000);
                                };
                            });
                            // console.log(`1.1) Start, long.. BUY lot: ${symbol} ${quantity}`);
                            // await binance.mgMarketBuy(symbol, quantity);
                        };

                    } else if (flagStart == false && flagOp != undefined) {
                        console.log("--------------------------------------------------")
                        console.log(`Last price: ${close}`);
                        if (flagOp == 'buy') { // arrastro un short
                            console.log(`2.0) Norm, Close Short.. BUY lot: ${symbol} ${quantity}`);
                            await binance.mgMarketBuy(symbol, quantity); //cerrar el short, debo btc

                            const mgRepayCurrency = await binance.mgRepay(currency, quantity, (error, response) => { //repay usdt
                                let status;
                                let attemps = 0;
                                if (error) {
                                    statuts = "error";
                                } else {
                                    status = "success";
                                    console.log(`2.1) Norm, mgRepayCurrency REPAY Status: ${status} lot: ${currency} ${quantity}`);

                                    const mgBorrowLongNorm = binance.mgBorrow(fiat, lot, (error, response) => { //borrow usdt y compro btc
                                        let status;
                                        let attemps = 0;
                                        if (error) {
                                            statuts = "error";
                                        } else {
                                            status = "success";
                                            console.log(`2.2) Norm, mgBorrowLongNorm status: ${status}. lot: ${fiat} ${lot}`);
                                            console.log(`2.3) Norm, Open Long..BUY lot: ${symbol} ${quantity}`);
                                            binance.mgMarketBuy(symbol, quantity);
                                        };
                                        while (status == "error") {
                                            attemps++;
                                            console.log(`2.2) Norm, mgBorrowLongNorm BORROW Status: ${status}. Attemps: ${attemps}`);
                                            setInterval(mgBorrowLongNorm, 3000);
                                        };
                                    });
                                    // console.log(`2.3) Norm, Open Long..BUY lot: ${symbol} ${quantity}`);
                                    // binance.mgMarketBuy(symbol, quantity);
                                };
                                while (status == "error") {
                                    attemps++;
                                    console.log(`2.1) Norm, mgRepayCurrency REPAY Status: ${status}. Attemps: ${attemps}`);
                                    setInterval(mgRepayCurrency, 3000);
                                };
                            });

                        } else if (flagOp == 'sell') { // arrastro un long
                            console.log(`2.0) Norm, Close Long. SELL lot: ${symbol} ${quantity}`);
                            await binance.mgMarketSell(symbol, quantity);

                            const mgRepayFiat = await binance.mgRepay(fiat, lot, (error, response) => { //repay usdt
                                let status;
                                let attemps = 0;
                                if (error) {
                                    statuts = "error";
                                } else {
                                    status = "success";
                                    console.log(`2.1) Norm, mgRepayFiat REPAY Status: ${status} lot: ${fiat} ${lot}`);

                                    const mgBorrowShortNorm = binance.mgBorrow(currency, quantity, (error, response) => { //borrow usdt y compro btc
                                        let status;
                                        let attemps = 0;
                                        if (error) {
                                            statuts = "error";
                                        } else {
                                            status = "success";
                                            console.log(`2.2) Norm, mgBorrowShortNorm status: ${status} lot: ${currency} ${quantity}`);
                                            console.log(`2.3) Norm, Open short.. lot: ${symbol} ${quantity}`);
                                            binance.mgMarketSell(symbol, quantity);
                                        };
                                        while (status == "error") {
                                            attemps++;
                                            console.log(`2.2) Norm, mgBorrowShortNorm BORROW Status: ${status}. Attemps: ${attemps}`);
                                            setInterval(mgBorrowShortNorm, 3000);
                                        };
                                    });
                                    // console.log(`2.3) Norm, Open short.. lot: ${symbol} ${quantity}`);
                                    // binance.mgMarketSell(symbol, quantity);
                                };
                                while (status == "error") {
                                    attemps++;
                                    console.log(`2.1) Norm, mgRepayFiat REPAY Status: ${status}. Attemps: ${attemps}`);
                                    setInterval(mgRepayFiat, 3000);
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