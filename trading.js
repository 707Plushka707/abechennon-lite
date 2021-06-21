const { response } = require('express');
const Binance = require('node-binance-api');
const binance = require('./exchange');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const backTesting = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');


// const binance = new Binance().options({
//     APIKEY: '3QvmVLVVANbQz8GuTiltOKHHuB1Z4sk388tU51Ij6KoHoGcljjCX8ITClEp1OwJt',
//     APISECRET: 'UiFyytLnkBhbaN8pIY2VlPWmWFUamkKsLps8LUmExmJ1VakxJVRJvo2VJoF4MIRH',
//     // APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ', // Produccion
//     // APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW', // Produccion
// });


const historyCloses = (markets, timeFrame, binance) => {
    try {
        return async() => {
            let stack = [];
            for await (let symbol of markets) {
                let ticks = await binance.candlesticks(symbol, timeFrame);
                let arrayClose = ticks.map((curr, idx, tick) => {
                    return parseFloat(tick[idx][4]).toFixed(2);
                });
                arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
                stack = [...stack, [symbol, arrayClose]];
            };
            return stack;
        };
    } catch (error) {
        console.error(error);
    };
};

let srcMarkets = [];
const updatedArrayMarkets = async(arrayMarkets, symbol, close) => {
    try {
        arrayMarkets.forEach((curr, idx, src) => {
            let [symbolArrayMarkets, arrayCloses] = src[idx];
            if (symbolArrayMarkets == symbol) {
                arrayCloses.shift();
                arrayCloses.push(close);
                // srcMarkets.push([symbolArrayMarkets, arrayCloses]);
                srcMarkets = arrayCloses;
            };
        });
        return srcMarkets;
    } catch (error) {
        console.error(error);
    };
};

let flagStartMarkets = {};
let buildFlagStartMarkets = async(markets) => {
    try {
        markets.forEach((curr, idx, market) => {
            flagStartMarkets[`${curr}`] = true;
        });
        return flagStartMarkets;
    } catch (error) {
        console.error(error);
    };
};

let quantityCurrency = {};
let calcQuantity = async(symbol, close, lot) => {
    try {
        quantity = ((lot - 1) / close); // quantity = ((lot - 3) / close);
        let pEntera = Math.floor(quantity);
        let resQuantityNro;
        if (pEntera > 0) {
            resQuantityNro = parseFloat(quantity.toFixed(2));
        } else {
            let flagFloat = false;
            let flagZero = true;
            let flagFirstDig = false;
            let flagSecondDig = false;
            let quantityArr = quantity.toString().split('');
            let resQuantityArr = quantityArr.filter((curr, idx, src) => {
                if (flagFloat == false && curr != ".") {
                    return curr;
                } else if (flagZero == true && curr == ".") {
                    flagFloat = true;
                    flagZero = false;
                    return curr;
                } else if (flagZero == false && flagFirstDig == false) {
                    if (curr > 0) {
                        flagFirstDig = true;
                    };
                    return curr;
                } else if (flagFirstDig == true && flagSecondDig == false) {
                    flagSecondDig = true;
                    return curr;
                };
            });
            let resQuantityStr = resQuantityArr.join('');
            resQuantityNro = parseFloat(resQuantityStr);
        };
        quantityCurrency[`${symbol}`] = resQuantityNro;
        // let response = resQuantityNro;
        // return resQuantityNro;
    } catch (error) {
        console.error(error);
    };
};

let testCalcQuantity = () => {
    let v = 0.00;
    for (let index = 0; index < 10000; index++) {
        v += 0.01;
        calcQuantity("test", v, 22);
    };
};
// testCalcQuantity();

// let currencies = { "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA", "BNBUSDT": "BNB", "DOGEUSDT": "DOGE", "ETCUSDT": "ETC", "BCHUSDT": "BCH", "LINKUSDT": "LINK", "VETUSDT": "VET", "SOLUSDT": "SOL", "TRXUSDT": "TRX", "IOTAUSDT": "IOTA" };
let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" };
let buildNameCurrency = (markets) => {
    markets.forEach((curr, idx, market) => {
        // flagStartMarkets[`${curr}`] = true;
        // console.log(curr);
        // console.log(market[idx]);
    });
    return nameCurrencies;
};


// *Si el resultado se encuentra en el cuerpo de la funcion, simplemente se recurre a return y se muestra con .then o async/await
// *Si el resultado se encuentra en el callback de la funcion, entonces el return no funcionara por que retornara al callback y
// no a la funcion principal, se soluciona pasando un callback a la funcion principal con el resultado requerido. O usando 
// promisify, la cual requiere importar el modulo.


// guarda todos los detalles del account dentro del objeto detailMarginAccount.
let detailMarginAccount = {};
let detailAccount = async _ => {
    try {
        console.log(`- Loading detail margin account...`);
        for (let currency in currencies) {
            await binance.mgAccount((error, response) => {
                if (error) return console.warn(error);
                let account = response.userAssets.find((curr, idx, src) => {
                    if (currencies[currency] == curr.asset) {
                        return curr;
                    };
                });
                detailMarginAccount[currency] = account;
            });
        };
    } catch (error) {
        console.error(error);
    };
};


// modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
// freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt.
// borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt.
let positionCalculator = async fiat => {
    try {
        console.log(`- Loading current margin positions...`);
        for (let currency in detailMarginAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat) {
                let ticker = await binance.prices(currency);
                let positionValue = detailMarginAccount[currency]["free"] * ticker[currency];
                detailMarginAccount[currency].freeUsdt = positionValue;

                let borrowedValue = detailMarginAccount[currency]["borrowed"] * ticker[currency];
                detailMarginAccount[currency].borrowedUsdt = borrowedValue;
            };
        };
    } catch (error) {
        console.log(error);
    };
};


let flagSideOrders = async(fiat, symbol) => { // detailMarginAccount[symbol]["currentSideMargin"] == null
    try {
        // console.log(detailMarginAccount[symbol]["asset"]); // moneda
        if (detailMarginAccount[symbol]["asset"] != fiat && detailMarginAccount[symbol]["asset"] != "BNB") {

            if (detailMarginAccount[fiat]["borrowed"] > 0 && detailMarginAccount[symbol]["freeUsdt"] > 10.00 && detailMarginAccount[symbol]["borrowedUsdt"] < 10.00) { // tengo posicion largo
                detailMarginAccount[symbol].currentSideMargin = "long";
            } else if (detailMarginAccount[symbol]["freeUsdt"] < 10.00 && detailMarginAccount[symbol]["borrowedUsdt"] > 0) { // tengo posicion corto
                detailMarginAccount[symbol].currentSideMargin = "short";
            } else if (detailMarginAccount[symbol]["freeUsdt"] > 10.00 && detailMarginAccount[symbol]["borrowedUsdt"] > 0) { // fail, me prestaron crtpto, pero no vendi / no alcanzo a ser posicion corto
                // shortFail
                await zeroPosition(fiat);
                detailMarginAccount[symbol].currentSideMargin = null;
            } else {
                detailMarginAccount[symbol].currentSideMargin = null;
            };
        };
    } catch (error) {
        console.log(error);
    };
};

let flagSide = async(fiat) => {
    try {
        for (let currency in detailMarginAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {

                if (detailMarginAccount[fiat]["borrowed"] > 0 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00) { // tengo posicion largo
                    detailMarginAccount[currency].currentSideMargin = "long";
                } else if (detailMarginAccount[currency]["freeUsdt"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 0) { // tengo posicion corto
                    detailMarginAccount[currency].currentSideMargin = "short";
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 0) {
                    // shortFail
                    await zeroPosition(fiat);
                    // await zeroPositionColector(fiat);
                    detailMarginAccount[currency].currentSideMargin = null;
                } else {
                    detailMarginAccount[currency].currentSideMargin = null;
                };
            };
        };
    } catch (error) {
        console.log(error);
    };
};

let zeroPosition = async fiat => {
    try {
        console.log(`- Close all position: true !`)
            // console.log(detailMarginAccount); // recordatorio nav. detailMarginAccount.BTCUSDT.freeUsdt
        for (let currency in detailMarginAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // console.log(detailMarginAccount[currency]["freeUsdt"]);

                // arrastro posicion: largo || debo usdt
                if (detailMarginAccount[fiat]["borrowed"] > 0 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00) {

                    await binance.mgMarketSell(currency, detailMarginAccount[currency]["free"], async(error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(`1) zeroPosition: Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                            let minorQty = (response.cummulativeQuoteQty <= detailMarginAccount[fiat]["borrowed"]) ? response.cummulativeQuoteQty : detailMarginAccount[fiat]["borrowed"];
                            await binance.mgRepay(fiat, minorQty, (error, response) => { //repay usdt
                                let status;
                                let attemps = 0;
                                if (error) {
                                    attemps++;
                                    status = "ERROR";
                                    console.log(`Repay ${fiat}: ${minorQty}, status: ${status}`);
                                    console.error(error.body);
                                    console.log(`Attemps: ${attemps}`);
                                    // setTimeout(mgRepayFiat, 1000);
                                } else {
                                    status = "SUCCESS"
                                    console.log(`1) Repay ${fiat}: ${minorQty}, status: ${status}`);
                                };
                            });
                        };
                    });

                    // shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 0) {

                    let minorQty = (detailMarginAccount[currency]["freeUsdt"] <= detailMarginAccount[currency]["borrowedUsdt"]) ? detailMarginAccount[currency]["free"] : detailMarginAccount[currency]["borrowed"];
                    await binance.mgRepay(currencies[currency], minorQty, (error, response) => { //repay crypto
                        let status;
                        let attemps = 0;
                        if (error) {
                            attemps++;
                            status = "ERROR";
                            console.log(`Repay ${currencies[currency]}: ${minorQty}, status: ${status}`);
                            console.error(error.body);
                            console.log(`Attemps: ${attemps}`);
                            // setTimeout(mgRepayCrypto, 1000);
                        } else {
                            status = "SUCCESS"
                            console.log(`1) zeroPosition: Repay ${currencies[currency]}: ${minorQty}, status: ${status}`);
                        };
                    });

                    // arrastro posicion: corto || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 0) {

                    await binance.mgMarketBuy(currency, detailMarginAccount[currency]["borrowed"], async(error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(`1) zeroPosition: Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                            await binance.mgRepay(currencies[currency], detailMarginAccount[currency]["borrowed"], (error, response) => { //repay crypto
                                let status;
                                let attemps = 0;
                                if (error) {
                                    attemps++;
                                    status = "ERROR";
                                    console.log(`Repay ${currencies[currency]}: ${detailMarginAccount[currency]["borrowed"]}, status: ${status}`);
                                    console.error(error.body);
                                    console.log(`Attemps: ${attemps}`);
                                    // setTimeout(mgRepayCrypto, 1000);
                                } else {
                                    status = "SUCCESS"
                                    console.log(`1) zeroPosition: Repay ${currencies[currency]}: ${detailMarginAccount[currency]["borrowed"]}, status: ${status}`);
                                };
                            });
                        };
                    });
                };
            };
        };
    } catch (error) {
        console.log(error);
    };
};

let zeroPositionColector = async fiat => {
    try {
        // no fue largo || me prestaron usdt, pero no alcance a comprar
        if (detailMarginAccount[fiat]["borrowed"] > 0) {
            await binance.mgRepay(fiat, detailMarginAccount[fiat]["free"], (error, response) => { //repay usdt
                let status;
                let attemps = 0;
                if (error) {
                    attemps++;
                    status = "ERROR";
                    console.log(`2) zeroPositionColector: Repay ${fiat}: ${detailMarginAccount[fiat]["free"]}, status: ${status}`);
                    console.error(error.body);
                    console.log(`Attemps: ${attemps}`);
                    // setTimeout(mgRepayFiat, 1000);
                } else {
                    status = "SUCCESS";
                    console.log(`2) zeroPositionColector: Repay, Status: ${status} lot: ${fiat} ${detailMarginAccount[fiat]["borrowed"]}`);
                };
            });
        };
    } catch (error) {
        console.log(error);
    };
};


let orders = async(flagOp, fiat, lot, symbol, close) => {
    try {
        if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
            // flagStartMarkets[symbol] = false;
            // await detailAccount(currencies[symbol], binance);
            await calcQuantity(symbol, close, lot);
            // currency = currencies[symbol];
            // quantity = quantityCurrency[symbol];
            let status;
            let operation = 0;
            if (flagOp == 'buy') { // 1er operacion: prestamo usdt y long
                await binance.mgBorrow(fiat, lot, async(error, response) => { //borrow usdt y compro btc
                    if (error) {
                        status = "ERROR";
                        console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                        console.error(error.body);
                        // setTimeout(mgBorrowLong, 1000);
                    } else {
                        operation++;
                        status = "SUCCESS";
                        console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                        console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                        detailMarginAccount[fiat]["borrowed"] = +lot;
                        detailMarginAccount[fiat]["free"] = +lot;
                        await binance.mgMarketBuy(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(`1.1) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                                detailMarginAccount[symbol]["currentSideMargin"] = "long";
                                detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                                detailMarginAccount[fiat]["free"] = -lot;
                                console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                            };
                        });
                    };
                });
            } else if (flagOp == 'sell') { // 1er operacion: prestamo crypto y short
                await binance.mgBorrow(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //borrow usdt y compro btc
                    if (error) {
                        status = "ERROR";
                        console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                        console.error(error.body);
                        // setTimeout(mgBorrowShort, 1000);
                    } else {
                        operation++;
                        status = "SUCCESS";
                        console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                        console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                        detailMarginAccount[symbol]["borrowed"] = +quantityCurrency[symbol];
                        detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                        // detailMarginAccount[fiat]["free"] = -lot; // no estoy seguro
                        await binance.mgMarketSell(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(`1.1) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                                detailMarginAccount[symbol]["currentSideMargin"] = "short";
                                detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                                detailMarginAccount[fiat]["free"] = +lot;
                                console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                            };
                        });
                    };
                });
            };
        } else if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {
            // arrastro un short
            if (flagOp == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") {
                await binance.mgMarketBuy(symbol, quantityCurrency[symbol], async(error, response) => {
                    if (error) {
                        console.log(error);
                    } else {
                        operation++;
                        console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                        console.log(`2.0) CLOSE SHORT, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                        detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                        detailMarginAccount[fiat]["free"] = -lot;
                        //cerrar el short, debo crypto
                        await binance.mgRepay(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //repay usdt
                            if (error) {
                                statuts = "ERROR";
                                console.log(`Repay ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                                console.log(error.body);
                                // setTimeout(mgRepayCurrency, 1000);
                            } else {
                                status = "SUCCESS";
                                console.log(`2.1) REPAY, Status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                                detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                                detailMarginAccount[symbol]["borrowed"] = -quantityCurrency[symbol];

                                await calcQuantity(symbol, close, lot);
                                console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                                await binance.mgBorrow(fiat, lot, async(error, response) => { //borrow usdt y compro btc
                                    if (error) {
                                        statuts = "ERROR";
                                        console.log(`BORROW ${fiat}: ${lot}, status: ${status}`);
                                        console.log(error.body);
                                        // setTimeout(mgBorrowLongNorm, 1000);
                                    } else {
                                        status = "SUCCESS";
                                        console.log(`2.2) BORROW, status: ${status}. lot: ${fiat} ${lot}`);
                                        detailMarginAccount[fiat]["borrowed"] = +lot;
                                        detailMarginAccount[fiat]["free"] = +lot;
                                        await binance.mgMarketBuy(symbol, quantityCurrency[symbol], async(error, response) => {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log(`2.3) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                                                detailMarginAccount[symbol]["currentSideMargin"] = "long";
                                                detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                                                detailMarginAccount[fiat]["free"] = -lot;
                                                console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                                            };
                                        });
                                    };
                                });
                            };
                        });
                    };
                });

                // arrastro un long
            } else if (flagOp == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") {
                await binance.mgMarketSell(symbol, quantityCurrency[symbol], async(error, response) => {
                    if (error) {
                        console.log(error);
                    } else {
                        operation++;
                        console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                        console.log(`2.0) CLOSE LONG, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                        detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                        detailMarginAccount[fiat]["free"] = +lot;
                        //cerrar el long, debo usdt
                        await binance.mgRepay(fiat, lot, async(error, response) => { //repay usdt
                            if (error) {
                                statuts = "ERROR";
                                console.log(`Repay ${fiat}: ${lot}, status: ${status}`);
                                console.log(error.body);
                                // setTimeout(mgRepayFiat, 1000);
                            } else {
                                status = "SUCCESS";
                                console.log(`2.1) REPAY, Status: ${status} lot: ${fiat} ${lot}`);
                                detailMarginAccount[fiat]["free"] = -quantityCurrency[symbol];
                                detailMarginAccount[fiat]["borrowed"] = -quantityCurrency[symbol];

                                await calcQuantity(symbol, close, lot);
                                console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                                await binance.mgBorrow(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //borrow usdt y compro btc
                                    if (error) {
                                        statuts = "ERROR";
                                        console.log(`BORROW ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                                        console.log(error.body);
                                        // setTimeout(mgBorrowShortNorm, 1000);
                                    } else {
                                        status = "SUCCESS";
                                        console.log(`2.2) Borrow status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                                        detailMarginAccount[symbol]["borrowed"] = +lot;
                                        detailMarginAccount[symbol]["free"] = +lot;
                                        await binance.mgMarketSell(symbol, quantityCurrency[symbol], async(error, response) => {
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log(`2.3) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                                                detailMarginAccount[symbol]["currentSideMargin"] = "short";
                                                detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                                                detailMarginAccount[fiat]["free"] = +lot;
                                                console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                                            };
                                        });
                                    };
                                });
                            };
                        });
                    };
                });
            };
        };
    } catch (error) {
        console.log(error);
    };
};

//-------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------//
(async _ => {
    try {
        // let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "DOGEUSDT", "ETCUSDT", "BCHUSDT", "LINKUSDT", "VETUSDT", "SOLUSDT", "TRXUSDT", "IOTAUSDT"];
        // const markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"];
        const markets = ["ETHUSDT"];
        const timeFrame = "1m";
        const fiat = "USDT";
        const lot = 25.00; // valor lote, default = 100usd
        const length = 7;

        console.log("***Condor Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot}  \n`);
        console.log(`Markets: ${markets} \n`);

        // let [, arrayclose] = arrayMarkets[0];
        // console.log(util.inspect(arrayclose, { maxArrayLength: null }));
        // let dataBackTesting = wavesBackTesting(arrayclose, length); //<==
        // backTesting(dataBackTesting); //<==  

        await detailAccount();

        let historyMarketsCloses = historyCloses(markets, timeFrame, binance);

        let arrayMarkets = await historyMarketsCloses().then(value => {
            console.log(`- Loading candlesticks history...`);
            return value;
        });

        // await buildFlagStartMarkets(markets); true// contruye el flagStartMarkets // deprecated

        await positionCalculator(fiat); // calcula freeUsdt/borrowedUsdt y lo agrega al detailMarginAccount

        console.log(`- Requirements loaded !!`);

        let closeAllPosition = false; // default false
        if (closeAllPosition == true) {
            await zeroPosition(fiat);
            await zeroPositionColector(fiat);
        };

        await flagSide(fiat); // calcula si es long/short/null y lo agrega al detailMarginAccount

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        // console.log(detailMarginAccount[fiat]["borrowed"]);
        // console.log(detailMarginAccount); // recordatorio nav detailMarginAccount.BTCUSDT.freeUsdt

        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {
                close = parseFloat(close).toFixed(2);

                // await flagSideOrders(fiat, symbol); // calcula si es long/short/null y lo agrega al detailMarginAccount

                let updatedMarkets = await updatedArrayMarkets(arrayMarkets, symbol, close);

                let flagOp = await waves(updatedMarkets, length); //<== aqui recibe las senales de la estrategia
                // let flagOp = 'buy';
                // let flagOp = 'undefined';

                // flagStart = flagStartMarkets[symbol]; // default: true //ahora no es necesario

                // },
                // ETHUSDT: {
                //   asset: 'ETH',
                //   free: '0.0093',
                //   locked: '0',
                //   borrowed: '0',
                //   interest: '0',
                //   netAsset: '0.0093',
                //   freeUsdt: 23.985443999999998,
                //   borrowedUsdt: 0,
                //   currentSideMargin: 'long'
                // },

                // console.log(detailMarginAccount[symbol]);

                // await orders(flagOp, fiat, lot, symbol, close);

                // (async _ => {
                //     try {
                //         if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
                //             // flagStartMarkets[symbol] = false;
                //             // await detailAccount(currencies[symbol], binance);
                //             await calcQuantity(symbol, close, lot);
                //             // currency = currencies[symbol];
                //             // quantity = quantityCurrency[symbol];
                //             let status;

                //             if (flagOp == 'buy') { // 1er operacion: prestamo usdt y long
                //                 await binance.mgBorrow(fiat, lot, async(error, response) => { //borrow usdt y compro btc
                //                     if (error) {
                //                         status = "ERROR";
                //                         console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                //                         console.error(error.body);
                //                         // setTimeout(mgBorrowLong, 1000);
                //                     } else {
                //                         operation++;
                //                         status = "SUCCESS";
                //                         console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                //                         console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                //                         detailMarginAccount[fiat]["borrowed"] = +lot;
                //                         detailMarginAccount[fiat]["free"] = +lot;
                //                         await binance.mgMarketBuy(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                //                             if (error) {
                //                                 console.log(error);
                //                             } else {
                //                                 console.log(`1.1) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                                 detailMarginAccount[symbol]["currentSideMargin"] = "long";
                //                                 detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                                 detailMarginAccount[fiat]["free"] = -lot;
                //                                 console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                //                             };
                //                         });
                //                     };

                //                     // try {
                //                     //     operation++;
                //                     //     status = "SUCCESS";
                //                     //     console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                //                     //     console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                //                     //     detailMarginAccount[fiat]["borrowed"] = +lot;
                //                     //     detailMarginAccount[fiat]["free"] = +lot;
                //                     //     await binance.mgMarketBuy(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                //                     //         console.log(`1.1) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     //         detailMarginAccount[symbol]["currentSideMargin"] = "long";
                //                     //         detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                     //         detailMarginAccount[fiat]["free"] = -lot;
                //                     //         console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                //                     //     });
                //                     // } catch (error) {
                //                     //     status = "ERROR";
                //                     //     console.log(`1.0) BORROW, Status: ${status}. lot: ${fiat} ${lot}`);
                //                     //     console.error(error.body);
                //                     //     // setTimeout(mgBorrowLong, 1000);
                //                     // };

                //                 });
                //             } else if (flagOp == 'sell') { // 1er operacion: prestamo crypto y short
                //                 await binance.mgBorrow(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //borrow usdt y compro btc
                //                     if (error) {
                //                         status = "ERROR";
                //                         console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                         console.error(error.body);
                //                         // setTimeout(mgBorrowShort, 1000);
                //                     } else {
                //                         operation++;
                //                         status = "SUCCESS";
                //                         console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                //                         console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                         detailMarginAccount[symbol]["borrowed"] = +quantityCurrency[symbol];
                //                         detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                         // detailMarginAccount[fiat]["free"] = -lot; // no estoy seguro
                //                         await binance.mgMarketSell(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                //                             if (error) {
                //                                 console.log(error);
                //                             } else {
                //                                 console.log(`1.1) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                                 detailMarginAccount[symbol]["currentSideMargin"] = "short";
                //                                 detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                                 detailMarginAccount[fiat]["free"] = +lot;
                //                                 console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                //                             };
                //                         });
                //                     };

                //                     // try {
                //                     //     operation++;
                //                     //     status = "SUCCESS";
                //                     //     console.log(`----------------------------START Init ${symbol}, Op: ${operation}----------------------------`);
                //                     //     console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                     //     detailMarginAccount[symbol]["borrowed"] = +quantityCurrency[symbol];
                //                     //     detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                     //     // detailMarginAccount[fiat]["free"] = -lot; // no estoy seguro
                //                     //     await binance.mgMarketSell(symbol, quantityCurrency[symbol], (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
                //                     //         console.log(`1.1) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     //         detailMarginAccount[symbol]["currentSideMargin"] = "short";
                //                     //         detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                     //         detailMarginAccount[fiat]["free"] = +lot;
                //                     //         console.log(`----------------------------END Init Operation: ${operation}----------------------------\n`);
                //                     //     });
                //                     // } catch (error) {
                //                     //     status = "ERROR";
                //                     //     console.log(`1.0) BORROW, Status: ${status}. lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                     //     console.error(error.body);
                //                     //     // setTimeout(mgBorrowShort, 1000);
                //                     // };
                //                 });
                //             };
                //         } else if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {
                //             // arrastro un short
                //             if (flagOp == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") {
                //                 await binance.mgMarketBuy(symbol, quantityCurrency[symbol], async(error, response) => {
                //                     if (error) {
                //                         console.log(error);
                //                     } else {
                //                         operation++;
                //                         console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                //                         console.log(`2.0) CLOSE SHORT, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                         detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                         detailMarginAccount[fiat]["free"] = -lot;
                //                         //cerrar el short, debo crypto
                //                         await binance.mgRepay(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //repay usdt
                //                             if (error) {
                //                                 statuts = "ERROR";
                //                                 console.log(`Repay ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                //                                 console.log(error.body);
                //                                 // setTimeout(mgRepayCurrency, 1000);
                //                             } else {
                //                                 status = "SUCCESS";
                //                                 console.log(`2.1) REPAY, Status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                                 detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                                 detailMarginAccount[symbol]["borrowed"] = -quantityCurrency[symbol];

                //                                 await calcQuantity(symbol, close, lot);
                //                                 console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                //                                 await binance.mgBorrow(fiat, lot, async(error, response) => { //borrow usdt y compro btc
                //                                     if (error) {
                //                                         statuts = "ERROR";
                //                                         console.log(`BORROW ${fiat}: ${lot}, status: ${status}`);
                //                                         console.log(error.body);
                //                                         // setTimeout(mgBorrowLongNorm, 1000);
                //                                     } else {
                //                                         status = "SUCCESS";
                //                                         console.log(`2.2) BORROW, status: ${status}. lot: ${fiat} ${lot}`);
                //                                         detailMarginAccount[fiat]["borrowed"] = +lot;
                //                                         detailMarginAccount[fiat]["free"] = +lot;
                //                                         await binance.mgMarketBuy(symbol, quantityCurrency[symbol], async(error, response) => {
                //                                             if (error) {
                //                                                 console.log(error);
                //                                             } else {
                //                                                 console.log(`2.3) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                                                 detailMarginAccount[symbol]["currentSideMargin"] = "long";
                //                                                 detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                                                 detailMarginAccount[fiat]["free"] = -lot;
                //                                                 console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                //                                             };
                //                                         });
                //                                     };
                //                                 });
                //                             };
                //                         });
                //                     };


                //                     // operation++;
                //                     // console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                //                     // console.log(`2.0) CLOSE SHORT, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     // detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                     // detailMarginAccount[fiat]["free"] = -lot;
                //                     // //cerrar el short, debo crypto
                //                     // await binance.mgRepay(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //repay usdt
                //                     //     if (error) {
                //                     //         statuts = "ERROR";
                //                     //         console.log(`Repay ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                //                     //         console.log(error.body);
                //                     //         // setTimeout(mgRepayCurrency, 1000);
                //                     //     } else {
                //                     //         status = "SUCCESS";
                //                     //         console.log(`2.1) REPAY, Status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                     //         detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                     //         detailMarginAccount[symbol]["borrowed"] = -quantityCurrency[symbol];

                //                     //         await calcQuantity(symbol, close, lot);
                //                     //         console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                //                     //         await binance.mgBorrow(fiat, lot, async(error, response) => { //borrow usdt y compro btc
                //                     //             if (error) {
                //                     //                 statuts = "ERROR";
                //                     //                 console.log(`BORROW ${fiat}: ${lot}, status: ${status}`);
                //                     //                 console.log(error.body);
                //                     //                 // setTimeout(mgBorrowLongNorm, 1000);
                //                     //             } else {
                //                     //                 status = "SUCCESS";
                //                     //                 console.log(`2.2) BORROW, status: ${status}. lot: ${fiat} ${lot}`);
                //                     //                 detailMarginAccount[fiat]["borrowed"] = +lot;
                //                     //                 detailMarginAccount[fiat]["free"] = +lot;
                //                     //                 await binance.mgMarketBuy(symbol, quantityCurrency[symbol], async(error, response) => {
                //                     //                     console.log(`2.3) OPEN LONG, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     //                     detailMarginAccount[symbol]["currentSideMargin"] = "long";
                //                     //                     detailMarginAccount[symbol]["free"] = +quantityCurrency[symbol];
                //                     //                     detailMarginAccount[fiat]["free"] = -lot;
                //                     //                     console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                //                     //                 });
                //                     //             };
                //                     //         });
                //                     //     };
                //                     // });

                //                 });

                //                 // arrastro un long
                //             } else if (flagOp == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") {
                //                 await binance.mgMarketSell(symbol, quantityCurrency[symbol], async(error, response) => {
                //                     if (error) {
                //                         console.log(error);
                //                     } else {
                //                         operation++;
                //                         console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                //                         console.log(`2.0) CLOSE LONG, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                         detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                         detailMarginAccount[fiat]["free"] = +lot;
                //                         //cerrar el long, debo usdt
                //                         await binance.mgRepay(fiat, lot, async(error, response) => { //repay usdt
                //                             if (error) {
                //                                 statuts = "ERROR";
                //                                 console.log(`Repay ${fiat}: ${lot}, status: ${status}`);
                //                                 console.log(error.body);
                //                                 // setTimeout(mgRepayFiat, 1000);
                //                             } else {
                //                                 status = "SUCCESS";
                //                                 console.log(`2.1) REPAY, Status: ${status} lot: ${fiat} ${lot}`);
                //                                 detailMarginAccount[fiat]["free"] = -quantityCurrency[symbol];
                //                                 detailMarginAccount[fiat]["borrowed"] = -quantityCurrency[symbol];

                //                                 await calcQuantity(symbol, close, lot);
                //                                 console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                //                                 await binance.mgBorrow(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //borrow usdt y compro btc
                //                                     if (error) {
                //                                         statuts = "ERROR";
                //                                         console.log(`BORROW ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                //                                         console.log(error.body);
                //                                         // setTimeout(mgBorrowShortNorm, 1000);
                //                                     } else {
                //                                         status = "SUCCESS";
                //                                         console.log(`2.2) Borrow status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                                         detailMarginAccount[symbol]["borrowed"] = +lot;
                //                                         detailMarginAccount[symbol]["free"] = +lot;
                //                                         await binance.mgMarketSell(symbol, quantityCurrency[symbol], async(error, response) => {
                //                                             if (error) {
                //                                                 console.log(error);
                //                                             } else {
                //                                                 console.log(`2.3) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                                                 detailMarginAccount[symbol]["currentSideMargin"] = "short";
                //                                                 detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                                                 detailMarginAccount[fiat]["free"] = +lot;
                //                                                 console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                //                                             };
                //                                         });
                //                                     };
                //                                 });
                //                             };
                //                         });
                //                     };

                //                     // operation++;
                //                     // console.log(`----------------------------START ${symbol}, Op: ${operation}----------------------------`);
                //                     // console.log(`2.0) CLOSE LONG, Margin Market ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     // detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                     // detailMarginAccount[fiat]["free"] = +lot;
                //                     // //cerrar el long, debo usdt
                //                     // await binance.mgRepay(fiat, lot, async(error, response) => { //repay usdt
                //                     //     if (error) {
                //                     //         statuts = "ERROR";
                //                     //         console.log(`Repay ${fiat}: ${lot}, status: ${status}`);
                //                     //         console.log(error.body);
                //                     //         // setTimeout(mgRepayFiat, 1000);
                //                     //     } else {
                //                     //         status = "SUCCESS";
                //                     //         console.log(`2.1) REPAY, Status: ${status} lot: ${fiat} ${lot}`);
                //                     //         detailMarginAccount[fiat]["free"] = -quantityCurrency[symbol];
                //                     //         detailMarginAccount[fiat]["borrowed"] = -quantityCurrency[symbol];

                //                     //         await calcQuantity(symbol, close, lot);
                //                     //         console.log(`***Recalculating quantity: ${quantityCurrency[symbol]}`);

                //                     //         await binance.mgBorrow(currencies[symbol], quantityCurrency[symbol], async(error, response) => { //borrow usdt y compro btc
                //                     //             if (error) {
                //                     //                 statuts = "ERROR";
                //                     //                 console.log(`BORROW ${currencies[symbol]}: ${quantityCurrency[symbol]}, status: ${status}`);
                //                     //                 console.log(error.body);
                //                     //                 // setTimeout(mgBorrowShortNorm, 1000);
                //                     //             } else {
                //                     //                 status = "SUCCESS";
                //                     //                 console.log(`2.2) Borrow status: ${status} lot: ${currencies[symbol]} ${quantityCurrency[symbol]}`);
                //                     //                 detailMarginAccount[symbol]["borrowed"] = +lot;
                //                     //                 detailMarginAccount[symbol]["free"] = +lot;
                //                     //                 await binance.mgMarketSell(symbol, quantityCurrency[symbol], async(error, response) => {
                //                     //                     console.log(`2.3) OPEN SHORT, Margin Market ${response.side} ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                //                     //                     detailMarginAccount[symbol]["currentSideMargin"] = "short";
                //                     //                     detailMarginAccount[symbol]["free"] = -quantityCurrency[symbol];
                //                     //                     detailMarginAccount[fiat]["free"] = +lot;
                //                     //                     console.log(`----------------------------END Operation: ${operation}----------------------------\n`);
                //                     //                 });
                //                     //             };
                //                     //         });
                //                     //     };
                //                     // });

                //                 });
                //             };


                //         };
                //     } catch (error) {
                //         console.error(error);
                //     };
                // })();


            };
        });
    } catch (error) {
        console.error(error);
    };
})(binance);



// module.exports = trading;