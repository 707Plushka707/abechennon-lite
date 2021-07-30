/* ============================================================
 * Abechennon Margin Trader Bot Binance
 * https://github.com/pablob206/abechennon-traderbot
 * ============================================================
 * Copyright 2021-, Pablo Brocal - pablob206@hotmail.com
 * Released under the MIT License
 * ============================================================
 */


const { response } = require('express');
const binance = require('./config/exchange');
const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const { backTesting, resDataBackTesting } = require('./backTesting');
const waves = require('./pStrategy/strategyWaves');
const classicRsi = require('./strategy/strategyRsi');
const interval = require('interval-promise');


/**
 * Recupera de la API las ultimas 500 velas historicas(500 es el maximo) y las retorna en promesa 
 * para que la resuelva la funcion historyCandlesticks a traves de un promise all.
 * @param {object} symbol - par/divisa
 * @param {string} timeFrame - intervalo de la vela
 * @return {Promise} -
 */
const workPromiseInputHistoryCandlestick = (symbol, timeFrame) => {
    return new Promise((resolve, reject) => {
        binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
            // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            if (error) reject(error);
            ticks.pop(); // elimina el ultimo por que no es "isFinal"
            ticks.map((curr, idx, src) => {
                inputHistoryCandlestick[symbol].open.push(parseFloat(curr[1]));
                inputHistoryCandlestick[symbol].high.push(parseFloat(curr[2]));
                inputHistoryCandlestick[symbol].low.push(parseFloat(curr[3]));
                inputHistoryCandlestick[symbol].close.push(parseFloat(curr[4]));
            });
            resolve(ticks);
        });
    });
};


/**
 * Resuelve en un promise all el historico de velas.
 * @param {array} markets - array que almacena los pares que operara el bot
 * @param {string} timeFrame - intervalo de la vela
 * @return {Promise} -
 */
const historyCandlesticks = (markets, timeFrame) => {
    return new Promise((resolve, reject) => {
        let promiseInputHistoryCandlestick = [];

        markets.forEach((symbol, idx, market) => {
            inputHistoryCandlestick[symbol] = {
                open: [],
                close: [],
                high: [],
                low: []
            };
            promiseInputHistoryCandlestick.push(workPromiseInputHistoryCandlestick(symbol, timeFrame));
        });

        resolve(Promise.all(promiseInputHistoryCandlestick));
    });
};


/**
 * Recibe del websocket la ultima vela y con ello actualiza el inputHistoryCandlestick.
 * @param {object} candlesticks - objeto de la API con los ultimos valores de la vela
 * @return {Promise} - 
 */
const updatedHistoryCandlesticks = (candlesticks) => {
    return new Promise((resolve, reject) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

        inputHistoryCandlestick[symbol].open.shift();
        inputHistoryCandlestick[symbol].close.shift();
        inputHistoryCandlestick[symbol].high.shift();
        inputHistoryCandlestick[symbol].low.shift();
        inputHistoryCandlestick[symbol].open.push(parseFloat(open));
        inputHistoryCandlestick[symbol].close.push(parseFloat(close));
        inputHistoryCandlestick[symbol].high.push(parseFloat(high));
        inputHistoryCandlestick[symbol].low.push(parseFloat(low));

        resolve(inputHistoryCandlestick);
        if (error) reject(error);
    });
};


/**
 * Calcula la cantidad de crypto a operar en base al lote asignado en fiat(usdt)
 * @param {number} close - ultimo precio de cierre
 * @param {number} lot - lote asignado en fiat(usdt)
 * @return {Promise} - 
 */
const calcQuantity = (close, lot) => {
    return new Promise((resolve, reject) => {
        let quantity = (lot - 1) / close; // experimental: -1 a lot para que no este tan ajustado los prestamos
        resolve(quantity);
    });
};


/**
 * Le da formato a un numero no admitido, por ej: 0.0070628(no admitido) a 0.0070(si admitido)
 * @param {number} value - valor no admitido
 * @return {number} - un valor admitido
 */
const formatQuantity = value => {
    let pEntera = Math.floor(value);

    if (pEntera > 0) {
        let re = new RegExp('^-?\\d+(?:\.\\d{0,' + (1 || -1) + '})?');
        return parseFloat(value.toString().match(re)[0]);
    } else {
        let flagFloat = false,
            flagZero = true,
            flagFirstDig = false,
            flagSecondDig = false;

        let res = new RegExp(/e/);
        let fg = value.toString().match(res);
        if (fg != null) {
            return parseFloat(value);
        } else {
            let valueArr = value.toString().split('');
            let resValueArr = valueArr.filter((curr, idx, src) => {
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
            let resValueStr = resValueArr.join('');
            resValueNro = parseFloat(resValueStr);
            return resValueNro;
        };
    };
};

/**
 * Genera los nombres de las monedas a partir de los nombres de los pares, ej: "ADA" : "ADAUSDT"
 * @param {array} markets - array que almacena los pares que operara el bot
 * @return {object} - 
 */
const buildNameCurrency = markets => {
    currencies['USDT'] = 'USDT';
    markets.map((curr, idx, market) => {
        currencies[curr] = curr.replace('USDT', '');
    });
    return currencies;
};


/**
 * Trae de la API los detalles de la cuenta de margin
 * @return {Promise} - 
 */
const detailAccount = () => {
    return new Promise((resolve, reject) => {
        console.log(`- Loading detail margin account...`);
        binance.mgAccount((error, response) => {
            if (error) {
                reject(`Error detailAccount. ${error.body}`);
            };
            // account: no es usado, en vez de eso se agrega los datos al objeto detailMarginAccount
            let account = response.userAssets.filter(curr => {
                let currFormat = {};
                for (let currency in currencies) {
                    if (currencies[currency] == curr.asset) {
                        currFormat.asset = curr.asset;
                        currFormat.free = formatQuantity(parseFloat(curr.free));
                        currFormat.locked = formatQuantity(parseFloat(curr.locked));
                        currFormat.borrowed = formatQuantity(parseFloat(curr.borrowed));
                        currFormat.interest = formatQuantity(parseFloat(curr.interest));
                        currFormat.netAsset = formatQuantity(parseFloat(curr.netAsset));

                        detailMarginAccount[currency] = currFormat;
                    };
                };
            });

            resolve(detailMarginAccount);
        });
    });
};


/**
 * Modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
 * freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt. Su uso es para referencia en los calculos
 * borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt. Su uso es para referencia en los calculos
 * @param {string} fiat - moneda base(usdt)
 * @param {object} responseDetailAccount - referencia al objeto currencies
 * @return {Promise} - 
 */
const positionCalculator = (fiat, responseDetailAccount) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate positions in USDT...`);
        for (let currency in responseDetailAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat) {
                let ticket = await binance.prices(currency);
                detailMarginAccount[currency].freeUsdt = detailMarginAccount[currency]["free"] * ticket[currency];
                detailMarginAccount[currency].borrowedUsdt = detailMarginAccount[currency]["borrowed"] * ticket[currency];
            };
        };
        // console.log(detailMarginAccount);
        resolve(detailMarginAccount);
    });
};


/**
 * Orden mercado de compra en margin
 * param {string} symbol - par/divisa
 * param {number} quantity - cantidad
 * return {Promise}
 */
const marginMarketBuy = (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgMarketBuy(symbol, quantity, (error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0) {
                    reject(`Error marginMarketBuy: ${symbol}, Qty: ${quantity}, ${error.body}`);
                };
            } else {
                // console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                resolve(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`); // devuelvo la cantidad ejecutada || response.fills[0].qty (cantidad ejecutada)
            };
        });
    });
};


/**
 * Orden mercado de venta en margin
 * param {string} symbol - par/divisa
 * param {number} quantity - cantidad
 * return {Promise}
 */
const marginMarketSell = (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgMarketSell(symbol, quantity, (error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0) {
                    reject(`Error marginMarketSell: symbol: ${symbol}, Qty: ${quantity}, ${error.body}`);
                };
            } else {
                // console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                resolve(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
            };
        });
    });
};


/**
 * Orden de prestamo en margin
 * param {string} currency - moneda a pedir prestado
 * param {number} quantity - cantidad
 * return {Promise}
 */
const marginBorrow = (currency, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgBorrow(currency, quantity, (error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0) {
                    reject(`Error ${nroError}, ${error.body}`);
                };
            } else {
                // console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`); // [Object: null prototype] { tranId: 69655107900, clientTag: '' }
            };
        });

    });
};


/**
 * Orden para repagar prestamo en margin
 * param {string} currency - moneda
 * param {number} quantity - cantidad
 * return {Promise}
 */
const marginRepay = (currency, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgRepay(currency, quantity, (error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] == 3041) {
                    reject(`Error ${nroError}, ${error.body}`);
                } else if (nroError[0] == 1102) {
                    reject(`Error ${nroError}, ${error.body}`);
                } else if (nroError[0] != 0) {
                    reject(`Error ${nroError}, ${error.body}`);
                };
            } else {
                // console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`);
            };
        });
    });
};


/**
 * Cierra las posiciones existentes (las que se indiquen en el array markets)
 * @param {string} fiat - moneda base(usdt)
 * @return {Promise} - 
 */
const closeAllCryptoPosition = fiat => {
    return new Promise(async(resolve, reject) => {
        let status;

        for (let currency in detailMarginAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // arrastro posicion: largo || debo usdt
                if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`***Cerrando posicion LONG ${currency}, devolviendo ${fiat}..`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                    let minorQty = (resMarginMarketSell.cummulativeQuoteQty <= detailMarginAccount[fiat]["borrowed"]) ? resMarginMarketSell.cummulativeQuoteQty : detailMarginAccount[fiat]["borrowed"];
                    await marginRepay(fiat, minorQty);
                    status = "modified";

                    // shortFail / no fue posicion short || me prestaron crypto, pero no se vendio || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Shortfail (devolviendo ${currencies[currency]}, sin inicio de short)..`);
                    let minorQty = (detailMarginAccount[currency]["borrowedUsdt"] <= detailMarginAccount[currency]["freeUsdt"]) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                    await marginRepay(currencies[currency], minorQty);
                    status = "modified";

                    // arrastro posicion: corto || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Cerrando posicion SHORT ${currency}, devolviendo ${currencies[currency]}..`);
                    const resMarginMarketBuy = await marginMarketBuy(currency, detailMarginAccount[currency]["borrowed"]);
                    await marginRepay(currencies[currency], parseFloat(resMarginMarketBuy.fills[0].qty));
                    status = "modified";

                    // quedo crypto rezagado
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] < 10.00) {
                    console.log(`...Quedo crypto rezagado,  ${currency}`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                    status = "modified";

                    // tengo cripto comprado, pero sin apalancamiento
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                    console.log(`***Cerrando posicion LONG ${currency}, (pero sin apalancamiento), NO debo ${fiat}..`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                    status = "modified";
                };
            };
        };

        if (status == 'modified') {
            resolve('modified');
        } else {
            resolve('noModified');
        };
    });
};


/**
 * Verifica si el par esta con posicion existente en long o short, de lo contrario no hay posicion (es null). 
 * Y si hay posicion invalida (a medio terminar) las cierra.
 * @param {string} fiat - moneda base(usdt)
 * @param {object} responsePositionCalculator - referencia al objeto currencies
 * @return {Promise}
 */
const currentSide = (fiat, responsePositionCalculator) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate current side position...`);
        // console.log(currency); // par-symbol
        // console.log(currencies[currency]); // moneda
        let status = 'noModified';
        // console.log(detailMarginAccount);

        for (let currency in responsePositionCalculator) { // currency = symbol
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // tengo posicion: long
                if (detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                    // if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] < 10.00) = // tengo longFail / no fue posicion long || me prestaron fiat, pero no alcance a comprar || debo fiat (no se puede validar cuando hay multiples mercados)
                    detailMarginAccount[currency].currentSideMargin = "long";
                    console.log(`*** Current position ${currency}: long`);

                    // tengo posicion: short
                } else if (detailMarginAccount[currency]["borrowedUsdt"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] < 10.00) {
                    detailMarginAccount[currency].currentSideMargin = "short";
                    console.log(`*** Current position ${currency}: short`);

                    // shortFail / tengo prestamo crypto, pero no posicion short
                } else if (detailMarginAccount[currency]["borrowedUsdt"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`*** Current position ${currency}: null. Active crypto loan ${detailMarginAccount[currency]["borrowed"]} (USDT: ${detailMarginAccount[currency]["borrowedUsdt"]})`);
                    let minorQty = (detailMarginAccount[currency]["borrowedUsdt"] < detailMarginAccount[currency]["freeUsdt"]) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                    const resMarginRepay = await marginRepay(currencies[currency], minorQty);
                    detailMarginAccount[currency].currentSideMargin = null;
                    status = 'modified';

                    // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                } else if (detailMarginAccount[fiat]["borrowed"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`*** Current position ${currency}: null. Holding crypto without a loan ${detailMarginAccount[currency]["free"]} (USDT: ${detailMarginAccount[currency]["freeUsdt"]})`);
                    const resMarginMarketSell = await marginMarketSell(currency, formatQuantity(detailMarginAccount[currency]["free"]));
                    detailMarginAccount[currency].currentSideMargin = null;
                    status = 'modified';

                } else {
                    console.log(`*** Current position ${currency}: null`);
                    detailMarginAccount[currency].currentSideMargin = null;
                };
            };
        };
        resolve(status);
    });
};


/**
 * LLama a otras funciones para hacer un calculo completo de los detalles de la cuenta de margin
 * @param {string} fiat - moneda base(usdt)
 * @return {Promise}
 */
const detailMarginAcc = fiat => {
    return new Promise(async(resolve, reject) => {
        let responseDetailAccount = await detailAccount(fiat);
        let responsePositionCalculator = await positionCalculator(fiat, responseDetailAccount);
        let responseCurrentSide = await currentSide(fiat, responsePositionCalculator);
        if (responseCurrentSide == 'modified') {
            await detailMarginAcc(fiat);
        } else {
            resolve(responseCurrentSide);
        };
    });
};


/**
 * Ejecucion de ordenes de margin, en esquema ping-pong (o sea, la senial buy es para cerrar un short y abrir
 * un long, igual a la inversa)
 * @param {string} signal - senial de la estrategia
 * @param {string} symbol - par/divisa
 * @param {number} close - ultimo precio de cierre de la vela
 * @param {number} lot - lote asignado a la orden
 * @param {string} fiat - moneda base(usdt)
 * @return {Promise}
 */
let operation = 0; // contador de operaciones
const order = (signal, symbol, close, lot, fiat) => {
    return new Promise(async(resolve, reject) => {
        let minorQty,
            responseDetailAccount,
            resMarginMarketBuy = 0,
            resMarginMarketSell = 0,
            quantity,
            qty;

        if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
            // currency = currencies[symbol];
            // quantity = quantityCurrency[symbol];

            if (signal == 'buy') { // 1er operacion: prestamo usdt y long
                operation++;
                console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                qty = await calcQuantity(close, lot);
                quantity = formatQuantity(qty);
                console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
                responseMarginBorrow = await marginBorrow(fiat, lot);
                console.log(responseMarginBorrow);
                resMarginMarketBuy = await marginMarketBuy(symbol, quantity); // quantity = quantityCurrency[symbol]
                console.log(resMarginMarketBuy);
                console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve(`success`);
            } else if (signal == 'sell') { // 1er operacion: prestamo crypto y short
                operation++;
                console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                qty = await calcQuantity(close, lot);
                quantity = formatQuantity(qty);
                console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
                responseMarginBorrow = await marginBorrow(currencies[symbol], quantity); // quantity = quantityCurrency[symbol]
                console.log(responseMarginBorrow);
                responseMarginMarketSell = await marginMarketSell(symbol, quantity);
                console.log(responseMarginMarketSell);
                console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve(`success`);
            };
        } else if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {

            if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
                operation++;
                console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                qty = await calcQuantity(close, lot);
                quantity = formatQuantity(qty);
                console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
                responseMarginMarketBuy = await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"]);
                console.log(responseMarginMarketBuy);
                responseDetailAccount = await detailAccount(fiat);
                minorQty = (responseDetailAccount[symbol]["borrowed"] <= responseDetailAccount[symbol]["free"]) ? responseDetailAccount[symbol]["borrowed"] : responseDetailAccount[symbol]["free"];
                responseMarginRepay = await marginRepay(currencies[symbol], minorQty); // parseFloat(resMarginMarketBuy.executedQty) / parseFloat(resMarginMarketBuy.fills[0].qty)
                console.log(responseMarginRepay);
                responseMarginBorrow = await marginBorrow(fiat, lot);
                console.log(responseMarginBorrow);
                responseMarginMarketBuy = await marginMarketBuy(symbol, quantity);
                console.log(responseMarginMarketBuy);
                console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve(`success`);

            } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
                operation++;
                console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                qty = await calcQuantity(close, lot);
                quantity = formatQuantity(qty);
                console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
                responseMarginMarketSell = await marginMarketSell(symbol, detailMarginAccount[symbol]["free"]);
                console.log(responseMarginMarketSell);
                responseDetailAccount = await detailAccount(fiat);
                responseMarginRepay = await marginRepay(fiat, lot); // antes lot. lo que obtuve de vta parseFloat(resMarginMarketSell.cummulativeQuoteQty);
                console.log(responseMarginRepay);
                responseMarginBorrow = await marginBorrow(currencies[symbol], quantity);
                console.log(responseMarginBorrow);
                responseDetailAccount = await detailAccount(fiat);
                responseMarginMarketSell = await marginMarketSell(symbol, responseDetailAccount[symbol]["free"]); // antes quantity
                console.log(responseMarginMarketSell);
                console.log(`----------------------------OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                resolve(`success`);
            };
        };

        reject(`Error Order`);
    });
};


/**
 * Recupera de la API todas las monedas disponibles en el comercio de margen, y almacena su correspondiente
 * par contra USDT en el objeto marketsAvailable
 * @return {Promise} 
 */
const marginMarketsAvailable = () => {
    return new Promise(async(resolve, reject) => {
        await binance.mgAccount((error, response) => {
            if (error) return console.warn(error);

            response.userAssets.map((curr, idx, src) => {
                // console.log(curr.asset); //currency
                // console.log(curr.asset.concat('', 'USDT')); // symbol
                if (curr.asset != 'USDT' && curr.asset != 'BNB' && curr.asset != 'BCHA') {
                    marketsAvailable[curr.asset.concat('', 'USDT')] = curr.asset;
                };
            });
            resolve(marketsAvailable);
        });
    });
};


/**
 * Procesa los datos del backtesting(objDataBackTesting) realizado a todos los pares disponibles en el comercio de margen, 
 * y elige la cantidad establecida(magicAmmount) con mejores rentabilidades, para agregarlas al array markets previamente vacio.
 * El array markets es donde se almacenan los pares que opera el bot.
 * @param {number} magicAmmount - cantidad de pares que desea que opere el bot
 * @param {object} objDataBackTesting - obj que contiene los datos del backtesting realizado a todos los pares
 * @param {array} markets - array que almacena los pares que opera el boy
 * @return {Promise} -
 */
const magic = (magicAmmount, objDataBackTesting, markets) => {
    return new Promise((resolve, reject) => {
        marketsObj = new Array;
        markets = [];
        let totalOp = 0,
            totalWin = 0,
            totalLos = 0,
            totalSuccessPercent = 0,
            profitSum = 0;

        objDataBackTesting.sort((a, b) => {
            return (b.totalProfitPercent - a.totalProfitPercent);
        });
        // console.log(objDataBackTesting);

        for (let idx = 0; idx < magicAmmount; idx++) {
            if (objDataBackTesting[idx].totalProfitPercent > 0.5) {
                markets.push(objDataBackTesting[idx].symbol);

                totalOp += objDataBackTesting[idx].totalOperation;
                totalWin += objDataBackTesting[idx].winners;
                totalLos += objDataBackTesting[idx].losers;
                profitSum += objDataBackTesting[idx].totalProfitPercent;
            };
        };
        totalSuccessPercent = (totalWin * 100) / totalOp; // % aciertos
        profit = profitSum / magicAmmount;

        console.log("\n===========================================================");
        console.log(`Magic has chosen, Markets[${markets.length}]: ${markets}`);
        console.log("===========================================================");
        console.log(`Total Operations: ${totalOp}`);
        console.log(`Winners: ${totalWin}, Losers: ${totalLos}`);
        console.log(`Success: % ${totalSuccessPercent}`);
        console.log(`Total Profit of magic: % ${profit}`);
        console.log("=========================================================== \n");

        resolve(markets);
    });
};

let currencies = new Object; // obj que contiene moneda : par (ETH : ETHUSDT)
let detailMarginAccount = {}; // obj que contiene los detalles de la cuenta de margen
let marketsAvailable = new Object; // obj que contiene todos los pares disponibles en el comercio de margen
let inputHistoryCandlestick = {}; // obj con los datos del historico de velas

//-------------------------------------------------------------------------------------------------------------------------------//

/**
 * Funcion iife donde converge la logica.
 * @param {object} binance - conexion a binance
 */
const trading = (async _ => {
    try {
        let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"], // pares a operar por el bot, si flagOnMagic es true entonces esto sera ignorado
            timeFrame = "15m", // intervalo de las velas    
            fiat = "USDT", // default: USDT || moneda base
            lot = 15.00, // valor lote en fiat (USDT)
            start = true, // default: true || start del bot
            closeAllPosition = false, // default false || vende las posiciones y repaga los prestamos existentes, dejando los pares en cero al arranque de la app
            flagBackTesting = true, // default: false || inicia backtesting
            invertSignal = false, // default: false || invierte la senal (ej: si es 'buy' se convierte a 'sell', idem si es 'sell') || falta implementarlo con el backtesting
            flagOnMagic = false, // default: false || elige las monedas de forma automatizada
            magicAmmount = 3; // cantidad de monedas que elegira la opcion flagOnMagic para operar

        console.log("***Abechennon Margin Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Start: ${start} | Magic: ${flagOnMagic} \n`);
        console.log(`Close all positions: ${closeAllPosition} | Back-Testing: ${flagBackTesting} | Invert signal: ${invertSignal} \n`);

        if (flagOnMagic == false) {
            console.log(`Markets: ${markets} \n`);
        } else {
            console.log(`Markets: magic is calculating it...  \n`);
        };

        // activar magic
        if (flagOnMagic == true) {
            await marginMarketsAvailable(); // obtiene de la API los pares disponibles en el comercio de margen
            await historyCandlesticks(Object.keys(marketsAvailable), timeFrame); // recupera de la API el historico de velas
            await detailMarginAcc(fiat); // recupera de la API los datos de la cuenta de margen

            // procesamiento para obtener resultados del backtesting
            for (let symbol in marketsAvailable) {
                let dataBackTesting = await classicRsi(curr, inputHistoryCandlestick[curr], invertSignal, true, 14, 30, 70); // obtiene seniales de la estrategia
                await backTesting(dataBackTesting); // se calculan rentabilidades
            };
            markets = await magic(magicAmmount, resDataBackTesting); // elige los mejores pares
            // console.log(markets);
        } else {
            buildNameCurrency(markets); // 
            await historyCandlesticks(markets, timeFrame); // recupera de la API el historico de velas
            await detailMarginAcc(fiat); // recupera de la API los datos de la cuenta de margen
        };


        // cerrar todas las posiciones (las que esten en el array markets)
        if (closeAllPosition == true) {
            console.log(`- Close all position: true !`);
            let resMarginRepayFiat;
            let rescloseAllCryptoPosition = await closeAllCryptoPosition(fiat);
            if (detailMarginAccount[fiat]["borrowed"] > 0) {
                resMarginRepayFiat = await marginRepay(fiat, detailMarginAccount[fiat]["borrowed"]);
            };
            if (rescloseAllCryptoPosition == 'modified' || resMarginRepayFiat == 'modified') {
                await detailMarginAcc(fiat);
            };
        };

        // activar backtesting (las que esten en el array markets)
        if (flagBackTesting == true) {
            markets.forEach(async(curr) => {
                let dataBackTesting = await classicRsi(curr, inputHistoryCandlestick[curr], invertSignal, true, 14, 30, 70); // obtiene seniales de la estrategia
                await backTesting(dataBackTesting); // se calculan rentabilidades
            });

        };

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);



        let runOrder = false; // control de flujo entre websocket.candlesticks e interval
        let final = 0; // control de flujo entre websocket.candlesticks e interval

        // websocket recupera de la API los datos de las velas
        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

            if (isFinal == true && runOrder == false) {
                final += 1;
                // console.log(`final: ${final}`);
                await updatedHistoryCandlesticks(candlesticks);
                if (final == markets.length) {
                    runOrder = true;
                };
            };

        });


        // escucha al websocket para ejecutar las ordenes de comercio cuando corresponda
        interval(async() => {
            if (runOrder == true) {

                for await (let symbol of markets) {
                    let { open, close, high, low, booleanIsFinal } = inputHistoryCandlestick[symbol]; // ultimo close del array: close[close.length-1]
                    let signal = await classicRsi(curr, inputHistoryCandlestick[curr], invertSignal, false, 14, 30, 70); // obtiene seniales de la estrategia
                    if (start == true && signal !== undefined) {
                        await order(signal, symbol, close[close.length - 1], lot, fiat);
                        await detailMarginAcc(fiat);
                        console.log(detailMarginAccount.USDT);
                        console.log(detailMarginAccount[symbol]);
                    };
                };
                final = 0;
                runOrder = false;
            };
        }, 2000, { iterations: Infinity, stopOnError: false })


    } catch (error) {
        console.error(error);
    };
})(binance);