/* ============================================================
 * Abechennon Margin Trader-Bot Binance
 * https://github.com/pablob206/abechennon-traderbot
 * ============================================================
 * 2021 - Pablo Brocal - pablob206@hotmail.com
 * ============================================================
 */
const { response } = require('express');
// const Binance = require('node-binance-api');
const binance = require('./exchange');
const util = require('util') // console.log(util.inspect(array, { maxArrayLength: null }));
const backTesting = require('./backTesting');
const { waves, wavesBackTesting } = require('./strategy/strategyWaves');
const strategyAdxRsi = require('./strategy/strategyAdxRsi');
const strategyRsiScalper = require('./strategy/strategyRsiScalper');


/**
 * Trae de la API las ultimas 500 velas
 * @param {array} markets - mercados a operar
 * @param {number} timeFrame - intervalo de tiempo de las velas
 * @return {object}
 */
const historyCandlesticks = (markets, timeFrame) => {
    return new Promise((resolve, reject) => {
        // let period = 14; // solo lo uso para el ADX
        markets.forEach(async(symbol, idx, market) => {
            inputHistoryCandlestick[symbol] = {
                open: [],
                close: [],
                high: [],
                low: [],
                period: null
            };
            await binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
                // let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = last_tick;
                // console.info(ticks);
                ticks.pop(); // elimina el ultimo por que no es "isFinal"
                ticks.map((curr, idx, src) => {
                    inputHistoryCandlestick[symbol].open.push(parseFloat(curr[1]));
                    inputHistoryCandlestick[symbol].high.push(parseFloat(curr[2]));
                    inputHistoryCandlestick[symbol].low.push(parseFloat(curr[3]));
                    inputHistoryCandlestick[symbol].close.push(parseFloat(curr[4]));
                });
                // console.log(inputHistoryCandlestick);
                // console.log('------------------------------------------------');
            });
        });
        resolve(inputHistoryCandlestick);
    });
};

/**
 * Actualiza el historial de velas
 * @param {object} candlesticks - objeto de la API con los ultimos valores de la vela
 * @return {object} 
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
 * @return {number}
 */
const calcQuantity = (close, lot) => {
    return new Promise(async(resolve, reject) => {
        quantity = (lot - 1) / close; // resto 1 a lot para que no este tan ajustado los prestamos
        let resQuantityNro = await formatQuantity(quantity);
        resolve(resQuantityNro);
        if (error) {
            console.log(error);
            reject(error);
        };
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


/**
 * Le da formato a un nro no admitido, por ej: 0.0070628(no admitido) a 0.0070(si admitido)
 * @param {number} value - valor no admitido
 * @return {number} - un valor admitido
 */
const formatQuantity = (value) => { // debo agregar un parametro mas, que indicaria a que cantidad de digitos debe ser formateada la cifra
    return new Promise((resolve, reject) => {
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
        };
        // quantityCurrency[`${symbol}`] = resQuantityNro;
        console.log(`***Formating quantity:  ${resValueNro}`);
        resolve(resValueNro);

        if (error) {
            reject(error);
        };
    });
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



/**
 * Trae de la API los detalles de la cuenta de margin
 * @return {object} detailMarginAccount
 */
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

/**
 * Calcula el valor en usdt de la posicion borrowed y free (que estan en crypto) y agrega sus clones pero en usdt
 * @param {string} fiat - usdt
 * @param {object} resOne - objeto currencies
 * @return {object} detailMarginAccount
 */
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


// verificar este: {"code":-2010,"msg":"Account has insufficient balance for requested action."}
//0.0070628
/**
 * Orden mercado de compra en margin
 * @param {string} symbol - par
 * @param {number} quantity
 * @return {object}
 */
const marginMarketBuy = (symbol, quantity) => { //quantityCurrency[symbol]
    return new Promise((resolve, reject) => {
        binance.mgMarketBuy(symbol, quantity, async(error, response) => { // obtenido de la vta: usdt tick[1]["cummulativeQuoteQty"]
            if (error) {
                console.log(error.body);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"} // error de formato
                    quantity = await formatQuantity(quantity);
                    await marginMarketBuy(symbol, quantity);
                } else {
                    reject(error.body);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                resolve(response);
            };
        });
    });
};


/**
 * Orden mercado de venta en margin
 * @param {string} symbol - par
 * @param {number} quantity
 * @return {object}
 */
const marginMarketSell = (symbol, quantity) => { //quantityCurrency[symbol]
    return new Promise((resolve, reject) => {
        binance.mgMarketSell(symbol, quantity, async(error, response) => {
            if (error) {
                console.log(error.body);
                const regex = /(\d+)/g;
                const nroError = error.body.match(regex);
                if (nroError[0] == 1013) { // {"code":-1013,"msg":"Filter failure: LOT_SIZE"} // error de formato
                    quantity = await formatQuantity(quantity);
                    await marginMarketSell(symbol, quantity);
                } else {
                    reject(error.body);
                };
            } else {
                console.log(`Margin Market, ${response.side}, ${response.symbol}: ${response.cummulativeQuoteQty}, status: ${response.status}`);
                resolve(response);
            };
        });

    });
};


/**
 * Orden de prestamo en margin
 * @param {string} currency - moneda
 * @param {number} quantity
 * @return {object}
 */
const marginBorrow = (currency, quantity) => {
    return new Promise(async(resolve, reject) => {
        try {
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
        } catch (error) {
            // console.log(error);
            reject(error);
        };
    });
};


/**
 * Orden para repagar prestamo en margin
 * @param {string} currency - moneda
 * @param {number} quantity
 * @return {object}
 */
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


/**
 * Cierra todas las posciones abiertas
 * @param {string} fiat - usdt
 * @return {string}
 */
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
                        console.log(`...Quedo crypto rezagado`);
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


/**
 * Repaga las deudas por prestamo en fiat(usdt)
 * @param {string} fiat - usdt
 * @return {string}
 */
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


/**
 * Verifica si el par esta con posicion existente en long o short, de lo contrario no hay posicion (es null).
 * @param {string} fiat - usdt
 * @param {string} resTwo - objeto currencies
 * @return {object}
 */
const flagSide = (fiat, resTwo) => { // currency = symbol/par
    return new Promise(async(resolve, reject) => {
        console.log(`- Calculate Current position...`);
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
                        console.log(`*** Current position: long`);
                        resolve(detailMarginAccount);

                        // tengo posicion: short
                    } else if (borrowedCrypto > 10.00 && freeUsdtCrypto < 10.00) {
                        detailMarginAccount[currency].currentSideMargin = "short";
                        console.log(`*** Current position: short`);
                        resolve(detailMarginAccount);

                        // tengo shortFail / no fue posicion short || me prestaron crypto, pero no alcance a vender || debo crypto
                    } else if (borrowedCrypto > 10.00 && freeUsdtCrypto > 10.00) {
                        console.log(`*** Current position ${currency}: null, ${freeUsdtCrypto}, ${borrowedCrypto}`);
                        let minorQty = (borrowedCrypto <= freeUsdtCrypto) ? detailMarginAccount[currency]["borrowed"] : detailMarginAccount[currency]["free"];
                        const response = await marginRepay(currencies[currency], minorQty);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                        // tengo fail / tengo crypto, pero sin prestamo de fiat ni de crypto
                    } else if (borrowedFiat < 10.00 && borrowedCrypto < 10.00 && freeUsdtCrypto > 10.00) {
                        console.log(`*** Current position ${currency}: null, ${detailMarginAccount[currency]["freeUsdt"]}, ${detailMarginAccount[fiat]["borrowed"]}`);
                        const response = await marginMarketSell(currency, detailMarginAccount[currency]["free"]);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);

                    } else {
                        console.log(`*** Current position ${currency}: null`);
                        detailMarginAccount[currency].currentSideMargin = null;
                        resolve(detailMarginAccount);
                    };
                };
            };
        } catch (error) {
            console.log(error.body);
            reject(error.body);
        };
    });
};


/**
 * LLama a otras funciones para hacer un calculo completo de los detalles de la cuenta de margin
 * @param {string} fiat - usdt
 * @return {object}
 */
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


/**
 * Ejecucion de ordenes de margin, en esquema ping-pong (o sea, la senial buy es para cerrar un short y abrir
 * un long, igual a la inversa)
 * @param {string} signal - senial de la estrategia
 * @param {string} symbol - par
 * @param {string} close - ultimo precio de cierre de la vela
 * @param {string} lot - lote asignado a la orden
 * @param {string} fiat - usdt
 * @return {string}
 */
let operation = 0;
const order = (signal, symbol, close, lot, fiat) => {
    return new Promise(async(resolve, reject) => {
        try {
            if (signal != undefined && detailMarginAccount[symbol]["currentSideMargin"] == null) {
                // currency = currencies[symbol];
                // quantity = quantityCurrency[symbol];
                let quantity = await calcQuantity(close, lot);
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
                let quantity = await calcQuantity(close, lot);
                if (signal == 'buy' && detailMarginAccount[symbol]["currentSideMargin"] == "short") { // arrastro un short
                    operation++;
                    console.log(`----------------------------CLOSE SHORT ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginMarketBuy(symbol, detailMarginAccount[symbol]["borrowed"]);
                    await marginRepay(currencies[symbol], detailMarginAccount[symbol]["borrowed"]);
                    quantity = await calcQuantity(close, lot);
                    await marginBorrow(fiat, lot);
                    await marginMarketBuy(symbol, quantity);
                    console.log(`----------------------------OPEN LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------\n`);
                    resolve("SUCCESS");

                } else if (signal == 'sell' && detailMarginAccount[symbol]["currentSideMargin"] == "long") { // arrastro un long
                    operation++;
                    console.log(`----------------------------CLOSE LONG ${symbol}, Close: ${close}, Op: ${operation}----------------------------`);
                    await marginMarketSell(symbol, detailMarginAccount[symbol]["free"]);
                    await marginRepay(fiat, lot);
                    quantity = await calcQuantity(close, lot);
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

let inputHistoryCandlestick = {}; // historyCandlestick(markets, timeFrame, binance)
let currencies = { "USDT": "USDT", "BNBUSDT": "BNB", "BTCUSDT": "BTC", "ETHUSDT": "ETH", "ADAUSDT": "ADA" }; //buildNameCurrency() // falta desarrollar
let detailMarginAccount = {}; // detailAccount()
// let quantityCurrency = {}; // calcQuantity(close, lot) // deprecated
//-------------------------------------------------------------------------------------------------------------------------------//

/**
 * Funcion iife donde converge todo el analisis(main)
 * @param {object} binance - conexion a binance
 */
const trading = (async _ => {
    try {
        // let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "BNBUSDT", "DOGEUSDT", "ETCUSDT", "BCHUSDT", "LINKUSDT", "VETUSDT", "SOLUSDT", "TRXUSDT", "IOTAUSDT"];
        // let markets = ["BTCUSDT", "ETHUSDT", "ADAUSDT"]; // pares a operar
        let markets = ["ETHUSDT"]; // pares a operar
        let timeFrame = "1m"; // intervalo de las velas
        let length = 25; // periodo para los indicadores que lo requieran
        let fiat = "USDT";
        let lot = 15.00; // valor lote
        let start = true; // default: true (el bot esta operativo)
        let closeAllPosition = true; // default false || vende las posiciones y reepaga los prestamos existentes, dejando los pares en cero al arranque de la app
        let flagBackTesting = true; // default: false || inicia backtesting
        let invertSignal = true; // default: false || invierte la senal (ej: si es 'buy' se convierte a 'sell', idem si es 'sell') || falta implementarlo con el backtesting

        console.log("***Abechennon Margin Trader-Bot Binance*** \n");
        console.log(`TimeFrame: ${timeFrame} | Lot Usdt: ${lot} | Start: ${start} \n`);
        console.log(`Close all positions: ${closeAllPosition} | Back-Testing: ${flagBackTesting} | Invert signal: ${invertSignal} \n`);
        console.log(`Markets: ${markets} \n`);

        let responseHistoryCandlestick = await historyCandlesticks(markets, timeFrame);


        // recordar para prubas manuales de operaciones, desactivar detailMarginAcc(fiat) ya que cierra las posiciones aisladas
        //0.0070628
        // await marginMarketBuy("ETHUSDT", 0.0070628); // quantity = quantityCurrency[symbol]
        // await marginMarketSell("ETHUSDT", 0.0070628); // quantity = quantityCurrency[symbol]
        // await marginBorrow("ETH", 0.0079, "ETHUSDT"); // quantity = quantityCurrency[symbol]
        // await marginMarketSell("ETHUSDT", 0.008, fiat, lot); // quantity = quantityCurrency[symbol]


        await detailMarginAcc(fiat); // trae los detalles de la cuenta de margen a traves de iterar el objeto currencies y lo almacena en el objeto detailMarginAccount // cuidado que tambien cierra posiciones aisladas

        if (closeAllPosition == true) {
            console.log(`- Close all position, zeroPositionAll: true !`);
            const resZeroPositionCrypto = await zeroPositionCrypto(fiat);
            const resZeroPositionFiat = await zeroPositionFiat(fiat);
            let cryptoPositionModified;
            (resZeroPositionCrypto == "modified" || resZeroPositionFiat == "modified") ? cryptoPositionModified = "modified": cryptoPositionModified = "noModified";
            if (cryptoPositionModified == "modified") {
                await detailMarginAcc(fiat);
            };
        };

        if (flagBackTesting == true) { // backtesting
            markets.forEach((curr) => {
                console.log(` \n`)
                console.log(`=======================***${curr}***=======================`);
                let dataBackTesting = wavesBackTesting(inputHistoryCandlestick[curr].close, length, invertSignal); //<== funcion que crea el objeto con los datos que usara el backtesting
                // let dataBackTesting = strategyAdxRsi(inputHistoryCandlestick["ETHUSDT"]);
                // let dataBackTesting = strategyRsiScalper(inputHistoryCandlestick["ETHUSDT"], 3);
                // console.log(dataBackTesting);
                backTesting(dataBackTesting); // procesamiento del backtesting
            });
        };

        console.log(`- Waiting for signal every: ${timeFrame}... \n`);

        // console.log(detailMarginAccount);
        // console.log(util.inspect(inputHistoryCandlestick, { maxArrayLength: null }));
        // console.log(inputHistoryCandlestick["ADAUSDT"].close);
        // console.log('-----------------------------------------------------------------------------------');

        await binance.websockets.candlesticks(markets, timeFrame, async(candlesticks) => {
            let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
            let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
            if (isFinal == true) {

                await updatedHistoryCandlesticks(candlesticks);
                // console.log(util.inspect(inputHistoryCandlestick, { maxArrayLength: null }));

                let signal = await waves(inputHistoryCandlestick[symbol].close, length); //<== aqui la funcion que creara las senales
                // let signal = await strategyOne(inputHistoryCandlestick[symbol], length);

                if (invertSignal == true) { // deprecated, ya fue pasado a la estrategia
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
                    console.log(detailMarginAccount[symbol]);
                };
            };
        });
    } catch (error) {
        console.error(error);
    };
})(binance);


// module.exports = trading;