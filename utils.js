const util = require('util') // expandir items del console.log => console.log(util.inspect(array, { maxArrayLength: null }));

// Recibe un array. Devuelve la diferencia hacia arriba de sus elementos. Si alguno de sus valores es undefined, retorna 0
const changeUp = (i, src) => {
    try {
        if (src[i] == undefined || src[i + 1] == undefined) {
            return 0;
        } else {
            let upward = src[i] > src[i - 1] ? src[i] - src[i - 1] : 0;
            return upward;
        };

    } catch (error) {
        console.log(error);
    };
};

// Recibe un array. Devuelve la diferencia hacia abajo de sus elementos. Si alguno de sus valores es undefined, retorna 0
const changeDown = (i, src) => {
    try {
        if (src[i] == undefined || src[i + 1] == undefined) {
            return 0;
        } else {
            let downward = src[i] < src[i - 1] ? src[i - 1] - src[i] : 0;
            return downward;
        };

    } catch (error) {
        console.log(error);
    };
};

// Recibe un array con la coleccion de valores historicos. Devuelve una coleccion de arrays dentro de un array, cada array con longitud igual al length indicada
const srcLength = (src, length) => {
    try {
        let arrayShort = [];
        let arrayCloseLength = [];

        for (idx = 0; idx <= src.length; ++idx) {
            start_idx = idx - length;
            upto_idx = idx;
            if (start_idx >= 0) {
                arrayShort = src.slice(start_idx, upto_idx);
                if (arrayShort.length == length) arrayCloseLength.push(arrayShort);
            };
        };

        return arrayCloseLength;

    } catch (error) {
        console.log(error);
    };
};

// Recibe un array. Devuelve la suma de los elementos del array dado
const sumArray = (src) => {
    try {
        let sum = src.reduce((acc, curr, idx, src) => {
            acc = acc + parseFloat(curr);
            return acc;
        }, 0);

        return sum;

    } catch (error) {
        console.log(error);
    };
};

// Recibe dos numeros. Devuelve el mayor de los dos
const max = (a, b) => {
    try {
        if (a > b) {
            return a;
        } else {
            return b;
        };

    } catch (error) {
        console.log(error);
    };
};

// Recibe un array y un indice. Devuelve el valor previo, correspondiente al indice dado. Si el valor es undefined, devuelve 0
const prevPrice = (i, src) => {
    try {
        if (src[i - 1] == undefined) {
            return 0;
        } else {
            return src[i - 1][1]
        };
    } catch (error) {
        console.log(error);
    };
};

// Recibe un nro y un % a calcular. Y devuelve el porcentaje calculado
const percent = (curr, percent) => {
    try {
        let res = (percent / 100) * curr;

        return res;

    } catch (error) {
        console.log(error);
    };
};

module.exports = { changeUp, changeDown, srcLength, sumArray, max, prevPrice, percent };