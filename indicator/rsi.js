const rma = require('./rma');
const sma = require('./sma');
const { change, srcLength, sumArray, max } = require('./utils');

const rsi = (src, length) => { // Este RSI recibe un arrayclose con la coleccion de 500 close
    let res;
    let prevRmaGain, prevRmaLoss;

    src.forEach((curr, idx, src) => {
        const alpha = 1 / length;
        let arrayCloseLength = [];
        let arrayGain = [];
        let arrayLoss = [];
        let lastValue, rs;

        start_idx = idx - length;
        upto_idx = idx;
        if (start_idx >= 0) {
            arrayCloseLength = src.slice(start_idx, upto_idx); // Se arman los arrays con la longitud del length proporcionado
        };
        // console.log(arrayCloseLength);
        // console.log(curr) // Precio siguiente del array (no esta incluido en el array actual)
        lastValue = arrayCloseLength[arrayCloseLength.length - 1]; // ultimo precio del array
        // console.log(lastValue)

        arrayCloseLength.forEach((currentValue, idx, arrayCloseLength) => {
            change(currentValue, idx, arrayCloseLength) > 0 ? arrayGain.push(change(currentValue, idx, arrayCloseLength)) : 0.0
            change(currentValue, idx, arrayCloseLength) < 0 ? arrayLoss.push(change(currentValue, idx, arrayCloseLength) * -1) : 0.0
                // arrayGain.push(max(currentValue - arrayCloseLength[idx + 1], 0));
                // arrayLoss.push(max(arrayCloseLength[idx + 1] - currentValue, 0));
        });

        // console.log("lastValue: " + lastValue)
        // console.log("curr: " + curr);
        // console.log(arrayGain);
        // console.log(arrayLoss);
        // console.log(arrayGain[arrayGain.length - 1])
        // console.log(arrayLoss[arrayLoss.length - 1])
        // console.log(sma(arrayGain, length))
        // console.log(sma(arrayGain, arrayGain.length));
        // console.log(prevRmaGain);
        // console.log(prevRmaLoss);

        // if (prevRmaGain == NaN && prevRmaLoss == NaN) {
        //     console.log("Con Sma");
        //     // rmaGain = alpha * arrayGain[arrayGain.length - 1] + (1 - alpha) * sma(arrayGain, length);
        //     rmaGain = alpha * arrayGain[arrayGain.length - 1] + (1 - alpha) * sma(arrayGain, arrayGain.length);
        //     prevRmaGain = rmaGain;

        //     // rmaLoss = alpha * arrayLoss[arrayLoss.length - 1] + (1 - alpha) * sma(arrayLoss, length);
        //     rmaLoss = alpha * arrayLoss[arrayLoss.length - 1] + (1 - alpha) * sma(arrayLoss, arrayLoss.length);
        //     prevRmaLoss = rmaLoss;
        //     console.log(prevRmaGain);
        //     console.log(prevRmaLoss);
        // } else if (prevRmaGain != NaN && prevRmaLoss != NaN) {
        //     console.log("Con prevRma");
        //     console.log(prevRmaGain);
        //     console.log(prevRmaLoss);
        //     rmaGain = alpha * arrayGain[arrayGain.length - 1] + (1 - alpha) * prevRmaGain;
        //     prevRmaGain = rmaGain;

        //     rmaLoss = alpha * arrayLoss[arrayLoss.length - 1] + (1 - alpha) * prevRmaLoss;
        //     prevRmaLoss = rmaLoss;
        // };

        rmaGain = alpha * arrayGain[arrayGain.length - 1] + (1 - alpha) * sma(arrayGain, arrayGain.length);
        rmaLoss = alpha * arrayLoss[arrayLoss.length - 1] + (1 - alpha) * sma(arrayLoss, arrayLoss.length);

        rs = rmaGain / rmaLoss;

        res = 100 - (100 / (1 + rs));

        console.log("Rsi: " + res);
        console.log("========================================");
    });

    return res;
};

module.exports = rsi;

//===================================================================================================================
//===================================================================================================================
//===================================================================================================================

// //=================== Calcular RSI ===================
// // rsi= 100 - 100 / (1 + rs)
// // rs = Average Gain / Average Loss
// // gain: 0.03, 0.05, 0.2, 0.03
// // loss: 0.07, 0.15, 0.02
// // Average Gain = [(previous Average Gain) x 13 + current Gain] / 14.
// // Average Loss = [(previous Average Loss) x 13 + current Loss] / 14.

// // const arrayPrueba1 = [6.02, 5.95, 5.95, 5.98, 5.83, 5.81, 5.86, 6.06, 6.09]; //tiene que dar de resultado: rsi 55.75
// // const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; // tiene que dar de resultado: rsi 72.71

// // const rsi = (arrayCloseActual, period) => {
// //     let rsi;
// //     let arrayGain = [];
// //     let arrayLoss = [];
// //     let sumaGain = 0;
// //     let sumaLoss = 0;

// //     arrayCloseActual.forEach((val, idx, arrayCloseActual) => {
// //         const opDiferencia = () => {
// //             if (arrayCloseActual[idx] == undefined || arrayCloseActual[idx + 1] == undefined) {
// //                 return 0;
// //             } else {
// //                 let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
// //                 return dif;
// //             };
// //         };

// //         if (Math.sign(opDiferencia()) == 1 && opDiferencia() != 0) { //diferencias + y -
// //             arrayLoss.push(opDiferencia());
// //         } else if (opDiferencia() != 0) {
// //             arrayGain.push(opDiferencia() * -1);
// //         };
// //     });

// //     console.log("arrayGain: " + arrayGain);
// //     console.log("arrayLoss: " + arrayLoss);
// //     console.log("================================================================================");

// //     for (let idx = 0; idx < arrayGain.length - 1; idx++) {
// //         const element = arrayGain[idx];
// //         // console.log("element arrayGain: " + element);
// //         sumaGain = sumaGain + arrayGain[idx];
// //     };

// //     for (let idx = 0; idx < arrayLoss.length - 1; idx++) {
// //         const element = arrayLoss[idx];
// //         // console.log("element arrayLoss: " + element);
// //         sumaLoss = sumaLoss + arrayLoss[idx];
// //     };
// //     //
// //     let prevAverageGain = sumaGain / 9; // 10 elementos
// //     let prevAverageLoss = sumaLoss / 2 // 3 elementos

// //     // let averageGain = ((prevAverageGain * (period - 1)) + arrayGain[arrayGain.length - 1]) / period;
// //     // let averageLoss = ((prevAverageLoss * (period - 1)) + arrayLoss[arrayLoss.length - 1]) / period;
// //     let averageGain = (((prevAverageGain * (13)) + 3966.66)) / 14;
// //     let averageLoss = (((prevAverageLoss * (13)) + 551.44)) / 14;

// //     // RSI = 100 - (100/1+RS)
// //     rsi = 100 - (100 / (1 + (averageGain / averageLoss)));

// //     console.log("sumaGain: " + sumaGain);
// //     console.log("sumaLoss: " + sumaLoss);
// //     console.log("prevAverageGain: " + prevAverageGain);
// //     console.log("prevAverageLoss: " + prevAverageLoss);
// //     console.log("arrayGain[arrayGain.length - 1]: " + arrayGain[arrayGain.length - 1])
// //     console.log("arrayLoss[arrayLoss.length - 1]: " + arrayLoss[arrayLoss.length - 1])
// //     console.log("averageGain: " + averageGain)
// //     console.log("averageLoss: " + averageLoss)
// //     console.log('RSI: ' + rsi);

// //     return rsi;
// // };


// // rsi(arrayPrueba2, 14);

// //=============================================================================

// const rsi = (arrayCloseActual, period) => {
//     let difPositivas = 0;
//     let difNegativas = 0;
//     let rsi;

//     arrayCloseActual.forEach((val, idx, arrayCloseActual) => {

//         // console.log(arrayCloseActual)
//         // console.log(arrayCloseActual[idx])
//         // console.log(arrayCloseActual[idx + 1])

//         const opDiferencia = () => {
//             if (arrayCloseActual[idx] == undefined || arrayCloseActual[idx + 1] == undefined) {
//                 return 0;
//             } else {
//                 let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
//                 return dif;
//             };
//         };
//         // console.log(opDiferencia());

//         if (Math.sign(opDiferencia()) == 1) { //diferencias + y -
//             difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
//             // console.log('difPositivas: ' + difPositivas);
//         } else {
//             difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
//             // console.log('difNegativas: ' + difNegativas);
//         };

//         //*****************************Obtenemos promedios para up/down******************************//
//         if (arrayCloseActual[idx] == arrayCloseActual[idx = (period - 1)]) {
//             let promedioDown = difPositivas / period; //Calculo promedio clasico
//             let promedioUp = difNegativas / period; //Calculo promedio clasico

//             let promedioUpSuav = ((difNegativas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado
//             let promedioDownSuav = ((difPositivas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado

//             // console.log('promedioUp: ' + promedioUp);
//             // console.log('promedioDown: ' + promedioDown);

//             //*****************************calculos para RS******************************//
//             let rs = promedioUp / promedioDown;
//             // console.log('RS: ' + rs);

//             //*****************************calculos para RSI******************************//
//             // RSI = 100 - (100/1+RS)
//             rsi = 100 - (100 / (1 + rs));
//             // console.log('RSI: ' + calculateRsi);
//         };
//     });
//     return rsi;
// };



// module.exports = rsi;