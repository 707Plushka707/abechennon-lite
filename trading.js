/* ============================================================
 * Abechennon Margin Trader-Bot Binance
 * https://github.com/pablob206/abechennon-traderbot
 * ============================================================
 * 2021 - Pablo Brocal - pablob206@hotmail.com
 * ============================================================
 */
const { response } = require('express');
const Binance = require('node-binance-api');
const binance = require('./exchange');
const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const backTesting = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');

const ADX = require('technicalindicators').ADX;
let period = 14;
let input = {
    close: [29.87, 30.24, 30.10, 28.90, 28.92, 28.48, 28.56, 27.56, 28.47, 28.28, 27.49, 27.23, 26.35, 26.33, 27.03, 26.22, 26.01, 25.46, 27.03, 27.45, 28.36, 28.43, 27.95, 29.01, 29.38, 29.36, 28.91, 30.61, 30.05, 30.19, 31.12, 30.54, 29.78, 30.04, 30.49, 31.47, 32.05, 31.97, 31.13, 31.66, 32.64, 32.59, 32.19, 32.10, 32.93, 33.00, 31.94],
    high: [30.20, 30.28, 30.45, 29.35, 29.35, 29.29, 28.83, 28.73, 28.67, 28.85, 28.64, 27.68, 27.21, 26.87, 27.41, 26.94, 26.52, 26.52, 27.09, 27.69, 28.45, 28.53, 28.67, 29.01, 29.87, 29.80, 29.75, 30.65, 30.60, 30.76, 31.17, 30.89, 30.04, 30.66, 30.60, 31.97, 32.10, 32.03, 31.63, 31.85, 32.71, 32.76, 32.58, 32.13, 33.12, 33.19, 32.52],
    low: [29.41, 29.32, 29.96, 28.74, 28.56, 28.41, 28.08, 27.43, 27.66, 27.83, 27.40, 27.09, 26.18, 26.13, 26.63, 26.13, 25.43, 25.35, 25.88, 26.96, 27.14, 28.01, 27.88, 27.99, 28.76, 29.14, 28.71, 28.93, 30.03, 29.39, 30.14, 30.43, 29.35, 29.99, 29.52, 30.94, 31.54, 31.36, 30.92, 31.20, 32.13, 32.23, 31.97, 31.56, 32.21, 32.63, 31.76],
    period: period
};
console.log(ADX.calculate(input));

// const sma = require('technicalindicators').sma;
// var prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15];
// var period = 10;
// console.log(sma({ period: period, values: prices }));

// const SMA = require('technicalindicators').SMA;
// var prices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15];
// var period = 10;
// console.log(SMA.calculate({ period: period, values: prices }));


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
// testeo de calcQuantity
// const testCalcQuantity = () => {
//     let v = 0.00;
//     for (let index = 0; index < 10000; index++) {
//         v += 0.01;
//         calcQuantity("test", v, 22);
//     };
// };
// testCalcQuantity();


const formatQuantity = (quantity) => { // debo agregar un parametro mas, que indicaria a que cantidad de digitos debe ser formateada la cifra
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


let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" };

// falta desarrollar la siguiente funcion: "buildNameCurrency(markets)". Recorre el array markets y a partir de alli crea el objeto "currencies" compuesto por: "par : moneda" (ej: "ADAUSDT : ADA")
const buildNameCurrency = (markets) => {
    markets.forEach((curr, idx, market) => {
        // flagStartMarkets[`${curr}`] = true;
        // console.log(curr);
        // console.log(market[idx]);
    });
    return nameCurrencies;
};


// guarda todos los detalles del account dentro del objeto detailMarginAccount
let detailMarginAccount = {};
const detailAccount = () => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Loading detail margin account...`);
        try {
            await binance.mgAccount((error, response) => {
                if (error) return console.warn(error);
                let account = response.userAssets.filter(curr => { // account: no es usado, en vez de eso se agrega los datos al objeto "detailMarginAccount"
                    for (let currency in currencies) {
                        if (currencies[currency] == curr.asset) {
                            detailMarginAccount[currency] = curr;
                            // return true; // no necesario
                        };
                    };
                    // return false; // no necesario
                });
                resolve(detailMarginAccount);
            });
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};

// positionCalculator (fiat, resOne) :
// modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
// freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt. Su uso es para referencia
// borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt. Su uso es para referencia
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
        await binance.mgBorrow(currency, quantity, (error, response) => {
            if (error) {
                console.log(`Error marginBorrow, persistencia..`);
                console.error(error.body);
                setTimeout((currency, quantity) => {
                    resolve(marginBorrow(currency, quantity));
                }, 3000);
                // reject(error);
            };
            console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
            resolve(response);
        });
    });
};

const marginRepay = (currency, quantity) => {
    return new Promise(async(resolve, reject) => {
        await binance.mgRepay(currency, quantity, (error, response) => { //repay usdt
            if (error) {
                console.log(`Error marginRepay, persistencia..`);
                console.error(error.body);
                setTimeout((currency, quantity) => {
                    resolve(marginRepay(currency, quantity));
                }, 3000);
                // reject(error);
            };
            console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`);
            resolve(response);
        });
    });
};

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
                        console.log(`*** flagSide ${currency}: null, ${freeUsdtCrypto}, ${borrowedCrypto}`);
                        let minorQty = (borrowedCrypto <= freeUsdtCrypto) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                        const response = await marginRepay(currencies[currency], minorQty);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                        // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                    } else if (borrowedFiat < 10.00 && borrowedCrypto < 10.00 && freeUsdtCrypto > 10.00) {
                        console.log(`*** flagSide ${currency}: null, ${detailMarginAccount[currency]["freeUsdt"]}, ${detailMarginAccount[fiat]["borrowed"]}`);
                        const response = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                    } else {
                        console.log(`*** flagSide ${currency}: null`);
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
        let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]; // pares a operar
        let timeFrame = "1m"; // intervalo de las velas
        let length = 20; // periodo para los indicadores que lo requieran
        let fiat = "USDT";
        let lot = 15.00; // valor lote
        let start = false; // default: true (el bot esta operativo)
        let invertSignal = false; // default: false || invierte la senal (ej: si es 'buy' se convierte a 'sell', idem si es 'sell') || falta implementarlo con el backtesting
        let closeAllPosition = false; // default false || vende las posiciones y reepaga los prestamos existentes, dejando los pares en cero al arranque de la app
        let flagBackTesting = false; // default: false || inicia backtesting

        console.log("***Abechennon Margin Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Capital inicial:  256.79   \n`);
        console.log(`En desarrollo, controlar: cabecera, keys, calcQuantity  \n`);
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

        await detailMarginAcc(fiat); // trae los detalles de la cuenta de margen

        if (closeAllPosition == true) {
            let resZeroPositionAll = await zeroPositionAll(fiat);
            if (resZeroPositionAll == "modified") {
                await detailMarginAcc(fiat);
            };
        };

        if (flagBackTesting == true) {
            let [, arrayclose] = arrayMarkets[0];
            // console.log(util.inspect(arrayclose, { maxArrayLength: null }));
            let dataBackTesting = wavesBackTesting(arrayclose, length); //<== funcion que crea el objeto con los datos que usara el backtesting
            backTesting(dataBackTesting); // procesamiento del backtesting
        };

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {
                close = parseFloat(close).toFixed(2);

                let updatedMarkets = await updatedArrayMarkets(arrayMarkets, symbol, close);

                let signal = await waves(updatedMarkets, length); //<== aqui la funcion que creara las senales

                if (invertSignal == true) {
                    if (signal == 'buy') {
                        signal = 'sell';
                    } else if (signal == 'sell') {
                        signal = 'buy';
                    };
                };

                if (start == true && signal != undefined) {
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