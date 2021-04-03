const sma = require('./sma');

const arrayPrueba2 = [45135.66, 49587.03, 48440.65, 50349.37, 48374.09, 48751.71, 48882.2,
    50971.75, 52375.17, 54884.5, 55851.59, 57773.16, 57221.72, 61188.39
];

//Formula: sum := na(sum[1]) ? sma(src, length) : alpha * precioActual + (1 - alpha) * ema anterior o sino existe, el sma previo

// Si el calculo es sobre un src historico (coleccion de closes), se le indica por length los periodos para el indicador 
//(la funcion armara los arrays con los length que se le pasen). Opcional proporcionar el prevEma. AQUI el currentValue no se usa!!
// Si el calculo es sobre un periodo unitario, se le pasa el src, length (periodo) y obligatorio el (prevEma o currentValue).
// Caso 1 - Periodo unitario: los parametros que recibe, prevEma: ema anterior proporcionado. src: se usa para extraer el 
//currentValue. length: es el periodo. 
// Caso 2 - Periodo unitario: los parametros que recibe, currentValue: precio actual proporcionado. src: se usa para calcular 
//el prevEma a traves de sma(). length: es el periodo.

const ema = (src, length, prevEma, currentValue) => {
    const alpha = 2 / (length + 1);
    let res;

    if (src.length != length) { // Calculo sobre un src historico
        let arrayCloseLength = [];

        src.map((curr, idx, src) => {
            start_idx = idx - length;
            upto_idx = idx;

            if (start_idx >= 0) {
                arrayCloseLength = src.slice(start_idx, upto_idx); // Se arman los arrays con la longitud del length proporcionado
            };
            // console.log(arrayCloseLength);
            // console.log(curr)
            if (arrayCloseLength.length == length && prevEma != undefined) { // Paso 3. Calculo ideal con prevEma
                res = alpha * curr + (1 - alpha) * prevEma;
                // console.log("prevEma: " + prevEma);
                prevEma = res;
                // console.log("Paso 3. ema: " + res)
            } else if (arrayCloseLength.length != length) { // Paso 1. array vacios
                // res = console.log('Paso1. array incompleto o vacio');
            } else if (arrayCloseLength.length == length && prevEma == undefined) { // Paso 2. En el 1er array no existe prevEma, entonces se calcula con sma() y se lo pasa a la siguiente llamada como prevEma
                res = alpha * curr + (1 - alpha) * sma(arrayCloseLength, length);
                prevEma = res;
                // console.log("Paso 2. ema c/sma: " + res)
            };
        });
    } else if (src.length == length) { // Calculo sobre un src unitario. Requiere que se le envie src, length, y (prevEma o currentValue)
        if (prevEma == undefined && currentValue != undefined) { // prevEma no existe, debo tomar el src para calcular prevEma a traves de sma(), por lo que necesitare que me pase el currentvalue
            console.log(`prevEma: ${prevEma} / currentValue: ${currentValue}`);
            // console.log("Resultado test tradingview: 53723.46.");
            res = alpha * currentValue + (1 - alpha) * sma(src, length); // proporcionando currentValue: 58968.31 (Resultado c/sma: 53039.73 / Resultado tradingView: 54422.77)
            prevEma = res;
        } else if (prevEma != undefined && currentValue == undefined) { // prevEma si existe, entonces igualo el src[src.length - 1] == currentValue
            console.log(`prevEma: ${prevEma} / currentValue: ${currentValue}`);
            // console.log("Resultado test tradingview: 53723.46.");
            res = alpha * src[src.length - 1] + (1 - alpha) * prevEma; // proporcionando prevEma: 52575.00 (Resultado tradingview/consola: 53723.46)
            prevEma = res;
        } else if (prevEma == undefined && currentValue == undefined) { // prevEma y currentValue no existe. El calculo original no se puede hacer. Pero se proporciona calculo auxiliar aproximado de reemplazo
            console.log(`prevEma: ${prevEma} / currentValue: ${currentValue}`);
            // console.log("Error test: debe proporionar el prevEma o el currentValue. Res. tradingview: 53723.46. Calculo auxiliar: ");
            console.log("Error: debe proporionar el prevEma o el currentValue. Calculo auxiliar: ");
            res = alpha * src[src.length - 1] + (1 - alpha) * sma(src, length); // proporcionando prevEma y currentValue: undefined (Resultado consola: 53335.74 / Resultado tradingView: 53723.46)
            prevEma = res;
        } else if (prevEma != undefined && currentValue != undefined) {
            res = alpha * currentValue + (1 - alpha) * prevEma; // proporcionando val validos para prevEma y currentValue (Resultado consola/tradingView: 53723.46)
            prevEma = res;
        };
    };

    return res;
};

// console.log("Ema: " + ema(arrayPrueba2, 14, undefined, undefined)); // (arrayPrueba2, 14, 52575.00, 58968.31) // Resultado ema  14p tradingview: 53723.46

module.exports = ema;