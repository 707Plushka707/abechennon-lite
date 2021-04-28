const Binance = require('node-binance-api');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { getDataBackTesting, backTesting } = require('./backTesting');
// const binance = require('./exchange');
const { waves, wavesBackTesting } = require('./wavesStrategy');

const trading = async() => {
    let length = 7;
    let arrayClose = [];
    let timeFrame = "1m";
    let close;


    const binance = await new Binance().options({
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
        // 'test': true
    });

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks("BTCUSDT", timeFrame, (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(parseFloat(ticks[i][4]).toFixed(6)); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"
        // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

        // let dataBackTesting = getDataBackTesting(arrayClose, length);
        // let dataBackTesting = strategy1(arrayClose, length);

        let dataBackTesting = wavesBackTesting(arrayClose, length); //<==
        backTesting(dataBackTesting); //<==

    });

    const lot = 11; // lote valor = 100usd
    // let quantity = (lot / close).toFixed(6); // calcular valor lote en BTC
    let quantity = 0.0002;
    let flagStart = false; // defecto: true
    let flagFirstOp = true;

    await binance.websockets.candlesticks(['BTCUSDT'], timeFrame, (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            close = parseFloat(close).toFixed(6);
            console.log('---------------------------------------');
            console.log('Ultimo precio: ' + close);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            let quantityTest = 0.000199;
            console.log(`quantity: ${quantity}`);
            // console.log(`quantityTest: ${quantityTest}`);

            // let flagOp = 'buy';
            let flagOp = waves(arrayClose, length); // aqui la estrategia a usar
            console.log(`flagOp: ${flagOp}`);

            const order = (async _ => {
                try {
                    if (flagStart == true && flagOp != undefined) {
                        flagStart = false;
                        console.log("1.0) borrowStart: Pedir prestamo..");
                        const borrowStart = await binance.mgBorrow("USDT", lot + 1, (error, response) => {
                            if (error) return console.warn(error);
                            else console.log(`Borrow Success! lote: ${lot}`);
                        });
                        if (flagOp == 'buy') {
                            console.log(`1.1) comprandoStart: Primer long... quantity: ${quantity}`);
                            const comprandoStart = await binance.mgMarketBuy("BTCUSDT", quantity);
                        } else if (flagOp == 'sell') {
                            console.log(`1.1) vendiendoStart: Primer short... quantity: ${quantity}`);
                            const vendiendoStart = await binance.mgMarketSell("BTCUSDT", quantity);
                        };
                    } else if (flagStart == false) {
                        if (flagOp == 'buy') {
                            console.log(`2.0) comprandoNormalize: Cerrar short y abrir long. quantity: ${quantity}`);
                            const comprandoNormalize1 = await binance.mgMarketBuy("BTCUSDT", quantity);
                            const comprandoNormalize2 = await binance.mgMarketBuy("BTCUSDT", quantity);
                        } else if (flagOp == 'sell') {
                            console.log(`2.0) vendiendoNormalize: Cerrar long y abrir short. quantity: ${quantity}`);
                            const vendiendoNormalize1 = await binance.mgMarketSell("BTCUSDT", quantity);
                            const vendiendoNormalize2 = await binance.mgMarketSell("BTCUSDT", quantity);
                        };
                    };
                } catch (error) {
                    console.error(error);
                };
            })();

            //=============================================================================================

            // if (flagStart == true && flagOp != undefined) {
            //     flagStart = false;
            //     console.log("Entrando: (flagStart == true && flagOp != undefined)");
            //     const borrowStart = (async _ => {
            //         try {
            //             await binance.mgBorrow("USDT", lot + 4, (error, response) => {
            //                 if (error) return console.warn(error);
            //                 else console.log("Borrow Success!");
            //             });
            //             console.log(`borrowStart: flagStart: ${flagStart}. flagOp: ${flagOp}`)
            //             console.log(`quantity: ${quantity}`);
            //         } catch (error) {
            //             console.error(error);
            //         };
            //     })();
            //     borrowStart();
            //     if (flagOp == 'buy') {
            //         console.log("'flagOp == 'buy'");
            //         const comprandoStart = (async _ => {
            //             try {
            //                 await binance.mgMarketBuy("BTCUSDT", quantity);
            //                 console.log(`comprandoStart: flagOp: ${flagOp}. Buy Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         comprandoStart();
            //     } else if (flagOp == 'sell') {
            //         console.log("flagOp == 'sell'");
            //         const vendiendoStart = (async _ => {
            //             try {
            //                 await binance.mgMarketSell("BTCUSDT", quantity);
            //                 console.log(`vendiendoStart: flagOp: ${flagOp}. Sell Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         vendiendoStart();
            //     };
            // } else if (flagStart == false && flagFirstOp == true) {
            //     flagFirstOp = false;
            //     if (flagOp == 'buy') {
            //         const comprandoFirstOp = (async _ => {
            //             try {
            //                 await binance.mgMarketBuy("BTCUSDT", quantity);
            //                 console.log(`comprandoFirstOp: flagOp: ${flagOp}. Buy Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         comprandoFirstOp();
            //     } else if (flagOp == 'sell') {
            //         const vendiendoFirstOp = (async _ => {
            //             try {
            //                 await binance.mgMarketSell("BTCUSDT", quantity);
            //                 console.log(`vendiendoFirstOp: flagOp: ${flagOp}. Sell Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         vendiendoFirstOp();
            //     };
            // } else if (flagStart == false && flagFirstOp == false) {
            //     if (flagOp == 'buy') {
            //         const comprandoNormalize = (async _ => {
            //             try {
            //                 await binance.mgMarketBuy("BTCUSDT", quantity);
            //                 await binance.mgMarketBuy("BTCUSDT", quantity);
            //                 console.log(`comprandoNormalize: flagOp: ${flagOp}. Buy Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         comprandoNormalize();
            //     } else if (flagOp == 'sell') {
            //         const vendiendoNormalize = (async _ => {
            //             try {
            //                 await binance.mgMarketSell("BTCUSDT", quantity);
            //                 await binance.mgMarketSell("BTCUSDT", quantity);
            //                 console.log(`vendiendoNormalize: flagOp: ${flagOp}. Sell Success!`);
            //                 console.log(`quantity: ${quantity}`);
            //             } catch (error) {
            //                 console.error(error);
            //             };
            //         })();
            //         vendiendoNormalize();
            //     };
            // };




        };
    });

};

trading();