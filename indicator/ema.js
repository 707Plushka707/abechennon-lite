const sma = require('./sma');

// const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2, 50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39]; // tiene que dar de resultado: ema 14p 53723.46

//sum := na(sum[1]) ? sma(src, length) : alpha * precioActual + (1 - alpha) * emaAnterior o sma
const ema = (src, length) => {
    const alpha = 2 / (length + 1);
    let res, prevEma;
    let flagSma = true;

    src.map((curr, idx, src) => {
        if (curr.length == length && prevEma != undefined) { // 3er)prevEma existe y length son iguales
            res = alpha * parseFloat(curr) + (1 - alpha) * prevEma;
            // console.log("prevEma " + prevEma)
            // console.log("ema " + res)
            prevEma = res;
            // console.log("=====================================")
        } else if (curr.length != length) { // 1er) array vacios
            // res = console.log('array incompleto o vacio');
        } else if (curr.length == length && prevEma == undefined && flagSma == true) { // 2er) es el 1er array y no existe prevEma
            flagSma = false;
            res = alpha * parseFloat(curr) + (1 - alpha) * sma(curr, length);
            prevEma = res;
        };
        // console.log(res);
        // return res;
    });

    return res;
};

// console.log("Ema: " + ema(arrayPrueba2, 14));

module.exports = ema;