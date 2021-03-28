const sma = require('./sma');
// const ema = require('./ema');

const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; // tiene que dar de resultado: rsi 72.71
// const arrayPrueba3 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; //

// arrayGain: 4451.369999999995,1908.7200000000012,377.6200000000026,130.48999999999796,2089.550000000003,1403.4199999999983,
// 2509.3300000000017,967.0899999999965,1921.570000000007,3966.6699999999983
// arrayLoss: 1146.3799999999974,1975.280000000006,551.4400000000023

const change = (val, idx, arrayPrueba2) => { //x - x[y]
    if (arrayPrueba2[idx] == undefined || arrayPrueba2[idx + 1] == undefined) {
        return 0;
    } else {
        let change = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
        return change;
    };
};

//sum := na(sum[1]) ? sma(src, length) : alpha * precioActual + (1 - alpha) * emaAnterior o sma
const ema = (src, length) => {
    const alpha = 2 / (length + 1);
    let res;

    src.map((curr, idx, array) => {
        res = alpha * curr + (1 - alpha) * 52575
    });
    return res;
};
// console.log(ema(arrayPrueba2, 14));

//sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
const rma = (src, length) => {
    const alpha = 1 / length;
    let sum;
    let res;

    // console.log("sma " + sma(src, length));

    src.map((curr, idx, src) => {
        if (curr.length == length && prevEma != undefined) { // 3er)prevEma existe y length son iguales
            res = alpha * parseFloat(curr) + (1 - alpha) * prevEma;
            // console.log("prevEma " + prevEma)
            // console.log("ema " + res)
            prevEma = res;
            // console.log("=====================================")
        } else if (curr.length != length) { // 1er) array vacios
            // res = console.log('array incompleto o vacio');
        } else if (curr.length == length && prevEma == undefined && flagSma == true) { // 2er) es el 1er array, pero no existe prevEma
            flagSma = false;
            res = alpha * parseFloat(curr) + (1 - alpha) * sma(curr, length);
            prevEma = res;
        };
        // console.log(res);
        // return res;
    });

    return res;

};

// rma(arrayPrueba2, 14);

//rs = rma(u, y) / rma(d, y)
const rs = (arrayGain, arrayLoss, length) => {
    let res = rma(arrayGain, length) / rma(arrayLoss, length);
    return res;
};

//======================================================================================================

//sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
let flagRma = true;
let prevRmaGain;
let prevRmaLoss;
const rsi = (src, length) => {
    let arrayGain = [];
    let arrayLoss = [];
    let rmaGain;
    let rmaLoss;
    const alpha = 1 / length;

    console.log("========================================")
        // console.log(src)
    src.forEach((curr, idx, src) => {
        change(curr, idx, src) > 0 ? arrayGain.push(change(curr, idx, src)) : 0.0
        change(curr, idx, src) < 0 ? arrayLoss.push(change(curr, idx, src) * -1) : 0.0
    });
    // console.log(src[length - 1])
    // console.log(arrayGain)
    // console.log(arrayLoss)

    if (flagRma == false) { // 3er)prevEma existe y length son iguales
        console.log("Paso 3..")
        console.log("flag " + flagRma)
        console.log("precio " + src[length - 1])
        rmaGain = alpha * parseFloat(src[length - 1]) + (1 - alpha) * prevRmaGain;
        rmaLoss = alpha * parseFloat(src[length - 1]) + (1 - alpha) * prevRmaLoss;
        prevRmaGain = rmaGain;
        prevRmaLoss = rmaLoss;
        console.log("prevRmaGain " + prevRmaGain)
        console.log("prevRmaLoss " + prevRmaLoss)
    } else if (arrayGain.length == 0 && arrayLoss.length == 0) { // 1er) array vacios
        console.log("Paso 1: Array vacios..");
        console.log("flag " + flagRma)
    } else if ((arrayGain.length > 0 || arrayLoss.length > 0) && flagRma == true) { // 2er) es el 1er array y no existe prevEma
        flagRma = false;
        console.log("Paso 2..")
        console.log("flag " + flagRma)
        console.log("precio " + src[length - 1])
        rmaGain = alpha * parseFloat(src[length - 1]) + (1 - alpha) * sma(arrayGain, length);
        rmaLoss = alpha * parseFloat(src[length - 1]) + (1 - alpha) * sma(arrayLoss, length);
        prevRmaGain = rmaGain;
        prevRmaLoss = rmaLoss;
        console.log("prevRmaGain " + prevRmaGain)
        console.log("prevRmaLoss " + prevRmaLoss)
    };

    let res = 100 - (100 / (1 + rmaGain / rmaLoss));

    return res;
};

// rsi(arrayPrueba2, 14)
// console.log(rsi(arrayPrueba2, 14));

// sma(arrayPrueba2, 14)

//======================================================================================================
//======================================================================================================

// arrayPrueba2.forEach((val, idx, arrayPrueba2) => {
//     //======================================================================================================
//     // u = max(x - x[1], 0) // upward change
//     // d = max(x[1] - x, 0)// downward change

//     // let changeU = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
//     // let changeD = arrayPrueba2[idx + 1] - arrayPrueba2[idx];

//     // if (changeU > 0) {
//     //     // let changeU = arrayPrueba2[idx] - arrayPrueba2[idx + 1];
//     //     arrayGain.push(changeU)
//     // } else if (changeD > 0) {
//     //     // let changeD = arrayPrueba2[idx + 1] - arrayPrueba2[idx];
//     //     arrayLoss.push(changeD);
//     // };
//     //======================================================================================================

// });
// console.log(arrayGain)
// console.log(arrayLoss)

module.exports = rsi;