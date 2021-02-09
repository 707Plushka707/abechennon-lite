/* 
Test integracion
*/

const { forEach } = require("async");

//rsi 41.48
let arrayClosePeriod = [10517.81000000, 10544.17000000, 10496.18000000, 10481.71000000, 10438.25000000, 10473.65000000, 10465.00000000, 10483.73000000, 10489.94000000, 10437.12000000, 10419.25000000, 10432.53000000, 10437.15000000, 10405.94000000];
let promDown = 0;
let promUp = 0;

const rsi = ([]) => {

    arrayClosePeriod.forEach((val, idx) => {

        console.log('****************************************');
        console.log('Indice: ' + idx);

        //calcula la posicion 1 para cada iteracion
        const posicion1 = (arrayClosePeriod) => {
            if (arrayClosePeriod[idx] === undefined) {
                pos1 = 0;
                console.log('posicion1: ' + pos1);
                return pos1;
            } else {
                pos1 = arrayClosePeriod[idx];
                console.log('posicion1: ' + pos1);
                return pos1;
            };
        };

        //calcula la posicion 2 para cada iteracion
        const posicion2 = (arrayClosePeriod) => {
            if (arrayClosePeriod[idx + 1] === undefined) {
                pos2 = 0;
                console.log('posicion2: ' + pos2);
                return pos2;
            } else {
                pos2 = arrayClosePeriod[idx + 1];
                console.log('posicion2: ' + pos2);
                return pos2;
            };
        };

        //calcula la diferencia entre la pos1 y pos2 para cada iteracion
        const opDiferencia = () => {
            if (pos1 === 0 || pos2 === 0) {
                dif = 0;
                console.log('diferencia: ' + 0);
                return dif;
            } else {
                dif = pos1 - pos2;
                console.log('diferencia: ' + dif);
                return dif;
            };
        };

        //un acumulador para sumar las diferencias
        const promedio = (diferencia) => { //this apunta hacia dentro, sin this hacia afuera
            if (Math.sign(diferencia) === 1) {
                difPos = diferencia;
                promDown = promDown + difPos;
                console.log('promDown: ' + promDown);
                console.log('promUp: ' + promUp);
            } else {
                difNeg = diferencia;
                promUp = promUp + difNeg;
                console.log('promDown: ' + promDown);
                console.log('promUp: ' + promUp);
            };

            //obtenemos promedios
            if (arrayClosePeriod[idx] === arrayClosePeriod[idx = 13]) {

                // let promedioDown = (acumDifpositivo * 13 + 31.21) / 14;
                // let promedioUp = ((acumDifnegativo * 13 + 4.62) / 14) * -1; //converitmos el num en positivo

                // console.log('promedioUp: ' + promedioUp);
                // console.log('promedioDown: ' + promedioDown);

                // console.log('difPos: ' + difPos);
                // console.log('difNeg: ' + difNeg);

                // if (promedioDown == 0) {
                //     promedioDown = 1;
                // }
                // if (promedioUp == 0) {
                //     promedioUp = 1;
                // };

                //Ganancia promedio = [(ganancia promedio anterior) x 13 + ganancia actual] / 14.
                //Pérdida promedio = [(Pérdida promedio anterior) x 13 + Pérdida actual] / 14.

                // promedioUpF = ((promedioUp * 13) + difNeg) / 14;
                // promedioDownF = ((promedioDown * 13) + difPos) / 14;

                // let promedioUp = 7.47 * 13 + (4.62 / 14); //converitmos el num en positivo
                // let promedioDown = 15.46 * 13 + (31.21 / 14);
                // gain_avg0 = 7.47;
                // gain = 4.62;
                // loss_avg0 = 15.46;
                // loss = 31.21;
                let gain_avg0 = 104.6;
                let gain = 4.62;
                let loss_avg0 = 216.47;
                let loss = 31.21;


                let promedioUp = (gain_avg0 * 13 + gain) / 14;
                let promedioDown = (loss_avg0 * 13 + loss) / 14;

                //calculamos RS
                // rs = promedioUp / promedioDown;

                // console.log('RS: ' + rs);


                //calculamos RSI
                let rsi = 100 - (100 / (1 + promedioUp / promedioDown));

                console.log('**********************************');
                console.log('***** RSI: ' + rsi + ' *****');
                console.log('**********************************');
            };
        };

        posicion1(arrayClosePeriod);
        posicion2(arrayClosePeriod);
        promedio(opDiferencia());


    });

};

// rsi(arrayClosePeriod);


/**************************SMA*******************************/
// sma 10465.88 
// OK (parametros: array y periodo)
const sma = (src, length) => {
    let sma;
    let acumValue = 0;

    src.forEach(currentValue => {

        acumValue = (acumValue + currentValue);

    });

    sma = acumValue / length;

    console.log('Sma: ' + sma);

};

// sma(arrayClosePeriod, 14);


/**************************EMA*******************************/

const ema = (src, lenght) => {

};

// ema(arrayclosedPeriod, 4);

/**************************WMA*******************************/
//10448.84

// for i = 0 to y - 1
// weight = (y - i) * y
// norm := norm + weight
// sum := sum + x[i] * weight
// sum / norm

const wma = (src, lenght) => {
    let wma = 0;
    let factorPonderacion = 0;
    let mediaPonderada = 0;
    let norm = 0;

    src.forEach((currentValue, idx) => {
        weight = (lenght - idx) * lenght;
        console.log('weight: ' + weight);

        norm = norm + weight;
        console.log('norm: ' + norm);

        // factorPonderacion = factorPonderacion + (idx + 1);
    });

    console.log('total weight: ' + weight);
    console.log('total norm: ' + norm);

    // console.log('factorPonderacion: ' + factorPonderacion);

    // src.forEach((currentValue, idx) => {
    //     mediaPonderada = currentValue * (idx / factorPonderacion);

    //     console.log('mediaPonderada: ' + mediaPonderada);

    //     wma = wma + mediaPonderada;
    // });

    // console.log('Wma: ' + wma);
};

// wma(arrayClosePeriod, lenght);
wma([10437.15000000, 10405.94000000, 5], 3);

/**************************RSI*******************************/
//rsi 39.04
const calcrsi = (srcUp, srcDown, lenght) => {
    let srcU = srcUp;
    let srcD = srcDown;
    let alpha = lenght;
    let sumU = 12.6;
    let sumD = 21.66;

    rsUp = (srcU + (alpha - 1) * sumU) / alpha;
    rsDown = (srcD + (alpha - 1) * sumD) / alpha;
    console.log('rsUp: ' + rsUp);
    console.log('rsDown: ' + rsDown);

    let rsi = 100 - 100 / (1 + rsUp / rsDown);
    console.log('RSI rapido: ' + rsi);
};

// calcrsi(142.13, 177.38, 14); //39.9966
// calcrsi(10.15214285, 12.67, 14);

/*************************************************************/