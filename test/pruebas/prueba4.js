/*probando tulind (no funciona bien el rsi en 14 periodos!)
https://tulipindicators.org/rsi
https://github.com/TulipCharts/tulipnode
*/

// const tulind = require('tulind');
// console.log("Tulip Indicators version is:");
// console.log(tulind.version);

// var open = [4, 5, 5, 5, 4, 4, 4, 6, 6, 6];
// var high = [9, 7, 8, 7, 8, 8, 7, 7, 8, 7];
// var low = [1, 2, 3, 3, 2, 1, 2, 2, 2, 3];
// var close = [10473.46000000, 10462.53000000, 10486.36000000, 10446.25000000, 10517.81000000, 10544.17000000, 10496.18000000, 10481.71000000, 10438.25000000, 10473.65000000, 10465.00000000, 10483.73000000, 10489.94000000, 10437.12000000];
// var volume = [123, 232, 212, 232, 111, 232, 212, 321, 232, 321];

//58.93
// var close = [11376.68000000, 11378.13000000, 11397.01000000, 11415.50000000, 11398.63000000, 11387.83000000, 11409.95000000, 11422.45000000, 11417.65000000, 11425.01000000, 11434.91000000, 11445.23000000, 11427.44000000, 11446.65000000];

// let close = [11446.65, 11427.44, 11445.23, 11434.91, 11425.01, 11417.65, 11422.45, 11409.95, 11387.83, 11398.63, 11415.5, 11397.01, 11378.13, 11376.68];

// let close = [11446.65, 11427.44, 11445.23];

// const reversed = close.reverse();
// console.log('reversed:', reversed);

// tulind.indicators.rsi.indicator([close], [3], function(err, results) {
//     console.log("Result of RSI is:");
//     console.log(results[0]);
// });

/***************************************************************************************/

// load the module and display its version
var talib = require('./build/Release/talib');
console.log("TALib Version: " + talib.version);

// Display all available indicator function names
var functions = talib.functions;
for (i in functions) {
    console.log(functions[i].name);
}



/***************************************************************************************/

// tulind.indicators.sma.indicator([close], [3], function(err, results) {
//     console.log("Result of sma is:");
//     console.log(results[0]);
//   });

//   //Functions that take multiple inputs, options, or outputs use arrays.
// //Call Stochastic Oscillator, taking 3 inputs, 3 options, and 2 outputs.
// tulind.indicators.stoch.indicator([high, low, close], [5, 3, 3], function(err, results) {
//     console.log("Result of stochastic oscillator is:");
//     console.log(results[0]);
//     console.log(results[1]);
//   });   

//   console.log(tulind.indicators.stoch);
//   console.log(tulind.indicators);