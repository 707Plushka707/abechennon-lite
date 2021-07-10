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
        quantity = (lot - 3) / close; // quantity = ((lot - 3) / close);
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

const formatQuantity = (quantity) => { // debo agregar un parametro mas, que indicaria que cantidad de digitos debe ser formateada la cifra
    return new Promise((resolve, reject) => {
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
        // quantityCurrency[`${symbol}`] = resQuantityNro;
        console.log(`***Formating quantity:  ${resQuantityNro}`);
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
let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC" };
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
        try {
            await binance.mgAccount((error, response) => {
                if (error) return console.warn(error);
                let account = response.userAssets.filter(curr => { // account: no es usado
                    for (let currency in currencies) {
                        if (currencies[currency] == curr.asset) {
                            detailMarginAccount[currency] = curr;
                            // return true;
                        };
                    };
                    // return false;
                });
                resolve(detailMarginAccount);
            });
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};


// modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
// freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt.
// borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt.
const positionCalculator = (fiat, resOne) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Loading current margin positions...`);
        try {
            for (let currency in resOne) {
                // console.log(currency); // par-symbol
                // console.log(currencies[currency]); // moneda
                if (currencies[currency] != fiat) {
                    let ticket = await binance.prices(currency);
                    detailMarginAccount[currency].freeUsdt = detailMarginAccount[currency]["free"] * ticket[currency];
                    detailMarginAccount[currency].borrowedUsdt = detailMarginAccount[currency]["borrowed"] * ticket[currency];
                };
            };
            resolve(detailMarginAccount);
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};


const marginMarketBuy = (symbol, quantity) => { //quantityCurrency[symbol]
    return new Promise(async(resolve, reject) => {
        await binance.mgMarketBuy(symbol, quantity, (error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
            if (error) {
                console.log(error.body);
                reject(error.body);
            };
            console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
            resolve(response);
        });
    });
};

const marginMarketSell = (symbol, quantity) => { //quantityCurrency[symbol]
    return new Promise(async(resolve, reject) => {
        await binance.mgMarketSell(symbol, quantity, (error, response) => {
            if (error) {
                console.log(error.body);
                reject(error.body);
            };
            console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
            resolve(response);
        });
    });
};


const marginBorrow = (currency, quantity) => {
    return new Promise(async(resolve, reject) => {
        await binance.mgBorrow(currency, quantity, (error, response) => { //borrow usdt y compro btc
            if (error) {
                console.log(`Error marginBorrow, persistencia..`);
                console.error(error.body);
                setTimeout((currency, quantity) => {
                    resolve(marginBorrow(currency, quantity));
                }, 3000);
                // reject(error.body);
            };
            console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
            resolve(response);
        });
    });
};

const marginRepay = (currency, quantity) => { //  (currencies[symbol], quantityCurrency[symbol]  -  (fiat, lot)
    return new Promise(async(resolve, reject) => {
        await binance.mgRepay(currency, quantity, (error, response) => { //repay usdt
            if (error) {
                console.log(`Error marginRepay, persistencia..`);
                console.error(error.body);
                setTimeout((currency, quantity) => {
                    resolve(marginRepay(currency, quantity));
                }, 3000);
                // reject(error.body);
            };
            console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`); // console.log(response); //   [Object: null prototype] { tranId: 67414878854, clientTag: '' }
            resolve(response);
        });
    });
};
const segundo = async() => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('paso 2');
        }, 3000);
    });
};

// let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" };
// detailMarginAccount[currency].currentSideMargin = null;
// Object.keys(currencies.currency);

const zeroPositionCrypto = fiat => { // symbol optativo
    return new Promise(async(resolve, reject) => {
        try {
            for (let currency in detailMarginAccount) {
                let borrowedFiat = detailMarginAccount[fiat]["borrowed"]; // prestamo de usdt
                let borrowedCrypto = detailMarginAccount[currency]["borrowedUsdt"] // prestamo de crypto en usdt
                let freeUsdtCrypto = detailMarginAccount[currency]["freeUsdt"]; // balance disponible de crypto en usdt
                let freeCrypto = detailMarginAccount[currency]["free"]; // balance disponible en crypto
                let borrowedCryptoToCrypto = detailMarginAccount[currency]["borrowed"]; // restamo de crypto en crypto

                // console.log(currency); // par-symbol
                // console.log(currencies[currency]); // moneda
                if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                    // arrastro posicion: largo || debo usdt
                    if (borrowedFiat > 0 && freeUsdtCrypto > 10.00) {
                        console.log(`***Cerrando posicion LONG, devolviendo ${fiat}..`);
                        const responseSell = await marginMarketSell(currency, freeCrypto);
                        let minorQty = (responseSell.cummulativeQuoteQty <= borrowedFiat) ? responseSell.cummulativeQuoteQty : borrowedFiat;
                        const response = await marginRepay(fiat, minorQty);
                        resolve("modified");

                        // shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                    } else if (freeUsdtCrypto > 0 && borrowedCrypto > 0) {
                        console.log(`***Shortfail (devolviendo ${currencies[currency]}, sin inicio de short)..`);
                        let minorQty = (borrowedCrypto <= freeUsdtCrypto) ? borrowedCryptoToCrypto : freeCrypto;
                        const response = await marginRepay(currencies[currency], minorQty);
                        resolve("modified");

                        // arrastro posicion: corto || debo crypto
                    } else if (freeUsdtCrypto < 10.00 && borrowedCrypto > 10.00) {
                        console.log(`***Cerrando posicion SHORT, devolviendo ${currencies[currency]}..`);
                        const resMarginMarketBuy = await marginMarketBuy(currency, borrowedCryptoToCrypto);
                        const response = await marginRepay(currencies[currency], borrowedCryptoToCrypto);
                        resolve("modified");

                        // quedo crypto rezagado
                    } else if (freeUsdtCrypto > 10.00 && borrowedFiat == 0) {
                        console.log(`...`);
                        const response = await marginMarketSell(currency, freeCrypto);
                        resolve("modified");

                        // tengo cripto comprado, pero sin apalancamiento
                    } else if (freeUsdtCrypto > 10.00 && borrowedFiat == 0) {
                        console.log(`***Cerrando posicion LONG (pero sin apalancamiento), NO debo ${fiat}..`);
                        const responseSell = await marginMarketSell(currency, freeCrypto);
                        resolve("modified");
                    } else {
                        resolve("success");
                    };
                };
            };
        } catch (error) {
            console.log(error);
            reject(error);
        };
    });
};

const zeroPositionFiat = fiat => {
    return new Promise(async(resolve, reject) => {
        try {
            // quedo fiat rezagado
            if (detailMarginAccount[fiat]["borrowed"] > 0) { // no fue largo || me prestaron usdt, pero no alcance a comprar
                console.log(`***zeroPositionFiat, devolviendo ${fiat}..`);
                const response = await marginRepay(fiat, detailMarginAccount[fiat]["borrowed"]);
                resolve("modified");
            } else {
                resolve("success");
            };
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};

const zeroPositionAll = fiat => {
    return new Promise(async(resolve, reject) => {
        try {
            console.log(`- Close all position, zeroPositionAll: true !`);
            const resZeroPositionCrypto = await zeroPositionCrypto(fiat);
            const resZeroPositionFiat = await zeroPositionFiat(fiat);
            resZeroPositionCrypto == "modified" || resZeroPositionFiat == "modified" ? resolve("modified") : resolve("success");
        } catch (error) {
            console.log(error);
            reject(error);
        };
    });
};


const flagSide = (fiat, resTwo) => { // currency = symbol/par
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate flagSide...`);
        try {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            for (let currency in resTwo) { // currency = symbol
                if (currencies[currency] != fiat) {
                    let borrowedFiat = detailMarginAccount[fiat]["borrowed"]; // prestamo de usdt
                    let borrowedCrypto = detailMarginAccount[currency]["borrowedUsdt"] // prestamo de crypto
                    let freeUsdtCrypto = detailMarginAccount[currency]["freeUsdt"]; // balance disponible de crypto en usdt

                    // tengo posicion: long
                    if (borrowedFiat > 10.00 && freeUsdtCrypto > 10.00) {
                        // if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] < 10.00) = // tengo longFail / no fue posicion long || me prestaron fiat, pero no alcance a comprar || debo fiat (no se puede validar cuando hay multiples mercados)
                        detailMarginAccount[currency].currentSideMargin = "long";
                        console.log(`*** flagSide: long`);
                        resolve(detailMarginAccount);

                        // tengo posicion: short
                    } else if (borrowedCrypto > 10.00 && freeUsdtCrypto < 10.00) {
                        detailMarginAccount[currency].currentSideMargin = "short";
                        console.log(`*** flagSide: short`);
                        resolve(detailMarginAccount);

                        // tengo shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                    } else if (borrowedCrypto > 10.00 && freeUsdtCrypto > 10.00) {
                        console.log(`*** flagSide: null, shortFail(1er else if), ${freeUsdtCrypto}, ${borrowedCrypto}`);
                        let minorQty = (borrowedCrypto <= freeUsdtCrypto) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                        const response = await marginRepay(currencies[currency], minorQty);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                        // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                    } else if (borrowedFiat < 10.00 && borrowedCrypto < 10.00 && freeUsdtCrypto > 10.00) {
                        console.log(`*** flagSide: null, fail(2do else if), ${detailMarginAccount[currency]["freeUsdt"]}, ${detailMarginAccount[fiat]["borrowed"]}`);
                        const response = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                    } else {
                        console.log(`*** flagSide: null, (3er else)`); // en cero entra aqui
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                    };
                    // Validaciones aprobadas:
                    // (freeUsdtCrypto > 10.00 && borrowedFiat > 10.00) V long
                    // (freeUsdtCrypto < 10.00 && borrowedCrypto > 10.00) V short
                    // (borrowedCrypto > 10.00 && freeUsdtCrypto > 10.00) V shortFail: me prestaron, pero no vendi. Debo hacer repayCrypto
                    // (borrowedFiat   > 10.00 && freeUsdtCrypto < 10.00) V fail: prestaron fiat, pero no se compro la posicion, de donde salio el crypto?. se soluciona agreagrando una validacion mas, (borrowedFiat < 10.00 && borrowedCrypto < 10.00 && freeUsdtCrypto > 10.00)

                    // Todas posibles validaciones:
                    // (borrowedFiat > 10.00 && freeUsdtCrypto < 10.00) V longFail: prestaron fiat, pero no se compro la posicion, debo hacer repayFiat
                    // (borrowedFiat > 10.00 && freeUsdtCrypto > 10.00) V long
                    // (borrowedFiat < 10.00 && freeUsdtCrypto < 10.00) X null
                    // (borrowedFiat < 10.00 && freeUsdtCrypto > 10.00) X fail: de donde salio la cripto? de prestamo crypto o de compra sin apalancamiento, falta validacion. Es X por que la voy a validar en freeUsdtCrypto > 10.00 && borrowedCrypto (> 10.00 (shortFail) || < 10.00 (debo validar si sale de borrowedFiat > 10.00))

                    // (borrowedFiat > 10.00 && borrowedCrypto < 10.00) X 
                    // (borrowedFiat > 10.00 && borrowedCrypto > 10.00) X
                    // (borrowedFiat < 10.00 && borrowedCrypto < 10.00) X null
                    // (borrowedFiat < 10.00 && borrowedCrypto > 10.00) X tengo prestamo crypto, deberia validar si se vendio (short), y sino shortFail

                    // (borrowedCrypto > 10.00 && freeUsdtCrypto < 10.00) V short: me prestaron crypto y se vendio
                    // (borrowedCrypto > 10.00 && freeUsdtCrypto > 10.00) V shortFail: me prestaron, pero no vendi. Debo hacer repayCrypto
                    // (borrowedCrypto < 10.00 && freeUsdtCrypto < 10.00) X null
                    // (borrowedCrypto < 10.00 && freeUsdtCrypto > 10.00) X

                    // (borrowedCrypto > 10.00 && borrowedFiat < 10.00) X
                    // (borrowedCrypto > 10.00 && borrowedFiat > 10.00) X
                    // (borrowedCrypto < 10.00 && borrowedFiat < 10.00) X null
                    // (borrowedCrypto < 10.00 && borrowedFiat > 10.00) X 

                    // (freeUsdtCrypto > 10.00 && borrowedCrypto < 10.00) X long: validar si el free es producto de borrowed fiat(long), caso contrario es un buy sin apalancamiento y se debera vender la posicion
                    // (freeUsdtCrypto > 10.00 && borrowedCrypto > 10.00) V shortFail; me prestaron crypto, pero no vendi la posicion
                    // (freeUsdtCrypto < 10.00 && borrowedCrypto < 10.00) X null
                    // (freeUsdtCrypto < 10.00 && borrowedCrypto > 10.00) V short

                    // (freeUsdtCrypto > 10.00 && borrowedFiat < 10.00) X fail: de donde salio la cripto? de prestamo crypto o de compra sin apalancamiento, falta validacion
                    // (freeUsdtCrypto > 10.00 && borrowedFiat > 10.00) V long
                    // (freeUsdtCrypto < 10.00 && borrowedFiat < 10.00) X null
                    // (freeUsdtCrypto < 10.00 && borrowedFiat > 10.00) V longFail: prestaron fiat, pero no se compro la posicion, debo hacer repayFiat
                };
            };
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};

const detailMarginAcc = fiat => {
    return new Promise(async(resolve, reject) => {
        try {
            let resOne = await detailAccount(fiat);
            let resTwo = await positionCalculator(fiat, resOne);
            let resThree = await flagSide(fiat, resTwo); // currency = symbol/par || calcula si es long/short/null y lo agrega al detailMarginAccount
            resolve(resThree);
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};


let operation = 0;
const order = (signal, symbol, close, lot, fiat) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
                // currency = currencies[symbol];
                // quantity = quantityCurrency[symbol];
                let quantity = await calcQuantity(symbol, close, lot);
                if (signal == 'buy') { // 1er operacion: prestamo usdt y long
                    operation++;
                    console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginBorrow(fiat, lot);
                    await marginMarketBuy(symbol, quantity); // quantity = quantityCurrency[symbol]
                    console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("SUCCESS");
                } else if (signal == 'sell') { // 1er operacion: prestamo crypto y short
                    operation++;
                    console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginBorrow(currencies[symbol], quantity); // quantity = quantityCurrency[symbol]
                    await marginMarketSell(symbol, quantity);
                    console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("SUCCESS");
                };
            } else if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {
                let quantity = await calcQuantity(symbol, close, lot);
                if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
                    operation++;
                    console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginMarketBuy(symbol, quantity);
                    await marginRepay(currencies[symbol], quantity);
                    quantity = await calcQuantity(symbol, close, lot);
                    await marginBorrow(fiat, lot);
                    await marginMarketBuy(symbol, quantity);
                    console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("SUCCESS");

                } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
                    operation++;
                    console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginMarketSell(symbol, quantity);
                    await marginRepay(fiat, lot);
                    quantity = await calcQuantity(symbol, close, lot);
                    await marginBorrow(currencies[symbol], quantity);
                    await marginMarketSell(symbol, quantity);
                    console.log(`----------------------------OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("SUCCESS");
                };
            };
        } catch (error) {
            console.log(error.body);
            reject(error);
        };
    });
};

//-------------------------------------------------------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------------------------------------------------------//
const trading = (async _ => {
    try {
        // const markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "DOGEUSDT", "ETCUSDT", "BCHUSDT", "LINKUSDT", "VETUSDT", "SOLUSDT", "TRXUSDT", "IOTAUSDT"];
        // const markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"];
        let markets = ["ETHUSDT"];
        let timeFrame = "15m";
        let length = 20;
        let fiat = "USDT";
        let lot = 100.00; // valor lote, default = 100usd

        console.log("***Condor Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Capital inicial:  256.79   \n`);
        console.log(`En desarrollo, controlar: keys, wavesStrategy, markets/timeFrame/lot, calcQuantity, closeAllPosition   \n`);
        console.log(`Markets: ${markets} \n`);


        let historyMarketsCloses = historyCloses(markets, timeFrame, binance);
        let arrayMarkets = await historyMarketsCloses().then(value => {
            console.log(`- Loading candlesticks history...`);
            return value;
        });

        // await marginMarketBuy("BTCUSDT", 0.001402); // quantity = quantityCurrency[symbol]
        // await marginMarketSell("BTCUSDT", 0.000449); // quantity = quantityCurrency[symbol]
        // await marginBorrow("ETH", 0.0079, "ETHUSDT"); // quantity = quantityCurrency[symbol]
        // await marginMarketSell("ETHUSDT", 0.008, fiat, lot); // quantity = quantityCurrency[symbol]

        await detailMarginAcc(fiat);

        let closeAllPosition = false; // default false
        if (closeAllPosition == true) {
            let resZeroPositionAll = await zeroPositionAll(fiat);
            if (resZeroPositionAll == "modified") {
                await detailMarginAcc(fiat);
            };
        };

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        // console.log(detailMarginAccount.USDT);
        // console.log(detailMarginAccount.BTCUSDT); // recordatorio nav detailMarginAccount.BTCUSDT.freeUsdt

        let flagBackTesting = true; // default: false
        if (flagBackTesting == true) {
            let [, arrayclose] = arrayMarkets[0];
            // console.log(util.inspect(arrayclose, { maxArrayLength: null }));
            let dataBackTesting = wavesBackTesting(arrayclose, length); //<==
            backTesting(dataBackTesting); //<==  
        };

        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {
                close = parseFloat(close).toFixed(2);

                let updatedMarkets = await updatedArrayMarkets(arrayMarkets, symbol, close);

                // let signal = await waves(updatedMarkets, length); //<== aqui recibe las senales de la estrategia
                // let signal = 'sell';
                let signal = 'undefined';

                if (signal != undefined) {
                    await order(signal, symbol, close, lot, fiat);
                    await detailMarginAcc(fiat);
                    console.log(detailMarginAccount.USDT);
                    console.log(detailMarginAccount.BTCUSDT);
                };

            };
        });
    } catch (error) {
        console.error(error);
    };
})(binance);


// module.exports = trading;