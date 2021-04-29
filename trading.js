const Binance = require('node-binance-api');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { getDataBackTesting, backTesting } = require('./backTesting');
// const binance = require('./exchange');
const { waves, wavesBackTesting } = require('./wavesStrategy');

const trading = async() => {
    let pair = "BTCUSDT";
    let timeFrame = "1m";
    let length = 7;
    let arrayClose = [];
    let close;


    const binance = await new Binance().options({
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
        // 'test': true
    });

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks(pair, timeFrame, (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(parseFloat(ticks[i][4]).toFixed(6)); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
        // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

        let dataBackTesting = wavesBackTesting(arrayClose, length); //<==
        backTesting(dataBackTesting); //<==
    });

    const lot = 13; // lote valor = 100usd
    // let quantity = (lot / close).toFixed(6); // calcular valor lote en BTC
    let quantity = 0.0002;
    let flagStart = true; // defecto: true
    // let flagFirstOp = true;

    // binance.mgMarketBuy("BTCUSDT", quantity );
    // binance.mgMarketSell("BTCUSDT", quantity);

    // binance.mgRepay("USDT", lot, (error, response) => { //repay usdt
    //     if (error) return console.warn(error);
    //     else console.log(`Success! Transaction ID:`);
    //     // Success! Transaction ID: response.tranId
    // });

    await binance.websockets.candlesticks([pair], timeFrame, (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            close = parseFloat(close).toFixed(6);
            console.log('---------------------------------------');
            console.log('Ultimo precio: ' + close);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            console.log(`quantity: ${quantity}`);

            let flagOp = 'undefined';
            // let flagOp = waves(arrayClose, length); //<== aqui la estrategia a usar
            console.log(`flagOp: ${flagOp}`);
            console.log(`flagStart: ${flagStart}`);

            const order = (async _ => {
                try {
                    if (flagStart == true && flagOp != undefined) {
                        flagStart = false;
                        if (flagOp == 'buy') {
                            console.log("1.0) Pedir prestamo USDT..");
                            await binance.mgBorrow("USDT", lot, (error, response) => {
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Borrow Success! lote USDT: ${lot}`);
                                    console.log(`1.1) comprandoStart: Primer long... quantity: ${quantity}`);
                                    binance.mgMarketBuy("BTCUSDT", quantity);
                                };
                            });
                        } else if (flagOp == 'sell') {
                            console.log("1.0) Pedir prestamo BTC..");
                            await binance.mgBorrow("BTC", quantity, (error, response) => {
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Borrow Success! lote BTC: ${quantity}`);
                                    console.log(`1.1) vendiendoStart: Primer short... quantity: ${quantity}`);
                                    binance.mgMarketSell("BTCUSDT", quantity);
                                };
                            });
                        };
                    } else if (flagStart == false && flagOp != undefined) {
                        if (flagOp == 'buy') { // arrastro un short
                            console.log(`2.0) comprandoNormalize: Cerrar short. quantity: ${quantity}`);
                            await binance.mgMarketBuy("BTCUSDT", quantity); //cerrar el short, debo btc
                            await binance.mgRepay("BTC", quantity, (error, response) => { //repay btc
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Success Repay! Transaction ID:`); // Success! Transaction ID: response.tranId
                                    binance.mgBorrow("USDT", lot, (error, response) => { //borrow usdt y compro btc
                                        if (error) return console.warn(error);
                                        else {
                                            console.log(`Borrow Success! lote USDT: ${lot}`);
                                            console.log(`3.0) abriendo long: quantity: ${quantity}`);
                                            binance.mgMarketBuy("BTCUSDT", quantity);
                                        };
                                    });
                                };
                            });
                        } else if (flagOp == 'sell') { // arrastro un long
                            console.log(`2.0) vendiendoNormalize: Cerrar long. quantity: ${quantity}`);
                            await binance.mgMarketSell("BTCUSDT", quantity);
                            await binance.mgRepay("USDT", lot, (error, response) => { //repay usdt
                                if (error) return console.warn(error);
                                else {
                                    console.log(`Success Repay! Transaction ID:`) // Success! Transaction ID: response.tranId
                                    binance.mgBorrow("BTC", quantity, (error, response) => {
                                        if (error) return console.warn(error);
                                        else {
                                            console.log(`Borrow Success! lote BTC: ${quantity}`);
                                            console.log(`3.0) abriendo short: quantity: ${quantity}`);
                                            binance.mgMarketSell("BTCUSDT", quantity);
                                        };
                                    });
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