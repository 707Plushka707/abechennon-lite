const Binance = require('node-binance-api');
const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { getDataBackTesting, backTesting } = require('./backTesting');
const { strategy1, strategy2 } = require('./strategy');

const trading = async() => {
    let length = 14;
    let arrayClose = [];
    // let quantity = 0.000213; // usd 12, calculado a 56mil, usar para el test!
    // let quantity = 0.00186084; //usd 100 (1 lote), calculado a 56mil. Representa 2% de la cuenta (se pueden exponer por vez 10 lotes (20%))

    //============================ Conexion Binance ============================
    const binance = await new Binance().options({ //Hacer que lea la conexion desde el archivo exchange!! 
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW',
        // 'test': true
    });
    console.log('Conexion Binance OK!');

    // binance.mgAccount((error, response) => {
    //     if (error) return console.warn(error);
    //     // console.info("Account details response:", response)
    //     // console.log(response.userAssets);
    //     let userAssets = response.userAssets;

    //     userAssets.filter(userAsset => {
    //         // console.log(userAsset)
    //     });
    // });

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(ticks[i][4]); //en indice 4 esta el close
        });
        arrayClose.pop(); // elimina el ultimo por que no es "isFinal"

        // let dataBackTesting = getDataBackTesting(arrayClose, length);

        let dataBackTesting = strategy1(arrayClose, length); //<==
        backTesting(dataBackTesting); //<==

    });

    const lot = 100; // lote valor = 100usd
    let flagStart = true;
    let flagFirstOp = true;

    await binance.websockets.candlesticks(['BTCUSDT'], "15m", (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            console.log('---------------------------------------');
            console.log('Ultimo precio: ' + close);
            arrayClose.shift(); // elimina el primero
            arrayClose.push(close); // agrega el ultimo
            // console.log(util.inspect(arrayClose, { maxArrayLength: null }));

            let quantity = (lot * 1.000000) / close; // calcular valor lote en BTC
            // console.log(`quantity ${quantity}`);

            let flagOp = strategy2(arrayClose, length); // aqui la estrategia a usar

            if (flagStart == true && flagOp == !undefined) {
                flagStart = false;
                const borrow = (async _ => {
                    try {
                        await binance.mgBorrow("USDT", lot + 4, (error, response) => {
                            if (error) return console.warn(error);
                            else console.log("Borrow Success!");
                        });
                    } catch (error) {
                        console.error(error);
                    };
                })();
                if (flagOp == 'buy') {
                    const comprando = (async _ => {
                        try {
                            await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log("Buy Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                } else if (flagOp == 'sell') {
                    const vendiendo = (async _ => {
                        try {
                            await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log("Sell Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                };
            } else if (flagStart == false && flagFirstOp == true) {
                flagFirstOp = false;
                if (flagOp == 'buy') {
                    const comprando = (async _ => {
                        try {
                            await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log("Buy Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                } else if (flagOp == 'sell') {
                    const vendiendo = (async _ => {
                        try {
                            await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log("Sell Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                };
            } else if (flagStart == false && flagFirstOp == false) {
                if (flagOp == 'buy') {
                    const comprando = (async _ => {
                        try {
                            await binance.mgMarketBuy("BTCUSDT", quantity);
                            await binance.mgMarketBuy("BTCUSDT", quantity);
                            console.log("Buy Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                } else if (flagOp == 'sell') {
                    const vendiendo = (async _ => {
                        try {
                            await binance.mgMarketSell("BTCUSDT", quantity);
                            await binance.mgMarketSell("BTCUSDT", quantity);
                            console.log("Sell Success!");
                        } catch (error) {
                            console.error(error);
                        };
                    })();
                };
            };

        };
    });

};

trading();