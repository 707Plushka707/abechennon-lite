const rma = require('./rma');
const sma = require('./sma');
const { change, srcLength, sumArray, max } = require('./utils');

const rsi = (src, length) => { // Este RSI recibe un arrayclose con la coleccion de 500 close
    let res;
    let prevRmaGain = 0;
    let prevRmaLoss = 0;
    let flagPrevRma = false;

    src.forEach((curr, idx, src) => {
        const alpha = 1 / length;
        let arrayCloseLength = [];
        let arrayGain = [];
        let arrayLoss = [];
        let rmaGain, rmaLoss, rs, lastAg, lastAl, smoothedRs;

        let start_idx = idx - length;
        let upto_idx = idx;

        if (start_idx >= 0) {
            arrayCloseLength = src.slice(start_idx, upto_idx); // Se arman los arrays con la longitud del length proporcionado

            arrayCloseLength.forEach((currentValue, idx, arrayCloseLength) => {
                change(currentValue, idx, arrayCloseLength) < 0 ? arrayGain.push(change(currentValue, idx, arrayCloseLength) * -1) : 0.0
                change(currentValue, idx, arrayCloseLength) > 0 ? arrayLoss.push(change(currentValue, idx, arrayCloseLength)) : 0.0
                    // arrayGain.push(max(currentValue - arrayCloseLength[idx + 1], 0));
                    // arrayLoss.push(max(arrayCloseLength[idx + 1] - currentValue, 0));
            });

            let lastChange = curr - arrayCloseLength[arrayCloseLength.length - 1]; //Calculos para el ultimo change

            if (Math.sign(lastChange) == 1) {
                lastAg = lastChange;
                lastAl = arrayLoss[arrayLoss.length - 1];
            } else if (Math.sign(lastChange) == -1) {
                lastAg = arrayGain[arrayGain.length - 1];
                lastAl = lastChange * -1;
            };
            console.log(`CurrentValue: ${curr}`);
            if (flagPrevRma == false) { //Exponential (Lame) [Closest to Trading View]
                flagPrevRma = true
                console.log("First RS: Con Sma");
                rmaGain = alpha * lastAg + (1 - alpha) * sma(arrayGain, length);
                prevRmaGain = rmaGain;
                rmaLoss = alpha * lastAl + (1 - alpha) * sma(arrayLoss, length);
                prevRmaLoss = rmaLoss;

                firstRsClassic = sma(arrayGain, length) / sma(arrayLoss, length);
                prevSmaGain = sma(arrayGain, length);
                prevSmaLoss = sma(arrayLoss, length);
            } else if (flagPrevRma == true) {
                console.log("Smoothed RS: Con prevRma");
                rmaGain = alpha * lastAg + (1 - alpha) * prevRmaGain;
                prevRmaGain = rmaGain;
                rmaLoss = alpha * lastAl + (1 - alpha) * prevRmaLoss;
                prevRmaLoss = rmaLoss;

                smoothedRs = (((prevSmaGain * length - 1) + lastAg) / length) / (((prevSmaLoss * length - 1) + lastAl) / length);
                prevSmaGain = sma(arrayGain, length);
                prevSmaLoss = sma(arrayLoss, length);
            };

            rsRma = rmaGain / rmaLoss;
            rmaRes = 100 - (100 / (1 + rsRma));

            wilderLastAg = (prevRmaGain * 13 + lastAg);
            wilderLastAl = (prevRmaLoss * 13 + lastAl);
            wilderRs = wilderLastAg / wilderLastAl;
            wilderRes = 100 - (100 / (1 + wilderRs));

            smoothedRes = 100 - (100 / (1 + smoothedRs));

            rsClassic = (sumArray(arrayGain) / length) / (sumArray(arrayLoss) / length);
            classicRes = 100 - (100 / (1 + rsClassic));

            console.log("Rsi-Rma: " + rmaRes);
            console.log("Rsi-Wilder: " + wilderRes);
            console.log("Rsi-Smoothed: " + smoothedRes);
            console.log("Rsi-Classic: " + classicRes);
            console.log("========================================");
        };


    });

    // return res;
};

//===================================================================================================================

const rsiCutler = (src, length) => {

    src.forEach((curr, idx, src) => {
        const alpha = 1 / length;
        let arrayCloseLength = [];
        let arrayGain = [];
        let arrayLoss = [];
        let rmaGain, rmaLoss, rs, lastAg, lastAl, smoothedRs;
        let up = 0;
        let dn = 0

        let start_idx = idx - length;
        let upto_idx = idx;

        if (start_idx >= 0) {
            arrayCloseLength = src.slice(start_idx, upto_idx); // Se arman los arrays con la longitud del length proporcionado
            console.log(arrayCloseLength);
            console.log(curr);

            arrayCloseLength.forEach((curr, idx, arrayCloseLength) => {
                if (curr > arrayCloseLength[arrayCloseLength.length - 1]) {
                    up += curr - arrayCloseLength[arrayCloseLength.length - 1];
                    dn += 0;
                } else {
                    up += 0;
                    dn += arrayCloseLength[arrayCloseLength.length - 1] - curr;
                };

                change(curr, idx, arrayCloseLength) < 0 ? arrayGain.push(change(curr, idx, arrayCloseLength) * -1) : 0.0
                change(curr, idx, arrayCloseLength) > 0 ? arrayLoss.push(change(curr, idx, arrayCloseLength)) : 0.0
                    //     // arrayGain.push(max(curr - arrayCloseLength[idx + 1], 0));
                    //     // arrayLoss.push(max(arrayCloseLength[idx + 1] - curr, 0));
            });

            // console.log(up)
            // console.log(dn)

            // console.log(sumArray(arrayGain));
            // console.log(sumArray(arrayLoss));

            let upAvg = (sumArray(arrayGain) / arrayGain.length * (length - 1) + sumArray(arrayGain)) / length;
            let dnAvg = (sumArray(arrayLoss) / arrayLoss.length * (length - 1) + sumArray(arrayLoss)) / length;

            let rsi = 100 * (upAvg / (upAvg + dnAvg));
            console.log("RSI: " + rsi)

        };
    });

};

module.exports = {
    rsi,
    rsiCutler
}