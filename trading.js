/* ============================================================
 * Abechennon Margin Trader-Bot Binance
 * https://github.com/pablob206/abechennon-traderbot
 * ============================================================
 * 2021 - Pablo Brocal - pablob206@hotmail.com
 * ============================================================
 * Null Copyright--
 * 
 */


const { response } = require('express');
const binance = require('./config/exchange');
const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const backTesting = require('./backTesting');
const waves = require('./pStrategy/strategyWaves');
const classicRsi = require('./strategy/strategyRsi');


/**
 * Trae de la API las ultimas 500 candlesticks
 * @param {array} markets - mercados que trae
 * @param {number} timeFrame - intervalo de tiempo de las candlesticks
 * @return {Promise}
 */
const historyCandlesticks = (markets, timeFrame) => {
    return new Promise((resolve, reject) => {
        markets.forEach(async(symbol, idx, market) => {
            inputHistoryCandlestick[symbol] = {
                open: [],
                close: [],
                high: [],
                low: []
            };
            await binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
                // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
                ticks.pop(); // elimina el ultimo por que no es "isFinal"
                ticks.map((curr, idx, src) => {
                    inputHistoryCandlestick[symbol].open.push(parseFloat(curr[1]));
                    inputHistoryCandlestick[symbol].high.push(parseFloat(curr[2]));
                    inputHistoryCandlestick[symbol].low.push(parseFloat(curr[3]));
                    inputHistoryCandlestick[symbol].close.push(parseFloat(curr[4]));
                });
            });
        });
        resolve(inputHistoryCandlestick);
    });
};

/**
 * Actualiza el historial de candlesticks
 * @param {object} candlesticks - objeto de la API con los ultimos valores de la vela
 * @return {Promise} 
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
        if (error) {
            reject(error);
        };
    });
};

/**
 * Calcula la cantidad de crypto a operar en base al lote asignado en fiat(usdt)
 * @param {number} close - ultimo precio de cierre
 * @param {number} lot - lote asignado en fiat(usdt)
 * @return {Promise}
 */
// error, formatea el valor redondeando hacia abajo y despues no alcanza para pagarse todo el prestamo
// ej: debo 0.00700700, la funcion formatea a 0.007, el exchange lo redondea a 0.00699300, y me queda saldo sin devolver 0.00001400, corregir!
const calcQuantity = (close, lot) => {
    return new Promise((resolve, reject) => {
        let quantity = (lot - 1) / close; // resto 1 a lot para que no este tan ajustado los prestamos
        let resQuantityNro = formatQuantity(quantity);
        resolve(resQuantityNro);

        // resolve(formatQuantity(quantity));
        if (error) {
            reject(error);
        };
    });
};


/**
 * Le da formato a un nro no admitido, por ej: 0.0070628(no admitido) a 0.0070(si admitido)
 * @param {number} value - valor no admitido
 * @return {number} - un valor admitido
 */
const formatQuantity = value => { // debo agregar un parametro mas, que indicaria a que cantidad de digitos debe ser formateada la cifra
    let pEntera = Math.floor(value);
    let resValueNro;

    if (pEntera > 0) {
        resValueNro = parseFloat(value.toFixed(2));
    } else {
        let flagFloat = false;
        let flagZero = true;
        let flagFirstDig = false;
        let flagSecondDig = false;
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
        console.log(`***Formating quantity:  ${resValueNro}`);
        return resValueNro;
    };
};

//Aun no desarrollado.
/**
 * Genera los nombres de las monedas a partir de los nombres de los pares, ej: "ADA" : "ADAUSDT"
 * @param {array} markets - mercados a operar
 * @return {object}
 */
const buildNameCurrency = (markets) => {
    markets.forEach((curr, idx, market) => {});
    return nameCurrencies;
};

// mgAccount: function(callback, isIsolated = false) {
//     // const endpoint = 'v1/margin' + (isIsolated) ? '/isolated' : '' + '/account' // original, no funciona
//     const endpoint = `v1/margin${isIsolated ? '/isolated' : '' }/account` // https://github.com/jaggedsoft/node-binance-api/issues/688
//     signedRequest(sapi + endpoint, {}, function(error, data) {
//         if (callback) return callback(error, data);
//     });
// },

/**
 * Trae de la API los detalles de la cuenta de margin
 * @return {Promise} detailMarginAccount
 */
const detailAccount = () => {
    return new Promise(async(resolve, reject) => {
        try {
            console.log(`- Loading detail margin account...`);
            await binance.mgAccount((error, response) => {
                if (error) return console.warn(error);
                let account = response.userAssets.filter(curr => { // account: no es usado, en vez de eso se agrega los datos al objeto detailMarginAccount
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


/**
 * Modifica el objeto detailMarginAccount, agregandole el freeUsdt y borrowedUsdt.
 * freeUsdt: es la propiedad free (balance libre/disponible), pero convertido en usdt. Su uso es para referencia en los calculos
 * borrowedUsdt: es la propiedad borrowed (prestado), pero convertido en usdt. Su uso es para referencia en los calculos
 * @param {string} fiat - usdt
 * @param {object} responseDetailAccount - objeto currencies
 * @return {Promise} detailMarginAccount
 */
const positionCalculator = (fiat, responseDetailAccount) => {
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate positions in USDT...`);
        try {
            for (let currency in responseDetailAccount) {
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


// verificar este: {"code":-2010,"msg":"Account has insufficient balance for requested action."}
//0.0070628
/**
 * Orden mercado de compra en margin
 * param {string} symbol - par
 * param {number} quantity
 * return {Promise}
 */
const marginMarketBuy = (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgMarketBuy(symbol, quantity, async(error, response) => {
            if (error) {
                console.log(`Error marginMarketBuy: ${error.body}`);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"} // error de formato
                    quantity = formatQuantity(quantity);
                    response = await marginMarketBuy(symbol, quantity);
                    // resolve(parseFloat(response.fills[0].qty));
                    resolve(response);
                } else {
                    console.log(`Error marginMarketBuy: ${error.body}`);
                    reject(error);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                // resolve(parseFloat(response.fills[0].qty)); // devuelvo la cantidad ejecutada
                resolve(response); // devuelvo la cantidad ejecutada
            };
        });
    });
};


/**
 * Orden mercado de venta en margin
 * param {string} symbol - par
 * param {number} quantity
 * return {Promise}
 */
const marginMarketSell = (symbol, quantity) => {
    return new Promise((resolve, reject) => {
        let qty = formatQuantity(quantity);
        binance.mgMarketSell(symbol, qty, async(error, response) => {
            if (error) {
                console.log(`Error marginMarketSell: ${error.body}`);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"} // error de formato
                    quantity = formatQuantity(qty);
                    response = await marginMarketSell(symbol, quantity);
                    resolve(response);
                } else {
                    console.log(`Error marginMarketSell: ${error.body}`);
                    reject(error);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.fills[0].qty} (usdt ${response.cummulativeQuoteQty}), status: ${response.status}`);
                resolve(response);
            };
        });

    });
};


/**
 * Orden de prestamo en margin
 * param {string} currency - moneda
 * param {number} quantity
 * return {Promise}
 */
const marginBorrow = (currency, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgBorrow(currency, quantity, (error, response) => {
            if (error) {
                console.error(`Error marginBorrow: ${error.body}`);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0) {
                    quantity = formatQuantity(quantity);
                    // await marginBorrow(currency, quantity);
                    setTimeout((currency, quantity) => { // el retardo es por si el rechazo es debido a un error de tiempo del servidor del exchange
                        response = marginBorrow(currency, quantity);
                        resolve(response);
                    }, 1000);
                } else {
                    console.error(`Error marginBorrow: ${error.body}`);
                    reject(error);
                };
            } else {
                console.log(`BORROW, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(response); // [Object: null prototype] { tranId: 69655107900, clientTag: '' }
            };
        });

    });
};


/**
 * Orden para repagar prestamo en margin
 * param {string} currency - moneda
 * param {number} quantity
 * return {Promise}
 */
const marginRepay = (currency, quantity) => {
    return new Promise((resolve, reject) => {
        binance.mgRepay(currency, quantity, (error, response) => {
            if (error) {
                console.error(`Error marginRepay: ${error.body}`);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] != 0) {
                    quantity = formatQuantity(quantity);
                    // await marginRepay(currency, quantity);
                    setTimeout((currency, quantity) => { // el retardo es por si el rechazo es debido a un error de tiempo del servidor del exchange
                        response = marginRepay(currency, quantity);
                        resolve(response);
                    }, 1000);
                } else {
                    console.error(`Error marginRepay: ${error.body}`);
                    reject(error);
                };
            } else {
                console.log(`REPAY, quantity: ${currency} ${quantity}, Status: SUCCESS`);
                resolve(response); // [Object: null prototype] { tranId: 69655809971, clientTag: '' }
            };
        });
    });
};


const closeAllCryptoPosition = fiat => {
    return new Promise(async(resolve, reject) => {
        let status;

        for (let currency in detailMarginAccount) {
            // console.log(currency); // par-symbol
            // console.log(currencies[currency]); // moneda
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // arrastro posicion: largo || debo usdt
                if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`***Cerrando posicion LONG, devolviendo ${fiat}..`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                    let minorQty = (resMarginMarketSell.cummulativeQuoteQty <= detailMarginAccount[fiat]["borrowed"]) ? resMarginMarketSell.cummulativeQuoteQty : detailMarginAccount[fiat]["borrowed"];
                    await marginRepay(fiat, minorQty);
                    status = "modified";

                    // shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Shortfail (devolviendo ${currencies[currency]}, sin inicio de short)..`);
                    let minorQty = (detailMarginAccount[currency]["borrowedUsdt"] <= detailMarginAccount[currency]["freeUsdt"]) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                    await marginRepay(currencies[currency], minorQty);
                    status = "modified";

                    // arrastro posicion: corto || debo crypto
                } else if (detailMarginAccount[currency]["freeUsdt"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] > 10.00) {
                    console.log(`***Cerrando posicion SHORT, devolviendo ${currencies[currency]}..`);
                    const resMarginMarketBuy = await marginMarketBuy(currency, detailMarginAccount[currency]["borrowed"]);
                    await marginRepay(currencies[currency], parseFloat(resMarginMarketBuy.fills[0].qty));
                    status = "modified";

                    // quedo crypto rezagado
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] < 10.00) {
                    console.log(`...Quedo crypto rezagado`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                    status = "modified";

                    // tengo cripto comprado, pero sin apalancamiento
                } else if (detailMarginAccount[currency]["freeUsdt"] > 10.00 && detailMarginAccount[fiat]["borrowed"] > 10.00) {
                    console.log(`***Cerrando posicion LONG (pero sin apalancamiento), NO debo ${fiat}..`);
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
 * @param {string} fiat - usdt
 * @param {string} responsePositionCalculator - objeto currencies
 * @return {Promise}
 */
const currentSide = (fiat, responsePositionCalculator) => { // currency = symbol/par
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate current side position...`);
        // console.log(currency); // par-symbol
        // console.log(currencies[currency]); // moneda
        let status = 'noModified';

        for (let currency in responsePositionCalculator) { // currency = symbol
            if (currencies[currency] != fiat && currencies[currency] != "BNB") {
                // tengo posicion: long
                if (detailMarginAccount[fiat]["borrowed"] > 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
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
                    let minorQty = (detailMarginAccount[currency]["borrowedUsdt"] <= detailMarginAccount[currency]["freeUsdt"]) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                    const resMarginRepay = await marginRepay(currencies[currency], minorQty);
                    detailMarginAccount[currency].currentSideMargin = null;
                    status = 'modified';

                    // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                } else if (detailMarginAccount[fiat]["borrowed"] < 10.00 && detailMarginAccount[currency]["borrowedUsdt"] < 10.00 && detailMarginAccount[currency]["freeUsdt"] > 10.00) {
                    console.log(`*** Current position ${currency}: null. Holding crypto without a loan ${detailMarginAccount[currency]["free"]} (USDT: ${detailMarginAccount[currency]["freeUsdt"]})`);
                    const resMarginMarketSell = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
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
 * @param {string} fiat - usdt
 * @return {Promise}
 */
const detailMarginAcc = fiat => {
    return new Promise(async(resolve, reject) => {
        try {
            let responseDetailAccount = await detailAccount(fiat);
            let responsePositionCalculator = await positionCalculator(fiat, responseDetailAccount);
            let responseCurrentSide = await currentSide(fiat, responsePositionCalculator);
            if (responseCurrentSide == 'modified') {
                detailMarginAcc(fiat);
            } else {
                resolve(responseCurrentSide);
            };
        } catch (error) {
            reject(error);
        };
    });
};


/**
 * Ejecucion de ordenes de margin, en esquema ping-pong (o sea, la senial buy es para cerrar un short y abrir
 * un long, igual a la inversa)
 * @param {string} signal - senial de la estrategia
 * @param {string} symbol - par
 * @param {string} close - ultimo precio de cierre de la vela
 * @param {string} lot - lote asignado a la orden
 * @param {string} fiat - usdt
 * @return {Promise}
 */
let operation = 0;
const order = (signal, symbol, close, lot, fiat) => {
    return new Promise(async(resolve, reject) => {
        try {
            let minorQty;
            let responseDetailAccount;
            let resMarginMarketBuy = 0;
            let resMarginMarketSell = 0;
            if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
                // currency = currencies[symbol];
                // quantity = quantityCurrency[symbol];
                let quantity = await calcQuantity(close, lot);
                if (signal == 'buy') { // 1er operacion: prestamo usdt y long
                    operation++;
                    console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginBorrow(fiat, lot);
                    resMarginMarketBuy = await marginMarketBuy(symbol, quantity); // quantity = quantityCurrency[symbol]
                    console.log(`----------------------------INIT OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("success");
                } else if (signal == 'sell') { // 1er operacion: prestamo crypto y short
                    operation++;
                    console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    resMarginBorrow = await marginBorrow(currencies[symbol], quantity); // quantity = quantityCurrency[symbol]
                    resMarginMarketSell = await marginMarketSell(symbol, quantity);
                    console.log(`----------------------------INIT OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("success");
                };
            } else if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] != null) {
                let quantity;
                // let quantity = await calcQuantity(close, lot);
                if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
                    operation++;
                    console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    resMarginMarketBuy = await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"]);
                    responseDetailAccount = await detailAccount(fiat);
                    // let minorQty = (resMarginMarketBuy.executedQty <= detailMarginAccount[symbol]["free"]) ? parseFloat(resMarginMarketBuy.executedQty) : parseFloat(detailMarginAccount[symbol]["free"]);
                    // console.log(`executedQty: ${resMarginMarketBuy.executedQty} / fills[0].qty: ${resMarginMarketBuy.fills[0].qty} / symbol.borrowed: ${responseDetailAccount[symbol]["borrowed"]} / symbol.free: ${responseDetailAccount[symbol]["free"]}`);
                    minorQty = (responseDetailAccount[symbol]["borrowed"] <= responseDetailAccount[symbol]["free"]) ? responseDetailAccount[symbol]["borrowed"] : responseDetailAccount[symbol]["free"];
                    await marginRepay(currencies[symbol], minorQty); // parseFloat(resMarginMarketBuy.executedQty) / parseFloat(resMarginMarketBuy.fills[0].qty)
                    await marginBorrow(fiat, lot);
                    quantity = await calcQuantity(close, lot);
                    resMarginMarketBuy = await marginMarketBuy(symbol, quantity);
                    console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("success");

                } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
                    operation++;
                    console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    resMarginMarketSell = await marginMarketSell(symbol, detailMarginAccount[symbol]["free"]);
                    responseDetailAccount = await detailAccount(fiat);
                    // console.log(`executedQty: ${resMarginMarketSell.executedQty} / fills[0].qty: ${resMarginMarketSell.fills[0].qty} / fiat.borrowed: ${responseDetailAccount[fiat]["borrowed"]}`)
                    // let minorQty = (resMarginMarketSell.cummulativeQuoteQty <= detailMarginAccount[symbol]["free"]) ? parseFloat(resMarginMarketSell.cummulativeQuoteQty) : parseFloat(detailMarginAccount[symbol]["free"]);
                    await marginRepay(fiat, lot); // antes lot. lo que obtuve de vta parseFloat(resMarginMarketSell.cummulativeQuoteQty);
                    quantity = await calcQuantity(close, lot);
                    await marginBorrow(currencies[symbol], quantity);
                    responseDetailAccount = await detailAccount(fiat);
                    resMarginMarketSell = await marginMarketSell(symbol, responseDetailAccount[symbol]["free"]); // antes quantity
                    console.log(`----------------------------OPEN SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("success");
                };
            };
        } catch (error) {
            console.log(error.body);
            reject(error);
        };
    });
};

let inputHistoryCandlestick = {}; // historyCandlestick(markets, timeFrame, binance)
let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" }; //buildNameCurrency() // falta desarrollar
let detailMarginAccount = {}; // detailAccount()
//-------------------------------------------------------------------------------------------------------------------------------//

/**
 * Funcion iife donde converge todo el analisis(main)
 * @param {object} binance - conexion a binance
 */
const trading = (async _ => {
    try {
        // let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "DOGEUSDT", "ETCUSDT", "BCHUSDT", "LINKUSDT", "VETUSDT", "SOLUSDT", "TRXUSDT", "IOTAUSDT"];
        // let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]; // pares a operar
        let markets = ["ETHUSDT"], // pares a operar (no operar BNBUSDT)
            timeFrame = "1m", // intervalo de las velas    
            fiat = "USDT", // default: USDT
            lot = 15.00, // valor lote en fiat (USDT)
            start = false, // default: true (ejecutara las ordenes que indique la estrategia cuando haya alguna senial)
            closeAllPosition = false, // default false || vende las posiciones y repaga los prestamos existentes, dejando los pares en cero al arranque de la app
            flagBackTesting = true, // default: false || inicia backtesting
            invertSignal = false; // default: false || invierte la senal (ej: si es 'buy' se convierte a 'sell', idem si es 'sell') || falta implementarlo con el backtesting

        console.log("***Abechennon Margin Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Start: ${start} \n`);
        console.log(`Close all positions: ${closeAllPosition} | Back-Testing: ${flagBackTesting} | Invert signal: ${invertSignal} \n`);
        console.log(`Markets: ${markets} \n`);

        await historyCandlesticks(markets, timeFrame);

        await detailMarginAcc(fiat);

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

        if (flagBackTesting == true) { // backtesting
            markets.forEach(async(curr) => {
                console.log(` \n`)
                console.log(`=======================***${curr}***=======================`);
                let dataBackTesting = await classicRsi(inputHistoryCandlestick[curr], false, true, 14, 30, 70); // funcion que crea el objeto con los datos que usara el backtesting
                await backTesting(dataBackTesting); // procesamiento del backtesting

            });
        };

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);


        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {

                await updatedHistoryCandlesticks(candlesticks);

                let signal = await classicRsi(inputHistoryCandlestick[symbol], false, false, 14, 30, 70); // funcion que creara las senales

                if (start == true && signal != undefined) {
                    await order(signal, symbol, close, lot, fiat);
                    await detailMarginAcc(fiat);
                    console.log(detailMarginAccount.USDT);
                    console.log(detailMarginAccount[symbol]);
                };
            };
        });
    } catch (error) {
        console.error(error);
    };
})(binance);


// module.exports = trading;