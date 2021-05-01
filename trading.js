const Binance = require('node-binance-api');
const binance = require('./exchange');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
    // const { getDataBackTesting, backTesting } = require('./backTesting');
const { waves, wavesBackTesting } = require('./wavesStrategy');

let historicalCandl = async(valid, symbol, timeFrame) => {
    const binance = valid;
    let arrayClose = [];
    let arraySymbol = [];

    await binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
        ticks.map((curr, idx, tick) => {
            let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick[idx];
            arrayClose.push(parseFloat(close).toFixed(2));
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
        arraySymbol = arrayClose;
    }); //, { limit: 500, endTime: 1514764800000 });
    console.log(arraySymbol);

    return arraySymbol;
};


const trading = async() => {
    try {
        const markets = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
        const timeFrame = "1m";
        let arrayBtcUsdt = [];
        let arrayEthUsdt = [];
        let arrayBnbUsdt = [];

        let currency = "BTC";
        let fiat = "USDT";
        let length = 7;
        // let arrayClose = [];
        // // let close;
        // const lot = 13; // valor lote, default = 100usd
        // let quantity = 0.0002;
        // let flagStart = true; // default: true

        const binance = await new Binance().options({
            APIKEY: '3QvmVLVVANbQz8GuTiltOKHHuB1Z4sk388tU51Ij6KoHoGcljjCX8ITClEp1OwJt',
            APISECRET: 'UiFyytLnkBhbaN8pIY2VlPWmWFUamkKsLps8LUmExmJ1VakxJVRJvo2VJoF4MIRH',
        });

        // binance.mgMarketBuy("BTCUSDT", quantity );
        // binance.mgMarketSell("BTCUSDT", 0.0002);
        // binance.mgRepay("USDT", lot, (error, response) => { //repay usdt
        //     if (error) return console.warn(error);
        //     else console.log(`Success! Transaction ID:`);
        //     // Success! Transaction ID: response.tranId
        // });

        //=================== Historico: los 500 ultimos close =====================

        let a = historicalCandl(binance, "BTCUSDT", timeFrame);
        // console.log(a);
        // markets.map(async(symbol, idx, market) => {
        //     console.log("BTCUSDT")
        //     console.log(arrayBtcUsdt)
        // console.log("ETHUSDT")
        // console.log(arrayEthUsdt)
        // console.log("BNBUSDT")
        // console.log(arrayBnbUsdt)
        // });




    } catch (error) {
        console.log(error);
    };
};

//----------------------------------------------------------------------------------------------------------------------------

// const trading = async() => {
//     const fiat = "USDT";
//     // let markets = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];
//     let markets = ["BTCUSDT"];
//     let timeFrame = "1m";
//     let length = 7;
//     const lot = 12; // valor lote, default = 100usd
//     let currency;
//     let quantity;
//     let flagStart; // default: true
//     let quantityBtcUsdt = 0.0002;
//     let quantityBnbUsdt = 0.0177;
//     let quantityEthUsdt = 0.0040;
//     let flagBtcUsdt = true;
//     let flagBnbUsdt = true;
//     let flagEthUsdt = true;

//     const binance = await new Binance().options({
//         APIKEY: '3QvmVLVVANbQz8GuTiltOKHHuB1Z4sk388tU51Ij6KoHoGcljjCX8ITClEp1OwJt',
//         APISECRET: 'UiFyytLnkBhbaN8pIY2VlPWmWFUamkKsLps8LUmExmJ1VakxJVRJvo2VJoF4MIRH',
//     });

//     // binance.mgMarketBuy("BTCUSDT", 0.0002);
//     // binance.mgMarketSell("BTCUSDT", 0.0004);
//     // binance.mgRepay("USDT", lot, (error, response) => { //repay usdt
//     //     if (error) return console.warn(error);
//     //     else console.log(`Success! Transaction ID:`);
//     //     // Success! Transaction ID: response.tranId
//     // });

//     await binance.websockets.candlesticks(markets, timeFrame, (candlesticks) => {
//         let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
//         let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
//         let closeFinal = parseFloat(close).toFixed(2); // parseFloat(close).toFixed(4);
//         if (isFinal == true) {
//             binance.candlesticks(symbol, timeFrame, (error, ticks, symbol) => {
//                 let arrayClose = [];
//                 ticks.map((curr, idx, tick) => {
//                     let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = tick[idx];
//                     arrayClose.push(parseFloat(close).toFixed(2));
//                 });
//                 if (closeFinal == arrayClose[arrayClose.length - 2]) {
//                     arrayClose.pop();
//                 } else {
//                     arrayClose.pop();
//                     arrayClose.push(closeFinal);
//                 };
//                 // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

//                 let flagOp = waves(arrayClose, length); //<== aqui recibe las senales de la estrategia

//                 switch (symbol) {
//                     case "BTCUSDT":
//                         quantity = quantityBtcUsdt;
//                         currency = "BTC";
//                         flagStart = flagBtcUsdt;
//                         break;
//                     case "ETHUSDT":
//                         quantity = quantityEthUsdt;
//                         currency = "ETH";
//                         flagStart = flagEthUsdt;
//                         break;
//                     case "BNBUSDT":
//                         quantity = quantityBnbUsdt;
//                         currency = "BNB";
//                         flagStart = flagBnbUsdt;
//                         break;
//                     default:
//                         break;
//                 };

//                 // console.log("---------------------------");
//                 // console.log(symbol);
//                 // console.log(flagStart);
//                 // console.log(flagOp);
//                 // console.log(currency);
//                 // console.log(quantity);
//                 // console.log("---------------------------");

//                 const order = (async _ => {
//                     try {
//                         if (flagStart == true && flagOp != undefined) {
//                             console.log("----------------------------------------------")
//                             console.log(symbol)
//                             console.log(`flagOp: ${flagOp}`);
//                             console.log(`flagStart: ${flagStart}`);
//                             console.log(`currency ${currency}`);
//                             console.log(`quantity ${quantity}`);
//                             console.log(`fiat ${fiat}`);
//                             console.log(`lot ${lot}`);

//                             switch (symbol) { // Sobre-escribo las flags
//                                 case "BTCUSDT":
//                                     flagBtcUsdt = false;
//                                     break;
//                                 case "ETHUSDT":
//                                     flagEthUsdt = false;
//                                     break;
//                                 case "BNBUSDT":
//                                     flagBnbUsdt = false;
//                                     break;
//                             };

//                             if (flagOp == 'buy') {
//                                 console.log(`1.0) Open long - Take borrow, lot: ${fiat} ${lot}`);
//                                 await binance.mgBorrow(fiat, lot, (error, response) => { //tomo prestamo usdt
//                                     if (error) return console.warn(error);
//                                     else {
//                                         console.log(`Borrow Success! lot: ${fiat} ${lot}`);
//                                         console.log(`1.1) First long.. BUY lot: ${symbol} ${quantity}`);
//                                         binance.mgMarketBuy(symbol, quantity); //compro crypto
//                                     };
//                                 });
//                             } else if (flagOp == 'sell') {
//                                 console.log(`1.0) Open short - Take borrow, Sell lot: ${currency} ${quantity}`);
//                                 await binance.mgBorrow(currency, quantity, (error, response) => { //tomo prestamo crypto
//                                     if (error) return console.warn(error);
//                                     else {
//                                         console.log(`Borrow Success! lot: ${currency} ${quantity}`);
//                                         console.log(`1.1) First short.. SELL ${symbol} ${quantity}`);
//                                         binance.mgMarketSell(symbol, quantity); //vendo crypto
//                                     };
//                                 });
//                             };
//                         } else if (flagStart == false && flagOp != undefined) {
//                             console.log("----------------------------------------------")
//                             console.log(symbol)
//                             console.log(`flagOp: ${flagOp}`);
//                             console.log(`flagStart: ${flagStart}`);
//                             console.log(`currency ${currency}`);
//                             console.log(`quantity ${quantity}`);
//                             console.log(`fiat ${fiat}`);
//                             console.log(`lot ${lot}`);

//                             if (flagOp == 'buy') { // arrastro un short
//                                 console.log(`2.0) Close short, open long. BUY ${symbol} ${quantity}`);
//                                 await binance.mgMarketBuy(symbol, quantity); //cerrar el short (debo crypto)
//                                 await binance.mgRepay(currency, quantity, (error, response) => { //devuelvo prestamo crypto
//                                     if (error) return console.warn(error);
//                                     else {
//                                         console.log(`2.1) Success Repay! lot: ${currency} ${quantity}`);
//                                         binance.mgBorrow(fiat, lot, (error, response) => { //tomo prestamo usdt
//                                             if (error) return console.warn(error);
//                                             else {
//                                                 console.log(`2.2) Borrow Success! lot: ${fiat} ${lot}`);
//                                                 console.log(`2.3) Open long.. BUY lot: ${symbol} ${quantity}`);
//                                                 binance.mgMarketBuy(symbol, quantity); //compro crypto
//                                             };
//                                         });
//                                     };
//                                 });
//                             } else if (flagOp == 'sell') { // arrastro un long
//                                 console.log(`2.0) Close long, open short. SELL ${symbol} ${quantity}`);
//                                 await binance.mgMarketSell(symbol, quantity); // cerrar long (debo fiat)
//                                 await binance.mgRepay(fiat, lot, (error, response) => { //devuelvo prestamo fiat
//                                     if (error) return console.warn(error);
//                                     else {
//                                         console.log(`2.1) Success Repay! lot:${fiat} ${lot}`);
//                                         binance.mgBorrow(currency, quantity, (error, response) => { //tomo prestamo crypto
//                                             if (error) return console.warn(error);
//                                             else {
//                                                 console.log(`2.2) Borrow Success! lot: ${currency} ${quantity}`);
//                                                 console.log(`2.3) Open short.. SELL lot: ${symbol} ${quantity}`);
//                                                 binance.mgMarketSell(symbol, quantity); //vendo crypto
//                                             };
//                                         });
//                                     };

//                                 });
//                             };
//                         };
//                     } catch (error) {
//                         console.error(error);
//                     };
//                 })();
//             }, { limit: 30 }); //, { limit: 500, endTime: 1514764800000 });

//         } else {};

//     });

// };

trading();

// module.exports = trading;