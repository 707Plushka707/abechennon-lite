/* ============================================================
 * Condor Trader-Bot Binance
 * https://github.com/jaggedsoft/node-binance-api
 * ============================================================
 * Copyright 2017-, Jon Eyrick
 * Released under the MIT License
 * ============================================================
 * @module jaggedsoft/node-binance-api
 * @return {object} instance to class object */
const { response } = require('express');
const Binance = require('node-binance-api');
const binance = require('./exchange');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const backTesting = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');

/**
 * History close prices
 * @param {array} markets - the array markets
 * @param {number} timeFrame - the timeframe
 * @param {number} binance - the key
 * @return {array}
 */
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
    return new Promise((resolve, reject) => {
        arrayMarkets.forEach((curr, idx, src) => {
            let [symbolArrayMarkets, arrayCloses] = src[idx];
            if (symbolArrayMarkets == symbol) {
                arrayCloses.shift();
                arrayCloses.push(close);
                // srcMarkets.push([symbolArrayMarkets, arrayCloses]);
                srcMarkets = arrayCloses;
            };
        });
        resolve(srcMarkets);
        return srcMarkets;
    });
};

let quantityCurrency = {};
const calcQuantity = (symbol, close, lot) => {
    return new Promise((resolve, reject) => {
        quantity = ((lot - 10) / close); // quantity = ((lot - 3) / close);
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
        console.log(`***Recalculating quantity: ${symbol} ${resQuantityNro}`);
        resolve(resQuantityNro);
    });
};

const testCalcQuantity = () => {
    let v = 0.00;
    for (let index = 0; index < 10000; index++) {
        v += 0.01;
        calcQuantity("test", v, 22);
    };
};
// testCalcQuantity();

// let currencies = { "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA", "BNBUSDT": "BNB", "DOGEUSDT": "DOGE", "ETCUSDT": "ETC", "BCHUSDT": "BCH", "LINKUSDT": "LINK", "VETUSDT": "VET", "SOLUSDT": "SOL", "TRXUSDT": "TRX", "IOTAUSDT": "IOTA" };
let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" };
const buildNameCurrency = (markets) => {
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
const detailAccount = () => {
    return new Promise(async(resolve, reject) => {
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
        resolve("SUCCES");
    });
};


// modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
// freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt.
// borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt.
const positionCalculator = fiat => {
    return new Promise(async(resolve, reject) => {
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
        resolve("SUCCES");
    });
};


const flagSide = fiat => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate flagSide..`);
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
                    console.log(`*** flagSide, shortFail: zeroPosition..`);
                    await zeroPosition(fiat);
                    detailMarginAccount[currency].currentSideMargin = null;
                } else {
                    detailMarginAccount[currency].currentSideMargin = null;
                };
            };
        };
        resolve("SUCCES");
    });
};


const marginMarketBuy = (symbol, quantity, fiat, lot) => { //quantityCurrency[symbol]
    return new Promise((resolve, reject) => {
        binance.mgMarketBuy(symbol, quantity, (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
            if (error) { reject(error.body) };
            detailMarginAccount[symbol]["currentSideMargin"] = "long";
            detailMarginAccount[symbol]["free"] = +quantity;
            detailMarginAccount[fiat]["free"] = -lot;
            console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
            resolve(response);
        });
    });
};

const marginMarketSell = (symbol, quantity, fiat, lot) => { //quantityCurrency[symbol]
    return new Promise((resolve, reject) => {
        binance.mgMarketSell(symbol, quantity, (error, response) => {
            if (error) { reject(error.body) };
            detailMarginAccount[symbol]["currentSideMargin"] = "short";
            detailMarginAccount[symbol]["free"] = -quantity;
            detailMarginAccount[fiat]["free"] = +lot;
            console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
            resolve(response);
        });
    });
};

const marginBorrow = (currency, quantity, symbol) => {
    return new Promise((resolve, reject) => {
        binance.mgBorrow(currency, quantity, (error, response) => { //borrow usdt y compro btc
            if (error) {
                console.error(error.body);
                marginBorrow(currency, quantity, symbol);
                reject(error.body);
            };
            console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
            // console.log(response); //   [Object: null prototype] { tranId: 67414878854, clientTag: '' }
            if (currency == "USDT") {
                detailMarginAccount[currency]["borrowed"] = +quantity;
                detailMarginAccount[currency]["free"] = +quantity;
            } else {
                detailMarginAccount[symbol]["borrowed"] = +quantity;
                detailMarginAccount[symbol]["free"] = +quantity;
            };
            resolve(response);
        });
    });
};

const marginRepay = (currency, quantity, symbol) => { //  (currencies[symbol], quantityCurrency[symbol]  -  (fiat, lot)
    return new Promise((resolve, reject) => {
        binance.mgRepay(currency, quantity, (error, response) => { //repay usdt
            if (error) {
                console.error(error.body);
                marginRepay(currency, quantity, symbol);
                reject(error.body);
            };
            console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`); // console.log(response); //   [Object: null prototype] { tranId: 67414878854, clientTag: '' }
            if (currency == "USDT") {
                detailMarginAccount[currency]["borrowed"] = -quantity;
                detailMarginAccount[currency]["free"] = -quantity;
            } else {
                detailMarginAccount[symbol]["borrowed"] = -quantity;
                detailMarginAccount[symbol]["free"] = -quantity;
            };
            resolve(response);
        });
    });
};


const zeroPosition = async(fiat, lot) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Close all position, zeroPosition: true !`)
            // console.log(detailMarginAccount); // recordatorio nav. detailMarginAccount.BTCUSDT.freeUsdt
            // let i = 0;
        for (let currency in detailMarginAccount) {
            // i++;
            // console.log(`paso 1: ${i}`);
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // console.log(detailMarginAccount[currency]["freeUsdt"]);

                // arrastro posicion: largo || debo usdt
                if (detailMarginAccount[fiat]["borrowed"] > 0 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00) {
                    console.log(`***Posicion LONG, devolviendo ${fiat}..`);
                    const responseSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"], fiat, lot);
                    let minorQty = (responseSell.cummulativeQuoteQty <= detailMarginAccount[fiat]["borrowed"]) ? responseSell.cummulativeQuoteQty : detailMarginAccount[fiat]["borrowed"];
                    const response = await marginRepay(fiat, detailMarginAccount[fiat]["borrowed"]);
                    // resolve(resMarginRepay);

                    // shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Shortfail (devolviendo ${currencies[currency]}, sin inicio de short)..`);
                    let minorQty = (detailMarginAccount[currency]["freeUsdt"] <= detailMarginAccount[currency]["borrowedUsdt"]) ? detailMarginAccount[currency]["free"] : detailMarginAccount[currency]["borrowed"];
                    const response = await marginRepay(currencies[currency], detailMarginAccount[currency]["free"]);
                    // resolve(resMarginRepay);

                    // arrastro posicion: corto || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Cerrando posicion SHORT, devolviendo ${currencies[currency]}..`);
                    const resMarginMarketBuy = await marginMarketBuy(currency, detailMarginAccount[currency]["borrowed"], fiat, lot);
                    const response = await marginRepay(currencies[currency], detailMarginAccount[currency]["borrowed"], symbol);
                    // resolve(resMarginRepay);

                    // quedo crypto rezagado
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] == 0) {
                    console.log(`...`);
                    const response = await marginMarketSell(currency, detailMarginAccount[currency]["free"], fiat, lot);
                    // resolve(resMarginMarketSell);
                };
            };
        };
        // console.log(`paso 2: ${i}`);
        console.log(`- Close all position, zeroPositionColector: true !`)
        if (detailMarginAccount[fiat]["borrowed"] > 0) { // no fue largo || me prestaron usdt, pero no alcance a comprar
            console.log(`***Longfail (devolviendo ${fiat}, sin inicio de LONG)..`);
            const response = await marginRepay(fiat, detailMarginAccount[fiat]["borrowed"]);
        };
        resolve(response);
    });
};


let operation = 0;
const order = (flagOp, symbol, close, lot, fiat) => {
    return new Promise(async(resolve, reject) => {
        if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
            // await detailAccount(currencies[symbol], binance);
            // currency = currencies[symbol];
            // quantity = quantityCurrency[symbol];
            let quantity = await calcQuantity(symbol, close, lot);
            if (flagOp == 'buy') { // 1er operacion: prestamo usdt y long
                operation++;
                console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                await marginBorrow(fiat, lot, symbol);
                await marginMarketBuy(symbol, quantity, fiat, lot); // quantity = quantityCurrency[symbol]
                console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve("SUCCES");
            } else if (flagOp == 'sell') { // 1er operacion: prestamo crypto y short
                operation++;
                console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                await marginBorrow(currencies[symbol], quantity, symbol); // quantity = quantityCurrency[symbol]
                await marginMarketSell(symbol, quantity, fiat, lot);
                console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve("SUCCES");
            };
        } else if (flagOp != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {
            let quantity = await calcQuantity(symbol, close, lot);
            if (flagOp == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
                operation++;
                console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                await marginMarketBuy(symbol, quantity, fiat, lot);
                await marginRepay(currencies[symbol], quantity, symbol);
                quantity = await calcQuantity(symbol, close, lot);
                await marginBorrow(fiat, lot);
                await marginMarketBuy(symbol, quantity, fiat, lot);
                console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve("SUCCES");

            } else if (flagOp == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
                operation++;
                console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                await marginMarketSell(symbol, quantity, fiat, lot);
                await marginRepay(fiat, lot);
                quantity = await calcQuantity(symbol, close, lot);
                await marginBorrow(currencies[symbol], quantity, symbol);
                await marginMarketSell(symbol, quantity, fiat, lot);
                console.log(`----------------------------OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve("SUCCES");
            };
        };
    });
};

//-------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------//
const trading = (async _ => {
    try {
        // const markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "DOGEUSDT", "ETCUSDT", "BCHUSDT", "LINKUSDT", "VETUSDT", "SOLUSDT", "TRXUSDT", "IOTAUSDT"];
        // const markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"];
        let markets = ["BTCUSDT"];
        let timeFrame = "15m";
        let fiat = "USDT";
        let lot = 1000.00; // valor lote, default = 100usd
        let length = 7;
        let operation = 0;

        console.log("***Condor Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Capital inicial:     \n`);
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

        // await marginBorrow("ETH", 0.0079, "ETHUSDT"); // quantity = quantityCurrency[symbol]
        // await marginMarketSell("ETHUSDT", 0.008, fiat, lot); // quantity = quantityCurrency[symbol]

        await positionCalculator(fiat); // calcula freeUsdt/borrowedUsdt y lo agrega al detailMarginAccount

        console.log(`- Requirements loaded !!`);

        let closeAllPosition = true; // default false
        if (closeAllPosition == true) {
            await zeroPosition(fiat);
        };

        await flagSide(fiat); // calcula si es long/short/null y lo agrega al detailMarginAccount

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        // console.log(detailMarginAccount)
        // console.log(currencies["USDT"]);
        // console.log(detailMarginAccount["ETHUSDT"]["freeUsdt"]);
        // console.log(detailMarginAccount["ETHUSDT"]["currentSideMargin"]);
        // console.log(detailMarginAccount); // recordatorio nav detailMarginAccount.BTCUSDT.freeUsdt

        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {
                close = parseFloat(close).toFixed(2);

                let updatedMarkets = await updatedArrayMarkets(arrayMarkets, symbol, close);

                let flagOp = await waves(updatedMarkets, length); //<== aqui recibe las senales de la estrategia
                // let flagOp = 'sell';
                // let flagOp = 'undefined';

                await order(flagOp, symbol, close, lot, fiat);

            };
        });
    } catch (error) {
        console.error(error);
    };
})(binance);


// module.exports = trading;