const Binance = require('node-binance-api');

const getData = async() => {
    let arrayClose = [];
    let arrayCloseActual = [];
    let period = 14;

    require('../exchange'); //Doble llamada

    //============================ Conexion Binance ============================
    const binance = await new Binance().options({ //Hacer que lea la conexion desde el archivo exchange!! 
        APIKEY: 'g43IhfkuGEnQzp1mstGMBrrnrTB0WkOHOZ6eLy0bNBaGTqE1OOJOCl7HBNJ1CIoJ',
        APISECRET: 'WYRseAeFwqwJTyo1P8ughTDnhqswCSfv8vdLInuDKmbPhX7brVmAXsk8sibOyjhW'
    });
    console.log('Conexion Binance OK! - rsi');

    //=================== Historico: los 500 ultimos close =====================
    await binance.candlesticks("BTCUSDT", "15m", (error, ticks, symbol) => { //indice 0 mas viejo, indice 500 ultima
        ticks.forEach((val, i) => {
            arrayClose.push(ticks[i][4]); //en indice 4 esta el close
        });

        //=================== Obtenemos 500 array de 14 periodos ===================
        for (let idx = 0; idx <= arrayClose.length; idx++) {
            start_index = idx - period;
            upto_index = idx;
            const arrayClosePeriod = arrayClose.slice(start_index, upto_index); //generamos el array arrayClosePeriod con 14 elem, para cada iteracion

            objectOperation = dataBackTesting(idx, arrayClosePeriod, period); //Generando el objeto con los datos de las operaciones de compra/venta que sera usado por el backTesting
        };
        backTesting(objectOperation);
    });

    //==========================================================================
    //=================== Los 14 ultimos close ===================
    //==========================================================================

    await binance.candlesticks("BTCUSDT", "1m", (error, ticks, symbol) => {
        ticks.forEach((val, i) => {
            arrayCloseActual.push(ticks[i][4]); //en indice 4 esta el close
        });
        // console.log(arrayCloseActual);
    }, { limit: 14 });

    await binance.websockets.candlesticks(['BTCUSDT'], "1m", (candlesticks) => {
        let { e: eventType, E: eventTime, s: symbol, k: ticks } = candlesticks;
        let { o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume } = ticks;
        if (isFinal == true) {
            console.log('Ultimo precio: ' + close);
            arrayCloseActual.shift();
            arrayCloseActual.push(close);
            // console.log(arrayCloseActual);
            // strategy1(arrayCloseActual, period);
            // backTesting(arrayCloseActual, period);
            console.log('***************************************');
        };
    });
};

//=================== Back-Testing ===================
let buy = 0;
let sell = 0;
let profit = 0;
let profitParcial = 0;
let flagSell = false;
let flagBuy = false;
let objectOperation = new Object();

const dataBackTesting = (idx, arrayClosePeriod, period) => { //Funcion para armar el objectOperation(objeto con las operaciones de compra/venta), que sera usado en el backTesting
    let calculateRsi = rsi(arrayClosePeriod, period);
    if (calculateRsi <= 22 && flagBuy == false) {
        flagBuy = true;
        flagSell = false;
        buy = buy + 1; //Contador buy
        objectOperation['Buy_' + idx] = arrayClosePeriod[period - 1];
    } else if (calculateRsi >= 78 && flagSell == false) {
        flagSell = true;
        flagBuy = false;
        sell = sell + 1; //Contador sell
        objectOperation['Sell_' + idx] = arrayClosePeriod[period - 1];
    } else {};

    return objectOperation;
};

const backTesting = (objectOperation) => {
    let arrayOperation = Object.entries(objectOperation);
    console.log(arrayOperation);
    console.log(`Buy ${buy}`);
    console.log(`Sell ${sell}`);

    const prevPrice = (ix, arrayOperation) => {
        if (arrayOperation[ix - 1] === undefined) {
            return 0;
        } else {
            return arrayOperation[ix - 1][1]
        };
    };

    arrayOperation.forEach((operation, ix, arrayOperation) => {
        if (operation[0].includes('Buy') && prevPrice(ix, arrayOperation) != 0) {
            profitParcial = prevPrice(ix, arrayOperation) - arrayOperation[ix][1];
            profit = profit + profitParcial;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Buy (Iniciando long/cerrando short): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        } else if (operation[0].includes('Sell') && prevPrice(ix, arrayOperation) != 0) {
            profitParcial = arrayOperation[ix][1] - prevPrice(ix, arrayOperation);
            profit = profit + profitParcial;
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log("Sell (Iniciando short/cerrando long): " + arrayOperation[ix][0]);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        } else {
            console.log("---------------------------------------");
            console.log(`ix: ${ix}`);
            console.log(`Profit parcial: ${profitParcial}`);
            console.log(`Profit: ${profit}`);
        };
    });
};

//=================== Calcular RSI ===================
// rsi= 100 - 100 / (1 + rs)
// rs = Average Gain / Average Loss

const rsi = (arrayCloseActual, period) => {
    let difPositivas = 0;
    let difNegativas = 0;
    let rsi;

    arrayCloseActual.forEach((val, idx, arrayCloseActual) => {

        const opDiferencia = () => {
            if (arrayCloseActual[idx] === undefined || arrayCloseActual[idx + 1] === undefined) {
                return 0;
            } else {
                let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
                return dif;
            };
        };
        // console.log(opDiferencia());

        if (Math.sign(opDiferencia()) === 1) { //diferencias + y -
            difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
            // console.log('difPositivas: ' + difPositivas);
        } else {
            difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
            // console.log('difNegativas: ' + difNegativas);
        };

        //*****************************Obtenemos promedios para up/down******************************//
        if (arrayCloseActual[idx] === arrayCloseActual[idx = (period - 1)]) {
            let promedioDown = difPositivas / period; //Calculo promedio clasico
            let promedioUp = difNegativas / period; //Calculo promedio clasico

            // promedioUp = ((difNegativas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado
            // promedioDown = ((difPositivas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado

            // console.log('promedioUp: ' + promedioUp);
            // console.log('promedioDown: ' + promedioDown);

            //*****************************calculos para RS******************************//
            let rs = promedioUp / promedioDown;
            // console.log('RS: ' + rs);

            //*****************************calculos para RSI******************************//
            // RSI = 100 - (100/1+RS)
            rsi = 100 - (100 / (1 + rs));
            // console.log('RSI: ' + calculateRsi);
        };
    });
    return rsi;
};

const strategy1 = (array, period) => {
    let quantity = 0.00043060; //Equivale u$d20 al 09/02/2021
    let calculateRsi = rsi(array, period);

    console.log(`Strategy RSI: ${calculateRsi}`);

    if (calculateRsi < 20) {
        console.log(`Buy ${quantity}`);
        // binance.marketBuy("BTCUSDT", quantity);
    }
    if (calculateRsi > 80) {
        console.log(`Sell ${quantity}`);
        // binance.marketSell("BTCUSDT", quantity);
    } else
        console.log('RSI dentro de rango');
};

getData();

module.exports = getData;