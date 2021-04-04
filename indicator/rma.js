const sma = require('./sma');

// currentValue: 59299.45 // Resultado miScript: 58935.81 // Resultado ind. rma: 59189.06
let arrayTest = [59107.03000000, 59023.03000000, 59304.75000000, 59249.19000000, 59329.44000000, 59126.06000000, 59000.00000000,
    59109.99000000, 58921.91000000, 59156.28000000, 59251.99000000, 59176.39000000, 59368.35000000, 59330.10000000
];

// Formula RMA = sum := na(sum[1]) ? sma(src, length) : alpha * src + (1 - alpha) * nz(sum[1])
const rma = (src, length, prevRma, currentValue) => { // Deveria recibir current value correspondiente al siguiente valor del src que recibe
    const alpha = 1 / length;
    let res;

    if (src.length != length) { // Calculo sobre un src historico
        let arrayCloseLength = [];

        src.map((curr, idx, src) => {
            start_idx = idx - length;
            upto_idx = idx;

            if (start_idx >= 0) {
                arrayCloseLength = src.slice(start_idx, upto_idx); // Se arman los arrays con la longitud del length proporcionado
            };
            console.log(arrayCloseLength);
            // console.log(curr)
            if (arrayCloseLength.length == length && prevRma != undefined) { // Paso 3. Calculo ideal con prevEma
                res = alpha * curr + (1 - alpha) * prevRma;
                // console.log("prevRma: " + prevRma);
                prevRma = res;
                // console.log("Paso 3. Rma: " + res)
            } else if (arrayCloseLength.length != length) { // Paso 1. array vacios
                // res = console.log('Paso 1. array incompleto o vacio');
            } else if (arrayCloseLength.length == length && prevRma == undefined) { // Paso 2. En el 1er array no existe prevEma, entonces se calcula con sma() y se lo pasa a la siguiente llamada como prevEma
                res = alpha * curr + (1 - alpha) * sma(arrayCloseLength, length);
                prevRma = res;
                // console.log("Paso 2. Rma c/sma: " + res)
            };
        });
    } else if (src.length == length) { // Calculo sobre un src unitario. Requiere que se le envie src, length, y (prevRma o currentValue)
        if (prevRma == undefined && currentValue != undefined) { // prevEma no existe, debo tomar el src para calcular prevEma a traves de sma(), por lo que necesitare que me pase el currentvalue
            console.log(`prevRma: ${prevRma} / currentValue: ${currentValue}`);
            // console.log("Resultado test tradingview:  ");
            res = alpha * currentValue + (1 - alpha) * sma(src, length); // proporcionando currentValue:  (Resultado c/sma: / Resultado tradingView:  )
            prevRma = res;
        } else if (prevRma != undefined && currentValue == undefined) { // prevRma si existe, entonces igualo el src[src.length - 1] == currentValue
            console.log(`prevRma: ${prevRma} / currentValue: ${currentValue}`);
            // console.log("Resultado test tradingview: 53723.46.");
            res = alpha * src[src.length - 1] + (1 - alpha) * prevRma; // proporcionando prevEma: (Resultado tradingview/consola: )
            prevRma = res;
        } else if (prevRma == undefined && currentValue == undefined) { // prevRma y currentValue no existe. El calculo original no se puede hacer. Pero se proporciona calculo auxiliar aproximado de reemplazo
            console.log(`prevRma: ${prevRma} / currentValue: ${currentValue}`);
            // console.log("Error test: debe proporionar el prevRma o el currentValue. Res. tradingview: . Calculo auxiliar: ");
            console.log("Error: debe proporionar el prevRma o el currentValue. Calculo auxiliar: ");
            res = alpha * src[src.length - 1] + (1 - alpha) * sma(src, length); // proporcionando prevRma y currentValue: undefined (Resultado consola:  / Resultado tradingView: )
            prevRma = res;
            console.log(res);
        } else if (prevRma != undefined && currentValue != undefined) {
            res = alpha * currentValue + (1 - alpha) * prevRma; // proporcionando val validos para prevRma y currentValue (Resultado consola/tradingView: )
            prevRma = res;
        };
    };

    return res;
};

// (src, length, prevRma, prevRma, currentValue)
// prevRma: 59175.32/58907.84 // currentValue: 59299.45 // Resultado ind. rma: 59189.06 // miScript: 58935.81
// console.log("Rma: " + rma(arrayTest, 14, undefined, 59299.45) + " / Res. tradingView Ind 59189.06 / miScript: 58935.81");

module.exports = rma;