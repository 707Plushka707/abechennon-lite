/* ============================================================
 * Abechennon Margin Trader Bot Binance
 * https://github.com/pablob206/abechennon
 * ============================================================
 * Copyright 2021-, Pablo Brocal - pablob206@hotmail.com
 * Released under the MIT License
 * ============================================================
 */


const { response } = require('express');
const binance = require('../config/exchange');
const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const interval = require('interval-promise');
const { backTesting, resDataBackTesting } = require('./BackTestingService');
const supportResistance = require('./pStrategy/supportResistance');
const classicRsi = require('./pStrategy/strategyRsi');
const classicRsiWithCrossover = require('./pStrategy/strategyRsiWithCrossover');
const strategyPriceAction = require('./pStrategy/strategyPriceAction');
const waves = require('./pStrategy/strategyWaves');
const strategyAdxRsi = require('./pStrategy/strategyAdxRsi');
const strategySmaRsi = require('./pStrategy/strategySmaRsi');




/**
 * Recupera de la API las ultimas 500 velas historicas(500 es el maximo) y las retorna en promesa 
 * para que la resuelva la funcion historyCandlesticks a traves de un promise all.
 * @param {object} symbol - par/divisa
 * @param {string} timeFrame - intervalo de la vela
 * @return {Promise} -
 */
const workPromiseInputHistoryCandlestick = (symbol, timeFrame, realTime) => {
    return new Promise((resolve, reject) => {
        binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
            // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
            if (error) reject(error);

            if (realTime == false) {
                ticks.pop(); // elimina el ultimo por que no es "isFinal"
                ticks.map((curr, idx, src) => {
                    inputHistoryCandlestick[symbol].open.push(parseFloat(curr[1]));
                    inputHistoryCandlestick[symbol].high.push(parseFloat(curr[2]));
                    inputHistoryCandlestick[symbol].low.push(parseFloat(curr[3]));
                    inputHistoryCandlestick[symbol].close.push(parseFloat(curr[4]));
                    inputHistoryCandlestick[symbol].volume.push(parseFloat(curr[5]));
                });
                resolve(ticks);

            } else {
                ticks.map((curr, idx, src) => {
                    inputHistoryCandlestick[symbol].open.push(parseFloat(curr[1]));
                    inputHistoryCandlestick[symbol].high.push(parseFloat(curr[2]));
                    inputHistoryCandlestick[symbol].low.push(parseFloat(curr[3]));
                    inputHistoryCandlestick[symbol].close.push(parseFloat(curr[4]));
                    inputHistoryCandlestick[symbol].volume.push(parseFloat(curr[5]));
                });
                resolve(ticks);

            };
        });
    });
};


/**
 * Resuelve en un promise all el historico de velas.
 * @param {array} markets - array que almacena los pares que operara el bot
 * @param {string} timeFrame - intervalo de la vela
 * @return {Promise} -
 */
const historyCandlesticks = (markets, timeFrame, realTime) => {
    return new Promise((resolve, reject) => {
        let promiseInputHistoryCandlestick = [];

        markets.forEach((symbol, idx, market) => {
            inputHistoryCandlestick[symbol] = {
                open: [],
                close: [],
                high: [],
                low: [],
                volume: []
            };
            promiseInputHistoryCandlestick.push(workPromiseInputHistoryCandlestick(symbol, timeFrame, realTime));
        });
        resolve(Promise.all(promiseInputHistoryCandlestick));

    });
};


/**
 * Recibe del websocket la ultima vela y con ello actualiza el inputHistoryCandlestick.
 * @param {object} candlesticks - objeto de la API con los ultimos valores de la vela
 * @return {Promise} - 
 */
const updatedHistoryCandlesticks = candlesticks => {
    return new Promise((resolve, reject) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

        inputHistoryCandlestick[symbol].open.shift();
        inputHistoryCandlestick[symbol].close.shift();
        inputHistoryCandlestick[symbol].high.shift();
        inputHistoryCandlestick[symbol].low.shift();
        inputHistoryCandlestick[symbol].volume.shift();
        inputHistoryCandlestick[symbol].open.push(parseFloat(open));
        inputHistoryCandlestick[symbol].close.push(parseFloat(close));
        inputHistoryCandlestick[symbol].high.push(parseFloat(high));
        inputHistoryCandlestick[symbol].low.push(parseFloat(low));
        inputHistoryCandlestick[symbol].volume.push(parseFloat(volume));

        resolve(inputHistoryCandlestick);

        if (error) reject(error);

    });
};

const flagInitUpdateHistoryRealTime = (markets, objFlagInitUpdateHistoryRealTime) => {
    markets.forEach((curr) => {
        objFlagInitUpdateHistoryRealTime[curr] = false;
    });
    return objFlagInitUpdateHistoryRealTime;

};

const updatedHistoryCandlesticksRealTimeData = candlesticks => {
    return new Promise((resolve, reject) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

        inputHistoryCandlestick[symbol].open.pop();
        inputHistoryCandlestick[symbol].close.pop();
        inputHistoryCandlestick[symbol].high.pop();
        inputHistoryCandlestick[symbol].low.pop();
        inputHistoryCandlestick[symbol].volume.pop();
        inputHistoryCandlestick[symbol].open.push(parseFloat(open));
        inputHistoryCandlestick[symbol].close.push(parseFloat(close));
        inputHistoryCandlestick[symbol].high.push(parseFloat(high));
        inputHistoryCandlestick[symbol].low.push(parseFloat(low));
        inputHistoryCandlestick[symbol].volume.push(parseFloat(volume));

        resolve(inputHistoryCandlestick);

        if (error) reject(error);

    });
};

/**
 * Calcula la cantidad de crypto a operar en base al lote asignado en fiat(usdt)
 * @param {number} close - ultimo precio de cierre
 * @param {number} lot - lote asignado en fiat(usdt)
 * @return {number} - 
 */
const calcQuantity = (close, lot) => {
    let quantity = (lot) / close; // experimental: -1 a lot para que no este tan ajustado los prestamos

    return quantity;
};


/**
 * Le da formato a un numero no admitido, por ej: 0.0070628(no admitido) a 0.0070(si admitido)
 * @param {number} value - valor no admitido
 * @return {number} - un valor admitido
 */
const formatQuantity = value => {
    let pEntera = Math.floor(value);

    if (pEntera > 0) { // agregado que si es de 3 digitos no lleve decimales
        if (pEntera < 10) {
            let re = new RegExp('^-?\\d+(?:\.\\d{0,' + (1 || -1) + '})?');
            return parseFloat(value.toString().match(re)[0]);
        } else if (pEntera >= 10) {
            return parseFloat(pEntera);
        };
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
            let resValueNro = parseFloat(resValueStr);

            return resValueNro;

        };
    };
};

/**
 * Genera los nombres de las monedas a partir de los nombres de los pares, ej: "ADA" : "ADAUSDT"
 * @param {array} markets - array que almacena los pares que operara el bot
 * @param {object} currencies -
 * @return {object} - Ex: { THETAUSDT: 'THETA', ALGOUSDT: 'ALGO' }
 */
const buildNameCurrency = (markets, currencies) => {
    currencies = {};

    currencies['USDT'] = 'USDT';
    markets.map((curr) => {
        currencies[curr] = curr.replace('USDT', '');
    });
    return currencies;

};


/**
 * Recupera de la API todas las monedas disponibles en el comercio de margen, y almacena su correspondiente
 * par contra USDT en el objeto marketsAvailable
 * @param {object} currencies -
 * @return {Promise} -  Ex: { XMRUSDT: 'XMR', ADAUSDT: 'ADA' }

 */
const marginMarketsAvailable = currencies => {
    return new Promise(async(resolve, reject) => {
        await binance.mgAccount((error, response) => {
            if (error) return console.warn(error);

            currencies['USDT'] = 'USDT';
            response.userAssets.map((curr, idx, src) => {
                // console.log(curr.asset); //currency
                // console.log(curr.asset.concat('', 'USDT')); // symbol
                if (curr.asset != 'USDT' && curr.asset != 'BCHA') {
                    currencies[curr.asset.concat('', 'USDT')] = curr.asset;
                };
            });

            resolve(currencies);
        });
    });
};

/**
 * @param {object} currencies - 
 * @param {array} markets -
 * @return {Promise} - 
 */
const buildMarketsSymbol = (currencies, markets) => {
    return new Promise((resolve, reject) => {
        markets = [];
        let arrayKeysCurrencies = Object.keys(currencies);

        markets = arrayKeysCurrencies.filter((curr) => {
            if (curr != 'USDT') {
                return curr;
            };
        });
        resolve(markets);

    });
};

/**
 * Trae de la API los detalles de la cuenta de margin
 * @param {object} currencies -
 * @param {object} detailMarginAccount -
 * @return {Promise} - 
 */
const detailAccount = (currencies, detailMarginAccount) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Loading detail margin account...`);
        await binance.mgAccount((error, response) => {
            if (error) reject(`Error detailAccount. ${error.body}`);
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
                // console.log(detailMarginAccount)
            });
            // console.log(detailMarginAccount);
            resolve(detailMarginAccount);

        });
    });
};


/**
 * Modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
 * freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt. Su uso es para referencia en los calculos
 * borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt. Su uso es para referencia en los calculos
 * @param {string} fiat - moneda base(usdt)
 * @param {object} currencies - 
 * @param {object} detailMarginAccount -
 * @return {Promise} - 
 */
const positionCalculator = (fiat, currencies, detailMarginAccount) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate positions in USDT...`);
        for (let currency in currencies) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat) { // && currencies[currency] != "BNB" && currencies[currency] != "BCHA"
                let ticket = await binance.prices(currency);
                // console.log(`currency: ${currency}, ticket: ${ticket[currency]}`);
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
let iErrorLotSizeMMBuy = 0;
const marginMarketBuy = (symbol, quantity, fiat, currencies, detailMarginAccount) => {
    return new Promise((resolve, reject) => {
        binance.mgMarketBuy(symbol, quantity, async(error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0 && nroError[0] != 1013) {
                    reject(`Error marginMarketBuy: ${symbol}, Qty: ${quantity}, ${error.body}`);
                } else if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"}
                    console.error(`Error 1013 Lot-Size. UPDATING..`);
                    detailMarginAccount = await detailAccount(currencies, detailMarginAccount);
                    detailMarginAccount = await positionCalculator(fiat, currencies, detailMarginAccount);
                    detailMarginAccount = await currentSideOffClose(fiat, currencies, detailMarginAccount);

                    console.log(`Error marginMarketBuy_LOT-SIZE-1013: Symbol: ${symbol}, Qty: ${quantity}, UPDATE-detailMarginAccount[symbol]["borrowed"]: ${detailMarginAccount[symbol]["borrowed"]}, ${error.body}`);
                    await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"] - iErrorLotSizeMMBuy, fiat, currencies, detailMarginAccount);
                    iErrorLotSizeMMBuy = iErrorLotSizeMMBuy + 1;

                    // reject(`Error marginMarketBuy: symbol: ${symbol}, Qty: ${quantity}, ${error.body}`);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                iErrorLotSizeMMBuy = 0;
                resolve(response); // cantidad ejecutada => response.fills[0].qty (cantidad ejecutada)
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
let iErrorLotSizeMMSell = 0;
const marginMarketSell = (symbol, quantity, fiat, currencies, detailMarginAccount) => {
    return new Promise((resolve, reject) => {
        binance.mgMarketSell(symbol, quantity, async(error, response) => {
            if (error) {
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0 && nroError[0] != 1013) {
                    reject(`Error marginMarketSell: symbol: ${symbol}, Qty: ${quantity}, ${error.body}`);
                } else if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"}
                    detailMarginAccount = await detailAccount(currencies, detailMarginAccount);
                    detailMarginAccount = await positionCalculator(fiat, currencies, detailMarginAccount);
                    detailMarginAccount = await currentSideOffClose(fiat, currencies, detailMarginAccount);

                    console.log(`Error marginMarketSell_LOT-SIZE-1013: Symbol: ${symbol}, Qty: ${quantity}, UPDATE-detailMarginAccount[symbol]["free"]: ${detailMarginAccount[symbol]["free"]}, ${error.body}`);
                    await marginMarketSell(symbol, detailMarginAccount[symbol]["free"] - iErrorLotSizeMMSell, fiat, currencies, detailMarginAccount);
                    iErrorLotSizeMMSell = iErrorLotSizeMMSell + 1;

                    // reject(`Error marginMarketSell: symbol: ${symbol}, Qty: ${quantity}, ${error.body}`);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                iErrorLotSizeMMSell = 0;
                resolve(response);
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
                console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(response); // [Object: null prototype] { tranId: xxxxxxxxxxx, clientTag: '' }
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
                console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(success = true); // [Object: null prototype] { tranId: xxxxxxxxxxx, clientTag: '' }
            };
        });
    });
};


/**
 * Cierra la posicion que se le pase como parametro en symbol.
 * @param {string} symbol - par
 * @param {string} fiat - moneda base(usdt)
 * @param {object} detailMarginAccount - 
 * @param {object} currencies - 
 * @return {Promise} - 
 */
const closePosition = (symbol, fiat, detailMarginAccount, currencies) => {
    return new Promise(async(resolve, reject) => {
        let minorQty;
        let modified = false;

        if (symbol == fiat || symbol == 'BNBUSDT' || symbol == 'BCHA') {
            console.log(`Symbol: ${symbol}, no valido`);
        } else {
            // arrastro posicion: largo || debo usdt
            if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[symbol]["freeUsdt"] > 10.00) {
                console.log(`***Cerrando posicion LONG ${symbol}, devolviendo ${fiat}..`);
                let resMarginMarketSell = await marginMarketSell(symbol, detailMarginAccount[symbol]["free"], fiat, currencies, detailMarginAccount);
                minorQty = (detailMarginAccount[fiat]["borrowed"] <= resMarginMarketSell.cummulativeQuoteQty) ? detailMarginAccount[fiat]["borrowed"] : resMarginMarketSell.cummulativeQuoteQty;
                await marginRepay(fiat, minorQty);
                // resolve(`symbol: ${symbol}, modified`);
                resolve(modified = true);

                // shortFail / no fue posicion short || me prestaron crypto, pero no se vendio || debo crypto
            } else if (detailMarginAccount[symbol]["freeUsdt"] > 10.00 && detailMarginAccount[symbol]["borrowedUsdt"] > 10.00) {
                console.log(`***Shortfail (devolviendo ${currencies[symbol]}, sin inicio de short)..`);
                minorQty = (detailMarginAccount[symbol]["borrowed"] <= detailMarginAccount[symbol]["free"]) ? detailMarginAccount[symbol]["borrowed"] : detailMarginAccount[symbol]["free"];
                await marginRepay(currencies[symbol], minorQty);
                // resolve(`symbol: ${symbol}, modified`);
                resolve(modified = true);

                // arrastro posicion: corto || debo crypto
            } else if (detailMarginAccount[symbol]["freeUsdt"] < 10.00 && detailMarginAccount[symbol]["borrowedUsdt"] > 10.00) {
                console.log(`***Cerrando posicion SHORT ${symbol}, devolviendo ${currencies[symbol]}..`);
                await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"], fiat, currencies, detailMarginAccount);
                await detailAccount(currencies, detailMarginAccount);
                await positionCalculator(fiat, currencies, detailMarginAccount);
                await currentSideOffClose(fiat, currencies, detailMarginAccount);
                minorQty = (detailMarginAccount[symbol]["borrowed"] <= detailMarginAccount[symbol]["free"]) ? detailMarginAccount[symbol]["borrowed"] : detailMarginAccount[symbol]["free"];
                await marginRepay(currencies[symbol], minorQty);
                // resolve(`symbol: ${symbol}, modified`);
                resolve(modified = true);

                // tengo cripto comprado, pero sin apalancamiento
            } else if (detailMarginAccount[symbol]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] < 10.00) {
                console.log(`...Quedo crypto rezagado,  ${symbol}`);
                await marginMarketSell(currency, detailMarginAccount[symbol]["free"], fiat, currencies, detailMarginAccount);
                // resolve(`symbol: ${symbol}, modified`);
                resolve(modified = true);

                // tengo cripto comprado, pero sin apalancamiento
            } else if (detailMarginAccount[symbol]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                console.log(`***Cerrando posicion LONG ${symbol}, (pero sin apalancamiento), NO debo ${fiat}..`);
                await marginMarketSell(symbol, detailMarginAccount[symbol]["free"], fiat, currencies, detailMarginAccount);
                // resolve(`modified`);
                resolve(modified = true);


            } else if (detailMarginAccount[symbol]["borrowedUsdt"] > 10.00 && detailMarginAccount[symbol]["freeUsdt"] < 10.00) {
                await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"], fiat, currencies, detailMarginAccount);
                await detailAccount(currencies, detailMarginAccount);
                await positionCalculator(fiat, currencies, detailMarginAccount);
                await currentSideOffClose(fiat, currencies, detailMarginAccount);
                minorQty = (detailMarginAccount[symbol]["borrowed"] <= detailMarginAccount[symbol]["free"]) ? detailMarginAccount[symbol]["borrowed"] : detailMarginAccount[symbol]["free"];
                await marginRepay(currencies[symbol], minorQty);
                // resolve(`symbol: ${symbol}, modified`);
                resolve(modified = true);

            } else {
                // resolve(`noModified`);
                resolve(modified); // modified=false
            };
        };
    });
};


/**
 * Verifica si el par esta con posicion existente en long o short, de lo contrario no hay posicion (es null). 
 * Y si hay posicion invalida (a medio terminar) las cierra.
 * @param {string} fiat - moneda base(usdt)
 * @param {object} currencies - 
 * @param {object} detailMarginAccount - 
 * @return {Promise}
 */
const currentSide = (fiat, currencies, detailMarginAccount) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate current side position...`);
        let status = 'noModified';

        for (let currency in currencies) { // currency = symbol
            if (currencies[currency] != fiat && currencies[currency] != 'BNBUSDT') { // && currencies[currency] != "BNB" && currencies[currency] != "BCHA"

                // tengo posicion: long
                if (detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                    detailMarginAccount[currency].currentSideMargin = "long";
                    console.log(`*** Current position ${currency}: long`);

                    // tengo posicion: short
                } else if (detailMarginAccount[currency]["borrowedUsdt"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] < 10.00) {
                    detailMarginAccount[currency].currentSideMargin = "short";
                    console.log(`*** Current position ${currency}: short`);

                    // shortFail / tengo prestamo crypto, pero no posicion short
                } else if (detailMarginAccount[currency]["borrowedUsdt"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`*** Current position ${currency}: null. Active crypto loan ${detailMarginAccount[currency]["borrowed"]} (USDT: ${detailMarginAccount[currency]["borrowedUsdt"]})`);
                    let minorQty = (detailMarginAccount[currency]["borrowed"] <= detailMarginAccount[currency]["free"]) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                    await marginRepay(currencies[currency], minorQty);
                    detailMarginAccount[currency].currentSideMargin = null;
                    status = 'modified';

                    // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                } else if (detailMarginAccount[fiat]["borrowed"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`*** Current position ${currency}: null. Holding crypto without a loan ${detailMarginAccount[currency]["free"]} (USDT: ${detailMarginAccount[currency]["freeUsdt"]})`);
                    await marginMarketSell(currency, detailMarginAccount[currency]["free"], fiat, currencies, detailMarginAccount);
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


const currentSideOffClose = (fiat, currencies, detailMarginAccount) => {
    return new Promise((resolve, reject) => {
        console.log(`- Calculate current side position...`);
        // console.log(currency); // par-symbol
        // console.log(currencies[currency]); // moneda

        for (let currency in currencies) { // currency = symbol
            if (currencies[currency] != fiat) { // && currencies[currency] != "BNB" && currencies[currency] != "BCHA"

                // tengo posicion: long
                if (detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                    detailMarginAccount[currency].currentSideMargin = "long";

                    // tengo posicion: short
                } else if (detailMarginAccount[currency]["borrowedUsdt"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] < 10.00) {
                    detailMarginAccount[currency].currentSideMargin = "short";

                    // shortFail / tengo prestamo crypto, pero no posicion short
                } else {
                    detailMarginAccount[currency].currentSideMargin = null;
                };
            };
        };
        resolve(detailMarginAccount);
    });
};


/**
 * LLama a otras funciones para hacer un calculo completo de los detalles de la cuenta de margin
 * @param {string} fiat - moneda base(usdt)
 * @param {object} currencies - contine par - symbol
 * @param {object} detailMarginAccount -
 * @return {Promise}
 */
const detailMarginAcc = (fiat, currencies, detailMarginAccount) => {
    return new Promise(async(resolve, reject) => {
        detailMarginAccount = await detailAccount(currencies, detailMarginAccount);
        detailMarginAccount = await positionCalculator(fiat, currencies, detailMarginAccount);
        responseCurrentSide = await currentSide(fiat, currencies, detailMarginAccount);
        if (responseCurrentSide == 'modified') {
            resolve(await detailMarginAcc(fiat, currencies, detailMarginAccount));
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
 * @param {object} detailMarginAccount - 
 * @param {object} currencies - 
 * @return {Promise}
 */
let operation = 0; // contador de operaciones
const order = (signal, symbol, close, lot, fiat, detailMarginAccount, currencies) => {
    return new Promise(async(resolve, reject) => {
        let minorQty,
            quantity,
            qty;

        if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == null) { // 1er operacion: prestamo usdt y long
            operation++;
            console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            qty = calcQuantity(close, lot);
            quantity = formatQuantity(qty);
            console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
            await marginBorrow(fiat, lot);
            await marginMarketBuy(symbol, quantity, fiat, currencies, detailMarginAccount); // quantity = quantityCurrency[symbol]
            console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);
        } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == null) { // 1er operacion: prestamo crypto y short
            operation++;
            console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            qty = calcQuantity(close, lot);
            quantity = formatQuantity(qty);
            console.log(`symbol: ${symbol}, close: ${close}, calcQuantity: ${qty}, formatQuantity: ${quantity}`);
            await marginBorrow(currencies[symbol], quantity); // quantity = quantityCurrency[symbol]
            await marginMarketSell(symbol, quantity, fiat, currencies, detailMarginAccount, iErrorLotSizeMMSell);
            console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);
        } else if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
            operation++;
            console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            qty = calcQuantity(close, lot);
            quantity = formatQuantity(qty);
            console.log(`symbol: ${symbol}, close: ${close}, formatQuantity: ${quantity}`);
            await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"], fiat, currencies, detailMarginAccount);
            await detailAccount(currencies, detailMarginAccount);
            await positionCalculator(fiat, currencies, detailMarginAccount);
            await currentSideOffClose(fiat, currencies, detailMarginAccount);
            // await detailMarginAcc(fiat, currencies, detailMarginAccount);
            minorQty = (detailMarginAccount[symbol]["borrowed"] <= detailMarginAccount[symbol]["free"]) ? detailMarginAccount[symbol]["borrowed"] : detailMarginAccount[symbol]["free"];
            await marginRepay(currencies[symbol], minorQty); // parseFloat(resMarginMarketBuy.executedQty) / parseFloat(resMarginMarketBuy.fills[0].qty)
            await marginBorrow(fiat, lot);
            await marginMarketBuy(symbol, quantity, fiat, currencies, detailMarginAccount);
            console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);

        } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
            operation++;
            console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            qty = calcQuantity(close, lot);
            quantity = formatQuantity(qty);
            console.log(`symbol: ${symbol}, close: ${close}, formatQuantity: ${quantity}`);
            await marginMarketSell(symbol, detailMarginAccount[symbol]["free"], fiat, currencies, detailMarginAccount);
            // await detailAccount(currencies, detailMarginAccount);
            // await positionCalculator(fiat, currencies, detailMarginAccount);
            // await currentSideOffClose(fiat, currencies, detailMarginAccount);
            // await detailMarginAcc(fiat, currencies, detailMarginAccount);
            await marginRepay(fiat, lot); // antes lot. lo que obtuve de vta parseFloat(resMarginMarketSell.cummulativeQuoteQty);
            await marginBorrow(currencies[symbol], quantity);
            await detailAccount(currencies, detailMarginAccount);
            await positionCalculator(fiat, currencies, detailMarginAccount);
            await currentSideOffClose(fiat, currencies, detailMarginAccount);
            // await detailMarginAcc(fiat, currencies, detailMarginAccount);
            await marginMarketSell(symbol, detailMarginAccount[symbol]["free"], fiat, currencies, detailMarginAccount); // antes quantity
            console.log(`----------------------------OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);

        } else if (signal == 'close' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // cerrar posicion 
            console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}----------------------------`);
            await closePosition(symbol, fiat, detailMarginAccount, currencies);
            console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);
        } else if (signal == 'close' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // cerrar posicion 
            console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}----------------------------`);
            await closePosition(symbol, fiat, detailMarginAccount, currencies);
            console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}----------------------------`);
            console.log(`-------------------------------------------------------------------------------------------------\n`);
            resolve(true);
        } else if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // no operable
            signal == 'undefined';
            resolve(false);
        } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // no operable
            signal == 'undefined';
            resolve(false);
        } else {
            resolve(false);
        };


        reject(`Error Order`);
    });
};


/**
 * Procesa los datos del backtesting(objDataBackTesting) realizado a todos los pares disponibles en el comercio de margen, 
 * y elige la cantidad establecida(magicAmmount) con mejores rentabilidades, para agregarlas al array markets previamente vaciado.
 * El array markets es donde se almacenan los pares que opera el bot.
 * @param {number} magicAmmount - cantidad de pares que desea que opere el bot
 * @param {array} objDataBackTesting - array de obj que contiene los datos del backtesting realizado a todos los pares
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

        console.log("\n\n===========================================================");
        console.log(`Magic has chosen, Markets[${markets.length}]: ${markets}`);
        console.log("===========================================================");
        console.log(`Total Operations: ${totalOp}`);
        console.log(`Winners: ${totalWin}, Losers: ${totalLos}`);
        console.log(`Success: % ${totalSuccessPercent}`);
        console.log(`Total Profit of magic: % ${profit}`);
        console.log("=========================================================== \n");

        // objDataBackTesting = [];

        resolve(markets);
    });
};



//-------------------------------------------------------------------------------------------------------------------------------//


let inputHistoryCandlestick = {}; // obj con los datos del historico de velas
// ej:
// {
// ALGOUSDT: {
//     open: [],
//     close: [],
//     high: [],
//     low: [],
//     volume: []
//   }
// }


/**
 * Funcion iife donde converge la logica.
 * @param {object} binance - conexion a binance
 */
const trading = (async _ => {
    try {
        // let markets = ['IOSTUSDT', 'KSMUSDT', 'IOTAUSDT', 'ZILUSDT', 'EGLDUSDT', 'UNIUSDT', 'NEOUSDT', 'AVAXUSDT', 'ALGOUSDT', 'THETAUSDT', 'DOTUSDT', 'MATICUSDT'], // pares a operar por el bot, si flagOnMagic es true entonces esto sera ignorado
        let markets = ['BTCUSDT'], // pares a operar por el bot, si flagOnMagic es true entonces esto sera ignorado
            timeFrame = "15m", // intervalo de las velas    
            fiat = "USDT", // default: USDT || moneda base
            lot = 40.00, // valor lote en fiat (USDT)
            start = false, // default: true || start del bot
            realTime = true, // prefiere esperar que la vela se cierre, false. || prefiere que si la estrategia da senial y la vela aun no se cerro, el bot ejecute la orden, true
            closeAllPosition = false, // default false || vende las posiciones y repaga los prestamos existentes, dejando los pares en cero al arranque de la app
            flagBackTesting = false, // default: false || inicia backtesting
            invertSignal = false, // default: false || invierte la senal (ej: si es 'buy' se convierte a 'sell', idem si es 'sell') || falta implementarlo con el backtesting
            flagOnMagic = false, // default: false || a partir de todos los pares en margen, elige las monedas de forma automatizada y con mejores rendimiento basado en backtesting
            magicAmmount = 58, // cantidad de monedas que elegira la opcion flagOnMagic para operar
            currencies = {}, // obj que contiene los nombres de las monedas, // ej: { USDT: 'USDT', ONTUSDT: 'ONT', THETAUSDT: 'THETA', ALGOUSDT: 'ALGO' }
            detailMarginAccount = {}; // obj que contiene los detalles de la cuenta de margen

        let resultBackTesting;

        console.log("***Abechennon Margin Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Start: ${start} | Real-Time: ${realTime} | Magic: ${flagOnMagic} \n`);
        console.log(`Close all positions: ${closeAllPosition} | Back-Testing: ${flagBackTesting} | Invert signal: ${invertSignal} \n`);


        // await marginMarketSell('BTCUSDT', quantity);
        // await marginMarketBuy('BTCUSDT', 0.00061);

        if (flagOnMagic == false) {
            console.log(`Markets: ${markets} \n`);
        } else {
            console.log(`Markets: magic is calculating it...  \n`);
        };

        // activar magic
        if (flagOnMagic == true) {
            currencies = await marginMarketsAvailable(currencies); // genera un obj con los nombres de TODAS las monedas a partir de consulta a la API| (-'BCHA')
            markets = await buildMarketsSymbol(currencies, markets);
            await historyCandlesticks(markets, timeFrame, realTime); // recupera de la API el historico de velas
            await detailMarginAcc(fiat, currencies, detailMarginAccount); // recupera de la API los datos de la cuenta de margen

            // console.log(`markets: ${markets.length}`); // total: 58 mercados

            // procesamiento para obtener resultados del backtesting
            for await (symbol of markets) {
                let dataBackTesting = await strategyAdxRsi(symbol, inputHistoryCandlestick[symbol], false, true, 3, 15, 85, true, 14, 25, 7, 13, 30, 100, 2); // (symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, lengthAdx, signalAdx, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolumeFast, lengthSmaVolumeSlow, thresholdVolumeMarkets)
                resultBackTesting = await backTesting(dataBackTesting); // se calculan rentabilidades
            };
            // console.log(resultBackTesting);
            markets = await magic(magicAmmount, resultBackTesting, markets); // elige los mejores pares
            currencies = await buildNameCurrency(markets, currencies); // a partir de markets construye el obj currencies
        } else {
            currencies = buildNameCurrency(markets, currencies); // genera un obj con los nombres de las monedas a partir del array markets, ej: { USDT: 'USDT', ONTUSDT: 'ONT', THETAUSDT: 'THETA', ALGOUSDT: 'ALGO' }
            await historyCandlesticks(markets, timeFrame, realTime); // recupera de la API el historico de velas. Itera en array markets
            await detailMarginAcc(fiat, currencies, detailMarginAccount); // recupera de la API los datos de la cuenta de margen | 1. itera currencies | 2 y 3. Itera currencies(- 'USDT', 'BNB', 'BCHA')
        };

        // cerrar todas las posiciones (las que esten en el array markets)
        if (closeAllPosition == true) {
            console.log(`- Close all position: true !`);
            let closePositionModified,
                responseMarginRepayFiat; // no devuelve 'modified'

            for await (let symbol of markets) {
                responseClosePosition = await closePosition(symbol, fiat, detailMarginAccount, currencies);
                if (responseClosePosition == true) {
                    closePositionModified = true;
                };
            };
            if (detailMarginAccount[fiat]["borrowed"] > 0) {
                responseMarginRepayFiat = await marginRepay(fiat, detailMarginAccount[fiat]["borrowed"]);
            };
            if (closePositionModified == true || responseMarginRepayFiat == true) {
                await detailMarginAcc(fiat, currencies, detailMarginAccount);
            };
        };

        // activar backtesting (las que esten en el array markets)
        if (flagBackTesting == true) {
            for await (let symbol of markets) {
                /**
                 * si usted no soy yo, las siguientes lineas comentadas no le sirven (son funciones 
                 * de estrategia experimental y personal, no incluida en Git)
                 */
                // for (let length = 1; length < 10; length++) {
                //     console.log(`length: ${length}`);
                //     let dataBackTesting = await strategyAdxRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, true, 3, 15, 85, 14, 25, 5, 13, 30, 100, length); // (symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, lengthAdx, signalAdx, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolumeFast, lengthSmaVolumeSlow, thresholdVolumeMarkets)
                //     // console.log(dataBackTesting);
                //     resultBackTesting = await backTesting(dataBackTesting);
                //     console.log(resultBackTesting);
                //     console.log(`-------------------------------------------------------`);
                // };

                // let dataBackTesting = await classicRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, true, 3, 15, 85); // obtiene seniales de la estrategia
                // let dataBackTesting = await strategyAdxRsi(symbol, inputHistoryCandlestick[symbol], false, true, 3, 15, 85, 14, 25, 7, 13, 10, 100, 2); // (symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, lengthAdx, signalAdx, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolumeFast, lengthSmaVolumeSlow, thresholdVolumeMarkets)
                // let dataBackTesting = await classicRsiWithCrossover(symbol, inputHistoryCandlestick[symbol], false, true, 3, 15, 85)
                let dataBackTesting = strategySmaRsi(symbol, inputHistoryCandlestick[symbol], false, true, 3, 15, 85, true, 7, 13, 10, 2.8); // symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, crossover = true, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolume, thresholdVolumeMarkets
                // console.log(dataBackTesting);
                resultBackTesting = await backTesting(dataBackTesting); // se calculan rentabilidades
            };
            console.log(resultBackTesting);

        };


        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        // console.log(detailMarginAccount['BTCUSDT']["free"]);


        let isFinally;
        let runOrder = false; // control de flujo entre websocket.candlesticks e interval
        let final = 0; // control de flujo entre websocket.candlesticks e interval


        // websocket recupera de la API los datos de las velas
        let wsCandlesticks = await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;

            isFinally = isFinal;

            if (realTime == false) {
                if (isFinal == true && runOrder == false) {
                    final += 1;
                    await updatedHistoryCandlesticks(candlesticks);
                    if (final == markets.length) {
                        runOrder = true;
                    };
                };
            } else { // realTime == true
                if (isFinal == false) {
                    await updatedHistoryCandlesticksRealTimeData(candlesticks);
                } else {
                    await updatedHistoryCandlesticks(candlesticks);
                };
            };
            // console.log(util.inspect(inputHistoryCandlestick[symbol].volume, { maxArrayLength: null }));
        });


        // escucha al websocket para ejecutar las ordenes de comercio cuando corresponda
        interval(async() => {

            if (realTime == false && runOrder == true) {
                let updateDetailMarginAcc = false;

                for await (let symbol of markets) {
                    let { open, close, high, low, booleanIsFinal } = inputHistoryCandlestick[symbol]; // ultimo close del array: close[close.length-1]

                    let signal = await classicRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, false, 3, 15, 85); // obtiene seniales de la estrategia

                    if (start == true && signal !== undefined) {
                        await order(signal, symbol, close[close.length - 1], lot, fiat, detailMarginAccount, currencies);
                        updateDetailMarginAcc = true;
                    };
                };
                if (updateDetailMarginAcc == true) {
                    await detailMarginAcc(fiat, currencies, detailMarginAccount);
                    updateDetailMarginAcc = false;
                };
                final = 0;
                runOrder = false;

            } else if (realTime == true) {
                // console.log(inputHistoryCandlestick);
                for await (let symbol of markets) {
                    let { open, close, high, low, booleanIsFinal } = inputHistoryCandlestick[symbol]; // ultimo close del array: close[close.length-1]

                    // let objectSignal = await classicRsi(symbol, inputHistoryCandlestick[symbol], invertSignal, false, 3, 15, 85); // obtiene seniales de la estrategia
                    // let objectSignal = await strategyAdxRsi(symbol, inputHistoryCandlestick[symbol], false, false, 3, 15, 85, true, 14, 25, 7, 13, 30, 100, 100); // (symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, lengthAdx, signalAdx, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolumeFast, lengthSmaVolumeSlow, thresholdVolumeMarkets)
                    let objectSignal = strategySmaRsi(symbol, inputHistoryCandlestick[symbol], false, false, 3, 15, 85, true, 7, 13, 10, 2.8); // symbol, src, invertSignal = false, backTesting = false, lengthRsi, oversold, overbought, crossover = true, lengthSmaCloseFast, lengthSmaCloseSlow, lengthSmaVolume, thresholdVolumeMarkets
                    let signal = objectSignal[symbol].signal;

                    if (start == true && signal !== undefined) {
                        // console.log(`isFinally: ${isFinally}, symbol: ${symbol}, signal: ${signal}, close: ${close[close.length - 1]}`);
                        let responseOrder = await order(signal, symbol, close[close.length - 1], lot, fiat, detailMarginAccount, currencies);
                        if (responseOrder == true) {
                            updateDetailMarginAcc = true;
                        };
                    };
                };
                if (updateDetailMarginAcc == true) {
                    await detailMarginAcc(fiat, currencies, detailMarginAccount);
                    updateDetailMarginAcc = false;
                };

            };

        }, 2000, { iterations: Infinity, stopOnError: false });


    } catch (error) {
        console.error(error);
    };
})(binance);

// module.exports = {  };