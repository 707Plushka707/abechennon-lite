const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));
const { sumArray, srcLength } = require('./utils');

// Recibe un/unos arrays con la coleccion de valores individuales o historicos. Devuelve el valor del sma, en el caso de historicos devuelve un array con los sma
const sma = (src, length) => {
    try {
        if (src.length != length) { // En este caso recibe un array con la coleccion de array de valores historicos
            let arrayPointSma = new Array;

            let arrayCloseLength = srcLength(src, length);

            arrayCloseLength.map((curr, idx, p) => {
                let arrayPointLength = arrayCloseLength[idx];

                let sum = sumArray(arrayPointLength);
                let sma = sum / length;

                arrayPointSma.push(sma);
            });

            return arrayPointSma;

        } else { // En este caso recibe un array individual, o sea con la logitud igual al length dado
            let sum = sumArray(src);
            let sma = sum / length;

            return sma;
        };

    } catch (error) {
        console.log(error);
    };
};

module.exports = sma;