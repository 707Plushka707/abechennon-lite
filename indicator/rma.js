const sma = require('./sma');

//sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
let flagRma = true;
let prevRma;
let arrayCloseLength = [];

// res = 58907.84
let a = [59107.03000000, 59023.03000000, 59304.75000000, 59249.19000000, 59329.44000000, 59126.06000000, 59000.00000000, 59109.99000000, 58921.91000000, 59156.28000000, 59251.99000000, 59176.39000000, 59368.35000000, 59330.10000000]

// RMA = sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
const rma = (src, length, prevRma, lastValue, currentValue) => { // Deveria recibir current value correspondiente al siguiente valor del src que recibe
    const alpha = 1 / length;
    let res;
    // console.log("======================");

    // console.log(src)
    // console.log(length)
    // console.log(src[src.length - 1])
    // console.log(curr)
    // console.log("Sma: " + sma(src, length))
    console.log("RMA prevRma " + prevRma)


    // ================ alpha * currentValue + (1 - alpha) * prevRma) ================
    // let res = alpha * 59299.45 + (1 - alpha) * 58907.84; // test OK, res = 58935.81
    // let res = alpha * 59299.45 + (1 - alpha) * sma(src, length); // test con Sma, res = 59184.18

    let currentChange = lastValue - currentValue;

    // console.log(`Rma-currentChange: ${lastValue} - ${currentValue}`);
    // console.log(`prevRma ` + prevRma)

    // let res = alpha * currentChange + (1 - alpha) * sma(src, length);
    // let res = alpha * src[src.length - 1] + (1 - alpha) * sma(src, length);

    if (prevRma == undefined || prevRma == 0) {
        res = sma(src, length);
    } else {
        res = alpha * src[src.length - 1] + (1 - alpha) * prevRma;
    }

    // console.log("=======RMA==========");
    return res;
};

//======================================================================================================
//======================================================================================================

// Funcion para utilizar dentro del rsi
// const rma = (src, length) => {
//     const alpha = 1 / length;
//     let rma;

//     if (flagRma == false) { // 3er)prevRma existe y length son iguales
//         // console.log("========================================");
//         // console.log("Paso 3..")
//         rma = alpha * curr + (1 - alpha) * prevRma;
//         prevRma = rma;
//         console.log("Rma " + rma);
//     } else if (src.length == 0 || src.length == undefined) { // 1er) array vacios
//         console.log("Paso 1: Array vacios..");
//     } else if (src.length != 0 && flagRma == true) { // 2er) es el 1er array y no existe prevRma
//         flagRma = false;
//         console.log("Paso 2..")
//         rma = alpha * src.length + (1 - alpha) * sma(arrayCloseLength, length);
//         // rma = alpha * curr + (1 - alpha) * 55696.62;
//         prevRma = rma;
//         // console.log("1er Rma " + rma);
//     };

//     return rma;
// };

//======================================================================================================
//======================================================================================================

// Funcion para colocar directamente en trading.js, recibe un arrayClose con 500 value, 
// const rma = (src, length) => {
//     const alpha = 1 / length;
//     let rma;

//     src.map((curr, idx, src) => {
//         start_idx = idx - length;
//         upto_idx = idx;

//         if (start_idx >= 0) {
//             arrayCloseLength = src.slice(start_idx, upto_idx);
//         }

//         if (flagRma == false) { // 3er)prevRma existe y length son iguales
//             // console.log("========================================");
//             // console.log("Paso 3..")
//             rma = alpha * curr + (1 - alpha) * prevRma;
//             prevRma = rma;
//             console.log("Rma " + rma);
//         } else if (arrayCloseLength.length != length || src.length == 0 || src.length == undefined) { // 1er) array vacios
//             // console.log("Paso 1: Array vacios..");
//         } else if (arrayCloseLength.length == length && flagRma == true) { // 2er) es el 1er array y no existe prevRma
//             flagRma = false;
//             // console.log("Paso 2..")
//             rma = alpha * curr + (1 - alpha) * sma(arrayCloseLength, length);
//             // rma = alpha * curr + (1 - alpha) * 55696.62;
//             prevRma = rma;
//             console.log("1er Rma " + rma);
//         };
//     });

//     return rma;
// };

module.exports = rma;