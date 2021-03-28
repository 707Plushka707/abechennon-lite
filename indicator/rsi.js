//=================== Calcular RSI ===================
// rsi= 100 - 100 / (1 + rs)
// rs = Average Gain / Average Loss
// gain: 0.03, 0.05, 0.2, 0.03
// loss: 0.07, 0.15, 0.02
// Average Gain = [(previous Average Gain) x 13 + current Gain] / 14.
// Average Loss = [(previous Average Loss) x 13 + current Loss] / 14.

// const arrayPrueba1 = [6.02, 5.95, 5.95, 5.98, 5.83, 5.81, 5.86, 6.06, 6.09]; //tiene que dar de resultado: rsi 55.75
// const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; // tiene que dar de resultado: rsi 72.71

// const rsi = (arrayCloseActual, period) => {
//     let rsi;
//     let arrayGain = [];
//     let arrayLoss = [];
//     let sumaGain = 0;
//     let sumaLoss = 0;

//     arrayCloseActual.forEach((val, idx, arrayCloseActual) => {
//         const opDiferencia = () => {
//             if (arrayCloseActual[idx] == undefined || arrayCloseActual[idx + 1] == undefined) {
//                 return 0;
//             } else {
//                 let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
//                 return dif;
//             };
//         };

//         if (Math.sign(opDiferencia()) == 1 && opDiferencia() != 0) { //diferencias + y -
//             arrayLoss.push(opDiferencia());
//         } else if (opDiferencia() != 0) {
//             arrayGain.push(opDiferencia() * -1);
//         };
//     });

//     console.log("arrayGain: " + arrayGain);
//     console.log("arrayLoss: " + arrayLoss);
//     console.log("================================================================================");

//     for (let idx = 0; idx < arrayGain.length - 1; idx++) {
//         const element = arrayGain[idx];
//         // console.log("element arrayGain: " + element);
//         sumaGain = sumaGain + arrayGain[idx];
//     };

//     for (let idx = 0; idx < arrayLoss.length - 1; idx++) {
//         const element = arrayLoss[idx];
//         // console.log("element arrayLoss: " + element);
//         sumaLoss = sumaLoss + arrayLoss[idx];
//     };
//     //
//     let prevAverageGain = sumaGain / 9; // 10 elementos
//     let prevAverageLoss = sumaLoss / 2 // 3 elementos

//     // let averageGain = ((prevAverageGain * (period - 1)) + arrayGain[arrayGain.length - 1]) / period;
//     // let averageLoss = ((prevAverageLoss * (period - 1)) + arrayLoss[arrayLoss.length - 1]) / period;
//     let averageGain = (((prevAverageGain * (13)) + 3966.66)) / 14;
//     let averageLoss = (((prevAverageLoss * (13)) + 551.44)) / 14;

//     // RSI = 100 - (100/1+RS)
//     rsi = 100 - (100 / (1 + (averageGain / averageLoss)));

//     console.log("sumaGain: " + sumaGain);
//     console.log("sumaLoss: " + sumaLoss);
//     console.log("prevAverageGain: " + prevAverageGain);
//     console.log("prevAverageLoss: " + prevAverageLoss);
//     console.log("arrayGain[arrayGain.length - 1]: " + arrayGain[arrayGain.length - 1])
//     console.log("arrayLoss[arrayLoss.length - 1]: " + arrayLoss[arrayLoss.length - 1])
//     console.log("averageGain: " + averageGain)
//     console.log("averageLoss: " + averageLoss)
//     console.log('RSI: ' + rsi);

//     return rsi;
// };


// rsi(arrayPrueba2, 14);

//=============================================================================

const rsi = (arrayCloseActual, period) => {
    let difPositivas = 0;
    let difNegativas = 0;
    let rsi;

    arrayCloseActual.forEach((val, idx, arrayCloseActual) => {

        // console.log(arrayCloseActual)
        // console.log(arrayCloseActual[idx])
        // console.log(arrayCloseActual[idx + 1])

        const opDiferencia = () => {
            if (arrayCloseActual[idx] == undefined || arrayCloseActual[idx + 1] == undefined) {
                return 0;
            } else {
                let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
                return dif;
            };
        };
        // console.log(opDiferencia());

        if (Math.sign(opDiferencia()) == 1) { //diferencias + y -
            difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
            // console.log('difPositivas: ' + difPositivas);
        } else {
            difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
            // console.log('difNegativas: ' + difNegativas);
        };

        //*****************************Obtenemos promedios para up/down******************************//
        if (arrayCloseActual[idx] == arrayCloseActual[idx = (period - 1)]) {
            let promedioDown = difPositivas / period; //Calculo promedio clasico
            let promedioUp = difNegativas / period; //Calculo promedio clasico

            let promedioUpSuav = ((difNegativas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado
            let promedioDownSuav = ((difPositivas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado

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



module.exports = rsi;