let prueba2_1 = () => {
    console.log('esta es una funcion de flecha simple')
};

const prueba2_ = ((error, response) => {
    if (error) {
        console.error(error)
    } else {
        console.log(response)
    };
});

//*******************************************************************************************//
//*************************************Funciones comunes*************************************//
//*******************************************************************************************//
//this apunta a lo que valga adentro de la funcion

function saludar(nombre) {
    return console.log("Hola " + nombre);
};

function suma(a, b) {
    let resultado = a + b;
    return console.log(resultado)
};

function despedir(nom) {
    return console.log(`chau, ${nom}`);
};

//*******************************************************************************************//
//*************************************Función de flecha*************************************//
//*******************************************************************************************//
//this apunta a lo que valga fuera de la funcion de flecha

let saludar = (nombre) => `hola ${nombre}`;

console.log(saludar('Pablo'));

//*******************************************************************************************//
//*************************************Callback*************************************//
//*******************************************************************************************//

// setTimeout(() => {
//     console.log('Hola Mundo');
// }, 3000);

let getUsuarioById = (id, callback) => {

    let usuario = {
            nombre: 'Fernando',
            id
        },
        if (id === 20) {
            callback(`El usuario con id ${ id }, no existe en la BD`);
        } else {
            callback(null, usuario);
        };
};

getUsuarioById(1, (err, usuario) => {

    if (err) {
        return console.log(err);
    };
    console.log('Usuario de base de datos', usuario);
});

//**********************************/

let empleados = [{
    id: 1,
    nombre: 'Fernando'
}, {
    id: 2,
    nombre: 'Melissa'
}, {
    id: 3,
    nombre: 'Juan'
}];

let salarios = [{
    id: 1,
    salario: 1000
}, {
    id: 2,
    salario: 2000
}];

let getEmpleado = (id, callback) => {

    let empleadoDB = empleados.find(empleado => empleado.id === id)

    if (!empleadoDB) {
        callback(`No existe un empleado con el ID ${ id }`)
    } else {
        callback(null, empleadoDB);
    }
};

let getSalario = (empleado, callback) => {

    let salarioDB = salarios.find(salario => salario.id === empleado.id);

    if (!salarioDB) {
        callback(`No se encontró un salario para el usuario ${ empleado.nombre }`);
    } else {
        callback(null, {
            nombre: empleado.nombre,
            salario: salarioDB.salario,
            id: empleado.id
        });
    };
};

getEmpleado(3, (err, empleado) => {

    if (err) {
        return console.log(err);
    }

    getSalario(empleado, (err, resp) => {

        if (err) {
            return console.log(err);
        };
        console.log(`El salario de ${ resp.nombre } es de ${ resp.salario }$`);
    });
});

const call1 = (callback1) => {
    const call2 = (callback2) => {
        const call3 = (callback3) => {
            const call4 = (callback4) => {
                const call5 = (callback5) => {};
            };
        };
    };
};

call1(() => console.log('call'));

//*******************************************************************************************//
//*************************************Promesas**********************************************//
//*******************************************************************************************//

let empleados = [{
    id: 1,
    nombre: 'Fernando'
}, {
    id: 2,
    nombre: 'Melissa'
}, {
    id: 3,
    nombre: 'Juan'
}];

let salarios = [{
    id: 1,
    salario: 1000
}, {
    id: 2,
    salario: 2000
}];


let getEmpleado = (id) => {

    return new Promise((resolve, reject) => {

        let empleadoDB = empleados.find(empleado => empleado.id === id)

        if (!empleadoDB) {
            reject(`No existe un empleado con el ID ${ id }`)
        } else {
            resolve(empleadoDB);
        }
    });
}

let getSalario = (empleado) => {

    return new Promise((resolve, reject) => {

        let salarioDB = salarios.find(salario => salario.id === empleado.id);

        if (!salarioDB) {
            reject(`No se encontró un salario para el usuario ${ empleado.nombre }`);
        } else {
            resolve({
                nombre: empleado.nombre,
                salario: salarioDB.salario,
                id: empleado.id
            });
        }

    });
}


getEmpleado(10).then(empleado => {

        return getSalario(empleado);

    })
    .then(resp => {
        console.log(`El saladio de ${ resp.nombre } es de ${ resp.salario }`);
    })
    .catch(err => {
        console.log(err);
    });

//*******************************************************************************************//
//*************************************Async Await*******************************************//
//*******************************************************************************************//
let abs = async() => {};
let abc = (async s => {})();

let getNombre = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Fernando');
        }, 3000);
    });
};


let saludo = async() => {
    let nombre = await getNombre();
    return `Hola ${ nombre }`;
};


saludo().then(mensaje => {
    console.log(mensaje);
})

//***************************************************************************/

let empleados = [{
    id: 1,
    nombre: 'Fernando'
}, {
    id: 2,
    nombre: 'Melissa'
}, {
    id: 3,
    nombre: 'Juan'
}];

let salarios = [{
    id: 1,
    salario: 1000
}, {
    id: 2,
    salario: 2000
}];


let getEmpleado = async(id) => {
    let empleadoDB = empleados.find(empleado => empleado.id === id)
    if (!empleadoDB) {
        throw new Error(`No existe un empleado con el ID ${ id }`)
    } else {
        return empleadoDB;
    };
};

let getSalario = async(empleado) => {
    let salarioDB = salarios.find(salario => salario.id === empleado.id);
    if (!salarioDB) {
        throw new Error(`No se encontró un salario para el usuario ${ empleado.nombre }`);
    } else {
        return {
            nombre: empleado.nombre,
            salario: salarioDB.salario,
            id: empleado.id
        };
    };
};

let getInformacion = async(id) => {
    let empleado = await getEmpleado(id);
    let resp = await getSalario(empleado);
    return `${ resp.nombre } tiene un salario de ${ resp.salario }$`;
};

getInformacion(3)
    .then(mensaje => console.log(mensaje))
    .catch(err => console.log(err));
//****************************************************************

const getAbs = async() => {
    try {
        const resp = await resp.jspn();
        console.log(resp);
    } catch (error) {
        console.log(error)
    };
};

getAbs();

//****************************************************************

const asyncAwait = (async _ => {
    try {
        const response = await binance.prices("NEOBTC")
        console.log(response)
    } catch (error) {
        console.error(error)
    }
})();


//*******************************************************************************************//
//*************************************Destructuracion***************************************//
//*******************************************************************************************//

let deadpool = {
    nombre: 'Wade',
    apellido: 'Winston',
    poder: 'Regeneración',
    getNombre: function() {
        return `${ this.nombre } ${ this.apellido } - poder: ${ this.poder}`
    }
};

// let nombre = deadpool.nombre;
// let apellido = deadpool.apellido;
// let poder = deadpool.poder;

let { nombre: primerNombre, apellido, poder } = deadpool;

console.log(primerNombre, apellido, poder);

//*******************************************************************************************//
//*************************************Expresiones de función********************************//
//*******************************************************************************************//

let foo = function bar() {
    // las sentencias van aqui
};

let expresionSaludar = function(nombre) {
    return console.log("Hola " + nombre);
};

// let saludaPedro = expresionSaludar("pedro");

////////////////

let factorial = function fac(n) {
    return n < 2 ? 1 : n * fac(n - 1);
};

// console.log(factorial(3));

////////////////

let multiplicar = function(x) { //Expresión de funcion
    return x * x * x;
};

// map(multiplicar, [0, 1, 2, 5, 10]);

////////////////

let myFunc;

if (num == 0) {
    myFunc = function(theObject) {
        theObject.make = "Toyota"
    }
}

//*******************************************************************************************//
//********************************Pasar var de una funcion a otra****************************//
//*******************************************************************************************//

var n1 = 3;
var n2 = 4;

function suma() {
    return n1 + n2; // devolvemos el valor de la suma
};

function resta() {
    var resultado = suma() - 3; // ejecutamos la funcion suma y restamos el valor
    console.log(resultado);
};

resta()

//*******************************************************************************************//
//*******************************************************************************************//
//*******************************************************************************************//

module.exports = { prueba2_1, saludar, suma, despedir };