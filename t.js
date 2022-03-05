console.log('asdasdassd')

// data_lineal = [{'Date': 1644721200000, 'Close': '36620.0', 'is_final': 'True'}, {'Date': 1644807600000, 'Close': '35900.0', 'is_final': 'True'}, 
// {'Date': 1644894000000, 'Close': '36180.0', 'is_final': 'True'}, {'Date': 1644980400000, 'Close': '36500.0', 'is_final': 'False'}];


// data_candl = [
//     {
//       "Date": 1644807600000,
//       "Open": "2953.0",
//       "Close": "2946.0",
//       "High": "2972.0",
//       "Low": "2911.0",
//       "is_final": "True"
//     },
//     {
//       "Date": 1644894000000,
//       "Open": "2910.0",
//       "Close": "2918.0",
//       "High": "2946.0",
//       "Low": "2881.0",
//       "is_final": "True"
//     },
//     {
//       "Date": 1644980400000,
//       "Open": "2940.0",
//       "Close": "3017.0",
//       "High": "3050.0",
//       "Low": "2918.0",
//       "is_final": "False"
//     }
//   ]

  
// func_calc_series = (data) => {
//     const cdataa = data.map((d) => {
//         var newDate = d["Date"]; 
//         var _p = armarPrice(d["Close"]);
//         var _o = armarPrice(d["Open"]);
//         var _h = armarPrice(d["High"]);
//         var _l = armarPrice(d["Low"]);
//         // console.log(newDate, _p, _o, _h, _l)
//         return {
//             time: newDate,
//             open: _o,
//             high: _h,
//             low: _l,
//             close: _p,
//         };
//     });
//     // console.log(cdataa)
//     return cdataa
//     // return series.setData(cdataa);
// };

//     res_series = func_calc_series(data_candl)
//     console.log(res_series)


// function armarPrice(price) {
//         if (price != null) {
//             var _p = price.toString();
//         let _new = _p.replace(",", "").trim();
//         _new = parseFloat(_new);
//         return _new
//         }
//         return 0.0;
//         }


// let unix_timestamp = 1549312452
// // Create a new JavaScript Date object based on the timestamp
// // multiplied by 1000 so that the argument is in milliseconds, not seconds.
// var date = new Date(unix_timestamp * 1000);
// // Hours part from the timestamp
// var hours = date.getHours();
// // Minutes part from the timestamp
// var minutes = "0" + date.getMinutes();
// // Seconds part from the timestamp
// var seconds = "0" + date.getSeconds();

// // Will display time in 10:30:23 format
// var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

// console.log(formattedTime);

function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp);
    var months = ["Ene", "Feb", "Mar","Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    console.log(typeof year)
    return time;
  }
//   console.log(timeConverter(1549312452554));



function convertTZ(date, tzString) {
    res = date.toLocaleString('en-us', {timeZone: tzString});
    // res = new Date(res);
    return res;
}

const date = new Date("2021-05-23 23:55:16 GMT-0500");
// const date = new Date();
console.log(date, typeof(date))

res = convertTZ(date, 'America/bogota')
console.log(res, typeof(res))