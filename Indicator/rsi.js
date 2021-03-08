//=================== Calcular RSI ===================
// rsi= 100 - 100 / (1 + rs)
// rs = Average Gain / Average Loss

const rsi = (arrayCloseActual, period) => {
    let difPositivas = 0;
    let difNegativas = 0;
    let rsi;

    arrayCloseActual.forEach((val, idx, arrayCloseActual) => {

        const opDiferencia = () => {
            if (arrayCloseActual[idx] === undefined || arrayCloseActual[idx + 1] === undefined) {
                return 0;
            } else {
                let dif = arrayCloseActual[idx] - arrayCloseActual[idx + 1];
                return dif;
            };
        };
        // console.log(opDiferencia());

        if (Math.sign(opDiferencia()) === 1) { //diferencias + y -
            difPositivas = difPositivas + opDiferencia(); //promediosDown si la diferencia es + la almacena aqui
            // console.log('difPositivas: ' + difPositivas);
        } else {
            difNegativas = difNegativas + (opDiferencia() * -1); //promediosUP si la diferencia es - la almacena aqui, tambien lo convertimos a num +
            // console.log('difNegativas: ' + difNegativas);
        };

        //*****************************Obtenemos promedios para up/down******************************//
        if (arrayCloseActual[idx] === arrayCloseActual[idx = (period - 1)]) {
            let promedioDown = difPositivas / period; //Calculo promedio clasico
            let promedioUp = difNegativas / period; //Calculo promedio clasico

            // promedioUp = ((difNegativas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado
            // promedioDown = ((difPositivas / period) + (period - 1) * 0) / period; //Calculo promedio suavizado

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

// getData();

module.exports = rsi;